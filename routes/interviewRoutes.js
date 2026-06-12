const express = require('express');
const router = express.Router();
const {
  scheduleInterview,
  getMyInterviews,
  getEmployerInterviews,
  updateInterviewStatus
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/interviews
// @desc    Schedule a new interview
// @access  Private (Employer only)
router.post('/', protect, scheduleInterview);

// @route   GET /api/interviews/my-interviews
// @desc    Get candidate's scheduled interviews
// @access  Private (JobSeeker only)
router.get('/my-interviews', protect, getMyInterviews);

// @route   GET /api/interviews/employer
// @desc    Get employer's scheduled interviews
// @access  Private (Employer only)
router.get('/employer', protect, getEmployerInterviews);

// @route   PUT /api/interviews/:id/status
// @desc    Update interview status
// @access  Private (Employer/JobSeeker)
router.put('/:id/status', protect, updateInterviewStatus);

module.exports = router;
