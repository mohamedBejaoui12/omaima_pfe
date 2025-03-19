const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authenticateToken = require('../middlewares/authenticateToken');

// All routes require authentication
router.use(authenticateToken);

// Member routes
router.post('/create', ticketController.createTicket);
router.get('/user', ticketController.getUserTickets);
router.get('/:ticketId', ticketController.getTicketDetails);
router.post('/:ticketId/respond', ticketController.addResponse);
router.put('/:ticketId/status', ticketController.updateTicketStatus);

// Admin routes
router.get('/admin/all', ticketController.getAllTickets);

module.exports = router;