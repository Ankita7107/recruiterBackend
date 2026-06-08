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
  rejectJob,
  getDashboardOverview,
  toggleVerifyEmployer,
  getAdminProfile,
  updateAdminProfile,
  uploadProfileImage
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const profileImageUpload = require('../middleware/profileImageUploadMiddleware');

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

// @route   PUT /api/admins/users/:id/toggle-verify
// @desc    Toggle verified status for an employer
// @access  Private/Admin
router.put('/users/:id/toggle-verify', protect, adminOnly, toggleVerifyEmployer);

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

// @route   GET /api/admins/dashboard-overview
// @desc    Get dashboard metrics & registrations overview
// @access  Private/Admin
router.get('/dashboard-overview', protect, adminOnly, getDashboardOverview);

// @route   GET /api/admins/profile
// @desc    Get logged-in admin's profile
// @access  Private/Admin
router.get('/profile', protect, adminOnly, getAdminProfile);

// @route   PUT /api/admins/profile
// @desc    Update admin profile
// @access  Private/Admin
router.put('/profile', protect, adminOnly, updateAdminProfile);

// @route   POST /api/admins/upload-profile-image
// @desc    Upload profile image (JPG, JPEG, PNG, GIF)
// @access  Private/Admin
router.post('/upload-profile-image', protect, adminOnly, profileImageUpload.single('profileImage'), uploadProfileImage);

module.exports = router;
