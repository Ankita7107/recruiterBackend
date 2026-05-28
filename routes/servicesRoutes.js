const express = require('express');
const router = express.Router();
const {
  getServicesContent,
  updateServicesHero,
  updateServicesList,
} = require('../controllers/servicesController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public route to fetch services page content
router.get('/', getServicesContent);

// Protected admin routes to update services page content
router.put('/hero', protect, adminOnly, updateServicesHero);
router.put('/list', protect, adminOnly, updateServicesList);

module.exports = router;
