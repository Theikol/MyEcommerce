const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  getAllProductsAdmin,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getProducts);
router.get('/featured/list', getFeaturedProducts);

// Admin routes (harus sebelum /:slug supaya tidak ke-overlap)
router.get('/admin/all', protect, adminOnly, getAllProductsAdmin);
router.get('/admin/:id', protect, adminOnly, getProductById);

// Public single product
router.get('/:slug', getProductBySlug);

// Admin CRUD
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
