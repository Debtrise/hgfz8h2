import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/apiService";
import LoadingIcon from "../components/LoadingIcon";
import "./WebhookIngestion.css";

const WebhookIngestion = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [webhooks, setWebhooks] = useState([]);
  const [leadPools, setLeadPools] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sources, setSources] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState(null);
  
  const [newWebhook, setNewWebhook] = useState({
    name: "",
    description: "",
    defaultPoolId: "",
    defaultBrand: "",
    defaultSource: "",
    defaultLeadAge: 0,
    fieldMapping: {
      phone: "phone",
      firstName: "first_name",
      lastName: "last_name",
      email: "email"
    },
    active: true,
    authToken: ""
  });

  useEffect(() => {
    fetchWebhooks();
    fetchLeadPools();
    fetchBrandsAndSources();
  }, []);

  const fetchWebhooks = async () => {
    try {
      setIsLoading(true);
      // Replace with actual API call when implemented
      const response = await apiService.webhooks.getAll();
      setWebhooks(response.data || []);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching webhooks:", err);
      setError("Failed to load webhooks. Please try again later.");
      setIsLoading(false);
    }
  };

  const fetchLeadPools = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.leadPools.getAll();
      setLeadPools(response.data || []);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching lead pools:", err);
      setError("Failed to load lead pools. Please try again later.");
      setIsLoading(false);
    }
  };

  const fetchBrandsAndSources = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch brands and sources in parallel
      const [brandsResponse, sourcesResponse] = await Promise.all([
        apiService.brands.getAll(),
        apiService.sources.getAll()
      ]);

      // Process brands data
      if (brandsResponse && brandsResponse.data) {
        const formattedBrands = Array.isArray(brandsResponse.data)
          ? brandsResponse.data
          : [];

        // Sort brands alphabetically by name
        const sortedBrands = [...formattedBrands].sort((a, b) =>
          (a.name || "").localeCompare(b.name || "")
        );

        setBrands(sortedBrands);
      } else {
        setBrands([]);
      }

      // Process sources data
      if (sourcesResponse && sourcesResponse.data) {
        const formattedSources = Array.isArray(sourcesResponse.data)
          ? sourcesResponse.data
          : [];

        // Sort sources alphabetically by name
        const sortedSources = [...formattedSources].sort((a, b) =>
          (a.name || "").localeCompare(b.name || "")
        );

        setSources(sortedSources);
      } else {
        setSources([]);
      }
    } catch (err) {
      console.error("Error fetching brands and sources:", err);
      setError("Failed to load brands and sources. Please try again later.");
      setBrands([]);
      setSources([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewWebhook((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleFieldMappingChange = (field, value) => {
    setNewWebhook((prev) => ({
      ...prev,
      fieldMapping: {
        ...prev.fieldMapping,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let response;
      if (editingWebhook) {
        response = await apiService.webhooks.update(editingWebhook.id, newWebhook);
        setSuccess(`Webhook "${newWebhook.name}" updated successfully!`);
      } else {
        response = await apiService.webhooks.create(newWebhook);
        setSuccess(`Webhook "${newWebhook.name}" created successfully!`);
      }

      // Reset form
      setNewWebhook({
        name: "",
        description: "",
        defaultPoolId: "",
        defaultBrand: "",
        defaultSource: "",
        defaultLeadAge: 0,
        fieldMapping: {
          phone: "phone",
          firstName: "first_name",
          lastName: "last_name",
          email: "email"
        },
        active: true,
        authToken: ""
      });
      setShowCreateForm(false);
      setEditingWebhook(null);

      // Refresh webhooks list
      fetchWebhooks();
    } catch (err) {
      console.error("Error saving webhook:", err);
      setError(err.message || "Failed to save webhook. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (webhook) => {
    setEditingWebhook(webhook);
    setNewWebhook({
      name: webhook.name,
      description: webhook.description,
      defaultPoolId: webhook.defaultPoolId,
      defaultBrand: webhook.defaultBrand,
      defaultSource: webhook.defaultSource,
      defaultLeadAge: webhook.defaultLeadAge,
      fieldMapping: webhook.fieldMapping,
      active: webhook.active,
      authToken: webhook.authToken
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the webhook "${name}"?`)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiService.webhooks.delete(id);
      setSuccess(`Webhook "${name}" deleted successfully!`);
      fetchWebhooks();
    } catch (err) {
      console.error("Error deleting webhook:", err);
      setError(err.message || "Failed to delete webhook. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id, name, currentStatus) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiService.webhooks.toggleStatus(id, !currentStatus);
      setSuccess(`Webhook "${name}" ${currentStatus ? "deactivated" : "activated"} successfully!`);
      fetchWebhooks();
    } catch (err) {
      console.error("Error toggling webhook status:", err);
      setError(err.message || "Failed to update webhook status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateWebhookUrl = (webhook) => {
    // Replace with actual URL format used by your API
    return `${window.location.origin}/api/webhooks/ingest/${webhook.id}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setSuccess("Copied to clipboard!");
        setTimeout(() => setSuccess(null), 2000);
      })
      .catch(err => {
        console.error("Could not copy text:", err);
        setError("Failed to copy to clipboard");
      });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const resetForm = () => {
    setNewWebhook({
      name: "",
      description: "",
      defaultPoolId: "",
      defaultBrand: "",
      defaultSource: "",
      defaultLeadAge: 0,
      fieldMapping: {
        phone: "phone",
        firstName: "first_name",
        lastName: "last_name",
        email: "email"
      },
      active: true,
      authToken: ""
    });
    setEditingWebhook(null);
    setShowCreateForm(false);
  };

  const generateRandomToken = () => {
    const randomToken = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
    setNewWebhook(prev => ({
      ...prev,
      authToken: randomToken
    }));
  };

  return (
    <LoadingIcon isLoading={isLoading} loadingText="Loading...">
      <div className="page-container">
        <div className="content-container">
          <div className="content-header">
            <h1 className="page-title">Webhook Lead Ingestion</h1>
            <div className="header-actions">
              <button
                className="button-secondary"
                onClick={() => navigate("/leads")}
              >
                Back to Leads
              </button>
              {!showCreateForm && (
                <button
                  className="button-primary"
                  onClick={() => setShowCreateForm(true)}
                >
                  Create Webhook
                </button>
              )}
            </div>
          </div>

          <div className="content-body">
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="success-message">
                <p>{success}</p>
              </div>
            )}

            {showCreateForm ? (
              <div className="create-webhook-form">
                <h2>{editingWebhook ? "Edit Webhook" : "Create New Webhook"}</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-section">
                    <h3>Basic Information</h3>
                    <div className="form-row">
                      <label htmlFor="name">
                        Webhook Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={newWebhook.name}
                        onChange={handleInputChange}
                        required
                        className="text-input"
                        placeholder="Enter webhook name"
                      />
                    </div>

                    <div className="form-row">
                      <label htmlFor="description">Description</label>
                      <textarea
                        id="description"
                        name="description"
                        value={newWebhook.description}
                        onChange={handleInputChange}
                        className="text-area"
                        placeholder="Enter webhook description"
                      />
                    </div>

                    <div className="form-row">
                      <label htmlFor="authToken">
                        Authentication Token <span className="required">*</span>
                      </label>
                      <div className="token-input-group">
                        <input
                          type="text"
                          id="authToken"
                          name="authToken"
                          value={newWebhook.authToken}
                          onChange={handleInputChange}
                          required
                          className="text-input"
                          placeholder="Authentication token"
                        />
                        <button 
                          type="button" 
                          className="button-secondary"
                          onClick={generateRandomToken}
                        >
                          Generate Token
                        </button>
                      </div>
                    </div>

                    <div className="form-row checkbox-row">
                      <label htmlFor="active">
                        <input
                          type="checkbox"
                          id="active"
                          name="active"
                          checked={newWebhook.active}
                          onChange={handleInputChange}
                        />
                        Active
                      </label>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>Default Values</h3>
                    <div className="form-row">
                      <label htmlFor="defaultPoolId">
                        Default Lead Pool <span className="required">*</span>
                      </label>
                      <select
                        id="defaultPoolId"
                        name="defaultPoolId"
                        value={newWebhook.defaultPoolId}
                        onChange={handleInputChange}
                        required
                        className="select-input"
                      >
                        <option value="">Select lead pool</option>
                        {leadPools.map((pool) => (
                          <option key={pool.id} value={pool.id}>
                            {pool.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-row">
                      <label htmlFor="defaultBrand">Default Brand</label>
                      <select
                        id="defaultBrand"
                        name="defaultBrand"
                        value={newWebhook.defaultBrand}
                        onChange={handleInputChange}
                        className="select-input"
                      >
                        <option value="">Select brand</option>
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-row">
                      <label htmlFor="defaultSource">Default Source</label>
                      <select
                        id="defaultSource"
                        name="defaultSource"
                        value={newWebhook.defaultSource}
                        onChange={handleInputChange}
                        className="select-input"
                      >
                        <option value="">Select source</option>
                        {sources.map((source) => (
                          <option key={source.id} value={source.id}>
                            {source.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-row">
                      <label htmlFor="defaultLeadAge">
                        Default Lead Age (days)
                      </label>
                      <input
                        type="number"
                        id="defaultLeadAge"
                        name="defaultLeadAge"
                        value={newWebhook.defaultLeadAge}
                        onChange={handleInputChange}
                        min="0"
                        className="number-input"
                      />
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>Field Mapping</h3>
                    <p className="field-mapping-help">
                      Map incoming JSON field names to our lead fields.
                      Required fields are marked with *
                    </p>

                    <div className="field-mapping-container">
                      <div className="field-mapping-row">
                        <div className="field-name">
                          Phone <span className="required">*</span>
                        </div>
                        <input
                          type="text"
                          value={newWebhook.fieldMapping.phone}
                          onChange={(e) => handleFieldMappingChange("phone", e.target.value)}
                          placeholder="phone"
                          className="text-input"
                          required
                        />
                      </div>

                      <div className="field-mapping-row">
                        <div className="field-name">
                          First Name <span className="required">*</span>
                        </div>
                        <input
                          type="text"
                          value={newWebhook.fieldMapping.firstName}
                          onChange={(e) => handleFieldMappingChange("firstName", e.target.value)}
                          placeholder="first_name"
                          className="text-input"
                          required
                        />
                      </div>

                      <div className="field-mapping-row">
                        <div className="field-name">
                          Last Name <span className="required">*</span>
                        </div>
                        <input
                          type="text"
                          value={newWebhook.fieldMapping.lastName}
                          onChange={(e) => handleFieldMappingChange("lastName", e.target.value)}
                          placeholder="last_name"
                          className="text-input"
                          required
                        />
                      </div>

                      <div className="field-mapping-row">
                        <div className="field-name">Email</div>
                        <input
                          type="text"
                          value={newWebhook.fieldMapping.email}
                          onChange={(e) => handleFieldMappingChange("email", e.target.value)}
                          placeholder="email"
                          className="text-input"
                        />
                      </div>

                      <div className="field-mapping-row">
                        <div className="field-name">Brand</div>
                        <input
                          type="text"
                          value={newWebhook.fieldMapping.brand || ""}
                          onChange={(e) => handleFieldMappingChange("brand", e.target.value)}
                          placeholder="brand"
                          className="text-input"
                        />
                      </div>

                      <div className="field-mapping-row">
                        <div className="field-name">Source</div>
                        <input
                          type="text"
                          value={newWebhook.fieldMapping.source || ""}
                          onChange={(e) => handleFieldMappingChange("source", e.target.value)}
                          placeholder="source"
                          className="text-input"
                        />
                      </div>

                      <div className="field-mapping-row">
                        <div className="field-name">Lead Age</div>
                        <input
                          type="text"
                          value={newWebhook.fieldMapping.leadAge || ""}
                          onChange={(e) => handleFieldMappingChange("leadAge", e.target.value)}
                          placeholder="lead_age"
                          className="text-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="button-primary">
                      {editingWebhook ? "Update Webhook" : "Create Webhook"}
                    </button>
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="webhooks-list-container">
                <h2>Available Webhooks</h2>
                {webhooks.length === 0 ? (
                  <div className="no-webhooks">
                    <p>No webhooks found. Create your first webhook to start ingesting leads.</p>
                  </div>
                ) : (
                  <div className="webhooks-list">
                    {webhooks.map((webhook) => (
                      <div
                        key={webhook.id}
                        className={`webhook-card ${webhook.active ? "active" : "inactive"}`}
                      >
                        <div className="webhook-header">
                          <h3>{webhook.name}</h3>
                          <span className={`status-badge ${webhook.active ? "active" : "inactive"}`}>
                            {webhook.active ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="webhook-content">
                          {webhook.description && (
                            <div className="webhook-description">
                              <p>{webhook.description}</p>
                            </div>
                          )}

                          <div className="webhook-details">
                            <div className="detail-row">
                              <span className="detail-label">Webhook URL:</span>
                              <div className="webhook-url">
                                <code>{generateWebhookUrl(webhook)}</code>
                                <button
                                  className="copy-button"
                                  onClick={() => copyToClipboard(generateWebhookUrl(webhook))}
                                >
                                  Copy
                                </button>
                              </div>
                            </div>

                            <div className="detail-row">
                              <span className="detail-label">Created:</span>
                              <span>{formatDate(webhook.createdAt)}</span>
                            </div>

                            <div className="detail-row">
                              <span className="detail-label">Default Lead Pool:</span>
                              <span>
                                {leadPools.find(p => p.id === webhook.defaultPoolId)?.name || "None"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="webhook-actions">
                          <button
                            className="button-secondary small"
                            onClick={() => handleEdit(webhook)}
                          >
                            Edit
                          </button>
                          <button
                            className={`button-secondary small ${webhook.active ? "deactivate" : "activate"}`}
                            onClick={() => handleToggleActive(webhook.id, webhook.name, webhook.active)}
                          >
                            {webhook.active ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            className="button-danger small"
                            onClick={() => handleDelete(webhook.id, webhook.name)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </LoadingIcon>
  );
};

export default WebhookIngestion; 