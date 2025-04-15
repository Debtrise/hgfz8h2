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
  InputNumber,
  Tag,
  Popconfirm,
  message,
  Tabs,
  Transfer,
  Typography,
  Tooltip,
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  TeamOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import RingGroupService from '../../services/RingGroupService';
import AgentService from '../../services/AgentService';

const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const RingGroupManagement = () => {
  const [ringGroups, setRingGroups] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [currentGroupId, setCurrentGroupId] = useState(null);
  const [targetKeys, setTargetKeys] = useState([]);
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [form] = Form.useForm();
  const [tieredModalVisible, setTieredModalVisible] = useState(false);
  const [tieredForm] = Form.useForm();

  // Fetch data on component mount
  useEffect(() => {
    fetchRingGroups();
    fetchAgents();
  }, []);

  // Fetch ring groups
  const fetchRingGroups = async () => {
    try {
      setLoading(true);
      const data = await RingGroupService.getAllRingGroups();
      setRingGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching ring groups:', error);
      message.error('Failed to fetch ring groups');
    } finally {
      setLoading(false);
    }
  };

  // Fetch agents to get available extensions
  const fetchAgents = async () => {
    try {
      const data = await AgentService.getAllAgents();
      setAgents(Array.isArray(data) ? data : []);
      
      // Create available extensions list for Transfer component
      const extensions = data.map(agent => ({
        key: agent.agent_extension,
        title: `${agent.first_name} ${agent.last_name} (${agent.agent_extension})`,
        extension: agent.agent_extension,
        name: `${agent.first_name} ${agent.last_name}`
      }));
      
      setAvailableExtensions(extensions);
    } catch (error) {
      console.error('Error fetching agents:', error);
      message.error('Failed to fetch agents');
    }
  };

  // Load extensions for a specific ring group
  const loadGroupExtensions = async (groupId) => {
    try {
      const group = await RingGroupService.getRingGroupById(groupId);
      
      // Parse extension list (format varies by implementation)
      // This example assumes the extension list is returned as a string like:
      // "LOCAL/1001@from-internal/n-LOCAL/1002@from-internal/n"
      
      let extensions = [];
      if (group.extension_list) {
        // Simple parsing example - adjust based on actual API response format
        extensions = group.extension_list.split('-')
          .map(ext => ext.match(/LOCAL\/(\d+)@/))
          .filter(match => match)
          .map(match => match[1]);
      }
      
      setTargetKeys(extensions);
      setCurrentGroupId(groupId);
      setTransferModalVisible(true);
    } catch (error) {
      console.error('Error loading group extensions:', error);
      message.error('Failed to load ring group extensions');
    }
  };

  // Handle creating or updating a ring group
  const handleSaveGroup = async (values) => {
    try {
      if (editingGroup) {
        await RingGroupService.updateRingGroup(editingGroup.grpnum, {
          description: values.description,
          strategy: values.strategy,
          ringTime: values.ringTime,
          extensions: values.extensions || []
        });
        message.success('Ring group updated successfully');
      } else {
        await RingGroupService.createRingGroup({
          groupNumber: values.groupNumber,
          description: values.description,
          strategy: values.strategy,
          ringTime: values.ringTime,
          extensions: values.extensions || []
        });
        message.success('Ring group created successfully');
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchRingGroups();
    } catch (error) {
      console.error('Error saving ring group:', error);
      message.error('Failed to save ring group');
    }
  };

  // Handle creating a tiered ring group
  const handleSaveTieredGroup = async (values) => {
    try {
      // Transform form values into the API's expected format
      const tiers = [];
      
      // Check if tiers exist in values
      if (values.tier1Extensions) {
        tiers.push({
          extensions: values.tier1Extensions,
          ringTime: values.tier1RingTime
        });
      }
      
      if (values.tier2Extensions) {
        tiers.push({
          extensions: values.tier2Extensions,
          ringTime: values.tier2RingTime
        });
      }
      
      if (values.tier3Extensions) {
        tiers.push({
          extensions: values.tier3Extensions,
          ringTime: values.tier3RingTime
        });
      }
      
      await RingGroupService.createTieredRingGroup({
        baseGroupNumber: values.baseGroupNumber,
        description: values.description,
        tiers
      });
      
      message.success('Tiered ring group created successfully');
      setTieredModalVisible(false);
      tieredForm.resetFields();
      fetchRingGroups();
    } catch (error) {
      console.error('Error creating tiered ring group:', error);
      message.error('Failed to create tiered ring group');
    }
  };

  // Handle transferring extensions to a ring group
  const handleTransfer = async () => {
    try {
      // Get current extensions in the group
      const group = await RingGroupService.getRingGroupById(currentGroupId);
      let currentExtensions = [];
      
      if (group.extension_list) {
        currentExtensions = group.extension_list.split('-')
          .map(ext => ext.match(/LOCAL\/(\d+)@/))
          .filter(match => match)
          .map(match => match[1]);
      }
      
      // Extensions to add (in targetKeys but not in currentExtensions)
      const extensionsToAdd = targetKeys.filter(ext => !currentExtensions.includes(ext));
      
      // Extensions to remove (in currentExtensions but not in targetKeys)
      const extensionsToRemove = currentExtensions.filter(ext => !targetKeys.includes(ext));
      
      // Add new extensions
      for (const ext of extensionsToAdd) {
        await RingGroupService.addExtensionToRingGroup(currentGroupId, ext);
      }
      
      // Remove extensions no longer needed
      for (const ext of extensionsToRemove) {
        await RingGroupService.removeExtensionFromRingGroup(currentGroupId, ext);
      }
      
      message.success('Ring group extensions updated successfully');
      setTransferModalVisible(false);
      fetchRingGroups();
    } catch (error) {
      console.error('Error updating ring group extensions:', error);
      message.error('Failed to update ring group extensions');
    }
  };

  // Handle deleting a ring group
  const handleDelete = async (groupId) => {
    try {
      await RingGroupService.deleteRingGroup(groupId);
      message.success('Ring group deleted successfully');
      fetchRingGroups();
    } catch (error) {
      console.error('Error deleting ring group:', error);
      message.error('Failed to delete ring group');
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Group Number',
      dataIndex: 'grpnum',
      key: 'grpnum',
      sorter: (a, b) => parseInt(a.grpnum) - parseInt(b.grpnum),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Strategy',
      dataIndex: 'strategy',
      key: 'strategy',
      render: (strategy) => {
        const strategies = {
          'ringall': { color: 'green', name: 'Ring All' },
          'hunt': { color: 'blue', name: 'Hunt' },
          'memoryhunt': { color: 'purple', name: 'Memory Hunt' },
          'firstavailable': { color: 'cyan', name: 'First Available' },
          'firstnotonphone': { color: 'orange', name: 'First Not On Phone' },
        };
        
        return (
          <Tag color={strategies[strategy]?.color || 'default'}>
            {strategies[strategy]?.name || strategy}
          </Tag>
        );
      },
    },
    {
      title: 'Ring Time',
      dataIndex: 'grptime',
      key: 'grptime',
      render: (time) => `${time} seconds`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Ring Group">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setEditingGroup(record);
                form.setFieldsValue({
                  groupNumber: record.grpnum,
                  description: record.description,
                  strategy: record.strategy,
                  ringTime: record.grptime,
                });
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Manage Extensions">
            <Button
              type="default"
              icon={<TeamOutlined />}
              size="small"
              onClick={() => loadGroupExtensions(record.grpnum)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this ring group?"
            onConfirm={() => handleDelete(record.grpnum)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Ring Group">
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="ring-group-management">
      <Card
        title={
          <Space>
            <PhoneOutlined />
            <span>Ring Group Management</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingGroup(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              New Ring Group
            </Button>
            <Button
              type="default"
              icon={<TeamOutlined />}
              onClick={() => {
                tieredForm.resetFields();
                setTieredModalVisible(true);
              }}
            >
              Create Tiered Group
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={ringGroups}
          rowKey="grpnum"
          loading={loading}
        />
      </Card>

      {/* Ring Group Form Modal */}
      <Modal
        title={editingGroup ? 'Edit Ring Group' : 'Create Ring Group'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingGroup(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveGroup}
        >
          <Form.Item
            name="groupNumber"
            label="Group Number"
            rules={[
              { required: true, message: 'Please enter a group number' },
              { pattern: /^\d+$/, message: 'Group number must be numeric' }
            ]}
            tooltip="Unique numeric identifier for this ring group (e.g., 600)"
            disabled={!!editingGroup}
          >
            <Input disabled={!!editingGroup} placeholder="e.g., 600" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input placeholder="e.g., Sales Team" />
          </Form.Item>

          <Form.Item
            name="strategy"
            label="Ring Strategy"
            rules={[{ required: true, message: 'Please select a strategy' }]}
            tooltip="How to distribute calls among extensions"
          >
            <Select placeholder="Select a strategy">
              <Option value="ringall">Ring All - Ring all available extensions</Option>
              <Option value="hunt">Hunt - Ring extensions in order</Option>
              <Option value="memoryhunt">Memory Hunt - Ring starting with the last called extension</Option>
              <Option value="firstavailable">First Available - Ring first available extension</Option>
              <Option value="firstnotonphone">First Not On Phone - Ring first extension not on the phone</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="ringTime"
            label="Ring Time (seconds)"
            rules={[{ required: true, message: 'Please enter ring time' }]}
            tooltip="How long to ring before giving up"
          >
            <InputNumber min={1} max={120} />
          </Form.Item>

          <Form.Item
            name="extensions"
            label="Initial Extensions"
            tooltip="You can add more extensions after creating the group"
          >
            <Select
              mode="multiple"
              placeholder="Select extensions"
              optionFilterProp="children"
            >
              {agents.map(agent => (
                <Option key={agent.agent_extension} value={agent.agent_extension}>
                  {agent.first_name} {agent.last_name} ({agent.agent_extension})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingGroup ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingGroup(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Extension Transfer Modal */}
      <Modal
        title="Manage Ring Group Extensions"
        open={transferModalVisible}
        onOk={handleTransfer}
        onCancel={() => setTransferModalVisible(false)}
        width={800}
      >
        <Transfer
          dataSource={availableExtensions}
          showSearch
          filterOption={(inputValue, option) =>
            option.title.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
          }
          targetKeys={targetKeys}
          onChange={setTargetKeys}
          render={item => item.title}
          titles={['Available Extensions', 'Extensions In Group']}
          listStyle={{ width: 300, height: 300 }}
        />
      </Modal>

      {/* Tiered Ring Group Modal */}
      <Modal
        title="Create Tiered Ring Group"
        open={tieredModalVisible}
        onCancel={() => setTieredModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={tieredForm}
          layout="vertical"
          onFinish={handleSaveTieredGroup}
        >
          <Form.Item
            name="baseGroupNumber"
            label="Base Group Number"
            rules={[
              { required: true, message: 'Please enter a base group number' },
              { pattern: /^\d+$/, message: 'Group number must be numeric' }
            ]}
            tooltip="Unique numeric identifier for the main group (e.g., 700)"
          >
            <Input placeholder="e.g., 700" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input placeholder="e.g., Support Queue" />
          </Form.Item>

          <Divider orientation="left">Tier 1 (Primary Agents)</Divider>
          
          <Form.Item
            name="tier1Extensions"
            label="Tier 1 Extensions"
            rules={[{ required: true, message: 'Please select at least one extension' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select extensions"
              optionFilterProp="children"
            >
              {agents.map(agent => (
                <Option key={`t1-${agent.agent_extension}`} value={agent.agent_extension}>
                  {agent.first_name} {agent.last_name} ({agent.agent_extension})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="tier1RingTime"
            label="Tier 1 Ring Time (seconds)"
            rules={[{ required: true, message: 'Please enter ring time' }]}
            initialValue={20}
          >
            <InputNumber min={5} max={60} />
          </Form.Item>

          <Divider orientation="left">Tier 2 (Secondary Agents)</Divider>
          
          <Form.Item
            name="tier2Extensions"
            label="Tier 2 Extensions"
          >
            <Select
              mode="multiple"
              placeholder="Select extensions"
              optionFilterProp="children"
            >
              {agents.map(agent => (
                <Option key={`t2-${agent.agent_extension}`} value={agent.agent_extension}>
                  {agent.first_name} {agent.last_name} ({agent.agent_extension})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="tier2RingTime"
            label="Tier 2 Ring Time (seconds)"
            initialValue={20}
          >
            <InputNumber min={5} max={60} />
          </Form.Item>

          <Divider orientation="left">Tier 3 (Escalation/Backup)</Divider>
          
          <Form.Item
            name="tier3Extensions"
            label="Tier 3 Extensions"
          >
            <Select
              mode="multiple"
              placeholder="Select extensions"
              optionFilterProp="children"
            >
              {agents.map(agent => (
                <Option key={`t3-${agent.agent_extension}`} value={agent.agent_extension}>
                  {agent.first_name} {agent.last_name} ({agent.agent_extension})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="tier3RingTime"
            label="Tier 3 Ring Time (seconds)"
            initialValue={30}
          >
            <InputNumber min={5} max={60} />
          </Form.Item>
          
          <Tooltip title="Tiered ring groups simulate call queues by calling each tier sequentially">
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              <InfoCircleOutlined /> Calls will flow from Tier 1 to Tier 2 to Tier 3 if not answered.
            </Text>
          </Tooltip>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Tiered Group
              </Button>
              <Button onClick={() => setTieredModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RingGroupManagement; 