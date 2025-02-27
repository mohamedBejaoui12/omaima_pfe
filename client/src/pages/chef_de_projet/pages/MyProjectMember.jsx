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

  useEffect(() => {
    fetchCurrentProject();
  }, []);

  const fetchCurrentProject = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get('http://localhost:5000/api/project-manager/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.length > 0) {
        const projectId = response.data[0].id;
        setCurrentProject(projectId);

        // Fetch users after setting the current project
        setTimeout(() => {
          fetchUsers(projectId);
        }, 100);
      }
    } catch (error) {
      message.error("Échec du chargement des détails du projet.");
    }
  };

  const fetchUsers = async (projectId) => {
    setLoading(true);
    try {
      const token = Cookies.get('token');
      if (!token) {
        message.error("Aucun jeton d'authentification trouvé. Veuillez vous reconnecter.");
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/project-manager/members',
        { projectId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(response.data);
    } catch (error) {
      message.error(error.response?.data?.message || "Échec du chargement des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        message.error("Aucun jeton d'authentification trouvé. Veuillez vous reconnecter.");
        return;
      }

      if (!currentProject) {
        message.error("Aucun projet sélectionné.");
        return;
      }

      await axios.post(
        'http://localhost:5000/api/project-manager/remove-project-member',
        { projectId: currentProject, memberId: memberToRemove },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success("Membre supprimé avec succès !");
      setRemoveModalVisible(false);
      fetchUsers(currentProject); // Refresh the user list
    } catch (error) {
      console.error("Erreur lors de la suppression du membre :", error);
      message.error(error.response?.data?.message || "Échec de la suppression du membre.");
    }
  };

  const showRemoveModal = (memberId) => {
    setMemberToRemove(memberId);
    setRemoveModalVisible(true);
  };

  const columns = [
    { title: 'CIN', dataIndex: 'cin', key: 'cin' },
    { title: 'Nom', dataIndex: 'nom', key: 'nom' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
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
            <Tooltip title="Supprimer ce membre">
              <Button
                icon={<DeleteOutlined />}
                type="danger"
                onClick={() => showRemoveModal(record.cin)}
              >
                Supprimer
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Titre principal */}
      <Title level={2}>Tous les membres</Title>

      {/* Bouton pour assigner des membres */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            navigate('/chef-de-projet/all-users', { replace: true });
          }}
        >
          Assigner des membres
        </Button>
      </div>

      {/* Tableau des membres */}
      <Table
        columns={columns}
        dataSource={users}
        rowKey="cin"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Modal de confirmation de suppression */}
      <Modal
        title="Confirmer la suppression"
        open={removeModalVisible}
        onOk={handleRemoveMember}
        onCancel={() => setRemoveModalVisible(false)}
        okText="Supprimer"
        cancelText="Annuler"
      >
        <p>Êtes-vous sûr de vouloir supprimer ce membre ?</p>
      </Modal>
    </div>
  );
};

export default ProjectMembers;