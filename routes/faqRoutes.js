const express = require('express');
const router = express.Router();
const { getFAQs, createFAQ, updateFAQ, deleteFAQ, seedFAQs } = require('../controllers/faqController');

// Public routes
router.get('/', getFAQs);

// Admin routes (In a real app, these would be protected)
router.post('/', createFAQ);
router.put('/:id', updateFAQ);
router.delete('/:id', deleteFAQ);

module.exports = router;
