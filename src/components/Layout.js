import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  FlagOutlined,
  PhoneOutlined,
  TeamOutlined,
  BarChartOutlined,
  CustomerServiceOutlined,
  AudioOutlined,
  SettingOutlined,
  LogoutOutlined,
  FileTextOutlined,
  ApiOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SecurityScanOutlined,
  BellOutlined,
  MenuOutlined,
  DatabaseOutlined,
  CompassOutlined,
  CloudOutlined,
  SafetyOutlined,
  CaretDownOutlined,
  CaretRightOutlined,
  MailOutlined,
  MessageOutlined,
  FormOutlined
} from '@ant-design/icons';
import { useSidebar } from '../context/SidebarContext';
import DemoSidebar from './DemoSidebar';
import SidebarToggle from './SidebarToggle';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDemoMode } = useSidebar();
  
  // Track expanded states for each category
  const [expandedSections, setExpandedSections] = useState({
    campaigns: true,
    resources: true,
    callCenter: location.pathname.includes('/call-center'),
    settings: location.pathname.includes('/settings'),
    emailTemplates: location.pathname.includes('/email-templates'),
    smsMessaging: location.pathname.includes('/sms-messaging'),
    didManagement: false,
    journeys: false
  });
  
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    console.log("User signed out");
    navigate("/Login");
  };

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const renderFullSidebar = () => (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src="/logo.png" alt="Logo" className="sidebar-logo" />
        <SidebarToggle />
      </div>

      <div className="sidebar-content">
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
          <DashboardOutlined />
          <span>Dashboard</span>
        </NavLink>

        <div className="sidebar-category-header" onClick={() => toggleSection('campaigns')}>
          <div className="category-header-left">
            <FlagOutlined />
            <span>Campaigns</span>
          </div>
          {expandedSections.campaigns ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </div>
        
        {expandedSections.campaigns && (
          <div className="sidebar-category-content">
            <NavLink to="/campaigns" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
              <FlagOutlined />
              <span>All Campaigns</span>
            </NavLink>
          </div>
        )}

        <div className="sidebar-category-header" onClick={() => toggleSection('resources')}>
          <div className="category-header-left">
            <TeamOutlined />
            <span>Resource Management</span>
          </div>
          {expandedSections.resources ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </div>
        
        {expandedSections.resources && (
          <div className="sidebar-category-content">
            <NavLink to="/lead-pools" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
              <TeamOutlined />
              <span>Lead Pools</span>
            </NavLink>

            <NavLink to="/leads" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
              <TeamOutlined />
              <span>Leads List</span>
            </NavLink>

            <NavLink to="/leads/import" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
              <FormOutlined />
              <span>Import Leads</span>
            </NavLink>

            <NavLink to="/leads/assignments" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
              <TeamOutlined />
              <span>Lead Assignments</span>
            </NavLink>

            <NavLink to="/lead-management" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
              <FormOutlined />
              <span>Lead Management</span>
            </NavLink>
          </div>
        )}

        <div className="sidebar-category-header" onClick={() => toggleSection('didManagement')}>
          <div className="category-header-left">
            <PhoneOutlined />
            <span>DID Management</span>
          </div>
          {expandedSections.didManagement ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </div>
        
        {expandedSections.didManagement && (
          <div className="sidebar-category-content">
            <NavLink to="/did-pools" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
              <PhoneOutlined />
              <span>DID Pools</span>
            </NavLink>

            <NavLink to="/dids" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
              <PhoneOutlined />
              <span>DID Details</span>
            </NavLink>
          </div>
        )}

        <div className="sidebar-category-header" onClick={() => toggleSection('callCenter')}>
          <div className="category-header-left">
            <PhoneOutlined />
            <span>Call Center</span>
          </div>
          {expandedSections.callCenter ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </div>
        
        {expandedSections.callCenter && (
          <div className="sidebar-category-content">
            <NavLink to="/call-center/agent" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
              <CustomerServiceOutlined />
              <span>Agent Interface</span>
            </NavLink>

            <NavLink to="/call-center/admin" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
              <BarChartOutlined />
              <span>Admin Dashboard</span>
            </NavLink>

            <NavLink to="/call-center/real-time-dashboard" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
              <BarChartOutlined />
              <span>Real-Time Dashboard</span>
            </NavLink>

            <NavLink to="/call-center/FlowInventory" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
              <PhoneOutlined />
              <span>Call Flows</span>
            </NavLink>

            <NavLink to="/call-center/recordings" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
              <AudioOutlined />
              <span>Recordings</span>
            </NavLink>

            <NavLink to="/call-center/call-logs" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
              <BarChartOutlined />
              <span>Call Logs</span>
            </NavLink>

            <NavLink to="/call-center/call-config" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
              <SettingOutlined />
              <span>Call Config</span>
            </NavLink>
          </div>
        )}

        <div className="sidebar-category-header" onClick={() => toggleSection('settings')}>
          <div className="category-header-left">
            <SettingOutlined />
            <span>Settings</span>
          </div>
          {expandedSections.settings ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </div>
        
        {expandedSections.settings && (
          <div className="sidebar-category-content">
            <NavLink to="/settings/profile" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
              <UserOutlined />
              <span>Profile</span>
            </NavLink>

            <NavLink to="/settings/users" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
              <UserOutlined />
              <span>Users</span>
            </NavLink>

            <NavLink to="/settings/brands-sources" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
              <FlagOutlined />
              <span>Brands & Sources</span>
            </NavLink>
          </div>
        )}

        <div className="sidebar-category-header" onClick={() => toggleSection('journeys')}>
          <div className="category-header-left">
            <CompassOutlined />
            <span>Journeys</span>
          </div>
          {expandedSections.journeys ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </div>
        
        {expandedSections.journeys && (
          <div className="sidebar-category-content">
            <NavLink to="/journeys" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
              <CompassOutlined />
              <span>All Journeys</span>
            </NavLink>

            <NavLink to="/journeys/builder" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
              <FormOutlined />
              <span>Journey Builder</span>
            </NavLink>
          </div>
        )}

        <div className="sidebar-footer">
          <button className="sidebar-nav-item logout-button" onClick={handleSignOut}>
            <LogoutOutlined />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="layout">
      {isDemoMode ? <DemoSidebar /> : renderFullSidebar()}
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

// Helper function to get page titles
function getPageTitle(pathname) {
  // Settings routes
  if (pathname.includes("/settings/profile")) return "User Profile";
  if (pathname.includes("/settings/roles")) return "Roles & Permissions";
  if (pathname.includes("/settings/notifications")) return "Notifications";
  if (pathname.includes("/settings/integrations")) return "Integrations";
  if (pathname.includes("/settings/users")) return "User Management";
  if (pathname === "/settings") return "Settings";
  
  // Relationship Management
  if (pathname === "/relationship") return "Relationship Management";
  if (pathname === "/relationships") return "Relationship Management";

  // Call Center routes
  if (pathname.includes("/call-center/agent")) return "Call Center - Agent Interface";
  if (pathname.includes("/call-center/admin")) return "Call Center - Admin Dashboard";
  if (pathname.includes("/call-center/real-time-dashboard")) return "Real-Time Call Center Dashboard";
  if (pathname === "/agent-dashboard") return "Real-Time Agent Dashboard";
  if (pathname.includes("/call-center/FlowInventory")) return "Call Center - Flow Inventory";
  if (pathname.includes("/call-center/recordings")) return "Call Center - Recordings";
  if (pathname.includes("/call-center/call-logs")) return "Call Center - Call Logs";
  if (pathname.includes("/call-center/call-config")) return "Call Center - Call Configuration";
  
  // Main Call Center routes
  if (pathname === "/callcenter") return "Call Center Home";
  if (pathname === "/call-center") return "Call Center Home";
  if (pathname === "/agent") return "Agent Interface";
  if (pathname === "/admin-dashboard") return "Admin Dashboard";
  if (pathname === "/recordings") return "Recordings";
  if (pathname === "/callLogs") return "Call Logs";
  if (pathname === "/tcpa-config") return "TCPA Configuration";
  if (pathname === "/call-config") return "Call Configuration";
  
  // Flow Builder routes
  if (pathname === "/flow-builder") return "Call Flow Builder";
  if (pathname === "/flow-inventory") return "Flow Inventory";

  // Integrations routes
  if (pathname === "/integrations") return "Integrations";
  
  // User Management route
  if (pathname === "/user-management") return "User Management";

  // Other main routes
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/campaigns") return "Campaigns";
  if (pathname.includes("/campaigns/new")) return "Create Campaign";
  if (pathname.includes("/campaigns/")) return "Edit Campaign";

  if (pathname === "/journeys") return "Journeys";
  if (pathname.includes("/journeys/builder")) return "Journey Builder";
  if (pathname.includes("/journey/")) return "Journey Details";
  if (pathname.includes("/journey-builder/")) return "Journey Builder";

  if (pathname === "/lead-pools") return "Lead Pools";
  if (pathname.includes("/lead-pools/")) return "Edit Lead Pool";
  if (pathname === "/leadpools") return "Lead Pools";
  if (pathname.includes("/leadpools/")) return "Edit Lead Pool";

  if (pathname === "/did-pools") return "DID Pools";
  if (pathname.includes("/did-pools/")) return "Edit DID Pool";
  if (pathname === "/didpools") return "DID Pools";
  if (pathname.includes("/didpools/")) return "Edit DID Pool";

  if (pathname === "/leads") return "Leads";
  if (pathname.includes("/leads/")) return "Lead Details";

  if (pathname === "/dids") return "DID Numbers";
  if (pathname.includes("/dids/")) return "DID Details";

  // Email Templates routes
  if (pathname === "/email-templates") return "Email Templates";
  if (pathname.includes("/email-templates/new")) return "Create Email Template";
  if (pathname.includes("/email-templates/")) return "Edit Email Template";
  
  // SMS Messaging route
  if (pathname === "/sms-messaging") return "SMS Messaging";
  if (pathname === "/sms-blaster") return "SMS Blaster";

  // Form Builder routes
  if (pathname === "/forms") return "Forms";
  if (pathname.includes("/forms/new")) return "Create Form";
  if (pathname.includes("/forms/")) return "Edit Form";

  // Default fallback
  return "Dashboard";
}

export default Layout;
