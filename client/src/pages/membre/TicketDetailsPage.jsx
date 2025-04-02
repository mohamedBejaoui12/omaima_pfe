import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Tag, 
  Button, 
  Form, 
  Input, 
  Select,
  Skeleton,
  Space,
  message 
} from 'antd';
import { ticketService } from '../../services/ticketService';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Helper functions for status and priority colors
const getStatusColor = (status) => {
  switch(status) {
    case 'pending': return 'orange';
    case 'in_progress': return 'blue';
    case 'resolved': return 'green';
    default: return 'gray';
  }
};

const getStatusText = (status) => {
  switch(status) {
    case 'pending': return 'EN ATTENTE';
    case 'in_progress': return 'EN COURS';
    case 'resolved': return 'RÉSOLU';
    default: return 'INCONNU';
  }
};

const getPriorityColor = (priority) => {
  switch(priority) {
    case 'low': return 'green';
    case 'medium': return 'orange';
    case 'high': return 'red';
    default: return 'blue';
  }
};

const getPriorityText = (priority) => {
  switch(priority) {
    case 'low': return 'FAIBLE';
    case 'medium': return 'MOYENNE';
    case 'high': return 'ÉLEVÉE';
    default: return priority.toUpperCase();
  }
};

const TicketDetailsPage = () => {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    const loadTicket = async () => {
      try {
        const response = await ticketService.getTicketDetails(ticketId);
        setTicket(response.ticket);
        setResponses(response.responses);
      } catch (error) {
        console.error('Erreur lors du chargement du ticket:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTicket();
  }, [ticketId]);

  const handleResponseSubmit = async (values) => {
    try {
      await ticketService.addResponse(ticketId, values.message);
      const response = await ticketService.getTicketDetails(ticketId);
      setResponses(response.responses);
      form.resetFields();
      message.success('Réponse soumise avec succès');
    } catch (error) {
      message.error('Échec de la soumission de la réponse');
    }
  };

  if (loading) return <Skeleton active />;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <Card title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>{ticket.subject}</Title>
          <Tag color={getStatusColor(ticket.status)}>
            {getStatusText(ticket.status)}
          </Tag>
        </Space>
      }>
        <Text strong>Créé par: </Text>
        <Text>{ticket.user_name}</Text>
        <br />
        <Text strong>Créé le: </Text>
        <Text>{new Date(ticket.created_at).toLocaleString('fr-FR')}</Text>
        <br />
        <Text strong>Priorité: </Text>
        <Tag color={getPriorityColor(ticket.priority)}>
          {getPriorityText(ticket.priority)}
        </Tag>

        <div style={{ margin: '24px 0' }}>
          <Text strong>Description:</Text>
          <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
            {ticket.description}
          </div>
        </div>

        <Title level={5}>Réponses ({responses.length})</Title>
        <div style={{ marginBottom: 24 }}>
          {responses.map((response) => (
            <Card 
              key={response.id}
              size="small"
              style={{ marginBottom: 12 }}
              title={
                <Space>
                  <Text strong>{response.responder_name}</Text>
                  <Tag>{response.responder_role === '0' ? 'Admin' : 'Membre'}</Tag>
                  <Text type="secondary">
                    {new Date(response.created_at).toLocaleString('fr-FR')}
                  </Text>
                </Space>
              }
            >
              <div style={{ whiteSpace: 'pre-wrap' }}>{response.message}</div>
            </Card>
          ))}
        </div>

        {ticket.status !== 'resolved' && (
          <div>
            <Title level={5}>Ajouter une réponse</Title>
            <Form form={form} onFinish={handleResponseSubmit}>
              <Form.Item
                name="message"
                rules={[{ required: true, message: 'Veuillez saisir votre réponse' }]}
              >
                <TextArea rows={4} placeholder="Votre réponse..." />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Envoyer la réponse
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TicketDetailsPage;