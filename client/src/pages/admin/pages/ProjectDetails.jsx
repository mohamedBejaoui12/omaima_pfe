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
  InputNumber
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
    Promise.all([
      fetchProjectDetails(),
      fetchCompetences(),
      fetchUsers(),
      fetchProjectManager()
    ]);
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const token = Cookies.get('token');
      
      if (!token) {
        message.error('No authentication token found. Please log in again.');
        return null;
      }

      const response = await axios.get(`http://localhost:5000/api/admin/projects/${id}`, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      
      const projectData = response.data;
      setProject(projectData);
      
      form.setFieldsValue({
        ...projectData,
        delai: projectData.delai ? moment(projectData.delai) : null,
        statut: projectData.statut,
        competence_ids: projectData.competences?.map(comp => comp.id.toString()) || [],
        budget: projectData.budget
      });

      return projectData;
    } catch (error) {
      console.error('Fetch project details error:', error);
      console.error('Error response:', error.response?.data);
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
      
      // Filter users to only include managers (role = "1")
      const managerUsers = response.data.filter(user => user.role === "1");
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
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      
      setProjectManager(response.data);
    } catch (error) {
      // It's okay if no project manager is assigned
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

      await axios.post('http://localhost:5000/api/admin/projects/assign-manager', 
        { 
          projet_id: id, 
          manager_cin: managerCin 
        },
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        }
      );
      
      message.success('Project manager assigned successfully');
      fetchProjectManager();
    } catch (error) {
      console.error('Assign project manager error:', error);
      
      // Specific error handling for manager already assigned to a project
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
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
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
        competence_ids: values.competence_ids || []
      };

      await axios.put(`http://localhost:5000/api/admin/projects/${id}`, formattedValues, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
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
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
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
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={2}>Project Details: {project.nom_projet}</Title>
        </Col>
        <Col>
          <Button type="danger" onClick={handleDelete}>Delete Project</Button>
        </Col>
      </Row>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinishUpdate}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="nom_projet"
                label="Project Name"
                rules={[{ required: true, message: 'Please input project name' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="delai"
                label="Deadline"
                rules={[{ required: true, message: 'Please select deadline' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
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
            </Col>
            <Col span={12}>
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
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
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
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Project Description"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Project
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card 
        title="Project Manager" 
        extra={
          projectManager ? (
            <Button type="link" danger onClick={handleRemoveProjectManager}>
              Remove Manager
            </Button>
          ) : null
        }
      >
        {projectManager ? (
          <div>
            <p><strong>Name:</strong> {projectManager.nom}</p>
            <p><strong>Email:</strong> {projectManager.email}</p>
            <p><strong>Assigned On:</strong> {moment(projectManager.date_assignation).format('YYYY-MM-DD HH:mm')}</p>
          </div>
        ) : (
          <Select
            style={{ width: '100%' }}
            placeholder="Assign Project Manager"
            onChange={handleAssignProjectManager}
          >
            {users.map(user => (
              <Option key={user.cin} value={user.cin}>
                {user.nom} ({user.email})
              </Option>
            ))}
          </Select>
        )}
      </Card>
    </div>
  );
};

export default ProjectDetails;