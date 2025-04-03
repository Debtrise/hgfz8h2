import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Button, Select, DatePicker, message } from 'antd';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import moment from 'moment';
import "./Dashboard.css";
import DialerControl from "./DialerControl";
import DataMixControl from "./DataMixControl";
import QueueStatusControl from "./QueueStatusControl";
import { callAnalyticsService } from '../services/callAnalyticsService';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('today');
  const [dateRange, setDateRange] = useState([moment().startOf('day'), moment().endOf('day')]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    hourlyData: null,
    dateRangeData: null,
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

  useEffect(() => {
    fetchDashboardData();
    // Set up polling for real-time data every 5 minutes
    const interval = setInterval(fetchRealTimeData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [timeRange, dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      let data;
      if (timeRange === 'custom') {
        data = await callAnalyticsService.getDateRangeData(
          dateRange[0].format('YYYY-MM-DD'),
          dateRange[1].format('YYYY-MM-DD')
        );
        setDashboardData(prev => ({
          ...prev,
          dateRangeData: data
        }));
      } else {
        data = await callAnalyticsService.getHourlyData();
        setDashboardData(prev => ({
          ...prev,
          hourlyData: data
        }));
      }
    } catch (error) {
      message.error('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealTimeData = async () => {
    try {
      const isHealthy = await callAnalyticsService.getHealthCheck();
      if (!isHealthy) {
        console.warn('API health check failed');
        return;
      }
      await fetchDashboardData();
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    document.querySelector('.sidebar').classList.toggle('collapsed');
    document.querySelector('.main-content').classList.toggle('sidebar-collapsed');
  };

  // Stats cards data with real data from API
  const stats = [
    {
      title: 'Total Calls',
      value: dashboardData.hourlyData?.find(h => h.hour_of_day_pdt === 'Total')?.total_outbound_attempts || '0',
      icon: <PhoneOutlined />,
      trend: 'Today',
      trendUp: true,
      type: 'primary'
    },
    {
      title: 'Answered Calls',
      value: dashboardData.hourlyData?.find(h => h.hour_of_day_pdt === 'Total')?.answered_calls || '0',
      icon: <UserOutlined />,
      trend: 'Today',
      trendUp: true,
      type: 'success'
    },
    {
      title: 'Calls Over 5 Min',
      value: dashboardData.hourlyData?.find(h => h.hour_of_day_pdt === 'Total')?.calls_over_5min || '0',
      icon: <ClockCircleOutlined />,
      trend: 'Today',
      trendUp: true,
      type: 'warning'
    },
    {
      title: 'Total Transfers',
      value: dashboardData.hourlyData?.find(h => h.hour_of_day_pdt === 'Total')?.total_transfers || '0',
      icon: <CheckCircleOutlined />,
      trend: 'Today',
      trendUp: true,
      type: 'success'
    }
  ];

  // Prepare data for the call volume chart
  const callVolumeData = Array.isArray(dashboardData.hourlyData) 
    ? dashboardData.hourlyData
        .filter(h => h.hour_of_day_pdt !== 'Total')
        .map(hour => ({
          time: hour.hour_of_day_pdt,
          totalCalls: hour.total_outbound_attempts,
          answeredCalls: hour.answered_calls,
          successfulTransfers: hour.successful_transfers,
          machineDetectionRate: hour.machine_detection_rate_pct
        }))
    : [];

  // Prepare data for the real-time activity chart
  const realTimeData = Array.isArray(dashboardData.hourlyData)
    ? dashboardData.hourlyData
        .filter(h => h.hour_of_day_pdt !== 'Total')
        .map(hour => ({
          time: hour.hour_of_day_pdt,
          calls: hour.total_outbound_attempts,
          answered: hour.answered_calls,
          transfers: hour.total_transfers,
          freshDialer: hour.freshdialer_calls,
          p1Dialer: hour.p1dialer_calls
        }))
    : [];

  // Handle dialer settings update
  const handleDialerUpdate = (settings) => {
    console.log("Updating dialer settings:", settings);
    // In a real app, this would send the settings to your backend
    alert(
      `Dialer settings updated: Speed=${settings.speed}, Min Agents=${settings.minAgents}`
    );
  };

  // Add a handler for data mix updates
  const handleDataMixUpdate = (mixSettings) => {
    console.log("Updating data mix settings:", mixSettings);
    // In a real app, this would send the settings to your backend
    alert(
      `Data mix updated: Fresh=${mixSettings.freshMix}%, Mid=${mixSettings.midMix}%, Aged=${mixSettings.agedMix}%`
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

        <div className="dashboard-controls-row">
          <div className="control-panel">
            <div className="control-header">
              <div className="control-icon dialer-icon">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M12 16c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0-13c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm0 16c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7z"/>
                  <path fill="currentColor" d="M12 8v4l3 3"/>
                </svg>
              </div>
              <h3 className="control-title">Dialer Control</h3>
            </div>
            <DialerControl
              initialSpeed={10}
              initialMinAgents={3}
              onUpdate={handleDialerUpdate}
            />
          </div>
          
          <div className="control-panel">
            <div className="control-header">
              <div className="control-icon data-mix-icon">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                  <rect x="7" y="12" width="2" height="5" fill="currentColor"/>
                  <rect x="11" y="9" width="2" height="8" fill="currentColor"/>
                  <rect x="15" y="7" width="2" height="10" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="control-title">Data Mix</h3>
            </div>
            <DataMixControl
              onUpdate={handleDataMixUpdate}
            />
          </div>

          <div className="control-panel">
            <div className="control-header">
              <div className="control-icon queue-icon">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                </svg>
              </div>
              <h3 className="control-title">Queue Status</h3>
            </div>
            <QueueStatusControl />
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
              <h3 className="chart-title">Call Volume & Success Rate</h3>
              <div className="chart-actions">
                <Button icon={<SettingOutlined />} />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={callVolumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="totalCalls" 
                  name="Total Calls"
                  stroke="#1890ff" 
                  fill="#1890ff" 
                  fillOpacity={0.6} 
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="answeredCalls" 
                  name="Answered Calls"
                  stroke="#52c41a" 
                  fill="#52c41a" 
                  fillOpacity={0.6} 
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="machineDetectionRate" 
                  name="Machine Detection Rate"
                  stroke="#722ed1" 
                  fill="#722ed1" 
                  fillOpacity={0.6} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Real-time Activity</h3>
              <div className="chart-actions">
                <Button icon={<SettingOutlined />} />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={realTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="calls" 
                  name="Total Calls"
                  stroke="#eb2f96" 
                  fill="#eb2f96" 
                  fillOpacity={0.6} 
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="answered" 
                  name="Answered Calls"
                  stroke="#faad14" 
                  fill="#faad14" 
                  fillOpacity={0.6} 
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="transfers" 
                  name="Transfers"
                  stroke="#13c2c2" 
                  fill="#13c2c2" 
                  fillOpacity={0.6} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
