const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, getAllUsers, deleteUser } = require('../controllers/adminController');

// @route   POST /api/admins/register
router.post('/register', registerAdmin);

// @route   POST /api/admins/login
router.post('/login', loginAdmin);

// @route   GET /api/admins/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', getAllUsers);

// @route   DELETE /api/admins/users/:id/:role
// @desc    Delete a user
// @access  Private/Admin
router.delete('/users/:id/:role', deleteUser);

module.exports = router;
