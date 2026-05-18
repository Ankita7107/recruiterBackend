const mongoose = require('mongoose');

const EnquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  city: { type: String },
  type: { 
    type: String, 
    required: true,
    enum: ['Employer Inquiry', 'Job Seeker', 'Recruiter Partnership', 'General Inquiry']
  },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['New', 'Resolved'],
    default: 'New'
  },
  resumeUrl: { type: String }, // For Job Seekers attaching their resume
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Enquiry', EnquirySchema);
