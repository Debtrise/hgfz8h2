import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Dashboard.css";

const DIDPoolForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    brand: "BDS",
    source: "",
    ingroups: "",
    active: true,
    numbersCount: 0,
    dialRatio: 1.0,
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

  // Load DID pool data for editing (simulation)
  useEffect(() => {
    if (isEditMode) {
      // In a real app, you would fetch the DID pool data from API
      // This is just a simulation
      setTimeout(() => {
        setFormData({
          title: "Main Sales DIDs",
          description: "Primary phone numbers for outbound sales campaigns",
          brand: "BDS",
          source: "Outbound Sales",
          ingroups: "Sales, Support",
          active: true,
          numbersCount: 10,
          dialRatio: 1.5,
        });
      }, 300);
    }
  }, [isEditMode, id]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle multi-select options
  const handleMultiSelectChange = (e, fieldName) => {
    const options = e.target.options;
    const selectedValues = [];

    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }

    setFormData({
      ...formData,
      [fieldName]: selectedValues.join(", "),
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // In a real app, you would send formData to API
    console.log("Saving DID pool:", formData);

    // Simulate success
    alert(`DID pool ${isEditMode ? "updated" : "created"} successfully!`);
    navigate("/did-pools");
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

        <div className="content-body">
          <form className="pool-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h2 className="form-section-title">Basic Information</h2>

              <div className="form-field">
                <label className="form-label" htmlFor="title">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-input"
                  value={formData.title}
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
                  value={formData.ingroups.split(", ")}
                  onChange={(e) => handleMultiSelectChange(e, "ingroups")}
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
                  <label className="form-label" htmlFor="numbersCount">
                    Number of DIDs
                  </label>
                  <input
                    type="number"
                    id="numbersCount"
                    name="numbersCount"
                    className="form-input"
                    value={formData.numbersCount}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                  />
                </div>

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

              <div className="form-field checkbox-field">
                <label className="form-checkbox-label">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                  />
                  <span>Active</span>
                </label>
                <p className="form-help">
                  Inactive pools will not be used in campaigns
                </p>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="button-outline"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button type="submit" className="button-blue">
                {isEditMode ? "Update DID Pool" : "Create DID Pool"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DIDPoolForm;
