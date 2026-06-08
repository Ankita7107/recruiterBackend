const Recruiter = require('../models/Recruiter');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', {
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

    // 2. Format / Validation checks
    const nameRegex = /^[a-zA-Z\s]{2,30}$/;
    if (!nameRegex.test(firstName.trim())) {
      return res.status(400).json({ message: 'First name must contain only letters and be 2 to 30 characters long.' });
    }
    if (!nameRegex.test(lastName.trim())) {
      return res.status(400).json({ message: 'Last name must contain only letters and be 2 to 30 characters long.' });
    }

    if (companyName.trim().length < 2) {
      return res.status(400).json({ message: 'Company name must be at least 2 characters long.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    const cleanedMobile = mobile.replace(/[\s\-()]/g, "").replace(/^(\+91|91|0)/, "");
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(cleanedMobile)) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit mobile number starting with 6, 7, 8, or 9.' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#).' 
      });
    }

    // 3. Check if recruiter already exists
    const recruiterExists = await Recruiter.findOne({ email: email.toLowerCase() });
    if (recruiterExists) {
      return res.status(400).json({ message: 'Recruiter with this email already exists.' });
    }

    // 4. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create new recruiter
    const recruiter = await Recruiter.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      mobile: cleanedMobile,
      companyName: companyName.trim(),
      password: hashedPassword
    });

    // 6. Send success response
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

    // 1. Validate mandatory fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill all mandatory fields.' });
    }

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
          token: generateToken(recruiter._id, 'recruiter')
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

// @desc    Get recruiter profile
// @route   GET /api/recruiters/profile
// @access  Private
const getRecruiterProfile = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.user._id).select('-password');
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found.' });
    }
    res.json({ recruiter });
  } catch (error) {
    console.error('Error in getRecruiterProfile:', error);
    res.status(500).json({ message: 'Server error while fetching profile.' });
  }
};

// @desc    Update recruiter profile
// @route   PUT /api/recruiters/profile
// @access  Private
const updateRecruiterProfile = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.user._id);
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found.' });
    }

    const { firstName, lastName, email, mobile, companyName, password, profileImage } = req.body;

    // Validations
    const nameRegex = /^[a-zA-Z\s]{2,30}$/;
    if (firstName && !nameRegex.test(firstName.trim())) {
      return res.status(400).json({ message: 'First name must contain only letters and be 2 to 30 characters long.' });
    }
    if (lastName && !nameRegex.test(lastName.trim())) {
      return res.status(400).json({ message: 'Last name must contain only letters and be 2 to 30 characters long.' });
    }

    if (companyName && companyName.trim().length < 2) {
      return res.status(400).json({ message: 'Company name must be at least 2 characters long.' });
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ message: 'Please provide a valid email address.' });
      }
    }

    let cleanedMobile = mobile;
    if (mobile) {
      cleanedMobile = mobile.replace(/[\s\-()]/g, "").replace(/^(\+91|91|0)/, "");
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(cleanedMobile)) {
        return res.status(400).json({ message: 'Please provide a valid 10-digit mobile number starting with 6, 7, 8, or 9.' });
      }
    }

    if (password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
          message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#).' 
        });
      }
    }

    if (firstName) recruiter.firstName = firstName.trim();
    if (lastName) recruiter.lastName = lastName.trim();
    if (companyName) recruiter.companyName = companyName.trim();
    
    if (email && email.trim().toLowerCase() !== recruiter.email) {
      const emailExists = await Recruiter.findOne({ email: email.trim().toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already in use.' });
      }
      recruiter.email = email.trim().toLowerCase();
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      recruiter.password = await bcrypt.hash(password, salt);
    }

    if (profileImage !== undefined) {
      recruiter.profileImage = profileImage;
    }

    if (mobile !== undefined) {
      recruiter.mobile = cleanedMobile;
    }

    const updatedRecruiter = await recruiter.save();
    
    res.json({
      message: 'Profile updated successfully.',
      recruiter: {
        _id: updatedRecruiter._id,
        firstName: updatedRecruiter.firstName,
        lastName: updatedRecruiter.lastName,
        email: updatedRecruiter.email,
        mobile: updatedRecruiter.mobile,
        companyName: updatedRecruiter.companyName,
        profileImage: updatedRecruiter.profileImage,
        role: 'recruiter'
      }
    });
  } catch (error) {
    console.error('Error in updateRecruiterProfile:', error);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
};

// @desc    Upload profile image for recruiter
// @route   POST /api/recruiters/upload-profile-image
// @access  Private
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file.' });
    }

    const profileImageUrl = `${req.protocol}://${req.get('host')}/uploads/profile-images/${req.file.filename}`;

    const recruiter = await Recruiter.findByIdAndUpdate(
      req.user._id,
      { profileImage: profileImageUrl },
      { new: true }
    ).select('-password');

    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found.' });
    }

    res.json({
      message: 'Profile image uploaded successfully.',
      profileImage: profileImageUrl,
      recruiter
    });
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    res.status(500).json({ message: 'Server error while uploading profile image.' });
  }
};

module.exports = {
  registerRecruiter,
  loginRecruiter,
  getRecruiterProfile,
  updateRecruiterProfile,
  uploadProfileImage
};
