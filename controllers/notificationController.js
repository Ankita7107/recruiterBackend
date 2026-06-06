const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    // Determine the role model string
    let recipientModel = '';
    if (req.user.role === 'admin') recipientModel = 'Admin';
    else if (req.user.role === 'employer') recipientModel = 'Employer';
    else if (req.user.role === 'jobseeker') recipientModel = 'JobSeeker';
    else if (req.user.role === 'recruiter') recipientModel = 'Recruiter';

    const notifications = await Notification.find({
      recipient: req.user._id,
      recipientModel
    }).sort({ createdAt: -1 });

    res.json({ notifications });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({ message: 'Server error while fetching notifications.' });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    notification.read = true;
    await notification.save();

    res.json({ message: 'Notification marked as read.', notification });
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(500).json({ message: 'Server error while updating notification.' });
  }
};

// @desc    Mark all user notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    let recipientModel = '';
    if (req.user.role === 'admin') recipientModel = 'Admin';
    else if (req.user.role === 'employer') recipientModel = 'Employer';
    else if (req.user.role === 'jobseeker') recipientModel = 'JobSeeker';
    else if (req.user.role === 'recruiter') recipientModel = 'Recruiter';

    await Notification.updateMany(
      { recipient: req.user._id, recipientModel, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    res.status(500).json({ message: 'Server error while updating notifications.' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
