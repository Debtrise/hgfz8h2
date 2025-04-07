import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './LeadPoolDetail.css';
import LoadingSpinner from '../components/LoadingSpinner';

const LeadPoolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leadPool, setLeadPool] = useState(null);
  const [leads, setLeads] = useState([]);
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
    totalLeads: 0,
    leadsPerPage: 20
  });
  const [filters, setFilters] = useState({
    status: 'all',
    source: 'all',
    dateRange: 'all'
  });
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchLeadPool();
    fetchLeads();
  }, [id, pagination.currentPage, filters, sortField, sortDirection]);

  const fetchLeadPool = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.leadPools.getById(id);
      setLeadPool(response.data);
    } catch (err) {
      console.error('Error fetching lead pool:', err);
      setError('Failed to load lead pool details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeads = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the getByLeadPool method with the correct parameters
      const response = await apiService.leads.getByLeadPool(id, {
        page: pagination.currentPage,
        limit: pagination.leadsPerPage,
        sort: `${sortField}:${sortDirection}`,
        status: filters.status !== 'all' ? filters.status : undefined,
        source: filters.source !== 'all' ? filters.source : undefined,
        dateRange: filters.dateRange !== 'all' ? filters.dateRange : undefined
      });
      
      // Ensure leads is always an array
      const poolLeads = Array.isArray(response.data) ? response.data : 
                        (response.data && Array.isArray(response.data.leads)) ? response.data.leads : 
                        [];
      
      // Calculate pagination
      const totalLeads = response.meta?.total || poolLeads.length;
      const totalPages = Math.ceil(totalLeads / pagination.leadsPerPage);
      
      // Update pagination state
      setPagination(prev => ({
        ...prev,
        totalPages,
        totalLeads
      }));
      
      // Set the leads
      setLeads(poolLeads);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to load leads. Please try again later.');
      setLeads([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadData(prev => ({ ...prev, file }));
      
      // Preview the file
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvContent = event.target.result;
        const lines = csvContent.split('\n').slice(0, 5); // Get first 5 lines for preview
        setFilePreview(lines.join('\n'));
        
        // Extract headers from the first line
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(header => header.trim());
          setAvailableFields(headers);
          
          // Set default mapping
          const defaultMapping = {};
          headers.forEach(header => {
            defaultMapping[header] = header.toLowerCase().replace(/\s+/g, '_');
          });
          setUploadData(prev => ({
            ...prev,
            mapping: defaultMapping
          }));
        }
      };
      reader.readAsText(file);
    }
  };

  const handleMappingChange = (header, field) => {
    setUploadData(prev => ({
      ...prev,
      mapping: {
        ...prev.mapping,
        [header]: field
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

  const handleUploadLeads = async (e) => {
    e.preventDefault();
    if (!uploadData.file) return;
    
    try {
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('mapping', JSON.stringify(uploadData.mapping));
      formData.append('options', JSON.stringify(uploadData.options));
      
      await apiService.leads.import({
        leadPoolId: id,
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
      
      // Refresh leads
      fetchLeads();
      
      // Show success message
      alert('Leads uploaded successfully!');
    } catch (err) {
      console.error('Error uploading leads:', err);
      setError('Failed to upload leads. Please try again.');
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
      currentPage: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  const handleEditLeadPool = () => {
    navigate(`/lead-pools/${id}`);
  };

  const handleDeleteLeadPool = async () => {
    if (window.confirm('Are you sure you want to delete this lead pool? This action cannot be undone.')) {
      try {
        await apiService.leadPools.delete(id);
        navigate('/lead-pools');
      } catch (err) {
        console.error('Error deleting lead pool:', err);
        setError('Failed to delete lead pool. Please try again.');
      }
    }
  };

  const handleViewLead = (leadId) => {
    navigate(`/leads/${leadId}`);
  };

  const closeUploadModal = () => {
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
  };

  const handleSortChange = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (isLoading && !leadPool) {
    return (
      <div className="lead-pool-detail-container">
        <LoadingSpinner size="large" text="Loading lead pool details..." />
      </div>
    );
  }

  if (error && !leadPool) {
    return (
      <div className="lead-pool-detail-container">
        <div className="error-message">
          {error}
          <button className="dismiss-button" onClick={() => setError(null)}>×</button>
        </div>
        <button className="back-button" onClick={() => navigate('/lead-pools')}>
          Back to Lead Pools
        </button>
      </div>
    );
  }

  return (
    <div className="lead-pool-detail-container">
      <div className="page-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate('/lead-pools')}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
          <h1>{leadPool?.name || 'Lead Pool Details'}</h1>
        </div>
        <div className="header-actions">
          <button className="action-button edit-button" onClick={handleEditLeadPool}>
            <i className="fas fa-edit"></i> Edit
          </button>
          <button className="action-button upload-button" onClick={() => setShowUploadModal(true)}>
            <i className="fas fa-upload"></i> Upload Leads
          </button>
          <button className="action-button delete-button" onClick={handleDeleteLeadPool}>
            <i className="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button className="dismiss-button" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="lead-pool-info">
        <div className="info-card">
          <h3>Lead Pool Information</h3>
          <div className="info-row">
            <div className="info-label">Name:</div>
            <div className="info-value">{leadPool?.name}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Description:</div>
            <div className="info-value">{leadPool?.description || 'No description provided'}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Brand:</div>
            <div className="info-value">{leadPool?.brand}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Source:</div>
            <div className="info-value">{leadPool?.source}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Total Leads:</div>
            <div className="info-value">{pagination.totalLeads}</div>
          </div>
        </div>

        <div className="info-card">
          <h3>Criteria</h3>
          <div className="info-row">
            <div className="info-label">Age Range:</div>
            <div className="info-value">
              {leadPool?.criteria?.minAge && leadPool?.criteria?.maxAge
                ? `${leadPool.criteria.minAge} - ${leadPool.criteria.maxAge}`
                : 'Any age'}
            </div>
          </div>
          <div className="info-row">
            <div className="info-label">Location:</div>
            <div className="info-value">{leadPool?.criteria?.location || 'Any location'}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Income:</div>
            <div className="info-value">{leadPool?.criteria?.income || 'Any income'}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Credit Score:</div>
            <div className="info-value">{leadPool?.criteria?.creditScore || 'Any credit score'}</div>
          </div>
        </div>
      </div>

      <div className="leads-section">
        <div className="section-header">
          <h2>Leads</h2>
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
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="unqualified">Unqualified</option>
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
                <option value="referral">Referral</option>
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
          <div className="loading-spinner">Loading leads...</div>
        ) : leads.length > 0 ? (
          <>
            <div className="leads-table-container">
              <table className="leads-table">
                <thead>
                  <tr>
                    <th
                      className="sortable"
                      onClick={() => handleSortChange('first_name')}
                    >
                      <span>Name</span>
                      {sortField === 'first_name' && (
                        <span className={`sort-icon ${sortDirection}`}></span>
                      )}
                    </th>
                    <th>Contact</th>
                    <th
                      className="sortable"
                      onClick={() => handleSortChange('created_at')}
                    >
                      <span>Added</span>
                      {sortField === 'created_at' && (
                        <span className={`sort-icon ${sortDirection}`}></span>
                      )}
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSortChange('last_contacted_at')}
                    >
                      <span>Last Contact</span>
                      {sortField === 'last_contacted_at' && (
                        <span className={`sort-icon ${sortDirection}`}></span>
                      )}
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSortChange('lead_age')}
                    >
                      <span>Age (days)</span>
                      {sortField === 'lead_age' && (
                        <span className={`sort-icon ${sortDirection}`}></span>
                      )}
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSortChange('status')}
                    >
                      <span>Status</span>
                      {sortField === 'status' && (
                        <span className={`sort-icon ${sortDirection}`}></span>
                      )}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead.id}>
                      <td>{`${lead.firstName} ${lead.lastName}`}</td>
                      <td>{lead.email}</td>
                      <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                      <td>{new Date(lead.lastContactedAt).toLocaleDateString()}</td>
                      <td>{Math.floor((new Date() - new Date(lead.createdAt)) / (1000 * 60 * 60 * 24))}</td>
                      <td>
                        <span className={`status-badge ${lead.status}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="action-buttons">
                        <button 
                          className="action-button view-button"
                          onClick={() => handleViewLead(lead.id)}
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
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
            <p>No leads found in this lead pool.</p>
            <button className="upload-button" onClick={() => setShowUploadModal(true)}>
              Upload Leads
            </button>
          </div>
        )}
      </div>

      {/* Upload Leads Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Upload Leads to {leadPool?.name}</h2>
              <button className="close-button" onClick={closeUploadModal}>×</button>
            </div>
            <form onSubmit={handleUploadLeads}>
              <div className="form-group">
                <label htmlFor="file">CSV File</label>
                <input
                  type="file"
                  id="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  required
                />
                <p className="file-help">Upload a CSV file with lead information</p>
              </div>

              {filePreview && (
                <div className="file-preview">
                  <h3>File Preview</h3>
                  <pre>{filePreview}</pre>
                </div>
              )}

              {availableFields.length > 0 && (
                <div className="field-mapping">
                  <h3>Field Mapping</h3>
                  <p className="mapping-help">Map CSV columns to lead fields</p>
                  <div className="mapping-table">
                    <div className="mapping-header">
                      <div className="mapping-cell">CSV Column</div>
                      <div className="mapping-cell">Lead Field</div>
                    </div>
                    {availableFields.map(field => (
                      <div key={field} className="mapping-row">
                        <div className="mapping-cell">{field}</div>
                        <div className="mapping-cell">
                          <select
                            value={uploadData.mapping[field] || ''}
                            onChange={(e) => handleMappingChange(field, e.target.value)}
                          >
                            <option value="">-- Select Field --</option>
                            <option value="first_name">First Name</option>
                            <option value="last_name">Last Name</option>
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                            <option value="address">Address</option>
                            <option value="city">City</option>
                            <option value="state">State</option>
                            <option value="zip">ZIP</option>
                            <option value="age">Age</option>
                            <option value="income">Income</option>
                            <option value="credit_score">Credit Score</option>
                            <option value="notes">Notes</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                    Skip header row
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
                    Update existing leads
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-button" onClick={closeUploadModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Upload Leads
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadPoolDetail; 