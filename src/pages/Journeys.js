import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Button, 
  Table, 
  Tag, 
  Space, 
  Input, 
  Dropdown, 
  Menu, 
  Modal,
  Card,
  Row,
  Col,
  Statistic,
  Select,
  Tabs,
  message,
  Spin,
  Typography
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  StarOutlined,
  StarFilled,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  BranchesOutlined
} from '@ant-design/icons';
import JourneyBuilderList from '../components/JourneyBuilderList';
import LoadingIcon from '../components/LoadingIcon';
import { 
  getAllJourneys, 
  deleteJourney, 
  updateJourney,
  cloneJourney
} from '../services/journeyService';
import './Journeys.css';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Text } = Typography;

const Journeys = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [error, setError] = useState(null);

  // State for journeys data
  const [journeys, setJourneys] = useState([]);

  // Fetch journeys data from API
  useEffect(() => {
    const fetchJourneys = async () => {
      try {
        setLoading(true);
        const data = await getAllJourneys();
        setJourneys(data);
      } catch (error) {
        console.error('Error fetching journeys:', error);
        message.error('Failed to load journeys');
      } finally {
        setLoading(false);
      }
    };

    fetchJourneys();
  }, []);

  // Check if we're in builder mode
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/journeys/builder') || path.match(/\/journeys\/\d+/)) {
      setActiveTab('builder');
    } else {
      setActiveTab('list');
    }
  }, [location.pathname]);

  const handleCreateJourney = () => {
    navigate('/journeys/builder');
  };

  const handleEditJourney = (id) => {
    navigate(`/journeys/${id}`);
  };

  const handleDeleteJourney = (id) => {
    setSelectedJourney(id);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await deleteJourney(selectedJourney);
      setJourneys(journeys.filter(journey => journey.id !== selectedJourney));
      message.success('Journey deleted successfully');
    } catch (error) {
      console.error('Error deleting journey:', error);
      message.error('Failed to delete journey');
    } finally {
      setDeleteModalVisible(false);
      setSelectedJourney(null);
      setLoading(false);
    }
  };

  const handleDuplicateJourney = async (id) => {
    try {
      setLoading(true);
      const journeyToDuplicate = journeys.find(j => j.id === id);
      if (journeyToDuplicate) {
        const clonedJourney = await cloneJourney(id, `${journeyToDuplicate.name} (Copy)`);
        setJourneys([...journeys, clonedJourney]);
        message.success('Journey cloned successfully');
      }
    } catch (error) {
      console.error('Error cloning journey:', error);
      message.error('Failed to clone journey');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      paused: 'warning',
      draft: 'default'
    };
    return colors[status] || 'default';
  };

  const getTypeIcon = (type) => {
    const icons = {
      Email: 'mail',
      Call: 'phone',
      SMS: 'message'
    };
    return icons[type] || 'appstore';
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Text strong>{text}</Text>
          <Text type="secondary">{record.description}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'ACTIVE' ? 'success' :
          status === 'PAUSED' ? 'warning' :
          status === 'DRAFT' ? 'default' : 'processing'
        }>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditJourney(record.id)}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteJourney(record.id)}
          />
          <Button
            type="text"
            icon={<CopyOutlined />}
            onClick={() => handleDuplicateJourney(record.id)}
          />
        </Space>
      ),
    },
  ];

  const filteredJourneys = journeys.filter(journey => {
    const matchesSearch = journey.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || journey.status === statusFilter;
    const matchesFavorites = !showFavorites || journey.favorite;
    return matchesSearch && matchesStatus && matchesFavorites;
  });

  // Calculate statistics
  const totalJourneys = journeys.length;
  const activeJourneys = journeys.filter(j => j.status === 'active').length;
  const totalContacts = journeys.reduce((sum, j) => sum + (j.active_leads_count || 0), 0);

  // Render the journey list view
  const renderJourneyList = () => {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="content-header">
            <h1 className="page-title">Journeys</h1>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateJourney}
            >
              New Journey
            </Button>
          </div>

          {error && (
            <div className="error-message">
              {error}
              <Button className="error-dismiss" onClick={() => setError(null)}>×</Button>
            </div>
          )}

          <div className="content-body">
            <div className="search-filter-container">
              <div className="search-box">
                <Search
                  placeholder="Search journeys"
                  allowClear
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: 200 }}
                />
              </div>
              <div className="filter-container">
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: 120 }}
                >
                  <Option value="all">All Status</Option>
                  <Option value="active">Active</Option>
                  <Option value="draft">Draft</Option>
                  <Option value="paused">Paused</Option>
                  <Option value="archived">Archived</Option>
                </Select>
              </div>
            </div>

            <div className="stats-summary">
              <div className="stat-card">
                <div className="stat-title">Total Journeys</div>
                <div className="stat-value">{totalJourneys}</div>
                <div className="stat-subtitle">{activeJourneys} active</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Total Contacts</div>
                <div className="stat-value">{totalContacts}</div>
                <div className="stat-subtitle">Across all journeys</div>
              </div>
            </div>

            <Table
              columns={columns}
              dataSource={filteredJourneys}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} journeys`,
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Render the journey builder view
  const renderJourneyBuilder = () => {
    return <JourneyBuilderList />;
  };

  return (
    <LoadingIcon isLoading={loading} text="Loading journeys...">
      {activeTab === 'list' ? renderJourneyList() : renderJourneyBuilder()}
    </LoadingIcon>
  );
};

export default Journeys; 