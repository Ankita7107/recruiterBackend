const Employer = require('../models/Employer');
const Job = require('../models/Job');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new employer
// @route   POST /api/employers/register
// @access  Public
const registerEmployer = async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, password, companyName, businessEmail } = req.body;

    // 1. Validate required fields
    if (!firstName || !lastName || !email || !mobile || !password || !companyName) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // 2. Check if employer already exists
    const employerExists = await Employer.findOne({ email });
    if (employerExists) {
      return res.status(400).json({ message: 'Employer with this email already exists.' });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create new employer
    const employer = await Employer.create({
      firstName,
      lastName,
      email,
      mobile,
      companyName,
      businessEmail,
      password: hashedPassword
    });

    // 5. Send success response
    if (employer) {
      res.status(201).json({
        message: 'Employer registered successfully.',
        employer: {
          _id: employer._id,
          firstName: employer.firstName,
          lastName: employer.lastName,
          email: employer.email,
          companyName: employer.companyName,
          businessEmail: employer.businessEmail,
          role: 'employer',
          token: generateToken(employer._id, 'employer')
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid employer data.' });
    }
  } catch (error) {
    console.error('Error in registerEmployer:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// @desc    Authenticate an employer
// @route   POST /api/employers/login
// @access  Public
const loginEmployer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate mandatory fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill all mandatory fields.' });
    }

    // Check for user email
    const employer = await Employer.findOne({ email });

    if (employer && (await bcrypt.compare(password, employer.password))) {
      res.json({
        message: 'Login successful.',
        employer: {
          _id: employer._id,
          firstName: employer.firstName,
          lastName: employer.lastName,
          email: employer.email,
          companyName: employer.companyName,
          role: 'employer',
          token: generateToken(employer._id, 'employer')
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password.' });
    }
  } catch (error) {
    console.error('Error in loginEmployer:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// @desc    Get logged-in employer's profile
// @route   GET /api/employers/profile
// @access  Private (Employer)
const getProfile = async (req, res) => {
  try {
    const employer = await Employer.findById(req.user._id).select('-password');
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found.' });
    }
    res.json({ employer });
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ message: 'Server error while fetching profile.' });
  }
};

// @desc    Update logged-in employer's profile
// @route   PUT /api/employers/profile
// @access  Private (Employer)
const updateProfile = async (req, res) => {
  try {
    const { companyName, industry, website, companySize, address, about, businessEmail, hrPhone, profileImage } = req.body;

    const updatedEmployer = await Employer.findByIdAndUpdate(
      req.user._id,
      { companyName, industry, website, companySize, address, about, businessEmail, hrPhone, profileImage },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedEmployer) {
      return res.status(404).json({ message: 'Employer not found.' });
    }

    res.json({ message: 'Profile updated successfully.', employer: updatedEmployer });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({ message: 'Server error while updating profile.' });
  }
};

// @desc    Upload profile image (logo) for employer
// @route   POST /api/employers/upload-profile-image
// @access  Private (Employer)
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file.' });
    }

    // Construct image URL path
    const profileImageUrl = `${req.protocol}://${req.get('host')}/uploads/profile-images/${req.file.filename}`;

    // Update DB
    const employer = await Employer.findByIdAndUpdate(
      req.user._id,
      { profileImage: profileImageUrl },
      { new: true }
    ).select('-password');

    if (!employer) {
      return res.status(404).json({ message: 'Employer not found.' });
    }

    res.json({
      message: 'Profile image uploaded successfully.',
      profileImage: profileImageUrl,
      employer
    });
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    res.status(500).json({ message: 'Server error while uploading profile image.' });
  }
};

module.exports = {
  registerEmployer,
  loginEmployer,
  getProfile,
  updateProfile,
  uploadProfileImage
};
