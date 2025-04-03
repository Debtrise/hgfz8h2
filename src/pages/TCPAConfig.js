import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Switch,
  Button,
  Collapse,
  Alert,
  Table,
  Tabs,
  Select,
  TimePicker,
  Upload,
  message,
  Tooltip,
  Divider,
  Space,
} from "antd";
import {
  PhoneOutlined,
  CloudUploadOutlined,
  SettingOutlined,
  FileAddOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import moment from "moment";
import callCenterService from "../services/callCenterService";
import "../CallCenter.css";

const { Panel } = Collapse;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = TimePicker;

const TCPAConfig = () => {
  // TCPA Settings
  const [tcpaForm] = Form.useForm();
  const [callConfigForm] = Form.useForm();
  const [byocForm] = Form.useForm();
  const [doNotCallList, setDoNotCallList] = useState([]);
  const [loadingDNC, setLoadingDNC] = useState(false);
  const [uploadingDNC, setUploadingDNC] = useState(false);

  // State management
  const [activeTab, setActiveTab] = useState("1");
  const [isAdvancedAMD, setIsAdvancedAMD] = useState(false);
  const [isBYOC, setIsBYOC] = useState(false);

  // Load data when component mounts
  useEffect(() => {
    // Fetch TCPA settings
    fetchTCPASettings();

    // Fetch Call Configuration
    fetchCallConfig();

    // Fetch BYOC settings
    fetchBYOCSettings();

    // Fetch DNC list
    fetchDNCList();
  }, []);

  // Fetch TCPA settings
  const fetchTCPASettings = async () => {
    try {
      const data = await callCenterService.tcpa.getSettings();
      tcpaForm.setFieldsValue(data);
    } catch (error) {
      console.error("Error fetching TCPA settings:", error);
      message.error("Failed to fetch TCPA settings");
    }
  };

  // Fetch Call Configuration
  const fetchCallConfig = async () => {
    try {
      const data = await callCenterService.tcpa.getCallConfig();
      callConfigForm.setFieldsValue(data);
      setIsAdvancedAMD(data.useAdvancedAMD || false);
    } catch (error) {
      console.error("Error fetching call configuration:", error);
      message.error("Failed to fetch call configuration");
    }
  };

  // Fetch BYOC settings
  const fetchBYOCSettings = async () => {
    try {
      const data = await callCenterService.tcpa.getBYOCSettings();
      byocForm.setFieldsValue(data);
      setIsBYOC(data.enabled || false);
    } catch (error) {
      console.error("Error fetching BYOC settings:", error);
      message.error("Failed to fetch BYOC settings");
    }
  };

  // Fetch DNC list
  const fetchDNCList = async () => {
    setLoadingDNC(true);
    try {
      const data = await callCenterService.tcpa.getDNCList();
      setDoNotCallList(data);
    } catch (error) {
      console.error("Error fetching DNC list:", error);
      message.error("Failed to fetch Do Not Call list");
    } finally {
      setLoadingDNC(false);
    }
  };

  // Save TCPA settings
  const handleTCPASubmit = async (values) => {
    try {
      await callCenterService.tcpa.saveSettings(values);
      message.success("TCPA settings saved successfully");
    } catch (error) {
      console.error("Error saving TCPA settings:", error);
      message.error("Failed to save TCPA settings");
    }
  };

  // Save Call Configuration
  const handleCallConfigSubmit = async (values) => {
    try {
      await callCenterService.tcpa.saveCallConfig(values);
      message.success("Call configuration saved successfully");
    } catch (error) {
      console.error("Error saving call configuration:", error);
      message.error("Failed to save call configuration");
    }
  };

  // Save BYOC settings
  const handleBYOCSubmit = async (values) => {
    try {
      await callCenterService.tcpa.saveBYOCSettings(values);
      message.success("BYOC settings saved successfully");
    } catch (error) {
      console.error("Error saving BYOC settings:", error);
      message.error("Failed to save BYOC settings");
    }
  };

  // Upload DNC file
  const uploadDNCFile = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploadingDNC(true);

    try {
      await callCenterService.tcpa.uploadDNCList(file);
      onSuccess("ok");
      message.success("Do Not Call list uploaded successfully");
      fetchDNCList();
    } catch (error) {
      console.error("Error uploading DNC list:", error);
      onError(error);
      message.error("Failed to upload Do Not Call list");
    } finally {
      setUploadingDNC(false);
    }
  };

  // Add a phone number to DNC list
  const addPhoneToDNC = async (values) => {
    try {
      await callCenterService.tcpa.addToDNC(values.phoneNumber, values.reason);
      message.success("Phone number added to Do Not Call list");
      fetchDNCList();
      tcpaForm.resetFields(["phoneNumber", "reason"]);
    } catch (error) {
      console.error("Error adding to DNC list:", error);
      message.error("Failed to add phone number to Do Not Call list");
    }
  };

  // Remove a phone number from DNC list
  const removeFromDNC = async (record) => {
    try {
      await callCenterService.tcpa.removeFromDNC(record.id);
      message.success("Phone number removed from Do Not Call list");
      fetchDNCList();
    } catch (error) {
      console.error("Error removing from DNC list:", error);
      message.error("Failed to remove phone number from Do Not Call list");
    }
  };

  // DNC list table columns
  const dncColumns = [
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Date Added",
      dataIndex: "dateAdded",
      key: "dateAdded",
      render: (text) => moment(text).format("YYYY-MM-DD"),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Added By",
      dataIndex: "addedBy",
      key: "addedBy",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button type="link" danger onClick={() => removeFromDNC(record)}>
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div className="tcpa-call-config-container">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span>
              <PhoneOutlined /> TCPA Compliance
            </span>
          }
          key="1"
        >
          <Alert
            message="TCPA Compliance Information"
            description="The Telephone Consumer Protection Act (TCPA) restricts telemarketing calls and the use of automatic telephone dialing systems. Ensure your organization complies with these regulations."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Collapse defaultActiveKey={["1", "2"]}>
            <Panel header="TCPA Settings" key="1">
              <Form
                form={tcpaForm}
                layout="vertical"
                onFinish={handleTCPASubmit}
              >
                <Form.Item
                  name="enableTCPACompliance"
                  label="Enable TCPA Compliance"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="callTimeRestrictions"
                  label="Call Time Restrictions"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="allowedCallingHours"
                  label="Allowed Calling Hours"
                  dependencies={["callTimeRestrictions"]}
                >
                  <RangePicker
                    format="HH:mm"
                    disabled={!tcpaForm.getFieldValue("callTimeRestrictions")}
                  />
                </Form.Item>

                <Form.Item
                  name="recordAllCalls"
                  label="Record All Calls"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="callRecordingDisclaimer"
                  label="Call Recording Disclaimer"
                  tooltip="Text that will be read to the caller when the call is being recorded"
                >
                  <Input.TextArea rows={3} />
                </Form.Item>

                <Divider />

                <Form.Item
                  name="enforceStateRestrictions"
                  label="Enforce State-Specific Restrictions"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="restrictedStates"
                  label="Restricted States"
                  dependencies={["enforceStateRestrictions"]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Select restricted states"
                    disabled={
                      !tcpaForm.getFieldValue("enforceStateRestrictions")
                    }
                  >
                    <Option value="AL">Alabama</Option>
                    <Option value="AK">Alaska</Option>
                    <Option value="AZ">Arizona</Option>
                    {/* Add other states */}
                  </Select>
                </Form.Item>

                <Button type="primary" htmlType="submit">
                  Save TCPA Settings
                </Button>
              </Form>
            </Panel>

            <Panel header="Do Not Call List Management" key="2">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Alert
                  message="Upload your DNC list as a CSV file"
                  description="The file should contain a column with phone numbers. You can also include a 'reason' column."
                  type="info"
                  showIcon
                />

                <Upload
                  name="file"
                  accept=".csv"
                  customRequest={uploadDNCFile}
                  maxCount={1}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />} loading={uploadingDNC}>
                    Upload DNC List
                  </Button>
                </Upload>

                <Divider>Or add individual numbers</Divider>

                <Form layout="inline" onFinish={addPhoneToDNC}>
                  <Form.Item
                    name="phoneNumber"
                    label="Phone Number"
                    rules={[
                      {
                        required: true,
                        message: "Please input a phone number",
                      },
                      {
                        pattern: /^\d{10}$/,
                        message: "Please enter a valid 10-digit phone number",
                      },
                    ]}
                  >
                    <Input
                      placeholder="10-digit number"
                      style={{ width: 150 }}
                    />
                  </Form.Item>

                  <Form.Item name="reason" label="Reason">
                    <Select style={{ width: 150 }}>
                      <Option value="Customer Request">Customer Request</Option>
                      <Option value="Wrong Number">Wrong Number</Option>
                      <Option value="Regulatory">Regulatory</Option>
                      <Option value="Other">Other</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Add to DNC
                    </Button>
                  </Form.Item>
                </Form>

                <Table
                  columns={dncColumns}
                  dataSource={doNotCallList}
                  rowKey="id"
                  loading={loadingDNC}
                  pagination={{ pageSize: 10 }}
                  title={() => "Do Not Call Numbers"}
                />
              </Space>
            </Panel>
          </Collapse>
        </TabPane>

        <TabPane
          tab={
            <span>
              <SettingOutlined /> Call Configuration
            </span>
          }
          key="2"
        >
          <Collapse defaultActiveKey={["1", "2"]}>
            <Panel header="Answering Machine Detection (AMD)" key="1">
              <Form
                form={callConfigForm}
                layout="vertical"
                onFinish={handleCallConfigSubmit}
              >
                <Form.Item
                  name="useAMD"
                  label="Enable Answering Machine Detection"
                  valuePropName="checked"
                >
                  <Switch
                    onChange={(checked) => {
                      if (!checked) setIsAdvancedAMD(false);
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="useAdvancedAMD"
                  label={
                    <span>
                      Enable Advanced AMD
                      <Tooltip title="Advanced AMD uses AI to better detect answering machines with fewer false positives">
                        <QuestionCircleOutlined style={{ marginLeft: 8 }} />
                      </Tooltip>
                    </span>
                  }
                  valuePropName="checked"
                  dependencies={["useAMD"]}
                >
                  <Switch
                    disabled={!callConfigForm.getFieldValue("useAMD")}
                    onChange={setIsAdvancedAMD}
                  />
                </Form.Item>

                {isAdvancedAMD && (
                  <>
                    <Form.Item
                      name="amdSensitivity"
                      label="AMD Sensitivity"
                      tooltip="Higher sensitivity may detect more answering machines but may have more false positives"
                    >
                      <Select>
                        <Option value="low">Low</Option>
                        <Option value="medium">Medium</Option>
                        <Option value="high">High</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item name="amdTimeout" label="AMD Timeout (seconds)">
                      <Input type="number" min={1} max={10} />
                    </Form.Item>

                    <Form.Item
                      name="amdActionOnDetection"
                      label="Action on Answering Machine Detection"
                    >
                      <Select>
                        <Option value="hangup">Hang Up</Option>
                        <Option value="transfer">Transfer to Agent</Option>
                        <Option value="voicemail">Leave Voicemail</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="amdVoicemailMessage"
                      label="Voicemail Message"
                      dependencies={["amdActionOnDetection"]}
                    >
                      <Select
                        disabled={
                          callConfigForm.getFieldValue(
                            "amdActionOnDetection"
                          ) !== "voicemail"
                        }
                      >
                        <Option value="default">Default Message</Option>
                        <Option value="custom1">Custom Message 1</Option>
                        <Option value="custom2">Custom Message 2</Option>
                      </Select>
                    </Form.Item>
                  </>
                )}

                <Divider />

                <Form.Item
                  name="callRecordingEnabled"
                  label="Enable Call Recording"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="callRecordingFormat"
                  label="Recording Format"
                  dependencies={["callRecordingEnabled"]}
                >
                  <Select
                    disabled={
                      !callConfigForm.getFieldValue("callRecordingEnabled")
                    }
                  >
                    <Option value="mp3">MP3</Option>
                    <Option value="wav">WAV</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="callRecordingStorage"
                  label="Storage Duration (days)"
                  dependencies={["callRecordingEnabled"]}
                >
                  <Input
                    type="number"
                    min={1}
                    disabled={
                      !callConfigForm.getFieldValue("callRecordingEnabled")
                    }
                  />
                </Form.Item>

                <Button type="primary" htmlType="submit">
                  Save Call Configuration
                </Button>
              </Form>
            </Panel>

            <Panel header="Bring Your Own Carrier (BYOC)" key="2">
              <Form
                form={byocForm}
                layout="vertical"
                onFinish={handleBYOCSubmit}
              >
                <Alert
                  message="BYOC Configuration"
                  description="Bring Your Own Carrier allows you to use your existing telecom provider with our platform."
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <Form.Item
                  name="enabled"
                  label="Enable BYOC"
                  valuePropName="checked"
                >
                  <Switch onChange={setIsBYOC} />
                </Form.Item>

                {isBYOC && (
                  <>
                    <Form.Item name="carrierType" label="Carrier Type">
                      <Select>
                        <Option value="sip">SIP Trunk</Option>
                        <Option value="pstn">PSTN</Option>
                        <Option value="other">Other</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="sipServer"
                      label="SIP Server"
                      dependencies={["carrierType"]}
                    >
                      <Input
                        placeholder="sip.example.com"
                        disabled={
                          byocForm.getFieldValue("carrierType") !== "sip"
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      name="sipUsername"
                      label="SIP Username"
                      dependencies={["carrierType"]}
                    >
                      <Input
                        disabled={
                          byocForm.getFieldValue("carrierType") !== "sip"
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      name="sipPassword"
                      label="SIP Password"
                      dependencies={["carrierType"]}
                    >
                      <Input.Password
                        disabled={
                          byocForm.getFieldValue("carrierType") !== "sip"
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      name="sipPort"
                      label="SIP Port"
                      dependencies={["carrierType"]}
                    >
                      <Input
                        type="number"
                        placeholder="5060"
                        disabled={
                          byocForm.getFieldValue("carrierType") !== "sip"
                        }
                      />
                    </Form.Item>

                    <Divider />

                    <Form.Item
                      name="outboundPrefixes"
                      label="Outbound Prefixes"
                      tooltip="Add any prefixes required for outbound calls (e.g., '9' for external line)"
                    >
                      <Input placeholder="e.g., 9" />
                    </Form.Item>

                    <Form.Item
                      name="inboundRouting"
                      label="Inbound Call Routing"
                    >
                      <Select>
                        <Option value="ivr">IVR</Option>
                        <Option value="queue">Queue</Option>
                        <Option value="agent">Direct to Agent</Option>
                      </Select>
                    </Form.Item>
                  </>
                )}

                <Button type="primary" htmlType="submit">
                  Save BYOC Configuration
                </Button>
              </Form>
            </Panel>
          </Collapse>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TCPAConfig;
