const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/applications/apply/:jobId
// @desc    Apply for a job
// @access  Private (JobSeeker)
router.post('/apply/:jobId', protect, applyForJob);

// @route   GET /api/applications/my-applications
// @desc    Get all applications by the logged-in JobSeeker
// @access  Private (JobSeeker)
router.get('/my-applications', protect, getMyApplications);

// @route   GET /api/applications/job/:jobId
// @desc    Get all applicants for a specific job (for employer)
// @access  Private (Employer)
router.get('/job/:jobId', protect, getJobApplications);

// @route   PUT /api/applications/:id/status
// @desc    Update application status
// @access  Private (Employer)
router.put('/:id/status', protect, updateApplicationStatus);

module.exports = router;
