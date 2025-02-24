import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  message,
  Select,
  DatePicker,
  Typography,
  Card,
  Row,
  Col,
  InputNumber,
} from 'antd';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ProjectDetails = () => {
  const [project, setProject] = useState(null);
  const [competences, setCompetences] = useState([]);
  const [users, setUsers] = useState([]);
  const [projectManager, setProjectManager] = useState(null);
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([fetchProjectDetails(), fetchCompetences(), fetchUsers(), fetchProjectManager()]);
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        message.error('No authentication token found. Please log in again.');
        return null;
      }

      const response = await axios.get(`http://localhost:5000/api/admin/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const projectData = response.data;
      setProject(projectData);

      form.setFieldsValue({
        ...projectData,
        delai: projectData.delai ? moment(projectData.delai) : null,
        statut: projectData.statut,
        competence_ids: projectData.competences?.map((comp) => comp.id.toString()) || [],
        budget: projectData.budget,
      });

      return projectData;
    } catch (error) {
      console.error('Fetch project details error:', error);
      handleApiError(error);
      return null;
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
        headers: { Authorization: `Bearer ${token}` },
      });

      setCompetences(response.data);
    } catch (error) {
      console.error('Fetch competences error:', error);
      handleApiError(error);
    }
  };

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

      const managerUsers = response.data.filter((user) => user.role === '1');
      setUsers(managerUsers);
    } catch (error) {
      console.error('Fetch users error:', error);
      handleApiError(error);
    }
  };

  const fetchProjectManager = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        message.error('No authentication token found. Please log in again.');
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/admin/projects/${id}/manager`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProjectManager(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setProjectManager(null);
      } else {
        console.error('Fetch project manager error:', error);
        handleApiError(error);
      }
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

  const handleAssignProjectManager = async (managerCin) => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        message.error('No authentication token found. Please log in again.');
        return;
      }

      await axios.post(
        'http://localhost:5000/api/admin/projects/assign-manager',
        { projet_id: id, manager_cin: managerCin },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success('Project manager assigned successfully');
      fetchProjectManager();
    } catch (error) {
      console.error('Assign project manager error:', error);

      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.message || 'Cannot assign project manager';
        const existingProjectId = error.response.data.existingProjectId;

        if (existingProjectId) {
          message.error(`This manager is already assigned to another project (Project ID: ${existingProjectId})`);
        } else {
          message.error(errorMessage);
        }
      } else {
        handleApiError(error);
      }
    }
  };

  const handleRemoveProjectManager = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        message.error('No authentication token found. Please log in again.');
        return;
      }

      await axios.delete(`http://localhost:5000/api/admin/projects/${id}/manager`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success('Project manager removed successfully');
      setProjectManager(null);
    } catch (error) {
      console.error('Remove project manager error:', error);
      handleApiError(error);
    }
  };

  const onFinishUpdate = async (values) => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        message.error('No authentication token found. Please log in again.');
        return;
      }

      const formattedValues = {
        ...values,
        delai: values.delai?.format('YYYY-MM-DD'),
        competence_ids: values.competence_ids || [],
      };

      await axios.put(`http://localhost:5000/api/admin/projects/${id}`, formattedValues, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success('Project updated successfully');
      fetchProjectDetails();
    } catch (error) {
      console.error('Update project error:', error);
      handleApiError(error);
    }
  };

  const handleDelete = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        message.error('Authentication token not found. Please log in again.');
        return;
      }

      const confirmed = window.confirm(`Are you sure you want to delete project "${project.nom_projet}"?`);

      if (!confirmed) return;

      await axios.delete(`http://localhost:5000/api/admin/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success(`Project "${project.nom_projet}" deleted successfully`);
      navigate('/admin/manage-projects');
    } catch (error) {
      console.error('Delete project error:', error);
      handleApiError(error);
    }
  };

  if (!project) return <div>Loading...</div>;

  return (
    <Card
      bordered={false}
      style={{
        maxWidth: 800,
        margin: '0 auto',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        borderRadius: '16px',
        padding: '32px',
        background: '#ffffff',
      }}
    >
      <Title level={3} style={{ textAlign: 'center', color: '#1890ff' }}>
        Project Details
      </Title>

      {/* Project Information */}
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinishUpdate}
        style={{ marginTop: '24px' }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="nom_projet"
              label="Project Name"
              rules={[{ required: true, message: 'Please input project name' }]}
            >
              <Input placeholder="Enter project name" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="delai"
              label="Deadline"
              rules={[{ required: true, message: 'Please select deadline' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="statut"
              label="Status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select placeholder="Select project status">
                <Option value="en cours">En Cours</Option>
                <Option value="terminé">Terminé</Option>
                <Option value="annulé">Annulé</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="budget"
              label="Budget"
              rules={[{ required: true, message: 'Please input project budget' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                placeholder="Enter project budget"
              />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              name="description"
              label="Project Description"
              rules={[{ required: true, message: 'Please input project description' }]}
            >
              <TextArea rows={4} placeholder="Enter project description" />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              name="competence_ids"
              label="Required Competences"
            >
              <Select mode="multiple" placeholder="Select required competences">
                {competences.map((comp) => (
                  <Option key={comp.id} value={comp.id.toString()}>
                    {comp.nom_competence}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Update Button */}
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
            Update Project
          </Button>
        </Form.Item>
      </Form>

      {/* Project Manager Section */}
      <div style={{ marginTop: '32px' }}>
        <Title level={4}>Project Manager</Title>
        {projectManager ? (
          <Card
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              padding: '16px',
              background: '#f6ffed',
            }}
          >
            <p>
              <strong>Name:</strong> {projectManager.nom}
            </p>
            <p>
              <strong>Email:</strong> {projectManager.email}
            </p>
            <p>
              <strong>Assigned On:</strong>{' '}
              {moment(projectManager.date_assignation).format('YYYY-MM-DD HH:mm')}
            </p>
            <Button
              danger
              onClick={handleRemoveProjectManager}
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
              Remove Manager
            </Button>
          </Card>
        ) : (
          <Card
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              padding: '16px',
              background: '#fff7e6',
            }}
          >
            <p>No project manager assigned.</p>
            <Select
              placeholder="Select a manager to assign"
              style={{ width: '100%', marginBottom: '16px' }}
              onChange={handleAssignProjectManager}
            >
              {users.map((user) => (
                <Option key={user.cin} value={user.cin}>
                  {user.nom} ({user.email})
                </Option>
              ))}
            </Select>
          </Card>
        )}
      </div>

      {/* Delete Project Button */}
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <Button
          danger
          onClick={handleDelete}
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
          Delete Project
        </Button>
      </div>
    </Card>
  );
};

export default ProjectDetails;