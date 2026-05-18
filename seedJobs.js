const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const Job = require('./models/Job');
const Employer = require('./models/Employer');

const MONGODB_URI = process.env.MONGODB_URI;

const jobsToSeed = [
  {
    title: "Senior React Developer",
    category: "Software Development",
    jobType: "Remote",
    experienceLevel: "Senior",
    location: "Bangalore",
    salaryRange: "₹80k - ₹1.2L",
    description: "We are looking for a Senior React Developer with 5+ years of experience building modern dashboard user interfaces with Framer Motion, Tailwind CSS, and TypeScript.",
    skills: ["React", "TypeScript", "Tailwind CSS", "Framer Motion"],
    status: "Pending"
  },
  {
    title: "Sales Executive",
    category: "Sales & Marketing",
    jobType: "Full-time",
    experienceLevel: "Entry Level",
    location: "Mumbai",
    salaryRange: "₹25k - ₹35k",
    description: "Looking for enthusiastic and passionate Sales Executives to join our fast-growing sales team in Mumbai. Excellent communication skills required.",
    skills: ["Communication", "Lead Generation", "Direct Sales"],
    status: "Open"
  },
  {
    title: "HR Manager",
    category: "Human Resources",
    jobType: "Full-time",
    experienceLevel: "Mid-Senior",
    location: "Delhi",
    salaryRange: "₹50k - ₹70k",
    description: "Manage end-to-end recruitment lifecycle and employee onboarding. Experience with modern HRMS tools is highly preferred.",
    skills: ["Onboarding", "Recruiting", "HR Policy"],
    status: "Open"
  },
  {
    title: "PHP Developer",
    category: "Software Development",
    jobType: "Full-time",
    experienceLevel: "Intermediate",
    location: "Pune",
    salaryRange: "₹30k - ₹45k",
    description: "Urgent opening for a PHP Developer to maintain and upgrade legacy CMS platforms. Candidate should be comfortable working with raw Laravel and jQuery.",
    skills: ["PHP", "Laravel", "MySQL", "jQuery"],
    status: "Open"
  },
  {
    title: "Store Manager",
    category: "Retail",
    jobType: "Full-time",
    experienceLevel: "Intermediate",
    location: "Mumbai",
    salaryRange: "₹4L - ₹6L",
    description: "Responsible for managing store inventory, staff rotas, daily sales targets, and positive customer engagement for RetailPro.",
    skills: ["Retail", "Inventory Management", "Leadership"],
    status: "Pending"
  },
  {
    title: "Delivery Partner",
    category: "Logistics",
    jobType: "Part-time",
    experienceLevel: "Entry Level",
    location: "Delhi",
    salaryRange: "₹25k - ₹35k",
    description: "Deliver packages safely across the Delhi NCR region. Flexible working shifts with hourly incentive payouts.",
    skills: ["Driving License", "Navigation", "Punctuality"],
    status: "Pending"
  },
  {
    title: "Math Teacher",
    category: "Education",
    jobType: "Full-time",
    experienceLevel: "Mid-Senior",
    location: "Pune",
    salaryRange: "₹5L - ₹8L",
    description: "Tutor students of Grades 8-10 in Algebra, Geometry, and Trigonometry at EduFirst Academy. B.Ed or equivalent required.",
    skills: ["Teaching", "Mathematics", "Communication"],
    status: "Open"
  }
];

async function seed() {
  try {
    console.log("Connecting to database at:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Database Connected successfully.");

    // 1. Get or Create an Employer
    let employer = await Employer.findOne({});
    if (!employer) {
      console.log("No employer found. Creating a test employer...");
      employer = await Employer.create({
        companyName: "Great Tech Inc",
        firstName: "Rohan",
        lastName: "Patil",
        email: "employer@techcorp.com",
        password: "password123",
        verified: true
      });
      console.log("✅ Test employer created:", employer.email);
    } else {
      console.log("Using existing employer:", employer.companyName || employer.email);
    }

    // 2. Clear old jobs to avoid duplicate clutter
    await Job.deleteMany({});
    console.log("🗑️ Cleared existing jobs.");

    // 3. Insert new jobs
    const finalJobs = jobsToSeed.map(j => ({
      ...j,
      employer: employer._id
    }));

    await Job.insertMany(finalJobs);
    console.log(`🎉 Successfully seeded ${finalJobs.length} jobs with simplified statuses (Open / Pending)!`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
