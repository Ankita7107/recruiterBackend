const Application = require('../models/Application');
const Job = require('../models/Job');
const JobSeeker = require('../models/JobSeeker');
const Employer = require('../models/Employer');

// @desc    Get all leads (Mapped directly from Applications)
// @route   GET /api/recruiters/leads
// @access  Private (Recruiter/Admin)
const getLeads = async (req, res) => {
  try {
    const applications = await Application.find({})
      .populate('jobSeekerId', 'firstName lastName mobile city')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 });

    const leads = applications.map(app => ({
      _id: app._id,
      name: app.jobSeekerId ? `${app.jobSeekerId.firstName} ${app.jobSeekerId.lastName}` : 'Candidate Profile Deleted',
      phone: app.jobSeekerId ? app.jobSeekerId.mobile : 'N/A',
      job: app.jobId ? app.jobId.title : 'Job Deleted',
      city: app.jobSeekerId ? app.jobSeekerId.city || 'N/A' : 'N/A',
      status: app.recruiterStatus || 'Pending',
      callTime: app.callTime || '',
      type: 'Outgoing',
      notes: app.recruiterNotes || ''
    }));

    res.json({ leads });
  } catch (error) {
    console.error('Error fetching recruiter leads:', error);
    res.status(500).json({ message: 'Server error while fetching leads.' });
  }
};

// @desc    Create a new lead (Creates a real Application record linking candidate to job)
// @route   POST /api/recruiters/leads
// @access  Private (Recruiter/Admin)
const createLead = async (req, res) => {
  try {
    const { name, phone, job, city } = req.body;

    if (!name || !phone || !job || !city) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // 1. Create a dummy Job Seeker if not exists, or find one
    let seeker = await JobSeeker.findOne({ mobile: phone });
    if (!seeker) {
      const names = name.split(' ');
      seeker = await JobSeeker.create({
        firstName: names[0],
        lastName: names[1] || 'Kumar',
        email: `candidate_${Date.now()}@tci.com`,
        password: 'password123',
        mobile: phone,
        city
      });
    }

    // 2. Find a Job matching the title, or get the first available job
    let targetJob = await Job.findOne({ title: new RegExp(job, 'i') });
    if (!targetJob) {
      targetJob = await Job.findOne({});
    }

    if (!targetJob) {
      return res.status(400).json({ message: 'No jobs exist in the database to link lead to.' });
    }

    // 3. Create a real application
    const application = await Application.create({
      jobId: targetJob._id,
      jobSeekerId: seeker._id,
      employerId: targetJob.employer,
      status: 'Applied',
      recruiterStatus: 'Pending',
      recruiterNotes: 'Lead logged manually by recruiter.',
      callTime: ''
    });

    res.status(201).json({
      message: 'Dynamic lead created successfully.',
      lead: {
        _id: application._id,
        name: `${seeker.firstName} ${seeker.lastName}`,
        phone: seeker.mobile,
        job: targetJob.title,
        city: seeker.city,
        status: application.recruiterStatus,
        callTime: application.callTime,
        type: 'Outgoing',
        notes: application.recruiterNotes
      }
    });
  } catch (error) {
    console.error('Error creating dynamic lead:', error);
    res.status(500).json({ message: 'Server error while creating lead.' });
  }
};

