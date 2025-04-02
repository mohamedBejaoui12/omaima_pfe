import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { 
  Card, 
  Typography, 
  List, 
  Avatar, 
  Button, 
  Spin, 
  Tag, 
  Alert,
  Progress,
  Collapse,
  Input,
  message,
  Tooltip,
  Descriptions,
  Modal,
  Row,
  Col,
  Divider,
  Space,
  Statistic
} from 'antd';
import { 
  UserOutlined, 
  CheckCircleOutlined,
  InfoCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  ProjectOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

const MemberDetailModal = ({ member, visible, onClose }) => {
  if (!member) return null;

  const renderSkillBadge = (skill) => {
    const levelColors = {
      'Expert': 'green',
      'Advanced': 'blue',
      'Intermediate': 'orange',
      'Beginner': 'gray'
    };

    return (
      <Tooltip 
        key={skill.name} 
        title={`Niveau de compétence: ${skill.level}`}
      >
        <Tag color={levelColors[skill.level] || 'default'}>
          {skill.name}
        </Tag>
      </Tooltip>
    );
  };

  return (
    <Modal
      title={`${member.name} - Profil Complet`}
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>Fermer</Button>
      ]}
      width={800}
    >
      <Row gutter={16}>
        <Col span={8}>
          <Avatar 
            size={200} 
            icon={<UserOutlined />} 
            src={member.imageUrl} 
          />
        </Col>
        <Col span={16}>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Nom">
              <Typography.Title level={4}>{member.name}</Typography.Title>
            </Descriptions.Item>
            <Descriptions.Item label="Poste">
              <Tag color="processing">{member.contact.position}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Contact">
              <Space>
                <Tooltip title="Email">
                  <MailOutlined /> {member.email}
                </Tooltip>
                <Tooltip title="Téléphone">
                  <PhoneOutlined /> {member.contact.phone || 'Non fourni'}
                </Tooltip>
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>

      <Divider orientation="left">Compétences Professionnelles</Divider>
      <Space size={[8, 16]} wrap>
        {member.competencies?.map(renderSkillBadge)}
      </Space>

      <Divider orientation="left">Expérience de Projet</Divider>
      <List
        size="small"
        header={`Projets Totaux: ${member.projectCount}`}
        bordered
        dataSource={member.previousProjects}
        renderItem={(project) => (
          <List.Item>
            <ProjectOutlined /> {project}
          </List.Item>
        )}
      />

      <Divider orientation="left">Recommandation IA</Divider>
      {member.recommendationNotes && (
        <Alert 
          message="Analyse IA" 
          description={member.recommendationNotes}
          type="info"
          showIcon 
        />
      )}

      <Statistic 
        title="Score de Correspondance" 
        value={member.matchScore} 
        suffix="/ 100" 
        prefix={<CheckCircleOutlined />}
      />
    </Modal>
  );
};

