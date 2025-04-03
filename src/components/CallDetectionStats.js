import React, { useState, useEffect } from 'react';
import { callAnalyticsService } from '../services/callAnalyticsService';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import './CallDetectionStats.css';

const CallDetectionStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const data = await callAnalyticsService.getCallDetectionStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching call detection stats:', error);
      setError('Failed to load call detection statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading call detection stats...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!stats) return null;

  // Prepare data for the detection rate chart
  const detectionData = [
    { time: 'Human', rate: parseFloat(stats.humanRate), type: 'Human Detection Rate' },
    { time: 'Machine', rate: parseFloat(stats.machineDetections / stats.totalCalls * 100), type: 'Machine Detection Rate' },
    { time: 'Uncertain', rate: parseFloat(stats.uncertainDetections / stats.totalCalls * 100), type: 'Uncertain Detection Rate' }
  ];

  // Prepare data for the duration distribution chart
  const durationData = Object.entries(stats.durationInsights.durationDistribution.all).map(([range, percentage]) => ({
    range,
    percentage: parseFloat(percentage),
    human: parseFloat(stats.durationInsights.durationDistribution.human[range] || 0),
    machine: parseFloat(stats.durationInsights.durationDistribution.machine[range] || 0)
  }));

  return (
    <div className="call-detection-stats">
      <h2>Call Detection Statistics</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Detection Results</h3>
          <div className="stat-value">{stats.humanDetections.toLocaleString()}</div>
          <div className="stat-label">Human Detections</div>
          <div className="stat-value">{stats.machineDetections.toLocaleString()}</div>
          <div className="stat-label">Machine Detections</div>
          <div className="stat-value">{stats.uncertainDetections.toLocaleString()}</div>
          <div className="stat-label">Uncertain Detections</div>
        </div>

        <div className="stat-card">
          <h3>Performance Metrics</h3>
          <div className="stat-value">{stats.humanRate}</div>
          <div className="stat-label">Human Detection Rate</div>
          <div className="stat-value">{stats.transferRate}</div>
          <div className="stat-label">Transfer Success Rate</div>
          <div className="stat-value">{stats.averageDetectionTime}</div>
          <div className="stat-label">Avg Detection Time</div>
        </div>

        <div className="stat-card">
          <h3>Call Duration Insights</h3>
          <div className="stat-value">{stats.durationInsights.averageCallDuration.toFixed(2)}s</div>
          <div className="stat-label">Average Call Duration</div>
          <div className="stat-value">{stats.durationInsights.humanCallDuration.toFixed(2)}s</div>
          <div className="stat-label">Human Call Duration</div>
          <div className="stat-value">{stats.durationInsights.machineCallDuration.toFixed(2)}s</div>
          <div className="stat-label">Machine Call Duration</div>
        </div>

        <div className="stat-card">
          <h3>AMD Settings</h3>
          <div className="stat-value">30s</div>
          <div className="stat-label">Detection Timeout</div>
          <div className="stat-value">2100ms</div>
          <div className="stat-label">Speech Threshold</div>
          <div className="stat-value">4200ms</div>
          <div className="stat-label">Speech End Threshold</div>
          <div className="stat-value">5000ms</div>
          <div className="stat-label">Silence Timeout</div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3>Detection Rate Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={detectionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="rate" 
                name="Detection Rate (%)"
                stroke="#1890ff" 
                fill="#1890ff" 
                fillOpacity={0.6} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Call Duration Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={durationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="percentage" 
                name="All Calls"
                stroke="#1890ff" 
                fill="#1890ff" 
                fillOpacity={0.6} 
              />
              <Area 
                type="monotone" 
                dataKey="human" 
                name="Human Calls"
                stroke="#52c41a" 
                fill="#52c41a" 
                fillOpacity={0.6} 
              />
              <Area 
                type="monotone" 
                dataKey="machine" 
                name="Machine Calls"
                stroke="#722ed1" 
                fill="#722ed1" 
                fillOpacity={0.6} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {stats.durationInsights.potentialMismatches.length > 0 && (
        <div className="mismatches">
          <h3>Potential Mismatches ({stats.durationInsights.potentialMismatchCount})</h3>
          <div className="mismatch-list">
            {stats.durationInsights.potentialMismatches.map((mismatch) => (
              <div key={mismatch.callSid} className="mismatch-item">
                <div className="mismatch-header">
                  <span className="call-sid">{mismatch.callSid}</span>
                  <span className={`mismatch-type ${mismatch.mismatchType}`}>
                    {mismatch.mismatchType}
                  </span>
                </div>
                <div className="mismatch-details">
                  <div>Answered by: {mismatch.answeredBy}</div>
                  <div>Duration: {mismatch.duration}s</div>
                  <div>Transfer Duration: {mismatch.transferDuration}s</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CallDetectionStats; 