const pool = require('../config/database');

// Create a new ticket
exports.createTicket = async (req, res) => {
  try {
    const { subject, description, priority } = req.body;
    const userCin = req.user.cin;

    if (!subject || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subject and description are required' 
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO tickets (user_cin, subject, description, priority) VALUES (?, ?, ?, ?)',
      [userCin, subject, description, priority || 'medium']
    );

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      ticketId: result.insertId
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during ticket creation' 
    });
  }
};

// Get all tickets for a user
exports.getUserTickets = async (req, res) => {
  try {
    const userCin = req.user.cin;

    const [tickets] = await pool.execute(
      `SELECT t.*, 
        (SELECT COUNT(*) FROM ticket_responses WHERE ticket_id = t.id) as response_count
      FROM tickets t 
      WHERE t.user_cin = ? 
      ORDER BY 
        CASE 
          WHEN t.status = 'pending' THEN 1
          WHEN t.status = 'in_progress' THEN 2
          WHEN t.status = 'resolved' THEN 3
          WHEN t.status = 'closed' THEN 4
        END,
        t.created_at DESC`,
      [userCin]
    );

    res.json({
      success: true,
      tickets
    });
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching tickets' 
    });
  }
};

// Get a specific ticket with responses
exports.getTicketDetails = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userCin = req.user.cin;

    // First check if the ticket exists and belongs to the user or the user is an admin
    const [ticketCheck] = await pool.execute(
      'SELECT * FROM tickets WHERE id = ? AND (user_cin = ? OR ? IN (SELECT cin FROM users WHERE role = "0" OR role = "1"))',
      [ticketId, userCin, userCin]
    );

    if (ticketCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found or you do not have permission to view it'
      });
    }

    // Get ticket details
    const [ticket] = await pool.execute(
      `SELECT t.*, u.nom as user_name
       FROM tickets t
       JOIN users u ON t.user_cin = u.cin
       WHERE t.id = ?`,
      [ticketId]
    );

    // Get responses for the ticket
    const [responses] = await pool.execute(
      `SELECT r.*, u.nom as responder_name, u.role as responder_role
       FROM ticket_responses r
       JOIN users u ON r.responder_cin = u.cin
       WHERE r.ticket_id = ?
       ORDER BY r.created_at ASC`,
      [ticketId]
    );

    res.json({
      success: true,
      ticket: ticket[0],
      responses
    });
  } catch (error) {
    console.error('Get ticket details error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching ticket details' 
    });
  }
};

// Add a response to a ticket
exports.addResponse = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;
    const responderCin = req.user.cin;

    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Response message is required' 
      });
    }

    // Check if the ticket exists and the user has permission
    const [ticketCheck] = await pool.execute(
      'SELECT * FROM tickets WHERE id = ? AND (user_cin = ? OR ? IN (SELECT cin FROM users WHERE role = "0" OR role = "1"))',
      [ticketId, responderCin, responderCin]
    );

    if (ticketCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found or you do not have permission to respond'
      });
    }

    // Add the response
    const [result] = await pool.execute(
      'INSERT INTO ticket_responses (ticket_id, responder_cin, message) VALUES (?, ?, ?)',
      [ticketId, responderCin, message]
    );

    // Update ticket status to in_progress if it was pending and the responder is an admin
    const [userRole] = await pool.execute(
      'SELECT role FROM users WHERE cin = ?',
      [responderCin]
    );

    if (ticketCheck[0].status === 'pending' && (userRole[0].role === '0' || userRole[0].role === '1')) {
      await pool.execute(
        'UPDATE tickets SET status = "in_progress" WHERE id = ?',
        [ticketId]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Response added successfully',
      responseId: result.insertId
    });
  } catch (error) {
    console.error('Add response error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while adding response' 
    });
  }
};

// Update ticket status
exports.updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;
    const userCin = req.user.cin;

    // Validate status
    const validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, in_progress, resolved, closed'
      });
    }

    // Check if user is admin or the ticket owner
    const [userRole] = await pool.execute(
      'SELECT role FROM users WHERE cin = ?',
      [userCin]
    );

    const isAdmin = userRole[0].role === '0' || userRole[0].role === '1';

    // If not admin, check if user is the ticket owner
    if (!isAdmin) {
      const [ticketOwner] = await pool.execute(
        'SELECT user_cin FROM tickets WHERE id = ?',
        [ticketId]
      );

      if (ticketOwner.length === 0 || ticketOwner[0].user_cin !== userCin) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this ticket'
        });
      }

      // Non-admin users can only close their own tickets
      if (status !== 'closed') {
        return res.status(403).json({
          success: false,
          message: 'You can only close your own tickets'
        });
      }
    }

    // Update the ticket status
    await pool.execute(
      'UPDATE tickets SET status = ? WHERE id = ?',
      [status, ticketId]
    );

    res.json({
      success: true,
      message: 'Ticket status updated successfully'
    });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating ticket status' 
    });
  }
};

// Get all tickets (admin only)
exports.getAllTickets = async (req, res) => {
  try {
    const userCin = req.user.cin;
    
    // Check if user is admin
    const [userRole] = await pool.execute(
      'SELECT role FROM users WHERE cin = ?',
      [userCin]
    );

    if (userRole[0].role !== '0' && userRole[0].role !== '1') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const [tickets] = await pool.execute(
      `SELECT t.*, u.nom as user_name, 
        (SELECT COUNT(*) FROM ticket_responses WHERE ticket_id = t.id) as response_count
      FROM tickets t 
      JOIN users u ON t.user_cin = u.cin
      ORDER BY 
        CASE 
          WHEN t.status = 'pending' THEN 1
          WHEN t.status = 'in_progress' THEN 2
          WHEN t.status = 'resolved' THEN 3
          WHEN t.status = 'closed' THEN 4
        END,
        t.created_at DESC`
    );

    res.json({
      success: true,
      tickets
    });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching tickets' 
    });
  }
};