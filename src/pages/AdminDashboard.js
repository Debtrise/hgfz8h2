import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tabs,
  Select,
  DatePicker,
  Button,
  Typography,
  Tag,
  Space,
  Badge,
  Progress,
  Divider,
  Alert,
  Menu,
  Dropdown,
  Tooltip,
} from "antd";
import {
  PhoneOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Mock data for the dashboard
const mockAgentPerformance = [
  {
    id: 1,
    name: "John Doe",
    calls: 87,
    avgHandlingTime: 256,
    avgWaitTime: 32,
    abandonRate: 4.2,
    satisfactionScore: 4.8,
    conversionRate: 12.5,
    status: "online",
    callsHourly: [5, 8, 12, 10, 14, 9, 8, 6, 7, 8],
  },
  {
    id: 2,
    name: "Jane Smith",
    calls: 92,
    avgHandlingTime: 193,
    avgWaitTime: 28,
    abandonRate: 3.8,
    satisfactionScore: 4.5,
    conversionRate: 11.2,
    status: "online",
    callsHourly: [6, 9, 10, 12, 15, 11, 9, 8, 7, 5],
  },
  {
    id: 3,
    name: "Bob Johnson",
    calls: 75,
    avgHandlingTime: 312,
    avgWaitTime: 41,
    abandonRate: 5.2,
    satisfactionScore: 4.3,
    conversionRate: 9.8,
    status: "offline",
    callsHourly: [4, 7, 9, 11, 10, 8, 7, 6, 7, 6],
  },
  {
    id: 4,
    name: "Alice Brown",
    calls: 102,
    avgHandlingTime: 178,
    avgWaitTime: 25,
    abandonRate: 3.1,
    satisfactionScore: 4.9,
    conversionRate: 14.3,
    status: "online",
    callsHourly: [7, 10, 13, 15, 12, 10, 9, 8, 10, 8],
  },
  {
    id: 5,
    name: "Charlie Davis",
    calls: 68,
    avgHandlingTime: 287,
    avgWaitTime: 38,
    abandonRate: 4.8,
    satisfactionScore: 4.0,
    conversionRate: 8.5,
    status: "break",
    callsHourly: [3, 6, 8, 10, 9, 7, 6, 5, 8, 6],
  },
];

const mockQueuePerformance = [
  {
    id: 1,
    name: "Sales Queue",
    calls: 325,
    avgHandlingTime: 245,
    avgWaitTime: 34,
    abandonRate: 4.5,
    agents: 8,
    active: true,
  },
  {
    id: 2,
    name: "Support Queue",
    calls: 412,
    avgHandlingTime: 187,
    avgWaitTime: 28,
    abandonRate: 3.2,
    agents: 10,
    active: true,
  },
  {
    id: 3,
    name: "VIP Clients",
    calls: 98,
    avgHandlingTime: 320,
    avgWaitTime: 15,
    abandonRate: 1.8,
    agents: 3,
    active: true,
  },
  {
    id: 4,
    name: "Retention",
    calls: 156,
    avgHandlingTime: 275,
    avgWaitTime: 40,
    abandonRate: 5.1,
    agents: 5,
    active: true,
  },
  {
    id: 5,
    name: "Technical Issues",
    calls: 203,
    avgHandlingTime: 340,
    avgWaitTime: 45,
    abandonRate: 6.2,
    agents: 6,
    active: false,
  },
];

const mockCallVolumeData = [
  { hour: "9:00", calls: 45, abandoned: 3 },
  { hour: "10:00", calls: 62, abandoned: 5 },
  { hour: "11:00", calls: 78, abandoned: 6 },
  { hour: "12:00", calls: 55, abandoned: 4 },
  { hour: "13:00", calls: 42, abandoned: 3 },
  { hour: "14:00", calls: 70, abandoned: 5 },
  { hour: "15:00", calls: 85, abandoned: 7 },
  { hour: "16:00", calls: 68, abandoned: 4 },
  { hour: "17:00", calls: 50, abandoned: 3 },
];

const mockCallOutcomeData = [
  { name: "Resolved", value: 65 },
  { name: "Follow-up Required", value: 20 },
  { name: "Transferred", value: 10 },
  { name: "Abandoned", value: 5 },
];

const mockAgentUtilizationData = [
  { name: "Available", value: 35 },
  { name: "On Call", value: 45 },
  { name: "After Call Work", value: 15 },
  { name: "Break/Away", value: 5 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

// Admin Dashboard Component
const AdminDashboard = () => {
  // State management
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedView, setSelectedView] = useState("team");
  const [selectedQueue, setSelectedQueue] = useState("all");
  const [selectedAgent, setSelectedAgent] = useState("all");
  const [loading, setLoading] = useState(false);
  const [callsData, setCallsData] = useState({
    total: 1280,
    answered: 1215,
    abandoned: 65,
    avgWaitTime: 32,
    avgHandlingTime: 245,
    satisfactionScore: 4.6,
  });

  // Format time in seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle date range change
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    // In a real application, this would trigger an API call to fetch data for the selected date range
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // Handle view change (team or agent)
  const handleViewChange = (value) => {
    setSelectedView(value);
  };

  // Handle queue selection change
  const handleQueueChange = (value) => {
    setSelectedQueue(value);
  };

  // Handle agent selection change
  const handleAgentChange = (value) => {
    setSelectedAgent(value);
  };

  // Refresh data
  const handleRefresh = () => {
    setLoading(true);
    // In a real application, this would trigger an API call to fetch fresh data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // Export data
  const handleExport = () => {
    // In a real application, this would generate and download a report
    console.log("Exporting data...");
  };

  // Columns for agent performance table
  const agentColumns = [
    {
      title: "Agent",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <Badge
            status={
              record.status === "online"
                ? "success"
                : record.status === "break"
                ? "warning"
                : "default"
            }
          />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Calls",
      dataIndex: "calls",
      key: "calls",
      sorter: (a, b) => a.calls - b.calls,
    },
    {
      title: "Avg. Handling Time",
      dataIndex: "avgHandlingTime",
      key: "avgHandlingTime",
      render: (seconds) => formatTime(seconds),
      sorter: (a, b) => a.avgHandlingTime - b.avgHandlingTime,
    },
    {
      title: "Avg. Wait Time",
      dataIndex: "avgWaitTime",
      key: "avgWaitTime",
      render: (seconds) => formatTime(seconds),
      sorter: (a, b) => a.avgWaitTime - b.avgWaitTime,
    },
    {
      title: "Abandon Rate",
      dataIndex: "abandonRate",
      key: "abandonRate",
      render: (rate) => `${rate}%`,
      sorter: (a, b) => a.abandonRate - b.abandonRate,
    },
    {
      title: "Satisfaction",
      dataIndex: "satisfactionScore",
      key: "satisfactionScore",
      render: (score) => (
        <Space>
          <Rate disabled defaultValue={Math.round(score)} />
          <Text>{score.toFixed(1)}</Text>
        </Space>
      ),
      sorter: (a, b) => a.satisfactionScore - b.satisfactionScore,
    },
    {
      title: "Conversion Rate",
      dataIndex: "conversionRate",
      key: "conversionRate",
      render: (rate) => `${rate}%`,
      sorter: (a, b) => a.conversionRate - b.conversionRate,
    },
  ];

  // Columns for queue performance table
  const queueColumns = [
    {
      title: "Queue",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <Badge status={record.active ? "success" : "default"} />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Calls",
      dataIndex: "calls",
      key: "calls",
      sorter: (a, b) => a.calls - b.calls,
    },
    {
      title: "Agents",
      dataIndex: "agents",
      key: "agents",
    },
    {
      title: "Avg. Handling Time",
      dataIndex: "avgHandlingTime",
      key: "avgHandlingTime",
      render: (seconds) => formatTime(seconds),
      sorter: (a, b) => a.avgHandlingTime - b.avgHandlingTime,
    },
    {
      title: "Avg. Wait Time",
      dataIndex: "avgWaitTime",
      key: "avgWaitTime",
      render: (seconds) => formatTime(seconds),
      sorter: (a, b) => a.avgWaitTime - b.avgWaitTime,
    },
    {
      title: "Abandon Rate",
      dataIndex: "abandonRate",
      key: "abandonRate",
      render: (rate) => `${rate}%`,
      sorter: (a, b) => a.abandonRate - b.abandonRate,
    },
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "white",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        >
          <p>
            <strong>{label}</strong>
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          background: "#fff",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ marginLeft: "auto" }}>
          <Space>
            <RangePicker onChange={handleDateRangeChange} />
            <Select
              defaultValue="all"
              style={{ width: 150 }}
              onChange={handleQueueChange}
            >
              <Option value="all">All Queues</Option>
              {mockQueuePerformance.map((queue) => (
                <Option key={queue.id} value={queue.id}>
                  {queue.name}
                </Option>
              ))}
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            />
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              Export
            </Button>
          </Space>
        </div>
      </Header>

      <Content style={{ padding: "16px" }}>
        {/* Summary Cards */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={4}>
            <Card>
              <Statistic
                title="Total Calls"
                value={callsData.total}
                prefix={<PhoneOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Answered Calls"
                value={callsData.answered}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
                suffix={
                  <small>
                    {((callsData.answered / callsData.total) * 100).toFixed(1)}%
                  </small>
                }
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Abandoned Calls"
                value={callsData.abandoned}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: "#f5222d" }}
                suffix={
                  <small>
                    {((callsData.abandoned / callsData.total) * 100).toFixed(1)}
                    %
                  </small>
                }
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Avg. Wait Time"
                value={formatTime(callsData.avgWaitTime)}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Avg. Handling Time"
                value={formatTime(callsData.avgHandlingTime)}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Satisfaction Score"
                value={callsData.satisfactionScore}
                prefix={<StarOutlined />}
                valueStyle={{ color: "#13c2c2" }}
                suffix="/5"
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content Tabs */}
        <Tabs defaultActiveKey="overview">
          <TabPane
            tab={
              <span>
                <BarChartOutlined />
                Overview
              </span>
            }
            key="overview"
          >
            <Row gutter={16}>
              {/* Call Volume Chart */}
              <Col span={12}>
                <Card title="Call Volume by Hour" style={{ marginBottom: 16 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={mockCallVolumeData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="calls" name="Total Calls" fill="#1890ff" />
                      <Bar
                        dataKey="abandoned"
                        name="Abandoned"
                        fill="#f5222d"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              {/* Agent Performance Distribution */}
              <Col span={12}>
                <Card
                  title="Today's Agent Performance"
                  style={{ marginBottom: 16 }}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={mockAgentPerformance}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="calls"
                        name="Calls Handled"
                        stroke="#1890ff"
                      />
                      <Line
                        type="monotone"
                        dataKey="conversionRate"
                        name="Conversion Rate (%)"
                        stroke="#52c41a"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              {/* Call Outcome Distribution */}
              <Col span={8}>
                <Card title="Call Outcomes" style={{ marginBottom: 16 }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={mockCallOutcomeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {mockCallOutcomeData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              {/* Agent Utilization */}
              <Col span={8}>
                <Card title="Agent Utilization" style={{ marginBottom: 16 }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={mockAgentUtilizationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {mockAgentUtilizationData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              {/* Service Level */}
              <Col span={8}>
                <Card title="Service Level" style={{ marginBottom: 16 }}>
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <Tooltip title="Percentage of calls answered within target time (20 seconds)">
                      <Progress
                        type="dashboard"
                        percent={78}
                        format={(percent) => `${percent}%`}
                        width={180}
                      />
                    </Tooltip>
                    <Divider />
                    <Row gutter={16}>
                      <Col span={12}>
                        <Statistic
                          title="Target"
                          value="80%"
                          valueStyle={{ color: "#1890ff" }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Trend"
                          value="2.4%"
                          prefix={<ArrowUpOutlined />}
                          valueStyle={{ color: "#52c41a" }}
                          suffix="vs. yesterday"
                        />
                      </Col>
                    </Row>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Queue Performance Table */}
            <Card title="Queue Performance" style={{ marginBottom: 16 }}>
              <Table
                columns={queueColumns}
                dataSource={mockQueuePerformance}
                rowKey="id"
                pagination={false}
                loading={loading}
              />
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span>
                <TeamOutlined />
                Agent Performance
              </span>
            }
            key="agents"
          >
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={24}>
                <Card>
                  <Space style={{ marginBottom: 16 }}>
                    <Text strong>View:</Text>\
                    {selectedView === "individual" && (
                      <>
                        <Text strong style={{ marginLeft: 16 }}>
                          Agent:
                        </Text>
                        <Select
                          defaultValue="all"
                          style={{ width: 150 }}
                          onChange={handleAgentChange}
                        >
                          <Option value="all">All Agents</Option>
                          {mockAgentPerformance.map((agent) => (
                            <Option key={agent.id} value={agent.id}>
                              {agent.name}
                            </Option>
                          ))}
                        </Select>
                      </>
                    )}
                  </Space>

                  {selectedView === "individual" && selectedAgent !== "all" ? (
                    // Individual agent view
                    <AgentDetailView
                      agent={mockAgentPerformance.find(
                        (a) => a.id === selectedAgent
                      )}
                    />
                  ) : (
                    // Team view
                    <Table
                      columns={agentColumns}
                      dataSource={mockAgentPerformance}
                      rowKey="id"
                      pagination={false}
                      loading={loading}
                    />
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span>
                <LineChartOutlined />
                Trends
              </span>
            }
            key="trends"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Card
                  title="Weekly Call Volume Trend"
                  style={{ marginBottom: 16 }}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={[
                        { day: "Mon", calls: 256, sla: 82 },
                        { day: "Tue", calls: 278, sla: 78 },
                        { day: "Wed", calls: 304, sla: 75 },
                        { day: "Thu", calls: 287, sla: 79 },
                        { day: "Fri", calls: 312, sla: 73 },
                        { day: "Sat", calls: 198, sla: 85 },
                        { day: "Sun", calls: 152, sla: 89 },
                      ]}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <RechartsTooltip />
                      <Legend />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="calls"
                        stroke="#8884d8"
                        fill="#8884d8"
                        name="Total Calls"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="sla"
                        stroke="#82ca9d"
                        name="SLA %"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  title="Performance Metrics Trend"
                  style={{ marginBottom: 16 }}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={[
                        { day: "Mon", aht: 240, awt: 32, abt: 15 },
                        { day: "Tue", aht: 235, awt: 30, abt: 14 },
                        { day: "Wed", aht: 255, awt: 35, abt: 18 },
                        { day: "Thu", aht: 248, awt: 33, abt: 17 },
                        { day: "Fri", aht: 262, awt: 38, abt: 20 },
                        { day: "Sat", aht: 230, awt: 28, abt: 13 },
                        { day: "Sun", aht: 225, awt: 25, abt: 12 },
                      ]}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="aht"
                        stroke="#8884d8"
                        name="Avg. Handle Time (sec)"
                      />
                      <Line
                        type="monotone"
                        dataKey="awt"
                        stroke="#82ca9d"
                        name="Avg. Wait Time (sec)"
                      />
                      <Line
                        type="monotone"
                        dataKey="abt"
                        stroke="#ff8042"
                        name="Avg. Break Time (min)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
            <Card title="Historical Performance" style={{ marginBottom: 16 }}>
              <Alert
                message="Service Level Trend Analysis"
                description="The service level has been trending upward over the past 30 days, with an average improvement of 1.2% week over week. The most significant improvement was observed in the Sales Queue (+3.8%)."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={[
                    { week: "Week 1", serviceLevel: 72, abandonRate: 5.8 },
                    { week: "Week 2", serviceLevel: 74, abandonRate: 5.2 },
                    { week: "Week 3", serviceLevel: 75, abandonRate: 4.9 },
                    { week: "Week 4", serviceLevel: 78, abandonRate: 4.5 },
                  ]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis yAxisId="left" domain={[60, 100]} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="serviceLevel"
                    stroke="#82ca9d"
                    name="Service Level %"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="abandonRate"
                    stroke="#ff8042"
                    name="Abandon Rate %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
};

// Subcomponent for individual agent view
const AgentDetailView = ({ agent }) => {
  if (!agent) return <div>Please select an agent</div>;

  // Format time in seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDownloadReport = () => {
    // In a real application, this would generate and download a report for the agent
    console.log(`Downloading report for ${agent.name}...`);
  };

  return (
    <div className="agent-detail-view">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Space>
          <Avatar size={64} icon={<UserOutlined />} />
          <div>
            <Title level={4}>{agent.name}</Title>
            <Tag
              color={
                agent.status === "online"
                  ? "success"
                  : agent.status === "break"
                  ? "warning"
                  : "default"
              }
            >
              {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
            </Tag>
          </div>
        </Space>
        <Button icon={<DownloadOutlined />} onClick={handleDownloadReport}>
          Download Report
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Calls"
              value={agent.calls}
              prefix={<PhoneOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg. Handling Time"
              value={formatTime(agent.avgHandlingTime)}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Satisfaction Score"
              value={agent.satisfactionScore}
              prefix={<StarOutlined />}
              valueStyle={{ color: "#13c2c2" }}
              suffix="/5"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Conversion Rate"
              value={`${agent.conversionRate}%`}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Hourly Call Distribution" style={{ marginBottom: 16 }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={agent.callsHourly.map((calls, index) => ({
              hour: `${9 + index}:00`,
              calls,
            }))}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Bar dataKey="calls" name="Calls" fill="#1890ff" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Performance Metrics" style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text>Average Handling Time</Text>
                <Text>{formatTime(agent.avgHandlingTime)}</Text>
              </div>
              <Progress
                percent={Math.round((240 / agent.avgHandlingTime) * 100)}
                status="active"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text>Average Wait Time</Text>
                <Text>{formatTime(agent.avgWaitTime)}</Text>
              </div>
              <Progress
                percent={Math.round((30 / agent.avgWaitTime) * 100)}
                status="active"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text>Abandon Rate</Text>
                <Text>{agent.abandonRate}%</Text>
              </div>
              <Progress
                percent={Math.round(((10 - agent.abandonRate) / 10) * 100)}
                status="active"
              />
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text>Satisfaction Score</Text>
                <Text>{agent.satisfactionScore}/5</Text>
              </div>
              <Progress
                percent={Math.round((agent.satisfactionScore / 5) * 100)}
                status="active"
              />
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Agent Feedback" style={{ marginBottom: 16 }}>
            <Timeline>
              <Timeline.Item color="green">
                <Text strong>Customer Feedback</Text>
                <p>
                  Agent was very helpful and quickly resolved my issue. Would
                  speak with them again!
                </p>
                <Text type="secondary">Today, 11:23 AM</Text>
              </Timeline.Item>
              <Timeline.Item color="blue">
                <Text strong>Team Lead Feedback</Text>
                <p>
                  Great job handling that difficult call. I appreciate how you
                  maintained your patience and found a solution.
                </p>
                <Text type="secondary">Yesterday, 4:45 PM</Text>
              </Timeline.Item>
              <Timeline.Item color="orange">
                <Text strong>Training Recommendation</Text>
                <p>
                  Consider reviewing the new product features to be able to
                  answer customer questions more confidently.
                </p>
                <Text type="secondary">March 5, 2025</Text>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// Missing component definitions for proper rendering
const Rate = ({ disabled, defaultValue }) => {
  return (
    <div style={{ display: "flex", color: "#faad14" }}>
      {Array(5)
        .fill(0)
        .map((_, index) => (
          <StarOutlined
            key={index}
            style={{ opacity: index < defaultValue ? 1 : 0.3 }}
          />
        ))}
    </div>
  );
};

const StarOutlined = () => <span>★</span>;

export default AdminDashboard;
