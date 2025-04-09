import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = () => {
  const { isOpen, isCollapsed } = useSidebar();
  const location = useLocation();

  // Don't show sidebar on auth pages
  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(location.pathname.toLowerCase());

  return (
    <div className="layout">
      {!isAuthPage && <Sidebar />}
      <main className={`main-content ${isOpen ? 'sidebar-open' : ''} ${isCollapsed ? 'sidebar-collapsed' : ''} ${!isAuthPage ? '' : 'full-width'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
