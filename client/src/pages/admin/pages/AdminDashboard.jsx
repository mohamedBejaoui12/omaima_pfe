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
        
        // Mock additional data for demonstration
        // In production, these would come from the API
        const enhancedData = {
          ...response.data,
          usersByRole: [
            { name: 'Administrateurs', value: response.data.usersByRole?.admin || 5 },
            { name: 'Chefs de Projet', value: response.data.usersByRole?.projectManager || 12 },
            { name: 'Membres', value: response.data.usersByRole?.member || response.data.totalUsers - 17 }
          ],
          projectsOverTime: response.data.projectsOverTime || [
            { month: 'Jan', projects: 5 },
            { month: 'Fév', projects: 8 },
            { month: 'Mar', projects: 12 },
            { month: 'Avr', projects: 15 },
            { month: 'Mai', projects: 20 },
            { month: 'Juin', projects: 22 },
            { month: 'Juil', projects: 25 },
            { month: 'Août', projects: 28 },
            { month: 'Sep', projects: 30 },
            { month: 'Oct', projects: 32 },
            { month: 'Nov', projects: 35 },
            { month: 'Déc', projects: response.data.totalProjects }
          ],
          competencyDistribution: response.data.competencyDistribution || [
            { name: 'React', count: 18 },
            { name: 'Node.js', count: 15 },
            { name: 'Python', count: 12 },
            { name: 'Java', count: 10 },
            { name: 'Angular', count: 8 },
            { name: 'Vue.js', count: 7 }
          ],
          userActivity: response.data.userActivity || [
            { date: '2023-01', active: 15, inactive: 5 },
            { date: '2023-02', active: 18, inactive: 4 },
            { date: '2023-03', active: 20, inactive: 3 },
            { date: '2023-04', active: 25, inactive: 2 },
            { date: '2023-05', active: 30, inactive: 2 },
            { date: '2023-06', active: 35, inactive: 1 }
          ],
          recentProjects: response.data.recentProjects || [
            { id: 1, nom_projet: 'Plateforme E-learning', statut: 'en cours', date_debut: '2023-10-15' },
            { id: 2, nom_projet: 'Application Mobile', statut: 'terminé', date_debut: '2023-09-01' },
            { id: 3, nom_projet: 'Système CRM', statut: 'en cours', date_debut: '2023-11-10' },
            { id: 4, nom_projet: 'Refonte Site Web', statut: 'annulé', date_debut: '2023-08-20' }
          ],
          recentUsers: response.data.recentUsers || [
            { cin: 'AB123456', nom: 'Sophie Martin', email: 'sophie@example.com', role: '1', date_creation: '2023-11-15' },
            { cin: 'CD789012', nom: 'Thomas Dubois', email: 'thomas@example.com', role: '2', date_creation: '2023-11-10' },
            { cin: 'EF345678', nom: 'Emma Bernard', email: 'emma@example.com', role: '2', date_creation: '2023-11-05' }
          ]
        };
        
        setStats(enhancedData);
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
      title: 'Date de Début',
      dataIndex: 'date_debut',
      key: 'date_debut',
      render: (date) => new Date(date).toLocaleDateString('fr-FR')
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

        <TabPane 
          tab={<span><LineChartOutlined /> Tendances</span>} 
          key="2"
        >
          <Row gutter={[24, 24]}>
            {/* Projects Over Time */}
            <Col xs={24} lg={12}>
              <Card 
                title="Évolution des Projets" 
                bordered={false}
                style={{ borderRadius: '12px', height: '100%' }}
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
            <Col xs={24} lg={12}>
              <Card 
                title="Activité des Utilisateurs" 
                bordered={false}
                style={{ borderRadius: '12px', height: '100%' }}
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

        <TabPane 
          tab={<span><BarChartOutlined /> Compétences</span>} 
          key="3"
        >
          <Card 
            title="Distribution des Compétences" 
            bordered={false}
            style={{ borderRadius: '12px' }}
          >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={stats.competencyDistribution}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="count" 
                  name="Nombre d'Utilisateurs" 
                  fill="#8884d8" 
                  barSize={40}
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
            <Table 
              columns={projectColumns} 
              dataSource={stats.recentProjects} 
              rowKey="id"
              pagination={false}
              size="small"
            />
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
            <Table 
              columns={userColumns} 
              dataSource={stats.recentUsers} 
              rowKey="cin"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;