const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const userController = require('../controllers/userController');

router.get('/user-info', authenticateToken, userController.getUserInfo);
router.get('/my-projects', authenticateToken, userController.getMemberProjects);

module.exports = router;