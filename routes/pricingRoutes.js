const express = require('express');
const router = express.Router();
const {
  getPricingContent,
  updatePricingHeader,
  updatePricingPlans,
} = require('../controllers/pricingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public route to fetch pricing plans
router.get('/', getPricingContent);

// Protected admin routes to update pricing plans
router.put('/header', protect, adminOnly, updatePricingHeader);
router.put('/plans', protect, adminOnly, updatePricingPlans);

module.exports = router;
