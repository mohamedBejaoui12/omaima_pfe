import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import {
  Layout,
  Menu,
  Typography,
  Avatar,
  Dropdown,
  Space,
  message,
} from 'antd';
import {
  DashboardOutlined,
  UserAddOutlined,
  UsergroupAddOutlined,
  ProjectOutlined,
  LogoutOutlined,
  QuestionCircleOutlined, // Add this import for the support tickets icon
} from '@ant-design/icons';
import Cookies from 'js-cookie';
import logo from '../../../assets/logo.png';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const AdminLayout = () => {
  const navigate = useNavigate();

  // Update the handleLogout function
  const handleLogout = () => {
    try {
      // Remove all authentication-related cookies
      Cookies.remove('token');
      Cookies.remove('user');

      // Clear any other potential cookies
      const allCookies = Cookies.get();
      Object.keys(allCookies).forEach((cookieName) => {
        if (cookieName.includes('auth') || cookieName.includes('token')) {
          Cookies.remove(cookieName);
        }
      });

      // Show success message
      message.success('Déconnecté avec succès');

      // Redirect to login page
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      message.error('Échec de la déconnexion');
    }
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined style={{ fontSize: '20px' }} />,
      label: <Link to="/admin/dashboard">Tableau de Bord</Link>,
    },
    {
      key: 'add-member',
      icon: <UserAddOutlined style={{ fontSize: '20px' }} />,
      label: <Link to="/admin/add-member">Ajouter un employée</Link>,
    },
    {
      key: 'manage-users',
      icon: <UsergroupAddOutlined style={{ fontSize: '20px' }} />,
      label: <Link to="/admin/manage-users">Gérer les Utilisateurs</Link>,
    },
    {
      key: 'manage-competences',
      icon: <ProjectOutlined style={{ fontSize: '20px' }} />,
      label: <Link to="/admin/manage-competences">Gérer les Compétences</Link>,
    },
    {
      key: 'manage-projects',
      icon: <ProjectOutlined style={{ fontSize: '20px' }} />,
      label: <Link to="/admin/manage-projects">Gérer les Projets</Link>,
    },
    
    {
      key: 'support-tickets',
      icon: <QuestionCircleOutlined style={{ fontSize: '20px' }} />,
      label: <Link to="/admin/support-tickets">Tickets de Support</Link>,
    },
  ];

  const userMenu = (
    <Menu>
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined style={{ fontSize: '18px' }} />}
        onClick={handleLogout}
      >
        Déconnexion
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout
      style={{
        minHeight: '100vh',
        fontFamily: 'Inter, sans-serif',
        background: '#f5f7fa',
      }}
    >
      {/* Sidebar */}
      <Sider
        width={240}
        theme="dark"
        style={{
          background: '#1f1f1f',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0',
            background: '#1f1f1f',
            width: '100%',
          }}
        >
          {/* Logo added here */}
          <div
            style={{
              background: 'white',
              padding: '15px',
              marginBottom: '12px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '110px',
            }}
          >
            <img 
              src={logo}
              alt="Admin Logo" 
              style={{
                width: '200px',
                height: 'auto',
                objectFit: 'contain',
              }}
            />
          </div>
          <Title
            level={3}
            style={{
              color: '#ffffff',
              margin: '0 0 24px 0',
              fontWeight: 'bold',
              letterSpacing: '1px',
              padding: '0 24px',
            }}
          >
            Admin Panel
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={menuItems}
          style={{
            background: '#1f1f1f',
            borderRight: 'none',
          }}
          itemStyle={{
            borderRadius: '8px',
            margin: '4px 16px',
            transition: 'background 0.3s ease',
          }}
          activeKeyStyle={{
            background: '#333333',
          }}
        />
      </Sider>

      {/* Main Content */}
      <Layout>
        {/* Header */}
        <Header
          style={{
            background: '#ffffff',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '0 16px', // Reduced padding here
            borderBottom: '1px solid #e8e8e8',
            height: '56px', // Reduced height for a more compact header
          }}
        >
          <Dropdown overlay={userMenu} placement="bottomRight">
            <Space
              style={{
                cursor: 'pointer',
                padding: '4px 8px', // Reduced padding here
                borderRadius: '8px',
                transition: 'background 0.3s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Avatar style={{ backgroundColor: '#1890ff' }}>A</Avatar>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Admin</span> {/* Reduced font size */}
            </Space>
          </Dropdown>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: '16px', // Reduced margin here
            padding: '16px', // Reduced padding here
            background: '#ffffff',
            borderRadius: '12px', // Slightly reduced border radius
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
