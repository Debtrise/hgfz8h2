import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Switch,
  Select,
  InputNumber,
  Button,
  Tabs,
  Row,
  Col,
  TimePicker,
  Radio,
  Divider,
  message,
  Alert,
  Result,
} from 'antd';
import {
  PhoneOutlined,
  ClockCircleOutlined,
  RobotOutlined,
  TeamOutlined,
  SettingOutlined,
  AudioOutlined,
  LockOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import AuthService from '../services/AuthService';

const { Option } = Select;
const { TabPane } = Tabs;

const CallConfig = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [amdEnabled, setAmdEnabled] = useState(true);
  const [recordingEnabled, setRecordingEnabled] = useState(true);
  const [queueEnabled, setQueueEnabled] = useState(true);
  const [configData, setConfigData] = useState(null);

  useEffect(() => {
    // Check if user has permission to access config
    if (!AuthService.hasPermission('canAccessConfig')) {
      return;
    }

    // Fetch initial config data
    fetchConfigData();
  }, []);

  const fetchConfigData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockData = {
        defaultCallerId: '+18001234567',
        maxConcurrentCalls: 100,
        recordingEnabled: true,
        recordingFormat: 'mp3',
        recordingStorageDuration: 30,
        amdEnabled: true,
        amdTimeout: 8,
        amdConfidence: 'medium',
        amdVoicemailAction: 'hangup',
        queueEnabled: true,
        maxQueueSize: 50,
        maxWaitTime: 10,
        queueMusic: 'default',
        queueAnnouncementInterval: 60,
        defaultRoute: 'ivr',
        afterHoursRoute: 'voicemail',
        businessHours: {
          time: [moment('09:00', 'HH:mm'), moment('17:00', 'HH:mm')],
          days: ['mon', 'tue', 'wed', 'thu', 'fri']
        }
      };
      setConfigData(mockData);
      form.setFieldsValue(mockData);
    } catch (error) {
      message.error('Failed to fetch configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    if (!AuthService.hasPermission('canAccessConfig')) {
      message.error('You do not have permission to modify configuration');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add audit log
      console.log('Configuration changed by:', AuthService.getUser()?.username);
      console.log('Changes:', JSON.stringify(values, null, 2));
      
      message.success('Configuration saved successfully');
      
      // Notify other parts of the application about config changes
      window.dispatchEvent(new CustomEvent('configUpdated', { detail: values }));
    } catch (error) {
      message.error('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  // If user doesn't have permission, show unauthorized message
  if (!AuthService.hasPermission('canAccessConfig')) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        icon={<LockOutlined />}
      />
    );
  }

  const renderGeneralSettings = () => (
    <Card title="General Settings" className="config-card">
      <Form.Item
        label="Default Caller ID"
        name="defaultCallerId"
        rules={[{ required: true, message: 'Please enter default caller ID' }]}
      >
        <Input prefix={<PhoneOutlined />} placeholder="+1234567890" />
      </Form.Item>

      <Form.Item
        label="Max Concurrent Calls"
        name="maxConcurrentCalls"
        rules={[{ required: true, message: 'Please enter max concurrent calls' }]}
      >
        <InputNumber min={1} max={1000} />
      </Form.Item>

      <Form.Item
        label="Call Recording"
        name="recordingEnabled"
        valuePropName="checked"
      >
        <Switch
          checked={recordingEnabled}
          onChange={setRecordingEnabled}
        />
      </Form.Item>

      {recordingEnabled && (
        <>
          <Form.Item
            label="Recording Format"
            name="recordingFormat"
          >
            <Select>
              <Option value="mp3">MP3</Option>
              <Option value="wav">WAV</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Recording Storage Duration (days)"
            name="recordingStorageDuration"
          >
            <InputNumber min={1} max={365} />
          </Form.Item>
        </>
      )}
    </Card>
  );

  const renderAMDSettings = () => (
    <Card title="Answering Machine Detection" className="config-card">
      <Form.Item
        label="Enable AMD"
        name="amdEnabled"
        valuePropName="checked"
      >
        <Switch
          checked={amdEnabled}
          onChange={setAmdEnabled}
        />
      </Form.Item>

      {amdEnabled && (
        <>
          <Form.Item
            label="AMD Timeout (seconds)"
            name="amdTimeout"
          >
            <InputNumber min={1} max={30} />
          </Form.Item>

          <Form.Item
            label="AMD Confidence Level"
            name="amdConfidence"
          >
            <Select>
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Action on Voicemail"
            name="amdVoicemailAction"
          >
            <Radio.Group>
              <Radio value="hangup">Hangup</Radio>
              <Radio value="leave_message">Leave Message</Radio>
              <Radio value="transfer">Transfer to Agent</Radio>
            </Radio.Group>
          </Form.Item>
        </>
      )}
    </Card>
  );

  const renderQueueSettings = () => (
    <Card title="Queue Settings" className="config-card">
      <Form.Item
        label="Enable Queue"
        name="queueEnabled"
        valuePropName="checked"
      >
        <Switch
          checked={queueEnabled}
          onChange={setQueueEnabled}
        />
      </Form.Item>

      {queueEnabled && (
        <>
          <Form.Item
            label="Max Queue Size"
            name="maxQueueSize"
          >
            <InputNumber min={1} max={1000} />
          </Form.Item>

          <Form.Item
            label="Max Wait Time (minutes)"
            name="maxWaitTime"
          >
            <InputNumber min={1} max={60} />
          </Form.Item>

          <Form.Item
            label="Queue Music"
            name="queueMusic"
          >
            <Select>
              <Option value="default">Default Music</Option>
              <Option value="classical">Classical</Option>
              <Option value="jazz">Jazz</Option>
              <Option value="custom">Custom Upload</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Queue Announcement Interval (seconds)"
            name="queueAnnouncementInterval"
          >
            <InputNumber min={30} max={300} />
          </Form.Item>
        </>
      )}
    </Card>
  );

  const renderRoutingSettings = () => (
    <Card title="Routing Settings" className="config-card">
      <Form.Item
        label="Default Route"
        name="defaultRoute"
        rules={[{ required: true, message: 'Please select default route' }]}
      >
        <Select>
          <Option value="ivr">IVR Menu</Option>
          <Option value="queue">Queue</Option>
          <Option value="agent">Direct to Agent</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Business Hours"
        name="businessHours"
      >
        <Row gutter={16}>
          <Col span={12}>
            <TimePicker.RangePicker format="HH:mm" />
          </Col>
          <Col span={12}>
            <Select mode="multiple" placeholder="Select days">
              <Option value="mon">Monday</Option>
              <Option value="tue">Tuesday</Option>
              <Option value="wed">Wednesday</Option>
              <Option value="thu">Thursday</Option>
              <Option value="fri">Friday</Option>
              <Option value="sat">Saturday</Option>
              <Option value="sun">Sunday</Option>
            </Select>
          </Col>
        </Row>
      </Form.Item>

      <Form.Item
        label="After Hours Route"
        name="afterHoursRoute"
      >
        <Select>
          <Option value="voicemail">Voicemail</Option>
          <Option value="message">Play Message</Option>
          <Option value="emergency">Emergency Contact</Option>
        </Select>
      </Form.Item>
    </Card>
  );

  return (
    <div className="call-config-page">
      <Alert
        message="Configuration Changes"
        description={
          <>
            Changes to call configuration may affect ongoing calls. Please review carefully before saving.
            <br />
            <small>Last modified by: {configData?.lastModifiedBy || 'Unknown'} at {configData?.lastModifiedAt ? moment(configData.lastModifiedAt).format('YYYY-MM-DD HH:mm:ss') : 'Unknown'}</small>
          </>
        }
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={configData}
      >
        <Tabs defaultActiveKey="general">
          <TabPane
            tab={
              <span>
                <SettingOutlined />
                General
              </span>
            }
            key="general"
          >
            {renderGeneralSettings()}
          </TabPane>

          <TabPane
            tab={
              <span>
                <RobotOutlined />
                AMD
              </span>
            }
            key="amd"
          >
            {renderAMDSettings()}
          </TabPane>

          <TabPane
            tab={
              <span>
                <TeamOutlined />
                Queue
              </span>
            }
            key="queue"
          >
            {renderQueueSettings()}
          </TabPane>

          <TabPane
            tab={
              <span>
                <PhoneOutlined />
                Routing
              </span>
            }
            key="routing"
          >
            {renderRoutingSettings()}
          </TabPane>
        </Tabs>

        <Divider />

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            disabled={!AuthService.hasPermission('canAccessConfig')}
          >
            Save Configuration
          </Button>
          <Button 
            style={{ marginLeft: 8 }} 
            onClick={() => form.resetFields()}
          >
            Reset Changes
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CallConfig;
