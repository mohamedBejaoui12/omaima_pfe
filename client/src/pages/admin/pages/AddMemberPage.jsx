import React from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  Typography, 
  message 
} from 'antd';
import axios from 'axios';
import Cookies from 'js-cookie';

const { Title } = Typography;
const { Option } = Select;

const AddMemberPage = () => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const token = Cookies.get('token');
      console.log('Token:', token); // Debug log
      console.log('Sending values:', values); // Debug log
      
      if (!token) {
        message.error('No authentication token found. Please log in again.');
        return;
      }
      
      const response = await axios.post('http://localhost:5000/api/admin/add-user', values, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      
      message.success('User added successfully');
      form.resetFields();
    } catch (error) {
      console.error('Full error:', error.response || error);
      message.error(
        error.response?.data?.message || 
        'Failed to add user'
      );
    }
  };

  return (
    <div>
      <Title level={2}>Add New Member</Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 600 }}
      >
        <Form.Item
          name="cin"
          label="CIN"
          rules={[{ required: true, message: 'Please input CIN' }]}
        >
          <Input placeholder="Enter CIN" />
        </Form.Item>
        <Form.Item
          name="nom"
          label="Name"
          rules={[{ required: true, message: 'Please input name' }]}
        >
          <Input placeholder="Enter full name" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please input email' },
            { type: 'email', message: 'Invalid email format' }
          ]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>
        <Form.Item
          name="poste"
          label="Position/Grade"
          rules={[{ required: true, message: 'Please input position' }]}
        >
          <Input placeholder="Enter position or grade in the company" />
        </Form.Item>
        <Form.Item 
  name="num_tele" 
  label="Phone Number"
  rules={[
    { 
      pattern: /^[0-9]{8,20}$/, 
      message: 'Please enter a valid phone number' 
    }
  ]}
>
  <Input placeholder="Enter phone number" />
</Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please input password' }]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>
        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: 'Please select role' }]}
        >
          <Select placeholder="Select role">
            <Option value="0">Admin</Option>
            <Option value="1">Manager</Option>
            <Option value="2">Employee</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Add Member
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddMemberPage;