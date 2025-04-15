import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Switch, 
  Select, 
  Tabs, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Divider,
  InputNumber,
  Radio,
  Space,
  Alert,
  Collapse,
  Checkbox,
  Slider,
  Tag,
  Tooltip,
  List,
  Avatar,
  Statistic,
  Progress
} from 'antd';
import { 
  BankOutlined, 
  LockOutlined, 
  NotificationOutlined, 
  UserOutlined, 
  SettingOutlined,
  SaveOutlined,
  CreditCardOutlined,
  BellOutlined,
  ApiOutlined,
  LinkOutlined,
  CloudSyncOutlined,
  ClockCircleOutlined,
  StarOutlined,
  CodeOutlined,
  FacebookOutlined,
  GoogleOutlined,
  CopyOutlined,
  InfoCircleOutlined,
  SendOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  UserSwitchOutlined,
  KeyOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Panel } = Collapse;

const Settings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState('real-time');
  const [selectedIntegrations, setSelectedIntegrations] = useState(['webhook']);
  const [facebookConnected, setFacebookConnected] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [leadVerification, setLeadVerification] = useState(true);

  const handleSave = () => {
    // In a real app, this would save to an API
    setSavedSuccessfully(true);
    setTimeout(() => {
      setSavedSuccessfully(false);
    }, 3000);
  };

  const toggleIntegration = (integration) => {
    if (selectedIntegrations.includes(integration)) {
      setSelectedIntegrations(selectedIntegrations.filter(i => i !== integration));
    } else {
      setSelectedIntegrations([...selectedIntegrations, integration]);
    }
  };

  const integrationList = [
    { 
      id: 'facebook', 
      name: 'Facebook Lead Ads', 
      icon: <FacebookOutlined style={{ fontSize: 24, color: '#1877F2' }} />,
      status: selectedIntegrations.includes('facebook'),
      description: 'Connect to Facebook Lead Ads to automatically import leads when users submit your lead forms.'
    },
    { 
      id: 'google', 
      name: 'Google Ads', 
      icon: <GoogleOutlined style={{ fontSize: 24, color: '#4285F4' }} />,
      status: selectedIntegrations.includes('google'),
      description: 'Import leads directly from Google Ads lead form extensions.'
    },
    { 
      id: 'tiktok', 
      name: 'TikTok Lead Generation', 
      icon: <img src="/tiktok-icon.png" alt="TikTok" style={{ width: 24, height: 24 }} />,
      status: selectedIntegrations.includes('tiktok'),
      description: 'Connect to TikTok lead generation forms to automatically import leads.'
    },
    { 
      id: 'pinterest', 
      name: 'Pinterest Lead Ads', 
      icon: <img src="/pinterest-icon.png" alt="Pinterest" style={{ width: 24, height: 24 }} />,
      status: selectedIntegrations.includes('pinterest'),
      description: 'Import leads directly from Pinterest lead gen campaigns.'
    },
    { 
      id: 'webhook', 
      name: 'Webhook / API', 
      icon: <CodeOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      status: selectedIntegrations.includes('webhook'),
      description: 'Use our REST API or webhooks to push leads from any external system.'
    }
  ];

  const sellerReviews = [
    {
      id: 1,
      name: 'Enterprise Solutions',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      rating: 5,
      date: '2023-02-15',
      comment: 'Excellent lead quality. Our conversion rate increased by 25% with these leads.',
    },
    {
      id: 2,
      name: 'Growth Marketing',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      rating: 4,
      date: '2023-01-28',
      comment: 'Good quality leads with accurate contact information. Will purchase again.',
    },
    {
      id: 3,
      name: 'TechBuyers Inc.',
      avatar: 'https://randomuser.me/api/portraits/men/68.jpg',
      rating: 5,
      date: '2023-01-10',
      comment: 'The real-time delivery integration worked flawlessly. Leads were automatically added to our CRM.',
    },
  ];

  return (
    <div className="marketplace-settings">
      <Title level={2}>Marketplace Settings</Title>
      <Divider />
      
      {savedSuccessfully && (
        <Alert
          message="Settings saved successfully"
          type="success"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Tabs defaultActiveKey="profile">
        <TabPane 
          tab={
            <span>
              <UserOutlined />
              Profile Settings
            </span>
          } 
          key="profile"
        >
          <Card className="marketplace-stats-card">
            <Form layout="vertical" initialValues={{ name: 'John Doe', email: 'john.doe@example.com', company: 'ABC Corp', role: 'both' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item 
                    label="Full Name" 
                    name="name"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item 
                    label="Email" 
                    name="email"
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item 
                    label="Company" 
                    name="company"
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item 
                    label="Phone Number" 
                    name="phone"
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item 
                label="Marketplace Role" 
                name="role"
              >
                <Radio.Group>
                  <Radio value="buyer">Buyer Only</Radio>
                  <Radio value="seller">Seller Only</Radio>
                  <Radio value="both">Both Buyer and Seller</Radio>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <BankOutlined />
              Payment Settings
            </span>
          } 
          key="payment"
        >
          <Card className="marketplace-stats-card">
            <Paragraph>
              Configure your payment preferences for both buying and selling leads in the marketplace.
            </Paragraph>
            
            <Divider orientation="left">
              <span className="section-title">Payment Method</span>
            </Divider>
            
            <Radio.Group 
              value={paymentMethod} 
              onChange={e => setPaymentMethod(e.target.value)}
              style={{ marginBottom: 24 }}
            >
              <Space direction="vertical">
                <Radio value="bank">
                  <Space>
                    <BankOutlined />
                    Bank Account (ACH)
                  </Space>
                </Radio>
                <Radio value="card">
                  <Space>
                    <CreditCardOutlined />
                    Credit/Debit Card
                  </Space>
                </Radio>
                <Radio value="paypal">
                  <img src="/paypal-icon.png" alt="PayPal" style={{ width: 20, marginRight: 8 }} />
                  PayPal
                </Radio>
              </Space>
            </Radio.Group>
            
            {paymentMethod === 'bank' && (
              <Form layout="vertical">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item 
                      label="Bank Name" 
                      name="bankName"
                      rules={[{ required: true, message: 'Please enter bank name' }]}
                    >
                      <Input placeholder="Enter bank name" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item 
                      label="Account Name" 
                      name="accountName"
                      rules={[{ required: true, message: 'Please enter account name' }]}
                    >
                      <Input placeholder="Enter account name" />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item 
                      label="Routing Number" 
                      name="routingNumber"
                      rules={[{ required: true, message: 'Please enter routing number' }]}
                    >
                      <Input placeholder="Enter routing number" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item 
                      label="Account Number" 
                      name="accountNumber"
                      rules={[{ required: true, message: 'Please enter account number' }]}
                    >
                      <Input placeholder="Enter account number" />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            )}
            
            {paymentMethod === 'card' && (
              <Form layout="vertical">
                <Form.Item 
                  label="Card Number" 
                  name="cardNumber"
                  rules={[{ required: true, message: 'Please enter card number' }]}
                >
                  <Input placeholder="XXXX XXXX XXXX XXXX" />
                </Form.Item>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item 
                      label="Expiry Date" 
                      name="expiryDate"
                      rules={[{ required: true, message: 'Please enter expiry date' }]}
                    >
                      <Input placeholder="MM/YY" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item 
                      label="CVV" 
                      name="cvv"
                      rules={[{ required: true, message: 'Please enter CVV' }]}
                    >
                      <Input placeholder="XXX" />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item 
                  label="Name on Card" 
                  name="nameOnCard"
                  rules={[{ required: true, message: 'Please enter name on card' }]}
                >
                  <Input placeholder="Enter name as it appears on card" />
                </Form.Item>
              </Form>
            )}
            
            {paymentMethod === 'paypal' && (
              <Form layout="vertical">
                <Form.Item 
                  label="PayPal Email" 
                  name="paypalEmail"
                  rules={[
                    { required: true, message: 'Please enter PayPal email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input placeholder="Enter PayPal email address" />
                </Form.Item>
              </Form>
            )}
            
            <Divider orientation="left">
              <span className="section-title">Seller Payout</span>
            </Divider>
            
            <Form layout="vertical">
              <Form.Item 
                label="Minimum Payout Amount" 
                name="minPayout"
                initialValue={50}
              >
                <InputNumber 
                  min={10} 
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  style={{ width: 200 }}
                />
              </Form.Item>
              
              <Form.Item 
                label="Payout Frequency" 
                name="payoutFrequency"
                initialValue="weekly"
              >
                <Select style={{ width: 200 }}>
                  <Option value="daily">Daily</Option>
                  <Option value="weekly">Weekly</Option>
                  <Option value="biweekly">Bi-weekly</Option>
                  <Option value="monthly">Monthly</Option>
                </Select>
              </Form.Item>
            </Form>
            
            <Form.Item style={{ marginTop: 24 }}>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                Save Payment Settings
              </Button>
            </Form.Item>
          </Card>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <CloudSyncOutlined />
              Lead Delivery
            </span>
          } 
          key="delivery"
        >
          <Card className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">
                Lead Delivery Options
                <Tooltip title="Configure how leads are delivered to buyers and sellers">
                  <InfoCircleOutlined style={{ marginLeft: 8, fontSize: 14, color: '#8c8c8c' }} />
                </Tooltip>
              </h3>
            </div>
            <Paragraph>
              Configure how leads are delivered to buyers and how you collect leads as a seller. Set up integrations with popular platforms and customize delivery options.
            </Paragraph>
            
            <Divider orientation="left">
              <span className="section-title"><SendOutlined /> Delivery Options</span>
            </Divider>
            
            <Form layout="vertical">
              <Form.Item 
                label="Lead Delivery Mode" 
                name="deliveryMode"
                extra="Choose how leads are delivered to buyers."
              >
                <Radio.Group 
                  value={deliveryMode} 
                  onChange={e => setDeliveryMode(e.target.value)}
                >
                  <Space direction="vertical">
                    <Radio value="realtime">
                      <Space>
                        <ThunderboltOutlined />
                        Real-time (Instant delivery)
                      </Space>
                    </Radio>
                    <Radio value="batch">
                      <Space>
                        <TeamOutlined />
                        Batch (Daily/Weekly delivery)
                      </Space>
                    </Radio>
                    <Radio value="singleserve">
                      <Space>
                        <UserSwitchOutlined />
                        Single-serve (Exclusive to one buyer)
                      </Space>
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item
                label="Lead Verification" 
                name="verification"
                extra="Enable verification to ensure lead quality"
              >
                <Switch 
                  checked={leadVerification} 
                  onChange={setLeadVerification}
                />
              </Form.Item>
              
              <Divider orientation="left">
                <span className="section-title"><ApiOutlined /> Integrations</span>
              </Divider>
              
              <Tabs defaultActiveKey="1" type="card" className="integration-tabs">
                <TabPane 
                  tab={
                    <span>
                      <FacebookOutlined />
                      Facebook
                    </span>
                  } 
                  key="1"
                >
                  <div className="integration-panel">
                    <Form.Item
                      label="Connect Facebook Lead Forms" 
                      name="facebookIntegration"
                    >
                      <Switch 
                        checked={facebookConnected} 
                        onChange={setFacebookConnected}
                      />
                    </Form.Item>
                    
                    {facebookConnected && (
                      <div className="facebook-integration-details">
                        <Form.Item
                          label="Facebook Page" 
                          name="facebookPage"
                        >
                          <Select placeholder="Select Facebook page">
                            <Option value="page1">My Business Page</Option>
                            <Option value="page2">Product Promotion Page</Option>
                          </Select>
                        </Form.Item>
                        
                        <Form.Item
                          label="Lead Form" 
                          name="facebookForm"
                        >
                          <Select placeholder="Select lead form">
                            <Option value="form1">Contact Form</Option>
                            <Option value="form2">Newsletter Signup</Option>
                            <Option value="form3">Product Interest</Option>
                          </Select>
                        </Form.Item>
                      </div>
                    )}
                  </div>
                </TabPane>
                
                <TabPane 
                  tab={
                    <span>
                      <GoogleOutlined />
                      Google
                    </span>
                  } 
                  key="2"
                >
                  <div className="integration-panel">
                    <Form.Item
                      label="Connect Google Lead Forms" 
                      name="googleIntegration"
                    >
                      <Switch 
                        checked={googleConnected} 
                        onChange={setGoogleConnected}
                      />
                    </Form.Item>
                    
                    {googleConnected && (
                      <div className="google-integration-details">
                        <Form.Item
                          label="Google Ads Account" 
                          name="googleAccount"
                        >
                          <Input placeholder="Enter Google Ads account ID" />
                        </Form.Item>
                        
                        <Form.Item
                          label="Campaign" 
                          name="googleCampaign"
                        >
                          <Select placeholder="Select campaign">
                            <Option value="campaign1">Spring Promotion</Option>
                            <Option value="campaign2">Product Launch</Option>
                          </Select>
                        </Form.Item>
                      </div>
                    )}
                  </div>
                </TabPane>
                
                <TabPane 
                  tab={
                    <span>
                      <ApiOutlined />
                      Webhook API
                    </span>
                  } 
                  key="3"
                >
                  <div className="integration-panel">
                    <div className="api-details" style={{ marginBottom: 16 }}>
                      <Row gutter={24}>
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
                      
                      <div style={{ marginTop: 16 }}>
                        <Button type="link" icon={<FileTextOutlined />}>View API Documentation</Button>
                        <Link to="/marketplace/webhook-integration">
                          <Button type="primary" icon={<SettingOutlined />} style={{ marginLeft: 8 }}>Advanced Configuration</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </TabPane>
              </Tabs>
              
              <Form.Item style={{ marginTop: 24 }}>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                  Save Delivery Settings
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <StarOutlined />
              Seller Reviews
            </span>
          } 
          key="reviews"
        >
          <Card className="marketplace-stats-card">
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Overall Rating"
                    value={4.7}
                    precision={1}
                    suffix={<StarOutlined style={{ fontSize: 16, color: '#faad14' }} />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                  <div style={{ marginTop: 12 }}>
                    <Text>Based on 28 reviews</Text>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Lead Quality Score"
                    value={92}
                    suffix="%"
                    valueStyle={{ color: '#0050b3' }}
                  />
                  <div style={{ marginTop: 12 }}>
                    <Progress percent={92} size="small" status="active" />
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Buyer Satisfaction"
                    value={97}
                    suffix="%"
                    valueStyle={{ color: '#722ed1' }}
                  />
                  <div style={{ marginTop: 12 }}>
                    <Progress percent={97} size="small" status="active" />
                  </div>
                </Card>
              </Col>
            </Row>
            
            <Divider orientation="left">Recent Reviews</Divider>
            
            <List
              itemLayout="horizontal"
              dataSource={sellerReviews}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatar} />}
                    title={
                      <Space>
                        <span>{item.name}</span>
                        <Text type="secondary" style={{ fontSize: 12 }}>{item.date}</Text>
                      </Space>
                    }
                    description={
                      <div>
                        <div>
                          {Array(5).fill().map((_, i) => (
                            <StarOutlined 
                              key={i} 
                              style={{ 
                                color: i < item.rating ? '#faad14' : '#d9d9d9',
                                marginRight: 4
                              }} 
                            />
                          ))}
                        </div>
                        <div style={{ marginTop: 8 }}>{item.comment}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
            
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Button>View All Reviews</Button>
            </div>
          </Card>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <NotificationOutlined />
              Notification Settings
            </span>
          } 
          key="notifications"
        >
          <Card className="marketplace-stats-card">
            <Form layout="vertical">
              <Form.Item 
                label={
                  <div>
                    <Text strong>Enable Notifications</Text>
                    <div><Text type="secondary">Receive notifications about marketplace activities</Text></div>
                  </div>
                } 
                name="notificationsEnabled"
              >
                <Switch 
                  checked={notificationsEnabled} 
                  onChange={setNotificationsEnabled} 
                />
              </Form.Item>
              
              {notificationsEnabled && (
                <>
                  <Divider orientation="left">Email Notifications</Divider>
                  
                  <Form.Item name="emailNewSales">
                    <Checkbox defaultChecked>New sales (as a seller)</Checkbox>
                  </Form.Item>
                  
                  <Form.Item name="emailNewLeads">
                    <Checkbox defaultChecked>New available leads in my categories</Checkbox>
                  </Form.Item>
                  
                  <Form.Item name="emailPurchases">
                    <Checkbox defaultChecked>Purchases completed (as a buyer)</Checkbox>
                  </Form.Item>
                  
                  <Form.Item name="emailPayments">
                    <Checkbox defaultChecked>Payment processed</Checkbox>
                  </Form.Item>
                  
                  <Divider orientation="left">SMS Notifications</Divider>
                  
                  <Form.Item 
                    label="Mobile Number" 
                    name="mobileNumber"
                  >
                    <Input placeholder="Enter mobile number for SMS notifications" />
                  </Form.Item>
                  
                  <Form.Item name="smsNewSales">
                    <Checkbox>New sales (as a seller)</Checkbox>
                  </Form.Item>
                  
                  <Form.Item name="smsPurchases">
                    <Checkbox>Purchases completed (as a buyer)</Checkbox>
                  </Form.Item>
                </>
              )}
              
              <Form.Item style={{ marginTop: 24 }}>
                <Button type="primary" icon={<BellOutlined />} onClick={handleSave}>
                  Save Notification Preferences
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <SettingOutlined />
              Advanced Settings
            </span>
          } 
          key="advanced"
        >
          <Card className="marketplace-stats-card">
            <Collapse defaultActiveKey={['1']}>
              <Panel header="Lead Quality Preferences" key="1">
                <Form layout="vertical">
                  <Form.Item 
                    label="Minimum Lead Quality Score" 
                    name="minQualityScore"
                    initialValue={70}
                  >
                    <Slider
                      marks={{
                        0: '0',
                        50: '50',
                        70: '70',
                        90: '90',
                        100: '100'
                      }}
                      min={0}
                      max={100}
                    />
                  </Form.Item>
                  
                  <Paragraph>
                    <Text type="secondary">
                      Set the minimum quality score for leads you wish to browse in the marketplace.
                      Higher scores indicate better lead quality but may be more expensive.
                    </Text>
                  </Paragraph>
                </Form>
              </Panel>
              
              <Panel header="API Integration" key="2">
                <Form layout="vertical">
                  <Form.Item 
                    label="Enable API Access" 
                    name="apiEnabled"
                    valuePropName="checked"
                    initialValue={false}
                  >
                    <Switch />
                  </Form.Item>
                  
                  <Form.Item 
                    label="API Key"
                  >
                    <Input.Password 
                      readOnly 
                      value="sk_live_Tj9MRmF4urB5gjhAQwrM34tz"
                    />
                    <Text type="secondary">
                      Use this API key to integrate with your CRM or marketing platform.
                    </Text>
                  </Form.Item>
                  
                  <Button type="default">Generate New API Key</Button>
                  <Button type="link">View API Documentation</Button>
                </Form>
              </Panel>
              
              <Panel header="Data Retention" key="3">
                <Form layout="vertical">
                  <Form.Item 
                    label="Lead Data Retention Period" 
                    name="dataRetention"
                    initialValue={90}
                  >
                    <Select>
                      <Option value={30}>30 days</Option>
                      <Option value={60}>60 days</Option>
                      <Option value={90}>90 days</Option>
                      <Option value={180}>180 days</Option>
                      <Option value={365}>1 year</Option>
                    </Select>
                  </Form.Item>
                  
                  <Paragraph>
                    <Text type="secondary">
                      Choose how long we retain lead data in your account. After this period,
                      data will be automatically deleted to maintain compliance with data protection regulations.
                    </Text>
                  </Paragraph>
                </Form>
              </Panel>
              
              <Panel header="Account Security" key="4">
                <Form layout="vertical">
                  <Form.Item 
                    label="Enable Two-Factor Authentication" 
                    name="twoFactorEnabled"
                    valuePropName="checked"
                    initialValue={false}
                  >
                    <Switch />
                  </Form.Item>
                  
                  <Form.Item 
                    label="Password"
                  >
                    <Button type="default" icon={<LockOutlined />}>Change Password</Button>
                  </Form.Item>
                </Form>
              </Panel>
            </Collapse>
            
            <Form.Item style={{ marginTop: 24 }}>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                Save Advanced Settings
              </Button>
            </Form.Item>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Settings; 