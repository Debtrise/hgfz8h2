import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  FlagOutlined,
  CompassOutlined,
  TeamOutlined,
  PhoneOutlined,
  SettingOutlined,
  DatabaseOutlined,
  LogoutOutlined,
  BranchesOutlined,
  MenuFoldOutlined,
  NumberOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import { useSidebar } from '../context/SidebarContext';
import './Sidebar.css';
import { Menu } from 'antd';
import AuthService from '../services/AuthService';

const Sidebar = () => {
  const { isOpen, toggleSidebar, isCollapsed, toggleCollapse } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const [openKeys, setOpenKeys] = React.useState(['did-section']);
  const [activeItem, setActiveItem] = React.useState('');

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const onOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          {isCollapsed ? (
            <img 
              src="/logo-small.png" 
              alt="Logo" 
              className="logo-small clickable" 
              onClick={() => {
                toggleCollapse();
                if (!isOpen) toggleSidebar();
              }}
            />
          ) : (
            <img src="/logo.png" alt="Logo" className="logo-full" />
          )}
        </div>
        <div className="sidebar-controls">
          {!isCollapsed && (
            <button className="collapse-button" onClick={toggleCollapse}>
              <MenuFoldOutlined />
            </button>
          )}
        </div>
      </div>
      <nav className="sidebar-nav">
        <Menu
          mode="inline"
          selectedKeys={[activeItem]}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          inlineCollapsed={isCollapsed}
          theme="dark"
        >
          <Menu.Item key="dashboard" icon={<HomeOutlined />}>
            <Link to="/dashboard">Dashboard</Link>
          </Menu.Item>

          <Menu.Item key="campaigns" icon={<FlagOutlined />}>
            <Link to="/campaigns">Campaigns</Link>
          </Menu.Item>

          <Menu.Item key="lead-journey" icon={<BranchesOutlined />}>
            <Link to="/journeys">Lead Journey</Link>
          </Menu.Item>

          <Menu.Item key="leads" icon={<TeamOutlined />}>
            <Link to="/lead-management">Leads</Link>
          </Menu.Item>

          <Menu.Item key="did-pools" icon={<PhoneOutlined />}>
            <Link to="/did-pools">DID Pools</Link>
          </Menu.Item>

          <Menu.SubMenu key="call-center" icon={<CustomerServiceOutlined />} title="Call Center">
            <Menu.Item key="agent-interface">
              <Link to="/call-center/agent">Agent Interface</Link>
            </Menu.Item>
            <Menu.Item key="real-time-dashboard">
              <Link to="/call-center/real-time-dashboard">Real-Time Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="call-logs">
              <Link to="/call-center/call-logs">Call Logs</Link>
            </Menu.Item>
            <Menu.Item key="recordings">
              <Link to="/call-center/recordings">Recordings</Link>
            </Menu.Item>
          </Menu.SubMenu>

          <Menu.Item key="settings" icon={<SettingOutlined />}>
            <Link to="/settings">Settings</Link>
          </Menu.Item>

          <Menu.Item 
            key="logout" 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            className="logout-item"
          >
            Logout
          </Menu.Item>
        </Menu>
      </nav>
    </div>
  );
};

export default Sidebar;
