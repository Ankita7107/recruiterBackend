const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const JobSeeker = require('../models/JobSeeker');
const Recruiter = require('../models/Recruiter');
const Employer = require('../models/Employer');

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

      // Get user info from token
      const { id, role } = decoded;

      // Find user based on role
      if (role === 'admin') {
        req.user = await Admin.findById(id).select('-password');
      } else if (role === 'jobseeker') {
        req.user = await JobSeeker.findById(id).select('-password');
      } else if (role === 'recruiter') {
        req.user = await Recruiter.findById(id).select('-password');
      } else if (role === 'employer') {
        req.user = await Employer.findById(id).select('-password');
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Attach role to user object for role-based access checks
      req.user.role = role;
      next();
    } catch (error) {
      console.error('Auth Error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to restrict access to Admins only
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admins only.' });
  }
};

module.exports = { protect, adminOnly };
