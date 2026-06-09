const Job = require('../models/Job');

// @desc    Get all active jobs
// @route   GET /api/jobs
// @access  Public
const getAllJobs = async (req, res) => {
  try {
    // Only fetch jobs with status 'Open' by default
    const filter = { status: 'Open' };
    
    const jobs = await Job.find(filter)
      .populate('employer', 'companyName businessEmail hrPhone website address email mobile') // Get company name and contact details from Employer
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
      .populate('employer', 'companyName firstName lastName email mobile businessEmail hrPhone website address');

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
      location, salaryRange, salaryPeriod, deadline, description, skills,
      openings
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
      salaryPeriod: salaryPeriod || 'per annum',
      deadline,
      description,
      skills,
      openings,
      employer: req.user._id
    });

    // Trigger notification for Admin(s)
    try {
      const Admin = require('../models/Admin');
      const Notification = require('../models/Notification');
      const admins = await Admin.find({});
      const companyName = req.user.companyName || `${req.user.firstName} ${req.user.lastName}`;
      
      const notifications = admins.map(admin => ({
        recipient: admin._id,
        recipientModel: 'Admin',
        text: `New job posting '${job.title}' submitted by ${companyName} requires approval.`
      }));
      
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (notifError) {
      console.error('Error creating admin job post notification:', notifError);
    }

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

// @desc    Update a job post
// @route   PUT /api/jobs/:id
// @access  Private (Employer only)
const updateJob = async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied. Employers only.' });
    }

    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // Ensure the employer owns the job
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You do not own this job.' });
    }

    const { 
      title, category, jobType, experienceLevel, 
      location, salaryRange, salaryPeriod, deadline, description, skills, status,
      openings
    } = req.body;

    // Update job fields if they are provided
    if (title !== undefined) job.title = title;
    if (category !== undefined) job.category = category;
    if (jobType !== undefined) job.jobType = jobType;
    if (experienceLevel !== undefined) job.experienceLevel = experienceLevel;
    if (location !== undefined) job.location = location;
    if (salaryRange !== undefined) job.salaryRange = salaryRange;
    if (salaryPeriod !== undefined) job.salaryPeriod = salaryPeriod;
    if (deadline !== undefined) job.deadline = deadline;
    if (description !== undefined) job.description = description;
    if (skills !== undefined) job.skills = skills;
    if (status !== undefined) job.status = status;
    if (openings !== undefined) job.openings = openings;

    await job.save();

    res.json({
      message: 'Job updated successfully.',
      job
    });
  } catch (error) {
    console.error('Error in updateJob:', error);
    res.status(500).json({ message: 'Server error while updating job.' });
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  postJob,
  getEmployerJobs,
  updateJob
};
