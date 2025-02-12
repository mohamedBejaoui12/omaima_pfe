const pool = require('../config/database');
const bcrypt = require('bcryptjs');

exports.addUser = async (req, res) => {
  try {
    const { cin, nom, email, password, role, poste, num_tele } = req.body;

    // Validate input
    if (!cin || !nom || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const [existingUser] = await pool.execute(
      'SELECT * FROM users WHERE cin = ? OR email = ?', 
      [cin, email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User with this CIN or email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await pool.execute(
      'INSERT INTO users (cin, nom, email, password, role, poste, num_tele) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [cin, nom, email, hashedPassword, role, poste || null, num_tele || null]
    );

    res.status(201).json({ message: 'User added successfully' });
  } catch (error) {
    console.error('Add user error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT cin, nom, email, role, poste, num_tele FROM users ORDER BY role, nom'
    );
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { cin } = req.params;
    const { nom, email, role, poste, num_tele } = req.body;

    await pool.execute(
      'UPDATE users SET nom = ?, email = ?, role = ?, poste = ?, num_tele = ? WHERE cin = ?',
      [nom, email, role, poste || null, num_tele || null, cin]
    );

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { cin } = req.params;
    const adminUser = req.user;

    // Basic input validation
    if (!cin) {
      return res.status(400).json({ message: 'User CIN is required' });
    }

    // Prevent deleting own account
    if (adminUser.cin === cin) {
      return res.status(403).json({ message: 'Cannot delete your own account' });
    }

    // Check if user exists
    const [userExists] = await pool.execute(
      'SELECT cin, role FROM users WHERE cin = ?', 
      [cin]
    );

    if (userExists.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting admin accounts
    if (userExists[0].role === '0') {
      return res.status(403).json({ message: 'Cannot delete admin accounts' });
    }

    // Perform deletion
    const [result] = await pool.execute(
      'DELETE FROM users WHERE cin = ?', 
      [cin]
    );

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).json({ message: 'Failed to delete user' });
    }

    res.json({ 
      message: 'User deleted successfully',
      deletedUserCin: cin 
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      message: 'Server error during user deletion',
      error: error.message 
    });
  }
};