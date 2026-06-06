const Application = require('../models/Application');
const Job = require('../models/Job');
const JobSeeker = require('../models/JobSeeker');
const Notification = require('../models/Notification');

// @desc    Apply for a job
// @route   POST /api/applications/apply/:jobId
// @access  Private (JobSeeker only)
const applyForJob = async (req, res) => {
  try {
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({ message: 'Access denied. Job Seekers only.' });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    if (job.status !== 'Open') {
      return res.status(400).json({ message: 'This job is no longer accepting applications.' });
    }

    // Check if already applied
    const alreadyApplied = await Application.findOne({
      jobId: req.params.jobId,
      jobSeekerId: req.user._id
    });
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    const { resumeLink } = req.body;

    // Auto-fetch resume from JobSeeker profile if not provided in request
    let finalResumeLink = resumeLink || '';
    if (!finalResumeLink) {
      const seeker = await JobSeeker.findById(req.user._id).select('resumeLink');
      finalResumeLink = seeker?.resumeLink || '';
    }

    const application = await Application.create({
      jobId: req.params.jobId,
      jobSeekerId: req.user._id,
      employerId: job.employer,
      resumeLink: finalResumeLink
    });

    // Trigger notification for Employer
    try {
      await Notification.create({
        recipient: job.employer,
        recipientModel: 'Employer',
        text: `New application received from ${req.user.firstName} ${req.user.lastName} for the job: ${job.title}`
      });
    } catch (notifError) {
      console.error('Error creating apply notification:', notifError);
    }

    // Trigger notification for Recruiter(s)
    try {
      const Recruiter = require('../models/Recruiter');
      const recruiters = await Recruiter.find({});
      const notifications = recruiters.map(rec => ({
        recipient: rec._id,
        recipientModel: 'Recruiter',
        text: `New lead: ${req.user.firstName} ${req.user.lastName} applied for '${job.title}'. Please perform tele-screening.`
      }));
      
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (notifError) {
      console.error('Error creating recruiter lead notification:', notifError);
    }

    res.status(201).json({
      message: 'Application submitted successfully.',
      application
    });
  } catch (error) {
    console.error('Error in applyForJob:', error);
    res.status(500).json({ message: 'Server error while submitting application.' });
  }
};

// @desc    Get all applications submitted by the logged-in JobSeeker
// @route   GET /api/applications/my-applications
// @access  Private (JobSeeker only)
const getMyApplications = async (req, res) => {
  try {
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({ message: 'Access denied. Job Seekers only.' });
    }

    const applications = await Application.find({ jobSeekerId: req.user._id })
      .populate('jobId', 'title category jobType location salaryRange company')
      .populate('employerId', 'companyName')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error('Error in getMyApplications:', error);
    res.status(500).json({ message: 'Server error while fetching applications.' });
  }
};

// @desc    Get all applicants for a specific job
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer only)
const getJobApplications = async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied. Employers only.' });
    }

    // Make sure the employer owns this job
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You do not own this job.' });
    }

    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('jobSeekerId', 'firstName lastName email mobile')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error('Error in getJobApplications:', error);
    res.status(500).json({ message: 'Server error while fetching applicants.' });
  }
};

// @desc    Get all applications for the logged-in Employer (across all jobs)
// @route   GET /api/applications/employer
// @access  Private (Employer only)
const getEmployerApplications = async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied. Employers only.' });
    }

    const applications = await Application.find({ employerId: req.user._id })
      .populate('jobSeekerId', 'firstName lastName email mobile city skills experience education resumeLink')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 });

    // Filter out applications where the job has been deleted (jobId populate returns null)
    const validApplications = applications.filter(a => a.jobId !== null);

    res.json({ applications: validApplications });
  } catch (error) {
    console.error('Error in getEmployerApplications:', error);
    res.status(500).json({ message: 'Server error while fetching applicants.' });
  }
};

// @desc    Update application status (Shortlist, Reject, etc.)
// @route   PUT /api/applications/:id/status
// @access  Private (Employer only)
const updateApplicationStatus = async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied. Employers only.' });
    }

    const { status } = req.body;
    const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Rejected', 'Closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    // Ensure the employer owns the job this application belongs to
    if (application.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You do not own this application.' });
    }

    application.status = status;
    await application.save();

    // Trigger notification for JobSeeker
    try {
      const job = await Job.findById(application.jobId);
      if (job) {
        await Notification.create({
          recipient: application.jobSeekerId,
          recipientModel: 'JobSeeker',
          text: `Your application status for '${job.title}' has been updated to '${status}'.`
        });
      }
    } catch (notifError) {
      console.error('Error creating status update notification:', notifError);
    }

    res.json({ message: `Application status updated to '${status}'.`, application });
  } catch (error) {
    console.error('Error in updateApplicationStatus:', error);
    res.status(500).json({ message: 'Server error while updating status.' });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplications,
  getEmployerApplications,
  updateApplicationStatus
};
