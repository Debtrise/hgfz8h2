import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

const Dashboard = () => {
  // State for dial speed controls
  const [dialSpeed, setDialSpeed] = useState(5);
  const [dialRatio, setDialRatio] = useState('3:1');
  const [minAgents, setMinAgents] = useState(3);

  // Handle slider change
  const handleSpeedChange = (e) => {
    setDialSpeed(e.target.value);
  };

  // Handle ratio select change
  const handleRatioChange = (e) => {
    setDialRatio(e.target.value);
  };

  // Handle min agents input change
  const handleAgentsChange = (e) => {
    setMinAgents(e.target.value);
  };

  // Handle update button click
  const handleUpdate = () => {
    console.log('Updating dial settings:', {
      speed: dialSpeed,
      ratio: dialRatio,
      minAgents: minAgents
    });
    // Here you would typically make an API call to update these settings
    alert('Dial settings updated successfully!');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="filter-dropdown">
          <select defaultValue="Today">
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>Custom Range</option>
          </select>
        </div>
        <button className="refresh-btn">Refresh</button>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon calls-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM21 6h-3V3h-2v3h-3v2h3v3h2V8h3z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total Calls</h3>
            <div className="stat-value">2,847</div>
            <div className="stat-change positive">+16.5% vs last period</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon agents-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Active Agents</h3>
            <div className="stat-value">24</div>
            <div className="stat-change positive">+3 vs last period</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon wait-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Avg. Wait Time</h3>
            <div className="stat-value">1m 45s</div>
            <div className="stat-change negative">-30% vs last period</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon success-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Success Rate</h3>
            <div className="stat-value">94.2%</div>
            <div className="stat-change positive">+2.4% vs last period</div>
          </div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card call-volume">
          <div className="chart-header">
            <h3>Call Volume</h3>
            <button className="chart-settings-btn">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
              </svg>
            </button>
          </div>
          <div className="chart-placeholder">
            {/* Chart would be rendered here */}
          </div>
        </div>
        
        <div className="chart-card agent-performance">
          <div className="chart-header">
            <h3>Agent Performance</h3>
            <button className="chart-settings-btn">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
              </svg>
            </button>
          </div>
          <div className="chart-placeholder">
            {/* Chart would be rendered here */}
          </div>
        </div>
      </div>

      <div className="quick-controls-section">
        <div className="section-header">
          <h2>Quick Controls</h2>
          <button className="add-new-control">Add New Control</button>
        </div>
        
        <div className="quick-controls-grid">
          <div className="control-card">
            <div className="card-icon agent-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
            <h3>Agent Management</h3>
            <p>Manage agent status, assignments, and schedules</p>
            <div className="card-actions">
              <button className="view-btn">View Details</button>
              <button className="action-btn">Manage</button>
            </div>
          </div>

          <div className="control-card">
            <div className="card-icon queue-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/>
              </svg>
            </div>
            <h3>Queue Settings</h3>
            <p>Configure call queues and routing rules</p>
            <div className="card-actions">
              <button className="view-btn">View Details</button>
              <button className="action-btn">Configure</button>
            </div>
          </div>

          <div className="control-card">
            <div className="card-icon schedule-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
            </div>
            <h3>Schedule Management</h3>
            <p>Set up and manage call center schedules</p>
            <div className="card-actions">
              <button className="view-btn">View Details</button>
              <button className="action-btn">Manage</button>
            </div>
          </div>

          <div className="control-card dial-speed-card">
            <div className="control-card-header">
              <div className="control-icon speed-control-icon">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M12 16c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0-13c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm0 16c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7z"/>
                  <path fill="currentColor" d="M12 8v4l3 3"/>
                </svg>
              </div>
              <h3>Dial Speed Control</h3>
            </div>
            
            <p>Adjust dialer speed, agent ratio, and minimum agents requirements</p>
            
            <div className="dial-controls">
              <div className="control-row">
                <label>Speed:</label>
                <div className="slider-wrapper">
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={dialSpeed}
                    onChange={handleSpeedChange}
                    className="dial-slider" 
                  />
                  <span className="slider-value">{dialSpeed}</span>
                </div>
              </div>
              
              <div className="control-row">
                <label>Ratio:</label>
                <select 
                  className="dial-ratio-select"
                  value={dialRatio}
                  onChange={handleRatioChange}
                >
                  <option value="1:1">1:1</option>
                  <option value="2:1">2:1</option>
                  <option value="3:1">3:1</option>
                  <option value="4:1">4:1</option>
                  <option value="5:1">5:1</option>
                </select>
              </div>
              
              <div className="control-row">
                <label>Min. Agents:</label>
                <input 
                  type="number" 
                  min="1" 
                  max="100" 
                  value={minAgents}
                  onChange={handleAgentsChange}
                  className="min-agents-input" 
                />
              </div>
            </div>
            
            <div className="control-card-actions">
              <button className="view-details-btn">View History</button>
              <button 
                className="action-btn update-dial-btn"
                onClick={handleUpdate}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 