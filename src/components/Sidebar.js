import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  MessageOutlined,
  DatabaseOutlined,
  BranchesOutlined
} from "@ant-design/icons";
import { useSidebar } from '../context/SidebarContext';
import './Sidebar.css';
import { Menu } from 'antd';

const Sidebar = () => {
  const { isOpen, toggleSidebar } = useSidebar();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    leads: true,
    callCenter: false,
    resources: false,
    settings: false,
    journeys: false
  });
  const [activeItem, setActiveItem] = useState('');

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  const handleItemClick = (item) => {
    setActiveItem(item);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isLeadsSectionActive = () => {
    return location.pathname.startsWith('/leads') || location.pathname.startsWith('/lead-pools');
  };

  const isJourneysSectionActive = () => {
    return location.pathname.startsWith('/journeys');
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Menu</h2>
        <button className="close-button" onClick={toggleSidebar}>
          &times;
        </button>
      </div>
      <nav className="sidebar-nav">
        <Menu
          mode="inline"
          selectedKeys={[activeItem]}
          openKeys={expandedSections}
          onOpenChange={(keys) => setExpandedSections(keys)}
        >
          <Menu.Item key="dashboard">
            <Link to="/dashboard">Dashboard</Link>
          </Menu.Item>

          <Menu.SubMenu
            key="leads"
            icon={<TeamOutlined />}
            title="Leads Management"
            className={isLeadsSectionActive() ? 'active-section' : ''}
          >
            <Menu.Item key="lead-pools">
              <Link to="/lead-pools">Lead Pools</Link>
            </Menu.Item>
            <Menu.Item key="all-leads">
              <Link to="/leads">All Leads</Link>
            </Menu.Item>
            <Menu.Item key="import-leads">
              <Link to="/leads/import">Import Leads</Link>
            </Menu.Item>
            <Menu.Item key="lead-assignments">
              <Link to="/leads/assignments">Lead Assignments</Link>
            </Menu.Item>
          </Menu.SubMenu>

          <Menu.SubMenu
            key="journeys"
            icon={<BranchesOutlined />}
            title="Journeys"
            className={isJourneysSectionActive() ? 'active-section' : ''}
          >
            <Menu.Item key="journey-builder">
              <Link to="/journeys/builder">Journey Builder</Link>
            </Menu.Item>
            <Menu.Item key="journey-list">
              <Link to="/journeys">All Journeys</Link>
            </Menu.Item>
          </Menu.SubMenu>

          <Menu.Item key="call-center">
            <Link to="/call-center">Call Center</Link>
          </Menu.Item>

          <Menu.Item key="resources">
            <Link to="/resources">Resources</Link>
          </Menu.Item>

          <Menu.Item key="settings">
            <Link to="/settings">Settings</Link>
          </Menu.Item>
        </Menu>
      </nav>
    </div>
  );
};

export default Sidebar;
