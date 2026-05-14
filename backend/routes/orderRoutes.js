const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderByNumber,
  handleMidtransNotification,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// PENTING: webhook Midtrans tidak butuh auth, harus accessible dari internet
router.post('/midtrans-notification', handleMidtransNotification);

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);

// Admin routes (harus di atas /:orderNumber supaya tidak ke-overlap)
router.get('/admin/dashboard', protect, adminOnly, getDashboardStats);
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.put('/admin/:id/status', protect, adminOnly, updateOrderStatus);

router.get('/:orderNumber', protect, getOrderByNumber);

module.exports = router;
