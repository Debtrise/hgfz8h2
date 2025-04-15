import React from "react";
import { Link } from "react-router-dom";
import "./AuthPages.css";

const Login = () => {
  return (
    <div className="auth-container gradient-animation">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-container">
            <img src="/logo.png" alt="Knittt Logo" className="auth-logo" />
          </div>
          <h1 className="auth-title">Welcome to Knittt</h1>
        </div>

        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <p className="login-text">Please select your login type</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Link to="/admin-login" className="auth-button" style={{ textDecoration: "none" }}>
            Admin Login
          </Link>
          
          <Link to="/agent-login" className="auth-button" style={{ textDecoration: "none" }}>
            Agent Login
          </Link>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/signup" className="auth-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
