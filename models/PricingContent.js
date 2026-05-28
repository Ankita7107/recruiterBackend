const mongoose = require('mongoose');

const pricingPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  period: { type: String, default: 'per month' },
  highlight: { type: Boolean, default: false },
  color: { type: String, default: 'border-slate-200' },
  features: [{ type: String }],
});

const pricingContentSchema = new mongoose.Schema({
  pricingLabel: { type: String, default: 'Pricing' },
  pricingTitle: { type: String, default: 'Simple, Transparent Pricing' },
  pricingSubtitle: { type: String, default: 'No hidden fees. Start at just ₹199.' },
  plans: [pricingPlanSchema],
}, { timestamps: true });

module.exports = mongoose.model('PricingContent', pricingContentSchema);
