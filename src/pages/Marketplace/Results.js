import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Progress, Typography, Divider, Select, Button, Spin, DatePicker, Tooltip as AntTooltip } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  DollarCircleOutlined, 
  UserOutlined, 
  PercentageOutlined, 
  ShoppingOutlined,
  ReloadOutlined,
  SettingOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import moment from 'moment';
import '../Dashboard.css'; // Import dashboard styles

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Chart color palette
const COLORS = ['#3797ce', '#6bafd0', '#a0cbe5', '#d0e3ee'];

const Results = () => {
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('today');
  const [dateRange, setDateRange] = useState([moment().startOf('day'), moment().endOf('day')]);
  const [metrics, setMetrics] = useState({
    totalSales: 24890,
    totalLeads: 1256,
    conversionRate: 5.2,
    averageDealSize: 178.5,
    topSellers: [],
    topBuyers: [],
    recentTransactions: []
  });

  // Simulate data fetch on component mount and time range change
  useEffect(() => {
    fetchData();
  }, [timeRange, dateRange]);

  const fetchData = () => {
    setLoading(true);
    setStatsLoading(true);
    setChartsLoading(true);

    // Simulate API call with timeout
    setTimeout(() => {
      // Mock data for different time ranges
      let salesMultiplier = 1;
      if (timeRange === 'week') salesMultiplier = 7;
      if (timeRange === 'month') salesMultiplier = 30;
      if (timeRange === 'custom') {
        const start = moment(dateRange[0]);
        const end = moment(dateRange[1]);
        salesMultiplier = end.diff(start, 'days') + 1;
      }

      setMetrics({
        totalSales: Math.round(24890 * salesMultiplier),
        totalLeads: Math.round(1256 * salesMultiplier),
        conversionRate: 5.2,
        averageDealSize: 178.5,
        topSellers: [
          { id: 1, name: 'Acme Lead Gen', sales: 452 * salesMultiplier, revenue: 78500 * salesMultiplier, performance: 87 },
          { id: 2, name: 'LeadMasters', sales: 389 * salesMultiplier, revenue: 65400 * salesMultiplier, performance: 82 },
          { id: 3, name: 'Prime Data', sales: 310 * salesMultiplier, revenue: 54200 * salesMultiplier, performance: 79 },
          { id: 4, name: 'Quality Leads Inc', sales: 245 * salesMultiplier, revenue: 42300 * salesMultiplier, performance: 73 },
        ],
        topBuyers: [
          { id: 1, name: 'Enterprise Solutions', purchases: 215 * salesMultiplier, spent: 38700 * salesMultiplier, leadQuality: 92 },
          { id: 2, name: 'Growth Marketing', purchases: 187 * salesMultiplier, spent: 33200 * salesMultiplier, leadQuality: 88 },
          { id: 3, name: 'TechBuyers', purchases: 156 * salesMultiplier, spent: 27900 * salesMultiplier, leadQuality: 85 },
          { id: 4, name: 'LeadConverters', purchases: 132 * salesMultiplier, spent: 23100 * salesMultiplier, leadQuality: 79 },
        ],
        recentTransactions: [
          { id: 1, seller: 'Acme Lead Gen', buyer: 'Enterprise Solutions', quantity: 50, amount: 8750, date: '2023-04-12' },
          { id: 2, seller: 'LeadMasters', buyer: 'Growth Marketing', quantity: 35, amount: 5950, date: '2023-04-11' },
          { id: 3, seller: 'Prime Data', buyer: 'TechBuyers', quantity: 25, amount: 4375, date: '2023-04-10' },
          { id: 4, seller: 'Quality Leads Inc', buyer: 'LeadConverters', quantity: 40, amount: 6800, date: '2023-04-09' },
        ]
      });

      setLoading(false);
      setStatsLoading(false);
      setChartsLoading(false);
    }, 1000);
  };

  // Prepare data for charts
  const dailySalesData = [
    { day: 'Mon', leads: 142, sales: 22400 },
    { day: 'Tue', leads: 156, sales: 24900 },
    { day: 'Wed', leads: 177, sales: 28700 },
    { day: 'Thu', leads: 162, sales: 26800 },
    { day: 'Fri', leads: 189, sales: 31200 },
    { day: 'Sat', leads: 95, sales: 16800 },
    { day: 'Sun', leads: 76, sales: 14300 },
  ];

  const categorySalesData = [
    { name: 'Insurance', value: 35 },
    { name: 'Real Estate', value: 25 },
    { name: 'Finance', value: 20 },
    { name: 'Automotive', value: 15 },
    { name: 'Healthcare', value: 5 },
  ];

  // Stats cards data
  const stats = [
    {
      title: 'Total Sales',
      value: `$${metrics.totalSales.toLocaleString()}`,
      icon: <DollarCircleOutlined />,
      trend: '+8.5%',
      trendUp: true,
      type: 'primary',
      loading: statsLoading
    },
    {
      title: 'Total Leads',
      value: metrics.totalLeads.toLocaleString(),
      icon: <UserOutlined />,
      trend: '+12.3%',
      trendUp: true,
      type: 'success',
      loading: statsLoading
    },
    {
      title: 'Conversion Rate',
      value: `${metrics.conversionRate}%`,
      icon: <PercentageOutlined />,
      trend: '+0.8%',
      trendUp: true,
      type: 'warning',
      loading: statsLoading
    },
    {
      title: 'Average Deal Size',
      value: `$${metrics.averageDealSize}`,
      icon: <ShoppingOutlined />,
      trend: '+3.2%',
      trendUp: true,
      type: 'success',
      loading: statsLoading
    }
  ];

  // Seller and buyer table columns
  const sellerColumns = [
    { title: 'Seller', dataIndex: 'name', key: 'name' },
    { title: 'Leads Sold', dataIndex: 'sales', key: 'sales' },
    { title: 'Revenue', dataIndex: 'revenue', key: 'revenue', render: val => `$${val.toLocaleString()}` },
    { 
      title: 'Performance', 
      dataIndex: 'performance', 
      key: 'performance',
      render: val => <Progress percent={val} size="small" status={val > 80 ? "success" : val > 60 ? "normal" : "exception"} />
    },
  ];

  const buyerColumns = [
    { title: 'Buyer', dataIndex: 'name', key: 'name' },
    { title: 'Leads Purchased', dataIndex: 'purchases', key: 'purchases' },
    { title: 'Total Spent', dataIndex: 'spent', key: 'spent', render: val => `$${val.toLocaleString()}` },
    { 
      title: 'Lead Quality', 
      dataIndex: 'leadQuality', 
      key: 'leadQuality',
      render: val => <Progress percent={val} size="small" status={val > 80 ? "success" : val > 60 ? "normal" : "exception"} />
    },
  ];

  const transactionColumns = [
    { title: 'Seller', dataIndex: 'seller', key: 'seller' },
    { title: 'Buyer', dataIndex: 'buyer', key: 'buyer' },
    { title: 'Leads', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: val => `$${val.toLocaleString()}` },
    { title: 'Date', dataIndex: 'date', key: 'date' },
  ];

  return (
    <div className="marketplace-results dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <Title level={2}>Marketplace Results</Title>
          <div className="dashboard-actions">
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: 120 }}
              size="middle"
            >
              <Option value="today">Today</Option>
              <Option value="week">This Week</Option>
              <Option value="month">This Month</Option>
              <Option value="custom">Custom Range</Option>
            </Select>
            {timeRange === 'custom' && (
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                style={{ width: 280 }}
                size="middle"
              />
            )}
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchData}
              loading={loading}
              type="primary"
              size="middle"
            >
              Refresh
            </Button>
            <AntTooltip title="Export results">
              <Button 
                icon={<DownloadOutlined />} 
                size="middle"
              />
            </AntTooltip>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-header">
                <div className={`stat-icon ${stat.type}`}>
                  {stat.icon}
                </div>
                <h3 className="stat-title">{stat.title}</h3>
              </div>
              <Spin spinning={stat.loading}>
                <p className="stat-value">{stat.value}</p>
              </Spin>
              <div className="stat-footer">
                <span className={`stat-trend ${stat.trendUp ? 'trend-up' : 'trend-down'}`}>
                  {stat.trendUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {stat.trend}
                </span>
                <span>vs last period</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">
                Daily Lead Sales & Volume
                <AntTooltip title="Shows the daily lead volume and sales over time">
                  <InfoCircleOutlined style={{ marginLeft: 8, fontSize: 14, color: '#8c8c8c' }} />
                </AntTooltip>
              </h3>
              <div className="chart-actions">
                <AntTooltip title="Download chart data">
                  <Button icon={<FileExcelOutlined />} size="small" style={{ marginRight: 8 }} />
                </AntTooltip>
                <AntTooltip title="Chart settings">
                  <Button icon={<SettingOutlined />} size="small" />
                </AntTooltip>
              </div>
            </div>
            <Spin spinning={chartsLoading}>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={dailySalesData}>
                  <defs>
                    <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgba(91, 187, 242, 0.8)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="rgba(91, 187, 242, 0.2)" stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgba(155, 106, 137, 0.8)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="rgba(155, 106, 137, 0.2)" stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="animatedGradient" x1="0" y1="0" x2="100%" y2="0">
                      <stop offset="0%" stopColor="rgba(91, 187, 242, 0.15)" stopOpacity={0.15}>
                        <animate attributeName="offset" values="0;0.5;1" dur="10s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="33%" stopColor="rgba(203, 182, 182, 0.15)" stopOpacity={0.15}>
                        <animate attributeName="offset" values="0;0.5;1" dur="10s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="66%" stopColor="rgba(155, 106, 137, 0.15)" stopOpacity={0.15}>
                        <animate attributeName="offset" values="0;0.5;1" dur="10s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="100%" stopColor="rgba(91, 187, 242, 0.15)" stopOpacity={0.15}>
                        <animate attributeName="offset" values="0;0.5;1" dur="10s" repeatCount="indefinite" />
                      </stop>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="day" stroke="#8c8c8c" />
                  <YAxis yAxisId="left" stroke="#8c8c8c" />
                  <YAxis yAxisId="right" orientation="right" stroke="#8c8c8c" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'white',
                      border: '1px solid rgba(55, 151, 206, 0.1)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(55, 151, 206, 0.1)'
                    }}
                    labelStyle={{ color: '#3797ce', fontWeight: '500' }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="leads"
                    name="Leads"
                    stroke="#3797ce"
                    fillOpacity={1}
                    fill="url(#leadGradient)"
                    strokeWidth={2}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="sales"
                    name="Sales ($)"
                    stroke="#6bafd0"
                    fillOpacity={1}
                    fill="url(#salesGradient)"
                    strokeWidth={2}
                  />
                  <rect x="0" y="0" width="100%" height="100%" fill="url(#animatedGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </Spin>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">
                Category Distribution
                <AntTooltip title="Shows the distribution of leads across different categories">
                  <InfoCircleOutlined style={{ marginLeft: 8, fontSize: 14, color: '#8c8c8c' }} />
                </AntTooltip>
              </h3>
              <div className="chart-actions">
                <AntTooltip title="Download chart data">
                  <Button icon={<FileExcelOutlined />} size="small" style={{ marginRight: 8 }} />
                </AntTooltip>
                <AntTooltip title="Chart settings">
                  <Button icon={<SettingOutlined />} size="small" />
                </AntTooltip>
              </div>
            </div>
            <Spin spinning={chartsLoading}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <defs>
                    <linearGradient id="animatedPieGradient" x1="0" y1="0" x2="100%" y2="0">
                      <stop offset="0%" stopColor="rgba(91, 187, 242, 0.1)" stopOpacity={0.1}>
                        <animate attributeName="offset" values="0;0.5;1" dur="10s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="33%" stopColor="rgba(203, 182, 182, 0.1)" stopOpacity={0.1}>
                        <animate attributeName="offset" values="0;0.5;1" dur="10s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="66%" stopColor="rgba(155, 106, 137, 0.1)" stopOpacity={0.1}>
                        <animate attributeName="offset" values="0;0.5;1" dur="10s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="100%" stopColor="rgba(91, 187, 242, 0.1)" stopOpacity={0.1}>
                        <animate attributeName="offset" values="0;0.5;1" dur="10s" repeatCount="indefinite" />
                      </stop>
                    </linearGradient>
                    
                    {categorySalesData.map((entry, index) => {
                      const colors = [
                        'rgba(91, 187, 242, 1)', // Light blue
                        'rgba(203, 182, 182, 1)', // Light pink/tan
                        'rgba(155, 106, 137, 1)', // Purple
                        'rgba(182, 203, 182, 1)', // Light green
                        'rgba(93, 137, 162, 1)'   // Blue-gray
                      ];
                      return (
                        <linearGradient key={`gradient-${index}`} id={`colorGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={0.9}/>
                          <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.7}/>
                        </linearGradient>
                      );
                    })}
                  </defs>
                  <Pie
                    data={categorySalesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {categorySalesData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#colorGradient-${index})`}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `${value}%`}
                    contentStyle={{ 
                      background: 'white',
                      border: '1px solid rgba(55, 151, 206, 0.1)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(55, 151, 206, 0.1)'
                    }}
                  />
                  <Legend 
                    formatter={(value, entry, index) => (
                      <span style={{ color: COLORS[index % COLORS.length], fontWeight: 500 }}>{value}</span>
                    )}
                  />
                  <rect x="0" y="0" width="100%" height="100%" fill="url(#animatedPieGradient)" />
                </PieChart>
              </ResponsiveContainer>
            </Spin>
          </div>
        </div>
        
        {/* Data Tables */}
        <div className="data-tables">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 16 }}>
            <Title level={4}>Top Sellers</Title>
            <AntTooltip title="Export seller data">
              <Button icon={<DownloadOutlined />} size="small">Export</Button>
            </AntTooltip>
          </div>
          <Card className="marketplace-table-card">
            <Spin spinning={statsLoading}>
              <Table
                dataSource={metrics.topSellers}
                columns={sellerColumns}
                rowKey="id"
                pagination={false}
                className="marketplace-table"
              />
            </Spin>
          </Card>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 16 }}>
            <Title level={4}>Top Buyers</Title>
            <AntTooltip title="Export buyer data">
              <Button icon={<DownloadOutlined />} size="small">Export</Button>
            </AntTooltip>
          </div>
          <Card className="marketplace-table-card">
            <Spin spinning={statsLoading}>
              <Table
                dataSource={metrics.topBuyers}
                columns={buyerColumns}
                rowKey="id"
                pagination={false}
                className="marketplace-table"
              />
            </Spin>
          </Card>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 16 }}>
            <Title level={4}>Recent Transactions</Title>
            <AntTooltip title="Export transaction data">
              <Button icon={<DownloadOutlined />} size="small">Export</Button>
            </AntTooltip>
          </div>
          <Card className="marketplace-table-card">
            <Spin spinning={statsLoading}>
              <Table
                dataSource={metrics.recentTransactions}
                columns={transactionColumns}
                rowKey="id"
                pagination={false}
                className="marketplace-table"
              />
            </Spin>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Results; 