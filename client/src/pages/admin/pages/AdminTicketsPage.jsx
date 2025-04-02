import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Tag, 
  Typography, 
  Button, 
  Space, 
  Input, 
  Select,
  Badge,
  Card
} from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { ticketService } from '../../../services/ticketService';
import { Link, useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;

const AdminTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getAllTickets();
      setTickets(response.tickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = (ticketId) => {
    navigate(`/admin/support-tickets/${ticketId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'in_progress': return 'blue';
      case 'resolved': return 'green';
      case 'closed': return 'gray';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'green';
      case 'medium': return 'orange';
      case 'high': return 'red';
      default: return 'default';
    }
  };

  // Filter tickets based on search text and status filter
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchText.toLowerCase()) ||
      ticket.user_name.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 70,
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      render: (text, record) => (
        <a onClick={() => handleViewTicket(record.id)}>{text}</a>
      ),
    },
    {
      title: 'User',
      dataIndex: 'user_name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Responses',
      dataIndex: 'response_count',
      render: (count) => (
        count > 0 ? <Badge count={count} style={{ backgroundColor: '#52c41a' }} /> : '0'
      )
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small"
          onClick={() => handleViewTicket(record.id)}
        >
          View
        </Button>
      )
    }
  ];

  // Get ticket counts by status
  const pendingCount = tickets.filter(t => t.status === 'pending').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;
  const closedCount = tickets.filter(t => t.status === 'closed').length;

  return (
    <div>
      <Title level={3}>Support Tickets Management</Title>
      
      {/* Stats Cards */}
      <div style={{ display: 'flex', marginBottom: 24, gap: 16 }}>
        <Card style={{ flex: 1 }}>
          <div style={{ textAlign: 'center' }}>
            <Badge count={pendingCount} style={{ backgroundColor: 'orange' }} />
            <div style={{ marginTop: 8 }}>Pending</div>
          </div>
        </Card>
        <Card style={{ flex: 1 }}>
          <div style={{ textAlign: 'center' }}>
            <Badge count={inProgressCount} style={{ backgroundColor: 'blue' }} />
            <div style={{ marginTop: 8 }}>In Progress</div>
          </div>
        </Card>
        <Card style={{ flex: 1 }}>
          <div style={{ textAlign: 'center' }}>
            <Badge count={resolvedCount} style={{ backgroundColor: 'green' }} />
            <div style={{ marginTop: 8 }}>Resolved</div>
          </div>
        </Card>
        <Card style={{ flex: 1 }}>
          <div style={{ textAlign: 'center' }}>
            <Badge count={closedCount} style={{ backgroundColor: 'gray' }} />
            <div style={{ marginTop: 8 }}>Closed</div>
          </div>
        </Card>
      </div>
      
      {/* Filters */}
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search tickets"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 250 }}
        />
        <Select
          placeholder="Filter by status"
          style={{ width: 150 }}
          value={statusFilter}
          onChange={value => setStatusFilter(value)}
        >
          <Option value="all">All Statuses</Option>
          <Option value="pending">Pending</Option>
          <Option value="in_progress">In Progress</Option>
          <Option value="resolved">Resolved</Option>
          <Option value="closed">Closed</Option>
        </Select>
      </Space>
      
      <Table
        columns={columns}
        dataSource={filteredTickets}
        rowKey="id"
        loading={loading}
        bordered
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default AdminTicketsPage;