const mongoose = require('mongoose');

const jobSeekerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  skills: {
    type: [String],
    default: []
  },
  experience: {
    type: [
      {
        role: String,
        company: String,
        period: String,
        desc: String
      }
    ],
    default: []
  },
  education: {
    type: [
      {
        degree: String,
        university: String,
        year: String
      }
    ],
    default: []
  },
  projects: {
    type: [
      {
        name: String,
        link: String,
        techStack: String,
        desc: String
      }
    ],
    default: []
  },
  resumeLink: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    default: 'Active'
  },
  savedJobs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('JobSeeker', jobSeekerSchema);
