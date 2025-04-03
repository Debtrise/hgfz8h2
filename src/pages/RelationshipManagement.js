import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ContactsOutlined, UserOutlined, HistoryOutlined } from '@ant-design/icons';
import "../styles/new/settings.css";

const RelationshipManagement = () => {
  const navigate = useNavigate();

  return (
    <div className="settings-page">
      <button 
        className="button-secondary" 
        onClick={() => navigate('/settings')}
        style={{ marginBottom: 'var(--space-md)' }}
      >
        Back to Settings
      </button>
      
      <div className="feature-card">
        <div className="feature-title">
          <ContactsOutlined className="icon" />
          Relationship Management
        </div>
        <div className="feature-description">
          Configure customer relationship settings and manage contact preferences.
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-card">
          <div className="settings-card-title">
            <ContactsOutlined className="icon" />
            Contact Preferences
          </div>
          <div className="settings-form" style={{ padding: 0, border: 'none', marginTop: 0 }}>
            <div className="form-group">
              <label>Contact Frequency</label>
              <select className="form-control">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Custom</option>
              </select>
            </div>
            <div className="form-group">
              <label>Preferred Contact Method</label>
              <select className="form-control">
                <option>Email</option>
                <option>Phone</option>
                <option>SMS</option>
              </select>
            </div>
            <div className="form-group">
              <label>Follow-up Timeline</label>
              <select className="form-control">
                <option>24 hours</option>
                <option>48 hours</option>
                <option>1 week</option>
                <option>Custom</option>
              </select>
            </div>
            <button className="button-blue">Save Changes</button>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-title">
            <UserOutlined className="icon" />
            Customer Segmentation
          </div>
          <div className="settings-form" style={{ padding: 0, border: 'none', marginTop: 0 }}>
            <div className="form-group">
              <label>Lead Status</label>
              <select className="form-control">
                <option>New</option>
                <option>Qualified</option>
                <option>Proposal</option>
                <option>Negotiation</option>
                <option>Closed</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority Level</label>
              <select className="form-control">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div className="form-group">
              <label>Industry</label>
              <select className="form-control">
                <option>Technology</option>
                <option>Healthcare</option>
                <option>Finance</option>
                <option>Retail</option>
                <option>Other</option>
              </select>
            </div>
            <button className="button-blue">Save Changes</button>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-title">
            <HistoryOutlined className="icon" />
            Communication History
          </div>
          <div className="settings-form" style={{ padding: 0, border: 'none', marginTop: 0 }}>
            <div className="form-group">
              <label>Record Type</label>
              <div className="checkbox-group">
                <label>
                  <input type="checkbox" checked readOnly /> Calls
                </label>
                <label>
                  <input type="checkbox" checked readOnly /> Emails
                </label>
                <label>
                  <input type="checkbox" checked readOnly /> Meetings
                </label>
                <label>
                  <input type="checkbox" checked readOnly /> Notes
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Retention Period</label>
              <select className="form-control">
                <option>6 months</option>
                <option>1 year</option>
                <option>2 years</option>
                <option>5 years</option>
              </select>
            </div>
            <button className="button-blue">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelationshipManagement;
