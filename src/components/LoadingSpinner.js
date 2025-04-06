import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', text, className = '' }) => {
  return (
    <div className={`loading-spinner-container ${className}`}>
      <div className={`loading-spinner loading-spinner-${size}`}></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner; 