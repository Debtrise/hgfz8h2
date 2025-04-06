import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './ListPages.css';
import LoadingSpinner from '../components/LoadingSpinner';

const LeadPoolLeads = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [leadPool, setLeadPool] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [leadsPerPage] = useState(10);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filters, setFilters] = useState({
    status: 'all'
  });

  useEffect(() => {
    fetchLeadPool();
    fetchLeads();
  }, [id, currentPage, filters, searchTerm, sortField, sortDirection]);

  const fetchLeadPool = async () => {
    try {
      const response = await apiService.leadPools.getById(id);
      setLeadPool(response.data);
    } catch (err) {
      console.error('Error fetching lead pool:', err);
      setError('Failed to load lead pool information. Please try again later.');
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
        status: filters.status !== 'all' ? filters.status : undefined,
        leadPool: id
      };
      
      // Fetch leads using the API
      const response = await apiService.leads.getAll(params);
      
      // Ensure leads is always an array
      const leadsData = Array.isArray(response.data) ? response.data : 
                        (response.data && Array.isArray(response.data.leads)) ? response.data.leads : 
                        [];
      
      setLeads(leadsData);
      setTotalLeads(response.meta?.total || leadsData.length || 0);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to load leads. Please try again later.');
      setLeads([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
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

  const handleExportLeads = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call an API endpoint to generate a CSV
      // For now, we'll just simulate the export
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Leads exported successfully!');
    } catch (err) {
      console.error('Error exporting leads:', err);
      setError('Failed to export leads. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusOptions = () => {
    return ['all', 'active', 'inactive', 'converted', 'lost'];
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
  if (error && leads.length === 0) {
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
          <div className="header-with-back">
            <button className="back-button" onClick={() => navigate(`/lead-pools/${id}`)}>
              <i className="back-icon"></i>
              <span>Back to Lead Pool</span>
            </button>
            <h1 className="page-title">
              {leadPool ? `${leadPool.name} - Leads` : 'Loading Lead Pool...'}
            </h1>
          </div>
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
              <div className="stat-value">{totalLeads}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Active Leads</div>
              <div className="stat-value">
                {leads.filter(lead => lead.status === 'active').length}
              </div>
              <div className="stat-subtitle">
                {totalLeads > 0 
                  ? `${((leads.filter(lead => lead.status === 'active').length / totalLeads) * 100).toFixed(1)}% of total` 
                  : '0% of total'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Average Lead Age</div>
              <div className="stat-value">
                {leads.length > 0 
                  ? Math.round(leads.reduce((sum, lead) => sum + (lead.lead_age || 0), 0) / leads.length) 
                  : 0} days
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Recently Added (7d)</div>
              <div className="stat-value">
                {leads.filter(lead => {
                  if (!lead.created_at) return false;
                  const addedDate = new Date(lead.created_at);
                  const daysDiff = Math.floor((new Date() - addedDate) / (1000 * 60 * 60 * 24));
                  return daysDiff <= 7;
                }).length}
              </div>
            </div>
          </div>

          {/* Filters */}
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
                      {option === 'all' ? 'All Statuses' : option.charAt(0).toUpperCase() + option.slice(1)}
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
                    onClick={() => handleSortChange('first_name')}
                  >
                    <span>Name</span>
                    {sortField === 'first_name' && (
                      <span className={`sort-icon ${sortDirection}`}></span>
                    )}
                  </th>
                  <th>Contact</th>
                  <th
                    className="sortable"
                    onClick={() => handleSortChange('created_at')}
                  >
                    <span>Added</span>
                    {sortField === 'created_at' && (
                      <span className={`sort-icon ${sortDirection}`}></span>
                    )}
                  </th>
                  <th
                    className="sortable"
                    onClick={() => handleSortChange('last_contacted_at')}
                  >
                    <span>Last Contact</span>
                    {sortField === 'last_contacted_at' && (
                      <span className={`sort-icon ${sortDirection}`}></span>
                    )}
                  </th>
                  <th
                    className="sortable"
                    onClick={() => handleSortChange('lead_age')}
                  >
                    <span>Age (days)</span>
                    {sortField === 'lead_age' && (
                      <span className={`sort-icon ${sortDirection}`}></span>
                    )}
                  </th>
                  <th
                    className="sortable"
                    onClick={() => handleSortChange('status')}
                  >
                    <span>Status</span>
                    {sortField === 'status' && (
                      <span className={`sort-icon ${sortDirection}`}></span>
                    )}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.length > 0 ? (
                  leads.map((lead) => (
                    <tr key={lead.id} onClick={() => viewLeadDetails(lead.id)}>
                      <td>
                        <strong>{`${lead.first_name || ''} ${lead.last_name || ''}`}</strong>
                      </td>
                      <td>
                        <div>{lead.email || 'N/A'}</div>
                        <div>{lead.phone || 'N/A'}</div>
                      </td>
                      <td>{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'N/A'}</td>
                      <td>{lead.last_contacted_at ? new Date(lead.last_contacted_at).toLocaleDateString() : 'Never'}</td>
                      <td>{lead.lead_age || 0}</td>
                      <td>
                        <span className={`status-badge ${lead.status?.toLowerCase() || 'unknown'}`}>
                          {lead.status || 'Unknown'}
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
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      <p>No leads found in this lead pool</p>
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
              {[...Array(Math.ceil(totalLeads / leadsPerPage))].map((_, i) => {
                // Show current page, first, last, and pages around current
                if (
                  i === 0 ||
                  i === Math.ceil(totalLeads / leadsPerPage) - 1 ||
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
                disabled={currentPage === Math.ceil(totalLeads / leadsPerPage)}
              >
                Next
              </button>
              <button
                className="pagination-button"
                onClick={() => handlePageChange(Math.ceil(totalLeads / leadsPerPage))}
                disabled={currentPage === Math.ceil(totalLeads / leadsPerPage)}
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

export default LeadPoolLeads; 