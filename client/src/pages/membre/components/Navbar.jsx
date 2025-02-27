// Navbar.jsx
import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = ({ userInfo }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Tableau de bord du membre
        </Typography>
        <div>
          <IconButton
            size="large"
            aria-label="Compte de l'utilisateur actuel"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar
              alt={userInfo?.nom}
              src={userInfo?.imageUrl ? `http://localhost:5000${userInfo.imageUrl}` : undefined}
              sx={{
                width: 40,
                height: 40,
                bgcolor: !userInfo?.imageUrl ? 'primary.main' : undefined,
              }}
            >
              {!userInfo?.imageUrl && userInfo?.nom ? userInfo.nom[0].toUpperCase() : null}
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
            <MenuItem component={Link} to="/membre/profile">
              Profil
            </MenuItem>
            <MenuItem component={Link} to="/membre/competences">
              Compétences
            </MenuItem>
            <MenuItem onClick={() => navigate('/connexion')}>Se déconnecter</MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;