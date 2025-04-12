import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ListPages.css";
import "./Campaigns.css";
import apiService from "../services/apiService";
import "./CampaignDetail.css";

const CampaignDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const campaignId = parseInt(id);
  
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    activeLeads: 0,
    conversionRate: 0,
    totalCalls: 0,
    avgCallDuration: '0:00'
  });
  const [assignedLeadPools, setAssignedLeadPools] = useState([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [metricsHistory, setMetricsHistory] = useState([]);

  // Fetch campaign data
  useEffect(() => {
    const loadCampaignData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch campaign details
        const campaignResponse = await apiService.campaigns.getById(campaignId);
        console.log('Campaign response:', campaignResponse);
        
        if (!campaignResponse?.data) {
          throw new Error('Campaign not found');
        }

        setCampaign(campaignResponse.data);

        // Fetch lead pools
        const leadPoolsResponse = await apiService.leadPools.getAll({ campaignId });
        setAssignedLeadPools(leadPoolsResponse.data || []);

        // Fetch campaign metrics
        try {
          const metricsResponse = await apiService.campaigns.getMetrics(campaignId);
          console.log('Metrics response:', metricsResponse);
          if (metricsResponse?.data) {
            setMetrics(metricsResponse.data);
          }
        } catch (err) {
          console.error('Error fetching metrics:', err);
          // Don't fail the whole page load if metrics fail
        }

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
        console.error('Error loading campaign:', err);
        setError(err.message || 'Failed to load campaign details');
      } finally {
        setLoading(false);
      }
    };

    loadCampaignData();
  }, [campaignId]);

  // Handle back navigation
  const handleBack = () => {
    navigate("/campaigns");
  };

  // Handle edit campaign
  const handleEdit = () => {
    navigate(`/campaigns/${campaignId}/edit`);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle campaign status change
  const handleStatusChange = async (newStatus) => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  // Format numbers with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0);
  };

  if (loading) {
    return (
      <div className="campaign-detail-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="campaign-detail-container">
        <div className="error-state">
          <h2>Error</h2>
          <p>{error}</p>
          <button className="button-primary" onClick={handleBack}>
            Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="campaign-detail-container">
        <div className="error-state">
          <h2>Campaign Not Found</h2>
          <p>The requested campaign could not be found.</p>
          <button className="button-primary" onClick={handleBack}>
            Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="campaign-detail-container">
      {/* Header */}
      <div className="detail-header">
        <div className="header-left">
          <button className="back-button" onClick={handleBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          <h1>{campaign.name}</h1>
        </div>
        <div className="header-actions">
          <button className="button-secondary" onClick={handleEdit}>
            Edit Campaign
          </button>
          <div className="status-badge" data-status={campaign.status || 'inactive'}>
            {campaign.status || 'Inactive'}
          </div>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Leads</h3>
          <div className="metric-value">{formatNumber(metrics.totalLeads)}</div>
          <div className="metric-label">Active: {formatNumber(metrics.activeLeads)}</div>
        </div>
        <div className="metric-card">
          <h3>Conversion Rate</h3>
          <div className="metric-value">{metrics.conversionRate}%</div>
          <div className="metric-label">Last 30 days</div>
        </div>
        <div className="metric-card">
          <h3>Total Calls</h3>
          <div className="metric-value">{formatNumber(metrics.totalCalls)}</div>
          <div className="metric-label">Avg Duration: {metrics.avgCallDuration}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'leads' ? 'active' : ''}`}
          onClick={() => handleTabChange('leads')}
        >
          Leads
        </button>
        <button 
          className={`tab-button ${activeTab === 'journeys' ? 'active' : ''}`}
          onClick={() => handleTabChange('journeys')}
        >
          Journeys
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
          <div className="overview-section">
            <div className="detail-card">
              <h2>Campaign Details</h2>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Description</label>
                  <p>{campaign.description || 'No description provided'}</p>
                </div>
                <div className="detail-item">
                  <label>Brand</label>
                  <p>{campaign.brand || 'Not specified'}</p>
                </div>
                <div className="detail-item">
                  <label>Source</label>
                  <p>{campaign.source || 'Not specified'}</p>
                </div>
                <div className="detail-item">
                  <label>Created</label>
                  <p>{new Date(campaign.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="leads-section">
            <div className="detail-card">
              <h2>Lead Distribution</h2>
              <div className="leads-stats">
                <div className="stat-item">
                  <label>New Leads</label>
                  <span>{formatNumber(metrics.newLeads || 0)}</span>
                </div>
                <div className="stat-item">
                  <label>Active Leads</label>
                  <span>{formatNumber(metrics.activeLeads || 0)}</span>
                </div>
                <div className="stat-item">
                  <label>Converted Leads</label>
                  <span>{formatNumber(metrics.convertedLeads || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'journeys' && (
          <div className="journeys-section">
            <div className="detail-card">
              <h2>Journey Mappings</h2>
              {campaign.journeyMappings && campaign.journeyMappings.length > 0 ? (
                <div className="journey-mappings">
                  {campaign.journeyMappings.map((mapping, index) => (
                    <div key={index} className="journey-mapping-card">
                      <h3>Journey {mapping.journeyId}</h3>
                      <div className="mapping-details">
                        <div className="mapping-item">
                          <label>Lead Age Range</label>
                          <span>{mapping.leadAgeMin} - {mapping.leadAgeMax} days</span>
                        </div>
                        <div className="mapping-item">
                          <label>Duration</label>
                          <span>{mapping.durationDays} days</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No journey mappings configured</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-section">
            <div className="detail-card">
              <h2>Campaign Settings</h2>
              <div className="settings-grid">
                <div className="setting-item">
                  <label>Lead Pool</label>
                  <p>ID: {campaign.leadPoolId}</p>
                </div>
                <div className="setting-item">
                  <label>DID Pool</label>
                  <p>ID: {campaign.didPoolId}</p>
                </div>
                <div className="setting-item">
                  <label>Status</label>
                  <div className="status-badge" data-status={campaign.status || 'inactive'}>
                    {campaign.status || 'Inactive'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignDetail; 