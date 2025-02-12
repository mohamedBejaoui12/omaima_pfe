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
  Avatar
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
  TeamOutlined
} from '@ant-design/icons';

const { Title } = Typography;
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
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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
      style={{ maxWidth: 800, margin: '0 auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Avatar 
          size={64} 
          icon={<TeamOutlined />} 
          style={{ backgroundColor: '#1890ff', marginBottom: 12 }}
        />
        <Title level={3} style={{ margin: 0 }}>Add New Team Member</Title>
        <Typography.Text type="secondary">Fill in the details below to register a new member</Typography.Text>
      </div>

      <Form
        {...formItemLayout}
        form={form}
        onFinish={onFinish}
        validateTrigger="onBlur"
      >
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="cin"
              label="CIN"
              rules={[{ required: true, message: 'Please input CIN' }]}
            >
              <Input 
                prefix={<IdcardOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} 
                placeholder="Unique Citizen ID Number" 
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="nom"
              label="Full Name"
              rules={[{ required: true, message: 'Please input member name' }]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} 
                placeholder="Member's full name" 
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please input email' },
                { type: 'email', message: 'Invalid email format' }
              ]}
            >
              <Input 
                prefix={<MailOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} 
                placeholder="example@company.com" 
                type="email"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="poste"
              label="Position/Grade"
              rules={[{ required: true, message: 'Please input position' }]}
            >
              <Input 
                prefix={<SolutionOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} 
                placeholder="Current position in company" 
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item 
              name="num_tele" 
              label="Contact Number"
              rules={[
                { 
                  pattern: /^[0-9]{8,20}$/, 
                  message: 'Please enter valid phone number (8-20 digits)' 
                }
              ]}
            >
              <Input 
                prefix={<PhoneOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} 
                placeholder="Mobile or office number" 
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please input password' }]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} 
                placeholder="Strong password" 
              />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              name="role"
              label="System Role"
              rules={[{ required: true, message: 'Please select role' }]}
            >
              <Select placeholder="Select access level">
                <Option value="0">Administrator (Full Access)</Option>
                <Option value="1">Manager (Limited Access)</Option>
                <Option value="2">Employee (Basic Access)</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
                size="large"
                style={{ marginTop: 16 }}
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