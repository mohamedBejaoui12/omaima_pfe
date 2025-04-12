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
  TeamOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import Cookies from 'js-cookie';
import logo from '../../../assets/logo.png';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const ChefDeProjetLayout = () => {
  const navigate = useNavigate();

  // Gestion de la déconnexion
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
      message.success('Déconnecté avec succès');

      // Redirect to login page
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      message.error('Échec de la déconnexion');
    }
  };

  // Éléments du menu
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined style={{ fontSize: '20px' }} />,
      label: <Link to="/chef-de-projet">Tableau de bord</Link>,
    },
    {
      key: 'suggest-members',
      icon: <UserAddOutlined style={{ fontSize: '20px' }} />,
      label: <Link to="/chef-de-projet/suggest-members">Suggérer des membres</Link>,
    },
    {
      key: 'members',
      icon: <TeamOutlined style={{ fontSize: '20px' }} />,
      label: <Link to="/chef-de-projet/members">Membres de mon projet</Link>,
    },
    {
      key: 'projets',
      icon: <TeamOutlined style={{ fontSize: '20px' }} />,
      label: <Link to="/chef-de-projet/projets">Mes Projets</Link>,
    },
  ];

  // Menu utilisateur
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
        Se déconnecter
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
      {/* Barre latérale */}
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
              alt="Project Manager Logo" 
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
              textAlign: 'center',
            }}
          >
            Tableau de bord Chef de Projet
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
        />
      </Sider>

      {/* Contenu principal */}
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#ffffff',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
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
                borderRadius: '8px',
                transition: 'background 0.3s ease',
              }}
            >
              <Avatar
                style={{
                  backgroundColor: '#1890ff',
                  cursor: 'pointer',
                }}
                icon={<UserAddOutlined />}
              />
              <span style={{ marginLeft: '8px', fontWeight: '500' }}>
                Mon Profil
              </span>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            minHeight: '280px',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default ChefDeProjetLayout;