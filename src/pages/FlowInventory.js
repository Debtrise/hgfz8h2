import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Typography,
  Dropdown,
  Menu,
  Modal,
  Empty,
  Tooltip,
  Switch,
  message,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EllipsisOutlined,
  EditOutlined,
  CopyOutlined,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  BranchesOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  TeamOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from "@ant-design/icons";
import "./FlowInventory.css";

const { Title, Text } = Typography;

const FlowInventory = () => {
  const navigate = useNavigate();
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState(null);

  // Load saved flows from localStorage on component mount
  useEffect(() => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const savedFlows = loadFlowsFromStorage();
      setFlows(savedFlows);
      setLoading(false);
    }, 800);
  }, []);

  // Load flows from localStorage
  const loadFlowsFromStorage = () => {
    // Try to get all flow keys from localStorage
    const flowKeys = Object.keys(localStorage).filter(
      (key) => key === "callFlow" || key.startsWith("callFlow_")
    );

    // If no flows found, return demo data
    if (flowKeys.length === 0) {
      return getDemoFlows();
    }

    // Parse each flow from localStorage
    const loadedFlows = flowKeys
      .map((key) => {
        try {
          const flowData = JSON.parse(localStorage.getItem(key));
          return {
            id: key === "callFlow" ? "default" : key.replace("callFlow_", ""),
            name: flowData.name || "Unnamed Flow",
            description: flowData.description || "",
            nodeCount: flowData.nodes?.length || 0,
            lastModified: flowData.lastModified || new Date().toISOString(),
            status: flowData.status || "active",
            calls: flowData.calls || Math.floor(Math.random() * 1000),
            createdBy: flowData.createdBy || "System",
          };
        } catch (error) {
          console.error(`Error parsing flow ${key}:`, error);
          return null;
        }
      })
      .filter(Boolean);

    return loadedFlows.length > 0 ? loadedFlows : getDemoFlows();
  };

  // Demo data for when no flows exist in storage
  const getDemoFlows = () => [
    {
      id: "main-ivr",
      name: "Main Office IVR",
      description: "Main office welcome menu and department routing",
      nodeCount: 8,
      lastModified: "2025-02-15T09:23:45Z",
      status: "active",
      calls: 728,
      createdBy: "Admin",
    },
    {
      id: "sales-team",
      name: "Sales Team Flow",
      description: "Sales call distribution with priority routing",
      nodeCount: 6,
      lastModified: "2025-02-10T14:43:21Z",
      status: "active",
      calls: 456,
      createdBy: "Admin",
    },
    {
      id: "support-queue",
      name: "Support Queue Flow",
      description: "Technical support with skill-based routing",
      nodeCount: 12,
      lastModified: "2025-02-08T11:12:33Z",
      status: "active",
      calls: 892,
      createdBy: "Admin",
    },
    {
      id: "after-hours",
      name: "After Hours Routing",
      description: "Evening and weekend call handling",
      nodeCount: 5,
      lastModified: "2025-01-25T17:32:10Z",
      status: "inactive",
      calls: 234,
      createdBy: "Admin",
    },
    {
      id: "emergency-flow",
      name: "Emergency Escalation",
      description: "High priority issue handling and escalation",
      nodeCount: 7,
      lastModified: "2025-01-20T08:54:19Z",
      status: "active",
      calls: 42,
      createdBy: "Admin",
    },
  ];

  // Navigate to create new flow
  const handleCreateNew = () => {
    navigate("/call-center/FlowBuilder/new");
  };

  // Edit existing flow
  const handleEditFlow = (flowId) => {
    navigate(`/call-center/FlowBuilder/${flowId}`);
  };

  // Duplicate a flow
  const handleDuplicateFlow = (flow) => {
    try {
      // Get original flow data
      const originalKey =
        flow.id === "default" ? "callFlow" : `callFlow_${flow.id}`;
      const flowData = JSON.parse(localStorage.getItem(originalKey));

      // Create new ID and name
      const timestamp = Date.now();
      const newId = `flow_${timestamp}`;
      const newName = `${flow.name} (Copy)`;

      // Create new flow data
      const newFlowData = {
        ...flowData,
        name: newName,
        lastModified: new Date().toISOString(),
      };

      // Save to localStorage
      localStorage.setItem(`callFlow_${newId}`, JSON.stringify(newFlowData));

      // Update UI
      const newFlow = {
        ...flow,
        id: newId,
        name: newName,
        lastModified: new Date().toISOString(),
      };

      setFlows([...flows, newFlow]);
      message.success(`Flow "${flow.name}" duplicated successfully`);
    } catch (error) {
      console.error("Error duplicating flow:", error);
      message.error("Failed to duplicate flow");
    }
  };

  // Show delete confirmation
  const showDeleteConfirm = (flow) => {
    setSelectedFlow(flow);
    setDeleteModalVisible(true);
  };

  // Delete a flow
  const handleDeleteFlow = () => {
    if (!selectedFlow) return;

    try {
      // Remove from localStorage
      const key =
        selectedFlow.id === "default"
          ? "callFlow"
          : `callFlow_${selectedFlow.id}`;
      localStorage.removeItem(key);

      // Update UI
      setFlows(flows.filter((flow) => flow.id !== selectedFlow.id));
      message.success(`Flow "${selectedFlow.name}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting flow:", error);
      message.error("Failed to delete flow");
    }

    setDeleteModalVisible(false);
    setSelectedFlow(null);
  };

  // Toggle flow status
  const handleToggleStatus = (flowId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    try {
      // Update flow status in localStorage
      const key = flowId === "default" ? "callFlow" : `callFlow_${flowId}`;
      const flowData = JSON.parse(localStorage.getItem(key));
      flowData.status = newStatus;
      localStorage.setItem(key, JSON.stringify(flowData));

      // Update UI
      setFlows(
        flows.map((flow) =>
          flow.id === flowId ? { ...flow, status: newStatus } : flow
        )
      );

      message.success(
        `Flow ${newStatus === "active" ? "activated" : "deactivated"}`
      );
    } catch (error) {
      console.error("Error updating flow status:", error);
      message.error("Failed to update flow status");
    }
  };

  // Filter flows based on search text
  const filteredFlows = flows.filter((flow) => {
    const searchLower = searchText.toLowerCase();
    return (
      flow.name.toLowerCase().includes(searchLower) ||
      (flow.description && flow.description.toLowerCase().includes(searchLower))
    );
  });

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Table columns definition
  const columns = [
    {
      title: "Flow Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <PhoneOutlined style={{ color: "#1890ff" }} />
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleEditFlow(record.id);
            }}
            className="flow-name-link"
          >
            {text}
          </a>
          {record.status === "inactive" && <Tag color="default">Inactive</Tag>}
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text) => <Text type="secondary">{text || "—"}</Text>,
    },
    {
      title: "Nodes",
      dataIndex: "nodeCount",
      key: "nodeCount",
      width: 100,
      render: (count) => (
        <Tooltip title={`${count} nodes in this flow`}>
          <Space>
            <BranchesOutlined />
            <span>{count}</span>
          </Space>
        </Tooltip>
      ),
      sorter: (a, b) => a.nodeCount - b.nodeCount,
    },
    {
      title: "Calls",
      dataIndex: "calls",
      key: "calls",
      width: 100,
      render: (calls) => (
        <Tooltip title={`${calls} calls processed`}>
          <Space>
            <TeamOutlined />
            <span>{calls.toLocaleString()}</span>
          </Space>
        </Tooltip>
      ),
      sorter: (a, b) => a.calls - b.calls,
    },
    {
      title: "Last Modified",
      dataIndex: "lastModified",
      key: "lastModified",
      width: 180,
      render: (date) => (
        <Space>
          <ClockCircleOutlined />
          <span>{formatDate(date)}</span>
        </Space>
      ),
      sorter: (a, b) => new Date(a.lastModified) - new Date(b.lastModified),
      defaultSortOrder: "descend",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status, record) => (
        <Switch
          checkedChildren={<PlayCircleOutlined />}
          unCheckedChildren={<PauseCircleOutlined />}
          checked={status === "active"}
          onChange={() => handleToggleStatus(record.id, status)}
        />
      ),
      filters: [
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="edit"
                icon={<EditOutlined />}
                onClick={() => handleEditFlow(record.id)}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                key="duplicate"
                icon={<CopyOutlined />}
                onClick={() => handleDuplicateFlow(record)}
              >
                Duplicate
              </Menu.Item>
              <Menu.Item key="export" icon={<ExportOutlined />}>
                Export
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                key="delete"
                icon={<DeleteOutlined />}
                danger
                onClick={() => showDeleteConfirm(record)}
              >
                Delete
              </Menu.Item>
            </Menu>
          }
          trigger={["click"]}
        >
          <Button type="text" icon={<EllipsisOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="flow-inventory-container">
      <div className="inventory-header-actions">
        <Input
          placeholder="Search flows..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
          allowClear
        />
        <Tooltip title="Import flow">
          <Button icon={<ImportOutlined />}>Import</Button>
        </Tooltip>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateNew}
        >
          New Flow
        </Button>
      </div>

      <Card className="flows-table-card">
        <div className="table-header">
          <Title level={4}>Call Flows</Title>
          <Text type="secondary">
            {filteredFlows.length}{" "}
            {filteredFlows.length === 1 ? "flow" : "flows"} found
          </Text>
        </div>

        <Table
          dataSource={filteredFlows}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} flows`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  searchText ? (
                    <span>No flows match your search criteria</span>
                  ) : (
                    <span>
                      No call flows available. Create your first flow!
                    </span>
                  )
                }
              />
            ),
          }}
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Flow"
        open={deleteModalVisible}
        onOk={handleDeleteFlow}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete <strong>{selectedFlow?.name}</strong>?
        </p>
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default FlowInventory;
