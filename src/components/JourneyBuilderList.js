import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Spin
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
  ClockCircleOutlined
} from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  getJourneyById, 
  createJourney, 
  updateJourney,
  getJourneySteps,
  addJourneyStep,
  updateJourneyStep,
  deleteJourneyStep,
  reorderJourneySteps
} from '../services/journeyService';
import './JourneyBuilderList.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const JourneyBuilderList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [journeyForm] = Form.useForm();
  
  const [journey, setJourney] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  const [journeyDrawerVisible, setJourneyDrawerVisible] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [activeTab, setActiveTab] = useState('steps');
  
  // Action types with their respective icons
  const actionTypes = [
    { value: 'email', label: 'Email', icon: <MailOutlined /> },
    { value: 'call', label: 'Call', icon: <PhoneOutlined /> },
    { value: 'sms', label: 'SMS', icon: <MessageOutlined /> },
    { value: 'wait', label: 'Wait', icon: <HistoryOutlined /> }
  ];

  // Fetch journey data if editing an existing journey
  useEffect(() => {
    const fetchJourney = async () => {
      if (id) {
        try {
          setLoading(true);
          const data = await getJourneyById(id);
          setJourney(data);
          setSteps(data.steps || []);
          
          // Set form values for journey details
          journeyForm.setFieldsValue({
            name: data.name,
            description: data.description,
            status: data.status
          });
        } catch (error) {
          console.error('Error fetching journey:', error);
          message.error('Failed to load journey');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchJourney();
  }, [id, journeyForm]);

  // Handle drag and drop reordering
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const items = Array.from(steps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update sequence order
    const updatedItems = items.map((item, index) => ({
      ...item,
      sequenceOrder: index + 1
    }));
    
    setSteps(updatedItems);
    
    // If we have an ID, update the backend
    if (id) {
      try {
        setLoading(true);
        const stepIds = updatedItems.map(item => item.id);
        await reorderJourneySteps(id, stepIds);
        message.success('Steps reordered successfully');
      } catch (error) {
        console.error('Error reordering steps:', error);
        message.error('Failed to reorder steps');
      } finally {
        setLoading(false);
      }
    }
  };

  // Add a new step
  const handleAddStep = async () => {
    const newStep = {
      id: `step-${Date.now()}`,
      sequenceOrder: steps.length + 1,
      actionType: 'email',
      actionConfig: {},
      delayMinutes: 0,
      conditionType: null,
      conditionConfig: null
    };
    
    setSteps([...steps, newStep]);
    
    // If we have an ID, add to the backend
    if (id) {
      try {
        setLoading(true);
        const stepData = {
          actionType: newStep.actionType,
          actionConfig: newStep.actionConfig,
          delayMinutes: newStep.delayMinutes,
          sequenceOrder: newStep.sequenceOrder
        };
        
        const response = await addJourneyStep(id, stepData);
        
        // Update the step with the ID from the backend
        const updatedSteps = steps.map(step => 
          step.id === newStep.id ? { ...step, id: response.id } : step
        );
        
        setSteps(updatedSteps);
        message.success('Step added successfully');
      } catch (error) {
        console.error('Error adding step:', error);
        message.error('Failed to add step');
      } finally {
        setLoading(false);
      }
    }
  };

  // Open the edit drawer for a step
  const handleEditStep = (step) => {
    setEditingStep(step);
    editForm.setFieldsValue({
      actionType: step.actionType,
      ...step.actionConfig,
      delayMinutes: step.delayMinutes,
      conditionType: step.conditionType,
      ...step.conditionConfig
    });
    setEditDrawerVisible(true);
  };

  // Delete a step
  const handleDeleteStep = async (stepId) => {
    setSteps(steps.filter(step => step.id !== stepId));
    
    // If we have an ID and the step has a real ID (not a temporary one), delete from the backend
    if (id && !stepId.toString().includes('step-')) {
      try {
        setLoading(true);
        await deleteJourneyStep(id, stepId);
        message.success('Step deleted successfully');
      } catch (error) {
        console.error('Error deleting step:', error);
        message.error('Failed to delete step');
      } finally {
        setLoading(false);
      }
    }
  };

  // Save step changes
  const handleSaveStep = async () => {
    try {
      const values = await editForm.validateFields();
      
      // Format the step data according to the API requirements
      const updatedStep = {
        ...editingStep,
        actionType: values.actionType,
        actionConfig: getActionConfig(values),
        delayMinutes: values.delayMinutes || 0,
        conditionType: values.conditionType || null,
        conditionConfig: getConditionConfig(values)
      };
      
      // Update the step in the list
      const updatedSteps = steps.map(step => 
        step.id === editingStep.id ? updatedStep : step
      );
      
      setSteps(updatedSteps);
      
      // If we have an ID and the step has a real ID (not a temporary one), update the backend
      if (id && !editingStep.id.toString().includes('step-')) {
        setLoading(true);
        const stepData = {
          actionType: updatedStep.actionType,
          actionConfig: updatedStep.actionConfig,
          delayMinutes: updatedStep.delayMinutes,
          sequenceOrder: updatedStep.sequenceOrder
        };
        
        await updateJourneyStep(id, editingStep.id, stepData);
        message.success('Step updated successfully');
        setLoading(false);
      }
      
      setEditDrawerVisible(false);
      setEditingStep(null);
      editForm.resetFields();
    } catch (error) {
      console.error('Error saving step:', error);
    }
  };

  // Get action configuration based on action type
  const getActionConfig = (values) => {
    switch (values.actionType) {
      case 'email':
        return {
          subject: values.subject,
          template_id: values.template_id,
          variables: values.variables || {}
        };
      case 'call':
        return {
          script_id: values.script_id,
          max_attempts: values.max_attempts,
          voicemail_message_id: values.voicemail_message_id,
          transfer_extension: values.transfer_extension
        };
      case 'sms':
        return {
          message: values.message,
          template_id: values.template_id,
          variables: values.variables || {}
        };
      default:
        return {};
    }
  };

  // Get condition configuration based on condition type
  const getConditionConfig = (values) => {
    if (!values.conditionType) return null;
    
    switch (values.conditionType) {
      case 'time':
        if (values.timeConditionType === 'scheduled') {
          return {
            scheduledTime: values.scheduledTime
          };
        } else {
          return {
            durationMinutes: values.durationMinutes
          };
        }
      default:
        return null;
    }
  };

  // Open journey details drawer
  const handleEditJourneyDetails = () => {
    setJourneyDrawerVisible(true);
  };

  // Save journey details
  const handleSaveJourneyDetails = async () => {
    try {
      const values = await journeyForm.validateFields();
      
      if (id) {
        // Update existing journey
        await updateJourney(id, {
          name: values.name,
          description: values.description,
          status: values.status
        });
        
        setJourney({
          ...journey,
          name: values.name,
          description: values.description,
          status: values.status
        });
        
        message.success('Journey details updated successfully');
      }
      
      setJourneyDrawerVisible(false);
    } catch (error) {
      console.error('Error saving journey details:', error);
      message.error('Failed to save journey details');
    }
  };

  // Save the entire journey
  const handleSaveJourney = async () => {
    try {
      setLoading(true);
      
      // Format steps for API
      const formattedSteps = steps.map(step => ({
        actionType: step.actionType,
        actionConfig: step.actionConfig,
        delayMinutes: step.delayMinutes,
        sequenceOrder: step.sequenceOrder
      }));
      
      if (id) {
        // Update existing journey
        await updateJourney(id, {
          name: journey?.name || 'New Journey',
          description: journey?.description || 'Journey description',
          status: journey?.status || 'draft'
        });
        
        message.success('Journey updated successfully');
      } else {
        // Create new journey
        const journeyData = {
          name: journey?.name || 'New Journey',
          description: journey?.description || 'Journey description',
          status: journey?.status || 'draft',
          steps: formattedSteps
        };
        
        const createdJourney = await createJourney(journeyData);
        message.success('Journey created successfully');
        
        // Navigate to the new journey
        navigate(`/journeys/${createdJourney.id}`);
      }
    } catch (error) {
      console.error('Error saving journey:', error);
      message.error('Failed to save journey');
    } finally {
      setLoading(false);
    }
  };

  // Get icon for action type
  const getActionIcon = (type) => {
    const action = actionTypes.find(a => a.value === type);
    return action ? action.icon : <BranchesOutlined />;
  };

  // Render step configuration fields based on action type
  const renderStepConfigFields = () => {
    const actionType = editForm.getFieldValue('actionType');
    
    switch (actionType) {
      case 'email':
        return (
          <>
            <Form.Item
              name="subject"
              label="Subject"
              rules={[{ required: true, message: 'Please enter email subject' }]}
            >
              <Input placeholder="Email subject" />
            </Form.Item>
            <Form.Item
              name="template_id"
              label="Template"
              rules={[{ required: true, message: 'Please select email template' }]}
            >
              <Select placeholder="Select email template">
                <Option value="1">Welcome Email</Option>
                <Option value="2">Follow-up Email</Option>
                <Option value="3">Reminder Email</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="variables"
              label="Variables"
            >
              <Input placeholder="Template variables (JSON)" />
            </Form.Item>
          </>
        );
      case 'call':
        return (
          <>
            <Form.Item
              name="script_id"
              label="Script"
              rules={[{ required: true, message: 'Please select call script' }]}
            >
              <Select placeholder="Select call script">
                <Option value="1">Welcome Call</Option>
                <Option value="2">Follow-up Call</Option>
                <Option value="3">Reminder Call</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="max_attempts"
              label="Max Attempts"
              initialValue={3}
            >
              <InputNumber min={1} max={5} />
            </Form.Item>
            <Form.Item
              name="voicemail_message_id"
              label="Voicemail Message"
            >
              <Select placeholder="Select voicemail message" allowClear>
                <Option value="1">Standard Voicemail</Option>
                <Option value="2">Urgent Voicemail</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="transfer_extension"
              label="Transfer Extension"
            >
              <Input placeholder="Extension number" />
            </Form.Item>
          </>
        );
      case 'sms':
        return (
          <>
            <Form.Item
              name="message"
              label="SMS Message"
              rules={[{ required: true, message: 'Please enter SMS message' }]}
            >
              <TextArea rows={3} placeholder="Enter SMS message..." />
            </Form.Item>
            <Form.Item
              name="template_id"
              label="Template"
            >
              <Select placeholder="Select SMS template" allowClear>
                <Option value="1">Welcome SMS</Option>
                <Option value="2">Follow-up SMS</Option>
                <Option value="3">Reminder SMS</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="variables"
              label="Variables"
            >
              <Input placeholder="Template variables (JSON)" />
            </Form.Item>
          </>
        );
      case 'wait':
        return (
          <Form.Item
            name="delayMinutes"
            label="Wait Time (minutes)"
            rules={[{ required: true, message: 'Please enter wait time' }]}
            initialValue={60}
          >
            <InputNumber min={1} max={1440} />
          </Form.Item>
        );
      default:
        return null;
    }
  };

  // Render condition configuration fields
  const renderConditionFields = () => {
    const conditionType = editForm.getFieldValue('conditionType');
    
    if (!conditionType) return null;
    
    switch (conditionType) {
      case 'time':
        return (
          <>
            <Form.Item
              name="timeConditionType"
              label="Time Condition"
              rules={[{ required: true, message: 'Please select time condition type' }]}
            >
              <Select placeholder="Select time condition">
                <Option value="scheduled">Scheduled Time</Option>
                <Option value="duration">Time Duration</Option>
              </Select>
            </Form.Item>
            
            {editForm.getFieldValue('timeConditionType') === 'scheduled' && (
              <Form.Item
                name="scheduledTime"
                label="Time (HH:MM)"
                rules={[{ required: true, message: 'Please enter scheduled time' }]}
              >
                <Input placeholder="14:30" />
              </Form.Item>
            )}
            
            {editForm.getFieldValue('timeConditionType') === 'duration' && (
              <Form.Item
                name="durationMinutes"
                label="Duration (minutes)"
                rules={[{ required: true, message: 'Please enter duration' }]}
              >
                <InputNumber min={1} max={1440} />
              </Form.Item>
            )}
          </>
        );
      default:
        return null;
    }
  };

  // Render step card
  const renderStepCard = (step, index) => {
    return (
      <Draggable key={step.id} draggableId={step.id.toString()} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="step-card"
          >
            <div className="step-card-header">
              <div className="step-card-title">
                {getActionIcon(step.actionType)}
                <span>Step {step.sequenceOrder}</span>
              </div>
              <Space>
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  onClick={() => handleEditStep(step)}
                />
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => handleDeleteStep(step.id)}
                />
              </Space>
            </div>
            <div className="step-card-content">
              <Text strong>{step.actionType.charAt(0).toUpperCase() + step.actionType.slice(1)}</Text>
              {step.delayMinutes > 0 && (
                <Text type="secondary">Wait: {step.delayMinutes} minutes</Text>
              )}
              {step.conditionType && (
                <Text type="secondary">Condition: {step.conditionType}</Text>
              )}
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  // Render journey statistics
  const renderStatistics = () => {
    if (!journey?.stats) return null;
    
    const { total_leads, active_leads, completed_leads } = journey.stats;
    
    return (
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Leads"
              value={total_leads}
              prefix={<BranchesOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Leads"
              value={active_leads}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Completed Leads"
              value={completed_leads}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div className="journey-builder">
      <Spin spinning={loading}>
        <Card className="journey-header-card">
          <div className="journey-header">
            <div>
              <Title level={2}>{journey?.name || 'New Journey'}</Title>
              <Text type="secondary">{journey?.description || 'Journey description'}</Text>
            </div>
            <Space>
              <Button 
                icon={<EditOutlined />} 
                onClick={handleEditJourneyDetails}
              >
                Edit Details
              </Button>
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={handleSaveJourney}
              >
                Save Journey
              </Button>
            </Space>
          </div>
        </Card>

        <Tabs activeKey={activeTab} onChange={setActiveTab} className="journey-tabs">
          <TabPane tab="Steps" key="steps">
            <Card className="journey-steps-card">
              <div className="steps-header">
                <Title level={4}>Journey Steps</Title>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleAddStep}
                >
                  Add Step
                </Button>
              </div>
              
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="steps">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="steps-container"
                    >
                      {steps.length > 0 ? (
                        steps.map((step, index) => renderStepCard(step, index))
                      ) : (
                        <div className="empty-steps">
                          <Text type="secondary">No steps added yet. Click "Add Step" to begin.</Text>
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </Card>
          </TabPane>
          
          <TabPane tab="Performance" key="performance">
            <Card className="journey-info-card">
              <Title level={4}>Journey Performance</Title>
              {journey?.stats ? (
                <>
                  {renderStatistics()}
                </>
              ) : (
                <div className="empty-stats">
                  <Text type="secondary">
                    Performance tracking data will be displayed once the journey has active leads.
                  </Text>
                </div>
              )}
            </Card>
          </TabPane>
        </Tabs>
      </Spin>

      {/* Step Edit Drawer */}
      <Drawer
        title="Edit Step"
        placement="right"
        onClose={() => {
          setEditDrawerVisible(false);
          setEditingStep(null);
          editForm.resetFields();
        }}
        open={editDrawerVisible}
        width={500}
        extra={
          <Space>
            <Button onClick={() => {
              setEditDrawerVisible(false);
              setEditingStep(null);
              editForm.resetFields();
            }}>
              Cancel
            </Button>
            <Button type="primary" onClick={handleSaveStep}>
              Save
            </Button>
          </Space>
        }
      >
        <Form
          form={editForm}
          layout="vertical"
        >
          <Form.Item
            name="actionType"
            label="Action Type"
            rules={[{ required: true, message: 'Please select action type' }]}
          >
            <Select placeholder="Select action type">
              {actionTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  <Space>
                    {type.icon}
                    <span>{type.label}</span>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          {renderStepConfigFields()}
          
          <Divider orientation="left">Conditions</Divider>
          
          <Form.Item
            name="conditionType"
            label="Condition Type"
          >
            <Select 
              placeholder="Select condition type" 
              allowClear
            >
              <Option value="time">Time</Option>
            </Select>
          </Form.Item>
          
          {renderConditionFields()}
        </Form>
      </Drawer>

      {/* Journey Details Drawer */}
      <Drawer
        title="Journey Details"
        placement="right"
        onClose={() => {
          setJourneyDrawerVisible(false);
          journeyForm.resetFields();
        }}
        open={journeyDrawerVisible}
        width={500}
        extra={
          <Space>
            <Button onClick={() => {
              setJourneyDrawerVisible(false);
              journeyForm.resetFields();
            }}>
              Cancel
            </Button>
            <Button type="primary" onClick={handleSaveJourneyDetails}>
              Save
            </Button>
          </Space>
        }
      >
        <Form
          form={journeyForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Journey Name"
            rules={[{ required: true, message: 'Please enter journey name' }]}
          >
            <Input placeholder="Enter journey name" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={4} placeholder="Enter journey description" />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select journey status' }]}
          >
            <Select placeholder="Select journey status">
              <Option value="draft">Draft</Option>
              <Option value="active">Active</Option>
              <Option value="paused">Paused</Option>
              <Option value="archived">Archived</Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default JourneyBuilderList; 