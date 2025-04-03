import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Campaigns.css"; // Using the same CSS file

const Campaigns = () => {
  const navigate = useNavigate();

  // Enhanced sample campaigns data with more information
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: "BDS_Web",
      description: "All webform leads, all marketing platforms",
      active: true,
      activatedDate: "1/24/25",
      source: "web",
      type: "leads",
      metrics: {
        contacts: 2547,
        conversions: 183,
        conversionRate: 7.2
      }
    },
    {
      id: 2,
      name: "Lendvia_Purls",
      description: "Purls from Lendvia Website",
      active: true,
      activatedDate: "1/22/25",
      source: "web",
      type: "clients",
      metrics: {
        contacts: 1865,
        conversions: 98,
        conversionRate: 5.3
      }
    },
    {
      id: 3,
      name: "Email_Nurture_Q1",
      description: "Email nurture campaign for Q1 leads",
      active: false,
      activatedDate: "1/15/25",
      source: "email",
      type: "leads",
      metrics: {
        contacts: 3210,
        conversions: 142,
        conversionRate: 4.4
      }
    },
  ]);

  // Enhanced state management
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOption, setSortOption] = useState("name_asc");
  const [togglingId, setTogglingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);

  // Simulate loading on first render
  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

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
  const confirmDelete = () => {
    setCampaigns(campaigns.filter(campaign => campaign.id !== campaignToDelete));
    setShowDeleteModal(false);
    setCampaignToDelete(null);
  };

  // Handle toggle campaign active status
  const handleToggleActive = (id) => {
    setTogglingId(id);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setCampaigns(
        campaigns.map((campaign) =>
          campaign.id === id
            ? { ...campaign, active: !campaign.active }
            : campaign
        )
      );
      setTogglingId(null);
    }, 500);
  };

  // Handle viewing campaign details
  const handleViewCampaign = (id) => {
    navigate(`/campaigns/${id}/detail`);
  };
  
  // Handle sort change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };
  
  // Filter & sort campaigns with useMemo to optimize performance
  const filteredCampaigns = useMemo(() => {
    // First, filter campaigns
    let result = campaigns.filter(campaign => {
      // Filter by search term
      const matchesSearch = searchTerm === "" || 
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by source
      const matchesSource = sourceFilter === "all" || campaign.source === sourceFilter;
      
      // Filter by type
      const matchesType = typeFilter === "all" || campaign.type === typeFilter;
      
      return matchesSearch && matchesSource && matchesType;
    });
    
    // Then, sort campaigns
    return result.sort((a, b) => {
      switch (sortOption) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "date_asc":
          return new Date(a.activatedDate) - new Date(b.activatedDate);
        case "date_desc":
          return new Date(b.activatedDate) - new Date(a.activatedDate);
        case "conversion_rate":
          return b.metrics.conversionRate - a.metrics.conversionRate;
        default:
          return 0;
      }
    });
  }, [campaigns, searchTerm, sourceFilter, typeFilter, sortOption]);
  
  // Get current campaigns for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCampaigns = filteredCampaigns.slice(indexOfFirstItem, indexOfLastItem);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="content-header">
            <h1 className="page-title">Campaigns</h1>
            <div className="skeleton skeleton-button"></div>
          </div>
          <div className="content-body">
            <div className="skeleton skeleton-search"></div>
            <div className="skeleton-filters">
              <div className="skeleton skeleton-filter"></div>
              <div className="skeleton skeleton-filter"></div>
              <div className="skeleton skeleton-filter"></div>
            </div>
            {[1, 2, 3].map((item) => (
              <div key={item} className="skeleton skeleton-campaign-item"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="content-header">
          <h1 className="page-title">Campaigns</h1>
          <button className="update-button" onClick={handleCreateCampaign}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Campaign
          </button>
        </div>

        <div className="content-body">
          {/* Search and filters section */}
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="source">Source:</label>
              <div className="select-wrapper">
                <select 
                  id="source" 
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                >
                  <option value="all">All Sources</option>
                  <option value="web">Web</option>
                  <option value="email">Email</option>
                  <option value="social">Social Media</option>
                </select>
              </div>
            </div>

            <div className="filter-group">
              <label htmlFor="type">Type:</label>
              <div className="select-wrapper">
                <select 
                  id="type" 
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="leads">Leads</option>
                  <option value="clients">Clients</option>
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
              <div className="stat-value">{campaigns.length}</div>
              <div className="stat-subtitle">{campaigns.filter(c => c.active).length} active</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Total Contacts</div>
              <div className="stat-value">
                {campaigns.reduce((sum, campaign) => sum + campaign.metrics.contacts, 0).toLocaleString()}
              </div>
              <div className="stat-subtitle">Across all campaigns</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Average Conversion</div>
              <div className="stat-value">
                {(campaigns.reduce((sum, campaign) => sum + campaign.metrics.conversionRate, 0) / campaigns.length).toFixed(1)}%
              </div>
              <div className="stat-subtitle">All campaigns</div>
            </div>
          </div>

          {/* Campaigns list */}
          <div className="campaigns-list">
            {currentCampaigns.length > 0 ? (
              currentCampaigns.map((campaign) => (
                <div className="campaign-item" key={campaign.id}>
                  <div className="campaign-info" onClick={() => handleViewCampaign(campaign.id)}>
                    <h2 className="campaign-name">{campaign.name}</h2>
                    <p className="campaign-description">{campaign.description}</p>
                    <div className="campaign-tags">
                      <span className="campaign-tag">{campaign.source}</span>
                      <span className="campaign-tag">{campaign.type}</span>
                      <span className="campaign-tag">
                        {campaign.metrics.conversionRate}% conv.
                      </span>
                    </div>
                  </div>
                  <div className="campaign-status">
                    <div className="status-date">
                      {campaign.active ? 'Active since' : 'Inactive since'}: {campaign.activatedDate}
                    </div>
                    <label className="toggle-switch" title={campaign.active ? "Deactivate campaign" : "Activate campaign"}>
                      <input
                        type="checkbox"
                        checked={campaign.active}
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
          {filteredCampaigns.length > itemsPerPage && (
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
