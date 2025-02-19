const express = require('express');
const router = express.Router();
const competenceController = require('../controllers/competenceController');
const authenticateToken = require('../middlewares/authenticateToken');

// Middleware to check if user is admin
const checkAdminRole = (req, res, next) => {
  if (!req.user || req.user.role !== '1') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(checkAdminRole);

// Get all competences
router.get('/competences', competenceController.getAllCompetences);

// Add new competence
router.post('/competences', competenceController.addCompetence);

// Update competence
router.put('/competences/:id', competenceController.updateCompetence);

// Delete competence
router.delete('/competences/:id', competenceController.deleteCompetence);

module.exports = router;
