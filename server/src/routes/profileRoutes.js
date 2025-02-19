const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const { 
  updateProfile, 
  getUserCompetencies, 
  addUserCompetency, 
  deleteUserCompetency 
} = require('../controllers/profileController');

// Route for updating profile with optional image upload
router.put('/update', authenticateToken, uploadMiddleware, updateProfile);

// New competency routes
router.get('/competencies', authenticateToken, getUserCompetencies);
router.post('/competencies', authenticateToken, addUserCompetency);
router.delete('/competencies/:competencyName', authenticateToken, deleteUserCompetency);

module.exports = router;
