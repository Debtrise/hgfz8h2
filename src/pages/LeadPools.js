import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './LeadPools.css';

const LeadPools = () => {
  const navigate = useNavigate();
  const [leadPools, setLeadPools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPool, setSelectedPool] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    source: '',
    criteria: {
      minAge: '',
      maxAge: '',
      location: '',
      income: '',
      creditScore: ''
    }
  });
  const [uploadData, setUploadData] = useState({
    file: null,
    mapping: {},
    options: {
      skipHeader: true,
      updateExisting: false
    }
  });
  const [brands, setBrands] = useState([]);
  const [sources, setSources] = useState([]);
  const [availableFields, setAvailableFields] = useState([]);
  const [filePreview, setFilePreview] = useState(null);
  const [stats, setStats] = useState({
    totalLeads: 0,
    activePools: 0,
    averageLeadsPerPool: 0
  });

  // Fetch lead pools, brands, and sources on component mount
  useEffect(() => {
    fetchLeadPools();
    fetchBrands();
    fetchSources();
  }, []);

  const fetchLeadPools = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.leadPools.getAll();
      const pools = response.data || [];
      setLeadPools(pools);
      
      // Calculate stats
      const totalLeads = pools.reduce((sum, pool) => sum + (pool.lead_count || 0), 0);
      const activePools = pools.filter(pool => pool.status === 'active').length;
      setStats({
        totalLeads,
        activePools,
        averageLeadsPerPool: pools.length ? Math.round(totalLeads / pools.length) : 0
      });
    } catch (err) {
      console.error('Error fetching lead pools:', err);
      setError('Failed to load lead pools. Please try again later.');
      setLeadPools([]);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
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

  const handleCreateLeadPool = async (e) => {
    e.preventDefault();
    try {
      await apiService.leadPools.create({
        name: formData.name,
        description: formData.description,
        leadAgeMin: parseInt(formData.criteria.minAge) || 0,
        leadAgeMax: parseInt(formData.criteria.maxAge) || 30,
        criteria: {
          location: formData.criteria.location,
          income: formData.criteria.income,
          creditScore: formData.criteria.creditScore
        },
        status: 'active'
      });
      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        criteria: {
          minAge: '',
          maxAge: '',
          location: '',
          income: '',
          creditScore: ''
        }
      });
      fetchLeadPools();
    } catch (err) {
      console.error('Error creating lead pool:', err);
      setError('Failed to create lead pool. Please try again.');
    }
  };

  const handleUploadLeads = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !selectedPool) return;
    
    try {
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('mapping', JSON.stringify(uploadData.mapping));
      formData.append('options', JSON.stringify(uploadData.options));
      
      await apiService.leadPools.importLeads(selectedPool.id, formData);
      
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
      setSelectedPool(null);
      fetchLeadPools();
    } catch (err) {
      console.error('Error uploading leads:', err);
      setError('Failed to upload leads. Please try again.');
    }
  };

  const handleDeleteLeadPool = async (pool) => {
    if (!window.confirm(`Are you sure you want to delete ${pool.name}?`)) return;
    
    try {
      await apiService.leadPools.delete(pool.id);
      fetchLeadPools();
    } catch (err) {
      console.error('Error deleting lead pool:', err);
      setError('Failed to delete lead pool. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="lead-pools-container">
      <div className="lead-pools-header">
        <h1>Lead Pools</h1>
        <button 
          className="action-button primary-button"
          onClick={() => setShowModal(true)}
        >
          Create Lead Pool
        </button>
      </div>

      <div className="lead-pools-stats">
        <div className="stat-card">
          <h3>Total Leads</h3>
          <div className="value">{stats.totalLeads.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <h3>Active Pools</h3>
          <div className="value">{stats.activePools}</div>
        </div>
        <div className="stat-card">
          <h3>Avg. Leads per Pool</h3>
          <div className="value">{stats.averageLeadsPerPool.toLocaleString()}</div>
        </div>
      </div>

      <div className="lead-pools-grid">
        {leadPools.map(pool => (
          <div key={pool.id} className="lead-pool-card">
            <h3>{pool.name}</h3>
            <p>{pool.description || 'No description provided.'}</p>
            
            <div className="lead-pool-meta">
              <div className="meta-item">
                {pool.lead_count?.toLocaleString() || 0} leads
              </div>
              <div className="meta-item">
                Created {formatDate(pool.created_at)}
              </div>
              <div className="meta-item">
                Age {pool.lead_age_min}-{pool.lead_age_max} days
              </div>
            </div>
            
            <div className="lead-pool-actions">
              <button 
                className="action-button secondary-button"
                onClick={() => navigate(`/lead-pools/${pool.id}`)}
              >
                View Details
              </button>
              <button 
                className="action-button secondary-button"
                onClick={() => {
                  setSelectedPool(pool);
                  setShowUploadModal(true);
                }}
              >
                Import Leads
              </button>
              <button 
                className="action-button danger-button"
                onClick={() => handleDeleteLeadPool(pool)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Lead Pool Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Lead Pool</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>
                <i className="fas fa-times" />
              </button>
            </div>
            
            <form onSubmit={handleCreateLeadPool}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter lead pool name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Describe the purpose of this lead pool"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="criteria.minAge">Minimum Lead Age (days)</label>
                <input
                  type="number"
                  id="criteria.minAge"
                  name="criteria.minAge"
                  className="form-control"
                  value={formData.criteria.minAge}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="e.g., 0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="criteria.maxAge">Maximum Lead Age (days)</label>
                <input
                  type="number"
                  id="criteria.maxAge"
                  name="criteria.maxAge"
                  className="form-control"
                  value={formData.criteria.maxAge}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="e.g., 30"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="criteria.location">Location</label>
                <input
                  type="text"
                  id="criteria.location"
                  name="criteria.location"
                  className="form-control"
                  value={formData.criteria.location}
                  onChange={handleInputChange}
                  placeholder="e.g., California, New York"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="criteria.income">Income Range</label>
                <input
                  type="text"
                  id="criteria.income"
                  name="criteria.income"
                  className="form-control"
                  value={formData.criteria.income}
                  onChange={handleInputChange}
                  placeholder="e.g., $50,000-$100,000"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="criteria.creditScore">Credit Score Range</label>
                <input
                  type="text"
                  id="criteria.creditScore"
                  name="criteria.creditScore"
                  className="form-control"
                  value={formData.criteria.creditScore}
                  onChange={handleInputChange}
                  placeholder="e.g., 650-750"
                />
              </div>
              
              <div className="lead-pool-actions">
                <button 
                  type="button" 
                  className="action-button secondary-button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="action-button primary-button"
                >
                  Create Lead Pool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Leads Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Import Leads to {selectedPool?.name}</h2>
              <button className="close-button" onClick={() => setShowUploadModal(false)}>
                <i className="fas fa-times" />
              </button>
            </div>
            
            <form onSubmit={handleUploadLeads}>
              <div className="form-group">
                <label htmlFor="file">CSV File</label>
                <input
                  type="file"
                  id="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="form-control"
                  required
                />
                <small style={{ color: '#666', marginTop: '0.5rem', display: 'block' }}>
                  Upload a CSV file containing lead information
                </small>
              </div>
              
              {filePreview && (
                <div className="form-group">
                  <label>File Preview</label>
                  <pre className="form-control" style={{ maxHeight: '200px', overflow: 'auto' }}>{filePreview}</pre>
                </div>
              )}
              
              {availableFields.length > 0 && (
                <div className="form-group">
                  <label>Field Mapping</label>
                  <small style={{ color: '#666', marginTop: '0.5rem', display: 'block', marginBottom: '1rem' }}>
                    Map CSV columns to lead fields
                  </small>
                  <div className="mapping-table">
                    <div className="mapping-header">
                      <div className="mapping-cell">CSV Header</div>
                      <div className="mapping-cell">Lead Field</div>
                    </div>
                    {availableFields.map(header => (
                      <div key={header} className="mapping-row">
                        <div className="mapping-cell">{header}</div>
                        <div className="mapping-cell">
                          <select
                            value={uploadData.mapping[header] || ''}
                            onChange={e => handleMappingChange(header, e.target.value)}
                            className="form-control"
                          >
                            <option value="">Select Field</option>
                            <option value="phone">Phone</option>
                            <option value="first_name">First Name</option>
                            <option value="last_name">Last Name</option>
                            <option value="email">Email</option>
                            <option value="lead_age">Lead Age</option>
                            <option value="brand">Brand</option>
                            <option value="source">Source</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="form-group">
                <label className="option-group">
                  <input
                    type="checkbox"
                    name="skipHeader"
                    checked={uploadData.options.skipHeader}
                    onChange={handleOptionChange}
                  />
                  Skip Header Row
                </label>
              </div>
              
              <div className="form-group">
                <label className="option-group">
                  <input
                    type="checkbox"
                    name="updateExisting"
                    checked={uploadData.options.updateExisting}
                    onChange={handleOptionChange}
                  />
                  Update Existing Leads
                </label>
              </div>
              
              <div className="lead-pool-actions">
                <button 
                  type="button" 
                  className="action-button secondary-button"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="action-button primary-button"
                >
                  Import Leads
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadPools;
