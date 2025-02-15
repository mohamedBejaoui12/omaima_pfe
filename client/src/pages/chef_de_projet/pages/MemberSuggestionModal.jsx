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
  Modal
} from 'antd';
import { 
  UserOutlined, 
  CheckCircleOutlined,
  InfoCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  ProjectOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

const MemberDetailModal = ({ member, visible, onClose }) => {
  if (!member) return null;

  return (
    <Modal
      title={`${member.name} - Profile Details`}
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Name">{member.name}</Descriptions.Item>
        <Descriptions.Item label="Email">
          <Tooltip title="Click to email">
            <a href={`mailto:${member.email}`}>
              <MailOutlined /> {member.email}
            </a>
          </Tooltip>
        </Descriptions.Item>
        
        {member.contact && (
          <>
            <Descriptions.Item label="Phone">
              <Tooltip title="Click to call">
                <a href={`tel:${member.contact.phone}`}>
                  <PhoneOutlined /> {member.contact.phone}
                </a>
              </Tooltip>
            </Descriptions.Item>
            <Descriptions.Item label="Address">
              {member.contact.address || 'Not provided'}
            </Descriptions.Item>
          </>
        )}

        <Descriptions.Item label="Competencies">
          {member.competencies?.map(comp => (
            <Tag color="blue" key={comp}>{comp}</Tag>
          ))}
        </Descriptions.Item>

        <Descriptions.Item label="Previous Projects">
          {member.previousProjects?.length > 0 ? (
            member.previousProjects.map(project => (
              <Tag color="green" icon={<ProjectOutlined />} key={project}>
                {project}
              </Tag>
            ))
          ) : (
            <Text type="secondary">No previous projects</Text>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="AI Recommendation">
          <Paragraph>
            <Text strong>Match Score: </Text>
            <Progress 
              percent={member.matchScore || 0} 
              status="active" 
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
          </Paragraph>
          <Text>{member.recommendationNotes}</Text>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

const MemberSuggestionModal = () => {
  const [projectDescription, setProjectDescription] = useState('');
  const [suggestedMembers, setSuggestedMembers] = useState([]);
  const [aiInsights, setAiInsights] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assigningMember, setAssigningMember] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const suggestMembers = async () => {
    const trimmedDescription = projectDescription.trim();
    
    if (!trimmedDescription) {
      message.error('Please provide a detailed project description');
      setError('Project description is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        'http://localhost:5000/api/project-manager/suggest-members', 
        { projectDescription: trimmedDescription }, 
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        }
      );

      setSuggestedMembers(response.data.members || []);
      setAiInsights(response.data.aiInsights || '');
    } catch (error) {
      console.error('Member Suggestion Error FULL:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: error.config
      });
      
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch suggested members';
      
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignMember = async (memberId) => {
    setAssigningMember(memberId);
    try {
      const token = Cookies.get('token');
      await axios.post(
        'http://localhost:5000/api/project-manager/assign-project-member', 
        { memberId }, 
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        }
      );
      
      message.success('Member assigned successfully');
      suggestMembers();
    } catch (error) {
      console.error('Assign Member Error:', error);
      message.error('Failed to assign member');
    } finally {
      setAssigningMember(null);
    }
  };

  return (
    <Card>
      <Title level={2}>AI-Powered Member Recommendation</Title>
      
      {/* Project Description Input */}
      <div style={{ marginBottom: 16 }}>
        <Text strong>Enter Project Description</Text>
        <TextArea 
          rows={4} 
          placeholder="Provide a detailed description of your project, including required skills, technologies, and project goals"
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
        />
        <Button 
          type="primary" 
          onClick={suggestMembers} 
          style={{ marginTop: 10 }}
          loading={isLoading}
        >
          Find Best Members
        </Button>
      </div>
      
      {error && (
        <Alert 
          message="Error" 
          description={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: 16 }}
        />
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p>Analyzing project requirements and team skills...</p>
        </div>
      ) : (
        <>
          {suggestedMembers.length === 0 ? (
            <Paragraph type="secondary">
              No matching members found. Try providing a more detailed project description.
            </Paragraph>
          ) : (
            <>
              <List
                itemLayout="horizontal"
                dataSource={suggestedMembers}
                renderItem={(member) => (
                  <List.Item
                    actions={[
                      <Button 
                        type="primary" 
                        icon={<CheckCircleOutlined />}
                        loading={assigningMember === member.id}
                        onClick={() => handleAssignMember(member.id)}
                      >
                        Assign
                      </Button>,
                      <Button 
                        type="default" 
                        icon={<InfoCircleOutlined />}
                        onClick={() => setSelectedMember(member)}
                      >
                        Details
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={
                        <div>
                          {member.name}
                          <Progress 
                            percent={member.matchScore || 0} 
                            size="small" 
                            status="active"
                            style={{ width: 100, marginLeft: 10 }}
                          />
                        </div>
                      }
                      description={
                        <>
                          <Text strong>Matched Skills: </Text>
                          {member.matchingSkills?.map(skill => (
                            <Tag color="green" key={skill}>{skill}</Tag>
                          ))}
                        </>
                      }
                    />
                  </List.Item>
                )}
              />

              <Collapse style={{ marginTop: 16 }}>
                <Panel header="AI Recommendation Insights" key="1">
                  <Paragraph>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{aiInsights}</pre>
                  </Paragraph>
                </Panel>
              </Collapse>

              {/* Member Detail Modal */}
              <MemberDetailModal 
                member={selectedMember}
                visible={!!selectedMember}
                onClose={() => setSelectedMember(null)}
              />
            </>
          )}
        </>
      )}
    </Card>
  );
};

export default MemberSuggestionModal;