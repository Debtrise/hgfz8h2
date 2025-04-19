import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  DatePicker,
  Select,
  Typography,
  Progress,
  Space,
  Divider,
  Button,
  Tag,
} from 'antd';
import {
  PhoneOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  DollarOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Mock data for reports
const mockReports = {
  callStats: {
    totalCalls: 156,
    answeredCalls: 142,
    missedCalls: 14,
    averageDuration: '4:32',
    longestCall: '12:45',
    shortestCall: '0:45',
  },
  dealStats: {
    totalDeals: 9,
    totalValue: 45000,
    averageDealValue: 5000,
    conversionRate: 6.4,
    pendingDeals: 3,
  },
  performanceMetrics: {
    callsPerHour: 12,
    dealsPerDay: 1.5,
    customerSatisfaction: 92,
    firstCallResolution: 85,
  },
  callHistory: [
    {
      id: 1,
      time: '09:15',
      duration: '4:32',
      type: 'Inbound',
      status: 'Completed',
      customer: 'John Smith',
      notes: 'Interested in premium package',
    },
    {
      id: 2,
      time: '10:45',
      duration: '2:15',
      type: 'Outbound',
      status: 'Completed',
      customer: 'Sarah Johnson',
      notes: 'Follow-up call',
    },
    {
      id: 3,
      time: '11:30',
      duration: '8:20',
      type: 'Inbound',
      status: 'Completed',
      customer: 'Michael Brown',
      notes: 'Technical support',
    },
    {
      id: 4,
      time: '13:15',
      duration: '3:45',
      type: 'Outbound',
      status: 'Missed',
      customer: 'Emily Davis',
      notes: 'No answer',
    },
    {
      id: 5,
      time: '14:30',
      duration: '6:10',
      type: 'Inbound',
      status: 'Completed',
      customer: 'David Wilson',
      notes: 'New customer inquiry',
    },
  ],
};

const Reports = () => {
  const { currentAgent } = useAuth();
  const [reports, setReports] = useState(mockReports);
  const [dateRange, setDateRange] = useState(null);
  const [reportType, setReportType] = useState('daily');

  const columns = [
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'Inbound' ? 'green' : 'blue'}>{type}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Completed' ? 'success' : 'error'}>{status}</Tag>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
    },
  ];

  const renderCallStats = () => (
    <Card title="Call Statistics" style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Statistic
            title="Total Calls"
            value={reports.callStats.totalCalls}
            prefix={<PhoneOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Answered Calls"
            value={reports.callStats.answeredCalls}
            prefix={<CheckCircleOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Missed Calls"
            value={reports.callStats.missedCalls}
            prefix={<ClockCircleOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Average Duration"
            value={reports.callStats.averageDuration}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Longest Call"
            value={reports.callStats.longestCall}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Shortest Call"
            value={reports.callStats.shortestCall}
          />
        </Col>
      </Row>
    </Card>
  );

  const renderDealStats = () => (
    <Card title="Deal Statistics" style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Statistic
            title="Total Deals"
            value={reports.dealStats.totalDeals}
            prefix={<CheckCircleOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Total Value"
            value={reports.dealStats.totalValue}
            prefix={<DollarOutlined />}
            suffix="$"
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Conversion Rate"
            value={reports.dealStats.conversionRate}
            suffix="%"
          />
        </Col>
        <Col span={12}>
          <Progress
            percent={Math.round((reports.dealStats.totalDeals / (reports.dealStats.totalDeals + reports.dealStats.pendingDeals)) * 100)}
            status="active"
            title="Deal Completion Rate"
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Average Deal Value"
            value={reports.dealStats.averageDealValue}
            prefix={<DollarOutlined />}
            suffix="$"
          />
        </Col>
      </Row>
    </Card>
  );

  const renderPerformanceMetrics = () => (
    <Card title="Performance Metrics" style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Statistic
            title="Calls Per Hour"
            value={reports.performanceMetrics.callsPerHour}
            prefix={<PhoneOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Deals Per Day"
            value={reports.performanceMetrics.dealsPerDay}
            prefix={<CheckCircleOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Customer Satisfaction"
            value={reports.performanceMetrics.customerSatisfaction}
            suffix="%"
          />
        </Col>
        <Col span={24}>
          <Progress
            percent={reports.performanceMetrics.firstCallResolution}
            status="active"
            title="First Call Resolution Rate"
          />
        </Col>
      </Row>
    </Card>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>Reports Dashboard</Title>
          <Space>
            <RangePicker
              onChange={(dates) => setDateRange(dates)}
              style={{ width: 300 }}
            />
            <Select
              value={reportType}
              onChange={setReportType}
              style={{ width: 120 }}
            >
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
            </Select>
            <Button type="primary" icon={<BarChartOutlined />}>
              Export Report
            </Button>
          </Space>
        </div>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            {renderCallStats()}
          </Col>
          <Col span={24}>
            {renderDealStats()}
          </Col>
          <Col span={24}>
            {renderPerformanceMetrics()}
          </Col>
          <Col span={24}>
            <Card title="Call History">
              <Table
                columns={columns}
                dataSource={reports.callHistory}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Reports; 