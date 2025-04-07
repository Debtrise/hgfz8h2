// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://35.202.92.164:8080/api';

// API Endpoints
export const ENDPOINTS = {
  CAMPAIGNS: '/campaigns',
  LEAD_POOLS: '/lead-pools',
  DID_POOLS: '/did-pools',
  JOURNEYS: '/journeys',
  AUTH: '/auth',
  USERS: '/users'
};

// API Headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json'
};

// API Timeout (in milliseconds)
export const API_TIMEOUT = 30000;

// API Retry Configuration
export const API_RETRY_CONFIG = {
  retries: 3,
  initialRetryDelay: 1000,
  maxRetryDelay: 5000
}; 