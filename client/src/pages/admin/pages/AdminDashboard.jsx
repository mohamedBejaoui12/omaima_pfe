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
        Admin Dashboard
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
              transition: 'transform 0.3s ease',
            }}
            hoverable
          >
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
              valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#1890ff' }}
            />
          </Card>
        </Col>

        {/* Total Projects */}
        <Col span={12}>
          <Card
            bordered={false}
            style={{
              background: '#e6fffb',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease',
            }}
            hoverable
          >
            <Statistic
              title="Total Projects"
              value={stats.totalProjects}
              prefix={<ProjectOutlined style={{ fontSize: '24px', color: '#13c2c2' }} />}
              valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#13c2c2' }}
            />
          </Card>
        </Col>

        {/* Projects En Cours */}
        <Col span={8}>
          <Card
            bordered={false}
            style={{
              background: '#fff7e6',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease',
            }}
            hoverable
          >
            <Statistic
              title="Projects En Cours"
              value={stats.projectStatus.enCours}
              prefix={<SyncOutlined spin style={{ fontSize: '24px', color: '#faad14' }} />}
              valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#faad14' }}
            />
          </Card>
        </Col>

        {/* Projects Annulés */}
        <Col span={8}>
          <Card
            bordered={false}
            style={{
              background: '#fff1f0',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease',
            }}
            hoverable
          >
            <Statistic
              title="Projects Annulés"
              value={stats.projectStatus.annuler}
              prefix={<CloseCircleOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />}
              valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#ff4d4f' }}
            />
          </Card>
        </Col>

        {/* Projects Terminés */}
        <Col span={8}>
          <Card
            bordered={false}
            style={{
              background: '#f6ffed',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease',
            }}
            hoverable
          >
            <Statistic
              title="Projects Terminés"
              value={stats.projectStatus.terminer}
              prefix={<CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />}
              valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;