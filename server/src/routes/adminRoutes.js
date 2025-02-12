const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middlewares/authenticateToken');

// Middleware to ensure only admin can access these routes
const adminOnly = (req, res, next) => {
  console.log('User role:', req.user.role); // Debug log
  if (req.user.role !== '0') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// User management routes
router.post('/add-user', 
  authenticateToken, 
  adminOnly, 
  adminController.addUser
);

router.get('/users', 
  authenticateToken, 
  adminOnly, 
  adminController.getAllUsers
);

router.put('/users/:cin', 
  authenticateToken, 
  adminOnly, 
  adminController.updateUser
);

router.delete('/users/:cin', 
  authenticateToken, 
  adminOnly, 
  adminController.deleteUser
);

// Project management routes
router.post('/projects',
  authenticateToken,
  adminOnly,
  adminController.addProject
);

router.get('/projects',
  authenticateToken,
  adminOnly,
  adminController.getAllProjects
);

router.get('/projects/:id',
  authenticateToken,
  adminOnly,
  adminController.getProjectById
);

router.put('/projects/:id',
  authenticateToken,
  adminOnly,
  adminController.updateProject
);

router.delete('/projects/:id',
  authenticateToken,
  adminOnly,
  adminController.deleteProject
);

// Competence management routes
router.post('/competences',
  authenticateToken,
  adminOnly,
  adminController.addCompetence
);

router.get('/competences',
  authenticateToken,
  adminOnly,
  adminController.getAllCompetences
);

router.put('/competences/:id',
  authenticateToken,
  adminOnly,
  adminController.updateCompetence
);

router.delete('/competences/:id',
  authenticateToken,
  adminOnly,
  adminController.deleteCompetence
);

module.exports = router;