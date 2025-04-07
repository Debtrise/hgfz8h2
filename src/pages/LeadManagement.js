import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './LeadManagement.css';
import { FaUsers, FaPhone, FaCheckCircle, FaExclamationCircle, FaArrowRight, FaFileImport, FaUserPlus, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';

const LeadManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leadPools, setLeadPools] = useState([]);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeLeads: 0,
    completedLeads: 0,
    failedLeads: 0
  });
  
  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [leadsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    leadPool: 'all'
  });
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm, filters, sortField, sortDirection]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get current user's tenant ID (assuming it's stored in localStorage)
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const tenantId = currentUser.tenantId || 1; // Default to 1 if not available
      
      // Prepare query parameters
      const params = {
        page: currentPage,
        limit: leadsPerPage,
        sort: `${sortField}:${sortDirection}`,
        search: searchTerm || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        leadPool: filters.leadPool !== 'all' ? filters.leadPool : undefined
      };
      
      // Fetch lead pools and leads
      const [poolsResponse, leadsResponse] = await Promise.all([
        apiService.leadPools.getAll(),
        apiService.leads.getAll(params)
      ]);

      setLeadPools(poolsResponse.data || []);
      
      // Debug the API response
      console.log('Leads API Response:', leadsResponse);
      
      // Ensure leads is always an array
      let leadsData = [];
      let totalLeads = 0;
      
      if (Array.isArray(leadsResponse)) {
        // Direct array response
        leadsData = leadsResponse;
        totalLeads = leadsResponse.length;
      } else if (leadsResponse && Array.isArray(leadsResponse.data)) {
        // Response with data property containing array
        leadsData = leadsResponse.data;
        totalLeads = leadsResponse.total || leadsResponse.data.length;
      } else if (leadsResponse && leadsResponse.data && Array.isArray(leadsResponse.data.leads)) {
        // Nested data structure
        leadsData = leadsResponse.data.leads;
        totalLeads = leadsResponse.data.total || leadsResponse.data.leads.length;
      }
      
      // Map the API response fields to the expected frontend fields
      const mappedLeads = leadsData.map(lead => ({
        id: lead.id,
        firstName: lead.first_name || lead.firstName,
        lastName: lead.last_name || lead.lastName,
        phone: lead.phone,
        email: lead.email,
        status: lead.status,
        createdAt: lead.created_at || lead.createdAt,
        leadAge: lead.lead_age || lead.leadAge,
        pools: lead.pools
      }));
      
      setLeads(mappedLeads);
      
      // Set total pages for pagination
      setTotalPages(Math.ceil(totalLeads / leadsPerPage) || 1);

      // Calculate statistics
      const activeLeads = mappedLeads.filter(lead => lead.status === 'active').length;
      const completedLeads = mappedLeads.filter(lead => lead.status === 'completed').length;
      const failedLeads = mappedLeads.filter(lead => lead.status === 'failed').length;

      setStats({
        totalLeads: totalLeads,
        activeLeads,
        completedLeads,
        failedLeads
      });

      setError(null);
    } catch (err) {
      setError('Failed to load lead management data. Please try again later.');
      console.error('Error fetching lead management data:', err);
      setLeads([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const navigateToLeadPools = () => navigate('/lead-pools');
  const navigateToLeads = () => navigate('/leads');
  const navigateToDIDPools = () => navigate('/did-pools');
  
  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Handle sort changes
  const handleSortChange = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // View lead details
  const viewLeadDetails = (leadId) => {
    navigate(`/leads/${leadId}`);
  };

  if (loading && leads.length === 0) {
    return (
      <div className="loading-state">
        <LoadingSpinner size="large" text="Loading lead management data..." />
      </div>
    );
  }

  if (error && leads.length === 0) {
    return (
      <div className="error-state">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchData} className="view-button">Try Again</button>
      </div>
    );
  }

  return (
    <div className="lead-management">
      <h1>Lead Management</h1>
      
      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-title">Total Leads</div>
          <div className="stat-value">{stats.totalLeads}</div>
          <div className="stat-subtitle">Across all pools</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Active Leads</div>
          <div className="stat-value">{stats.activeLeads}</div>
          <div className="stat-subtitle">Ready for processing</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Completed Leads</div>
          <div className="stat-value">{stats.completedLeads}</div>
          <div className="stat-subtitle">Successfully processed</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Failed Leads</div>
          <div className="stat-value">{stats.failedLeads}</div>
          <div className="stat-subtitle">Requires attention</div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="quick-access-section">
        <h2 className="section-title">Quick Access</h2>
        <div className="quick-access-cards">
          <div className="quick-access-card" onClick={navigateToLeadPools}>
            <div className="card-icon">
              <FaUsers />
            </div>
            <div className="card-content">
              <h3>Lead Pools</h3>
              <p>Manage your lead pools and campaigns</p>
            </div>
            <FaArrowRight />
          </div>
          <div className="quick-access-card" onClick={navigateToLeads}>
            <div className="card-icon">
              <FaPhone />
            </div>
            <div className="card-content">
              <h3>All Leads</h3>
              <p>View and manage all leads</p>
            </div>
            <FaArrowRight />
          </div>
          <div className="quick-access-card" onClick={navigateToDIDPools}>
            <div className="card-icon">
              <FaCheckCircle />
            </div>
            <div className="card-content">
              <h3>DID Pools</h3>
              <p>Manage your DID pools</p>
            </div>
            <FaArrowRight />
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="leads-table-section">
        <h2 className="section-title">All Leads</h2>
        
        {/* Search and Filters */}
        <div className="leads-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            <FaSearch className="search-icon" />
          </div>
          
          <div className="filters-container">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            
            <select
              name="leadPool"
              value={filters.leadPool}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="all">All Lead Pools</option>
              {leadPools.map(pool => (
                <option key={pool.id} value={pool.id}>{pool.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Leads Table */}
        <div className="leads-table-container">
          {loading ? (
            <div className="loading-state">
              <LoadingSpinner size="medium" text="Loading leads..." />
            </div>
          ) : (
            <table className="leads-table">
              <thead>
                <tr>
                  <th onClick={() => handleSortChange('firstName')} className="sortable">
                    Name
                    {sortField === 'firstName' && (
                      sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                    )}
                    {sortField !== 'firstName' && <FaSort />}
                  </th>
                  <th onClick={() => handleSortChange('phone')} className="sortable">
                    Phone
                    {sortField === 'phone' && (
                      sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                    )}
                    {sortField !== 'phone' && <FaSort />}
                  </th>
                  <th onClick={() => handleSortChange('email')} className="sortable">
                    Email
                    {sortField === 'email' && (
                      sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                    )}
                    {sortField !== 'email' && <FaSort />}
                  </th>
                  <th onClick={() => handleSortChange('status')} className="sortable">
                    Status
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                    )}
                    {sortField !== 'status' && <FaSort />}
                  </th>
                  <th onClick={() => handleSortChange('createdAt')} className="sortable">
                    Created
                    {sortField === 'createdAt' && (
                      sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                    )}
                    {sortField !== 'createdAt' && <FaSort />}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.length > 0 ? (
                  leads.map((lead) => (
                    <tr key={lead.id}>
                      <td>{`${lead.firstName || ''} ${lead.lastName || ''}`}</td>
                      <td>{lead.phone || 'N/A'}</td>
                      <td>{lead.email || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${lead.status || 'unknown'}`}>
                          {lead.status || 'Unknown'}
                        </span>
                      </td>
                      <td>{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <button 
                          className="view-button"
                          onClick={() => viewLeadDetails(lead.id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      <p>No leads found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              First
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => 
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 2 && page <= currentPage + 2)
              )
              .map((page, index, array) => {
                // Add ellipsis if there's a gap
                if (index > 0 && page - array[index - 1] > 1) {
                  return (
                    <React.Fragment key={`ellipsis-${page}`}>
                      <span className="pagination-ellipsis">...</span>
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                }
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                );
              })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Next
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Last
            </button>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-section">
        <h2 className="section-title">Recent Activity</h2>
        <div className="activity-list">
          {leads.length > 0 ? (
            leads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="activity-item">
                <div className="activity-icon">
                  {lead.status === 'completed' ? <FaCheckCircle /> : 
                   lead.status === 'failed' ? <FaExclamationCircle /> : 
                   <FaPhone />}
                </div>
                <div className="activity-content">
                  <div className="activity-title">
                    {lead.firstName} {lead.lastName} - {lead.phone}
                  </div>
                  <div className="activity-details">
                    <span>Status: {lead.status}</span>
                    <span>Pool: {lead.poolName || 'None'}</span>
                    <span>Last Updated: {lead.updatedAt ? new Date(lead.updatedAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
                <button 
                  className="view-button"
                  onClick={() => viewLeadDetails(lead.id)}
                >
                  View
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No recent activity to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadManagement; 