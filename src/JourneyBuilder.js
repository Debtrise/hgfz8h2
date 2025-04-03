import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  ConnectionMode,
  useStore,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Tabs,
  Tooltip,
  Typography,
  message,
  Checkbox,
  TimePicker,
  Tag,
  Badge,
  Popover,
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  DeleteOutlined,
  SettingOutlined,
  MailOutlined,
  PhoneOutlined,
  MessageOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  ApiOutlined,
  FormOutlined,
  DatabaseOutlined,
  BranchesOutlined,
  CheckSquareOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  DisconnectOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import './JourneyBuilder.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// Custom Node Components
const TriggerNode = ({ data }) => (
  <div className="node trigger-node">
    <div className="node-header">
      <UserOutlined className="node-icon" />
      <span className="node-title">Trigger</span>
    </div>
    <div className="node-content">
      <Select
        value={data.triggerType}
        onChange={(value) => data.onChange('triggerType', value)}
        style={{ width: '100%' }}
      >
        <Option value="form_submit">Form Submission</Option>
        <Option value="api_trigger">API Trigger</Option>
        <Option value="manual">Manual Entry</Option>
      </Select>
    </div>
    <div className="node-handle node-handle-bottom" />
  </div>
);

const EmailNode = ({ data }) => (
  <div className="node email-node">
    <div className="node-header">
      <MailOutlined className="node-icon" />
      <span className="node-title">Email</span>
    </div>
    <div className="node-content">
      <Select
        value={data.template}
        onChange={(value) => data.onChange('template', value)}
        style={{ width: '100%', marginBottom: 8 }}
      >
        <Option value="welcome">Welcome Email</Option>
        <Option value="followup">Follow-up Email</Option>
        <Option value="custom">Custom Email</Option>
      </Select>
      {data.template === 'custom' && (
        <Input.TextArea
          value={data.content}
          onChange={(e) => data.onChange('content', e.target.value)}
          placeholder="Enter email content..."
          rows={3}
        />
      )}
    </div>
    <div className="node-handle node-handle-top" />
    <div className="node-handle node-handle-bottom" />
  </div>
);

const CallNode = ({ data }) => (
  <div className="node call-node">
    <div className="node-header">
      <PhoneOutlined className="node-icon" />
      <span className="node-title">Call</span>
    </div>
    <div className="node-content">
      <Select
        value={data.template}
        onChange={(value) => data.onChange('template', value)}
        style={{ width: '100%', marginBottom: 8 }}
      >
        <Option value="sales">Sales Call</Option>
        <Option value="support">Support Call</Option>
        <Option value="custom">Custom Call</Option>
      </Select>
      {data.template === 'custom' && (
        <Input.TextArea
          value={data.script}
          onChange={(e) => data.onChange('script', e.target.value)}
          placeholder="Enter call script..."
          rows={3}
        />
      )}
    </div>
    <div className="node-handle node-handle-top" />
    <div className="node-handle node-handle-bottom" />
  </div>
);

const SMSNode = ({ data }) => (
  <div className="node sms-node">
    <div className="node-header">
      <MessageOutlined className="node-icon" />
      <span className="node-title">SMS</span>
    </div>
    <div className="node-content">
      <Select
        value={data.template}
        onChange={(value) => data.onChange('template', value)}
        style={{ width: '100%', marginBottom: 8 }}
      >
        <Option value="notification">Notification</Option>
        <Option value="reminder">Reminder</Option>
        <Option value="custom">Custom SMS</Option>
      </Select>
      {data.template === 'custom' && (
        <Input.TextArea
          value={data.message}
          onChange={(e) => data.onChange('message', e.target.value)}
          placeholder="Enter SMS message..."
          rows={3}
        />
      )}
    </div>
    <div className="node-handle node-handle-top" />
    <div className="node-handle node-handle-bottom" />
  </div>
);

const EndNode = ({ data }) => (
  <div className="node end-node">
    <div className="node-header">
      <CheckCircleOutlined className="node-icon" />
      <span className="node-title">End</span>
    </div>
    <div className="node-content">
      <Select
        value={data.status}
        onChange={(value) => data.onChange('status', value)}
        style={{ width: '100%' }}
      >
        <Option value="completed">Completed</Option>
        <Option value="failed">Failed</Option>
        <Option value="abandoned">Abandoned</Option>
      </Select>
    </div>
    <div className="node-handle node-handle-top" />
  </div>
);

