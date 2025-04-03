import React, { useState, useEffect } from "react";
import "./DataMixControl.css";

const DataMixControl = ({ onUpdate }) => {
  const [freshMix, setFreshMix] = useState(40);
  const [midMix, setMidMix] = useState(30);
  const [agedMix, setAgedMix] = useState(30);
  const [totalValid, setTotalValid] = useState(true);

  // Ensure total equals 100%
  useEffect(() => {
    const total = freshMix + midMix + agedMix;
    setTotalValid(total === 100);
  }, [freshMix, midMix, agedMix]);

  const handleFreshChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setFreshMix(value);
    
    // Adjust aged mix to maintain total of 100%
    if (midMix + value > 100) {
      setMidMix(100 - value);
      setAgedMix(0);
    } else {
      setAgedMix(100 - value - midMix);
    }
  };

  const handleMidChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setMidMix(value);
    
    // Adjust aged mix to maintain total of 100%
    if (freshMix + value > 100) {
      setAgedMix(0);
    } else {
      setAgedMix(100 - freshMix - value);
    }
  };

  const handleAgedChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setAgedMix(value);
    
    // Adjust mid mix to maintain total of 100%
    if (freshMix + value > 100) {
      setMidMix(0);
    } else {
      setMidMix(100 - freshMix - value);
    }
  };

  const handleUpdate = () => {
    if (totalValid && onUpdate) {
      onUpdate({ freshMix, midMix, agedMix });
    }
  };

  return (
    <div className="data-mix-control">
      <h2 className="data-mix-title">Data Mix</h2>
      
      <div className="mix-display">
        <div 
          className="mix-bar fresh-mix" 
          style={{ width: `${freshMix}%` }}
          title={`Fresh Mix: ${freshMix}%`}
        ></div>
        <div 
          className="mix-bar mid-mix" 
          style={{ width: `${midMix}%` }}
          title={`Mid Mix: ${midMix}%`}
        ></div>
        <div 
          className="mix-bar aged-mix" 
          style={{ width: `${agedMix}%` }}
          title={`Aged Mix: ${agedMix}%`}
        ></div>
      </div>
      
      <div className="mix-totals">
        Total: {freshMix + midMix + agedMix}%
        {!totalValid && <span className="error-message">Must equal 100%</span>}
      </div>

      <div className="mix-field">
        <label htmlFor="freshMix">Fresh Mix:</label>
        <div className="mix-input-wrapper">
          <input
            type="number"
            id="freshMix"
            min="0"
            max="100"
            value={freshMix}
            onChange={handleFreshChange}
            className="mix-input"
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
          />
          <span className="mix-percent">%</span>
        </div>
      </div>

      <div className="mix-field">
        <label htmlFor="agedMix">Aged Mix:</label>
        <div className="mix-input-wrapper">
          <input
            type="number"
            id="agedMix"
            min="0"
            max="100"
            value={agedMix}
            onChange={handleAgedChange}
            className="mix-input"
          />
          <span className="mix-percent">%</span>
        </div>
      </div>

      <button 
        className="mix-update-button" 
        onClick={handleUpdate}
        disabled={!totalValid}
      >
        Update Mix
      </button>
    </div>
  );
};

export default DataMixControl; 