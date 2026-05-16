const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, getAllUsers, deleteUser } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   POST /api/admins/register
router.post('/register', registerAdmin);

// @route   POST /api/admins/login
router.post('/login', loginAdmin);

// @route   GET /api/admins/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', protect, adminOnly, getAllUsers);

// @route   DELETE /api/admins/users/:id/:role
// @desc    Delete a user
// @access  Private/Admin
router.delete('/users/:id/:role', protect, adminOnly, deleteUser);

module.exports = router;
