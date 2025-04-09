import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './DIDPoolDetails.css';
import LoadingIcon from '../components/LoadingIcon';

const DIDPoolDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [didPool, setDidPool] = useState(null);
  const [dids, setDids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [formData, setFormData] = useState({
    number: '',
    provider: 'default',
    callerIdName: '',
    status: 'active',
    monthlyCost: 0,
    notes: ''
  });
  const [importData, setImportData] = useState({
    file: null,
    skipHeader: true,
    updateExisting: false
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
  const [didsLoading, setDidsLoading] = useState(true);

  useEffect(() => {
    fetchDidPool();
    fetchDids();
  }, [id, pagination.page, pagination.limit, sortConfig, filters]);

  const fetchDidPool = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching DID pool details...');
      const response = await apiService.didPools.getById(id);
      console.log('DID pool details response:', response);
      
      if (response && response.data) {
        setDidPool(response.data);
      } else {
        console.error('Invalid response format:', response);
        setError('Failed to load DID pool details. Invalid response format.');
      }
    } catch (err) {
      console.error('Error fetching DID pool details:', err);
      setError('Failed to load DID pool details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDids = async () => {
    setDidsLoading(true);
    setError(null);
    try {
      console.log('Fetching DIDs...');
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortField: sortConfig.field,
        sortDirection: sortConfig.direction,
        search: filters.search,
        status: filters.status,
        region: filters.region,
        poolId: id
      };
      console.log('DIDs fetch params:', params);
      
      const response = await apiService.dids.getAll(params);
      console.log('DIDs response:', response);
      
      if (response && response.data) {
        setDids(Array.isArray(response.data) ? response.data : []);
        if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            total: response.pagination.total
          }));
        }
      } else {
        console.error('Invalid response format:', response);
        setError('Failed to load DIDs. Invalid response format.');
        setDids([]);
      }
    } catch (err) {
      console.error('Error fetching DIDs:', err);
      setError('Failed to load DIDs. Please try again later.');
      setDids([]);
    } finally {
      setDidsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddDid = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // Format the data according to the backend's expected format
      const didData = {
        phoneNumber: formData.number,
        provider: formData.provider || 'default',
        callerIdName: formData.callerIdName || '',
        region: didPool.region || '',
        status: formData.status || 'active',
        monthlyCost: formData.monthlyCost || 0,
        didPoolId: id
      };
      
      console.log('Creating DID with data:', didData);
      
      // Use the dids.create endpoint
      const response = await apiService.dids.create(didData);
      
      console.log('Create DID response:', response);
      
      if (response && response.data) {
        setShowAddModal(false);
        setFormData({
          number: '',
          provider: 'default',
          callerIdName: '',
          status: 'active',
          monthlyCost: 0,
          notes: ''
        });
        fetchDids();
      } else {
        console.error('Invalid response format:', response);
        setError('Failed to create DID. Invalid response format.');
      }
    } catch (err) {
      console.error('Error creating DID:', err);
      
      // Extract error message from the error object
      let errorMessage = 'Failed to create DID. Please try again.';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', err.response.data);
        errorMessage = err.response.data.msg || err.response.data.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Error request:', err.request);
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', err.message);
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  const handleImportDids = async (e) => {
    e.preventDefault();
    if (!importData.file) {
      setError('Please select a file to import');
      return;
    }

    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', importData.file);
      formData.append('skipHeader', importData.skipHeader);
      formData.append('updateExisting', importData.updateExisting);
      formData.append('poolId', id);

      console.log('Importing DIDs with options:', {
        skipHeader: importData.skipHeader,
        updateExisting: importData.updateExisting
      });

      const response = await apiService.dids.import(formData);
      console.log('Import DIDs response:', response);

      if (response) {
        setShowImportModal(false);
        setImportData({
          file: null,
          skipHeader: true,
          updateExisting: false
        });
        fetchDids();
      } else {
        console.error('Invalid response format:', response);
        setError('Failed to import DIDs. Invalid response format.');
      }
    } catch (err) {
      console.error('Error importing DIDs:', err);
      setError('Failed to import DIDs. Please try again.');
    }
  };

  const handleDeleteDid = async (didId) => {
    if (window.confirm('Are you sure you want to delete this DID? This action cannot be undone.')) {
      setError(null);
      try {
        console.log('Deleting DID:', didId);
        const response = await apiService.dids.delete(didId);
        console.log('Delete DID response:', response);
        
        if (response) {
          fetchDids();
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

  if (isLoading && !didPool) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="loading-container">
            <p className="loading-text">Loading DID pool details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!didPool) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="error-state">
            <p>DID pool not found.</p>
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
    <LoadingIcon text="Loading DID pool details..." isLoading={isLoading}>
      <div className="page-container">
        <div className="content-container">
          <div className="content-header">
            <div className="header-left">
              <button 
                className="back-button"
                onClick={() => navigate('/did-pools')}
              >
                <i className="fas fa-arrow-left"></i>
                Back to DID Pools
              </button>
              <h1 className="page-title">{didPool.name}</h1>
            </div>
            <div className="header-actions">
              <button 
                className="button-secondary"
                onClick={() => setShowImportModal(true)}
              >
                Import DIDs
              </button>
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

          <div className="content-body">
            <div className="pool-details">
              <div className="details-section">
                <h2>Pool Details</h2>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Description</label>
                    <p>{didPool.description || 'No description provided'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Region</label>
                    <p>{didPool.region || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Timezone</label>
                    <p>{didPool.timezone || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Status</label>
                    <p className={`status-badge ${didPool.status}`}>
                      {didPool.status.charAt(0).toUpperCase() + didPool.status.slice(1)}
                    </p>
                  </div>
                  <div className="detail-item">
                    <label>Total DIDs</label>
                    <p>{didPool.totalDids || 0}</p>
                  </div>
                  <div className="detail-item">
                    <label>Created</label>
                    <p>{new Date(didPool.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="detail-item">
                    <label>Last Updated</label>
                    <p>{new Date(didPool.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="dids-section">
                <div className="section-header">
                  <h2>DIDs</h2>
                  <div className="filters">
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
                </div>

                {didsLoading ? (
                  <LoadingIcon text="Loading DIDs..." isLoading={didsLoading} />
                ) : dids.length === 0 ? (
                  <div className="empty-state">
                    <p>No DIDs found in this pool.</p>
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
                          <th onClick={() => handleSortChange('number')}>
                            Phone Number
                            {sortConfig.field === 'number' && (
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
                          <th onClick={() => handleSortChange('createdAt')}>
                            Created
                            {sortConfig.field === 'createdAt' && (
                              <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                            )}
                          </th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dids.map(did => (
                          <tr key={did.id}>
                            <td>{did.number}</td>
                            <td>
                              <span className={`status-badge ${did.status}`}>
                                {did.status.charAt(0).toUpperCase() + did.status.slice(1)}
                              </span>
                            </td>
                            <td>{did.region || 'N/A'}</td>
                            <td>{new Date(did.createdAt).toLocaleString()}</td>
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
                  <label htmlFor="number">Phone Number *</label>
                  <input
                    type="tel"
                    id="number"
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter phone number (e.g., +1234567890)"
                  />
                  <p className="help-text">Enter the phone number in international format (e.g., +1234567890)</p>
                </div>
                <div className="form-group">
                  <label htmlFor="provider">Provider</label>
                  <select
                    id="provider"
                    name="provider"
                    value={formData.provider || 'default'}
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
                    value={formData.callerIdName || ''}
                    onChange={handleInputChange}
                    placeholder="Enter caller ID name"
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
                  <label htmlFor="monthlyCost">Monthly Cost</label>
                  <input
                    type="number"
                    id="monthlyCost"
                    name="monthlyCost"
                    value={formData.monthlyCost || 0}
                    onChange={handleInputChange}
                    placeholder="Enter monthly cost"
                    min="0"
                    step="0.01"
                  />
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

        {/* Import DIDs Modal */}
        {showImportModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Import DIDs</h2>
                <button 
                  className="close-button"
                  onClick={() => setShowImportModal(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleImportDids}>
                <div className="form-group">
                  <label htmlFor="file">CSV File *</label>
                  <input
                    type="file"
                    id="file"
                    accept=".csv"
                    onChange={(e) => setImportData(prev => ({ ...prev, file: e.target.files[0] }))}
                    required
                  />
                  <p className="help-text">
                    Upload a CSV file containing DID information. The file should include columns for number, status, and notes.
                  </p>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={importData.skipHeader}
                      onChange={(e) => setImportData(prev => ({ ...prev, skipHeader: e.target.checked }))}
                    />
                    Skip header row
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={importData.updateExisting}
                      onChange={(e) => setImportData(prev => ({ ...prev, updateExisting: e.target.checked }))}
                    />
                    Update existing DIDs
                  </label>
                </div>
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="button-secondary"
                    onClick={() => setShowImportModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="button-primary"
                  >
                    Import DIDs
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </LoadingIcon>
  );
};

export default DIDPoolDetails;