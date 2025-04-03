import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  HomeOutlined,
  FlagOutlined,
  CompassOutlined,
  TeamOutlined,
  PhoneOutlined,
  SettingOutlined,
  CustomerServiceOutlined,
  BarChartOutlined,
  UserOutlined,
  AudioOutlined,
  FileTextOutlined,
  ApiOutlined,
  ApartmentOutlined,
  DownOutlined,
  RightOutlined,
  SafetyOutlined,
  LinkOutlined,
  MailOutlined,
  MessageOutlined
} from "@ant-design/icons";

const Sidebar = () => {
  const [expandedSections, setExpandedSections] = useState({
    callCenter: false,
    resources: false,
    settings: false
  });

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src="/logo.png" alt="Logo" className="logo-img" />
      </div>
      <nav className="sidebar-nav">
        {/* Main Navigation */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-nav-item ${isActive ? "active" : ""}`
          }
        >
          <HomeOutlined />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/campaigns"
          className={({ isActive }) =>
            `sidebar-nav-item ${isActive ? "active" : ""}`
          }
        >
          <FlagOutlined />
          <span>Campaign Management</span>
        </NavLink>

        <NavLink
          to="/journeys"
          className={({ isActive }) =>
            `sidebar-nav-item ${isActive ? "active" : ""}`
          }
        >
          <CompassOutlined />
          <span>Journey Management</span>
        </NavLink>

        <NavLink
          to="/email-templates"
          className={({ isActive }) =>
            `sidebar-nav-item ${isActive ? "active" : ""}`
          }
        >
          <MailOutlined />
          <span>Email Templates</span>
        </NavLink>
        
        <NavLink
          to="/sms-messaging"
          className={({ isActive }) =>
            `sidebar-nav-item ${isActive ? "active" : ""}`
          }
        >
          <MessageOutlined />
          <span>SMS Messaging</span>
        </NavLink>

        {/* Resources Section */}
        <div className="sidebar-divider"></div>
        <div className="sidebar-section">
          <div 
            className="sidebar-section-header" 
            onClick={() => toggleSection("resources")}
          >
            <TeamOutlined />
            <span>Resource Management</span>
            {expandedSections.resources ? <DownOutlined /> : <RightOutlined />}
          </div>
          {expandedSections.resources && (
            <div className="sidebar-section-content">
              <NavLink
                to="/leadpools"
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? "active" : ""}`
                }
              >
                <TeamOutlined />
                <span>Lead Pools</span>
              </NavLink>
              
              <NavLink
                to="/leads"
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? "active" : ""}`
                }
              >
                <UserOutlined />
                <span>Leads</span>
              </NavLink>
              
              <NavLink
                to="/didpools"
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? "active" : ""}`
                }
              >
                <PhoneOutlined />
                <span>DID Pools</span>
              </NavLink>
              
              <NavLink
                to="/dids"
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? "active" : ""}`
                }
              >
                <PhoneOutlined />
                <span>DID Numbers</span>
              </NavLink>
            </div>
          )}
        </div>
        
        {/* Call Center Section */}
        <div className="sidebar-divider"></div>
        <div className="sidebar-section">
          <div 
            className="sidebar-section-header" 
            onClick={() => toggleSection("callCenter")}
          >
            <CustomerServiceOutlined />
            <span>Call Center</span>
            {expandedSections.callCenter ? <DownOutlined /> : <RightOutlined />}
          </div>
          {expandedSections.callCenter && (
            <div className="sidebar-section-content">
              <NavLink
                to="/call-center"
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? "active" : ""}`
                }
              >
                <HomeOutlined />
                <span>Call Center Home</span>
              </NavLink>
              
              <NavLink
                to="/agent-dashboard"
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? "active" : ""}`
                }
              >
                <BarChartOutlined />
                <span>Real-Time Dashboard</span>
              </NavLink>
              
              <NavLink
                to="/agent"
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? "active" : ""}`
                }
              >
                <CustomerServiceOutlined />
                <span>Agent Interface</span>
              </NavLink>
              
              <NavLink
                to="/admin-dashboard"
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? "active" : ""}`
                }
              >
                <BarChartOutlined />
                <span>Admin Dashboard</span>
              </NavLink>
              
              <NavLink
                to="/recordings"
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? "active" : ""}`
                }
              >
                <AudioOutlined />
                <span>Recordings</span>
              </NavLink>
              
              <NavLink
                to="/callLogs"
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? "active" : ""}`
                }
              >
                <FileTextOutlined />
                <span>Call Logs</span>
              </NavLink>
              
              <NavLink
                to="/tcpa-config"
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? "active" : ""}`
                }
              >
                <SafetyOutlined />
                <span>TCPA Config</span>
              </NavLink>
              
              <NavLink
                to="/relationships"
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? "active" : ""}`
                }
              >
                <LinkOutlined />
                <span>Relationships</span>
              </NavLink>
              
              <NavLink
                to="/call-config"
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? "active" : ""}`
                }
              >
                <SettingOutlined />
                <span>Call Config</span>
              </NavLink>
              
              <NavLink
                to="/flow-inventory"
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? "active" : ""}`
                }
              >
                <ApartmentOutlined />
                <span>Flow Inventory</span>
              </NavLink>
              
              <NavLink
                to="/flow-builder"
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? "active" : ""}`
                }
              >
                <ApartmentOutlined />
                <span>Flow Builder</span>
              </NavLink>
            </div>
          )}
        </div>
        
        {/* Settings */}
        <div className="sidebar-divider"></div>
        <div className="sidebar-section">
          <div 
            className="sidebar-section-header" 
            onClick={() => toggleSection("settings")}
          >
            <SettingOutlined />
            <span>Settings</span>
            {expandedSections.settings ? <DownOutlined /> : <RightOutlined />}
          </div>
          {expandedSections.settings && (
            <div className="sidebar-section-content">
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? "active" : ""}`
                }
              >
                <SettingOutlined />
                <span>General Settings</span>
              </NavLink>
              
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? "active" : ""}`
                }
              >
                <UserOutlined />
                <span>User Profile</span>
              </NavLink>
              
              <NavLink
                to="/user-management"
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? "active" : ""}`
                }
              >
                <TeamOutlined />
                <span>User Management</span>
              </NavLink>
              
              <NavLink
                to="/integrations"
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? "active" : ""}`
                }
              >
                <ApiOutlined />
                <span>Integrations</span>
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
