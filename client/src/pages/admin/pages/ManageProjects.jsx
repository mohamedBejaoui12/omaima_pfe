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
  DatePicker,
  InputNumber,
  Tag,
  Space
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined,
  PlusOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import Cookies from 'js-cookie';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [competences, setCompetences] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();

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

  const handleEdit = (project) => {
    setSelectedProject(project);
    form.setFieldsValue({
      ...project,
      delai: project.delai ? moment(project.delai) : null,
      competence_ids: project.competences?.map(comp => comp.id.toString())
    });
    setEditModalVisible(true);
  };

  const handleAdd = () => {
    addForm.resetFields();
    setAddModalVisible(true);
  };

  const handleDelete = async (project) => {
    try {
      const token = Cookies.get('token');
      
      if (!token) {
        message.error('Authentication token not found. Please log in again.');
        return;
      }
  
      const confirmed = window.confirm(`Are you sure you want to delete project "${project.nom_projet}"?`);
      
      if (!confirmed) return;
  
      await axios.delete(`http://localhost:5000/api/admin/projects/${project.id}`, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
  
      message.success(`Project "${project.nom_projet}" deleted successfully`);
      fetchProjects();
  
    } catch (error) {
      console.error('Delete project error:', error);
      handleApiError(error);
    }
  };

  const onFinishEdit = async (values) => {
    try {
      const token = Cookies.get('token');
      
      if (!token) {
        message.error('No authentication token found. Please log in again.');
        return;
      }

      const formattedValues = {
        ...values,
        delai: values.delai?.format('YYYY-MM-DD'),
        competence_ids: values.competence_ids
      };

      await axios.put(`http://localhost:5000/api/admin/projects/${selectedProject.id}`, formattedValues, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      
      message.success('Project updated successfully');
      setEditModalVisible(false);
      fetchProjects();
    } catch (error) {
      console.error('Update project error:', error);
      handleApiError(error);
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
        competence_ids: values.competence_ids
      };

      await axios.post('http://localhost:5000/api/admin/projects', formattedValues, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      
      message.success('Project added successfully');
      setAddModalVisible(false);
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
      ellipsis: true,
      width: '15%',
      sorter: (a, b) => a.nom_projet.localeCompare(b.nom_projet)
    },
    { 
      title: 'Description', 
      dataIndex: 'description', 
      key: 'description',
      ellipsis: true,
      width: '25%'
    },
    {
      title: 'Competences',
      dataIndex: 'competences',
      key: 'competences',
      ellipsis: true,
      width: '15%',
      render: (_, record) => (
        <Space size={[0, 4]} wrap>
          {record.competences?.map((comp) => (
            <Tag color="blue" key={comp.id}>
              {comp.nom_competence}
            </Tag>
          ))}
        </Space>
      )
    },
    { 
      title: 'Deadline', 
      dataIndex: 'delai', 
      key: 'delai',
      ellipsis: true,
      width: '12%',
      render: (date) => date ? moment(date).format('DD/MM/YYYY') : 'Not set',
      sorter: (a, b) => moment(a.delai).unix() - moment(b.delai).unix()
    },
    {
      title: 'Budget',
      dataIndex: 'budget',
      key: 'budget',
      ellipsis: true,
      width: '12%',
      render: (budget) => `${budget.toLocaleString()} DH`,
      sorter: (a, b) => a.budget - b.budget
    },
    { 
      title: 'Status', 
      dataIndex: 'statut', 
      key: 'statut',
      ellipsis: true,
      width: '10%',
      render: (status) => {
        const statusColors = {
          'en cours': '#1890ff',
          'terminé': '#52c41a',
          'annulé': '#ff4d4f'
        };
        return (
          <span style={{ color: statusColors[status] }}>
            {status.toUpperCase()}
          </span>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: '11%',
      render: (_, record) => (
        <div style={{ whiteSpace: 'nowrap' }}>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          <Button 
            icon={<DeleteOutlined />} 
            danger 
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  const projectForm = (
    <>
      <Form.Item 
        name="nom_projet" 
        label="Project Name"
        rules={[{ required: true, message: 'Please input project name' }]}
      >
        <Input />
      </Form.Item>
      
      <Form.Item 
        name="description" 
        label="Description"
        rules={[{ required: true, message: 'Please input project description' }]}
      >
        <TextArea rows={4} />
      </Form.Item>

      <Form.Item 
        name="competence_ids" 
        label="Required Competences"
        rules={[{ required: true, message: 'Please select at least one competence' }]}
      >
        <Select
          mode="multiple"
          placeholder="Select competences"
          style={{ width: '100%' }}
          optionFilterProp="children"
        >
          {competences.map(comp => (
            <Option key={comp.id} value={comp.id.toString()}>
              {comp.nom_competence}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item 
        name="delai" 
        label="Deadline"
        rules={[{ required: true, message: 'Please select deadline' }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item 
        name="budget" 
        label="Budget (DH)"
        rules={[{ required: true, message: 'Please input project budget' }]}
      >
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          step={1000}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
        />
      </Form.Item>

      <Form.Item 
        name="statut" 
        label="Status"
        rules={[{ required: true, message: 'Please select project status' }]}
      >
        <Select>
          <Option value="en cours">En cours</Option>
          <Option value="terminé">Terminé</Option>
          <Option value="annulé">Annulé</Option>
        </Select>
      </Form.Item>
    </>
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Manage Projects</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add Project
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={projects} 
        rowKey="id"
        scroll={{ x: 'max-content' }}        pagination={{
          pageSize: 10,
          position: ['bottomCenter'],
          showSizeChanger: true,
          showQuickJumper: true
        }}
      />

      <Modal
        title="Edit Project"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinishEdit}
        >
          {projectForm}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Project
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add New Project"
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        footer={null}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={onFinishAdd}
        >
          {projectForm}
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