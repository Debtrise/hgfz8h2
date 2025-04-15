import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Tag,
  Tabs,
  Tooltip,
  message,
  Badge,
  Row,
  Col,
  Popconfirm,
  Drawer,
  List,
  Typography,
  Statistic,
  Divider,
  InputNumber,
  Empty
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  SyncOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  UsergroupAddOutlined
} from '@ant-design/icons';
import AgentService from '../../services/AgentService';
import RingGroupService from '../../services/RingGroupService';
import AsteriskService from '../../services/AsteriskService';

const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const AgentAssignmentManagement = () => {
  const [agents, setAgents] = useState([]);
  const [ringGroups, setRingGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentStats, setAgentStats] = useState(null);
  const [form] = Form.useForm();
  const [ringGroupAssignments, setRingGroupAssignments] = useState({});
  const [extensionStatus, setExtensionStatus] = useState({});
  const [batchAssignModalVisible, setBatchAssignModalVisible] = useState(false);
  const [batchAssignForm] = Form.useForm();
  const [activeTabKey, setActiveTabKey] = useState("1");

  // New state variables for ring group management
  const [ringGroupModalVisible, setRingGroupModalVisible] = useState(false);
  const [currentRingGroup, setCurrentRingGroup] = useState(null);
  const [ringGroupForm] = Form.useForm();
  const [ringGroupDrawerVisible, setRingGroupDrawerVisible] = useState(false);
  const [selectedRingGroup, setSelectedRingGroup] = useState(null);

  useEffect(() => {
    fetchAgents();
    fetchRingGroups();
  }, []);

  // Fetch agents
  const fetchAgents = async () => {
    try {
      setLoading(true);
      const data = await AgentService.getAllAgents();
      setAgents(Array.isArray(data) ? data : []);
      
      // Get extension status for each agent
      if (Array.isArray(data) && data.length > 0) {
        const statusPromises = data.map(agent => 
          agent.agent_extension ? 
            AsteriskService.getExtensionStatus(agent.agent_extension)
              .then(status => ({ extension: agent.agent_extension, status }))
              .catch(() => ({ extension: agent.agent_extension, status: 'unknown' }))
          : Promise.resolve({ extension: null, status: 'not-configured' })
        );
        
        const statuses = await Promise.all(statusPromises);
        const statusMap = {};
        statuses.forEach(item => {
          if (item.extension) {
            statusMap[item.extension] = item.status;
          }
        });
        
        setExtensionStatus(statusMap);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      message.error('Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  // Fetch ring groups
  const fetchRingGroups = async () => {
    try {
      setLoading(true);
      const data = await RingGroupService.getAllRingGroups();
      setRingGroups(Array.isArray(data) ? data : []);
      
      // Get agent assignments for each ring group
      if (Array.isArray(data) && data.length > 0) {
        const assignments = {};
        
        for (const group of data) {
          try {
            const groupDetail = await RingGroupService.getRingGroupById(group.grpnum);
            
            // Parse extension list using the format from the API
            let extensions = [];
            if (groupDetail.extension_list) {
              extensions = groupDetail.extension_list
                .split('-')
                .map(ext => {
                  // Extract extension from format: LOCAL/1001@from-internal/n
                  const match = ext.match(/LOCAL\/(\d+)@from-internal/);
                  return match ? match[1] : null;
                })
                .filter(Boolean); // Remove null values
            }
            
            assignments[group.grpnum] = extensions;
          } catch (err) {
            console.error(`Error fetching details for group ${group.grpnum}:`, err);
          }
        }
        
        setRingGroupAssignments(assignments);
      }
    } catch (error) {
      console.error('Error fetching ring groups:', error);
      message.error('Failed to fetch ring groups');
    } finally {
      setLoading(false);
    }
  };

  // Get agent details including stats
  const getAgentDetails = async (agentId) => {
    try {
      const [agent, stats] = await Promise.all([
        AgentService.getAgentById(agentId),
        AgentService.getAgentStats(agentId),
      ]);
      
      setSelectedAgent(agent);
      setAgentStats(stats);
      setDrawerVisible(true);
    } catch (error) {
      console.error('Error fetching agent details:', error);
      message.error('Failed to fetch agent details');
    }
  };

  // Sync agent with FreePBX
  const handleSyncAsterisk = async (agentId) => {
    try {
      setLoading(true);
      await AgentService.syncAgentWithAsterisk(agentId);
      message.success('Agent synchronized with FreePBX successfully');
      fetchAgents(); // Refresh data
    } catch (error) {
      console.error('Error syncing with FreePBX:', error);
      message.error('Failed to sync agent with FreePBX');
    } finally {
      setLoading(false);
    }
  };

  // Delete agent
  const handleDeleteAgent = async (agentId) => {
    try {
      await AgentService.deleteAgent(agentId);
      message.success('Agent deleted successfully');
      fetchAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      message.error('Failed to delete agent');
    }
  };

  // Update agent status
  const handleUpdateStatus = async (agentId, statusData) => {
    try {
      await AgentService.updateAgentStatus(agentId, statusData);
      message.success('Agent status updated successfully');
      fetchAgents();
    } catch (error) {
      console.error('Error updating agent status:', error);
      message.error('Failed to update agent status');
    }
  };

  // Toggle agent availability
  const toggleAvailability = async (agent) => {
    try {
      const newStatus = !agent.available_for_calls;
      await AgentService.updateAgentStatus(agent.id, {
        agent_status: agent.agent_status,
        available_for_calls: newStatus
      });
      
      // Update agent in local state
      setAgents(agents.map(a => 
        a.id === agent.id ? {...a, available_for_calls: newStatus} : a
      ));
      
      message.success(`Agent is now ${newStatus ? 'available' : 'unavailable'} for calls`);
    } catch (error) {
      console.error('Error toggling availability:', error);
      message.error('Failed to update agent availability');
    }
  };

  // Edit agent info
  const handleEditAgent = (agent) => {
    setCurrentAgent(agent);
    form.setFieldsValue({
      email: agent.email,
      first_name: agent.first_name,
      last_name: agent.last_name,
      agent_extension: agent.agent_extension,
      max_concurrent_calls: agent.max_concurrent_calls,
    });
    setModalVisible(true);
  };

  // Submit agent form
  const handleSubmitAgentForm = async (values) => {
    try {
      if (currentAgent) {
        await AgentService.updateAgent(currentAgent.id, values);
        message.success('Agent updated successfully');
      } else {
        await AgentService.createAgent(values);
        message.success('Agent created successfully');
      }
      
      setModalVisible(false);
      form.resetFields();
      setCurrentAgent(null);
      fetchAgents();
    } catch (error) {
      console.error('Error saving agent:', error);
      message.error('Failed to save agent');
    }
  };

  // Handle batch assign agents to ring group
  const handleBatchAssign = async (values) => {
    try {
      const { ringGroup, agents: selectedAgents } = values;
      
      // First get current agents in the ring group
      const group = await RingGroupService.getRingGroupById(ringGroup);
      let currentExtensions = [];
      
      if (group.extension_list) {
        currentExtensions = group.extension_list.split('-')
          .map(ext => ext.match(/LOCAL\/(\d+)@/))
          .filter(match => match)
          .map(match => match[1]);
      }
      
      // Get extensions to add
      const extensionsToAdd = [];
      for (const agentId of selectedAgents) {
        const agent = agents.find(a => a.id === agentId);
        if (agent && agent.agent_extension && !currentExtensions.includes(agent.agent_extension)) {
          extensionsToAdd.push(agent.agent_extension);
        }
      }
      
      // Add extensions to ring group
      for (const extension of extensionsToAdd) {
        await RingGroupService.addExtensionToRingGroup(ringGroup, extension);
      }
      
      message.success(`Added ${extensionsToAdd.length} agents to ring group ${ringGroup}`);
      setBatchAssignModalVisible(false);
      batchAssignForm.resetFields();
      fetchRingGroups(); // Refresh data
    } catch (error) {
      console.error('Error assigning agents to ring group:', error);
      message.error('Failed to assign agents to ring group');
    }
  };

  // Get groups that an agent is assigned to
  const getAgentGroups = (agentExtension) => {
    if (!agentExtension) return [];
    
    return Object.entries(ringGroupAssignments)
      .filter(([_, extensions]) => extensions.includes(agentExtension))
      .map(([groupId]) => {
        const group = ringGroups.find(g => g.grpnum === groupId);
        return group ? {
          id: groupId,
          name: group.description || `Group ${groupId}`
        } : null;
      })
      .filter(Boolean);
  };

  // Columns for agent table
  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => `${record.first_name || ''} ${record.last_name || ''}`.trim() || 'N/A',
      sorter: (a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => email || 'N/A',
    },
    {
      title: 'Extension',
      dataIndex: 'agent_extension',
      key: 'agent_extension',
      render: (ext) => {
        if (!ext) return <Tag color="default">Not Set</Tag>;
        
        const status = extensionStatus[ext] || 'unknown';
        let statusColor = 'default';
        let statusText = 'Unknown';
        
        switch(status) {
          case 'online':
            statusColor = 'success';
            statusText = 'Online';
            break;
          case 'offline':
            statusColor = 'default';
            statusText = 'Offline';
            break;
          case 'unavailable':
            statusColor = 'warning';
            statusText = 'Unavailable';
            break;
          case 'busy':
            statusColor = 'error';
            statusText = 'Busy';
            break;
          default:
            statusColor = 'default';
            statusText = 'Unknown';
        }
        
        return (
          <Space>
            <span>{ext}</span>
            <Badge status={statusColor} text={statusText} />
          </Space>
        );
      },
    },
    {
      title: 'Ring Groups',
      key: 'ringGroups',
      render: (_, record) => {
        const groups = getAgentGroups(record.agent_extension);
        return groups.length > 0 ? (
          <Space wrap>
            {groups.map(group => (
              <Tag color="blue" key={group.id}>
                {group.name}
              </Tag>
            ))}
          </Space>
        ) : (
          <Tag color="default">None</Tag>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.agent_status === 'online' ? 'success' : 'default'}>
          {(record.agent_status || 'offline').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Available',
      key: 'available',
      render: (_, record) => (
        <Switch
          checked={record.available_for_calls}
          onChange={() => toggleAvailability(record)}
          checkedChildren={<CheckCircleOutlined />}
          unCheckedChildren={<CloseCircleOutlined />}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="default"
              icon={<InfoCircleOutlined />}
              size="small"
              onClick={() => getAgentDetails(record.id)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditAgent(record)}
            />
          </Tooltip>
          <Tooltip title="Sync with FreePBX">
            <Button
              type="default"
              icon={<SyncOutlined />}
              size="small"
              onClick={() => handleSyncAsterisk(record.id)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this agent?"
            description="This action cannot be undone"
            onConfirm={() => handleDeleteAgent(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // CREATE RING GROUP FUNCTIONS
  const handleCreateRingGroup = () => {
    setCurrentRingGroup(null);
    ringGroupForm.resetFields();
    setRingGroupModalVisible(true);
  };

  const handleEditRingGroup = (ringGroup) => {
    setCurrentRingGroup(ringGroup);
    
    // Get the current extensions for this ring group
    const currentExtensions = ringGroupAssignments[ringGroup.grpnum] || [];
    
    ringGroupForm.setFieldsValue({
      description: ringGroup.description,
      groupNumber: ringGroup.grpnum,
      strategy: ringGroup.strategy || 'ringall',
      ringTime: ringGroup.grptime || 20,
      grppre: ringGroup.grppre || '',
      extensions: currentExtensions, // Set the current extensions
    });
    setRingGroupModalVisible(true);
  };

  const handleRingGroupSubmit = async (values) => {
    try {
      // Format extensions as needed by the API
      const formattedExtensions = values.extensions?.map(ext => 
        `LOCAL/${ext}@from-internal/n`
      ) || [];

      const formattedData = {
        groupNumber: values.groupNumber,
        description: values.description,
        strategy: values.strategy || 'ringall',
        ringTime: values.ringTime || 20,
        ...(values.grppre && { grppre: values.grppre }),
      };

      // Add the extensions in the format expected by the API
      if (formattedExtensions.length > 0) {
        formattedData.extension_list = formattedExtensions.join('-');
      }

      console.log('Submitting ring group with data:', formattedData);

      if (currentRingGroup) {
        // Update existing ring group
        await RingGroupService.updateRingGroup(currentRingGroup.grpnum, formattedData);
        message.success('Ring group updated successfully');
      } else {
        // Create new ring group
        await RingGroupService.createRingGroup(formattedData);
        message.success('Ring group created successfully');
      }
      setRingGroupModalVisible(false);
      fetchRingGroups();
    } catch (error) {
      console.error('Error saving ring group:', error.response?.data || error);
      message.error('Failed to save ring group: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteRingGroup = async (grpnum) => {
    try {
      await RingGroupService.deleteRingGroup(grpnum);
      message.success('Ring group deleted successfully');
      fetchRingGroups();
    } catch (error) {
      console.error('Error deleting ring group:', error);
      message.error('Failed to delete ring group');
    }
  };

  const viewRingGroupDetails = async (ringGroup) => {
    try {
      const groupDetail = await RingGroupService.getRingGroupById(ringGroup.grpnum);
      setSelectedRingGroup({
        ...ringGroup,
        ...groupDetail
      });
      setRingGroupDrawerVisible(true);
    } catch (error) {
      console.error('Error fetching ring group details:', error);
      message.error('Failed to fetch ring group details');
    }
  };

  // Create ring group with extensions directly (handles the format from the user's JSON)
  const createRingGroupWithExtensions = async (data) => {
    try {
      // Format extensions in the way API expects
      const formattedExtensions = data.extensions?.map(ext => 
        `LOCAL/${ext}@from-internal/n`
      ) || [];

      // Format the data according to the expected API structure
      const formattedData = {
        groupNumber: data.groupNumber,
        description: data.description,
        strategy: data.strategy || 'ringall',
        ringTime: data.ringTime || 20
      };

      // Add formatted extension_list if we have extensions
      if (formattedExtensions.length > 0) {
        formattedData.extension_list = formattedExtensions.join('-');
      }

      console.log('Creating ring group with data:', formattedData);
      
      if (!formattedData.groupNumber) {
        message.error('Group number is required');
        return;
      }
      
      if (!formattedData.description) {
        message.error('Description is required');
        return;
      }

      // Create the ring group
      const result = await RingGroupService.createRingGroup(formattedData);
      console.log('Ring group created:', result);
      message.success('Ring group created successfully with extensions');
      fetchRingGroups();
    } catch (error) {
      console.error('Error creating ring group with extensions:', error.response?.data || error);
      message.error('Failed to create ring group: ' + (error.response?.data?.message || error.message));
    }
  };

  // RING GROUP TABLE COLUMNS
  const ringGroupColumns = [
    {
      title: 'Group ID',
      dataIndex: 'grpnum',
      key: 'grpnum',
      sorter: (a, b) => a.grpnum - b.grpnum,
    },
    {
      title: 'Name',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || 'N/A',
      sorter: (a, b) => (a.description || '').localeCompare(b.description || ''),
    },
    {
      title: 'Strategy',
      dataIndex: 'strategy',
      key: 'strategy',
      render: (text) => {
        const strategies = {
          ringall: 'Ring All',
          hunt: 'Hunt',
          memoryhunt: 'Memory Hunt',
          firstavailable: 'First Available',
          firstnotonphone: 'First Not on Phone',
          random: 'Random'
        };
        return strategies[text] || text || 'Ring All';
      }
    },
    {
      title: 'Ring Time',
      dataIndex: 'grptime',
      key: 'grptime',
      render: (text) => `${text || 20} seconds`,
    },
    {
      title: 'Agents',
      key: 'agents',
      render: (_, record) => {
        const extensions = ringGroupAssignments[record.grpnum] || [];
        return (
          <div>
            {extensions.length > 0 ? (
              <Badge count={extensions.length} style={{ backgroundColor: '#52c41a' }}>
                <Tag color="blue">
                  {extensions.length} {extensions.length === 1 ? 'Agent' : 'Agents'}
                </Tag>
              </Badge>
            ) : (
              <Tag color="red">No Agents</Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={() => viewRingGroupDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditRingGroup(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this ring group?"
            description="This will remove all agent assignments to this group as well."
            onConfirm={() => handleDeleteRingGroup(record.grpnum)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="agent-assignment-management">
      <Card
        title={
          <Tabs activeKey={activeTabKey} onChange={setActiveTabKey}>
            <TabPane tab="Agents" key="1" />
            <TabPane tab="Ring Groups" key="2" />
          </Tabs>
        }
        extra={
          activeTabKey === "1" ? (
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setCurrentAgent(null);
                  form.resetFields();
                  setModalVisible(true);
                }}
              >
                Add Agent
              </Button>
              <Button
                icon={<TeamOutlined />}
                onClick={() => setBatchAssignModalVisible(true)}
              >
                Batch Assign
              </Button>
            </Space>
          ) : (
            <Space>
              <Button
                type="primary"
                icon={<UsergroupAddOutlined />}
                onClick={handleCreateRingGroup}
              >
                Create Ring Group
              </Button>
              <Button
                onClick={() => {
                  // Format matches the API example
                  const testData = {
                    groupNumber: "600",
                    description: "Sales Team",
                    extensions: ["1001", "1002"], 
                    strategy: "ringall",
                    ringTime: 20
                  };
                  // Call our function which will format the data correctly for the API
                  createRingGroupWithExtensions(testData);
                }}
              >
                Create Test Ring Group
              </Button>
            </Space>
          )
        }
      >
        {activeTabKey === "1" ? (
          // AGENTS TAB CONTENT
          <Table
            columns={columns}
            dataSource={agents}
            rowKey="id"
            loading={loading}
          />
        ) : (
          // RING GROUPS TAB CONTENT
          <Table
            dataSource={ringGroups}
            columns={ringGroupColumns}
            rowKey="grpnum"
            loading={loading}
          />
        )}
      </Card>

      {/* Agent Form Modal */}
      <Modal
        title={currentAgent ? 'Edit Agent' : 'Add New Agent'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setCurrentAgent(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitAgentForm}
          initialValues={{
            max_concurrent_calls: 1
          }}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input />
          </Form.Item>

          {!currentAgent && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please input password' },
                { min: 8, message: 'Password must be at least 8 characters' }
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item
            name="first_name"
            label="First Name"
            rules={[{ required: true, message: 'Please input first name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Last Name"
            rules={[{ required: true, message: 'Please input last name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="agent_extension"
            label="Extension"
            rules={[
              { required: true, message: 'Please input extension' },
              { pattern: /^\d+$/, message: 'Extension must contain only numbers' },
              { min: 3, message: 'Extension must be at least 3 digits' },
              { max: 6, message: 'Extension must be at most 6 digits' }
            ]}
            tooltip="Numeric extension for the agent (e.g. 1001)"
          >
            <Input placeholder="E.g. 1001" />
          </Form.Item>

          <Form.Item
            name="max_concurrent_calls"
            label="Max Concurrent Calls"
            rules={[{ required: true, message: 'Please input max concurrent calls' }]}
          >
            <Select>
              <Option value={1}>1</Option>
              <Option value={2}>2</Option>
              <Option value={3}>3</Option>
              <Option value={4}>4</Option>
              <Option value={5}>5</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {currentAgent ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                setCurrentAgent(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Agent Details Drawer */}
      <Drawer
        title="Agent Details"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        {selectedAgent && (
          <>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Card>
                <Row gutter={16}>
                  <Col span={12}>
                    <Title level={4}>{selectedAgent.first_name} {selectedAgent.last_name}</Title>
                    <Text>{selectedAgent.email}</Text>
                    <div style={{ marginTop: 16 }}>
                      <Text strong>Extension: </Text>
                      <Text>{selectedAgent.agent_extension || 'Not Set'}</Text>
                    </div>
                    <div>
                      <Text strong>Max Concurrent Calls: </Text>
                      <Text>{selectedAgent.max_concurrent_calls}</Text>
                    </div>
                    <div>
                      <Text strong>Status: </Text>
                      <Tag color={selectedAgent.agent_status === 'online' ? 'success' : 'default'}>
                        {(selectedAgent.agent_status || 'offline').toUpperCase()}
                      </Tag>
                    </div>
                    <div>
                      <Text strong>Available: </Text>
                      <Tag color={selectedAgent.available_for_calls ? 'success' : 'error'}>
                        {selectedAgent.available_for_calls ? 'YES' : 'NO'}
                      </Tag>
                    </div>
                  </Col>
                  <Col span={12}>
                    {agentStats && (
                      <>
                        <Title level={5}>Today's Stats</Title>
                        <Statistic title="Total Calls" value={agentStats.today?.total_calls || 0} />
                        <Statistic title="Answered Calls" value={agentStats.today?.answered_calls || 0} />
                        <Statistic title="Missed Calls" value={agentStats.today?.missed_calls || 0} />
                        <Statistic 
                          title="Total Talk Time" 
                          value={agentStats.today?.total_duration || 0} 
                          suffix="seconds" 
                        />
                      </>
                    )}
                  </Col>
                </Row>
              </Card>

              <Divider orientation="left">Ring Group Assignments</Divider>
              
              <List
                bordered
                dataSource={getAgentGroups(selectedAgent.agent_extension)}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Popconfirm
                        title="Remove from this ring group?"
                        onConfirm={() => {
                          if (selectedAgent.agent_extension) {
                            RingGroupService.removeExtensionFromRingGroup(item.id, selectedAgent.agent_extension)
                              .then(() => {
                                message.success('Agent removed from ring group');
                                fetchRingGroups();
                              })
                              .catch(err => {
                                console.error('Error removing agent from ring group:', err);
                                message.error('Failed to remove agent from ring group');
                              });
                          }
                        }}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button size="small" danger>Remove</Button>
                      </Popconfirm>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<PhoneOutlined />}
                      title={item.name}
                      description={`Group ID: ${item.id}`}
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No ring group assignments' }}
              />

              <Divider orientation="left">Add to Ring Group</Divider>
              
              <Form layout="inline">
                <Form.Item
                  label="Ring Group"
                  name="ringGroup"
                  style={{ width: '70%' }}
                >
                  <Select
                    placeholder="Select a ring group"
                    onChange={(value) => {
                      const groups = getAgentGroups(selectedAgent.agent_extension);
                      const isAssigned = groups.some(g => g.id === value);
                      
                      if (isAssigned) {
                        message.warn('Agent is already assigned to this ring group');
                        return;
                      }
                      
                      if (selectedAgent.agent_extension) {
                        RingGroupService.addExtensionToRingGroup(value, selectedAgent.agent_extension)
                          .then(() => {
                            message.success('Agent added to ring group');
                            fetchRingGroups();
                          })
                          .catch(err => {
                            console.error('Error adding agent to ring group:', err);
                            message.error('Failed to add agent to ring group');
                          });
                      } else {
                        message.error('Agent does not have an extension assigned');
                      }
                    }}
                  >
                    {ringGroups.map(group => (
                      <Option key={group.grpnum} value={group.grpnum}>
                        {group.description || `Group ${group.grpnum}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Form>
            </Space>
          </>
        )}
      </Drawer>

      {/* Batch Assign Modal */}
      <Modal
        title="Batch Assign Agents to Ring Group"
        open={batchAssignModalVisible}
        onCancel={() => setBatchAssignModalVisible(false)}
        footer={null}
      >
        <Form
          form={batchAssignForm}
          layout="vertical"
          onFinish={handleBatchAssign}
        >
          <Form.Item
            name="ringGroup"
            label="Ring Group"
            rules={[{ required: true, message: 'Please select a ring group' }]}
          >
            <Select placeholder="Select a ring group">
              {ringGroups.map(group => (
                <Option key={group.grpnum} value={group.grpnum}>
                  {group.description || `Group ${group.grpnum}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="agents"
            label="Agents to Add"
            rules={[{ required: true, message: 'Please select at least one agent' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select agents"
              optionFilterProp="children"
            >
              {agents
                .filter(agent => agent.agent_extension) // Only show agents with extensions
                .map(agent => (
                  <Option key={agent.id} value={agent.id}>
                    {agent.first_name} {agent.last_name} ({agent.agent_extension})
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Assign
              </Button>
              <Button onClick={() => setBatchAssignModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Ring Group Form Modal */}
      <Modal
        title={currentRingGroup ? 'Edit Ring Group' : 'Create Ring Group'}
        open={ringGroupModalVisible}
        onCancel={() => setRingGroupModalVisible(false)}
        footer={null}
      >
        <Form
          form={ringGroupForm}
          layout="vertical"
          onFinish={handleRingGroupSubmit}
          initialValues={{
            strategy: 'ringall',
            ringTime: 20
          }}
        >
          <Form.Item
            name="description"
            label="Ring Group Name"
            rules={[{ required: true, message: 'Please enter a name for this ring group' }]}
          >
            <Input placeholder="E.g. Sales Team, Support Team" />
          </Form.Item>

          {!currentRingGroup && (
            <Form.Item
              name="groupNumber"
              label="Group Number"
              rules={[
                { required: true, message: 'Please enter a group number' },
                { pattern: /^\d+$/, message: 'Group number must be numeric' }
              ]}
              tooltip="A unique numeric identifier for this ring group (e.g. 600)"
            >
              <Input placeholder="E.g. 600" />
            </Form.Item>
          )}

          <Form.Item
            name="strategy"
            label="Ring Strategy"
            rules={[{ required: true, message: 'Please select a ring strategy' }]}
            tooltip="Determines how incoming calls are distributed to agents in this group"
          >
            <Select>
              <Option value="ringall">Ring All - Ring all available agents simultaneously</Option>
              <Option value="hunt">Hunt - Ring agents in order listed</Option>
              <Option value="memoryhunt">Memory Hunt - Ring agents in order, remembering last agent</Option>
              <Option value="firstavailable">First Available - Ring the first available agent</Option>
              <Option value="firstnotonphone">First Not on Phone - Ring the first agent not on the phone</Option>
              <Option value="random">Random - Ring a random agent</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="ringTime"
            label="Ring Time (seconds)"
            rules={[{ required: true, message: 'Please enter ring time' }]}
            tooltip="How long to ring agents before giving up"
          >
            <InputNumber min={5} max={300} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="grppre"
            label="CID Name Prefix"
            tooltip="Add a prefix to incoming Caller ID Name (optional)"
          >
            <Input placeholder="E.g. SALES:" />
          </Form.Item>

          <Form.Item
            label="Add Agents by Name"
            tooltip="Select agents to add their extensions to the ring group"
          >
            <Select
              style={{ width: '100%' }}
              placeholder="Select agents to add"
              mode="multiple"
              optionFilterProp="children"
              onChange={(selectedAgentIds) => {
                // Get current extensions from the form
                const currentExtensions = ringGroupForm.getFieldValue('extensions') || [];
                
                // Get extensions from selected agents
                const newExtensions = selectedAgentIds
                  .map(id => {
                    const agent = agents.find(a => a.id === id);
                    return agent?.agent_extension;
                  })
                  .filter(ext => ext && !currentExtensions.includes(ext));
                
                // Update the form with combined extensions
                ringGroupForm.setFieldsValue({
                  extensions: [...currentExtensions, ...newExtensions]
                });
              }}
            >
              {agents
                .filter(agent => agent.agent_extension)
                .map(agent => (
                  <Option key={agent.id} value={agent.id}>
                    {agent.first_name} {agent.last_name} ({agent.agent_extension})
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="extensions"
            label="Extensions"
            tooltip="Enter extensions to add to this ring group. You can add more later."
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Enter extensions (e.g. 1001, 1002)"
              tokenSeparators={[',']}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {currentRingGroup ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => setRingGroupModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Ring Group Details Drawer */}
      <Drawer
        title="Ring Group Details"
        placement="right"
        onClose={() => setRingGroupDrawerVisible(false)}
        open={ringGroupDrawerVisible}
        width={600}
      >
        {selectedRingGroup && (
          <>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Card>
                <Row gutter={16}>
                  <Col span={24}>
                    <Title level={4}>{selectedRingGroup.description || `Group ${selectedRingGroup.grpnum}`}</Title>
                    <div style={{ marginTop: 8 }}>
                      <Text strong>Group Number: </Text>
                      <Text>{selectedRingGroup.grpnum}</Text>
                    </div>
                    <div>
                      <Text strong>Ring Strategy: </Text>
                      <Text>{selectedRingGroup.strategy || 'ringall'}</Text>
                    </div>
                    <div>
                      <Text strong>Ring Time: </Text>
                      <Text>{selectedRingGroup.grptime || 20} seconds</Text>
                    </div>
                    {selectedRingGroup.grppre && (
                      <div>
                        <Text strong>CID Prefix: </Text>
                        <Text>{selectedRingGroup.grppre}</Text>
                      </div>
                    )}
                  </Col>
                </Row>
              </Card>

              <Divider orientation="left">Assigned Agents</Divider>
              
              <Card>
                {ringGroupAssignments[selectedRingGroup.grpnum]?.length > 0 ? (
                  <List
                    bordered
                    dataSource={ringGroupAssignments[selectedRingGroup.grpnum]?.map(ext => 
                      agents.find(a => a.agent_extension === ext) || { agent_extension: ext, first_name: 'Unknown', last_name: 'Agent' }
                    )}
                    renderItem={agent => (
                      <List.Item
                        actions={[
                          <Popconfirm
                            title="Remove agent from this ring group?"
                            onConfirm={() => {
                              if (agent.agent_extension) {
                                RingGroupService.removeExtensionFromRingGroup(selectedRingGroup.grpnum, agent.agent_extension)
                                  .then(() => {
                                    message.success('Agent removed from ring group');
                                    fetchRingGroups();
                                    viewRingGroupDetails(selectedRingGroup);
                                  })
                                  .catch(err => {
                                    console.error('Error removing agent from ring group:', err);
                                    message.error('Failed to remove agent from ring group');
                                  });
                              }
                            }}
                            okText="Yes"
                            cancelText="No"
                          >
                            <Button size="small" danger>Remove</Button>
                          </Popconfirm>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<UserOutlined />}
                          title={agent.first_name && agent.last_name ? 
                            `${agent.first_name} ${agent.last_name}` : 
                            `Extension ${agent.agent_extension}`}
                          description={`Extension: ${agent.agent_extension}`}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="No agents assigned to this ring group" />
                )}

                <Divider orientation="left">Add Agent to Ring Group</Divider>
                
                <Select 
                  style={{ width: '100%' }}
                  placeholder="Select an agent to add"
                  onChange={(value) => {
                    const agentToAdd = agents.find(a => a.id === value);
                    if (agentToAdd && agentToAdd.agent_extension) {
                      RingGroupService.addExtensionToRingGroup(selectedRingGroup.grpnum, agentToAdd.agent_extension)
                        .then(() => {
                          message.success('Agent added to ring group');
                          fetchRingGroups();
                          viewRingGroupDetails(selectedRingGroup);
                        })
                        .catch(err => {
                          console.error('Error adding agent to ring group:', err);
                          message.error('Failed to add agent to ring group');
                        });
                    } else {
                      message.error('Selected agent does not have an extension');
                    }
                  }}
                >
                  {agents
                    .filter(agent => agent.agent_extension && 
                      !ringGroupAssignments[selectedRingGroup.grpnum]?.includes(agent.agent_extension))
                    .map(agent => (
                      <Option key={agent.id} value={agent.id}>
                        {agent.first_name} {agent.last_name} ({agent.agent_extension})
                      </Option>
                    ))}
                </Select>
              </Card>
            </Space>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default AgentAssignmentManagement; 