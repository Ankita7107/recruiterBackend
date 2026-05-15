const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

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
