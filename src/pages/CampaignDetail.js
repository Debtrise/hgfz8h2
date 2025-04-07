import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ListPages.css";
import "./Campaigns.css";
import apiService from "../services/apiService";

const CampaignDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const campaignId = parseInt(id);
  
  const [isLoading, setIsLoading] = useState(true);
  const [campaign, setCampaign] = useState(null);
  const [assignedLeadPools, setAssignedLeadPools] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [timeRange, setTimeRange] = useState('7d');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [metricsHistory, setMetricsHistory] = useState([]);
  
  // Tabs for different sections
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch campaign data
  useEffect(() => {
    const fetchCampaignData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch campaign details
        const campaignResponse = await apiService.campaigns.getById(campaignId);
        setCampaign(campaignResponse.data);
        
        // Fetch lead pools
        const leadPoolsResponse = await apiService.leadPools.getAll({ campaignId });
        setAssignedLeadPools(leadPoolsResponse.data || []);
        
        // Fetch metrics using the new endpoint
        const metricsResponse = await apiService.campaigns.getMetrics(campaignId, timeRange);
        setMetrics(metricsResponse.data || {});
        
        // Fetch metrics history for different time ranges
        const timeRanges = ['24h', '7d', '30d'];
        const historyPromises = timeRanges.map(range => 
          apiService.campaigns.getMetrics(campaignId, range)
        );
        const historyResponses = await Promise.all(historyPromises);
        setMetricsHistory(historyResponses.map((response, index) => ({
          timeRange: timeRanges[index],
          data: response.data
        })));
      } catch (err) {
        console.error("Error fetching campaign data:", err);
        setError("Failed to load campaign details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCampaignData();
    
    // Set up polling for real-time metrics updates
    const metricsInterval = setInterval(async () => {
      try {
        const metricsResponse = await apiService.campaigns.getMetrics(campaignId, timeRange);
        setMetrics(metricsResponse.data || {});
      } catch (err) {
        console.error("Error updating metrics:", err);
      }
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(metricsInterval);
  }, [campaignId, timeRange]);

  // Handle back navigation
  const handleBack = () => {
    navigate("/campaigns");
  };

  // Handle edit campaign
  const handleEditCampaign = () => {
    navigate(`/campaigns/${campaignId}/edit`);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle campaign status change
  const handleStatusChange = async (newStatus) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let response;
      
      switch (newStatus) {
        case 'active':
          response = await apiService.campaigns.start(campaignId);
          break;
        case 'paused':
          response = await apiService.campaigns.pause(campaignId);
          break;
        case 'completed':
          response = await apiService.campaigns.complete(campaignId);
          break;
        default:
          throw new Error('Invalid status');
      }
      
      // Update the campaign status in the state
      setCampaign(prev => ({
        ...prev,
        status: newStatus
      }));
      
      // Show success message
      setSuccessMessage(`Campaign ${newStatus} successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error(`Error changing campaign status to ${newStatus}:`, err);
      setError(`Failed to change campaign status to ${newStatus}. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Format numbers with commas
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading campaign details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="error-state">
            <h2>Error Loading Campaign</h2>
            <p>{error}</p>
            <button className="button-blue" onClick={handleBack}>
              Back to Campaigns
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="error-state">
            <h2>Campaign Not Found</h2>
            <p>The campaign you're looking for doesn't exist or has been removed.</p>
            <button className="button-blue" onClick={handleBack}>
              Back to Campaigns
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
            Back to Campaigns
          </button>
          <div className="header-actions">
            <button className="button-blue" onClick={handleEditCampaign}>
              Edit Campaign
            </button>
          </div>
        </div>

        <div className="content-body">
          {/* Campaign Overview */}
          <div className="detail-card">
            <h1 className="campaign-title">{campaign.name}</h1>
            <div className="campaign-header-content">
              <p className="campaign-description">{campaign.description}</p>
              <div className="tags-container">
                <span className="tag">{campaign.brand}</span>
                <span className="tag">{campaign.source}</span>
              </div>
              <div className="campaign-status-container">
                <span className={`status-badge ${campaign.status?.toLowerCase() || 'inactive'}`}>
                  {campaign.status || 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Campaign Stats Summary */}
          <div className="stats-summary">
            <div className="stat-card">
              <div className="stat-title">Total Leads</div>
              <div className="stat-value">{formatNumber(metrics.overview?.totalLeads || 0)}</div>
              <div className="stat-subtitle">{formatNumber(metrics.overview?.activeLeads || 0)} active</div>
              <div className="stat-trend">
                {metricsHistory.length > 0 && (
                  <span className={`trend-indicator ${metrics.overview?.totalLeads > metricsHistory[0].data.overview?.totalLeads ? 'positive' : 'negative'}`}>
                    {((metrics.overview?.totalLeads - metricsHistory[0].data.overview?.totalLeads) / metricsHistory[0].data.overview?.totalLeads * 100).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Conversion Rate</div>
              <div className="stat-value">{metrics.overview?.conversionRate || 0}%</div>
              <div className="stat-trend">
                {metricsHistory.length > 0 && (
                  <span className={`trend-indicator ${metrics.overview?.conversionRate > metricsHistory[0].data.overview?.conversionRate ? 'positive' : 'negative'}`}>
                    {((metrics.overview?.conversionRate - metricsHistory[0].data.overview?.conversionRate)).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Total Calls</div>
              <div className="stat-value">{formatNumber(metrics.overview?.totalCalls || 0)}</div>
              <div className="stat-trend">
                {metricsHistory.length > 0 && (
                  <span className={`trend-indicator ${metrics.overview?.totalCalls > metricsHistory[0].data.overview?.totalCalls ? 'positive' : 'negative'}`}>
                    {((metrics.overview?.totalCalls - metricsHistory[0].data.overview?.totalCalls) / metricsHistory[0].data.overview?.totalCalls * 100).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Avg. Call Duration</div>
              <div className="stat-value">{metrics.overview?.averageCallDuration || '0:00'}</div>
              <div className="stat-trend">
                {metricsHistory.length > 0 && (
                  <span className={`trend-indicator ${metrics.overview?.averageCallDuration > metricsHistory[0].data.overview?.averageCallDuration ? 'positive' : 'negative'}`}>
                    {((metrics.overview?.averageCallDuration - metricsHistory[0].data.overview?.averageCallDuration) / metricsHistory[0].data.overview?.averageCallDuration * 100).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Campaign Tabs */}
          <div className="campaign-tabs">
            <button 
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => handleTabChange('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-button ${activeTab === 'performance' ? 'active' : ''}`}
              onClick={() => handleTabChange('performance')}
            >
              Performance
            </button>
            <button 
              className={`tab-button ${activeTab === 'leads' ? 'active' : ''}`}
              onClick={() => handleTabChange('leads')}
            >
              Leads
            </button>
            <button 
              className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => handleTabChange('settings')}
            >
              Settings
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'overview' && (
              <>
                <div className="detail-card">
                  <h3 className="detail-card-title">Campaign Overview</h3>
                  <div className="detail-card-content">
                    <div className="detail-info-grid">
                      <div className="detail-item">
                        <div className="detail-label">Campaign Name</div>
                        <div className="detail-value">{campaign.name}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Description</div>
                        <div className="detail-value">{campaign.description}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Brand</div>
                        <div className="detail-value">{campaign.brand}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Source</div>
                        <div className="detail-value">{campaign.source}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Status</div>
                        <div className="detail-value">
                          <span className={`status-badge ${campaign.status?.toLowerCase() || 'inactive'}`}>
                            {campaign.status || 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Created On</div>
                        <div className="detail-value">{new Date(campaign.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Last Modified</div>
                        <div className="detail-value">{new Date(campaign.updatedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="detail-card">
                  <h3 className="detail-card-title">Assigned Lead Pools</h3>
                  <div className="detail-card-content">
                    {assignedLeadPools.length > 0 ? (
                      <div className="lead-pools-list">
                        {assignedLeadPools.map(pool => (
                          <div className="lead-pool-item" key={pool.id}>
                            <div className="lead-pool-info">
                              <h4 className="lead-pool-name">{pool.title}</h4>
                              <p className="lead-pool-description">{pool.description}</p>
                              <div className="lead-pool-tags">
                                <span className="lead-pool-tag">{pool.leadAge}</span>
                                <span className="lead-pool-tag">{pool.brand}</span>
                                <span className="lead-pool-tag">{pool.source}</span>
                              </div>
                            </div>
                            <div className="lead-pool-stats">
                              <div className="lead-pool-stat">
                                <div className="lead-pool-stat-value">{formatNumber(pool.stats?.totalLeads || 0)}</div>
                                <div className="lead-pool-stat-label">Total Leads</div>
                              </div>
                              <div className="lead-pool-stat">
                                <div className="lead-pool-stat-value">{formatNumber(pool.stats?.activeLeads || 0)}</div>
                                <div className="lead-pool-stat-label">Active Leads</div>
                              </div>
                              <div className="lead-pool-stat">
                                <div className="lead-pool-stat-value">{pool.stats?.conversionRate || 0}%</div>
                                <div className="lead-pool-stat-label">Conversion</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <p>No lead pools assigned to this campaign.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'performance' && (
              <>
                <div className="detail-card">
                  <h3 className="detail-card-title">Campaign Performance</h3>
                  <div className="detail-card-content">
                    <div className="time-range-selector">
                      <button 
                        className={`time-range-button ${timeRange === '7d' ? 'active' : ''}`}
                        onClick={() => setTimeRange('7d')}
                      >
                        7 Days
                      </button>
                      <button 
                        className={`time-range-button ${timeRange === '30d' ? 'active' : ''}`}
                        onClick={() => setTimeRange('30d')}
                      >
                        30 Days
                      </button>
                      <button 
                        className={`time-range-button ${timeRange === '90d' ? 'active' : ''}`}
                        onClick={() => setTimeRange('90d')}
                      >
                        90 Days
                      </button>
                    </div>

                    <div className="performance-metrics">
                      <div className="performance-metric">
                        <div className="performance-metric-title">Total Calls</div>
                        <div className="performance-metric-value">{formatNumber(metrics.performance?.totalCalls || 0)}</div>
                        <div className="performance-metric-trend positive">
                          +{metrics.performance?.callTrend || 0}% vs previous period
                        </div>
                      </div>
                      <div className="performance-metric">
                        <div className="performance-metric-title">Conversion Rate</div>
                        <div className="performance-metric-value">{metrics.performance?.conversionRate || 0}%</div>
                        <div className="performance-metric-trend positive">
                          +{metrics.performance?.conversionTrend || 0}% vs previous period
                        </div>
                      </div>
                      <div className="performance-metric">
                        <div className="performance-metric-title">Avg. Call Duration</div>
                        <div className="performance-metric-value">{metrics.performance?.averageCallDuration || '0:00'}</div>
                        <div className="performance-metric-trend negative">
                          -{metrics.performance?.durationTrend || 0}% vs previous period
                        </div>
                      </div>
                    </div>

                    <div className="performance-chart">
                      {/* Chart would go here - placeholder for now */}
                      <div className="chart-placeholder">
                        <p>Call volume over time chart would be displayed here</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'leads' && (
              <>
                <div className="detail-card">
                  <h3 className="detail-card-title">Campaign Leads</h3>
                  <div className="detail-card-content">
                    <div className="leads-summary">
                      <div className="leads-summary-item">
                        <div className="leads-summary-value">{formatNumber(metrics.leads?.total || 0)}</div>
                        <div className="leads-summary-label">Total Leads</div>
                      </div>
                      <div className="leads-summary-item">
                        <div className="leads-summary-value">{formatNumber(metrics.leads?.active || 0)}</div>
                        <div className="leads-summary-label">Active Leads</div>
                      </div>
                      <div className="leads-summary-item">
                        <div className="leads-summary-value">{formatNumber(metrics.leads?.converted || 0)}</div>
                        <div className="leads-summary-label">Converted Leads</div>
                      </div>
                      <div className="leads-summary-item">
                        <div className="leads-summary-value">{formatNumber(metrics.leads?.pending || 0)}</div>
                        <div className="leads-summary-label">Pending Leads</div>
                      </div>
                    </div>

                    <div className="leads-table-placeholder">
                      <p>Leads table would be displayed here</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'settings' && (
              <>
                <div className="detail-card">
                  <h3 className="detail-card-title">Campaign Settings</h3>
                  <div className="detail-card-content">
                    <div className="detail-info-grid">
                      <div className="detail-item">
                        <div className="detail-label">Campaign Name</div>
                        <div className="detail-value">{campaign.name}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Description</div>
                        <div className="detail-value">{campaign.description}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Brand</div>
                        <div className="detail-value">{campaign.brand}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Source</div>
                        <div className="detail-value">{campaign.source}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Status</div>
                        <div className="detail-value">
                          <span className={`status-badge ${campaign.status?.toLowerCase() || 'inactive'}`}>
                            {campaign.status || 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Lead Pool ID</div>
                        <div className="detail-value">{campaign.leadPoolId}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">DID Pool ID</div>
                        <div className="detail-value">{campaign.didPoolId}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Created On</div>
                        <div className="detail-value">{new Date(campaign.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Last Modified</div>
                        <div className="detail-value">{new Date(campaign.updatedAt).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <h4 className="settings-subheading">Journey Mappings</h4>
                    {campaign.journeyMappings && campaign.journeyMappings.length > 0 ? (
                      <div className="journey-mappings-list">
                        {campaign.journeyMappings.map((mapping, index) => (
                          <div className="journey-mapping-item" key={index}>
                            <div className="journey-mapping-header">
                              <h5>Journey ID: {mapping.journeyId}</h5>
                            </div>
                            <div className="journey-mapping-details">
                              <div className="journey-mapping-detail">
                                <span className="detail-label">Lead Age Range:</span>
                                <span className="detail-value">{mapping.leadAgeMin} - {mapping.leadAgeMax} days</span>
                              </div>
                              <div className="journey-mapping-detail">
                                <span className="detail-label">Duration:</span>
                                <span className="detail-value">{mapping.durationDays} days</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <p>No journey mappings configured for this campaign.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail; 