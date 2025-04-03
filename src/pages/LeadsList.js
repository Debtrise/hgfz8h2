import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ListPages.css";

const LeadsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sortField, setSortField] = useState("dateAdded");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filters, setFilters] = useState({
    brand: "all",
    source: "all",
    status: "all",
    journey: "all",
  });

  // Sample leads data with enhanced information
  const [leads, setLeads] = useState([
    {
      id: 1,
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
      id: 2,
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
      id: 3,
      firstName: "Robert",
      lastName: "Johnson",
      email: "robert.johnson@example.com",
      phone: "(555) 456-7890",
      source: "TikTok",
      brand: "Lendvia",
      dateAdded: "2025-01-08",
      lastContacted: "2025-01-21",
      status: "Active",
      leadAge: 16,
      journey: "New_Webforms_Fresh",
    },
    {
      id: 4,
      firstName: "Emily",
      lastName: "Williams",
      email: "emily.williams@example.com",
      phone: "(555) 234-5678",
      source: "Email Campaign",
      brand: "Lendvia",
      dateAdded: "2025-01-05",
      lastContacted: "2025-01-18",
      status: "Inactive",
      leadAge: 19,
      journey: "BDS_Webforms_Fresh",
    },
    {
      id: 5,
      firstName: "Michael",
      lastName: "Brown",
      email: "michael.brown@example.com",
      phone: "(555) 876-5432",
      source: "Web Form",
      brand: "BDS",
      dateAdded: "2025-01-18",
      lastContacted: "2025-01-23",
      status: "Active",
      leadAge: 6,
      journey: "New_Webforms_Fresh",
    },
  ]);

  // Calculate stats summary
  const stats = useMemo(() => {
    return {
      totalLeads: leads.length,
      activeLeads: leads.filter(lead => lead.status === "Active").length,
      averageAge: Math.round(leads.reduce((sum, lead) => sum + lead.leadAge, 0) / leads.length),
      recentlyAdded: leads.filter(lead => {
        const addedDate = new Date(lead.dateAdded);
        const daysDiff = Math.floor((new Date() - addedDate) / (1000 * 60 * 60 * 24));
        return daysDiff <= 7;
      }).length
    };
  }, [leads]);

  // Function to handle searching
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Filter and sort leads
  const filteredAndSortedLeads = useMemo(() => {
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
    if (filters.brand !== "all") {
      filtered = filtered.filter((lead) => lead.brand === filters.brand);
    }
    if (filters.source !== "all") {
      filtered = filtered.filter((lead) => lead.source === filters.source);
    }
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

  const viewLeadDetails = (leadId) => {
    navigate(`/leads/${leadId}`);
  };

  const handleAddToJourney = (leadId) => {
    // Implementation for adding to journey
    console.log(`Adding lead ${leadId} to journey`);
  };

  const handleExportLeads = () => {
    setIsLoading(true);
    
    // Simulate export process with a delay
    setTimeout(() => {
      setIsLoading(false);
      alert('Leads exported successfully!');
    }, 1500);
  };

  // Helper functions for options
  const getBrandOptions = () => {
    const brands = [...new Set(leads.map((lead) => lead.brand))];
    return ["all", ...brands];
  };

  const getSourceOptions = () => {
    const sources = [...new Set(leads.map((lead) => lead.source))];
    return ["all", ...sources];
  };

  const getStatusOptions = () => {
    const statuses = [...new Set(leads.map((lead) => lead.status))];
    return ["all", ...statuses];
  };

  const getJourneyOptions = () => {
    const journeys = [...new Set(leads.map((lead) => lead.journey))];
    return ["all", ...journeys];
  };

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="content-header">
          <h1 className="page-title">Leads Management</h1>
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
            <button
              className="button-blue"
              onClick={handleExportLeads}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="button-spinner"></span>
                  Exporting...
                </>
              ) : (
                "Export Leads"
              )}
            </button>
          </div>
        </div>

        <div className="content-body">
          {/* Stats Summary */}
          <div className="stats-summary">
            <div className="stat-card">
              <div className="stat-title">Total Leads</div>
              <div className="stat-value">{stats.totalLeads}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Active Leads</div>
              <div className="stat-value">{stats.activeLeads}</div>
              <div className="stat-subtitle">{(stats.activeLeads / stats.totalLeads * 100).toFixed(1)}% of total</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Average Lead Age</div>
              <div className="stat-value">{stats.averageAge} days</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Recently Added (7d)</div>
              <div className="stat-value">{stats.recentlyAdded}</div>
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

          {/* Table */}
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
                    onClick={() => handleSortChange("leadAge")}
                  >
                    <span>Age (days)</span>
                    {sortField === "leadAge" && (
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
                      <td>{lead.leadAge}</td>
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
                            onClick={() => viewLeadDetails(lead.id)}
                            title="View details"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                              <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                            </svg>
                          </button>
                          <button 
                            className="action-button"
                            onClick={() => handleAddToJourney(lead.id)}
                            title="Add to journey"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
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
          {filteredAndSortedLeads.length > 0 && (
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

export default LeadsList;
