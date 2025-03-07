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
  FileOutlined, // Add this import
  ProjectOutlined, // Add this for projects icon
} from '@ant-design/icons';
import Cookies from 'js-cookie';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MemberLayout = ({ userInfo }) => {  // Add userInfo prop
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
      message.success('Logged out successfully');
      // Redirect to login page
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      message.error('Failed to log out');
    }
  };
  // Updated menuItems
  const menuItems = [
    {
      key: 'profile',
      icon: <UserOutlined style={{ fontSize: '20px' }} />,
      label: <Link to="/member/profile">Update Profile</Link>,
    },
    {
      key: 'projects',
      icon: <ProjectOutlined style={{ fontSize: '20px' }} />,
      label: <Link to="/member/projects">Mes Projets</Link>,
    },
    {
      key: 'competencies',
      icon: <ToolOutlined style={{ fontSize: '20px' }} />,
      label: <Link to="/member/competencies">Manage Competencies</Link>,
    },
    {
      key: 'cv',
      icon: <FileOutlined style={{ fontSize: '20px' }} />,
      label: <Link to="/member/cv">Manage CV</Link>,
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
        Logout
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
            background: '#1f1f1f',
          }}
        >
          <Title
            level={3}
            style={{
              color: '#ffffff',
              margin: 0,
              fontWeight: 'bold',
              letterSpacing: '1px',
            }}
          >
            Member Dashboard
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['profile']}
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
            padding: '0 16px',
            borderBottom: '1px solid #e8e8e8',
            height: '56px',
          }}
        >
          <Dropdown overlay={userMenu} placement="bottomRight">
            <Space
              style={{
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '8px',
                transition: 'background 0.3s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Avatar style={{ backgroundColor: '#1890ff' }}>
                {userInfo?.nom ? userInfo.nom[0].toUpperCase() : 'M'}
              </Avatar>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                {userInfo?.nom || 'Member'}
              </span>
            </Space>
          </Dropdown>
        </Header>
        {/* Content */}
        <Content
          style={{
            margin: '16px',
            padding: '16px',
            background: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MemberLayout;