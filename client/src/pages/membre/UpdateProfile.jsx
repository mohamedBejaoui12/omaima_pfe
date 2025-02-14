import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, TextField, Button, CircularProgress, Grid } from '@mui/material';
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
      </Paper>
    </Container>
  );
};

export default UpdateProfile;