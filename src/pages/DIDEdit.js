import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import './DIDPools.css';

const DIDEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [did, setDid] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    provider: '',
    callerIdName: '',
    status: 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch DID details on component mount
  useEffect(() => {
    fetchDid();
  }, [id]);

  const fetchDid = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!id) {
        setError('Invalid DID ID');
        setIsLoading(false);
        return;
      }
      const response = await apiService.dids.getById(id);
      setDid(response.data);
      setFormData({
        phoneNumber: response.data.phoneNumber || '',
        provider: response.data.provider || '',
        callerIdName: response.data.callerIdName || '',
        status: response.data.status || 'active'
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await apiService.dids.update(id, formData);
      
      // Navigate back to the DID pool details page
      if (did && did.poolId) {
        navigate(`/did-pools/${did.poolId}`);
      } else {
        navigate('/did-pools');
      }
    } catch (err) {
      console.error('Error updating DID:', err);
      setError('Failed to update DID. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Navigate back to the DID pool details page
    if (did && did.poolId) {
      navigate(`/did-pools/${did.poolId}`);
    } else {
      navigate('/did-pools');
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

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="content-header">
          <div className="header-left">
            <button 
              className="back-button"
              onClick={handleCancel}
            >
              <i className="fas fa-arrow-left"></i> Back
            </button>
            <h1 className="page-title">Edit DID</h1>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button className="dismiss-button" onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="content-body">
          <div className="form-card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., +1234567890"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="provider">Provider</label>
                <select
                  id="provider"
                  name="provider"
                  value={formData.provider}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Provider</option>
                  <option value="Twilio">Twilio</option>
                  <option value="Bandwidth">Bandwidth</option>
                  <option value="Vonage">Vonage</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="callerIdName">Caller ID Name</label>
                <input
                  type="text"
                  id="callerIdName"
                  name="callerIdName"
                  value={formData.callerIdName}
                  onChange={handleInputChange}
                  placeholder="e.g., Company Name"
                  required
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
                </select>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="button-secondary"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="button-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DIDEdit; 