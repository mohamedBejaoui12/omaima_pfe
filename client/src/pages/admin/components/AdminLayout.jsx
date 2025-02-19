import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Menu, 
  Typography, 
  Avatar, 
  Dropdown, 
  Space,
  message
} from 'antd';
import { 
  DashboardOutlined, 
  UserAddOutlined, 
  UsergroupAddOutlined, 
  ProjectOutlined,
  LogoutOutlined 
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
      Object.keys(allCookies).forEach(cookieName => {
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
      icon: <DashboardOutlined />,
      label: <Link to="/admin/dashboard">Dashboard</Link>
    },
    {
      key: 'add-member',
      icon: <UserAddOutlined />,
      label: <Link to="/admin/add-member">Add Member</Link>
    },
    {
      key: 'manage-users',
      icon: <UsergroupAddOutlined />,
      label: <Link to="/admin/manage-users">Manage Users</Link>
    },
    {
      key: 'manage-projects',
      icon: <ProjectOutlined />,
      label: <Link to="/admin/manage-projects">Manage Projects</Link>
    },
    {
      key: 'manage-competences',
      icon: <ProjectOutlined />,
      label: <Link to="/admin/manage-competences">Manage Competences</Link>
    },
  ];

  const userMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="dark">
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '16px',
            backgroundColor: '#001529' 
          }}
        >
          <Title level={4} style={{ color: 'white', margin: 0 }}>
            Admin Panel
          </Title>
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          defaultSelectedKeys={['dashboard']} 
          items={menuItems} 
        />
      </Sider>
      <Layout>
        <Header 
          style={{ 
            background: '#fff', 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center',
            padding: '0 16px' 
          }}
        >
          <Dropdown overlay={userMenu} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar>A</Avatar>
              Admin
            </Space>
          </Dropdown>
        </Header>
        <Content 
          style={{ 
            margin: '24px 16px', 
            padding: 24, 
            background: '#fff' 
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;