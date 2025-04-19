import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Tabs, 
  Button, 
  Space, 
  Table, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch,
  Divider,
  Typography,
  Tooltip,
  Upload,
  message,
  InputNumber,
  Collapse,
  Radio,
  Checkbox
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SendOutlined,
  UploadOutlined,
  PictureOutlined,
  LinkOutlined,
  TableOutlined,
  CodeOutlined,
  EyeOutlined,
  MobileOutlined,
  DesktopOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const { TabPane } = Tabs;
const { Option } = Select;
const { Panel } = Collapse;
const { Title, Text } = Typography;

const EmailManagerContainer = styled.div`
  padding: 24px;
`;

const TemplateBuilderContainer = styled.div`
  display: flex;
  height: calc(100vh - 200px);
`;

const Sidebar = styled.div`
  width: 300px;
  background: #fff;
  border-right: 1px solid #f0f0f0;
  padding: 16px;
  overflow-y: auto;
`;

const BuilderArea = styled.div`
  flex: 1;
  background: #f5f5f5;
  padding: 16px;
  overflow-y: auto;
`;

const PreviewArea = styled.div`
  width: 400px;
  background: #fff;
  border-left: 1px solid #f0f0f0;
  padding: 16px;
  overflow-y: auto;
`;

const EmailManager = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
  const [isBuilderModalVisible, setIsBuilderModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Mock data for templates
  const templates = [
    {
      id: '1',
      name: 'Welcome Email',
      subject: 'Welcome to Our Platform!',
      category: 'Onboarding',
      lastModified: '2024-03-15',
      status: 'active',
      journey: 'Welcome Journey'
    },
    {
      id: '2',
      name: 'Promotional Offer',
      subject: 'Special Discount Inside!',
      category: 'Promotion',
      lastModified: '2024-03-14',
      status: 'active',
      journey: 'Promo Journey'
    },
    {
      id: '3',
      name: 'Abandoned Cart',
      subject: 'Complete Your Purchase',
      category: 'Retention',
      lastModified: '2024-03-13',
      status: 'draft',
      journey: 'Cart Recovery'
    }
  ];

  // Mock data for journeys
  const journeys = [
    {
      id: '1',
      name: 'Welcome Journey',
      status: 'active',
      emails: 3,
      subscribers: 1200,
      openRate: 45,
      clickRate: 12
    },
    {
      id: '2',
      name: 'Promo Journey',
      status: 'active',
      emails: 5,
      subscribers: 800,
      openRate: 38,
      clickRate: 8
    },
    {
      id: '3',
      name: 'Cart Recovery',
      status: 'active',
      emails: 2,
      subscribers: 500,
      openRate: 42,
      clickRate: 15
    }
  ];

  const templateColumns = [
    {
      title: 'Template Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Button type="link" onClick={() => handleEditTemplate(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Last Modified',
      dataIndex: 'lastModified',
      key: 'lastModified',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Journey',
      dataIndex: 'journey',
      key: 'journey',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditTemplate(record)}>
            Edit
          </Button>
          <Button type="link" icon={<DeleteOutlined />} danger>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const journeyColumns = [
    {
      title: 'Journey Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Button type="link" onClick={() => handleViewJourney(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Emails',
      dataIndex: 'emails',
      key: 'emails',
    },
    {
      title: 'Subscribers',
      dataIndex: 'subscribers',
      key: 'subscribers',
    },
    {
      title: 'Open Rate',
      dataIndex: 'openRate',
      key: 'openRate',
      render: (rate) => `${rate}%`,
    },
    {
      title: 'Click Rate',
      dataIndex: 'clickRate',
      key: 'clickRate',
      render: (rate) => `${rate}%`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />}>
            Edit
          </Button>
          <Button type="link" icon={<SendOutlined />}>
            Send
          </Button>
        </Space>
      ),
    },
  ];

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setIsBuilderModalVisible(true);
  };

  const handleViewJourney = (journey) => {
    navigate(`/marketing/journeys/${journey.id}`);
  };

  const TemplateBuilder = () => {
    const [activePreview, setActivePreview] = useState('desktop');

    return (
      <TemplateBuilderContainer>
        <Sidebar>
          <Collapse defaultActiveKey={['1']}>
            <Panel header="Content Blocks" key="1">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button block icon={<UploadOutlined />}>Image</Button>
                <Button block icon={<Typography />}>Text</Button>
                <Button block icon={<TableOutlined />}>Table</Button>
                <Button block icon={<LinkOutlined />}>Button</Button>
                <Button block icon={<CodeOutlined />}>HTML</Button>
              </Space>
            </Panel>
            <Panel header="Settings" key="2">
              <Form layout="vertical">
                <Form.Item label="Template Name">
                  <Input />
                </Form.Item>
                <Form.Item label="Subject">
                  <Input />
                </Form.Item>
                <Form.Item label="Category">
                  <Select>
                    <Option value="onboarding">Onboarding</Option>
                    <Option value="promotion">Promotion</Option>
                    <Option value="retention">Retention</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Width">
                  <InputNumber min={300} max={800} defaultValue={600} />
                </Form.Item>
                <Form.Item label="Background Color">
                  <Input type="color" />
                </Form.Item>
              </Form>
            </Panel>
          </Collapse>
        </Sidebar>

        <BuilderArea>
          <div style={{ 
            width: '600px', 
            margin: '0 auto', 
            background: '#fff', 
            padding: '20px',
            minHeight: '100%'
          }}>
            {/* Email content will be built here */}
          </div>
        </BuilderArea>

        <PreviewArea>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Radio.Group 
              value={activePreview} 
              onChange={e => setActivePreview(e.target.value)}
              style={{ marginBottom: 16 }}
            >
              <Radio.Button value="desktop"><DesktopOutlined /></Radio.Button>
              <Radio.Button value="mobile"><MobileOutlined /></Radio.Button>
            </Radio.Group>
            <div style={{ 
              border: '1px solid #f0f0f0',
              padding: '20px',
              background: '#fff',
              transform: activePreview === 'mobile' ? 'scale(0.5)' : 'none',
              transformOrigin: 'top left',
              width: activePreview === 'mobile' ? '800px' : '100%'
            }}>
              {/* Preview content will be shown here */}
            </div>
          </Space>
        </PreviewArea>
      </TemplateBuilderContainer>
    );
  };

  return (
    <EmailManagerContainer>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card
            title="Email Manager"
            extra={
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => setIsTemplateModalVisible(true)}
                >
                  New Template
                </Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => setIsBuilderModalVisible(true)}
                >
                  New Journey
                </Button>
              </Space>
            }
          >
            <Tabs defaultActiveKey="1" onChange={setActiveTab}>
              <TabPane tab="Templates" key="1">
                <Table
                  columns={templateColumns}
                  dataSource={templates}
                  rowKey="id"
                />
              </TabPane>

              <TabPane tab="Journeys" key="2">
                <Table
                  columns={journeyColumns}
                  dataSource={journeys}
                  rowKey="id"
                />
              </TabPane>

              <TabPane tab="Analytics" key="3">
                <Row gutter={[24, 24]}>
                  <Col span={8}>
                    <Card>
                      <Statistic
                        title="Total Emails Sent"
                        value={2500}
                        prefix={<SendOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Statistic
                        title="Average Open Rate"
                        value={42}
                        suffix="%"
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Statistic
                        title="Average Click Rate"
                        value={12}
                        suffix="%"
                      />
                    </Card>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Email Template Builder"
        open={isBuilderModalVisible}
        onCancel={() => {
          setIsBuilderModalVisible(false);
          setSelectedTemplate(null);
        }}
        width="90%"
        style={{ top: 20 }}
        footer={null}
      >
        <TemplateBuilder />
      </Modal>
    </EmailManagerContainer>
  );
};

export default EmailManager; 