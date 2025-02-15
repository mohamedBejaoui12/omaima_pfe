const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

const updateProfile = async (req, res) => {
  console.log('Update profile request received:', {
    user: req.user,
    file: req.file,
    body: req.body
  });

  const { cin } = req.user;
  const { password } = req.body;

  try {
    let updateFields = [];
    let values = [];

    // Handle password update
    if (password && password.trim() !== '') {
      console.log('Updating password for user:', cin);
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?');
      values.push(hashedPassword);
    }

    // Handle image upload
    if (req.file) {
      console.log('Processing image upload:', req.file);
      
      // Get the old image URL to delete it later
      const [oldImage] = await pool.execute(
        'SELECT imageUrl FROM users WHERE cin = ?',
        [cin]
      );

      console.log('Old image data:', oldImage[0]);

      // Generate the URL path for the image
      const imageUrl = `/uploads/profiles/${req.file.filename}`;
      console.log('New image URL:', imageUrl);
      
      updateFields.push('imageUrl = ?');
      values.push(imageUrl);

      // Delete old image if it exists
      if (oldImage[0]?.imageUrl) {
        const oldImagePath = path.join(__dirname, '../../', oldImage[0].imageUrl);
        console.log('Attempting to delete old image:', oldImagePath);
        try {
          await fs.unlink(oldImagePath);
          console.log('Successfully deleted old image');
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
    }

    // Only proceed if there are fields to update
    if (updateFields.length === 0) {
      console.log('No changes provided for update');
      return res.status(400).json({
        success: false,
        message: 'No changes provided'
      });
    }

    // Add CIN to values array for WHERE clause
    values.push(cin);

    // Execute update query
    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE cin = ?
    `;

    console.log('Executing update query:', {
      query: updateQuery,
      values: values
    });

    const [result] = await pool.execute(updateQuery, values);

    if (result.affectedRows === 0) {
      console.log('No user found with CIN:', cin);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Successfully updated user profile');

    // Fetch updated user data
    const [updatedUser] = await pool.execute(
      'SELECT cin, nom, imageUrl FROM users WHERE cin = ?',
      [cin]
    );

    console.log('Updated user data:', updatedUser[0]);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser[0]
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Get user competencies
const getUserCompetencies = async (req, res) => {
  const { cin } = req.user;

  try {
    const [competencies] = await pool.execute(
      'SELECT competence_name, proficiency_level, created_at FROM user_competencies WHERE user_cin = ?', 
      [cin]
    );

    res.json({
      success: true,
      competencies
    });
  } catch (error) {
    console.error('Error fetching user competencies:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching competencies'
    });
  }
};

// Add a new competency
const addUserCompetency = async (req, res) => {
  const { cin } = req.user;
  const { name, proficiencyLevel } = req.body;

  if (!name || !proficiencyLevel) {
    return res.status(400).json({
      success: false,
      message: 'Competency name and proficiency level are required'
    });
  }

  try {
    // Check if competency already exists for this user
    const [existingCompetency] = await pool.execute(
      'SELECT * FROM user_competencies WHERE user_cin = ? AND competence_name = ?', 
      [cin, name]
    );

    if (existingCompetency.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Competency already exists'
      });
    }

    // Insert new competency
    await pool.execute(
      'INSERT INTO user_competencies (user_cin, competence_name, proficiency_level) VALUES (?, ?, ?)', 
      [cin, name, proficiencyLevel]
    );

    res.json({
      success: true,
      competency: { 
        user_cin: cin, 
        competence_name: name, 
        proficiency_level: proficiencyLevel 
      }
    });
  } catch (error) {
    console.error('Error adding user competency:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding competency'
    });
  }
};

// Delete a competency
const deleteUserCompetency = async (req, res) => {
  const { cin } = req.user;
  const { competencyName } = req.params;

  try {
    const [result] = await pool.execute(
      'DELETE FROM user_competencies WHERE user_cin = ? AND competence_name = ?', 
      [cin, competencyName]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Competency not found'
      });
    }

    res.json({
      success: true,
      message: 'Competency removed successfully'
    });
  } catch (error) {
    console.error('Error deleting user competency:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing competency'
    });
  }
};

module.exports = {
  updateProfile,
  getUserCompetencies,
  addUserCompetency,
  deleteUserCompetency
};