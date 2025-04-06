import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Dashboard.css";
import apiService from "../services/apiService";

const LeadPoolForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leadAgeMin: 0,
    leadAgeMax: 30,
    criteria: {
      location: '',
      income: '',
      creditScore: ''
    },
    status: 'active'
  });

  const [error, setError] = useState(null);

  // Load lead pool data for editing
  useEffect(() => {
    if (isEditMode) {
      fetchLeadPool();
    }
  }, [isEditMode, id]);

  const fetchLeadPool = async () => {
    try {
      const response = await apiService.leadPools.getById(id);
      const pool = response.data;
      setFormData({
        name: pool.name,
        description: pool.description || '',
        leadAgeMin: pool.lead_age_min,
        leadAgeMax: pool.lead_age_max,
        criteria: pool.criteria || {
          location: '',
          income: '',
          creditScore: ''
        },
        status: pool.status
      });
    } catch (err) {
      console.error('Error fetching lead pool:', err);
      setError('Failed to load lead pool data');
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "number" ? parseInt(value) || 0 : value
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await apiService.leadPools.update(id, formData);
      } else {
        await apiService.leadPools.create(formData);
      }
      navigate('/lead-pools');
    } catch (err) {
      console.error('Error saving lead pool:', err);
      setError(`Failed to ${isEditMode ? 'update' : 'create'} lead pool`);
    }
  };

  return (
    <div className="form-container">
      <h1>{isEditMode ? 'Edit Lead Pool' : 'Create Lead Pool'}</h1>
      
      {error && (
        <div className="error-message">
          {error}
          <button className="dismiss-button" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="lead-pool-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
          />
        </div>

        <div className="form-section">
          <h3>Lead Age Range</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="leadAgeMin">Minimum Age (days)</label>
              <input
                type="number"
                id="leadAgeMin"
                name="leadAgeMin"
                value={formData.leadAgeMin}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="leadAgeMax">Maximum Age (days)</label>
              <input
                type="number"
                id="leadAgeMax"
                name="leadAgeMax"
                value={formData.leadAgeMax}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Criteria</h3>
          <div className="form-group">
            <label htmlFor="criteria.location">Location</label>
            <input
              type="text"
              id="criteria.location"
              name="criteria.location"
              value={formData.criteria.location}
              onChange={handleInputChange}
              placeholder="e.g., US,NY"
            />
          </div>
          <div className="form-group">
            <label htmlFor="criteria.income">Income</label>
            <input
              type="text"
              id="criteria.income"
              name="criteria.income"
              value={formData.criteria.income}
              onChange={handleInputChange}
              placeholder="e.g., >75000"
            />
          </div>
          <div className="form-group">
            <label htmlFor="criteria.creditScore">Credit Score</label>
            <input
              type="text"
              id="criteria.creditScore"
              name="criteria.creditScore"
              value={formData.criteria.creditScore}
              onChange={handleInputChange}
              placeholder="e.g., >700"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="status"
              checked={formData.status === 'active'}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                status: e.target.checked ? 'active' : 'inactive'
              }))}
            />
            Active
          </label>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/lead-pools')} className="cancel-button">
            Cancel
          </button>
          <button type="submit" className="submit-button">
            {isEditMode ? 'Update Lead Pool' : 'Create Lead Pool'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadPoolForm;
