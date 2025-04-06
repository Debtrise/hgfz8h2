import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './DIDPools.css';
import LoadingSpinner from '../components/LoadingSpinner';

const DIDPools = () => {
  const navigate = useNavigate();
  const [didPools, setDidPools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });

  // Fetch DID pools on component mount
  useEffect(() => {
    fetchDidPools();
  }, []);

  const fetchDidPools = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.didPools.getAll();
      setDidPools(response.data || []);
    } catch (err) {
      console.error('Error fetching DID pools:', err);
      setError('Failed to load DID pools. Please try again later.');
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

  const handleCreateDidPool = async (e) => {
    e.preventDefault();
    try {
      await apiService.didPools.create(formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        description: '',
        status: 'active'
      });
      fetchDidPools();
    } catch (err) {
      console.error('Error creating DID pool:', err);
      setError('Failed to create DID pool. Please try again.');
    }
  };

  const handleDeleteDidPool = async (id) => {
    if (window.confirm('Are you sure you want to delete this DID pool? This action cannot be undone.')) {
      try {
        await apiService.didPools.delete(id);
        fetchDidPools();
      } catch (err) {
        console.error('Error deleting DID pool:', err);
        setError('Failed to delete DID pool. Please try again.');
      }
    }
  };

  const viewDidPoolDetails = (id) => {
    navigate(`/did-pools/${id}`);
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="loading-state">
            <LoadingSpinner size="large" text="Loading DID pools..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="content-header">
          <h1 className="page-title">DID Pools</h1>
          <div className="header-actions">
            <button 
              className="button-primary"
              onClick={() => setShowCreateModal(true)}
            >
              Create DID Pool
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
          {didPools.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>DID Count</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {didPools.map(pool => (
                    <tr key={pool.id}>
                      <td>{pool.name}</td>
                      <td>{pool.description || 'No description'}</td>
                      <td>{pool.did_count || 0}</td>
                      <td>
                        <span className={`status-badge ${pool.status?.toLowerCase() || 'active'}`}>
                          {pool.status || 'Active'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-button view-button"
                            onClick={() => viewDidPoolDetails(pool.id)}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="action-button edit-button"
                            onClick={() => navigate(`/did-pools/${pool.id}/edit`)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="action-button delete-button"
                            onClick={() => handleDeleteDidPool(pool.id)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No DID pools found. Create your first DID pool to get started.</p>
            </div>
          )}
        </div>

        {/* Create DID Pool Modal */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Create DID Pool</h2>
                <button className="close-button" onClick={() => setShowCreateModal(false)}>×</button>
              </div>
              <form onSubmit={handleCreateDidPool}>
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
                <div className="modal-footer">
                  <button type="button" className="button-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="button-primary">
                    Create DID Pool
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DIDPools;
