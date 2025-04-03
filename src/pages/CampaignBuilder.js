import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Import the JourneySelect component
import JourneySelect from "../components/JourneySelect";

const CampaignBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // Step management with progress indicators
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  
  // Form state management
  const [formData, setFormData] = useState({
    campaignName: isEditMode ? "" : "BDS_Fresh_Test",
    brand: isEditMode ? "" : "BDS",
    source: isEditMode ? "" : "Web Forms, Fb, TikTok",
    leadPools: "",
    didPools: "",
    leadAge: isEditMode ? "" : "0-15",
    journeys: [],
    active: true, // Default to active
    createdAt: new Date().toISOString(),
  });
  
  // UI state management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState(""); // For auto-save indication
  
  // Load campaign data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      // In a real app, you would fetch the campaign data
      // For now, let's simulate with a timeout
      setIsSubmitting(true);
      setTimeout(() => {
        // This would be replaced with actual API data
        setFormData({
          campaignName: "Edited Campaign",
          brand: "BDS", 
          source: "Web Forms, Fb, TikTok",
          leadPools: "pool1",
          didPools: "did1", 
          leadAge: "15-30",
          journeys: [],
          active: true,
          createdAt: "2023-01-15T12:00:00Z",
        });
        setIsSubmitting(false);
      }, 800);
    }
  }, [id, isEditMode]);

  // Auto-save functionality 
  useEffect(() => {
    if (!isDirty) return;
    
    const autoSaveTimer = setTimeout(() => {
      // In a real app, save the draft to localStorage or API
      console.log("Auto-saving campaign draft:", formData);
      setAutoSaveStatus("Draft saved");
      
      // Clear the status message after 2 seconds
      const clearTimer = setTimeout(() => {
        setAutoSaveStatus("");
      }, 2000);
      
      return () => clearTimeout(clearTimer);
    }, 3000);
    
    return () => clearTimeout(autoSaveTimer);
  }, [formData, isDirty]);

  // Form field change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      if (!formData.campaignName.trim()) {
        newErrors.campaignName = "Campaign name is required";
      } else if (formData.campaignName.length < 3) {
        newErrors.campaignName = "Campaign name must be at least 3 characters";
      }
      
      if (!formData.brand) newErrors.brand = "Brand is required";
      if (!formData.source) newErrors.source = "Source is required";
      if (!formData.leadAge) newErrors.leadAge = "Lead age is required";
    } else if (step === 2) {
      if (!formData.leadPools) newErrors.leadPools = "Lead pool selection is required";
      if (!formData.didPools) newErrors.didPools = "DID pool selection is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle step navigation
  const handleNext = () => {
    if (!validateForm()) return;
    
    if (step === 1) {
      setStep(2);
      // Track progress in analytics (in a real app)
      console.log("Step 1 completed:", formData);
    } else if (step === 2) {
      setStep(3); // Move to journey selection step
      console.log("Step 2 completed:", formData);
    } else {
      // Submit form and navigate back to campaigns
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

  // Submit the campaign data
  const submitCampaign = () => {
    setIsSubmitting(true);
    console.log("Submitting campaign data:", formData);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessMessage(true);
      
      // Navigate to campaign detail page after showing success message
      setTimeout(() => {
        // If we're in edit mode, use the current ID, otherwise use a dummy ID
        const targetId = isEditMode ? id : 1; // Replace with actual ID from API response
        navigate(`/campaigns/${targetId}/detail`);
      }, 1500);
    }, 1000);
  };

  // Handle updating journeys from the JourneySelect component
  const handleJourneysUpdate = (updatedJourneys) => {
    setFormData((prev) => ({
      ...prev,
      journeys: updatedJourneys,
    }));
    setIsDirty(true);
  };

  // Handle preview in journey selection
  const handlePreview = () => {
    // If no journeys selected, show error
    if (formData.journeys.length === 0) {
      alert("Please select at least one journey before previewing");
      return;
    }
    
    console.log("Preview campaign with journeys:", formData);
    // Navigate to a preview page or save and return to campaigns
    navigate("/campaigns");
  };

  // Get the title based on current step and edit mode
  const getStepTitle = () => {
    if (isEditMode) {
      return step === 1 
        ? `Edit Campaign: ${formData.campaignName}`
        : step === 2 
        ? `Configure Pools: ${formData.campaignName}`
        : `Select Journeys: ${formData.campaignName}`;
    }
    
    return step === 1
      ? "Create New Campaign"
      : step === 2
      ? `Configure: ${formData.campaignName}`
      : `Journey Select: ${formData.campaignName}`;
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
      <div className="campaign-form">
        {/* Form header with progress indicator */}
        <div className="campaign-form-header">
          <h1 className="campaign-form-title">{getStepTitle()}</h1>
          
          {/* Step progress indicator */}
          <div className="step-progress">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div 
                key={index}
                className={`step-indicator ${
                  index + 1 === step ? 'current' : 
                  index + 1 < step ? 'completed' : ''
                }`}
              >
                {index + 1 < step ? (
                  <span className="step-check">✓</span>
                ) : (
                  <span className="step-number">{index + 1}</span>
                )}
                <span className="step-label">
                  {index === 0 ? 'Details' : 
                   index === 1 ? 'Pools' : 'Journeys'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-save indication */}
        {autoSaveStatus && (
          <div className="auto-save-status">
            {autoSaveStatus}
          </div>
        )}

        {/* Success message */}
        {showSuccessMessage && (
          <div className="success-message">
            Campaign {isEditMode ? "updated" : "created"} successfully!
          </div>
        )}

        {step === 1 ? (
          // Step 1 form - Campaign Details
          <div className="form-fields-container">
            <div className="form-field">
              <label className="form-field-label">Campaign Name</label>
              <input
                type="text"
                className={`form-field-input ${errors.campaignName ? 'input-error' : ''}`}
                name="campaignName"
                value={formData.campaignName}
                onChange={handleInputChange}
                placeholder="Enter campaign name"
              />
              {errors.campaignName && <div className="error-message">{errors.campaignName}</div>}
              {!errors.campaignName && formData.campaignName && (
                <i className="check-icon"></i>
              )}
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
                <option value="BDS">BDS</option>
                <option value="Brand 2">Brand 2</option>
                <option value="Brand 3">Brand 3</option>
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
                <option value="Web Forms, Fb, TikTok">
                  Web Forms, Fb, TikTok
                </option>
                <option value="Social Media">Social Media</option>
                <option value="Email Campaign">Email Campaign</option>
                <option value="Referral">Referral</option>
              </select>
              {errors.source && <div className="error-message">{errors.source}</div>}
              {!errors.source && formData.source && (
                <i className="check-icon"></i>
              )}
            </div>
            <div className="form-field">
              <label className="form-field-label">Lead Age</label>
              <select
                className={`form-field-input ${errors.leadAge ? 'input-error' : ''}`}
                name="leadAge"
                value={formData.leadAge}
                onChange={handleInputChange}
              >
                <option value="">Select Lead Age</option>
                <option value="0-15">0-15 days</option>
                <option value="15-30">15-30 days</option>
                <option value="30-60">30-60 days</option>
                <option value="60+">60+ days</option>
              </select>
              {errors.leadAge && <div className="error-message">{errors.leadAge}</div>}
              {!errors.leadAge && formData.leadAge && (
                <i className="check-icon"></i>
              )}
            </div>
            {isEditMode && (
              <div className="form-field form-field-toggle">
                <label className="form-field-label">Active</label>
                <div className="toggle-container">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={(e) => {
                        handleInputChange({
                          target: { name: 'active', value: e.target.checked }
                        });
                      }}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="toggle-status">
                    {formData.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : step === 2 ? (
          // Step 2 form - Pools Selection
          <div className="form-fields-container">
            <div className="form-summary">
              <div className="summary-item">
                <span className="summary-label">Campaign:</span>
                <span className="summary-value">{formData.campaignName}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Brand:</span>
                <span className="summary-value">{formData.brand}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Lead Age:</span>
                <span className="summary-value">{formData.leadAge}</span>
              </div>
            </div>
            
            <div className="form-field">
              <label className="form-field-label">Lead Pools</label>
              <select
                className={`form-field-input ${errors.leadPools ? 'input-error' : ''}`}
                name="leadPools"
                value={formData.leadPools}
                onChange={handleInputChange}
              >
                <option value="">Select Lead Pool</option>
                <option value="pool1">Web Leads Pool</option>
                <option value="pool2">Social Media Pool</option>
                <option value="pool3">Email Campaign Pool</option>
              </select>
              {errors.leadPools && <div className="error-message">{errors.leadPools}</div>}
              {!errors.leadPools && formData.leadPools && (
                <i className="check-icon"></i>
              )}
            </div>
            <div className="form-field">
              <label className="form-field-label">DID Pools</label>
              <select
                className={`form-field-input ${errors.didPools ? 'input-error' : ''}`}
                name="didPools"
                value={formData.didPools}
                onChange={handleInputChange}
              >
                <option value="">Select DID Pool</option>
                <option value="did1">Main DID Pool</option>
                <option value="did2">Secondary DID Pool</option>
                <option value="did3">Backup DID Pool</option>
              </select>
              {errors.didPools && <div className="error-message">{errors.didPools}</div>}
              {!errors.didPools && formData.didPools && (
                <i className="check-icon"></i>
              )}
            </div>
          </div>
        ) : (
          // Step 3 - Journey Selection
          <JourneySelect
            campaignData={formData}
            updateJourneys={handleJourneysUpdate}
            onPreview={handlePreview}
            onCancel={handleCancel}
            isEmbedded={true}
          />
        )}

        {step < 3 && (
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
                step === 1 ? "Continue" : 
                step === 2 ? "Select Journeys" : "Finish"
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignBuilder;
