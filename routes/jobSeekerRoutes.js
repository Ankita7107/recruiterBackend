const express = require('express');
const router = express.Router();
const { registerJobSeeker, loginJobSeeker, getProfile, updateProfile, uploadResume } = require('../controllers/jobSeekerController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @route   POST /api/jobseekers/register
// @desc    Register a new job seeker
// @access  Public
router.post('/register', registerJobSeeker);

// @route   POST /api/jobseekers/login
// @desc    Login a job seeker
// @access  Public
router.post('/login', loginJobSeeker);

// @route   GET /api/jobseekers/profile
// @desc    Get logged-in job seeker's profile
// @access  Private (JobSeeker)
router.get('/profile', protect, getProfile);

// @route   PUT /api/jobseekers/profile
// @desc    Update logged-in job seeker's profile
// @access  Private (JobSeeker)
router.put('/profile', protect, updateProfile);

// @route   POST /api/jobseekers/upload-resume
// @desc    Upload PDF resume
// @access  Private (JobSeeker)
router.post('/upload-resume', protect, upload.single('resume'), uploadResume);

module.exports = router;