const DelayNode = ({ data }) => (
  <div className="node delay-node">
    <div className="node-header">
      <ClockCircleOutlined className="node-icon" />
      <span className="node-title">Delay</span>
    </div>
    <div className="node-content">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Select
          value={data.delayType}
          onChange={(value) => data.onChange('delayType', value)}
          style={{ width: '100%' }}
        >
          <Option value="minutes">Minutes</Option>
          <Option value="hours">Hours</Option>
          <Option value="days">Days</Option>
          <Option value="weeks">Weeks</Option>
        </Select>
        <Input
          type="number"
          value={data.duration}
          onChange={(e) => data.onChange('duration', e.target.value)}
          placeholder="Duration"
          min={1}
          style={{ width: '100%' }}
        />
      </Space>
    </div>
    <div className="node-handle node-handle-top" />
    <div className="node-handle node-handle-bottom" />
  </div>
);

const ConditionNode = ({ data }) => (
  <div className="node condition-node">
    <div className="node-header">
      <BranchesOutlined className="node-icon" />
      <span className="node-title">Condition</span>
    </div>
    <div className="node-content">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Select
          value={data.conditionType}
          onChange={(value) => data.onChange('conditionType', value)}
          style={{ width: '100%' }}
        >
          <Option value="email_opened">Email Opened</Option>
          <Option value="email_clicked">Email Clicked</Option>
          <Option value="call_completed">Call Completed</Option>
          <Option value="sms_replied">SMS Replied</Option>
          <Option value="custom">Custom Condition</Option>
        </Select>
        {data.conditionType === 'custom' && (
          <Input.TextArea
            value={data.condition}
            onChange={(e) => data.onChange('condition', e.target.value)}
            placeholder="Enter custom condition..."
            rows={2}
          />
        )}
      </Space>
    </div>
    <div className="node-handle node-handle-top" />
    <div className="node-handle node-handle-bottom" />
    <div className="node-handle node-handle-right" />
  </div>
);

const nodeTypes = {
  trigger: TriggerNode,
  email: EmailNode,
  call: CallNode,
  sms: SMSNode,
  end: EndNode,
  delay: DelayNode,
  condition: ConditionNode,
};

// Add node palette items
const nodePaletteItems = [
  {
    type: 'trigger',
    label: 'Trigger',
    icon: <UserOutlined />,
    subTypes: [
      { value: 'form_submit', label: 'Form Submission', icon: <FormOutlined /> },
      { value: 'api_trigger', label: 'API Trigger', icon: <ApiOutlined /> },
      { value: 'manual', label: 'Manual Entry', icon: <TeamOutlined /> },
    ],
  },
  {
    type: 'email',
    label: 'Email',
    icon: <MailOutlined />,
    subTypes: [
      { value: 'welcome', label: 'Welcome Email' },
      { value: 'followup', label: 'Follow-up Email' },
      { value: 'custom', label: 'Custom Email' },
    ],
  },
  {
    type: 'call',
    label: 'Call',
    icon: <PhoneOutlined />,
    subTypes: [
      { value: 'sales', label: 'Sales Call' },
      { value: 'support', label: 'Support Call' },
      { value: 'custom', label: 'Custom Call' },
    ],
  },
  {
    type: 'sms',
    label: 'SMS',
    icon: <MessageOutlined />,
    subTypes: [
      { value: 'notification', label: 'Notification' },
      { value: 'reminder', label: 'Reminder' },
      { value: 'custom', label: 'Custom SMS' },
    ],
  },
  {
    type: 'delay',
    label: 'Delay',
    icon: <ClockCircleOutlined />,
  },
  {
    type: 'condition',
    label: 'Condition',
    icon: <BranchesOutlined />,
  },
  {
    type: 'end',
    label: 'End',
    icon: <CheckCircleOutlined />,
  },
];

