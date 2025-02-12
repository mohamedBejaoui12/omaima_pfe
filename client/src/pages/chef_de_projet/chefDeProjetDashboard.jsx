// c:\Users\USER\Desktop\omaima_pfe\client\src\pages\chef_de_projet\chefDeProjetDashboard.jsx
import React from 'react';
import { Typography, Container, Box, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function ChefDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cin } = location.state || {};

  const handleLogout = () => {
    try {
      // Remove all authentication-related cookies
      Cookies.remove('token');
      Cookies.remove('user');
  
      // Clear any other potential cookies
      const allCookies = Cookies.get();
      Object.keys(allCookies).forEach(cookieName => {
        if (cookieName.includes('auth') || cookieName.includes('token')) {
          Cookies.remove(cookieName);
        }
      });
  
      // Show success message
      message.success('Logged out successfully');
  
      // Redirect to login page
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      message.error('Failed to log out');
    }
  };
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Project Manager Dashboard
        </Typography>
        <Typography variant="body1">
          Welcome, Project Manager! Your CIN: {cin}
        </Typography>
        
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

export default ChefDashboard;