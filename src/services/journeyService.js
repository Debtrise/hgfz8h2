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
 * Get a journey by ID
 * @param {number} id - Journey ID
 * @returns {Promise<Object>} Journey data
 */
export const getJourneyById = async (id) => {
  try {
    const response = await apiService.journeys.getById(id);
    return response.data;
  } catch (error) {
    console.error(`Error fetching journey ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new journey
 * @param {Object} journeyData - Journey data including name, description, status
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
 * Get steps for a journey
 * @param {number} journeyId - ID of the journey
 * @returns {Promise<Array>} Journey steps
 */
export const getJourneySteps = async (journeyId) => {
  try {
    const response = await apiService.journeys.getSteps(journeyId);
    return response.data;
  } catch (error) {
    console.error(`Error getting steps for journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Add a step to a journey
 * @param {number} journeyId - ID of the journey
 * @param {Object} stepData - Step data (actionType, actionConfig, sequenceOrder, etc)
 * @returns {Promise<Object>} Created step
 */
export const addJourneyStep = async (journeyId, stepData) => {
  try {
    console.log('Adding step to journey:', journeyId, 'with data:', stepData);
    const response = await apiService.journeys.addStep(journeyId, stepData);
    return response.data;
  } catch (error) {
    console.error(`Error adding step to journey ${journeyId}:`, error);
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

/**
 * Update a journey step
 * @param {number} journeyId - ID of the journey
 * @param {number} stepId - ID of the step to update
 * @param {Object} stepData - Updated step data
 * @returns {Promise<Object>} Updated step
 */
export const updateJourneyStep = async (journeyId, stepId, stepData) => {
  try {
    console.log('Updating step:', stepId, 'in journey:', journeyId, 'with data:', stepData);
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
 * Reorder steps in a journey
 * @param {number} journeyId - ID of the journey
 * @param {Array<Object>} stepsOrder - Array of step IDs and new sequence orders
 * @returns {Promise<Array>} Updated steps
 */
export const reorderJourneySteps = async (journeyId, stepsOrder) => {
  try {
    const response = await apiService.journeys.reorderSteps(journeyId, { steps: stepsOrder });
    return response.data;
  } catch (error) {
    console.error(`Error reordering steps in journey ${journeyId}:`, error);
    throw error;
  }
};

/**
 * Test a journey step
 * @param {number} journeyId - ID of the journey
 * @param {number} stepId - ID of the step to test
 * @param {Object} testData - Test data
 * @returns {Promise<Object>} Test result
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
 * Update multiple journey steps in bulk
 * @param {number} journeyId - ID of the journey
 * @param {Array<Object>} stepsData - Array of step data objects
 * @returns {Promise<Array>} Updated steps
 */
export const updateJourneySteps = async (journeyId, stepsData) => {
  try {
    // Format each step according to the API requirements
    const formattedSteps = stepsData.map(step => ({
      id: step.id,
      actionType: step.actionType,
      actionConfig: step.actionConfig || {},
      delayMinutes: step.delayMinutes || 0,
      sequenceOrder: step.sequenceOrder
    }));
    
    const response = await apiService.journeys.updateBulkSteps(journeyId, { steps: formattedSteps });
    return response.data.steps;
  } catch (error) {
    console.error(`Error updating bulk steps in journey ${journeyId}:`, error);
    throw error;
  }
};
