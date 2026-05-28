const express = require('express');
const router = express.Router();
const { 
  registerJobSeeker, 
  loginJobSeeker, 
  getProfile, 
  updateProfile, 
  uploadResume,
  uploadProfileImage,
  saveJob,
  unsaveJob,
  getSavedJobs
} = require('../controllers/jobSeekerController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const profileImageUpload = require('../middleware/profileImageUploadMiddleware');

// @route   POST /api/jobseekers/register
// @desc    Register a new job seeker
// @access  Public
router.post('/register', registerJobSeeker);

// @route   POST /api/jobseekers/login
// @desc    Login a job seeker
// @access  Public
router.post('/login', loginJobSeeker);

// @route   GET /api/jobseekers/profile
// @desc    Get logged-in job seeker's profile
// @access  Private (JobSeeker)
router.get('/profile', protect, getProfile);

// @route   PUT /api/jobseekers/profile
// @desc    Update logged-in job seeker's profile
// @access  Private (JobSeeker)
router.put('/profile', protect, updateProfile);

// @route   POST /api/jobseekers/upload-resume
// @desc    Upload PDF resume
// @access  Private (JobSeeker)
router.post('/upload-resume', protect, upload.single('resume'), uploadResume);

// @route   POST /api/jobseekers/upload-profile-image
// @desc    Upload profile image (JPG, JPEG, PNG, GIF)
// @access  Private (JobSeeker)
router.post('/upload-profile-image', protect, profileImageUpload.single('profileImage'), uploadProfileImage);

// @route   GET /api/jobseekers/saved-jobs
// @desc    Get all bookmarked jobs for candidate
// @access  Private (JobSeeker)
router.get('/saved-jobs', protect, getSavedJobs);

// @route   POST /api/jobseekers/saved-jobs/:jobId
// @desc    Bookmark a job
// @access  Private (JobSeeker)
router.post('/saved-jobs/:jobId', protect, saveJob);

// @route   DELETE /api/jobseekers/saved-jobs/:jobId
// @desc    Remove job from bookmarks
// @access  Private (JobSeeker)
router.delete('/saved-jobs/:jobId', protect, unsaveJob);

module.exports = router;
