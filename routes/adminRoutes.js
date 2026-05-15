const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin } = require('../controllers/adminController');

// @route   POST /api/admins/register
// @desc    Register a new admin
// @access  Public
router.post('/register', registerAdmin);

// @route   POST /api/admins/login
// @desc    Login an admin
// @access  Public
router.post('/login', loginAdmin);

module.exports = router;
