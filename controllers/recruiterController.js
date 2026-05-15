const Recruiter = require('../models/Recruiter');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new recruiter
// @route   POST /api/recruiters/register
// @access  Public
const registerRecruiter = async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, password, companyName } = req.body;

    // 1. Validate required fields
    if (!firstName || !lastName || !email || !mobile || !password || !companyName) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // 2. Check if recruiter already exists
    const recruiterExists = await Recruiter.findOne({ email });
    if (recruiterExists) {
      return res.status(400).json({ message: 'Recruiter with this email already exists.' });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create new recruiter
    const recruiter = await Recruiter.create({
      firstName,
      lastName,
      email,
      mobile,
      companyName,
      password: hashedPassword
    });

    // 5. Send success response
    if (recruiter) {
      res.status(201).json({
        message: 'Recruiter registered successfully.',
        recruiter: {
          _id: recruiter._id,
          firstName: recruiter.firstName,
          lastName: recruiter.lastName,
          email: recruiter.email,
          companyName: recruiter.companyName,
          role: 'recruiter'
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid recruiter data.' });
    }
  } catch (error) {
    console.error('Error in registerRecruiter:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// @desc    Authenticate a recruiter
// @route   POST /api/recruiters/login
// @access  Public
const loginRecruiter = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const recruiter = await Recruiter.findOne({ email });

    if (recruiter && (await bcrypt.compare(password, recruiter.password))) {
      res.json({
        message: 'Login successful.',
        recruiter: {
          _id: recruiter._id,
          firstName: recruiter.firstName,
          lastName: recruiter.lastName,
          email: recruiter.email,
          companyName: recruiter.companyName,
          role: 'recruiter',
          token: generateToken(recruiter._id)
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password.' });
    }
  } catch (error) {
    console.error('Error in loginRecruiter:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

module.exports = {
  registerRecruiter,
  loginRecruiter
};
