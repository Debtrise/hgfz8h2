import React, { useState } from 'react';
import {
  Layout,
  Card,
  Calendar,
  List,
  Button,
  Modal,
  Form,
  Input,
  Select,
  TimePicker,
  Typography,
  Badge,
  Space,
  Divider,
  Row,
  Col,
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// Mock data for appointments
const mockAppointments = [
  {
    id: 1,
    title: 'Team Meeting',
    date: '2024-03-15',
    time: '10:00',
    duration: 60,
    type: 'meeting',
    participants: ['John Smith', 'Sarah Johnson'],
    notes: 'Weekly team sync',
  },
  {
    id: 2,
    title: 'Customer Call - David Wilson',
    date: '2024-03-15',
    time: '14:30',
    duration: 30,
    type: 'call',
    participants: ['David Wilson'],
    notes: 'Follow-up on premium package',
  },
  {
    id: 3,
    title: 'Training Session',
    date: '2024-03-16',
    time: '09:00',
    duration: 120,
    type: 'training',
    participants: ['All Team Members'],
    notes: 'New product training',
  },
];

const Schedule = () => {
  const { currentAgent } = useAuth();
  const [appointments, setAppointments] = useState(mockAppointments);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [form] = Form.useForm();

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const showModal = (appointment = null) => {
    setSelectedAppointment(appointment);
    if (appointment) {
      form.setFieldsValue({
        title: appointment.title,
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration,
        type: appointment.type,
        participants: appointment.participants,
        notes: appointment.notes,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (selectedAppointment) {
        // Update existing appointment
        setAppointments(
          appointments.map((appt) =>
            appt.id === selectedAppointment.id
              ? { ...appt, ...values }
              : appt
          )
        );
      } else {
        // Add new appointment
        setAppointments([
          ...appointments,
          {
            id: appointments.length + 1,
            ...values,
          },
        ]);
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleDelete = (id) => {
    setAppointments(appointments.filter((appt) => appt.id !== id));
  };

  const getListData = (date) => {
    const dateStr = date.format('YYYY-MM-DD');
    return appointments.filter((appt) => appt.date === dateStr);
  };

  const dateCellRender = (date) => {
    const listData = getListData(date);
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((item) => (
          <li key={item.id}>
            <Badge
              status={item.type === 'call' ? 'success' : item.type === 'meeting' ? 'processing' : 'warning'}
              text={item.title}
            />
          </li>
        ))}
      </ul>
    );
  };

  const renderAppointmentList = () => {
    if (!selectedDate) return null;

    const dateStr = selectedDate.format('YYYY-MM-DD');
    const dayAppointments = appointments.filter(
      (appt) => appt.date === dateStr
    );

    return (
      <Card title={`Appointments for ${selectedDate.format('MMMM D, YYYY')}`}>
        <List
          dataSource={dayAppointments}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => showModal(item)}
                />,
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(item.id)}
                />,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Badge
                    status={item.type === 'call' ? 'success' : item.type === 'meeting' ? 'processing' : 'warning'}
                  />
                }
                title={
                  <Space>
                    <Text strong>{item.title}</Text>
                    <Text type="secondary">
                      <ClockCircleOutlined /> {item.time}
                    </Text>
                  </Space>
                }
                description={
                  <Space direction="vertical" size="small">
                    <Text>
                      <UserOutlined /> {item.participants.join(', ')}
                    </Text>
                    <Text type="secondary">{item.notes}</Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>Schedule</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Add Appointment
          </Button>
        </div>

        <Row gutter={[16, 16]}>
          <Col span={16}>
            <Card>
              <Calendar
                onSelect={handleDateSelect}
                dateCellRender={dateCellRender}
              />
            </Card>
          </Col>
          <Col span={8}>
            {renderAppointmentList()}
          </Col>
        </Row>

        <Modal
          title={selectedAppointment ? 'Edit Appointment' : 'Add Appointment'}
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              duration: 30,
              type: 'call',
            }}
          >
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: 'Please enter a title' }]}
            >
              <Input placeholder="Enter appointment title" />
            </Form.Item>

            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: 'Please select a date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="time"
              label="Time"
              rules={[{ required: true, message: 'Please select a time' }]}
            >
              <TimePicker format="HH:mm" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="duration"
              label="Duration (minutes)"
              rules={[{ required: true, message: 'Please enter duration' }]}
            >
              <Input type="number" min={15} step={15} />
            </Form.Item>

            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true, message: 'Please select a type' }]}
            >
              <Select>
                <Option value="call">Call</Option>
                <Option value="meeting">Meeting</Option>
                <Option value="training">Training</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="participants"
              label="Participants"
              rules={[{ required: true, message: 'Please enter participants' }]}
            >
              <Select mode="tags" placeholder="Enter participant names">
                {currentAgent && (
                  <Option value={currentAgent.name}>{currentAgent.name}</Option>
                )}
              </Select>
            </Form.Item>

            <Form.Item name="notes" label="Notes">
              <Input.TextArea rows={4} placeholder="Enter any notes..." />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default Schedule; 