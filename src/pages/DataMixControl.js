import React, { useState, useEffect, useCallback } from "react";
import apiService from "../services/apiService"; // Import API service
import "./DataMixControl.css";

const DataMixControl = ({ onUpdate }) => {
  // Mix percentages (Map API low, mid, high to fresh, mid, aged)
  const [freshMix, setFreshMix] = useState(0); // Corresponds to low_mix
  const [midMix, setMidMix] = useState(0);   // Corresponds to mid_mix
  const [agedMix, setAgedMix] = useState(0);  // Corresponds to high_mix
  const [totalValid, setTotalValid] = useState(true);

  // Additional config fields
  const [preset, setPreset] = useState("");
  const [freshAgeStart, setFreshAgeStart] = useState(0); // low_age_start
  const [freshAgeEnd, setFreshAgeEnd] = useState(0);     // low_age_end
  const [midAgeStart, setMidAgeStart] = useState(0);     // mid_age_start
  const [midAgeEnd, setMidAgeEnd] = useState(0);       // mid_age_end
  const [agedAgeStart, setAgedAgeStart] = useState(0);   // high_age_start
  const [agedAgeEnd, setAgedAgeEnd] = useState(0);     // high_age_end
  const [priorityOrder, setPriorityOrder] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data mix configuration
  const fetchDataMix = useCallback(async () => {
    try {
      // setLoading(true); // Optional: Show loading state on each fetch
      const data = await apiService.dataMix.get();
      setFreshMix(data.low_mix || 0);
      setMidMix(data.mid_mix || 0);
      setAgedMix(data.high_mix || 0);
      setPreset(data.preset || "");
      setFreshAgeStart(data.low_age_start || 0);
      setFreshAgeEnd(data.low_age_end || 0);
      setMidAgeStart(data.mid_age_start || 0);
      setMidAgeEnd(data.mid_age_end || 0);
      setAgedAgeStart(data.high_age_start || 0);
      setAgedAgeEnd(data.high_age_end || 0);
      setPriorityOrder(data.priority_order || "");
      setError(null);
    } catch (err) {
      console.error("Error fetching data mix:", err);
      setError("Failed to load data mix config.");
      // Keep existing values on error?
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchDataMix(); // Fetch initially
    const intervalId = setInterval(fetchDataMix, 3000); // Refresh every 3 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [fetchDataMix]);

  // Validate total percentage
  useEffect(() => {
    const total = freshMix + midMix + agedMix;
    setTotalValid(total === 100);
  }, [freshMix, midMix, agedMix]);

  // --- Input Handlers ---
  // Keep auto-adjust logic for now, but it might need rethinking
  const handleMixChange = (setter, value, other1, other2) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(0, Math.min(100, numValue));
    setter(clampedValue);

    // Simple adjustment - might need refinement if complex logic is desired
    // This prioritizes the changed input
    // if (other1 + other2 + clampedValue > 100) {
    //   // Reduce others proportionally or based on some logic?
    //   // For simplicity now, let's just let validation handle it.
    // }
  };

  const handleFreshChange = (e) => {
    handleMixChange(setFreshMix, e.target.value, midMix, agedMix);
  };

  const handleMidChange = (e) => {
    handleMixChange(setMidMix, e.target.value, freshMix, agedMix);
  };

  const handleAgedChange = (e) => {
    handleMixChange(setAgedMix, e.target.value, freshMix, midMix);
  };

  // Update data mix configuration
  const handleUpdate = async () => {
    if (!totalValid) return; // Prevent update if total is not 100%

    const updateData = {
      low_mix: freshMix,
      mid_mix: midMix,
      high_mix: agedMix,
      preset: preset,
      low_age_start: freshAgeStart,
      low_age_end: freshAgeEnd,
      mid_age_start: midAgeStart,
      mid_age_end: midAgeEnd,
      high_age_start: agedAgeStart,
      high_age_end: agedAgeEnd,
      priority_order: priorityOrder,
    };

    try {
      setLoading(true); // Indicate loading state
      await apiService.dataMix.update(updateData);
      setError(null);
      // Optional: Refetch data immediately after update or rely on interval
      // fetchDataMix();
      if (onUpdate) {
        onUpdate(updateData); // Notify parent if prop exists
      }
      alert('Data Mix updated successfully!'); // Simple feedback
    } catch (err) {
      console.error("Error updating data mix:", err);
      setError("Failed to update data mix.");
      alert('Failed to update Data Mix.'); // Simple feedback
    } finally {
      setLoading(false);
    }
  };

  if (loading && !preset) { // Show loading only on initial load
    return <div className="data-mix-control">Loading Data Mix...</div>;
  }

  if (error && !preset) { // Show error only if initial load failed
    return <div className="data-mix-control error-message">{error}</div>;
  }

  return (
    <div className="data-mix-control">
      <h2 className="data-mix-title">Data Mix Configuration</h2>

      {error && <div className="error-message" style={{ marginBottom: '10px' }}>{error}</div>}

      {/* Mix Percentages */} 
      <div className="mix-display">
        <div
          className="mix-bar fresh-mix"
          style={{ width: `${freshMix}%` }}
          title={`Fresh (Low Age): ${freshMix}%`}
        ></div>
        <div
          className="mix-bar mid-mix"
          style={{ width: `${midMix}%` }}
          title={`Mid Age: ${midMix}%`}
        ></div>
        <div
          className="mix-bar aged-mix"
          style={{ width: `${agedMix}%` }}
          title={`Aged (High Age): ${agedMix}%`}
        ></div>
      </div>

      <div className="mix-totals">
        Total Mix: {freshMix + midMix + agedMix}%
        {!totalValid && <span className="error-message">Must equal 100%</span>}
      </div>

      <div className="mix-field">
        <label htmlFor="freshMix">Fresh (Low) Mix:</label>
        <div className="mix-input-wrapper">
          <input
            type="number"
            id="freshMix"
            min="0"
            max="100"
            value={freshMix}
            onChange={handleFreshChange}
            className="mix-input"
            disabled={loading}
          />
          <span className="mix-percent">%</span>
        </div>
      </div>

      <div className="mix-field">
        <label htmlFor="midMix">Mid Mix:</label>
        <div className="mix-input-wrapper">
          <input
            type="number"
            id="midMix"
            min="0"
            max="100"
            value={midMix}
            onChange={handleMidChange}
            className="mix-input"
            disabled={loading}
          />
          <span className="mix-percent">%</span>
        </div>
      </div>

      <div className="mix-field">
        <label htmlFor="agedMix">Aged (High) Mix:</label>
        <div className="mix-input-wrapper">
          <input
            type="number"
            id="agedMix"
            min="0"
            max="100"
            value={agedMix}
            onChange={handleAgedChange}
            className="mix-input"
            disabled={loading}
          />
          <span className="mix-percent">%</span>
        </div>
      </div>

      {/* Age Ranges and Other Config */} 
      <h3 className="data-mix-subtitle">Configuration Details</h3>

      <div className="mix-field">
          <label htmlFor="preset">Preset:</label>
          <input
              type="text"
              id="preset"
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
              className="config-input" // Use a different class if needed
              disabled={loading}
              style={{ width: '150px' }} // Adjust width as needed
          />
      </div>

      <div className="mix-field">
          <label>Fresh Age Range:</label>
          <div className="range-inputs">
              <input type="number" value={freshAgeStart} onChange={e => setFreshAgeStart(parseInt(e.target.value) || 0)} disabled={loading} min="0"/>
              <span>-</span>
              <input type="number" value={freshAgeEnd} onChange={e => setFreshAgeEnd(parseInt(e.target.value) || 0)} disabled={loading} min="0"/>
          </div>
      </div>
      
      <div className="mix-field">
          <label>Mid Age Range:</label>
           <div className="range-inputs">
              <input type="number" value={midAgeStart} onChange={e => setMidAgeStart(parseInt(e.target.value) || 0)} disabled={loading} min="0"/>
              <span>-</span>
              <input type="number" value={midAgeEnd} onChange={e => setMidAgeEnd(parseInt(e.target.value) || 0)} disabled={loading} min="0"/>
           </div>
      </div>
      
      <div className="mix-field">
          <label>Aged Age Range:</label>
           <div className="range-inputs">
              <input type="number" value={agedAgeStart} onChange={e => setAgedAgeStart(parseInt(e.target.value) || 0)} disabled={loading} min="0"/>
              <span>-</span>
              <input type="number" value={agedAgeEnd} onChange={e => setAgedAgeEnd(parseInt(e.target.value) || 0)} disabled={loading} min="0"/>
           </div>
      </div>
      
      <div className="mix-field">
          <label htmlFor="priorityOrder">Priority Order:</label>
          <input
              type="text"
              id="priorityOrder"
              value={priorityOrder}
              onChange={(e) => setPriorityOrder(e.target.value)}
              className="config-input" // Use a different class if needed
              disabled={loading}
              style={{ width: '150px' }} // Adjust width as needed
          />
      </div>

      <button
        className="mix-update-button"
        onClick={handleUpdate}
        disabled={!totalValid || loading}
      >
        {loading ? 'Updating...' : 'Update Configuration'}
      </button>
    </div>
  );
};

export default DataMixControl; 