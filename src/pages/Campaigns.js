import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Campaigns.css";
import apiService from "../services/apiService";

// Mock data for testing if API is not available
const getMockCampaigns = () => {
  return {
    data: {
      campaigns: [
        {
          id: 1,
          name: "Summer Promotion",
          brand: "Acme",
          source: "Email",
          description: "A campaign to promote summer products",
          status: "active",
          createdAt: "2023-06-01T00:00:00Z",
          metrics: {
            contacts: 1200,
            conversionRate: 15.5
          }
        },
        {
          id: 2,
          name: "Fall Collection",
          brand: "Tax Relief Solutions",
          source: "Facebook Ads",
          description: "Promoting our fall collection",
          status: "inactive",
          createdAt: "2023-09-01T00:00:00Z",
          metrics: {
            contacts: 800,
            conversionRate: 12.3
          }
        },
        {
          id: 3,
          name: "Holiday Special",
          brand: "Debt Consolidation",
          source: "Google Ads",
          description: "Holiday special offers",
          status: "active",
          createdAt: "2023-12-01T00:00:00Z",
          metrics: {
            contacts: 1500,
            conversionRate: 18.7
          }
        }
      ],
      total: 3
    }
  };
};

const Campaigns = () => {
  const navigate = useNavigate();

  // State for campaigns data
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [sortOption, setSortOption] = useState("name_asc");
  
  // Dropdown options from API
  const [brandOptions, setBrandOptions] = useState([]);
  const [sourceOptions, setSourceOptions] = useState([]);
  
  // UI state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  
  // Flag to use mock data if API fails
  const [useMockData, setUseMockData] = useState(false);

  // Fetch campaigns from API
  useEffect(() => {
    fetchCampaigns();
  }, [currentPage, itemsPerPage, searchTerm, sourceFilter, brandFilter, sortOption]);

  // Fetch dropdown options when component mounts
  useEffect(() => {
    fetchDropdownOptions();
  }, []);

  // Fetch dropdown options from API
  const fetchDropdownOptions = async () => {
    try {
      console.log('Fetching dropdown options...');
      
      let response;
      if (useMockData) {
        response = getMockCampaigns();
      } else {
        // Fetch campaigns to extract unique brands and sources
        response = await apiService.campaigns.getAll({ limit: 100 });
      }
      
      console.log('Dropdown options API response:', response);
      
      if (response && response.data) {
        // Extract unique brands and sources from the transformed data
        const brands = [...new Set(response.data.map(campaign => campaign.brand))].filter(Boolean);
        const sources = [...new Set(response.data.map(campaign => campaign.source))].filter(Boolean);
        
        console.log('Extracted brands:', brands);
        console.log('Extracted sources:', sources);
        
        setBrandOptions(brands);
        setSourceOptions(sources);
      } else {
        console.warn('Unexpected API response format for dropdown options:', response);
      }
    } catch (err) {
      console.error("Error fetching dropdown options:", err);
      // Fall back to mock data if API fails
      setUseMockData(true);
      const mockResponse = getMockCampaigns();
      const brands = [...new Set(mockResponse.data.campaigns.map(campaign => campaign.brand))].filter(Boolean);
      const sources = [...new Set(mockResponse.data.campaigns.map(campaign => campaign.source))].filter(Boolean);
      setBrandOptions(brands);
      setSourceOptions(sources);
    }
  };

  const fetchCampaigns = async () => {
    setError(null);
    try {
      // Prepare query parameters based on filters
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        source: sourceFilter !== 'all' ? sourceFilter : undefined,
        brand: brandFilter !== 'all' ? brandFilter : undefined,
        sort: sortOption
      };
      
      console.log('Fetching campaigns with params:', params);
      
      let response;
      if (useMockData) {
        response = getMockCampaigns();
      } else {
        response = await apiService.campaigns.getAll(params);
      }
      
      console.log('API response:', response);
      
      // Check if response has the expected structure
      if (response && response.data) {
        // Transform the data to match our component's expected format
        const transformedCampaigns = response.data.map(campaign => ({
          id: campaign.id,
          name: campaign.name,
          description: campaign.description,
          brand: campaign.brand,
          source: campaign.source,
          status: campaign.status,
          createdAt: campaign.created_at,
          leadPoolId: campaign.lead_pool_id,
          didPoolId: campaign.did_pool_id,
          leadPoolName: campaign.lead_pool_name,
          didPoolName: campaign.did_pool_name,
          journeyCount: campaign.journey_count
        }));
        
        // Set campaigns data
        setCampaigns(transformedCampaigns);
        
        // Update pagination data
        setTotalItems(response.data.length);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      } else {
        console.warn('Unexpected API response format:', response);
        setCampaigns([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setError("Failed to load campaigns. Please try again later.");
      // Fall back to mock data if API fails
      setUseMockData(true);
      const mockResponse = getMockCampaigns();
      setCampaigns(mockResponse.data.campaigns);
      setTotalItems(mockResponse.data.total);
      setTotalPages(Math.ceil(mockResponse.data.total / itemsPerPage));
    }
  };

  // Handle navigation to campaign builder
  const handleCreateCampaign = () => {
    navigate("/campaigns/new");
  };

  // Handle edit campaign
  const handleEditCampaign = (id) => {
    navigate(`/campaigns/${id}/edit`);
  };

  // Handle campaign deletion
  const handleDeleteCampaign = (id) => {
    setCampaignToDelete(id);
    setShowDeleteModal(true);
  };

  // Confirm campaign deletion
  const confirmDelete = async () => {
    try {
      await apiService.campaigns.delete(campaignToDelete);
      // Refresh the campaigns list after deletion
      fetchCampaigns();
      setShowDeleteModal(false);
      setCampaignToDelete(null);
    } catch (err) {
      console.error("Error deleting campaign:", err);
      setError("Failed to delete campaign. Please try again later.");
    }
  };

  // Handle toggle campaign active status
  const handleToggleActive = async (id) => {
    setTogglingId(id);
    
    try {
      const campaign = campaigns.find(c => c.id === id);
      if (!campaign) return;
      
      const newStatus = campaign.status === "active" ? "inactive" : "active";
      
      // Use the appropriate API method based on status
      if (newStatus === "active") {
        await apiService.campaigns.start(id);
      } else {
        await apiService.campaigns.pause(id);
      }
      
      // Refresh the campaigns list to get updated data
      fetchCampaigns();
    } catch (err) {
      console.error("Error toggling campaign status:", err);
      setError("Failed to update campaign status. Please try again later.");
    } finally {
      setTogglingId(null);
    }
  };

  // Handle viewing campaign details
  const handleViewCampaign = (id) => {
    navigate(`/campaigns/${id}/detail`);
  };
  
  // Handle sort change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1); // Reset to first page when sort changes
  };
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="content-header">
          <h1 className="page-title">Campaigns</h1>
          <button className="button-blue" onClick={handleCreateCampaign}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create
          </button>
        </div>

        <div className="content-body">
          {/* Error message */}
          {error && (
            <div className="error-message">
              {error}
              <button className="error-dismiss" onClick={() => setError(null)}>×</button>
            </div>
          )}

          {/* Search and filters section */}
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when search changes
              }}
            />
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="source">Source:</label>
              <div className="select-wrapper">
                <select 
                  id="source" 
                  value={sourceFilter}
                  onChange={(e) => {
                    setSourceFilter(e.target.value);
                    setCurrentPage(1); // Reset to first page when filter changes
                  }}
                >
                  <option value="all">All Sources</option>
                  {sourceOptions.map((source, index) => (
                    <option key={index} value={source}>{source}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-group">
              <label htmlFor="brand">Brand:</label>
              <div className="select-wrapper">
                <select 
                  id="brand" 
                  value={brandFilter}
                  onChange={(e) => {
                    setBrandFilter(e.target.value);
                    setCurrentPage(1); // Reset to first page when filter changes
                  }}
                >
                  <option value="all">All Brands</option>
                  {brandOptions.map((brand, index) => (
                    <option key={index} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-group">
              <label htmlFor="sort">Sort By:</label>
              <div className="select-wrapper">
                <select 
                  id="sort" 
                  value={sortOption}
                  onChange={handleSortChange}
                >
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                  <option value="date_asc">Date (Oldest)</option>
                  <option value="date_desc">Date (Newest)</option>
                  <option value="conversion_rate">Conversion Rate</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Campaign metrics summary */}
          <div className="stats-summary">
            <div className="stat-card">
              <div className="stat-title">Total Campaigns</div>
              <div className="stat-value">{totalItems}</div>
              <div className="stat-subtitle">{campaigns.filter(c => c.status === "active").length} active</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Total Contacts</div>
              <div className="stat-value">
                {campaigns.reduce((sum, campaign) => sum + (campaign.metrics?.contacts || 0), 0).toLocaleString()}
              </div>
              <div className="stat-subtitle">Across all campaigns</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Average Conversion</div>
              <div className="stat-value">
                {campaigns.length > 0 
                  ? (campaigns.reduce((sum, campaign) => sum + (campaign.metrics?.conversionRate || 0), 0) / campaigns.length).toFixed(1)
                  : '0.0'}%
              </div>
              <div className="stat-subtitle">All campaigns</div>
            </div>
          </div>

          {/* Campaigns list */}
          <div className="campaigns-list">
            {campaigns.length > 0 ? (
              campaigns.map((campaign) => (
                <div className="campaign-item" key={campaign.id}>
                  <div className="campaign-info" onClick={() => handleViewCampaign(campaign.id)}>
                    <h2 className="campaign-name">{campaign.name}</h2>
                    <p className="campaign-description">{campaign.description || 'No description'}</p>
                    <div className="campaign-tags">
                      <span className="campaign-tag">{campaign.brand}</span>
                      <span className="campaign-tag">{campaign.source}</span>
                      <span className="campaign-tag">
                        {campaign.metrics?.conversionRate || 0}% conv.
                      </span>
                    </div>
                  </div>
                  <div className="campaign-status">
                    <div className="status-date">
                      {campaign.status === "active" ? 'Active since' : 'Inactive since'}: {new Date(campaign.createdAt).toLocaleDateString()}
                    </div>
                    <label className="toggle-switch" title={campaign.status === "active" ? "Deactivate campaign" : "Activate campaign"}>
                      <input
                        type="checkbox"
                        checked={campaign.status === "active"}
                        onChange={() => handleToggleActive(campaign.id)}
                        disabled={togglingId === campaign.id}
                      />
                      <span className={`toggle-slider ${togglingId === campaign.id ? 'toggling' : ''}`}></span>
                    </label>
                    <div className="campaign-actions">
                      <button 
                        className="action-button"
                        onClick={() => handleViewCampaign(campaign.id)}
                        title="View campaign details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                      <button 
                        className="action-button edit-button"
                        onClick={() => handleEditCampaign(campaign.id)}
                        title="Edit campaign"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button 
                        className="action-button delete-button"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        title="Delete campaign"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No campaigns found. Try adjusting your search or filters.</p>
              </div>
            )}
          </div>

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
      
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Delete Campaign</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this campaign? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="button-outline" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="button-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
