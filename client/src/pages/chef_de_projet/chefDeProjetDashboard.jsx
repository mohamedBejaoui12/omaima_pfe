// chefDeProjetDashboard.jsx
import React from 'react';
import { Card, Typography, Row, Col, message } from 'antd';
import { 
  ProjectOutlined, 
  TeamOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ChefDeProjetDashboard = () => {
  const navigate = useNavigate();

  const handleCardClick = (path) => {
    navigate(path);
  };

  const dashboardCards = [
    {
      title: 'Gérer les Employées',
      icon: <TeamOutlined style={{ fontSize: '36px', color: '#1890ff' }} />,
      description: 'Voir et gérer les membres de votre projet',
      path: '/chef-de-projet/members',
      color: '#e6f7ff',
    },
    {
      title: 'Suggérer des Employées',
      icon: <TeamOutlined style={{ fontSize: '36px', color: '#52c41a' }} />,
      description: 'Trouver des membres adaptés à votre projet',
      path: '/chef-de-projet/suggest-members',
      color: '#f6ffed',
    },
    {
      title: 'Mes Projets',
      icon: <ProjectOutlined style={{ fontSize: '36px', color: '#722ed1' }} />,
      description: 'Voir et gérer vos projets',
      path: '/chef-de-projet/projets',
      color: '#f9f0ff',
    },
    {
      title: 'Procès-Verbaux',
      icon: <CheckCircleOutlined style={{ fontSize: '36px', color: '#fa8c16' }} />,
      description: 'Gérer les PVs de vos projets',
      path: '/chef-de-projet/projets',
      color: '#fff7e6',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px', textAlign: 'center' }}>
        Tableau de Bord Chef de Projet
      </Title>
      
      <Row gutter={[24, 24]}>
        {dashboardCards.map((card, index) => (
          <Col xs={24} sm={12} md={12} lg={6} key={index}>
            <Card
              hoverable
              style={{ 
                background: card.color,
                borderRadius: '12px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onClick={() => handleCardClick(card.path)}
            >
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                {card.icon}
              </div>
              <Title level={4} style={{ textAlign: 'center', margin: '16px 0' }}>
                {card.title}
              </Title>
              <Text style={{ textAlign: 'center', display: 'block' }}>
                {card.description}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ChefDeProjetDashboard;