import React, { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, Box, TextField, Button, 
  CircularProgress, Grid, Select, MenuItem, InputLabel, 
  FormControl, Chip, Stack 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const UpdateProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

  // New state for competencies
  const [competencies, setCompetencies] = useState([]);
  const [newCompetency, setNewCompetency] = useState({
    name: '',
    proficiencyLevel: 'Beginner'
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/user/user-info', {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });

        if (response.data.success) {
          setUserInfo(response.data.userInfo);
          if (response.data.userInfo.imageUrl) {
            const imageUrl = `http://localhost:5000${response.data.userInfo.imageUrl}`;
            console.log('Setting initial image URL:', imageUrl);
            setCurrentImage(imageUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const fetchUserCompetencies = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get('http://localhost:5000/profile/competencies', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setCompetencies(response.data.competencies || []);
      } catch (error) {
        console.error('Error fetching competencies:', error);
      }
    };

    if (userInfo) {
      fetchUserCompetencies();
    }
  }, [userInfo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      console.log('Selected file:', file);
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('File preview generated');
        setPreviewImage(reader.result);
      };
      reader.onerror = () => {
        console.error('Error reading file');
        toast.error('Error reading file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }
    }

    if (!selectedFile && !formData.password) {
      toast.error('No changes to update');
      return;
    }

    setLoading(true);

    try {
      const token = Cookies.get('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const formDataToSend = new FormData();
      
      if (formData.password) {
        formDataToSend.append('password', formData.password);
      }

      if (selectedFile) {
        console.log('Adding image to form data:', selectedFile.name);
        formDataToSend.append('image', selectedFile);
      }

      const response = await axios.put(
        'http://localhost:5000/profile/update',
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        toast.success('Profile updated successfully');
        setFormData({ password: '', confirmPassword: '' });
        if (response.data.user.imageUrl) {
          const newImageUrl = `http://localhost:5000${response.data.user.imageUrl}`;
          setCurrentImage(newImageUrl);
          setPreviewImage(null);
        }
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error updating profile:', error.response || error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompetency = async () => {
    if (!newCompetency.name.trim()) {
      toast.error('Competency name cannot be empty');
      return;
    }

    try {
      const token = Cookies.get('token');
      const response = await axios.post(
        'http://localhost:5000/profile/add-competency', 
        newCompetency, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setCompetencies([...competencies, response.data.competency]);
        setNewCompetency({ name: '', proficiencyLevel: 'Beginner' });
        toast.success('Competency added successfully');
      }
    } catch (error) {
      console.error('Error adding competency:', error);
      toast.error(error.response?.data?.message || 'Failed to add competency');
    }
  };

  const handleDeleteCompetency = async (competencyName) => {
    try {
      const token = Cookies.get('token');
      const response = await axios.delete(
        `http://localhost:5000/profile/delete-competency/${competencyName}`, 
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setCompetencies(competencies.filter(comp => comp.competence_name !== competencyName));
        toast.success('Competency removed successfully');
      }
    } catch (error) {
      console.error('Error deleting competency:', error);
      toast.error(error.response?.data?.message || 'Failed to delete competency');
    }
  };

  if (!userInfo) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Profile Information
        </Typography>
        
        <Grid container spacing={4}>
          {/* Left side - User Information */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Personal Details
              </Typography>
              <TextField
                disabled
                fullWidth
                label="CIN"
                value={userInfo.cin}
                margin="normal"
                InputProps={{ readOnly: true }}
              />
              <TextField
                disabled
                fullWidth
                label="Name"
                value={userInfo.nom}
                margin="normal"
                InputProps={{ readOnly: true }}
              />
              <TextField
                disabled
                fullWidth
                label="Email"
                value={userInfo.email}
                margin="normal"
                InputProps={{ readOnly: true }}
              />
              <TextField
                disabled
                fullWidth
                label="Phone"
                value={userInfo.num_tele || 'Not specified'}
                margin="normal"
                InputProps={{ readOnly: true }}
              />
              <TextField
                disabled
                fullWidth
                label="Position"
                value={userInfo.poste || 'Not specified'}
                margin="normal"
                InputProps={{ readOnly: true }}
              />
              <TextField
                disabled
                fullWidth
                label="Experience"
                value={userInfo.experience || 'Not specified'}
                margin="normal"
                InputProps={{ readOnly: true }}
              />
              <TextField
                disabled
                fullWidth
                label="Availability"
                value={userInfo.disponibilitee ? 'Available' : 'Not Available'}
                margin="normal"
                InputProps={{ readOnly: true }}
              />
            </Box>
          </Grid>

          {/* Right side - Editable Fields */}
          <Grid item xs={12} md={6}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Update Profile Picture
                </Typography>
                <Box 
                  sx={{ 
                    width: 150, 
                    height: 150, 
                    borderRadius: '50%', 
                    overflow: 'hidden',
                    mb: 2,
                    border: '2px solid #ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  {previewImage || currentImage ? (
                    <img 
                      src= {previewImage || currentImage}
                      alt="Profile" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        display: 'block'
                      }} 
                      onError={(e) => {
                        console.error('Error loading image:', e);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Typography color="textSecondary">No Image</Typography>
                  )}
                </Box>
                <Button
                  variant="contained"
                  component="label"
                  sx={{ mb: 2 }}
                >
                  Choose Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>

                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                  Change Password
                </Typography>
                <TextField
                  fullWidth
                  type="password"
                  label="New Password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  type="password"
                  label="Confirm New Password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  margin="normal"
                />

                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Update Profile'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/membre')}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </form>
          </Grid>
        </Grid>

        {/* Competency Management Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Manage Competencies
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Competency Name"
                value={newCompetency.name}
                onChange={(e) => setNewCompetency(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={4}>
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
            <Grid item xs={2}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleAddCompetency}
              >
                Add Competency
              </Button>
            </Grid>
          </Grid>

          {/* Competencies List */}
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={1}>
              {competencies.map((comp) => (
                <Grid item key={comp.competence_name}>
                  <Chip
                    label={`${comp.competence_name} (${comp.proficiency_level})`}
                    onDelete={() => handleDeleteCompetency(comp.competence_name)}
                    deleteIcon={<DeleteIcon />}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default UpdateProfile;