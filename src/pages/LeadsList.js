import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/apiService";
import "./ListPages.css";
import LoadingSpinner from "../components/LoadingSpinner";

const LeadsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState("dateAdded");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filters, setFilters] = useState({
    status: "all",
    leadPool: "all",
  });
  const [leads, setLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [leadsPerPage] = useState(10);
  const [leadPools, setLeadPools] = useState([]);
  const [apiError, setApiError] = useState(false);

  // Fetch leads and lead pools from API
  useEffect(() => {
    fetchLeads();
    fetchLeadPools();
  }, [currentPage, filters, searchTerm, sortField, sortDirection]);

  const fetchLeadPools = async () => {
    try {
      const response = await apiService.leadPools.getAll();
      setLeadPools(response.data || []);
    } catch (err) {
      console.error("Error fetching lead pools:", err);
      setError("Failed to load lead pools. Please try again later.");
      setApiError(true);
    }
  };

  const fetchLeads = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Prepare query parameters
      const params = {
        page: currentPage,
        limit: leadsPerPage,
        sort: `${sortField}:${sortDirection}`,
        search: searchTerm || undefined,
        status: filters.status !== "all" ? filters.status : undefined,
        leadPool: filters.leadPool !== "all" ? filters.leadPool : undefined
      };
      
      console.log('Fetching leads with params:', params);
      
      // Fetch leads using the API
      const response = await apiService.leads.getAll(params);
      
      console.log('API Response:', response);
      
      // Handle the API response format
      if (response && response.leads) {
        setLeads(response.leads);
        setTotalLeads(response.pagination.total);
        setApiError(false);
      } else {
        console.error('Invalid API response format:', response);
        setError('Invalid response format from server');
        setLeads([]);
        setTotalLeads(0);
        setApiError(true);
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
      let errorMessage = "Failed to load leads. ";
      
      if (err.response) {
        console.error('Error response:', {
          status: err.response.status,
          data: err.response.data
        });
        errorMessage += `Server error: ${err.response.status}`;
        if (err.response.data && err.response.data.message) {
          errorMessage += ` - ${err.response.data.message}`;
        }
      } else if (err.request) {
        console.error('No response received:', err.request);
        errorMessage += "No response from server. Please check your connection.";
      } else {
        console.error('Error setting up request:', err.message);
        errorMessage += err.message || "Please try again later.";
      }
      
      setError(errorMessage);
      setLeads([]); // Set empty array on error
      setApiError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats summary
  const stats = useMemo(() => {
    // Ensure leads is an array before filtering
    const leadsArray = Array.isArray(leads) ? leads : [];
    
    return {
      totalLeads: totalLeads,
      activeLeads: leadsArray.filter(lead => lead.status === "active").length,
      averageAge: leadsArray.length > 0 
        ? Math.round(leadsArray.reduce((sum, lead) => sum + (lead.lead_age || 0), 0) / leadsArray.length)
        : 0,
      recentlyAdded: leadsArray.filter(lead => {
        if (!lead.created_at) return false;
        const addedDate = new Date(lead.created_at);
        const daysDiff = Math.floor((new Date() - addedDate) / (1000 * 60 * 60 * 24));
        return daysDiff <= 7;
      }).length
    };
  }, [leads, totalLeads]);

  // Function to handle searching
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Filter and sort leads
  const filteredAndSortedLeads = useMemo(() => {
    // Ensure leads is an array before returning
    return Array.isArray(leads) ? leads : [];
  }, [leads]);

  // Pagination
  const totalPages = Math.ceil(totalLeads / leadsPerPage);

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
      top: document.querySelector('.content-body')?.offsetTop - 20 || 0,
      behavior: 'smooth'
    });
  };

  const viewLeadDetails = (leadId) => {
    navigate(`/leads/${leadId}`);
  };

  const handleAddToLeadPool = (leadId) => {
    // Implementation for adding to lead pool
    console.log(`Adding lead ${leadId} to lead pool`);
  };

  const handleExportLeads = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call an API endpoint to generate a CSV
      // For now, we'll just simulate the export
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Leads exported successfully!');
    } catch (err) {
      console.error("Error exporting leads:", err);
      setError("Failed to export leads. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for options
  const getLeadPoolOptions = () => {
    return ["all", ...leadPools.map(pool => pool.name)];
  };

  const getStatusOptions = () => {
    return ["all", "active", "inactive", "converted", "lost"];
  };

  // Show loading state only on initial load
  if (isLoading && leads.length === 0) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="loading-state">
            <LoadingSpinner size="large" text="Loading leads..." />
          </div>
        </div>
      </div>
    );
  }

  // Show error state if API error occurred
  if (apiError && leads.length === 0) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="error-state">
            <h2>Error Loading Leads</h2>
            <p>{error || "An error occurred while loading leads. Please try again later."}</p>
            <button className="button-blue" onClick={fetchLeads}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="content-header">
          <h1 className="page-title">All Leads</h1>
          <div className="header-actions">
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <i className="search-icon"></i>
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
          {error && (
            <div className="error-message">
              {error}
              <button className="dismiss-button" onClick={() => setError(null)}>×</button>
            </div>
          )}

          {/* Stats Summary */}
          <div className="stats-summary">
            <div className="stat-card">
              <div className="stat-title">Total Leads</div>
              <div className="stat-value">{stats.totalLeads}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Active Leads</div>
              <div className="stat-value">{stats.activeLeads}</div>
              <div className="stat-subtitle">
                {stats.totalLeads > 0 
                  ? `${((stats.activeLeads / stats.totalLeads) * 100).toFixed(1)}% of total` 
                  : '0% of total'}
              </div>
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
              <label>Lead Pool:</label>
              <div className="select-wrapper">
                <select
                  name="leadPool"
                  value={filters.leadPool}
                  onChange={handleFilterChange}
                >
                  {getLeadPoolOptions().map((option) => (
                    <option key={option} value={option}>
                      {option === "all" ? "All Lead Pools" : option}
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
                      {option === "all" ? "All Statuses" : option.charAt(0).toUpperCase() + option.slice(1)}
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
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Lead Pool</th>
                  <th>Added</th>
                  <th>Last Contact</th>
                  <th>Age (days)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedLeads.length > 0 ? (
                  filteredAndSortedLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <div className="lead-name">{`${lead.first_name || ''} ${lead.last_name || ''}`}</div>
                      </td>
                      <td>
                        <div className="contact-info">
                          <div>{lead.email || 'N/A'}</div>
                          <div>{lead.phone || 'N/A'}</div>
                        </div>
                      </td>
                      <td>
                        <div className="lead-pool">{lead.lead_pool_name || 'None'}</div>
                      </td>
                      <td>
                        <div className="date">{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'N/A'}</div>
                      </td>
                      <td>
                        <div className="date">{lead.last_contacted_at ? new Date(lead.last_contacted_at).toLocaleDateString() : 'Never'}</div>
                      </td>
                      <td>
                        <div className="age">{lead.lead_age || 0}</div>
                      </td>
                      <td>
                        <span className={`status-badge ${lead.status?.toLowerCase() || 'unknown'}`}>
                          {lead.status || 'Unknown'}
                        </span>
                      </td>
                      <td>
                        <div className="item-actions">
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
                            onClick={() => handleAddToLeadPool(lead.id)}
                            title="Add to lead pool"
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
          {totalLeads > 0 && (
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
