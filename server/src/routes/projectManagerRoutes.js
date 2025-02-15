const express = require('express');
const router = express.Router();
const projectManagerController = require('../controllers/projectManagerController');
const authenticateToken = require('../middlewares/authenticateToken');

// Remove any undefined routes
router.post('/suggest-members', authenticateToken, projectManagerController.suggestProjectMembers);
router.post('/assign-project-member', authenticateToken, projectManagerController.assignProjectMember);

// Only include routes with defined controller methods
if (projectManagerController.getProjectManagerProjects) {
  router.get('/projects', authenticateToken, projectManagerController.getProjectManagerProjects);
}

module.exports = router;