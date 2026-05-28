const express = require('express');
const router = express.Router();
const { getResume, saveResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/resumes
// @desc    Get logged-in candidate's saved resume
// @access  Private (JobSeeker)
router.get('/', protect, getResume);

// @route   POST /api/resumes
// @desc    Save/Update logged-in candidate's resume
// @access  Private (JobSeeker)
router.post('/', protect, saveResume);

module.exports = router;
