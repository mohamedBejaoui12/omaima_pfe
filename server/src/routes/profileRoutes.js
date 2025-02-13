const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const { updateProfile } = require('../controllers/profileController');

// Route for updating profile with optional image upload
router.put('/update', authenticateToken, uploadMiddleware, updateProfile);

module.exports = router;
