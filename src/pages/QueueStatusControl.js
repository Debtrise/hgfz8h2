import React, { useState, useEffect } from "react";
import "./QueueStatusControl.css";
import { callAnalyticsService } from '../services/callAnalyticsService';

const QueueStatusControl = () => {
  const [leadsInQueue, setLeadsInQueue] = useState(0);
  const [leadsDialed, setLeadsDialed] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchQueueData = async () => {
    setLoading(true);
    try {
      const [queueCounts, todayStats] = await Promise.all([
        callAnalyticsService.getDialerQueueCounts(),
        callAnalyticsService.getTodaySummary()
      ]);
      
      setLeadsInQueue(queueCounts.totalCount);
      setLeadsDialed(todayStats.totalCalls);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching queue data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueData();
    // Set up polling every 5 minutes
    const interval = setInterval(fetchQueueData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate percentages for the progress bars
  const dialedPercentage = leadsInQueue > 0 ? (leadsDialed / leadsInQueue) * 100 : 0;
  const notDialedPercentage = leadsInQueue > 0 ? ((leadsInQueue - leadsDialed) / leadsInQueue) * 100 : 0;

  // Format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="queue-status-control">
      <div className="queue-status-header">
        <h3 className="queue-total-value">{formatNumber(leadsInQueue)}</h3>
        <div className="queue-total-label">Total Leads in Queue</div>
      </div>

      <div className="queue-progress">
        <div 
          className="queue-progress-bar dialed-bar" 
          style={{ width: `${dialedPercentage}%` }}
        ></div>
        <div 
          className="queue-progress-bar not-dialed-bar" 
          style={{ width: `${notDialedPercentage}%` }}
        ></div>
      </div>

      <div className="queue-stats">
        <div className="queue-stat-item">
          <div className="queue-stat-icon dialed-icon"></div>
          <div className="queue-stat-details">
            <div className="queue-stat-value">{formatNumber(leadsDialed)}</div>
            <div className="queue-stat-label">Leads Dialed</div>
          </div>
          <div className="queue-stat-percent">{Math.round(dialedPercentage)}%</div>
        </div>

        <div className="queue-stat-item">
          <div className="queue-stat-icon not-dialed-icon"></div>
          <div className="queue-stat-details">
            <div className="queue-stat-value">{formatNumber(leadsInQueue - leadsDialed)}</div>
            <div className="queue-stat-label">Leads Not Dialed</div>
          </div>
          <div className="queue-stat-percent">{Math.round(notDialedPercentage)}%</div>
        </div>
      </div>

      <div className="queue-stats-footer">
        <div className="queue-refresh-time">Last Updated: {formatTimeAgo(lastUpdated)}</div>
        <button 
          className="queue-refresh-btn"
          onClick={fetchQueueData}
          disabled={loading}
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};

export default QueueStatusControl; 