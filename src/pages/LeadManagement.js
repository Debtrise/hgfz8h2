import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './ListPages.css';
import LoadingSpinner from '../components/LoadingSpinner';

const LeadManagement = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalLeads: 0,
    activePools: 0,
    leadsToday: 0,
    conversionRate: 0
  });
  const [recentPools, setRecentPools] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [filters, setFilters] = useState({
    brand: 'all',
    source: 'all'
  });
  const [brands, setBrands] = useState([]);
  const [sources, setSources] = useState([]);

  useEffect(() => {
    fetchData();
    fetchBrands();
    fetchSources();
  }, [filters]);

  const fetchBrands = async () => {
    try {
      const response = await apiService.brands.getAll();
      setBrands(response.data || []);
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  };

  const fetchSources = async () => {
    try {
      const response = await apiService.sources.getAll();
      setSources(response.data || []);
    } catch (err) {
      console.error('Error fetching sources:', err);
    }
  };

  const fetchData = async () => {
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
        source: filters.source !== 'all' ? filters.source : undefined
      };
      
      const leadsResponse = await apiService.leads.getAll(leadsParams);
      
      // Set recent leads
      setRecentLeads(leadsResponse.leads || []);

      // Fetch total leads count with filters
      const totalLeadsParams = {
        limit: 1, // We only need the count, not the actual leads
        status: filters.status !== 'all' ? filters.status : undefined,
        brand: filters.brand !== 'all' ? filters.brand : undefined,
        source: filters.source !== 'all' ? filters.source : undefined
      };
      
      const totalLeadsResponse = await apiService.leads.getAll(totalLeadsParams);

      // Calculate stats
      setStats({
        totalLeads: totalLeadsResponse.pagination?.total || 0,
        activePools: pools.filter(pool => pool.status === 'active').length,
        leadsToday: leadsResponse.today || 0,
        conversionRate: leadsResponse.conversionRate || 0
      });
    } catch (err) {
      console.error('Error fetching lead management data:', err);
      setError('Failed to load lead management data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreatePool = () => {
    navigate('/lead-pools/create');
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

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="loading-state">
            <LoadingSpinner size="large" text="Loading lead management data..." />
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
              Create Lead Pool
            </button>
            <button 
              className="button-secondary"
              onClick={handleImportLeads}
            >
              Import Leads
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button className="dismiss-button" onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="content-body">
          {/* Filters */}
          <div className="filters-container">
            <div className="filter-group">
              <label htmlFor="brand">Brand:</label>
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
            
            <div className="filter-group">
              <label htmlFor="source">Source:</label>
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

          {/* Stats Overview */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-title">Total Leads</div>
              <div className="stat-value">{stats.totalLeads.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Active Pools</div>
              <div className="stat-value">{stats.activePools}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Leads Today</div>
              <div className="stat-value">{stats.leadsToday.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Conversion Rate</div>
              <div className="stat-value">{stats.conversionRate}%</div>
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
                  {recentPools.map(pool => (
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
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="action-button edit-button"
                            onClick={() => navigate(`/lead-pools/${pool.id}/edit`)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                  {recentLeads.map(lead => (
                    <tr key={lead.id}>
                      <td>{`${lead.firstName} ${lead.lastName}`}</td>
                      <td>{lead.phone}</td>
                      <td>{lead.email}</td>
                      <td>
                        <span className={`status-badge ${lead.status}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td>{lead.pool_name}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-button view-button"
                            onClick={() => navigate(`/leads/${lead.id}`)}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="action-button edit-button"
                            onClick={() => navigate(`/leads/${lead.id}/edit`)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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