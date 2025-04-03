import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Progress,
  Badge,
  Statistic,
  Select,
  Typography,
  Alert,
  Tabs,
  List,
  Tag,
  Divider,
} from 'antd';
import {
  PhoneOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  RiseOutlined,
  UserOutlined,
  CustomerServiceOutlined,
  BarChartOutlined,
  ArrowUpOutlined,
  PercentageOutlined,
  DashboardOutlined,
  SoundOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import MockDataService from '../services/MockDataService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// Colors for graphs
const COLORS = ['#3797ce', '#79b6db', '#a0cbe5', '#d6ebf5', '#b7d3e5'];

const RealTimeAgentDashboard = () => {
  const [agentStats, setAgentStats] = useState([]);
  const [overallStats, setOverallStats] = useState({
    totalCalls: 0,
    avgHandleTime: 0,
    activeAgents: 0,
    successRate: 0,
    callsInQueue: 0,
    longestWaitTime: 0,
    abandonRate: 0,
    serviceLevel: 0,
  });
  const [queueStats, setQueueStats] = useState([]);
  const [callVolumeData, setCallVolumeData] = useState([]);
  const [timeRange, setTimeRange] = useState('1h');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Subscribe to MockDataService updates
    MockDataService.on('agentDashboard', handleDataUpdate);
    MockDataService.connect();

    return () => {
      MockDataService.off('agentDashboard', handleDataUpdate);
      MockDataService.disconnect();
    };
  }, []);

  const handleDataUpdate = (data) => {
    if (data.type === 'agentStats') {
      setAgentStats(data.agents);
      setOverallStats(data.overall);
      setQueueStats(data.queueStats || []);
      setCallVolumeData(data.callVolumeByHour || []);
      setIsConnected(true);
    }
  };

  // Format time in seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate agent status data for pie chart
  const getAgentStatusData = () => {
    const statusCounts = {};
    agentStats.forEach(agent => {
      statusCounts[agent.status] = (statusCounts[agent.status] || 0) + 1;
    });
    
    return Object.keys(statusCounts).map(status => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: statusCounts[status]
    }));
  };

  // Agent table columns
  const columns = [
    {
      title: 'Agent',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <span>
          <Badge 
            status={
              record.status === 'available' ? 'success' : 
              record.status === 'busy' ? 'processing' :
              record.status === 'break' ? 'warning' :
              'default'
            } 
          />
          {text}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag
          color={
            status === 'available' ? 'green' :
            status === 'busy' ? 'blue' :
            status === 'break' ? 'orange' :
            status === 'training' ? 'purple' :
            'default'
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
      filters: [
        { text: 'Available', value: 'available' },
        { text: 'Busy', value: 'busy' },
        { text: 'Break', value: 'break' },
        { text: 'Training', value: 'training' },
        { text: 'Meeting', value: 'meeting' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Current Call',
      dataIndex: 'currentCall',
      key: 'currentCall',
      render: (currentCall) => currentCall ? (
        <div>
          <div>{currentCall.phoneNumber}</div>
          <div><Text type="secondary">{formatTime(currentCall.duration)}</Text></div>
        </div>
      ) : (
        <Text type="secondary">—</Text>
      ),
    },
    {
      title: 'Calls Handled',
      dataIndex: 'callsHandled',
      key: 'callsHandled',
      sorter: (a, b) => a.callsHandled - b.callsHandled,
    },
    {
      title: 'Avg Handle Time',
      dataIndex: 'avgHandleTime',
      key: 'avgHandleTime',
      render: (time) => formatTime(time),
      sorter: (a, b) => a.avgHandleTime - b.avgHandleTime,
    },
    {
      title: 'Success Rate',
      dataIndex: 'successRate',
      key: 'successRate',
      render: (rate) => (
        <Progress
          percent={rate}
          size="small"
          status={rate >= 70 ? 'success' : rate >= 50 ? 'normal' : 'exception'}
        />
      ),
      sorter: (a, b) => a.successRate - b.successRate,
    },
  ];

  // Queue table columns
  const queueColumns = [
    {
      title: 'Queue',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Waiting Calls',
      dataIndex: 'waitingCalls',
      key: 'waitingCalls',
      render: (count) => (
        <span>
          {count} {count > 0 && count < 3 ? <Tag color="green">Low</Tag> : count >= 3 && count < 5 ? <Tag color="orange">Medium</Tag> : count >= 5 ? <Tag color="red">High</Tag> : null}
        </span>
      ),
    },
    {
      title: 'Avg Wait Time',
      dataIndex: 'avgWaitTime',
      key: 'avgWaitTime',
      render: (time) => formatTime(time),
    },
    {
      title: 'SLA',
      dataIndex: 'sla',
      key: 'sla',
      render: (sla) => (
        <Progress
          percent={sla}
          size="small"
          status={sla >= 90 ? 'success' : sla >= 80 ? 'normal' : 'exception'}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} align="middle" justify="space-between">
        <Col>
          <Title level={2}>Real-Time Call Center Dashboard</Title>
        </Col>
        <Col>
          <Select
            value={timeRange}
            onChange={setTimeRange}
            style={{ width: 120 }}
          >
            <Option value="1h">Last Hour</Option>
            <Option value="4h">Last 4 Hours</Option>
            <Option value="8h">Last 8 Hours</Option>
            <Option value="24h">Last 24 Hours</Option>
          </Select>
        </Col>
      </Row>

      {!isConnected && (
        <Alert
          message="Connecting to real-time data..."
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Calls"
              value={overallStats.totalCalls}
              prefix={<PhoneOutlined style={{ color: '#3797ce' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Avg Handle Time"
              value={formatTime(overallStats.avgHandleTime)}
              prefix={<ClockCircleOutlined style={{ color: '#79b6db' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Agents"
              value={overallStats.activeAgents}
              prefix={<TeamOutlined style={{ color: '#a0cbe5' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={overallStats.successRate}
              suffix="%"
              prefix={<RiseOutlined style={{ color: '#d6ebf5' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Calls in Queue"
              value={overallStats.callsInQueue}
              prefix={<SoundOutlined style={{ color: '#b7d3e5' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Longest Wait"
              value={formatTime(overallStats.longestWaitTime)}
              prefix={<ClockCircleOutlined style={{ color: '#6bafd0' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Abandon Rate"
              value={overallStats.abandonRate}
              suffix="%"
              prefix={<WarningOutlined style={{ color: '#d0e3ee' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Service Level"
              value={overallStats.serviceLevel}
              suffix="%"
              prefix={<CustomerServiceOutlined style={{ color: '#3797ce' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Tabs defaultActiveKey="agents" type="card">
            <TabPane tab="Agent Status" key="agents">
              <Card>
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={16}>
                    <Table
                      columns={columns}
                      dataSource={agentStats}
                      rowKey="id"
                      pagination={{ pageSize: 8 }}
                      scroll={{ x: 'max-content' }}
                    />
                  </Col>
                  <Col xs={24} lg={8}>
                    <Card title="Agent Status Distribution" bordered={false}>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={getAgentStatusData()}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {getAgentStatusData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                </Row>
              </Card>
            </TabPane>
            
            <TabPane tab="Queue Status" key="queues">
              <Card>
                <Table
                  columns={queueColumns}
                  dataSource={queueStats}
                  rowKey="id"
                  pagination={false}
                />
              </Card>
            </TabPane>
            
            <TabPane tab="Call Volume" key="volume">
              <Card>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={callVolumeData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="calls" name="Call Volume" fill="#3797ce" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    </div>
  );
};

export default RealTimeAgentDashboard; 