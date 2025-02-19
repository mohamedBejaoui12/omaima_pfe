import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove cookies
    Cookies.remove('token');
    Cookies.remove('user');
    // Redirect to login
    navigate('/login');
  };

  return (
    <Button 
      variant="contained" 
      color="secondary" 
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
}

export default Logout;