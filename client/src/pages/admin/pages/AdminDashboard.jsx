import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Statistic, Spin, Alert, Tabs, Table, Tag, Divider } from 'antd';
import {
  UserOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  TeamOutlined,
  RiseOutlined,
  CalendarOutlined,
  FileProtectOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import Cookies from 'js-cookie';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Custom colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const PROJECT_STATUS_COLORS = {
  'en cours': '#1890ff',
  'terminé': '#52c41a',
  'annulé': '#ff4d4f'
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    projectStatus: {
      enCours: 0,
      annuler: 0,
      terminer: 0,
    },
    usersByRole: [],
    projectsOverTime: [],
    recentProjects: [],
    recentUsers: [],
    competencyDistribution: [],
    userActivity: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = Cookies.get('token');
        if (!token) {
          setError('Aucun jeton trouvé. Veuillez vous reconnecter.');
          setLoading(false);
          return;
        }

        // Validate token structure
        try {
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          if (!decodedToken.cin || !decodedToken.role) {
            Cookies.remove('token');
            setError('Structure de jeton invalide. Veuillez vous reconnecter.');
            setLoading(false);
            return;
          }
        } catch (e) {
          Cookies.remove('token');
          setError('Format de jeton invalide. Veuillez vous reconnecter.');
          setLoading(false);
          return;
        }

        // Fetch dashboard statistics
        const response = await axios.get('http://localhost:5000/api/admin/dashboard-stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Raw data from backend:', response.data);
        
        // Get the basic stats from the response
        const basicStats = response.data || {};
        
        // Fetch additional data for charts and tables
        const usersResponse = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const projectsResponse = await axios.get('http://localhost:5000/api/admin/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Instead of making separate API calls for competency data,
        // let's modify to use the data we already have or can get from existing endpoints
        
        console.log('Users data:', usersResponse.data);
        console.log('Projects data:', projectsResponse.data);
        
        // Process users and projects data
        const users = usersResponse.data || [];
        const projects = projectsResponse.data || [];
        
        // Count users by role
        const usersByRole = [
          { name: 'Admin', value: users.filter(user => user.role === '0').length },
          { name: 'Chef de Projet', value: users.filter(user => user.role === '1').length },
          { name: 'Membre', value: users.filter(user => user.role === '2').length }
        ];
        
        // Create project status data for pie chart
        const projectStatusData = [
          { name: 'En Cours', value: basicStats.projectStatus?.enCours || 0 },
          { name: 'Terminés', value: basicStats.projectStatus?.terminer || 0 },
          { name: 'Annulés', value: basicStats.projectStatus?.annuler || 0 }
        ];
        
        // Create projects over time data (by month)
        const projectsByMonth = {};
        projects.forEach(project => {
          if (project.date_debut) {
            const date = new Date(project.date_debut);
            const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
            projectsByMonth[monthYear] = (projectsByMonth[monthYear] || 0) + 1;
          }
        });
        
        const projectsOverTime = Object.keys(projectsByMonth).map(month => ({
          month,
          projects: projectsByMonth[month]
        })).sort((a, b) => {
          const [aMonth, aYear] = a.month.split('/');
          const [bMonth, bYear] = b.month.split('/');
          return new Date(aYear, aMonth - 1) - new Date(bYear, bMonth - 1);
        });
        
        // Create user activity data (active vs inactive)
        const activeUsers = users.filter(user => user.disponibilitee === 1).length;
        const inactiveUsers = users.length - activeUsers;
        
        const userActivity = [
          { date: 'Actuel', active: activeUsers, inactive: inactiveUsers }
        ];
        
        // Check if competency data is available in the dashboard stats
        let competencyDistribution = [];
        if (basicStats.competencyDistribution) {
          competencyDistribution = basicStats.competencyDistribution;
        } else {
          // If not available, we'll leave it empty for now
          // The backend should be updated to include this data
          console.log('Competency distribution data not available in dashboard stats');
        }
        
        // Combine all data
        setStats({
          totalUsers: basicStats.totalUsers || 0,
          totalProjects: basicStats.totalProjects || 0,
          projectStatus: basicStats.projectStatus || { enCours: 0, annuler: 0, terminer: 0 },
          usersByRole,
          projectStatusData,
          projectsOverTime,
          recentProjects: projects.slice(0, 5), // Get 5 most recent
          recentUsers: users.slice(0, 5), // Get 5 most recent
          userActivity,
          competencyDistribution
        });
        
        setLoading(false);
      } catch (error) {
        console.error(
          'Échec du chargement des statistiques du tableau de bord',
          error.response?.data || error.message
        );
        setError('Échec du chargement des données. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  // Use the project status data we created
  const projectStatusData = stats.projectStatusData || [
    { name: 'En Cours', value: stats.projectStatus?.enCours || 0 },
    { name: 'Terminés', value: stats.projectStatus?.terminer || 0 },
    { name: 'Annulés', value: stats.projectStatus?.annuler || 0 }
  ];

  // Table columns for recent projects - using exact database field names
  const projectColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Nom du Projet',
      dataIndex: 'nom_projet',
      key: 'nom_projet',
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (statut) => {
        let color = PROJECT_STATUS_COLORS[statut] || 'default';
        return <Tag color={color}>{statut}</Tag>;
      }
    },
    {
      title: 'Date de Début',
      dataIndex: 'delai',
      key: 'delai',
      render: (date) => date ? new Date(date).toLocaleDateString('fr-FR') : 'N/A'
    },
    {
      title: 'Budget',
      dataIndex: 'budget',
      key: 'budget',
      render: (budget) => `${budget} €`
    }
  ];

  // Table columns for recent users - using exact database field names
  const userColumns = [
    {
      title: 'CIN',
      dataIndex: 'cin',
      key: 'cin',
    },
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Poste',
      dataIndex: 'poste',
      key: 'poste',
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color = role === '0' ? 'red' : role === '1' ? 'blue' : 'green';
        let text = role === '0' ? 'Admin' : role === '1' ? 'Chef de Projet' : 'Membre';
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Disponibilité',
      dataIndex: 'disponibilitee',
      key: 'disponibilitee',
      render: (disponible) => disponible ? 
        <Tag color="green">Disponible</Tag> : 
        <Tag color="red">Non Disponible</Tag>
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Chargement des statistiques..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Erreur"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

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

      {/* Key Metrics Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              height: '100%',
            }}
          >
            <Statistic
              title={<Text style={{ color: 'white' }}>Utilisateurs Totaux</Text>}
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: 'white', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
    
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              height: '100%',
            }}
          >
            <Statistic
              title={<Text style={{ color: 'white' }}>Projets Totaux</Text>}
              value={stats.totalProjects}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: 'white', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
    
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              height: '100%',
            }}
          >
            <Statistic
              title={<Text style={{ color: 'white' }}>Projets En Cours</Text>}
              value={stats.projectStatus.enCours}
              prefix={<SyncOutlined />}
              valueStyle={{ color: 'white', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
    
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              height: '100%',
            }}
          >
            <Statistic
              title={<Text style={{ color: 'white' }}>Projets Terminés</Text>}
              value={stats.projectStatus.terminer}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: 'white', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">
        <Title level={4} style={{ margin: '32px 0 16px' }}>
          <BarChartOutlined /> Analyses Détaillées
        </Title>
      </Divider>

      <Tabs defaultActiveKey="1" type="card" style={{ marginBottom: '24px' }}>
        <TabPane 
          tab={<span><PieChartOutlined /> Vue d'ensemble</span>} 
          key="1"
        >
          <Row gutter={[24, 24]}>
            {/* Project Status Distribution */}
            <Col xs={24} md={12}>
              <Card 
                title="Distribution des Statuts de Projets" 
                bordered={false}
                style={{ borderRadius: '12px', height: '100%' }}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} projets`, 'Quantité']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* User Role Distribution */}
            <Col xs={24} md={12}>
              <Card 
                title="Distribution des Rôles Utilisateurs" 
                bordered={false}
                style={{ borderRadius: '12px', height: '100%' }}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.usersByRole || []}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(stats.usersByRole || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} utilisateurs`, 'Quantité']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      <Divider orientation="left">
        <Title level={4} style={{ margin: '32px 0 16px' }}>
          <FileProtectOutlined /> Données Récentes
        </Title>
      </Divider>

      <Row gutter={[24, 24]}>
        {/* Recent Projects */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ProjectOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                <span>Projets Récents</span>
              </div>
            }
            extra={<a href="/admin/manage-projects">Voir Tous</a>}
            bordered={false}
            style={{ borderRadius: '12px', height: '100%' }}
          >
            <div style={{ overflowX: 'auto' }}>
              <Table 
                columns={projectColumns} 
                dataSource={stats.recentProjects || []} 
                rowKey="id"
                pagination={false}
                size="small"
                scroll={{ x: 'max-content' }}
              />
            </div>
          </Card>
        </Col>

        {/* Recent Users */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                <span>Utilisateurs Récents</span>
              </div>
            }
            extra={<a href="/admin/manage-users">Voir Tous</a>}
            bordered={false}
            style={{ borderRadius: '12px', height: '100%' }}
          >
            <div style={{ overflowX: 'auto' }}>
              <Table 
                columns={userColumns} 
                dataSource={stats.recentUsers || []} 
                rowKey="cin"
                pagination={false}
                size="small"
                scroll={{ x: 'max-content' }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;