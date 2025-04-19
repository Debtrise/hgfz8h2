import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Statistic,
  Tabs,
  Button,
  Space,
  Tag,
  Table,
  Progress,
  Typography,
  Divider,
  Timeline,
  Tooltip,
  Select,
  DatePicker,
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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  ArrowLeftOutlined,
  DollarOutlined,
  UserOutlined,
  EyeOutlined,
  ClickOutlined,
  LikeOutlined,
  MessageOutlined,
  CommentOutlined,
  SettingOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  LinkOutlined,
  PlusOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch campaign data from the API
    // For now, we'll use mock data
    const fetchCampaignData = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setCampaign({
          id,
          name: 'Spring Sale 2024',
          platform: 'Facebook',
          status: 'active',
          objective: 'Lead Generation',
          budget: 5000,
          dailyBudget: 100,
          startDate: '2024-03-01',
          endDate: '2024-03-31',
          targeting: {
            age: '25-45',
            gender: 'All',
            locations: ['United States', 'Canada'],
            interests: ['Shopping', 'Fashion', 'Lifestyle'],
          },
          metrics: {
            spend: 1200,
            impressions: 50000,
            reach: 35000,
            clicks: 2500,
            leads: 80,
            cpl: 15.00,
            ctr: 5.0,
            frequency: 1.4,
            engagement: {
              likes: 1200,
              shares: 300,
              comments: 450,
              messages: 200,
            },
            connectionRate: 0.65,
            averageConnectionTime: 45,
            bestPerformingJourney: {
              id: 'journey-1',
              name: 'High-Value Lead Nurture',
              steps: [
                { name: 'Initial Contact', completionRate: 0.85 },
                { name: 'Qualification Call', completionRate: 0.75 },
                { name: 'Product Demo', completionRate: 0.60 },
                { name: 'Follow-up', completionRate: 0.45 },
              ],
              totalConversions: 35,
              conversionRate: 0.25,
              averageTimeToConversion: '3.5 days',
              revenueGenerated: 15000,
              roi: 3.2,
            },
            journeyMetrics: {
              totalJourneys: 4,
              activeJourneys: 3,
              averageJourneyCompletion: 0.65,
              bestPerformingTime: 'Weekdays 10am-2pm',
              worstPerformingTime: 'Weekends',
            },
            leadJourneys: [
              {
                id: 'journey-1',
                name: 'High-Value Lead Nurture',
                status: 'active',
                totalLeads: 120,
                activeLeads: 45,
                completedLeads: 35,
                averageTimeInJourney: '5.2 days',
                steps: [
                  {
                    name: 'Initial Contact',
                    type: 'call',
                    completionRate: 0.85,
                    averageDuration: '12 minutes',
                    successRate: 0.75,
                  },
                  {
                    name: 'Qualification',
                    type: 'form',
                    completionRate: 0.75,
                    averageDuration: '2 days',
                    successRate: 0.65,
                  },
                  {
                    name: 'Product Demo',
                    type: 'meeting',
                    completionRate: 0.60,
                    averageDuration: '45 minutes',
                    successRate: 0.55,
                  },
                  {
                    name: 'Follow-up',
                    type: 'email',
                    completionRate: 0.45,
                    averageDuration: '3 days',
                    successRate: 0.40,
                  },
                ],
                webhookEndpoint: 'https://api.example.com/webhooks/campaign-1',
                webhookSecret: 'sk_test_123456789',
                lastWebhookReceived: '2024-03-15T14:30:00Z',
                webhookStatus: 'active',
              },
              // ... more journeys
            ],
          },
          performanceData: [
            { date: '2024-03-01', spend: 100, leads: 8, impressions: 5000 },
            { date: '2024-03-02', spend: 120, leads: 10, impressions: 6000 },
            { date: '2024-03-03', spend: 150, leads: 12, impressions: 7000 },
            { date: '2024-03-04', spend: 130, leads: 9, impressions: 6500 },
            { date: '2024-03-05', spend: 140, leads: 11, impressions: 6800 },
            { date: '2024-03-06', spend: 160, leads: 13, impressions: 7500 },
            { date: '2024-03-07', spend: 170, leads: 14, impressions: 8000 },
          ],
          audienceData: [
            { name: 'Male', value: 45 },
            { name: 'Female', value: 55 },
          ],
          ageData: [
            { name: '18-24', value: 20 },
            { name: '25-34', value: 35 },
            { name: '35-44', value: 25 },
            { name: '45-54', value: 15 },
            { name: '55+', value: 5 },
          ],
        });
        setLoading(false);
      }, 1000);
    };

    fetchCampaignData();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardContainer>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/marketing')}>
            Back to Dashboard
          </Button>
          <Title level={2}>{campaign.name}</Title>
          <Tag color={campaign.status === 'active' ? 'green' : 'red'}>
            {campaign.status}
          </Tag>
        </Space>

        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card
              title="Campaign Overview"
              extra={
                <Space>
                  <Select value={timeRange} onChange={setTimeRange}>
                    <Option value="7d">Last 7 Days</Option>
                    <Option value="30d">Last 30 Days</Option>
                    <Option value="90d">Last 90 Days</Option>
                    <Option value="custom">Custom Range</Option>
                  </Select>
                  {timeRange === 'custom' && <RangePicker />}
                </Space>
              }
            >
              <Row gutter={[24, 24]}>
                <Col span={6}>
                  <StatsCard>
                    <Statistic
                      title="Total Spend"
                      value={campaign.metrics.spend}
                      prefix={<DollarOutlined />}
                    />
                    <Progress percent={75} status="active" />
                  </StatsCard>
                </Col>
                <Col span={6}>
                  <StatsCard>
                    <Statistic
                      title="Total Leads"
                      value={campaign.metrics.leads}
                      prefix={<UserOutlined />}
                    />
                    <Progress percent={60} status="active" />
                  </StatsCard>
                </Col>
                <Col span={6}>
                  <StatsCard>
                    <Statistic
                      title="Impressions"
                      value={campaign.metrics.impressions}
                      prefix={<EyeOutlined />}
                    />
                    <Progress percent={80} status="active" />
                  </StatsCard>
                </Col>
                <Col span={6}>
                  <StatsCard>
                    <Statistic
                      title="Click-Through Rate"
                      value={campaign.metrics.ctr}
                      suffix="%"
                    />
                    <Progress percent={90} status="active" />
                  </StatsCard>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col span={16}>
            <ChartCard title="Performance Over Time">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={campaign.performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="spend" stroke="#8884d8" />
                  <Line type="monotone" dataKey="leads" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="impressions" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </Col>
          <Col span={8}>
            <ChartCard title="Audience Gender">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={campaign.audienceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {campaign.audienceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card title="Campaign Details">
              <Tabs defaultActiveKey="1">
                <TabPane tab="Targeting" key="1">
                  <Row gutter={[24, 24]}>
                    <Col span={8}>
                      <Title level={4}>Demographics</Title>
                      <Space direction="vertical">
                        <Text>Age: {campaign.targeting.age}</Text>
                        <Text>Gender: {campaign.targeting.gender}</Text>
                        <Text>Locations: {campaign.targeting.locations.join(', ')}</Text>
                      </Space>
                    </Col>
                    <Col span={8}>
                      <Title level={4}>Interests</Title>
                      <Space wrap>
                        {campaign.targeting.interests.map(interest => (
                          <Tag key={interest}>{interest}</Tag>
                        ))}
                      </Space>
                    </Col>
                    <Col span={8}>
                      <Title level={4}>Budget</Title>
                      <Space direction="vertical">
                        <Text>Total Budget: ${campaign.budget}</Text>
                        <Text>Daily Budget: ${campaign.dailyBudget}</Text>
                        <Text>Start Date: {campaign.startDate}</Text>
                        <Text>End Date: {campaign.endDate}</Text>
                      </Space>
                    </Col>
                  </Row>
                </TabPane>
                <TabPane tab="Engagement" key="2">
                  <Row gutter={[24, 24]}>
                    <Col span={6}>
                      <Statistic
                        title="Likes"
                        value={campaign.metrics.engagement.likes}
                        prefix={<LikeOutlined />}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="Messages"
                        value={campaign.metrics.engagement.messages}
                        prefix={<MessageOutlined />}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="Comments"
                        value={campaign.metrics.engagement.comments}
                        prefix={<CommentOutlined />}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="Frequency"
                        value={campaign.metrics.frequency}
                        precision={1}
                      />
                    </Col>
                  </Row>
                </TabPane>
                <TabPane tab="Age Distribution" key="3">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={campaign.ageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card title="Connection & Journey Performance">
              <Row gutter={[24, 24]}>
                <Col span={8}>
                  <StatsCard>
                    <Statistic
                      title="Connection Rate"
                      value={campaign.metrics.connectionRate * 100}
                      suffix="%"
                      prefix={<PhoneOutlined />}
                    />
                    <Progress percent={campaign.metrics.connectionRate * 100} status="active" />
                  </StatsCard>
                </Col>
                <Col span={8}>
                  <StatsCard>
                    <Statistic
                      title="Average Connection Time"
                      value={campaign.metrics.averageConnectionTime}
                      suffix="seconds"
                      prefix={<ClockCircleOutlined />}
                    />
                  </StatsCard>
                </Col>
                <Col span={8}>
                  <StatsCard>
                    <Statistic
                      title="Active Journeys"
                      value={campaign.metrics.journeyMetrics.activeJourneys}
                      suffix={`/ ${campaign.metrics.journeyMetrics.totalJourneys}`}
                      prefix={<TeamOutlined />}
                    />
                  </StatsCard>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card title="Best Performing Journey">
              <Row gutter={[24, 24]}>
                <Col span={8}>
                  <Title level={4}>{campaign.metrics.bestPerformingJourney.name}</Title>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Statistic
                      title="Conversion Rate"
                      value={campaign.metrics.bestPerformingJourney.conversionRate * 100}
                      suffix="%"
                      prefix={<CheckCircleOutlined />}
                    />
                    <Statistic
                      title="Total Conversions"
                      value={campaign.metrics.bestPerformingJourney.totalConversions}
                    />
                    <Statistic
                      title="Revenue Generated"
                      value={campaign.metrics.bestPerformingJourney.revenueGenerated}
                      prefix={<DollarOutlined />}
                    />
                    <Statistic
                      title="ROI"
                      value={campaign.metrics.bestPerformingJourney.roi}
                      suffix="x"
                    />
                  </Space>
                </Col>
                <Col span={16}>
                  <Title level={4}>Journey Steps Performance</Title>
                  <Table
                    dataSource={campaign.metrics.bestPerformingJourney.steps}
                    columns={[
                      {
                        title: 'Step',
                        dataIndex: 'name',
                        key: 'name',
                      },
                      {
                        title: 'Completion Rate',
                        dataIndex: 'completionRate',
                        key: 'completionRate',
                        render: (rate) => (
                          <Progress percent={rate * 100} status="active" />
                        ),
                      },
                    ]}
                    pagination={false}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card title="Journey Performance Insights">
              <Row gutter={[24, 24]}>
                <Col span={8}>
                  <Title level={4}>Best Performing Time</Title>
                  <Text>{campaign.metrics.journeyMetrics.bestPerformingTime}</Text>
                </Col>
                <Col span={8}>
                  <Title level={4}>Worst Performing Time</Title>
                  <Text>{campaign.metrics.journeyMetrics.worstPerformingTime}</Text>
                </Col>
                <Col span={8}>
                  <Title level={4}>Average Journey Completion</Title>
                  <Progress 
                    percent={campaign.metrics.journeyMetrics.averageJourneyCompletion * 100} 
                    status="active" 
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card 
              title="Lead Journeys"
              extra={
                <Space>
                  <Button type="primary" icon={<PlusOutlined />}>
                    Create New Journey
                  </Button>
                  <Button icon={<ApiOutlined />}>
                    Webhook Settings
                  </Button>
                </Space>
              }
            >
              <Tabs defaultActiveKey="1">
                {campaign.metrics.leadJourneys.map((journey, index) => (
                  <TabPane tab={journey.name} key={index + 1}>
                    <Row gutter={[24, 24]}>
                      <Col span={8}>
                        <Title level={4}>Journey Overview</Title>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Statistic
                            title="Total Leads"
                            value={journey.totalLeads}
                          />
                          <Statistic
                            title="Active Leads"
                            value={journey.activeLeads}
                          />
                          <Statistic
                            title="Completed Leads"
                            value={journey.completedLeads}
                          />
                          <Statistic
                            title="Average Time in Journey"
                            value={journey.averageTimeInJourney}
                          />
                        </Space>
                      </Col>
                      <Col span={16}>
                        <Title level={4}>Journey Steps</Title>
                        <Table
                          dataSource={journey.steps}
                          columns={[
                            {
                              title: 'Step',
                              dataIndex: 'name',
                              key: 'name',
                            },
                            {
                              title: 'Type',
                              dataIndex: 'type',
                              key: 'type',
                              render: (type) => (
                                <Tag color={type === 'call' ? 'blue' : type === 'form' ? 'green' : type === 'meeting' ? 'purple' : 'orange'}>
                                  {type}
                                </Tag>
                              ),
                            },
                            {
                              title: 'Completion Rate',
                              dataIndex: 'completionRate',
                              key: 'completionRate',
                              render: (rate) => (
                                <Progress percent={rate * 100} status="active" />
                              ),
                            },
                            {
                              title: 'Average Duration',
                              dataIndex: 'averageDuration',
                              key: 'averageDuration',
                            },
                            {
                              title: 'Success Rate',
                              dataIndex: 'successRate',
                              key: 'successRate',
                              render: (rate) => (
                                <Progress percent={rate * 100} status="active" />
                              ),
                            },
                          ]}
                          pagination={false}
                        />
                      </Col>
                    </Row>
                    <Divider />
                    <Row gutter={[24, 24]}>
                      <Col span={24}>
                        <Title level={4}>Webhook Integration</Title>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Text>Endpoint: {journey.webhookEndpoint}</Text>
                          <Text>Secret: {journey.webhookSecret}</Text>
                          <Text>Last Received: {new Date(journey.lastWebhookReceived).toLocaleString()}</Text>
                          <Tag color={journey.webhookStatus === 'active' ? 'green' : 'red'}>
                            {journey.webhookStatus}
                          </Tag>
                          <Button type="primary" icon={<LinkOutlined />}>
                            Test Webhook
                          </Button>
                        </Space>
                      </Col>
                    </Row>
                  </TabPane>
                ))}
              </Tabs>
            </Card>
          </Col>
        </Row>
      </Space>
    </DashboardContainer>
  );
};

export default CampaignDetails; 