import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Typography 
} from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  ProjectOutlined 
} from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    availableMembers: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/admin/dashboard-stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <Title level={2}>Admin Dashboard</Title>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Users"
              value={stats.activeUsers}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Available Members"
              value={stats.availableMembers}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;