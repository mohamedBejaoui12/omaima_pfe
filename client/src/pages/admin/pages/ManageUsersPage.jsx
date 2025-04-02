import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  message,
} from 'antd';
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import Cookies from 'js-cookie';

const { Title, Text } = Typography;
const { Option } = Select;

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
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
        headers: { Authorization: `Bearer ${token}` },
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

  const handleDelete = (user) => {
    setSelectedUser(user);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const token = Cookies.get('token');

      if (!token) {
        message.error('Authentication token not found. Please log in again.');
        return;
      }

      await axios.delete(`http://localhost:5000/api/admin/users/${selectedUser.cin}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success(`User ${selectedUser.nom} deleted successfully`);
      setDeleteModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Delete user error:', error);

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
        headers: { Authorization: `Bearer ${token}` },
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
      },
    },
    {
      title: 'Position',
      dataIndex: 'poste',
      key: 'poste',
      render: (poste) => poste || 'Not specified',
    },
    {
      title: 'Phone Number',
      dataIndex: 'num_tele',
      key: 'num_tele',
      render: (num_tele) => num_tele || 'Not provided',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Edit Button */}
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{
              background: '#1890ff',
              borderColor: '#1890ff',
              color: '#fff',
              borderRadius: '4px',
              transition: 'background 0.3s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#40a9ff')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#1890ff')}
          >
            Edit
          </Button>

          {/* Delete Button */}
          {record.role !== '0' && (
            <Button
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              style={{
                background: '#ff4d4f',
                borderColor: '#ff4d4f',
                color: '#fff',
                borderRadius: '4px',
                transition: 'background 0.3s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#ff7875')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#ff4d4f')}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title
        level={2}
        style={{
          marginBottom: '32px',
          color: '#1890ff',
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        Manage Users
      </Title>

      {/* User Table */}
      <Table
        columns={columns}
        dataSource={users}
        rowKey="cin"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          position: ['bottomCenter'],
        }}
        bordered
        style={{
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}
      />

      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinishEdit}
          style={{ marginTop: '24px' }}
        >
          <Form.Item
            name="nom"
            label="Name"
            rules={[{ required: true, message: 'Please input name' }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input email' },
              { type: 'email', message: 'Invalid email format' },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select placeholder="Select user role">
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
              { pattern: /^[0-9]{8,20}$/, message: 'Please enter a valid phone number' },
            ]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              style={{
                height: '48px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                background: '#1890ff',
                borderColor: '#1890ff',
                transition: 'background 0.3s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#40a9ff')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#1890ff')}
            >
              Update User
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Deletion"
        visible={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setDeleteModalVisible(false)}
            style={{
              background: '#ffffff',
              borderColor: '#d9d9d9',
              color: '#000000',
              borderRadius: '4px',
            }}
          >
            Cancel
          </Button>,
          <Button
            key="delete"
            onClick={confirmDelete}
            danger
            style={{
              background: '#ff4d4f',
              borderColor: '#ff4d4f',
              color: '#ffffff',
              borderRadius: '4px',
              transition: 'background 0.3s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#ff7875')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#ff4d4f')}
          >
            Delete
          </Button>,
        ]}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ExclamationCircleOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
          <Text>
            Are you sure you want to delete user <strong>{selectedUser?.nom}</strong> (CIN:{' '}
            {selectedUser?.cin})? This action cannot be undone.
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default ManageUsersPage;