// Mock data for journey templates
const journeyTemplates = {
  welcome_series: {
    name: 'Welcome Series',
    description: 'Onboard new customers with a welcome series',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 0 },
        data: {
          triggerType: 'form_submit',
          formId: 'signup_form',
          requireFields: true,
          onChange: (field, value) => handleNodeDataChange('trigger-1', field, value),
        },
      },
      {
        id: 'email-1',
        type: 'email',
        position: { x: 250, y: 150 },
        data: {
          template: 'welcome',
          subject: 'Welcome to Our Platform!',
          content: 'Hi {{name}},\n\nWelcome to our platform! We\'re excited to have you on board.\n\nHere\'s what you can do next:\n1. Complete your profile\n2. Explore our features\n3. Join our community\n\nBest regards,\nThe Team',
          recipients: ['all'],
          trackOpens: true,
          trackClicks: true,
          onChange: (field, value) => handleNodeDataChange('email-1', field, value),
        },
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 250, y: 300 },
        data: {
          delayType: 'days',
          duration: 2,
          timezone: 'local',
          onlyBusinessHours: true,
          onChange: (field, value) => handleNodeDataChange('delay-1', field, value),
        },
      },
      {
        id: 'email-2',
        type: 'email',
        position: { x: 250, y: 450 },
        data: {
          template: 'followup',
          subject: 'Getting Started Guide',
          content: 'Hi {{name}},\n\nHere\'s a quick guide to help you get started with our platform.\n\nKey features:\n- Feature 1\n- Feature 2\n- Feature 3\n\nNeed help? Our support team is here for you!\n\nBest regards,\nThe Team',
          recipients: ['all'],
          trackOpens: true,
          trackClicks: true,
          onChange: (field, value) => handleNodeDataChange('email-2', field, value),
        },
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 250, y: 600 },
        data: {
          conditionType: 'email_opened',
          operator: 'equals',
          value: 'true',
          onChange: (field, value) => handleNodeDataChange('condition-1', field, value),
        },
      },
      {
        id: 'email-3',
        type: 'email',
        position: { x: 100, y: 750 },
        data: {
          template: 'custom',
          subject: 'Need Help Getting Started?',
          content: 'Hi {{name}},\n\nI noticed you haven\'t completed your profile yet. Would you like to schedule a call with our onboarding specialist?\n\nBest regards,\nThe Team',
          recipients: ['all'],
          trackOpens: true,
          trackClicks: true,
          onChange: (field, value) => handleNodeDataChange('email-3', field, value),
        },
      },
      {
        id: 'call-1',
        type: 'call',
        position: { x: 400, y: 750 },
        data: {
          template: 'sales',
          callType: 'outbound',
          script: 'Hi {{name}}, this is {{agent_name}} from our team. I\'d love to help you get started with our platform. Would you have 15 minutes for a quick call?',
          requiredFields: ['name', 'email', 'phone'],
          agent: 'auto',
          recordCall: true,
          transcribeCall: true,
          onChange: (field, value) => handleNodeDataChange('call-1', field, value),
        },
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 250, y: 900 },
        data: {
          status: 'completed',
          notes: 'Welcome series completed',
          tags: ['onboarding', 'welcome'],
          onChange: (field, value) => handleNodeDataChange('end-1', field, value),
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'email-1', animated: true },
      { id: 'e2-3', source: 'email-1', target: 'delay-1', animated: true },
      { id: 'e3-4', source: 'delay-1', target: 'email-2', animated: true },
      { id: 'e4-5', source: 'email-2', target: 'condition-1', animated: true },
      { id: 'e5-6', source: 'condition-1', target: 'email-3', animated: true },
      { id: 'e5-7', source: 'condition-1', target: 'call-1', animated: true },
      { id: 'e6-8', source: 'email-3', target: 'end-1', animated: true },
      { id: 'e7-8', source: 'call-1', target: 'end-1', animated: true },
    ],
  },
  lead_nurturing: {
    name: 'Lead Nurturing',
    description: 'Nurture leads through the sales funnel',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 0 },
        data: {
          triggerType: 'api_trigger',
          endpoint: '/api/leads/new',
          method: 'POST',
          onChange: (field, value) => handleNodeDataChange('trigger-1', field, value),
        },
      },
      {
        id: 'email-1',
        type: 'email',
        position: { x: 250, y: 150 },
        data: {
          template: 'custom',
          subject: 'Thanks for Your Interest!',
          content: 'Hi {{name}},\n\nThank you for your interest in our product. We\'d love to learn more about your needs.\n\nBest regards,\nThe Team',
          recipients: ['all'],
          trackOpens: true,
          trackClicks: true,
          onChange: (field, value) => handleNodeDataChange('email-1', field, value),
        },
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 250, y: 300 },
        data: {
          delayType: 'days',
          duration: 3,
          timezone: 'local',
          onlyBusinessHours: true,
          onChange: (field, value) => handleNodeDataChange('delay-1', field, value),
        },
      },
      {
        id: 'call-1',
        type: 'call',
        position: { x: 250, y: 450 },
        data: {
          template: 'sales',
          callType: 'outbound',
          script: 'Hi {{name}}, this is {{agent_name}} from our team. I noticed you\'re interested in our product. Would you have time for a quick call?',
          requiredFields: ['name', 'email', 'phone'],
          agent: 'auto',
          recordCall: true,
          transcribeCall: true,
          onChange: (field, value) => handleNodeDataChange('call-1', field, value),
        },
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 250, y: 600 },
        data: {
          conditionType: 'call_completed',
          operator: 'equals',
          value: 'true',
          onChange: (field, value) => handleNodeDataChange('condition-1', field, value),
        },
      },
      {
        id: 'email-2',
        type: 'email',
        position: { x: 100, y: 750 },
        data: {
          template: 'custom',
          subject: 'Schedule a Demo',
          content: 'Hi {{name}},\n\nBased on our conversation, I think you\'d be interested in seeing a demo of our product. Would you like to schedule one?\n\nBest regards,\nThe Team',
          recipients: ['all'],
          trackOpens: true,
          trackClicks: true,
          onChange: (field, value) => handleNodeDataChange('email-2', field, value),
        },
      },
      {
        id: 'sms-1',
        type: 'sms',
        position: { x: 400, y: 750 },
        data: {
          template: 'custom',
          message: 'Hi {{name}}, thanks for your interest! Would you like to schedule a demo? Reply YES to confirm.',
          sender: 'company',
          requireReply: true,
          allowOptOut: true,
          onChange: (field, value) => handleNodeDataChange('sms-1', field, value),
        },
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 250, y: 900 },
        data: {
          status: 'completed',
          notes: 'Lead nurturing completed',
          tags: ['sales', 'demo'],
          onChange: (field, value) => handleNodeDataChange('end-1', field, value),
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'email-1', animated: true },
      { id: 'e2-3', source: 'email-1', target: 'delay-1', animated: true },
      { id: 'e3-4', source: 'delay-1', target: 'call-1', animated: true },
      { id: 'e4-5', source: 'call-1', target: 'condition-1', animated: true },
      { id: 'e5-6', source: 'condition-1', target: 'email-2', animated: true },
      { id: 'e5-7', source: 'condition-1', target: 'sms-1', animated: true },
      { id: 'e6-8', source: 'email-2', target: 'end-1', animated: true },
      { id: 'e7-8', source: 'sms-1', target: 'end-1', animated: true },
    ],
  },
};

