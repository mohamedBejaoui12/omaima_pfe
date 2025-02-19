import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { 
  Layout, 
  Menu 
} from 'antd';
import { 
  DashboardOutlined, 
  UserAddOutlined 
} from '@ant-design/icons';

const { Sider, Content } = Layout;

const ChefDeProjetLayout = () => {
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/chef-de-projet">Dashboard</Link>
    },
    {
      key: 'suggest-members',
      icon: <UserAddOutlined />,
      label: <Link to="/chef-de-projet/suggest-members">Suggest Members</Link>
    },
    {
      key: 'all-users',
      icon: <UserAddOutlined />,
      label: <Link to="/chef-de-projet/all-users">All Users</Link>
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="dark">
        <Menu 
          theme="dark" 
          mode="inline" 
          defaultSelectedKeys={['dashboard']} 
          items={menuItems} 
        />
      </Sider>
      <Layout>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default ChefDeProjetLayout;