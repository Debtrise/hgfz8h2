import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  UserOutlined,
  SolutionOutlined,
  BellOutlined,
  ApiOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ContactsOutlined
} from '@ant-design/icons';
import "../styles/new/settings.css";
import Integrations from "./Integrations";
import UserManagement from "./UserManagement";
import { FaUser, FaShieldAlt, FaBell, FaUsers, FaBuilding, FaCog, FaChartLine, FaPhone, FaHeadset, FaTag, FaFilter } from 'react-icons/fa';
import BrandSourceManagement from './BrandSourceManagement';

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const renderBackButton = () => (
    <Link to="/settings" className="back-button">
      <FaArrowLeft /> Back to Settings
    </Link>
  );

  // Render specific section based on the route
  const renderSection = () => {
    switch (path) {
      case '/settings/profile':
        return (
          <div className="settings-page">
            {renderBackButton()}
            <div className="feature-card">
              <div className="feature-title">
                <SolutionOutlined className="icon" />
                User Profile
              </div>
              <div className="feature-description">
                Manage your personal information and preferences.
              </div>
            </div>
            {/* Add user profile specific content here */}
          </div>
        );
      case '/settings/roles':
        return (
          <div className="settings-page">
            {renderBackButton()}
            <div className="feature-card">
              <div className="feature-title">
                <TeamOutlined className="icon" />
                Roles & Permissions
              </div>
              <div className="feature-description">
                Configure user roles and access permissions.
              </div>
            </div>
            {/* Add roles & permissions specific content here */}
          </div>
        );
      case '/settings/notifications':
        return (
          <div className="settings-page">
            {renderBackButton()}
            <div className="feature-card">
              <div className="feature-title">
                <BellOutlined className="icon" />
                Notifications
              </div>
              <div className="feature-description">
                Manage your notification preferences.
              </div>
            </div>
            {/* Add notifications specific content here */}
          </div>
        );
      case '/settings/relationship':
        return (
          <div className="settings-page">
            {renderBackButton()}
            <div className="feature-card">
              <div className="feature-title">
                <ContactsOutlined className="icon" />
                Relationship Management
              </div>
              <div className="feature-description">
                Configure customer relationship settings and manage contact preferences.
              </div>
            </div>
            <div className="settings-form">
              <h3>Contact Preferences</h3>
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
        );
      case '/settings/agents':
        return (
          <div className="settings-page">
            {renderBackButton()}
            <div className="feature-card">
              <div className="feature-title">
                <TeamOutlined className="icon" />
                Agent Management
              </div>
              <div className="feature-description">
                Manage agent profiles, assignments, and performance settings.
              </div>
            </div>
            <div className="settings-form">
              <h3>Agent Settings</h3>
              <div className="form-group">
                <label>Default Call Queue Size</label>
                <input type="number" className="form-control" placeholder="Enter queue size" />
              </div>
              <div className="form-group">
                <label>Break Time Duration</label>
                <select className="form-control">
                  <option>15 minutes</option>
                  <option>30 minutes</option>
                  <option>45 minutes</option>
                  <option>60 minutes</option>
                </select>
              </div>
              <div className="form-group">
                <label>Performance Metrics</label>
                <div className="checkbox-group">
                  <label>
                    <input type="checkbox" /> Call Duration
                  </label>
                  <label>
                    <input type="checkbox" /> Resolution Rate
                  </label>
                  <label>
                    <input type="checkbox" /> Customer Satisfaction
                  </label>
                  <label>
                    <input type="checkbox" /> Response Time
                  </label>
                </div>
              </div>
              <button className="button-blue">Save Changes</button>
            </div>
          </div>
        );
      case '/settings/integrations':
        return <Integrations />;
      case '/settings/users':
        return <UserManagement />;
      case '/settings/brands-sources':
        return <BrandSourceManagement />;
      default:
        return (
          <div className="settings-page">
            <div className="feature-card">
              <div className="feature-title">
                <SafetyCertificateOutlined className="icon" />
                System Settings
              </div>
              <div className="feature-description">
                Configure your system preferences and account settings.
              </div>
            </div>

            <div className="settings-grid">
              <div className="settings-card">
                <div className="settings-card-title">
                  <TeamOutlined className="icon" />
                  User Management
                </div>
                <p className="settings-card-description">
                  Manage user accounts, roles and permissions.
                </p>
                <button className="button-blue" onClick={() => navigate('/settings/users')}>Configure</button>
              </div>

              <div className="settings-card">
                <div className="settings-card-title">
                  <SolutionOutlined className="icon" />
                  Company Profile
                </div>
                <p className="settings-card-description">
                  Update your company information and branding.
                </p>
                <button className="button-blue" onClick={() => navigate('/settings/profile')}>Configure</button>
              </div>

              <div className="settings-card">
                <div className="settings-card-title">
                  <BellOutlined className="icon" />
                  Notifications
                </div>
                <p className="settings-card-description">
                  Set up system and email notifications.
                </p>
                <button className="button-blue" onClick={() => navigate('/settings/notifications')}>Configure</button>
              </div>

              <div className="settings-card">
                <div className="settings-card-title">
                  <TeamOutlined className="icon" />
                  Agent Management
                </div>
                <p className="settings-card-description">
                  Configure agent settings and performance metrics.
                </p>
                <button className="button-blue" onClick={() => navigate('/settings/agents')}>Configure</button>
              </div>

              <div className="settings-card">
                <div className="settings-card-title">
                  <ContactsOutlined className="icon" />
                  Relationship Management
                </div>
                <p className="settings-card-description">
                  Manage customer relationships and contact preferences.
                </p>
                <button className="button-blue" onClick={() => navigate('/relationship')}>Configure</button>
              </div>

              <div className="settings-card">
                <div className="settings-card-title">
                  <ApiOutlined className="icon" />
                  Integrations
                </div>
                <p className="settings-card-description">
                  Connect with third-party services and APIs.
                </p>
                <button className="button-blue" onClick={() => navigate('/settings/integrations')}>Configure</button>
              </div>

              <div className="settings-card">
                <div className="settings-card-title">
                  <DatabaseOutlined className="icon" />
                  Data Management
                </div>
                <p className="settings-card-description">
                  Configure data retention and export options.
                </p>
                <button className="button-blue">Configure</button>
              </div>

              <div className="settings-card">
                <div className="settings-card-title">
                  <SafetyCertificateOutlined className="icon" />
                  Security
                </div>
                <p className="settings-card-description">
                  Manage security settings and access controls.
                </p>
                <button className="button-blue">Configure</button>
              </div>

              <div className="settings-card">
                <div className="settings-card-title">
                  <FaTag className="icon" />
                  Brands & Sources
                </div>
                <p className="settings-card-description">
                  Manage your brands and lead sources to better organize and track your campaigns.
                </p>
                <Link to="/settings/brands-sources" className="button-secondary">
                  Configure
                </Link>
              </div>
            </div>
          </div>
        );
    }
  };

  return renderSection();
};

export default Settings;
