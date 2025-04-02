const express = require('express');
const router = express.Router();
const projectManagerController = require('../controllers/projectManagerController');
const authenticateToken = require('../middlewares/authenticateToken');

// Project member management routes
router.post('/suggest-members', authenticateToken, projectManagerController.suggestProjectMembers);
router.post('/assign-project-member', authenticateToken, projectManagerController.assignProjectMember);
router.post('/remove-project-member', authenticateToken, projectManagerController.removeAssignedMember);
router.get('/all-users', authenticateToken, projectManagerController.getAllUsers);
router.post('/members', authenticateToken, projectManagerController.getProjectMembers);

// Project management routes
if (projectManagerController.getProjectManagerProjects) {
  router.get('/projects', authenticateToken, projectManagerController.getProjectManagerProjects);
}

// Add this new route to get specific project details
router.get('/projects/:id', authenticateToken, async (req, res) => {
  const db = require('../config/database');
  let connection;
  
  try {
    connection = await db.getConnection();
    const [project] = await connection.query(
      `SELECT p.* 
       FROM projets p 
       INNER JOIN projetmanagers pm ON p.id = pm.projet_id 
       WHERE p.id = ? AND pm.manager_cin = ?`,
      [req.params.id, req.user.cin]
    );

    if (project.length === 0) {
      return res.status(404).json({ message: 'Projet non trouvé ou non autorisé' });
    }

    res.json(project[0]);
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des détails du projet' });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;