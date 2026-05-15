const JobSeeker = require('../models/JobSeeker');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new job seeker
// @route   POST /api/jobseekers/register
// @access  Public
const registerJobSeeker = async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, password } = req.body;

    // 1. Validate required fields
    if (!firstName || !lastName || !email || !mobile || !password) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // 2. Check if job seeker already exists
    const jobSeekerExists = await JobSeeker.findOne({ email });
    if (jobSeekerExists) {
      return res.status(400).json({ message: 'Job seeker with this email already exists.' });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create new job seeker
    const jobSeeker = await JobSeeker.create({
      firstName,
      lastName,
      email,
      mobile,
      password: hashedPassword
    });

    // 5. Send success response
    if (jobSeeker) {
      res.status(201).json({
        message: 'Job seeker registered successfully.',
        jobSeeker: {
          _id: jobSeeker._id,
          firstName: jobSeeker.firstName,
          lastName: jobSeeker.lastName,
          email: jobSeeker.email,
          role: 'jobseeker'
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid job seeker data.' });
    }
  } catch (error) {
    console.error('Error in registerJobSeeker:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// @desc    Authenticate a job seeker
// @route   POST /api/jobseekers/login
// @access  Public
const loginJobSeeker = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const jobSeeker = await JobSeeker.findOne({ email });

    if (jobSeeker && (await bcrypt.compare(password, jobSeeker.password))) {
      res.json({
        message: 'Login successful.',
        jobSeeker: {
          _id: jobSeeker._id,
          firstName: jobSeeker.firstName,
          lastName: jobSeeker.lastName,
          email: jobSeeker.email,
          role: 'jobseeker',
          token: generateToken(jobSeeker._id)
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password.' });
    }
  } catch (error) {
    console.error('Error in loginJobSeeker:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

module.exports = {
  registerJobSeeker,
  loginJobSeeker
};
