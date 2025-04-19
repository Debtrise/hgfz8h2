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
  ShopOutlined,
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  FormOutlined,
  BarChartOutlined,
  MailOutlined,
  PhoneFilled,
  ScheduleOutlined,
  FileTextOutlined,
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

          <Menu.SubMenu key="marketplace" icon={<ShopOutlined />} title="Marketplace">
            <Menu.Item key="marketplace-results" icon={<DashboardOutlined />}>
              <Link to="/marketplace/results">Results</Link>
            </Menu.Item>
            <Menu.Item key="marketplace-buyer" icon={<ShoppingOutlined />}>
              <Link to="/marketplace/buyer">Buyer</Link>
            </Menu.Item>
            <Menu.Item key="marketplace-seller" icon={<UserOutlined />}>
              <Link to="/marketplace/seller">Seller</Link>
            </Menu.Item>
            <Menu.Item key="marketplace-settings" icon={<SettingOutlined />}>
              <Link to="/marketplace/settings">Settings</Link>
            </Menu.Item>
          </Menu.SubMenu>

          <Menu.SubMenu key="call-center" icon={<CustomerServiceOutlined />} title="Call Center">
            <Menu.Item key="agent-interface">
              <Link to="/agent">Agent Interface</Link>
            </Menu.Item>
            <Menu.Item key="real-time-dashboard">
              <Link to="/agent/real-time-dashboard">Real-Time Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="team">
              <Link to="/agent/team">Team</Link>
            </Menu.Item>
            <Menu.Item key="reports">
              <Link to="/agent/reports">Reports</Link>
            </Menu.Item>
            <Menu.Item key="schedule">
              <Link to="/agent/schedule">Schedule</Link>
            </Menu.Item>
            <Menu.Item key="call-logs">
              <Link to="/agent/call-logs">Call Logs</Link>
            </Menu.Item>
            <Menu.Item key="recordings">
              <Link to="/agent/recordings">Recordings</Link>
            </Menu.Item>
          </Menu.SubMenu>

          <Menu.SubMenu key="settings" icon={<SettingOutlined />} title="Settings">
            <Menu.Item key="settings-general">
              <Link to="/settings">General Settings</Link>
            </Menu.Item>
            <Menu.Item key="settings-profile">
              <Link to="/settings/profile">User Profile</Link>
            </Menu.Item>
            <Menu.Item key="settings-users">
              <Link to="/settings/users">User Management</Link>
            </Menu.Item>
            <Menu.Item key="settings-pbx">
              <Link to="/settings/pbx">PBX Management</Link>
            </Menu.Item>
            <Menu.Item key="settings-integrations">
              <Link to="/settings/integrations">Integrations</Link>
            </Menu.Item>
          </Menu.SubMenu>

          <Menu.Item key="form-builder" icon={<FormOutlined />}>
            <Link to="/form-builder">Form Builder</Link>
          </Menu.Item>

          <Menu.Item key="form-management" icon={<FormOutlined />}>
            <Link to="/forms">Form Management</Link>
          </Menu.Item>

          <Menu.Item 
            key="marketing"
            icon={<BarChartOutlined />}
            label="Marketing"
            link="/marketing"
          >
            <Link to="/marketing">Marketing</Link>
          </Menu.Item>

          <Menu.Item 
            key="email-manager"
            icon={<MailOutlined />}
            label="Email Manager"
            link="/marketing/email-manager"
          >
            <Link to="/marketing/email-manager">Email Manager</Link>
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
