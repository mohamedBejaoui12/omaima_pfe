const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || '12345678';

app.use(cors());
app.use(express.json());

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Login route
app.post('/login', async (req, res) => {
  const { cin, password, role } = req.body;

  try {
    // Query to check if user exists with the given CIN, password, and role
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE cin = ? AND password = ? AND role = ?', 
      [cin, password, role]
    );

    if (rows.length > 0) {
      // User found, generate JWT
      const user = {
        cin: rows[0].cin,
        nom: rows[0].nom,
        role: rows[0].role
      };

      const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });

      res.json({ 
        success: true, 
        token,
        user 
      });
    } else {
      // User not found or credentials mismatch
      res.json({ success: false, message: 'Invalid credentials or role' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user info route (protected)
app.get('/user-info', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT cin, nom, poste, experience, disponibilitee, email, num_tele, role FROM users WHERE cin = ?', 
      [req.user.cin]
    );

    if (rows.length > 0) {
      res.json({ success: true, userInfo: rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('User info error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the backend!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});