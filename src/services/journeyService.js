import apiService from './apiService';

/**
 * Get all journeys
 * @returns {Promise<Array>} List of journeys
 */
export const getAllJourneys = async () => {
  try {
    const response = await apiService.journeys.getAll();
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
    const response = await apiService.journeys.getById(journeyId);
    return response.data;
  } catch (error) {
    console.error(`Error fetching journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Create a new journey
 * @param {Object} journeyData - Journey data including name, description, status, and steps
 * @returns {Promise<Object>} Created journey
 */
export const createJourney = async (journeyData) => {
  try {
    const response = await apiService.journeys.create(journeyData);
    return response.data;
  } catch (error) {
    console.error('Error creating journey:', error);
    throw error;
  }
};

/**
 * Update an existing journey
 * @param {number} journeyId - ID of the journey to update
 * @param {Object} journeyData - Updated journey data
 * @returns {Promise<Object>} Updated journey
 */
export const updateJourney = async (journeyId, journeyData) => {
  try {
    const response = await apiService.journeys.update(journeyId, journeyData);
    return response.data;
  } catch (error) {
    console.error(`Error updating journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Delete a journey
 * @param {number} journeyId - ID of the journey to delete
 * @returns {Promise<void>}
 */
export const deleteJourney = async (journeyId) => {
  try {
    await apiService.journeys.delete(journeyId);
  } catch (error) {
    console.error(`Error deleting journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Clone a journey
 * @param {number} journeyId - ID of the journey to clone
 * @param {string} name - Name for the cloned journey
 * @returns {Promise<Object>} Cloned journey
 */
export const cloneJourney = async (journeyId, name) => {
  try {
    const response = await apiService.journeys.clone(journeyId, { name });
    return response.data;
  } catch (error) {
    console.error(`Error cloning journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Get journey steps
 * @param {number} journeyId - ID of the journey
 * @returns {Promise<Array>} List of journey steps
 */
export const getJourneySteps = async (journeyId) => {
  try {
    const response = await apiService.journeys.getSteps(journeyId);
    return response.data;
  } catch (error) {
    console.error(`Error fetching steps for journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Add a step to a journey
 * @param {number} journeyId - ID of the journey
 * @param {Object} stepData - Step data including actionType, actionConfig, delayMinutes
 * @returns {Promise<Object>} Created step
 */
export const addJourneyStep = async (journeyId, stepData) => {
  try {
    const response = await apiService.journeys.addStep(journeyId, stepData);
    return response.data;
  } catch (error) {
    console.error(`Error adding step to journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Update a journey step
 * @param {number} journeyId - ID of the journey
 * @param {number} stepId - ID of the step to update
 * @param {Object} stepData - Updated step data
 * @returns {Promise<Object>} Updated step
 */
export const updateJourneyStep = async (journeyId, stepId, stepData) => {
  try {
    const response = await apiService.journeys.updateStep(journeyId, stepId, stepData);
    return response.data;
  } catch (error) {
    console.error(`Error updating step ${stepId} in journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Delete a journey step
 * @param {number} journeyId - ID of the journey
 * @param {number} stepId - ID of the step to delete
 * @returns {Promise<void>}
 */
export const deleteJourneyStep = async (journeyId, stepId) => {
  try {
    await apiService.journeys.deleteStep(journeyId, stepId);
  } catch (error) {
    console.error(`Error deleting step ${stepId} from journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Reorder journey steps
 * @param {number} journeyId - ID of the journey
 * @param {Array<number>} stepIds - Array of step IDs in the new order
 * @returns {Promise<Array>} Reordered steps
 */
export const reorderJourneySteps = async (journeyId, stepIds) => {
  try {
    const response = await apiService.journeys.reorderSteps(journeyId, { stepIds });
    return response.data.steps;
  } catch (error) {
    console.error(`Error reordering steps in journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Test a journey step
 * @param {number} journeyId - ID of the journey
 * @param {number} stepId - ID of the step to test
 * @param {Object} testData - Test data including testPhone and testEmail
 * @returns {Promise<Object>} Test results
 */
export const testJourneyStep = async (journeyId, stepId, testData) => {
  try {
    const response = await apiService.journeys.testStep(journeyId, stepId, testData);
    return response.data;
  } catch (error) {
    console.error(`Error testing step ${stepId} in journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Get journey metrics
 * @param {number} journeyId - ID of the journey
 * @param {string} timeRange - Time range for metrics (e.g., '7d', '30d', '90d')
 * @returns {Promise<Object>} Journey metrics
 */
export const getJourneyMetrics = async (journeyId, timeRange) => {
  try {
    const response = await apiService.journeys.getMetrics(journeyId, { timeRange });
    return response.data;
  } catch (error) {
    console.error(`Error fetching metrics for journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Start a journey
 * @param {number} journeyId - ID of the journey to start
 * @returns {Promise<Object>} Updated journey
 */
export const startJourney = async (journeyId) => {
  try {
    const response = await apiService.journeys.start(journeyId);
    return response.data;
  } catch (error) {
    console.error(`Error starting journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Pause a journey
 * @param {number} journeyId - ID of the journey to pause
 * @returns {Promise<Object>} Updated journey
 */
export const pauseJourney = async (journeyId) => {
  try {
    const response = await apiService.journeys.pause(journeyId);
    return response.data;
  } catch (error) {
    console.error(`Error pausing journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Archive a journey
 * @param {number} journeyId - ID of the journey to archive
 * @returns {Promise<Object>} Updated journey
 */
export const archiveJourney = async (journeyId) => {
  try {
    const response = await apiService.journeys.archive(journeyId);
    return response.data;
  } catch (error) {
    console.error(`Error archiving journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Get journey campaigns
 * @param {number} journeyId - ID of the journey
 * @returns {Promise<Array>} List of campaigns associated with the journey
 */
export const getJourneyCampaigns = async (journeyId) => {
  try {
    const response = await apiService.journeys.getCampaigns(journeyId);
    return response.data;
  } catch (error) {
    console.error(`Error fetching campaigns for journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Add multiple steps to a journey in bulk
 * @param {number} journeyId - ID of the journey
 * @param {Array<Object>} stepsData - Array of step data objects
 * @returns {Promise<Array>} Created steps
 */
export const addBulkJourneySteps = async (journeyId, stepsData) => {
  try {
    const response = await apiService.journeys.addBulkSteps(journeyId, { steps: stepsData });
    return response.data.steps;
  } catch (error) {
    console.error(`Error adding bulk steps to journey ${journeyId}:`, error);
    throw error;
  }
};
