import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  message,
  Space,
  Tag,
  Tooltip,
  Popconfirm
} from 'antd';
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import AgentService from '../../services/AgentService';

const AgentManagement = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingAgent, setEditingAgent] = useState(null);

  // Fetch agents on component mount
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await AgentService.getAllAgents();
      // Ensure we're setting an array, even if empty
      setAgents(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      message.error('Failed to fetch agents');
      setAgents([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (values) => {
    try {
      console.log('Form values:', values); // Debug log
      
      // First check if the extension already exists for a different agent
      if (values.agent_extension) {
        const existingAgents = agents.filter(a => 
          a.agent_extension === values.agent_extension && 
          (!editingAgent || a.id !== editingAgent.id)
        );
        
        if (existingAgents.length > 0) {
          message.warning(`Extension ${values.agent_extension} is already assigned to another agent`);
          // Continue anyway as backend will handle this appropriately now
        }
      }
      
      if (editingAgent) {
        // Update existing agent
        await AgentService.updateAgent(editingAgent.id, values);
        message.success('Agent updated successfully');
      } else {
        // Create new agent
        const response = await AgentService.createAgent(values);
        console.log('Create agent response:', response); // Debug log
        message.success('Agent created successfully');
      }
      
      setModalVisible(false);
      form.resetFields();
      setEditingAgent(null);
      fetchAgents();
    } catch (error) {
      console.error('Error creating/updating agent:', error.response || error); // Enhanced error logging
      
      if (error.response?.data?.msg?.includes('Extension') || error.message?.includes('Extension') || error.message?.includes('Asterisk')) {
        message.error('Error with extension configuration. Please try a different extension number.');
      } else {
        message.error(error.response?.data?.msg || 'Operation failed');
      }
    }
  };

  const handleEdit = (agent) => {
    setEditingAgent(agent);
    form.setFieldsValue({
      email: agent.email,
      first_name: agent.first_name,
      last_name: agent.last_name,
      agent_extension: agent.agent_extension,
      max_concurrent_calls: agent.max_concurrent_calls,
    });
    setModalVisible(true);
  };

  const handleDelete = async (agentId) => {
    try {
      // Delete the agent through the API
      await AgentService.deleteAgent(agentId);
      message.success('Agent deleted successfully');
      fetchAgents();
    } catch (error) {
      message.error('Failed to delete agent');
      console.error('Error deleting agent:', error);
    }
  };
  
  const handleSyncAsterisk = async (agentId) => {
    try {
      setLoading(true);
      await AgentService.syncAgentWithAsterisk(agentId);
      message.success('Successfully synchronized agent with FreePBX');
      fetchAgents();
    } catch (error) {
      console.error('Error syncing with FreePBX:', error);
      message.error('Failed to sync agent with FreePBX');
    } finally {
      setLoading(false);
    }
  };

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
      render: (ext) => ext || 'N/A',
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
        <Tag color={record.available_for_calls ? 'success' : 'error'}>
          {record.available_for_calls ? 'YES' : 'NO'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Sync with FreePBX">
            <Button
              type="text"
              icon={<SyncOutlined />}
              onClick={() => handleSyncAsterisk(record.id)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete agent?"
            description="Are you sure you want to delete this agent?"
            onConfirm={() => handleDelete(record.id)}
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
    <Card
      title="Agent Management"
      extra={
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => {
            setEditingAgent(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Add Agent
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={agents}
        rowKey={(record) => record.id || Math.random().toString()}
        loading={loading}
      />

      <Modal
        title={editingAgent ? 'Edit Agent' : 'Create New Agent'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingAgent(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateOrUpdate}
          initialValues={{
            max_concurrent_calls: 1,
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

          {!editingAgent && (
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
              { max: 6, message: 'Extension must be at most 6 digits' },
              {
                validator: async (_, value) => {
                  if (!value || !editingAgent) return Promise.resolve();
                  
                  // Check for duplicate extensions in the current list
                  const duplicate = agents.find(
                    agent => agent.agent_extension === value && agent.id !== editingAgent.id
                  );
                  
                  if (duplicate) {
                    return Promise.reject(
                      new Error('This extension is already in use by another agent')
                    );
                  }
                  
                  return Promise.resolve();
                }
              }
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
            <InputNumber min={1} max={10} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingAgent ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingAgent(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AgentManagement; 