// @desc    Update a recruiter lead (Updates Call Log & Syncs with core Application status)
// @route   PUT /api/recruiters/leads/:id
// @access  Private (Recruiter/Admin)
const updateLead = async (req, res) => {
  try {
    const { status, notes, callTime } = req.body;

    let application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application/Lead record not found.' });
    }

    // Update Recruiter fields
    if (status !== undefined) application.recruiterStatus = status;
    if (notes !== undefined) application.recruiterNotes = notes;
    if (callTime !== undefined) application.callTime = callTime;

    // Automatic Workflow Hook:
    // If the recruiter confirms the candidate is 'Interested', we automatically promote
    // the core application status to 'Shortlisted' or 'Under Review' for the Employer!
    if (status === 'Interested') {
      application.status = 'Shortlisted';
    } else if (status === 'Not Interested') {
      application.status = 'Rejected';
    } else {
      application.status = 'Under Review';
    }

    await application.save();

    // Trigger notification for JobSeeker
    try {
      const Notification = require('../models/Notification');
      const targetJob = await Job.findById(application.jobId);
      if (targetJob) {
        let textMsg = '';
        if (status === 'Interested') {
          textMsg = `Your application for '${targetJob.title}' has been shortlisted by the recruiter after call screening.`;
        } else if (status === 'Not Interested') {
          textMsg = `Your application status for '${targetJob.title}' has been updated to 'Rejected' after call screening.`;
        } else {
          textMsg = `Your application status for '${targetJob.title}' is now under review after call screening.`;
        }

        await Notification.create({
          recipient: application.jobSeekerId,
          recipientModel: 'JobSeeker',
          text: textMsg
        });
      }
    } catch (notifError) {
      console.error('Error creating jobseeker notification from lead update:', notifError);
    }

    // Trigger notification for Employer
    try {
      const Notification = require('../models/Notification');
      const targetJob = await Job.findById(application.jobId);
      if (targetJob) {
        const seeker = await JobSeeker.findById(application.jobSeekerId);
        const seekerName = seeker ? `${seeker.firstName} ${seeker.lastName}` : 'Candidate';
        
        let textMsg = '';
        if (status === 'Interested') {
          textMsg = `Recruiter call screening complete: ${seekerName} is interested in '${targetJob.title}' (Shortlisted).`;
        } else if (status === 'Not Interested') {
          textMsg = `Recruiter call screening complete: ${seekerName} is not interested in '${targetJob.title}' (Rejected).`;
        } else {
          textMsg = `Recruiter call screening complete: ${seekerName} is under review for '${targetJob.title}'.`;
        }

        await Notification.create({
          recipient: application.employerId,
          recipientModel: 'Employer',
          text: textMsg
        });
      }
    } catch (notifError) {
      console.error('Error creating employer notification from lead update:', notifError);
    }

    res.json({
      message: 'Outreach log successfully recorded in database.',
      lead: {
        _id: application._id,
        status: application.recruiterStatus,
        notes: application.recruiterNotes,
        callTime: application.callTime
      }
    });
  } catch (error) {
    console.error('Error updating lead call log:', error);
    res.status(500).json({ message: 'Server error while updating call logs.' });
  }
};

// @desc    Seed mock leads dynamically from existing Candidates & Jobs
// @route   GET /api/recruiters/leads/seed
// @access  Public
const seedDefaultLeads = async (req, res) => {
  try {
    const appCount = await Application.countDocuments({});
    if (appCount > 0) {
      return res.json({ message: 'Leads (applications) already exist. Dynamic seeding skipped.', count: appCount });
    }

    // Fetch existing candidates & jobs to construct real connections
    const candidates = await JobSeeker.find({}).limit(5);
    const jobs = await Job.find({}).limit(5);

    if (candidates.length === 0 || jobs.length === 0) {
      return res.status(400).json({ 
        message: 'No candidates or jobs found in database to link. Please run seedJobs.js first.' 
      });
    }

    const createdApps = [];

    // Create real links instead of hardcoding fake candidate entries!
    for (let i = 0; i < Math.min(candidates.length, jobs.length); i++) {
      const candidate = candidates[i];
      const job = jobs[i];
      
      const app = await Application.create({
        jobId: job._id,
        jobSeekerId: candidate._id,
        employerId: job.employer,
        status: 'Applied',
        recruiterStatus: i % 2 === 0 ? 'Interested' : 'Callback',
        recruiterNotes: i % 2 === 0 ? 'Speaks well, eager to start.' : 'Requested follow-up call tomorrow.',
        callTime: i % 2 === 0 ? '10:45 AM' : '02:15 PM'
      });
      createdApps.push(app);
    }

    res.status(201).json({
      message: 'Successfully constructed dynamic candidate leads from real DB records!',
      count: createdApps.length
    });
  } catch (error) {
    console.error('Dynamic seeding failed:', error);
    res.status(500).json({ message: 'Server error during dynamic seeding.' });
  }
};

module.exports = {
  getLeads,
  createLead,
  updateLead,
  seedDefaultLeads
};
