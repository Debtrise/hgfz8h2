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
import '../styles/SMSBlaster.css';
import LoadingSpinner from '../components/LoadingSpinner';

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
      const response = await fetch('https://sms-blaster-api-154842307047.us-central1.run.app/api/campaigns');
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
      const response = await fetch(`https://sms-blaster-api-154842307047.us-central1.run.app/api/campaigns/${id}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        // Check if this is the specific index error
        if (errorText.includes('no matching index found')) {
          // Show a more user-friendly error message
          Modal.warning({
            title: 'Limited Campaign Details Available',
            content: (
              <div>
                <p>We can show basic campaign information, but detailed message history is currently unavailable.</p>
                <p>The backend team has been notified to add the required index for full functionality.</p>
              </div>
            ),
            okText: 'View Basic Details',
            onOk: () => {
              // Find the campaign in our existing data
              const campaign = campaigns.find(c => c.id === id);
              if (campaign) {
                setSelectedCampaign(campaign);
              }
            }
          });
          return;
        }
        
        throw new Error(`Failed to fetch campaign details: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Campaign details:', data);
      setSelectedCampaign(data);
    } catch (err) {
      console.error('Error fetching campaign details:', err);
      setError(err.message);
      // Show error in a more user-friendly way
      Modal.error({
        title: 'Error Loading Campaign Details',
        content: err.message,
      });
    }
  };

  const handleCreateCampaign = async (values) => {
    try {
      const response = await fetch('https://sms-blaster-api-154842307047.us-central1.run.app/api/campaigns', {
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
      const response = await fetch(`https://sms-blaster-api-154842307047.us-central1.run.app/api/campaigns/${id}`, {
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
            className="sms-blaster-button-danger"
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
        <LoadingSpinner size="large" text="Loading campaigns..." />
      </div>
    );
  }

  if (selectedCampaign) {
    // Create a simplified view with the data we have from the campaigns list
    const simplifiedCampaign = {
      ...selectedCampaign,
      progress: {
        sent: selectedCampaign.progress?.sent || 0,
        delivered: selectedCampaign.progress?.delivered || 0,
        failed: selectedCampaign.progress?.failed || 0,
        remaining: selectedCampaign.progress?.remaining || 0
      },
      recentMessages: [] // Empty array since we can't fetch message details
    };

    const deliveryData = [
      { name: 'Delivered', value: simplifiedCampaign.progress.delivered },
      { name: 'Failed', value: simplifiedCampaign.progress.failed },
      { name: 'Pending', value: simplifiedCampaign.progress.remaining },
    ];

    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ marginBottom: '24px' }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => setSelectedCampaign(null)}
              className="sms-blaster-button"
              style={{ marginBottom: '16px' }}
            >
              Back to Campaigns
            </Button>
            <Title level={2}>{simplifiedCampaign.name}</Title>
          </div>

          <Tabs defaultActiveKey="1">
            <TabPane tab="Overview" key="1">
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Total Messages"
                      value={simplifiedCampaign.totalLeads}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Delivered"
                      value={simplifiedCampaign.progress.delivered}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Failed"
                      value={simplifiedCampaign.progress.failed}
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

              <Alert
                message="Note"
                description="Detailed message history is currently unavailable due to backend limitations. We're working on adding this feature."
                type="info"
                showIcon
                style={{ marginTop: '24px' }}
              />
            </TabPane>

            <TabPane tab="Details" key="2">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Campaign Name">{simplifiedCampaign.name}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={getStatusColor(simplifiedCampaign.status)}>
                    {simplifiedCampaign.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                  {new Date(simplifiedCampaign.createdAt).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Start Time">
                  {simplifiedCampaign.startTime ? new Date(simplifiedCampaign.startTime).toLocaleString() : 'Not started'}
                </Descriptions.Item>
                <Descriptions.Item label="End Time">
                  {simplifiedCampaign.endTime ? new Date(simplifiedCampaign.endTime).toLocaleString() : 'Not completed'}
                </Descriptions.Item>
                <Descriptions.Item label="Batch Size">{simplifiedCampaign.batchSize}</Descriptions.Item>
                <Descriptions.Item label="Lead Age Range">
                  {simplifiedCampaign.criteria.minLeadAge} - {simplifiedCampaign.criteria.maxLeadAge} days
                </Descriptions.Item>
                <Descriptions.Item label="SMS Pool ID">{simplifiedCampaign.smsPoolId}</Descriptions.Item>
              </Descriptions>

              <Card title="Message Content" style={{ marginTop: '24px' }}>
                <Typography.Paragraph>
                  {simplifiedCampaign.messageContent}
                </Typography.Paragraph>
              </Card>
            </TabPane>

            <TabPane tab="Recent Messages" key="3">
              <Alert
                message="Message History Unavailable"
                description="Detailed message history is currently unavailable. We're working on adding this feature."
                type="info"
                showIcon
              />
            </TabPane>
          </Tabs>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={2}>SMS Campaigns</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
            className="sms-blaster-button"
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
                loading={loading}
                className="sms-blaster-button"
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