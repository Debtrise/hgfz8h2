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

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Track expanded states for each category
  const [expandedSections, setExpandedSections] = useState({
    campaigns: true,
    resources: true,
    callCenter: location.pathname.includes('/call-center'),
    settings: location.pathname.includes('/settings'),
    emailTemplates: location.pathname.includes('/email-templates'),
    smsMessaging: location.pathname.includes('/sms-messaging')
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

  return (
    <div className="app-container">
      <aside className={`sidebar ${sidebarVisible ? 'active' : ''}`}>
        <div className="sidebar-logo">
          <img src="/logo.png" alt="Logo" className="logo-img" />
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
            <DashboardOutlined />
            <span>Dashboard</span>
          </NavLink>

          {/* Campaign Management Section */}
          <div className="sidebar-category-header" onClick={() => toggleSection('campaigns')}>
            <div className="category-header-left">
              <FlagOutlined />
              <span>Campaign Management</span>
            </div>
            {expandedSections.campaigns ? <CaretDownOutlined /> : <CaretRightOutlined />}
          </div>
          
          {expandedSections.campaigns && (
            <div className="sidebar-category-content">
              <NavLink to="/campaigns" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
                <FlagOutlined />
                <span>Campaigns</span>
              </NavLink>

              <NavLink to="/journeys" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
                <CompassOutlined />
                <span>Journeys</span>
              </NavLink>

              <NavLink to="/forms" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
                <FormOutlined />
                <span>Forms</span>
              </NavLink>
            </div>
          )}

          <div className="sidebar-divider"></div>

          {/* Resource Management Section */}
          <div className="sidebar-category-header" onClick={() => toggleSection('resources')}>
            <div className="category-header-left">
              <DatabaseOutlined />
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

              <NavLink to="/did-pools" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
                <PhoneOutlined />
                <span>DID Pools</span>
              </NavLink>

              <NavLink to="/dids" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
                <PhoneOutlined />
                <span>DIDs List</span>
              </NavLink>

              <NavLink to="/email-templates" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
                <MailOutlined />
                <span>Email Templates</span>
              </NavLink>

              <NavLink to="/sms-messaging" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
                <MessageOutlined />
                <span>SMS Messaging</span>
              </NavLink>

              <NavLink to="/sms-blaster" className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
                <MessageOutlined />
                <span>SMS Blaster</span>
              </NavLink>
            </div>
          )}

          <div className="sidebar-divider"></div>
          
          {/* Call Center Section */}
          <div className="sidebar-category-header" onClick={() => toggleSection('callCenter')}>
            <div className="category-header-left">
              <PhoneOutlined />
              <span>Call Center</span>
            </div>
            {expandedSections.callCenter ? <CaretDownOutlined /> : <CaretRightOutlined />}
          </div>
          
          {expandedSections.callCenter && (
            <div className="sidebar-category-content">
              <NavLink 
                to="/call-center/real-time-dashboard" 
                className={({ isActive }) => `sidebar-nav-item submenu-item ${isActive ? "active" : ""}`}
              >
                <BarChartOutlined />
                <span>Real-Time Dashboard</span>
              </NavLink>

              <NavLink 
                to="/call-center/agent" 
                className={({ isActive }) => `sidebar-nav-item submenu-item ${isActive ? "active" : ""}`}
              >
                <CustomerServiceOutlined />
                <span>Agent Interface</span>
              </NavLink>

              <NavLink 
                to="/call-center/admin" 
                className={({ isActive }) => `sidebar-nav-item submenu-item ${isActive ? "active" : ""}`}
              >
                <SafetyOutlined />
                <span>Admin Dashboard</span>
              </NavLink>

              <NavLink 
                to="/call-center/FlowInventory" 
                className={({ isActive }) => `sidebar-nav-item submenu-item ${isActive ? "active" : ""}`}
              >
                <ApiOutlined />
                <span>Flow Inventory</span>
              </NavLink>

              <NavLink 
                to="/call-center/recordings" 
                className={({ isActive }) => `sidebar-nav-item submenu-item ${isActive ? "active" : ""}`}
              >
                <AudioOutlined />
                <span>Recordings</span>
              </NavLink>

              <NavLink 
                to="/call-center/call-logs" 
                className={({ isActive }) => `sidebar-nav-item submenu-item ${isActive ? "active" : ""}`}
              >
                <FileTextOutlined />
                <span>Call Logs</span>
              </NavLink>

              <NavLink 
                to="/call-center/call-config" 
                className={({ isActive }) => `sidebar-nav-item submenu-item ${isActive ? "active" : ""}`}
              >
                <SettingOutlined />
                <span>Call Config</span>
              </NavLink>

              <NavLink 
                to="/queue-builder" 
                className={({ isActive }) => `sidebar-nav-item submenu-item ${isActive ? "active" : ""}`}
              >
                <TeamOutlined />
                <span>Queue Builder</span>
              </NavLink>
            </div>
          )}

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

          <div className="sidebar-nav-item signout" onClick={handleSignOut}>
            <LogoutOutlined />
            <span>Sign Out</span>
          </div>
        </nav>
      </aside>

      {/* Add an overlay for mobile sidebar */}
      {sidebarVisible && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      <main className="main-content">
        <div className="header">
          <div className="header-left">
            {/* Mobile menu trigger */}
            <button className="menu-trigger" onClick={toggleSidebar}>
              <MenuOutlined />
            </button>
            {/* Hide the page title in the header for the Dashboard page */}
            {location.pathname !== '/dashboard' && (
              <h1 className="page-title">{getPageTitle(location.pathname)}</h1>
            )}
          </div>
          <div className="header-right">
            <span className="user-name">Steven Hernandez</span>
            <button className="sign-out-btn" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </div>

        <div className="content">
          <Outlet />
        </div>
      </main>
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

  // Form Builder routes
  if (pathname === "/forms") return "Forms";
  if (pathname.includes("/forms/new")) return "Create Form";
  if (pathname.includes("/forms/")) return "Edit Form";

  // Default fallback
  return "Dashboard";
}

export default Layout;
