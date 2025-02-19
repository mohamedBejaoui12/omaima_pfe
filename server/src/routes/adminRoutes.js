const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middlewares/authenticateToken');
const pool = require('../config/database');

// Middleware to ensure only admin can access these routes
// const adminOnly = (req, res, next) => {
//   console.log('User role:', req.user.role); // Debug log
//   if (req.user.role !== '0') {
//     return res.status(403).json({ message: 'Access denied. Admin only.' });
//   }
//   next();
// };
const adminOnly = (req, res, next) => {
  console.log('User data:', req.user);
  console.log('User role:', req.user?.role);
  
  if (!req.user) {
    return res.status(403).json({ 
      success: false,
      message: 'No user data found in request' 
    });
  }
  
  if (req.user.role === '0' || req.user.role === '1') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Access denied. Admin only.',
      userRole: req.user.role 
    });
  }
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
router.get('/projects/:id/competences',
  authenticateToken,
  adminOnly,
  adminController.getProjectCompetences
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

// Project Manager Routes
router.post('/projects/assign-manager',
  authenticateToken,
  adminOnly,
  adminController.assignProjectManager
);

router.get('/projects/:projet_id/manager',
  authenticateToken,
  adminOnly,
  adminController.getProjectManager
);

router.delete('/projects/:projet_id/manager',
  authenticateToken,
  adminOnly,
  adminController.removeProjectManager
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
// In server/src/routes/adminRoutes.js
router.get('/dashboard-stats', 
  authenticateToken, 
  adminOnly,  
  async (req, res) => {
  try {
    // Get total users count
    const [totalUsersResult] = await pool.query('SELECT COUNT(*) as count FROM users');
    
    // Get total projects count
    const [totalProjectsResult] = await pool.query('SELECT COUNT(*) as count FROM projets');
    
    // Get projects by status
    const [projectsByStatusResult] = await pool.query(`
      SELECT 
        COUNT(CASE WHEN statut = 'en cours' THEN 1 END) as enCours,
        COUNT(CASE WHEN statut = 'annulé' THEN 1 END) as annuler,
        COUNT(CASE WHEN statut = 'terminé' THEN 1 END) as terminer
      FROM projets
    `);

    res.json({
      totalUsers: totalUsersResult[0].count,
      totalProjects: totalProjectsResult[0].count,
      projectStatus: {
        enCours: projectsByStatusResult[0].enCours || 0,
        annuler: projectsByStatusResult[0].annuler || 0,
        terminer: projectsByStatusResult[0].terminer || 0
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message 
    });
  }
});

module.exports = router;