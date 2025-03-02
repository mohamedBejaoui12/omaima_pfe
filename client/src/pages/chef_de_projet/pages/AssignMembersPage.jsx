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
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchProjects();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = Cookies.get('token');
      if (!token) {
        message.error("Aucun jeton d'authentification trouvé. Veuillez vous reconnecter.");
        return;
      }
      const response = await axios.get('http://localhost:5000/api/project-manager/all-users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      message.error(error.response?.data?.message || "Échec du chargement des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  // Modify fetchCurrentProject to fetch all projects
  const fetchProjects = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get('http://localhost:5000/api/project-manager/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data);
    } catch (error) {
      message.error("Échec du chargement des projets.");
    }
  };

  // Update useEffect to fetch projects
  useEffect(() => {
    if (currentUser) {
      fetchProjects(); // Changed from fetchCurrentProject to fetchProjects
    }
  }, [currentUser]);

  // Update handleAssignMember to use selected project
  const handleAssignMember = async () => {
    if (!selectedUser || !currentProject) {
      message.error("Veuillez sélectionner un projet et un membre");
      return;
    }
    try {
      const token = Cookies.get('token');
      await axios.post(
        'http://localhost:5000/api/project-manager/assign-project-member',
        {
          memberId: selectedUser.cin,
          projectId: currentProject.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Membre assigné avec succès !");
      setAssignModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.message || "Échec de l'assignation du membre.");
    }
  };

  const handleAssignClick = (record) => {
    setSelectedUser(record);
    setAssignModalVisible(true);
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
        ({ '0': 'Administrateur', '1': 'Chef de projet', '2': 'Employé' }[role] || 'Inconnu'),
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
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setVisible(true);
              setSelectedUser(record);
            }}
          >
            Voir
          </Button>
          {record.role !== '0' && (
            <Button
              icon={<EditOutlined />}
              type="primary"
              onClick={() => handleAssignClick(record)}
            >
              Assigner
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Update the assign modal content
  return (
    <div>
      {/* Titre principal */}
      <Title level={2}>Tous les membres</Title>

      {/* Tableau des utilisateurs */}
      <Table
        columns={columns}
        dataSource={users}
        rowKey="cin"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Modified Modal for assigning a member */}
      <Modal
        title="Assigner un membre"
        open={assignModalVisible}
        onOk={handleAssignMember}
        onCancel={() => setAssignModalVisible(false)}
        okText="Assigner"
        cancelText="Annuler"
      >
        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong>Sélectionner un projet:</Typography.Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Choisir un projet"
            value={currentProject?.id}
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
        <Typography.Text>
          Êtes-vous sûr de vouloir assigner <strong>{selectedUser?.nom}</strong> au projet <strong>{currentProject?.nom_projet}</strong> ?
        </Typography.Text>
      </Modal>

      {/* Modal pour afficher le profil de l'utilisateur */}
      <Modal
        title={`${selectedUser?.nom} - Profil`}
        open={visible}
        onCancel={() => setVisible(false)}
        footer={[
          <Button key="close" onClick={() => setVisible(false)}>
            Fermer
          </Button>,
        ]}
      >
        <Row gutter={[16, 16]}>
          <Col span={8} style={{ textAlign: 'center' }}>
            <Avatar
              size={120}
              src={`http://localhost:5000${selectedUser?.imageUrl}` || 'https://th.bing.com/th/id/OIP.6Ckm4MGXRjZgWQyRkjDDPgHaEK?rs=1&pid=ImgDetMain'}
            />
          </Col>
          <Col span={16}>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Nom">
                {selectedUser?.nom}
              </Descriptions.Item>
              <Descriptions.Item label="Poste">
                <Tag color="processing">{selectedUser?.poste || 'Non spécifié'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Rôle">
                <Tag
                  color={
                    selectedUser?.role === '1'
                      ? 'blue'
                      : selectedUser?.role === '2'
                      ? 'green'
                      : 'red'
                  }
                >
                  {selectedUser?.role === '0'
                    ? 'Administrateur'
                    : selectedUser?.role === '1'
                    ? 'Chef de projet'
                    : 'Employé'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Département">
                {selectedUser?.department || 'Non fourni'}
              </Descriptions.Item>
              <Descriptions.Item label="Coordonnées">
                <Space direction="vertical">
                  <Tooltip title="Email">
                    <MailOutlined /> {selectedUser?.email}
                  </Tooltip>
                  <Tooltip title="Téléphone">
                    <PhoneOutlined />{' '}
                    {selectedUser?.num_tele || 'Non fourni'}
                  </Tooltip>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Modal>
    </div>
  );
};

export default AssignMembersPage;