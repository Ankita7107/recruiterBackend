const express = require('express');
const router = express.Router();
const {
  createEnquiry,
  getEnquiries,
  resolveEnquiry,
  deleteEnquiry
} = require('../controllers/enquiryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const enquiryUpload = require('../middleware/enquiryUploadMiddleware');

// Public route for submitting inquiries (supports optional resume file)
router.post('/', enquiryUpload.single('resume'), createEnquiry);

// Admin-only protected routes
router.get('/admin', protect, adminOnly, getEnquiries);
router.put('/admin/:id/resolve', protect, adminOnly, resolveEnquiry);
router.delete('/admin/:id', protect, adminOnly, deleteEnquiry);

module.exports = router;
