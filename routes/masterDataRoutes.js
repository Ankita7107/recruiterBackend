const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/masterDataController');

// Public routes for fetching data (needed for Job posting and browsing)
router.get('/categories', getCategories);
router.get('/cities', getCities);
router.get('/job-types', getJobTypes);

// Admin only routes for modifying data
router.post('/categories', protect, adminOnly, addCategory);
router.put('/categories/:id', protect, adminOnly, editCategory);
router.delete('/categories/:id', protect, adminOnly, deleteCategory);

router.post('/cities', protect, adminOnly, addCity);
router.put('/cities/:id', protect, adminOnly, editCity);
router.delete('/cities/:id', protect, adminOnly, deleteCity);

router.post('/job-types', protect, adminOnly, addJobType);
router.put('/job-types/:id', protect, adminOnly, editJobType);
router.delete('/job-types/:id', protect, adminOnly, deleteJobType);

module.exports = router;
