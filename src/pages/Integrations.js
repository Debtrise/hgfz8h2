import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ApiOutlined,
  PlusOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  SyncOutlined,
  LinkOutlined,
  CheckCircleFilled,
  SettingOutlined,
  DatabaseOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import "../styles/new/settings.css";
import "../styles/new/integrations.css";
import { useIntegrations } from "../context/IntegrationsContext";

const Integrations = () => {
  const navigate = useNavigate();
  const { forthCRM, irsLogics } = useIntegrations();
  
  const [webhooks, setWebhooks] = useState([
    {
      id: 1,
      name: "New Call Notification",
      endpoint: "https://api.example.com/webhooks/new-call",
      event: "call.started",
      active: true,
      description: "Triggered when a new call is received"
    },
    {
      id: 2,
      name: "Call Completed",
      endpoint: "https://api.example.com/webhooks/call-completed",
      event: "call.completed",
      active: true,
      description: "Triggered when a call is completed"
    },
    {
      id: 3,
      name: "Agent Status Change",
      endpoint: "https://api.example.com/webhooks/agent-status",
      event: "agent.status.changed",
      active: false,
      description: "Triggered when an agent changes their status"
    }
  ]);
  
  // State for CRM integrations
  const [crmIntegrations, setCrmIntegrations] = useState([
    {
      id: "forth-crm",
      name: "Forth CRM",
      connected: forthCRM.connected,
      lastSync: forthCRM.lastSync,
      logo: "🏢", // Placeholder - would be an actual image path in production
      description: "Sync leads, contacts, and campaign data with Forth CRM",
      syncOptions: {
        contacts: true,
        leads: true,
        campaigns: true,
        tasks: true,
        callLogs: true
      }
    }
  ]);

  // State for Tax Service integrations
  const [taxIntegrations, setTaxIntegrations] = useState([
    {
      id: "irs-logics",
      name: "IRS Logics",
      connected: irsLogics.connected,
      lastSync: irsLogics.lastSync,
      logo: "📊", // Placeholder - would be an actual image path in production
      description: "Connect with IRS Logics for tax analytics and reporting",
      syncOptions: {
        taxDocuments: true,
        clientRecords: true,
        filingStatuses: true
      }
    }
  ]);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    endpoint: "",
    event: "call.started",
    description: "",
    active: true
  });
  
  // Integration connection states
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // States for integration connection modals
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [currentIntegration, setCurrentIntegration] = useState(null);
  const [integrationType, setIntegrationType] = useState(null);
  
  // State for integration sync settings
  const [showSyncSettings, setShowSyncSettings] = useState(false);
  const [syncFormData, setSyncFormData] = useState({});
  
  // State for API credentials
  const [apiCredentials, setApiCredentials] = useState({
    apiKey: '',
    apiSecret: ''
  });
  
  // Update integration status when context changes
  useEffect(() => {
    setCrmIntegrations(prevState => 
      prevState.map(integration => 
        integration.id === "forth-crm" 
          ? { ...integration, connected: forthCRM.connected, lastSync: forthCRM.lastSync }
          : integration
      )
    );
    
    setTaxIntegrations(prevState => 
      prevState.map(integration => 
        integration.id === "irs-logics" 
          ? { ...integration, connected: irsLogics.connected, lastSync: irsLogics.lastSync }
          : integration
      )
    );
  }, [forthCRM.connected, forthCRM.lastSync, irsLogics.connected, irsLogics.lastSync]);

  const handleBackButton = () => {
    navigate('/settings');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle API credential changes
  const handleCredentialChange = (e) => {
    const { name, value } = e.target;
    setApiCredentials({
      ...apiCredentials,
      [name]: value
    });
  };

  const handleAddWebhook = () => {
    setFormData({
      name: "",
      endpoint: "",
      event: "call.started",
      description: "",
      active: true
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEditWebhook = (webhook) => {
    setFormData({
      name: webhook.name,
      endpoint: webhook.endpoint,
      event: webhook.event,
      description: webhook.description,
      active: webhook.active
    });
    setCurrentId(webhook.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteWebhook = (id) => {
    setWebhooks(webhooks.filter(webhook => webhook.id !== id));
  };

  const handleToggleActive = (id) => {
    setWebhooks(webhooks.map(webhook => 
      webhook.id === id ? { ...webhook, active: !webhook.active } : webhook
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isEditing) {
      setWebhooks(webhooks.map(webhook => 
        webhook.id === currentId ? { ...webhook, ...formData } : webhook
      ));
    } else {
      const newWebhook = {
        id: webhooks.length > 0 ? Math.max(...webhooks.map(w => w.id)) + 1 : 1,
        ...formData
      };
      setWebhooks([...webhooks, newWebhook]);
    }
    
    setShowForm(false);
  };
  
  // Handle showing connect modal for integrations
  const handleShowConnectModal = (integration, type) => {
    setCurrentIntegration(integration);
    setIntegrationType(type);
    setApiCredentials({
      apiKey: '',
      apiSecret: ''
    });
    setShowConnectModal(true);
  };
  
  // Handle connecting an integration
  const handleConnectIntegration = async () => {
    const { apiKey, apiSecret } = apiCredentials;
    let success = false;
    
    if (integrationType === "crm") {
      success = await forthCRM.connect(apiKey, apiSecret);
    } else if (integrationType === "tax") {
      success = await irsLogics.connect(apiKey, apiSecret);
    }
    
    if (success) {
      setShowConnectModal(false);
    }
  };
  
  // Handle disconnecting an integration
  const handleDisconnectIntegration = (integration, type) => {
    if (type === "crm") {
      forthCRM.disconnect();
    } else if (type === "tax") {
      irsLogics.disconnect();
    }
  };
  
  // Handle showing sync settings modal
  const handleShowSyncSettings = (integration, type) => {
    setCurrentIntegration(integration);
    setIntegrationType(type);
    setSyncFormData(integration.syncOptions);
    setShowSyncSettings(true);
  };
  
  // Handle sync options change
  const handleSyncOptionChange = (e) => {
    const { name, checked } = e.target;
    setSyncFormData({
      ...syncFormData,
      [name]: checked
    });
  };
  
  // Handle saving sync settings
  const handleSaveSyncSettings = () => {
    if (integrationType === "crm") {
      setCrmIntegrations(crmIntegrations.map(integration => 
        integration.id === currentIntegration.id 
          ? { ...integration, syncOptions: syncFormData } 
          : integration
      ));
    } else if (integrationType === "tax") {
      setTaxIntegrations(taxIntegrations.map(integration => 
        integration.id === currentIntegration.id 
          ? { ...integration, syncOptions: syncFormData } 
          : integration
      ));
    }
    
    setShowSyncSettings(false);
  };
  
  // Handle manual sync
  const handleSyncNow = async (integration, type) => {
    if (type === "crm") {
      const options = crmIntegrations.find(item => item.id === integration.id)?.syncOptions || {};
      await forthCRM.sync(options);
    } else if (type === "tax") {
      const options = taxIntegrations.find(item => item.id === integration.id)?.syncOptions || {};
      await irsLogics.sync(options);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="settings-page">
      <button 
        className="button-secondary" 
        onClick={handleBackButton}
        style={{ marginBottom: 'var(--space-md)' }}
      >
        Back to Settings
      </button>
      
      <div className="feature-card">
        <div className="feature-title">
          <ApiOutlined className="icon" />
          Integrations
        </div>
        <div className="feature-description">
          Connect your platform with third-party services to sync and extend functionality.
        </div>
      </div>
      
      {/* CRM Integrations Section */}
      <div className="settings-form" style={{ marginTop: '24px' }}>
        <div className="settings-form-header">
          <h3>CRM Integrations</h3>
        </div>
        
        <p className="settings-description">
          Connect with customer relationship management platforms to sync leads, contacts, and campaign data.
        </p>
        
        <div className="integration-cards">
          {crmIntegrations.map(integration => (
            <div key={integration.id} className="integration-card">
              <div className="integration-header">
                <div className="integration-logo">{integration.logo}</div>
                <div className="integration-title">
                  <h4>{integration.name}</h4>
                  <span className={`connection-status ${integration.connected ? 'connected' : 'disconnected'}`}>
                    {integration.connected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
              </div>
              <p className="integration-description">{integration.description}</p>
              
              {integration.connected && (
                <div className="integration-details">
                  <div className="last-synced">
                    <span className="label">Last synced:</span>
                    <span className="value">{formatDate(integration.lastSync)}</span>
                  </div>
                  <div className="sync-options">
                    <span className="label">Syncing:</span>
                    <span className="value">
                      {Object.entries(integration.syncOptions)
                        .filter(([_, enabled]) => enabled)
                        .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
                        .join(', ')}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="integration-actions">
                {!integration.connected ? (
                  <button 
                    className="button-blue" 
                    onClick={() => handleShowConnectModal(integration, "crm")}
                  >
                    <LinkOutlined /> Connect
                  </button>
                ) : (
                  <>
                    <button 
                      className="button-blue" 
                      onClick={() => handleSyncNow(integration, "crm")}
                      disabled={forthCRM.syncInProgress}
                    >
                      {forthCRM.syncInProgress ? 'Syncing...' : <>
                        <SyncOutlined /> Sync Now
                      </>}
                    </button>
                    <button 
                      className="button-secondary" 
                      onClick={() => handleShowSyncSettings(integration, "crm")}
                    >
                      <SettingOutlined /> Settings
                    </button>
                    <button 
                      className="button-secondary" 
                      onClick={() => handleDisconnectIntegration(integration, "crm")}
                    >
                      Disconnect
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Tax Service Integrations Section */}
      <div className="settings-form" style={{ marginTop: '24px' }}>
        <div className="settings-form-header">
          <h3>Tax Service Integrations</h3>
        </div>
        
        <p className="settings-description">
          Connect with tax service providers to sync client tax information and streamline tax-related workflows.
        </p>
        
        <div className="integration-cards">
          {taxIntegrations.map(integration => (
            <div key={integration.id} className="integration-card">
              <div className="integration-header">
                <div className="integration-logo">{integration.logo}</div>
                <div className="integration-title">
                  <h4>{integration.name}</h4>
                  <span className={`connection-status ${integration.connected ? 'connected' : 'disconnected'}`}>
                    {integration.connected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
              </div>
              <p className="integration-description">{integration.description}</p>
              
              {integration.connected && (
                <div className="integration-details">
                  <div className="last-synced">
                    <span className="label">Last synced:</span>
                    <span className="value">{formatDate(integration.lastSync)}</span>
                  </div>
                  <div className="sync-options">
                    <span className="label">Syncing:</span>
                    <span className="value">
                      {Object.entries(integration.syncOptions)
                        .filter(([_, enabled]) => enabled)
                        .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
                        .join(', ')}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="integration-actions">
                {!integration.connected ? (
                  <button 
                    className="button-blue" 
                    onClick={() => handleShowConnectModal(integration, "tax")}
                  >
                    <LinkOutlined /> Connect
                  </button>
                ) : (
                  <>
                    <button 
                      className="button-blue" 
                      onClick={() => handleSyncNow(integration, "tax")}
                      disabled={irsLogics.syncInProgress}
                    >
                      {irsLogics.syncInProgress ? 'Syncing...' : <>
                        <SyncOutlined /> Sync Now
                      </>}
                    </button>
                    <button 
                      className="button-secondary" 
                      onClick={() => handleShowSyncSettings(integration, "tax")}
                    >
                      <SettingOutlined /> Settings
                    </button>
                    <button 
                      className="button-secondary" 
                      onClick={() => handleDisconnectIntegration(integration, "tax")}
                    >
                      Disconnect
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-form" style={{ marginTop: '24px' }}>
        <div className="settings-form-header">
          <h3>Webhook Integrations</h3>
          <button 
            className="button-blue" 
            onClick={handleAddWebhook}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <PlusOutlined /> Add Webhook
          </button>
        </div>
        
        <p className="settings-description">
          Webhooks allow external services to receive notifications when events occur in your call center.
        </p>

        {showForm && (
          <div className="webhook-form">
            <form onSubmit={handleSubmit}>
              <div className="form-header">
                <h3>{isEditing ? "Edit Webhook" : "Add New Webhook"}</h3>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="close-button"
                >
                  <CloseOutlined />
                </button>
              </div>
              <div className="form-group">
                <label htmlFor="name">Webhook Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  className="form-control" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  placeholder="Enter webhook name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="endpoint">Endpoint URL</label>
                <input 
                  type="url" 
                  id="endpoint" 
                  name="endpoint" 
                  className="form-control" 
                  value={formData.endpoint} 
                  onChange={handleInputChange} 
                  placeholder="https://example.com/webhook"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="event">Event Trigger</label>
                <select 
                  id="event" 
                  name="event" 
                  className="form-control" 
                  value={formData.event} 
                  onChange={handleInputChange}
                >
                  <option value="call.started">Call Started</option>
                  <option value="call.completed">Call Completed</option>
                  <option value="call.transferred">Call Transferred</option>
                  <option value="agent.status.changed">Agent Status Changed</option>
                  <option value="lead.created">Lead Created</option>
                  <option value="lead.updated">Lead Updated</option>
                  <option value="voicemail.received">Voicemail Received</option>
                  <option value="queue.threshold">Queue Threshold Reached</option>
                  <option value="campaign.started">Campaign Started</option>
                  <option value="campaign.completed">Campaign Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea 
                  id="description" 
                  name="description" 
                  className="form-control" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  placeholder="Enter a description for this webhook"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="active" 
                    checked={formData.active} 
                    onChange={handleInputChange} 
                  />
                  Active
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="button-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="button-blue">{isEditing ? "Update Webhook" : "Create Webhook"}</button>
              </div>
            </form>
          </div>
        )}

        {!showForm && (
          <div className="webhooks-list">
            {webhooks.length === 0 ? (
              <div className="empty-state">
                <ApiOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                <p>No webhooks configured</p>
                <button className="button-blue" onClick={handleAddWebhook}>Add Your First Webhook</button>
              </div>
            ) : (
              <table className="webhooks-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Event</th>
                    <th>Endpoint</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {webhooks.map(webhook => (
                    <tr key={webhook.id}>
                      <td>
                        <div className="webhook-name">
                          {webhook.name}
                          <div className="webhook-description">{webhook.description}</div>
                        </div>
                      </td>
                      <td>
                        <div className="event-badge">
                          {webhook.event.replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      </td>
                      <td className="endpoint-url">{webhook.endpoint}</td>
                      <td>
                        <div className="status-toggle">
                          <label className="switch">
                            <input 
                              type="checkbox" 
                              checked={webhook.active} 
                              onChange={() => handleToggleActive(webhook.id)} 
                            />
                            <span className="slider"></span>
                          </label>
                          <span className={`status-text ${webhook.active ? 'active' : 'inactive'}`}>
                            {webhook.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="icon-button" 
                            onClick={() => handleEditWebhook(webhook)}
                            title="Edit"
                          >
                            <EditOutlined />
                          </button>
                          <button 
                            className="icon-button delete" 
                            onClick={() => handleDeleteWebhook(webhook.id)}
                            title="Delete"
                          >
                            <DeleteOutlined />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <div className="settings-form" style={{ marginTop: '24px' }}>
        <div className="settings-form-header">
          <h3>API Keys</h3>
          <button className="button-blue">
            <PlusOutlined /> Generate New Key
          </button>
        </div>
        
        <p className="settings-description">
          API keys are used to authenticate requests to the API.
        </p>
        
        <div className="api-keys-info">
          <div className="info-box">
            <QuestionCircleOutlined className="info-icon" />
            <div className="info-content">
              <h4>Using the API</h4>
              <p>To use the API, include your API key in the header of your request:</p>
              <div className="code-snippet">
                <code>Authorization: Bearer YOUR_API_KEY</code>
              </div>
              <a href="#" className="doc-link">View API Documentation</a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Connection Modal */}
      {showConnectModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Connect to {currentIntegration.name}</h3>
              <button 
                className="close-button" 
                onClick={() => setShowConnectModal(false)}
              >
                <CloseOutlined />
              </button>
            </div>
            <div className="modal-content">
              <div className="connection-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Access your {currentIntegration.name} account</h4>
                    <p>Log in to your {currentIntegration.name} account and navigate to the API settings section.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Create API credentials</h4>
                    <p>Create a new API key or OAuth application in your {currentIntegration.name} dashboard.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Enter your credentials</h4>
                    <div className="form-group">
                      <label htmlFor="apiKey">API Key</label>
                      <input 
                        type="text" 
                        id="apiKey" 
                        name="apiKey"
                        className="form-control" 
                        value={apiCredentials.apiKey}
                        onChange={handleCredentialChange}
                        placeholder="Enter your API key" 
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="apiSecret">API Secret</label>
                      <input 
                        type="password" 
                        id="apiSecret" 
                        name="apiSecret"
                        className="form-control" 
                        value={apiCredentials.apiSecret}
                        onChange={handleCredentialChange}
                        placeholder="Enter your API secret" 
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button 
                  className="button-secondary" 
                  onClick={() => setShowConnectModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="button-blue" 
                  onClick={handleConnectIntegration}
                  disabled={!apiCredentials.apiKey || !apiCredentials.apiSecret}
                >
                  Connect {currentIntegration.name}
                </button>
              </div>
              {/* Display error message if there is one */}
              {((integrationType === "crm" && forthCRM.error) || 
                (integrationType === "tax" && irsLogics.error)) && (
                <div className="error-message">
                  {integrationType === "crm" ? forthCRM.error : irsLogics.error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Sync Settings Modal */}
      {showSyncSettings && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>{currentIntegration.name} Sync Settings</h3>
              <button 
                className="close-button" 
                onClick={() => setShowSyncSettings(false)}
              >
                <CloseOutlined />
              </button>
            </div>
            <div className="modal-content">
              <p>Choose which data to sync between your platform and {currentIntegration.name}.</p>
              
              <div className="sync-settings">
                {integrationType === "crm" ? (
                  <>
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input 
                          type="checkbox" 
                          name="contacts" 
                          checked={syncFormData.contacts} 
                          onChange={handleSyncOptionChange} 
                        />
                        Contacts
                      </label>
                      <p className="option-description">Sync contact details between systems</p>
                    </div>
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input 
                          type="checkbox" 
                          name="leads" 
                          checked={syncFormData.leads} 
                          onChange={handleSyncOptionChange} 
                        />
                        Leads
                      </label>
                      <p className="option-description">Sync lead information and statuses</p>
                    </div>
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input 
                          type="checkbox" 
                          name="campaigns" 
                          checked={syncFormData.campaigns} 
                          onChange={handleSyncOptionChange} 
                        />
                        Campaigns
                      </label>
                      <p className="option-description">Sync campaign data and performance metrics</p>
                    </div>
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input 
                          type="checkbox" 
                          name="tasks" 
                          checked={syncFormData.tasks} 
                          onChange={handleSyncOptionChange} 
                        />
                        Tasks
                      </label>
                      <p className="option-description">Sync tasks and follow-up activities</p>
                    </div>
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input 
                          type="checkbox" 
                          name="callLogs" 
                          checked={syncFormData.callLogs} 
                          onChange={handleSyncOptionChange} 
                        />
                        Call Logs
                      </label>
                      <p className="option-description">Sync call history and recordings</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input 
                          type="checkbox" 
                          name="taxDocuments" 
                          checked={syncFormData.taxDocuments} 
                          onChange={handleSyncOptionChange} 
                        />
                        Tax Documents
                      </label>
                      <p className="option-description">Sync tax forms and documents</p>
                    </div>
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input 
                          type="checkbox" 
                          name="clientRecords" 
                          checked={syncFormData.clientRecords} 
                          onChange={handleSyncOptionChange} 
                        />
                        Client Records
                      </label>
                      <p className="option-description">Sync client information and records</p>
                    </div>
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input 
                          type="checkbox" 
                          name="filingStatuses" 
                          checked={syncFormData.filingStatuses} 
                          onChange={handleSyncOptionChange} 
                        />
                        Filing Statuses
                      </label>
                      <p className="option-description">Sync tax filing statuses and deadlines</p>
                    </div>
                  </>
                )}
                
                <div className="sync-schedule">
                  <h4>Sync Schedule</h4>
                  <div className="form-group">
                    <label htmlFor="sync-frequency">Frequency</label>
                    <select 
                      id="sync-frequency" 
                      className="form-control"
                    >
                      <option value="real-time">Real-time</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  className="button-secondary" 
                  onClick={() => setShowSyncSettings(false)}
                >
                  Cancel
                </button>
                <button 
                  className="button-blue" 
                  onClick={handleSaveSyncSettings}
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Integrations; 