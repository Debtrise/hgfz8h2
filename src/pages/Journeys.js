import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Select
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
  PauseCircleOutlined
} from '@ant-design/icons';
import './Journeys.css';

const { Search } = Input;
const { Option } = Select;

const Journeys = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState(null);

  // Mock data - replace with actual API calls
  const [journeys, setJourneys] = useState([
    {
      id: '1',
      name: 'Welcome Series',
      type: 'Email',
      status: 'active',
      favorite: true,
      metrics: {
        totalContacts: 1500,
        activeContacts: 1200,
        completionRate: 85
      },
      lastModified: '2024-03-18',
      createdBy: 'John Doe'
    },
    {
      id: '2',
      name: 'Sales Follow-up',
      type: 'Call',
      status: 'paused',
      favorite: false,
      metrics: {
        totalContacts: 800,
        activeContacts: 600,
        completionRate: 75
      },
      lastModified: '2024-03-17',
      createdBy: 'Jane Smith'
    },
    {
      id: '3',
      name: 'SMS Campaign',
      type: 'SMS',
      status: 'draft',
      favorite: true,
      metrics: {
        totalContacts: 2000,
        activeContacts: 0,
        completionRate: 0
      },
      lastModified: '2024-03-16',
      createdBy: 'Mike Johnson'
    }
  ]);

  const handleCreateJourney = () => {
    navigate('/journeys/builder');
  };

  const handleEditJourney = (id) => {
    navigate(`/journeys/builder/${id}`);
  };

  const handleDeleteJourney = (id) => {
    setSelectedJourney(id);
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    setJourneys(journeys.filter(journey => journey.id !== selectedJourney));
    setDeleteModalVisible(false);
    setSelectedJourney(null);
  };

  const handleDuplicateJourney = (id) => {
    const journeyToDuplicate = journeys.find(j => j.id === id);
    if (journeyToDuplicate) {
      const newJourney = {
        ...journeyToDuplicate,
        id: `${id}-copy-${Date.now()}`,
        name: `${journeyToDuplicate.name} (Copy)`,
        status: 'draft'
      };
      setJourneys([...journeys, newJourney]);
    }
  };

  const toggleFavorite = (id) => {
    setJourneys(journeys.map(journey =>
      journey.id === id
        ? { ...journey, favorite: !journey.favorite }
        : journey
    ));
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
          <span>{record.metrics.activeContacts} / {record.metrics.totalContacts}</span>
          <span style={{ color: '#8c8c8c' }}>
            {record.metrics.completionRate}% completion
          </span>
        </Space>
      )
    },
    {
      title: 'Last Modified',
      dataIndex: 'lastModified',
      key: 'lastModified',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy'
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

  return (
    <div className="journeys-page">
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
                value={journeys.length}
                suffix={`${journeys.filter(j => j.favorite).length} favorited`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Active Contacts"
                value={journeys.reduce((sum, j) => sum + j.metrics.activeContacts, 0)}
                suffix="Across all journeys"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Average Completion"
                value={Math.round(
                  journeys.reduce((sum, j) => sum + j.metrics.completionRate, 0) / journeys.length
                )}
                suffix="%"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Active Journeys"
                value={journeys.filter(j => j.status === 'active').length}
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
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true
          }}
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
    </div>
  );
};

export default Journeys; 