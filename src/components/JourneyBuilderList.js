import React, { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Handle,
  useReactFlow,
  ReactFlowProvider 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Card, 
  Button, 
  Input, 
  Form, 
  Select, 
  InputNumber, 
  Space, 
  Typography, 
  Divider, 
  message, 
  Drawer, 
  Tabs, 
  Row, 
  Col, 
  Statistic,
  Spin,
  Modal,
  Alert
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SaveOutlined, 
  ArrowRightOutlined,
  MailOutlined,
  PhoneOutlined,
  MessageOutlined,
  HistoryOutlined,
  BranchesOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  ForkOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined
} from '@ant-design/icons';
import { 
  getJourneyById, 
  createJourney, 
  updateJourney,
  getJourneySteps,
  addJourneyStep,
  addBulkJourneySteps,
  updateJourneyStep,
  deleteJourneyStep,
  reorderJourneySteps,
  cloneJourney,
  testJourneyStep
} from '../services/journeyService';
import './JourneyBuilderList.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// Lazy load the ReactFlow component for better initial load time
const ReactFlow = lazy(() => import('reactflow').then(module => ({ default: module.default })));

// Custom node components with memo for better performance
const EmailNode = React.memo(({ data }) => {
  const { actionConfig, stepNumber } = data;
  return (
    <div className="node email-node">
      <Handle type="target" position="left" />
      <div className="node-header">
        <MailOutlined /> Email <span className="step-number">{stepNumber}</span>
      </div>
      <div className="node-content">
        <div><strong>Subject:</strong> {actionConfig.subject || ''}</div>
        <div><strong>Template:</strong> {actionConfig.template_id || ''}</div>
        {actionConfig.variables && (
          <div>
            <strong>Variables:</strong> 
            {typeof actionConfig.variables === 'object' 
              ? (Object.keys(actionConfig.variables).length > 0 
                  ? Object.keys(actionConfig.variables).join(', ') 
                  : '{}')
              : (actionConfig.variables === '{}' || actionConfig.variables === '' 
                  ? '{}' 
                  : actionConfig.variables)
            }
          </div>
        )}
      </div>
      <Handle type="source" position="right" />
    </div>
  );
});

const CallNode = React.memo(({ data }) => {
  const { actionConfig, stepNumber } = data;
  return (
    <div className="node call-node">
      <Handle type="target" position="left" />
      <div className="node-header">
        <PhoneOutlined /> Call <span className="step-number">{stepNumber}</span>
      </div>
      <div className="node-content">
        <div><strong>Script:</strong> {actionConfig.script_id || ''}</div>
        <div><strong>Max Attempts:</strong> {actionConfig.max_attempts || 3}</div>
        {actionConfig.voicemail_message_id && (
          <div><strong>Voicemail:</strong> {actionConfig.voicemail_message_id}</div>
        )}
        {actionConfig.transfer_extension && (
          <div><strong>Transfer:</strong> {actionConfig.transfer_extension}</div>
        )}
      </div>
      <Handle type="source" position="right" />
    </div>
  );
});

const SMSNode = React.memo(({ data }) => {
  const { actionConfig, stepNumber } = data;
  return (
    <div className="node sms-node">
      <Handle type="target" position="left" />
      <div className="node-header">
        <MessageOutlined /> SMS <span className="step-number">{stepNumber}</span>
      </div>
      <div className="node-content">
        <div><strong>Message:</strong> {actionConfig.message || ''}</div>
        <div><strong>Template:</strong> {actionConfig.template_id || ''}</div>
        {actionConfig.variables && (
          <div>
            <strong>Variables:</strong> 
            {typeof actionConfig.variables === 'object' 
              ? (Object.keys(actionConfig.variables).length > 0 
                  ? Object.keys(actionConfig.variables).join(', ') 
                  : '{}')
              : (actionConfig.variables === '{}' || actionConfig.variables === '' 
                  ? '{}' 
                  : actionConfig.variables)
            }
          </div>
        )}
      </div>
      <Handle type="source" position="right" />
    </div>
  );
});

