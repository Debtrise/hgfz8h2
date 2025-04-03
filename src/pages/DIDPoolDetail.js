import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ListPages.css";

const DIDPoolDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const poolId = parseInt(id);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("lastUsed");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filters, setFilters] = useState({
    status: "all"
  });

  // Sample DID pool data
  const [pool, setPool] = useState(null);
  
  // Sample DIDs data
  const [dids, setDIDs] = useState([]);
  
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
        title: "Main Sales DIDs",
        description: "Primary phone numbers for outbound sales campaigns",
        brand: "BDS",
        source: "Outbound Sales",
        ingroups: "Sales, Support",
        tags: ["Sales", "Primary", "Outbound"],
        active: true,
        lastModified: "2025-01-22",
        createdDate: "2025-01-05",
        stats: {
          totalDIDs: 24,
          activeDIDs: 24,
          callsToday: 435,
          totalCalls: 12684,
          answerRate: 21.7,
          conversionRate: 4.3,
          avgCallDuration: "3:12"
        }
      };

      // Sample DIDs for this pool
      const poolDIDs = [
        {
          id: 1,
          number: "(800) 555-0100",
          brand: "BDS",
          source: "Outbound Sales",
          ingroups: ["Sales", "Support"],
          usageCount: 1284,
          callsToday: 52,
          status: "Active",
          dialRatio: 1.5,
          lastUsed: "2025-01-24T14:30:00",
          metrics: {
            answerRate: 23.4,
            avgCallDuration: "2:45",
            conversionRate: 4.8
          }
        },
        {
          id: 2,
          number: "(800) 555-0101",
          brand: "BDS",
          source: "Outbound Sales",
          ingroups: ["Sales"],
          usageCount: 978,
          callsToday: 48,
          status: "Active",
          dialRatio: 1.5,
          lastUsed: "2025-01-24T15:15:00",
          metrics: {
            answerRate: 25.1,
            avgCallDuration: "3:12",
            conversionRate: 5.2
          }
        },
        {
          id: 3,
          number: "(800) 555-0102",
          brand: "BDS",
          source: "Outbound Sales",
          ingroups: ["Sales", "Support"],
          usageCount: 1056,
          callsToday: 64,
          status: "Active",
          dialRatio: 1.5,
          lastUsed: "2025-01-24T15:45:00",
          metrics: {
            answerRate: 22.7,
            avgCallDuration: "2:58",
            conversionRate: 4.5
          }
        },
        {
          id: 4,
          number: "(800) 555-0103",
          brand: "BDS",
          source: "Outbound Sales",
          ingroups: ["Sales"],
          usageCount: 876,
          callsToday: 42,
          status: "Active",
          dialRatio: 1.5,
          lastUsed: "2025-01-24T16:05:00",
          metrics: {
            answerRate: 20.8,
            avgCallDuration: "2:32",
            conversionRate: 3.9
          }
        },
        {
          id: 5,
          number: "(800) 555-0104",
          brand: "BDS",
          source: "Outbound Sales",
          ingroups: ["Sales", "Support"],
          usageCount: 1345,
          callsToday: 62,
          status: "Active",
          dialRatio: 1.5,
          lastUsed: "2025-01-24T16:22:00",
          metrics: {
            answerRate: 24.2,
            avgCallDuration: "3:05",
            conversionRate: 4.6
          }
        }
      ];

      // Sample assigned campaigns
      const campaigns = [
        {
          id: 201,
          name: "Outbound Sales Q1",
          status: "Active",
          conversionRate: 4.5,
          callsCount: 2876,
          startDate: "2025-01-05"
        },
        {
          id: 202,
          name: "Follow-up Campaign",
          status: "Active",
          conversionRate: 5.3,
          callsCount: 1369,
          startDate: "2025-01-10"
        }
      ];

      setPool(poolData);
      setDIDs(poolDIDs);
      setAssignedCampaigns(campaigns);
      setIsLoading(false);
    }, 800);
  }, [poolId]);

  // Filter and sort DIDs
  const filteredAndSortedDIDs = useMemo(() => {
    if (!dids.length) return [];
    
    // First filter DIDs based on search term and filters
    let filtered = [...dids];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (did) =>
          did.number.includes(searchTerm) ||
          did.ingroups.some(ingroup => ingroup.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply filters
    if (filters.status !== "all") {
      filtered = filtered.filter((did) => did.status === filters.status);
    }
    
    // Sort the filtered DIDs
    filtered.sort((a, b) => {
      let comparison = 0;
      
      // Handle different fields differently
      if (sortField === "lastUsed") {
        const dateA = new Date(a[sortField]);
        const dateB = new Date(b[sortField]);
        comparison = dateA - dateB;
      } else if (sortField === "number") {
        comparison = a.number.localeCompare(b.number);
      } else if (sortField === "usageCount" || sortField === "callsToday") {
        comparison = a[sortField] - b[sortField];
      } else if (sortField === "answerRate") {
        comparison = a.metrics.answerRate - b.metrics.answerRate;
      } else {
        comparison = String(a[sortField]).localeCompare(String(b[sortField]));
      }
      
      // Apply sort direction
      return sortDirection === "asc" ? comparison : -comparison;
    });
    
    return filtered;
  }, [dids, searchTerm, filters, sortField, sortDirection]);

  // Pagination
  const didsPerPage = 10;
  const indexOfLastDID = currentPage * didsPerPage;
  const indexOfFirstDID = indexOfLastDID - didsPerPage;
  const currentDIDs = filteredAndSortedDIDs.slice(indexOfFirstDID, indexOfLastDID);
  const totalPages = Math.ceil(filteredAndSortedDIDs.length / didsPerPage);

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
    // Scroll to top of DIDs list
    const didsList = document.querySelector('.table-container');
    if (didsList) {
      didsList.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBack = () => {
    navigate('/did-pools');
  };

  const viewDIDDetails = (didId) => {
    navigate(`/dids/${didId}`);
  };

  const viewCampaignDetails = (campaignId) => {
    navigate(`/campaigns/${campaignId}`);
  };

  const handleToggleStatus = (e, didId) => {
    e.stopPropagation();
    setDIDs(
      dids.map((did) =>
        did.id === didId
          ? { ...did, status: did.status === "Active" ? "Inactive" : "Active" }
          : did
      )
    );
  };

  // Helper functions for options
  const getStatusOptions = () => {
    if (!dids.length) return ["all"];
    const statuses = [...new Set(dids.map((did) => did.status))];
    return ["all", ...statuses];
  };

  const getIngroupList = (ingroups) => {
    return ingroups.join(", ");
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
            <h2>DID Pool Not Found</h2>
            <p>The DID pool you're looking for doesn't exist or has been removed.</p>
            <button className="button-blue" onClick={handleBack}>
              Back to DID Pools
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
            Back to DID Pools
          </button>
          <div className="header-actions">
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search DIDs..."
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
                  <div className="detail-label">Ingroups</div>
                  <div className="detail-value">{pool.ingroups}</div>
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
              <div className="stat-title">Total DIDs</div>
              <div className="stat-value">{pool.stats.totalDIDs}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Today's Calls</div>
              <div className="stat-value">{pool.stats.callsToday.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Answer Rate</div>
              <div className="stat-value">{pool.stats.answerRate}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Conversion Rate</div>
              <div className="stat-value">{pool.stats.conversionRate}%</div>
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
                      <th>Total Calls</th>
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
                        <td>{campaign.callsCount.toLocaleString()}</td>
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
                  <p>This DID pool is not assigned to any campaigns</p>
                </div>
              )}
            </div>
          </div>

          {/* DIDs Filter */}
          <div className="detail-card">
            <h3 className="detail-card-title">DIDs in this Pool</h3>
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
            </div>

            {/* DIDs Table */}
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th
                      className="sortable"
                      onClick={() => handleSortChange("number")}
                    >
                      <span>DID Number</span>
                      {sortField === "number" && (
                        <span className={`sort-icon ${sortDirection}`}></span>
                      )}
                    </th>
                    <th>Ingroups</th>
                    <th
                      className="sortable"
                      onClick={() => handleSortChange("usageCount")}
                    >
                      <span>Total Usage</span>
                      {sortField === "usageCount" && (
                        <span className={`sort-icon ${sortDirection}`}></span>
                      )}
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSortChange("callsToday")}
                    >
                      <span>Today's Calls</span>
                      {sortField === "callsToday" && (
                        <span className={`sort-icon ${sortDirection}`}></span>
                      )}
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSortChange("answerRate")}
                    >
                      <span>Answer Rate</span>
                      {sortField === "answerRate" && (
                        <span className={`sort-icon ${sortDirection}`}></span>
                      )}
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSortChange("lastUsed")}
                    >
                      <span>Last Used</span>
                      {sortField === "lastUsed" && (
                        <span className={`sort-icon ${sortDirection}`}></span>
                      )}
                    </th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDIDs.length > 0 ? (
                    currentDIDs.map((did) => (
                      <tr key={did.id} onClick={() => viewDIDDetails(did.id)}>
                        <td>
                          <strong>{did.number}</strong>
                        </td>
                        <td>{getIngroupList(did.ingroups)}</td>
                        <td>{did.usageCount.toLocaleString()}</td>
                        <td>{did.callsToday}</td>
                        <td>{did.metrics.answerRate}%</td>
                        <td>{new Date(did.lastUsed).toLocaleString(undefined, {
                          dateStyle: 'short', 
                          timeStyle: 'short'
                        })}</td>
                        <td>
                          <div className="toggle-container" onClick={(e) => e.stopPropagation()}>
                            <label className="toggle-switch">
                              <input
                                type="checkbox"
                                checked={did.status === "Active"}
                                onChange={(e) => handleToggleStatus(e, did.id)}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                            <span className="toggle-status">{did.status}</span>
                          </div>
                        </td>
                        <td>
                          <div className="item-actions" onClick={(e) => e.stopPropagation()}>
                            <button 
                              className="action-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                viewDIDDetails(did.id);
                              }}
                              title="View DID details"
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
                        <p>No DIDs match your search criteria</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredAndSortedDIDs.length > didsPerPage && (
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

export default DIDPoolDetail; 