// Move the JourneyBuilder component to a separate component
const JourneyBuilderContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [journeyName, setJourneyName] = useState('');
  const [journeyDescription, setJourneyDescription] = useState('');
  const [journeyStatus, setJourneyStatus] = useState('draft');
  const { project, getNodes, getEdges } = useReactFlow();
  const [draggedNode, setDraggedNode] = useState(null);
  const [connectionMode, setConnectionMode] = useState(ConnectionMode.Loose);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStartNode, setConnectionStartNode] = useState(null);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [showControls, setShowControls] = useState(true);

  // Initialize with welcome series template
  React.useEffect(() => {
    if (!id) {
      const template = journeyTemplates.welcome_series;
      setJourneyName(template.name);
      setJourneyDescription(template.description);
      setNodes(template.nodes);
      setEdges(template.edges);
    }
  }, [id]);

  const handleNodeDataChange = (nodeId, field, value) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              [field]: value,
            },
          };
        }
        return node;
      })
    );
  };

  const onConnect = useCallback(
    (params) => {
      // Validate connection
      if (params.source === params.target) {
        message.error('Cannot connect a node to itself');
        return;
      }

      // Check for existing connection
      const existingEdge = edges.find(
        (edge) => edge.source === params.source && edge.target === params.target
      );
      if (existingEdge) {
        message.error('Connection already exists');
        return;
      }

      // Add new edge with animation
      setEdges((eds) => [
        ...eds,
        {
          ...params,
          animated: true,
          style: { stroke: '#1890ff', strokeWidth: 2 },
        },
      ]);
    },
    [setEdges, edges]
  );

  const handleNodeClick = (event, node) => {
    setSelectedNode(node);
    setDrawerVisible(true);
  };

  const handleNodeDragStart = (event, node) => {
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/reactflow', node.id);
      setDraggedNode(node);
    }
  };

  const handleNodeDragEnd = (event, node) => {
    setDraggedNode(null);
  };

  const handleConnectionStart = (event, { nodeId, handleType }) => {
    setIsConnecting(true);
    setConnectionStartNode({ nodeId, handleType });
  };

  const handleConnectionEnd = (event) => {
    setIsConnecting(false);
    setConnectionStartNode(null);
  };

  const handlePaneClick = () => {
    setSelectedNode(null);
    setDrawerVisible(false);
  };

  const toggleConnectionMode = () => {
    setConnectionMode(
      connectionMode === ConnectionMode.Loose
        ? ConnectionMode.Strict
        : ConnectionMode.Loose
    );
  };

  const toggleMiniMap = () => {
    setShowMiniMap(!showMiniMap);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const handleDeleteNode = (nodeId) => {
    // Remove the node
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    // Remove connected edges
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  };

  const handleDuplicateNode = (nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const newNode = {
      ...node,
      id: `${node.type}-${Date.now()}`,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const handleNodeVisibility = (nodeId) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            hidden: !node.hidden,
          };
        }
        return node;
      })
    );
  };

  const handleSave = () => {
    // Save journey logic here
    message.success('Journey saved successfully');
  };

  const handlePublish = () => {
    setJourneyStatus('active');
    message.success('Journey published successfully');
  };

  const handlePause = () => {
    setJourneyStatus('paused');
    message.success('Journey paused successfully');
  };

  const handleDelete = () => {
    // Delete journey logic here
    message.success('Journey deleted successfully');
    navigate('/journeys');
  };

  const onDragStart = (event, nodeType) => {
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/reactflow', nodeType);
      setDraggedNode(nodeType);
    }
  };

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (event) => {
    event.preventDefault();

    const reactFlowBounds = document.querySelector('.react-flow').getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');
    const position = project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: {
        ...getDefaultDataForType(type),
        onChange: (field, value) => handleNodeDataChange(newNode.id, field, value),
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const getDefaultDataForType = (type) => {
    switch (type) {
      case 'trigger':
        return { triggerType: 'form_submit' };
      case 'email':
        return { template: 'custom', content: '' };
      case 'call':
        return { template: 'custom', script: '' };
      case 'sms':
        return { template: 'custom', message: '' };
      case 'delay':
        return { delayType: 'minutes', duration: 5 };
      case 'condition':
        return { conditionType: 'email_opened', condition: '' };
      case 'end':
        return { status: 'completed' };
      default:
        return {};
    }
  };

  return (
    <div className="journey-builder">
      <div className="journey-builder-header">
        <div className="header-left">
          <Space direction="vertical" size="small">
            <Input
              placeholder="Journey Name"
              value={journeyName}
              onChange={(e) => setJourneyName(e.target.value)}
              style={{ width: 300 }}
            />
            <Input.TextArea
              placeholder="Journey Description"
              value={journeyDescription}
              onChange={(e) => setJourneyDescription(e.target.value)}
              style={{ width: 300 }}
              rows={1}
            />
          </Space>
          <Space>
            <Badge status={journeyStatus === 'active' ? 'success' : 'default'} />
            <Text type="secondary">Status: {journeyStatus}</Text>
          </Space>
        </div>
        <div className="header-right">
          <Space>
            <Tooltip title="Toggle Connection Mode">
              <Button
                icon={<LinkOutlined />}
                onClick={toggleConnectionMode}
                type={connectionMode === ConnectionMode.Strict ? 'primary' : 'default'}
              />
            </Tooltip>
            <Tooltip title="Toggle MiniMap">
              <Button
                icon={showMiniMap ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                onClick={toggleMiniMap}
              />
            </Tooltip>
            <Tooltip title="Toggle Controls">
              <Button
                icon={showControls ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                onClick={toggleControls}
              />
            </Tooltip>
            <Button icon={<SaveOutlined />} onClick={handleSave}>
              Save
            </Button>
            {journeyStatus === 'draft' && (
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={handlePublish}
              >
                Publish
              </Button>
            )}
            {journeyStatus === 'active' && (
              <Button
                icon={<PauseCircleOutlined />}
                onClick={handlePause}
              >
                Pause
              </Button>
            )}
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Space>
        </div>
      </div>

      <div className="journey-builder-content">
        <div className="node-palette">
          <Title level={5}>Modules</Title>
          <div className="node-palette-items">
            {nodePaletteItems.map((item) => (
              <div
                key={item.type}
                className="node-palette-item"
                draggable
                onDragStart={(e) => onDragStart(e, item.type)}
              >
                <Space>
                  {item.icon}
                  <span>{item.label}</span>
                </Space>
                {item.subTypes && (
                  <div className="node-palette-subtypes">
                    {item.subTypes.map((subType) => (
                      <div
                        key={subType.value}
                        className="node-palette-subtype"
                        draggable
                        onDragStart={(e) => onDragStart(e, `${item.type}-${subType.value}`)}
                      >
                        <Space>
                          {subType.icon || item.icon}
                          <span>{subType.label}</span>
                        </Space>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flow-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onNodeDragStart={handleNodeDragStart}
            onNodeDragEnd={handleNodeDragEnd}
            onConnectStart={handleConnectionStart}
            onConnectEnd={handleConnectionEnd}
            onPaneClick={handlePaneClick}
            nodeTypes={nodeTypes}
            onDragOver={onDragOver}
            onDrop={onDrop}
            connectionMode={connectionMode}
            fitView
          >
            <Background />
            {showControls && <Controls />}
            {showMiniMap && <MiniMap />}
            <Panel position="top-right">
              <Space>
                <Badge status="success" text="Connected" />
                <Badge status="processing" text="Processing" />
                <Badge status="error" text="Error" />
              </Space>
            </Panel>
          </ReactFlow>
        </div>

        <Drawer
          title="Node Settings"
          placement="right"
          onClose={() => setDrawerVisible(false)}
          visible={drawerVisible}
          width={400}
        >
          {selectedNode && (
            <Form layout="vertical">
              <Form.Item label="Node Type">
                <Space>
                  <Text>{selectedNode.type}</Text>
                  <Button
                    type="text"
                    icon={<SettingOutlined />}
                    onClick={() => handleDuplicateNode(selectedNode.id)}
                  >
                    Duplicate
                  </Button>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteNode(selectedNode.id)}
                  >
                    Delete
                  </Button>
                  <Button
                    type="text"
                    icon={selectedNode.hidden ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                    onClick={() => handleNodeVisibility(selectedNode.id)}
                  >
                    {selectedNode.hidden ? 'Show' : 'Hide'}
                  </Button>
                </Space>
              </Form.Item>
              {Object.entries(selectedNode.data).map(([key, value]) => {
                if (key === 'onChange') return null;
                return (
                  <Form.Item key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
                    {typeof value === 'boolean' ? (
                      <Checkbox
                        checked={value}
                        onChange={(e) =>
                          handleNodeDataChange(selectedNode.id, key, e.target.checked)
                        }
                      />
                    ) : Array.isArray(value) ? (
                      <Select
                        mode="multiple"
                        value={value}
                        onChange={(val) =>
                          handleNodeDataChange(selectedNode.id, key, val)
                        }
                        style={{ width: '100%' }}
                      >
                        <Option value="option1">Option 1</Option>
                        <Option value="option2">Option 2</Option>
                        <Option value="option3">Option 3</Option>
                      </Select>
                    ) : typeof value === 'string' ? (
                      <Input
                        value={value}
                        onChange={(e) =>
                          handleNodeDataChange(selectedNode.id, key, e.target.value)
                        }
                      />
                    ) : (
                      <Select
                        value={value}
                        onChange={(val) =>
                          handleNodeDataChange(selectedNode.id, key, val)
                        }
                        style={{ width: '100%' }}
                      >
                        <Option value="option1">Option 1</Option>
                        <Option value="option2">Option 2</Option>
                        <Option value="option3">Option 3</Option>
                      </Select>
                    )}
                  </Form.Item>
                );
              })}
            </Form>
          )}
        </Drawer>
      </div>
    </div>
  );
};

// Wrap the JourneyBuilderContent with ReactFlowProvider
const JourneyBuilder = () => {
  return (
    <ReactFlowProvider>
      <JourneyBuilderContent />
    </ReactFlowProvider>
  );
};

export default JourneyBuilder; 