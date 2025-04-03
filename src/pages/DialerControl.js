import React, { useState, useEffect } from "react";
import "./DialerControl.css";
import { callAnalyticsService } from '../services/callAnalyticsService';

const DialerControl = () => {
  const [speed, setSpeed] = useState(10);
  const [minAgentAvailability, setMinAgentAvailability] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial dialer settings
  useEffect(() => {
    fetchDialerSettings();
    // Set up interval for periodic updates
    const intervalId = setInterval(fetchDialerSettings, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchDialerSettings = async () => {
    try {
      const settings = await callAnalyticsService.getDialerControl();
      // Only update state if we received new data
      if (settings && settings.speed !== undefined) {
        setSpeed(settings.speed || 10);
        setMinAgentAvailability(settings.min_agent_availability || 2);
      }
    } catch (error) {
      console.error('Error fetching dialer settings:', error);
      setError('Failed to load dialer settings');
    }
  };

  const handleSpeedChange = (e) => {
    setSpeed(parseInt(e.target.value) || 0);
  };

  const handleMinAgentAvailabilityChange = (e) => {
    setMinAgentAvailability(parseInt(e.target.value) || 0);
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    try {
      await callAnalyticsService.updateDialerControl({
        speed,
        minAgents: minAgentAvailability
      });
      // Refresh settings after update
      await fetchDialerSettings();
    } catch (error) {
      console.error('Error updating dialer settings:', error);
      setError('Failed to update dialer settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dialer-control">
      <h2 className="dialer-control-title">Dialer Control</h2>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="control-field">
        <label htmlFor="dialerSpeed">Speed</label>
        <div className="slider-container">
          <input
            type="range"
            id="dialerSpeed"
            min="1"
            max="100"
            value={speed}
            onChange={handleSpeedChange}
            className="speed-slider"
          />
          <div className="speed-value">{speed}</div>
        </div>
      </div>

      <div className="control-field">
        <label htmlFor="minAgentAvailability">Minimum Agent Availability</label>
        <input
          type="number"
          id="minAgentAvailability"
          min="0"
          max="100"
          value={minAgentAvailability}
          onChange={handleMinAgentAvailabilityChange}
          className="control-input"
        />
      </div>

      <button 
        className="dialer-update-button" 
        onClick={handleUpdate}
        disabled={loading}
      >
        {loading ? 'Updating...' : 'Update'}
      </button>
    </div>
  );
};

export default DialerControl;
