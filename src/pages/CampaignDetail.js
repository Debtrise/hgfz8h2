import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ListPages.css";
import "./Campaigns.css";

const CampaignDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const campaignId = parseInt(id);
  
  const [isLoading, setIsLoading] = useState(true);
  const [campaign, setCampaign] = useState(null);
  const [assignedLeadPools, setAssignedLeadPools] = useState([]);
  const [assignedDIDPools, setAssignedDIDPools] = useState([]);
  const [journeys, setJourneys] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [timeRange, setTimeRange] = useState('7d');
  
  // Tabs for different sections
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch campaign data
  useEffect(() => {
    // Simulate API call to fetch campaign details
    setIsLoading(true);
    
    setTimeout(() => {
      // Sample campaign data
      const campaignData = {
        id: campaignId,
        name: "Web Form Nurture Campaign",
        description: "Campaign for all web form leads with automated email and SMS nurturing",
        status: "Active",
        createdDate: "2025-01-10",
        launchDate: "2025-01-15",
        lastModified: "2025-01-24",
        type: "Nurturing",
        target: "Leads",
        tags: ["Web Leads", "Nurturing", "Automated"],
        settings: {
          dailyLimit: 500,
          hoursOfOperation: "9:00 AM - 5:00 PM",
          daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          callbackStrategy: "Immediate",
          pacing: "Balanced",
          priority: "Medium"
        }
      };

      // Sample lead pools
      const leadPools = [
        {
          id: 1,
          title: "New Leads - Web",
          description: "All web leads aged 0-15 days from all marketing platforms",
          leadAge: "0-15",
          brand: "BDS",
          source: "Web Forms, Fb, TikTok",
          active: true,
          stats: {
            totalLeads: 1245,
            conversionRate: 8.4,
            activeLeads: 876
          }
        },
        {
          id: 2,
          title: "Callback Leads",
          description: "Leads that requested callbacks within last 30 days",
          leadAge: "0-30",
          brand: "BDS",
          source: "Callbacks",
          active: true,
          stats: {
            totalLeads: 328,
            conversionRate: 12.7,
            activeLeads: 248
          }
        }
      ];

      // Sample DID pools
      const didPools = [
        {
          id: 1,
          title: "Main Sales DIDs",
          description: "Primary phone numbers for outbound sales campaigns",
          brand: "BDS",
          source: "Outbound Sales",
          active: true,
          stats: {
            totalDIDs: 24,
            answerRate: 21.7,
            activeDIDs: 24
          }
        }
      ];

      // Sample journeys data
      const journeysData = [
        {
          id: 101,
          name: "Web Lead Nurture Flow",
          description: "Email and SMS sequence for web leads",
          type: "Email + SMS",
          status: "Active",
          steps: 8,
          stats: {
            leadsEntered: 876,
            completionRate: 68.5,
            conversionRate: 9.2
          }
        },
        {
          id: 102,
          name: "Call Back Flow",
          description: "Workflow for leads requesting callbacks",
          type: "Call Sequence",
          status: "Active",
          steps: 5,
          stats: {
            leadsEntered: 248,
            completionRate: 82.3,
            conversionRate: 14.6
          }
        }
      ];

      // Sample performance metrics
      const metricsData = {
        overview: {
          totalLeads: 1573,
          activeLeads: 1124,
          pausedLeads: 449,
          completedJourneys: 428,
          averageCompletionTime: "8 days",
          conversionRate: 9.8
        },
        daily: [
          {
            date: "2025-01-15",
            leadsEntered: 215,
            completedJourneys: 0,
            conversions: 0,
            calls: 182,
            emails: 215,
            sms: 158,
          },
          {
            date: "2025-01-16",
            leadsEntered: 198,
            completedJourneys: 0,
            conversions: 0,
            calls: 176,
            emails: 198,
            sms: 142,
          },
          {
            date: "2025-01-17",
            leadsEntered: 224,
            completedJourneys: 0,
            conversions: 0,
            calls: 196,
            emails: 224,
            sms: 183,
          },
          {
            date: "2025-01-18",
            leadsEntered: 182,
            completedJourneys: 0,
            conversions: 8,
            calls: 164,
            emails: 182,
            sms: 148,
          },
          {
            date: "2025-01-19",
            leadsEntered: 146,
            completedJourneys: 12,
            conversions: 15,
            calls: 132,
            emails: 146,
            sms: 121,
          },
          {
            date: "2025-01-20",
            leadsEntered: 208,
            completedJourneys: 48,
            conversions: 22,
            calls: 187,
            emails: 208,
            sms: 172,
          },
          {
            date: "2025-01-21",
            leadsEntered: 192,
            completedJourneys: 112,
            conversions: 29,
            calls: 178,
            emails: 192,
            sms: 156,
          },
          {
            date: "2025-01-22",
            leadsEntered: 208,
            completedJourneys: 186,
            conversions: 38,
            calls: 194,
            emails: 208,
            sms: 177,
          },
        ],
        channels: {
          email: {
            sent: 1573,
            opened: 948,
            clicked: 521,
            openRate: 60.3,
            clickRate: 33.1
          },
          sms: {
            sent: 1257,
            delivered: 1208,
            responded: 384,
            deliveryRate: 96.1,
            responseRate: 30.5
          },
          call: {
            attempted: 1409,
            connected: 628,
            positive: 276,
            connectRate: 44.6,
            positiveRate: 19.6
          }
        }
      };

      setCampaign(campaignData);
      setAssignedLeadPools(leadPools);
      setAssignedDIDPools(didPools);
      setJourneys(journeysData);
      setMetrics(metricsData);
      setIsLoading(false);
    }, 800);
  }, [campaignId]);

  // Functions for navigation and actions
  const handleBack = () => {
    navigate('/campaigns');
  };

  const handleEditCampaign = () => {
    navigate(`/campaigns/${campaignId}`);
  };

  const viewLeadPool = (poolId) => {
    navigate(`/leads/pools/${poolId}`);
  };

  const viewDIDPool = (poolId) => {
    navigate(`/dids/pools/${poolId}`);
  };

  const viewJourney = (journeyId) => {
    navigate(`/journeys/builder/${journeyId}`);
  };

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Format numbers with commas
  const formatNumber = (num) => {
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
                {campaign.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              <div className="campaign-status-container">
                <span className={`status-badge ${campaign.status.toLowerCase()}`}>
                  {campaign.status}
                </span>
              </div>
            </div>
          </div>

          {/* Campaign Stats Summary */}
          <div className="stats-summary">
            <div className="stat-card">
              <div className="stat-title">Total Leads</div>
              <div className="stat-value">{formatNumber(metrics.overview.totalLeads)}</div>
              <div className="stat-subtitle">{metrics.overview.activeLeads} active</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Conversion Rate</div>
              <div className="stat-value">{metrics.overview.conversionRate}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Journeys Completed</div>
              <div className="stat-value">{formatNumber(metrics.overview.completedJourneys)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Avg. Completion Time</div>
              <div className="stat-value">{metrics.overview.averageCompletionTime}</div>
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
              className={`tab-button ${activeTab === 'channels' ? 'active' : ''}`}
              onClick={() => handleTabChange('channels')}
            >
              Channels
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
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Assigned Lead Pools */}
                <div className="detail-card">
                  <h3 className="detail-card-title">Lead Pools</h3>
                  <div className="detail-card-content">
                    {assignedLeadPools.length > 0 ? (
                      <div className="items-list">
                        {assignedLeadPools.map(pool => (
                          <div key={pool.id} className="list-item pool-item">
                            <div className="item-info" onClick={() => viewLeadPool(pool.id)}>
                              <div className="item-name">{pool.title}</div>
                              <div className="item-description">{pool.description}</div>
                              <div className="item-meta">
                                <span>Source: {pool.source}</span>
                                <span>Lead Age: {pool.leadAge} days</span>
                              </div>
                            </div>
                            <div className="item-stats">
                              <div className="stat-pill">
                                <span className="stat-label">Leads</span>
                                <span className="stat-value">{formatNumber(pool.stats.totalLeads)}</span>
                              </div>
                              <div className="stat-pill">
                                <span className="stat-label">Conversion</span>
                                <span className="stat-value">{pool.stats.conversionRate}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <p>No lead pools assigned to this campaign</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assigned DID Pools */}
                <div className="detail-card">
                  <h3 className="detail-card-title">DID Pools</h3>
                  <div className="detail-card-content">
                    {assignedDIDPools.length > 0 ? (
                      <div className="items-list">
                        {assignedDIDPools.map(pool => (
                          <div key={pool.id} className="list-item pool-item">
                            <div className="item-info" onClick={() => viewDIDPool(pool.id)}>
                              <div className="item-name">{pool.title}</div>
                              <div className="item-description">{pool.description}</div>
                              <div className="item-meta">
                                <span>Source: {pool.source}</span>
                                <span>Brand: {pool.brand}</span>
                              </div>
                            </div>
                            <div className="item-stats">
                              <div className="stat-pill">
                                <span className="stat-label">DIDs</span>
                                <span className="stat-value">{pool.stats.totalDIDs}</span>
                              </div>
                              <div className="stat-pill">
                                <span className="stat-label">Answer Rate</span>
                                <span className="stat-value">{pool.stats.answerRate}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <p>No DID pools assigned to this campaign</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assigned Journeys */}
                <div className="detail-card">
                  <h3 className="detail-card-title">Journeys</h3>
                  <div className="detail-card-content">
                    {journeys.length > 0 ? (
                      <div className="items-list">
                        {journeys.map(journey => (
                          <div key={journey.id} className="list-item journey-item">
                            <div className="item-info" onClick={() => viewJourney(journey.id)}>
                              <div className="item-name">{journey.name}</div>
                              <div className="item-description">{journey.description}</div>
                              <div className="item-meta">
                                <span>Type: {journey.type}</span>
                                <span>Steps: {journey.steps}</span>
                                <span className={`status-badge ${journey.status.toLowerCase()}`}>
                                  {journey.status}
                                </span>
                              </div>
                            </div>
                            <div className="item-stats">
                              <div className="stat-pill">
                                <span className="stat-label">Leads</span>
                                <span className="stat-value">{formatNumber(journey.stats.leadsEntered)}</span>
                              </div>
                              <div className="stat-pill">
                                <span className="stat-label">Completion</span>
                                <span className="stat-value">{journey.stats.completionRate}%</span>
                              </div>
                              <div className="stat-pill">
                                <span className="stat-label">Conversion</span>
                                <span className="stat-value">{journey.stats.conversionRate}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <p>No journeys assigned to this campaign</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <>
                <div className="detail-card">
                  <div className="detail-card-header">
                    <h3 className="detail-card-title">Performance Metrics</h3>
                    <div className="time-range-selector">
                      <label>Time Range:</label>
                      <select value={timeRange} onChange={handleTimeRangeChange}>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="all">All Time</option>
                      </select>
                    </div>
                  </div>
                  <div className="detail-card-content">
                    <div className="performance-chart-container">
                      <h4>Daily Performance</h4>
                      <div className="chart-placeholder">
                        <p>Chart showing daily performance metrics would be displayed here.</p>
                        <p>Including new leads, completions, conversions, and activities.</p>
                      </div>
                    </div>
                    <div className="performance-table">
                      <h4>Performance Data</h4>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>New Leads</th>
                            <th>Completions</th>
                            <th>Conversions</th>
                            <th>Calls</th>
                            <th>Emails</th>
                            <th>SMS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {metrics.daily.map((day) => (
                            <tr key={day.date}>
                              <td>{new Date(day.date).toLocaleDateString()}</td>
                              <td>{day.leadsEntered}</td>
                              <td>{day.completedJourneys}</td>
                              <td>{day.conversions}</td>
                              <td>{day.calls}</td>
                              <td>{day.emails}</td>
                              <td>{day.sms}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Channels Tab */}
            {activeTab === 'channels' && (
              <>
                <div className="channels-grid">
                  {/* Email Channel */}
                  <div className="detail-card">
                    <h3 className="detail-card-title">Email Performance</h3>
                    <div className="detail-card-content">
                      <div className="channel-stats">
                        <div className="channel-stat">
                          <div className="channel-stat-label">Sent</div>
                          <div className="channel-stat-value">{formatNumber(metrics.channels.email.sent)}</div>
                        </div>
                        <div className="channel-stat">
                          <div className="channel-stat-label">Opened</div>
                          <div className="channel-stat-value">{formatNumber(metrics.channels.email.opened)}</div>
                        </div>
                        <div className="channel-stat">
                          <div className="channel-stat-label">Clicked</div>
                          <div className="channel-stat-value">{formatNumber(metrics.channels.email.clicked)}</div>
                        </div>
                        <div className="channel-stat">
                          <div className="channel-stat-label">Open Rate</div>
                          <div className="channel-stat-value">{metrics.channels.email.openRate}%</div>
                        </div>
                        <div className="channel-stat">
                          <div className="channel-stat-label">Click Rate</div>
                          <div className="channel-stat-value">{metrics.channels.email.clickRate}%</div>
                        </div>
                      </div>
                      <div className="chart-placeholder">
                        <p>Email performance chart would be displayed here.</p>
                      </div>
                    </div>
                  </div>

                  {/* SMS Channel */}
                  <div className="detail-card">
                    <h3 className="detail-card-title">SMS Performance</h3>
                    <div className="detail-card-content">
                      <div className="channel-stats">
                        <div className="channel-stat">
                          <div className="channel-stat-label">Sent</div>
                          <div className="channel-stat-value">{formatNumber(metrics.channels.sms.sent)}</div>
                        </div>
                        <div className="channel-stat">
                          <div className="channel-stat-label">Delivered</div>
                          <div className="channel-stat-value">{formatNumber(metrics.channels.sms.delivered)}</div>
                        </div>
                        <div className="channel-stat">
                          <div className="channel-stat-label">Responded</div>
                          <div className="channel-stat-value">{formatNumber(metrics.channels.sms.responded)}</div>
                        </div>
                        <div className="channel-stat">
                          <div className="channel-stat-label">Delivery Rate</div>
                          <div className="channel-stat-value">{metrics.channels.sms.deliveryRate}%</div>
                        </div>
                        <div className="channel-stat">
                          <div className="channel-stat-label">Response Rate</div>
                          <div className="channel-stat-value">{metrics.channels.sms.responseRate}%</div>
                        </div>
                      </div>
                      <div className="chart-placeholder">
                        <p>SMS performance chart would be displayed here.</p>
                      </div>
                    </div>
                  </div>

                  {/* Call Channel */}
                  <div className="detail-card">
                    <h3 className="detail-card-title">Call Performance</h3>
                    <div className="detail-card-content">
                      <div className="channel-stats">
                        <div className="channel-stat">
                          <div className="channel-stat-label">Attempted</div>
                          <div className="channel-stat-value">{formatNumber(metrics.channels.call.attempted)}</div>
                        </div>
                        <div className="channel-stat">
                          <div className="channel-stat-label">Connected</div>
                          <div className="channel-stat-value">{formatNumber(metrics.channels.call.connected)}</div>
                        </div>
                        <div className="channel-stat">
                          <div className="channel-stat-label">Positive</div>
                          <div className="channel-stat-value">{formatNumber(metrics.channels.call.positive)}</div>
                        </div>
                        <div className="channel-stat">
                          <div className="channel-stat-label">Connect Rate</div>
                          <div className="channel-stat-value">{metrics.channels.call.connectRate}%</div>
                        </div>
                        <div className="channel-stat">
                          <div className="channel-stat-label">Positive Rate</div>
                          <div className="channel-stat-value">{metrics.channels.call.positiveRate}%</div>
                        </div>
                      </div>
                      <div className="chart-placeholder">
                        <p>Call performance chart would be displayed here.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Settings Tab */}
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
                        <div className="detail-label">Campaign Type</div>
                        <div className="detail-value">{campaign.type}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Target</div>
                        <div className="detail-value">{campaign.target}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Status</div>
                        <div className="detail-value">
                          <span className={`status-badge ${campaign.status.toLowerCase()}`}>
                            {campaign.status}
                          </span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Created On</div>
                        <div className="detail-value">{new Date(campaign.createdDate).toLocaleDateString()}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Launch Date</div>
                        <div className="detail-value">{new Date(campaign.launchDate).toLocaleDateString()}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Last Modified</div>
                        <div className="detail-value">{new Date(campaign.lastModified).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <h4 className="settings-subheading">Operational Settings</h4>
                    <div className="detail-info-grid">
                      <div className="detail-item">
                        <div className="detail-label">Daily Limit</div>
                        <div className="detail-value">{campaign.settings.dailyLimit} leads</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Hours of Operation</div>
                        <div className="detail-value">{campaign.settings.hoursOfOperation}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Days of Week</div>
                        <div className="detail-value">{campaign.settings.daysOfWeek.join(", ")}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Callback Strategy</div>
                        <div className="detail-value">{campaign.settings.callbackStrategy}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Pacing</div>
                        <div className="detail-value">{campaign.settings.pacing}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Priority</div>
                        <div className="detail-value">{campaign.settings.priority}</div>
                      </div>
                    </div>
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