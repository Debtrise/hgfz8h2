import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Tabs, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker,
  Switch,
  Progress,
  Tooltip,
  Divider,
  Alert,
  Avatar,
  List,
  Typography,
  InputNumber
} from 'antd';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  FacebookOutlined, 
  GoogleOutlined, 
  TwitterOutlined, 
  LinkedinOutlined, 
  InstagramOutlined, 
  TikTokOutlined,
  PlusOutlined,
  DollarOutlined,
  UserOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  SyncOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const DashboardContainer = styled.div`
  padding: 24px;
`;

const StatsCard = styled(Card)`
  margin-bottom: 24px;
  height: 100%;
`;

const ChartCard = styled(Card)`
  margin-bottom: 24px;
`;

const IntegrationCard = styled(Card)`
  margin-bottom: 16px;
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const MarketingDashboard = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [isIntegrationModalVisible, setIsIntegrationModalVisible] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [integrations, setIntegrations] = useState([]);
  const [selectedSource, setSelectedSource] = useState('all');
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Mock data for demonstration
  useEffect(() => {
    setIntegrations([
      {
        id: '1',
        platform: 'Facebook',
        status: 'connected',
        spend: 2500,
        leads: 150,
        cpl: 16.67,
        lastSync: '2024-03-15T10:30:00',
        accountName: 'Main Ad Account',
        accountId: 'act_123456789',
        campaigns: 5,
        active: true
      },
      {
        id: '2',
        platform: 'Google',
        status: 'connected',
        spend: 1800,
        leads: 120,
        cpl: 15.00,
        lastSync: '2024-03-15T09:45:00',
        accountName: 'Google Ads Account',
        accountId: '123-456-7890',
        campaigns: 3,
        active: true
      },
      // Add more mock integrations as needed
    ]);
  }, []);

  const handleConnectIntegration = (values) => {
    // In a real implementation, this would connect to the actual platform API
    const newIntegration = {
      ...values,
      id: Date.now().toString(),
      status: 'connected',
      lastSync: new Date().toISOString(),
      active: true
    };
    setIntegrations([...integrations, newIntegration]);
    setIsIntegrationModalVisible(false);
    form.resetFields();
  };

  const handleDisconnectIntegration = (id) => {
    setIntegrations(integrations.map(integration => 
      integration.id === id ? { ...integration, active: false } : integration
    ));
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
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'green';
      case 'disconnected':
        return 'red';
      case 'syncing':
        return 'blue';
      default:
        return 'default';
    }
  };

  // Mock data for charts
  const spendData = [
    { date: '2024-03-01', Facebook: 800, Google: 600 },
    { date: '2024-03-02', Facebook: 900, Google: 700 },
    { date: '2024-03-03', Facebook: 1000, Google: 800 },
    { date: '2024-03-04', Facebook: 1100, Google: 900 },
    { date: '2024-03-05', Facebook: 1200, Google: 1000 },
  ];

  const leadSourceData = [
    { name: 'Facebook', value: 40 },
    { name: 'Google', value: 30 },
    { name: 'LinkedIn', value: 20 },
    { name: 'Other', value: 10 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const handleSourceChange = (value) => {
    setSelectedSource(value);
  };

  const filteredCampaigns = selectedSource === 'all' 
    ? mockCampaigns 
    : mockCampaigns.filter(campaign => campaign.platform === selectedSource);

  // Update the campaigns table columns to include a view details action
  const campaignColumns = [
    {
      title: 'Campaign',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Button type="link" onClick={() => navigate(`/marketing/campaigns/${record.id}`)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      render: (platform) => (
        <Space>
          {getPlatformIcon(platform)}
          {platform}
        </Space>
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
      title: 'Spend',
      dataIndex: 'spend',
      key: 'spend',
      render: (spend) => `$${spend}`,
    },
    {
      title: 'Leads',
      dataIndex: 'leads',
      key: 'leads',
    },
    {
      title: 'CPL',
      dataIndex: 'cpl',
      key: 'cpl',
      render: (cpl) => `$${cpl}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/marketing/campaigns/${record.id}`)}>
            View Details
          </Button>
          <Button type="link" icon={<EditOutlined />}>Edit</Button>
          <Button type="link" danger icon={<DeleteOutlined />}>Delete</Button>
        </Space>
      ),
    },
  ];

  const handlePlatformChange = (value) => {
    setSelectedPlatform(value);
    if (value === 'webhook') {
      setIsIntegrationModalVisible(true);
      form.resetFields();
    }
  };

  return (
    <DashboardContainer>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card
            title="Marketing Dashboard"
            extra={
              <Space>
                <RangePicker />
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => {
                    setSelectedPlatform(null);
                    setIsIntegrationModalVisible(true);
                  }}
                >
                  Connect Platform
                </Button>
              </Space>
            }
          >
            <Tabs defaultActiveKey="1" onChange={setActiveTab}>
              <TabPane tab="Overview" key="1">
                <Row gutter={[24, 24]}>
                  <Col span={6}>
                    <StatsCard>
                      <Statistic
                        title="Total Spend"
                        value={4300}
                        prefix={<DollarOutlined />}
                      />
                      <Progress percent={75} status="active" />
                    </StatsCard>
                  </Col>
                  <Col span={6}>
                    <StatsCard>
                      <Statistic
                        title="Total Leads"
                        value={270}
                        prefix={<UserOutlined />}
                      />
                      <Progress percent={60} status="active" />
                    </StatsCard>
                  </Col>
                  <Col span={6}>
                    <StatsCard>
                      <Statistic
                        title="Average CPL"
                        value={15.93}
                        prefix={<DollarOutlined />}
                        precision={2}
                      />
                      <Progress percent={45} status="active" />
                    </StatsCard>
                  </Col>
                  <Col span={6}>
                    <StatsCard>
                      <Statistic
                        title="Conversion Rate"
                        value={6.3}
                        suffix="%"
                        precision={1}
                      />
                      <Progress percent={80} status="active" />
                    </StatsCard>
                  </Col>
                </Row>

                <Row gutter={[24, 24]}>
                  <Col span={16}>
                    <ChartCard title="Spend Over Time">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={spendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Line type="monotone" dataKey="Facebook" stroke="#1877F2" />
                          <Line type="monotone" dataKey="Google" stroke="#4285F4" />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </Col>
                  <Col span={8}>
                    <ChartCard title="Lead Sources">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={leadSourceData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {leadSourceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab="Campaigns" key="2">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space style={{ marginBottom: 16 }}>
                    <Select
                      style={{ width: 200 }}
                      placeholder="Select Marketing Source"
                      value={selectedSource}
                      onChange={handleSourceChange}
                    >
                      <Option value="all">All Sources</Option>
                      {integrations
                        .filter(integration => integration.status === 'connected')
                        .map(integration => (
                          <Option key={integration.platform} value={integration.platform}>
                            {getPlatformIcon(integration.platform)} {integration.platform}
                          </Option>
                        ))}
                    </Select>
                    <Button type="primary" icon={<PlusOutlined />}>
                      New Campaign
                    </Button>
                  </Space>
                  <Table
                    columns={campaignColumns}
                    dataSource={filteredCampaigns}
                    rowKey="id"
                  />
                </Space>
              </TabPane>

              <TabPane tab="Settings" key="3">
                <Tabs defaultActiveKey="integrations">
                  <TabPane tab="Integrations" key="integrations">
                    <List
                      dataSource={integrations}
                      renderItem={integration => (
                        <IntegrationCard>
                          <List.Item
                            actions={[
                              <Button type="link" icon={<SyncOutlined />}>Sync Now</Button>,
                              <Switch
                                checked={integration.active}
                                onChange={() => handleDisconnectIntegration(integration.id)}
                              />
                            ]}
                          >
                            <List.Item.Meta
                              avatar={<Avatar icon={getPlatformIcon(integration.platform)} />}
                              title={
                                <Space>
                                  <span>{integration.platform}</span>
                                  <Tag color={getStatusColor(integration.status)}>
                                    {integration.status}
                                  </Tag>
                                </Space>
                              }
                              description={
                                <>
                                  <div>Account: {integration.accountName}</div>
                                  <div>ID: {integration.accountId}</div>
                                  <div>Last Sync: {new Date(integration.lastSync).toLocaleString()}</div>
                                  <div>Active Campaigns: {integration.campaigns}</div>
                                </>
                              }
                            />
                            <Space direction="vertical" align="end">
                              <Statistic
                                title="Spend"
                                value={integration.spend}
                                prefix={<DollarOutlined />}
                              />
                              <Statistic
                                title="Leads"
                                value={integration.leads}
                                prefix={<UserOutlined />}
                              />
                              <Statistic
                                title="CPL"
                                value={integration.cpl}
                                prefix={<DollarOutlined />}
                                precision={2}
                              />
                            </Space>
                          </List.Item>
                        </IntegrationCard>
                      )}
                    />
                  </TabPane>
                  <TabPane tab="General Settings" key="general">
                    <Card title="General Settings">
                      <Form layout="vertical">
                        <Form.Item label="Default Currency">
                          <Select defaultValue="USD">
                            <Option value="USD">USD ($)</Option>
                            <Option value="EUR">EUR (€)</Option>
                            <Option value="GBP">GBP (£)</Option>
                          </Select>
                        </Form.Item>
                        <Form.Item label="Time Zone">
                          <Select defaultValue="UTC">
                            <Option value="UTC">UTC</Option>
                            <Option value="EST">Eastern Time</Option>
                            <Option value="PST">Pacific Time</Option>
                          </Select>
                        </Form.Item>
                        <Form.Item label="Data Retention Period">
                          <Select defaultValue="90">
                            <Option value="30">30 days</Option>
                            <Option value="60">60 days</Option>
                            <Option value="90">90 days</Option>
                            <Option value="180">180 days</Option>
                            <Option value="365">1 year</Option>
                          </Select>
                        </Form.Item>
                        <Form.Item>
                          <Button type="primary">Save Settings</Button>
                        </Form.Item>
                      </Form>
                    </Card>
                  </TabPane>
                </Tabs>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Connect Marketing Platform"
        open={isIntegrationModalVisible}
        onCancel={() => {
          setIsIntegrationModalVisible(false);
          form.resetFields();
          setSelectedPlatform(null);
        }}
        onOk={() => form.submit()}
        width={selectedPlatform === 'webhook' ? 800 : 600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleConnectIntegration}
        >
          <Form.Item
            name="platform"
            label="Platform"
            rules={[{ required: true, message: 'Please select a platform' }]}
          >
            <Select 
              placeholder="Select platform"
              onChange={handlePlatformChange}
              value={selectedPlatform}
            >
              <Option value="facebook">Facebook Ads</Option>
              <Option value="google">Google Ads</Option>
              <Option value="linkedin">LinkedIn Ads</Option>
              <Option value="twitter">Twitter Ads</Option>
              <Option value="webhook">Webhook Integration</Option>
            </Select>
          </Form.Item>

          {selectedPlatform === 'webhook' ? (
            <>
              <Form.Item
                name="name"
                label="Webhook Name"
                rules={[{ required: true, message: 'Please enter webhook name' }]}
              >
                <Input placeholder="Enter webhook name" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
              >
                <Input.TextArea placeholder="Enter webhook description" />
              </Form.Item>

              <Form.Item
                name="defaultPoolId"
                label="Default Lead Pool"
                rules={[{ required: true, message: 'Please select default lead pool' }]}
              >
                <Select placeholder="Select lead pool">
                  <Option value="pool1">Lead Pool 1</Option>
                  <Option value="pool2">Lead Pool 2</Option>
                  <Option value="pool3">Lead Pool 3</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="defaultBrand"
                label="Default Brand"
              >
                <Select placeholder="Select brand">
                  <Option value="brand1">Brand 1</Option>
                  <Option value="brand2">Brand 2</Option>
                  <Option value="brand3">Brand 3</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="defaultSource"
                label="Default Source"
              >
                <Select placeholder="Select source">
                  <Option value="source1">Source 1</Option>
                  <Option value="source2">Source 2</Option>
                  <Option value="source3">Source 3</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="defaultLeadAge"
                label="Default Lead Age (days)"
                initialValue={0}
              >
                <InputNumber min={0} />
              </Form.Item>

              <Divider>Field Mapping</Divider>

              <Form.Item
                name="fieldMapping.phone"
                label="Phone Field"
                rules={[{ required: true, message: 'Please enter phone field mapping' }]}
              >
                <Input placeholder="e.g., phone" />
              </Form.Item>

              <Form.Item
                name="fieldMapping.firstName"
                label="First Name Field"
                rules={[{ required: true, message: 'Please enter first name field mapping' }]}
              >
                <Input placeholder="e.g., first_name" />
              </Form.Item>

              <Form.Item
                name="fieldMapping.lastName"
                label="Last Name Field"
                rules={[{ required: true, message: 'Please enter last name field mapping' }]}
              >
                <Input placeholder="e.g., last_name" />
              </Form.Item>

              <Form.Item
                name="fieldMapping.email"
                label="Email Field"
              >
                <Input placeholder="e.g., email" />
              </Form.Item>

              <Form.Item
                name="authToken"
                label="Authentication Token"
                rules={[{ required: true, message: 'Please enter authentication token' }]}
              >
                <Input.Password placeholder="Enter authentication token" />
              </Form.Item>

              <Form.Item
                name="active"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                name="accountName"
                label="Account Name"
                rules={[{ required: true, message: 'Please enter account name' }]}
              >
                <Input placeholder="Enter account name" />
              </Form.Item>

              <Form.Item
                name="accountId"
                label="Account ID"
                rules={[{ required: true, message: 'Please enter account ID' }]}
              >
                <Input placeholder="Enter account ID" />
              </Form.Item>

              <Form.Item
                name="apiKey"
                label="API Key"
                rules={[{ required: true, message: 'Please enter API key' }]}
              >
                <Input.Password placeholder="Enter API key" />
              </Form.Item>

              <Form.Item
                name="apiSecret"
                label="API Secret"
                rules={[{ required: true, message: 'Please enter API secret' }]}
              >
                <Input.Password placeholder="Enter API secret" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </DashboardContainer>
  );
};

// Add mock campaigns data
const mockCampaigns = [
  {
    id: '1',
    name: 'Spring Sale 2024',
    platform: 'Facebook',
    status: 'active',
    spend: 1200,
    leads: 80,
    cpl: 15.00,
  },
  {
    id: '2',
    name: 'Product Launch',
    platform: 'Google',
    status: 'active',
    spend: 800,
    leads: 50,
    cpl: 16.00,
  },
  {
    id: '3',
    name: 'Summer Promotion',
    platform: 'Facebook',
    status: 'paused',
    spend: 600,
    leads: 40,
    cpl: 15.00,
  },
  {
    id: '4',
    name: 'Brand Awareness',
    platform: 'LinkedIn',
    status: 'active',
    spend: 1000,
    leads: 30,
    cpl: 33.33,
  },
];

export default MarketingDashboard; 