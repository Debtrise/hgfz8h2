import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Space,
  Switch,
  Typography,
  Divider,
  Alert,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title, Text } = Typography;

const pixelTypes = [
  { value: 'facebook', label: 'Facebook Pixel' },
  { value: 'google', label: 'Google Analytics' },
  { value: 'linkedin', label: 'LinkedIn Insight Tag' },
  { value: 'twitter', label: 'Twitter Pixel' },
  { value: 'pinterest', label: 'Pinterest Pixel' },
  { value: 'tiktok', label: 'TikTok Pixel' },
  { value: 'custom', label: 'Custom Pixel' },
];

const MarketingPixels = ({ formData, setFormData }) => {
  const [form] = Form.useForm();

  const addPixel = (values) => {
    const newPixel = {
      id: Date.now().toString(),
      ...values,
    };
    setFormData({
      ...formData,
      marketingPixels: [...formData.marketingPixels, newPixel],
    });
    form.resetFields();
  };

  const removePixel = (pixelId) => {
    setFormData({
      ...formData,
      marketingPixels: formData.marketingPixels.filter(
        (pixel) => pixel.id !== pixelId
      ),
    });
  };

  return (
    <div>
      <Title level={4}>Marketing Pixels Configuration</Title>
      <Text type="secondary">
        Add and configure your marketing pixels to track form submissions
      </Text>

      <Divider />

      <Form
        form={form}
        layout="vertical"
        onFinish={addPixel}
        style={{ maxWidth: 600, marginBottom: 24 }}
      >
        <Form.Item
          name="type"
          label="Pixel Type"
          rules={[{ required: true, message: 'Please select a pixel type' }]}
        >
          <Select placeholder="Select pixel type">
            {pixelTypes.map((type) => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="pixelId"
          label="Pixel ID"
          rules={[{ required: true, message: 'Please enter your pixel ID' }]}
        >
          <Input placeholder="Enter your pixel ID" />
        </Form.Item>

        <Form.Item
          name="name"
          label="Pixel Name"
          rules={[{ required: true, message: 'Please enter a name for this pixel' }]}
        >
          <Input placeholder="Enter a name to identify this pixel" />
        </Form.Item>

        <Form.Item
          name="active"
          label="Active"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
            Add Pixel
          </Button>
        </Form.Item>
      </Form>

      <Title level={5}>Configured Pixels</Title>
      {formData.marketingPixels.length === 0 ? (
        <Alert
          message="No pixels configured"
          description="Add your marketing pixels above to start tracking form submissions"
          type="info"
          showIcon
        />
      ) : (
        <Space direction="vertical" style={{ width: '100%' }}>
          {formData.marketingPixels.map((pixel) => (
            <Card
              key={pixel.id}
              size="small"
              extra={
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removePixel(pixel.id)}
                >
                  Remove
                </Button>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Text strong>{pixel.name}</Text>
                  <Switch
                    checked={pixel.active}
                    onChange={(checked) =>
                      setFormData({
                        ...formData,
                        marketingPixels: formData.marketingPixels.map((p) =>
                          p.id === pixel.id ? { ...p, active: checked } : p
                        ),
                      })
                    }
                  />
                </Space>
                <Text type="secondary">Type: {pixel.type}</Text>
                <Text type="secondary">ID: {pixel.pixelId}</Text>
              </Space>
            </Card>
          ))}
        </Space>
      )}
    </div>
  );
};

export default MarketingPixels; 