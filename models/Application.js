const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
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
  resumeLink: {
    type: String
  },
  status: {
    type: String,
    enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Rejected', 'Closed'],
    default: 'Applied'
  },
  recruiterStatus: {
    type: String,
    enum: ['Pending', 'Interested', 'Callback', 'Not Answered', 'Not Interested'],
    default: 'Pending'
  },
  recruiterNotes: {
    type: String,
    default: ''
  },
  callTime: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
