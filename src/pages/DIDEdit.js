import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './DIDEdit.css';
import LoadingIcon from '../components/LoadingIcon';

const DIDEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [did, setDid] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    number: '',
    status: 'active',
    notes: ''
  });

  useEffect(() => {
    fetchDid();
  }, [id]);

  const fetchDid = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching DID details...');
      const response = await apiService.dids.getById(id);
      console.log('DID details response:', response);
      
      if (response && response.data) {
        setDid(response.data);
        setFormData({
          number: response.data.number,
          status: response.data.status,
          notes: response.data.notes || ''
        });
      } else {
        console.error('Invalid response format:', response);
        setError('Failed to load DID details. Invalid response format.');
      }
    } catch (err) {
      console.error('Error fetching DID details:', err);
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
    setError(null);
    try {
      console.log('Updating DID with data:', formData);
      const response = await apiService.dids.update(id, formData);
      console.log('Update DID response:', response);
      
      if (response && response.data) {
        navigate(`/did-pools/${did.poolId}`);
      } else {
        console.error('Invalid response format:', response);
        setError('Failed to update DID. Invalid response format.');
      }
    } catch (err) {
      console.error('Error updating DID:', err);
      setError('Failed to update DID. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this DID? This action cannot be undone.')) {
      setError(null);
      try {
        console.log('Deleting DID:', id);
        const response = await apiService.dids.delete(id);
        console.log('Delete DID response:', response);
        
        if (response) {
          navigate(`/did-pools/${did.poolId}`);
        } else {
          console.error('Invalid response format:', response);
          setError('Failed to delete DID. Invalid response format.');
        }
      } catch (err) {
        console.error('Error deleting DID:', err);
        setError('Failed to delete DID. Please try again.');
      }
    }
  };

  if (!did) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="error-state">
            <p>DID not found.</p>
            <button 
              className="button-primary"
              onClick={() => navigate('/did-pools')}
            >
              Back to DID Pools
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LoadingIcon text="Loading DID details..." isLoading={isLoading}>
      <div className="page-container">
        <div className="content-container">
          <div className="content-header">
            <div className="header-left">
              <button 
                className="back-button"
                onClick={() => navigate(`/did-pools/${did.poolId}`)}
              >
                <i className="fas fa-arrow-left"></i>
                Back to DID Pool
              </button>
              <h1 className="page-title">Edit DID</h1>
            </div>
            <div className="header-actions">
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
                <label htmlFor="number">Phone Number *</label>
                <input
                  type="tel"
                  id="number"
                  name="number"
                  value={formData.number}
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
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Enter notes"
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="button-secondary"
                  onClick={() => navigate(`/did-pools/${did.poolId}`)}
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
    </LoadingIcon>
  );
};

export default DIDEdit; 