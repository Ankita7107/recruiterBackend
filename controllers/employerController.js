const Employer = require('../models/Employer');
const Job = require('../models/Job');
const Application = require('../models/Application');
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
    const { firstName, lastName, email, mobile, password, companyName, businessEmail, address, city } = req.body;

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
    if (businessEmail && !emailRegex.test(businessEmail.trim())) {
      return res.status(400).json({ message: 'Please provide a valid business email address.' });
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

    // 3. Check if employer already exists
    const employerExists = await Employer.findOne({ email: email.toLowerCase() });
    if (employerExists) {
      return res.status(400).json({ message: 'Employer with this email already exists.' });
    }

    // 4. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create new employer (saving cleaned/formatted mobile and lowcase email)
    const employer = await Employer.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      mobile: cleanedMobile,
      companyName: companyName.trim(),
      businessEmail: businessEmail ? businessEmail.trim().toLowerCase() : email.trim().toLowerCase(),
      password: hashedPassword,
      address: address || '',
      city: city || ''
    });

    // 6. Send success response
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
    const employer = await Employer.findById(req.user._id);
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found.' });
    }

    const { companyName, industry, website, companySize, address, city, about, businessEmail, hrPhone, profileImage, password } = req.body;

    // Validate password if provided
    if (password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
          message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#).' 
        });
      }
      const salt = await bcrypt.genSalt(10);
      employer.password = await bcrypt.hash(password, salt);
    }

    if (companyName !== undefined) employer.companyName = companyName;
    if (industry !== undefined) employer.industry = industry;
    if (website !== undefined) employer.website = website;
    if (companySize !== undefined) employer.companySize = companySize;
    if (address !== undefined) employer.address = address;
    if (city !== undefined) employer.city = city;
    if (about !== undefined) employer.about = about;
    if (businessEmail !== undefined) employer.businessEmail = businessEmail;
    if (hrPhone !== undefined) employer.hrPhone = hrPhone;
    if (profileImage !== undefined) employer.profileImage = profileImage;

    const updatedEmployer = await employer.save();
    
    // Remove password before returning
    const empObj = updatedEmployer.toObject();
    delete empObj.password;

    res.json({ message: 'Profile updated successfully.', employer: empObj });
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

// @desc    Get global hiring statistics (Public)
// @route   GET /api/employers/public-stats
// @access  Public
const getPublicStats = async (req, res) => {
  try {
    const totalAppsCount = await Application.countDocuments({});
    const shortlistedCount = await Application.countDocuments({ status: 'Shortlisted' });
    const interviewCount = await Application.countDocuments({ status: 'Interview' });

    res.json({
      totalApplications: totalAppsCount,
      shortlisted: shortlistedCount,
      interviews: interviewCount,
      offers: shortlistedCount
    });
  } catch (error) {
    console.error('Error in getPublicStats:', error);
    res.status(500).json({ message: 'Server error while fetching stats.' });
  }
};

module.exports = {
  registerEmployer,
  loginEmployer,
  getProfile,
  updateProfile,
  uploadProfileImage,
  getPublicStats
};
