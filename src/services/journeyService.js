import axios from 'axios';

const API_BASE_URL = '/api';

/**
 * Get all journeys for the current tenant
 * @returns {Promise<Array>} List of journeys
 */
export const getAllJourneys = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/journeys`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
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
    const response = await axios.get(`${API_BASE_URL}/journeys/${journeyId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
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
    const response = await axios.post(`${API_BASE_URL}/journeys`, journeyData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
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
    const response = await axios.put(`${API_BASE_URL}/journeys/${journeyId}`, journeyData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating journey ${journeyId}:`, error);
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
    const response = await axios.delete(`${API_BASE_URL}/journeys/${journeyId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Clone a journey
 * @param {number} journeyId - The ID of the journey to clone
 * @param {string} name - Name for the cloned journey
 * @returns {Promise<Object>} Cloned journey details
 */
export const cloneJourney = async (journeyId, name) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/journeys/${journeyId}/clone`, { name }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error cloning journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Get journey steps
 * @param {number} journeyId - The ID of the journey
 * @returns {Promise<Array>} List of journey steps
 */
export const getJourneySteps = async (journeyId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/journeys/${journeyId}/steps`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching journey steps for ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Add a step to a journey
 * @param {number} journeyId - The ID of the journey
 * @param {Object} stepData - Step data including actionType, actionConfig, delayMinutes, sequenceOrder
 * @returns {Promise<Object>} Created step details
 */
export const addJourneyStep = async (journeyId, stepData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/journeys/${journeyId}/steps`, stepData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error adding step to journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Update a journey step
 * @param {number} journeyId - The ID of the journey
 * @param {number} stepId - The ID of the step to update
 * @param {Object} stepData - Updated step data
 * @returns {Promise<Object>} Updated step details
 */
export const updateJourneyStep = async (journeyId, stepId, stepData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/journeys/${journeyId}/steps/${stepId}`, stepData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating step ${stepId} for journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Delete a journey step
 * @param {number} journeyId - The ID of the journey
 * @param {number} stepId - The ID of the step to delete
 * @returns {Promise<Object>} Response with message
 */
export const deleteJourneyStep = async (journeyId, stepId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/journeys/${journeyId}/steps/${stepId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting step ${stepId} from journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Reorder journey steps
 * @param {number} journeyId - The ID of the journey
 * @param {Array} stepIds - Array of step IDs in the new order
 * @returns {Promise<Object>} Response with message and updated steps
 */
export const reorderJourneySteps = async (journeyId, stepIds) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/journeys/${journeyId}/steps/reorder`, { stepIds }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error reordering steps for journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Test a journey step
 * @param {number} journeyId - The ID of the journey
 * @param {number} stepId - The ID of the step to test
 * @param {Object} testData - Test data including testPhone and testEmail
 * @returns {Promise<Object>} Test results
 */
export const testJourneyStep = async (journeyId, stepId, testData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/journeys/${journeyId}/steps/${stepId}/test`, testData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error testing step ${stepId} for journey ${journeyId}:`, error);
    throw error;
  }
};
