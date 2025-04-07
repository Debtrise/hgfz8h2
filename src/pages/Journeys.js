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
  Spin
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

const Journeys = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

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
        // Create a copy of the journey with a new name
        const newJourney = {
          ...journeyToDuplicate,
          name: `${journeyToDuplicate.name} (Copy)`,
          status: 'draft'
        };
        
        // Remove the id so it will be treated as a new journey
        delete newJourney.id;
        
        // Create the new journey
        const createdJourney = await createJourney(newJourney);
        
        // Add the new journey to the list
        setJourneys([...journeys, createdJourney]);
        message.success('Journey duplicated successfully');
      }
    } catch (error) {
      console.error('Error duplicating journey:', error);
      message.error('Failed to duplicate journey');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (id) => {
    try {
      setLoading(true);
      const journey = journeys.find(j => j.id === id);
      if (journey) {
        // Update the journey with the new favorite status
        const updatedJourney = await updateJourney(id, {
          ...journey,
          favorite: !journey.favorite
        });
        
        // Update the journey in the list
        setJourneys(journeys.map(j =>
          j.id === id ? updatedJourney : j
        ));
        
        message.success(`Journey ${journey.favorite ? 'removed from' : 'added to'} favorites`);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      message.error('Failed to update favorite status');
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
      title: 'Journey Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Button
            type="text"
            icon={record.favorite ? <StarFilled /> : <StarOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(record.id);
            }}
          />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag icon={getTypeIcon(type)}>{type}</Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      )
    },
    {
      title: 'Contacts',
      key: 'contacts',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <span>{record.active_leads_count || 0} / {record.step_count || 0}</span>
          <span style={{ color: '#8c8c8c' }}>
            {record.step_count ? Math.round((record.active_leads_count / record.step_count) * 100) : 0}% completion
          </span>
        </Space>
      )
    },
    {
      title: 'Last Modified',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
    },
    {
      title: 'Created By',
      dataIndex: 'created_by_name',
      key: 'created_by_name'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="edit"
                icon={<EditOutlined />}
                onClick={() => handleEditJourney(record.id)}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                key="duplicate"
                icon={<CopyOutlined />}
                onClick={() => handleDuplicateJourney(record.id)}
              >
                Duplicate
              </Menu.Item>
              <Menu.Item
                key="delete"
                icon={<DeleteOutlined />}
                danger
                onClick={() => handleDeleteJourney(record.id)}
              >
                Delete
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  const filteredJourneys = journeys.filter(journey => {
    const matchesSearch = journey.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || journey.status === statusFilter;
    const matchesType = typeFilter === 'all' || journey.type === typeFilter;
    const matchesFavorites = !showFavorites || journey.favorite;
    return matchesSearch && matchesStatus && matchesType && matchesFavorites;
  });

  // Calculate statistics
  const totalJourneys = journeys.length;
  const activeJourneys = journeys.filter(j => j.status === 'active').length;
  const totalContacts = journeys.reduce((sum, j) => sum + (j.active_leads_count || 0), 0);
  const averageCompletion = journeys.length > 0 
    ? Math.round(journeys.reduce((sum, j) => sum + (j.step_count ? (j.active_leads_count / j.step_count) * 100 : 0), 0) / journeys.length)
    : 0;

  // Render the journey list view
  const renderJourneyList = () => {
    return (
      <>
        <div className="journeys-header">
          <div className="header-left">
            <h1>Journeys</h1>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateJourney}
            >
              Create Journey
            </Button>
          </div>
          <div className="header-right">
            <Space>
              <Search
                placeholder="Search journeys..."
                allowClear
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: 200 }}
              />
              <Select
                defaultValue="all"
                style={{ width: 120 }}
                onChange={setStatusFilter}
              >
                <Option value="all">All Status</Option>
                <Option value="active">Active</Option>
                <Option value="paused">Paused</Option>
                <Option value="draft">Draft</Option>
              </Select>
              <Select
                defaultValue="all"
                style={{ width: 120 }}
                onChange={setTypeFilter}
              >
                <Option value="all">All Types</Option>
                <Option value="Email">Email</Option>
                <Option value="Call">Call</Option>
                <Option value="SMS">SMS</Option>
              </Select>
              <Button
                icon={showFavorites ? <StarFilled /> : <StarOutlined />}
                onClick={() => setShowFavorites(!showFavorites)}
              >
                Favorites
              </Button>
            </Space>
          </div>
        </div>

        <div className="journeys-stats">
          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Journeys"
                  value={totalJourneys}
                  suffix={`${journeys.filter(j => j.favorite).length} favorited`}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Active Contacts"
                  value={totalContacts}
                  suffix="Across all journeys"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Average Completion"
                  value={averageCompletion}
                  suffix="%"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Active Journeys"
                  value={activeJourneys}
                  suffix="Currently running"
                />
              </Card>
            </Col>
          </Row>
        </div>

        <div className="journeys-table-container">
          <Table
            columns={columns}
            dataSource={filteredJourneys}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true
            }}
            onRow={(record) => ({
              onClick: () => handleEditJourney(record.id)
            })}
          />
        </div>

        <Modal
          title="Delete Journey"
          open={deleteModalVisible}
          onOk={confirmDelete}
          onCancel={() => {
            setDeleteModalVisible(false);
            setSelectedJourney(null);
          }}
        >
          <p>Are you sure you want to delete this journey? This action cannot be undone.</p>
        </Modal>
      </>
    );
  };

  // Render the journey builder view
  const renderJourneyBuilder = () => {
    return <JourneyBuilderList />;
  };

  return (
    <div className="journeys-page">
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className="journeys-tabs"
      >
        <TabPane 
          tab={
            <span>
              <BranchesOutlined />
              Journeys
            </span>
          } 
          key="list"
        >
          {renderJourneyList()}
        </TabPane>
        <TabPane 
          tab={
            <span>
              <EditOutlined />
              Journey Builder
            </span>
          } 
          key="builder"
        >
          {renderJourneyBuilder()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Journeys; 