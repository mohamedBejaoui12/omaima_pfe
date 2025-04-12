const db = require('../config/database');
const fs = require('fs');
const path = require('path');

exports.uploadPV = async (req, res) => {
  const { projectId, description } = req.body;
  const file = req.file;
  let connection;

  try {
    if (!file) {
      return res.status(400).json({ message: 'Aucun fichier n\'a été téléchargé' });
    }

    connection = await db.getConnection();

    // Verify if project exists and user is authorized
    const [project] = await connection.query(
      'SELECT p.* FROM projets p INNER JOIN projetmanagers pm ON p.id = pm.projet_id WHERE p.id = ? AND pm.manager_cin = ?',
      [projectId, req.user.cin]
    );

    if (project.length === 0) {
      fs.unlinkSync(file.path); // Delete uploaded file
      return res.status(403).json({ message: 'Non autorisé ou projet non trouvé' });
    }

    // Save PV information to database
    const [result] = await connection.query(
      'INSERT INTO project_pv (projet_id, file_name, file_path, description) VALUES (?, ?, ?, ?)',
      [projectId, file.originalname, file.path, description]
    );

    res.status(201).json({
      message: 'PV uploadé avec succès',
      pv: {
        id: result.insertId,
        fileName: file.originalname,
        filePath: file.path,
        uploadDate: new Date(),
        description
      }
    });
  } catch (error) {
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path); // Delete uploaded file if error occurs
    }
    console.error('Upload PV Error:', error);
    res.status(500).json({ message: 'Erreur lors de l\'upload du PV' });
  } finally {
    if (connection) connection.release();
  }
};

exports.getProjectPVs = async (req, res) => {
  const { projectId } = req.params;
  let connection;

  try {
    connection = await db.getConnection();

    // Verify if user is authorized to view this project's PVs
    const [project] = await connection.query(
      'SELECT p.* FROM projets p INNER JOIN projetmanagers pm ON p.id = pm.projet_id WHERE p.id = ? AND pm.manager_cin = ?',
      [projectId, req.user.cin]
    );

    if (project.length === 0) {
      return res.status(403).json({ message: 'Non autorisé ou projet non trouvé' });
    }

    // Get all PVs for the project
    const [pvs] = await connection.query(
      'SELECT * FROM project_pv WHERE projet_id = ? ORDER BY upload_date DESC',
      [projectId]
    );

    res.status(200).json(pvs);
  } catch (error) {
    console.error('Get Project PVs Error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des PVs' });
  } finally {
    if (connection) connection.release();
  }
};

exports.deletePV = async (req, res) => {
  const { pvId } = req.params;
  let connection;

  try {
    connection = await db.getConnection();

    // Get PV details first
    const [pv] = await connection.query('SELECT * FROM project_pv WHERE id = ?', [pvId]);
    
    if (pv.length === 0) {
      return res.status(404).json({ message: 'PV non trouvé' });
    }

    // Delete file from filesystem
    if (fs.existsSync(pv[0].file_path)) {
      fs.unlinkSync(pv[0].file_path);
    }

    // Delete record from database
    await connection.query('DELETE FROM project_pv WHERE id = ?', [pvId]);

    res.status(200).json({ message: 'PV supprimé avec succès' });
  } catch (error) {
    console.error('Delete PV Error:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du PV' });
  } finally {
    if (connection) connection.release();
  }
};

// Add new download controller method
exports.downloadPV = async (req, res) => {
  const { pvId } = req.params;
  let connection;

  try {
    connection = await db.getConnection();

    // Get PV details
    const [pv] = await connection.query('SELECT * FROM project_pv WHERE id = ?', [pvId]);
    
    if (pv.length === 0) {
      return res.status(404).json({ message: 'PV non trouvé' });
    }

    const pvRecord = pv[0];
    
    // Check if file exists
    const filePath = pvRecord.file_path;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Fichier non trouvé sur le serveur' });
    }

    // Send file
    res.download(filePath, pvRecord.file_name, (err) => {
      if (err) {
        console.error('Download error:', err);
        return res.status(500).json({ message: 'Erreur lors du téléchargement du fichier' });
      }
    });
  } catch (error) {
    console.error('Download PV Error:', error);
    res.status(500).json({ message: 'Erreur lors du téléchargement du PV' });
  } finally {
    if (connection) connection.release();
  }
};

// Add direct file access method
exports.getFile = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../../uploads/pv', filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Fichier non trouvé' });
  }
  
  // Send file
  res.sendFile(filePath);
};