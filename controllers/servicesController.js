const ServicesContent = require('../models/ServicesContent');

// @desc  Get services page content
// @route GET /api/services
// @access Public
const getServicesContent = async (req, res) => {
  try {
    const content = await ServicesContent.findOne();
    if (!content) {
      return res.status(404).json({ message: 'Services content not found.' });
    }
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch services content', error: err.message });
  }
};

// @desc  Update services hero
// @route PUT /api/services/hero
// @access Private/Admin
const updateServicesHero = async (req, res) => {
  try {
    const { heroLabel, heroTitle, heroSubtitle } = req.body;
    let content = await ServicesContent.findOne();
    if (!content) {
      content = new ServicesContent();
    }

    if (heroLabel !== undefined)    content.heroLabel    = heroLabel;
    if (heroTitle !== undefined)    content.heroTitle    = heroTitle;
    if (heroSubtitle !== undefined) content.heroSubtitle = heroSubtitle;

    await content.save();
    res.json({ message: 'Services hero updated successfully', content });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update services hero', error: err.message });
  }
};

// @desc  Update services list
// @route PUT /api/services/list
// @access Private/Admin
const updateServicesList = async (req, res) => {
  try {
    const { services } = req.body;
    let content = await ServicesContent.findOne();
    if (!content) {
      content = new ServicesContent();
    }

    content.services = services;
    await content.save();
    res.json({ message: 'Services list updated successfully', content });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update services list', error: err.message });
  }
};

module.exports = {
  getServicesContent,
  updateServicesHero,
  updateServicesList,
};
