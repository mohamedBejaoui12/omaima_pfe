import React from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Typography,
  message,
  Card,
  Row,
  Col,
  Avatar,
} from 'antd';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
  UserOutlined,
  IdcardOutlined,
  MailOutlined,
  SolutionOutlined,
  PhoneOutlined,
  LockOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
};

const AddMemberPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const token = Cookies.get('token');
      if (!token) {
        message.error('Authentification expirée. Veuillez vous reconnecter.');
        return;
      }

      await axios.post('http://localhost:5000/api/admin/add-user', values, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      message.success('Membre ajouté avec succès');
      form.resetFields();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Échec de l\'ajout du membre';
      message.error(errorMessage);
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      bordered={false}
      style={{
        maxWidth: 800,
        margin: '0 auto',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        borderRadius: '16px',
        padding: '32px',
        background: '#ffffff',
      }}
    >
      {/* Header Section */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '32px',
        }}
      >
        <Avatar
          size={80}
          icon={<TeamOutlined />}
          style={{
            backgroundColor: '#1890ff',
            marginBottom: '16px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Title
          level={3}
          style={{
            margin: 0,
            fontWeight: 'bold',
            color: '#1890ff',
          }}
        >
          Ajouter un Nouveau Membre
        </Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          Remplissez les détails ci-dessous pour enregistrer un nouveau membre
        </Text>
      </div>

      {/* Form Section */}
      <Form
        {...formItemLayout}
        form={form}
        onFinish={onFinish}
        validateTrigger="onBlur"
        style={{
          marginTop: '24px',
        }}
      >
        <Row gutter={[24, 24]}>
          {/* CIN Field */}
          <Col xs={24} md={12}>
            <Form.Item
              name="cin"
              label="CIN"
              rules={[{ required: true, message: 'Veuillez saisir le CIN' }]}
            >
              <Input
                prefix={<IdcardOutlined style={{ color: '#1890ff' }} />}
                placeholder="Numéro d'identité unique"
                style={{
                  borderRadius: '8px',
                  border: '1px solid #d9d9d9',
                  transition: 'border-color 0.3s ease',
                }}
              />
            </Form.Item>
          </Col>

          {/* Full Name Field */}
          <Col xs={24} md={12}>
            <Form.Item
              name="nom"
              label="Nom Complet"
              rules={[{ required: true, message: 'Veuillez saisir le nom du membre' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                placeholder="Nom complet du membre"
                style={{
                  borderRadius: '8px',
                  border: '1px solid #d9d9d9',
                  transition: 'border-color 0.3s ease',
                }}
              />
            </Form.Item>
          </Col>

          {/* Email Field */}
          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label="Adresse Email"
              rules={[
                { required: true, message: 'Veuillez saisir l\'email' },
                { type: 'email', message: 'Format d\'email invalide' },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#1890ff' }} />}
                placeholder="exemple@societe.com"
                type="email"
                style={{
                  borderRadius: '8px',
                  border: '1px solid #d9d9d9',
                  transition: 'border-color 0.3s ease',
                }}
              />
            </Form.Item>
          </Col>

          {/* Position/Grade Field */}
          <Col xs={24} md={12}>
            <Form.Item
              name="poste"
              label="Poste/Grade"
              rules={[{ required: true, message: 'Veuillez saisir le poste' }]}
            >
              <Input
                prefix={<SolutionOutlined style={{ color: '#1890ff' }} />}
                placeholder="Poste actuel dans l'entreprise"
                style={{
                  borderRadius: '8px',
                  border: '1px solid #d9d9d9',
                  transition: 'border-color 0.3s ease',
                }}
              />
            </Form.Item>
          </Col>

          {/* Contact Number Field */}
          <Col xs={24} md={12}>
            <Form.Item
              name="num_tele"
              label="Numéro de Téléphone"
              rules={[
                {
                  pattern: /^[0-9]{8,20}$/,
                  message: 'Veuillez saisir un numéro de téléphone valide (8-20 chiffres)',
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: '#1890ff' }} />}
                placeholder="Numéro mobile ou de bureau"
                style={{
                  borderRadius: '8px',
                  border: '1px solid #d9d9d9',
                  transition: 'border-color 0.3s ease',
                }}
              />
            </Form.Item>
          </Col>

          {/* Password Field */}
          <Col xs={24} md={12}>
            <Form.Item
              name="password"
              label="Mot de Passe"
              rules={[{ required: true, message: 'Veuillez saisir le mot de passe' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                placeholder="Mot de passe fort"
                style={{
                  borderRadius: '8px',
                  border: '1px solid #d9d9d9',
                  transition: 'border-color 0.3s ease',
                }}
              />
            </Form.Item>
          </Col>

          {/* System Role Field */}
          <Col xs={24}>
            <Form.Item
              name="role"
              label="Rôle dans le Système"
              rules={[{ required: true, message: 'Veuillez sélectionner un rôle' }]}
            >
              <Select
                placeholder="Sélectionner le niveau d'accès"
                style={{
                  borderRadius: '8px',
                  border: '1px solid #d9d9d9',
                  transition: 'border-color 0.3s ease',
                }}
              >
                <Option value="0">Administrateur (Accès Complet)</Option>
                <Option value="1">Chef de Projet (Accès Limité)</Option>
                <Option value="2">Employé (Accès Basique)</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Submit Button */}
          <Col xs={24}>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                style={{
                  height: '48px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  background: '#1890ff',
                  borderColor: '#1890ff',
                  transition: 'background 0.3s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#40a9ff')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#1890ff')}
              >
                Enregistrer le Membre
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default React.memo(AddMemberPage);