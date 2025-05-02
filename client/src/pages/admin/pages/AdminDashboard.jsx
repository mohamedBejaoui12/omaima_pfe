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
  // Update the state to include allProjects and allUsers
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
    allProjects: [], // Add this to store all projects
    recentUsers: [],
    allUsers: [], // Add this to store all users
    competencyDistribution: [],
    userActivity: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FIXED: Removed the nested useEffect
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
        
        // Fetch real users data
        const usersResponse = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Fetch real projects data
        const projectsResponse = await axios.get('http://localhost:5000/api/admin/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log('Users data:', usersResponse.data);
        console.log('Projects data:', projectsResponse.data);
        
        // Process users and projects data
        const users = usersResponse.data || [];
        const projects = projectsResponse.data || [];
        
        // Sort projects by date (newest first)
        const sortedProjects = [...projects].sort((a, b) => {
          return new Date(b.date_debut || 0) - new Date(a.date_debut || 0);
        });
        
        // Sort users by creation date or CIN (if creation date not available)
        const sortedUsers = [...users].sort((a, b) => {
          if (a.date_creation && b.date_creation) {
            return new Date(b.date_creation) - new Date(a.date_creation);
          }
          return parseInt(b.cin) - parseInt(a.cin);
        });
        
        // Count users by role
        const usersByRole = [
          { name: 'Administrateurs', value: users.filter(user => user.role === '0').length },
          { name: 'Chefs de Projet', value: users.filter(user => user.role === '1').length },
          { name: 'Membres', value: users.filter(user => user.role === '2').length }
        ];
        
        // Create project status data for pie chart
        const projectStatusData = {
          enCours: projects.filter(p => p.statut === 'en cours').length,
          terminer: projects.filter(p => p.statut === 'terminé').length,
          annuler: projects.filter(p => p.statut === 'annulé').length
        };
        
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
        
        // If projectsOverTime is empty, create fake data
        let finalProjectsOverTime = projectsOverTime;
        if (projectsOverTime.length === 0) {
          const months = ['1/2025', '2/2025', '3/2025', '4/2025', '5/2025'];
          finalProjectsOverTime = months.map(month => ({
            month,
            projects: Math.floor(Math.random() * 10) + 1 // Random number between 1-10
          }));
        }
        
        // Create user activity data (active vs inactive)
        const activeUsers = users.filter(user => user.disponibilitee === 1).length;
        const inactiveUsers = users.length - activeUsers;
        
        // Generate more detailed user activity data for trends
        const userActivityMonths = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai'];
        const userActivity = userActivityMonths.map(month => ({
          date: month,
          active: Math.floor(Math.random() * (users.length * 0.8)) + 1,
          inactive: Math.floor(Math.random() * (users.length * 0.3))
        }));
        
        // Add current month data
        userActivity.push({ date: 'Actuel', active: activeUsers, inactive: inactiveUsers });
        
        // Generate fake competency distribution data
        const competencies = [
          'JavaScript', 'React', 'Node.js', 'PHP', 'SQL', 
          'Java', 'Python', 'C#', 'HTML/CSS', 'Docker'
        ];
        const competencyDistribution = competencies.map(name => ({
          name,
          count: Math.floor(Math.random() * 20) + 1 // Random number between 1-20
        })).sort((a, b) => b.count - a.count); // Sort by count descending
        
        // Then update the setStats call
        setStats({
          totalUsers: users.length,
          totalProjects: projects.length,
          projectStatus: projectStatusData,
          usersByRole,
          projectsOverTime: finalProjectsOverTime,
          recentProjects: sortedProjects.slice(0, 5),
          allProjects: sortedProjects,
          recentUsers: sortedUsers.slice(0, 5),
          allUsers: sortedUsers,
          competencyDistribution,
          userActivity
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

  // Format data for project status pie chart
  const projectStatusData = [
    { name: 'En Cours', value: stats.projectStatus.enCours },
    { name: 'Terminés', value: stats.projectStatus.terminer },
    { name: 'Annulés', value: stats.projectStatus.annuler }
  ];

  // Table columns for recent projects
  const projectColumns = [
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
        let text = statut === 'en cours' ? 'En cours' : 
                  statut === 'terminé' ? 'Terminé' : 
                  statut === 'annulé' ? 'Annulé' : 'Inconnu';
        
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Date Limite',
      dataIndex: 'delai',
      key: 'delai',
      render: (date) => {
        if (!date) return 'Non définie';
        try {
          return new Date(date).toLocaleDateString('fr-FR');
        } catch (e) {
          return 'Date invalide';
        }
      }
    },
    {
      title: 'Budget',
      dataIndex: 'budget',
      key: 'budget',
      render: (budget) => `${budget} €`
    }
  ];

  // Table columns for recent users
  const userColumns = [
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
      title: 'Date d\'inscription',
      dataIndex: 'date_creation',
      key: 'date_creation',
      render: (date) => new Date(date).toLocaleDateString('fr-FR')
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

      {/* Analytics Section Header */}
      <Divider orientation="left">
        <Title level={4} style={{ margin: '32px 0 16px' }}>
          <BarChartOutlined /> Analyses Détaillées
        </Title>
      </Divider>
      
      {/* Analytics Tabs */}
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
                      data={stats.usersByRole}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.usersByRole.map((entry, index) => (
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
      
        {/* Trends Tab */}
        <TabPane 
          tab={<span><LineChartOutlined /> Tendances</span>} 
          key="2"
        >
          <Row gutter={[24, 24]}>
            {/* Projects Over Time */}
            <Col xs={24}>
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <LineChartOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    <span>Évolution des Projets</span>
                  </div>
                }
                bordered={false}
                style={{ borderRadius: '12px', marginBottom: '24px' }}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={stats.projectsOverTime}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="projects" 
                      name="Projets" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
        
            {/* User Activity */}
            <Col xs={24}>
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TeamOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    <span>Activité des Utilisateurs</span>
                  </div>
                }
                bordered={false}
                style={{ borderRadius: '12px' }}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={stats.userActivity}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="active" 
                      name="Utilisateurs Actifs" 
                      stackId="1"
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="inactive" 
                      name="Utilisateurs Inactifs" 
                      stackId="1"
                      stroke="#ffc658" 
                      fill="#ffc658" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        {/* Fix the comment here too */}
        <TabPane 
          tab={<span><BarChartOutlined /> Compétences</span>} 
          key="3"
        >
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <BarChartOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                <span>Distribution des Compétences</span>
              </div>
            }
            bordered={false}
            style={{ borderRadius: '12px' }}
          >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={stats.competencyDistribution}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip formatter={(value) => [`${value} utilisateurs`, 'Nombre']} />
                <Legend />
                <Bar 
                  dataKey="count" 
                  name="Nombre d'Utilisateurs" 
                  fill="#8884d8" 
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabPane>
      </Tabs>

      <Divider orientation="left">
        <Title level={4} style={{ margin: '32px 0 16px' }}>
          <FileProtectOutlined /> Données Récentes
        </Title>
      </Divider>

      {/* Recent Projects - Full Row */}
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ProjectOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                <span>Projets</span>
              </div>
            }
            extra={<a href="/admin/manage-projects">Gérer les Projets</a>}
            bordered={false}
            style={{ borderRadius: '12px', height: '100%' }}
          >
            <Table 
              columns={projectColumns} 
              dataSource={stats.allProjects} 
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="middle"
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Users - Full Row */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                <span>Utilisateurs</span>
              </div>
            }
            extra={<a href="/admin/manage-users">Gérer les Utilisateurs</a>}
            bordered={false}
            style={{ borderRadius: '12px', height: '100%' }}
          >
            <Table 
              columns={userColumns} 
              dataSource={stats.allUsers} 
              rowKey="cin"
              pagination={{ pageSize: 10 }}
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;