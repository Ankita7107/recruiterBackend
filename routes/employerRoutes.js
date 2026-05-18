const express = require('express');
const router = express.Router();
const { registerEmployer, loginEmployer, getProfile, updateProfile, uploadProfileImage } = require('../controllers/employerController');
const { protect } = require('../middleware/authMiddleware');
const profileImageUpload = require('../middleware/profileImageUploadMiddleware');

// @route   POST /api/employers/register
// @desc    Register a new employer
// @access  Public
router.post('/register', registerEmployer);

// @route   POST /api/employers/login
// @desc    Login an employer
// @access  Public
router.post('/login', loginEmployer);

// @route   GET /api/employers/profile
// @desc    Get logged-in employer's profile
// @access  Private (Employer)
router.get('/profile', protect, getProfile);

// @route   PUT /api/employers/profile
// @desc    Update logged-in employer's profile
// @access  Private (Employer)
router.put('/profile', protect, updateProfile);

// @route   POST /api/employers/upload-profile-image
// @desc    Upload profile image (logo) for employer
// @access  Private (Employer)
router.post('/upload-profile-image', protect, profileImageUpload.single('profileImage'), uploadProfileImage);

module.exports = router;
