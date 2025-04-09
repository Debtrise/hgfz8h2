import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import apiService from '../services/apiService';
import './BrandSourceManagement.css';
import LoadingIcon from '../components/LoadingIcon';

const BrandSourceManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('brands'); // 'brands' or 'sources'
  const [brands, setBrands] = useState([]);
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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

  const fetchBrands = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.brands.getAll();
      setBrands(response.data || []);
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
      setSources(response.data || []);
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
    
    try {
      if (activeTab === 'brands') {
        if (modalType === 'create') {
          // Create brand
          await apiService.brands.create({
            name: formData.name,
            description: formData.description,
            logo: formData.logo || null,
            color: formData.color || "#007bff"
          });
        } else {
          // Update brand
          await apiService.brands.update(selectedItem.name, {
            description: formData.description,
            logo: formData.logo || null,
            color: formData.color || "#007bff"
          });
        }
        fetchBrands();
      } else {
        if (modalType === 'create') {
          // Create source
          await apiService.sources.create({
            name: formData.name,
            description: formData.description,
            category: formData.category || 'Other',
            cost_per_lead: formData.cost_per_lead || 0
          });
        } else {
          // Update source
          await apiService.sources.update(selectedItem.name, {
            description: formData.description,
            category: formData.category || 'Other',
            cost_per_lead: formData.cost_per_lead || 0
          });
        }
        fetchSources();
      }
      
      closeModal();
    } catch (err) {
      console.error(`Error ${modalType}ing ${activeTab.slice(0, -1)}:`, err);
      setError(`Failed to ${modalType} ${activeTab.slice(0, -1)}. Please try again.`);
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) {
      try {
        if (activeTab === 'brands') {
          await apiService.brands.delete(item.name);
          fetchBrands();
        } else {
          await apiService.sources.delete(item.name);
          fetchSources();
        }
      } catch (err) {
        console.error(`Error deleting ${activeTab.slice(0, -1)}:`, err);
        setError(`Failed to delete ${activeTab.slice(0, -1)}. Please try again.`);
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
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="color">Brand Color</label>
                      <input
                        type="color"
                        id="color"
                        name="color"
                        value={formData.color || '#007bff'}
                        onChange={handleInputChange}
                      />
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
                      />
                    </div>
                  </>
                )}
                
                <div className="modal-footer">
                  <button type="button" className="cancel-button" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-button">
                    {modalType === 'create' ? 'Create' : 'Update'} {activeTab.slice(0, -1)}
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