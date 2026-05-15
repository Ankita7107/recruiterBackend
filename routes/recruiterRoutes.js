const express = require('express');
const router = express.Router();
const { registerRecruiter, loginRecruiter } = require('../controllers/recruiterController');

// @route   POST /api/recruiters/register
// @desc    Register a new recruiter
// @access  Public
router.post('/register', registerRecruiter);

// @route   POST /api/recruiters/login
// @desc    Login a recruiter
// @access  Public
router.post('/login', loginRecruiter);

module.exports = router;
