import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Typography } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { ticketService } from '../../services/ticketService';
import { Link, useNavigate } from 'react-router-dom';

const { Title } = Typography;

const TicketListPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        console.error('Erreur lors du chargement des tickets:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTickets();
  }, []);

  const columns = [
    {
      title: 'Sujet',
      dataIndex: 'subject',
      render: (text, record) => (
        <Link to={`/member/support-tickets/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      render: (status) => {
        let color = status === 'pending' ? 'orange' : 
                   status === 'in_progress' ? 'blue' : 
                   status === 'resolved' ? 'green' : 'gray';
        
        let statusText = status === 'pending' ? 'EN ATTENTE' :
                        status === 'in_progress' ? 'EN COURS' :
                        status === 'resolved' ? 'RÉSOLU' : 'INCONNU';
        
        return <Tag color={color}>{statusText}</Tag>;
      }
    },
    {
      title: 'Créé le',
      dataIndex: 'created_at',
      render: (date) => new Date(date).toLocaleDateString('fr-FR')
    },
    {
      title: 'Réponses',
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
          Voir
        </Button>
      ),
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space style={{ marginBottom: 24, width: '100%', justifyContent: 'space-between' }}>
        <Title level={3}>Mes Tickets de Support</Title>
        <Button type="primary" href="/member/support-tickets/new">
          Créer un Nouveau Ticket
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