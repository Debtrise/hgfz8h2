import axios from 'axios';
import { API_BASE_URL, ENDPOINTS, API_TIMEOUT, API_RETRY_CONFIG } from '../config';

const CAMPAIGNS_ENDPOINT = `${API_BASE_URL}${ENDPOINTS.CAMPAIGNS}`;

// Configure axios defaults
axios.defaults.timeout = API_TIMEOUT;

// Add request interceptor for logging
axios.interceptors.request.use(request => {
  console.log('Starting Request:', {
    url: request.url,
    method: request.method,
    data: request.data
  });
  return request;
});

// Add response interceptor for logging
axios.interceptors.response.use(
  response => {
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data
    });
    return Promise.reject(error);
  }
);

/**
 * Wait for a campaign to reach a specific status
 * @param {number} campaignId - Campaign ID
 * @param {string} expectedStatus - Expected status
 * @param {number} maxAttempts - Maximum number of attempts
 * @returns {Promise<boolean>} - Whether the status was reached
 */
const waitForStatus = async (campaignId, expectedStatus, maxAttempts = 10) => {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await axios.get(`${CAMPAIGNS_ENDPOINT}/${campaignId}`);
    if (response.data.status === expectedStatus) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
};

/**
 * Get all campaigns
 * @returns {Promise<Array>} Array of campaigns
 */
export const getAllCampaigns = async () => {
  try {
    const response = await axios.get(CAMPAIGNS_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
};

/**
 * Get a campaign by ID
 * @param {string} id Campaign ID
 * @returns {Promise<Object>} Campaign object
 */
export const getCampaignById = async (id) => {
  try {
    const response = await axios.get(`${CAMPAIGNS_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching campaign ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new campaign
 * @param {Object} campaignData Campaign data
 * @returns {Promise<Object>} Created campaign object
 */
export const createCampaign = async (campaignData) => {
  try {
    const response = await axios.post(CAMPAIGNS_ENDPOINT, campaignData);
    return response.data;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

/**
 * Update an existing campaign
 * @param {string} id Campaign ID
 * @param {Object} campaignData Updated campaign data
 * @returns {Promise<Object>} Updated campaign object
 */
export const updateCampaign = async (id, campaignData) => {
  try {
    const response = await axios.put(`${CAMPAIGNS_ENDPOINT}/${id}`, campaignData);
    return response.data;
  } catch (error) {
    console.error(`Error updating campaign ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a campaign
 * @param {string} id Campaign ID
 * @returns {Promise<void>}
 */
export const deleteCampaign = async (id) => {
  try {
    await axios.delete(`${CAMPAIGNS_ENDPOINT}/${id}`);
  } catch (error) {
    console.error(`Error deleting campaign ${id}:`, error);
    throw error;
  }
};

/**
 * Update campaign status
 * @param {string} id Campaign ID
 * @param {string} status New status ('active' or 'inactive')
 * @returns {Promise<Object>} Updated campaign object
 */
export const updateCampaignStatus = async (id, status) => {
  try {
    const response = await axios.patch(`${CAMPAIGNS_ENDPOINT}/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating campaign ${id} status:`, error);
    throw error;
  }
};

/**
 * Get campaign statistics
 * @param {string} id Campaign ID
 * @returns {Promise<Object>} Campaign statistics
 */
export const getCampaignStats = async (id) => {
  try {
    const response = await axios.get(`${CAMPAIGNS_ENDPOINT}/${id}/stats`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching campaign ${id} statistics:`, error);
    throw error;
  }
};

/**
 * Get campaign journey mappings
 * @param {string} id Campaign ID
 * @returns {Promise<Array>} Array of journey mappings
 */
export const getCampaignJourneyMappings = async (id) => {
  try {
    const response = await axios.get(`${CAMPAIGNS_ENDPOINT}/${id}/journey-mappings`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching campaign ${id} journey mappings:`, error);
    throw error;
  }
};

/**
 * Update campaign journey mappings
 * @param {string} id Campaign ID
 * @param {Array} mappings Array of journey mapping objects
 * @returns {Promise<Array>} Updated journey mappings
 */
export const updateCampaignJourneyMappings = async (id, mappings) => {
  try {
    const response = await axios.put(`${CAMPAIGNS_ENDPOINT}/${id}/journey-mappings`, { mappings });
    return response.data;
  } catch (error) {
    console.error(`Error updating campaign ${id} journey mappings:`, error);
    throw error;
  }
};

/**
 * Start a campaign
 * @param {number} id - Campaign ID
 * @returns {Promise<boolean>} Whether the operation was successful
 */
export const startCampaign = async (id) => {
  try {
    await axios.patch(`${CAMPAIGNS_ENDPOINT}/${id}/start`);
    return await waitForStatus(id, 'active');
  } catch (error) {
    console.error('Error starting campaign:', error);
    throw error;
  }
};

/**
 * Pause a campaign
 * @param {number} id - Campaign ID
 * @returns {Promise<boolean>} Whether the operation was successful
 */
export const pauseCampaign = async (id) => {
  try {
    await axios.patch(`${CAMPAIGNS_ENDPOINT}/${id}/pause`);
    return await waitForStatus(id, 'paused');
  } catch (error) {
    console.error('Error pausing campaign:', error);
    throw error;
  }
};

/**
 * Complete a campaign
 * @param {number} id - Campaign ID
 * @returns {Promise<boolean>} Whether the operation was successful
 */
export const completeCampaign = async (id) => {
  try {
    // First pause the campaign
    const isPaused = await pauseCampaign(id);
    if (!isPaused) {
      throw new Error('Failed to pause campaign before completion');
    }

    // Then complete it
    await axios.patch(`${CAMPAIGNS_ENDPOINT}/${id}/complete`);
    return await waitForStatus(id, 'completed');
  } catch (error) {
    console.error('Error completing campaign:', error);
    throw error;
  }
};

/**
 * Get campaign metrics
 * @param {number} id - Campaign ID
 * @param {string} timeRange - Time range for metrics
 * @returns {Promise<Object>} Campaign metrics
 */
export const getCampaignMetrics = async (id, timeRange = '7d') => {
  try {
    const response = await axios.get(`${CAMPAIGNS_ENDPOINT}/${id}/metrics`, { params: { timeRange } });
    return response.data;
  } catch (error) {
    console.error('Error fetching campaign metrics:', error);
    throw error;
  }
};

/**
 * Add journey mapping to campaign
 * @param {number} id - Campaign ID
 * @param {Object} mapping - Journey mapping data
 * @returns {Promise<Object>} Created journey mapping
 */
export const addCampaignJourneyMapping = async (id, mapping) => {
  try {
    const response = await axios.post(`${CAMPAIGNS_ENDPOINT}/${id}/journey-mappings`, mapping);
    return response.data;
  } catch (error) {
    console.error('Error adding campaign journey mapping:', error);
    throw error;
  }
}; 