import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

  // Load campaign data if in edit mode
  useEffect(() => {
    const loadCampaignData = async () => {
      if (isEditMode) {
        setIsSubmitting(true);
        setError(null);
        try {
          const response = await apiService.campaigns.getById(id);
          const campaignData = response.data;
          
          setFormData({
            name: campaignData.name || "",
            description: campaignData.description || "",
            brand: campaignData.brand || "",
            source: campaignData.source || "",
            leadPoolId: campaignData.leadPoolId || "",
            didPoolId: campaignData.didPoolId || "",
            status: campaignData.status || "active",
            journeyMappings: campaignData.journeyMappings || []
          });
          
          // Set lead data with campaign brand and source
          setFormData(prev => ({
            ...prev,
            brand: campaignData.brand || "",
            source: campaignData.source || "",
            poolIds: campaignData.leadPoolId ? [campaignData.leadPoolId] : []
          }));
        } catch (err) {
          console.error("Error loading campaign:", err);
          setError("Failed to load campaign data. Please try again later.");
        } finally {
          setIsSubmitting(false);
        }
      }
    };
    
    loadCampaignData();
  }, [id, isEditMode]);

  // Load lead pools and DID pools
  useEffect(() => {
    const loadPools = async () => {
      try {
        const leadPoolsResponse = await apiService.leadPools.getAll();
        setLeadPools(leadPoolsResponse.data || []);
        
        const didPoolsResponse = await apiService.didPools.getAll();
        setDidPools(didPoolsResponse.data || []);
      } catch (err) {
        console.error("Error loading pools:", err);
        setError("Failed to load lead and DID pools. Please try again later.");
      }
    };
    
    loadPools();
  }, []);

  // Auto-save functionality 
  useEffect(() => {
    if (!isDirty || !isEditMode) return;
    
    const autoSaveTimer = setTimeout(async () => {
      try {
        await apiService.campaigns.update(id, formData);
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

  // Form validation with detailed feedback
  const validateForm = () => {
    const newErrors = {};
    
    if (step === 1) {
      // Basic campaign details validation
      if (!formData.name.trim()) {
        newErrors.name = "Campaign name is required";
      } else if (formData.name.length < 3) {
        newErrors.name = "Campaign name must be at least 3 characters";
      }
      
      if (!formData.brand) newErrors.brand = "Brand is required";
      if (!formData.source) newErrors.source = "Source is required";
    } else if (step === 2) {
      // Lead pool validation
      if (!formData.leadPoolId) newErrors.leadPoolId = "Lead pool selection is required";
    } else if (step === 3) {
      // DID pool validation
      if (!formData.didPoolId) newErrors.didPoolId = "DID pool selection is required";
    } else if (step === 4) {
      // Journey mappings validation
      if (!formData.journeyMappings || formData.journeyMappings.length === 0) {
        newErrors.journeyMappings = "At least one journey mapping is required";
      } else {
        // Check for overlapping age ranges
        const sortedMappings = [...formData.journeyMappings].sort((a, b) => a.leadAgeMin - b.leadAgeMin);
        
        for (let i = 1; i < sortedMappings.length; i++) {
          const prevMapping = sortedMappings[i - 1];
          const currentMapping = sortedMappings[i];
          
          if (prevMapping.leadAgeMax >= currentMapping.leadAgeMin) {
            newErrors.journeyMappings = "Journey mappings have overlapping age ranges";
            break;
          }
        }
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
      leadAgeMin: journey.startDay || 1,
      leadAgeMax: journey.endDay || 30,
      durationDays: journey.endDay - journey.startDay + 1 || 14
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
      let response;
      
      // Format the data according to the API requirements
      const campaignData = {
        name: formData.name,
        description: formData.description,
        brand: formData.brand,
        source: formData.source,
        leadPoolId: formData.leadPoolId,
        didPoolId: formData.didPoolId,
        status: formData.status,
        journeyMappings: formData.journeyMappings.map(mapping => ({
          leadAgeMin: mapping.leadAgeMin,
          leadAgeMax: mapping.leadAgeMax,
          journeyId: mapping.journeyId,
          priority: mapping.priority || 0
        }))
      };
      
      if (isEditMode) {
        // Update existing campaign
        response = await apiService.campaigns.update(id, campaignData);
      } else {
        // Create new campaign
        response = await apiService.campaigns.create(campaignData);
        
        // Store the new campaign ID
        const newCampaignId = response.data.id;
        
        // Add journey mappings if any
        if (formData.journeyMappings.length > 0) {
          await Promise.all(formData.journeyMappings.map(mapping => 
            apiService.campaigns.addJourneyMapping(newCampaignId, {
              leadAgeMin: mapping.leadAgeMin,
              leadAgeMax: mapping.leadAgeMax,
              journeyId: mapping.journeyId,
              priority: mapping.priority || 0
            })
          ));
        }
      }
      
      // Show success message
      setShowSuccessMessage(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        
        // Navigate back to campaigns list
        if (!isEditMode) {
          navigate('/campaigns');
        }
      }, 3000);
      
    } catch (err) {
      console.error("Error submitting campaign:", err);
      setError(err.response?.data?.message || "Failed to save campaign. Please try again later.");
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

  if (isEditMode && isSubmitting && step === 1) {
    return (
      <div className="campaign-builder-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading campaign data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="campaign-builder-container">
      <div className="campaign-builder-header">
        <div>
          <h1 className="campaign-builder-title">
            {isEditMode ? "Edit Campaign" : "Create New Campaign"}
          </h1>
          <p className="campaign-builder-subtitle">
            {isEditMode 
              ? "Update your campaign settings and configurations" 
              : "Set up a new campaign by following the steps below"}
          </p>
        </div>
        {isEditMode && (
          <div className="auto-save-status">
            {autoSaveStatus}
          </div>
        )}
      </div>

      <div className="step-indicators">
        {[1, 2, 3, 4].map((stepNumber) => (
          <div 
            key={stepNumber} 
            className={`step-indicator ${step === stepNumber ? 'active' : step > stepNumber ? 'completed' : ''}`}
          >
            <div className="step-number">
              {step > stepNumber ? (
                <i className="check-icon"></i>
              ) : (
                stepNumber
              )}
            </div>
            <div className="step-label">
              {stepNumber === 1 && "Campaign Details"}
              {stepNumber === 2 && "Lead Pool"}
              {stepNumber === 3 && "DID Pool"}
              {stepNumber === 4 && "Journey Mapping"}
            </div>
          </div>
        ))}
      </div>

      <div className="campaign-builder-content">
        {error && (
          <div className="error-message" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {showSuccessMessage && (
          <div className="success-message">
            <i className="check-icon"></i>
            {isEditMode 
              ? "Campaign updated successfully!" 
              : "Campaign created successfully!"}
          </div>
        )}

        {step === 1 ? (
          // Step 1 form - Campaign Details
          <div className="form-fields-container">
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
              {!errors.name && formData.name && (
                <i className="check-icon"></i>
              )}
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
                <option value="">Select Brand</option>
                {predefinedBrands.map(brand => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name} {brand.leadCount > 0 ? `(${brand.leadCount} leads)` : ''}
                  </option>
                ))}
              </select>
              {errors.brand && <div className="error-message">{errors.brand}</div>}
              {!errors.brand && formData.brand && (
                <i className="check-icon"></i>
              )}
            </div>
            
            <div className="form-field">
              <label className="form-field-label">Source</label>
              <select
                className={`form-field-input ${errors.source ? 'input-error' : ''}`}
                name="source"
                value={formData.source}
                onChange={handleInputChange}
              >
                <option value="">Select Source</option>
                {predefinedSources.map(source => (
                  <option key={source.id} value={source.id}>{source.name}</option>
                ))}
              </select>
              {errors.source && <div className="error-message">{errors.source}</div>}
              {!errors.source && formData.source && (
                <i className="check-icon"></i>
              )}
            </div>
            
            {isEditMode && (
              <div className="form-field form-field-toggle">
                <label className="form-field-label">Status</label>
                <div className="toggle-container">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="status"
                      checked={formData.status === "active"}
                      onChange={(e) => {
                        handleInputChange({
                          target: { name: 'status', value: e.target.checked ? "active" : "inactive" }
                        });
                      }}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="toggle-status">
                    {formData.status === "active" ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : step === 2 ? (
          // Step 2 form - Lead Pool Selection
          <div className="form-fields-container">
            <div className="form-summary">
              <div className="summary-item">
                <span className="summary-label">Campaign:</span>
                <span className="summary-value">{formData.name}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Brand:</span>
                <span className="summary-value">
                  {predefinedBrands.find(brand => brand.id === formData.brand)?.name || 'Not selected'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Source:</span>
                <span className="summary-value">
                  {predefinedSources.find(source => source.id === formData.source)?.name || 'Not selected'}
                </span>
              </div>
            </div>
            
            <div className="form-field">
              <label className="form-field-label">Lead Pool</label>
              <select
                className={`form-field-input ${errors.leadPoolId ? 'input-error' : ''}`}
                name="leadPoolId"
                value={formData.leadPoolId}
                onChange={handleInputChange}
              >
                <option value="">Select Lead Pool</option>
                {leadPools.map(pool => (
                  <option key={pool.id} value={pool.id}>{pool.name}</option>
                ))}
              </select>
              {errors.leadPoolId && <div className="error-message">{errors.leadPoolId}</div>}
              {!errors.leadPoolId && formData.leadPoolId && (
                <i className="check-icon"></i>
              )}
            </div>
            
            <div className="form-field-info">
              <p>Select the lead pool that will be used for this campaign. Lead pools contain leads with similar characteristics.</p>
            </div>
          </div>
        ) : step === 3 ? (
          // Step 3 form - DID Pool Selection
          <div className="form-fields-container">
            <div className="form-summary">
              <div className="summary-item">
                <span className="summary-label">Campaign:</span>
                <span className="summary-value">{formData.name}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Lead Pool:</span>
                <span className="summary-value">
                  {leadPools.find(pool => pool.id === formData.leadPoolId)?.name || 'Not selected'}
                </span>
              </div>
            </div>
            
            <div className="form-field">
              <label className="form-field-label">DID Pool</label>
              <select
                className={`form-field-input ${errors.didPoolId ? 'input-error' : ''}`}
                name="didPoolId"
                value={formData.didPoolId}
                onChange={handleInputChange}
              >
                <option value="">Select DID Pool</option>
                {didPools.map(pool => (
                  <option key={pool.id} value={pool.id}>{pool.name}</option>
                ))}
              </select>
              {errors.didPoolId && <div className="error-message">{errors.didPoolId}</div>}
              {!errors.didPoolId && formData.didPoolId && (
                <i className="check-icon"></i>
              )}
            </div>
            
            <div className="form-field-info">
              <p>Select the DID (Direct Inward Dialing) pool that will be used for outbound calls in this campaign.</p>
            </div>
          </div>
        ) : step === 4 ? (
          // Step 4 - Journey Selection and Review
          <div className="form-fields-container">
            <div className="form-summary">
              <div className="summary-item">
                <span className="summary-label">Campaign:</span>
                <span className="summary-value">{formData.name}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Lead Pool:</span>
                <span className="summary-value">
                  {leadPools.find(pool => pool.id === formData.leadPoolId)?.name || 'Not selected'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">DID Pool:</span>
                <span className="summary-value">
                  {didPools.find(pool => pool.id === formData.didPoolId)?.name || 'Not selected'}
                </span>
              </div>
            </div>
            
            <div className="form-section">
              <h3 className="section-title">Journey Mappings</h3>
              <JourneySelect
                campaignData={formData}
                updateJourneys={handleJourneysUpdate}
                onPreview={handlePreview}
                onCancel={handleCancel}
                isEmbedded={true}
              />
              {errors.journeyMappings && (
                <div className="error-message">{errors.journeyMappings}</div>
              )}
            </div>
            
            <div className="form-section">
              <h3 className="section-title">Campaign Summary</h3>
              <div className="campaign-summary">
                <div className="summary-row">
                  <div className="summary-label">Name:</div>
                  <div className="summary-value">{formData.name}</div>
                </div>
                <div className="summary-row">
                  <div className="summary-label">Description:</div>
                  <div className="summary-value">{formData.description || 'No description provided'}</div>
                </div>
                <div className="summary-row">
                  <div className="summary-label">Brand:</div>
                  <div className="summary-value">
                    {predefinedBrands.find(brand => brand.id === formData.brand)?.name || 'Not selected'}
                  </div>
                </div>
                <div className="summary-row">
                  <div className="summary-label">Source:</div>
                  <div className="summary-value">
                    {predefinedSources.find(source => source.id === formData.source)?.name || 'Not selected'}
                  </div>
                </div>
                <div className="summary-row">
                  <div className="summary-label">Status:</div>
                  <div className="summary-value">{formData.status}</div>
                </div>
                <div className="summary-row">
                  <div className="summary-label">Lead Pool:</div>
                  <div className="summary-value">
                    {leadPools.find(pool => pool.id === formData.leadPoolId)?.name || 'Not selected'}
                  </div>
                </div>
                <div className="summary-row">
                  <div className="summary-label">DID Pool:</div>
                  <div className="summary-value">
                    {didPools.find(pool => pool.id === formData.didPoolId)?.name || 'Not selected'}
                  </div>
                </div>
                <div className="summary-row">
                  <div className="summary-label">Journey Mappings:</div>
                  <div className="summary-value">
                    {formData.journeyMappings.length > 0 
                      ? `${formData.journeyMappings.length} mappings configured` 
                      : 'No journey mappings configured'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="form-buttons">
          {step > 1 && (
            <button 
              className="button-outline button-back" 
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Back
            </button>
          )}
          <button 
            className="button-outline" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            className="button-blue" 
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="button-spinner"></span>
                Processing...
              </>
            ) : isEditMode ? 
              "Save Changes" : 
              step === totalSteps ? "Create Campaign" : "Continue"
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignBuilder;
