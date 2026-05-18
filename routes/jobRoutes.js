const express = require('express');
const router = express.Router();
const { getAllJobs, getJobById, postJob, getEmployerJobs } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/jobs
// @desc    Get all jobs
// @access  Public
router.get('/', getAllJobs);

// @route   GET /api/jobs/my-jobs
// @desc    Get all jobs posted by the logged-in employer
// @access  Private (Employer)
router.get('/my-jobs', protect, getEmployerJobs);

// @route   POST /api/jobs
// @desc    Post a new job
// @access  Private (Employer)
router.post('/', protect, postJob);

// @route   GET /api/jobs/:id
// @desc    Get job by ID
// @access  Public
router.get('/:id', getJobById);

module.exports = router;
