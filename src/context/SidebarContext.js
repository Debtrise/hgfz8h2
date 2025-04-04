import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);

  const toggleSidebarMode = () => {
    setIsDemoMode(prev => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isDemoMode, toggleSidebarMode }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}; 