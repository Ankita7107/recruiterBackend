const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads/profile-images directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads', 'profile-images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // filename: profile-seekerId-timestamp.ext
    const userId = req.user ? req.user._id : 'public';
    const uniqueName = `profile-${userId}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow image files only (jpg, jpeg, png, gif)
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG, and GIF image files are allowed!'), false);
  }
};

const profileImageUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

module.exports = profileImageUpload;
