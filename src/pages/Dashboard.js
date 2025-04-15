import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { Button, Select, DatePicker, message, Spin } from 'antd';
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
import ActiveCampaigns from "./ActiveCampaigns";
import QueueStatusControl from "./QueueStatusControl";
import { callAnalyticsService } from '../services/callAnalyticsService';

const { RangePicker } = DatePicker;
const { Option } = Select;

// API endpoints
const API_BASE_URL = 'http://35.208.29.228:4000';
const DIALER_API_URL = 'https://dialer-api-154842307047.us-west2.run.app';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [agentStatusLoading, setAgentStatusLoading] = useState(true);
  const [queueLoading, setQueueLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [timeRange, setTimeRange] = useState('today');
  const [dateRange, setDateRange] = useState([moment().startOf('day'), moment().endOf('day')]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    hourlyData: null,
    dateRangeData: null,
    availableAgents: { current: 0, total: 0 },
    leadsInQueue: 0,
    totalDials: 0,
    connectionRate: 0,
    dncs: 0,
    smsSent: 0,
    smsReplies: 0,
    emailsSent: 0,
    bounceRate: 0,
    emailReplies: 0,
    totalTransfers: 0,
  });

  useEffect(() => {
    // Add fullscreen dashboard class to body when component mounts
    document.body.classList.add('dashboard-page');
    
    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('dashboard-page');
    };
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchQueueData();
    fetchTransferData();
    // Set up polling for real-time data every 5 minutes
    const interval = setInterval(fetchRealTimeData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [timeRange, dateRange]);

  // Separate effect for agent status updates every second
  useEffect(() => {
    // Initial fetch with loading indicator
    setAgentStatusLoading(true);
    fetchAgentStatus(true);
    
    // Set up interval to fetch every second without loading indicator
    const agentStatusInterval = setInterval(() => fetchAgentStatus(false), 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(agentStatusInterval);
  }, []);

  // Separate effect for queue updates every 3 seconds
  useEffect(() => {
    // Initial fetch with loading indicator
    setQueueLoading(true);
    fetchQueueData(true);
    
    // Set up interval to fetch every 3 seconds without loading indicator
    const queueInterval = setInterval(() => fetchQueueData(false), 3000);
    
    // Clean up interval on component unmount
    return () => clearInterval(queueInterval);
  }, []);

  const fetchAgentStatus = async (showLoading = false) => {
    if (showLoading) {
      setAgentStatusLoading(true);
    }
    
    try {
      const agentStatusResponse = await fetch(`${DIALER_API_URL}/getAgentStatus`);
      if (agentStatusResponse.ok) {
        const agentStatus = await agentStatusResponse.json();
        // Handle the new response format with agents_waiting and agents_logged_in
        if (agentStatus) {
          const availableAgents = agentStatus.agents_waiting || 0;
          const totalAgents = agentStatus.agents_logged_in || 0;
          setDashboardData(prev => ({
            ...prev,
            availableAgents: { current: availableAgents, total: totalAgents }
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching agent status:', error);
    } finally {
      if (showLoading) {
        setAgentStatusLoading(false);
      }
    }
  };

  const fetchQueueData = async (showLoading = false) => {
    if (showLoading) {
      setQueueLoading(true);
    }
    
    try {
      const queueCountsResponse = await fetch(`${DIALER_API_URL}/getDialerQueueCounts`);
      if (queueCountsResponse.ok) {
        const queueCounts = await queueCountsResponse.json();
        if (queueCounts) {
          setDashboardData(prev => ({
            ...prev,
            leadsInQueue: queueCounts.totalCount || 0
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching queue counts:', error);
    } finally {
      if (showLoading) {
        setQueueLoading(false);
      }
    }
  };

  const fetchTransferData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats/transfers`);
      if (response.ok) {
        const result = await response.json();
        setDashboardData(prev => ({
          ...prev,
          totalTransfers: result.data?.totalTransfers || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching transfer data:', error);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setStatsLoading(true);
    setChartsLoading(true);
    try {
      let data;
      if (timeRange === 'custom') {
        // Use direct API call for date range data
        const response = await fetch(`${API_BASE_URL}/api/calls/range?startDate=${dateRange[0].format('YYYY-MM-DD')}&endDate=${dateRange[1].format('YYYY-MM-DD')}`);
        if (response.ok) {
          const result = await response.json();
          data = result.data || [];
          setDashboardData(prev => ({
            ...prev,
            dateRangeData: data
          }));
        }
      } else {
        // Use the same range endpoint with today's date for both start and end
        const today = moment().format('YYYY-MM-DD');
        const response = await fetch(`${API_BASE_URL}/api/calls/range?startDate=${today}&endDate=${today}`);
        if (response.ok) {
          const result = await response.json();
          data = result.data || [];
          // Ensure data is an array before setting it
          const hourlyData = Array.isArray(data) ? data : [];
          const totalRow = hourlyData.find(h => h.hour_of_day_pdt === 'Total');
          setDashboardData(prev => ({
            ...prev,
            hourlyData,
            totalTransfers: totalRow?.total_transfers || 0
          }));
        }
      }
      
      // Fetch today's summary for total calls from main API
      try {
        const todaySummaryResponse = await fetch(`${API_BASE_URL}/api/stats/today`);
        if (todaySummaryResponse.ok) {
          const todaySummary = await todaySummaryResponse.json();
          if (todaySummary && todaySummary.data) {
            setDashboardData(prev => ({
              ...prev,
              totalDials: todaySummary.data.totalCalls || 0
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching today summary:', error);
      }
    } catch (error) {
      message.error('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', error);
      // Set empty array for hourlyData on error
      setDashboardData(prev => ({
        ...prev,
        hourlyData: []
      }));
    } finally {
      setLoading(false);
      setStatsLoading(false);
      setChartsLoading(false);
    }
  };

  const fetchRealTimeData = async () => {
    try {
      // Check health using the main API
      const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
      if (!healthResponse.ok) {
        console.warn('API health check failed');
        return;
      }
      await fetchDashboardData();
      await fetchQueueData();
      await fetchTransferData();
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    document.querySelector('.sidebar').classList.toggle('collapsed');
    document.querySelector('.main-content').classList.toggle('sidebar-collapsed');
    document.querySelector('.dashboard-container').classList.toggle('sidebar-collapsed');
  };

  // Stats cards data with real data from API
  const stats = [
    {
      title: 'Total Calls',
      value: Array.isArray(dashboardData.hourlyData) && dashboardData.hourlyData.length > 0
        ? dashboardData.hourlyData.find(h => h.hour_of_day_pdt === 'Total')?.total_outbound_attempts || dashboardData.totalDials || '0'
        : dashboardData.totalDials || '0',
      icon: <PhoneOutlined />,
      trend: 'Today',
      trendUp: true,
      type: 'primary',
      loading: statsLoading
    },
    {
      title: 'Answered Calls',
      value: Array.isArray(dashboardData.hourlyData) && dashboardData.hourlyData.length > 0
        ? dashboardData.hourlyData.find(h => h.hour_of_day_pdt === 'Total')?.answered_calls || '0'
        : '0',
      icon: <UserOutlined />,
      trend: 'Today',
      trendUp: true,
      type: 'success',
      loading: statsLoading
    },
    {
      title: 'Total Transfers',
      value: dashboardData.totalTransfers || '0',
      icon: <TeamOutlined />,
      trend: 'Today',
      trendUp: true,
      type: 'warning',
      loading: statsLoading
    },
    {
      title: 'Agent Availability',
      value: `${dashboardData.availableAgents.current}/${dashboardData.availableAgents.total}`,
      icon: <TeamOutlined />,
      trend: 'Today',
      trendUp: true,
      type: 'success',
      loading: agentStatusLoading
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
          agentAvailability: hour.agent_availability || 0,
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
          agentAvailability: hour.agent_availability || 0,
          freshDialer: hour.freshdialer_calls,
          p1Dialer: hour.p1dialer_calls
        }))
    : [];

  // Handle dialer settings update
  const handleDialerUpdate = async (settings) => {
    try {
      const response = await fetch(`${DIALER_API_URL}/updateDialerControl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          speed: settings.speed,
          min_agent_availability: settings.minAgents
        })
      });
      
      if (response.ok) {
        message.success('Dialer settings updated successfully');
      } else {
        throw new Error('Failed to update dialer settings');
      }
    } catch (error) {
      console.error('Error updating dialer settings:', error);
      message.error('Failed to update dialer settings');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
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
              onClick={() => {
                fetchDashboardData();
                fetchQueueData();
              }}
              loading={loading}
              size="middle"
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
              <div className="control-icon campaigns-icon">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                  <path fill="currentColor" d="M7 12h2v5H7zm4-7h2v12h-2zm4 2h2v10h-2z"/>
                </svg>
              </div>
              <h3 className="control-title">Active Campaigns</h3>
            </div>
            <ActiveCampaigns />
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
            <Spin spinning={queueLoading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
              <QueueStatusControl />
            </Spin>
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
              <Spin spinning={stat.loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
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

        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Call Volume & Success Rate</h3>
              <div className="chart-actions">
                <Button icon={<SettingOutlined />} size="small" />
              </div>
            </div>
            <Spin spinning={chartsLoading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
              <ResponsiveContainer width="100%" height={280}>
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
            </Spin>
          </div>
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Real-time Activity</h3>
              <div className="chart-actions">
                <Button icon={<SettingOutlined />} size="small" />
              </div>
            </div>
            <Spin spinning={chartsLoading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
              <ResponsiveContainer width="100%" height={280}>
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
                    dataKey="agentAvailability" 
                    name="Agent Availability"
                    stroke="#13c2c2" 
                    fill="#13c2c2" 
                    fillOpacity={0.6} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Spin>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
