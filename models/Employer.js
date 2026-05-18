const mongoose = require('mongoose');

const employerSchema = new mongoose.Schema({
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
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  businessEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  industry: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  companySize: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  about: {
    type: String,
    trim: true
  },
  hrPhone: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Employer', employerSchema);
