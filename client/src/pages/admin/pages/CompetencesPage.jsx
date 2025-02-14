import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Typography, 
  message,
  Popconfirm 
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined,
  PlusOutlined 
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
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
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
    form.setFieldsValue({
      nom_competence: competence.nom_competence
    });
    setModalVisible(true);
  };

  const handleDelete = async (competence) => {
    try {
      const token = Cookies.get('token');
      
      if (!token) {
        message.error('Authentication token not found. Please log in again.');
        return;
      }

      console.log('Deleting competence with ID:', competence.id);
      
      const response = await axios.delete(`http://localhost:5000/api/admin/competences/${competence.id}`, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });

      // Improved success handling
      message.success(response.data.message || 'Competence deleted successfully');
      fetchCompetences();
    } catch (error) {
      console.error('Delete competence error:', error);
      
      // More comprehensive error handling
      if (error.response) {
        // Server responded with an error
        console.error('Error response:', error.response.data);
        message.error(error.response.data.message || 'Failed to delete competence');
      } else if (error.request) {
        // Request made but no response received
        console.error('No response received:', error.request);
        message.error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        console.error('Error:', error.message);
        message.error('An unexpected error occurred while deleting competence');
      }
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('Values being submitted:', values);
      const token = Cookies.get('token');

      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const endpoint = editMode 
        ? `http://localhost:5000/api/admin/competences/${selectedCompetence.id}`
        : 'http://localhost:5000/api/admin/competences';

      const method = editMode ? 'put' : 'post';

      const response = await axios[method](endpoint, 
        {
          nom_competence: values.nom_competence
        }, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Improved success handling
      message.success(response.data.message || (editMode ? 'Competence updated successfully' : 'Competence added successfully'));
      setModalVisible(false);
      form.resetFields();
      fetchCompetences();
    } catch (error) {
      console.error('Save competence error:', error);
      
      // More comprehensive error handling
      if (error.response) {
        // Server responded with an error
        console.error('Error response:', error.response.data);
        message.error(error.response.data.message || 'Failed to save competence');
      } else if (error.request) {
        // Request made but no response received
        console.error('No response received:', error.request);
        message.error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        console.error('Error:', error.message);
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
        <>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Competence"
            description="Are you sure you want to delete this competence?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Manage Competences</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAdd}
        >
          Add Competence
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={competences}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editMode ? "Edit Competence" : "Add New Competence"}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
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
            <Input placeholder="Enter competence name" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CompetencesPage;