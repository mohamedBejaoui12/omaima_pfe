// c:\Users\USER\Desktop\omaima_pfe\client\src\pages\membre\membre.jsx
import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Container, 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Button 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

function MembreDashboard() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) {
          // Redirect to login if no token
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/user-info', {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });

        if (response.data.success) {
          setUserInfo(response.data.userInfo);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        // Redirect to login on error
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  const handleLogout = () => {
    // Remove cookies
    Cookies.remove('token');
    Cookies.remove('user');
    // Redirect to login
    navigate('/login');
  };

  if (loading) {
    return (
      <Container>
        <Typography variant="h6">Loading...</Typography>
      </Container>
    );
  }

  if (!userInfo) {
    return (
      <Container>
        <Typography variant="h6">No user information found</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Member Dashboard
        </Typography>
        
        <Card sx={{ maxWidth: 600, margin: 'auto', mt: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>CIN:</strong> {userInfo.cin}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Name:</strong> {userInfo.nom}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Position:</strong> {userInfo.poste || 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Experience:</strong> {userInfo.experience || 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Email:</strong> {userInfo.email}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Phone:</strong> {userInfo.num_tele || 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Availability:</strong> {userInfo.disponibilitee ? 'Available' : 'Not Available'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default MembreDashboard;