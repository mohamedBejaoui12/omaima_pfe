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

  const handleDownloadPV = async (pvId, fileName) => {
    try {
      const token = Cookies.get('token');
      message.loading({ content: 'Téléchargement en cours...', key: 'download' });
      
      console.log('Download attempt for:', { pvId, fileName });
      
      // Direct approach using axios with proper authorization
      const response = await axios({
        method: 'GET',
        url: `http://localhost:5000/api/pv/download/${pvId}`,
        headers: { 
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob',
      });
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream' 
      });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      
      // Append to the document, click, and clean up
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);
      
      message.success({ content: 'Téléchargement réussi!', key: 'download' });
    } catch (error) {
      console.error('Erreur de téléchargement:', error);
      message.error({ 
        content: "Échec du téléchargement du PV. Veuillez contacter l'administrateur.", 
        key: 'download' 
      });
    }
  };

  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || 'Aucune description',
    },
    {
      title: 'Nom du fichier',
      dataIndex: 'file_name',
      key: 'file_name',
    },
    {
      title: 'Date de création',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString('fr-FR')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => handleDownloadPV(record.id, record.file_name)}
        >
          Télécharger
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/chef-de-projet/projets')}
        style={{ marginBottom: '16px' }}
      >
        Retour aux projets
      </Button>

      {project && (
        <Card style={{ marginBottom: '24px' }}>
          <Descriptions title="Détails du Projet" bordered>
            <Descriptions.Item label="Nom du projet" span={3}>
              {project.nom_projet}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={3}>
              {project.description || 'Aucune description'}
            </Descriptions.Item>
            <Descriptions.Item label="Statut">
              {project.statut === 'en cours' ? 'En cours' : 
               project.statut === 'terminé' ? 'Terminé' : 
               project.statut === 'annulé' ? 'Annulé' : 'Inconnu'}
            </Descriptions.Item>
            <Descriptions.Item label="Date de début">
              {project.date_debut ? new Date(project.date_debut).toLocaleDateString('fr-FR') : 'Non définie'}
            </Descriptions.Item>
            <Descriptions.Item label="Date de fin">
              {project.date_fin ? new Date(project.date_fin).toLocaleDateString('fr-FR') : 'Non définie'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Title level={3}>Procès-Verbaux (PVs)</Title>
      <Table
        columns={columns}
        dataSource={pvList}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'Aucun PV trouvé pour ce projet' }}
      />
    </div>
  );
}

export default ProjectPVs;