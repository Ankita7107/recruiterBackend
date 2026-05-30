const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Prevent response caching for all API calls
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

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

const resumeRoutes = require('./routes/resumeRoutes');
app.use('/api/resumes', resumeRoutes);

const aboutRoutes = require('./routes/aboutRoutes');
app.use('/api/about', aboutRoutes);

const servicesRoutes = require('./routes/servicesRoutes');
app.use('/api/services', servicesRoutes);

const pricingRoutes = require('./routes/pricingRoutes');
app.use('/api/pricing', pricingRoutes);

console.log("Checking URI:", process.env.MONGODB_URI ? "✅ Found" : "❌ NOT FOUND");

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected (recruiterdb) Successfully!");
    
    // Automatically seed recruiter leads from actual database candidates & jobs if empty
    try {
      const Application = require('./models/Application');
      const JobSeeker = require('./models/JobSeeker');
      const Job = require('./models/Job');
      
      const count = await Application.countDocuments({});
      if (count === 0) {
        console.log("🌱 Database holds no candidate applications. Constructing dynamic recruiter leads...");
        const candidates = await JobSeeker.find({}).limit(5);
        const jobs = await Job.find({}).limit(5);
        
        if (candidates.length > 0 && jobs.length > 0) {
          const createdApps = [];
          for (let i = 0; i < Math.min(candidates.length, jobs.length); i++) {
            const candidate = candidates[i];
            const job = jobs[i];
            const app = await Application.create({
              jobId: job._id,
              jobSeekerId: candidate._id,
              employerId: job.employer,
              status: 'Applied',
              recruiterStatus: i % 2 === 0 ? 'Interested' : 'Callback',
              recruiterNotes: i % 2 === 0 ? 'Verified profile. Active candidate.' : 'Wants to callback after 5 PM.',
              callTime: i % 2 === 0 ? '11:15 AM' : '03:45 PM'
            });
            createdApps.push(app);
          }
          console.log(`✅ Successfully seeded ${createdApps.length} dynamic applications (leads) for the recruiter dashboard!`);
        } else {
          console.log("⚠️ No candidates or jobs found in database to link. Please seed candidates/jobs first.");
        }
      } else {
        console.log(`📊 recruiterdb already contains ${count} dynamic applications. Skipping auto-link.`);
      }
    } catch (err) {
      console.error("❌ Recruiter auto-linking failed:", err);
    }
  })
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