const MemberSuggestionModal = ({ 
  projectDescription: initialProjectDescription = '', 
  visible: initialVisible = true, 
  onClose: initialOnClose = () => {}, 
  onAssign: initialOnAssign = () => {} 
}) => {
  const [projectDescription, setProjectDescription] = useState(initialProjectDescription);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [visible, setVisible] = useState(initialVisible);
  const navigate = useNavigate();

  const onClose = () => {
    setVisible(false);
    initialOnClose();
  };

  const onAssign = (member) => {
    initialOnAssign(member);
    message.success(`${member.name} a été assigné au projet avec succès!`);
    setVisible(false);
  };

  useEffect(() => {
    setProjectDescription(initialProjectDescription);
  }, [initialProjectDescription]);

  useEffect(() => {
    setVisible(initialVisible);
  }, [initialVisible]);

  const fetchSuggestedMembers = async () => {
    if (!projectDescription.trim()) {
      setError("Veuillez fournir une description de projet pour obtenir des suggestions.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const token = Cookies.get('token');
      if (!token) {
        setError("Aucun jeton d'authentification trouvé. Veuillez vous reconnecter.");
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/project-manager/suggest-members',
        { projectDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && Array.isArray(response.data)) {
        setMembers(response.data);
      } else {
        setError("Format de réponse inattendu du serveur.");
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des suggestions de membres:', error);
      setError(error.response?.data?.message || "Échec de la récupération des suggestions de membres.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (member) => {
    setSelectedMember(member);
    setDetailModalVisible(true);
  };

  const handleAssignMember = async (member) => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        message.error("Aucun jeton d'authentification trouvé. Veuillez vous reconnecter.");
        return;
      }

      const userCookie = Cookies.get('user');
      const currentUser = userCookie ? JSON.parse(userCookie) : null;
      
      if (!currentUser || !currentUser.cin) {
        message.error("Informations utilisateur non disponibles. Veuillez vous reconnecter.");
        return;
      }

      // Récupérer le projet actuel du chef de projet
      const projectResponse = await axios.get(
        'http://localhost:5000/api/project-manager/current-project',
        { 
          headers: { Authorization: `Bearer ${token}` },
          params: { managerCin: currentUser.cin }
        }
      );

      if (!projectResponse.data || !projectResponse.data.id) {
        message.error("Aucun projet actif trouvé pour ce chef de projet.");
        return;
      }

      const projectId = projectResponse.data.id;

      // Assigner le membre au projet
      await axios.post(
        'http://localhost:5000/api/project-manager/assign-project-member',
        {
          memberId: member.id,
          projectId: projectId,
          managerCin: currentUser.cin
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success(`${member.name} a été assigné au projet avec succès!`);
      onAssign(member);
      
      // Rediriger vers la page des membres du projet
      navigate('/chef-de-projet/members');
    } catch (error) {
      console.error('Erreur lors de l\'assignation du membre:', error);
      message.error(error.response?.data?.message || "Échec de l'assignation du membre au projet.");
    }
  };

  return (
    <Modal
      title="Suggérer des Membres pour le Projet"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={4}>Description du Projet</Title>
          <TextArea
            rows={4}
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Décrivez votre projet, y compris les technologies, les compétences requises et les objectifs..."
          />
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Button 
              type="primary" 
              onClick={fetchSuggestedMembers}
              loading={loading}
            >
              Trouver des Membres Correspondants
            </Button>
          </div>
        </div>

        {error && (
          <Alert
            message="Erreur"
            description={error}
            type="error"
            showIcon
          />
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Recherche des meilleurs membres pour votre projet...</div>
          </div>
        ) : members.length > 0 ? (
          <>
            <Title level={4}>Membres Suggérés</Title>
            <List
              itemLayout="vertical"
              dataSource={members}
              renderItem={member => (
                <Card 
                  style={{ marginBottom: 16 }}
                  hoverable
                >
                  <List.Item
                    key={member.id}
                    actions={[
                      <Button 
                        key="details" 
                        onClick={() => handleViewDetails(member)}
                        icon={<InfoCircleOutlined />}
                      >
                        Détails
                      </Button>,
                      <Button 
                        key="assign" 
                        type="primary" 
                        onClick={() => handleAssignMember(member)}
                        icon={<CheckCircleOutlined />}
                      >
                        Assigner au Projet
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar size={64} icon={<UserOutlined />} />}
                      title={<a onClick={() => handleViewDetails(member)}>{member.name}</a>}
                      description={
                        <>
                          <div>{member.contact.position}</div>
                          <div style={{ marginTop: 8 }}>
                            <Space size={[0, 8]} wrap>
                              {member.competencies?.slice(0, 3).map((comp, index) => (
                                <Tag key={index} color="blue">{comp.name}</Tag>
                              ))}
                              {member.competencies?.length > 3 && (
                                <Tag>+{member.competencies.length - 3} plus</Tag>
                              )}
                            </Space>
                          </div>
                        </>
                      }
                    />
                    <div style={{ marginTop: 16 }}>
                      <Tooltip title={`Score de correspondance: ${member.matchScore}%`}>
                        <Progress 
                          percent={member.matchScore} 
                          status="active" 
                          strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                          }}
                        />
                      </Tooltip>
                    </div>
                  </List.Item>
                </Card>
              )}
            />
          </>
        ) : !loading && !error && (
          <Alert
            message="Aucun résultat"
            description="Entrez une description de projet et cliquez sur 'Trouver des Membres Correspondants' pour voir les suggestions."
            type="info"
            showIcon
          />
        )}
      </Space>

      <MemberDetailModal 
        member={selectedMember}
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
      />
    </Modal>
  );
};

export default MemberSuggestionModal;