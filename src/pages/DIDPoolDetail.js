import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './ListPages.css';

const DIDPoolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [didPool, setDIDPool] = useState(null);
  const [dids, setDIDs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    file: null,
    mapping: {},
    options: {
      skipHeader: true,
      updateExisting: false
    }
  });
  const [availableFields, setAvailableFields] = useState([]);
  const [filePreview, setFilePreview] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDIDs: 0,
    didsPerPage: 20
  });
  const [filters, setFilters] = useState({
    status: 'all',
    source: 'all',
    dateRange: 'all'
  });

  useEffect(() => {
    fetchDIDPool();
    fetchDIDs();
  }, [id, pagination.currentPage, filters]);

  const fetchDIDPool = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!id) {
        setError('Invalid DID pool ID');
        setIsLoading(false);
        return;
      }
      const response = await apiService.didPools.getById(id);
      setDIDPool(response.data);
    } catch (err) {
      console.error('Error fetching DID pool:', err);
      setError('Failed to load DID pool details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDIDs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!id) {
        setError('Invalid DID pool ID');
        setIsLoading(false);
        return;
      }
      const response = await apiService.didPools.getDids(id);
      const allDIDs = response.data || [];
      
      // Apply filters
      let filteredDIDs = [...allDIDs];
      
      if (filters.status !== 'all') {
        filteredDIDs = filteredDIDs.filter(did => did.status === filters.status);
      }
      
      if (filters.source !== 'all') {
        filteredDIDs = filteredDIDs.filter(did => did.source === filters.source);
      }
      
      if (filters.dateRange !== 'all') {
        const now = new Date();
        const daysAgo = filters.dateRange === 'today' ? 1 : 
                        filters.dateRange === 'week' ? 7 : 
                        filters.dateRange === 'month' ? 30 : 365;
        
        filteredDIDs = filteredDIDs.filter(did => {
          const didDate = new Date(did.createdAt);
          const diffTime = Math.abs(now - didDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= daysAgo;
        });
      }
      
      // Calculate pagination
      const totalDIDs = filteredDIDs.length;
      const totalPages = Math.ceil(totalDIDs / pagination.didsPerPage);
      const startIndex = (pagination.currentPage - 1) * pagination.didsPerPage;
      const endIndex = startIndex + pagination.didsPerPage;
      
      // Update pagination state
      setPagination(prev => ({
        ...prev,
        totalPages,
        totalDIDs
      }));
      
      // Get current page DIDs
      const currentPageDIDs = filteredDIDs.slice(startIndex, endIndex);
      setDIDs(currentPageDIDs);
    } catch (err) {
      console.error('Error fetching DIDs:', err);
      setError('Failed to load DIDs. Please try again later.');
    } finally {
      setIsLoading(false);
    }
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

  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  const handleDeleteDIDPool = async () => {
    if (window.confirm('Are you sure you want to delete this DID pool? This action cannot be undone.')) {
      try {
        await apiService.didPools.delete(id);
        navigate('/did-pools');
      } catch (err) {
        console.error('Error deleting DID pool:', err);
        setError('Failed to delete DID pool. Please try again.');
      }
    }
  };

  const handleUploadDIDs = async (e) => {
    e.preventDefault();
    if (!uploadData.file) return;
    
    try {
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('mapping', JSON.stringify(uploadData.mapping));
      formData.append('options', JSON.stringify(uploadData.options));
      
      await apiService.dids.import({
        didPoolId: id,
        formData
      });
      
      setShowUploadModal(false);
      setUploadData({
        file: null,
        mapping: {},
        options: {
          skipHeader: true,
          updateExisting: false
        }
      });
      setFilePreview(null);
      
      // Show success message
      alert('DIDs uploaded successfully!');
      fetchDIDs();
    } catch (err) {
      console.error('Error uploading DIDs:', err);
      setError('Failed to upload DIDs. Please try again.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadData(prev => ({
        ...prev,
        file
      }));
      
      // Preview file contents
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleMappingChange = (field, value) => {
    setUploadData(prev => ({
      ...prev,
      mapping: {
        ...prev.mapping,
        [field]: value
      }
    }));
  };

  const handleOptionChange = (e) => {
    const { name, checked } = e.target;
    setUploadData(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [name]: checked
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading DID pool details...</p>
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
            <h2>DID Pool Not Found</h2>
            <p>The DID pool you're looking for doesn't exist or has been removed.</p>
            <button className="button-blue" onClick={() => navigate('/did-pools')}>
              Back to DID Pools
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="content-header header-with-back">
          <button className="back-button" onClick={() => navigate('/did-pools')}>
            <span className="back-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
              </svg>
            </span>
            Back to DID Pools
          </button>
          <div className="header-actions">
            <button className="button-blue" onClick={() => navigate(`/did-pools/edit/${id}`)}>
              Edit DID Pool
            </button>
            <button className="button-outline" onClick={() => setShowUploadModal(true)}>
              Upload DIDs
            </button>
            <button className="button-outline delete" onClick={handleDeleteDIDPool}>
              Delete DID Pool
            </button>
          </div>
        </div>

        <div className="content-body">
          {error && (
            <div className="error-message">
              {error}
              <button className="dismiss-button" onClick={() => setError(null)}>×</button>
            </div>
          )}

          {/* DID Pool Information */}
          <div className="detail-card">
            <h2 className="detail-card-title">{didPool.name}</h2>
            <div className="detail-card-content">
              <p className="item-description">{didPool.description}</p>
              <div className="tags-container">
                {didPool.tags && didPool.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              <div className="detail-info-grid">
                <div className="detail-item">
                  <div className="detail-label">Brand</div>
                  <div className="detail-value">{didPool.brand}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Source</div>
                  <div className="detail-value">{didPool.source}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Ingroups</div>
                  <div className="detail-value">{didPool.ingroups}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Status</div>
                  <div className="detail-value">
                    <span className={`status-badge ${didPool.active ? 'active' : 'inactive'}`}>
                      {didPool.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Created</div>
                  <div className="detail-value">{new Date(didPool.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Last Modified</div>
                  <div className="detail-value">{new Date(didPool.updatedAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* DIDs Section */}
          <div className="dids-section">
            <div className="section-header">
              <h2>DIDs</h2>
              <div className="filters">
                <div className="filter-group">
                  <label htmlFor="status">Status:</label>
                  <select
                    id="status"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label htmlFor="source">Source:</label>
                  <select
                    id="source"
                    name="source"
                    value={filters.source}
                    onChange={handleFilterChange}
                  >
                    <option value="all">All Sources</option>
                    <option value="web">Web</option>
                    <option value="phone">Phone</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label htmlFor="dateRange">Date Range:</label>
                  <select
                    id="dateRange"
                    name="dateRange"
                    value={filters.dateRange}
                    onChange={handleFilterChange}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="loading-spinner">Loading DIDs...</div>
            ) : dids.length > 0 ? (
              <>
                <div className="dids-table-container">
                  <table className="dids-table">
                    <thead>
                      <tr>
                        <th>Number</th>
                        <th>Status</th>
                        <th>Source</th>
                        <th>Created</th>
                        <th>Last Used</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dids.map(did => (
                        <tr key={did.id}>
                          <td>{did.number}</td>
                          <td>
                            <span className={`status-badge ${did.status.toLowerCase()}`}>
                              {did.status}
                            </span>
                          </td>
                          <td>{did.source}</td>
                          <td>{new Date(did.createdAt).toLocaleDateString()}</td>
                          <td>{new Date(did.lastUsed).toLocaleDateString()}</td>
                          <td className="action-buttons">
                            <button 
                              className="action-button view-button"
                              onClick={() => navigate(`/dids/${did.id}`)}
                              title="View Details"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      className="pagination-button"
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.currentPage === 1}
                    >
                      First
                    </button>
                    <button 
                      className="pagination-button"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                    >
                      Previous
                    </button>
                    
                    {[...Array(pagination.totalPages)].map((_, i) => {
                      // Show current page, first, last, and pages around current
                      if (
                        i === 0 ||
                        i === pagination.totalPages - 1 ||
                        (i >= pagination.currentPage - 2 && i <= pagination.currentPage + 2)
                      ) {
                        return (
                          <button
                            key={i}
                            className={`pagination-button ${
                              pagination.currentPage === i + 1 ? "active" : ""
                            }`}
                            onClick={() => handlePageChange(i + 1)}
                          >
                            {i + 1}
                          </button>
                        );
                      } else if (
                        i === pagination.currentPage - 3 ||
                        i === pagination.currentPage + 3
                      ) {
                        return <span key={i}>...</span>;
                      }
                      return null;
                    })}
                    
                    <button 
                      className="pagination-button"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                    >
                      Next
                    </button>
                    <button 
                      className="pagination-button"
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={pagination.currentPage === pagination.totalPages}
                    >
                      Last
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <p>No DIDs found in this pool.</p>
                <button className="button-blue" onClick={() => setShowUploadModal(true)}>
                  Upload DIDs
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload DIDs Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Upload DIDs to {didPool.name}</h2>
              <button className="close-button" onClick={() => setShowUploadModal(false)}>×</button>
            </div>
            <form onSubmit={handleUploadDIDs}>
              <div className="form-group">
                <label htmlFor="file">Upload File</label>
                <input
                  type="file"
                  id="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  required
                />
                <div className="file-help">
                  Supported formats: CSV, Excel (.xlsx, .xls)
                </div>
              </div>

              {filePreview && (
                <div className="file-preview">
                  <h3>File Preview</h3>
                  <pre>{filePreview}</pre>
                </div>
              )}

              <div className="field-mapping">
                <h3>Field Mapping</h3>
                <div className="mapping-help">
                  Map your file columns to DID fields
                </div>
                <div className="mapping-table">
                  <div className="mapping-header">
                    <div className="mapping-cell">DID Field</div>
                    <div className="mapping-cell">File Column</div>
                  </div>
                  <div className="mapping-row">
                    <div className="mapping-cell">Number</div>
                    <div className="mapping-cell">
                      <select
                        value={uploadData.mapping.number || ''}
                        onChange={(e) => handleMappingChange('number', e.target.value)}
                        required
                      >
                        <option value="">Select Column</option>
                        {availableFields.map(field => (
                          <option key={field} value={field}>{field}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="upload-options">
                <h3>Upload Options</h3>
                <div className="option-group">
                  <label>
                    <input
                      type="checkbox"
                      name="skipHeader"
                      checked={uploadData.options.skipHeader}
                      onChange={handleOptionChange}
                    />
                    Skip Header Row
                  </label>
                </div>
                <div className="option-group">
                  <label>
                    <input
                      type="checkbox"
                      name="updateExisting"
                      checked={uploadData.options.updateExisting}
                      onChange={handleOptionChange}
                    />
                    Update Existing DIDs
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-button" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Upload DIDs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DIDPoolDetail; 