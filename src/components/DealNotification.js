import React from 'react';
import './DealNotification.css';

const DealNotification = ({ message, type }) => {
  return (
    <div className={`deal-notification ${type}`}>
      {message}
    </div>
  );
};

export default DealNotification;
