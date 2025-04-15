import React, { useState, useEffect, useRef } from "react";
import {
  Layout,
  Card,
  Tabs,
  Input,
  Space,
  Badge,
  Avatar,
  Statistic,
  Typography,
  Divider,
  List,
  Tag,
  Row,
  Col,
  Tooltip,
  Timeline,
  Drawer,
  Form,
  Select,
  Radio,
  Switch,
  Button,
  Progress,
  Popconfirm,
  message,
} from "antd";
import {
  PhoneOutlined,
  AudioMutedOutlined,
  PauseCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  FileTextOutlined,
  CustomerServiceOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  TeamOutlined,
  EditOutlined,
  HistoryOutlined,
  LikeOutlined,
  FireOutlined,
  HeartOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

// Import the NotificationSystem component
import NotificationSystem from "../components/NotificationSystem";
import WebSocketService from '../services/WebSocketService';
import CallRoutingService from '../services/CallRoutingService';
import AgentService from '../services/AgentService';
import { useAuth } from '../context/AuthContext';

// ========== Mock Data ========== //
const { Content } = Layout;
const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Option } = Select;

// Mock lead info
const mockLeadInfo = {
  id: "LD-12345",
  firstName: "John",
  lastName: "Doe",
  phoneNumber: "(555) 123-4567",
  email: "john.doe@example.com",
  address: "123 Main St, Anytown, USA",
  leadSource: "Web Form",
  campaign: "BDS_Fresh_Test",
  status: "New",
  assignedTo: "Agent Smith",
  createdAt: "2025-03-07 15:32:45",
  lastContact: "2025-03-08 09:15:23",
  notes: [
    {
      id: 1,
      text: "Initial contact via web form",
      timestamp: "2025-03-07 15:32:45",
      agent: "System",
    },
    {
      id: 2,
      text: "Customer interested in home loan options",
      timestamp: "2025-03-08 09:17:12",
      agent: "Agent Smith",
    },
    {
      id: 3,
      text: "Sent email with product information",
      timestamp: "2025-03-08 09:22:35",
      agent: "Agent Smith",
    },
  ],
  timeline: [
    {
      id: 1,
      action: "Lead Created",
      timestamp: "2025-03-07 15:32:45",
      details: "Lead created from web form submission",
    },
    {
      id: 2,
      action: "Call Attempted",
      timestamp: "2025-03-07 16:45:12",
      details: "Outbound call attempted, no answer",
    },
    {
      id: 3,
      action: "Email Sent",
      timestamp: "2025-03-07 16:47:23",
      details: "Introduction email sent",
    },
    {
      id: 4,
      action: "Inbound Call",
      timestamp: "2025-03-08 09:15:23",
      details: "Customer called in, spoke with Agent Smith",
    },
    {
      id: 5,
      action: "Email Sent",
      timestamp: "2025-03-08 09:22:35",
      details: "Product information email sent",
    },
  ],
};

// Mock call history
const mockCallHistory = [
  {
    id: 1,
    phoneNumber: "(555) 123-4567",
    direction: "Inbound",
    startTime: "2025-03-08 09:15:23",
    duration: 235,
    status: "Completed",
    recording: true,
    notes: "Customer inquired about loan options",
  },
  {
    id: 2,
    phoneNumber: "(555) 987-6543",
    direction: "Outbound",
    startTime: "2025-03-08 09:42:18",
    duration: 187,
    status: "Completed",
    recording: true,
    notes: "Follow-up call regarding application",
  },
  {
    id: 3,
    phoneNumber: "(555) 234-5678",
    direction: "Inbound",
    startTime: "2025-03-08 10:05:49",
    duration: 312,
    status: "Completed",
    recording: true,
    notes: "Customer requested status update",
  },
  {
    id: 4,
    phoneNumber: "(555) 876-5432",
    direction: "Outbound",
    startTime: "2025-03-08 10:23:57",
    duration: 45,
    status: "No Answer",
    recording: false,
    notes: "Attempted to reach for verification",
  },
  {
    id: 5,
    phoneNumber: "(555) 345-6789",
    direction: "Inbound",
    startTime: "2025-03-08 10:48:12",
    duration: 178,
    status: "Completed",
    recording: true,
    notes: "New lead from website inquiry",
  },
];

