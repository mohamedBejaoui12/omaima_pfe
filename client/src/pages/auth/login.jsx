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
import { styled } from '@mui/system';
import logo from '../../assets/logo.png'; // Import the logo
import backgroundImage from '../../assets/background.jpg'; // Import the background image

const AuthContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Reduced opacity from 0.4 to 0.2
    zIndex: 1
  }
}));

// Update the LogoContainer to ensure it's above the overlay
const LogoContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '20px',
  left: '20px',
  background: 'white',
  padding: '15px',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  zIndex: 2 // Ensure logo is above the overlay
}));

// Update the FormContainer to ensure it's above the overlay
const FormContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  padding: theme.spacing(4),
  borderRadius: '16px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  border: '1px solid #e0e7ff',
  width: '100%',
  maxWidth: '440px',
  transition: 'transform 0.3s ease',
  position: 'relative',
  zIndex: 2, // Ensure form is above the overlay
  '&:hover': {
    transform: 'translateY(-2px)'
  }
}));

const Title = styled(Typography)(({ theme }) => ({
  color: '#1e3a8a',
  fontWeight: '700',
  letterSpacing: '-0.5px',
  marginBottom: theme.spacing(3),
  textAlign: 'center'
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#bfdbfe',
    },
    '&:hover fieldset': {
      borderColor: '#93c5fd',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#3b82f6',
      borderWidth: '2px'
    }
  }
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#1e3a8a',
  color: 'white',
  padding: theme.spacing(1.5),
  borderRadius: '8px',
  fontWeight: '600',
  textTransform: 'none',
  fontSize: '1rem',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#1d4ed8',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)'
  }
}));

function Login() {
  const [cin, setCin] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('2');
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
          navigate('/admin/dashboard', { state: { cin: parsedUser.cin }, replace: true });
          break;
        case '1':
          navigate('/chef-de-projet', { state: { cin: parsedUser.cin }, replace: true });
          break;
        case '2':
          navigate('/member', { state: { cin: parsedUser.cin }, replace: true });
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
            navigate('/admin/dashboard', { 
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
            navigate('/member', { 
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
    <AuthContainer maxWidth={false}>
      {/* Logo added here */}
      <LogoContainer>
        <img 
          src={logo} 
          alt="Company Logo" 
          style={{ 
            width: '200px',  // Increased from 150px to 200px
            height: 'auto',
            objectFit: 'contain'
          }} 
        />
      </LogoContainer>

      <FormContainer>
        <Title variant="h4">
          Connexion
        </Title>

        <Box component="form" onSubmit={handleLogin}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <StyledTextField
              fullWidth
              label="CIN"
              variant="outlined"
              value={cin}
              onChange={(e) => setCin(e.target.value)}
              required
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <StyledTextField
              fullWidth
              label="Mot de passe"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="role-label" sx={{ color: '#1e3a8a' }}>Rôle</InputLabel>
            <Select
              labelId="role-label"
              value={role}
              label="Rôle"
              onChange={(e) => setRole(e.target.value)}
              sx={{
                borderRadius: '8px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#bfdbfe'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#93c5fd'
                }
              }}
            >
              <MenuItem value="0">Administrateur</MenuItem>
              <MenuItem value="1">Chef de Projet</MenuItem>
              <MenuItem value="2">Employée</MenuItem>
            </Select>
          </FormControl>

          {error && (
            <Typography 
              color="error" 
              sx={{ 
                mb: 2,
                textAlign: 'center',
                fontWeight: '500'
              }}
            >
              {error}
            </Typography>
          )}

          <StyledButton
            type="submit"
            fullWidth
            size="large"
          >
            Se connecter
          </StyledButton>
        </Box>
      </FormContainer>
    </AuthContainer>
  );
}

export default Login;