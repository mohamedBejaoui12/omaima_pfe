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

// Rest of the component remains the same
// Rest of the file remains the same

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
        console.error('Error loading ticket:', error);
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
      message.success('Response submitted successfully');
    } catch (error) {
      message.error('Failed to submit response');
    }
  };

  if (loading) return <Skeleton active />;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <Card title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>{ticket.subject}</Title>
          <Tag color={getStatusColor(ticket.status)}>
            {ticket.status.replace('_', ' ').toUpperCase()}
          </Tag>
        </Space>
      }>
        <Text strong>Created by: </Text>
        <Text>{ticket.user_name}</Text>
        <br />
        <Text strong>Created at: </Text>
        <Text>{new Date(ticket.created_at).toLocaleString()}</Text>
        <br />
        <Text strong>Priority: </Text>
        <Tag color={getPriorityColor(ticket.priority)}>
          {ticket.priority.toUpperCase()}
        </Tag>

        <div style={{ margin: '24px 0' }}>
          <Text strong>Description:</Text>
          <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
            {ticket.description}
          </div>
        </div>

        <Title level={5}>Responses ({responses.length})</Title>
        <div style={{ marginBottom: 24 }}>
          {responses.map((response) => (
            <Card 
              key={response.id}
              size="small"
              style={{ marginBottom: 12 }}
              title={
                <Space>
                  <Text strong>{response.responder_name}</Text>
                  <Tag>{response.responder_role === '0' ? 'Admin' : 'Member'}</Tag>
                  <Text type="secondary">
                    {new Date(response.created_at).toLocaleString()}
                  </Text>
                </Space>
              }
            >
              <div style={{ whiteSpace: 'pre-wrap' }}>{response.message}</div>
            </Card>
          ))}
        </div>

        <Form form={form} onFinish={handleResponseSubmit}>
          <Form.Item
            name="message"
            rules={[{ required: true, message: 'Please enter your response' }]}
          >
            <TextArea rows={4} placeholder="Enter your response..." />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Add Response
          </Button>
        </Form>
      </Card>
    </div>
  );
};

// Helper functions
const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'orange';
    case 'in_progress': return 'blue';
    case 'resolved': return 'green';
    case 'closed': return 'gray';
    default: return 'gray';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'low': return 'green';
    case 'medium': return 'orange';
    case 'high': return 'red';
    default: return 'gray';
  }
};

export default TicketDetailsPage;