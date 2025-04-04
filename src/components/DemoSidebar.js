import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  HomeOutlined,
  FlagOutlined,
  CompassOutlined,
  PhoneOutlined,
  MessageOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  ApiOutlined,
  CaretDownOutlined,
  CaretRightOutlined
} from "@ant-design/icons";

const DemoSidebar = () => {
  const [expandedSections, setExpandedSections] = useState({
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
          <span>Campaigns</span>
        </NavLink>

        <NavLink
          to="/journeys"
          className={({ isActive }) =>
            `sidebar-nav-item ${isActive ? "active" : ""}`
          }
        >
          <CompassOutlined />
          <span>Journeys</span>
        </NavLink>

        <NavLink
          to="/did-lists"
          className={({ isActive }) =>
            `sidebar-nav-item ${isActive ? "active" : ""}`
          }
        >
          <PhoneOutlined />
          <span>DID Lists</span>
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

        <NavLink
          to="/sms-blaster"
          className={({ isActive }) =>
            `sidebar-nav-item ${isActive ? "active" : ""}`
          }
        >
          <ThunderboltOutlined />
          <span>SMS Blaster</span>
        </NavLink>

        <div className="sidebar-divider"></div>

        {/* Settings Section */}
        <div className="sidebar-category-header" onClick={() => toggleSection('settings')}>
          <div className="category-header-left">
            <SettingOutlined />
            <span>Settings</span>
          </div>
          {expandedSections.settings ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </div>
        
        {expandedSections.settings && (
          <div className="sidebar-category-content">
            <NavLink to="/settings" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
              <SettingOutlined />
              <span>General Settings</span>
            </NavLink>
            
            <NavLink to="/settings/profile" className={({ isActive }) => `sidebar-nav-item submenu-item ${isActive ? "active" : ""}`}>
              <UserOutlined />
              <span>User Profile</span>
            </NavLink>
            
            <NavLink to="/settings/users" className={({ isActive }) => `sidebar-nav-item submenu-item ${isActive ? "active" : ""}`}>
              <TeamOutlined />
              <span>User Management</span>
            </NavLink>
            
            <NavLink to="/settings/integrations" className={({ isActive }) => `sidebar-nav-item submenu-item ${isActive ? "active" : ""}`}>
              <ApiOutlined />
              <span>Integrations</span>
            </NavLink>
          </div>
        )}
      </nav>
    </div>
  );
};

export default DemoSidebar; 