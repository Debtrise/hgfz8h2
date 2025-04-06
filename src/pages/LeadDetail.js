import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiService from "../services/apiService";
import "./ListPages.css";
import LoadingSpinner from "../components/LoadingSpinner";

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lead, setLead] = useState(null);
  const [contactHistory, setContactHistory] = useState([]);

  // Fetch lead data
  useEffect(() => {
    const fetchLeadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch lead details
        const leadResponse = await apiService.leads.getById(id);
        setLead(leadResponse.data);
        
        // In a real implementation, you would fetch contact history from an API
        // For now, we'll use mock data
        const mockContactHistory = [
          {
            id: 1,
            date: new Date().toISOString().split('T')[0],
            time: "14:30",
            type: "Call",
            agent: "Steven Hernandez",
            duration: "4:25",
            notes: "Discussed options. Customer requested follow-up with details.",
            outcome: "Follow-up Required",
          },
          {
            id: 2,
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: "11:15",
            type: "Email",
            agent: "System",
            duration: null,
            notes: "Sent welcome email with initial information package.",
            outcome: "Delivered",
          },
          {
            id: 3,
            date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: "09:45",
            type: "SMS",
            agent: "System",
            duration: null,
            notes: "Appointment reminder sent.",
            outcome: "Delivered",
          },
        ];
        
        setContactHistory(mockContactHistory);
      } catch (err) {
        console.error("Error fetching lead details:", err);
        setError("Failed to load lead information. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeadData();
  }, [id]);

  const handleBack = () => {
    navigate("/leads");
  };

  // Function to add a new note
  const addNote = () => {
    console.log("Add note functionality would be implemented here");
  };

  // Function to schedule a call
  const scheduleCall = () => {
    console.log("Schedule call functionality would be implemented here");
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="loading-state">
            <LoadingSpinner size="large" text="Loading lead information..." />
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
            <h2>Error Loading Lead</h2>
            <p>{error}</p>
            <button className="button-blue" onClick={handleBack}>
              Back to Leads
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="error-state">
            <h2>Lead Not Found</h2>
            <p>
              The lead you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <button className="button-blue" onClick={handleBack}>
              Back to Leads
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container lead-detail-container">
        <div className="content-header">
          <div className="header-with-back">
            <button className="back-button" onClick={handleBack}>
              <i className="back-icon"></i>
              <span>Back to Leads</span>
            </button>
            <h1 className="page-title">
              {lead.first_name} {lead.last_name}
            </h1>
          </div>
          <div className="header-actions">
            <button className="button-outline" onClick={scheduleCall}>
              <i className="phone-icon-small"></i>
              <span>Schedule Call</span>
            </button>
            <button className="button-blue" onClick={addNote}>
              <i className="note-icon-small"></i>
              <span>Add Note</span>
            </button>
          </div>
        </div>

        <div className="content-body">
          <div className="lead-detail-layout">
            {/* Left column - Lead info */}
            <div className="lead-info-column">
              <div className="detail-card">
                <h2 className="detail-card-title">Contact Information</h2>
                <div className="detail-card-content">
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">
                      {lead.first_name} {lead.last_name}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{lead.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{lead.phone}</span>
                  </div>
                  {lead.address && (
                    <div className="detail-item">
                      <span className="detail-label">Address:</span>
                      <span className="detail-value">
                        {lead.address.street}
                        <br />
                        {lead.address.city}, {lead.address.state}{" "}
                        {lead.address.zip_code}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-card">
                <h2 className="detail-card-title">Lead Information</h2>
                <div className="detail-card-content">
                  <div className="detail-item">
                    <span className="detail-label">Lead Pool:</span>
                    <span className="detail-value">{lead.lead_pool_name || 'None'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date Added:</span>
                    <span className="detail-value">
                      {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Lead Age:</span>
                    <span className="detail-value">{lead.lead_age || 0} days</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">
                      <span
                        className={`status-badge ${lead.status?.toLowerCase() || 'unknown'}`}
                      >
                        {lead.status || 'Unknown'}
                      </span>
                    </span>
                  </div>
                  {lead.agent && (
                    <div className="detail-item">
                      <span className="detail-label">Assigned Agent:</span>
                      <span className="detail-value">{lead.agent.name || 'None'}</span>
                    </div>
                  )}
                </div>
              </div>

              {lead.notes && (
                <div className="detail-card">
                  <h2 className="detail-card-title">Notes</h2>
                  <div className="detail-card-content">
                    <p className="lead-notes">{lead.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right column - Contact history */}
            <div className="contact-history-column">
              <div className="detail-card full-height">
                <h2 className="detail-card-title">Contact History</h2>
                <div className="contact-history-list">
                  {contactHistory.map((interaction) => (
                    <div key={interaction.id} className="contact-history-item">
                      <div className="contact-history-header">
                        <div className="contact-type-badge">
                          <i
                            className={`contact-type-icon ${interaction.type.toLowerCase()}`}
                          ></i>
                          <span>{interaction.type}</span>
                        </div>
                        <div className="contact-date">
                          {interaction.date} - {interaction.time}
                        </div>
                      </div>
                      <div className="contact-history-details">
                        <div className="detail-item">
                          <span className="detail-label">Agent:</span>
                          <span className="detail-value">
                            {interaction.agent}
                          </span>
                        </div>
                        {interaction.duration && (
                          <div className="detail-item">
                            <span className="detail-label">Duration:</span>
                            <span className="detail-value">
                              {interaction.duration}
                            </span>
                          </div>
                        )}
                        <div className="detail-item">
                          <span className="detail-label">Outcome:</span>
                          <span className="detail-value">
                            {interaction.outcome}
                          </span>
                        </div>
                      </div>
                      <div className="contact-notes">
                        <p>{interaction.notes}</p>
                      </div>
                    </div>
                  ))}

                  {contactHistory.length === 0 && (
                    <div className="empty-history-state">
                      <p>No contact history available for this lead.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
