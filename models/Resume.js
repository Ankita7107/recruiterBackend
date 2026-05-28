const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  jobSeekerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobSeeker',
    required: true,
    unique: true
  },
  templateId: {
    type: String,
    default: 'professional'
  },
  formData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
