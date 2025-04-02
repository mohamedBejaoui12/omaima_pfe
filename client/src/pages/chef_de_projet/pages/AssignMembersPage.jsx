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
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.filter(user => user.role === '2')); // Only show employees
    } catch (error) {
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

      await axios.post(
        'http://localhost:5000/api/project-manager/assign-project-member',
        {
          memberId: userId,
          projectId: currentProject.id,
          managerCin: currentUser.cin
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success("Membre assigné avec succès !");
      fetchUsers(); // Refresh the user list
    } catch (error) {
      message.error(error.response?.data?.message || "Échec de l'assignation du membre.");
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
      render: (disponibilitee) => (
        <Tag color={disponibilitee === 1 ? 'green' : 'red'}>
          {disponibilitee === 1 ? 'Disponible' : 'Non disponible'}
        </Tag>
      ),
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
            disabled={record.disponibilitee !== 1 || !currentProject}
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
            disabled={!selectedUser || selectedUser.disponibilitee !== 1 || !currentProject}
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
                <Tag color={selectedUser.disponibilitee === 1 ? 'green' : 'red'}>
                  {selectedUser.disponibilitee === 1 ? 'Disponible' : 'Non disponible'}
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