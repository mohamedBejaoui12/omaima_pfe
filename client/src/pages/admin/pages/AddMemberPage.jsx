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
        message.error('Authentication expired. Please login again.');
        return;
      }

      await axios.post('http://localhost:5000/api/admin/add-user', values, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      message.success('Member added successfully');
      form.resetFields();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add member';
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
          Add New Team Member
        </Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          Fill in the details below to register a new member
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
              rules={[{ required: true, message: 'Please input CIN' }]}
            >
              <Input
                prefix={<IdcardOutlined style={{ color: '#1890ff' }} />}
                placeholder="Unique Citizen ID Number"
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
              label="Full Name"
              rules={[{ required: true, message: 'Please input member name' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                placeholder="Member's full name"
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
              label="Email Address"
              rules={[
                { required: true, message: 'Please input email' },
                { type: 'email', message: 'Invalid email format' },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#1890ff' }} />}
                placeholder="example@company.com"
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
              label="Position/Grade"
              rules={[{ required: true, message: 'Please input position' }]}
            >
              <Input
                prefix={<SolutionOutlined style={{ color: '#1890ff' }} />}
                placeholder="Current position in company"
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
              label="Contact Number"
              rules={[
                {
                  pattern: /^[0-9]{8,20}$/,
                  message: 'Please enter valid phone number (8-20 digits)',
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: '#1890ff' }} />}
                placeholder="Mobile or office number"
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
              label="Password"
              rules={[{ required: true, message: 'Please input password' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                placeholder="Strong password"
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
              label="System Role"
              rules={[{ required: true, message: 'Please select role' }]}
            >
              <Select
                placeholder="Select access level"
                style={{
                  borderRadius: '8px',
                  border: '1px solid #d9d9d9',
                  transition: 'border-color 0.3s ease',
                }}
              >
                <Option value="0">Administrator (Full Access)</Option>
                <Option value="1">Manager (Limited Access)</Option>
                <Option value="2">Employee (Basic Access)</Option>
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
                Register Member
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default React.memo(AddMemberPage);