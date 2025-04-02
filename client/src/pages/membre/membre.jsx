import React, { useState, useEffect } from 'react';
import {
  Typography,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip // Replace Tag with Chip from MUI
} from '@mui/material';
// Remove Space import as it's not needed
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import MemberLayout from './MemberLayout';

function MembreDashboard() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
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
        console.error('Erreur lors du chargement des informations utilisateur:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate('/login');
        }
      }
    };

    const fetchMemberProjects = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get('http://localhost:5000/user/my-projects', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    const loadData = async () => {
      await fetchUserInfo();
      await fetchMemberProjects();
      setLoading(false);
    };

    loadData();
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
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Mes Projets
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom du projet</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.nom_projet}</TableCell>
                <TableCell>{project.description || 'Aucune description'}</TableCell>
                <TableCell>
                  <Chip
                    label={project.statut}
                    color={
                      project.statut === 'en cours'
                        ? 'primary'
                        : project.statut === 'terminé'
                        ? 'success'
                        : 'error'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {project.delai ? new Date(project.delai).toLocaleDateString() : 'Non défini'}
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default MembreDashboard;