const express = require('express');
const router = express.Router();
const {
  getAboutContent,
  updateHero,
  updateStats,
  updateValues,
  updateTimeline,
} = require('../controllers/aboutController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   GET /api/about
// @desc    Get about page content (Public)
router.get('/', getAboutContent);

// @route   PUT /api/about/hero
// @access  Private/Admin
router.put('/hero', protect, adminOnly, updateHero);

// @route   PUT /api/about/stats
// @access  Private/Admin
router.put('/stats', protect, adminOnly, updateStats);

// @route   PUT /api/about/values
// @access  Private/Admin
router.put('/values', protect, adminOnly, updateValues);

// @route   PUT /api/about/timeline
// @access  Private/Admin
router.put('/timeline', protect, adminOnly, updateTimeline);

module.exports = router;
