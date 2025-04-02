const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const cvUploadMiddleware = require('../middlewares/cvUploadMiddleware');
const { 
  uploadCV, 
  getUserCV, 
  deleteUserCV 
} = require('../controllers/cvController');

// Route for uploading/updating CV
router.post('/upload', authenticateToken, cvUploadMiddleware, uploadCV);

// Route for getting user CV
router.get('/', authenticateToken, getUserCV);

// Route for deleting user CV
router.delete('/', authenticateToken, deleteUserCV);

module.exports = router;