const WaitNode = React.memo(({ data }) => {
  const { actionConfig, stepNumber } = data;
  return (
    <div className="node wait-node">
      <Handle type="target" position="left" />
      <div className="node-header">
        <ClockCircleOutlined /> Wait <span className="step-number">{stepNumber}</span>
      </div>
      <div className="node-content">
        <div><strong>Delay:</strong> {actionConfig.delay_minutes || 0} minutes</div>
      </div>
      <Handle type="source" position="right" />
    </div>
  );
});

const ConditionNode = React.memo(({ data }) => {
  const { actionConfig, stepNumber } = data;
  return (
    <div className="node condition-node">
      <Handle type="target" position="left" />
      <div className="node-header">
        <BranchesOutlined /> Condition <span className="step-number">{stepNumber}</span>
      </div>
      <div className="node-content">
        <div><strong>Type:</strong> {actionConfig.conditionType || ''}</div>
        <div>
          <strong>Config:</strong> 
          {typeof actionConfig.conditionConfig === 'object' 
            ? (Object.keys(actionConfig.conditionConfig).length > 0 
                ? JSON.stringify(actionConfig.conditionConfig, null, 2).replace(/[{}]/g, '') 
                : '{}')
            : (actionConfig.conditionConfig === '{}' || actionConfig.conditionConfig === '' 
                ? '{}' 
                : actionConfig.conditionConfig)
          }
        </div>
      </div>
      <Handle type="source" position="right" id="true" />
      <Handle type="source" position="bottom" id="false" />
    </div>
  );
});

// Node types configuration
const nodeTypes = {
  email: EmailNode,
  call: CallNode,
  sms: SMSNode,
  wait: WaitNode,
  condition: ConditionNode,
};

