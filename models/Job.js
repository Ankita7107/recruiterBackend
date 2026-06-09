const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  jobType: {
    type: String,
    required: true,
    trim: true
  },
  experienceLevel: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  salaryRange: {
    type: String,
    trim: true
  },
  salaryPeriod: {
    type: String,
    default: 'per annum',
    trim: true
  },
  deadline: {
    type: Date
  },
  description: {
    type: String,
    required: true
  },
  skills: [{
    type: String
  }],
  openings: {
    type: Number,
    default: 1
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true
  },
  status: {
    type: String,
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
