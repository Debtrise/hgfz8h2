import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Typography,
  Alert,
  Spin,
  Card,
  Statistic,
  Row,
  Col,
  Progress,
  Tabs,
  Descriptions,
  Tag
} from 'antd';
import { PlusOutlined, CloseOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const { Title } = Typography;
const { TabPane } = Tabs;

const SMSBlaster = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('https://sms-blaster-api-3q7g4o5uxa-uc.a.run.app/api/campaigns');
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      const data = await response.json();
      setCampaigns(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchCampaignDetails = async (id) => {
    try {
      console.log('Fetching campaign details for ID:', id);
      const response = await fetch(`https://sms-blaster-api-3q7g4o5uxa-uc.a.run.app/api/campaigns/${id}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        // If we get a 500 error, try to get the campaign from the existing list
        if (response.status === 500) {
          const campaign = campaigns.find(c => c.id === id);
          if (campaign) {
            setSelectedCampaign({
              ...campaign,
              recentMessages: [] // Empty array since we can't get message details
            });
            return;
          }
        }
        throw new Error(`Failed to fetch campaign details: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Campaign details:', data);
      setSelectedCampaign(data);
    } catch (err) {
      console.error('Error fetching campaign details:', err);
      setError(err.message);
      Modal.error({
        title: 'Error Loading Campaign Details',
        content: 'Some detailed information may not be available due to system limitations.',
      });
    }
  };

  const handleCreateCampaign = async (values) => {
    try {
      const response = await fetch('https://sms-blaster-api-3q7g4o5uxa-uc.a.run.app/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error('Failed to create campaign');
      setIsModalVisible(false);
      form.resetFields();
      fetchCampaigns();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelCampaign = async (id) => {
    try {
      const response = await fetch(`https://sms-blaster-api-3q7g4o5uxa-uc.a.run.app/api/campaigns/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to cancel campaign');
      fetchCampaigns();
      if (selectedCampaign?.id === id) {
        setSelectedCampaign(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress':
        return 'processing';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <a onClick={() => fetchCampaignDetails(record.id)}>{text}</a>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_, record) => (
        <Progress
          percent={Math.round((record.progress.sent / record.totalLeads) * 100)}
          size="small"
        />
      ),
    },
    {
      title: 'Total Leads',
      dataIndex: 'totalLeads',
      key: 'totalLeads',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            danger
            size="small"
            onClick={() => handleCancelCampaign(record.id)}
            disabled={record.status !== 'in_progress'}
            icon={<CloseOutlined />}
            style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}
          >
            Cancel
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (selectedCampaign) {
    const deliveryData = [
      { name: 'Delivered', value: selectedCampaign.progress.delivered },
      { name: 'Failed', value: selectedCampaign.progress.failed },
      { name: 'Pending', value: selectedCampaign.progress.remaining },
    ];

    // Only show timeline if we have recent messages
    const timeSeriesData = selectedCampaign.recentMessages?.length > 0 
      ? selectedCampaign.recentMessages.map(msg => ({
          time: new Date(msg.sentAt).toLocaleTimeString(),
          delivered: msg.status === 'delivered' ? 1 : 0,
          failed: msg.status === 'failed' ? 1 : 0,
        }))
      : null;

    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ marginBottom: '24px' }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => setSelectedCampaign(null)}
              style={{ marginBottom: '16px', backgroundColor: '#3a84af', borderColor: '#3a84af', color: '#fff' }}
            >
              Back to Campaigns
            </Button>
            <Title level={2}>{selectedCampaign.name}</Title>
          </div>

          <Tabs defaultActiveKey="1">
            <TabPane tab="Overview" key="1">
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Total Messages"
                      value={selectedCampaign.totalLeads}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Delivered"
                      value={selectedCampaign.progress.delivered}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Failed"
                      value={selectedCampaign.progress.failed}
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Card>
                </Col>
              </Row>

              <Card title="Delivery Status" style={{ marginTop: '24px' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={deliveryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1890ff" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {timeSeriesData && (
                <Card title="Delivery Timeline" style={{ marginTop: '24px' }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="delivered" stroke="#52c41a" name="Delivered" />
                      <Line type="monotone" dataKey="failed" stroke="#ff4d4f" name="Failed" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </TabPane>

            <TabPane tab="Details" key="2">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Campaign Name">{selectedCampaign.name}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={getStatusColor(selectedCampaign.status)}>
                    {selectedCampaign.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                  {new Date(selectedCampaign.createdAt).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Start Time">
                  {selectedCampaign.startTime ? new Date(selectedCampaign.startTime).toLocaleString() : 'Not started'}
                </Descriptions.Item>
                <Descriptions.Item label="End Time">
                  {selectedCampaign.endTime ? new Date(selectedCampaign.endTime).toLocaleString() : 'Not completed'}
                </Descriptions.Item>
                <Descriptions.Item label="Batch Size">{selectedCampaign.batchSize}</Descriptions.Item>
                <Descriptions.Item label="Lead Age Range">
                  {selectedCampaign.criteria.minLeadAge} - {selectedCampaign.criteria.maxLeadAge} days
                </Descriptions.Item>
                <Descriptions.Item label="SMS Pool ID">{selectedCampaign.smsPoolId}</Descriptions.Item>
              </Descriptions>

              <Card title="Message Content" style={{ marginTop: '24px' }}>
                <Typography.Paragraph>
                  {selectedCampaign.messageContent}
                </Typography.Paragraph>
              </Card>
            </TabPane>

            {selectedCampaign.recentMessages?.length > 0 && (
              <TabPane tab="Recent Messages" key="3">
                <Table
                  dataSource={selectedCampaign.recentMessages}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  columns={[
                    {
                      title: 'Phone',
                      dataIndex: 'phone',
                      key: 'phone',
                    },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status) => (
                        <Tag color={status === 'delivered' ? 'success' : 'error'}>
                          {status}
                        </Tag>
                      ),
                    },
                    {
                      title: 'Sent At',
                      dataIndex: 'sentAt',
                      key: 'sentAt',
                      render: (date) => new Date(date).toLocaleString(),
                    },
                    {
                      title: 'Message SID',
                      dataIndex: 'messageSid',
                      key: 'messageSid',
                    },
                  ]}
                />
              </TabPane>
            )}
          </Tabs>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={2}>SMS Blaster</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
            style={{ backgroundColor: '#3a84af', borderColor: '#3a84af' }}
          >
            New Campaign
          </Button>
        </div>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}

        <Table
          columns={columns}
          dataSource={campaigns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Create New SMS Campaign"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCampaign}
        >
          <Form.Item
            name="name"
            label="Campaign Name"
            rules={[{ required: true, message: 'Please input campaign name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="minLeadAge"
            label="Minimum Lead Age (days)"
            rules={[{ required: true, message: 'Please input minimum lead age!' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="maxLeadAge"
            label="Maximum Lead Age (days)"
            rules={[{ required: true, message: 'Please input maximum lead age!' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="messageContent"
            label="Message Content"
            rules={[{ required: true, message: 'Please input message content!' }]}
            extra="Use {f_name} for personalization"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="batchSize"
            label="Batch Size"
            rules={[{ required: true, message: 'Please input batch size!' }]}
            extra="Messages per minute"
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="totalLeads"
            label="Total Leads"
            rules={[{ required: true, message: 'Please input total leads!' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="smsPoolId"
            label="SMS Pool ID"
            initialValue="default"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                style={{ backgroundColor: '#3a84af', borderColor: '#3a84af' }}
              >
                Create Campaign
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SMSBlaster; 