const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// User Management Functions
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

// Project Management Functions
exports.addProject = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { nom_projet, description, competence_ids, delai, budget, statut } = req.body;

    // Validate required fields
    if (!nom_projet || !description || !competence_ids || !delai || !budget || !statut) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate competence_ids is an array and not empty
    if (!Array.isArray(competence_ids) || competence_ids.length === 0) {
      return res.status(400).json({ message: 'At least one competence must be selected' });
    }

    // Insert the project
    const [result] = await connection.query(
      'INSERT INTO Projets (nom_projet, description, delai, budget, statut) VALUES (?, ?, ?, ?, ?)',
      [nom_projet, description, delai, budget, statut]
    );

    const projectId = result.insertId;

    // Insert project-competence relationships one by one to avoid issues with array parameters
    for (const compId of competence_ids) {
      await connection.query(
        'INSERT INTO projet_competence (projet_id, competence_id) VALUES (?, ?)',
        [projectId, parseInt(compId)]
      );
    }

    await connection.commit();

    res.status(201).json({ 
      message: 'Project added successfully',
      projectId: projectId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error adding project:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error adding project',
      error: error.message,
      stack: error.stack 
    });
  } finally {
    connection.release();
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    // Test database connection first
    try {
      await pool.query('SELECT 1');
      console.log('Database connection successful');
    } catch (connError) {
      console.error('Database connection error:', connError);
      return res.status(500).json({ 
        message: 'Database connection error',
        error: connError.message,
        stack: connError.stack 
      });
    }

    // First get all projects
    const [projects] = await pool.query(`
      SELECT * FROM Projets 
      ORDER BY delai ASC
    `);

    console.log('Projects query successful, found:', projects.length, 'projects');

    // Then get competences for each project
    for (let project of projects) {
      const [competences] = await pool.query(`
        SELECT c.id, c.nom_competence
        FROM Competences c
        INNER JOIN projet_competence pc ON c.id = pc.competence_id
        WHERE pc.projet_id = ?
      `, [project.id]);
      
      project.competences = competences;
      console.log(`Found ${competences.length} competences for project ${project.id}`);
    }

    res.json(projects);
  } catch (error) {
    console.error('Error getting projects:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error retrieving projects',
      error: error.message,
      stack: error.stack 
    });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const [project] = await pool.execute(`
      SELECT * 
      FROM Projets 
      WHERE id = ?
    `, [req.params.id]);

    if (project.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Fetch project competences separately
    const [competences] = await pool.execute(`
      SELECT c.* 
      FROM Competences c
      JOIN projet_competence pc ON c.id = pc.competence_id
      WHERE pc.projet_id = ?
    `, [req.params.id]);

    // Attach competences to the project
    const projectWithCompetences = {
      ...project[0],
      competences: competences
    };

    res.json(projectWithCompetences);
  } catch (error) {
    console.error('Get project by id error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error fetching project', 
      error: error.message,
      stack: error.stack 
    });
  }
};

exports.getProjectCompetences = async (req, res) => {
  try {
    const [competences] = await pool.execute(`
      SELECT c.* 
      FROM Competences c
      JOIN ProjetCompetences pc ON c.id = pc.competence_id
      WHERE pc.projet_id = ?
    `, [req.params.id]);

    res.json(competences);
  } catch (error) {
    console.error('Get project competences error:', error);
    res.status(500).json({ message: 'Error fetching project competences' });
  }
};

exports.updateProject = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { nom_projet, description, competence_ids, delai, budget, statut } = req.body;

    // Validate required fields
    if (!nom_projet || !description || !competence_ids || !delai || !budget || !statut) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate competence_ids is an array and not empty
    if (!Array.isArray(competence_ids) || competence_ids.length === 0) {
      return res.status(400).json({ message: 'At least one competence must be selected' });
    }

    // Check if project exists
    const [existingProject] = await connection.query(
      'SELECT id FROM Projets WHERE id = ?',
      [id]
    );

    if (existingProject.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Update project details
    await connection.query(
      'UPDATE Projets SET nom_projet = ?, description = ?, delai = ?, budget = ?, statut = ? WHERE id = ?',
      [nom_projet, description, delai, budget, statut, id]
    );

    // Delete existing competence relationships
    await connection.query('DELETE FROM projet_competence WHERE projet_id = ?', [id]);

    // Insert new competence relationships one by one
    for (const compId of competence_ids) {
      await connection.query(
        'INSERT INTO projet_competence (projet_id, competence_id) VALUES (?, ?)',
        [id, parseInt(compId)]
      );
    }

    await connection.commit();

    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating project:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error updating project',
      error: error.message,
      stack: error.stack 
    });
  } finally {
    connection.release();
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM Projets WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error deleting project',
      error: error.message,
      stack: error.stack 
    });
  }
};

