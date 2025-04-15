import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  UserOutlined,
  SolutionOutlined,
  BellOutlined,
  ApiOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ContactsOutlined,
  ArrowLeftOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons';
import "../styles/new/settings.css";
import Integrations from "./Integrations";
import UserManagement from "./UserManagement";
import { FaUser, FaShieldAlt, FaBell, FaUsers, FaBuilding, FaCog, FaChartLine, FaPhone, FaHeadset, FaTag, FaFilter } from 'react-icons/fa';
import BrandSourceManagement from './BrandSourceManagement';
import LoadingIcon from '../components/LoadingIcon';
import AgentManagement from '../components/settings/AgentManagement';

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading of settings data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [path]);

  const renderBackButton = () => (
    <Link to="/settings" className="back-button">
      <ArrowLeftOutlined /> Back to Settings
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
      case '/settings/agents':
        return (
          <div className="settings-page">
            {renderBackButton()}
            <AgentManagement />
          </div>
        );
      case '/settings/agent-assignments':
        return (
          <div className="settings-page">
            {renderBackButton()}
            <div className="feature-card">
              <div className="feature-title">
                <TeamOutlined className="icon" />
                Agent & Ring Group Assignments
              </div>
            </div>
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
                  <CustomerServiceOutlined className="icon" />
                  Agent Management
                </div>
                <p className="settings-card-description">
                  Configure agent settings and performance metrics.
                </p>
                <button className="button-blue" onClick={() => navigate('/settings/agents')}>Configure</button>
              </div>

              <div className="settings-card">
                <div className="settings-card-title">
                  <TeamOutlined className="icon" />
                  Agent & Ring Group Assignments
                </div>
                <p className="settings-card-description">
                  Manage agent assignments to ring groups and call queues.
                </p>
                <button className="button-blue" onClick={() => navigate('/settings/agent-assignments')}>Configure</button>
              </div>

              <div className="settings-card">
                <div className="settings-card-title">
                  <ContactsOutlined className="icon" />
                  Relationship Management
                </div>
                <p className="settings-card-description">
                  Manage customer relationships and contact preferences.
                </p>
                <button className="button-blue" onClick={() => navigate('/settings/relationship')}>Configure</button>
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

              <div className="settings-card">
                <div className="settings-card-title">
                  <ApiOutlined className="icon" />
                  Webhook Configuration
                </div>
                <p className="settings-card-description">
                  Set up and manage webhooks for automated lead ingestion.
                </p>
                <button className="button-blue" onClick={() => navigate('/leads/webhooks')}>Configure</button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <LoadingIcon isLoading={loading} text="Loading settings...">
      {renderSection()}
    </LoadingIcon>
  );
};

export default Settings;
