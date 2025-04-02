const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || '12345678';

const login = async (req, res) => {
  const { cin, password, role } = req.body;

  // Validate input
  if (!cin || !password || !role) {
    return res.status(400).json({ 
      success: false, 
      message: 'CIN, password, and role are required' 
    });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE cin = ? AND role = ?', 
      [cin, role]
    );

    if (rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found or incorrect role' 
      });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, rows[0].password);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const user = {
      cin: rows[0].cin,
      nom: rows[0].nom,
      role: rows[0].role
    };

    // Ensure the secret is at least 32 characters long
    const token = jwt.sign(user, JWT_SECRET, { 
      expiresIn: '1h',
      algorithm: 'HS256' 
    });

    res.json({ 
      success: true, 
      token,
      user 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

module.exports = { login };