// Project Manager Management Functions
exports.assignProjectManager = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { projet_id, manager_cin } = req.body;

    // Validate input
    if (!projet_id || !manager_cin) {
      return res.status(400).json({ message: 'Project ID and Manager CIN are required' });
    }

    // Check if project exists
    const [projectExists] = await connection.query(
      'SELECT id FROM Projets WHERE id = ?',
      [projet_id]
    );

    if (projectExists.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user exists and is a valid manager
    const [userExists] = await connection.query(
      'SELECT cin, role FROM users WHERE cin = ?',
      [manager_cin]
    );

    if (userExists.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate that the user is a manager (role = "1")
    if (userExists[0].role !== "1") {
      return res.status(400).json({ 
        message: 'Only users with manager role can be assigned as project managers' 
      });
    }

    // Check if the manager is already assigned to another project
    const [existingProjectAssignment] = await connection.query(
      'SELECT projet_id FROM ProjetManagers WHERE manager_cin = ?',
      [manager_cin]
    );

    if (existingProjectAssignment.length > 0) {
      return res.status(400).json({ 
        message: 'This manager is already assigned to another project',
        existingProjectId: existingProjectAssignment[0].projet_id
      });
    }

    // Remove any existing project manager for this project
    await connection.query(
      'DELETE FROM ProjetManagers WHERE projet_id = ?',
      [projet_id]
    );

    // Assign new project manager
    const [result] = await connection.query(
      'INSERT INTO ProjetManagers (projet_id, manager_cin) VALUES (?, ?)',
      [projet_id, manager_cin]
    );

    await connection.commit();

    res.status(201).json({ 
      message: 'Project manager assigned successfully',
      assignmentId: result.insertId 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error assigning project manager:', error);
    res.status(500).json({ 
      message: 'Error assigning project manager',
      error: error.message 
    });
  } finally {
    connection.release();
  }
};

exports.getProjectManager = async (req, res) => {
  try {
    const { projet_id } = req.params;

    const [projectManager] = await pool.execute(`
      SELECT u.*, pm.date_assignation
      FROM ProjetManagers pm
      JOIN users u ON pm.manager_cin = u.cin
      WHERE pm.projet_id = ?
    `, [projet_id]);

    if (projectManager.length === 0) {
      return res.status(404).json({ message: 'No project manager assigned' });
    }

    res.json(projectManager[0]);
  } catch (error) {
    console.error('Error fetching project manager:', error);
    res.status(500).json({ 
      message: 'Error fetching project manager',
      error: error.message 
    });
  }
};

exports.removeProjectManager = async (req, res) => {
  try {
    const { projet_id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM ProjetManagers WHERE projet_id = ?',
      [projet_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No project manager found to remove' });
    }

    res.json({ message: 'Project manager removed successfully' });
  } catch (error) {
    console.error('Error removing project manager:', error);
    res.status(500).json({ 
      message: 'Error removing project manager',
      error: error.message 
    });
  }
};

// Competence Management Functions
exports.addCompetence = async (req, res) => {
  try {
    const { nom_competence } = req.body;

    if (!nom_competence) {
      return res.status(400).json({ 
        success: false,
        message: 'Competence name is required' 
      });
    }

    // Check if competence already exists
    const [existingCompetence] = await pool.execute(
      'SELECT * FROM Competences WHERE nom_competence = ?',
      [nom_competence]
    );

    if (existingCompetence.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Competence already exists' 
      });
    }

    // Insert new competence
    const [result] = await pool.execute(
      'INSERT INTO Competences (nom_competence) VALUES (?)',
      [nom_competence]
    );

    res.status(201).json({
      success: true,
      message: 'Competence added successfully',
      competenceId: result.insertId
    });

  } catch (error) {
    console.error('Add competence error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error adding competence' 
    });
  }
};

exports.getAllCompetences = async (req, res) => {
  try {
    const [competences] = await pool.execute(
      'SELECT * FROM Competences ORDER BY nom_competence ASC'
    );

    res.json(competences);
  } catch (error) {
    console.error('Get all competences error:', error);
    res.status(500).json({ message: 'Error fetching competences' });
  }
};

exports.updateCompetence = async (req, res) => {
  try {
    const { nom_competence } = req.body;
    const competenceId = req.params.id;

    if (!nom_competence) {
      return res.status(400).json({ 
        success: false,
        message: 'Competence name is required' 
      });
    }

    // Check if competence exists
    const [existingCompetence] = await pool.execute(
      'SELECT * FROM Competences WHERE id = ?',
      [competenceId]
    );

    if (existingCompetence.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Competence not found' 
      });
    }

    // Check if new name already exists for another competence
    const [duplicateCompetence] = await pool.execute(
      'SELECT * FROM Competences WHERE nom_competence = ? AND id != ?',
      [nom_competence, competenceId]
    );

    if (duplicateCompetence.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'A competence with this name already exists' 
      });
    }

    // Update competence
    await pool.execute(
      'UPDATE Competences SET nom_competence = ? WHERE id = ?',
      [nom_competence, competenceId]
    );

    res.json({ 
      success: true,
      message: 'Competence updated successfully' 
    });
  } catch (error) {
    console.error('Update competence error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating competence' 
    });
  }
};

exports.deleteCompetence = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const competenceId = req.params.id;

    // Check if competence exists
    const [existingCompetence] = await connection.execute(
      'SELECT * FROM Competences WHERE id = ?',
      [competenceId]
    );

    if (existingCompetence.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false,
        message: 'Competence not found' 
      });
    }

    // Check if competence is being used by any project
    const [relatedProjects] = await connection.execute(
      'SELECT * FROM projet_competence WHERE competence_id = ?',
      [competenceId]
    );

    if (relatedProjects.length > 0) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false,
        message: 'Cannot delete competence as it is being used by one or more projects' 
      });
    }

    // Delete from projet_competence (just in case)
    await connection.execute(
      'DELETE FROM projet_competence WHERE competence_id = ?', 
      [competenceId]
    );

    // Delete competence
    const [deleteResult] = await connection.execute(
      'DELETE FROM Competences WHERE id = ?', 
      [competenceId]
    );

    if (deleteResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(500).json({ 
        success: false,
        message: 'Failed to delete competence' 
      });
    }

    await connection.commit();
    res.json({ 
      success: true,
      message: 'Competence deleted successfully' 
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Delete competence error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting competence',
      error: error.message,
      details: error.stack 
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};