// Mock agent stats
const mockAgentStats = {
  todayStats: {
    callsTaken: 24,
    callsUnder90Sec: 6,
    callsOver2Min: 12,
    callsOver5Min: 4,
    callsOver15Min: 2,
    closingRate: 25, // percentage
  },
  weekStats: {
    callsTaken: 127,
    callsUnder90Sec: 32,
    callsOver2Min: 68,
    callsOver5Min: 19,
    callsOver15Min: 8,
    closingRate: 31, // percentage
  },
  monthStats: {
    callsTaken: 543,
    callsUnder90Sec: 154,
    callsOver2Min: 287,
    callsOver5Min: 76,
    callsOver15Min: 26,
    closingRate: 28, // percentage
  },
};

// ========== Main Agent Interface ========== //
const AgentInterface = () => {
  // Agent console states
  const [activeTab, setActiveTab] = useState("1");
  const [callStatus, setCallStatus] = useState("idle"); // idle, ringing, active, held, muted
  const [callTimer, setCallTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [selectedLead, setSelectedLead] = useState(mockLeadInfo);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [callDirection, setCallDirection] = useState("inbound"); // inbound, outbound
  const [agentStatus, setAgentStatus] = useState("available");
  const [callHistory, setCallHistory] = useState(mockCallHistory);
  const [dialNumber, setDialNumber] = useState("");
  const [statsPeriod, setStatsPeriod] = useState("today");
  const [agentId] = useState(() => `agent-${Math.random().toString(36).substr(2, 9)}`);
  const [agentSkills, setAgentSkills] = useState(['general']);
  const [agentData, setAgentData] = useState(null);
  const [sipCredentials, setSipCredentials] = useState(null);
  const [currentCallId, setCurrentCallId] = useState(null);
  const [todayStats, setTodayStats] = useState(null);
  const { currentAgent } = useAuth();

  // For call disposition form
  const [dispositionForm] = Form.useForm();

  // For call audio
  const audioRef = useRef(null);

  // Timer ref
  const callTimerRef = useRef(callTimer);
  callTimerRef.current = callTimer;

  useEffect(() => {
    const initializeAgent = async () => {
      try {
        // Get agent data
        if (currentAgent?.id) {
          const agent = await AgentService.getAgentById(currentAgent.id);
          setAgentData(agent);

          // Get SIP credentials
          const sip = await AgentService.getSipCredentials();
          setSipCredentials(sip);

          // Update SIP registration
          await AgentService.updateSipRegistration({ registered: true });

          // Get agent stats
          const stats = await AgentService.getAgentStats(currentAgent.id);
          setTodayStats(stats.today);

          // Get call history
          const logs = await AgentService.getCallLogs();
          setCallHistory(logs.call_logs);
        }
      } catch (error) {
        console.error('Error initializing agent:', error);
        message.error('Failed to initialize agent data');
      }
    };

    initializeAgent();

    // Cleanup on unmount
    return () => {
      // Unregister SIP when component unmounts
      AgentService.updateSipRegistration({ registered: false }).catch(console.error);
    };
  }, [currentAgent]);

  // Handle incoming call assignments from the routing service
  const handleIncomingCall = async (data) => {
    if (data.type === 'incomingCall' && data.assignedAgent === agentId) {
      try {
        const callLog = await AgentService.logCallStart({
          destination: data.phoneNumber,
          direction: 'inbound'
        });
        setCurrentCallId(callLog.id);
        setSelectedLead(data.leadInfo);
        simulateIncomingCall();
      } catch (error) {
        console.error('Error logging incoming call:', error);
      }
    }
  };

  // Simulate ring (optional)
  const simulateIncomingCall = () => {
    if (callStatus !== "idle") return;
    if (audioRef.current) {
      audioRef.current
        .play()
        .catch((err) => console.error("Audio play error:", err));
    }
    setCallStatus("ringing");
    setCallDirection("inbound");
  };

  // Answer call
  const answerCall = () => {
    if (callStatus !== "ringing") return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCallStatus("active");
    startCallTimer();
  };

  // Start call timer
  const startCallTimer = () => {
    const interval = setInterval(() => {
      setCallTimer((prevTimer) => prevTimer + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  // Place outbound call
  const placeCall = async (phoneNumber) => {
    if (callStatus !== "idle") return;
    try {
      const callLog = await AgentService.logCallStart({
        destination: phoneNumber,
        direction: 'outbound'
      });
      setCurrentCallId(callLog.id);
      setCallStatus("active");
      setCallDirection("outbound");
      startCallTimer();
    } catch (error) {
      console.error('Error starting call:', error);
      message.error('Failed to initiate call');
    }
  };

  // End call
  const endCall = async () => {
    if (callStatus === "idle") return;
    try {
      if (currentCallId) {
        await AgentService.logCallEnd({
          call_id: currentCallId,
          duration: callTimer,
          status: 'completed'
        });
      }

      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
      setCallStatus("idle");
      setCurrentCallId(null);

      // Refresh call history
      const logs = await AgentService.getCallLogs();
      setCallHistory(logs.call_logs);

      // Show disposition form
      setDrawerVisible(true);
    } catch (error) {
      console.error('Error ending call:', error);
      message.error('Failed to end call');
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!["active", "muted"].includes(callStatus)) return;
    setCallStatus(callStatus === "muted" ? "active" : "muted");
  };

  // Hold/resume
  const toggleHold = () => {
    if (!["active", "held"].includes(callStatus)) return;
    setCallStatus(callStatus === "held" ? "active" : "held");
  };

  // Update agent status in routing service
  const changeAgentStatus = async (status) => {
    try {
      if (agentData?.id) {
        const updatedStatus = await AgentService.updateAgentStatus(agentData.id, {
          agent_status: status,
          available_for_calls: status === 'available'
        });
        setAgentStatus(status);
        setAgentData(prev => ({ ...prev, ...updatedStatus }));
      }
    } catch (error) {
      console.error('Error updating agent status:', error);
      message.error('Failed to update status');
    }
  };

  // Update call metrics after call ends
  const handleDispositionSubmit = async (values) => {
    try {
      // Update call log with disposition
      if (currentCallId) {
        await AgentService.logCallEnd({
          call_id: currentCallId,
          status: values.outcome,
          notes: values.notes,
          follow_up_date: values.followUp ? values.followUpDate : null
        });
      }

      setDrawerVisible(false);
      dispositionForm.resetFields();

      // Refresh call history
      const logs = await AgentService.getCallLogs();
      setCallHistory(logs.call_logs);

      // Refresh agent stats
      if (agentData?.id) {
        const stats = await AgentService.getAgentStats(agentData.id);
        setTodayStats(stats.today);
      }
    } catch (error) {
      console.error('Error submitting disposition:', error);
      message.error('Failed to submit call disposition');
    }
  };

  // Format call time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Dial pad handlers
  const handleDialPadClick = (value) => {
    setDialNumber((prev) => prev + value);
  };
  const clearDialInput = () => {
    setDialNumber("");
  };
  const placeCallFromDialPad = () => {
    if (!dialNumber.trim()) return;
    placeCall(dialNumber);
  };

  // Add periodic stats refresh
  useEffect(() => {
    let statsInterval;
    if (agentData?.id) {
      statsInterval = setInterval(async () => {
        try {
          const stats = await AgentService.getAgentStats(agentData.id);
          setTodayStats(stats.today);
        } catch (error) {
          console.error('Error refreshing stats:', error);
        }
      }, 60000); // Refresh every minute
    }
    return () => clearInterval(statsInterval);
  }, [agentData]);

  // ========== Render Sub-Components ========== //

  const renderRecentContacts = () => (
    <Card title="Recent Contacts" style={{ marginTop: 16 }}>
      <List
        size="small"
        dataSource={callHistory.slice(0, 5)}
        renderItem={(call) => (
          <List.Item
            actions={[
              <Button
                type="primary"
                shape="circle"
                icon={<PhoneOutlined />}
                size="small"
                onClick={() => placeCall(call.phoneNumber)}
                disabled={callStatus !== "idle"}
              />,
            ]}
          >
            <List.Item.Meta
              title={call.phoneNumber}
              description={
                <Space>
                  <Tag color={call.direction === "Inbound" ? "green" : "blue"}>
                    {call.direction}
                  </Tag>
                  <Text type="secondary">{call.startTime}</Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );

  const renderDialPad = () => {
    const dialPadButtons = [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "*",
      "0",
      "#",
    ];

    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <Input
            size="large"
            value={dialNumber}
            onChange={(e) => setDialNumber(e.target.value)}
            suffix={
              dialNumber && (
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={clearDialInput}
                />
              )
            }
            style={{ fontSize: 18 }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            marginBottom: 16,
          }}
        >
          {dialPadButtons.map((btn) => (
            <Button
              key={btn}
              size="large"
              onClick={() => handleDialPadClick(btn)}
              style={{ height: 64, fontSize: 18 }}
            >
              {btn}
            </Button>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button
            type="primary"
            size="large"
            icon={<PhoneOutlined />}
            onClick={placeCallFromDialPad}
            disabled={!dialNumber.trim() || callStatus !== "idle"}
            style={{ width: "100%", height: 64 }}
          >
            Call
          </Button>
        </div>
      </div>
    );
  };

  const renderActiveCallCard = () => (
    <Card title="Active Call" bordered={false}>
      {callStatus === "idle" ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Title level={4}>No Active Call</Title>
          <Text type="secondary">
            Use the dial pad to make a call or wait for incoming calls.
          </Text>
        </div>
      ) : (
        <div>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <Title level={3}>
              {callDirection === "inbound" ? "Incoming Call" : "Outgoing Call"}
            </Title>
            <Title level={4}>
              {dialNumber || selectedLead?.phoneNumber || "(555) 123-4567"}
            </Title>
            <div style={{ marginTop: 8 }}>
              <Badge
                status={
                  callStatus === "active"
                    ? "success"
                    : callStatus === "held"
                    ? "warning"
                    : callStatus === "muted"
                    ? "error"
                    : "processing"
                }
              />
              <Text style={{ marginLeft: 8 }}>
                {callStatus === "active"
                  ? "In Call"
                  : callStatus === "held"
                  ? "On Hold"
                  : callStatus === "muted"
                  ? "Muted"
                  : "Connecting..."}
              </Text>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <Statistic
              title="Call Duration"
              value={formatTime(callTimer)}
              style={{ display: "inline-block" }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 40,
            }}
          >
            <Space size="large">
              {callStatus === "ringing" ? (
                <>
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<PhoneOutlined />}
                    size="large"
                    onClick={answerCall}
                    style={{
                      width: 64,
                      height: 64,
                      fontSize: 24,
                    }}
                  />
                  <Button
                    type="primary"
                    danger
                    shape="circle"
                    icon={<CloseOutlined />}
                    size="large"
                    onClick={endCall}
                    style={{
                      width: 64,
                      height: 64,
                      fontSize: 24,
                    }}
                  />
                </>
              ) : (
                <>
                  <Button
                    type="primary"
                    danger
                    shape="circle"
                    icon={
                      <PhoneOutlined style={{ transform: "rotate(135deg)" }} />
                    }
                    size="large"
                    onClick={endCall}
                    style={{
                      width: 64,
                      height: 64,
                      fontSize: 24,
                    }}
                  />
                  <Button
                    shape="circle"
                    icon={<AudioMutedOutlined />}
                    size="large"
                    type={callStatus === "muted" ? "primary" : "default"}
                    onClick={toggleMute}
                    style={{
                      width: 64,
                      height: 64,
                      fontSize: 24,
                    }}
                  />
                  <Button
                    shape="circle"
                    icon={<PauseCircleOutlined />}
                    size="large"
                    type={callStatus === "held" ? "primary" : "default"}
                    onClick={toggleHold}
                    style={{
                      width: 64,
                      height: 64,
                      fontSize: 24,
                    }}
                  />
                </>
              )}
            </Space>
          </div>
        </div>
      )}
    </Card>
  );

  const renderAgentStats = () => (
    <Card title="Today's Performance" style={{ marginTop: 16 }}>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Statistic
            title="Calls Taken"
            value={todayStats?.total_calls || 0}
            prefix={<PhoneOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Answered Calls"
            value={todayStats?.answered_calls || 0}
            suffix={`/ ${todayStats?.total_calls || 0}`}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Missed Calls"
            value={todayStats?.missed_calls || 0}
            className="missed-calls"
          />
        </Col>
        <Col span={24}>
          <Title level={5}>Total Talk Time</Title>
          <Progress
            percent={Math.min(100, (todayStats?.total_duration || 0) / 36)}
            format={() => formatTime(todayStats?.total_duration || 0)}
          />
        </Col>
      </Row>
    </Card>
  );

  const renderHeader = () => (
    <div style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      {sipCredentials && (
        <div>
          <Text strong>Extension: </Text>
          <Text>{sipCredentials.agent_extension}</Text>
        </div>
      )}

      <Space>
        {callStatus !== "idle" && (
          <div style={{ marginRight: 16 }}>
            <Text strong>{formatTime(callTimer)}</Text>
          </div>
        )}

        <Select
          value={agentStatus}
          onChange={changeAgentStatus}
          style={{ width: 150 }}
        >
          <Option value="available">
            <Badge status="success" text="Available" />
          </Option>
          <Option value="away">
            <Badge status="warning" text="Away" />
          </Option>
          <Option value="lunch">
            <Badge status="warning" text="Lunch" />
          </Option>
          <Option value="meeting">
            <Badge status="warning" text="Meeting" />
          </Option>
          <Option value="offline">
            <Badge status="default" text="Offline" />
          </Option>
        </Select>

        <Avatar icon={<UserOutlined />} />
        <Text strong>{agentData?.first_name ? `${agentData.first_name} ${agentData.last_name}` : 'Loading...'}</Text>
      </Space>
    </div>
  );

  const renderLeadDetails = () => (
    <Card
      title="Lead Details"
      bordered={false}
      extra={<Button icon={<EditOutlined />}>Edit</Button>}
    >
      <Row gutter={16}>
        <Col span={12}>
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">Name</Text>
            <div>
              <Text
                strong
              >{`${selectedLead.firstName} ${selectedLead.lastName}`}</Text>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">Phone</Text>
            <div>
              <Text>{selectedLead.phoneNumber}</Text>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">Email</Text>
            <div>
              <Text>{selectedLead.email}</Text>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">Address</Text>
            <div>
              <Text>{selectedLead.address}</Text>
            </div>
          </div>
        </Col>
        <Col span={12}>
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">Lead Source</Text>
            <div>
              <Text>{selectedLead.leadSource}</Text>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">Campaign</Text>
            <div>
              <Text>{selectedLead.campaign}</Text>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">Status</Text>
            <div>
              <Tag color="blue">{selectedLead.status}</Tag>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">Created</Text>
            <div>
              <Text>{selectedLead.createdAt}</Text>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );

  const renderNotes = () => (
    <Card title="Notes" style={{ marginTop: 16 }}>
      <Input.TextArea rows={3} placeholder="Add a note..." />
      <Button type="primary" style={{ marginTop: 8 }}>
        Add Note
      </Button>

      <List
        style={{ marginTop: 16 }}
        itemLayout="horizontal"
        dataSource={selectedLead.notes}
        renderItem={(note) => (
          <List.Item>
            <List.Item.Meta
              title={<Text strong>{note.agent}</Text>}
              description={
                <>
                  <Text>{note.text}</Text>
                  <div>
                    <Text type="secondary">{note.timestamp}</Text>
                  </div>
                </>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );

  const renderTimeline = () => (
    <Card title="Lead Timeline">
      <Timeline>
        {selectedLead.timeline.map((item) => (
          <Timeline.Item key={item.id}>
            <Text strong>{item.action}</Text>
            <div>
              <Text>{item.details}</Text>
            </div>
            <div>
              <Text type="secondary">{item.timestamp}</Text>
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    </Card>
  );

  // Add skill management UI
  const renderSkillsManager = () => (
    <Card title="Agent Skills" style={{ marginTop: 16 }}>
      <Select
        mode="multiple"
        style={{ width: '100%' }}
        placeholder="Select skills"
        value={agentSkills}
        onChange={(skills) => {
          setAgentSkills(skills);
          CallRoutingService.registerAgent(agentId, skills);
        }}
      >
        <Option value="general">General</Option>
        <Option value="technical">Technical</Option>
        <Option value="sales">Sales</Option>
        <Option value="support">Support</Option>
        <Option value="billing">Billing</Option>
        <Option value="retention">Retention</Option>
      </Select>
    </Card>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Hidden audio for ringtone */}
      <audio ref={audioRef} src="/ringtone.mp3" loop />

      {/* Header */}
      {renderHeader()}

      {/* Main Content */}
      <Content style={{ padding: "16px", background: "#f0f2f5" }}>
        <Row gutter={16}>
          {/* Left Column: Dialer */}
          <Col xs={24} md={8}>
            <Card title="Dial Pad" bordered={false}>
              {renderDialPad()}
            </Card>
            {renderRecentContacts()}
            {renderSkillsManager()}
          </Col>

          {/* Middle Column: Active Call & Stats */}
          <Col xs={24} md={8}>
            {renderActiveCallCard()}
            {renderAgentStats()}
          </Col>

          {/* Right Column: Lead Info & Tabs */}
          <Col xs={24} md={8}>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Lead Info" key="1">
                {renderLeadDetails()}
                {renderTimeline()}
              </TabPane>
              <TabPane tab="Notes" key="2">
                {renderNotes()}
              </TabPane>
            </Tabs>
          </Col>
        </Row>
      </Content>

      {/* Call Disposition Drawer */}
      <Drawer
        title="Call Disposition"
        width={400}
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <Form
          form={dispositionForm}
          layout="vertical"
          onFinish={handleDispositionSubmit}
          initialValues={{
            outcome: "Completed",
            followUp: false,
          }}
        >
          <Form.Item
            name="outcome"
            label="Call Outcome"
            rules={[{ required: true, message: "Please select an outcome" }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value="Completed">Completed</Radio>
                <Radio value="No Answer">No Answer</Radio>
                <Radio value="Voicemail">Left Voicemail</Radio>
                <Radio value="Wrong Number">Wrong Number</Radio>
                <Radio value="Call Back">Call Back Later</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Call Notes"
            rules={[{ required: true, message: "Please enter call notes" }]}
          >
            <Input.TextArea rows={4} placeholder="Enter call notes..." />
          </Form.Item>

          <Form.Item name="followUp" valuePropName="checked">
            <Switch
              checkedChildren="Follow-up Required"
              unCheckedChildren="No Follow-up"
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.followUp !== currentValues.followUp
            }
          >
            {({ getFieldValue }) =>
              getFieldValue("followUp") ? (
                <Form.Item
                  name="followUpDate"
                  label="Follow-up Date"
                  rules={[
                    {
                      required: true,
                      message: "Please select a follow-up date",
                    },
                  ]}
                >
                  <Input type="datetime-local" />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setDrawerVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Add the Notification System component */}
      <NotificationSystem />
    </Layout>
  );
};

export default AgentInterface;
