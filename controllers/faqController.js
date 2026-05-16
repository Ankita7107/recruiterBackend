const FAQ = require('../models/FAQ');

// @desc    Get all FAQs (optionally filter by category)
// @route   GET /api/faqs
const getFAQs = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const faqs = await FAQ.find(query).sort({ createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching FAQs' });
  }
};

// @desc    Create a new FAQ
// @route   POST /api/faqs
const createFAQ = async (req, res) => {
  try {
    const { question, answer, category } = req.body;
    if (!question || !answer || !category) {
      return res.status(400).json({ message: 'Please provide question, answer, and category' });
    }
    const faq = await FAQ.create({ question, answer, category });
    res.status(201).json(faq);
  } catch (error) {
    res.status(500).json({ message: 'Error creating FAQ' });
  }
};

// @desc    Update an FAQ
// @route   PUT /api/faqs/:id
const updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: 'Error updating FAQ' });
  }
};

// @desc    Delete an FAQ
// @route   DELETE /api/faqs/:id
const deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting FAQ' });
  }
};

module.exports = {
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ
};
