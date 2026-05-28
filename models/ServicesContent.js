const mongoose = require('mongoose');

const serviceItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: String, required: true },
  icon: { type: String, default: 'Briefcase' },
  color: { type: String, default: 'text-blue-600' },
  bg: { type: String, default: 'bg-blue-50' },
  border: { type: String, default: 'border-blue-200' },
  desc: { type: String, required: true },
  features: [{ type: String }],
});

const servicesContentSchema = new mongoose.Schema({
  heroLabel: { type: String, default: 'What We Offer' },
  heroTitle: { type: String, default: 'Complete Recruitment Services' },
  heroSubtitle: { type: String, default: 'From ₹199 job postings to full-scale AI-powered hiring campaigns — we have a solution for every business.' },
  services: [serviceItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('ServicesContent', servicesContentSchema);
