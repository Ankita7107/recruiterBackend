const Admin = require('../models/Admin');
const JobSeeker = require('../models/JobSeeker');
const Recruiter = require('../models/Recruiter');
const Employer = require('../models/Employer');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const City = require('../models/City');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new admin
// @route   POST /api/admins/register
// @access  Public
const registerAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // 1. Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // 2. Check if admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin with this email already exists.' });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create new admin
    const admin = await Admin.create({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });

    // 5. Send success response
    if (admin) {
      res.status(201).json({
        message: 'Admin registered successfully.',
        admin: {
          _id: admin._id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          role: 'admin'
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid admin data.' });
    }
  } catch (error) {
    console.error('Error in registerAdmin:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// @desc    Authenticate an admin
// @route   POST /api/admins/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate mandatory fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill all mandatory fields.' });
    }

    // Check for user email
    const admin = await Admin.findOne({ email });

    if (admin && (await bcrypt.compare(password, admin.password))) {
      res.json({
        message: 'Login successful.',
        admin: {
          _id: admin._id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          role: 'admin',
          token: generateToken(admin._id, 'admin')
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password.' });
    }
  } catch (error) {
    console.error('Error in loginAdmin:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// @desc    Get all users across all roles
// @route   GET /api/admins/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const jobSeekers = await JobSeeker.find({}).select('-password');
    const recruiters = await Recruiter.find({}).select('-password');
    const employers = await Employer.find({}).select('-password');

    // Combine and add role info
    const allUsers = [
      ...jobSeekers.map(u => ({ ...u._doc, role: 'jobseeker' })),
      ...recruiters.map(u => ({ ...u._doc, role: 'recruiter' })),
      ...employers.map(u => ({ ...u._doc, role: 'employer', verified: u.verified }))
    ];

    res.json(allUsers);
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admins/users/:id/:role
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const { id, role } = req.params;
    let deletedUser;

    switch (role) {
      case 'jobseeker':
        deletedUser = await JobSeeker.findByIdAndDelete(id);
        break;
      case 'recruiter':
        deletedUser = await Recruiter.findByIdAndDelete(id);
        break;
      case 'employer':
        deletedUser = await Employer.findByIdAndDelete(id);
        break;
      default:
        return res.status(400).json({ message: 'Invalid role provided.' });
    }

    if (deletedUser) {
      res.json({ message: 'User deleted successfully.' });
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ message: 'Server error during deletion.' });
  }
};

// @desc    Get all jobs & stats for admin moderation
// @route   GET /api/admins/jobs
// @access  Private/Admin
const getAdminJobs = async (req, res) => {
  try {
    const jobs = await Job.find({})
      .populate('employer', 'companyName firstName lastName email')
      .sort({ createdAt: -1 });

    // Calculate dynamic stats
    const activeCount = jobs.filter(j => j.status === 'Open' || j.status === 'Active').length;
    const pendingCount = jobs.filter(j => j.status === 'Pending').length;
    const totalCount = jobs.length;

    res.json({
      stats: {
        activeCount,
        pendingCount,
        totalCount
      },
      jobs
    });
  } catch (error) {
    console.error('Error in getAdminJobs:', error);
    res.status(500).json({ message: 'Server error while fetching jobs for admin.' });
  }
};

// @desc    Get all pending jobs in verification queue
// @route   GET /api/admins/jobs/pending
// @access  Private/Admin
const getPendingJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'Pending' })
      .populate('employer', 'companyName firstName lastName email verified')
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (error) {
    console.error('Error in getPendingJobs:', error);
    res.status(500).json({ message: 'Server error while fetching pending jobs.' });
  }
};

// @desc    Approve a pending job post
// @route   PUT /api/admins/jobs/:id/approve
// @access  Private/Admin
const approveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    job.status = 'Open'; // Set status to 'Open' (matches our backend public filter)
    await job.save();

    // Trigger notification for Employer
    try {
      await Notification.create({
        recipient: job.employer,
        recipientModel: 'Employer',
        text: `Your job posting '${job.title}' has been approved by the Admin and is now live.`
      });
    } catch (notifError) {
      console.error('Error creating job approval notification:', notifError);
    }

    res.json({ message: 'Job post approved successfully.', job });
  } catch (error) {
    console.error('Error in approveJob:', error);
    res.status(500).json({ message: 'Server error during job approval.' });
  }
};

// @desc    Reject a pending job post (Deletes job completely from DB)
// @route   PUT /api/admins/jobs/:id/reject
// @access  Private/Admin
const rejectJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // Trigger notification for Employer
    try {
      await Notification.create({
        recipient: job.employer,
        recipientModel: 'Employer',
        text: `Your job posting '${job.title}' has been rejected by the Admin.`
      });
    } catch (notifError) {
      console.error('Error creating job rejection notification:', notifError);
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: 'Job post rejected and deleted successfully.' });
  } catch (error) {
    console.error('Error in rejectJob:', error);
    res.status(500).json({ message: 'Server error during job rejection.' });
  }
};

