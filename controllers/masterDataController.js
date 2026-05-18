const Category = require('../models/Category');
const City = require('../models/City');
const JobType = require('../models/JobType');

// ================= CATEGORIES =================

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addCategory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Category already exists' });

    const category = await Category.create({ name });
    res.status(201).json({ message: 'Category added', category });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const editCategory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const exists = await Category.findOne({ name, _id: { $ne: id } });
    if (exists) return res.status(400).json({ message: 'Another category with this name already exists' });

    const category = await Category.findByIdAndUpdate(id, { name }, { new: true });
    res.json({ message: 'Category updated', category });
  } catch (error) {
    console.error('Error editing category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= CITIES =================

const getCities = async (req, res) => {
  try {
    const cities = await City.find().sort({ name: 1 });
    res.json({ cities });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addCity = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const exists = await City.findOne({ name });
    if (exists) return res.status(400).json({ message: 'City already exists' });

    const city = await City.create({ name });
    res.status(201).json({ message: 'City added', city });
  } catch (error) {
    console.error('Error adding city:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const editCity = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const exists = await City.findOne({ name, _id: { $ne: id } });
    if (exists) return res.status(400).json({ message: 'Another city with this name already exists' });

    const city = await City.findByIdAndUpdate(id, { name }, { new: true });
    res.json({ message: 'City updated', city });
  } catch (error) {
    console.error('Error editing city:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCity = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
    const { id } = req.params;
    await City.findByIdAndDelete(id);
    res.json({ message: 'City deleted successfully' });
  } catch (error) {
    console.error('Error deleting city:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= JOB TYPES =================

const getJobTypes = async (req, res) => {
  try {
    const jobTypes = await JobType.find().sort({ name: 1 });
    res.json({ jobTypes });
  } catch (error) {
    console.error('Error fetching job types:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addJobType = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const exists = await JobType.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Job Type already exists' });

    const jobType = await JobType.create({ name });
    res.status(201).json({ message: 'Job Type added', jobType });
  } catch (error) {
    console.error('Error adding job type:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const editJobType = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const exists = await JobType.findOne({ name, _id: { $ne: id } });
    if (exists) return res.status(400).json({ message: 'Another job type with this name already exists' });

    const jobType = await JobType.findByIdAndUpdate(id, { name }, { new: true });
    res.json({ message: 'Job Type updated', jobType });
  } catch (error) {
    console.error('Error editing job type:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteJobType = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
    const { id } = req.params;
    await JobType.findByIdAndDelete(id);
    res.json({ message: 'Job Type deleted successfully' });
  } catch (error) {
    console.error('Error deleting job type:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCategories,
  addCategory,
  editCategory,
  deleteCategory,
  getCities,
  addCity,
  editCity,
  deleteCity,
  getJobTypes,
  addJobType,
  editJobType,
  deleteJobType
};
