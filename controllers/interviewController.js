const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

// @desc    Schedule a new interview
// @route   POST /api/interviews
// @access  Private (Employer only)
const scheduleInterview = async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied. Employers only.' });
    }

    const { applicationId, interviewType, dateTime, duration, link, location, notes } = req.body;

    if (!applicationId || !interviewType || !dateTime) {
      return res.status(400).json({ message: 'Please provide applicationId, interviewType, and dateTime.' });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    if (application.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You do not own this application.' });
    }

    // Check if there is already an active (Scheduled) interview for this application.
    // If yes, we will UPDATE (reschedule) the existing one instead of throwing an error.
    let interview = await Interview.findOne({ 
      applicationId, 
      status: 'Scheduled' 
    });

    if (interview) {
      // Perform Reschedule Update
      interview.interviewType = interviewType;
      interview.dateTime = dateTime;
      interview.duration = duration || '30 mins';
      interview.link = interviewType === 'Online' ? link || '' : '';
      interview.location = interviewType === 'In-Person' ? location || '' : '';
      interview.notes = notes || '';
      await interview.save();

      // Trigger notification for JobSeeker about Rescheduling
      try {
        const job = await Job.findById(application.jobId);
        await Notification.create({
          recipient: application.jobSeekerId,
          recipientModel: 'JobSeeker',
          text: `Your interview for '${job?.title || 'Job'}' has been rescheduled to ${new Date(dateTime).toLocaleString()}.`
        });
      } catch (notifErr) {
        console.error('Notification error:', notifErr);
      }

      return res.status(200).json({ message: 'Interview rescheduled successfully.', interview });
    }

    const newInterview = await Interview.create({
      applicationId,
      jobId: application.jobId,
      jobSeekerId: application.jobSeekerId,
      employerId: req.user._id,
      interviewType,
      dateTime,
      duration: duration || '30 mins',
      link: interviewType === 'Online' ? link || '' : '',
      location: interviewType === 'In-Person' ? location || '' : '',
      notes: notes || ''
    });

    // Automatically update Application status to 'Interview'
    application.status = 'Interview';
    await application.save();

    // Trigger notification for JobSeeker
    try {
      const job = await Job.findById(application.jobId);
      await Notification.create({
        recipient: application.jobSeekerId,
        recipientModel: 'JobSeeker',
        text: `Your interview for '${job?.title || 'Job'}' has been scheduled on ${new Date(dateTime).toLocaleString()}.`
      });
    } catch (notifErr) {
      console.error('Notification error:', notifErr);
    }

    res.status(201).json({ message: 'Interview scheduled successfully.', interview: newInterview });
  } catch (error) {
    console.error('Error scheduling interview:', error);
    res.status(500).json({ message: 'Server error while scheduling interview.' });
  }
};

// @desc    Get logged-in candidate's interviews
// @route   GET /api/interviews/my-interviews
// @access  Private (JobSeeker only)
const getMyInterviews = async (req, res) => {
  try {
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({ message: 'Access denied. Job Seekers only.' });
    }

    const interviews = await Interview.find({ jobSeekerId: req.user._id })
      .populate('jobId', 'title category location company')
      .populate('employerId', 'companyName businessEmail address mobile')
      .sort({ dateTime: 1 });

    res.json({ interviews });
  } catch (error) {
    console.error('Error fetching candidate interviews:', error);
    res.status(500).json({ message: 'Server error while fetching interviews.' });
  }
};

// @desc    Get logged-in employer's scheduled interviews
// @route   GET /api/interviews/employer
// @access  Private (Employer only)
const getEmployerInterviews = async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied. Employers only.' });
    }

    const interviews = await Interview.find({ employerId: req.user._id })
      .populate('jobId', 'title')
      .populate('jobSeekerId', 'firstName lastName email mobile')
      .sort({ dateTime: 1 });

    res.json({ interviews });
  } catch (error) {
    console.error('Error fetching employer interviews:', error);
    res.status(500).json({ message: 'Server error while fetching interviews.' });
  }
};

// @desc    Update interview status
// @route   PUT /api/interviews/:id/status
// @access  Private (Employer/JobSeeker)
const updateInterviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Scheduled', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid interview status.' });
    }

    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found.' });
    }

    // Ensure authorized user
    const userIdStr = req.user._id.toString();
    if (interview.employerId.toString() !== userIdStr && interview.jobSeekerId.toString() !== userIdStr) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    interview.status = status;
    await interview.save();

    // Notify other party
    try {
      const recipientId = req.user.role === 'employer' ? interview.jobSeekerId : interview.employerId;
      const recipientModel = req.user.role === 'employer' ? 'JobSeeker' : 'Employer';
      const userDisplayName = req.user.role === 'employer' ? 'Employer' : `${req.user.firstName} ${req.user.lastName}`;
      
      await Notification.create({
        recipient: recipientId,
        recipientModel,
        text: `The interview status has been updated to '${status}' by ${userDisplayName}.`
      });
    } catch (notifErr) {
      console.error('Notification error:', notifErr);
    }

    res.json({ message: `Interview status updated to '${status}'.`, interview });
  } catch (error) {
    console.error('Error updating interview status:', error);
    res.status(500).json({ message: 'Server error while updating interview status.' });
  }
};

module.exports = {
  scheduleInterview,
  getMyInterviews,
  getEmployerInterviews,
  updateInterviewStatus
};
