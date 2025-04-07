import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as campaignService from "../services/campaignService";
import * as journeyService from "../services/journeyService";
import apiService from "../services/apiService";
import "./CampaignBuilder.css"; // Import the new CSS file

// Import the JourneySelect component
import JourneySelect from "../components/JourneySelect";

const CampaignBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // Step management with progress indicators
  const [step, setStep] = useState(1);
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
  
  // Predefined brands
  const predefinedBrands = [
    { id: "brand1", name: "Brand1", description: "-", logo: null, color: null, leadCount: 28 },
    { id: "brand2", name: "Brand2", description: "-", logo: null, color: null, leadCount: 153 },
    { id: "default", name: "Default Brand", description: "-", logo: null, color: null, leadCount: 0 }
  ];
  
  // Predefined sources
  const predefinedSources = [
    { id: "facebook", name: "Facebook Ads", description: "Leads from Facebook advertising campaigns" },
    { id: "google", name: "Google Ads", description: "Leads from Google advertising campaigns" },
    { id: "email", name: "Email Campaign", description: "Leads from email marketing campaigns" },
    { id: "referral", name: "Referral", description: "Leads from referral programs" },
    { id: "organic", name: "Organic", description: "Leads from organic traffic" }
  ];

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

        console.log('Resources loaded successfully:', {
          leadPools: leadPoolsData.length,
          didPools: didPoolsData.length,
          journeys: journeysData.length
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
    
    if (step < totalSteps) {
      setStep(step + 1);
      // Track progress in analytics (in a real app)
      console.log(`Step ${step} completed:`, formData);
    } else {
      // Submit form and navigate to campaign detail
      submitCampaign();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
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

  // Render form sections
  const renderBasicDetails = () => (
    <div className="form-section">
      <h3 className="section-title">Basic Details</h3>
      <div className="form-field">
        <label className="form-field-label">Campaign Name</label>
        <input
          type="text"
          className={`form-field-input ${errors.name ? 'input-error' : ''}`}
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter campaign name"
        />
        {errors.name && <div className="error-message">{errors.name}</div>}
      </div>

      <div className="form-field">
        <label className="form-field-label">Description</label>
        <textarea
          className="form-field-input"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter campaign description"
          rows="3"
        />
      </div>

      <div className="form-field">
        <label className="form-field-label">Brand</label>
        <select
          className={`form-field-input ${errors.brand ? 'input-error' : ''}`}
          name="brand"
          value={formData.brand}
          onChange={handleInputChange}
        >
          <option value="">Select a brand</option>
          {predefinedBrands.map(brand => (
            <option key={brand.id} value={brand.id}>
              {brand.name} {brand.leadCount > 0 ? `(${brand.leadCount} leads)` : ''}
            </option>
          ))}
        </select>
        {errors.brand && <div className="error-message">{errors.brand}</div>}
      </div>

      <div className="form-field">
        <label className="form-field-label">Source</label>
        <select
          className={`form-field-input ${errors.source ? 'input-error' : ''}`}
          name="source"
          value={formData.source}
          onChange={handleInputChange}
        >
          <option value="">Select a source</option>
          {predefinedSources.map(source => (
            <option key={source.id} value={source.id}>{source.name}</option>
          ))}
        </select>
        {errors.source && <div className="error-message">{errors.source}</div>}
      </div>
    </div>
  );

  const renderPoolSelection = () => (
    <div className="form-section">
      <h3 className="section-title">Pool Selection</h3>
      <div className="form-field">
        <label className="form-field-label">Lead Pool</label>
        <select
          className={`form-field-input ${errors.leadPoolId ? 'input-error' : ''}`}
          name="leadPoolId"
          value={formData.leadPoolId}
          onChange={handleInputChange}
        >
          <option value="">Select a lead pool</option>
          {leadPools.map(pool => (
            <option key={pool.id} value={pool.id}>
              {pool.name}
            </option>
          ))}
        </select>
        {errors.leadPoolId && <div className="error-message">{errors.leadPoolId}</div>}
      </div>

      <div className="form-field">
        <label className="form-field-label">DID Pool</label>
        <select
          className={`form-field-input ${errors.didPoolId ? 'input-error' : ''}`}
          name="didPoolId"
          value={formData.didPoolId}
          onChange={handleInputChange}
        >
          <option value="">Select a DID pool</option>
          {didPools.map(pool => (
            <option key={pool.id} value={pool.id}>
              {pool.name}
            </option>
          ))}
        </select>
        {errors.didPoolId && <div className="error-message">{errors.didPoolId}</div>}
      </div>
    </div>
  );

  const renderJourneyMappings = () => (
    <div className="form-section">
      <h3 className="section-title">Journey Mappings</h3>
      <div className="journey-mappings-container">
        {formData.journeyMappings.map((mapping, index) => (
          <div key={index} className="journey-mapping-item">
            <div className="mapping-header">
              <h4>Mapping #{index + 1}</h4>
              <button
                type="button"
                className="button-outline delete-button"
                onClick={() => removeJourneyMapping(index)}
              >
                Remove
              </button>
            </div>
            <div className="mapping-fields">
              <div className="form-field">
                <label className="form-field-label">Journey</label>
                <select
                  className={`form-field-input ${errors[`journeyMappings.${index}.journeyId`] ? 'input-error' : ''}`}
                  value={mapping.journeyId}
                  onChange={(e) => handleJourneyMappingChange(index, 'journeyId', e.target.value)}
                >
                  <option value="">Select a journey</option>
                  {journeys.map(journey => (
                    <option key={journey.id} value={journey.id}>
                      {journey.name}
                    </option>
                  ))}
                </select>
                {errors[`journeyMappings.${index}.journeyId`] && (
                  <div className="error-message">{errors[`journeyMappings.${index}.journeyId`]}</div>
                )}
              </div>

              <div className="form-field">
                <label className="form-field-label">Lead Age Min</label>
                <input
                  type="number"
                  className={`form-field-input ${errors[`journeyMappings.${index}.leadAgeMin`] ? 'input-error' : ''}`}
                  value={mapping.leadAgeMin}
                  onChange={(e) => handleJourneyMappingChange(index, 'leadAgeMin', parseInt(e.target.value))}
                  min="0"
                />
                {errors[`journeyMappings.${index}.leadAgeMin`] && (
                  <div className="error-message">{errors[`journeyMappings.${index}.leadAgeMin`]}</div>
                )}
              </div>

              <div className="form-field">
                <label className="form-field-label">Lead Age Max</label>
                <input
                  type="number"
                  className={`form-field-input ${errors[`journeyMappings.${index}.leadAgeMax`] ? 'input-error' : ''}`}
                  value={mapping.leadAgeMax}
                  onChange={(e) => handleJourneyMappingChange(index, 'leadAgeMax', parseInt(e.target.value))}
                  min="0"
                />
                {errors[`journeyMappings.${index}.leadAgeMax`] && (
                  <div className="error-message">{errors[`journeyMappings.${index}.leadAgeMax`]}</div>
                )}
              </div>

              <div className="form-field">
                <label className="form-field-label">Duration (Days)</label>
                <input
                  type="number"
                  className={`form-field-input ${errors[`journeyMappings.${index}.durationDays`] ? 'input-error' : ''}`}
                  value={mapping.durationDays}
                  onChange={(e) => handleJourneyMappingChange(index, 'durationDays', parseInt(e.target.value))}
                  min="1"
                />
                {errors[`journeyMappings.${index}.durationDays`] && (
                  <div className="error-message">{errors[`journeyMappings.${index}.durationDays`]}</div>
                )}
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="button-outline add-mapping-button"
          onClick={addJourneyMapping}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Journey Mapping
        </button>
      </div>
    </div>
  );

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
    <div className="page-container">
      <div className="content-container">
        <div className="content-header">
          <h1 className="page-title">{isEditMode ? 'Edit Campaign' : 'Create Campaign'}</h1>
        </div>

        {error && (
          <div className="error-message global-error">
            {error}
            <button className="error-dismiss" onClick={() => setError(null)}>×</button>
          </div>
        )}

        {showSuccessMessage && (
          <div className="success-message">
            Campaign {isEditMode ? 'updated' : 'created'} successfully!
          </div>
        )}

        <form onSubmit={submitCampaign} className="campaign-form">
          {renderBasicDetails()}
          {renderPoolSelection()}
          {renderJourneyMappings()}

          <div className="form-actions">
            <button
              type="button"
              className="button-outline"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Campaign' : 'Create Campaign')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampaignBuilder;
