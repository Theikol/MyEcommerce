/**
 * Seeder - Isi database dengan data dummy
 * Jalankan: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');

const adminUser = {
  name: 'Adrian Haikal (Admin)',
  email: 'admin@dchalstore.com',
  password: 'admin123', // ganti setelah seed
  phone: '081234567890',
  role: 'admin',
};

const customerUser = {
  name: 'Customer Demo',
  email: 'customer@example.com',
  password: 'customer123',
  phone: '08111122223',
  role: 'customer',
};

const products = [
  {
    name: 'Kabel USB Type-C Fast Charging 1M',
    description: 'Kabel data dan charging USB Type-C panjang 1 meter, mendukung fast charging hingga 65W. Bahan nylon braided anti kusut & tahan tarikan hingga 10kg.',
    shortDescription: 'Fast charging 65W, nylon braided, 1 meter',
    price: 35000,
    discountPrice: 28000,
    category: 'Kabel',
    brand: 'Premium',
    stock: 150,
    weight: 80,
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600',
    ],
    specifications: [
      { key: 'Panjang', value: '1 meter' },
      { key: 'Daya', value: '65W' },
      { key: 'Material', value: 'Nylon Braided' },
    ],
    isFeatured: true,
  },
  {
    name: 'Casing Silikon iPhone 15 Pro',
    description: 'Casing silikon premium untuk iPhone 15 Pro. Soft touch, anti slip, presisi cutout untuk kamera dan tombol. Tersedia 8 pilihan warna.',
    shortDescription: 'Silikon premium, presisi tinggi',
    price: 45000,
    category: 'Casing HP',
    brand: 'SoftCase',
    stock: 80,
    weight: 50,
    images: [
      'https://images.unsplash.com/photo-1601593346740-925612772716?w=600',
    ],
    specifications: [
      { key: 'Kompatibel', value: 'iPhone 15 Pro' },
      { key: 'Bahan', value: 'Silikon TPU' },
    ],
    isFeatured: true,
  },
  {
    name: 'Earphone Bluetooth TWS Pro Bass',
    description: 'Earphone TWS dengan bass mendalam, Bluetooth 5.3, baterai tahan 6 jam (24 jam dengan case), IPX5 anti keringat. Cocok untuk olahraga dan daily use.',
    shortDescription: 'Bluetooth 5.3, IPX5, bass mendalam',
    price: 165000,
    discountPrice: 129000,
    category: 'Earphone',
    brand: 'AudioPro',
    stock: 50,
    weight: 80,
    images: [
      'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600',
    ],
    specifications: [
      { key: 'Bluetooth', value: '5.3' },
      { key: 'Baterai', value: '6 jam playback' },
      { key: 'Sertifikasi', value: 'IPX5' },
    ],
    isFeatured: true,
  },
  {
    name: 'Charger Adapter 20W Fast Charging',
    description: 'Adaptor charger 20W dengan teknologi fast charging. Mendukung iPhone, Samsung, Xiaomi, dll. Kompak dan portable.',
    shortDescription: '20W PD/QC, kompatibel universal',
    price: 75000,
    discountPrice: 59000,
    category: 'Charger',
    brand: 'PowerMax',
    stock: 100,
    weight: 120,
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600',
    ],
    specifications: [
      { key: 'Daya', value: '20W' },
      { key: 'Protokol', value: 'PD + QC 3.0' },
    ],
    isFeatured: false,
  },
  {
    name: 'Powerbank 10000mAh Dual USB',
    description: 'Powerbank kapasitas 10000mAh dengan 2 port USB output dan 1 port input Type-C. Indikator LED untuk cek baterai. Slim design.',
    shortDescription: '10000mAh, dual USB, indikator LED',
    price: 185000,
    discountPrice: 149000,
    category: 'Powerbank',
    brand: 'PowerMax',
    stock: 40,
    weight: 250,
    images: [
      'https://images.unsplash.com/photo-1609592424073-9aa8d18c1c47?w=600',
    ],
    specifications: [
      { key: 'Kapasitas', value: '10000mAh' },
      { key: 'Output', value: '2x USB' },
      { key: 'Input', value: 'Type-C + Micro USB' },
    ],
    isFeatured: true,
  },
  {
    name: 'Holder HP Magnetik Mobil',
    description: 'Holder HP untuk dashboard mobil dengan magnet kuat. Rotasi 360 derajat, mudah dipasang dan dilepas.',
    shortDescription: 'Magnet kuat, rotasi 360°',
    price: 55000,
    discountPrice: 39000,
    category: 'Aksesoris Lainnya',
    brand: 'CarMate',
    stock: 60,
    weight: 100,
    images: [
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600',
    ],
    specifications: [
      { key: 'Tipe', value: 'Magnetik' },
      { key: 'Rotasi', value: '360°' },
    ],
    isFeatured: false,
  },
];

const seed = async () => {
  try {
    await connectDB();

    console.log('🗑️  Menghapus data lama...');
    await User.deleteMany();
    await Product.deleteMany();

    console.log('👤 Membuat user admin & customer...');
    await User.create(adminUser);
    await User.create(customerUser);

    console.log('📦 Membuat produk dummy...');
    await Product.create(products);

    console.log('\n✅ Seed selesai!');
    console.log('\n📌 Login info:');
    console.log('   Admin    -> admin@dchalstore.com / admin123');
    console.log('   Customer -> customer@example.com / customer123');
    process.exit();
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
