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
        title={`Proficiency: ${skill.level}`}
      >
        <Tag color={levelColors[skill.level] || 'default'}>
          {skill.name}
        </Tag>
      </Tooltip>
    );
  };

  return (
    <Modal
      title={`${member.name} - Comprehensive Profile`}
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>Close</Button>
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
            <Descriptions.Item label="Name">
              <Typography.Title level={4}>{member.name}</Typography.Title>
            </Descriptions.Item>
            <Descriptions.Item label="Position">
              <Tag color="processing">{member.contact.position}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Contact">
              <Space>
                <Tooltip title="Email">
                  <MailOutlined /> {member.email}
                </Tooltip>
                <Tooltip title="Phone">
                  <PhoneOutlined /> {member.contact.phone || 'Not provided'}
                </Tooltip>
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>

      <Divider orientation="left">Professional Skills</Divider>
      <Space size={[8, 16]} wrap>
        {member.competencies?.map(renderSkillBadge)}
      </Space>

      <Divider orientation="left">Project Experience</Divider>
      <List
        size="small"
        header={`Total Projects: ${member.projectCount}`}
        bordered
        dataSource={member.previousProjects}
        renderItem={(project) => (
          <List.Item>
            <ProjectOutlined /> {project}
          </List.Item>
        )}
      />

      <Divider orientation="left">AI Recommendation</Divider>
      {member.recommendationNotes && (
        <Alert 
          message="AI Insights" 
          description={member.recommendationNotes}
          type="info"
          showIcon 
        />
      )}

      <Statistic 
        title="Match Score" 
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
  onClose: initialOnClose 
}) => {
  const [projectDescription, setProjectDescription] = useState(initialProjectDescription);
  const [visible, setVisible] = useState(initialVisible);
  const navigate = useNavigate();

  // Default close handler if not provided
  const handleClose = initialOnClose || (() => {
    setVisible(false);
    navigate('/chef-de-projet');  // Navigate back to project manager dashboard
  });

  // Add a state for project description input
  const [descriptionInput, setDescriptionInput] = useState('');

  const handleDescriptionSubmit = () => {
    if (descriptionInput.trim().length >= 10) {
      setProjectDescription(descriptionInput);
    } else {
      message.warning('Project description must be at least 10 characters long');
    }
  };

  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const fetchSuggestedMembers = async () => {
    if (!projectDescription) return;

    setLoading(true);
    try {
      const token = Cookies.get('token');
      const response = await axios.post(
        '/api/project-manager/suggest-members', 
        { projectDescription },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setMembers(response.data.members || []);
      message.success(`Found ${response.data.members.length} potential members`);
    } catch (error) {
      console.error('Member suggestion error:', error);
      message.error(error.response?.data?.message || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectDescription) {
      fetchSuggestedMembers();
    }
  }, [projectDescription]);

  const handleMemberSelect = (member) => {
    setSelectedMember(member);
    setDetailModalVisible(true);
  };

  return (
    <>
      <Modal
        title="AI-Powered Member Suggestions"
        visible={visible}
        onCancel={handleClose}
        footer={null}
        width={800}
      >
        {!projectDescription ? (
          <Card>
            <Title level={4}>Enter Project Description</Title>
            <TextArea
              rows={4}
              placeholder="Describe your project requirements, skills needed, and project goals..."
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
            />
            <Button 
              type="primary" 
              onClick={handleDescriptionSubmit}
              style={{ marginTop: 10 }}
            >
              Generate Member Suggestions
            </Button>
          </Card>
        ) : loading ? (
          <div style={{ textAlign: 'center' }}>
            <Spin size="large" />
            <p>Generating intelligent member recommendations...</p>
          </div>
        ) : members.length > 0 ? (
          <List
            grid={{ gutter: 16, column: 3 }}
            dataSource={members}
            renderItem={(member) => (
              <List.Item>
                <Card
                  hoverable
                  onClick={() => handleMemberSelect(member)}
                  cover={
                    <Avatar 
                      size={200} 
                      icon={<UserOutlined />} 
                      style={{ margin: '0 auto', display: 'block' }} 
                    />
                  }
                >
                  <Card.Meta 
                    title={member.name} 
                    description={`${member.position}`} 
                  />
                  <Progress 
                    percent={member.matchScore} 
                    status="active" 
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                  <div style={{ marginTop: 10, textAlign: 'center' }}>
                    <Tag color="blue">Match: {member.matchScore}%</Tag>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <Alert 
            message="No Members Found" 
            description="Try adjusting your project description or broadening the requirements." 
            type="warning" 
          />
        )}
      </Modal>

      <MemberDetailModal 
        member={selectedMember}
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
      />
    </>
  );
};

export default MemberSuggestionModal;