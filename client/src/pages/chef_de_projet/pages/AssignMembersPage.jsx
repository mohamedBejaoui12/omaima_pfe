import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Typography, message, Row, Col, Avatar, 
  Descriptions, Tag, Tooltip, Space, Divider 
} from 'antd';
import { 
  EditOutlined, MailOutlined, PhoneOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import Cookies from 'js-cookie';

const { Title } = Typography;

const AssignMembersPage = () => {
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
      fetchCurrentProject();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = Cookies.get('token');
      if (!token) {
        message.error('No authentication token found. Please log in again.');
        return;
      }
      const response = await axios.get('http://localhost:5000/api/project-manager/all-users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentProject = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get('http://localhost:5000/api/project-manager/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.length > 0) {
        setCurrentProject(response.data[0]);
      }
    } catch (error) {
      message.error('Failed to fetch project details');
    }
  };

  const handleAssignMember = async () => {
    if (!selectedUser || !currentProject) return;
    try {
      const token = Cookies.get('token');
      await axios.post('http://localhost:5000/api/project-manager/assign-project-member', {
        memberId: selectedUser.cin, 
        projectId: currentProject.id,
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      message.success('Member assigned successfully!');
      setAssignModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to assign member.');
    }
  };

  const handleAssignClick = (record) => {
    setSelectedUser(record);
    setAssignModalVisible(true);
  };

  const columns = [
    { title: 'CIN', dataIndex: 'cin', key: 'cin' },
    { title: 'Name', dataIndex: 'nom', key: 'nom' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { 
      title: 'Role', 
      dataIndex: 'role', 
      key: 'role',
      render: (role) => ({ '0': 'Admin', '1': 'Manager', '2': 'Employee' }[role] || 'Unknown')
    },
    { title: 'Position', dataIndex: 'poste', key: 'poste', render: (poste) => poste || 'Not specified' },
    { 
      title: 'Phone', 
      dataIndex: 'num_tele', 
      key: 'num_tele', 
      render: (num_tele) => <span style={{ whiteSpace: 'nowrap' }}>{num_tele || 'Not provided'}</span>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => { setVisible(true); setSelectedUser(record); }}>View</Button>
          {record.role !== '0' && (
            <Button icon={<EditOutlined />} type='primary' onClick={() => handleAssignClick(record)}>Assign</Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <Title level={2}>All Members</Title>
      <Table columns={columns} dataSource={users} rowKey="cin" loading={loading} />

      {/* Assign Member Modal */}
      <Modal
        title="Assign Member"
        open={assignModalVisible}
        onOk={handleAssignMember}
        onCancel={() => setAssignModalVisible(false)}
        okText="Assign"
        cancelText="Cancel"
      >
        <p>Are you sure you want to assign {selectedUser?.nom} to the project?</p>
      </Modal>

      {/* User Profile Modal */}
      <Modal
        title={`${selectedUser?.nom} - Profile`}
        open={visible}
        onCancel={() => setVisible(false)}
        footer={[<Button key="close" onClick={() => setVisible(false)}>Close</Button>]}
      >
        <Row gutter={[16, 16]}>
          <Col span={8} style={{ textAlign: 'center' }}>
            <Avatar size={120} src={`http://localhost:5000${selectedUser?.imageUrl}` || 'https://th.bing.com/th/id/OIP.6Ckm4MGXRjZgWQyRkjDDPgHaEK?rs=1&pid=ImgDetMain'} />
          </Col>
          <Col span={16}>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Name">{selectedUser?.nom}</Descriptions.Item>
              <Descriptions.Item label="Position">
                <Tag color="processing">{selectedUser?.poste || 'Not specified'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Role">
                <Tag color={selectedUser?.role === '1' ? 'blue' : selectedUser?.role === '2' ? 'green' : 'red'}>
                  {selectedUser?.role === '0' ? 'Admin' : selectedUser?.role === '1' ? 'Manager' : 'Employee'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Department">{selectedUser?.department || 'Not provided'}</Descriptions.Item>
              <Descriptions.Item label="Contact">
                <Space direction="vertical">
                  <Tooltip title="Email">
                    <MailOutlined /> {selectedUser?.email}
                  </Tooltip>
                  <Tooltip title="Phone">
                    <PhoneOutlined /> {selectedUser?.num_tele || 'Not provided'}
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
