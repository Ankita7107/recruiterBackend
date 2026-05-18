const Job = require('../models/Job');

// @desc    Get all active jobs
// @route   GET /api/jobs
// @access  Public
const getAllJobs = async (req, res) => {
  try {
    // Only fetch jobs with status 'Open' by default
    const filter = { status: 'Open' };
    
    const jobs = await Job.find(filter)
      .populate('employer', 'companyName') // Get company name from Employer
      .sort({ createdAt: -1 }); // Newest first

    res.json({ jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Server error while fetching jobs.' });
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employer', 'companyName firstName lastName email');

    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    res.json({ job });
  } catch (error) {
    console.error('Error fetching job details:', error);
    res.status(500).json({ message: 'Server error while fetching job details.' });
  }
};

// @desc    Post a new job
// @route   POST /api/jobs
// @access  Private (Employer only)
const postJob = async (req, res) => {
  try {
    // Only allow employers
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied. Employers only.' });
    }

    const { 
      title, category, jobType, experienceLevel, 
      location, salaryRange, deadline, description, skills 
    } = req.body;

    // Validate mandatory fields
    if (!title || !category || !jobType || !experienceLevel || !location || !description) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    const job = await Job.create({
      title,
      category,
      jobType,
      experienceLevel,
      location,
      salaryRange,
      deadline,
      description,
      skills,
      employer: req.user._id
    });

    res.status(201).json({
      message: 'Job posted successfully.',
      job
    });
  } catch (error) {
    console.error('Error in postJob:', error);
    res.status(500).json({ message: 'Server error while posting job.' });
  }
};

// @desc    Get all jobs posted by employer
// @route   GET /api/jobs/my-jobs
// @access  Private (Employer only)
const getEmployerJobs = async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied. Employers only.' });
    }

    const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (error) {
    console.error('Error fetching employer jobs:', error);
    res.status(500).json({ message: 'Server error while fetching jobs.' });
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  postJob,
  getEmployerJobs
};
