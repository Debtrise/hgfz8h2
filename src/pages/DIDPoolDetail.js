import React, { useState, useEffect, useCallback } from 'react';
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
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDIDs: 0,
    didsPerPage: 20
  });
  const [filters, setFilters] = useState({
    status: 'all',
    source: 'all',
    dateRange: 'all',
    search: ''
  });
  const [availableFields, setAvailableFields] = useState([]);

  // Memoize fetchDIDPool to prevent unnecessary re-renders
  const fetchDIDPool = useCallback(async () => {
    if (!id) {
      setError('Invalid DID pool ID');
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiService.didPools.getById(id);
      const poolData = response.data;
      
      if (!poolData) {
        throw new Error('Invalid response format: No data received');
      }
      
      setDIDPool({
        id: poolData.id,
        name: poolData.name || '',
        description: poolData.description || '',
        status: poolData.status || 'active',
        active: poolData.status === 'active',
        createdAt: poolData.created_at || poolData.createdAt || new Date().toISOString(),
        updatedAt: poolData.updated_at || poolData.updatedAt || new Date().toISOString(),
        ingroups: Array.isArray(poolData.ingroups) 
          ? poolData.ingroups.join(', ') 
          : typeof poolData.ingroups === 'string' 
            ? poolData.ingroups 
            : '',
        brand: poolData.brand || '',
        source: poolData.source || '',
        tags: Array.isArray(poolData.tags) ? poolData.tags : []
      });
    } catch (err) {
      console.error('Error fetching DID pool:', err);
      setError('Failed to load DID pool details. Please try again later.');
    }
  }, [id]);

  // Memoize fetchDIDs to prevent unnecessary re-renders
  const fetchDIDs = useCallback(async () => {
    if (!id) {
      setError('Invalid DID pool ID');
      return;
    }

    try {
      const response = await apiService.didPools.getDids(id);
      const allDIDs = Array.isArray(response.data) ? response.data : [];
      
      let filteredDIDs = allDIDs
        .map(did => ({
          id: did.id,
          number: did.phone_number || did.phoneNumber || did.number || '',
          status: did.status || 'active', 
          source: did.source || '',
          createdAt: did.created_at || did.createdAt || new Date().toISOString(),
          lastUsed: did.last_used || did.lastUsed || new Date().toISOString()
        }))
        .filter(did => {
          if (filters.status !== 'all' && did.status !== filters.status) return false;
          if (filters.source !== 'all' && did.source !== filters.source) return false;
          if (filters.search && !did.number.includes(filters.search)) return false;
          
          if (filters.dateRange !== 'all') {
            const now = new Date();
            const daysAgo = {
              'today': 1,
              'week': 7,
              'month': 30,
              'year': 365
            }[filters.dateRange];
            
            const didDate = new Date(did.createdAt);
            const diffTime = Math.abs(now - didDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > daysAgo) return false;
          }
          
          return true;
        });
      
      const totalDIDs = filteredDIDs.length;
      const totalPages = Math.ceil(totalDIDs / pagination.didsPerPage);
      const startIndex = (pagination.currentPage - 1) * pagination.didsPerPage;
      const endIndex = startIndex + pagination.didsPerPage;
      
      setPagination(prev => ({
        ...prev,
        totalPages,
        totalDIDs
      }));
      
      setDIDs(filteredDIDs.slice(startIndex, endIndex));
    } catch (err) {
      console.error('Error fetching DIDs:', err);
      setError('Failed to load DIDs. Please try again later.');
    }
  }, [id, filters, pagination.currentPage, pagination.didsPerPage]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchDIDPool(), fetchDIDs()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchDIDPool, fetchDIDs]);

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

  const handleSearch = (e) => {
    const value = e.target.value;
    setFilters(prev => ({
      ...prev,
      search: value
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
    if (!window.confirm('Are you sure you want to delete this DID pool? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.didPools.delete(id);
      navigate('/did-pools', { 
        state: { message: 'DID pool deleted successfully' }
      });
    } catch (err) {
      console.error('Error deleting DID pool:', err);
      setError('Failed to delete DID pool. Please try again.');
    }
  };

  const handleUploadDIDs = async (e) => {
    e.preventDefault();
    if (!uploadData.file) return;
    
    setIsUploading(true);
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
      
      // Refresh DIDs list
      await fetchDIDs();
      
      // Show success message
      setError({ type: 'success', message: 'DIDs uploaded successfully!' });
    } catch (err) {
      console.error('Error uploading DIDs:', err);
      setError('Failed to upload DIDs. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a CSV or Excel file.');
      return;
    }

    setUploadData(prev => ({
      ...prev,
      file
    }));
    
    // Preview file contents
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      // Only show first few lines of preview
      const lines = content.split('\n').slice(0, 5).join('\n');
      setFilePreview(lines);
      
      // Extract column headers for mapping
      const headers = content.split('\n')[0].split(',');
      setAvailableFields(headers.map(h => h.trim()));
    };
    reader.readAsText(file);
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

  const renderUploadModal = () => (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Upload DIDs to {didPool.name}</h2>
          <button 
            className="close-button" 
            onClick={() => !isUploading && setShowUploadModal(false)}
            disabled={isUploading}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleUploadDIDs}>
          <div className="form-group">
            <label htmlFor="file">
              Upload File
              <span className="required">*</span>
            </label>
            <input
              type="file"
              id="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              required
              disabled={isUploading}
            />
            <div className="help-text">
              Supported formats: CSV, Excel (.xlsx, .xls)
            </div>
          </div>

          {filePreview && (
            <div className="form-group">
              <label>File Preview</label>
              <div className="file-preview">
                <pre>{filePreview}</pre>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Field Mapping</label>
            <div className="help-text">
              Map your file columns to DID fields
            </div>
            <div className="mapping-grid">
              <div className="mapping-row">
                <div>Phone Number</div>
                <select
                  value={uploadData.mapping.number || ''}
                  onChange={(e) => handleMappingChange('number', e.target.value)}
                  required
                  disabled={isUploading}
                >
                  <option value="">Select Column</option>
                  {availableFields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Upload Options</label>
            <div className="options-grid">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="skipHeader"
                  checked={uploadData.options.skipHeader}
                  onChange={handleOptionChange}
                  disabled={isUploading}
                />
                Skip Header Row
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="updateExisting"
                  checked={uploadData.options.updateExisting}
                  onChange={handleOptionChange}
                  disabled={isUploading}
                />
                Update Existing DIDs
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setShowUploadModal(false)}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!uploadData.file || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload DIDs'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading DID pool details...</p>
        </div>
      </div>
    );
  }

  if (!didPool) {
    return (
      <div className="page-container">
        <div className="error-state">
          <h2>DID Pool Not Found</h2>
          <p>The DID pool you're looking for doesn't exist or has been removed.</p>
          <button className="btn btn-primary" onClick={() => navigate('/did-pools')}>
            Back to DID Pools
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="content-header">
          <div className="header-left">
            <button className="back-button" onClick={() => navigate('/did-pools')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
              </svg>
              Back to DID Pools
            </button>
            <h1 className="page-title">{didPool.name}</h1>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={() => navigate(`/did-pools/edit/${id}`)}>
              Edit Pool
            </button>
            <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
              Upload DIDs
            </button>
            <button className="btn btn-danger" onClick={handleDeleteDIDPool}>
              Delete Pool
            </button>
          </div>
        </div>

        {error && (
          <div className={`alert ${error.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {typeof error === 'string' ? error : error.message}
            <button className="alert-close" onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="pool-details">
          <div className="detail-card">
            <div className="detail-content">
              {didPool.description && (
                <p className="description">{didPool.description}</p>
              )}
              <div className="tags">
                {didPool.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="label">Brand</span>
                  <span className="value">{didPool.brand || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Source</span>
                  <span className="value">{didPool.source || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Status</span>
                  <span className={`status-badge ${didPool.active ? 'active' : 'inactive'}`}>
                    {didPool.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Created</span>
                  <span className="value">
                    {new Date(didPool.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="dids-section">
            <div className="section-header">
              <h2>DIDs</h2>
              <div className="filters">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search DIDs..."
                    value={filters.search}
                    onChange={handleSearch}
                    className="search-input"
                  />
                </div>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  name="dateRange"
                  value={filters.dateRange}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
            </div>

            {dids.length > 0 ? (
              <>
                <div className="table-container">
                  <table className="data-table">
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
                            <span className={`status-badge ${did.status}`}>
                              {did.status}
                            </span>
                          </td>
                          <td>{did.source || '—'}</td>
                          <td>{new Date(did.createdAt).toLocaleDateString()}</td>
                          <td>{new Date(did.lastUsed).toLocaleDateString()}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn btn-icon"
                                onClick={() => navigate(`/dids/${did.id}`)}
                                title="View Details"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                                  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="btn btn-icon"
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.currentPage === 1}
                    >
                      «
                    </button>
                    <button
                      className="btn btn-icon"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                    >
                      ‹
                    </button>
                    
                    <span className="pagination-info">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    
                    <button
                      className="btn btn-icon"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                    >
                      ›
                    </button>
                    <button
                      className="btn btn-icon"
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={pagination.currentPage === pagination.totalPages}
                    >
                      »
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <p>No DIDs found in this pool.</p>
                <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
                  Upload DIDs
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showUploadModal && renderUploadModal()}
    </div>
  );
};

export default DIDPoolDetail; 