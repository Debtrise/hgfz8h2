import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Results from './Results';
import Buyer from './Buyer';
import Seller from './Seller';
import Settings from './Settings';

const Marketplace = () => {
  return (
    <Routes>
      <Route path="/results" element={<Results />} />
      <Route path="/buyer" element={<Buyer />} />
      <Route path="/seller" element={<Seller />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/marketplace/results" replace />} />
    </Routes>
  );
};

export default Marketplace; 