const PricingContent = require('../models/PricingContent');

// @desc  Get pricing plans and header
// @route GET /api/pricing
// @access Public
const getPricingContent = async (req, res) => {
  try {
    const content = await PricingContent.findOne();
    if (!content) {
      return res.status(404).json({ message: 'Pricing content not found.' });
    }
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pricing content', error: err.message });
  }
};

// @desc  Update pricing header
// @route PUT /api/pricing/header
// @access Private/Admin
const updatePricingHeader = async (req, res) => {
  try {
    const { pricingLabel, pricingTitle, pricingSubtitle } = req.body;
    let content = await PricingContent.findOne();
    if (!content) {
      content = new PricingContent();
    }

    if (pricingLabel !== undefined)    content.pricingLabel    = pricingLabel;
    if (pricingTitle !== undefined)    content.pricingTitle    = pricingTitle;
    if (pricingSubtitle !== undefined) content.pricingSubtitle = pricingSubtitle;

    await content.save();
    res.json({ message: 'Pricing header updated successfully', content });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update pricing header', error: err.message });
  }
};

// @desc  Update pricing plans list
// @route PUT /api/pricing/plans
// @access Private/Admin
const updatePricingPlans = async (req, res) => {
  try {
    const { plans } = req.body;
    let content = await PricingContent.findOne();
    if (!content) {
      content = new PricingContent();
    }

    content.plans = plans;
    await content.save();
    res.json({ message: 'Pricing plans updated successfully', content });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update pricing plans', error: err.message });
  }
};

module.exports = {
  getPricingContent,
  updatePricingHeader,
  updatePricingPlans,
};
