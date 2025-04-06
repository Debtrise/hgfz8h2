import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiService from "../services/apiService";
import "./ListPages.css";

const DIDDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [did, setDid] = useState(null);
  const [usageStats, setUsageStats] = useState([]);
  const [callHistory, setCallHistory] = useState([]);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    status: '',
    source: '',
    notes: ''
  });

  useEffect(() => {
    fetchDID();
  }, [id]);

  const fetchDID = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.dids.getById(id);
      setDid(response.data);
      setFormData({
        phoneNumber: response.data.phoneNumber,
        status: response.data.status,
        source: response.data.source,
        notes: response.data.notes
      });
      // Fetch usage statistics and call history
      const usageResponse = await apiService.usageStats.getByDID(id);
      const callHistoryResponse = await apiService.callHistory.getByDID(id);
      setUsageStats(usageResponse.data);
      setCallHistory(callHistoryResponse.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch DID details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateDID = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await apiService.dids.update(id, formData);
      await fetchDID();
      setShowEditModal(false);
    } catch (err) {
      setError(err.message || 'Failed to update DID');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDID = async () => {
    if (window.confirm('Are you sure you want to delete this DID?')) {
      try {
        setIsLoading(true);
        await apiService.dids.delete(id);
        navigate('/dids');
      } catch (err) {
        setError(err.message || 'Failed to delete DID');
      } finally {
        setIsLoading(false);
      }
    }
  };

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

  if (error) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="error-state">
            <h2>Error</h2>
            <p>{error}</p>
            <button className="button-blue" onClick={handleBack}>
              Back to DIDs
            </button>
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
            <h1 className="page-title">{did.phoneNumber}</h1>
          </div>
          <div className="header-actions">
            <button 
              className="button-blue"
              onClick={() => setShowEditModal(true)}
            >
              Edit
            </button>
            <button 
              className="button-blue"
              onClick={handleDeleteDID}
            >
              Delete
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
                    <span className="detail-label">Phone Number:</span>
                    <span className="detail-value">{did.phoneNumber}</span>
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
                    <span className="detail-label">Source:</span>
                    <span className="detail-value">{did.source}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Notes:</span>
                    <span className="detail-value">{did.notes}</span>
                  </div>
                </div>
              </div>

              <div className="detail-card">
                <h2 className="detail-card-title">Usage Information</h2>
                <div className="detail-card-content">
                  <div className="detail-item">
                    <span className="detail-label">Last Used:</span>
                    <span className="detail-value">
                      {new Date(did.lastUsed).toLocaleString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Calls:</span>
                    <span className="detail-value">{did.totalCalls}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Success Rate:</span>
                    <span className="detail-value">{did.successRate}%</span>
                  </div>
                </div>
              </div>

              <div className="detail-card">
                <h2 className="detail-card-title">Usage Statistics (Last 7 Days)</h2>
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

      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit DID</h2>
            <form onSubmit={handleUpdateDID}>
              <div className="form-group">
                <label>Phone Number:</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status:</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="PENDING">Pending</option>
                  <option value="BLOCKED">Blocked</option>
                </select>
              </div>
              <div className="form-group">
                <label>Source:</label>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Notes:</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-button">
                  Save Changes
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DIDDetail;
