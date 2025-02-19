import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Typography, 
  message 
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import Cookies from 'js-cookie';

const { Title } = Typography;
const { Option } = Select;

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Fetch current user from cookies
    const userCookie = Cookies.get('user');
    if (userCookie) {
      setCurrentUser(JSON.parse(userCookie));
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = Cookies.get('token');
      
      if (!token) {
        message.error('No authentication token found. Please log in again.');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      
      setUsers(response.data);
    } catch (error) {
      console.error('Fetch users error:', error);
      
      if (error.response) {
        message.error(error.response.data.message || 'Failed to fetch users');
      } else if (error.request) {
        message.error('No response from server. Please check your connection.');
      } else {
        message.error('An error occurred while fetching users');
      }
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    form.setFieldsValue(user);
    setEditModalVisible(true);
  };

  const handleDelete = async (user) => {
    // Prevent deleting admin accounts
    if (user.role === '0') {
      message.error('Cannot delete admin accounts');
      return;
    }
  
    try {
      // Get token directly from cookies
      const token = Cookies.get('token');
      
      if (!token) {
        message.error('Authentication token not found. Please log in again.');
        return;
      }
  
      // Simple confirmation
      const confirmed = window.confirm(`Are you sure you want to delete user ${user.nom} (CIN: ${user.cin})?`);
      
      if (!confirmed) return;
  
      // Simplified delete request
      const response = await axios.delete(`http://localhost:5000/api/admin/users/${user.cin}`, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
  
      // Success message
      message.success(`User ${user.nom} deleted successfully`);
      
      // Refresh user list
      fetchUsers();
  
    } catch (error) {
      console.error('Delete user error:', error);
      
      // Detailed error handling
      if (error.response) {
        message.error(error.response.data.message || 'Failed to delete user');
      } else if (error.request) {
        message.error('No response from server. Check your connection.');
      } else {
        message.error('An unexpected error occurred');
      }
    }
  };

  const onFinishEdit = async (values) => {
    try {
      const token = Cookies.get('token');
      
      if (!token) {
        message.error('No authentication token found. Please log in again.');
        return;
      }

      await axios.put(`http://localhost:5000/api/admin/users/${selectedUser.cin}`, values, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      
      message.success('User updated successfully');
      setEditModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Update user error:', error);
      
      if (error.response) {
        message.error(error.response.data.message || 'Failed to update user');
      } else if (error.request) {
        message.error('No response from server. Please check your connection.');
      } else {
        message.error('An error occurred while updating user');
      }
    }
  };

  const columns = [
    { title: 'CIN', dataIndex: 'cin', key: 'cin' },
    { title: 'Name', dataIndex: 'nom', key: 'nom' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { 
      title: 'Role', 
      dataIndex: 'role', 
      key: 'role',
      render: (role) => {
        const roles = { '0': 'Admin', '1': 'Manager', '2': 'Employee' };
        return roles[role];
      }
    },
    {
      title: 'Position', 
      dataIndex: 'poste', 
      key: 'poste',
      render: (poste) => poste || 'Not specified'
    },
    {
      title: 'Phone Number', 
      dataIndex: 'num_tele', 
      key: 'num_tele',
      render: (num_tele) => num_tele || 'Not provided'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          {record.role !== '0' && (
            <Button 
              icon={<DeleteOutlined />} 
              danger 
              onClick={() => handleDelete(record)}
            >
              Delete
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <Title level={2}>Manage Users</Title>
      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="cin" 
      />

      <Modal
        title="Edit User"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinishEdit}
        >
          <Form.Item 
            name="nom" 
            label="Name"
            rules={[{ required: true, message: 'Please input name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            name="email" 
            label="Email"
            rules={[
              { required: true, message: 'Please input email' },
              { type: 'email', message: 'Invalid email format' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            name="role" 
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select>
              <Option value="0">Admin</Option>
              <Option value="1">Manager</Option>
              <Option value="2">Employee</Option>
            </Select>
          </Form.Item>
          <Form.Item name="poste" label="Position">
            <Input placeholder="Enter position or grade" />
          </Form.Item>
          <Form.Item 
            name="num_tele" 
            label="Phone Number"
            rules={[
              { 
                pattern: /^[0-9]{8,20}$/, 
                message: 'Please enter a valid phone number' 
              }
            ]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update User
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageUsersPage;