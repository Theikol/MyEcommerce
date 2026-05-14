const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { createSnapTransaction, verifyNotification } = require('../utils/midtransService');
const { createShippingOrder } = require('../utils/biteshipService');

// @desc    Buat order baru + dapatkan Snap token Midtrans
// @route   POST /api/orders
// @access  Private
// @body    { items, shippingAddress, shipping: { courier, courierService, courierName, cost, etd } }
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, shipping, notes } = req.body;

  if (!items?.length) {
    res.status(400);
    throw new Error('Keranjang kosong');
  }
  if (!shippingAddress?.areaId) {
    res.status(400);
    throw new Error('Alamat pengiriman wajib diisi');
  }
  if (!shipping?.courier) {
    res.status(400);
    throw new Error('Pilih kurir terlebih dahulu');
  }

  // Validasi & ambil data produk asli dari DB
  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  const orderItems = [];
  let itemsTotal = 0;

  for (const it of items) {
    const product = products.find((p) => p._id.toString() === it.productId);
    if (!product) {
      res.status(404);
      throw new Error(`Produk tidak ditemukan: ${it.productId}`);
    }
    if (product.stock < it.quantity) {
      res.status(400);
      throw new Error(`Stok ${product.name} tidak cukup (sisa ${product.stock})`);
    }

    const price = product.discountPrice > 0 ? product.discountPrice : product.price;
    itemsTotal += price * it.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.mainImage,
      price,
      quantity: it.quantity,
      weight: product.weight * it.quantity,
    });
  }

  const grandTotal = itemsTotal + (shipping.cost || 0);

  // Buat order di DB
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    shipping: {
      courier: shipping.courier,
      courierService: shipping.courierService,
      courierName: shipping.courierName,
      cost: shipping.cost,
      etd: shipping.etd,
    },
    itemsTotal,
    shippingCost: shipping.cost || 0,
    grandTotal,
    notes,
  });

  // Buat Snap transaction di Midtrans
  try {
    const snap = await createSnapTransaction(order);
    order.payment.snapToken = snap.token;
    order.payment.snapRedirectUrl = snap.redirect_url;
    order.payment.midtransOrderId = order.orderNumber;
    await order.save();

    res.status(201).json({
      success: true,
      data: {
        order,
        snapToken: snap.token,
        snapRedirectUrl: snap.redirect_url,
      },
    });
  } catch (err) {
    // Kalau Midtrans gagal, hapus order biar nggak nyangkut
    await order.deleteOne();
    res.status(500);
    throw new Error('Gagal membuat transaksi pembayaran: ' + err.message);
  }
});

// @desc    Get order user yang login
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json({ success: true, data: orders });
});

// @desc    Get detail order by orderNumber
// @route   GET /api/orders/:orderNumber
// @access  Private
const getOrderByNumber = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber }).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order tidak ditemukan');
  }
  // Pastikan hanya pemilik atau admin yang bisa lihat
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Tidak punya akses ke order ini');
  }
  res.json({ success: true, data: order });
});

// @desc    Webhook handler untuk notifikasi Midtrans
// @route   POST /api/orders/midtrans-notification
// @access  Public (tapi diverifikasi dengan server key)
const handleMidtransNotification = asyncHandler(async (req, res) => {
  try {
    const notification = await verifyNotification(req.body);
    const {
      order_id,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_id,
    } = notification;

    const order = await Order.findOne({ orderNumber: order_id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
    }

    order.payment.method = payment_type;
    order.payment.midtransTransactionId = transaction_id;
    order.payment.fraudStatus = fraud_status;

    // Mapping status Midtrans → status order kita
    // Referensi: https://docs.midtrans.com/docs/https-notification-webhooks
    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept' || !fraud_status) {
        order.status = 'paid';
        order.paidAt = new Date();
        order.payment.paidAt = new Date();

        // Kurangi stok produk
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity, soldCount: item.quantity },
          });
        }

        // Otomatis buat order pengiriman di Biteship
        try {
          const biteshipOrder = await createShippingOrder(order);
          order.shipping.biteshipOrderId = biteshipOrder.id;
          order.shipping.trackingId = biteshipOrder.courier?.tracking_id;
          order.shipping.waybillId = biteshipOrder.courier?.waybill_id;
          order.status = 'processing';
        } catch (biteshipErr) {
          console.error('Biteship order creation failed (akan retry manual):', biteshipErr.message);
        }
      }
    } else if (transaction_status === 'pending') {
      order.status = 'pending_payment';
    } else if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'failure') {
      order.status = 'failed';
    } else if (transaction_status === 'expire') {
      order.status = 'expired';
    }

    await order.save();
    res.status(200).json({ success: true, message: 'Notifikasi diterima' });
  } catch (error) {
    console.error('Midtrans notification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get semua order (admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email').sort('-createdAt');
  res.json({ success: true, data: orders });
});

// @desc    Update status order manual (admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order tidak ditemukan');
  }
  const { status } = req.body;
  order.status = status;
  if (status === 'shipped') order.shippedAt = new Date();
  if (status === 'delivered') order.deliveredAt = new Date();
  if (status === 'cancelled') order.cancelledAt = new Date();
  await order.save();
  res.json({ success: true, data: order });
});

// @desc    Get statistik dashboard admin
// @route   GET /api/orders/admin/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Status counts
  const [
    totalOrders,
    pendingPayment,
    processing,
    shipped,
    delivered,
    totalProducts,
    activeProducts,
    lowStockProducts,
  ] = await Promise.all([
    Order.countDocuments({}),
    Order.countDocuments({ status: 'pending_payment' }),
    Order.countDocuments({ status: { $in: ['paid', 'processing'] } }),
    Order.countDocuments({ status: 'shipped' }),
    Order.countDocuments({ status: 'delivered' }),
    Product.countDocuments({}),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ stock: { $gt: 0, $lte: 5 } }),
  ]);

  // Revenue - hanya hitung order yang sudah dibayar
  const paidStatuses = ['paid', 'processing', 'shipped', 'delivered'];

  const [revenueThisMonth, revenueLastMonth, revenueAllTime] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $in: paidStatuses }, paidAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]),
    Order.aggregate([
      {
        $match: {
          status: { $in: paidStatuses },
          paidAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]),
    Order.aggregate([
      { $match: { status: { $in: paidStatuses } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]),
  ]);

  // Chart penjualan 7 hari terakhir
  const salesChart = await Order.aggregate([
    {
      $match: {
        status: { $in: paidStatuses },
        paidAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
        revenue: { $sum: '$grandTotal' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Top 5 produk terlaris
  const topProducts = await Product.find({})
    .sort('-soldCount')
    .limit(5)
    .select('name mainImage price soldCount stock category');

  // 10 order terbaru
  const recentOrders = await Order.find({})
    .sort('-createdAt')
    .limit(10)
    .populate('user', 'name email')
    .select('orderNumber status grandTotal createdAt user items');

  res.json({
    success: true,
    data: {
      counts: {
        totalOrders,
        pendingPayment,
        processing,
        shipped,
        delivered,
        totalProducts,
        activeProducts,
        lowStockProducts,
      },
      revenue: {
        thisMonth: revenueThisMonth[0]?.total || 0,
        lastMonth: revenueLastMonth[0]?.total || 0,
        allTime: revenueAllTime[0]?.total || 0,
      },
      salesChart,
      topProducts,
      recentOrders,
    },
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderByNumber,
  handleMidtransNotification,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
};
