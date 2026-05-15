const express = require('express');
const router = express.Router();
const { registerJobSeeker, loginJobSeeker } = require('../controllers/jobSeekerController');

// @route   POST /api/jobseekers/register
// @desc    Register a new job seeker
// @access  Public
router.post('/register', registerJobSeeker);

// @route   POST /api/jobseekers/login
// @desc    Login a job seeker
// @access  Public
router.post('/login', loginJobSeeker);

module.exports = router;
