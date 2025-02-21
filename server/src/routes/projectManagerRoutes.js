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

module.exports = router;