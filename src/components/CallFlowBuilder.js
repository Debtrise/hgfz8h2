import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  ReactFlowProvider,
  Panel,
  Handle,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Layout,
  Drawer,
  Form,
  Input,
  Button,
  Select,
  Card,
  Space,
  Switch,
  List,
  Tag,
  Typography,
  message,
  Popconfirm,
  Modal,
} from "antd";
import {
  PhoneOutlined,
  UserSwitchOutlined,
  TeamOutlined,
  BranchesOutlined,
  SaveOutlined,
  CloseOutlined,
  MessageOutlined,
  ApiOutlined,
  SoundOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import "./CallFlowBuilder.css";

const { Header, Content } = Layout;
const { Option } = Select;
const { Title, Text } = Typography;

/* ======= Custom Node Components ======= */

// Entry Point Node Component
function EntryPointNode({ id, data, selected, isConnectable }) {
  const updateNodeData = data.updateNodeData;

  return (
    <div className={`custom-node entry-node ${selected ? "selected" : ""}`}>
      <div className="node-header">
        <PhoneOutlined className="node-icon" />
        <span>{data.label || "Call Entry Point"}</span>
      </div>
      <div className="node-content">
        {data.did && (
          <div className="node-content-row">
            <div className="node-content-label">DID:</div>
            <input
              type="text"
              className="node-input"
              value={data.did || ""}
              onChange={(e) =>
                updateNodeData(id, { ...data, did: e.target.value })
              }
              placeholder="Enter DID number"
            />
          </div>
        )}
      </div>
      <Handle
        type="source"
        position="right"
        id="out"
        isConnectable={isConnectable}
        className="connection-handle"
      />
    </div>
  );
}

// Queue Node Component
function QueueNode({ id, data, selected, isConnectable }) {
  const updateNodeData = data.updateNodeData;

  return (
    <div className={`custom-node queue-node ${selected ? "selected" : ""}`}>
      <Handle
        type="target"
        position="left"
        id="in"
        isConnectable={isConnectable}
        className="connection-handle"
      />
      <div className="node-header">
        <TeamOutlined className="node-icon" />
        <span>{data.label || "Call Queue"}</span>
      </div>
      <div className="node-content">
        <div className="node-content-row">
          <div className="node-content-label">Queue:</div>
          <input
            type="text"
            className="node-input"
            value={data.queueName || ""}
            onChange={(e) =>
              updateNodeData(id, { ...data, queueName: e.target.value })
            }
            placeholder="Enter queue name"
          />
        </div>
        <div className="node-content-row">
          <div className="node-content-label">Strategy:</div>
          <select
            className="node-select"
            value={data.strategy || "roundRobin"}
            onChange={(e) =>
              updateNodeData(id, { ...data, strategy: e.target.value })
            }
          >
            <option value="roundRobin">Round Robin</option>
            <option value="leastRecent">Least Recent</option>
            <option value="fewestCalls">Fewest Calls</option>
            <option value="random">Random</option>
            <option value="skill">Skills Based</option>
          </select>
        </div>
      </div>
      <Handle
        type="source"
        position="right"
        id="out"
        isConnectable={isConnectable}
        className="connection-handle"
      />
    </div>
  );
}

// IVR Node Component
function IVRNode({ id, data, selected, isConnectable }) {
  const updateNodeData = data.updateNodeData;

  return (
    <div className={`custom-node ivr-node ${selected ? "selected" : ""}`}>
      <Handle
        type="target"
        position="left"
        id="in"
        isConnectable={isConnectable}
        className="connection-handle"
      />
      <div className="node-header">
        <SoundOutlined className="node-icon" />
        <span>{data.label || "IVR Menu"}</span>
      </div>
      <div className="node-content">
        <div className="node-content-row">
          <div className="node-content-label">Message:</div>
          <select
            className="node-select"
            value={data.welcomeMessage || "default"}
            onChange={(e) =>
              updateNodeData(id, { ...data, welcomeMessage: e.target.value })
            }
          >
            <option value="default">Default Welcome</option>
            <option value="custom1">Thank you for calling</option>
            <option value="custom2">Welcome to our service</option>
            <option value="custom3">Custom Recording</option>
          </select>
        </div>
      </div>
      <Handle
        type="source"
        position="right"
        id="out"
        isConnectable={isConnectable}
        className="connection-handle"
      />
    </div>
  );
}

// Condition Node Component
function ConditionNode({ id, data, selected, isConnectable }) {
  const updateNodeData = data.updateNodeData;

  return (
    <div className={`custom-node condition-node ${selected ? "selected" : ""}`}>
      <Handle
        type="target"
        position="left"
        id="in"
        isConnectable={isConnectable}
        className="connection-handle"
      />
      <div className="node-header">
        <BranchesOutlined className="node-icon" />
        <span>{data.label || "Condition"}</span>
      </div>
      <div className="node-content">
        <div className="node-content-row">
          <div className="node-content-label">Type:</div>
          <select
            className="node-select"
            value={data.conditionType || "time"}
            onChange={(e) =>
              updateNodeData(id, { ...data, conditionType: e.target.value })
            }
          >
            <option value="time">Time of Day</option>
            <option value="day">Day of Week</option>
            <option value="date">Date</option>
            <option value="queueStatus">Queue Status</option>
            <option value="callerInput">Caller Input</option>
            <option value="agentStatus">Agent Status</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div className="node-content-row">
          <div className="node-content-label">If:</div>
          <input
            type="text"
            className="node-input"
            value={data.condition || ""}
            onChange={(e) =>
              updateNodeData(id, { ...data, condition: e.target.value })
            }
            placeholder="Enter condition"
          />
        </div>
      </div>
      <Handle
        type="source"
        position="right"
        id="out-true"
        style={{ top: "30%" }}
        isConnectable={isConnectable}
        className="connection-handle true-handle"
      />
      <Handle
        type="source"
        position="right"
        id="out-false"
        style={{ top: "70%" }}
        isConnectable={isConnectable}
        className="connection-handle false-handle"
      />
    </div>
  );
}

// Transfer Node Component
function TransferNode({ id, data, selected, isConnectable }) {
  const updateNodeData = data.updateNodeData;

  return (
    <div className={`custom-node transfer-node ${selected ? "selected" : ""}`}>
      <Handle
        type="target"
        position="left"
        id="in"
        isConnectable={isConnectable}
        className="connection-handle"
      />
      <div className="node-header">
        <UserSwitchOutlined className="node-icon" />
        <span>{data.label || "Transfer Call"}</span>
      </div>
      <div className="node-content">
        <div className="node-content-row">
          <div className="node-content-label">Type:</div>
          <select
            className="node-select"
            value={data.transferType || "agent"}
            onChange={(e) =>
              updateNodeData(id, { ...data, transferType: e.target.value })
            }
          >
            <option value="agent">Direct to Agent</option>
            <option value="queue">To Queue</option>
            <option value="external">External Number</option>
            <option value="voicemail">To Voicemail</option>
          </select>
        </div>
        <div className="node-content-row">
          <div className="node-content-label">To:</div>
          <input
            type="text"
            className="node-input"
            value={data.destination || ""}
            onChange={(e) =>
              updateNodeData(id, { ...data, destination: e.target.value })
            }
            placeholder="Enter destination"
          />
        </div>
      </div>
      <Handle
        type="source"
        position="right"
        id="out"
        isConnectable={isConnectable}
        className="connection-handle"
      />
    </div>
  );
}

// Webhook Node Component
function WebhookNode({ id, data, selected, isConnectable }) {
  const updateNodeData = data.updateNodeData;

  return (
    <div className={`custom-node webhook-node ${selected ? "selected" : ""}`}>
      <Handle
        type="target"
        position="left"
        id="in"
        isConnectable={isConnectable}
        className="connection-handle"
      />
      <div className="node-header">
        <ApiOutlined className="node-icon" />
        <span>{data.label || "Webhook"}</span>
      </div>
      <div className="node-content">
        <div className="node-content-row">
          <div className="node-content-label">URL:</div>
          <input
            type="text"
            className="node-input"
            value={data.url || ""}
            onChange={(e) =>
              updateNodeData(id, { ...data, url: e.target.value })
            }
            placeholder="Enter webhook URL"
          />
        </div>
        <div className="node-content-row">
          <div className="node-content-label">Method:</div>
          <select
            className="node-select"
            value={data.method || "POST"}
            onChange={(e) =>
              updateNodeData(id, { ...data, method: e.target.value })
            }
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
      </div>
      <Handle
        type="source"
        position="right"
        id="out"
        isConnectable={isConnectable}
        className="connection-handle"
      />
    </div>
  );
}

// Voicemail Node Component
function VoicemailNode({ id, data, selected, isConnectable }) {
  const updateNodeData = data.updateNodeData;

  return (
    <div className={`custom-node voicemail-node ${selected ? "selected" : ""}`}>
      <Handle
        type="target"
        position="left"
        id="in"
        isConnectable={isConnectable}
        className="connection-handle"
      />
      <div className="node-header">
        <MessageOutlined className="node-icon" />
        <span>{data.label || "Voicemail"}</span>
      </div>
      <div className="node-content">
        <div className="node-content-row">
          <div className="node-content-label">Greeting:</div>
          <select
            className="node-select"
            value={data.greeting || "default"}
            onChange={(e) =>
              updateNodeData(id, { ...data, greeting: e.target.value })
            }
          >
            <option value="default">Default Greeting</option>
            <option value="custom1">Please leave a message</option>
            <option value="custom2">Custom Recording</option>
          </select>
        </div>
      </div>
      <Handle
        type="source"
        position="right"
        id="out"
        isConnectable={isConnectable}
        className="connection-handle"
      />
    </div>
  );
}

// Exit Node Component
function ExitNode({ id, data, selected, isConnectable }) {
  const updateNodeData = data.updateNodeData;

  return (
    <div className={`custom-node exit-node ${selected ? "selected" : ""}`}>
      <Handle
        type="target"
        position="left"
        id="in"
        isConnectable={isConnectable}
        className="connection-handle"
      />
      <div className="node-header">
        <CloseOutlined className="node-icon" />
        <span>{data.label || "End Call"}</span>
      </div>
      <div className="node-content">
        <div className="node-content-row">
          <div className="node-content-label">Message:</div>
          <input
            type="text"
            className="node-input"
            value={data.exitMessage || ""}
            onChange={(e) =>
              updateNodeData(id, { ...data, exitMessage: e.target.value })
            }
            placeholder="Enter exit message"
          />
        </div>
      </div>
    </div>
  );
}

// Edge configuration component for time delay
const EdgeConfigPanel = ({ edge, updateEdge, deleteEdge }) => {
  const [delay, setDelay] = useState(edge.data?.timeout || "30");
  const [timeUnit, setTimeUnit] = useState(edge.data?.timeUnit || "seconds");
  const [fallbackAction, setFallbackAction] = useState(
    edge.data?.fallbackAction || "continue"
  );

  const onSave = () => {
    updateEdge(edge.id, {
      ...edge,
      label: delay ? `${delay} ${timeUnit}` : "",
      data: {
        ...edge.data,
        timeout: delay,
        timeUnit,
        fallbackAction,
      },
    });
  };

  return (
    <div className="edge-config-panel">
      <h3>Connection Settings</h3>
      <div className="config-row">
        <label>Timeout:</label>
        <div className="delay-inputs">
          <input
            type="number"
            min="0"
            value={delay}
            onChange={(e) => setDelay(e.target.value)}
            placeholder="Timeout"
            className="delay-input"
          />
          <select
            value={timeUnit}
            onChange={(e) => setTimeUnit(e.target.value)}
            className="unit-select"
          >
            <option value="seconds">Seconds</option>
            <option value="minutes">Minutes</option>
          </select>
        </div>
      </div>
      <div className="config-row">
        <label>On Timeout:</label>
        <select
          value={fallbackAction}
          onChange={(e) => setFallbackAction(e.target.value)}
          className="fallback-select"
        >
          <option value="continue">Continue to Next Node</option>
          <option value="exit">Exit Call</option>
          <option value="voicemail">Send to Voicemail</option>
        </select>
      </div>
      <div className="config-buttons">
        <button className="save-button" onClick={onSave}>
          Apply
        </button>
        <button className="delete-button" onClick={() => deleteEdge(edge.id)}>
          Delete Connection
        </button>
      </div>
    </div>
  );
};

// Node types mapping
const nodeTypes = {
  entryPoint: EntryPointNode,
  queue: QueueNode,
  ivr: IVRNode,
  condition: ConditionNode,
  transfer: TransferNode,
  webhook: WebhookNode,
  voicemail: VoicemailNode,
  exit: ExitNode,
};

// Initial nodes for demonstration
const initialNodes = [
  {
    id: "entry-1",
    type: "entryPoint",
    position: { x: 50, y: 150 },
    data: {
      label: "Call Entry Point",
      did: "+1 (555) 123-4567",
    },
  },
  {
    id: "ivr-1",
    type: "ivr",
    position: { x: 300, y: 150 },
    data: {
      label: "Main Menu",
      welcomeMessage: "default",
    },
  },
  {
    id: "queue-1",
    type: "queue",
    position: { x: 550, y: 50 },
    data: {
      label: "Sales Queue",
      queueName: "Sales",
      strategy: "roundRobin",
    },
  },
  {
    id: "queue-2",
    type: "queue",
    position: { x: 550, y: 250 },
    data: {
      label: "Support Queue",
      queueName: "Support",
      strategy: "leastRecent",
    },
  },
  {
    id: "exit-1",
    type: "exit",
    position: { x: 800, y: 150 },
    data: {
      label: "End Call",
      exitMessage: "Thank you for calling",
    },
  },
];

// Initial edges
const initialEdges = [
  {
    id: "e-entry-ivr",
    source: "entry-1",
    target: "ivr-1",
    sourceHandle: "out",
    targetHandle: "in",
    type: "smoothstep",
    style: { stroke: "#2563eb", strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#2563eb",
    },
    data: { timeout: "5", timeUnit: "seconds", fallbackAction: "continue" },
    label: "5 seconds",
    labelStyle: { fill: "#2563eb", fontWeight: 500 },
    labelBgStyle: { fill: "white" },
  },
  {
    id: "e-ivr-queue1",
    source: "ivr-1",
    target: "queue-1",
    sourceHandle: "out",
    targetHandle: "in",
    type: "smoothstep",
    style: { stroke: "#2563eb", strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#2563eb",
    },
    data: { timeout: "10", timeUnit: "seconds", fallbackAction: "continue" },
    label: "10 seconds",
    labelStyle: { fill: "#2563eb", fontWeight: 500 },
    labelBgStyle: { fill: "white" },
  },
  {
    id: "e-ivr-queue2",
    source: "ivr-1",
    target: "queue-2",
    sourceHandle: "out",
    targetHandle: "in",
    type: "smoothstep",
    style: { stroke: "#2563eb", strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#2563eb",
    },
    data: { timeout: "10", timeUnit: "seconds", fallbackAction: "continue" },
    label: "10 seconds",
    labelStyle: { fill: "#2563eb", fontWeight: 500 },
    labelBgStyle: { fill: "white" },
  },
  {
    id: "e-queue1-exit",
    source: "queue-1",
    target: "exit-1",
    sourceHandle: "out",
    targetHandle: "in",
    type: "smoothstep",
    style: { stroke: "#2563eb", strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#2563eb",
    },
    data: { timeout: "30", timeUnit: "seconds", fallbackAction: "exit" },
    label: "30 seconds",
    labelStyle: { fill: "#2563eb", fontWeight: 500 },
    labelBgStyle: { fill: "white" },
  },
  {
    id: "e-queue2-exit",
    source: "queue-2",
    target: "exit-1",
    sourceHandle: "out",
    targetHandle: "in",
    type: "smoothstep",
    style: { stroke: "#2563eb", strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#2563eb",
    },
    data: { timeout: "30", timeUnit: "seconds", fallbackAction: "exit" },
    label: "30 seconds",
    labelStyle: { fill: "#2563eb", fontWeight: 500 },
    labelBgStyle: { fill: "white" },
  },
];

/* ======= Main Component ======= */
const CallFlowBuilder = () => {
  // Refs
  const reactFlowWrapper = useRef(null);

  // State
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [flowName, setFlowName] = useState("New Call Flow");

  // Node drawer state and form
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeDrawerVisible, setNodeDrawerVisible] = useState(false);
  const [nodeForm] = Form.useForm();

  // Connect modules modal state
  const [connectModalVisible, setConnectModalVisible] = useState(false);
  const [sourceModule, setSourceModule] = useState(null);
  const [targetModule, setTargetModule] = useState(null);

  // Initialize with default data
  useEffect(() => {
    initializeDefaultFlow();
  }, []);

  // Initialize default flow
  const initializeDefaultFlow = () => {
    const nodesWithUpdater = initialNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        updateNodeData,
      },
    }));
    setNodes(nodesWithUpdater);
    setEdges(initialEdges);
  };

  // Auto-layout function to arrange nodes horizontally
  const autoLayoutHorizontal = useCallback(() => {
    if (!nodes.length) return;

    // Find the entry point node (if any)
    const entryNode = nodes.find((node) => node.type === "entryPoint");
    const startX = entryNode ? entryNode.position.x : 50;
    const startY = entryNode ? entryNode.position.y : 150;

    // Create a map of node connections
    const connectionMap = {};
    edges.forEach((edge) => {
      if (!connectionMap[edge.source]) {
        connectionMap[edge.source] = [];
      }
      connectionMap[edge.source].push(edge.target);
    });

    // Create a map to track the "level" of each node
    const levelMap = {};

    // Start with the entry node
    if (entryNode) {
      levelMap[entryNode.id] = 0;

      // Breadth-first traversal to assign levels
      const queue = [entryNode.id];
      while (queue.length > 0) {
        const currentId = queue.shift();
        const currentLevel = levelMap[currentId];

        // Process all connections from this node
        if (connectionMap[currentId]) {
          connectionMap[currentId].forEach((targetId) => {
            if (levelMap[targetId] === undefined) {
              levelMap[targetId] = currentLevel + 1;
              queue.push(targetId);
            }
          });
        }
      }
    }

    // For any nodes not connected, assign them level 0
    nodes.forEach((node) => {
      if (levelMap[node.id] === undefined) {
        levelMap[node.id] = 0;
      }
    });

    // Calculate the x position based on level
    const xSpacing = 250; // Horizontal spacing between nodes
    const ySpacing = 150; // Vertical spacing for same-level nodes

    // Count nodes at each level for vertical positioning
    const levelCounts = {};
    Object.values(levelMap).forEach((level) => {
      if (!levelCounts[level]) levelCounts[level] = 0;
      levelCounts[level]++;
    });

    // Track how many nodes we've positioned at each level
    const levelPositioned = {};

    // Create new nodes with updated positions
    const newNodes = nodes.map((node) => {
      const level = levelMap[node.id];

      // Initialize the counter for this level if not done yet
      if (!levelPositioned[level]) levelPositioned[level] = 0;

      // Calculate vertical offset for nodes at the same level
      const nodesAtThisLevel = levelCounts[level];
      const positionIndex = levelPositioned[level];
      const verticalOffset =
        nodesAtThisLevel > 1
          ? (positionIndex - (nodesAtThisLevel - 1) / 2) * ySpacing
          : 0;

      // Increment the counter for this level
      levelPositioned[level]++;

      // Return updated node with new position
      return {
        ...node,
        position: {
          x: startX + level * xSpacing,
          y: startY + verticalOffset,
        },
      };
    });

    setNodes(newNodes);
  }, [nodes, edges, setNodes]);

  // Update node data
  const updateNodeData = useCallback(
    (nodeId, newData) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...newData,
                updateNodeData,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // Update edge data
  const updateEdge = useCallback(
    (edgeId, newEdge) => {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === edgeId) {
            return newEdge;
          }
          return edge;
        })
      );
      setSelectedEdge(null);
    },
    [setEdges]
  );

  // Delete edge
  const deleteEdge = useCallback(
    (edgeId) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
      setSelectedEdge(null);
    },
    [setEdges]
  );

  // Handle edge click
  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdge(edge);
    event.stopPropagation();
  }, []);

  // Handle node click
  const onNodeClick = useCallback(
    (event, node) => {
      setSelectedNode(node);
      setNodeDrawerVisible(true);
      const initialValues = {
        id: node.id,
        ...node.data,
      };
      // Remove updateNodeData function from form values
      delete initialValues.updateNodeData;
      nodeForm.setFieldsValue(initialValues);
      event.stopPropagation();
    },
    [nodeForm]
  );

  // Handle background click to close panels
  const onPaneClick = useCallback(() => {
    setSelectedEdge(null);
    setMenuOpen(false);
  }, []);

  // Callback for handling new connections
  const onConnect = useCallback(
    (params) => {
      // Create a connection with default styling
      const connection = {
        ...params,
        type: "smoothstep",
        style: { stroke: "#2563eb", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#2563eb",
        },
        data: {
          timeout: "30",
          timeUnit: "seconds",
          fallbackAction: "continue",
        },
        label: "30 seconds",
        labelStyle: { fill: "#2563eb", fontWeight: 500 },
        labelBgStyle: { fill: "white" },
      };

      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  // Handle drag over event for node drag and drop
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Handle drop event for node drag and drop
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!reactFlowInstance || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNodeData = getDefaultNodeData(type);
      newNodeData.updateNodeData = updateNodeData;

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: newNodeData,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, updateNodeData]
  );

  // Get default node data based on type
  const getDefaultNodeData = (type) => {
    switch (type) {
      case "entryPoint":
        return { label: "Call Entry Point", did: "" };
      case "queue":
        return { label: "Call Queue", queueName: "", strategy: "roundRobin" };
      case "ivr":
        return { label: "IVR Menu", welcomeMessage: "default" };
      case "condition":
        return { label: "Condition", conditionType: "time", condition: "" };
      case "transfer":
        return {
          label: "Transfer Call",
          transferType: "agent",
          destination: "",
        };
      case "webhook":
        return { label: "Webhook", url: "", method: "POST" };
      case "voicemail":
        return { label: "Voicemail", greeting: "default" };
      case "exit":
        return { label: "End Call", exitMessage: "" };
      default:
        return { label: "New Node" };
    }
  };

  // Function to add node at appropriate position in flow
  const onAddNode = useCallback(
    (type) => {
      if (reactFlowInstance) {
        // Find all currently selected nodes
        const selectedNodes = nodes.filter((node) => node.selected);

        // Default position if no node is selected
        let position = reactFlowInstance.project({
          x: 250,
          y: 150,
        });

        // If a node is selected, position new node to its right
        if (selectedNodes.length > 0) {
          const lastSelectedNode = selectedNodes[0];
          position = {
            x: lastSelectedNode.position.x + 250,
            y: lastSelectedNode.position.y,
          };
        }

        const newNodeData = getDefaultNodeData(type);
        newNodeData.updateNodeData = updateNodeData;

        const newNode = {
          id: `${type}-${Date.now()}`,
          type,
          position,
          data: newNodeData,
        };

        setNodes((nds) => nds.concat(newNode));

        // After adding the new node, re-apply auto layout
        setTimeout(() => autoLayoutHorizontal(), 50);
      }
      setMenuOpen(false);
    },
    [reactFlowInstance, setNodes, updateNodeData, autoLayoutHorizontal, nodes]
  );

  // Toggle the menu
  const toggleMenu = useCallback(
    (e) => {
      const buttonRect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({
        x: buttonRect.left,
        y: buttonRect.top - 150,
      });
      setMenuOpen(!menuOpen);
      e.stopPropagation();
    },
    [menuOpen]
  );

  // Close node drawer
  const onNodeDrawerClose = () => {
    setNodeDrawerVisible(false);
    setSelectedNode(null);
    nodeForm.resetFields();
  };

  // Update node from drawer form
  const handleNodeFormSubmit = (values) => {
    if (!selectedNode) return;

    // Add back the updateNodeData function
    const updatedData = {
      ...values,
      updateNodeData,
    };

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: updatedData,
          };
        }
        return node;
      })
    );

    setNodeDrawerVisible(false);
    setSelectedNode(null);
  };

  // Delete a node
  const handleDeleteNode = () => {
    if (!selectedNode) return;

    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
    setEdges((eds) =>
      eds.filter(
        (edge) =>
          edge.source !== selectedNode.id && edge.target !== selectedNode.id
      )
    );

    setNodeDrawerVisible(false);
    setSelectedNode(null);
  };

  // Handler for connecting modules via the modal
  const handleConnectModules = () => {
    if (!sourceModule || !targetModule) {
      message.error("Please select both source and target modules.");
      return;
    }

    // Create an edge between the source and target
    const newEdge = {
      id: `edge-${Date.now()}`,
      source: sourceModule,
      target: targetModule,
      type: "smoothstep",
      style: { stroke: "#2563eb", strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#2563eb",
      },
      data: { timeout: "30", timeUnit: "seconds", fallbackAction: "continue" },
      label: "30 seconds",
      labelStyle: { fill: "#2563eb", fontWeight: 500 },
      labelBgStyle: { fill: "white" },
    };

    setEdges((eds) => addEdge(newEdge, eds));
    message.success("Modules connected successfully");
    setConnectModalVisible(false);
    setSourceModule(null);
    setTargetModule(null);
  };

  // Handle drag start for node palette items
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  // Get color for different node types
  const getNodeColor = (type) => {
    switch (type) {
      case "entryPoint":
        return "#52c41a";
      case "queue":
        return "#1890ff";
      case "ivr":
        return "#722ed1";
      case "condition":
        return "#fa8c16";
      case "transfer":
        return "#13c2c2";
      case "webhook":
        return "#eb2f96";
      case "voicemail":
        return "#faad14";
      case "exit":
        return "#f5222d";
      default:
        return "#1890ff";
    }
  };

  // Get icon for different node types
  const getNodeIcon = (type) => {
    switch (type) {
      case "entryPoint":
        return <PhoneOutlined />;
      case "queue":
        return <TeamOutlined />;
      case "ivr":
        return <SoundOutlined />;
      case "condition":
        return <BranchesOutlined />;
      case "transfer":
        return <UserSwitchOutlined />;
      case "webhook":
        return <ApiOutlined />;
      case "voicemail":
        return <MessageOutlined />;
      case "exit":
        return <CloseOutlined />;
      default:
        return null;
    }
  };

  // Save the flow
  const saveFlow = () => {
    setIsSaving(true);

    try {
      // Clean up the data before saving (remove the updateNodeData function)
      const cleanNodes = nodes.map((node) => ({
        ...node,
        data: Object.fromEntries(
          Object.entries(node.data).filter(([key]) => key !== "updateNodeData")
        ),
      }));

      const flowData = {
        name: flowName,
        nodes: cleanNodes,
        edges,
      };

      // Save to localStorage (can be replaced with API call)
      localStorage.setItem("callFlow", JSON.stringify(flowData));
      message.success("Flow saved successfully");
    } catch (error) {
      console.error("Error saving flow:", error);
      message.error("Failed to save flow");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle auto layout
  const handleAutoLayout = () => {
    autoLayoutHorizontal();
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading flow...</p>
      </div>
    );
  }

  return (
    <Layout className="call-flow-builder">
      <Header className="flow-header">
        <div className="flow-title">
          <BranchesOutlined />
          <span>Call Flow Builder</span>
        </div>
        <div className="flow-actions">
          <Input
            placeholder="Flow Name"
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            style={{ width: 200 }}
          />
          <Button onClick={() => setConnectModalVisible(true)}>
            Connect Modules
          </Button>
          <Button onClick={handleAutoLayout}>Auto-arrange</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={saveFlow}
            loading={isSaving}
          >
            Save Flow
          </Button>
        </div>
      </Header>

      <Content className="flow-content">
        {/* Node palette */}
        <Card title="Node Types" className="node-palette">
          {[
            { type: "entryPoint", label: "Entry Point" },
            { type: "queue", label: "Queue" },
            { type: "ivr", label: "IVR Menu" },
            { type: "condition", label: "Condition" },
            { type: "transfer", label: "Transfer" },
            { type: "webhook", label: "Webhook" },
            { type: "voicemail", label: "Voicemail" },
            { type: "exit", label: "Exit" },
          ].map(({ type, label }) => (
            <div
              key={type}
              className="palette-node"
              draggable
              onDragStart={(event) => onDragStart(event, type)}
            >
              <span
                className="palette-node-icon"
                style={{ backgroundColor: getNodeColor(type) }}
              >
                {getNodeIcon(type)}
              </span>
              <span>{label}</span>
            </div>
          ))}
        </Card>

        {/* Flow canvas */}
        <div className="flow-canvas-container">
          <div className="connection-instructions">
            <div className="instruction-icon"></div>
            <div className="instruction-text">
              <p>
                <strong>How to use:</strong> Drag nodes from the palette or
                click the + button to add nodes. Connect nodes by clicking and
                dragging from one handle to another. Click on a connection to
                set timeout.
              </p>
            </div>
          </div>

          <div className="reactflow-wrapper" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              onPaneClick={onPaneClick}
              fitView
              attributionPosition="bottom-left"
              connectionLineStyle={{ stroke: "#2563eb", strokeWidth: 2 }}
              connectionLineType="smoothstep"
              snapToGrid={true}
              snapGrid={[10, 10]}
              defaultEdgeOptions={{
                type: "smoothstep",
                style: { stroke: "#2563eb", strokeWidth: 2 },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: "#2563eb",
                },
              }}
            >
              <Controls />
              <MiniMap
                nodeStrokeColor={(n) =>
                  n.selected ? "#ff0072" : getNodeColor(n.type)
                }
                nodeColor={(n) => getNodeColor(n.type)}
              />
              <Background color="#f0f0f0" gap={20} size={1} />

              <Panel position="bottom-right">
                <button className="add-node-button" onClick={toggleMenu}>
                  <PlusOutlined />
                </button>
              </Panel>

              {/* Edge Configuration Panel */}
              {selectedEdge && (
                <Panel position="top-center" className="panel-container">
                  <EdgeConfigPanel
                    edge={selectedEdge}
                    updateEdge={updateEdge}
                    deleteEdge={deleteEdge}
                  />
                </Panel>
              )}
            </ReactFlow>

            {menuOpen && (
              <div
                className="node-menu open"
                style={{
                  left: `${menuPosition.x}px`,
                  top: `${menuPosition.y}px`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {[
                  { type: "entryPoint", label: "Entry Point" },
                  { type: "queue", label: "Queue" },
                  { type: "ivr", label: "IVR Menu" },
                  { type: "condition", label: "Condition" },
                  { type: "transfer", label: "Transfer" },
                  { type: "webhook", label: "Webhook" },
                  { type: "voicemail", label: "Voicemail" },
                  { type: "exit", label: "Exit" },
                ].map(({ type, label }) => (
                  <div
                    key={type}
                    className="node-menu-item"
                    onClick={() => onAddNode(type)}
                  >
                    <span
                      className="menu-item-icon"
                      style={{ backgroundColor: getNodeColor(type) }}
                    >
                      {getNodeIcon(type)}
                    </span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Content>

      {/* Node configuration drawer */}
      <Drawer
        title={
          selectedNode ? (
            <Space>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  backgroundColor: getNodeColor(selectedNode.type),
                  color: "#fff",
                }}
              >
                {getNodeIcon(selectedNode.type)}
              </span>
              <span>
                Configure {selectedNode.data.label || selectedNode.type}
              </span>
            </Space>
          ) : (
            "Configure Node"
          )
        }
        width={400}
        placement="right"
        onClose={onNodeDrawerClose}
        open={nodeDrawerVisible}
        footer={
          <Space>
            <Button onClick={onNodeDrawerClose}>Cancel</Button>
            <Popconfirm
              title="Are you sure you want to delete this node?"
              onConfirm={handleDeleteNode}
              okText="Yes"
              cancelText="No"
              placement="topRight"
            >
              <Button danger>Delete</Button>
            </Popconfirm>
            <Button type="primary" onClick={() => nodeForm.submit()}>
              Save
            </Button>
          </Space>
        }
      >
        <Form form={nodeForm} layout="vertical" onFinish={handleNodeFormSubmit}>
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="label"
            label="Label"
            rules={[{ required: true, message: "Please enter a label" }]}
          >
            <Input />
          </Form.Item>

          {/* Specific fields based on node type */}
          {selectedNode?.type === "entryPoint" && (
            <>
              <Form.Item name="did" label="DID Number">
                <Input placeholder="e.g., +1 (555) 123-4567" />
              </Form.Item>
              <Form.Item
                name="recordCalls"
                label="Record Calls"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </>
          )}

          {selectedNode?.type === "queue" && (
            <>
              <Form.Item
                name="queueName"
                label="Queue Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="strategy"
                label="Distribution Strategy"
                rules={[{ required: true }]}
              >
                <Select defaultValue="roundRobin">
                  <Option value="roundRobin">Round Robin</Option>
                  <Option value="leastRecent">Least Recent</Option>
                  <Option value="fewestCalls">Fewest Calls</Option>
                  <Option value="random">Random</Option>
                  <Option value="skill">Skills Based</Option>
                </Select>
              </Form.Item>
              <Form.Item name="maxWaitTime" label="Max Wait Time (seconds)">
                <Input type="number" min={0} />
              </Form.Item>
              <Form.Item name="agentIds" label="Assigned Agents">
                <Select mode="multiple" placeholder="Select agents">
                  <Option value="agent1">John Doe</Option>
                  <Option value="agent2">Jane Smith</Option>
                  <Option value="agent3">Bob Johnson</Option>
                  <Option value="agent4">Alice Brown</Option>
                </Select>
              </Form.Item>
            </>
          )}

          {selectedNode?.type === "ivr" && (
            <>
              <Form.Item
                name="welcomeMessage"
                label="Welcome Message"
                rules={[{ required: true }]}
              >
                <Select defaultValue="default">
                  <Option value="default">Default Welcome</Option>
                  <Option value="custom1">Thank you for calling</Option>
                  <Option value="custom2">Welcome to our service</Option>
                  <Option value="custom3">Custom Recording</Option>
                </Select>
              </Form.Item>
              <Form.Item name="menuOptions" label="Menu Options">
                <List
                  bordered
                  dataSource={[1, 2, 3]}
                  renderItem={(item) => (
                    <List.Item>
                      <Space>
                        <strong>Press {item}:</strong>
                        <Input
                          placeholder={`Action for button ${item}`}
                          style={{ width: 200 }}
                        />
                      </Space>
                    </List.Item>
                  )}
                />
              </Form.Item>
              <Form.Item name="timeout" label="Timeout (seconds)">
                <Input type="number" min={1} />
              </Form.Item>
            </>
          )}

          {selectedNode?.type === "condition" && (
            <>
              <Form.Item
                name="conditionType"
                label="Condition Type"
                rules={[{ required: true }]}
              >
                <Select defaultValue="time">
                  <Option value="time">Time of Day</Option>
                  <Option value="day">Day of Week</Option>
                  <Option value="date">Date</Option>
                  <Option value="queueStatus">Queue Status</Option>
                  <Option value="callerInput">Caller Input</Option>
                  <Option value="agentStatus">Agent Status</Option>
                  <Option value="custom">Custom</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="condition"
                label="Condition"
                rules={[{ required: true }]}
              >
                <Input placeholder="Enter condition expression" />
              </Form.Item>
            </>
          )}

          {selectedNode?.type === "transfer" && (
            <>
              <Form.Item
                name="transferType"
                label="Transfer Type"
                rules={[{ required: true }]}
              >
                <Select defaultValue="agent">
                  <Option value="agent">Direct to Agent</Option>
                  <Option value="queue">To Queue</Option>
                  <Option value="external">External Number</Option>
                  <Option value="voicemail">To Voicemail</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="destination"
                label="Destination"
                rules={[{ required: true }]}
              >
                <Input placeholder="Enter destination" />
              </Form.Item>
              <Form.Item
                name="announceTransfer"
                label="Announce Transfer"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </>
          )}

          {selectedNode?.type === "webhook" && (
            <>
              <Form.Item
                name="url"
                label="Webhook URL"
                rules={[{ required: true }]}
              >
                <Input placeholder="https://example.com/webhook" />
              </Form.Item>
              <Form.Item
                name="method"
                label="HTTP Method"
                rules={[{ required: true }]}
              >
                <Select defaultValue="POST">
                  <Option value="GET">GET</Option>
                  <Option value="POST">POST</Option>
                  <Option value="PUT">PUT</Option>
                  <Option value="DELETE">DELETE</Option>
                </Select>
              </Form.Item>
              <Form.Item name="responseVariable" label="Store Response In">
                <Input placeholder="Variable name to store response" />
              </Form.Item>
            </>
          )}

          {selectedNode?.type === "voicemail" && (
            <>
              <Form.Item name="greeting" label="Greeting Message">
                <Select defaultValue="default">
                  <Option value="default">Default Greeting</Option>
                  <Option value="custom1">Please leave a message</Option>
                  <Option value="custom2">Custom Recording</Option>
                </Select>
              </Form.Item>
              <Form.Item name="maxDuration" label="Max Duration (seconds)">
                <Input type="number" min={10} max={300} />
              </Form.Item>
              <Form.Item
                name="transcribe"
                label="Transcribe Message"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </>
          )}

          {selectedNode?.type === "exit" && (
            <>
              <Form.Item name="exitMessage" label="Exit Message">
                <Input />
              </Form.Item>
              <Form.Item
                name="sendSurvey"
                label="Send Survey"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item name="surveyType" label="Survey Type">
                <Select defaultValue="sms">
                  <Option value="sms">SMS</Option>
                  <Option value="email">Email</Option>
                  <Option value="none">None</Option>
                </Select>
              </Form.Item>
            </>
          )}
        </Form>
      </Drawer>

      {/* Connect modules modal */}
      <Modal
        title="Connect Modules"
        open={connectModalVisible}
        onCancel={() => setConnectModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setConnectModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="connect" type="primary" onClick={handleConnectModules}>
            Connect
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Source Module">
            <Select
              value={sourceModule}
              onChange={setSourceModule}
              placeholder="Select source"
            >
              {nodes.map((node) => (
                <Option key={node.id} value={node.id}>
                  {node.data.label || node.id}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Target Module">
            <Select
              value={targetModule}
              onChange={setTargetModule}
              placeholder="Select target"
            >
              {nodes.map((node) => (
                <Option key={node.id} value={node.id}>
                  {node.data.label || node.id}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default CallFlowBuilder;
