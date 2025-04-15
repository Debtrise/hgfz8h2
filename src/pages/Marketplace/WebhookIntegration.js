import React, { useState } from 'react';
import { 
  Typography, 
  Card, 
  Tabs, 
  Divider, 
  Row, 
  Col, 
  Input, 
  Button, 
  Space, 
  Table, 
  Tag, 
  Switch,
  Form,
  Select,
  Tooltip,
  Alert,
  Spin
} from 'antd';
import { 
  ApiOutlined, 
  LinkOutlined, 
  FileTextOutlined, 
  CopyOutlined, 
  CheckCircleOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  ExportOutlined,
  KeyOutlined,
  LockOutlined,
  SafetyOutlined,
  FileSearchOutlined,
  GlobalOutlined,
  SendOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import '../Dashboard.css'; // Import dashboard styles

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const WebhookIntegration = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [testWebhookStatus, setTestWebhookStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleTestWebhook = () => {
    // Simulate a webhook test
    setTestWebhookStatus('loading');
    setLoading(true);
    setTimeout(() => {
      setTestWebhookStatus('success');
      setLoading(false);
    }, 2000);
  };
  
  const sampleWebhookJson = `{
  "seller_id": "seller_123456",
  "leads": [
    {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1 (555) 123-4567",
      "address": "123 Main St, Anytown, US 12345",
      "source": "Facebook Lead Ad",
      "campaign_id": "campaign_789",
      "interest_level": "high",
      "consent_given": true,
      "lead_timestamp": "2023-04-15T14:32:10Z",
      "custom_fields": {
        "budget": "$5000",
        "timeline": "Within 1 month",
        "preferred_contact": "email"
      }
    }
  ],
  "batch_id": "batch_20230415_001",
  "timestamp": "2023-04-15T14:32:15Z"
}`;

  // Sample webhook logs
  const webhookLogs = [
    {
      id: 1,
      timestamp: '2023-04-15 14:32:15',
      status: 'success',
      leads_count: 12,
      source: 'Facebook',
      message: 'Successfully processed 12 leads'
    },
    {
      id: 2,
      timestamp: '2023-04-15 14:05:22',
      status: 'error',
      leads_count: 5,
      source: 'Website Form',
      message: 'Invalid email format in 2 leads'
    },
    {
      id: 3,
      timestamp: '2023-04-15 13:51:07',
      status: 'success',
      leads_count: 8,
      source: 'Google Ads',
      message: 'Successfully processed 8 leads'
    },
    {
      id: 4,
      timestamp: '2023-04-15 12:23:44',
      status: 'warning',
      leads_count: 3,
      source: 'Manual Import',
      message: 'Duplicate detection: 1 lead skipped'
    },
    {
      id: 5,
      timestamp: '2023-04-15 11:05:33',
      status: 'success',
      leads_count: 15,
      source: 'TikTok Ads',
      message: 'Successfully processed 15 leads'
    }
  ];

  const logColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => (
        <span>
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          {text}
        </span>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'green';
        if (status === 'error') {
          color = 'red';
        } else if (status === 'warning') {
          color = 'orange';
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      }
    },
    { title: 'Leads', dataIndex: 'leads_count', key: 'leads_count' },
    { title: 'Source', dataIndex: 'source', key: 'source' },
    { title: 'Message', dataIndex: 'message', key: 'message' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button type="text" icon={<FileSearchOutlined />} size="small">View</Button>
          <Button type="text" icon={<SendOutlined />} size="small">Retry</Button>
        </Space>
      )
    }
  ];

  return (
    <div className="marketplace-webhook-integration dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <Title level={2}>Lead Webhook Integration</Title>
          <div className="dashboard-actions">
            <Button 
              type="primary" 
              icon={<ApiOutlined />}
              onClick={handleTestWebhook}
              loading={loading}
            >
              Test Webhook
            </Button>
          </div>
        </div>
        <Paragraph>
          Configure and manage webhook integrations to automatically import leads from external sources.
        </Paragraph>
        <Divider />
        
        <Tabs activeKey={activeTab} onChange={setActiveTab} className="dashboard-tabs">
          <TabPane 
            tab={
              <span>
                <InfoCircleOutlined />
                Overview
              </span>
            } 
            key="overview"
          >
            <Card className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">What is the Lead Webhook Integration?</h3>
              </div>
              <Paragraph>
                The webhook integration allows you to automatically send leads from external systems to our marketplace platform.
                Once configured, leads will be automatically processed, verified, and distributed according to your settings.
              </Paragraph>
              
              <Title level={4}>Key Features</Title>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                  <Card title={<><ApiOutlined /> Real-Time Processing</>} className="stat-card">
                    <Text>Leads are processed instantly as they're received, ensuring timely delivery to buyers.</Text>
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card title={<><SafetyOutlined /> Quality Verification</>} className="stat-card">
                    <Text>Automatic verification of email, phone, and duplicate detection to ensure high-quality leads.</Text>
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card title={<><SendOutlined /> Flexible Delivery</>} className="stat-card">
                    <Text>Configure real-time, batch, or single-serve exclusive delivery modes to meet your needs.</Text>
                  </Card>
                </Col>
              </Row>
              
              <Divider />
              
              <Title level={4}>Getting Started</Title>
              <Paragraph>
                <ol>
                  <li>Copy your unique webhook URL and API key from the "Configuration" tab</li>
                  <li>Integrate these credentials into your lead generation system or platform</li>
                  <li>Configure the payload format according to our documentation</li>
                  <li>Test your integration using the "Test Endpoint" feature</li>
                  <li>Monitor incoming leads in the "Logs" tab</li>
                </ol>
              </Paragraph>
              
              <Button 
                type="primary" 
                onClick={() => setActiveTab('configuration')}
                style={{ marginTop: 16 }}
                icon={<SettingOutlined />}
              >
                Configure Webhook
              </Button>
            </Card>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <SettingOutlined />
                Configuration
              </span>
            } 
            key="configuration"
          >
            <Card className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">
                  Webhook Endpoint Configuration
                  <Tooltip title="These settings control how external systems connect to your webhook">
                    <InfoCircleOutlined style={{ marginLeft: 8, fontSize: 14, color: '#8c8c8c' }} />
                  </Tooltip>
                </h3>
              </div>
              <Paragraph>
                Use these credentials to configure your external systems to send leads to our platform.
              </Paragraph>
              
              <Row gutter={24} style={{ marginTop: 24 }}>
                <Col span={6}>
                  <Text strong><LinkOutlined /> Webhook URL:</Text>
                </Col>
                <Col span={18}>
                  <Input.Group compact>
                    <Input 
                      style={{ width: 'calc(100% - 40px)' }}
                      readOnly
                      value="https://api.leadplatform.com/webhook/leads/a1b2c3d4e5f6"
                    />
                    <Tooltip title="Copy URL">
                      <Button icon={<CopyOutlined />} />
                    </Tooltip>
                  </Input.Group>
                </Col>
              </Row>
              
              <Row gutter={24} style={{ marginTop: 16 }}>
                <Col span={6}>
                  <Text strong><KeyOutlined /> API Key:</Text>
                </Col>
                <Col span={18}>
                  <Input.Group compact>
                    <Input.Password
                      style={{ width: 'calc(100% - 40px)' }}
                      readOnly
                      value="sk_live_Tj9MRmF4urB5gjhAQwrM34tz"
                    />
                    <Tooltip title="Copy API Key">
                      <Button icon={<CopyOutlined />} />
                    </Tooltip>
                  </Input.Group>
                </Col>
              </Row>
              
              <Row gutter={24} style={{ marginTop: 16 }}>
                <Col span={6}>
                  <Text strong><LockOutlined /> Authentication Type:</Text>
                </Col>
                <Col span={18}>
                  <Select defaultValue="bearer" style={{ width: 200 }}>
                    <Option value="bearer">Bearer Token</Option>
                    <Option value="basic">Basic Auth</Option>
                    <Option value="apikey">API Key Header</Option>
                  </Select>
                </Col>
              </Row>
              
              <Divider />
              
              <div className="chart-header">
                <h3 className="chart-title">
                  Webhook Settings
                  <Tooltip title="These settings control how leads are processed">
                    <InfoCircleOutlined style={{ marginLeft: 8, fontSize: 14, color: '#8c8c8c' }} />
                  </Tooltip>
                </h3>
              </div>
              
              <Form layout="vertical">
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item 
                      label={<><SafetyOutlined /> Lead Verification</>}
                      tooltip="Enable automatic verification of leads before processing"
                    >
                      <Switch defaultChecked />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item 
                      label={<><FileSearchOutlined /> Duplicate Detection</>}
                      tooltip="Detect and reject duplicate leads"
                    >
                      <Switch defaultChecked />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item 
                      label={<><InfoCircleOutlined /> Default Lead Category</>}
                      tooltip="Assign leads to this category if not specified in payload"
                    >
                      <Select defaultValue="general">
                        <Option value="general">General</Option>
                        <Option value="insurance">Insurance</Option>
                        <Option value="real-estate">Real Estate</Option>
                        <Option value="finance">Finance</Option>
                        <Option value="automotive">Automotive</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item 
                      label={<><SendOutlined /> Webhook Response</>}
                      tooltip="Configure what's returned after webhook processing"
                    >
                      <Select defaultValue="detailed">
                        <Option value="simple">Simple (Success/Error)</Option>
                        <Option value="detailed">Detailed (With Validation Info)</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item 
                  label={<><GlobalOutlined /> IP Whitelist</>}
                  tooltip="Only accept webhooks from these IP addresses (comma separated, leave empty to allow all)"
                >
                  <Input placeholder="192.168.1.1, 10.0.0.1" />
                </Form.Item>
              </Form>
              
              <div style={{ marginTop: 24 }}>
                <Space>
                  <Button type="primary" icon={<CheckCircleOutlined />}>
                    Save Configuration
                  </Button>
                  <Button icon={<ApiOutlined />} onClick={handleTestWebhook} loading={loading}>
                    Test Endpoint
                  </Button>
                </Space>
                
                {testWebhookStatus === 'loading' && (
                  <Alert 
                    message="Testing webhook endpoint..." 
                    type="info" 
                    showIcon 
                    style={{ marginTop: 16 }} 
                  />
                )}
                
                {testWebhookStatus === 'success' && (
                  <Alert 
                    message="Webhook endpoint is working correctly!" 
                    type="success" 
                    showIcon 
                    style={{ marginTop: 16 }} 
                  />
                )}
              </div>
            </Card>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <FileTextOutlined />
                Documentation
              </span>
            } 
            key="documentation"
          >
            <Card className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">
                  Webhook Payload Format
                  <Tooltip title="Format your data according to this structure">
                    <InfoCircleOutlined style={{ marginLeft: 8, fontSize: 14, color: '#8c8c8c' }} />
                  </Tooltip>
                </h3>
                <div className="chart-actions">
                  <Button icon={<DownloadOutlined />} style={{ marginRight: 8 }}>
                    Download Docs
                  </Button>
                  <Button icon={<ApiOutlined />}>
                    API Reference
                  </Button>
                </div>
              </div>
              
              <Paragraph>
                Your webhook requests should follow this JSON format. All timestamps should be in ISO 8601 format.
              </Paragraph>
              
              <div style={{ marginBottom: 24 }}>
                <SyntaxHighlighter language="json" style={docco}>
                  {sampleWebhookJson}
                </SyntaxHighlighter>
              </div>
              
              <div className="chart-header">
                <h3 className="chart-title">Required Fields</h3>
              </div>
              <Paragraph>
                These fields are required for each lead object:
              </Paragraph>
              
              <Table 
                dataSource={[
                  { field: 'first_name', type: 'String', description: 'First name of the lead' },
                  { field: 'last_name', type: 'String', description: 'Last name of the lead' },
                  { field: 'email', type: 'String', description: 'Email address (must be valid format)' },
                  { field: 'phone', type: 'String', description: 'Phone number with country code' },
                  { field: 'consent_given', type: 'Boolean', description: 'Indicates if lead provided consent for contact' },
                  { field: 'lead_timestamp', type: 'ISO8601 DateTime', description: 'When the lead was generated' },
                ]} 
                columns={[
                  { title: 'Field', dataIndex: 'field', key: 'field' },
                  { title: 'Type', dataIndex: 'type', key: 'type' },
                  { title: 'Description', dataIndex: 'description', key: 'description' },
                ]}
                pagination={false}
                size="small"
              />
              
              <div className="chart-header" style={{ marginTop: 24 }}>
                <h3 className="chart-title">Optional Fields</h3>
              </div>
              <Paragraph>
                These fields are optional but recommended for better lead quality and tracking:
              </Paragraph>
              
              <Table 
                dataSource={[
                  { field: 'address', type: 'String', description: 'Physical address of the lead' },
                  { field: 'source', type: 'String', description: 'The source of the lead (e.g. Facebook, Google)' },
                  { field: 'campaign_id', type: 'String', description: 'Identifier for the marketing campaign' },
                  { field: 'interest_level', type: 'String', description: 'Indicated interest level (high, medium, low)' },
                  { field: 'custom_fields', type: 'Object', description: 'Any additional custom fields as key-value pairs' },
                ]} 
                columns={[
                  { title: 'Field', dataIndex: 'field', key: 'field' },
                  { title: 'Type', dataIndex: 'type', key: 'type' },
                  { title: 'Description', dataIndex: 'description', key: 'description' },
                ]}
                pagination={false}
                size="small"
              />
              
              <Divider />
              
              <div className="chart-header">
                <h3 className="chart-title">Response Codes</h3>
              </div>
              <Paragraph>
                Your webhook will receive the following HTTP status codes:
              </Paragraph>
              
              <Table 
                dataSource={[
                  { code: '200', status: 'OK', description: 'Webhook processed successfully' },
                  { code: '400', status: 'Bad Request', description: 'Invalid JSON or missing required fields' },
                  { code: '401', status: 'Unauthorized', description: 'Invalid API key or authentication' },
                  { code: '403', status: 'Forbidden', description: 'IP not in whitelist or account restrictions' },
                  { code: '429', status: 'Too Many Requests', description: 'Rate limit exceeded' },
                  { code: '500', status: 'Server Error', description: 'Something went wrong on our end' },
                ]} 
                columns={[
                  { title: 'HTTP Code', dataIndex: 'code', key: 'code' },
                  { title: 'Status', dataIndex: 'status', key: 'status' },
                  { title: 'Description', dataIndex: 'description', key: 'description' },
                ]}
                pagination={false}
                size="small"
              />
            </Card>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <FileTextOutlined />
                Logs
              </span>
            } 
            key="logs"
          >
            <Card className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">
                  Webhook Activity Logs
                  <Tooltip title="View all recent webhook activity">
                    <InfoCircleOutlined style={{ marginLeft: 8, fontSize: 14, color: '#8c8c8c' }} />
                  </Tooltip>
                </h3>
                <div className="chart-actions">
                  <Button icon={<DownloadOutlined />}>Export Logs</Button>
                </div>
              </div>
              <Paragraph>
                View recent webhook activity, including successful deliveries and errors.
              </Paragraph>
              
              <Table 
                dataSource={webhookLogs} 
                columns={logColumns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
              
              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <Tooltip title="Need help with webhook logs?">
                  <Button icon={<QuestionCircleOutlined />} style={{ marginRight: 8 }}>Help</Button>
                </Tooltip>
                <Button icon={<ExportOutlined />}>Generate Report</Button>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default WebhookIntegration; 