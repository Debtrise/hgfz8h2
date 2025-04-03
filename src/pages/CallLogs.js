// src/pages/CallLogs.js
import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Input,
  Select,
  DatePicker,
  Space,
  Button,
  Tag,
  Tooltip,
  Modal,
  Typography,
  Row,
  Col,
  Statistic,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  UserOutlined,
  AudioOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  RobotOutlined,
  SwapOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { callAnalyticsService } from '../services/callAnalyticsService';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

const CallLogs = () => {
  const [loading, setLoading] = useState(false);
  const [calls, setCalls] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: [moment().startOf('day'), moment().endOf('day')],
    status: 'all',
    search: '',
  });
  const [selectedCall, setSelectedCall] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [statistics, setStatistics] = useState({
    totalCalls: 0,
    answeredCalls: 0,
    successRate: 0,
    deadAirRate: 0,
    machineDetectionRate: 0,
    callsOver5min: 0,
  });

  useEffect(() => {
    fetchCalls();
  }, [filters]);

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: filters.dateRange[0].format('YYYY-MM-DD'),
        endDate: filters.dateRange[1].format('YYYY-MM-DD'),
        status: filters.status !== 'all' ? filters.status : undefined,
        search: filters.search || undefined,
      };

      const [callsResponse, hourlyResponse] = await Promise.all([
        callAnalyticsService.getAllCalls(params),
        callAnalyticsService.getHourlyData()
      ]);

      setCalls(callsResponse.data);
      
      // Get the total row from hourly data
      const totalRow = hourlyResponse.find(h => h.hour_of_day_pdt === 'Total');
      
      if (totalRow) {
        setStatistics({
          totalCalls: totalRow.total_outbound_attempts,
          answeredCalls: totalRow.answered_calls,
          successRate: totalRow.total_transfers > 0 
            ? Math.floor((totalRow.successful_transfers / totalRow.total_transfers) * 100) 
            : 0,
          deadAirRate: Math.round(totalRow.dead_air_pct),
          machineDetectionRate: Math.round(totalRow.machine_detection_rate_pct),
          callsOver5min: totalRow.calls_over_5min,
        });
      }

    } catch (error) {
      console.error('Error fetching calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (value, type) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const columns = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      sorter: (a, b) => moment(a.timestamp).unix() - moment(b.timestamp).unix(),
      render: (text) => moment(text).format('MM/DD/YYYY HH:mm:ss'),
    },
    {
      title: 'Phone Number',
      dataIndex: 'phone_number',
      sorter: (a, b) => a.phone_number.localeCompare(b.phone_number),
      render: (text) => (
        <Space>
          <PhoneOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (text) => {
        const statusColors = {
          ANSWERED: 'success',
          NO_ANSWER: 'error',
          BUSY: 'warning',
          FAILED: 'error',
          COMPLETED: 'success',
        };
        return (
          <Badge status={statusColors[text] || 'default'} text={text} />
        );
      },
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      sorter: (a, b) => a.duration - b.duration,
      render: (text) => (
        <Space>
          <ClockCircleOutlined />
          {Math.floor(text / 60)}:{(text % 60).toString().padStart(2, '0')}
        </Space>
      ),
    },
    {
      title: 'Transfer Status',
      dataIndex: 'transfer_status',
      render: (text) => {
        if (!text) return '-';
        return (
          <Tag color={text === 'SUCCESS' ? 'success' : 'error'}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: 'Machine Detected',
      dataIndex: 'machine_detected',
      render: (text) => (
        <Tag color={text ? 'error' : 'success'}>
          {text ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      title: 'Dead Air',
      dataIndex: 'dead_air_detected',
      render: (text) => (
        <Tag color={text ? 'error' : 'success'}>
          {text ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="link"
          icon={<InfoCircleOutlined />}
          onClick={() => {
            setSelectedCall(record);
            setModalVisible(true);
          }}
        >
          Details
        </Button>
      ),
    },
  ];

  const renderCallDetails = () => {
    if (!selectedCall) return null;

    return (
      <Modal
        title="Call Details"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card size="small" title="Basic Information">
              <p><strong>Time:</strong> {moment(selectedCall.timestamp).format('MM/DD/YYYY HH:mm:ss')}</p>
              <p><strong>Phone Number:</strong> {selectedCall.phone_number}</p>
              <p><strong>Status:</strong> {selectedCall.status}</p>
              <p><strong>Duration:</strong> {Math.floor(selectedCall.duration / 60)}:{(selectedCall.duration % 60).toString().padStart(2, '0')}</p>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="Call Quality">
              <p><strong>Transfer Status:</strong> {selectedCall.transfer_status || 'N/A'}</p>
              <p><strong>Machine Detected:</strong> {selectedCall.machine_detected ? 'Yes' : 'No'}</p>
              <p><strong>Dead Air Detected:</strong> {selectedCall.dead_air_detected ? 'Yes' : 'No'}</p>
              <p><strong>Recording URL:</strong> {selectedCall.recording_url ? 'Available' : 'Not Available'}</p>
            </Card>
          </Col>
        </Row>
      </Modal>
    );
  };

  return (
    <div className="call-logs-page">
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="Total Calls"
              value={statistics.totalCalls}
              prefix={<PhoneOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Answered Calls"
              value={statistics.answeredCalls}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Transfer Success Rate"
              value={statistics.successRate}
              suffix="%"
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Dead Air Rate"
              value={statistics.deadAirRate}
              suffix="%"
              prefix={<SwapOutlined />}
              valueStyle={{ color: statistics.deadAirRate > 10 ? '#ff4d4f' : statistics.deadAirRate > 5 ? '#faad14' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Machine Detection"
              value={statistics.machineDetectionRate}
              suffix="%"
              prefix={<RobotOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Calls > 5min"
              value={statistics.callsOver5min}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space style={{ marginBottom: 16 }}>
          <RangePicker
            value={filters.dateRange}
            onChange={(dates) => handleFilterChange(dates, 'dateRange')}
          />
          <Select
            style={{ width: 120 }}
            value={filters.status}
            onChange={(value) => handleFilterChange(value, 'status')}
          >
            <Option value="all">All Status</Option>
            <Option value="ANSWERED">Answered</Option>
            <Option value="NO_ANSWER">No Answer</Option>
            <Option value="BUSY">Busy</Option>
            <Option value="FAILED">Failed</Option>
            <Option value="COMPLETED">Completed</Option>
          </Select>
          <Input
            placeholder="Search phone number"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            value={filters.search}
            onChange={(e) => handleFilterChange(e.target.value, 'search')}
          />
          <Button type="primary" onClick={fetchCalls}>
            Refresh
          </Button>
        </Space>
      </Card>

      {/* Calls Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={calls}
          loading={loading}
          rowKey="uniqueid"
          pagination={{
            total: calls.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      {/* Call Details Modal */}
      {renderCallDetails()}
    </div>
  );
};

export default CallLogs;
