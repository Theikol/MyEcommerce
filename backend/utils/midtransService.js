const midtransClient = require('midtrans-client');

// Snap API untuk halaman pembayaran (paling fleksibel)
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

// Core API untuk verifikasi notifikasi
const core = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

/**
 * Buat transaksi Snap di Midtrans
 * @param {Object} order - Object Order dari MongoDB
 * @returns {Object} { token, redirect_url }
 */
const createSnapTransaction = async (order) => {
  // Susun item details (Midtrans wajib total gross_amount = sum item + shipping)
  const itemDetails = order.items.map((item) => ({
    id: item.product.toString(),
    price: item.price,
    quantity: item.quantity,
    name: item.name.substring(0, 50), // Midtrans max 50 chars
    category: 'Elektronik',
  }));

  // Tambahkan ongkir sebagai "item" supaya total cocok
  if (order.shippingCost > 0) {
    itemDetails.push({
      id: 'SHIPPING',
      price: order.shippingCost,
      quantity: 1,
      name: `Ongkir ${order.shipping.courierName || ''}`.substring(0, 50),
      category: 'Shipping',
    });
  }

  const parameter = {
    transaction_details: {
      order_id: order.orderNumber,
      gross_amount: order.grandTotal,
    },
    item_details: itemDetails,
    customer_details: {
      first_name: order.shippingAddress.recipientName || 'Customer',
      phone: order.shippingAddress.phone || '',
      shipping_address: {
        first_name: order.shippingAddress.recipientName || 'Customer',
        phone: order.shippingAddress.phone || '',
        address: order.shippingAddress.fullAddress || '',
        city: order.shippingAddress.city || '',
        postal_code: order.shippingAddress.postalCode || '',
        country_code: 'IDN',
      },
    },
    credit_card: { secure: true },
    callbacks: {
      finish: `${process.env.FRONTEND_URL}/orders/${order.orderNumber}`,
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    };
  } catch (error) {
    console.error('Midtrans Snap Error:', error);
    throw new Error('Gagal membuat transaksi Midtrans: ' + error.message);
  }
};

/**
 * Verifikasi notifikasi dari Midtrans (webhook)
 * @param {Object} notification - Body notifikasi
 */
const verifyNotification = async (notification) => {
  try {
    const statusResponse = await core.transaction.notification(notification);
    return statusResponse;
  } catch (error) {
    console.error('Midtrans Verify Error:', error);
    throw new Error('Gagal verifikasi notifikasi Midtrans');
  }
};

module.exports = { snap, core, createSnapTransaction, verifyNotification };
