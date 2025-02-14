// c:\Users\USER\Desktop\omaima_pfe\client\src\pages\membre\membre.jsx
import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Container, 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Button,
  AppBar, 
  Toolbar, 
  IconButton, 
  Avatar, 
  Menu, 
  MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

function MembreDashboard() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = Cookies.get('token');
        const user = Cookies.get('user');
        console.log('Token from cookies:', token);
        console.log('User from cookies:', user);

        if (!token || !user) {
          console.log('No token or user found, redirecting to login');
          navigate('/login');
          return;
        }

        // Parse user data
        const userData = JSON.parse(user);
        if (userData.role !== '2') {
          console.log('Invalid role for membre page:', userData.role);
          navigate('/login');
          return;
        }

        console.log('Making request with token:', `Bearer ${token}`);
        const response = await axios.get('http://localhost:5000/user/user-info', {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });

        console.log('User info response:', response.data);

        if (response.data.success) {
          setUserInfo(response.data.userInfo);
        } else {
          console.error('Failed to fetch user info:', response.data.message);
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching user info:', error.response?.data || error);
        // Only redirect to login for auth errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    navigate('/membre/profile');
  };

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
      // message.success('Logged out successfully');
  
      // Redirect to login page
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // message.error('Failed to log out');
    }
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
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Member Dashboard
          </Typography>
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar 
                alt={userInfo.nom} 
                src={userInfo.imageUrl ? `http://localhost:5000${userInfo.imageUrl}` : undefined}
                sx={{ 
                  width: 40, 
                  height: 40,
                  bgcolor: !userInfo.imageUrl ? 'primary.main' : undefined 
                }}
              >
                {!userInfo.imageUrl && userInfo.nom ? userInfo.nom[0].toUpperCase() : null}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
  
    </Box>
  );
}

export default MembreDashboard;