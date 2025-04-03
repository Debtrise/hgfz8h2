import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Table,
  Select,
  DatePicker,
  Button,
  Input,
  Typography,
  Space,
  Tag,
  Badge,
  Tooltip,
  Tabs,
  Statistic,
  Progress,
  Divider,
  Modal,
  List,
  Timeline
} from 'antd';
import {
  SearchOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  FileSearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  AudioOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  SoundOutlined,
  UserOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Mock call data
const generateMockCalls = () => {
  const statuses = ['Completed', 'Abandoned', 'Transferred', 'Voicemail', 'Failed'];
  const directions = ['Inbound', 'Outbound', 'Internal'];
  const agents = ['John Smith', 'Maria Rodriguez', 'Tyrone Johnson', 'Sarah Williams', 'David Chen', 'Aisha Patel'];
  const campaigns = ['Sales Outreach', 'Customer Retention', 'Technical Support', 'Account Verification', 'Satisfaction Survey'];
  const dispositions = ['Interested', 'Not Interested', 'Call Back', 'Wrong Number', 'Do Not Call', 'Completed Sale', 'Technical Issue'];
  
  const calls = [];
  
  // Generate 100 random call records
  for (let i = 0; i < 100; i++) {
    const timestamp = moment().subtract(Math.floor(Math.random() * 14), 'days').subtract(Math.floor(Math.random() * 24), 'hours');
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const duration = status === 'Abandoned' ? Math.floor(Math.random() * 20) : Math.floor(Math.random() * 600) + 30;
    const waitTime = Math.floor(Math.random() * 120);
    const agent = status === 'Abandoned' ? null : agents[Math.floor(Math.random() * agents.length)];
    
    calls.push({
      key: `call-${i}`,
      id: `CALL-${100000 + i}`,
      timestamp: timestamp.format('YYYY-MM-DD HH:mm:ss'),
      timestampObj: timestamp,
      phoneNumber: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      direction,
      status,
      duration,
      waitTime,
      agent,
      recording: status === 'Completed' || status === 'Transferred',
      campaign: direction === 'Outbound' ? campaigns[Math.floor(Math.random() * campaigns.length)] : null,
      disposition: status === 'Completed' ? dispositions[Math.floor(Math.random() * dispositions.length)] : null,
      satisfactionScore: status === 'Completed' ? Math.floor(Math.random() * 5) + 1 : null,
    });
  }
  
  return calls.sort((a, b) => moment(b.timestamp).valueOf() - moment(a.timestamp).valueOf());
};

// Format phone number as (XXX) XXX-XXXX
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  
  // Extract the last 10 digits (US phone number)
  const lastTen = cleaned.slice(-10);
  
  if (lastTen.length === 10) {
    return `(${lastTen.slice(0, 3)}) ${lastTen.slice(3, 6)}-${lastTen.slice(6)}`;
  }
  
  return phoneNumber;
};

