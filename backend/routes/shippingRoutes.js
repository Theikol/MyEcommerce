const express = require('express');
const router = express.Router();
const { searchAreas, calculateRates, trackOrder } = require('../controllers/shippingController');

router.get('/areas', searchAreas);
router.post('/rates', calculateRates);
router.get('/track/:waybillId/:courier', trackOrder);

module.exports = router;
