const asyncHandler = require('express-async-handler');
const { searchArea, getShippingRates, trackShipment } = require('../utils/biteshipService');
const Product = require('../models/Product');

// @desc    Cari area / kelurahan (autocomplete)
// @route   GET /api/shipping/areas?input=...
// @access  Public
const searchAreas = asyncHandler(async (req, res) => {
  const { input } = req.query;
  if (!input || input.length < 3) {
    return res.json({ success: true, data: { areas: [] } });
  }
  const result = await searchArea(input);
  res.json({ success: true, data: result });
});

// @desc    Hitung ongkir berdasarkan keranjang & alamat tujuan
// @route   POST /api/shipping/rates
// @access  Public
// @body    { destinationAreaId, items: [{ productId, quantity }] }
const calculateRates = asyncHandler(async (req, res) => {
  const { destinationAreaId, items } = req.body;
  if (!destinationAreaId || !items?.length) {
    res.status(400);
    throw new Error('Alamat tujuan dan item wajib diisi');
  }

  // Ambil data produk asli dari DB (jangan percaya data dari frontend)
  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  const itemsForBiteship = items.map((it) => {
    const product = products.find((p) => p._id.toString() === it.productId);
    if (!product) throw new Error(`Produk ${it.productId} tidak ditemukan`);
    return {
      name: product.name,
      price: product.discountPrice > 0 ? product.discountPrice : product.price,
      weight: product.weight,
      quantity: it.quantity,
    };
  });

  const rates = await getShippingRates({ destinationAreaId, items: itemsForBiteship });
  res.json({ success: true, data: rates });
});

// @desc    Track pengiriman
// @route   GET /api/shipping/track/:waybillId/:courier
// @access  Public
const trackOrder = asyncHandler(async (req, res) => {
  const { waybillId, courier } = req.params;
  const tracking = await trackShipment(waybillId, courier);
  res.json({ success: true, data: tracking });
});

module.exports = { searchAreas, calculateRates, trackOrder };
