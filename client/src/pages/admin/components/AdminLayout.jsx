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
} from '@ant-design/icons';
import Cookies from 'js-cookie';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const AdminLayout = () => {
  const navigate = useNavigate();

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

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined style={{ fontSize: '20px' }} />,
      label: <Link to="/admin/dashboard">Dashboard</Link>,
    },
    {
      key: 'add-member',
      icon: <UserAddOutlined style={{ fontSize: '20px' }} />,
      label: <Link to="/admin/add-member">Add Member</Link>,
    },
    {
      key: 'manage-users',
      icon: <UsergroupAddOutlined style={{ fontSize: '20px' }} />,
      label: <Link to="/admin/manage-users">Manage Users</Link>,
    },
    {
      key: 'manage-projects',
      icon: <ProjectOutlined style={{ fontSize: '20px' }} />,
      label: <Link to="/admin/manage-projects">Manage Projects</Link>,
    },
    {
      key: 'manage-competences',
      icon: <ProjectOutlined style={{ fontSize: '20px' }} />,
      label: <Link to="/admin/manage-competences">Manage Competences</Link>,
    },
  ];

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