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
      setLeadPools(response.data || []);
    } catch (err) {
      console.error('Error fetching lead pools:', err);
      setError('Failed to load lead pools. Please try again later.');
      setLeadPools([]); // Set empty array on error
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
      
      // Show success message
      alert('Leads uploaded successfully!');
      fetchLeadPools(); // Refresh the list to show updated lead counts
    } catch (err) {
      console.error('Error uploading leads:', err);
      setError('Failed to upload leads. Please try again.');
    }
  };

  const handleDeleteLeadPool = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead pool? This action cannot be undone.')) {
      try {
        await apiService.leadPools.delete(id);
        fetchLeadPools();
      } catch (err) {
        console.error('Error deleting lead pool:', err);
        setError('Failed to delete lead pool. Please try again.');
      }
    }
  };

  const openUploadModal = (pool) => {
    setSelectedPool(pool);
    setShowUploadModal(true);
  };

  const openCreateModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
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
    setSelectedPool(null);
  };

  const viewLeadPoolDetails = (id) => {
    navigate(`/lead-pools/${id}`);
  };

  if (isLoading) {
    return (
      <div className="lead-pools-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="lead-pools-container">
      <div className="page-header">
        <h1>Lead Pools</h1>
        <button className="create-button" onClick={openCreateModal}>
              Create Lead Pool
            </button>
          </div>

      {error && (
        <div className="error-message">
          {error}
          <button className="dismiss-button" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="lead-pools-table-container">
        {leadPools.length > 0 ? (
          <table className="lead-pools-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Lead Age</th>
                <th>Criteria</th>
                <th>Status</th>
                <th>Lead Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leadPools.map(pool => (
                <tr key={pool.id}>
                  <td>{pool.name}</td>
                  <td>{pool.description}</td>
                  <td>{pool.lead_age_min}-{pool.lead_age_max} days</td>
                  <td>
                    {pool.criteria && (
                      <ul className="criteria-list">
                        {Object.entries(pool.criteria).map(([key, value]) => (
                          <li key={key}>{key}: {value}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${pool.status.toLowerCase()}`}>
                      {pool.status}
                    </span>
                  </td>
                  <td>{pool.lead_count || 0}</td>
                  <td className="action-buttons">
                    <button 
                      className="action-button view-button"
                      onClick={() => viewLeadPoolDetails(pool.id)}
                      title="View Details"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button 
                      className="action-button upload-button"
                      onClick={() => openUploadModal(pool)}
                      title="Upload Leads"
                    >
                      <i className="fas fa-upload"></i>
                    </button>
                    <button 
                      className="action-button delete-button"
                      onClick={() => handleDeleteLeadPool(pool.id)}
                      title="Delete"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>No lead pools found. Create your first lead pool to get started.</p>
            </div>
        )}
            </div>

      {/* Create Lead Pool Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create Lead Pool</h2>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleCreateLeadPool}>
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
                <label htmlFor="brand">Brand</label>
                <select
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Brand</option>
                  {brands.map(brand => (
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
                  required
                >
                  <option value="">Select Source</option>
                  {sources.map(source => (
                    <option key={source.id} value={source.name}>{source.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-section">
                <h3>Criteria</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="minAge">Min Age</label>
                    <input
                      type="number"
                      id="minAge"
                      name="criteria.minAge"
                      value={formData.criteria.minAge}
                      onChange={handleInputChange}
                    />
            </div>
                  <div className="form-group">
                    <label htmlFor="maxAge">Max Age</label>
                    <input
                      type="number"
                      id="maxAge"
                      name="criteria.maxAge"
                      value={formData.criteria.maxAge}
                      onChange={handleInputChange}
                    />
              </div>
            </div>
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="criteria.location"
                    value={formData.criteria.location}
                    onChange={handleInputChange}
                    placeholder="e.g., California, New York"
                  />
          </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="income">Income</label>
                    <input
                      type="text"
                      id="income"
                      name="criteria.income"
                      value={formData.criteria.income}
                      onChange={handleInputChange}
                      placeholder="e.g., >50000"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="creditScore">Credit Score</label>
                      <input
                      type="text"
                      id="creditScore"
                      name="criteria.creditScore"
                      value={formData.criteria.creditScore}
                      onChange={handleInputChange}
                      placeholder="e.g., >650"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-button" onClick={closeModal}>
                  Cancel
              </button>
                <button type="submit" className="submit-button">
                  Create Lead Pool
              </button>
            </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Leads Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Upload Leads to {selectedPool?.name}</h2>
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

export default LeadPools;
