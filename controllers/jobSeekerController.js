const JobSeeker = require('../models/JobSeeker');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', {
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

    // 1. Validate mandatory fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill all mandatory fields.' });
    }

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
          token: generateToken(jobSeeker._id, 'jobseeker')
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

// @desc    Get logged-in job seeker's profile
// @route   GET /api/jobseekers/profile
// @access  Private (JobSeeker)
const getProfile = async (req, res) => {
  try {
    const jobSeeker = await JobSeeker.findById(req.user._id).select('-password');
    if (!jobSeeker) {
      return res.status(404).json({ message: 'Job seeker not found.' });
    }
    res.json({ jobSeeker });
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ message: 'Server error while fetching profile.' });
  }
};

// @desc    Update logged-in job seeker's profile
// @route   PUT /api/jobseekers/profile
// @access  Private (JobSeeker)
const updateProfile = async (req, res) => {
  try {
    const { city, skills, experience, education, resumeLink, profileImage, mobile } = req.body;

    const updatedJobSeeker = await JobSeeker.findByIdAndUpdate(
      req.user._id,
      { city, skills, experience, education, resumeLink, profileImage, mobile },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedJobSeeker) {
      return res.status(404).json({ message: 'Job seeker not found.' });
    }

    res.json({ message: 'Profile updated successfully.', jobSeeker: updatedJobSeeker });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({ message: 'Server error while updating profile.' });
  }
};

// @desc    Upload resume PDF
// @route   POST /api/jobseekers/upload-resume
// @access  Private (JobSeeker)
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please upload a PDF.' });
    }

    // Build the accessible URL for the uploaded file
    const resumeUrl = `${req.protocol}://${req.get('host')}/uploads/resumes/${req.file.filename}`;

    // Save the resume URL in the JobSeeker's profile
    const updatedJobSeeker = await JobSeeker.findByIdAndUpdate(
      req.user._id,
      { resumeLink: resumeUrl },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Resume uploaded successfully.',
      resumeLink: resumeUrl,
      jobSeeker: updatedJobSeeker
    });
  } catch (error) {
    console.error('Error in uploadResume:', error);
    res.status(500).json({ message: 'Server error while uploading resume.' });
  }
};

// @desc    Upload profile image (JPG, JPEG, PNG, GIF)
// @route   POST /api/jobseekers/upload-profile-image
// @access  Private (JobSeeker)
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded. Please upload a valid image (JPG, PNG, GIF).' });
    }

    // Build static URL path
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/profile-images/${req.file.filename}`;

    // Update candidate profile
    const updatedJobSeeker = await JobSeeker.findByIdAndUpdate(
      req.user._id,
      { profileImage: imageUrl },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile image uploaded successfully.',
      profileImage: imageUrl,
      jobSeeker: updatedJobSeeker
    });
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    res.status(500).json({ message: 'Server error while uploading profile image.' });
  }
};

module.exports = {
  registerJobSeeker,
  loginJobSeeker,
  getProfile,
  updateProfile,
  uploadResume,
  uploadProfileImage
};
