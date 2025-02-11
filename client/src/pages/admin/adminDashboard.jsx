// c:\Users\USER\Desktop\omaima_pfe\client\src\pages\admin\adminDashboard.jsx
import React from 'react';
import { Typography, Container, Box, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cin } = location.state || {};

  const handleLogout = () => {
    // Remove cookies
    Cookies.remove('token');
    Cookies.remove('user');
    // Redirect to login
    navigate('/login');
  };

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1">
          Welcome, Administrator! Your CIN: {cin}
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

export default AdminDashboard;