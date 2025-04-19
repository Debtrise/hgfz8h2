import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as campaignService from "../services/campaignService";
import * as journeyService from "../services/journeyService";
import apiService from "../services/apiService";
import "./CampaignBuilder.css"; // Import the new CSS file
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  InputNumber,
  Space,
  Row,
  Col,
  Typography,
  Steps,
  Divider,
  Switch,
  Tag,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Step } = Steps;

const CampaignBuilderContainer = styled.div`
  padding: 24px;
`;

const CampaignBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // Step management with progress indicators
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4; // Reduced to 4 steps (removed lead creation step)
  
  // Form state management
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brand: "",
    source: "",
    leadPoolId: "",
    didPoolId: "",
    status: "active",
    journeyMappings: []
  });
  
  // UI state management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState(""); // For auto-save indication
  const [error, setError] = useState(null);
  const [leadPools, setLeadPools] = useState([]);
  const [didPools, setDidPools] = useState([]);
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [sources, setSources] = useState([]);

  const [form] = Form.useForm();
  
  // Load resources
  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading resources from API...');
        
        // Fetch lead pools using apiService
        let leadPoolsData = [];
        try {
          const leadPoolsResponse = await apiService.leadPools.getAll();
          console.log('Lead pools response:', leadPoolsResponse);
          leadPoolsData = Array.isArray(leadPoolsResponse.data) ? leadPoolsResponse.data : [];
        } catch (err) {
          console.error('Error loading lead pools:', err);
        }
        
        // Fetch DID pools using apiService
        let didPoolsData = [];
        try {
          const didPoolsResponse = await apiService.didPools.getAll();
          console.log('DID pools response:', didPoolsResponse);
          didPoolsData = Array.isArray(didPoolsResponse.data) ? didPoolsResponse.data : [];
        } catch (err) {
          console.error('Error loading DID pools:', err);
        }
        
        // Fetch journeys
        let journeysData = [];
        try {
          const journeysResponse = await journeyService.getAllJourneys();
          console.log('Journeys response:', journeysResponse);
          journeysData = Array.isArray(journeysResponse) ? journeysResponse : [];
        } catch (err) {
          console.error('Error loading journeys:', err);
        }

        // Fetch brands
        let brandsData = [];
        try {
          const brandsResponse = await apiService.brands.getAll();
          console.log('Brands response:', brandsResponse);
          brandsData = Array.isArray(brandsResponse.data) ? brandsResponse.data : [];
          setBrands(brandsData);
        } catch (err) {
          console.error('Error loading brands:', err);
        }

        // Fetch sources
        let sourcesData = [];
        try {
          const sourcesResponse = await apiService.sources.getAll();
          console.log('Sources response:', sourcesResponse);
          sourcesData = Array.isArray(sourcesResponse.data) ? sourcesResponse.data : [];
          setSources(sourcesData);
        } catch (err) {
          console.error('Error loading sources:', err);
        }

        console.log('Resources loaded successfully:', {
          leadPools: leadPoolsData.length,
          didPools: didPoolsData.length,
          journeys: journeysData.length,
          brands: brandsData.length,
          sources: sourcesData.length
        });

        setLeadPools(leadPoolsData);
        setDidPools(didPoolsData);
        setJourneys(journeysData);
        
        // If we have no data for any resource, show a warning
        if (leadPoolsData.length === 0 && didPoolsData.length === 0 && journeysData.length === 0) {
          setError('No resources found. Please create lead pools, DID pools, and journeys before creating a campaign.');
        }
      } catch (err) {
        console.error('Error loading resources:', err);
        setError(err.message || 'Failed to load necessary resources. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, []);

  // Load campaign data in edit mode
  useEffect(() => {
    const loadCampaignData = async () => {
      if (!isEditMode) return;

      setIsSubmitting(true);
      setError(null);

      try {
        const campaign = await campaignService.getCampaignById(id);
        setFormData({
          name: campaign.name || "",
          description: campaign.description || "",
          brand: campaign.brand || "",
          source: campaign.source || "",
          leadPoolId: campaign.leadPoolId || "",
          didPoolId: campaign.didPoolId || "",
          status: campaign.status || "active",
          journeyMappings: campaign.journeyMappings || []
        });
      } catch (err) {
        console.error("Error loading campaign:", err);
        setError("Failed to load campaign data. Please try again later.");
      } finally {
        setIsSubmitting(false);
      }
    };

    loadCampaignData();
  }, [id, isEditMode]);

  // Auto-save functionality 
  useEffect(() => {
    if (!isDirty || !isEditMode) return;
    
    const autoSaveTimer = setTimeout(async () => {
      try {
        await campaignService.updateCampaign(id, formData);
        setAutoSaveStatus("Draft saved");
        
        // Clear the status message after 2 seconds
        const clearTimer = setTimeout(() => {
          setAutoSaveStatus("");
        }, 2000);
        
        return () => clearTimeout(clearTimer);
      } catch (err) {
        console.error("Error auto-saving campaign:", err);
        setAutoSaveStatus("Failed to save draft");
      }
    }, 3000);
    
    return () => clearTimeout(autoSaveTimer);
  }, [formData, isDirty, id, isEditMode]);

  // Form field change handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    // Clear error for this field when user makes changes
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    
    setIsDirty(true);
    setAutoSaveStatus("Saving...");
  };

  // Helper function to handle journey mapping changes
  const handleJourneyMappingChange = (index, field, value) => {
    const updatedMappings = [...formData.journeyMappings];
    updatedMappings[index] = {
      ...updatedMappings[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      journeyMappings: updatedMappings
    }));
    setIsDirty(true);
  };

  // Helper function to add a new journey mapping
  const addJourneyMapping = () => {
    setFormData(prev => ({
      ...prev,
      journeyMappings: [
        ...prev.journeyMappings,
        {
          journeyId: "",
          leadAgeMin: 0,
          leadAgeMax: 30,
          durationDays: 7
        }
      ]
    }));
    setIsDirty(true);
  };

  // Helper function to remove a journey mapping
  const removeJourneyMapping = (index) => {
    const updatedMappings = formData.journeyMappings.filter((_, i) => i !== index);
    // Update priorities
    updatedMappings.forEach((mapping, i) => {
      mapping.priority = i + 1;
    });
    setFormData(prev => ({
      ...prev,
      journeyMappings: updatedMappings
    }));
    setIsDirty(true);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Required field validation
    if (!formData.name.trim()) {
      newErrors.name = "Campaign name is required";
    }
    if (!formData.brand) {
      newErrors.brand = "Brand is required";
    }
    if (!formData.source) {
      newErrors.source = "Source is required";
    }
    if (!formData.leadPoolId) {
      newErrors.leadPoolId = "Lead pool is required";
    }
    if (!formData.didPoolId) {
      newErrors.didPoolId = "DID pool is required";
    }
    if (formData.journeyMappings.length === 0) {
      newErrors.journeyMappings = "At least one journey mapping is required";
    } else {
      const invalidMappings = formData.journeyMappings.some(mapping => !mapping.journeyId);
      if (invalidMappings) {
        newErrors.journeyMappings = "All journey mappings must have a journey selected";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle step navigation
  const handleNext = () => {
    if (!validateForm()) return;
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      // Track progress in analytics (in a real app)
      console.log(`Step ${currentStep + 1} completed:`, formData);
    } else {
      // Submit form and navigate to campaign detail
      submitCampaign();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    // If form is dirty, confirm before navigating away
    if (isDirty) {
      if (window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
        navigate("/campaigns");
      }
    } else {
      navigate("/campaigns");
    }
  };

  // Handle updating journeys from the JourneySelect component
  const handleJourneysUpdate = (updatedJourneys) => {
    // Convert the journeys to the required journeyMappings format
    const journeyMappings = updatedJourneys.map(journey => ({
      journeyId: journey.id,
      priority: 1,
      maxConcurrent: 1,
      maxAttempts: 3,
      retryDelay: 300,
      status: 'active'
    }));
    
    setFormData((prev) => ({
      ...prev,
      journeyMappings
    }));
    setIsDirty(true);
  };
  
  // Submit the campaign data
  const submitCampaign = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Prepare the campaign data according to the API requirements
      const campaignData = {
        name: formData.name,
        brand: formData.brand,
        source: formData.source,
        leadPoolId: parseInt(formData.leadPoolId),
        didPoolId: parseInt(formData.didPoolId),
        status: formData.status,
        journeyMappings: formData.journeyMappings.map(mapping => ({
          journeyId: parseInt(mapping.journeyId),
          leadAgeMin: parseInt(mapping.leadAgeMin),
          leadAgeMax: parseInt(mapping.leadAgeMax),
          durationDays: parseInt(mapping.durationDays)
        }))
      };
      
      // Add optional fields if they exist
      if (formData.description) {
        campaignData.description = formData.description;
      }
      
      console.log('Submitting campaign data:', campaignData);
      
      if (isEditMode) {
        await apiService.campaigns.update(id, campaignData);
      } else {
        await apiService.campaigns.create(campaignData);
      }

      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        navigate('/campaigns');
      }, 2000);
    } catch (err) {
      console.error("Error saving campaign:", err);
      setError(err.message || "Failed to save campaign. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle preview in journey selection
  const handlePreview = () => {
    // If no journeys selected, show error
    if (formData.journeyMappings.length === 0) {
      alert("Please select at least one journey before previewing");
      return;
    }
    
    console.log("Preview campaign with journeys:", formData);
    // Navigate to a preview page or save and return to campaigns
    navigate("/campaigns");
  };

  const steps = [
    {
      title: 'Basic Information',
      content: (
        <Form.Item
          label="Campaign Name"
          name="name"
          rules={[{ required: true, message: 'Please input campaign name!' }]}
        >
          <Input placeholder="Enter campaign name" />
        </Form.Item>
      ),
    },
    {
      title: 'Targeting',
      content: (
        <>
          <Form.Item
            label="Platform"
            name="platform"
            rules={[{ required: true, message: 'Please select platform!' }]}
          >
            <Select placeholder="Select platform">
              <Option value="facebook">Facebook</Option>
              <Option value="google">Google</Option>
              <Option value="linkedin">LinkedIn</Option>
              <Option value="twitter">Twitter</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Objective"
            name="objective"
            rules={[{ required: true, message: 'Please select objective!' }]}
          >
            <Select placeholder="Select objective">
              <Option value="lead">Lead Generation</Option>
              <Option value="awareness">Brand Awareness</Option>
              <Option value="conversion">Conversions</Option>
              <Option value="traffic">Website Traffic</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Target Audience"
            name="audience"
            rules={[{ required: true, message: 'Please select target audience!' }]}
          >
            <Select mode="multiple" placeholder="Select target audience">
              <Option value="age_25_34">Age 25-34</Option>
              <Option value="age_35_44">Age 35-44</Option>
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="us">United States</Option>
              <Option value="ca">Canada</Option>
            </Select>
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Budget & Schedule',
      content: (
        <>
          <Form.Item
            label="Budget Type"
            name="budgetType"
            rules={[{ required: true, message: 'Please select budget type!' }]}
          >
            <Select placeholder="Select budget type">
              <Option value="daily">Daily Budget</Option>
              <Option value="lifetime">Lifetime Budget</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Budget Amount"
            name="budget"
            rules={[{ required: true, message: 'Please input budget amount!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
          <Form.Item
            label="Schedule"
            name="schedule"
            rules={[{ required: true, message: 'Please select schedule!' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Lead Journey',
      content: (
        <>
          <Form.Item
            label="Journey Type"
            name="journeyType"
            rules={[{ required: true, message: 'Please select journey type!' }]}
          >
            <Select placeholder="Select journey type">
              <Option value="nurture">Lead Nurture</Option>
              <Option value="qualification">Lead Qualification</Option>
              <Option value="conversion">Conversion</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Webhook Integration"
            name="webhookEnabled"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.webhookEnabled !== currentValues.webhookEnabled}
          >
            {({ getFieldValue }) => getFieldValue('webhookEnabled') ? (
              <>
                <Form.Item
                  label="Webhook URL"
                  name="webhookUrl"
                  rules={[{ required: true, message: 'Please input webhook URL!' }]}
                >
                  <Input placeholder="Enter webhook URL" />
                </Form.Item>
                <Form.Item
                  label="Webhook Secret"
                  name="webhookSecret"
                  rules={[{ required: true, message: 'Please input webhook secret!' }]}
                >
                  <Input.Password placeholder="Enter webhook secret" />
                </Form.Item>
              </>
            ) : null}
          </Form.Item>
        </>
      ),
    },
  ];

  if (isSubmitting) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Saving campaign...</p>
        </div>
      </div>
    );
  }

  return (
    <CampaignBuilderContainer>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/marketing')}>
            Back to Dashboard
          </Button>
          <Title level={2}>Create New Campaign</Title>
        </Space>

        <Card>
          <Steps current={currentStep}>
            {steps.map(item => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>

          <Divider />

          <Form
            form={form}
            layout="vertical"
            onFinish={submitCampaign}
            style={{ marginTop: 24 }}
          >
            {steps[currentStep].content}

            <Divider />

            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              {currentStep > 0 && (
                <Button onClick={handleBack}>
                  Previous
                </Button>
              )}
              {currentStep < steps.length - 1 && (
                <Button type="primary" onClick={handleNext}>
                  Next
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button type="primary" htmlType="submit">
                  Create Campaign
                </Button>
              )}
            </Space>
          </Form>
        </Card>
      </Space>
    </CampaignBuilderContainer>
  );
};

export default CampaignBuilder;
