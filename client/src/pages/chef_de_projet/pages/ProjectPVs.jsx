import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Table,
  Typography,
  Button,
  Space,
  message,
  Card,
  Descriptions,
} from 'antd';
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import Cookies from 'js-cookie';

const { Title } = Typography;

function ProjectPVs() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [pvList, setPvList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
    fetchProjectPVs();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get(`http://localhost:5000/api/project-manager/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(response.data);
    } catch (error) {
      message.error("Échec du chargement des détails du projet");
    }
  };

  const fetchProjectPVs = async () => {
    setLoading(true);
    try {
      const token = Cookies.get('token');
      const response = await axios.get(`http://localhost:5000/api/pv/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPvList(response.data);
    } catch (error) {
      message.error("Échec du chargement des PVs");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Nom du fichier',
      dataIndex: 'file_name',
      key: 'file_name',
    },
    {
      title: 'Date d\'upload',
      dataIndex: 'upload_date',
      key: 'upload_date',
      render: (date) => new Date(date).toLocaleString('fr-FR'),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => window.open(`http://localhost:5000/${record.file_path}`, '_blank')}
        >
          Télécharger
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/chef-de-projet/projets')}
          >
            Retour
          </Button>
          <Title level={2} style={{ margin: 0 }}>PVs du Projet</Title>
        </Space>

        {project && (
          <Card>
            <Descriptions title="Détails du projet" bordered>
              <Descriptions.Item label="Nom du projet">{project.nom_projet}</Descriptions.Item>
              <Descriptions.Item label="Description">{project.description}</Descriptions.Item>
              <Descriptions.Item label="Statut">{project.statut}</Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        <Table
          columns={columns}
          dataSource={pvList}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Space>
    </div>
  );
}

export default ProjectPVs;