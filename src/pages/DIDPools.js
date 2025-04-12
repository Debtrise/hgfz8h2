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
  faSpinner,
  faPhone,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';

// Import api instance for debugging
import { api } from '../services/apiService';

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
  const [sortOption, setSortOption] = useState('name_asc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch DID pools, brands, and sources on component mount
  useEffect(() => {
    fetchDidPools();
    fetchBrands();
    fetchSources();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, brandFilter, sortOption]);

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
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        brand: brandFilter !== 'all' ? brandFilter : undefined,
        sort: sortOption
      };
      
      console.log('Fetching DID pools with params:', params);
      const response = await apiService.didPools.getAll(params);
      console.log('Raw DID pools response:', response);
      
      // Check if response exists and has data
      if (!response) {
        console.warn('No response received from API');
        setError('No response received from server');
        return;
      }

      // Log the URL and response to debug the API connection
      console.log('API URL used:', api?.defaults?.baseURL || 'Unknown baseURL');
      console.log('Full response object:', response);

      // Handle different response formats
      let pools = [];
      
      // Log the raw response to inspect the data structure
      console.log('Raw DID pools response object:', JSON.stringify(response));
      
      if (Array.isArray(response)) {
        console.log('Response is an array');
        pools = response;
      } else if (response.data) {
        console.log('Response has data property:', response.data);
        if (Array.isArray(response.data)) {
          console.log('Response.data is an array');
          pools = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          console.log('Response.data.data is an array');
          pools = response.data.data;
        } else {
          console.log('Response.data is not an array and does not have data array property');
          // Try to find any array in the response
          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              console.log(`Found array in response.data.${key}`);
              pools = response.data[key];
              break;
            }
          }
        }
      }

      console.log('Extracted pools:', pools);
      
      if (pools.length === 0) {
        console.log('No pools found');
        setDidPools([]);
        setTotalItems(0);
        setTotalPages(1);
        return;
      }

      // Normalize the pool data to handle both snake_case and camelCase
      const normalizedPools = pools.map(pool => ({
        id: pool.id,
        name: pool.name || '[Unnamed Pool]',
        description: pool.description || '',
        status: pool.status || 'active',
        createdAt: pool.created_at || pool.createdAt || new Date().toISOString(),
        brand: pool.brand || 'N/A',
        source: pool.source || 'N/A',
        totalDids: pool.did_count || pool.didCount || 0
      }));

      console.log('Normalized pools:', normalizedPools);
      setDidPools(normalizedPools);
      setTotalItems(normalizedPools.length);
      setTotalPages(Math.ceil(normalizedPools.length / itemsPerPage));
    } catch (err) {
      console.error('Error fetching DID pools:', err);
      // Add more detailed error logging
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        } : 'No response'
      });
      setError('Failed to load DID pools. Please try again later. Error: ' + err.message);
      setDidPools([]);
      setTotalItems(0);
      setTotalPages(1);
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

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPools.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle sort change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  const handleToggleActive = async (id) => {
    setError(null);
    try {
      const response = await apiService.didPools.toggleActive(id);
      
      if (response) {
        fetchDidPools();
      } else {
        setError('Failed to toggle status. Invalid response format.');
      }
    } catch (err) {
      console.error('Error toggling status:', err);
      setError('Failed to toggle status. Please try again.');
    }
  };

  return (
    <LoadingIcon text="Loading DID pools..." isLoading={isLoading}>
      <div className="page-container">
        <div className="content-container">
          <div className="content-header">
            <div className="header-left">
              <h1 className="page-title">DID Pools</h1>
            </div>
            <div className="header-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/dids')}
              >
                <FontAwesomeIcon icon={faPhone} className="icon-left" />
                Manage DIDs
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                <FontAwesomeIcon icon={faPlus} className="icon-left" />
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
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page when search changes
                  }}
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
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1); // Reset to first page when filter changes
                    }}
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
                    onChange={(e) => {
                      setBrandFilter(e.target.value);
                      setCurrentPage(1); // Reset to first page when filter changes
                    }}
                    className="filter-select"
                  >
                    <option value="all">All Brands</option>
                    {uniqueBrands.map((brand, index) => (
                      <option key={index} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-group">
                  <label htmlFor="sortOption">Sort By</label>
                  <select
                    id="sortOption"
                    value={sortOption}
                    onChange={handleSortChange}
                    className="filter-select"
                  >
                    <option value="name_asc">Name (A-Z)</option>
                    <option value="name_desc">Name (Z-A)</option>
                    <option value="date_asc">Date (Oldest)</option>
                    <option value="date_desc">Date (Newest)</option>
                    <option value="dids_asc">DIDs (Low to High)</option>
                    <option value="dids_desc">DIDs (High to Low)</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Stats Summary */}
            <div className="stats-summary">
              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-value">{totalItems}</div>
                  <div className="stat-label">Total DIDs</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-value">
                    {didPools.filter(pool => pool.status === 'active').length}
                  </div>
                  <div className="stat-label">Active Pools</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-value">
                    {didPools.filter(pool => pool.status === 'inactive').length}
                  </div>
                  <div className="stat-label">Inactive Pools</div>
                </div>
              </div>
            </div>

            {/* DID Pools List */}
            {currentItems.length > 0 ? (
              <div className="did-pools-list">
                {currentItems.map(pool => (
                  <div className="did-pool-item" key={pool.id}>
                    <div className="did-pool-info" onClick={() => viewDidPoolDetails(pool.id)}>
                      <h2 className="did-pool-name">{pool.name}</h2>
                      <p className="did-pool-description">{pool.description || 'No description'}</p>
                      <div className="did-pool-tags">
                        <span className="did-pool-tag">{pool.brand || 'No brand'}</span>
                        <span className="did-pool-tag">{pool.totalDids} DIDs</span>
                      </div>
                    </div>
                    <div className="did-pool-status">
                      <div className="status-date">
                        Status: {pool.status}
                      </div>
                      <div className="did-pool-actions">
                        <div className="view-edit-actions">
                          <button 
                            className="action-button view-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              viewDidPoolDetails(pool.id);
                            }}
                            title="View details"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button 
                            className="action-button edit-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/did-pools/${pool.id}/edit`);
                            }}
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        </div>
                        <label className="toggle-switch" title={pool.status === "active" ? "Deactivate pool" : "Activate pool"}>
                          <input
                            type="checkbox"
                            checked={pool.status === "active"}
                            onChange={() => handleToggleActive(pool.id)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-button"
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>
                
                {/* Dynamic page numbers */}
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                  // Calculate the page number to display
                  let pageNum;
                  if (totalPages <= 5) {
                    // Less than 5 pages, show all
                    pageNum = index + 1;
                  } else if (currentPage <= 3) {
                    // Near the start
                    pageNum = index + 1;
                  } else if (currentPage >= totalPages - 2) {
                    // Near the end
                    pageNum = totalPages - 4 + index;
                  } else {
                    // In the middle
                    pageNum = currentPage - 2 + index;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => paginate(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button 
                  className="pagination-button"
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>
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
