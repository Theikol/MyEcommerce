const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true },
    shortDescription: { type: String, default: '' },

    // Harga
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: 0, min: 0 }, // 0 = no discount

    // Kategori elektronik (kabel, casing HP, earphone, dll)
    category: {
      type: String,
      required: true,
      enum: ['CPU', 'RAM', 'Motherboard', 'Power Supply', 'Kabel', 'Casing HP', 'Earphone', 'Charger', 'Powerbank', 'Aksesoris Lainnya'],
    },
    brand: { type: String, default: 'Generic' },

    // Stok & berat (berat penting untuk Biteship hitung ongkir)
    stock: { type: Number, required: true, min: 0, default: 0 },
    weight: { type: Number, required: true, default: 100 }, // dalam gram
    dimensions: {
      length: { type: Number, default: 10 }, // cm
      width: { type: Number, default: 10 },
      height: { type: Number, default: 5 },
    },

    // Gambar (array URL)
    images: [{ type: String }],
    mainImage: { type: String, default: '' },

    // Spesifikasi tambahan
    specifications: [
      {
        key: String,
        value: String,
      },
    ],

    // SEO & status
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },

    // Rating (calculated dari reviews)
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-generate slug dari nama
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  }
  if (this.images.length > 0 && !this.mainImage) {
    this.mainImage = this.images[0];
  }
  next();
});

// Virtual: harga final (setelah diskon kalau ada)
productSchema.virtual('finalPrice').get(function () {
  return this.discountPrice > 0 ? this.discountPrice : this.price;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
