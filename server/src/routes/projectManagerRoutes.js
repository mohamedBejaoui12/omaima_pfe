const express = require('express');
const router = express.Router();
const projectManagerController = require('../controllers/projectManagerController');
const authenticateToken = require('../middlewares/authenticateToken');

// Remove any undefined routes
router.post('/suggest-members', authenticateToken, projectManagerController.suggestProjectMembers);
// Remove the duplicate line
router.post('/assign-project-member', authenticateToken, projectManagerController.assignProjectMember);router.get('/all-users', authenticateToken, projectManagerController.getAllUsers);
// Remove the duplicate line
// Only include routes with defined controller methods
if (projectManagerController.getProjectManagerProjects) {
  router.get('/projects', authenticateToken, projectManagerController.getProjectManagerProjects);
}

module.exports = router;