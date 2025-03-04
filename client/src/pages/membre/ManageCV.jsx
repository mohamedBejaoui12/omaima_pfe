import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { styled } from '@mui/material/styles';
// Styled component for file input
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

function ManageCV() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [cvData, setCvData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Fetch user CV data
  const fetchCVData = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get('http://localhost:5000/cv', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setCvData(response.data.hasCV ? response.data.cv : null);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching CV data:', error);
      toast.error('Échec du chargement des données du CV');
      setLoading(false);
    }
  };

  // Fetch CV data on component mount
  useEffect(() => {
    fetchCVData();
  }, []);

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Seuls les fichiers PDF sont acceptés');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('La taille du fichier doit être inférieure à 10 Mo');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  // Handle CV upload
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un fichier PDF');
      return;
    }

    setUploading(true);
    try {
      const token = Cookies.get('token');
      const formData = new FormData();
      formData.append('cv', selectedFile);

      const response = await axios.post('http://localhost:5000/cv/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('CV téléchargé avec succès');
        setCvData(response.data.cv);
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error uploading CV:', error);
      toast.error(error.response?.data?.message || 'Échec du téléchargement du CV');
    } finally {
      setUploading(false);
    }
  };

  // Handle CV deletion
  const handleDeleteCV = async () => {
    setOpenDeleteDialog(false);
    setLoading(true);
    try {
      const token = Cookies.get('token');
      const response = await axios.delete('http://localhost:5000/cv', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success('CV supprimé avec succès');
        setCvData(null);
      }
    } catch (error) {
      console.error('Error deleting CV:', error);
      toast.error(error.response?.data?.message || 'Échec de la suppression du CV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: '16px', background: '#f9fafb' }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', color: '#333' }}>
          Gérer Votre CV
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress size={40} thickness={4} />
          </Box>
        ) : (
          <Box>
            {/* Current CV Status */}
            <Box mb={4} p={3} bgcolor="#f0f7ff" borderRadius={2}>
              <Typography variant="h6" gutterBottom sx={{ color: '#0057b7' }}>
                Statut actuel du CV
              </Typography>
              
              {cvData ? (
                <Box>
                  <Alert 
                    severity="info" 
                    sx={{ mb: 2 }}
                    action={
                      <Button 
                        color="error" 
                        size="small" 
                        startIcon={<DeleteIcon />}
                        onClick={() => setOpenDeleteDialog(true)}
                      >
                        Supprimer
                      </Button>
                    }
                  >
                    Vous avez déjà téléchargé un CV le {new Date(cvData.uploaded_at).toLocaleDateString()}
                  </Alert>
                  
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<PictureAsPdfIcon />}
                    href={`http://localhost:5000${cvData.cv_url}`}
                    target="_blank"
                    sx={{ mt: 1 }}
                  >
                    Voir votre CV
                  </Button>
                </Box>
              ) : (
                <Alert severity="warning">
                  Vous n'avez pas encore téléchargé de CV. Téléchargez votre CV pour améliorer votre profil.
                </Alert>
              )}
            </Box>

            {/* Upload Section */}
            <Box mt={4} textAlign="center">
              <Typography variant="h6" gutterBottom>
                {cvData ? 'Mettre à jour votre CV' : 'Télécharger votre CV'}
              </Typography>
              
              <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mb: 2 }}
                  disabled={uploading}
                >
                  Sélectionner un fichier PDF
                  <VisuallyHiddenInput type="file" accept="application/pdf" onChange={handleFileChange} />
                </Button>
                
                {selectedFile && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Fichier sélectionné: {selectedFile.name}
                  </Typography>
                )}
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  sx={{ minWidth: 200 }}
                >
                  {uploading ? <CircularProgress size={24} color="inherit" /> : 'Télécharger'}
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer votre CV ? Cette action ne peut pas être annulée.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Annuler
          </Button>
          <Button onClick={handleDeleteCV} color="error" autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ManageCV;
    