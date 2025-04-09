// Example in your Header or Layout component
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from 'antd';
import AuthService from '../services/AuthService';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await AuthService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-left"></div>
      <div>
        <span className="user-name">Steven Hernandez</span>
        <Button onClick={handleSignOut}>Sign Out</Button>
      </div>
    </header>
  );
};

export default Header;
