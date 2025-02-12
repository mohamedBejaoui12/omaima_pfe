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

module.exports = router;