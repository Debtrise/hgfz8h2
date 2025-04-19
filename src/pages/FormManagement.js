import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Tooltip,
  Popconfirm,
  message,
  Tabs,
  List,
  Avatar,
  Statistic,
  Row,
  Col,
  InputNumber,
  Switch
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CopyOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  HistoryOutlined,
  BarChartOutlined,
  UserOutlined,
  CodeOutlined,
  FacebookOutlined,
  GoogleOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  InstagramOutlined,
  TikTokOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const ManagementContainer = styled.div`
  padding: 24px;
`;

const StatsCard = styled(Card)`
  margin-bottom: 24px;
`;

const FormCard = styled(Card)`
  margin-bottom: 16px;
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const PixelIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const FormManagement = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [pixels, setPixels] = useState([]);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isPixelModalVisible, setIsPixelModalVisible] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [editingPixel, setEditingPixel] = useState(null);
  const [form] = Form.useForm();
  const [pixelForm] = Form.useForm();

  // Mock data for demonstration
  useEffect(() => {
    setForms([
      {
        id: '1',
        title: 'Contact Form',
        description: 'Basic contact information form',
        status: 'published',
        submissions: 150,
        lastUpdated: '2024-03-15',
        createdBy: 'John Doe',
        type: 'single-page',
        pixelId: 'pixel_123'
      },
      {
        id: '2',
        title: 'Survey Form',
        description: 'Customer satisfaction survey',
        status: 'draft',
        submissions: 0,
        lastUpdated: '2024-03-14',
        createdBy: 'Jane Smith',
        type: 'multi-page',
        pixelId: 'pixel_456'
      },
    ]);

    setPixels([
      {
        id: 'pixel_123',
        name: 'Facebook Pixel',
        platform: 'Facebook',
        lastUsed: '2024-03-15',
        status: 'active',
        formCount: 2,
        pixelId: '123456789',
        events: ['PageView', 'Lead', 'Purchase'],
        isActive: true
      },
      {
        id: 'pixel_456',
        name: 'Google Analytics',
        platform: 'Google',
        lastUsed: '2024-03-14',
        status: 'active',
        formCount: 1,
        pixelId: 'UA-123456789-1',
        events: ['PageView', 'FormSubmit'],
        isActive: true
      },
    ]);
  }, []);

  const handleCreateForm = () => {
    navigate('/form-builder');
  };

  const handleCreatePixel = () => {
    setEditingPixel(null);
    pixelForm.resetFields();
    setIsPixelModalVisible(true);
  };

  const handleEditPixel = (pixel) => {
    setEditingPixel(pixel);
    pixelForm.setFieldsValue(pixel);
    setIsPixelModalVisible(true);
  };

  const handleDeletePixel = (pixelId) => {
    setPixels(pixels.filter(pixel => pixel.id !== pixelId));
    message.success('Pixel deleted successfully');
  };

  const handleSavePixel = (values) => {
    if (editingPixel) {
      setPixels(pixels.map(pixel => 
        pixel.id === editingPixel.id ? { ...pixel, ...values } : pixel
      ));
    } else {
      const newPixel = {
        ...values,
        id: `pixel_${Date.now()}`,
        status: 'active',
        formCount: 0,
        lastUsed: new Date().toISOString().split('T')[0]
      };
      setPixels([...pixels, newPixel]);
    }
    setIsPixelModalVisible(false);
    pixelForm.resetFields();
    message.success('Pixel saved successfully');
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'Facebook':
        return <FacebookOutlined />;
      case 'Google':
        return <GoogleOutlined />;
      case 'Twitter':
        return <TwitterOutlined />;
      case 'LinkedIn':
        return <LinkedinOutlined />;
      case 'Instagram':
        return <InstagramOutlined />;
      case 'TikTok':
        return <TikTokOutlined />;
      default:
        return <CodeOutlined />;
    }
  };

  const handleEditForm = (form) => {
    setEditingForm(form);
    form.setFieldsValue(form);
    setIsFormModalVisible(true);
  };

  const handleDeleteForm = (formId) => {
    setForms(forms.filter(form => form.id !== formId));
    message.success('Form deleted successfully');
  };

  const handleDuplicateForm = (form) => {
    const newForm = {
      ...form,
      id: Date.now().toString(),
      title: `${form.title} (Copy)`,
      status: 'draft',
      submissions: 0
    };
    setForms([...forms, newForm]);
    message.success('Form duplicated successfully');
  };

  const handleSaveForm = (values) => {
    if (editingForm) {
      setForms(forms.map(form => 
        form.id === editingForm.id ? { ...form, ...values } : form
      ));
    } else {
      setForms([...forms, { ...values, id: Date.now().toString() }]);
    }
    setIsFormModalVisible(false);
    form.resetFields();
    message.success('Form saved successfully');
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <a onClick={() => navigate(`/form-builder/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Submissions',
      dataIndex: 'submissions',
      key: 'submissions',
    },
    {
      title: 'Last Updated',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View">
            <Button icon={<EyeOutlined />} onClick={() => navigate(`/form-builder/${record.id}`)} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button icon={<EditOutlined />} onClick={() => handleEditForm(record)} />
          </Tooltip>
          <Tooltip title="Duplicate">
            <Button icon={<CopyOutlined />} onClick={() => handleDuplicateForm(record)} />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this form?"
            onConfirm={() => handleDeleteForm(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <ManagementContainer>
      <StatsCard>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="Total Forms"
              value={forms.length}
              prefix={<BarChartOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Active Forms"
              value={forms.filter(f => f.status === 'published').length}
              prefix={<EyeOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Total Submissions"
              value={forms.reduce((acc, form) => acc + form.submissions, 0)}
              prefix={<UserOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Active Pixels"
              value={pixels.filter(p => p.status === 'active').length}
              prefix={<CodeOutlined />}
            />
          </Col>
        </Row>
      </StatsCard>

      <Card
        title="Form Management"
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateForm}>
              Create New Form
            </Button>
            <Button icon={<PlusOutlined />} onClick={handleCreatePixel}>
              Add Pixel
            </Button>
          </Space>
        }
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="All Forms" key="1">
            <Table
              columns={columns}
              dataSource={forms}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab="Pixels" key="2">
            <List
              dataSource={pixels}
              renderItem={pixel => (
                <List.Item
                  actions={[
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEditPixel(pixel)}>Edit</Button>,
                    <Button type="link" icon={<ShareAltOutlined />}>Share</Button>,
                    <Button type="link" icon={<DownloadOutlined />}>Export</Button>,
                    <Popconfirm
                      title="Are you sure you want to delete this pixel?"
                      onConfirm={() => handleDeletePixel(pixel.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="link" danger icon={<DeleteOutlined />}>Delete</Button>
                    </Popconfirm>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={getPlatformIcon(pixel.platform)} />}
                    title={
                      <div>
                        <span>{pixel.name}</span>
                        <Tag color={pixel.status === 'active' ? 'green' : 'red'} style={{ marginLeft: 8 }}>
                          {pixel.status}
                        </Tag>
                      </div>
                    }
                    description={
                      <>
                        <div>Platform: {pixel.platform}</div>
                        <div>Pixel ID: {pixel.pixelId}</div>
                        <div>Last Used: {pixel.lastUsed}</div>
                        <div>Used in {pixel.formCount} forms</div>
                        <div>
                          Events: {pixel.events.map(event => (
                            <Tag key={event} style={{ marginRight: 4 }}>{event}</Tag>
                          ))}
                        </div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={editingPixel ? "Edit Pixel" : "Create New Pixel"}
        visible={isPixelModalVisible}
        onCancel={() => {
          setIsPixelModalVisible(false);
          pixelForm.resetFields();
        }}
        onOk={() => pixelForm.submit()}
        width={600}
      >
        <Form
          form={pixelForm}
          layout="vertical"
          onFinish={handleSavePixel}
        >
          <Form.Item
            name="name"
            label="Pixel Name"
            rules={[{ required: true, message: 'Please enter a pixel name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="platform"
            label="Platform"
            rules={[{ required: true, message: 'Please select a platform' }]}
          >
            <Select>
              <Option value="Facebook"><FacebookOutlined /> Facebook</Option>
              <Option value="Google"><GoogleOutlined /> Google Analytics</Option>
              <Option value="Twitter"><TwitterOutlined /> Twitter</Option>
              <Option value="LinkedIn"><LinkedinOutlined /> LinkedIn</Option>
              <Option value="Instagram"><InstagramOutlined /> Instagram</Option>
              <Option value="TikTok"><TikTokOutlined /> TikTok</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="pixelId"
            label="Pixel ID"
            rules={[{ required: true, message: 'Please enter the pixel ID' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="events"
            label="Tracked Events"
            rules={[{ required: true, message: 'Please select at least one event' }]}
          >
            <Select mode="multiple">
              <Option value="PageView">Page View</Option>
              <Option value="Lead">Lead</Option>
              <Option value="Purchase">Purchase</Option>
              <Option value="FormSubmit">Form Submit</Option>
              <Option value="SignUp">Sign Up</Option>
              <Option value="AddToCart">Add to Cart</Option>
              <Option value="InitiateCheckout">Initiate Checkout</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="isActive"
            label="Status"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingForm ? "Edit Form" : "Create New Form"}
        visible={isFormModalVisible}
        onCancel={() => {
          setIsFormModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveForm}
        >
          <Form.Item
            name="title"
            label="Form Title"
            rules={[{ required: true, message: 'Please enter a form title' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="type"
            label="Form Type"
            rules={[{ required: true, message: 'Please select a form type' }]}
          >
            <Select>
              <Option value="single-page">Single Page</Option>
              <Option value="multi-page">Multi Page</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="pixelId"
            label="Tracking Pixel"
          >
            <Select>
              {pixels.map(pixel => (
                <Option key={pixel.id} value={pixel.id}>
                  {pixel.name} ({pixel.platform})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </ManagementContainer>
  );
};

export default FormManagement; 