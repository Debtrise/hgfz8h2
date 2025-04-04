import React from 'react';
import { Button } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { useSidebar } from '../context/SidebarContext';

const SidebarToggle = () => {
  const { isDemoMode, toggleSidebarMode } = useSidebar();

  return (
    <Button
      type={isDemoMode ? "default" : "primary"}
      icon={<SwapOutlined />}
      onClick={toggleSidebarMode}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        backgroundColor: isDemoMode ? '#722ed1' : undefined,
        borderColor: isDemoMode ? '#722ed1' : undefined,
        color: isDemoMode ? 'white' : undefined,
      }}
    >
      {isDemoMode ? 'Show Full Menu' : 'Show Demo Menu'}
    </Button>
  );
};

export default SidebarToggle; 