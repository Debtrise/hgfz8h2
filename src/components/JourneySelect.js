import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./JourneySelect.css";
import apiService from "../services/apiService";

const JourneySelect = ({
  campaignData = null,
  updateJourneys = null,
  onPreview = null,
  onCancel = null,
  isEmbedded = false,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State for campaign data
  const [localCampaignData, setLocalCampaignData] = useState(
    campaignData || {
      name: "BDS_Fresh_Test",
      leadAge: "0-15",
      brand: "BDS",
      source: "Web Forms, Fb, TikTok",
    }
  );

  // State for journeys
  const [journeys, setJourneys] = useState([
    {
      id: 1,
      name: "BDS_Webforms_Fresh",
      description: "3 call / day call flow",
      startDay: 0,
      endDay: 5,
      dateAdded: "1/24/25",
      favorite: false,
    },
    {
      id: 2,
      name: "New_Webforms_Fresh",
      description: "2 call / day call flow with SMS",
      startDay: 6,
      endDay: 15,
      dateAdded: "1/23/25",
      favorite: false,
    },
  ]);

  // State for new journey modal
  const [showNewJourneyModal, setShowNewJourneyModal] = useState(false);
  const [newJourneyName, setNewJourneyName] = useState("");
  const [newJourneyDescription, setNewJourneyDescription] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update parent component when journeys change
  useEffect(() => {
    if (updateJourneys && isEmbedded) {
      updateJourneys(journeys);
    }
  }, [journeys, updateJourneys, isEmbedded]);

  // Toggle journey favorite status
  const toggleFavorite = (id) => {
    setJourneys(
      journeys.map((journey) =>
        journey.id === id
          ? { ...journey, favorite: !journey.favorite }
          : journey
      )
    );
  };

  // Update day assignment
  const updateDayAssignment = (id, field, value) => {
    setJourneys(
      journeys.map((journey) =>
        journey.id === id
          ? { ...journey, [field]: parseInt(value, 10) || 0 }
          : journey
      )
    );
  };

  // Handle preview button click
  const handlePreview = () => {
    if (journeys.length === 0) {
      setError("Please select at least one journey before previewing");
      return;
    }
    
    // Validate journey mappings
    const sortedJourneys = [...journeys].sort((a, b) => a.startDay - b.startDay);
    
    // Check for overlapping day ranges
    for (let i = 1; i < sortedJourneys.length; i++) {
      const prevJourney = sortedJourneys[i - 1];
      const currentJourney = sortedJourneys[i];
      
      if (prevJourney.endDay >= currentJourney.startDay) {
        setError("Journey day ranges cannot overlap");
        return;
      }
    }
    
    // If validation passes, call the onPreview callback
    if (onPreview) {
      onPreview(journeys);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Add a new journey
  const addNewJourney = async () => {
    if (!newJourneyName.trim()) {
      setError("Journey name is required");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create a new journey
      const response = await apiService.journeys.create({
        name: newJourneyName,
        description: newJourneyDescription
      });
      
      // Add the new journey to the list
      const newJourney = {
        id: response.data.id,
        name: newJourneyName,
        description: newJourneyDescription,
        startDay: 1,
        endDay: 14,
        favorite: false
      };
      
      setJourneys(prev => [...prev, newJourney]);
      setNewJourneyName("");
      setNewJourneyDescription("");
      setShowNewJourneyModal(false);
      
      // Update the parent component
      if (updateJourneys) {
        updateJourneys([...journeys, newJourney]);
      }
    } catch (err) {
      console.error("Error creating journey:", err);
      setError("Failed to create journey. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a journey
  const deleteJourney = async (journeyId) => {
    if (!window.confirm("Are you sure you want to delete this journey?")) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Delete the journey from the API
      await apiService.journeys.delete(journeyId);
      
      // Remove the journey from the list
      const updatedJourneys = journeys.filter(journey => journey.id !== journeyId);
      setJourneys(updatedJourneys);
      
      // Update the parent component
      if (updateJourneys) {
        updateJourneys(updatedJourneys);
      }
    } catch (err) {
      console.error("Error deleting journey:", err);
      setError("Failed to delete journey. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate the journey day ranges
  const validateJourneys = () => {
    if (journeys.length === 0) {
      alert("Please add at least one journey");
      return false;
    }

    const sortedJourneys = [...journeys].sort(
      (a, b) => a.startDay - b.startDay
    );

    // Check for overlaps or gaps
    for (let i = 1; i < sortedJourneys.length; i++) {
      const prevJourney = sortedJourneys[i - 1];
      const currentJourney = sortedJourneys[i];

      if (prevJourney.endDay + 1 !== currentJourney.startDay) {
        alert(
          `There is a gap or overlap between day ranges. Please ensure they are consecutive.`
        );
        return false;
      }
    }

    return true;
  };

  // If embedded, we don't need to wrap in a full content container
  const renderContent = () => (
    <>
      {!isEmbedded && (
        <div className="campaign-info-grid">
          <div className="info-col">
            <h3 className="info-label">Campaign</h3>
            <p className="info-value">{localCampaignData.name}</p>
          </div>
          <div className="info-col">
            <h3 className="info-label">Lead Age</h3>
            <p className="info-value">{localCampaignData.leadAge}</p>
          </div>
          <div className="info-col">
            <h3 className="info-label">Brand</h3>
            <p className="info-value">{localCampaignData.brand}</p>
          </div>
          <div className="info-col">
            <h3 className="info-label">Source</h3>
            <p className="info-value">{localCampaignData.source}</p>
          </div>
        </div>
      )}

      <div className="journey-select-container">
        {!isEmbedded && (
          <div className="journey-select-header">
            <h2 className="section-title">Journey Select</h2>
            <button
              className="button-outline"
              onClick={() => setShowNewJourneyModal(true)}
            >
              New
            </button>
          </div>
        )}

        {/* Day Assignment Header */}
        <div className="day-assignment-header">
          <div className="day-assignment-label">Day Assignment</div>
          <div className="day-range-headers">
            <div className="day-header">Start</div>
            <div className="day-header">End</div>
          </div>
        </div>

        {/* Journeys List */}
        <ul className="journey-list">
          {journeys.map((journey) => (
            <li key={journey.id} className="journey-item">
              <div className="journey-day-range">
                <input
                  type="number"
                  className="day-input"
                  value={journey.startDay}
                  min="0"
                  onChange={(e) =>
                    updateDayAssignment(journey.id, "startDay", e.target.value)
                  }
                />
                <input
                  type="number"
                  className="day-input"
                  value={journey.endDay}
                  min={journey.startDay}
                  onChange={(e) =>
                    updateDayAssignment(journey.id, "endDay", e.target.value)
                  }
                />
              </div>
              <div className="journey-name">{journey.name}</div>
              <div className="journey-description">{journey.description}</div>
              <div className="journey-actions">
                <div className="journey-date">Added: {journey.dateAdded}</div>
                <button
                  className={`favorite-button ${
                    journey.favorite ? "active" : ""
                  }`}
                  onClick={() => toggleFavorite(journey.id)}
                  title={
                    journey.favorite
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  <i
                    className={`icon star-icon ${
                      journey.favorite ? "active" : ""
                    }`}
                  ></i>
                </button>
                <div className="journey-options-container">
                  <button className="more-options-button">
                    <i className="icon more-icon"></i>
                  </button>
                  <div className="journey-options-dropdown">
                    <ul>
                      <li
                        onClick={() =>
                          navigate(`/journeys/builder/${journey.id}`)
                        }
                      >
                        Edit Journey
                      </li>
                      <li onClick={() => deleteJourney(journey.id)}>Remove</li>
                    </ul>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Add Journey Button */}
        <div className="add-journey-row">
          <button
            className="add-journey-button"
            onClick={() => setShowNewJourneyModal(true)}
            title="Add a new journey"
          >
            +
          </button>
        </div>

        {/* Footer Buttons */}
        <div className="journey-footer-buttons">
          <button className="button-outline" onClick={handleCancel}>
            Cancel
          </button>
          <button className="button-blue" onClick={handlePreview}>
            {isEmbedded ? "Finish" : "Preview"}
          </button>
        </div>
      </div>

      {/* New Journey Modal */}
      {showNewJourneyModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Add New Journey</h3>

            <div className="modal-form-group">
              <label className="modal-label">Journey Name</label>
              <input
                type="text"
                className="modal-input"
                value={newJourneyName}
                onChange={(e) => setNewJourneyName(e.target.value)}
                placeholder="Enter journey name"
              />
            </div>

            <div className="modal-form-group">
              <label className="modal-label">Description</label>
              <input
                type="text"
                className="modal-input"
                value={newJourneyDescription}
                onChange={(e) => setNewJourneyDescription(e.target.value)}
                placeholder="Enter journey description"
              />
            </div>

            <div className="modal-buttons">
              <button
                className="button-outline"
                onClick={() => setShowNewJourneyModal(false)}
              >
                Cancel
              </button>
              <button
                className="button-blue"
                onClick={addNewJourney}
                disabled={!newJourneyName.trim()}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // If used as a standalone page, wrap in content container
  if (!isEmbedded) {
    return (
      <div className="content">
        <div className="campaign-details-card">{renderContent()}</div>
      </div>
    );
  }

  // When embedded in the campaign builder
  return renderContent();
};

export default JourneySelect;
