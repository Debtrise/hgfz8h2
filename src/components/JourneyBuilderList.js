import React, { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense, memo } from 'react';
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
  ReactFlowProvider,
  Position,
  BaseEdge,
  EdgeLabelRenderer,
  applyNodeChanges,
  getBezierPath
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
  Alert,
  Tooltip,
  Dropdown,
  Menu
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
  FullscreenOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ExportOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  CloseOutlined
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
import ReactDOM from 'react-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// Lazy load the ReactFlow component for better initial load time
const ReactFlow = lazy(() => import('reactflow').then(module => ({ default: module.default })));

// Custom node components with memo for better performance - simplified without detailed content
const EmailNode = React.memo(({ data }) => {
  const { stepNumber, onDelete, isFirstNode, actionConfig } = data;
  return (
    <div className="node">
      {!isFirstNode && <Handle type="target" position="top" />}
      <div className="node-header">
        <span><MailOutlined style={{ marginRight: 8, color: '#579dca' }} /> Email</span> <span className="step-number">{stepNumber}</span>
      </div>
      {actionConfig?.subject && (
        <div className="node-detail"><strong>Subject:</strong> {actionConfig.subject}</div>
      )}
      {actionConfig?.template_id && (
        <div className="node-detail"><strong>Template:</strong> {actionConfig.template_id}</div>
      )}
      <div className="node-delete-btn" onClick={() => onDelete && onDelete(data.id)}>×</div>
      <Handle type="source" position="bottom" />
    </div>
  );
});

const CallNode = React.memo(({ data }) => {
  const { stepNumber, onDelete, isFirstNode, actionConfig } = data;
  return (
    <div className="node">
      {!isFirstNode && <Handle type="target" position="top" />}
      <div className="node-header">
        <span><PhoneOutlined style={{ marginRight: 8, color: '#579dca' }} /> Call</span> <span className="step-number">{stepNumber}</span>
      </div>
      {actionConfig?.script_id && (
        <div className="node-content">
          <div className="node-detail"><strong>Script:</strong> {actionConfig.script_id}</div>
          <div className="node-detail"><strong>Max Attempts:</strong> {actionConfig.max_attempts || 3}</div>
        </div>
      )}
      <div className="node-delete-btn" onClick={() => onDelete && onDelete(data.id)}>×</div>
      <Handle type="source" position="bottom" />
    </div>
  );
});

const SMSNode = React.memo(({ data }) => {
  const { stepNumber, onDelete, isFirstNode, actionConfig } = data;
  return (
    <div className="node">
      {!isFirstNode && <Handle type="target" position="top" />}
      <div className="node-header">
        <span><MessageOutlined style={{ marginRight: 8, color: '#579dca' }} /> SMS</span> <span className="step-number">{stepNumber}</span>
      </div>
      {actionConfig?.message && (
        <div className="node-content">
          <div className="node-detail node-message">{actionConfig.message.substring(0, 50)}{actionConfig.message.length > 50 ? '...' : ''}</div>
        </div>
      )}
      <div className="node-delete-btn" onClick={() => onDelete && onDelete(data.id)}>×</div>
      <Handle type="source" position="bottom" />
    </div>
  );
});

const WaitNode = React.memo(({ data }) => {
  const { stepNumber, onDelete, isFirstNode, actionConfig } = data;
  const delayMinutes = actionConfig?.delay_minutes || 60;
  
  return (
    <div className="wait-tag-node">
      {!isFirstNode && <Handle type="target" position="top" />}
      <div className="wait-icon"></div>
      <span className="wait-label">Wait:</span>
      <span className="wait-time">{delayMinutes}m</span>
      {onDelete && <div className="node-delete-btn" onClick={() => onDelete(data.id)}>×</div>}
      <Handle type="source" position="bottom" />
    </div>
  );
});

const ConditionNode = React.memo(({ data }) => {
  const { stepNumber, onDelete, isFirstNode, actionConfig } = data;
  return (
    <div className="node">
      {!isFirstNode && <Handle type="target" position="top" />}
      <div className="node-header">
        <span><BranchesOutlined style={{ marginRight: 8, color: '#579dca' }} /> Condition</span> <span className="step-number">{stepNumber}</span>
      </div>
      {actionConfig?.conditionType && (
        <div className="node-content">
          <div className="node-detail"><strong>Type:</strong> {actionConfig.conditionType}</div>
        </div>
      )}
      <div className="node-delete-btn" onClick={() => onDelete && onDelete(data.id)}>×</div>
      <Handle type="source" position="bottom" id="true" />
      <Handle type="source" position="right" id="false" />
    </div>
  );
});

