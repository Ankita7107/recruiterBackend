const mongoose = require('mongoose');

const timelineItemSchema = new mongoose.Schema({
  year: { type: String, required: true },
  title: { type: String, required: true },
  desc: { type: String, required: true },
});

const statItemSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: Number, required: true },
  suffix: { type: String, default: '+' },
  icon: { type: String, default: 'TrendingUp' },
  color: { type: String, default: 'text-blue-600' },
});

const valueItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  icon: { type: String, default: 'Target' },
  color: { type: String, default: 'text-blue-600' },
  bg: { type: String, default: 'bg-blue-50' },
});

const aboutContentSchema = new mongoose.Schema({
  // Hero Section
  heroLabel: { type: String, default: 'Our Story' },
  heroTitle: { type: String, default: '10+ Years of Recruitment Excellence' },
  heroSubtitle: { type: String, default: 'From a small team of passionate recruiters to a network of 350+ professionals spanning 135+ cities — Talent Connect India has been building India\'s careers, one placement at a time.' },

  // Stats Section
  stats: [statItemSchema],

  // Mission/Vision/Values
  values: [valueItemSchema],

  // Timeline
  timeline: [timelineItemSchema],

  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('AboutContent', aboutContentSchema);
