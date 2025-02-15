import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Statistic } from 'antd';
import { 
  UserOutlined, 
  ProjectOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined
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
      terminer: 0
    }
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
            'Authorization': `Bearer ${token}`
          }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error.response?.data || error.message);
        if (error.response?.status === 403) {
          console.error('Access denied. Please ensure you have admin privileges.');
        }
      }
    };
    fetchStats(); // Add this line to execute the fetch
  }, []);

  return (
    <div>
      <Title level={2}>Admin Dashboard</Title>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic
              title="Total Projects"
              value={stats.totalProjects}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Projects En Cours"
              value={stats.projectStatus.enCours}
              prefix={<SyncOutlined spin />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Projects Annulés"
              value={stats.projectStatus.annuler}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Projects Terminés"
              value={stats.projectStatus.terminer}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;