import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { message, Table, Typography, Button, Space, Modal } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
const { Title } = Typography;

const ProjectMembers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
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
              headers: { 'Authorization': `Bearer ${token}` }
          });
  
          if (response.data.length > 0) {
              const projectId = response.data[0].id;
              setCurrentProject(projectId);
  
              // Ensure fetchUsers is called after setting currentProject
              setTimeout(() => {
                  fetchUsers(projectId);
              }, 100);
          }
      } catch (error) {
          message.error('Failed to fetch project details');
      }
  };

  
  const fetchUsers = async (projectId) => {
      setLoading(true);
      try {
          const token = Cookies.get('token');
          if (!token) {
              message.error('No authentication token found. Please log in again.');
              return;
          }
  
          const response = await axios.post('http://localhost:5000/api/project-manager/members', 
            { projectId },
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          setUsers(response.data);
      } catch (error) {
          message.error(error.response?.data?.message || 'Failed to fetch users');
      } finally {
          setLoading(false);
      }
  };

  const handleRemoveMember = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
          message.error('No authentication token found. Please log in again.');
          return;
      }
      
      if (!currentProject) {
          message.error('No project selected');
          return;
      }

      const response = await axios.post('http://localhost:5000/api/project-manager/remove-project-member', 
        { 
          projectId: currentProject, 
          memberId: memberToRemove 
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      message.success(response.data.message);
      setRemoveModalVisible(false);
      // Refresh the users list after successful removal
      fetchUsers(currentProject);
    } catch (error) {
      console.error('Error removing member:', error);
      message.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const showRemoveModal = (memberId) => {
    setMemberToRemove(memberId);
    setRemoveModalVisible(true);
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
          {record.role !== '0' && (
            <Button icon={<DeleteOutlined />} type='danger' onClick={() => {
              showRemoveModal(record.cin)
            }}>Remove</Button>
          )}
        </Space>
      )
    }
  ];

  return (
      <div>
     
      <Modal
        title="Confirm Removal"
        open={removeModalVisible}
        onOk={handleRemoveMember}
        onCancel={() => setRemoveModalVisible(false)}
      >
        <p>Are you sure you want to remove this member?</p>
      </Modal>
          <Title level={2}>All Members</Title>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => {
            navigate('/chef-de-projet/all-users', { replace: true });
          }}
        >
          Assign Members
        </Button>
      </div>
          <Table columns={columns} dataSource={users} rowKey="cin" loading={loading} />
      </div>
  );
};

export default ProjectMembers;
