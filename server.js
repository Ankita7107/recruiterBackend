const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files (resumes, etc.) as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const jobSeekerRoutes = require('./routes/jobSeekerRoutes');
app.use('/api/jobseekers', jobSeekerRoutes);

const recruiterRoutes = require('./routes/recruiterRoutes');
app.use('/api/recruiters', recruiterRoutes);

const employerRoutes = require('./routes/employerRoutes');
app.use('/api/employers', employerRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admins', adminRoutes);

const faqRoutes = require('./routes/faqRoutes');
app.use('/api/faqs', faqRoutes);

const jobRoutes = require('./routes/jobRoutes');
app.use('/api/jobs', jobRoutes);

const applicationRoutes = require('./routes/applicationRoutes');
app.use('/api/applications', applicationRoutes);

const masterDataRoutes = require('./routes/masterDataRoutes');
app.use('/api/master', masterDataRoutes);

const enquiryRoutes = require('./routes/enquiryRoutes');
app.use('/api/enquiries', enquiryRoutes);

console.log("Checking URI:", process.env.MONGODB_URI ? "✅ Found" : "❌ NOT FOUND");

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected (recruiterdb) Successfully!"))
  .catch(err => {
    console.error("❌ MongoDB Connection Error:");
    console.error(err);
  });

// Basic Test Route
app.get('/', (req, res) => {
  res.send("Recruiter Backend is Running!");
});

// Port Configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