// @desc    Get dashboard metrics & registrations overview (Admin only)
// @route   GET /api/admins/dashboard-overview
// @access  Private/Admin
const getDashboardOverview = async (req, res) => {
  try {
    const jobSeekerCount = await JobSeeker.countDocuments({});
    const employerCount = await Employer.countDocuments({});
    const recruiterCount = await Recruiter.countDocuments({});
    const totalUsers = jobSeekerCount + employerCount + recruiterCount;

    const activeJobs = await Job.countDocuments({ status: { $in: ['Open', 'Active'] } });

    // Dynamic placement calculations
    const shortlistedCount = await Application.countDocuments({ status: 'Shortlisted' });
    const interviewCount = await Application.countDocuments({ status: 'Interview' });
    const placementsCount = shortlistedCount + interviewCount;

    // Premium dynamic revenue simulation
    const baseRevenue = 250000;
    const dynamicRevenue = baseRevenue + (employerCount * 5000) + (recruiterCount * 3000);

    // Fetch Recent Registrations
    const recentJobSeekers = await JobSeeker.find({}).sort({ createdAt: -1 }).limit(3);
    const recentEmployers = await Employer.find({}).sort({ createdAt: -1 }).limit(3);
    const recentRecruiters = await Recruiter.find({}).sort({ createdAt: -1 }).limit(3);

    const mergedUsers = [
      ...recentJobSeekers.map(u => ({
        name: `${u.firstName} ${u.lastName}`,
        role: 'Job Seeker',
        city: u.city || 'N/A',
        createdAt: u.createdAt,
        status: u.status || 'Active'
      })),
      ...recentEmployers.map(u => ({
        name: u.companyName || `${u.firstName} ${u.lastName}`,
        role: 'Employer',
        city: u.city || 'N/A',
        createdAt: u.createdAt,
        status: u.status || 'Active'
      })),
      ...recentRecruiters.map(u => ({
        name: `${u.firstName} ${u.lastName} (${u.companyName})`,
        role: 'Recruiter',
        city: 'N/A',
        createdAt: u.createdAt,
        status: u.status || 'Active'
      }))
    ];

    const sortedRecentUsers = mergedUsers
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);

    // Fetch Master Cities List
    const dbCities = await City.find({}).sort({ name: 1 });
    const cityNames = dbCities.map(c => c.name);

    res.json({
      stats: {
        totalUsers,
        activeJobs,
        revenue: dynamicRevenue,
        placements: placementsCount
      },
      recentUsers: sortedRecentUsers,
      cities: cityNames.length > 0 ? cityNames : ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune"]
    });
  } catch (error) {
    console.error('Error in getDashboardOverview:', error);
    res.status(500).json({ message: 'Server error fetching dashboard overview.' });
  }
};

// @desc    Toggle verified status for an employer
// @route   PUT /api/admins/users/:id/toggle-verify
// @access  Private/Admin
const toggleVerifyEmployer = async (req, res) => {
  try {
    const employer = await Employer.findById(req.params.id);
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found.' });
    }

    employer.verified = !employer.verified;
    await employer.save();

    res.json({ 
      message: `Employer verification status updated to ${employer.verified ? 'Verified' : 'Unverified'}.`, 
      employer: {
        _id: employer._id,
        companyName: employer.companyName,
        verified: employer.verified
      }
    });
  } catch (error) {
    console.error('Error in toggleVerifyEmployer:', error);
    res.status(500).json({ message: 'Server error while toggling employer verification.' });
  }
};

// @desc    Get logged-in admin's profile
// @route   GET /api/admins/profile
// @access  Private/Admin
const getAdminProfile = async (req, res) => {
  try {
    res.json({ admin: req.user });
  } catch (error) {
    console.error('Error in getAdminProfile:', error);
    res.status(500).json({ message: 'Server error fetching admin profile.' });
  }
};

// @desc    Update admin profile
// @route   PUT /api/admins/profile
// @access  Private/Admin
const updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    const { firstName, lastName, email, password, profileImage, mobile } = req.body;

    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    
    if (email && email.toLowerCase() !== admin.email) {
      const emailExists = await Admin.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already in use.' });
      }
      admin.email = email.toLowerCase();
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
    }

    if (profileImage !== undefined) {
      admin.profileImage = profileImage;
    }

    if (mobile !== undefined) {
      admin.mobile = mobile;
    }

    const updatedAdmin = await admin.save();
    
    res.json({
      message: 'Profile updated successfully.',
      admin: {
        _id: updatedAdmin._id,
        firstName: updatedAdmin.firstName,
        lastName: updatedAdmin.lastName,
        email: updatedAdmin.email,
        profileImage: updatedAdmin.profileImage,
        mobile: updatedAdmin.mobile,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Error in updateAdminProfile:', error);
    res.status(500).json({ message: 'Server error updating admin profile.' });
  }
};

// @desc    Upload profile image (JPG, JPEG, PNG, GIF)
// @route   POST /api/admins/upload-profile-image
// @access  Private/Admin
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded. Please upload a valid image (JPG, PNG, GIF).' });
    }

    // Build static URL path
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/profile-images/${req.file.filename}`;

    // Update admin profile image
    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.user._id,
      { profileImage: imageUrl },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile image uploaded successfully.',
      profileImage: imageUrl,
      admin: updatedAdmin
    });
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    res.status(500).json({ message: 'Server error while uploading profile image.' });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getAllUsers,
  deleteUser,
  getAdminJobs,
  getPendingJobs,
  approveJob,
  rejectJob,
  getDashboardOverview,
  toggleVerifyEmployer,
  getAdminProfile,
  updateAdminProfile,
  uploadProfileImage
};
