const JobSeeker = require('../models/JobSeeker');
const Job = require('../models/Job');
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

    // 2. Format / Validation checks
    const nameRegex = /^[a-zA-Z\s]{2,30}$/;
    if (!nameRegex.test(firstName.trim())) {
      return res.status(400).json({ message: 'First name must contain only letters and be 2 to 30 characters long.' });
    }
    if (!nameRegex.test(lastName.trim())) {
      return res.status(400).json({ message: 'Last name must contain only letters and be 2 to 30 characters long.' });
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

    // 3. Check if job seeker already exists
    const jobSeekerExists = await JobSeeker.findOne({ email: email.toLowerCase() });
    if (jobSeekerExists) {
      return res.status(400).json({ message: 'Job seeker with this email already exists.' });
    }

    // 4. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create new job seeker
    const jobSeeker = await JobSeeker.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      mobile: cleanedMobile,
      password: hashedPassword
    });

    // 6. Send success response
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

// @desc    Bookmark/Save a job
// @route   POST /api/jobseekers/saved-jobs/:jobId
// @access  Private (JobSeeker only)
const saveJob = async (req, res) => {
  try {
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({ message: 'Access denied. Job Seekers only.' });
    }

    const { jobId } = req.params;

    // Check if the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // Find candidate profile
    const seeker = await JobSeeker.findById(req.user._id);

    // Initial check to avoid duplicates
    if (seeker.savedJobs.includes(jobId)) {
      return res.status(400).json({ message: 'Job already saved.' });
    }

    seeker.savedJobs.push(jobId);
    await seeker.save();

    res.json({ message: 'Job saved successfully.', savedJobs: seeker.savedJobs });
  } catch (error) {
    console.error('Error in saveJob:', error);
    res.status(500).json({ message: 'Server error while saving job.' });
  }
};

// @desc    Unsave/Remove bookmarked job
// @route   DELETE /api/jobseekers/saved-jobs/:jobId
// @access  Private (JobSeeker only)
const unsaveJob = async (req, res) => {
  try {
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({ message: 'Access denied. Job Seekers only.' });
    }

    const { jobId } = req.params;

    const seeker = await JobSeeker.findById(req.user._id);

    seeker.savedJobs = seeker.savedJobs.filter(id => id.toString() !== jobId);
    await seeker.save();

    res.json({ message: 'Job removed from bookmarks.', savedJobs: seeker.savedJobs });
  } catch (error) {
    console.error('Error in unsaveJob:', error);
    res.status(500).json({ message: 'Server error while removing bookmarked job.' });
  }
};

// @desc    Get all bookmarked jobs
// @route   GET /api/jobseekers/saved-jobs
// @access  Private (JobSeeker only)
const getSavedJobs = async (req, res) => {
  try {
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({ message: 'Access denied. Job Seekers only.' });
    }

    const seeker = await JobSeeker.findById(req.user._id)
      .populate({
        path: 'savedJobs',
        populate: {
          path: 'employer',
          select: 'companyName profileImage website industry website about'
        }
      });

    if (!seeker) {
      return res.status(404).json({ message: 'Job seeker not found.' });
    }

    res.json({ savedJobs: seeker.savedJobs || [] });
  } catch (error) {
    console.error('Error in getSavedJobs:', error);
    res.status(500).json({ message: 'Server error while fetching saved jobs.' });
  }
};

module.exports = {
  registerJobSeeker,
  loginJobSeeker,
  getProfile,
  updateProfile,
  uploadResume,
  uploadProfileImage,
  saveJob,
  unsaveJob,
  getSavedJobs
};
