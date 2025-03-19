import React from 'react';
import { Form, Input, Button, Select, Typography } from 'antd';
import { ticketService } from '../../services/ticketService';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { TextArea } = Input;

const CreateTicketPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      await ticketService.createTicket(values);
      navigate('/member/support-tickets');
    } catch (error) {
      console.error('Ticket creation failed:', error);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Title level={3}>Create New Support Ticket</Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label="Subject"
          name="subject"
          rules={[{ required: true, message: 'Please enter a subject' }]}
        >
          <Input placeholder="Brief description of your issue" />
        </Form.Item>

        <Form.Item
          label="Priority"
          name="priority"
          initialValue="medium"
        >
          <Select>
            <Select.Option value="low">Low</Select.Option>
            <Select.Option value="medium">Medium</Select.Option>
            <Select.Option value="high">High</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please provide details about your issue' }]}
        >
          <TextArea rows={6} placeholder="Describe your issue in detail..." />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit Ticket
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateTicketPage;