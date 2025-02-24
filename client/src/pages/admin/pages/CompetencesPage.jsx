import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Typography,
  message,
  Popconfirm,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import Cookies from 'js-cookie';

const { Title } = Typography;

const CompetencesPage = () => {
  const [competences, setCompetences] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCompetence, setSelectedCompetence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCompetences();
  }, []);

  const fetchCompetences = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');

      if (!token) {
        message.error('No authentication token found. Please log in again.');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/admin/competences', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setCompetences(response.data);
      } else {
        message.error('Failed to fetch competences');
      }
    } catch (error) {
      console.error('Fetch competences error:', error);

      if (error.response?.status === 403) {
        message.error('You do not have permission to view competences');
      } else {
        message.error(error.response?.data?.message || 'Failed to fetch competences');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setSelectedCompetence(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (competence) => {
    setEditMode(true);
    setSelectedCompetence(competence);
    form.setFieldsValue({ nom_competence: competence.nom_competence });
    setModalVisible(true);
  };

  const handleDelete = async (competence) => {
    try {
      const token = Cookies.get('token');

      if (!token) {
        message.error('Authentication token not found. Please log in again.');
        return;
      }

      await axios.delete(`http://localhost:5000/api/admin/competences/${competence.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success('Competence deleted successfully');
      fetchCompetences();
    } catch (error) {
      console.error('Delete competence error:', error);

      if (error.response) {
        message.error(error.response.data.message || 'Failed to delete competence');
      } else if (error.request) {
        message.error('No response from server. Please check your connection.');
      } else {
        message.error('An unexpected error occurred while deleting competence');
      }
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const token = Cookies.get('token');

      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const endpoint = editMode
        ? `http://localhost:5000/api/admin/competences/${selectedCompetence.id}`
        : 'http://localhost:5000/api/admin/competences';
      const method = editMode ? 'put' : 'post';

      await axios[method](
        endpoint,
        { nom_competence: values.nom_competence },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      message.success(editMode ? 'Competence updated successfully' : 'Competence added successfully');
      setModalVisible(false);
      form.resetFields();
      fetchCompetences();
    } catch (error) {
      console.error('Save competence error:', error);

      if (error.response) {
        message.error(error.response.data.message || 'Failed to save competence');
      } else if (error.request) {
        message.error('No response from server. Please check your connection.');
      } else {
        message.error('An unexpected error occurred');
      }
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Competence Name',
      dataIndex: 'nom_competence',
      key: 'nom_competence',
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
          <Popconfirm
            title="Delete Competence"
            description="Are you sure you want to delete this competence?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<DeleteOutlined />}
              danger
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
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header Section */}
      <div
        style={{
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Title level={2} style={{ color: '#1890ff', fontWeight: 'bold' }}>
          Manage Competences
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
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
          Add Competence
        </Button>
      </div>

      {/* Competences Table */}
      <Table
        columns={columns}
        dataSource={competences}
        rowKey="id"
        loading={loading}
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

      {/* Add/Edit Competence Modal */}
      <Modal
        title={editMode ? 'Edit Competence' : 'Add New Competence'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setModalVisible(false);
              form.resetFields();
            }}
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
            key="submit"
            type="primary"
            onClick={handleModalOk}
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
            {editMode ? 'Update' : 'Add'} Competence
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ nom_competence: '' }}
        >
          <Form.Item
            name="nom_competence"
            label="Competence Name"
            rules={[{ required: true, message: 'Please enter competence name' }]}
          >
            <Input
              placeholder="Enter competence name"
              style={{
                borderRadius: '8px',
                border: '1px solid #d9d9d9',
                transition: 'border-color 0.3s ease',
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CompetencesPage;