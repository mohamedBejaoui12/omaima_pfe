import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Divider,
  message 
} from 'antd';
import { ticketService } from '../../../services/ticketService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AdminTicketDetailsPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responseForm] = Form.useForm();
  const [statusForm] = Form.useForm();

  useEffect(() => {
    loadTicketDetails();
  }, [ticketId]);

  const loadTicketDetails = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getTicketDetails(ticketId);
      setTicket(response.ticket);
      setResponses(response.responses);
      
      // Set initial value for status form
      statusForm.setFieldsValue({
        status: response.ticket.status
      });
    } catch (error) {
      console.error('Error loading ticket details:', error);
      message.error('Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseSubmit = async (values) => {
    try {
      await ticketService.addResponse(ticketId, values.message);
      message.success('Response added successfully');
      responseForm.resetFields();
      loadTicketDetails();
    } catch (error) {
      console.error('Error adding response:', error);
      message.error('Failed to add response');
    }
  };

  const handleStatusUpdate = async (values) => {
    try {
      await ticketService.updateTicketStatus(ticketId, values.status);
      message.success('Ticket status updated successfully');
      loadTicketDetails();
    } catch (error) {
      console.error('Error updating ticket status:', error);
      message.error('Failed to update ticket status');
    }
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

  if (loading) return <Skeleton active />;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Button 
        type="link" 
        onClick={() => navigate('/admin/support-tickets')}
        style={{ marginBottom: 16 }}
      >
        ← Back to Tickets
      </Button>

      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Title level={4}>{ticket.subject}</Title>
            <Space size="middle">
              <Tag color={getStatusColor(ticket.status)}>
                {ticket.status.toUpperCase().replace('_', ' ')}
              </Tag>
              <Tag color={getPriorityColor(ticket.priority)}>
                {ticket.priority.toUpperCase()}
              </Tag>
              <Text type="secondary">
                Created: {new Date(ticket.created_at).toLocaleString()}
              </Text>
            </Space>
          </div>

          <div>
            <Text strong>From: </Text>
            <Text>{ticket.user_name}</Text>
          </div>

          <div>
            <Text strong>Description:</Text>
            <Paragraph style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
              {ticket.description}
            </Paragraph>
          </div>

          <Divider />

          {/* Status Update Form */}
          <Card size="small" title="Update Ticket Status">
            <Form
              form={statusForm}
              layout="inline"
              onFinish={handleStatusUpdate}
            >
              <Form.Item
                name="status"
                style={{ minWidth: 200 }}
              >
                <Select>
                  <Option value="pending">Pending</Option>
                  <Option value="in_progress">In Progress</Option>
                  <Option value="resolved">Resolved</Option>
                  <Option value="closed">Closed</Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Update Status
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Divider />

          {/* Responses Section */}
          <div>
            <Title level={5}>Responses ({responses.length})</Title>
            {responses.length === 0 ? (
              <Text type="secondary">No responses yet</Text>
            ) : (
              responses.map((response) => (
                <Card 
                  key={response.id}
                  size="small"
                  style={{ marginBottom: 12 }}
                  title={
                    <Space>
                      <Text strong>{response.responder_name}</Text>
                      <Tag color={response.responder_role === '0' ? 'blue' : 'green'}>
                        {response.responder_role === '0' ? 'Admin' : 'Member'}
                      </Tag>
                      <Text type="secondary">
                        {new Date(response.created_at).toLocaleString()}
                      </Text>
                    </Space>
                  }
                >
                  <div style={{ whiteSpace: 'pre-wrap' }}>{response.message}</div>
                </Card>
              ))
            )}
          </div>

          <Divider />

          {/* Response Form */}
          <Card size="small" title="Add Response">
            <Form
              form={responseForm}
              layout="vertical"
              onFinish={handleResponseSubmit}
            >
              <Form.Item
                name="message"
                rules={[{ required: true, message: 'Please enter your response' }]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="Type your response here..." 
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Send Response
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default AdminTicketDetailsPage;