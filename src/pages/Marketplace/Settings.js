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
  Slider
} from 'antd';
import { 
  BankOutlined, 
  LockOutlined, 
  NotificationOutlined, 
  UserOutlined, 
  SettingOutlined,
  SaveOutlined,
  CreditCardOutlined,
  BellOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Panel } = Collapse;

const Settings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);

  const handleSave = () => {
    // In a real app, this would save to an API
    setSavedSuccessfully(true);
    setTimeout(() => {
      setSavedSuccessfully(false);
    }, 3000);
  };

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
          <Card>
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
          <Card>
            <Paragraph>
              Configure your payment preferences for both buying and selling leads in the marketplace.
            </Paragraph>
            
            <Divider orientation="left">Payment Method</Divider>
            
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
            
            <Divider orientation="left">Seller Payout</Divider>
            
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
              <NotificationOutlined />
              Notification Settings
            </span>
          } 
          key="notifications"
        >
          <Card>
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
          <Card>
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