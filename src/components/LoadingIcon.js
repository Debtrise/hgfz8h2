import React, { useState, useEffect } from 'react';
import loadingIcon from '../assets/loading-icon.png';

const MINIMUM_LOADING_TIME = 1000; // Total time: 0.5s fade in + 1s visible + 0.3s fade out

const LoadingIcon = ({ text = 'Loading...', isLoading, children }) => {
  const [shouldShowContent, setShouldShowContent] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // Start fade out animation after minimum time
      const timer = setTimeout(() => {
        setOverlayVisible(false);
        // Wait for fade out animation to complete before showing content
        setTimeout(() => {
          setShouldShowContent(true);
        }, 300); // Match the fadeOut animation duration (0.3s)
      }, MINIMUM_LOADING_TIME);

      return () => clearTimeout(timer);
    } else {
      setOverlayVisible(true);
      setShouldShowContent(false);
    }
  }, [isLoading]);

  return (
    <div className="loading-wrapper">
      <div className={`content-wrapper ${shouldShowContent ? 'visible' : ''}`}>
        {children}
      </div>
      {overlayVisible && (
        <div className="loading-overlay">
          <div className="loading-container">
            <img src={loadingIcon} alt="Loading" className="loading-icon" />
            <p className="loading-text">{text}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingIcon; 