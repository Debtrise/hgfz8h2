import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './DIDPools.css';
import LoadingIcon from '../components/LoadingIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faSearch, 
  faTimes, 
  faEye, 
  faEdit, 
  faTrash, 
  faDatabase, 
  faBuilding, 
  faGlobe, 
  faCalendarAlt,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

const DIDPools = () => {
  const navigate = useNavigate();
  const [didPools, setDidPools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    source: '',
    status: 'active'
  });
  
  // State for brands and sources from API
  const [brands, setBrands] = useState([]);
  const [sources, setSources] = useState([]);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');

  // Fetch DID pools, brands, and sources on component mount
  useEffect(() => {
    fetchDidPools();
    fetchBrands();
    fetchSources();
  }, []);

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

  const fetchDidPools = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.didPools.getAll();
      
      if (response && response.data) {
        const pools = Array.isArray(response.data) ? response.data : [];
        
        // Fetch detailed information for each pool to get accurate data
        const poolsWithDetails = await Promise.all(
          pools.map(async (pool) => {
            try {
              const poolDetails = await apiService.didPools.getById(pool.id);
              return {
                ...pool,
                brand: poolDetails.data?.brand || pool.brand || 'N/A',
                source: poolDetails.data?.source || pool.source || 'N/A',
                totalDids: poolDetails.data?.dids?.length || 0
              };
            } catch (err) {
              console.error(`Error fetching details for pool ${pool.id}:`, err);
              return {
                ...pool,
                brand: pool.brand || 'N/A',
                source: pool.source || 'N/A',
                totalDids: 0
              };
            }
          })
        );
        
        setDidPools(poolsWithDetails);
      } else {
        setError('Failed to load DID pools. Invalid response format.');
        setDidPools([]);
      }
    } catch (err) {
      console.error('Error fetching DID pools:', err);
      setError('Failed to load DID pools. Please try again later.');
      setDidPools([]);
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

  const handleCreateDidPool = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await apiService.didPools.create(formData);
      
      if (response && response.data) {
        setShowCreateModal(false);
        setFormData({
          name: '',
          description: '',
          brand: '',
          source: '',
          status: 'active'
        });
        fetchDidPools();
      } else {
        setError('Failed to create DID pool. Invalid response format.');
      }
    } catch (err) {
      console.error('Error creating DID pool:', err);
      setError('Failed to create DID pool. Please try again.');
    }
  };

  const handleDeleteDidPool = async (id) => {
    if (window.confirm('Are you sure you want to delete this DID pool? This action cannot be undone.')) {
      setError(null);
      try {
        const response = await apiService.didPools.delete(id);
        
        if (response) {
          fetchDidPools();
        } else {
          setError('Failed to delete DID pool. Invalid response format.');
        }
      } catch (err) {
        console.error('Error deleting DID pool:', err);
        setError('Failed to delete DID pool. Please try again.');
      }
    }
  };

  const viewDidPoolDetails = (id) => {
    navigate(`/did-pools/${id}`);
  };
  
  // Filter and search functionality
  const filteredPools = didPools.filter(pool => {
    // Apply search filter
    const matchesSearch = 
      pool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pool.description && pool.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pool.brand && pool.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pool.source && pool.source.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply status filter
    const matchesStatus = statusFilter === 'all' || pool.status?.toLowerCase() === statusFilter.toLowerCase();
    
    // Apply brand filter
    const matchesBrand = brandFilter === 'all' || pool.brand === brandFilter;
    
    return matchesSearch && matchesStatus && matchesBrand;
  });
  
  // Get unique brands for filter dropdown
  const uniqueBrands = [...new Set(didPools.map(pool => pool.brand).filter(Boolean))];

  return (
    <LoadingIcon text="Loading DID pools..." isLoading={isLoading}>
      <div className="page-container">
        <div className="content-container">
          <div className="content-header">
            <h1 className="page-title">DID Pools</h1>
            <div className="header-actions">
              <button 
                className="button-primary"
                onClick={() => setShowCreateModal(true)}
              >
                <FontAwesomeIcon icon={faPlus} />
                Create DID Pool
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
              <button className="dismiss-button" onClick={() => setError(null)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          )}

          <div className="content-body">
            {/* Search and Filter Section */}
            <div className="search-filter-container">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search pools by name, description, brand, or source..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button 
                    className="clear-search"
                    onClick={() => setSearchTerm('')}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>
              
              <div className="filter-container">
                <div className="filter-group">
                  <label htmlFor="statusFilter">Status</label>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label htmlFor="brandFilter">Brand</label>
                  <select
                    id="brandFilter"
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Brands</option>
                    {uniqueBrands.map((brand, index) => (
                      <option key={index} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Results Summary */}
            <div className="results-summary">
              <FontAwesomeIcon icon={faDatabase} />
              <p>
                Showing <strong>{filteredPools.length}</strong> of <strong>{didPools.length}</strong> DID pools
                {searchTerm && ` matching "${searchTerm}"`}
                {statusFilter !== 'all' && ` with status "${statusFilter}"`}
                {brandFilter !== 'all' && ` from brand "${brandFilter}"`}
              </p>
            </div>

            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading DID pools...</p>
              </div>
            ) : filteredPools.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Brand</th>
                      <th>Source</th>
                      <th>Status</th>
                      <th>Total DIDs</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPools.map(pool => (
                      <tr key={pool.id}>
                        <td>
                          <div className="pool-name-cell">
                            <FontAwesomeIcon icon={faDatabase} />
                            <span className="pool-name">{pool.name}</span>
                          </div>
                        </td>
                        <td>{pool.description || 'No description'}</td>
                        <td>
                          <div className="brand-cell">
                            <FontAwesomeIcon icon={faBuilding} />
                            <span className="brand-name">{pool.brand || 'N/A'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="source-cell">
                            <FontAwesomeIcon icon={faGlobe} />
                            <span className="source-name">{pool.source || 'N/A'}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${pool.status?.toLowerCase()}`}>
                            {pool.status || 'Unknown'}
                          </span>
                        </td>
                        <td>
                          <div className="dids-count">
                            <span className="dids-count-value">{pool.totalDids || 0}</span>
                          </div>
                        </td>
                        <td>
                          <div className="date-cell">
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            <span className="date-value">
                              {pool.createdAt ? new Date(pool.createdAt).toLocaleString() : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="action-buttons">
                          <button 
                            className="action-button view-button"
                            onClick={() => viewDidPoolDetails(pool.id)}
                            title="View Details"
                          >
                            <FontAwesomeIcon icon={faEye} />
                            View
                          </button>
                          <button 
                            className="action-button edit-button"
                            onClick={() => navigate(`/did-pools/${pool.id}/edit`)}
                            title="Edit Pool"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                            Edit
                          </button>
                          <button 
                            className="action-button delete-button"
                            onClick={() => handleDeleteDidPool(pool.id)}
                            title="Delete Pool"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <FontAwesomeIcon icon={faDatabase} size="3x" />
                <p>No DID pools found matching your criteria.</p>
                {searchTerm || statusFilter !== 'all' || brandFilter !== 'all' ? (
                  <button 
                    className="button-secondary"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setBrandFilter('all');
                    }}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    Clear Filters
                  </button>
                ) : (
                  <button 
                    className="button-primary"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Create DID Pool
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Create DID Pool Modal */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Create DID Pool</h2>
                <button 
                  className="close-button"
                  onClick={() => setShowCreateModal(false)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <form onSubmit={handleCreateDidPool}>
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter pool name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter pool description"
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
                  >
                    <option value="">Select a brand</option>
                    {brands.map((brand) => (
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
                  >
                    <option value="">Select a source</option>
                    {sources.map((source) => (
                      <option key={source.id} value={source.name}>{source.name}</option>
                    ))}
                  </select>
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
                  <button 
                    type="button" 
                    className="button-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="button-primary"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Create Pool
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

export default DIDPools;
