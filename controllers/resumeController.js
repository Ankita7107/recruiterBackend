const Resume = require('../models/Resume');

// @desc    Get logged-in candidate's saved resume
// @route   GET /api/resumes
// @access  Private (JobSeeker)
const getResume = async (req, res) => {
  try {
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({ message: 'Access denied. Job Seekers only.' });
    }

    const resume = await Resume.findOne({ jobSeekerId: req.user._id });
    
    // Return the resume if found, otherwise return null without throwing error
    res.json({ resume: resume || null });
  } catch (error) {
    console.error('Error in getResume:', error);
    res.status(500).json({ message: 'Server error while fetching resume.' });
  }
};

// @desc    Save/Update logged-in candidate's resume
// @route   POST /api/resumes
// @access  Private (JobSeeker)
const saveResume = async (req, res) => {
  try {
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({ message: 'Access denied. Job Seekers only.' });
    }

    const { templateId, formData } = req.body;

    // Check if a resume already exists for this jobseeker
    let resume = await Resume.findOne({ jobSeekerId: req.user._id });

    if (resume) {
      // Update existing
      resume.templateId = templateId || resume.templateId;
      resume.formData = formData || resume.formData;
      await resume.save();
      return res.json({ message: 'Resume updated successfully.', resume });
    }

    // Create new
    resume = await Resume.create({
      jobSeekerId: req.user._id,
      templateId: templateId || 'professional',
      formData: formData || {}
    });

    res.status(201).json({ message: 'Resume created and saved successfully.', resume });
  } catch (error) {
    console.error('Error in saveResume:', error);
    res.status(500).json({ message: 'Server error while saving resume.' });
  }
};

module.exports = {
  getResume,
  saveResume
};
