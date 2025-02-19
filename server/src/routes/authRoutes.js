const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middlewares/authenticateToken');

router.post('/login', authController.login);

// Add token verification endpoint
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Token is valid',
    user: req.user 
  });
});

module.exports = router;