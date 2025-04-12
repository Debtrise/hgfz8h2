import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './DIDs.css';

const DIDs = () => {
  const navigate = useNavigate();
  const [dids, setDids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    provider: 'default',
    callerIdName: '',
    region: '',
    status: 'active',
    monthlyCost: 0,
    didPoolId: ''
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    region: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [sortConfig, setSortConfig] = useState({
    field: 'createdAt',
    direction: 'desc'
  });
  const [didPools, setDidPools] = useState([]);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDIDs();
    fetchDidPools();
  }, [pagination.page, pagination.limit, sortConfig, filters]);

  const fetchDIDs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.dids.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        status: filters.status,
        region: filters.region,
        sort: `${sortConfig.field}:${sortConfig.direction}`
      });
      
      // Log the response for debugging
      console.log('DIDs API Response:', response);
      
      if (response && response.data) {
        // Ensure we have the correct data structure - handle both formats
        const didsData = Array.isArray(response.data) ? response.data : [];
        
        // Transform the data to match the expected format
        const transformedDids = didsData.map(did => ({
          id: did.id,
          phoneNumber: did.phone_number || did.phoneNumber || '',
          provider: did.provider || 'default',
          callerIdName: did.caller_id_name || did.callerIdName || '',
          region: did.region || '',
          status: did.status || 'active',
          monthlyCost: did.monthly_cost || did.monthlyCost || 0,
          createdAt: did.created_at || did.createdAt || new Date().toISOString(),
          pool: {
            id: did.did_pool_id || did.didPoolId || null,
            name: did.pool_name || did.poolName || 'None'
          }
        }));
        
        setDids(transformedDids);
        
        // Update pagination information
        const paginationData = response.pagination || {
          page: 1,
          limit: 10,
          total: transformedDids.length
        };
        
        setPagination(prev => ({
          ...prev,
          total: paginationData.total || transformedDids.length
        }));
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (err) {
      console.error('Error fetching DIDs:', err);
      setError(err.message || 'Failed to fetch DIDs');
    } finally {
      setLoading(false);
    }
  };

  const fetchDidPools = async () => {
    try {
      const response = await apiService.didPools.getAll();
      if (response && response.data) {
        setDidPools(response.data);
      }
    } catch (err) {
      console.error('Error fetching DID pools:', err);
      setError('Failed to load DID pools');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number input
    if (name === 'phoneNumber') {
      // Remove any non-digit characters except the plus sign
      const cleanedValue = value.replace(/[^\d+]/g, '');
      // Ensure only one plus sign at the beginning
      const formattedValue = cleanedValue.startsWith('+') 
        ? '+' + cleanedValue.slice(1).replace(/\D/g, '')
        : cleanedValue.replace(/\D/g, '');
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddDid = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // Validate required fields
      if (!formData.phoneNumber) {
        throw new Error('Phone number is required');
      }
      if (!formData.didPoolId) {
        throw new Error('DID Pool is required');
      }

      // Validate phone number format
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        throw new Error('Please enter a valid phone number in international format (e.g., +1234567890)');
      }

      // Format the data according to API requirements
      const formattedData = {
        phoneNumber: formData.phoneNumber,
        provider: formData.provider || 'default',
        callerIdName: formData.callerIdName?.trim() || '',
        region: formData.region?.trim() || '',
        status: formData.status || 'active',
        monthlyCost: formData.monthlyCost ? parseFloat(formData.monthlyCost) : 0,
        didPoolId: parseInt(formData.didPoolId),
        tenant_id: getTenantId()
      };
      
      console.log('Submitting DID creation with data:', formattedData);
      
      const response = await apiService.dids.create(formattedData);
      console.log('Create DID Response:', response);
      
      if (response && (response.data || response.id)) {
        // Clear the form and close modal
        setShowAddModal(false);
        setFormData({
          phoneNumber: '',
          provider: 'default',
          callerIdName: '',
          region: '',
          status: 'active',
          monthlyCost: 0,
          didPoolId: ''
        });
        
        // Reset pagination to first page and refresh the list
        setPagination(prev => ({
          ...prev,
          page: 1
        }));
        await fetchDIDs();
        
        // Show success message
        setSuccess('DID created successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (err) {
      console.error('Error creating DID:', err);
      let errorMessage = 'Failed to create DID. Please try again.';
      
      if (err.response) {
        // Handle API error responses
        if (err.response.data && err.response.data.msg) {
          errorMessage = err.response.data.msg;
        } else if (err.response.status === 400) {
          errorMessage = 'Invalid data provided. Please check your input.';
        } else if (err.response.status === 404) {
          errorMessage = 'DID Pool not found. Please select a valid pool.';
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  const handleDeleteDid = async (didId) => {
    if (window.confirm('Are you sure you want to delete this DID? This action cannot be undone.')) {
      setError(null);
      try {
        await apiService.dids.delete(didId);
        fetchDIDs();
      } catch (err) {
        console.error('Error deleting DID:', err);
        setError(err.message || 'Failed to delete DID');
      }
    }
  };

  const handleSearch = (e) => {
    const { value } = e.target;
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  if (loading && dids.length === 0) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="loading-container">
            <p className="loading-text">Loading DIDs...</p>
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
            <h1 className="page-title">DIDs</h1>
          </div>
          <div className="header-actions">
            <button 
              className="button-primary"
              onClick={() => setShowAddModal(true)}
            >
              Add DID
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button className="dismiss-button" onClick={() => setError(null)}>×</button>
          </div>
        )}
        {success && (
          <div className="success-message">
            {success}
            <button className="dismiss-button" onClick={() => setSuccess('')}>×</button>
          </div>
        )}

        <div className="content-body">
          <div className="filters-section">
            <input
              type="text"
              placeholder="Search DIDs..."
              value={filters.search}
              onChange={handleSearch}
              className="search-input"
            />
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              name="region"
              value={filters.region}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Regions</option>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="UK">United Kingdom</option>
              <option value="AU">Australia</option>
            </select>
          </div>

          {dids.length === 0 ? (
            <div className="empty-state">
              <p>No DIDs found.</p>
              <button 
                className="button-primary"
                onClick={() => setShowAddModal(true)}
              >
                Add DID
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSortChange('phoneNumber')}>
                      Phone Number
                      {sortConfig.field === 'phoneNumber' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSortChange('provider')}>
                      Provider
                      {sortConfig.field === 'provider' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSortChange('status')}>
                      Status
                      {sortConfig.field === 'status' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSortChange('region')}>
                      Region
                      {sortConfig.field === 'region' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dids.map(did => (
                    <tr key={did.id}>
                      <td>{did.phoneNumber}</td>
                      <td>{did.provider}</td>
                      <td>
                        <span className={`status-badge ${did.status}`}>
                          {did.status.charAt(0).toUpperCase() + did.status.slice(1)}
                        </span>
                      </td>
                      <td>{did.region || 'N/A'}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="button-icon"
                            onClick={() => navigate(`/dids/${did.id}/edit`)}
                            title="Edit DID"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="button-icon danger"
                            onClick={() => handleDeleteDid(did.id)}
                            title="Delete DID"
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
          )}

          {pagination.total > pagination.limit && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
              </span>
              <button
                className="pagination-button"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add DID Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add DID</h2>
              <button 
                className="close-button"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddDid}>
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number *</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter phone number (e.g., +1234567890)"
                />
                <p className="help-text">Enter the phone number in international format (e.g., +1234567890)</p>
              </div>
              <div className="form-group">
                <label htmlFor="didPoolId">DID Pool *</label>
                <select
                  id="didPoolId"
                  name="didPoolId"
                  value={formData.didPoolId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a DID Pool</option>
                  {didPools.map(pool => (
                    <option key={pool.id} value={pool.id}>{pool.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="provider">Provider</label>
                <select
                  id="provider"
                  name="provider"
                  value={formData.provider}
                  onChange={handleInputChange}
                >
                  <option value="default">Default Provider</option>
                  <option value="twilio">Twilio</option>
                  <option value="bandwidth">Bandwidth</option>
                  <option value="plivo">Plivo</option>
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
                  placeholder="Enter caller ID name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="region">Region</label>
                <select
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                >
                  <option value="">Select Region</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="AU">Australia</option>
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
              <div className="form-group">
                <label htmlFor="monthlyCost">Monthly Cost</label>
                <input
                  type="number"
                  id="monthlyCost"
                  name="monthlyCost"
                  value={formData.monthlyCost}
                  onChange={handleInputChange}
                  placeholder="Enter monthly cost"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="button-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="button-primary"
                >
                  Add DID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DIDs; 