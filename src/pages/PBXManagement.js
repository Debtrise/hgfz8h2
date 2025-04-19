import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './PBXManagement.css';
import LoadingIcon from '../components/LoadingIcon';

const PBXManagement = () => {
  const navigate = useNavigate();
  const [extensions, setExtensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [currentExtension, setCurrentExtension] = useState(null);
  const [formData, setFormData] = useState({
    extension: '',
    name: '',
    password: '',
  });

  // Fetch extensions on component mount
  useEffect(() => {
    fetchExtensions();
  }, []);

  // Fetch all extensions
  const fetchExtensions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.pbx.extensions.getAll();
      // Ensure we have an array of extensions
      const extensionsData = response?.data?.extensions || response?.data || [];
      setExtensions(Array.isArray(extensionsData) ? extensionsData : []);
    } catch (err) {
      console.error('Error fetching extensions:', err);
      setError('Failed to load extensions. Please try again later.');
      setExtensions([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open modal for creating a new extension
  const handleCreateExtension = () => {
    setCurrentExtension(null);
    setFormData({
      extension: '',
      name: '',
      password: '',
    });
    setShowExtensionModal(true);
  };

  // Open modal for editing an existing extension
  const handleEditExtension = (extension) => {
    setCurrentExtension(extension);
    setFormData({
      extension: extension.extension,
      name: extension.name,
      password: '', // Don't populate password for security
    });
    setShowExtensionModal(true);
  };

  // Handle extension form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (currentExtension) {
        // Update existing extension
        await apiService.pbx.extensions.update(currentExtension.id, formData);
      } else {
        // Create new extension
        await apiService.pbx.extensions.create(formData);
      }
      
      // Refresh extension list
      await fetchExtensions();
      setShowExtensionModal(false);
    } catch (err) {
      console.error('Error saving extension:', err);
      setError(err.response?.data?.message || 'Failed to save extension. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle extension deletion
  const handleDeleteExtension = async (extensionId) => {
    if (!window.confirm('Are you sure you want to delete this extension?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiService.pbx.extensions.delete(extensionId);
      await fetchExtensions();
    } catch (err) {
      console.error('Error deleting extension:', err);
      setError('Failed to delete extension. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render extension modal
  const renderExtensionModal = () => {
    if (!showExtensionModal) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>{currentExtension ? 'Edit Extension' : 'Create New Extension'}</h2>
            <button 
              className="close-button"
              onClick={() => setShowExtensionModal(false)}
            >
              &times;
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="extension-form">
            <div className="form-group">
              <label htmlFor="extension">Extension Number</label>
              <input
                type="text"
                id="extension"
                name="extension"
                value={formData.extension}
                onChange={handleInputChange}
                required
                pattern="[0-9]+"
                title="Extension must contain only numbers"
              />
            </div>
            
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
              <label htmlFor="password">
                {currentExtension ? 'Password (leave blank to keep current)' : 'Password'}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required={!currentExtension}
                minLength={6}
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setShowExtensionModal(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Saving...' : currentExtension ? 'Update Extension' : 'Create Extension'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <LoadingIcon text="Loading extensions..." isLoading={loading}>
      <div className="pbx-management-container">
        <div className="page-header">
          <h1>PBX Extensions Management</h1>
          <button 
            className="create-button"
            onClick={handleCreateExtension}
          >
            Create New Extension
          </button>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
            <button 
              className="dismiss-button"
              onClick={() => setError(null)}
            >
              &times;
            </button>
          </div>
        )}
        
        <div className="extensions-table-container">
          <table className="extensions-table">
            <thead>
              <tr>
                <th>Extension</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {extensions.length > 0 ? (
                extensions.map(extension => (
                  <tr key={extension.id}>
                    <td>{extension.extension}</td>
                    <td>{extension.name}</td>
                    <td className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => handleEditExtension(extension)}
                        title="Edit Extension"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteExtension(extension.id)}
                        title="Delete Extension"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-data">
                    No extensions found. Create a new extension to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {renderExtensionModal()}
      </div>
    </LoadingIcon>
  );
};

export default PBXManagement; 