// Format duration in seconds to MM:SS
const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const CallReports = () => {
  const [calls, setCalls] = useState([]);
  const [filteredCalls, setFilteredCalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([moment().subtract(14, 'days'), moment()]);
  const [callDirection, setCallDirection] = useState('all');
  const [callStatus, setCallStatus] = useState('all');
  const [campaign, setCampaign] = useState('all');
  const [agent, setAgent] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  
  useEffect(() => {
    // Load initial data
    loadData();
  }, []);
  
  useEffect(() => {
    // Apply filters whenever filters change
    applyFilters();
  }, [calls, dateRange, callDirection, callStatus, campaign, agent, searchText]);
  
  const loadData = () => {
    setLoading(true);
    
    // In a real app, this would be an API call
    setTimeout(() => {
      const mockCalls = generateMockCalls();
      setCalls(mockCalls);
      setFilteredCalls(mockCalls);
      setLoading(false);
    }, 1000);
  };
  
  const applyFilters = () => {
    if (!calls.length) return;
    
    let filtered = [...calls];
    
    // Apply date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day');
      const endDate = dateRange[1].endOf('day');
      
      filtered = filtered.filter(call => {
        const callDate = moment(call.timestamp);
        return callDate.isBetween(startDate, endDate, null, '[]');
      });
    }
    
    // Apply direction filter
    if (callDirection !== 'all') {
      filtered = filtered.filter(call => call.direction === callDirection);
    }
    
    // Apply status filter
    if (callStatus !== 'all') {
      filtered = filtered.filter(call => call.status === callStatus);
    }
    
    // Apply campaign filter
    if (campaign !== 'all') {
      filtered = filtered.filter(call => call.campaign === campaign);
    }
    
    // Apply agent filter
    if (agent !== 'all') {
      filtered = filtered.filter(call => call.agent === agent);
    }
    
    // Apply search text filter (phone number or ID)
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      filtered = filtered.filter(
        call => call.phoneNumber.includes(searchText) || 
                call.id.toLowerCase().includes(lowerSearchText) ||
                (call.agent && call.agent.toLowerCase().includes(lowerSearchText))
      );
    }
    
    setFilteredCalls(filtered);
  };
  
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };
  
  const handleRefresh = () => {
    loadData();
  };
  
  const handleExport = () => {
    // In a real app, this would generate a CSV/Excel file
    message.success('Report exported successfully');
  };
  
  const handleResetFilters = () => {
    setDateRange([moment().subtract(14, 'days'), moment()]);
    setCallDirection('all');
    setCallStatus('all');
    setCampaign('all');
    setAgent('all');
    setSearchText('');
  };
  
  const handleSearch = (value) => {
    setSearchText(value);
  };
  
  const showCallDetail = (record) => {
    setSelectedCall(record);
    setDetailModalVisible(true);
  };
  
  const hideCallDetail = () => {
    setDetailModalVisible(false);
  };
  
  const renderStatusTag = (status) => {
    switch (status) {
      case 'Completed':
        return <Tag color="success"><CheckCircleOutlined /> Completed</Tag>;
      case 'Abandoned':
        return <Tag color="error"><CloseCircleOutlined /> Abandoned</Tag>;
      case 'Transferred':
        return <Tag color="processing"><Badge status="processing" /> Transferred</Tag>;
      case 'Voicemail':
        return <Tag color="warning"><SoundOutlined /> Voicemail</Tag>;
      case 'Failed':
        return <Tag color="default"><ExclamationCircleOutlined /> Failed</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };
  
  const renderDirectionTag = (direction) => {
    switch (direction) {
      case 'Inbound':
        return <Tag color="blue">Inbound</Tag>;
      case 'Outbound':
        return <Tag color="green">Outbound</Tag>;
      case 'Internal':
        return <Tag color="purple">Internal</Tag>;
      default:
        return <Tag>{direction}</Tag>;
    }
  };
  
  // Generate statistics
  const calculateStatistics = () => {
    if (!calls.length) return {};
    
    const totalCalls = filteredCalls.length;
    const completedCalls = filteredCalls.filter(call => call.status === 'Completed').length;
    const abandonedCalls = filteredCalls.filter(call => call.status === 'Abandoned').length;
    const transferredCalls = filteredCalls.filter(call => call.status === 'Transferred').length;
    const voicemailCalls = filteredCalls.filter(call => call.status === 'Voicemail').length;
    const failedCalls = filteredCalls.filter(call => call.status === 'Failed').length;
    
    const inboundCalls = filteredCalls.filter(call => call.direction === 'Inbound').length;
    const outboundCalls = filteredCalls.filter(call => call.direction === 'Outbound').length;
    
    const completedCallDurations = filteredCalls
      .filter(call => call.status === 'Completed')
      .map(call => call.duration);
    
    const avgDuration = completedCallDurations.length
      ? Math.round(completedCallDurations.reduce((sum, duration) => sum + duration, 0) / completedCallDurations.length)
      : 0;
    
    const waitTimes = filteredCalls
      .filter(call => call.waitTime !== undefined)
      .map(call => call.waitTime);
    
    const avgWaitTime = waitTimes.length
      ? Math.round(waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length)
      : 0;
    
    return {
      totalCalls,
      completedCalls,
      abandonedCalls,
      transferredCalls,
      voicemailCalls,
      failedCalls,
      inboundCalls,
      outboundCalls,
      avgDuration,
      avgWaitTime,
      completionRate: totalCalls ? Math.round((completedCalls / totalCalls) * 100) : 0,
      abandonRate: totalCalls ? Math.round((abandonedCalls / totalCalls) * 100) : 0,
    };
  };
  
  const statistics = calculateStatistics();
  
  // Prepare data for charts
  const statusData = [
    { name: 'Completed', value: statistics.completedCalls },
    { name: 'Abandoned', value: statistics.abandonedCalls },
    { name: 'Transferred', value: statistics.transferredCalls },
    { name: 'Voicemail', value: statistics.voicemailCalls },
    { name: 'Failed', value: statistics.failedCalls },
  ];
  
  const directionData = [
    { name: 'Inbound', value: statistics.inboundCalls },
    { name: 'Outbound', value: statistics.outboundCalls },
    { name: 'Internal', value: statistics.totalCalls - statistics.inboundCalls - statistics.outboundCalls },
  ];
  
  // Group by day for time series chart
  const getCallsPerDay = () => {
    const callsByDay = {};
    const currentDateRange = [];
    
    // Create array of all days in the date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].clone().startOf('day');
      const endDate = dateRange[1].clone().endOf('day');
      let currentDate = startDate.clone();
      
      while (currentDate.isSameOrBefore(endDate, 'day')) {
        const dateStr = currentDate.format('YYYY-MM-DD');
        callsByDay[dateStr] = {
          date: dateStr,
          total: 0,
          completed: 0,
          abandoned: 0,
          inbound: 0,
          outbound: 0,
        };
        currentDateRange.push(dateStr);
        currentDate.add(1, 'day');
      }
    }
    
    // Count calls per day
    filteredCalls.forEach(call => {
      const dateStr = moment(call.timestamp).format('YYYY-MM-DD');
      
      if (callsByDay[dateStr]) {
        callsByDay[dateStr].total += 1;
        
        if (call.status === 'Completed') {
          callsByDay[dateStr].completed += 1;
        } else if (call.status === 'Abandoned') {
          callsByDay[dateStr].abandoned += 1;
        }
        
        if (call.direction === 'Inbound') {
          callsByDay[dateStr].inbound += 1;
        } else if (call.direction === 'Outbound') {
          callsByDay[dateStr].outbound += 1;
        }
      }
    });
    
    // Convert to array
    return currentDateRange.map(date => callsByDay[date]);
  };
  
  const callsPerDay = getCallsPerDay();
  
  const columns = [
    {
      title: 'Call ID',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => (
        <a onClick={() => showCallDetail(record)}>{text}</a>
      ),
    },
    {
      title: 'Date & Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: (a, b) => moment(a.timestamp).valueOf() - moment(b.timestamp).valueOf(),
    },
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (text) => formatPhoneNumber(text),
    },
    {
      title: 'Direction',
      dataIndex: 'direction',
      key: 'direction',
      render: renderDirectionTag,
      filters: [
        { text: 'Inbound', value: 'Inbound' },
        { text: 'Outbound', value: 'Outbound' },
        { text: 'Internal', value: 'Internal' },
      ],
      onFilter: (value, record) => record.direction === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: renderStatusTag,
      filters: [
        { text: 'Completed', value: 'Completed' },
        { text: 'Abandoned', value: 'Abandoned' },
        { text: 'Transferred', value: 'Transferred' },
        { text: 'Voicemail', value: 'Voicemail' },
        { text: 'Failed', value: 'Failed' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => formatDuration(duration),
      sorter: (a, b) => a.duration - b.duration,
    },
    {
      title: 'Wait Time',
      dataIndex: 'waitTime',
      key: 'waitTime',
      render: (waitTime) => `${waitTime}s`,
      sorter: (a, b) => a.waitTime - b.waitTime,
    },
    {
      title: 'Agent',
      dataIndex: 'agent',
      key: 'agent',
      render: (text) => text || '-',
      filters: [
        { text: 'John Smith', value: 'John Smith' },
        { text: 'Maria Rodriguez', value: 'Maria Rodriguez' },
        { text: 'Tyrone Johnson', value: 'Tyrone Johnson' },
        { text: 'Sarah Williams', value: 'Sarah Williams' },
        { text: 'David Chen', value: 'David Chen' },
        { text: 'Aisha Patel', value: 'Aisha Patel' },
      ],
      onFilter: (value, record) => record.agent === value,
    },
    {
      title: 'Campaign',
      dataIndex: 'campaign',
      key: 'campaign',
      render: (text) => text || '-',
    },
    {
      title: 'Recording',
      dataIndex: 'recording',
      key: 'recording',
      render: (hasRecording) => hasRecording ? (
        <Button type="link" icon={<PlayCircleOutlined />} size="small">
          Play
        </Button>
      ) : '-',
    },
  ];
  
  return (
    <div className="call-reports">
      <div className="page-header">
        <Title level={2}>
          <PhoneOutlined /> Call Reports
        </Title>
        <Text type="secondary">
          Analyze detailed call data and metrics
        </Text>
      </div>
      
      <div className="filter-section">
        <Card>
          <Row gutter={[16, 16]} align="bottom">
            <Col xs={24} md={12} lg={6}>
              <div className="filter-item">
                <label>Date Range</label>
                <RangePicker 
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  style={{ width: '100%' }}
                />
              </div>
            </Col>
            <Col xs={24} md={12} lg={6}>
              <div className="filter-item">
                <label>Call Direction</label>
                <Select
                  value={callDirection}
                  onChange={setCallDirection}
                  style={{ width: '100%' }}
                >
                  <Option value="all">All Directions</Option>
                  <Option value="Inbound">Inbound</Option>
                  <Option value="Outbound">Outbound</Option>
                  <Option value="Internal">Internal</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} md={12} lg={6}>
              <div className="filter-item">
                <label>Call Status</label>
                <Select
                  value={callStatus}
                  onChange={setCallStatus}
                  style={{ width: '100%' }}
                >
                  <Option value="all">All Statuses</Option>
                  <Option value="Completed">Completed</Option>
                  <Option value="Abandoned">Abandoned</Option>
                  <Option value="Transferred">Transferred</Option>
                  <Option value="Voicemail">Voicemail</Option>
                  <Option value="Failed">Failed</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} md={12} lg={6}>
              <div className="filter-item">
                <label>Search</label>
                <Search
                  placeholder="Phone or Call ID"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={handleSearch}
                  style={{ width: '100%' }}
                />
              </div>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} md={12} lg={6}>
              <div className="filter-item">
                <label>Campaign</label>
                <Select
                  value={campaign}
                  onChange={setCampaign}
                  style={{ width: '100%' }}
                >
                  <Option value="all">All Campaigns</Option>
                  <Option value="Sales Outreach">Sales Outreach</Option>
                  <Option value="Customer Retention">Customer Retention</Option>
                  <Option value="Technical Support">Technical Support</Option>
                  <Option value="Account Verification">Account Verification</Option>
                  <Option value="Satisfaction Survey">Satisfaction Survey</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} md={12} lg={6}>
              <div className="filter-item">
                <label>Agent</label>
                <Select
                  value={agent}
                  onChange={setAgent}
                  style={{ width: '100%' }}
                >
                  <Option value="all">All Agents</Option>
                  <Option value="John Smith">John Smith</Option>
                  <Option value="Maria Rodriguez">Maria Rodriguez</Option>
                  <Option value="Tyrone Johnson">Tyrone Johnson</Option>
                  <Option value="Sarah Williams">Sarah Williams</Option>
                  <Option value="David Chen">David Chen</Option>
                  <Option value="Aisha Patel">Aisha Patel</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} md={12} lg={12}>
              <div className="filter-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button onClick={handleResetFilters} icon={<FilterOutlined />}>
                  Reset Filters
                </Button>
                <Button 
                  type="primary" 
                  icon={<ReloadOutlined />} 
                  onClick={handleRefresh}
                  loading={loading}
                >
                  Refresh
                </Button>
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={handleExport}
                >
                  Export
                </Button>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
      
      <div className="summary-metrics" style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={
                  <Space>
                    <span>Total Calls</span>
                    <Tooltip title="Total number of calls in selected period">
                      <InfoCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
                    </Tooltip>
                  </Space>
                }
                value={statistics.totalCalls}
                prefix={<PhoneOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={
                  <Space>
                    <span>Completion Rate</span>
                    <Tooltip title="Percentage of calls completed successfully">
                      <InfoCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
                    </Tooltip>
                  </Space>
                }
                value={statistics.completionRate}
                suffix="%"
                valueStyle={{ color: statistics.completionRate >= 80 ? '#3f8600' : '#cf1322' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={
                  <Space>
                    <span>Abandon Rate</span>
                    <Tooltip title="Percentage of calls abandoned">
                      <InfoCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
                    </Tooltip>
                  </Space>
                }
                value={statistics.abandonRate}
                suffix="%"
                valueStyle={{ color: statistics.abandonRate <= 5 ? '#3f8600' : '#cf1322' }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={
                  <Space>
                    <span>Avg Duration</span>
                    <Tooltip title="Average call duration for completed calls">
                      <InfoCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
                    </Tooltip>
                  </Space>
                }
                value={formatDuration(statistics.avgDuration)}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </div>
      
      <div className="charts-section" style={{ marginTop: 16 }}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Daily Call Volume" key="1">
            <Card>
              <Title level={4}>Calls Per Day</Title>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={callsPerDay}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" name="Total Calls" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="completed" name="Completed" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="abandoned" name="Abandoned" stroke="#ff8042" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabPane>
          <TabPane tab="Call Direction" key="2">
            <Card>
              <Title level={4}>Call Direction Distribution</Title>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={directionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {directionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Col>
                <Col xs={24} md={12}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { name: 'Inbound', value: statistics.inboundCalls },
                        { name: 'Outbound', value: statistics.outboundCalls },
                      ]}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" name="Calls" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </Col>
              </Row>
            </Card>
          </TabPane>
          <TabPane tab="Call Status" key="3">
            <Card>
              <Title level={4}>Call Status Distribution</Title>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Col>
                <Col xs={24} md={12}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={statusData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" name="Calls" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Col>
              </Row>
            </Card>
          </TabPane>
        </Tabs>
      </div>
      
      <div className="call-table" style={{ marginTop: 16 }}>
        <Card title={`Call List (${filteredCalls.length} calls)`}>
          <Table 
            columns={columns} 
            dataSource={filteredCalls} 
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1300 }}
          />
        </Card>
      </div>
      
      {/* Call Detail Modal */}
      <Modal
        title={`Call Details: ${selectedCall?.id}`}
        open={detailModalVisible}
        onCancel={hideCallDetail}
        width={800}
        footer={[
          <Button key="close" onClick={hideCallDetail}>
            Close
          </Button>,
          selectedCall?.recording && (
            <Button key="play" type="primary" icon={<PlayCircleOutlined />}>
              Play Recording
            </Button>
          ),
        ]}
      >
        {selectedCall && (
          <div className="call-detail">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Phone Number"
                  value={formatPhoneNumber(selectedCall.phoneNumber)}
                  prefix={<PhoneOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Date & Time"
                  value={selectedCall.timestamp}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Direction"
                  value={selectedCall.direction}
                  valueStyle={{ color: selectedCall.direction === 'Inbound' ? '#1890ff' : '#52c41a' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Status"
                  value={selectedCall.status}
                  valueStyle={{ 
                    color: selectedCall.status === 'Completed' ? '#52c41a' : 
                           selectedCall.status === 'Abandoned' ? '#f5222d' : '#1890ff' 
                  }}
                />
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="Duration"
                  value={formatDuration(selectedCall.duration)}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Wait Time"
                  value={`${selectedCall.waitTime}s`}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Agent"
                  value={selectedCall.agent || 'N/A'}
                  prefix={<UserOutlined />}
                />
              </Col>
            </Row>
            
            {selectedCall.campaign && (
              <>
                <Divider />
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic
                      title="Campaign"
                      value={selectedCall.campaign}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Disposition"
                      value={selectedCall.disposition || 'N/A'}
                    />
                  </Col>
                </Row>
              </>
            )}
            
            <Divider />
            
            <Title level={4}>Call Timeline</Title>
            <Timeline>
              <Timeline.Item>
                Call initiated ({selectedCall.direction === 'Inbound' ? 'Inbound call received' : 'Outbound call placed'}) - {selectedCall.timestamp}
              </Timeline.Item>
              {selectedCall.waitTime > 0 && (
                <Timeline.Item>
                  Waited in queue for {selectedCall.waitTime} seconds
                </Timeline.Item>
              )}
              {selectedCall.agent && (
                <Timeline.Item>
                  Connected to agent: {selectedCall.agent}
                </Timeline.Item>
              )}
              {selectedCall.status === 'Completed' && (
                <Timeline.Item>
                  Call completed - Duration: {formatDuration(selectedCall.duration)}
                </Timeline.Item>
              )}
              {selectedCall.status === 'Abandoned' && (
                <Timeline.Item color="red">
                  Call abandoned after {formatDuration(selectedCall.duration)}
                </Timeline.Item>
              )}
              {selectedCall.status === 'Transferred' && (
                <Timeline.Item>
                  Call transferred after {formatDuration(selectedCall.duration)}
                </Timeline.Item>
              )}
              {selectedCall.status === 'Voicemail' && (
                <Timeline.Item>
                  Call sent to voicemail after {formatDuration(selectedCall.duration)}
                </Timeline.Item>
              )}
              {selectedCall.disposition && (
                <Timeline.Item>
                  Disposition: {selectedCall.disposition}
                </Timeline.Item>
              )}
            </Timeline>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CallReports;