const Enquiry = require('../models/Enquiry');

// @desc    Submit a new contact enquiry (Public)
// @route   POST /api/enquiries
// @access  Public
const createEnquiry = async (req, res) => {
  try {
    const { name, email, mobile, city, type, message } = req.body;

    if (!name || !email || !mobile || !type || !message) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    let resumeUrl = '';
    if (req.file) {
      resumeUrl = `/uploads/resumes/${req.file.filename}`;
    }

    const enquiry = await Enquiry.create({
      name,
      email,
      mobile,
      city,
      type,
      message,
      resumeUrl
    });

    res.status(201).json({
      message: 'Enquiry submitted successfully! We will get back to you soon.',
      enquiry
    });
  } catch (error) {
    console.error('Error in createEnquiry:', error);
    res.status(500).json({ message: 'Server error while submitting enquiry.' });
  }
};

// @desc    Get all enquiries with statistics (Admin only)
// @route   GET /api/admins/enquiries
// @access  Private/Admin
const getEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({}).sort({ createdAt: -1 });

    const newCount = enquiries.filter(e => e.status === 'New').length;
    const resolvedCount = enquiries.filter(e => e.status === 'Resolved').length;
    const totalCount = enquiries.length;

    res.json({
      stats: {
        newCount,
        resolvedCount,
        totalCount
      },
      enquiries
    });
  } catch (error) {
    console.error('Error in getEnquiries:', error);
    res.status(500).json({ message: 'Server error while fetching enquiries.' });
  }
};

// @desc    Resolve an enquiry (Admin only)
// @route   PUT /api/admins/enquiries/:id/resolve
// @access  Private/Admin
const resolveEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found.' });
    }

    enquiry.status = 'Resolved';
    await enquiry.save();

    res.json({ message: 'Enquiry marked as Resolved successfully.', enquiry });
  } catch (error) {
    console.error('Error in resolveEnquiry:', error);
    res.status(500).json({ message: 'Server error while resolving enquiry.' });
  }
};

// @desc    Delete an enquiry (Admin only)
// @route   DELETE /api/admins/enquiries/:id
// @access  Private/Admin
const deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found.' });
    }

    res.json({ message: 'Enquiry deleted successfully.' });
  } catch (error) {
    console.error('Error in deleteEnquiry:', error);
    res.status(500).json({ message: 'Server error while deleting enquiry.' });
  }
};

module.exports = {
  createEnquiry,
  getEnquiries,
  resolveEnquiry,
  deleteEnquiry
};
