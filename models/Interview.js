const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  jobSeekerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobSeeker',
    required: true
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true
  },
  interviewType: {
    type: String,
    enum: ['Online', 'In-Person'],
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  dateTime: {
    type: Date,
    required: true
  },
  duration: {
    type: String,
    default: '30 mins'
  },
  link: {
    type: String,
    default: '' // Zoom or Google Meet Link (optional for In-Person)
  },
  location: {
    type: String,
    default: '' // Physical Address (optional for Online)
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
