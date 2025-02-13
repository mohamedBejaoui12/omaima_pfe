import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  message,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker
} from 'antd';
import { 
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [competences, setCompetences] = useState([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addForm] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    fetchCompetences();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = Cookies.get('token');
      
      if (!token) {
        message.error('No authentication token found. Please log in again.');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/admin/projects', {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      
      setProjects(response.data);
    } catch (error) {
      console.error('Fetch projects error:', error);
      handleApiError(error);
    }
  };

  const fetchCompetences = async () => {
    try {
      const token = Cookies.get('token');
      
      if (!token) {
        message.error('No authentication token found. Please log in again.');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/admin/competences', {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      
      setCompetences(response.data);
    } catch (error) {
      console.error('Fetch competences error:', error);
      handleApiError(error);
    }
  };

  const handleApiError = (error) => {
    if (error.response) {
      message.error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
      message.error('No response from server. Please check your connection.');
    } else {
      message.error('An unexpected error occurred');
    }
  };

  const onFinishAdd = async (values) => {
    try {
      const token = Cookies.get('token');
      
      if (!token) {
        message.error('No authentication token found. Please log in again.');
        return;
      }

      const formattedValues = {
        ...values,
        delai: values.delai?.format('YYYY-MM-DD'),
        competence_ids: values.competence_ids || []
      };

      await axios.post('http://localhost:5000/api/admin/projects', formattedValues, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      
      message.success('Project added successfully');
      setAddModalVisible(false);
      addForm.resetFields();
      fetchProjects();
    } catch (error) {
      console.error('Add project error:', error);
      handleApiError(error);
    }
  };

  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'nom_projet',
      key: 'nom_projet',
    },
    {
      title: 'Deadline',
      dataIndex: 'delai',
      key: 'delai',
      render: (delai) => delai ? new Date(delai).toLocaleDateString() : 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'statut',
      key: 'statut',
      render: (status) => {
        const colorMap = {
          'In Progress': 'blue',
          'Completed': 'green',
          'Pending': 'orange',
          'On Hold': 'red'
        };
        return <Tag color={colorMap[status] || 'default'}>{status || 'Unknown'}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          icon={<EyeOutlined />} 
          onClick={() => navigate(`/admin/projects/${record.id}`)}
        >
          View Details
        </Button>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>Manage Projects</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setAddModalVisible(true)}
        >
          Add Project
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={projects} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Add New Project"
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        footer={null}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={onFinishAdd}
        >
          <Form.Item
            name="nom_projet"
            label="Project Name"
            rules={[{ required: true, message: 'Please input project name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Project Description"
            rules={[{ required: true, message: 'Please input project description' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="delai"
            label="Deadline"
            rules={[{ required: true, message: 'Please select deadline' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="statut"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Option value="Pending">Pending</Option>
              <Option value="In Progress">In Progress</Option>
              <Option value="Completed">Completed</Option>
              <Option value="On Hold">On Hold</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="budget"
            label="Budget"
            rules={[{ required: true, message: 'Please input project budget' }]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              min={0} 
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="competence_ids"
            label="Required Competences"
          >
            <Select mode="multiple">
              {competences.map(comp => (
                <Option key={comp.id} value={comp.id.toString()}>
                  {comp.nom_competence}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Project
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageProjects;