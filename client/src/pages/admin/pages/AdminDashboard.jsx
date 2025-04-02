import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Statistic } from 'antd';
import {
  UserOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import Cookies from 'js-cookie';

const { Title } = Typography;

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    projectStatus: {
      enCours: 0,
      annuler: 0,
      terminer: 0,
    },
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) {
          console.error('No token found in cookies');
          return;
        }

        // Clear any old tokens if they don't have the expected structure
        try {
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          if (!decodedToken.cin || !decodedToken.role) {
            Cookies.remove('token');
            console.error('Invalid token structure');
            return;
          }
        } catch (e) {
          Cookies.remove('token');
          console.error('Invalid token format');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/admin/dashboard-stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(response.data);
      } catch (error) {
        console.error(
          'Failed to fetch dashboard stats',
          error.response?.data || error.message
        );
        if (error.response?.status === 403) {
          console.error('Access denied. Please ensure you have admin privileges.');
        }
      }
    };
    fetchStats(); // Add this line to execute the fetch
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <Title
        level={2}
        style={{
          marginBottom: '32px',
          color: '#1890ff',
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        Tableau de Bord Administrateur
      </Title>
      <Row gutter={[24, 24]}>
        {/* Total Users */}
        <Col span={12}>
          <Card
            bordered={false}
            style={{
              background: '#f0f5ff',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Statistic
              title="Utilisateurs Totaux"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
    
        {/* Total Projects */}
        <Col span={12}>
          <Card
            bordered={false}
            style={{
              background: '#f6ffed',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Statistic
              title="Projets Totaux"
              value={stats.totalProjects}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
    
        {/* Projects In Progress */}
        <Col span={8}>
          <Card
            bordered={false}
            style={{
              background: '#e6f7ff',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Statistic
              title="Projets En Cours"
              value={stats.projectStatus.enCours}
              prefix={<SyncOutlined />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
    
        {/* Completed Projects */}
        <Col span={8}>
          <Card
            bordered={false}
            style={{
              background: '#f6ffed',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Statistic
              title="Projets Terminés"
              value={stats.projectStatus.terminer}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
    
        {/* Cancelled Projects */}
        <Col span={8}>
          <Card
            bordered={false}
            style={{
              background: '#fff1f0',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Statistic
              title="Projets Annulés"
              value={stats.projectStatus.annuler}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;