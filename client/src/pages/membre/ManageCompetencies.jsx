import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Paper,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

function ManageCompetencies() {
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCompetency, setNewCompetency] = useState({
    name: '',
    proficiencyLevel: 'Beginner',
  });

  // Fetch user competencies
  const fetchCompetencies = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get('http://localhost:5000/profile/competencies', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setCompetencies(response.data.competencies);
      }
      setLoading(false);
    } catch (error) {
      toast.error('Échec du chargement des compétences');
      setLoading(false);
    }
  };

  // Fetch competencies on component mount
  useEffect(() => {
    fetchCompetencies();
  }, []);

  // Add a new competency
  const handleAddCompetency = async () => {
    if (!newCompetency.name.trim()) {
      toast.error("Le nom de la compétence ne peut pas être vide");
      return;
    }

    try {
      const token = Cookies.get('token');
      const response = await axios.post(
        'http://localhost:5000/profile/competencies',
        newCompetency,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCompetencies([...competencies, response.data.competency]);
        setNewCompetency({ name: '', proficiencyLevel: 'Beginner' });
        toast.success('Compétence ajoutée avec succès');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Échec de l\'ajout de la compétence');
    }
  };

  // Delete a competency
  const handleDeleteCompetency = async (competencyName) => {
    try {
      const token = Cookies.get('token');
      const response = await axios.delete(`http://localhost:5000/profile/competencies/${competencyName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setCompetencies(competencies.filter((comp) => comp.competence_name !== competencyName));
        toast.success('Compétence supprimée avec succès');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Échec de la suppression de la compétence');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: '16px', background: '#f9fafb' }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', color: '#333' }}>
          Gérer Vos Compétences
        </Typography>

        {/* Competency Input Section */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="Nom de la compétence"
              value={newCompetency.name}
              onChange={(e) =>
                setNewCompetency((prev) => ({ ...prev, name: e.target.value }))
              }
              InputProps={{
                style: { fontSize: '1rem' },
              }}
              InputLabelProps={{
                style: { fontSize: '0.9rem' },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Niveau de maîtrise</InputLabel>
              <Select
                value={newCompetency.proficiencyLevel}
                label="Niveau de maîtrise"
                onChange={(e) =>
                  setNewCompetency((prev) => ({
                    ...prev,
                    proficiencyLevel: e.target.value,
                  }))
                }
                sx={{ fontSize: '1rem' }}
              >
                <MenuItem value="Beginner">Débutant</MenuItem>
                <MenuItem value="Intermediate">Intermédiaire</MenuItem>
                <MenuItem value="Advanced">Avancé</MenuItem>
                <MenuItem value="Expert">Expert</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddCompetency}
              fullWidth
              sx={{
                height: '56px',
                fontWeight: 'bold',
                backgroundColor: '#007bff',
                '&:hover': { backgroundColor: '#0056b3' },
              }}
            >
              Ajouter une compétence
            </Button>
          </Grid>
        </Grid>

        {/* Competencies List */}
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={200}
            sx={{ marginTop: '2rem' }}
          >
            <CircularProgress size={40} thickness={4} />
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
              Vos compétences
            </Typography>
            {competencies.length === 0 ? (
              <Typography variant="body2" color="textSecondary" align="center">
                Aucune compétence n'a été ajoutée pour le moment.
              </Typography>
            ) : (
              <Grid container spacing={2} sx={{ flexWrap: 'wrap' }}>
                {competencies.map((comp) => (
                  <Grid item key={comp.competence_name} sx={{ flexGrow: 1 }}>
                    <Chip
                      label={`${comp.competence_name} (${comp.proficiency_level})`}
                      onDelete={() => handleDeleteCompetency(comp.competence_name)}
                      deleteIcon={<DeleteIcon />}
                      color="primary"
                      variant="outlined"
                      sx={{
                        margin: '0.5rem',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        borderColor: '#007bff',
                        '& .MuiChip-label': { fontSize: '0.9rem' },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default ManageCompetencies;