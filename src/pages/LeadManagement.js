import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './LeadManagement.css';
import LoadingIcon from '../components/LoadingIcon';

const LeadManagement = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalLeads: 0,
    activePools: 0,
    leadsToday: 0,
    conversionRate: 0,
    averageLeadAge: 0,
    activeLeads: 0
  });
  const [recentPools, setRecentPools] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [filters, setFilters] = useState({
    brand: 'all',
    source: 'all',
    status: 'all',
    dateRange: 'today'
  });
  const [brands, setBrands] = useState([]);
  const [sources, setSources] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Memoize fetch functions to prevent unnecessary re-renders
  const fetchBrands = useCallback(async () => {
    try {
      const response = await apiService.brands.getAll();
      setBrands(response.data || []);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError('Failed to load brands. Please try again later.');
    }
  }, []);

  const fetchSources = useCallback(async () => {
    try {
      const response = await apiService.sources.getAll();
      setSources(response.data || []);
    } catch (err) {
      console.error('Error fetching sources:', err);
      setError('Failed to load sources. Please try again later.');
    }
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch lead pools
      const poolsResponse = await apiService.leadPools.getAll();
      const pools = poolsResponse.data || [];
      setRecentPools(pools.slice(0, 5)); // Get 5 most recent pools
      
      // Fetch recent leads with filters
      const leadsParams = {
        limit: 5,
        status: filters.status !== 'all' ? filters.status : undefined,
        brand: filters.brand !== 'all' ? filters.brand : undefined,
        source: filters.source !== 'all' ? filters.source : undefined,
        dateRange: filters.dateRange
      };
      
      const leadsResponse = await apiService.leads.getAll(leadsParams);
      
      // Set recent leads
      setRecentLeads(leadsResponse.leads || []);

      // Fetch total leads count with filters
      const totalLeadsParams = {
        limit: 1,
        status: filters.status !== 'all' ? filters.status : undefined,
        brand: filters.brand !== 'all' ? filters.brand : undefined,
        source: filters.source !== 'all' ? filters.source : undefined,
        dateRange: filters.dateRange
      };
      
      const totalLeadsResponse = await apiService.leads.getAll(totalLeadsParams);

      // Calculate stats
      const activeLeads = leadsResponse.leads?.filter(lead => lead.status === 'active').length || 0;
      const totalLeads = totalLeadsResponse.pagination?.total || 0;
      const conversionRate = totalLeads > 0 ? 
        ((leadsResponse.converted || 0) / totalLeads * 100).toFixed(1) : 0;

      setStats({
        totalLeads,
        activePools: pools.filter(pool => pool.status === 'active').length,
        leadsToday: leadsResponse.today || 0,
        conversionRate,
        averageLeadAge: leadsResponse.averageAge || 0,
        activeLeads
      });
    } catch (err) {
      console.error('Error fetching lead management data:', err);
      setError('Failed to load lead management data. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
    fetchBrands();
    fetchSources();
  }, [fetchData, fetchBrands, fetchSources]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const handleCreatePool = () => {
    navigate('/lead-pools/new');
  };

  const handleImportLeads = () => {
    navigate('/leads/import');
  };

  const handleViewAllPools = () => {
    navigate('/lead-pools');
  };

  const handleViewAllLeads = () => {
    navigate('/leads');
  };

  if (isLoading && !isRefreshing) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="loading-state">
            <LoadingIcon text="Loading lead management data..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="content-header">
          <h1 className="page-title">Lead Management</h1>
          <div className="header-actions">
            <button 
              className="button-primary"
              onClick={handleCreatePool}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create Lead Pool
            </button>
            <button 
              className="button-secondary"
              onClick={handleImportLeads}
            >
              Import Leads
            </button>
            <button 
              className="button-text"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <span className="button-spinner"></span>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 4v6h-6"></path>
                    <path d="M1 20v-6h6"></path>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>

        <div className="content-body">
          {error && (
            <div className="error-message">
              {error}
              <button className="error-dismiss" onClick={() => setError(null)}>×</button>
            </div>
          )}

          {/* Search and Filters */}
          <div className="search-filter-container">
            <div className="filter-group">
              <label htmlFor="brand">Brand:</label>
              <div className="select-wrapper">
                <select
                  id="brand"
                  name="brand"
                  value={filters.brand}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="all">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.name}>{brand.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="filter-group">
              <label htmlFor="source">Source:</label>
              <div className="select-wrapper">
                <select
                  id="source"
                  name="source"
                  value={filters.source}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="all">All Sources</option>
                  {sources.map(source => (
                    <option key={source.id} value={source.name}>{source.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="filter-group">
              <label htmlFor="status">Status:</label>
              <div className="select-wrapper">
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
            </div>
            <div className="filter-group">
              <label htmlFor="dateRange">Date Range:</label>
              <div className="select-wrapper">
                <select
                  id="dateRange"
                  name="dateRange"
                  value={filters.dateRange}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="stats-summary">
            <div className="stat-card">
              <div className="stat-title">Total Leads</div>
              <div className="stat-value">{stats.totalLeads.toLocaleString()}</div>
              <div className="stat-change">
                <span className="trend-up">+{stats.leadsToday}</span> today
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Active Leads</div>
              <div className="stat-value">{stats.activeLeads.toLocaleString()}</div>
              <div className="stat-change">
                {stats.activeLeads > 0 ? (
                  <span className="trend-up">+{stats.activeLeads}</span>
                ) : (
                  <span className="trend-down">0</span>
                )} active
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Active Pools</div>
              <div className="stat-value">{stats.activePools}</div>
              <div className="stat-change">
                {stats.activePools > 0 ? (
                  <span className="trend-up">+{stats.activePools}</span>
                ) : (
                  <span className="trend-down">0</span>
                )} pools
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Conversion Rate</div>
              <div className="stat-value">{stats.conversionRate}%</div>
              <div className="stat-change">
                <span className="trend-up">+{stats.conversionRate}%</span> this period
              </div>
            </div>
          </div>

          {/* Recent Lead Pools */}
          <div className="section-container">
            <div className="section-header">
              <h2>Recent Lead Pools</h2>
              <button 
                className="button-text"
                onClick={handleViewAllPools}
              >
                View All Pools
              </button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Lead Count</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPools.length > 0 ? (
                    recentPools.map(pool => (
                      <tr key={pool.id}>
                        <td>{pool.name}</td>
                        <td>{pool.description || 'No description'}</td>
                        <td>{pool.lead_count || 0}</td>
                        <td>
                          <span className={`status-badge ${pool.status}`}>
                            {pool.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-button view-button"
                              onClick={() => navigate(`/lead-pools/${pool.id}`)}
                              title="View Details"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            </button>
                            <button
                              className="action-button edit-button"
                              onClick={() => navigate(`/lead-pools/${pool.id}/edit`)}
                              title="Edit"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="empty-state">
                        <p>No lead pools found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Leads */}
          <div className="section-container">
            <div className="section-header">
              <h2>Recent Leads</h2>
              <button 
                className="button-text"
                onClick={handleViewAllLeads}
              >
                View All Leads
              </button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Pool</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.length > 0 ? (
                    recentLeads.map(lead => (
                      <tr key={lead.id}>
                        <td>{`${lead.firstName || ''} ${lead.lastName || ''}`}</td>
                        <td>{lead.phone || 'N/A'}</td>
                        <td>{lead.email || 'N/A'}</td>
                        <td>
                          <span className={`status-badge ${lead.status?.toLowerCase() || 'unknown'}`}>
                            {lead.status || 'Unknown'}
                          </span>
                        </td>
                        <td>{lead.pool_name || 'None'}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-button view-button"
                              onClick={() => navigate(`/leads/${lead.id}`)}
                              title="View Details"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            </button>
                            <button
                              className="action-button edit-button"
                              onClick={() => navigate(`/leads/${lead.id}/edit`)}
                              title="Edit"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                          </div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadManagement; 