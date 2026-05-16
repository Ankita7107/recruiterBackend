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
  status: {
    type: String,
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('JobSeeker', jobSeekerSchema);
