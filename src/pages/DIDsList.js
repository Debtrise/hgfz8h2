import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./ListPages.css";

const DIDsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("lastUsed");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filters, setFilters] = useState({
    brand: "all",
    source: "all",
    pool: "all",
    status: "all"
  });

  // Sample DIDs data with enhanced information
  const [dids, setDIDs] = useState([
    {
      id: 1,
      number: "(800) 555-0100",
      pool: "Main Sales DIDs",
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
      pool: "Main Sales DIDs",
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
      pool: "Support Lines",
      brand: "BDS",
      source: "Support",
      ingroups: ["Support", "Retention"],
      usageCount: 2156,
      callsToday: 94,
      status: "Active",
      dialRatio: 1.0,
      lastUsed: "2025-01-24T15:48:00",
      metrics: {
        answerRate: 31.7,
        avgCallDuration: "5:38",
        conversionRate: 6.9
      }
    },
    {
      id: 4,
      number: "(800) 555-0103",
      pool: "Lendvia Marketing",
      brand: "Lendvia",
      source: "Marketing",
      ingroups: ["Marketing", "Sales"],
      usageCount: 756,
      callsToday: 32,
      status: "Inactive",
      dialRatio: 1.5,
      lastUsed: "2025-01-23T11:20:00",
      metrics: {
        answerRate: 18.9,
        avgCallDuration: "2:10",
        conversionRate: 3.5
      }
    },
    {
      id: 5,
      number: "(800) 555-0104",
      pool: "Support Lines",
      brand: "BDS",
      source: "Support",
      ingroups: ["Support"],
      usageCount: 1843,
      callsToday: 76,
      status: "Active",
      dialRatio: 1.0,
      lastUsed: "2025-01-24T16:05:00",
      metrics: {
        answerRate: 29.6,
        avgCallDuration: "4:52",
        conversionRate: 5.8
      }
    }
  ]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      totalDIDs: dids.length,
      activeDIDs: dids.filter(did => did.status === "Active").length,
      totalCallsToday: dids.reduce((sum, did) => sum + did.callsToday, 0),
      avgAnswerRate: (dids.reduce((sum, did) => sum + did.metrics.answerRate, 0) / dids.length).toFixed(1)
    };
  }, [dids]);

  // Function to handle searching
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Filter and sort DIDs
  const filteredAndSortedDIDs = useMemo(() => {
    // First filter DIDs based on search term and filters
    let filtered = [...dids];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (did) =>
          did.number.includes(searchTerm) ||
          did.pool.toLowerCase().includes(searchLower) ||
          did.brand.toLowerCase().includes(searchLower) ||
          did.source.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply filters
    if (filters.brand !== "all") {
      filtered = filtered.filter((did) => did.brand === filters.brand);
    }
    if (filters.source !== "all") {
      filtered = filtered.filter((did) => did.source === filters.source);
    }
    if (filters.pool !== "all") {
      filtered = filtered.filter((did) => did.pool === filters.pool);
    }
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
    // Scroll to top of the list
    window.scrollTo({
      top: document.querySelector('.content-body').offsetTop - 20,
      behavior: 'smooth'
    });
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

  const handleExportDIDs = () => {
    setIsLoading(true);
    
    // Simulate export process with a delay
    setTimeout(() => {
      setIsLoading(false);
      alert('DIDs exported successfully!');
    }, 1500);
  };

  const viewDIDDetails = (didId) => {
    navigate(`/dids/${didId}`);
  };

  // Helper functions for options
  const getBrandOptions = () => {
    return ["all", ...new Set(dids.map((did) => did.brand))];
  };

  const getSourceOptions = () => {
    return ["all", ...new Set(dids.map((did) => did.source))];
  };

  const getPoolOptions = () => {
    return ["all", ...new Set(dids.map((did) => did.pool))];
  };
  
  const getStatusOptions = () => {
    return ["all", ...new Set(dids.map((did) => did.status))];
  };

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="content-header">
          <h1 className="page-title">DID Management</h1>
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
            <button
              className="button-blue"
              onClick={handleExportDIDs}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="button-spinner"></span>
                  Exporting...
                </>
              ) : (
                "Export DIDs"
              )}
            </button>
          </div>
        </div>

        <div className="content-body">
          {/* Stats Summary */}
          <div className="stats-summary">
            <div className="stat-card">
              <div className="stat-title">Total DIDs</div>
              <div className="stat-value">{stats.totalDIDs}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Active DIDs</div>
              <div className="stat-value">{stats.activeDIDs}</div>
              <div className="stat-subtitle">{(stats.activeDIDs / stats.totalDIDs * 100).toFixed(1)}% of total</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Today's Calls</div>
              <div className="stat-value">{stats.totalCallsToday}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Avg. Answer Rate</div>
              <div className="stat-value">{stats.avgAnswerRate}%</div>
            </div>
          </div>

          {/* Filters */}
          <div className="filter-row">
            <div className="filter-group">
              <label>Brand:</label>
              <div className="select-wrapper">
                <select
                  name="brand"
                  value={filters.brand}
                  onChange={handleFilterChange}
                >
                  {getBrandOptions().map((option) => (
                    <option key={option} value={option}>
                      {option === "all" ? "All Brands" : option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="filter-group">
              <label>Source:</label>
              <div className="select-wrapper">
                <select
                  name="source"
                  value={filters.source}
                  onChange={handleFilterChange}
                >
                  {getSourceOptions().map((option) => (
                    <option key={option} value={option}>
                      {option === "all" ? "All Sources" : option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="filter-group">
              <label>Pool:</label>
              <div className="select-wrapper">
                <select
                  name="pool"
                  value={filters.pool}
                  onChange={handleFilterChange}
                >
                  {getPoolOptions().map((option) => (
                    <option key={option} value={option}>
                      {option === "all" ? "All Pools" : option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
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

          {/* Table */}
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
                  <th
                    className="sortable"
                    onClick={() => handleSortChange("pool")}
                  >
                    <span>Pool</span>
                    {sortField === "pool" && (
                      <span className={`sort-icon ${sortDirection}`}></span>
                    )}
                  </th>
                  <th
                    className="sortable"
                    onClick={() => handleSortChange("brand")}
                  >
                    <span>Brand</span>
                    {sortField === "brand" && (
                      <span className={`sort-icon ${sortDirection}`}></span>
                    )}
                  </th>
                  <th
                    className="sortable"
                    onClick={() => handleSortChange("usageCount")}
                  >
                    <span>Usage</span>
                    {sortField === "usageCount" && (
                      <span className={`sort-icon ${sortDirection}`}></span>
                    )}
                  </th>
                  <th
                    className="sortable"
                    onClick={() => handleSortChange("callsToday")}
                  >
                    <span>Today</span>
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
                      <td>{did.pool}</td>
                      <td>{did.brand}</td>
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
                            title="View details"
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
                    <td colSpan="9" className="empty-state">
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
  );
};

export default DIDsList;