// Create a separate component for the flow content
const JourneyBuilderFlow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  
  // Add journey state back
  const [journey, setJourney] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(false);
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeTab, setActiveTab] = useState('steps');
  const [journeyName, setJourneyName] = useState('New Journey');
  const [isEditingName, setIsEditingName] = useState(false);
  
  // Create a ref for the React Flow instance
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Define action types with their icons
  const actionTypes = [
    { value: 'email', label: 'Email', icon: <MailOutlined /> },
    { value: 'call', label: 'Call', icon: <PhoneOutlined /> },
    { value: 'sms', label: 'SMS', icon: <MessageOutlined /> },
    { value: 'wait', label: 'Wait', icon: <HistoryOutlined /> },
    { value: 'condition', label: 'Condition', icon: <BranchesOutlined /> },
    { value: 'end', label: 'End', icon: <CheckCircleOutlined /> }
  ];

  // Memoize the nodeTypes to prevent unnecessary re-renders
  const nodeTypes = useMemo(() => ({
    email: EmailNode,
    call: CallNode,
    sms: SMSNode,
    wait: WaitNode,
    condition: ConditionNode,
  }), []);

  // Update journey name when journey data changes
  useEffect(() => {
    if (journey) {
      setJourneyName(journey.name || 'New Journey');
    }
  }, [journey]);

  // Handle journey name save
  const handleJourneyNameSave = async () => {
    if (journeyName.trim() === '') {
      message.error('Journey name cannot be empty');
      return;
    }
    
    try {
      setLoading(true);
      
      if (id) {
        // Update existing journey
        await updateJourney(id, {
          name: journeyName,
          description: journey?.description || '',
          status: journey?.status || 'draft'
        });
        
        setJourney({
          ...journey,
          name: journeyName
        });
        
        message.success('Journey name updated successfully');
      } else {
        // For new journeys, just update the local state
        setJourney({
          ...journey,
          name: journeyName
        });
      }
    } catch (error) {
      console.error('Error updating journey name:', error);
      message.error('Failed to update journey name');
    } finally {
      setLoading(false);
      setIsEditingName(false);
    }
  };

  // Handle journey name cancel
  const handleJourneyNameCancel = () => {
    setJourneyName(journey?.name || 'New Journey');
    setIsEditingName(false);
  };

  // Fetch journey data
  useEffect(() => {
    const fetchJourney = async () => {
      if (id) {
        try {
          setLoading(true);
          const data = await getJourneyById(id);
          setJourney(data);
          
          // Position nodes horizontally (left to right) with more spacing for wider modules
          setNodes(data.steps.map((step, index) => ({
            id: step.id.toString(),
            type: step.action_type ? step.action_type.toLowerCase() : step.actionType.toLowerCase(),
            position: { x: 100 + (index * 500), y: 100 }, // Increased horizontal spacing for wider modules
            data: {
              ...step,
              actionType: step.action_type ? step.action_type.toLowerCase() : step.actionType.toLowerCase(),
              actionConfig: step.action_config || step.actionConfig,
              label: `${(step.action_type || step.actionType).charAt(0).toUpperCase() + (step.action_type || step.actionType).slice(1).toLowerCase()} ${index + 1}`,
              stepNumber: index + 1,
              onChange: (field, value) => handleNodeDataChange(step.id, field, value)
            }
          })));

          // Update edge connections for horizontal layout
          setEdges(data.steps.slice(0, -1).map((step, index) => ({
            id: `e${step.id}-${data.steps[index + 1].id}`,
            source: step.id.toString(),
            target: data.steps[index + 1].id.toString(),
            type: 'straight',
            animated: true,
            style: { stroke: '#bbb', strokeWidth: 1.5 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#bbb'
            }
          })));
        } catch (error) {
          console.error('Error fetching journey:', error);
          message.error('Failed to load journey');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchJourney();
  }, [id]);

  // Handle node data changes
  const handleNodeDataChange = async (nodeId, field, value) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId.toString()) {
          return {
            ...node,
            data: {
              ...node.data,
              [field]: value
            }
          };
        }
        return node;
      })
    );

    if (id) {
      try {
        setLoading(true);
        // Format the data according to the API requirements
        const updateData = {
          actionType: field === 'actionType' ? value : undefined,
          actionConfig: field === 'actionConfig' ? value : undefined,
          [field]: value
        };
        
        // Remove undefined fields
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === undefined) delete updateData[key];
        });
        
        await updateJourneyStep(id, nodeId, updateData);
        message.success('Step updated successfully');
      } catch (error) {
        console.error('Error updating step:', error);
        message.error('Failed to update step');
      } finally {
        setLoading(false);
      }
    }
  };

  // Optimize edge connection handling
  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge({
        ...params,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#333333', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#333333'
        }
      }, eds));
    },
    [setEdges]
  );

  // Handle node click
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setEditDrawerVisible(true);
    editForm.setFieldsValue(node.data);
  }, [editForm]);

  // Handle node drag and drop
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Add a function to generate a smaller numeric ID
  const generateNumericId = () => {
    // Generate a random number between 1000 and 9999
    return Math.floor(Math.random() * 9000) + 1000;
  };

  // Memory-optimized onDrop function with horizontal positioning
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance) {
        return;
      }

      // Validate node type
      const validTypes = ['email', 'call', 'sms', 'wait', 'condition', 'end'];
      if (!validTypes.includes(type)) {
        message.error(`Invalid node type: ${type}`);
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Check if this is the first module being dropped
      const currentNodes = reactFlowInstance.getNodes();
      const stepNumber = currentNodes.length + 1;
      let xPosition = 100; // Set a consistent starting x position
      let yPosition = 100; // Set a consistent starting y position

      if (currentNodes.length > 0) {
        const rightmostNode = currentNodes.reduce((rightmost, node) => 
          (node.position.x > rightmost.position.x) ? node : rightmost
        , currentNodes[0]);
        xPosition = rightmostNode.position.x + 500; // Increased spacing for wider modules
        yPosition = rightmostNode.position.y; // Align vertically with the rightmost node
      }

      // Get initial configuration for the node type
      const actionConfig = getInitialActionConfig(type);
      if (!actionConfig) {
        message.error(`Failed to get configuration for node type: ${type}`);
        return;
      }

      // Create node in a performance-optimized way
      const newNode = {
        id: generateNumericId().toString(),
        type,
        position: { x: xPosition, y: yPosition },
        data: {
          label: type.charAt(0).toUpperCase() + type.slice(1),
          actionConfig,
          stepNumber,
          actionType: type.toLowerCase()
        },
      };

      setNodes((nds) => nds.concat(newNode));
      
      // If there are existing nodes, connect the new node to the rightmost node
      if (currentNodes.length > 0) {
        const rightmostNode = currentNodes.reduce((rightmost, node) => 
          (node.position.x > rightmost.position.x) ? node : rightmost
        , currentNodes[0]);
        
        setEdges((eds) => eds.concat({
          id: `e${rightmostNode.id}-${newNode.id}`,
          source: rightmostNode.id,
          target: newNode.id,
          type: 'straight',
          animated: false,
          style: { stroke: '#bbb', strokeWidth: 1.5 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#bbb'
          }
        }));
      }
    },
    [reactFlowInstance, setNodes, setEdges, reactFlowWrapper]
  );

  const getInitialActionConfig = (type) => {
    switch (type.toLowerCase()) {
      case 'email':
        return {
          subject: '',
          template_id: '',
          variables: JSON.stringify({})
        };
      case 'call':
        return {
          script_id: '',
          max_attempts: 3,
          voicemail_message_id: '',
          transfer_extension: ''
        };
      case 'sms':
        return {
          message: '',
          template_id: '',
          variables: JSON.stringify({})
        };
      case 'wait':
        return {
          delay_minutes: 60
        };
      case 'condition':
        return {
          conditionType: 'contact_property',
          conditionConfig: JSON.stringify({})
        };
      case 'end':
        return {};
      default:
        return null;
    }
  };

  const handleSaveNode = async () => {
    try {
      const values = await editForm.validateFields();
      
      // Update the node data based on the node type
      const updatedData = { ...selectedNode.data };
      let actionType = selectedNode.type.toLowerCase();
      let actionConfig = {};
      
      switch (actionType) {
        case 'email':
          actionConfig = {
            subject: values.actionConfig.subject,
            template_id: values.actionConfig.template_id,
            variables: typeof values.actionConfig.variables === 'string' ? 
              values.actionConfig.variables : JSON.stringify(values.actionConfig.variables || {})
          };
          break;
        case 'call':
          actionConfig = {
            script_id: values.actionConfig.script_id,
            max_attempts: parseInt(values.actionConfig.max_attempts) || 3,
            voicemail_message_id: values.actionConfig.voicemail_message_id || '',
            transfer_extension: values.actionConfig.transfer_extension || ''
          };
          break;
        case 'sms':
          actionConfig = {
            message: values.actionConfig.message,
            template_id: values.actionConfig.template_id || '',
            variables: typeof values.actionConfig.variables === 'string' ? 
              values.actionConfig.variables : JSON.stringify(values.actionConfig.variables || {})
          };
          break;
        case 'wait':
          // Ensure delay_minutes is a valid number and at least 1
          const delayMinutes = parseInt(values.actionConfig.delay_minutes);
          if (isNaN(delayMinutes) || delayMinutes < 1) {
            message.error('Delay minutes must be a valid number greater than or equal to 1');
            return;
          }
          actionConfig = {
            delay_minutes: delayMinutes
          };
          break;
        case 'condition':
          actionConfig = {
            conditionType: values.actionConfig.conditionType,
            conditionConfig: typeof values.actionConfig.conditionConfig === 'string' ? 
              values.actionConfig.conditionConfig : JSON.stringify(values.actionConfig.conditionConfig || {})
          };
          break;
      }
      
      updatedData.actionConfig = actionConfig;
      updatedData.actionType = actionType;
      
      // Update the node in the flow
      const updatedNodes = nodes.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: updatedData
          };
        }
        return node;
      });
      
      setNodes(updatedNodes);
      
      // If this is an existing step, update it in the backend
      if (id && selectedNode.data.id) {
        const stepData = {
          actionType: actionType,
          actionConfig: actionConfig,
          sequenceOrder: selectedNode.data.stepNumber
        };
        
        // Add delayMinutes for wait nodes
        if (actionType === 'wait') {
          stepData.delayMinutes = parseInt(actionConfig.delay_minutes);
        }
        
        await updateJourneyStep(id, selectedNode.data.id, stepData);
      }
      
      setEditDrawerVisible(false);
      message.success('Node configuration saved successfully');
    } catch (error) {
      console.error('Error saving node:', error);
      message.error('Failed to save node configuration');
    }
  };

  // Add this function to set the React Flow instance with performance optimizations
  const onInit = useCallback((instance) => {
    setReactFlowInstance(instance);
    
    // Apply initial settings for better performance
    setTimeout(() => {
      // Use fitView to set initial view
      instance.fitView({ padding: 100 });
      
      // Get current viewport values
      const { x, y } = instance.getViewport();
      
      // Set viewport with a more zoomed out level
      instance.setViewport({
        x: x,
        y: y,
        zoom: 0.5 // Set a reasonable zoom level
      });

      // Zoom out three times
      for (let i = 0; i < 3; i++) {
        instance.zoomOut();
      }
    }, 100);
  }, []);

  // Disable wheel zoom completely for better performance
  const onWheel = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleSaveJourney = async () => {
    try {
      // Get all nodes and edges from the flow
      const flowNodes = nodes;
      const flowEdges = edges;

      // Validate that we have at least one node
      if (flowNodes.length === 0) {
        message.error('Journey must have at least one step');
        return;
      }

      // First create/update the journey without steps
      const journeyData = {
        name: journeyName,
        description: journey?.description || '',
        status: journey?.status || 'draft'
      };

      console.log('Saving journey with data:', JSON.stringify(journeyData, null, 2));

      let journeyId;
      
      // Update or create journey
      if (id) {
        await updateJourney(id, journeyData);
        journeyId = id;
        message.success('Journey updated successfully');
      } else {
        const newJourney = await createJourney(journeyData);
        journeyId = newJourney.id;
        message.success('Journey created successfully');
      }

      // Then add steps one by one
      if (journeyId) {
        for (const [index, node] of flowNodes.entries()) {
          // Skip end nodes as they don't need to be saved
          if (node.type === 'end') continue;

          // Get action type from node data or type, ensuring it's lowercase
          const actionType = (node.data.actionType || node.type).toLowerCase();
          
          // Validate action type
          const allowedTypes = ['email', 'call', 'sms', 'wait', 'condition'];
          if (!allowedTypes.includes(actionType)) {
            throw new Error(`Invalid action type "${actionType}" for step ${index + 1}`);
          }

          // Format action config based on node type
          let actionConfig = { ...node.data.actionConfig };
          let delayMinutes = null;
          
          // Special handling for wait nodes
          if (actionType === 'wait') {
            delayMinutes = parseInt(actionConfig.delay_minutes);
            if (isNaN(delayMinutes) || delayMinutes < 1) {
              throw new Error('Wait node must have a valid delay_minutes value greater than or equal to 1');
            }
          }

          // Create step data with required fields in the correct format for the API
          const stepData = {
            actionType: actionType,
            actionConfig: actionConfig,
            sequenceOrder: index + 1
          };

          // Add delayMinutes for wait nodes
          if (actionType === 'wait' && delayMinutes !== null) {
            stepData.delayMinutes = delayMinutes;
          }

          // If step already exists, update it
          if (node.data.id) {
            await updateJourneyStep(journeyId, node.data.id, stepData);
          } else {
            // Otherwise create a new step
            const newStep = await addJourneyStep(journeyId, stepData);
            // Update the node with the new step ID
            setNodes((nds) =>
              nds.map((n) => {
                if (n.id === node.id) {
                  return {
                    ...n,
                    data: {
                      ...n.data,
                      id: newStep.id
                    }
                  };
                }
                return n;
              })
            );
          }
        }
      }

      // If this was a new journey, navigate to the new journey page
      if (!id && journeyId) {
        navigate(`/journeys/${journeyId}`);
      }
    } catch (error) {
      console.error('Error saving journey:', error);
      message.error(error.message || 'Failed to save journey');
    }
  };

  // Handle journey cloning
  const handleCloneJourney = async () => {
    try {
      setLoading(true);
      // Clone journey with current name + (Copy)
      const clonedJourney = await cloneJourney(id, `${journeyName} (Copy)`);
      message.success('Journey cloned successfully');
      navigate(`/journeys/${clonedJourney.journey.id}`);
    } catch (error) {
      console.error('Error cloning journey:', error);
      message.error('Failed to clone journey');
    } finally {
      setLoading(false);
    }
  };

  // Render node configuration fields based on node type
  const renderConfigFields = (type, form) => {
    switch (type) {
      case 'email':
        return (
          <>
            <Form.Item
              name={['actionConfig', 'subject']}
              label="Subject"
              rules={[{ required: true, message: 'Please enter email subject' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name={['actionConfig', 'template_id']}
              label="Template"
              rules={[{ required: true, message: 'Please select email template' }]}
            >
              <Select>
                <Select.Option value="template1">Welcome Email</Select.Option>
                <Select.Option value="template2">Follow-up Email</Select.Option>
                <Select.Option value="template3">Reminder Email</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name={['actionConfig', 'variables']}
              label="Variables"
            >
              <Input.TextArea rows={4} placeholder="Enter variables in JSON format" />
            </Form.Item>
          </>
        );

      case 'call':
        return (
          <>
            <Form.Item
              name={['actionConfig', 'script_id']}
              label="Script"
              rules={[{ required: true, message: 'Please select call script' }]}
            >
              <Select>
                <Select.Option value="script1">Initial Call</Select.Option>
                <Select.Option value="script2">Follow-up Call</Select.Option>
                <Select.Option value="script3">Support Call</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name={['actionConfig', 'max_attempts']}
              label="Max Attempts"
              rules={[{ required: true, message: 'Please enter max attempts' }]}
            >
              <InputNumber min={1} max={5} />
            </Form.Item>
            <Form.Item
              name={['actionConfig', 'voicemail_message_id']}
              label="Voicemail Message"
            >
              <Select allowClear>
                <Select.Option value="vm1">Standard Voicemail</Select.Option>
                <Select.Option value="vm2">Custom Voicemail</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name={['actionConfig', 'transfer_extension']}
              label="Transfer Extension"
            >
              <Input placeholder="Enter extension number" />
            </Form.Item>
          </>
        );

      case 'sms':
        return (
          <>
            <Form.Item
              name={['actionConfig', 'message']}
              label="Message"
              rules={[{ required: true, message: 'Please enter SMS message' }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item
              name={['actionConfig', 'template_id']}
              label="Template"
            >
              <Select allowClear>
                <Select.Option value="sms1">Welcome SMS</Select.Option>
                <Select.Option value="sms2">Reminder SMS</Select.Option>
                <Select.Option value="sms3">Alert SMS</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name={['actionConfig', 'variables']}
              label="Variables"
            >
              <Input.TextArea rows={4} placeholder="Enter variables in JSON format" />
            </Form.Item>
          </>
        );

      case 'wait':
        return (
          <Form.Item
            name={['actionConfig', 'delay_minutes']}
            label="Delay (minutes)"
            rules={[
              { required: true, message: 'Please enter delay duration' },
              { type: 'number', min: 1, message: 'Delay must be at least 1 minute' },
              { type: 'integer', message: 'Delay must be a whole number' }
            ]}
          >
            <InputNumber 
              min={1} 
              max={1440} 
              placeholder="Enter delay in minutes"
              style={{ width: '100%' }}
            />
          </Form.Item>
        );

      case 'condition':
        return (
          <>
            <Form.Item
              name={['actionConfig', 'conditionType']}
              label="Condition Type"
              rules={[{ required: true, message: 'Please select condition type' }]}
            >
              <Select>
                <Select.Option value="response">Response Based</Select.Option>
                <Select.Option value="time">Time Based</Select.Option>
                <Select.Option value="custom">Custom Logic</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name={['actionConfig', 'conditionConfig']}
              label="Condition Configuration"
              rules={[{ required: true, message: 'Please enter condition configuration' }]}
            >
              <Input.TextArea rows={4} placeholder="Enter condition configuration in JSON format" />
            </Form.Item>
          </>
        );

      default:
        return null;
    }
  };

  // Add a function to handle zooming out with a specific zoom level
  const handleZoomOut = () => {
    if (!reactFlowInstance) return;
    // Get current viewport
    const { x, y, zoom } = reactFlowInstance.getViewport();
    // Set a new viewport with a lower zoom level
    reactFlowInstance.setViewport({ x, y, zoom: Math.max(0.1, zoom - 0.5) });
  };
  
  // Add a function to handle zooming in
  const handleZoomIn = () => {
    if (!reactFlowInstance) return;
    // Get current viewport
    const { x, y, zoom } = reactFlowInstance.getViewport();
    // Set a new viewport with a higher zoom level
    reactFlowInstance.setViewport({ x, y, zoom: Math.min(2, zoom + 0.5) });
  };
  
  // Add a function to reset zoom to fit all nodes
  const handleFitView = () => {
    if (!reactFlowInstance) return;
    reactFlowInstance.fitView({ padding: 0.2 });
  };

  return (
    <div className="journey-builder">
      <Spin spinning={loading}>
        <Card className="journey-header-card">
          <div className="journey-header">
            <div>
              {isEditingName ? (
                <div className="journey-name-edit">
                  <Input
                    value={journeyName}
                    onChange={(e) => setJourneyName(e.target.value)}
                    onPressEnter={handleJourneyNameSave}
                    onBlur={handleJourneyNameSave}
                    autoFocus
                  />
                  <Space>
                    <Button size="small" onClick={handleJourneyNameCancel}>
                      Cancel
                    </Button>
                    <Button size="small" type="primary" onClick={handleJourneyNameSave}>
                      Save
                    </Button>
                  </Space>
                </div>
              ) : (
                <Title 
                  level={2} 
                  onClick={() => setIsEditingName(true)}
                  style={{ cursor: 'pointer' }}
                >
                  {journeyName} <EditOutlined style={{ fontSize: '16px' }} />
                </Title>
              )}
              
              <Row gutter={16} style={{ marginTop: '10px' }} className="journey-header-details">
                <Col span={12}>
                  <Form layout="vertical" initialValues={{ description: journey?.description || '' }}>
                    <Form.Item label="Description" style={{ marginBottom: '8px' }}>
                      <TextArea 
                        rows={2} 
                        placeholder="Enter journey description" 
                        defaultValue={journey?.description || ''}
                        onBlur={(e) => {
                          if (journey?.description !== e.target.value) {
                            if (id) {
                              updateJourney(id, {
                                name: journeyName,
                                description: e.target.value,
                                status: journey?.status || 'draft'
                              }).then(() => {
                                setJourney({
                                  ...journey,
                                  description: e.target.value
                                });
                                message.success('Description updated');
                              });
                            } else {
                              setJourney({
                                ...journey,
                                description: e.target.value
                              });
                            }
                          }
                        }}
                      />
                    </Form.Item>
                  </Form>
                </Col>
                <Col span={12}>
                  <Form layout="vertical" initialValues={{ status: journey?.status || 'draft' }}>
                    <Form.Item label="Status" style={{ marginBottom: '8px' }}>
                      <Select 
                        defaultValue={journey?.status || 'draft'}
                        style={{ width: '100%' }}
                        onChange={(value) => {
                          if (journey?.status !== value) {
                            if (id) {
                              updateJourney(id, {
                                name: journeyName,
                                description: journey?.description || '',
                                status: value
                              }).then(() => {
                                setJourney({
                                  ...journey,
                                  status: value
                                });
                                message.success('Status updated');
                              });
                            } else {
                              setJourney({
                                ...journey,
                                status: value
                              });
                            }
                          }
                        }}
                      >
                        <Option value="draft">Draft</Option>
                        <Option value="active">Active</Option>
                        <Option value="paused">Paused</Option>
                        <Option value="archived">Archived</Option>
                      </Select>
                    </Form.Item>
                  </Form>
                </Col>
              </Row>
            </div>
            <Space>
              <Button.Group>
                <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} />
                <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
                <Button icon={<FullscreenOutlined />} onClick={handleFitView} />
              </Button.Group>
              {id && (
                <Button
                  icon={<CopyOutlined />}
                  onClick={handleCloneJourney}
                >
                  Clone Journey
                </Button>
              )}
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={handleSaveJourney}
                loading={loading}
              >
                Save Journey
              </Button>
            </Space>
          </div>
        </Card>

        <div className="journey-builder-content">
          <div className="node-palette">
            <Title level={5}>Modules</Title>
            <div className="node-palette-items">
              {actionTypes.map((type) => (
                <div
                  key={type.value}
                  className="node-palette-item"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/reactflow', type.value);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                >
                  {type.icon}
                  <span>{type.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flow-container" ref={reactFlowWrapper}>
            <Suspense fallback={<div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin tip="Loading flow editor..." /></div>}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onWheel={onWheel}
                onInit={onInit}
                nodeTypes={nodeTypes}
                defaultViewport={{ x: 0, y: 0, zoom: 0.4 }}
                minZoom={0.2}
                maxZoom={2}
                fitView
                defaultEdgeOptions={{
                  type: 'straight',
                  animated: false,
                  style: { stroke: '#bbb', strokeWidth: 1.5 },
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: '#bbb'
                  }
                }}
                connectionMode="loose"
                snapToGrid={true}
                snapGrid={[20, 20]}
                elevateNodesOnSelect={true}
                nodesDraggable={true}
                nodesConnectable={true}
                zoomOnScroll={false}
                zoomOnPinch={true}
                zoomOnDoubleClick={false}
                panOnDrag={true}
                selectionOnDrag={false}
                panOnScroll={false}
                preventScrolling={true}
              >
                <Controls showInteractive={false} />
                <MiniMap 
                  style={{ height: 120 }} 
                  zoomable={true} 
                  pannable={true}
                  nodeColor={(node) => {
                    return '#ffffff';
                  }}
                  maskColor="rgba(240, 240, 240, 0.7)"
                  borderRadius={5}
                />
              </ReactFlow>
            </Suspense>
          </div>
        </div>

        {/* Node Edit Drawer */}
        <Drawer
          title={`Edit ${selectedNode?.type || ''} Node`}
          placement="right"
          onClose={() => {
            setEditDrawerVisible(false);
            setSelectedNode(null);
            editForm.resetFields();
          }}
          open={editDrawerVisible}
          width={400}
          extra={
            <Space>
              <Button onClick={() => {
                setEditDrawerVisible(false);
                setSelectedNode(null);
                editForm.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" onClick={handleSaveNode}>
                Save
              </Button>
            </Space>
          }
        >
          <Form
            form={editForm}
            layout="vertical"
            initialValues={selectedNode?.data}
          >
            {renderConfigFields(selectedNode?.type, editForm)}
          </Form>
        </Drawer>
      </Spin>
    </div>
  );
};

// Main component that wraps the flow with ReactFlowProvider
const JourneyBuilderList = () => {
  return (
    <ReactFlowProvider>
      <JourneyBuilderFlow />
    </ReactFlowProvider>
  );
};

export default JourneyBuilderList;