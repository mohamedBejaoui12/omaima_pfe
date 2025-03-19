import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Typography } from 'antd';
import { EyeOutlined } from '@ant-design/icons'; // Add this import
import { ticketService } from '../../services/ticketService';
import { Link, useNavigate } from 'react-router-dom'; // Add useNavigate

const { Title } = Typography;

const TicketListPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Add this

  // Function to handle viewing a ticket
  const handleViewTicket = (ticketId) => {
    navigate(`/member/support-tickets/${ticketId}`);
  };

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const response = await ticketService.getUserTickets();
        setTickets(response.tickets);
      } catch (error) {
        console.error('Error loading tickets:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTickets();
  }, []);

  const columns = [
    {
      title: 'Subject',
      dataIndex: 'subject',
      render: (text, record) => (
        <Link to={`/member/support-tickets/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => {
        let color = status === 'pending' ? 'orange' : 
                   status === 'in_progress' ? 'blue' : 
                   status === 'resolved' ? 'green' : 'gray';
        return <Tag color={color}>{status.replace('_', ' ').toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Responses',
      dataIndex: 'response_count',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small" 
          icon={<EyeOutlined />}
          onClick={() => handleViewTicket(record.id)}
        >
          View
        </Button>
      ),
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space style={{ marginBottom: 24, width: '100%', justifyContent: 'space-between' }}>
        <Title level={3}>My Support Tickets</Title>
        <Button type="primary" href="/member/support-tickets/new">
          Create New Ticket
        </Button>
      </Space>
      <Table 
        columns={columns}
        dataSource={tickets}
        rowKey="id"
        loading={loading}
        bordered
      />
    </div>
  );
};

export default TicketListPage;