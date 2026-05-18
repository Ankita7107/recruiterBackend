const express = require('express');
const router = express.Router();
const { 
  registerAdmin, 
  loginAdmin, 
  getAllUsers, 
  deleteUser,
  getAdminJobs,
  getPendingJobs,
  approveJob,
  rejectJob
} = require('../controllers/adminController');
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

// @route   GET /api/admins/jobs
// @desc    Get all jobs and statistics for admin moderation
// @access  Private/Admin
router.get('/jobs', protect, adminOnly, getAdminJobs);

// @route   GET /api/admins/jobs/pending
// @desc    Get all pending jobs in queue
// @access  Private/Admin
router.get('/jobs/pending', protect, adminOnly, getPendingJobs);

// @route   PUT /api/admins/jobs/:id/approve
// @desc    Approve job post
// @access  Private/Admin
router.put('/jobs/:id/approve', protect, adminOnly, approveJob);

// @route   PUT /api/admins/jobs/:id/reject
// @desc    Reject job post
// @access  Private/Admin
router.put('/jobs/:id/reject', protect, adminOnly, rejectJob);

module.exports = router;
