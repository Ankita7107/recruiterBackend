const express = require('express');
const router = express.Router();
const { 
  registerRecruiter, 
  loginRecruiter, 
  getRecruiterProfile, 
  updateRecruiterProfile, 
  uploadProfileImage 
} = require('../controllers/recruiterController');
const { getLeads, createLead, updateLead, seedDefaultLeads } = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');
const profileImageUpload = require('../middleware/profileImageUploadMiddleware');

// Auth routes
// @route   POST /api/recruiters/register
router.post('/register', registerRecruiter);

// @route   POST /api/recruiters/login
router.post('/login', loginRecruiter);

// @route   GET /api/recruiters/profile
router.get('/profile', protect, getRecruiterProfile);

// @route   PUT /api/recruiters/profile
router.put('/profile', protect, updateRecruiterProfile);

// @route   POST /api/recruiters/upload-profile-image
router.post('/upload-profile-image', protect, profileImageUpload.single('profileImage'), uploadProfileImage);

// Lead CRM routes
// @route   GET /api/recruiters/leads/seed
// @desc    Seed mock leads if empty
router.get('/leads/seed', seedDefaultLeads);

// @route   GET /api/recruiters/leads
// @desc    Get all recruiter leads
router.get('/leads', protect, getLeads);

// @route   POST /api/recruiters/leads
// @desc    Create a new lead
router.post('/leads', protect, createLead);

// @route   PUT /api/recruiters/leads/:id
// @desc    Update a lead
router.put('/leads/:id', protect, updateLead);

module.exports = router;
