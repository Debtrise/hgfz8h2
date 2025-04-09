import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./JourneySelect.css";
import apiService from "../services/apiService";
import { Select, Button, Modal, Form, Input, message, Space, Typography, DatePicker } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllJourneys, createJourney, deleteJourney } from '../services/journeyService';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const JourneySelect = ({
  campaignData = null,
  updateJourneys = null,
  onPreview = null,
  onCancel = null,
  isEmbedded = false,
  value,
  onChange,
  disabled,
  placeholder = 'Select a journey',
  allowClear = true,
  style,
  showCreate = true,
  showDelete = false,
  allowBulkSelect = false
}) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State for campaign data
  const [localCampaignData, setLocalCampaignData] = useState(
    campaignData || {
      name: "BDS_Fresh_Test",
      leadAge: "0-15",
      brand: "BDS",
      source: "Web Forms, Fb, TikTok",
    }
  );

  // State for journeys
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // State for new journey modal
  const [showNewJourneyModal, setShowNewJourneyModal] = useState(false);
  const [newJourneyName, setNewJourneyName] = useState("");
  const [newJourneyDescription, setNewJourneyDescription] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedJourneys, setSelectedJourneys] = useState([]);

  // Update parent component when journeys change
  useEffect(() => {
    if (updateJourneys && isEmbedded) {
      updateJourneys(journeys);
    }
  }, [journeys, updateJourneys, isEmbedded]);

  useEffect(() => {
    fetchJourneys();
  }, []);

  const fetchJourneys = async () => {
    try {
      setLoading(true);
      const data = await getAllJourneys();
      setJourneys(data);
    } catch (error) {
      console.error('Error fetching journeys:', error);
      message.error('Failed to load journeys');
    } finally {
      setLoading(false);
    }
  };

  // Toggle journey favorite status
  const toggleFavorite = (id) => {
    setJourneys(
      journeys.map((journey) =>
        journey.id === id
          ? { ...journey, favorite: !journey.favorite }
          : journey
      )
    );
  };

  // Update day assignment
  const updateDayAssignment = (id, field, value) => {
    setJourneys(
      journeys.map((journey) =>
        journey.id === id
          ? { ...journey, [field]: parseInt(value, 10) || 0 }
          : journey
      )
    );
  };

  // Handle preview button click
  const handlePreview = () => {
    if (journeys.length === 0) {
      setError("Please select at least one journey before previewing");
      return;
    }
    
    // Validate journey mappings
    const sortedJourneys = [...journeys].sort((a, b) => a.startDay - b.startDay);
    
    // Check for overlapping day ranges
    for (let i = 1; i < sortedJourneys.length; i++) {
      const prevJourney = sortedJourneys[i - 1];
      const currentJourney = sortedJourneys[i];
      
      if (prevJourney.endDay >= currentJourney.startDay) {
        setError("Journey day ranges cannot overlap");
        return;
      }
    }
    
    // If validation passes, call the onPreview callback
    if (onPreview) {
      onPreview(journeys);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Handle journey selection
  const handleJourneySelect = (selectedValue) => {
    if (allowBulkSelect) {
      setSelectedJourneys(selectedValue);
      onChange(selectedValue);
    } else {
      onChange(selectedValue);
    }
  };

  // Add a new journey
  const handleCreateJourney = async (values) => {
    try {
      const newJourney = {
        name: values.name,
        description: values.description,
        type: values.type,
        status: 'DRAFT',
        schedule: {
          start_date: values.startDate.toISOString(),
          end_date: values.endDate.toISOString(),
          timezone: values.timezone
        }
      };

      await createJourney(newJourney);
      message.success('Journey created successfully');
      setModalVisible(false);
      form.resetFields();
      fetchJourneys();
    } catch (error) {
      console.error('Error creating journey:', error);
      message.error('Failed to create journey');
    }
  };

  // Delete selected journeys
  const handleDeleteJourneys = async () => {
    if (!selectedJourneys.length) {
      message.warning('Please select journeys to delete');
      return;
    }
    
    Modal.confirm({
      title: 'Delete Journeys',
      content: `Are you sure you want to delete ${selectedJourneys.length} journey(s)?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
          // Delete all selected journeys
          await Promise.all(selectedJourneys.map(id => apiService.journeys.delete(id)));
      
          // Remove deleted journeys from the list
          const updatedJourneys = journeys.filter(journey => !selectedJourneys.includes(journey.id));
      setJourneys(updatedJourneys);
          setSelectedJourneys([]);
      
      // Update the parent component
      if (updateJourneys) {
        updateJourneys(updatedJourneys);
      }
          
          message.success('Journeys deleted successfully');
    } catch (err) {
          console.error("Error deleting journeys:", err);
          setError("Failed to delete journeys. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
      }
    });
  };

  // Validate the journey day ranges
  const validateJourneys = () => {
    if (journeys.length === 0) {
      alert("Please add at least one journey");
      return false;
    }

    const sortedJourneys = [...journeys].sort(
      (a, b) => a.startDay - b.startDay
    );

    // Check for overlaps or gaps
    for (let i = 1; i < sortedJourneys.length; i++) {
      const prevJourney = sortedJourneys[i - 1];
      const currentJourney = sortedJourneys[i];

      if (prevJourney.endDay + 1 !== currentJourney.startDay) {
        alert(
          `There is a gap or overlap between day ranges. Please ensure they are consecutive.`
        );
        return false;
      }
    }

    return true;
  };

  // If embedded, we don't need to wrap in a full content container
  const renderContent = () => (
    <>
      {!isEmbedded && (
        <div className="campaign-info-grid">
          <div className="info-col">
            <h3 className="info-label">Campaign</h3>
            <p className="info-value">{localCampaignData.name}</p>
          </div>
          <div className="info-col">
            <h3 className="info-label">Lead Age</h3>
            <p className="info-value">{localCampaignData.leadAge}</p>
          </div>
          <div className="info-col">
            <h3 className="info-label">Brand</h3>
            <p className="info-value">{localCampaignData.brand}</p>
          </div>
          <div className="info-col">
            <h3 className="info-label">Source</h3>
            <p className="info-value">{localCampaignData.source}</p>
          </div>
        </div>
      )}

      <div className="journey-select-container">
        {!isEmbedded && (
          <div className="journey-select-header">
            <h2 className="section-title">Journey Select</h2>
            <button
              className="button-outline"
              onClick={() => setModalVisible(true)}
            >
              New
            </button>
          </div>
        )}

        {/* Day Assignment Header */}
        <div className="day-assignment-header">
          <div className="day-assignment-label">Day Assignment</div>
          <div className="day-range-headers">
            <div className="day-header">Start</div>
            <div className="day-header">End</div>
          </div>
        </div>

        {/* Journeys List */}
        <ul className="journey-list">
          {journeys.map((journey) => (
            <li key={journey.id} className="journey-item">
              <div className="journey-day-range">
                <input
                  type="number"
                  className="day-input"
                  value={journey.startDay}
                  min="0"
                  onChange={(e) =>
                    updateDayAssignment(journey.id, "startDay", e.target.value)
                  }
                />
                <input
                  type="number"
                  className="day-input"
                  value={journey.endDay}
                  min={journey.startDay}
                  onChange={(e) =>
                    updateDayAssignment(journey.id, "endDay", e.target.value)
                  }
                />
              </div>
              <div className="journey-name">{journey.name}</div>
              <div className="journey-description">{journey.description}</div>
              <div className="journey-actions">
                <div className="journey-date">Added: {journey.dateAdded}</div>
                <button
                  className={`favorite-button ${
                    journey.favorite ? "active" : ""
                  }`}
                  onClick={() => toggleFavorite(journey.id)}
                  title={
                    journey.favorite
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  <i
                    className={`icon star-icon ${
                      journey.favorite ? "active" : ""
                    }`}
                  ></i>
                </button>
                <div className="journey-options-container">
                  <button className="more-options-button">
                    <i className="icon more-icon"></i>
                  </button>
                  <div className="journey-options-dropdown">
                    <ul>
                      <li
                        onClick={() =>
                          navigate(`/journeys/builder/${journey.id}`)
                        }
                      >
                        Edit Journey
                      </li>
                      <li onClick={() => deleteJourney(journey.id)}>Remove</li>
                    </ul>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Add Journey Button */}
        <div className="add-journey-row">
          <button
            className="add-journey-button"
            onClick={() => setModalVisible(true)}
            title="Add a new journey"
          >
            +
          </button>
        </div>

        {/* Footer Buttons */}
        <div className="journey-footer-buttons">
          <button className="button-outline" onClick={handleCancel}>
            Cancel
          </button>
          <button className="button-blue" onClick={handlePreview}>
            {isEmbedded ? "Finish" : "Preview"}
          </button>
        </div>
      </div>

      {/* New Journey Modal */}
      <Modal
        title="Create New Journey"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleCreateJourney}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Journey Name"
            rules={[{ required: true, message: 'Please enter a journey name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="type"
            label="Journey Type"
            rules={[{ required: true, message: 'Please select a journey type' }]}
          >
            <Select>
              <Select.Option value="EMAIL">Email</Select.Option>
              <Select.Option value="CALL">Call</Select.Option>
              <Select.Option value="SMS">SMS</Select.Option>
              <Select.Option value="MIXED">Mixed</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true, message: 'Please select a start date' }]}
          >
            <DatePicker showTime />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="End Date"
            rules={[{ required: true, message: 'Please select an end date' }]}
          >
            <DatePicker showTime />
          </Form.Item>

          <Form.Item
            name="timezone"
            label="Timezone"
            rules={[{ required: true, message: 'Please select a timezone' }]}
          >
            <Select>
              <Select.Option value="UTC">UTC</Select.Option>
              <Select.Option value="America/New_York">Eastern Time</Select.Option>
              <Select.Option value="America/Chicago">Central Time</Select.Option>
              <Select.Option value="America/Denver">Mountain Time</Select.Option>
              <Select.Option value="America/Los_Angeles">Pacific Time</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create Journey
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );

  // If used as a standalone page, wrap in content container
  if (!isEmbedded) {
    return (
      <div className="content">
        <div className="campaign-details-card">{renderContent()}</div>
      </div>
    );
  }

  // When embedded in the campaign builder
  return renderContent();
};

export default JourneySelect;
