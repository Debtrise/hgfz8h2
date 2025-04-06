import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './LeadManagement.css';
import { FaUsers, FaPhone, FaCheckCircle, FaExclamationCircle, FaArrowRight, FaFileImport, FaUserPlus, FaSearch } from 'react-icons/fa';
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get current user's tenant ID (assuming it's stored in localStorage)
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const tenantId = currentUser.tenantId || 1; // Default to 1 if not available
      
      const [poolsResponse, leadsResponse] = await Promise.all([
        apiService.leadPools.getAll(),
        apiService.leads.getByTenant(tenantId, { limit: 100 }) // Use tenant-specific endpoint
      ]);

      setLeadPools(poolsResponse.data || []);
      
      // Ensure leads is always an array
      const leadsData = Array.isArray(leadsResponse.data) ? leadsResponse.data : 
                        (leadsResponse.data && Array.isArray(leadsResponse.data.leads)) ? leadsResponse.data.leads : 
                        [];
      
      setLeads(leadsData);

      // Calculate statistics
      const activeLeads = leadsData.filter(lead => lead.status === 'active').length;
      const completedLeads = leadsData.filter(lead => lead.status === 'completed').length;
      const failedLeads = leadsData.filter(lead => lead.status === 'failed').length;

      setStats({
        totalLeads: leadsData.length,
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

  if (loading) {
    return (
      <div className="loading-state">
        <LoadingSpinner size="large" text="Loading lead management data..." />
      </div>
    );
  }

  if (error) {
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
                    {lead.firstName} {lead.lastName} - {lead.phoneNumber}
                  </div>
                  <div className="activity-details">
                    <span>Status: {lead.status}</span>
                    <span>Pool: {lead.poolName}</span>
                    <span>Last Updated: {new Date(lead.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button 
                  className="view-button"
                  onClick={() => navigate(`/leads/${lead.id}`)}
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