const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
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
          token: generateToken(admin._id)
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

module.exports = {
  registerAdmin,
  loginAdmin
};
