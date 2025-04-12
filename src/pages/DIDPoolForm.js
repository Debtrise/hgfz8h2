import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiService from "../services/apiService";
import "./Dashboard.css";

const DIDPoolForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brand: "BDS",
    source: "",
    ingroups: [],
    status: "active",
    dialRatio: 1.0
  });

  // Sample data options
  const brands = ["BDS", "Lendvia", "Other"];
  const sourceOptions = [
    "Outbound Sales",
    "Support",
    "Marketing",
    "Retention",
    "Other",
  ];
  const ingroupOptions = [
    "Sales",
    "Support",
    "Marketing",
    "Retention",
    "Customer Service",
  ];

  // Load DID pool data for editing
  useEffect(() => {
    if (isEditMode) {
      fetchDIDPool();
    }
  }, [isEditMode, id]);

  const fetchDIDPool = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.didPools.getById(id);
      console.log('DID pool response:', response);
      
      // Extract pool data from response, handling different possible formats
      let poolData;
      if (response?.data) {
        // Response has a data property
        poolData = response.data;
      } else if (response && typeof response === 'object') {
        // Response is the data object itself
        poolData = response;
      } else {
        throw new Error('Invalid response format');
      }
      
      if (poolData) {
        setFormData({
          name: poolData.name || "",
          description: poolData.description || "",
          brand: poolData.brand || "BDS",
          source: poolData.source || "",
          ingroups: Array.isArray(poolData.ingroups) ? poolData.ingroups : [],
          status: poolData.status || "active",
          dialRatio: poolData.dial_ratio || poolData.dialRatio || 1.0
        });
      } else {
        setError('Failed to load DID pool details. Empty or invalid data received.');
      }
    } catch (err) {
      console.error('Error fetching DID pool:', err);
      setError('Failed to load DID pool details. ' + (err.message || 'Please try again later.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle multi-select options
  const handleMultiSelectChange = (e) => {
    const options = e.target.options;
    const selectedValues = [];

    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }

    setFormData({
      ...formData,
      ingroups: selectedValues,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const poolData = {
        tenant_id: getTenantId(),
        name: formData.name,
        description: formData.description,
        brand: formData.brand,
        source: formData.source,
        ingroups: formData.ingroups,
        status: formData.status,
        dial_ratio: parseFloat(formData.dialRatio)
      };

      let response;
      if (isEditMode) {
        response = await apiService.didPools.update(id, poolData);
      } else {
        response = await apiService.didPools.create(poolData);
      }
      
      console.log('API response:', response);
      
      // Check if we received a valid response
      if (response && (response.data || response.id)) {
        navigate("/did-pools");
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error saving DID pool:', err);
      setError(`Failed to ${isEditMode ? 'update' : 'create'} DID pool. ${err.message || 'Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/did-pools");
  };

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="content-header">
          <h1 className="page-title">
            {isEditMode ? "Edit DID Pool" : "Create DID Pool"}
          </h1>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button className="dismiss-button" onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="content-body">
          <form className="pool-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h2 className="form-section-title">Basic Information</h2>

              <div className="form-field">
                <label className="form-label" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter a name for this DID pool"
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe this DID pool and its purpose"
                  rows={3}
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="form-label" htmlFor="brand">
                    Brand
                  </label>
                  <select
                    id="brand"
                    name="brand"
                    className="form-input"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                  >
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor="source">
                    Source
                  </label>
                  <select
                    id="source"
                    name="source"
                    className="form-input"
                    value={formData.source}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a source</option>
                    {sourceOptions.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="ingroups">
                  Ingroups
                </label>
                <select
                  id="ingroups"
                  name="ingroups"
                  className="form-input"
                  value={formData.ingroups}
                  onChange={handleMultiSelectChange}
                  multiple
                  size={4}
                >
                  {ingroupOptions.map((ingroup) => (
                    <option key={ingroup} value={ingroup}>
                      {ingroup}
                    </option>
                  ))}
                </select>
                <p className="form-help">
                  Hold Ctrl/Cmd to select multiple ingroups
                </p>
              </div>
            </div>

            <div className="form-section">
              <h2 className="form-section-title">Configuration</h2>

              <div className="form-row">
                <div className="form-field">
                  <label className="form-label" htmlFor="dialRatio">
                    Dial Ratio
                  </label>
                  <input
                    type="number"
                    id="dialRatio"
                    name="dialRatio"
                    className="form-input"
                    value={formData.dialRatio}
                    onChange={handleInputChange}
                    min="0.1"
                    step="0.1"
                  />
                  <p className="form-help">Calls per minute per DID</p>
                </div>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="form-input"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="button-outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button type="submit" className="button-blue" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditMode ? "Update DID Pool" : "Create DID Pool"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DIDPoolForm;
