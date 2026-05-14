const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register user baru
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, dan password wajib diisi');
  }

  const exist = await User.findOne({ email });
  if (exist) {
    res.status(400);
    throw new Error('Email sudah terdaftar');
  }

  const user = await User.create({ name, email, password, phone });
  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
        token: generateToken(user._id),
      },
    });
  } else {
    res.status(401);
    throw new Error('Email atau password salah');
  }
});

// @desc    Get profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ success: true, data: user });
});

// @desc    Tambah alamat baru
// @route   POST /api/auth/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const newAddress = req.body;

  // Jika address ini diset default, unset default yang lama
  if (newAddress.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  // Kalau ini alamat pertama, jadikan default
  if (user.addresses.length === 0) newAddress.isDefault = true;

  user.addresses.push(newAddress);
  await user.save();
  res.status(201).json({ success: true, data: user.addresses });
});

// @desc    Hapus alamat
// @route   DELETE /api/auth/addresses/:addressId
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
  await user.save();
  res.json({ success: true, data: user.addresses });
});

module.exports = { register, login, getProfile, addAddress, deleteAddress };
