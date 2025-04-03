// Example in your Header or Layout component
import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const handleSignOut = () => {
    // Clear any stored auth data
    localStorage.removeItem("authToken");

    // Redirect to login page
    navigate("/Login");
  };

  return (
    <header className="header">
      <div className="header-left"></div>
      <div>
        <span className="user-name">Steven Hernandez</span>
        <button className="sign-out-btn" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </header>
  );
};

export default Header;
