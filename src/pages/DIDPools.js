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
    brand: '',
    source: '',
    status: 'active'
  });
  
  // State for brands and sources from API
  const [brands, setBrands] = useState([]);
  const [sources, setSources] = useState([]);

  // Fetch DID pools, brands, and sources on component mount
  useEffect(() => {
    fetchDidPools();
    fetchBrands();
    fetchSources();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await apiService.brands.getAll();
      setBrands(response.data || []);
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  };

  const fetchSources = async () => {
    try {
      const response = await apiService.sources.getAll();
      setSources(response.data || []);
    } catch (err) {
      console.error('Error fetching sources:', err);
    }
  };

  const fetchDidPools = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching DID pools...');
      const response = await apiService.didPools.getAll();
      console.log('DID pools response:', response);
      
      if (response && response.data) {
        const pools = Array.isArray(response.data) ? response.data : [];
        
        // Fetch detailed information for each pool to get accurate data
        const poolsWithDetails = await Promise.all(
          pools.map(async (pool) => {
            try {
              const poolDetails = await apiService.didPools.getById(pool.id);
              return {
                ...pool,
                brand: poolDetails.data?.brand || pool.brand || 'N/A',
                source: poolDetails.data?.source || pool.source || 'N/A',
                totalDids: poolDetails.data?.dids?.length || 0
              };
            } catch (err) {
              console.error(`Error fetching details for pool ${pool.id}:`, err);
              return {
                ...pool,
                brand: pool.brand || 'N/A',
                source: pool.source || 'N/A',
                totalDids: 0
              };
            }
          })
        );
        
        setDidPools(poolsWithDetails);
      } else {
        console.error('Invalid response format:', response);
        setError('Failed to load DID pools. Invalid response format.');
        setDidPools([]);
      }
    } catch (err) {
      console.error('Error fetching DID pools:', err);
      setError('Failed to load DID pools. Please try again later.');
      setDidPools([]);
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
    setError(null);
    try {
      console.log('Creating DID pool with data:', formData);
      const response = await apiService.didPools.create(formData);
      console.log('Create DID pool response:', response);
      
      if (response && response.data) {
        setShowCreateModal(false);
        setFormData({
          name: '',
          description: '',
          brand: '',
          source: '',
          status: 'active'
        });
        fetchDidPools();
      } else {
        console.error('Invalid response format:', response);
        setError('Failed to create DID pool. Invalid response format.');
      }
    } catch (err) {
      console.error('Error creating DID pool:', err);
      setError('Failed to create DID pool. Please try again.');
    }
  };

  const handleDeleteDidPool = async (id) => {
    if (window.confirm('Are you sure you want to delete this DID pool? This action cannot be undone.')) {
      setError(null);
      try {
        console.log('Deleting DID pool:', id);
        const response = await apiService.didPools.delete(id);
        console.log('Delete DID pool response:', response);
        
        if (response) {
          fetchDidPools();
        } else {
          console.error('Invalid response format:', response);
          setError('Failed to delete DID pool. Invalid response format.');
        }
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
          <h1 className="page-title">All DID Pools</h1>
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
                    <th>Brand</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Total DIDs</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {didPools.map(pool => (
                    <tr key={pool.id}>
                      <td>{pool.name}</td>
                      <td>{pool.description || 'No description'}</td>
                      <td>{pool.brand || 'N/A'}</td>
                      <td>{pool.source || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${pool.status?.toLowerCase()}`}>
                          {pool.status || 'Unknown'}
                        </span>
                      </td>
                      <td>{pool.totalDids || 0}</td>
                      <td>{pool.createdAt ? new Date(pool.createdAt).toLocaleString() : 'N/A'}</td>
                      <td className="action-buttons">
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
                          title="Edit Pool"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="action-button delete-button"
                          onClick={() => handleDeleteDidPool(pool.id)}
                          title="Delete Pool"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No DID pools found. Create a new DID pool to get started.</p>
              <button 
                className="button-primary"
                onClick={() => setShowCreateModal(true)}
              >
                Create DID Pool
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create DID Pool Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create DID Pool</h2>
              <button 
                className="close-button"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateDidPool}>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter pool name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter pool description"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="brand">Brand</label>
                <select
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                >
                  <option value="">Select a brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.name}>{brand.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="source">Source</label>
                <select
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                >
                  <option value="">Select a source</option>
                  {sources.map((source) => (
                    <option key={source.id} value={source.name}>{source.name}</option>
                  ))}
                </select>
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
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="button-primary"
                >
                  Create Pool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DIDPools;
