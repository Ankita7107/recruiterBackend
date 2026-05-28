const AboutContent = require('../models/AboutContent');

// @desc  Get about page content
// @route GET /api/about
// @access Public
const getAboutContent = async (req, res) => {
  try {
    const content = await AboutContent.findOne();
    if (!content) {
      return res.status(404).json({ message: 'About content not found. Please seed from admin panel.' });
    }
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch about content', error: err.message });
  }
};

// @desc  Update hero section
// @route PUT /api/about/hero
// @access Private/Admin
const updateHero = async (req, res) => {
  try {
    const { heroLabel, heroTitle, heroSubtitle } = req.body;
    const content = await AboutContent.findOne();
    if (!content) return res.status(404).json({ message: 'About content not found.' });

    if (heroLabel)    content.heroLabel    = heroLabel;
    if (heroTitle)    content.heroTitle    = heroTitle;
    if (heroSubtitle) content.heroSubtitle = heroSubtitle;

    await content.save();
    res.json({ message: 'Hero updated', content });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update hero', error: err.message });
  }
};

// @desc  Update stats
// @route PUT /api/about/stats
// @access Private/Admin
const updateStats = async (req, res) => {
  try {
    const { stats } = req.body;
    const content = await AboutContent.findOne();
    if (!content) return res.status(404).json({ message: 'About content not found.' });

    content.stats = stats;
    await content.save();
    res.json({ message: 'Stats updated', content });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update stats', error: err.message });
  }
};

const updateValues = async (req, res) => {
  try {
    const { values } = req.body;
    console.log("Incoming values to save:", JSON.stringify(values, null, 2));

    const content = await AboutContent.findOne();
    if (!content) {
      console.log("About content document not found in DB.");
      return res.status(404).json({ message: 'About content not found.' });
    }

    content.values = values;
    await content.save();
    console.log("Values successfully saved to DB!");
    res.json({ message: 'Values updated', content });
  } catch (err) {
    console.error("Error updating values in DB:", err);
    res.status(500).json({ message: 'Failed to update values', error: err.message });
  }
};

// @desc  Update timeline
// @route PUT /api/about/timeline
// @access Private/Admin
const updateTimeline = async (req, res) => {
  try {
    const { timeline } = req.body;
    const content = await AboutContent.findOne();
    if (!content) return res.status(404).json({ message: 'About content not found.' });

    content.timeline = timeline;
    await content.save();
    res.json({ message: 'Timeline updated', content });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update timeline', error: err.message });
  }
};

module.exports = {
  getAboutContent,
  updateHero,
  updateStats,
  updateValues,
  updateTimeline,
};
