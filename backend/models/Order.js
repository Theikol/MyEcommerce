const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Item yang dibeli (snapshot saat order dibuat)
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        image: String,
        price: Number, // harga saat order (snapshot)
        quantity: { type: Number, required: true, min: 1 },
        weight: Number, // total weight = weight * qty (g)
      },
    ],

    // Alamat pengiriman (snapshot)
    shippingAddress: {
      recipientName: String,
      phone: String,
      fullAddress: String,
      province: String,
      city: String,
      district: String,
      postalCode: String,
      areaId: String,
      latitude: Number,
      longitude: Number,
    },

    // Biteship: data kurir & ongkir
    shipping: {
      courier: String, // jne, jnt, sicepat, dll
      courierService: String, // REG, YES, dll
      courierName: String, // nama tampilan
      cost: { type: Number, default: 0 },
      etd: String, // estimated time of delivery, contoh "2-3 hari"
      // Setelah order create di Biteship
      biteshipOrderId: String,
      trackingId: String,
      trackingUrl: String,
      waybillId: String,
    },

    // Rincian harga
    itemsTotal: { type: Number, required: true }, // total semua item
    shippingCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },

    // Midtrans: data pembayaran
    payment: {
      method: String, // gopay, bca_va, qris, dll (akan terisi dari Midtrans callback)
      midtransOrderId: String, // sama dengan orderNumber
      midtransTransactionId: String,
      snapToken: String, // token untuk Snap.js di frontend
      snapRedirectUrl: String,
      paidAt: Date,
      fraudStatus: String,
    },

    // Status order
    status: {
      type: String,
      enum: ['pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'expired', 'failed'],
      default: 'pending_payment',
    },

    notes: { type: String, default: '' },

    // Timestamps tambahan
    paidAt: Date,
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true }
);

// Auto-generate order number sebelum save
orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    // Format: DCHAL-{YYYYMMDD}-{6 char random}
    const date = new Date();
    const dateStr =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNumber = `DCHAL-${dateStr}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
