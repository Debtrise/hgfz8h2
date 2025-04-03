import React, { useState, useEffect } from 'react';
import {
  UserOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Button, Select, DatePicker } from 'antd';
import moment from 'moment';
import "./Dashboard.css";
import DialerControl from "./DialerControl";

const { RangePicker } = DatePicker;
const { Option } = Select;

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('today');
  const [dateRange, setDateRange] = useState([moment().startOf('day'), moment().endOf('day')]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange, dateRange]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    document.querySelector('.sidebar').classList.toggle('collapsed');
    document.querySelector('.main-content').classList.toggle('sidebar-collapsed');
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Calls',
      value: '2,847',
      icon: <PhoneOutlined />,
      trend: '+12.5%',
      trendUp: true,
      type: 'primary'
    },
    {
      title: 'Active Agents',
      value: '24',
      icon: <UserOutlined />,
      trend: '+3',
      trendUp: true,
      type: 'success'
    },
    {
      title: 'Avg. Wait Time',
      value: '1m 45s',
      icon: <ClockCircleOutlined />,
      trend: '-30s',
      trendUp: false,
      type: 'warning'
    },
    {
      title: 'Success Rate',
      value: '94.2%',
      icon: <CheckCircleOutlined />,
      trend: '+2.4%',
      trendUp: true,
      type: 'success'
    }
  ];

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    availableAgents: { current: 27, total: 80 },
    leadsInQueue: 14351,
    totalDials: 124839,
    connectionRate: 8,
    dncs: 47,
    smsSent: 32310,
    smsReplies: 94,
    emailsSent: 20741,
    bounceRate: 3,
    emailReplies: 35,
  });

  // Sample data for the contacts chart
  const contactsChartData = [
    { time: "7am", count: 100 },
    { time: "8am", count: 150 },
    { time: "9am", count: 140 },
    { time: "10am", count: 230 },
    { time: "11am", count: 270 },
    { time: "12pm", count: 200 },
    { time: "1pm", count: 230 },
    { time: "2pm", count: 100 },
    { time: "3pm", count: 280 },
    { time: "4pm", count: 320 },
    { time: "5pm", count: 350 },
    { time: "6pm", count: 380 },
  ];

  // Find the max value for chart scaling
  const maxContactCount = Math.max(
    ...contactsChartData.map((item) => item.count)
  );

  // Handle dialer settings update
  const handleDialerUpdate = (settings) => {
    console.log("Updating dialer settings:", settings);
    // In a real app, this would send the settings to your backend
    alert(
      `Dialer settings updated: Speed=${settings.speed}, Min Agents=${settings.minAgents}`
    );
  };

  return (
    <>
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        {sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </div>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-actions">
            <Select 
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: 120 }}
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
              />
            )}
            <Button 
              icon={<ReloadOutlined />}
              onClick={fetchDashboardData}
              loading={loading}
            >
              Refresh
            </Button>
          </div>
        </div>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-header">
                <div className={`stat-icon ${stat.type}`}>
                  {stat.icon}
                </div>
                <h3 className="stat-title">{stat.title}</h3>
              </div>
              <p className="stat-value">{stat.value}</p>
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

        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Call Volume</h3>
              <div className="chart-actions">
                <Button icon={<SettingOutlined />} />
              </div>
            </div>
            {/* Add your chart component here */}
          </div>
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Agent Performance</h3>
              <div className="chart-actions">
                <Button icon={<SettingOutlined />} />
              </div>
            </div>
            {/* Add your chart component here */}
          </div>
        </div>

        <div className="control-container">
          <div className="control-header">
            <h2 className="control-title">Quick Controls</h2>
            <Button type="primary">Add New Control</Button>
          </div>
          <div className="control-grid">
            <div className="control-card">
              <div className="control-card-header">
                <div className="control-card-icon">
                  <UserOutlined />
                </div>
                <h3 className="control-card-title">Agent Management</h3>
              </div>
              <div className="control-card-content">
                <p>Manage agent status, assignments, and schedules</p>
              </div>
              <div className="control-card-footer">
                <Button>View Details</Button>
                <Button type="primary">Manage</Button>
              </div>
            </div>
            <div className="control-card">
              <div className="control-card-header">
                <div className="control-card-icon">
                  <PhoneOutlined />
                </div>
                <h3 className="control-card-title">Queue Settings</h3>
              </div>
              <div className="control-card-content">
                <p>Configure call queues and routing rules</p>
              </div>
              <div className="control-card-footer">
                <Button>View Details</Button>
                <Button type="primary">Configure</Button>
              </div>
            </div>
            <div className="control-card">
              <div className="control-card-header">
                <div className="control-card-icon">
                  <ClockCircleOutlined />
                </div>
                <h3 className="control-card-title">Schedule Management</h3>
              </div>
              <div className="control-card-content">
                <p>Set up and manage call center schedules</p>
              </div>
              <div className="control-card-footer">
                <Button>View Details</Button>
                <Button type="primary">Manage</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard; 