import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
  message,
  Table,
  Typography,
  Button,
  Space,
  Modal,
  Tooltip,
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const ProjectMembers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const navigate = useNavigate();

  // Récupérer le CIN de l'utilisateur actuel à partir du cookie
  const userCookie = Cookies.get('user');
  const currentUserCin = userCookie ? JSON.parse(userCookie).cin : null;

  useEffect(() => {
    if (currentUserCin) {
      fetchUsers(currentUserCin);
    }
  }, [currentUserCin]);

  const fetchUsers = async (memberId) => {
    setLoading(true);
    try {
      const token = Cookies.get('token');
      if (!token) {
        message.error("Aucun jeton d'authentification trouvé. Veuillez vous reconnecter.");
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/project-manager/members',
        { memberId }, // Envoyer le CIN du manager
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(response.data);
    } catch (error) {
      message.error(error.response?.data?.message || "Échec du chargement des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  // Afficher la modal de suppression
  const showRemoveModal = (memberId) => {
    setMemberToRemove(memberId);
    setRemoveModalVisible(true);
  };
  
  // Gérer la suppression d'un membre
  const handleRemoveMember = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        message.error("Aucun jeton d'authentification trouvé. Veuillez vous reconnecter.");
        return;
      }
  
      // Obtenir l'ID du projet à partir de l'enregistrement de l'utilisateur
      const userToRemove = users.find(user => user.cin === memberToRemove);
      if (!userToRemove) {
        message.error("Membre non trouvé.");
        return;
      }
  
      // Journaliser les données de l'utilisateur pour vérifier le nom de champ correct
      console.log('Utilisateur à supprimer:', userToRemove);
  
      await axios.post(
        'http://localhost:5000/api/project-manager/remove-project-member',
        {
          projectId: userToRemove.projet_id, // Modifié pour correspondre au champ de la base de données
          memberId: userToRemove.cin,
          managerCin: currentUserCin
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      message.success("Membre supprimé avec succès !");
      setRemoveModalVisible(false);
      fetchUsers(currentUserCin);
    } catch (error) {
      console.error("Erreur lors de la suppression du membre :", error);
      message.error(error.response?.data?.message || "Échec de la suppression du membre.");
    }
  };

  // Mettre à jour le tableau des colonnes pour utiliser project_name au lieu de nom_projet
  const columns = [
    { title: 'CIN', dataIndex: 'cin', key: 'cin' },
    { title: 'Nom', dataIndex: 'nom', key: 'nom' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Projet',
      dataIndex: 'project_name', // Mis à jour pour correspondre à la réponse du backend
      key: 'project_name',
      render: (project_name) => project_name || 'Non assigné'
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      render: (role) =>
        ({
          '0': 'Administrateur',
          '1': 'Chef de projet',
          '2': 'Employé',
        }[role] || 'Inconnu'),
    },
    {
      title: 'Poste',
      dataIndex: 'poste',
      key: 'poste',
      render: (poste) => poste || 'Non spécifié',
    },
    {
      title: 'Téléphone',
      dataIndex: 'num_tele',
      key: 'num_tele',
      render: (num_tele) => (
        <span style={{ whiteSpace: 'nowrap' }}>{num_tele || 'Non fourni'}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.role !== '0' && (
            <Tooltip title="Supprimer du projet">
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => showRemoveModal(record.cin)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Title level={2}>Membres de Mon Projet</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/chef-de-projet/all-users')}
        >
          Ajouter des Membres
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="cin"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Confirmer la suppression"
        open={removeModalVisible}
        onOk={handleRemoveMember}
        onCancel={() => setRemoveModalVisible(false)}
        okText="Confirmer"
        cancelText="Annuler"
      >
        <p>Êtes-vous sûr de vouloir supprimer ce membre du projet ?</p>
      </Modal>
    </div>
  );
};

export default ProjectMembers;