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
  CircularProgress
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
    proficiencyLevel: 'Beginner'
  });

  // Fetch user competencies
  const fetchCompetencies = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get('http://localhost:5000/profile/competencies', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCompetencies(response.data.competencies);
      }
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch competencies');
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
      toast.error('Competency name cannot be empty');
      return;
    }

    try {
      const token = Cookies.get('token');
      const response = await axios.post('http://localhost:5000/profile/competencies', 
        newCompetency, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCompetencies([...competencies, response.data.competency]);
        setNewCompetency({ name: '', proficiencyLevel: 'Beginner' });
        toast.success('Competency added successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add competency');
    }
  };

  // Delete a competency
  const handleDeleteCompetency = async (competencyName) => {
    try {
      const token = Cookies.get('token');
      const response = await axios.delete(`http://localhost:5000/profile/competencies/${competencyName}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setCompetencies(competencies.filter(comp => comp.competence_name !== competencyName));
        toast.success('Competency removed successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove competency');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Manage Your Competencies
        </Typography>

        {/* Competency Input Section */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="Competency Name"
              value={newCompetency.name}
              onChange={(e) => setNewCompetency(prev => ({ ...prev, name: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Proficiency Level</InputLabel>
              <Select
                value={newCompetency.proficiencyLevel}
                label="Proficiency Level"
                onChange={(e) => setNewCompetency(prev => ({ ...prev, proficiencyLevel: e.target.value }))}
              >
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
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
            >
              Add Competency
            </Button>
          </Grid>
        </Grid>

        {/* Competencies List */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Your Competencies
            </Typography>
            {competencies.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                No competencies added yet.
              </Typography>
            ) : (
              <Grid container spacing={1}>
                {competencies.map((comp) => (
                  <Grid item key={comp.competence_name}>
                    <Chip
                      label={`${comp.competence_name} (${comp.proficiency_level})`}
                      onDelete={() => handleDeleteCompetency(comp.competence_name)}
                      deleteIcon={<DeleteIcon />}
                      color="primary"
                      variant="outlined"
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