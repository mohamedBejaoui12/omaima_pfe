const express = require('express');
const router = express.Router();
const pvController = require('../controllers/pvController');
const authenticateToken = require('../middlewares/authenticateToken');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/pv');
  },
  filename: function (req, file, cb) {
    cb(null, `pv-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

// PV routes
router.post('/upload', authenticateToken, upload.single('pvFile'), pvController.uploadPV);
// Add this route to get PVs for a specific project
router.get('/project/:projectId', authenticateToken, pvController.getProjectPVs);
router.delete('/:pvId', authenticateToken, pvController.deletePV);
// Add download route
router.get('/download/:pvId', authenticateToken, pvController.downloadPV);
// Add direct file access route
router.get('/files/:filename', pvController.getFile);

module.exports = router;