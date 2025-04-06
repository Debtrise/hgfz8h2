import axios from 'axios';

const API_BASE_URL = '/api';

/**
 * Get all journeys for the current tenant
 * @returns {Promise<Array>} List of journeys
 */
export const getAllJourneys = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/journeys`);
    return response.data;
  } catch (error) {
    console.error('Error fetching journeys:', error);
    throw error;
  }
};

/**
 * Get a specific journey by ID
 * @param {number} journeyId - The ID of the journey to fetch
 * @returns {Promise<Object>} Journey details with steps and metrics
 */
export const getJourneyById = async (journeyId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/journeys/${journeyId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Create a new journey
 * @param {Object} journeyData - Journey data including name, description, status, and steps
 * @returns {Promise<Object>} Created journey details
 */
export const createJourney = async (journeyData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/journeys`, journeyData);
    return response.data;
  } catch (error) {
    console.error('Error creating journey:', error);
    throw error;
  }
};

/**
 * Update journey details (not steps)
 * @param {number} journeyId - The ID of the journey to update
 * @param {Object} journeyData - Updated journey data (name, description, status)
 * @returns {Promise<Object>} Updated journey details
 */
export const updateJourney = async (journeyId, journeyData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/journeys/${journeyId}`, journeyData);
    return response.data;
  } catch (error) {
    console.error(`Error updating journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Update journey steps
 * @param {number} journeyId - The ID of the journey to update
 * @param {Array} steps - Array of step objects
 * @returns {Promise<Object>} Response with message and step count
 */
export const updateJourneySteps = async (journeyId, steps) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/journeys/${journeyId}/steps`, { steps });
    return response.data;
  } catch (error) {
    console.error(`Error updating journey steps for ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Delete a journey
 * @param {number} journeyId - The ID of the journey to delete
 * @returns {Promise<Object>} Response with message
 */
export const deleteJourney = async (journeyId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/journeys/${journeyId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Map a journey to a campaign
 * @param {number} campaignId - The ID of the campaign
 * @param {Object} mappingData - Mapping data including journeyId, leadAgeMin, leadAgeMax, durationDays
 * @returns {Promise<Object>} Created mapping details
 */
export const mapJourneyToCampaign = async (campaignId, mappingData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/campaigns/${campaignId}/journey-mappings`, mappingData);
    return response.data;
  } catch (error) {
    console.error(`Error mapping journey to campaign ${campaignId}:`, error);
    throw error;
  }
};
