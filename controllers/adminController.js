const Admin = require('../models/Admin');
const JobSeeker = require('../models/JobSeeker');
const Recruiter = require('../models/Recruiter');
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
      ...employers.map(u => ({ ...u._doc, role: 'employer' }))
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
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    res.json({ message: 'Job post rejected and deleted successfully.' });
  } catch (error) {
    console.error('Error in rejectJob:', error);
    res.status(500).json({ message: 'Server error during job rejection.' });
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
  rejectJob
};
