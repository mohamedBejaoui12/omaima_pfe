const pool = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

// Upload or update CV
const uploadCV = async (req, res) => {
  console.log('CV upload request received:', {
    user: req.user,
    file: req.file
  });

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No CV file uploaded'
    });
  }

  const { cin } = req.user;
  
  try {
    // Generate the URL path for the CV
    const cvUrl = `/uploads/cvs/${req.file.filename}`;
    console.log('New CV URL:', cvUrl);

    // Check if user already has a CV
    const [existingCV] = await pool.execute(
      'SELECT * FROM member_cv WHERE user_cin = ?',
      [cin]
    );

    if (existingCV.length > 0) {
      // User already has a CV, update it
      console.log('Updating existing CV for user:', cin);
      
      // Delete old CV file if it exists
      if (existingCV[0].cv_url) {
        const oldCVPath = path.join(__dirname, '../../', existingCV[0].cv_url);
        console.log('Attempting to delete old CV:', oldCVPath);
        try {
          await fs.unlink(oldCVPath);
          console.log('Successfully deleted old CV');
        } catch (error) {
          console.error('Error deleting old CV:', error);
          // Continue with update even if delete fails
        }
      }

      // Update CV URL in database
      await pool.execute(
        'UPDATE member_cv SET cv_url = ?, uploaded_at = CURRENT_TIMESTAMP WHERE user_cin = ?',
        [cvUrl, cin]
      );

      return res.json({
        success: true,
        message: 'CV updated successfully',
        cv: {
          cv_url: cvUrl,
          uploaded_at: new Date()
        }
      });
    } else {
      // User doesn't have a CV yet, insert new record
      console.log('Adding new CV for user:', cin);
      await pool.execute(
        'INSERT INTO member_cv (user_cin, cv_url) VALUES (?, ?)',
        [cin, cvUrl]
      );

      return res.json({
        success: true,
        message: 'CV uploaded successfully',
        cv: {
          cv_url: cvUrl,
          uploaded_at: new Date()
        }
      });
    }
  } catch (error) {
    console.error('CV upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading CV',
      error: error.message
    });
  }
};

// Get user CV
const getUserCV = async (req, res) => {
  const { cin } = req.user;

  try {
    const [cv] = await pool.execute(
      'SELECT * FROM member_cv WHERE user_cin = ?',
      [cin]
    );

    if (cv.length === 0) {
      return res.json({
        success: true,
        hasCV: false,
        message: 'No CV found for this user'
      });
    }

    res.json({
      success: true,
      hasCV: true,
      cv: cv[0]
    });
  } catch (error) {
    console.error('Error fetching user CV:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching CV'
    });
  }
};

// Delete user CV
const deleteUserCV = async (req, res) => {
  const { cin } = req.user;

  try {
    // Get CV info first
    const [cv] = await pool.execute(
      'SELECT * FROM member_cv WHERE user_cin = ?',
      [cin]
    );

    if (cv.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No CV found for this user'
      });
    }

    // Delete CV file
    if (cv[0].cv_url) {
      const cvPath = path.join(__dirname, '../../', cv[0].cv_url);
      console.log('Attempting to delete CV file:', cvPath);
      try {
        await fs.unlink(cvPath);
        console.log('Successfully deleted CV file');
      } catch (error) {
        console.error('Error deleting CV file:', error);
        // Continue with database deletion even if file delete fails
      }
    }

    // Delete from database
    await pool.execute(
      'DELETE FROM member_cv WHERE user_cin = ?',
      [cin]
    );

    res.json({
      success: true,
      message: 'CV deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user CV:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting CV'
    });
  }
};

module.exports = {
  uploadCV,
  getUserCV,
  deleteUserCV
};