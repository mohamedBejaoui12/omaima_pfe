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
        // Update message texts
        message.error('Aucun jeton d\'authentification trouvé. Veuillez vous reconnecter.');
        message.error('Vous n\'avez pas la permission de voir les compétences');
        message.error('Échec de la récupération des compétences');
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

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Title level={2}>Gérer les Compétences</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          style={{ borderRadius: '8px' }}
        >
          Ajouter une Compétence
        </Button>
      </div>

      <Table
        columns={[
          {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
          },
          {
            title: 'Nom de la Compétence',
            dataIndex: 'nom_competence',
            key: 'nom_competence',
          },
          {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
              <span>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                  style={{ marginRight: '8px' }}
                >
                  Modifier
                </Button>
                <Popconfirm
                  title="Êtes-vous sûr de vouloir supprimer cette compétence?"
                  onConfirm={() => handleDelete(record)}
                  okText="Oui"
                  cancelText="Non"
                >
                  <Button type="primary" danger icon={<DeleteOutlined />}>
                    Supprimer
                  </Button>
                </Popconfirm>
              </span>
            ),
          },
        ]}
        dataSource={competences.map(comp => ({ ...comp, key: comp.id }))}
        loading={loading}
        pagination={{ pageSize: 10 }}
        rowKey="id"
      />

      <Modal
        title={editMode ? "Modifier la Compétence" : "Ajouter une Nouvelle Compétence"}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Annuler
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => form.submit()}
            loading={loading}
          >
            {editMode ? "Mettre à jour" : "Ajouter"}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleModalOk}
        >
          <Form.Item
            name="nom_competence"
            label="Nom de la Compétence"
            rules={[
              {
                required: true,
                message: 'Veuillez entrer le nom de la compétence',
              },
            ]}
          >
            <Input placeholder="Entrez le nom de la compétence" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
);
};

export default CompetencesPage;