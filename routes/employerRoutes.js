const express = require('express');
const router = express.Router();
const { registerEmployer, loginEmployer } = require('../controllers/employerController');

// @route   POST /api/employers/register
// @desc    Register a new employer
// @access  Public
router.post('/register', registerEmployer);

// @route   POST /api/employers/login
// @desc    Login an employer
// @access  Public
router.post('/login', loginEmployer);

module.exports = router;
