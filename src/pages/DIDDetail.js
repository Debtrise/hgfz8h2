import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ListPages.css";

const DIDDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [did, setDID] = useState(null);
  const [usageStats, setUsageStats] = useState([]);
  const [callHistory, setCallHistory] = useState([]);

  // Fetch DID data
  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
      // Sample DID data - in real app, fetch from API
      const sampleDID = {
        id: parseInt(id),
        number: "(800) 555-0100",
        pool: "Main Sales DIDs",
        brand: "BDS",
        source: "Outbound Sales",
        ingroups: ["Sales", "Support"],
        usageCount: 1284,
        callsToday: 52,
        status: "Active",
        dialRatio: 1.5,
        lastUsed: "2025-01-24T14:30:00",
        dateAdded: "2024-10-15",
        provider: "Twilio",
        costPerMinute: 0.015,
        monthlyFee: 1.0,
        notes:
          "Primary sales number for outbound campaigns. High performance DID with good connection rates.",
      };

      // Sample usage statistics
      const sampleUsageStats = [
        {
          date: "2025-01-24",
          calls: 52,
          connectedCalls: 32,
          totalDuration: 138,
          connectionRate: 61.5,
        },
        {
          date: "2025-01-23",
          calls: 48,
          connectedCalls: 29,
          totalDuration: 124,
          connectionRate: 60.4,
        },
        {
          date: "2025-01-22",
          calls: 55,
          connectedCalls: 35,
          totalDuration: 149,
          connectionRate: 63.6,
        },
        {
          date: "2025-01-21",
          calls: 49,
          connectedCalls: 31,
          totalDuration: 133,
          connectionRate: 63.3,
        },
        {
          date: "2025-01-20",
          calls: 51,
          connectedCalls: 33,
          totalDuration: 140,
          connectionRate: 64.7,
        },
        {
          date: "2025-01-19",
          calls: 38,
          connectedCalls: 25,
          totalDuration: 107,
          connectionRate: 65.8,
        },
        {
          date: "2025-01-18",
          calls: 37,
          connectedCalls: 24,
          totalDuration: 103,
          connectionRate: 64.9,
        },
      ];

      // Sample call history
      const sampleCallHistory = [
        {
          id: 1,
          date: "2025-01-24",
          time: "14:30:22",
          leadId: 1042,
          leadName: "John Doe",
          agent: "Steven Hernandez",
          duration: "4:12",
          outcome: "Connected",
          callType: "Outbound",
        },
        {
          id: 2,
          date: "2025-01-24",
          time: "14:15:45",
          leadId: 1053,
          leadName: "Emily Williams",
          agent: "Maria Garcia",
          duration: "2:45",
          outcome: "Connected",
          callType: "Outbound",
        },
        {
          id: 3,
          date: "2025-01-24",
          time: "13:52:30",
          leadId: 1061,
          leadName: "Michael Brown",
          agent: "Steven Hernandez",
          duration: "0:00",
          outcome: "No Answer",
          callType: "Outbound",
        },
        {
          id: 4,
          date: "2025-01-24",
          time: "13:40:12",
          leadId: 1038,
          leadName: "Sarah Johnson",
          agent: "Maria Garcia",
          duration: "3:22",
          outcome: "Connected",
          callType: "Outbound",
        },
        {
          id: 5,
          date: "2025-01-24",
          time: "13:25:05",
          leadId: 1044,
          leadName: "David Martinez",
          agent: "Steven Hernandez",
          duration: "1:47",
          outcome: "Connected",
          callType: "Outbound",
        },
      ];

      setDID(sampleDID);
      setUsageStats(sampleUsageStats);
      setCallHistory(sampleCallHistory);
      setIsLoading(false);
    }, 600);
  }, [id]);

  const handleBack = () => {
    navigate("/dids");
  };

  const handleUpdate = () => {
    console.log("Update DID functionality would be implemented here");
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading DID information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!did) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="error-state">
            <h2>DID Not Found</h2>
            <p>
              The DID number you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <button className="button-blue" onClick={handleBack}>
              Back to DIDs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container did-detail-container">
        <div className="content-header">
          <div className="header-with-back">
            <button className="back-button" onClick={handleBack}>
              <i className="back-icon"></i>
              <span>Back to DIDs</span>
            </button>
            <h1 className="page-title">{did.number}</h1>
          </div>
          <div className="header-actions">
            <button className="button-blue" onClick={handleUpdate}>
              Update DID
            </button>
          </div>
        </div>

        <div className="content-body">
          <div className="did-detail-layout">
            {/* Left column - DID info */}
            <div className="did-info-column">
              <div className="detail-card">
                <h2 className="detail-card-title">DID Information</h2>
                <div className="detail-card-content">
                  <div className="detail-item">
                    <span className="detail-label">Number:</span>
                    <span className="detail-value">{did.number}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Pool:</span>
                    <span className="detail-value">{did.pool}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Brand:</span>
                    <span className="detail-value">{did.brand}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Source:</span>
                    <span className="detail-value">{did.source}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ingroups:</span>
                    <span className="detail-value">
                      {did.ingroups.join(", ")}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">
                      <span
                        className={`status-badge ${did.status.toLowerCase()}`}
                      >
                        {did.status}
                      </span>
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date Added:</span>
                    <span className="detail-value">
                      {new Date(did.dateAdded).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-card">
                <h2 className="detail-card-title">Configuration</h2>
                <div className="detail-card-content">
                  <div className="detail-item">
                    <span className="detail-label">Provider:</span>
                    <span className="detail-value">{did.provider}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Dial Ratio:</span>
                    <span className="detail-value">{did.dialRatio}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Cost per Minute:</span>
                    <span className="detail-value">
                      ${did.costPerMinute.toFixed(3)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Monthly Fee:</span>
                    <span className="detail-value">
                      ${did.monthlyFee.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-card">
                <h2 className="detail-card-title">
                  Usage Statistics (Last 7 Days)
                </h2>
                <div className="detail-card-content">
                  <table className="stats-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Calls</th>
                        <th>Connected</th>
                        <th>Duration</th>
                        <th>Connection Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usageStats.map((day, index) => (
                        <tr key={index}>
                          <td>{new Date(day.date).toLocaleDateString()}</td>
                          <td>{day.calls}</td>
                          <td>{day.connectedCalls}</td>
                          <td>
                            {Math.floor(day.totalDuration / 60)}:
                            {(day.totalDuration % 60)
                              .toString()
                              .padStart(2, "0")}
                          </td>
                          <td>{day.connectionRate.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="detail-card">
                <h2 className="detail-card-title">Notes</h2>
                <div className="detail-card-content">
                  <p className="did-notes">{did.notes}</p>
                </div>
              </div>
            </div>

            {/* Right column - Call history */}
            <div className="call-history-column">
              <div className="detail-card full-height">
                <h2 className="detail-card-title">Recent Call History</h2>
                <div className="call-history-list">
                  {callHistory.map((call) => (
                    <div key={call.id} className="call-history-item">
                      <div className="call-history-header">
                        <div className="call-datetime">
                          {call.date} - {call.time}
                        </div>
                        <div
                          className={`call-outcome ${call.outcome
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {call.outcome}
                        </div>
                      </div>
                      <div className="call-history-details">
                        <div className="call-lead-info">
                          <div className="detail-item">
                            <span className="detail-label">Lead:</span>
                            <span className="detail-value">
                              <a
                                href={`/leads/${call.leadId}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {call.leadName}
                              </a>
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Agent:</span>
                            <span className="detail-value">{call.agent}</span>
                          </div>
                        </div>
                        <div className="call-meta-info">
                          <div className="detail-item">
                            <span className="detail-label">Type:</span>
                            <span className="detail-value">
                              {call.callType}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Duration:</span>
                            <span className="detail-value">
                              {call.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {callHistory.length === 0 && (
                    <div className="empty-history-state">
                      <p>No call history available for this DID.</p>
                    </div>
                  )}
                </div>

                <div className="detail-card-footer">
                  <button className="button-outline">
                    View Full Call History
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DIDDetail;
