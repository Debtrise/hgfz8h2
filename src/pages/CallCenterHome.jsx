import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/CallCenterHome.css';

const CallCenterHome = () => {
  return (
    <div className="call-center-home">
      <div className="page-header">
        <h1>Call Center Hub</h1>
        <p>Access and manage all call center features and dashboards</p>
      </div>
      
      <div className="call-center-cards">
        <div className="feature-card">
          <div className="card-icon">
            <svg viewBox="0 0 24 24" width="40" height="40">
              <path fill="currentColor" d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
            </svg>
          </div>
          <h2>Real-Time Dashboard</h2>
          <p>Monitor live call center metrics, agent performance, and queue status</p>
          <Link to="/call-center/real-time-dashboard" className="card-link">Open Dashboard</Link>
        </div>
        
        <div className="feature-card">
          <div className="card-icon">
            <svg viewBox="0 0 24 24" width="40" height="40">
              <path fill="currentColor" d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z" />
            </svg>
          </div>
          <h2>Agent Interface</h2>
          <p>Access the dialing interface used by call center agents</p>
          <Link to="/call-center/agent" className="card-link">Open Agent Interface</Link>
        </div>
        
        <div className="feature-card">
          <div className="card-icon">
            <svg viewBox="0 0 24 24" width="40" height="40">
              <path fill="currentColor" d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
            </svg>
          </div>
          <h2>Admin Dashboard</h2>
          <p>Configure and manage call center settings, users, and permissions</p>
          <Link to="/call-center/admin" className="card-link">Open Admin Dashboard</Link>
        </div>
        
        <div className="feature-card">
          <div className="card-icon">
            <svg viewBox="0 0 24 24" width="40" height="40">
              <path fill="currentColor" d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" />
            </svg>
          </div>
          <h2>Flow Inventory</h2>
          <p>Manage and edit call flow templates and configurations</p>
          <Link to="/call-center/FlowInventory" className="card-link">Open Flow Inventory</Link>
        </div>
        
        <div className="feature-card">
          <div className="card-icon">
            <svg viewBox="0 0 24 24" width="40" height="40">
              <path fill="currentColor" d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
            </svg>
          </div>
          <h2>Recordings</h2>
          <p>Access and manage recorded call files and transcripts</p>
          <Link to="/call-center/recordings" className="card-link">Open Recordings</Link>
        </div>
        
        <div className="feature-card">
          <div className="card-icon">
            <svg viewBox="0 0 24 24" width="40" height="40">
              <path fill="currentColor" d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
          </div>
          <h2>Call Logs</h2>
          <p>View and search detailed logs of all call activity</p>
          <Link to="/call-center/call-logs" className="card-link">Open Call Logs</Link>
        </div>
      </div>
    </div>
  );
};

export default CallCenterHome; 