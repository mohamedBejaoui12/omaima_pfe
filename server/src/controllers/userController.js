const pool = require('../config/database');

const getUserInfo = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT cin, nom, poste, experience, disponibilitee, email, num_tele, role, imageUrl FROM users WHERE cin = ?', 
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
};

module.exports = { getUserInfo };