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
  UserOutlined,
  ToolOutlined,
  LogoutOutlined,
  FileOutlined,
  ProjectOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import Cookies from 'js-cookie';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MemberLayout = ({ userInfo }) => {
  const navigate = useNavigate();

  // Handle logout functionality
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
      console.error('Erreur de déconnexion:', error);
      message.error('Échec de la déconnexion');
    }
  };
  
  // Updated menuItems
  const menuItems = [
    {
      key: 'profile',
      icon: <UserOutlined style={{ fontSize: '20px' }} />,
      label: <Link to="/member/profile">Mettre à jour le profil</Link>,
    },
    {
      key: 'projects',
      icon: <ProjectOutlined style={{ fontSize: '20px' }} />,
      label: <Link to="/member/projects">Mes Projets</Link>,
    },
    {
      key: 'competencies',
      icon: <ToolOutlined style={{ fontSize: '20px' }} />,
      label: <Link to="/member/competencies">Gérer les compétences</Link>,
    },
    {
      key: 'cv',
      icon: <FileOutlined style={{ fontSize: '20px' }} />,
      label: <Link to="/member/cv">Gérer le CV</Link>,
    },
    {
      key: 'support-tickets',
      icon: <QuestionCircleOutlined style={{ fontSize: '20px' }} />,
      label: <Link to="/member/support-tickets">Tickets de support</Link>,
    },
  ];

  // User dropdown menu for logout
  const userMenu = (
    <Menu>
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined style={{ fontSize: '18px' }} />}
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 24px',
          transition: 'background 0.3s ease',
        }}
      >
        Déconnexion
      </Menu.Item>
    </Menu>
  );
  
  return (
    <Layout style={{ minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#f5f7fa' }}>
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
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Title
            level={4}
            style={{
              color: '#fff',
              margin: 0,
              textAlign: 'center',
            }}
          >
            Espace Membre
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={menuItems}
          style={{
            background: '#1f1f1f',
            marginTop: '16px',
          }}
        />
      </Sider>
      
      {/* Main Content */}
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <Dropdown overlay={userMenu} trigger={['click']}>
            <Space
              style={{
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '4px',
                transition: 'all 0.3s',
              }}
            >
              <Avatar
                style={{
                  backgroundColor: '#1890ff',
                  cursor: 'pointer',
                }}
                src={userInfo?.imageUrl ? `http://localhost:5000${userInfo.imageUrl}` : null}
                icon={!userInfo?.imageUrl && <UserOutlined />}
              />
              <span>{userInfo?.nom || 'Membre'}</span>
            </Space>
          </Dropdown>
        </Header>
        
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: '#fff',
            borderRadius: '4px',
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MemberLayout;