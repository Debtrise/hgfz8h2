import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Dashboard.css";

const LeadPoolForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    leadAge: "0-15",
    brand: "BDS",
    source: "",
    active: true,
  });

  // Sample brands and sources
  const brands = ["BDS", "Lendvia", "Other"];
  const leadAgeOptions = ["0-15", "15-30", "30-60", "60+"];
  const sourceOptions = [
    "Web Forms",
    "Email Campaigns",
    "Callbacks",
    "Facebook",
    "TikTok",
    "Other",
  ];

  // Load lead pool data for editing (simulation)
  useEffect(() => {
    if (isEditMode) {
      // In a real app, you would fetch the lead pool data from API
      // This is just a simulation
      setTimeout(() => {
        setFormData({
          title: "New Leads - Web",
          description:
            "All web leads aged 0-15 days from all marketing platforms",
          leadAge: "0-15",
          brand: "BDS",
          source: "Web Forms, Fb, TikTok",
          active: true,
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

  // Handle source selection with multiple select
  const handleSourceChange = (e) => {
    const options = e.target.options;
    const selectedValues = [];

    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }

    setFormData({
      ...formData,
      source: selectedValues.join(", "),
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // In a real app, you would send formData to API
    console.log("Saving lead pool:", formData);

    // Simulate success
    alert(`Lead pool ${isEditMode ? "updated" : "created"} successfully!`);
    navigate("/lead-pools");
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/lead-pools");
  };

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="content-header">
          <h1 className="page-title">
            {isEditMode ? "Edit Lead Pool" : "Create Lead Pool"}
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
                  placeholder="Enter a name for this lead pool"
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
                  placeholder="Describe this lead pool and its purpose"
                  rows={3}
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="form-label" htmlFor="leadAge">
                    Lead Age
                  </label>
                  <select
                    id="leadAge"
                    name="leadAge"
                    className="form-input"
                    value={formData.leadAge}
                    onChange={handleInputChange}
                    required
                  >
                    {leadAgeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <p className="form-help">Age range of leads in this pool</p>
                </div>

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
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="source">
                  Sources
                </label>
                <select
                  id="source"
                  name="source"
                  className="form-input"
                  value={formData.source.split(", ")}
                  onChange={handleSourceChange}
                  multiple
                  size={4}
                >
                  {sourceOptions.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
                <p className="form-help">
                  Hold Ctrl/Cmd to select multiple sources
                </p>
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
                {isEditMode ? "Update Lead Pool" : "Create Lead Pool"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeadPoolForm;
