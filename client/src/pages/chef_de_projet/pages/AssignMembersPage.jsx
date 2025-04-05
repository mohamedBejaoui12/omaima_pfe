import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Typography,
  message,
  Row,
  Col,
  Avatar,
  Descriptions,
  Tag,
  Tooltip,
  Space,
  Select,
  Divider,
} from 'antd';
import {
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import Cookies from 'js-cookie';

const { Title } = Typography;

const AssignMembersPage = () => {
  // Add new state for projects
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      setCurrentUser(JSON.parse(userCookie));
    }
    fetchUsers();
    fetchProjects();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = Cookies.get('token');
      if (!token) {
        message.error("Aucun jeton d'authentification trouvé. Veuillez vous reconnecter.");
        return;
      }
      // Use the correct endpoint to get all users
      const response = await axios.get('http://localhost:5000/api/project-manager/all-users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Filter to only show employees (role 2)
      const employeeUsers = response.data.filter(user => user.role === '2');
      
      // Force disponibilitee to be 1 for all users for testing
      const updatedUsers = employeeUsers.map(user => ({
        ...user,
        disponibilitee: 1
      }));
      
      setUsers(updatedUsers);
      console.log('Users with forced availability:', updatedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error(error.response?.data?.message || "Échec du chargement des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        message.error("Aucun jeton d'authentification trouvé. Veuillez vous reconnecter.");
        return;
      }
      const response = await axios.get('http://localhost:5000/api/project-manager/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data);
      
      // Set current project if there's only one
      if (response.data.length === 1) {
        setCurrentProject(response.data[0]);
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Échec du chargement des projets.");
    }
  };

  const handleAssignMember = async (userId) => {
    if (!currentProject) {
      message.error("Veuillez sélectionner un projet d'abord.");
      return;
    }

    try {
      const token = Cookies.get('token');
      if (!token) {
        message.error("Aucun jeton d'authentification trouvé. Veuillez vous reconnecter.");
        return;
      }

      console.log('Assigning member with data:', {
        memberId: userId,
        projectId: currentProject.id,
        managerCin: currentUser.cin
      });

      const response = await axios.post(
        'http://localhost:5000/api/project-manager/assign-project-member',
        {
          memberId: userId,
          projectId: currentProject.id,
          managerCin: currentUser.cin
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Assignment response:', response.data);
      message.success("Membre assigné avec succès !");
      
      // Update the local state to reflect the change immediately
      // This ensures the UI updates without needing a refresh
      setUsers(prevUsers => {
        return prevUsers.map(user => {
          if (user.cin === userId) {
            return {
              ...user,
              project_id: currentProject.id,
              project_name: currentProject.nom_projet
            };
          }
          return user;
        });
      });
    } catch (error) {
      console.error('Error assigning member:', error);
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Échec de l'assignation du membre. Veuillez réessayer.");
      }
    }
  };

  const showUserDetails = (user) => {
    setSelectedUser(user);
    setVisible(true);
  };

  const columns = [
    {
      title: 'CIN',
      dataIndex: 'cin',
      key: 'cin',
    },
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Poste',
      dataIndex: 'poste',
      key: 'poste',
      render: (poste) => poste || 'Non spécifié',
    },
    {
      title: 'Disponibilité',
      dataIndex: 'disponibilitee',
      key: 'disponibilitee',
      render: (disponibilitee) => {
        // Convert to number and check if it's truthy (1, "1", true, etc.)
        const isAvailable = Number(disponibilitee) === 1;
        return (
          <Tag color={isAvailable ? 'green' : 'red'}>
            {isAvailable ? 'Disponible' : 'Non disponible'}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Voir détails">
            <Button
              icon={<EditOutlined />}
              onClick={() => showUserDetails(record)}
            />
          </Tooltip>
          <Button
            type="primary"
            onClick={() => handleAssignMember(record.cin)}
            disabled={!currentProject}
          >
            Assigner
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Assigner des Membres au Projet</Title>

      {projects.length > 1 && (
        <div style={{ marginBottom: '24px' }}>
          <Select
            placeholder="Sélectionner un projet"
            style={{ width: 300 }}
            onChange={(value) => {
              const project = projects.find(p => p.id === value);
              setCurrentProject(project);
            }}
          >
            {projects.map(project => (
              <Select.Option key={project.id} value={project.id}>
                {project.nom_projet}
              </Select.Option>
            ))}
          </Select>
        </div>
      )}

      {currentProject && (
        <div style={{ marginBottom: '24px', background: '#f0f2f5', padding: '16px', borderRadius: '8px' }}>
          <Title level={4}>Projet Sélectionné: {currentProject.nom_projet}</Title>
          <p>{currentProject.description}</p>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={users}
        rowKey="cin"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Détails de l'Utilisateur"
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={[
          <Button key="back" onClick={() => setVisible(false)}>
            Fermer
          </Button>,
          <Button
            key="assign"
            type="primary"
            onClick={() => {
              handleAssignMember(selectedUser.cin);
              setVisible(false);
            }}
            disabled={!selectedUser || !currentProject}
          >
            Assigner au Projet
          </Button>,
        ]}
        width={700}
      >
        {selectedUser && (
          <>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Avatar size={100} icon={<EditOutlined />} />
              </Col>
              <Col span={18}>
                <Descriptions title="Informations Personnelles" bordered column={1}>
                  <Descriptions.Item label="Nom">{selectedUser.nom}</Descriptions.Item>
                  <Descriptions.Item label="CIN">{selectedUser.cin}</Descriptions.Item>
                  <Descriptions.Item label="Email">
                    <Space>
                      <MailOutlined />
                      {selectedUser.email}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Téléphone">
                    <Space>
                      <PhoneOutlined />
                      {selectedUser.num_tele || 'Non spécifié'}
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>

            <Divider />

            <Descriptions title="Informations Professionnelles" bordered>
              <Descriptions.Item label="Poste" span={3}>
                {selectedUser.poste || 'Non spécifié'}
              </Descriptions.Item>
              <Descriptions.Item label="Disponibilité" span={3}>
                <Tag color={Number(selectedUser.disponibilitee) === 1 ? 'green' : 'red'}>
                  {Number(selectedUser.disponibilitee) === 1 ? 'Disponible' : 'Non disponible'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AssignMembersPage;