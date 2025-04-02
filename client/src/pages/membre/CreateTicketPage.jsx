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
      console.error('Échec de création du ticket:', error);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Title level={3}>Créer un Nouveau Ticket de Support</Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label="Sujet"
          name="subject"
          rules={[{ required: true, message: 'Veuillez saisir un sujet' }]}
        >
          <Input placeholder="Brève description de votre problème" />
        </Form.Item>

        <Form.Item
          label="Priorité"
          name="priority"
          initialValue="medium"
        >
          <Select>
            <Select.Option value="low">Faible</Select.Option>
            <Select.Option value="medium">Moyenne</Select.Option>
            <Select.Option value="high">Élevée</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Veuillez fournir des détails sur votre problème' }]}
        >
          <TextArea rows={6} placeholder="Décrivez votre problème en détail..." />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Soumettre le Ticket
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateTicketPage;