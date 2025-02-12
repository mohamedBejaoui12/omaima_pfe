import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Box, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel 
} from '@mui/material';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

function Login() {
  const [cin, setCin] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('2'); // Default to membre
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if there's a stored token
    const token = Cookies.get('token');
    const user = Cookies.get('user');

    if (token && user) {
      const parsedUser = JSON.parse(user);
      // Redirect based on stored user role
      switch(parsedUser.role) {
        case '0':
          navigate('/admin', { state: { cin: parsedUser.cin }, replace: true });
          break;
        case '1':
          navigate('/chef-de-projet', { state: { cin: parsedUser.cin }, replace: true });
          break;
        case '2':
          navigate('/membre', { state: { cin: parsedUser.cin }, replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:5000/auth/login', {
        cin,
        password,
        role
      });

      console.log('Full login response:', response.data); // Detailed logging

      if (response.data.success) {
        // Log token details
        console.log('Token:', response.data.token);
        console.log('User:', response.data.user);

        // Store token and user info in cookies
        Cookies.set('token', response.data.token, { 
          expires: 1,  // 1 day expiry
          secure: process.env.NODE_ENV === 'production', // Use secure in production
          sameSite: 'strict' 
        }); 
        Cookies.set('user', JSON.stringify(response.data.user), { 
          expires: 1,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        // Navigate based on role and pass CIN
        // Check if there was a previous location before redirecting
        const from = location.state?.from?.pathname || '/';
        switch(response.data.user.role) {
          case '0':
            navigate('/admin', { 
              state: { 
                cin: response.data.user.cin, 
                from,
                token: response.data.token // Pass token for debugging
              }, 
              replace: true 
            });
            break;
          case '1':
            navigate('/chef-de-projet', { 
              state: { 
                cin: response.data.user.cin, 
                from,
                token: response.data.token 
              }, 
              replace: true 
            });
            break;
          case '2':
            navigate('/membre', { 
              state: { 
                cin: response.data.user.cin, 
                from,
                token: response.data.token 
              }, 
              replace: true 
            });
            break;
          default:
            navigate(from, { replace: true });
        }
      } else {
        // Failed login
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Full login error:', err);
      
      // More detailed error handling
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', err.response.data);
        setError(err.response.data.message || 'Login failed');
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('An error occurred during login');
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box 
        sx={{ 
          marginTop: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}
      >
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="cin"
            label="CIN"
            name="cin"
            autoComplete="cin"
            autoFocus
            value={cin}
            onChange={(e) => setCin(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="0">Administrateur</MenuItem>
              <MenuItem value="1">Chef de Projet</MenuItem>
              <MenuItem value="2">Membre</MenuItem>
            </Select>
          </FormControl>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Login;