// Day Start Node Component
const DayStartNode = memo(({ data, isConnectable, onDelete }) => {
  const dayNumber = data?.dayNumber || 1;
  
  return (
    <div className="react-flow__node-default" data-type="dayStart">
      <div className="node">
        <Handle
          type="source"
          position="bottom"
          style={{ background: '#fff', width: 8, height: 8, border: '2px solid #1890ff' }}
          isConnectable={isConnectable}
        />
        <div className="node-header">
          <span>Day {dayNumber}</span>
        </div>
        <button className="node-delete-btn" onClick={onDelete}>
          ×
        </button>
      </div>
    </div>
  );
});

// Day End Node Component
const DayEndNode = memo(({ data, isConnectable, onDelete }) => {
  const dayNumber = data?.dayNumber || 1;
  
  return (
    <div className="react-flow__node-default" data-type="dayEnd">
      <div className="node">
        <Handle
          type="target"
          position="top"
          style={{ background: '#fff', width: 8, height: 8, border: '2px solid #1890ff' }}
          isConnectable={isConnectable}
        />
        <div className="node-header">
          <span>Day {dayNumber}</span>
        </div>
        <button className="node-delete-btn" onClick={onDelete}>
          ×
        </button>
      </div>
    </div>
  );
});

// Custom edge component with tooltip
const EdgeWithTooltip = ({ id, source, target, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd, data, ...props }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const edgeRef = useRef(null);
  
  const onMouseEnter = (e) => {
    if (edgeRef.current) {
      const rect = edgeRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: (sourceX + targetX) / 2,
        y: (sourceY + targetY) / 2
      });
      setShowTooltip(true);
    }
  };
  
  const onMouseLeave = () => {
    setShowTooltip(false);
  };
  
  // Use the standard bezier path directly without BaseEdge
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.7,
  });

  // Calculate position for the separator (at 25% of the path)
  const separatorX = sourceX + (targetX - sourceX) * 0.25;
  const separatorY = sourceY + (targetY - sourceY) * 0.25;

  return (
    <>
      <path
        id={id}
        ref={edgeRef}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
      {data?.sourceNode?.type === 'dayBreak' && (
        <EdgeLabelRenderer>
          <div
            className="day-break-separator"
            style={{
              transform: `translate(-50%, -50%) translate(${separatorX}px,${separatorY}px)`,
            }}
          >
            <div className="day-break-separator-line" />
            <ArrowRightOutlined />
            <span>Next Day</span>
          </div>
        </EdgeLabelRenderer>
      )}
      {showTooltip && data?.tooltip && (
        <EdgeLabelRenderer>
          <div
            className="edge-tooltip"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${tooltipPosition.x}px, ${tooltipPosition.y}px)`,
              pointerEvents: 'none',
            }}
          >
            {data.tooltip}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

// Create a separate component for the flow content
const JourneyBuilderFlow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  
  // Add journey state back
  const [journey, setJourney] = useState(null);
  const [nodes, setNodes] = useState([]);
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
  const { getNodes } = useReactFlow();

  // Define action types with their icons
  const actionTypes = [
    { value: 'email', label: 'Email', icon: <MailOutlined style={{ color: '#579dca' }} /> },
    { value: 'call', label: 'Call', icon: <PhoneOutlined style={{ color: '#579dca' }} /> },
    { value: 'sms', label: 'SMS', icon: <MessageOutlined style={{ color: '#579dca' }} /> },
    { value: 'wait', label: 'Wait', icon: <HistoryOutlined style={{ color: '#579dca' }} /> },
    { value: 'condition', label: 'Condition', icon: <BranchesOutlined style={{ color: '#579dca' }} /> },
    { value: 'dayStart', label: 'Day Start', icon: <CalendarOutlined style={{ color: '#52c41a' }} /> },
    { value: 'dayEnd', label: 'Day End', icon: <CalendarOutlined style={{ color: '#f5222d' }} /> }
  ];

  // Memoize the nodeTypes to prevent unnecessary re-renders
  const nodeTypes = useMemo(() => ({
    email: EmailNode,
    call: CallNode,
    sms: SMSNode,
    wait: WaitNode,
    condition: ConditionNode,
    dayStart: DayStartNode,
    dayEnd: DayEndNode
  }), []);

  // Define custom edge types with our tooltip edge
  const edgeTypes = useMemo(() => ({
    bezier: EdgeWithTooltip,
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
          
          // Position nodes vertically (top to bottom) with more central positioning
          setNodes(data.steps.map((step, index) => ({
            id: step.id.toString(),
            type: step.action_type ? step.action_type.toLowerCase() : step.actionType.toLowerCase(),
            position: { x: 400, y: 100 + (index * 180) }, // Centered positioning with reasonable spacing
            data: {
              ...step,
              actionType: step.action_type ? step.action_type.toLowerCase() : step.actionType.toLowerCase(),
              actionConfig: step.action_config || step.actionConfig,
              label: `${(step.action_type || step.actionType).charAt(0).toUpperCase() + (step.action_type || step.actionType).slice(1).toLowerCase()} ${index + 1}`,
              stepNumber: index + 1,
              isFirstNode: index === 0, // Mark first node
              onDelete: handleDeleteNode,
              onChange: (field, value) => handleNodeDataChange(step.id, field, value)
            }
          })));

          // Update edge connections for vertical layout
          setEdges(data.steps.slice(0, -1).map((step, index) => ({
            id: `e${step.id}-${data.steps[index + 1].id}`,
            source: step.id.toString(),
            target: data.steps[index + 1].id.toString(),
            type: 'bezier',
            animated: true,
            style: { stroke: '#d9d9d9', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#d9d9d9'
            },
            data: {
              tooltip: `${data.steps[index].action_type} → ${data.steps[index + 1].action_type}`
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

  // Custom onNodesChange that maintains first node status
  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => {
      const newNodes = applyNodeChanges(changes, nds);
      
      // After position changes, update the isFirstNode flag
      const positionChanges = changes.filter(change => 
        change.type === 'position' && change.position
      );
      
      if (positionChanges.length > 0) {
        // Find the node with the lowest y position
        if (newNodes.length > 0) {
          const topNode = newNodes.reduce((top, node) => 
            (node.position.y < top.position.y) ? node : top
          , newNodes[0]);
          
          // Update isFirstNode flag
          return newNodes.map(node => ({
            ...node,
            data: {
              ...node.data,
              isFirstNode: node.id === topNode.id
            }
          }));
        }
      }
      
      return newNodes;
    });
  }, []);

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

  // Optimize edge connection handling - make connections looser with more bends
  const onConnect = useCallback(
    (params) => {
      // Get source node to determine edge type
      const sourceNode = nodes.find(node => node.id === params.source);
      const targetNode = nodes.find(node => node.id === params.target);
      
      if (!sourceNode || !targetNode) return;

      // Create a tooltip with info about the connection
      const sourceLabel = sourceNode ? sourceNode.data.label : '';
      const targetLabel = targetNode ? targetNode.data.label : '';
      const tooltip = `${sourceLabel} → ${targetLabel}`;
      
      setEdges((eds) => addEdge({
        ...params,
        type: 'bezier',
        animated: true,
        data: { 
          tooltip,
          sourceNode: {
            type: sourceNode.type,
            data: sourceNode.data
          }
        },
        style: { stroke: '#d9d9d9', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#d9d9d9',
          width: 0,
          height: 0
        },
        curvature: 0.3,
      }, eds));
    },
    [setEdges, nodes]
  );

  // Handle node click
  const onNodeClick = useCallback((event, node) => {
    // If clicking on delete button, don't open node details
    if (event.target.className.includes('node-delete-btn')) {
      return;
    }
    
    setSelectedNode(node);
    setEditDrawerVisible(true);
    editForm.setFieldsValue(node.data);
  }, [editForm]);

  // Add a function to update day break numbers
  const updateDayBreakNumbers = useCallback(() => {
    setNodes((nds) => {
      // Get all day break nodes sorted by vertical position
      const dayBreakNodes = nds
        .filter(node => node.type === 'dayBreak')
        .sort((a, b) => a.position.y - b.position.y);

      // Update day numbers sequentially
      const updatedNodes = [...nds];
      dayBreakNodes.forEach((node, index) => {
        const nodeIndex = updatedNodes.findIndex(n => n.id === node.id);
        if (nodeIndex !== -1) {
          updatedNodes[nodeIndex] = {
            ...updatedNodes[nodeIndex],
            data: {
              ...updatedNodes[nodeIndex].data,
              dayNumber: index + 1
            }
          };
        }
      });

      return updatedNodes;
    });
  }, [setNodes]);

  // Update the delete handler to include day number updates
  const handleDeleteNode = useCallback((nodeId) => {
    // Find edges connected to this node
    const connectingEdges = edges.filter(
      (edge) => edge.source === nodeId || edge.target === nodeId
    );
    
    // Remove the edges
    if (connectingEdges.length > 0) {
      setEdges((eds) => eds.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ));
    }
    
    // Remove the node and update firstNode status
    setNodes((nds) => {
      const filteredNodes = nds.filter((node) => node.id !== nodeId);
      
      // Update the isFirstNode flag after deletion
      if (filteredNodes.length > 0) {
        // Find the node with the lowest y position to make it the first
        const topNode = filteredNodes.reduce((top, node) => 
          (node.position.y < top.position.y) ? node : top
        , filteredNodes[0]);
        
        return filteredNodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            isFirstNode: node.id === topNode.id
          }
        }));
      }
      
      return filteredNodes;
    });
    
    // If this is an existing step in the database, delete it
    if (id) {
      try {
        deleteJourneyStep(id, nodeId).catch(error => {
          console.error('Error deleting step:', error);
          message.error('Failed to delete step from the database');
        });
      } catch (error) {
        console.error('Error deleting step:', error);
      }
    }

    // Update day break numbers after deletion
    updateDayBreakNumbers();
    
    message.success('Node deleted successfully');
  }, [edges, setEdges, setNodes, id, updateDayBreakNumbers]);

  // Add effect to update day numbers when nodes change position
  useEffect(() => {
    updateDayBreakNumbers();
  }, [nodes.map(node => node.position.y).join(','), updateDayBreakNumbers]);

  // Visually highlight the drop area when dragging
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    // Add a class to the pane for visual feedback
    const paneElement = document.querySelector('.react-flow__pane');
    if (paneElement) {
      paneElement.classList.add('dropping');
    }
  }, []);
  
  // Remove the highlight when drag leaves or ends
  const onDragLeave = useCallback(() => {
    const paneElement = document.querySelector('.react-flow__pane');
    if (paneElement) {
      paneElement.classList.remove('dropping');
    }
  }, []);

  // Add a function to generate a smaller numeric ID
  const generateNumericId = () => {
    // Generate a random number between 1000 and 9999
    return Math.floor(Math.random() * 9000) + 1000;
  };

  // Add a function to find the first node of the current day
  const findFirstNodeOfDay = useCallback((nodes, targetY) => {
    // Get all day break nodes sorted by vertical position
    const dayBreakNodes = nodes
      .filter(node => node.type === 'dayBreak')
      .sort((a, b) => a.position.y - b.position.y);

    // Find the day break node that's above our target Y position
    const previousDayBreak = dayBreakNodes
      .filter(node => node.position.y < targetY)
      .pop();

    // If no previous day break found, return the first node overall
    if (!previousDayBreak) {
      const firstNode = nodes
        .filter(node => node.type !== 'dayBreak')
        .sort((a, b) => a.position.y - b.position.y)[0];
      return firstNode || null;
    }

    // Find the first non-day-break node after the previous day break
    const firstNodeOfDay = nodes
      .filter(node => 
        node.type !== 'dayBreak' && 
        node.position.y > previousDayBreak.position.y
      )
      .sort((a, b) => a.position.y - b.position.y)[0];

    return firstNodeOfDay || null;
  }, []);

  // Add a function to find the first node of the previous day
  const findFirstNodeOfPreviousDay = useCallback((nodes, dayBreakY) => {
    // Get all day break nodes sorted by vertical position
    const dayBreakNodes = nodes
      .filter(node => node.type === 'dayBreak')
      .sort((a, b) => a.position.y - b.position.y);

    // Find the day break node that's above our current day break
    const previousDayBreak = dayBreakNodes
      .filter(node => node.position.y < dayBreakY)
      .pop();

    // If no previous day break, get the very first node
    if (!previousDayBreak) {
      const firstNode = nodes
        .filter(node => node.type !== 'dayBreak')
        .sort((a, b) => a.position.y - b.position.y)[0];
      return firstNode || { position: { x: 400 } }; // Default x position if no node found
    }

    // Find the first non-day-break node after the previous day break
    const firstNodeOfPreviousDay = nodes
      .filter(node => 
        node.type !== 'dayBreak' && 
        node.position.y > previousDayBreak.position.y &&
        node.position.y < dayBreakY
      )
      .sort((a, b) => a.position.y - b.position.y)[0];

    return firstNodeOfPreviousDay || { position: { x: 400 } }; // Default x position if no node found
  }, []);

  // Update the onDrop function to create day containers
  const onDrop = useCallback((event) => {
    event.preventDefault();

    const type = event.dataTransfer.getData('application/reactflow');
    const currentNodes = getNodes();
    const lastNode = currentNodes.length > 0 ? currentNodes[currentNodes.length - 1] : null;
    
    if (typeof type === 'undefined' || !type) {
      return;
    }

    // Get all day start and end nodes
    const dayNodes = currentNodes.filter(node => 
      node.type === 'dayStart' || node.type === 'dayEnd'
    );

    // Count complete day pairs (start + end)
    const dayStarts = dayNodes.filter(node => node.type === 'dayStart');
    const dayEnds = dayNodes.filter(node => node.type === 'dayEnd');
    const completeDays = Math.min(dayStarts.length, dayEnds.length);
    
    // The next day number is the number of complete day pairs + 1
    const newDayNumber = completeDays + 1;

    let position = { x: 0, y: 0 };
    let nodeData = {};
    let nodesToAdd = [];

    // If this is the first node being placed, create a Day 1 Start node first
    if (currentNodes.length === 0 && type !== 'dayStart' && type !== 'dayEnd') {
      const dayStartNode = {
        id: `dayStart_${generateNumericId()}`,
        type: 'dayStart',
        position: { x: 100, y: 30 }, // Position 40% higher (50 * 0.6 = 30)
        data: {
          dayNumber: 1,
          label: 'Day 1 Start'
        }
      };
      nodesToAdd.push(dayStartNode);
      position = { x: 100, y: 150 }; // Keep the first node at the same position
    }

    if (type === 'dayEnd') {
      // Position day end node below the last node
      position = lastNode 
        ? { x: lastNode.position.x, y: lastNode.position.y + 200 }
        : { x: 100, y: 100 };
      
      nodeData = {
        dayNumber: newDayNumber,
        label: `Day ${newDayNumber} End`
      };

      // Create the day end node
      const dayEndNode = {
        id: `dayEnd_${generateNumericId()}`,
        type: 'dayEnd',
        position,
        data: nodeData
      };

      nodesToAdd.push(dayEndNode);

      // Create a day start node for the next day
      const dayStartNode = {
        id: `dayStart_${generateNumericId()}`,
        type: 'dayStart',
        position: { x: position.x + 300, y: 30 }, // Position 40% higher (50 * 0.6 = 30)
        data: {
          dayNumber: newDayNumber + 1,
          label: `Day ${newDayNumber + 1} Start`
        }
      };

      nodesToAdd.push(dayStartNode);

      // If there's a last node, create an edge from it to the day end node
      if (lastNode) {
        const newEdge = {
          id: `e${lastNode.id}-${dayEndNode.id}`,
          source: lastNode.id,
          target: dayEndNode.id,
          type: 'bezier',
          animated: true,
          style: { stroke: '#d9d9d9', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#d9d9d9',
            width: 0,
            height: 0
          }
        };
        setEdges((eds) => eds.concat(newEdge));
      }
    } else if (type === 'dayStart') {
      // Position day start node at the top of a new column
      position = lastNode 
        ? { x: lastNode.position.x + 300, y: 30 } // Position 40% higher (50 * 0.6 = 30)
        : { x: 100, y: 30 }; // Position 40% higher (50 * 0.6 = 30)
      
      nodeData = {
        dayNumber: newDayNumber,
        label: `Day ${newDayNumber} Start`
      };

      const newNode = {
        id: `dayStart_${generateNumericId()}`,
        type: 'dayStart',
        position,
        data: nodeData
      };

      nodesToAdd.push(newNode);
    } else {
      // For non-day nodes, if the last node was a day end,
      // start at the top of the next column
      if (lastNode?.type === 'dayEnd') {
        position = {
          x: lastNode.position.x + 300, // Move to next column
          y: 150 // Start below the day start node
        };
      } else if (currentNodes.length === 0) {
        // Position is already set above for the first node
      } else {
        position = lastNode
          ? { x: lastNode.position.x, y: lastNode.position.y + 150 }
          : { x: 100, y: 150 };
      }
      
      nodeData = {
        label: `New ${type} Node`
      };

      const newNode = {
        id: `${type}_${generateNumericId()}`,
        type,
        position,
        data: nodeData
      };

      nodesToAdd.push(newNode);

      // If there's a last node, create an edge from it to the new node
      if (lastNode || currentNodes.length === 0) {
        const sourceNode = lastNode || nodesToAdd[0]; // Use the day start node if this is the first node
        const newEdge = {
          id: `e${sourceNode.id}-${newNode.id}`,
          source: sourceNode.id,
          target: newNode.id,
          type: 'bezier',
          animated: true,
          style: { stroke: '#d9d9d9', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#d9d9d9',
            width: 0,
            height: 0
          }
        };
        setEdges((eds) => eds.concat(newEdge));
      }
    }

    setNodes((nds) => nds.concat(nodesToAdd));
  }, [getNodes, setNodes, setEdges]);

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
      case 'dayBreak':
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
      
      // Update all nodes of the same type to share the configuration
      const updatedNodes = nodes.map((node) => {
        if (node.type === selectedNode.type) {
          // Preserve node-specific data like ID, stepNumber, isFirstNode
          const nodeSpecificData = {
            id: node.data.id,
            stepNumber: node.data.stepNumber,
            label: node.data.label,
            onDelete: node.data.onDelete,
            isFirstNode: node.data.isFirstNode
          };
          
          // For the selected node, update all data
          if (node.id === selectedNode.id) {
            return {
              ...node,
              data: {
                ...updatedData,
                ...nodeSpecificData
              }
            };
          }
          
          // For other nodes of the same type, update just the actionConfig
          return {
            ...node,
            data: {
              ...node.data,
              actionConfig: actionConfig
            }
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
      message.success('Node configuration saved and shared with nodes of the same type');
    } catch (error) {
      console.error('Error saving node:', error);
      message.error('Failed to save node configuration');
    }
  };

  // Combine onInit handlers
  const onInit = useCallback((instance) => {
    setReactFlowInstance(instance);
    // Add any other initialization logic here
  }, []);

  // Disable wheel zoom completely for better performance
  const onWheel = useCallback((event) => {
    event.preventDefault();
  }, []);

  // Modify handleSaveJourney to handle day separation purely on the frontend
  const handleSaveJourney = () => {
    try {
      // Get all nodes and edges from the flow
      const flowNodes = nodes;
      const flowEdges = edges;

      // Validate that we have at least one node
      if (flowNodes.length === 0) {
        message.error('Journey must have at least one step');
        return;
      }

      // Find all day break nodes and sort them by vertical position
      const dayBreakNodes = flowNodes
        .filter(node => node.type === 'dayBreak')
        .sort((a, b) => a.position.y - b.position.y);

      // If no day breaks, just show a success message
      if (dayBreakNodes.length === 0) {
        message.success('Journey saved successfully');
        return;
      }

      // Create an array to store all journeys
      const journeys = [];
      let currentDay = 1;
      let currentNodes = [];
      let currentEdges = [];

      // Process nodes in sequence
      for (let i = 0; i < flowNodes.length; i++) {
        const node = flowNodes[i];
        
        // If this is a day break node, save the current journey and start a new one
        if (node.type === 'dayBreak') {
          if (currentNodes.length > 0) {
            journeys.push({
              dayNumber: currentDay,
              name: `${journeyName} - Day ${currentDay}`,
              nodes: [...currentNodes],
              edges: [...currentEdges]
            });
            currentNodes = [];
            currentEdges = [];
          }
          currentDay = node.data.dayNumber; // Use the node's dayNumber instead of incrementing
          continue;
        }

        // Add node to current journey
        currentNodes.push(node);

        // Add edges that connect nodes in the current journey
        const nodeEdges = flowEdges.filter(e => 
          currentNodes.some(n => n.id === e.source) && 
          currentNodes.some(n => n.id === e.target)
        );
        currentEdges = [...new Set([...currentEdges, ...nodeEdges])];
      }

      // Add the last journey if there are remaining nodes
      if (currentNodes.length > 0) {
        journeys.push({
          dayNumber: currentDay,
          name: `${journeyName} - Day ${currentDay}`,
          nodes: [...currentNodes],
          edges: [...currentEdges]
        });
      }

      // Store the journeys in localStorage
      const savedJourneys = JSON.parse(localStorage.getItem('journeys') || '[]');
      journeys.forEach(journey => {
        const existingIndex = savedJourneys.findIndex(j => j.name === journey.name);
        if (existingIndex >= 0) {
          savedJourneys[existingIndex] = journey;
        } else {
          savedJourneys.push(journey);
        }
      });
      localStorage.setItem('journeys', JSON.stringify(savedJourneys));

      // Show success message
      message.success(`Successfully saved ${journeys.length} journeys`);
      
      // Show a modal with the list of saved journeys
      Modal.info({
        title: 'Journeys Saved',
        content: (
          <div>
            <p>The following journeys have been saved:</p>
            <ul>
              {journeys.map(journey => (
                <li key={journey.name}>{journey.name}</li>
              ))}
            </ul>
          </div>
        )
      });

    } catch (error) {
      console.error('Error saving journeys:', error);
      message.error('Failed to save journeys: ' + (error.message || 'Unknown error'));
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
                <Select.Option value="template1">Welcome Template</Select.Option>
                <Select.Option value="template2">Follow-up Template</Select.Option>
                <Select.Option value="template3">Reminder Template</Select.Option>
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
                <Select.Option value="script1">Initial Contact Script</Select.Option>
                <Select.Option value="script2">Follow-up Inquiry Script</Select.Option>
                <Select.Option value="script3">Support Resolution Script</Select.Option>
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
                <Select.Option value="vm1">Standard Greeting Voicemail</Select.Option>
                <Select.Option value="vm2">Custom Callback Voicemail</Select.Option>
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
                <Select.Option value="sms1">Welcome Message Template</Select.Option>
                <Select.Option value="sms2">Reminder Message Template</Select.Option>
                <Select.Option value="sms3">Alert Message Template</Select.Option>
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

  // Add this function to handle edge click
  const onEdgeClick = useCallback((event, edge) => {
    // Create a menu for the edge click
    const menu = (
      <Menu className="edge-menu">
        <div className="menu-header">
          <span>Add Step</span>
          <span className="menu-close" onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            const menuElement = e.target.closest('.edge-menu');
            if (menuElement) {
              menuElement.remove();
            }
            document.removeEventListener('click', removeDropdown);
          }}>×</span>
        </div>
        <Menu.Item 
          key="add-wait" 
          icon={<HistoryOutlined />}
          onClick={() => {
            // Get source and target nodes
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            
            if (!sourceNode || !targetNode) {
              console.error('Source or target node not found');
              return;
            }

            // Calculate position for new node (midpoint between source and target)
            const newPosition = {
              x: (sourceNode.position.x + targetNode.position.x) / 2,
              y: (sourceNode.position.y + targetNode.position.y) / 2
            };

            // Create new wait node
            const newNodeId = generateNumericId().toString();
            const newNode = {
              id: newNodeId,
              type: 'wait',
              position: newPosition,
              data: {
                id: newNodeId,
                label: 'Wait',
                actionConfig: {
                  delay_minutes: 60
                },
                stepNumber: nodes.length + 1,
                actionType: 'wait',
                onDelete: handleDeleteNode
              }
            };

            // Add the new node
            setNodes((nds) => nds.concat(newNode));

            // Remove the original edge
            setEdges((eds) => eds.filter((e) => e.id !== edge.id));

            // Add new edges (source -> wait -> target)
            setEdges((eds) => eds.concat(
              {
                id: `e${edge.source}-${newNodeId}`,
                source: edge.source,
                target: newNodeId,
                type: 'bezier',
                animated: true,
                style: { stroke: '#d9d9d9', strokeWidth: 2 },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: '#d9d9d9',
                  width: 0,
                  height: 0
                }
              },
              {
                id: `e${newNodeId}-${edge.target}`,
                source: newNodeId,
                target: edge.target,
                type: 'bezier',
                animated: true,
                style: { stroke: '#d9d9d9', strokeWidth: 2 },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: '#d9d9d9',
                  width: 0,
                  height: 0
                }
              }
            ));

            // Close the menu after adding the node
            const menuElement = document.querySelector('.edge-menu');
            if (menuElement) {
              menuElement.remove();
            }
            document.removeEventListener('click', removeDropdown);
          }}
        >
          Add Wait Step
        </Menu.Item>
        <Menu.Item 
          key="add-day-break" 
          icon={<CalendarOutlined />}
          onClick={() => {
            // Get source and target nodes
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            
            if (!sourceNode || !targetNode) {
              console.error('Source or target node not found');
              return;
            }

            // Calculate position for new node (midpoint between source and target)
            const newPosition = {
              x: (sourceNode.position.x + targetNode.position.x) / 2,
              y: (sourceNode.position.y + targetNode.position.y) / 2
            };

            // Create new day break node
            const newNodeId = generateNumericId().toString();
            const newNode = {
              id: newNodeId,
              type: 'dayBreak',
              position: newPosition,
              data: {
                id: newNodeId,
                dayNumber: 1, // Default to day 1, can be edited later
                onDelete: handleDeleteNode
              }
            };

            // Add the new node
            setNodes((nds) => nds.concat(newNode));

            // Remove the original edge
            setEdges((eds) => eds.filter((e) => e.id !== edge.id));

            // Add new edges (source -> day break -> target)
            setEdges((eds) => eds.concat(
              {
                id: `e${edge.source}-${newNodeId}`,
                source: edge.source,
                target: newNodeId,
                type: 'bezier',
                animated: true,
                style: { stroke: '#d9d9d9', strokeWidth: 2 },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: '#d9d9d9',
                  width: 0,
                  height: 0
                }
              },
              {
                id: `e${newNodeId}-${edge.target}`,
                source: newNodeId,
                target: edge.target,
                type: 'bezier',
                animated: true,
                style: { stroke: '#d9d9d9', strokeWidth: 2 },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: '#d9d9d9',
                  width: 0,
                  height: 0
                }
              }
            ));

            // Close the menu after adding the node
            const menuElement = document.querySelector('.edge-menu');
            if (menuElement) {
              menuElement.remove();
            }
            document.removeEventListener('click', removeDropdown);
          }}
        >
          Add Day Break
        </Menu.Item>
      </Menu>
    );

    // Get the edge element
    const edgeElement = event.target.closest('.react-flow__edge');
    if (!edgeElement) return;

    // Get the edge's bounding rectangle
    const edgeRect = edgeElement.getBoundingClientRect();
    
    // Calculate the midpoint of the edge
    const edgeMidpoint = {
      x: edgeRect.left + edgeRect.width / 2,
      y: edgeRect.top + edgeRect.height / 2
    };

    // Create a dropdown menu at the edge's midpoint
    const dropdown = document.createElement('div');
    dropdown.style.position = 'fixed';
    dropdown.style.left = `${edgeMidpoint.x}px`;
    dropdown.style.top = `${edgeMidpoint.y}px`;
    dropdown.style.zIndex = '1000';
    dropdown.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(dropdown);

    ReactDOM.render(
      <Dropdown overlay={menu} trigger={['click']} visible>
        <div />
      </Dropdown>,
      dropdown
    );

    // Remove the dropdown after click
    const removeDropdown = () => {
      if (dropdown && dropdown.parentNode) {
        dropdown.parentNode.removeChild(dropdown);
      }
      document.removeEventListener('click', removeDropdown);
    };

    document.addEventListener('click', removeDropdown);
  }, [nodes, setNodes, setEdges, handleDeleteNode]);

  // Default edge options
  const defaultEdgeOptions = {
    type: 'bezier',
    animated: true,
    style: { stroke: '#d9d9d9', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#d9d9d9',
      width: 0,
      height: 0
    },
    curvature: 0.3, // Reduced curvature for smoother curves
  };

  // Helper function to format node label from type
  const getNodeLabel = (type) => {
    const labels = {
      'email': 'Email',
      'call': 'Call',
      'sms': 'SMS',
      'wait': 'Wait',
      'condition': 'Condition',
      'end': 'End',
      'dayBreak': 'Day Break'
    };
    
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="journey-builder" ref={reactFlowWrapper}>
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
                className="save-journey-btn"
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

          <div className="flow-container">
            <Suspense fallback={
              <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin size="large" tip="Loading Flow Editor..." />
              </div>
            }>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onWheel={onWheel}
                onInit={onInit}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                attributionPosition="bottom-left"
                defaultEdgeOptions={defaultEdgeOptions}
                connectionMode="loose"
                snapToGrid={true}
                snapGrid={[20, 20]}
                elevateNodesOnSelect={true}
                zoomOnScroll={true}
                zoomOnPinch={true}
                panOnDrag={true}
              >
                <Controls />
                <Background />
                <MiniMap />
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

// Main component wrapper with ReactFlowProvider
const JourneyBuilderList = () => {
  return (
    <ReactFlowProvider>
      <JourneyBuilderFlow />
    </ReactFlowProvider>
  );
};

export default JourneyBuilderList;