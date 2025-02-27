import React, { useState, useEffect } from 'react';
import {
  Typography,
  Container,
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import MemberLayout from './MemberLayout';

function MembreDashboard() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = Cookies.get('token');
        const user = Cookies.get('user');

        if (!token || !user) {
          console.log('Aucun jeton ou utilisateur trouvé, redirection vers la connexion.');
          navigate('/login');
          return;
        }

        const userData = JSON.parse(user);
        if (userData.role !== '2') {
          console.log('Rôle non valide pour la page membre:', userData.role);
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/user/user-info', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setUserInfo(response.data.userInfo);
        } else {
          console.error('Échec du chargement des informations utilisateur:', response.data.message);
          navigate('/login');
        }
      } catch (error) {
        console.error(
          'Erreur lors du chargement des informations utilisateur:',
          error.response?.data || error
        );
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  if (loading) {
    return (
      <Container>
        <Typography variant="h6">Chargement...</Typography>
      </Container>
    );
  }

  if (!userInfo) {
    return (
      <Container>
        <Typography variant="h6">Aucune information utilisateur trouvée</Typography>
      </Container>
    );
  }

  return (
    <MemberLayout userInfo={userInfo}>
      {/* Contenu principal */}
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Bienvenue, {userInfo.nom}!
        </Typography>
        <Typography variant="body1">
          Voici votre tableau de bord. Vous pouvez gérer vos compétences et consulter vos informations personnelles.
        </Typography>
      </Container>
    </MemberLayout>
  );
}

export default MembreDashboard;