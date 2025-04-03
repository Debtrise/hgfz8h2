import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ListPages.css";

const LeadPoolDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const poolId = parseInt(id);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("dateAdded");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filters, setFilters] = useState({
    status: "all",
    journey: "all"
  });

  // Sample lead pool data
  const [pool, setPool] = useState(null);
  
  // Sample leads data
  const [leads, setLeads] = useState([]);
  
  // Sample campaigns data
  const [assignedCampaigns, setAssignedCampaigns] = useState([]);

  // Fetch pool data
  useEffect(() => {
    // Simulate API call to fetch pool details
    setIsLoading(true);
    
    setTimeout(() => {
      // Sample pool data
      const poolData = {
        id: poolId,
        title: "New Leads - Web",
        description: "All web leads aged 0-15 days from all marketing platforms",
        leadAge: "0-15",
        brand: "BDS",
        source: "Web Forms, Fb, TikTok",
        tags: ["Fresh", "High Intent", "Web"],
        active: true,
        lastModified: "2025-01-24",
        createdDate: "2025-01-10",
        stats: {
          totalLeads: 1245,
          activeDays: 31,
          conversionRate: 8.4,
          responseRate: 14.2,
          callbackRate: 6.7,
          avgLeadAge: 7.3
        }
      };

      // Sample leads for this pool
      const poolLeads = [
        {
          id: 101,
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "(555) 123-4567",
          source: "Web Form",
          brand: "BDS",
          dateAdded: "2025-01-15",
          lastContacted: "2025-01-22",
          status: "Active",
          leadAge: 9,
          journey: "New_Webforms_Fresh",
          metrics: {
            contactAttempts: 3,
            responseRate: 33,
            lastActivity: "Call - No Answer"
          }
        },
        {
          id: 102,
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
          phone: "(555) 987-6543",
          source: "Facebook Ad",
          brand: "BDS",
          dateAdded: "2025-01-12",
          lastContacted: "2025-01-20",
          status: "Active",
          leadAge: 12,
          journey: "BDS_Webforms_Fresh",
          metrics: {
            contactAttempts: 2,
            responseRate: 50,
            lastActivity: "Email - Opened"
          }
        },
        {
          id: 103,
          firstName: "Robert",
          lastName: "Johnson",
          email: "robert.j@example.com",
          phone: "(555) 234-5678",
          source: "TikTok Ad",
          brand: "BDS",
          dateAdded: "2025-01-18",
          lastContacted: "2025-01-23",
          status: "Active",
          leadAge: 6,
          journey: "New_Webforms_Fresh",
          metrics: {
            contactAttempts: 1,
            responseRate: 100,
            lastActivity: "Call - Connected"
          }
        },
        {
          id: 104,
          firstName: "Emily",
          lastName: "Davis",
          email: "emily.d@example.com",
          phone: "(555) 345-6789",
          source: "Web Form",
          brand: "BDS",
          dateAdded: "2025-01-14",
          lastContacted: "2025-01-19",
          status: "Inactive",
          leadAge: 10,
          journey: "None",
          metrics: {
            contactAttempts: 4,
            responseRate: 0,
            lastActivity: "SMS - No Response"
          }
        },
        {
          id: 105,
          firstName: "Michael",
          lastName: "Wilson",
          email: "michael.w@example.com",
          phone: "(555) 456-7890",
          source: "Web Form",
          brand: "BDS",
          dateAdded: "2025-01-16",
          lastContacted: "2025-01-21",
          status: "Active",
          leadAge: 8,
          journey: "BDS_Webforms_Fresh",
          metrics: {
            contactAttempts: 2,
            responseRate: 50,
            lastActivity: "Email - Clicked"
          }
        }
      ];

      // Sample assigned campaigns
      const campaigns = [
        {
          id: 201,
          name: "Web Form Nurture",
          status: "Active",
          conversionRate: 7.8,
          leadsCount: 876,
          startDate: "2025-01-12"
        },
        {
          id: 202,
          name: "Facebook Remarketing",
          status: "Active",
          conversionRate: 9.2,
          leadsCount: 369,
          startDate: "2025-01-15"
        }
      ];

      setPool(poolData);
      setLeads(poolLeads);
      setAssignedCampaigns(campaigns);
      setIsLoading(false);
    }, 800);
  }, [poolId]);

  // Filter and sort leads
  const filteredAndSortedLeads = useMemo(() => {
    if (!leads.length) return [];
    
    // First filter leads based on search term and filters
    let filtered = [...leads];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower) ||
          lead.phone.includes(searchTerm)
      );
    }
    
    // Apply filters
    if (filters.status !== "all") {
      filtered = filtered.filter((lead) => lead.status === filters.status);
    }
    if (filters.journey !== "all") {
      filtered = filtered.filter((lead) => lead.journey === filters.journey);
    }
    
    // Sort the filtered leads
    filtered.sort((a, b) => {
      let comparison = 0;
      
      // Handle different fields differently
      if (sortField === "name") {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        comparison = nameA.localeCompare(nameB);
      } else if (sortField === "dateAdded" || sortField === "lastContacted") {
        const dateA = new Date(a[sortField]);
        const dateB = new Date(b[sortField]);
        comparison = dateA - dateB;
      } else if (sortField === "leadAge") {
        comparison = a.leadAge - b.leadAge;
      } else {
        comparison = String(a[sortField]).localeCompare(String(b[sortField]));
      }
      
      // Apply sort direction
      return sortDirection === "asc" ? comparison : -comparison;
    });
    
    return filtered;
  }, [leads, searchTerm, filters, sortField, sortDirection]);

  // Pagination
  const leadsPerPage = 10;
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredAndSortedLeads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(filteredAndSortedLeads.length / leadsPerPage);

  // Event handlers
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of leads list
    const leadsList = document.querySelector('.table-container');
    if (leadsList) {
      leadsList.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBack = () => {
    navigate('/lead-pools');
  };

  const viewLeadDetails = (leadId) => {
    navigate(`/leads/${leadId}`);
  };

  const viewCampaignDetails = (campaignId) => {
    navigate(`/campaigns/${campaignId}`);
  };

  // Helper functions for options
  const getStatusOptions = () => {
    if (!leads.length) return ["all"];
    const statuses = [...new Set(leads.map((lead) => lead.status))];
    return ["all", ...statuses];
  };

  const getJourneyOptions = () => {
    if (!leads.length) return ["all"];
    const journeys = [...new Set(leads.map((lead) => lead.journey))];
    return ["all", ...journeys];
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading pool details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="error-state">
            <h2>Lead Pool Not Found</h2>
            <p>The lead pool you're looking for doesn't exist or has been removed.</p>
            <button className="button-blue" onClick={handleBack}>
              Back to Lead Pools
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="content-header header-with-back">
          <button className="back-button" onClick={handleBack}>
            <span className="back-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
              </svg>
            </span>
            Back to Lead Pools
          </button>
          <div className="header-actions">
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>

        <div className="content-body">
          {/* Pool Overview */}
          <div className="detail-card">
            <h2 className="detail-card-title">{pool.title}</h2>
            <div className="detail-card-content">
              <p className="item-description">{pool.description}</p>
              <div className="tags-container">
                {pool.tags && pool.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              <div className="detail-info-grid">
                <div className="detail-item">
                  <div className="detail-label">Brand</div>
                  <div className="detail-value">{pool.brand}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Source</div>
                  <div className="detail-value">{pool.source}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Lead Age Range</div>
                  <div className="detail-value">{pool.leadAge} days</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Status</div>
                  <div className="detail-value">
                    <span className={`status-badge ${pool.active ? 'active' : 'inactive'}`}>
                      {pool.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Created</div>
                  <div className="detail-value">{new Date(pool.createdDate).toLocaleDateString()}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Last Modified</div>
                  <div className="detail-value">{new Date(pool.lastModified).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Summary */}
          <div className="stats-summary">
            <div className="stat-card">
              <div className="stat-title">Total Leads</div>
              <div className="stat-value">{pool.stats.totalLeads.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Conversion Rate</div>
              <div className="stat-value">{pool.stats.conversionRate}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Response Rate</div>
              <div className="stat-value">{pool.stats.responseRate}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Avg. Lead Age</div>
              <div className="stat-value">{pool.stats.avgLeadAge} days</div>
            </div>
          </div>

          {/* Assigned Campaigns */}
          <div className="detail-card">
            <h3 className="detail-card-title">Assigned Campaigns</h3>
            <div className="detail-card-content">
              {assignedCampaigns.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Campaign Name</th>
                      <th>Status</th>
                      <th>Conversion Rate</th>
                      <th>Leads Count</th>
                      <th>Start Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedCampaigns.map(campaign => (
                      <tr key={campaign.id} onClick={() => viewCampaignDetails(campaign.id)}>
                        <td><strong>{campaign.name}</strong></td>
                        <td>
                          <span className={`status-badge ${campaign.status.toLowerCase()}`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td>{campaign.conversionRate}%</td>
                        <td>{campaign.leadsCount.toLocaleString()}</td>
                        <td>{new Date(campaign.startDate).toLocaleDateString()}</td>
                        <td>
                          <div className="item-actions" onClick={(e) => e.stopPropagation()}>
                            <button 
                              className="action-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                viewCampaignDetails(campaign.id);
                              }}
                              title="View campaign details"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <p>This lead pool is not assigned to any campaigns</p>
                </div>
              )}
            </div>
          </div>

          {/* Leads Filter */}
          <div className="detail-card">
            <h3 className="detail-card-title">Leads in this Pool</h3>
            <div className="filter-row">
              <div className="filter-group">
                <label>Status:</label>
                <div className="select-wrapper">
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    {getStatusOptions().map((option) => (
                      <option key={option} value={option}>
                        {option === "all" ? "All Statuses" : option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="filter-group">
                <label>Journey:</label>
                <div className="select-wrapper">
                  <select
                    name="journey"
                    value={filters.journey}
                    onChange={handleFilterChange}
                  >
                    {getJourneyOptions().map((option) => (
                      <option key={option} value={option}>
                        {option === "all" ? "All Journeys" : option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Leads Table */}
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th
                      className="sortable"
                      onClick={() => handleSortChange("name")}
                    >
                      <span>Name</span>
                      {sortField === "name" && (
                        <span className={`sort-icon ${sortDirection}`}></span>
                      )}
                    </th>
                    <th>Contact</th>
                    <th
                      className="sortable"
                      onClick={() => handleSortChange("source")}
                    >
                      <span>Source</span>
                      {sortField === "source" && (
                        <span className={`sort-icon ${sortDirection}`}></span>
                      )}
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSortChange("dateAdded")}
                    >
                      <span>Added</span>
                      {sortField === "dateAdded" && (
                        <span className={`sort-icon ${sortDirection}`}></span>
                      )}
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSortChange("lastContacted")}
                    >
                      <span>Last Contact</span>
                      {sortField === "lastContacted" && (
                        <span className={`sort-icon ${sortDirection}`}></span>
                      )}
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSortChange("journey")}
                    >
                      <span>Journey</span>
                      {sortField === "journey" && (
                        <span className={`sort-icon ${sortDirection}`}></span>
                      )}
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSortChange("status")}
                    >
                      <span>Status</span>
                      {sortField === "status" && (
                        <span className={`sort-icon ${sortDirection}`}></span>
                      )}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLeads.length > 0 ? (
                    currentLeads.map((lead) => (
                      <tr key={lead.id} onClick={() => viewLeadDetails(lead.id)}>
                        <td>
                          <strong>{`${lead.firstName} ${lead.lastName}`}</strong>
                        </td>
                        <td>
                          <div>{lead.email}</div>
                          <div>{lead.phone}</div>
                        </td>
                        <td>{lead.source}</td>
                        <td>{new Date(lead.dateAdded).toLocaleDateString()}</td>
                        <td>{new Date(lead.lastContacted).toLocaleDateString()}</td>
                        <td>{lead.journey}</td>
                        <td>
                          <span className={`status-badge ${lead.status.toLowerCase()}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td>
                          <div className="item-actions" onClick={(e) => e.stopPropagation()}>
                            <button 
                              className="action-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                viewLeadDetails(lead.id);
                              }}
                              title="View lead details"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="empty-state">
                        <p>No leads match your search criteria</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredAndSortedLeads.length > leadsPerPage && (
              <div className="pagination">
                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  First
                </button>
                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  // Show current page, first, last, and pages around current
                  if (
                    i === 0 ||
                    i === totalPages - 1 ||
                    (i >= currentPage - 2 && i <= currentPage + 2)
                  ) {
                    return (
                      <button
                        key={i}
                        className={`pagination-button ${currentPage === i + 1 ? "active" : ""}`}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </button>
                    );
                  } else if (
                    i === currentPage - 3 ||
                    i === currentPage + 3
                  ) {
                    return <span key={i}>...</span>;
                  }
                  return null;
                })}
                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadPoolDetail; 