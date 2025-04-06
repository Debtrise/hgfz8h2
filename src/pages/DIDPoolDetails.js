import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import './DIDPools.css';

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
    phoneNumber: '',
    provider: '',
    callerIdName: '',
    status: 'active'
  });
  const [importData, setImportData] = useState({
    file: null,
    mapping: {},
    options: {
      skipHeader: true,
      updateExisting: false
    }
  });
  const [filePreview, setFilePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    provider: 'all',
    status: 'all'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'phoneNumber',
    direction: 'asc'
  });

  // Fetch DID pool and DIDs on component mount
  useEffect(() => {
    fetchDidPool();
    fetchDids();
  }, [id]);

  // Refetch DIDs when pagination, sorting, or filters change
  useEffect(() => {
    fetchDids();
  }, [pagination.currentPage, sortConfig, filters]);

  const fetchDidPool = async () => {
    try {
      const response = await apiService.didPools.getById(id);
      setDidPool(response.data);
    } catch (err) {
      console.error('Error fetching DID pool:', err);
      setError('Failed to load DID pool details. Please try again later.');
    }
  };

  const fetchDids = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        search: searchTerm || undefined,
        provider: filters.provider !== 'all' ? filters.provider : undefined,
        status: filters.status !== 'all' ? filters.status : undefined
      };

      const response = await apiService.didPools.getDids(id, params);
      
      // Update pagination based on response
      setPagination(prev => ({
        ...prev,
        totalPages: Math.ceil(response.data.total / prev.itemsPerPage),
        totalItems: response.data.total
      }));
      
      setDids(response.data.dids || []);
    } catch (err) {
      console.error('Error fetching DIDs:', err);
      setError('Failed to load DIDs. Please try again later.');
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

  const handleImportInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setImportData(prev => ({
        ...prev,
        options: {
          ...prev.options,
          [name]: checked
        }
      }));
    } else {
      setImportData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImportData(prev => ({
        ...prev,
        file
      }));
      
      // Create a preview of the file
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleAddDid = async (e) => {
    e.preventDefault();
    try {
      await apiService.didPools.addDidToPool(id, formData);
      setShowAddModal(false);
      setFormData({
        phoneNumber: '',
        provider: '',
        callerIdName: '',
        status: 'active'
      });
      fetchDids();
    } catch (err) {
      console.error('Error adding DID:', err);
      setError('Failed to add DID. Please try again.');
    }
  };

  const handleImportDids = async (e) => {
    e.preventDefault();
    if (!importData.file) return;
    
    try {
      const formData = new FormData();
      formData.append('file', importData.file);
      formData.append('mapping', JSON.stringify(importData.mapping));
      formData.append('options', JSON.stringify(importData.options));
      
      await apiService.dids.importToLeadPool(id, formData);
      
      setShowImportModal(false);
      setImportData({
        file: null,
        mapping: {},
        options: {
          skipHeader: true,
          updateExisting: false
        }
      });
      setFilePreview(null);
      
      // Show success message
      alert('DIDs imported successfully!');
      fetchDids();
    } catch (err) {
      console.error('Error importing DIDs:', err);
      setError('Failed to import DIDs. Please try again.');
    }
  };

  const handleDeleteDid = async (didId) => {
    if (window.confirm('Are you sure you want to delete this DID? This action cannot be undone.')) {
      try {
        await apiService.dids.delete(didId);
        fetchDids();
      } catch (err) {
        console.error('Error deleting DID:', err);
        setError('Failed to delete DID. Please try again.');
      }
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  const handleSortChange = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  const handleExportDids = async () => {
    try {
      const response = await apiService.didPools.getDids(id, { export: true });
      
      // Create a CSV string from the DIDs
      const headers = ['Phone Number', 'Provider', 'Caller ID Name', 'Status', 'Created At'];
      const csvRows = [headers];
      
      response.data.dids.forEach(did => {
        csvRows.push([
          did.phoneNumber,
          did.provider,
          did.callerIdName,
          did.status,
          new Date(did.createdAt).toLocaleString()
        ]);
      });
      
      const csvContent = csvRows.map(row => row.join(',')).join('\n');
      
      // Create a download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${didPool.name}_dids.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting DIDs:', err);
      setError('Failed to export DIDs. Please try again.');
    }
  };

  if (isLoading && !didPool) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="loading-state">
            <LoadingSpinner size="large" text="Loading DID pool details..." />
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
              onClick={() => navigate('/did-pools')}
            >
              <i className="fas fa-arrow-left"></i> Back to DID Pools
            </button>
            <h1 className="page-title">{didPool?.name || 'DID Pool Details'}</h1>
          </div>
          <div className="header-actions">
            <button 
              className="button-secondary"
              onClick={handleExportDids}
            >
              Export DIDs
            </button>
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

        <div className="pool-details">
          <div className="details-card">
            <h2>Pool Information</h2>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{didPool?.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Description:</span>
                <span className="detail-value">{didPool?.description || 'No description'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className={`status-badge ${didPool?.status?.toLowerCase() || 'active'}`}>
                  {didPool?.status || 'Active'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Total DIDs:</span>
                <span className="detail-value">{pagination.totalItems}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Created:</span>
                <span className="detail-value">
                  {didPool?.createdAt ? new Date(didPool.createdAt).toLocaleString() : 'Unknown'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Updated:</span>
                <span className="detail-value">
                  {didPool?.updatedAt ? new Date(didPool.updatedAt).toLocaleString() : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="content-body">
          <div className="filter-row">
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search DIDs..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <button 
                className="search-button"
                onClick={() => {
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                  fetchDids();
                }}
              >
                <i className="fas fa-search"></i>
              </button>
            </div>
            <div className="filter-group">
              <label>Provider:</label>
              <div className="select-wrapper">
                <select
                  name="provider"
                  value={filters.provider}
                  onChange={handleFilterChange}
                >
                  <option value="all">All Providers</option>
                  <option value="Twilio">Twilio</option>
                  <option value="Bandwidth">Bandwidth</option>
                  <option value="Vonage">Vonage</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="filter-group">
              <label>Status:</label>
              <div className="select-wrapper">
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <LoadingSpinner size="medium" text="Loading DIDs..." />
            </div>
          ) : dids.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSortChange('phoneNumber')} className="sortable">
                      Phone Number
                      {sortConfig.key === 'phoneNumber' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSortChange('provider')} className="sortable">
                      Provider
                      {sortConfig.key === 'provider' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSortChange('callerIdName')} className="sortable">
                      Caller ID Name
                      {sortConfig.key === 'callerIdName' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSortChange('status')} className="sortable">
                      Status
                      {sortConfig.key === 'status' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSortChange('createdAt')} className="sortable">
                      Created At
                      {sortConfig.key === 'createdAt' && (
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
                      <td>{did.callerIdName}</td>
                      <td>
                        <span className={`status-badge ${did.status?.toLowerCase() || 'active'}`}>
                          {did.status || 'Active'}
                        </span>
                      </td>
                      <td>{new Date(did.createdAt).toLocaleString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-button edit-button"
                            onClick={() => navigate(`/dids/${did.id}/edit`)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="action-button delete-button"
                            onClick={() => handleDeleteDid(did.id)}
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
              <p>No DIDs found in this pool. Add your first DID to get started.</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-button"
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage === 1}
              >
                <i className="fas fa-angle-double-left"></i>
              </button>
              <button 
                className="pagination-button"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                <i className="fas fa-angle-left"></i>
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, current page, and pages around current page
                  return page === 1 || 
                         page === pagination.totalPages || 
                         Math.abs(page - pagination.currentPage) <= 1;
                })
                .map((page, index, array) => {
                  // Add ellipsis between non-consecutive pages
                  if (index > 0 && page - array[index - 1] > 1) {
                    return (
                      <React.Fragment key={`ellipsis-${page}`}>
                        <span className="pagination-ellipsis">...</span>
                        <button 
                          className={`pagination-button ${page === pagination.currentPage ? 'active' : ''}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  }
                  
                  return (
                    <button 
                      key={page}
                      className={`pagination-button ${page === pagination.currentPage ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  );
                })}
              
              <button 
                className="pagination-button"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                <i className="fas fa-angle-right"></i>
              </button>
              <button 
                className="pagination-button"
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                <i className="fas fa-angle-double-right"></i>
              </button>
            </div>
          )}
        </div>

        {/* Add DID Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Add DID to Pool</h2>
                <button className="close-button" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              <form onSubmit={handleAddDid}>
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
                <div className="modal-footer">
                  <button type="button" className="button-secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="button-primary">
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
                <button className="close-button" onClick={() => setShowImportModal(false)}>×</button>
              </div>
              <form onSubmit={handleImportDids}>
                <div className="form-group">
                  <label htmlFor="file">CSV File</label>
                  <input
                    type="file"
                    id="file"
                    name="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    required
                  />
                  <small className="form-help">
                    Upload a CSV file with columns: phoneNumber, provider, callerIdName, status
                  </small>
                </div>
                
                {filePreview && (
                  <div className="file-preview">
                    <h3>File Preview</h3>
                    <pre>{filePreview}</pre>
                  </div>
                )}
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="skipHeader"
                      checked={importData.options.skipHeader}
                      onChange={handleImportInputChange}
                    />
                    Skip Header Row
                  </label>
                </div>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="updateExisting"
                      checked={importData.options.updateExisting}
                      onChange={handleImportInputChange}
                    />
                    Update Existing DIDs
                  </label>
                </div>
                
                <div className="modal-footer">
                  <button type="button" className="button-secondary" onClick={() => setShowImportModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="button-primary">
                    Import DIDs
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

export default DIDPoolDetails; 