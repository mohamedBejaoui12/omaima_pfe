import React, { useState, useEffect } from 'react';
import {
  Table,
  Typography,
  Button,
  Space,
  message,
  Tag,
  Modal,
  Upload,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

function Pv_Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchProjects();
  }, []);
  
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = Cookies.get('token');
      if (!token) {
        message.error("Aucun jeton d'authentification trouvé. Veuillez vous reconnecter.");
        return;
      }
  
      const response = await axios.get('http://localhost:5000/api/project-manager/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data);
    } catch (error) {
      message.error(error.response?.data?.message || "Échec du chargement des projets.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleUploadPV = async () => {
    if (!fileList.length) {
      message.error('Veuillez sélectionner un fichier');
      return;
    }
  
    const formData = new FormData();
    formData.append('pvFile', fileList[0]);
    formData.append('projectId', selectedProject.id);
    formData.append('description', `PV pour ${selectedProject.nom_projet}`);
  
    setUploading(true);
    try {
      const token = Cookies.get('token');
      await axios.post('http://localhost:5000/api/pv/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success('PV uploadé avec succès');
      setIsModalVisible(false);
      setFileList([]);
    } catch (error) {
      message.error(error.response?.data?.message || "Échec de l'upload du PV");
    } finally {
      setUploading(false);
    }
  };
  
  const columns = [
    {
      title: 'Nom du projet',
      dataIndex: 'nom_projet',
      key: 'nom_projet',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || 'Aucune description',
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (statut) => {
        let color = 'default';
        let text = 'Inconnu';
  
        switch (statut) {
          case 'en cours':
            color = 'processing';
            text = 'En cours';
            break;
          case 'terminé':
            color = 'success';
            text = 'Terminé';
            break;
          case 'annulé':
            color = 'error';
            text = 'Annulé';
            break;
          default:
            break;
        }
  
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<UploadOutlined />}
            onClick={() => {
              setSelectedProject(record);
              setIsModalVisible(true);
            }}
            disabled={record.statut !== 'en cours'}
            title={record.statut !== 'en cours' ? 'Upload PV disponible uniquement pour les projets en cours' : ''}
          >
            Upload PV
          </Button>
          <Button
            onClick={() => navigate(`/chef-de-projet/project-pvs/${record.id}`)}
          >
            Voir PVs
          </Button>
        </Space>
      ),
    },
  ];
  
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Mes Projets</Title>
      <Table
        columns={columns}
        dataSource={projects}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
  
      <Modal
        title={`Upload PV - ${selectedProject?.nom_projet}`}
        open={isModalVisible}
        onOk={handleUploadPV}
        onCancel={() => {
          setIsModalVisible(false);
          setFileList([]);
        }}
        okText="Upload"
        cancelText="Annuler"
        confirmLoading={uploading}
      >
        <Upload
          beforeUpload={(file) => {
            setFileList([file]);
            return false;
          }}
          fileList={fileList}
          onRemove={() => setFileList([])}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Sélectionner un fichier</Button>
        </Upload>
      </Modal>
    </div>
  );
}

export default Pv_Projects;