// chefDeProjetDashboard.jsx
import React from 'react';
import { Card, Typography, Row, Col, message } from 'antd';
import { 
  ProjectOutlined, 
  UserAddOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const { Title } = Typography;

const ChefDeProjetDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      // Remove all authentication-related cookies
      Cookies.remove('token');
      Cookies.remove('user');

      // Clear any other potential cookies
      const allCookies = Cookies.get();
      Object.keys(allCookies).forEach(cookieName => {
        if (cookieName.includes('auth') || cookieName.includes('token')) {
          Cookies.remove(cookieName);
        }
      });

      // Show success message
      message.success('Logged out successfully');

      // Redirect to login page
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      message.error('Failed to log out');
    }
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <Title level={2}>Project Manager Dashboard</Title>
        <div 
          onClick={handleLogout}
          style={{ 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center',
            color: '#1890ff'
          }}
        >
          <LogoutOutlined style={{ marginRight: 8 }} />
          Logout
        </div>
      </div>
      
      <Row gutter={16}>
        <Col span={12}>
          <Link to="/chef-de-projet/suggest-members">
            <Card
              hoverable
              cover={
                <div 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: 200 
                  }}
                >
                  <UserAddOutlined style={{ fontSize: 100, color: '#1890ff' }} />
                </div>
              }
            >
              <Card.Meta 
                title="Suggest Project Members" 
                description="Find and suggest the most suitable team members for your project" 
              />
            </Card>
          </Link>
        </Col>
      </Row>
    </div>
  );
};

export default ChefDeProjetDashboard;