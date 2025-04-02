const db = require('../config/database');

// Get all competences
const getAllCompetences = async (req, res) => {
  try {
    const [competences] = await db.query('SELECT * FROM competences');
    res.json(competences);
  } catch (error) {
    console.error('Error fetching competences:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch competences',
      error: error.message 
    });
  }
};

// Add new competence
const addCompetence = async (req, res) => {
  const { nom_competence } = req.body;
  console.log('Adding competence:', { nom_competence });

  try {
    if (!nom_competence) {
      return res.status(400).json({
        success: false,
        message: 'Competence name is required'
      });
    }

    const [result] = await db.query(
      'INSERT INTO competences (nom_competence) VALUES (?)',
      [nom_competence]
    );

    console.log('Insert result:', result);

    if (result.affectedRows === 1) {
      res.json({ 
        success: true, 
        message: 'Competence added successfully',
        competenceId: result.insertId 
      });
    } else {
      console.error('Insert failed:', result);
      throw new Error('Insert failed');
    }
  } catch (error) {
    console.error('Error adding competence:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add competence',
      error: error.message
    });
  }
};

// Update competence
const updateCompetence = async (req, res) => {
  const { id } = req.params;
  const { nom_competence } = req.body;
  console.log('Updating competence:', { id, nom_competence });

  try {
    if (!nom_competence) {
      return res.status(400).json({
        success: false,
        message: 'Competence name is required'
      });
    }

    const [result] = await db.query(
      'UPDATE competences SET nom_competence = ? WHERE id = ?',
      [nom_competence, id]
    );

    console.log('Update result:', result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Competence not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Competence updated successfully' 
    });
  } catch (error) {
    console.error('Error updating competence:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        message: 'A competence with this name already exists' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Failed to update competence',
      error: error.message
    });
  }
};

// Delete competence
const deleteCompetence = async (req, res) => {
  const { id } = req.params;
  console.log('Attempting to delete competence with ID:', id);

  try {
    // Check if the competence exists
    const [competences] = await db.query(
      'SELECT * FROM competences WHERE id = ?',
      [id]
    );

    console.log('Found competences:', competences);

    if (!competences || competences.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Competence not found'
      });
    }

    // Check if the competence is used in any projects
    const [projectResults] = await db.query(
      'SELECT COUNT(*) as count FROM projet_competence WHERE competence_id = ?',
      [id]
    );

    console.log('Project check results:', projectResults);

    if (projectResults[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete this competence as it is assigned to one or more projects'
      });
    }

    // Delete from projet_competence first (if any)
    await db.query(
      'DELETE FROM projet_competence WHERE competence_id = ?',
      [id]
    );

    // Then delete the competence
    const [deleteResult] = await db.query(
      'DELETE FROM competences WHERE id = ?',
      [id]
    );

    console.log('Delete result:', deleteResult);

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Failed to delete competence' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Competence deleted successfully' 
    });
  } catch (error) {
    console.error('Error in deleteCompetence:', error);
    
    // More detailed error response
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting competence',
      error: error.message
    });
  }
};

module.exports = {
  getAllCompetences,
  addCompetence,
  updateCompetence,
  deleteCompetence
};
