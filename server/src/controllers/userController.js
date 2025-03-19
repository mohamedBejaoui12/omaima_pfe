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

const getMemberProjects = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const memberCIN = req.user.cin;
    
    const [projects] = await connection.query(`
      SELECT DISTINCT p.* 
      FROM projets p 
      INNER JOIN projet_users pu ON p.id = pu.projet_id 
      WHERE pu.user_cin = ?
    `, [memberCIN]);

    res.status(200).json(projects);
  } catch (error) {
    console.error('Get Projects Error:', error);
    res.status(500).json({
      message: 'Failed to fetch projects',
      error: process.env.NODE_ENV !== 'production' ? error.message : 'Internal Server Error'
    });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = { 
  getUserInfo,
  getMemberProjects
};