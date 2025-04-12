import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import apiService from '../services/apiService';
import './BrandSourceManagement.css';
import LoadingIcon from '../components/LoadingIcon';

// Utility function to get tenant ID from local storage
const getTenantId = () => {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  return currentUser.tenantId || 1;
};

const BrandSourceManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('brands'); // 'brands' or 'sources'
  const [brands, setBrands] = useState([]);
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'edit'
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch brands and sources on component mount
  useEffect(() => {
    fetchBrands();
    fetchSources();
  }, []);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchBrands = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching brands from API...');
      const response = await apiService.brands.getAll();
      console.log('Raw brands API response:', response);
      
      // Get brands used in campaigns for comparison
      try {
        const campaignsResponse = await apiService.campaigns.getAll();
        console.log('Campaigns response for comparison:', campaignsResponse);
        if (campaignsResponse && campaignsResponse.data) {
          const campaignBrands = [...new Set(campaignsResponse.data.map(campaign => campaign.brand))].filter(Boolean);
          console.log('Brands used in campaigns:', campaignBrands);
        }
      } catch (e) {
        console.error('Error fetching campaigns for brand comparison:', e);
      }
      
      // Transform the API response to match component's expected format
      const brandsData = Array.isArray(response.data) ? response.data.map(brand => ({
        id: brand.id || brand.name,
        name: brand.name,
        description: brand.description || '',
        logo: brand.logo || null,
        color: brand.color || '#007bff',
        lead_count: brand.lead_count || 0
      })) : [];
      
      console.log('Transformed brands data for UI:', brandsData);
      setBrands(brandsData);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError('Failed to load brands. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSources = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.sources.getAll();
      console.log('Sources response:', response);
      
      // Transform the API response to match component's expected format
      const sourcesData = Array.isArray(response.data) ? response.data.map(source => ({
        id: source.id || source.name,
        name: source.name,
        description: source.description || '',
        category: source.category || 'Other',
        cost_per_lead: source.cost_per_lead || 0,
        lead_count: source.lead_count || 0
      })) : [];
      
      setSources(sourcesData);
    } catch (err) {
      console.error('Error fetching sources:', err);
      setError('Failed to load sources. Please try again later.');
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

  const openCreateModal = () => {
    setModalType('create');
    setFormData({
      name: '',
      description: '',
      status: 'active'
    });
    setSelectedItem(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setModalType('edit');
    setFormData({
      name: item.name,
      description: item.description || '',
      status: item.status || 'active',
      logo: item.logo || '',
      color: item.color || '#007bff',
      category: item.category || 'Other',
      cost_per_lead: item.cost_per_lead || 0
    });
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      name: '',
      description: '',
      status: 'active'
    });
    setSelectedItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Add tenant_id to all requests
      const tenantId = getTenantId();
      console.log(`Using tenant ID: ${tenantId}`);
      
      if (activeTab === 'brands') {
        if (modalType === 'create') {
          // Create brand
          const brandData = {
            name: formData.name,
            description: formData.description,
            logo: formData.logo || null,
            color: formData.color || "#007bff",
            tenant_id: tenantId
          };
          
          console.log('Submitting brand data:', brandData);
          await apiService.brands.create(brandData);
          console.log(`Brand "${formData.name}" created successfully`);
          setSuccessMessage(`Brand "${formData.name}" created successfully`);
        } else {
          // Update brand
          const brandData = {
            description: formData.description,
            logo: formData.logo || null,
            color: formData.color || "#007bff",
            tenant_id: tenantId
          };
          
          console.log('Submitting brand update data:', brandData);
          await apiService.brands.update(selectedItem.name, brandData);
          console.log(`Brand "${selectedItem.name}" updated successfully`);
          setSuccessMessage(`Brand "${selectedItem.name}" updated successfully`);
        }
        fetchBrands();
      } else {
        if (modalType === 'create') {
          // Create source
          const sourceData = {
            name: formData.name,
            description: formData.description,
            category: formData.category || 'Other',
            cost_per_lead: parseFloat(formData.cost_per_lead) || 0,
            tenant_id: tenantId
          };
          
          console.log('Submitting source data:', sourceData);
          await apiService.sources.create(sourceData);
          console.log(`Source "${formData.name}" created successfully`);
          setSuccessMessage(`Source "${formData.name}" created successfully`);
        } else {
          // Update source
          const sourceData = {
            description: formData.description,
            category: formData.category || 'Other',
            cost_per_lead: parseFloat(formData.cost_per_lead) || 0,
            tenant_id: tenantId
          };
          
          console.log('Submitting source update data:', sourceData);
          await apiService.sources.update(selectedItem.name, sourceData);
          console.log(`Source "${selectedItem.name}" updated successfully`);
          setSuccessMessage(`Source "${selectedItem.name}" updated successfully`);
        }
        fetchSources();
      }
      
      closeModal();
    } catch (err) {
      console.error(`Error ${modalType}ing ${activeTab.slice(0, -1)}:`, err);
      
      // Extract more specific error information for user
      let errorMessage = '';
      
      if (err.status === 400) {
        errorMessage = `Invalid request: ${err.message || 'Please check your input data.'}`;
      } else if (err.status === 401) {
        errorMessage = 'Authentication error: Please log in again.';
      } else if (err.status === 403) {
        errorMessage = 'Permission denied: You do not have access to perform this action.';
      } else if (err.status === 404) {
        errorMessage = `${activeTab.slice(0, -1)} not found.`;
      } else {
        errorMessage = err.message || `Failed to ${modalType} ${activeTab.slice(0, -1)}. Please try again.`;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      try {
        const tenantId = getTenantId();
        console.log(`Using tenant ID for delete: ${tenantId}`);
        
        if (activeTab === 'brands') {
          console.log(`Deleting brand "${item.name}"`);
          await apiService.brands.delete(item.name);
          console.log(`Brand "${item.name}" deleted successfully`);
          setSuccessMessage(`Brand "${item.name}" deleted successfully`);
          fetchBrands();
        } else {
          console.log(`Deleting source "${item.name}"`);
          await apiService.sources.delete(item.name);
          console.log(`Source "${item.name}" deleted successfully`);
          setSuccessMessage(`Source "${item.name}" deleted successfully`);
          fetchSources();
        }
      } catch (err) {
        console.error(`Error deleting ${activeTab.slice(0, -1)}:`, err);
        
        // Extract more specific error information for user
        let errorMessage = '';
        
        if (err.status === 400) {
          errorMessage = `Invalid request: ${err.message || 'Please check your input data.'}`;
        } else if (err.status === 401) {
          errorMessage = 'Authentication error: Please log in again.';
        } else if (err.status === 403) {
          errorMessage = 'Permission denied: You do not have access to perform this action.';
        } else if (err.status === 404) {
          errorMessage = `${activeTab.slice(0, -1)} not found.`;
        } else if (err.status === 409) {
          errorMessage = `This ${activeTab.slice(0, -1)} is in use and cannot be deleted.`;
        } else {
          errorMessage = err.message || `Failed to delete ${activeTab.slice(0, -1)}. It may be in use by one or more leads.`;
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderBackButton = () => (
    <button 
      className="button-secondary" 
      onClick={() => navigate('/settings')}
      style={{ marginBottom: 'var(--space-md)' }}
    >
      Back to Settings
    </button>
  );

  return (
    <LoadingIcon text="Loading brand sources..." isLoading={isLoading}>
      <div className="settings-page">
        {renderBackButton()}
        
        <div className="feature-card">
          <div className="feature-title">
            {activeTab === 'brands' ? 'Brand Management' : 'Source Management'}
          </div>
          <div className="feature-description">
            {activeTab === 'brands' 
              ? 'Create and manage brands for your campaigns.' 
              : 'Create and manage lead sources for your campaigns.'}
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button className="dismiss-button" onClick={() => setError(null)}>×</button>
          </div>
        )}

        {successMessage && (
          <div className="success-message">
            {successMessage}
            <button className="dismiss-button" onClick={() => setSuccessMessage(null)}>×</button>
          </div>
        )}

        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'brands' ? 'active' : ''}`}
            onClick={() => setActiveTab('brands')}
          >
            Brands
          </button>
          <button 
            className={`tab-button ${activeTab === 'sources' ? 'active' : ''}`}
            onClick={() => setActiveTab('sources')}
          >
            Sources
          </button>
        </div>

        <div className="action-bar">
          <button className="button-blue" onClick={openCreateModal}>
            <PlusOutlined /> Create {activeTab.slice(0, -1)}
          </button>
        </div>

        <div className="page-container">
          <div className="items-table-container">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  {activeTab === 'brands' ? (
                    <>
                      <th>Logo</th>
                      <th>Color</th>
                    </>
                  ) : (
                    <>
                      <th>Category</th>
                      <th>Cost per Lead</th>
                    </>
                  )}
                  <th>Lead Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'brands' ? brands : sources).map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.description || '-'}</td>
                    {activeTab === 'brands' ? (
                      <>
                        <td>
                          {item.logo ? (
                            <img 
                              src={item.logo} 
                              alt={`${item.name} logo`} 
                              className="brand-logo" 
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/50?text=Logo';
                              }}
                            />
                          ) : (
                            <span className="no-logo">No logo</span>
                          )}
                        </td>
                        <td>
                          <div className="color-preview" style={{ backgroundColor: item.color || '#007bff' }}></div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{item.category || 'Other'}</td>
                        <td>${item.cost_per_lead || 0}</td>
                      </>
                    )}
                    <td>{item.lead_count || 0}</td>
                    <td className="action-buttons">
                      <button 
                        className="action-button edit-button"
                        onClick={() => openEditModal(item)}
                        title="Edit"
                      >
                        <EditOutlined />
                      </button>
                      <button 
                        className="action-button delete-button"
                        onClick={() => handleDelete(item)}
                        title="Delete"
                      >
                        <DeleteOutlined />
                      </button>
                    </td>
                  </tr>
                ))}
                {(activeTab === 'brands' ? brands : sources).length === 0 && (
                  <tr>
                    <td colSpan={activeTab === 'brands' ? 7 : 7} className="empty-state">
                      No {activeTab} found. Create your first {activeTab.slice(0, -1)} to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for creating/editing brands or sources */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{modalType === 'create' ? 'Create' : 'Edit'} {activeTab.slice(0, -1)}</h2>
                <button className="close-button" onClick={closeModal}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={modalType === 'edit'}
                    className={modalType === 'create' ? "form-control" : "form-control disabled"}
                    placeholder="Enter name"
                  />
                  {modalType === 'create' && <small className="form-text text-muted">Name cannot be changed after creation</small>}
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="form-control"
                    placeholder="Enter description (optional)"
                  />
                </div>
                
                {activeTab === 'brands' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="logo">Logo URL</label>
                      <input
                        type="text"
                        id="logo"
                        name="logo"
                        value={formData.logo || ''}
                        onChange={handleInputChange}
                        placeholder="https://example.com/logo.png"
                        className="form-control"
                      />
                      <small className="form-text text-muted">Leave empty if no logo is available</small>
                    </div>
                    <div className="form-group">
                      <label htmlFor="color">Brand Color</label>
                      <div className="color-picker-container">
                        <input
                          type="color"
                          id="color"
                          name="color"
                          value={formData.color || '#007bff'}
                          onChange={handleInputChange}
                          className="form-control color-input"
                        />
                        <span className="color-value">{formData.color || '#007bff'}</span>
                      </div>
                    </div>
                  </>
                )}
                
                {activeTab === 'sources' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="category">Category</label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category || 'Other'}
                        onChange={handleInputChange}
                        className="form-control"
                      >
                        <option value="Other">Other</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Email">Email</option>
                        <option value="Referral">Referral</option>
                        <option value="Website">Website</option>
                        <option value="Call Center">Call Center</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="cost_per_lead">Cost per Lead ($)</label>
                      <input
                        type="number"
                        id="cost_per_lead"
                        name="cost_per_lead"
                        value={formData.cost_per_lead || 0}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="form-control"
                      />
                    </div>
                  </>
                )}
                
                <div className="modal-footer">
                  <button type="button" className="cancel-button" onClick={closeModal}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : modalType === 'create' ? `Create ${activeTab.slice(0, -1)}` : `Update ${activeTab.slice(0, -1)}`}
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

export default BrandSourceManagement; 