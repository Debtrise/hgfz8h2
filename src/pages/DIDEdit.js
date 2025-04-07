import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import './DIDEdit.css';

const DIDEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [did, setDid] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    status: 'active',
    notes: '',
    tags: []
  });

  useEffect(() => {
    fetchDid();
  }, [id]);

  const fetchDid = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.dids.getById(id);
      setDid(response.data);
      setFormData({
        phoneNumber: response.data.phoneNumber || '',
        status: response.data.status || 'active',
        notes: response.data.notes || '',
        tags: response.data.tags || []
      });
    } catch (err) {
      console.error('Error fetching DID:', err);
      setError('Failed to load DID details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await apiService.dids.update(id, formData);
      navigate(`/did-pools/${did.poolId}`);
    } catch (err) {
      console.error('Error updating DID:', err);
      setError('Failed to update DID. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this DID? This action cannot be undone.')) {
      try {
        await apiService.dids.delete(id);
        navigate(`/did-pools/${did.poolId}`);
      } catch (err) {
        console.error('Error deleting DID:', err);
        setError('Failed to delete DID. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="loading-state">
            <LoadingSpinner size="large" text="Loading DID details..." />
          </div>
        </div>
      </div>
    );
  }

  if (!did) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="error-state">
            <p>DID not found</p>
            <button 
              className="button-primary"
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="content-header">
          <h1 className="page-title">Edit DID</h1>
          <div className="header-actions">
            <button 
              className="button-secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button 
              className="button-danger"
              onClick={handleDelete}
            >
              Delete DID
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button className="dismiss-button" onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="content-body">
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Enter notes about this DID"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags.join(', ')}
                onChange={handleTagsChange}
                placeholder="Enter tags separated by commas"
              />
              <small className="help-text">Separate tags with commas</small>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="button-secondary"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="button-primary"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DIDEdit; 