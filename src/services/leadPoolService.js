import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../config';

const LEAD_POOLS_ENDPOINT = `${API_BASE_URL}${ENDPOINTS.LEAD_POOLS}`;

/**
 * Get all lead pools
 * @returns {Promise<Array>} Array of all lead pools
 */
export const getAllLeadPools = async () => {
  try {
    console.log('Fetching all lead pools from:', `${LEAD_POOLS_ENDPOINT}/all`);
    const response = await axios.get(`${LEAD_POOLS_ENDPOINT}/all`);
    console.log('Lead pools API response:', response);
    
    // Check if response.data is an array, if not, try to extract the array from the response
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && typeof response.data === 'object') {
      // Try to find an array property in the response
      const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
      if (possibleArrays.length > 0) {
        return possibleArrays[0];
      }
    }
    
    // If we couldn't find an array, return an empty array
    console.warn('No lead pools array found in response:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching all lead pools:', error);
    throw error;
  }
};

/**
 * Get a lead pool by ID
 * @param {string} id Lead pool ID
 * @returns {Promise<Object>} Lead pool object
 */
export const getLeadPoolById = async (id) => {
  try {
    const response = await axios.get(`${LEAD_POOLS_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching lead pool ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new lead pool
 * @param {Object} poolData Lead pool data
 * @returns {Promise<Object>} Created lead pool object
 */
export const createLeadPool = async (poolData) => {
  try {
    const response = await axios.post(LEAD_POOLS_ENDPOINT, poolData);
    return response.data;
  } catch (error) {
    console.error('Error creating lead pool:', error);
    throw error;
  }
};

/**
 * Update an existing lead pool
 * @param {string} id Lead pool ID
 * @param {Object} poolData Updated lead pool data
 * @returns {Promise<Object>} Updated lead pool object
 */
export const updateLeadPool = async (id, poolData) => {
  try {
    const response = await axios.put(`${LEAD_POOLS_ENDPOINT}/${id}`, poolData);
    return response.data;
  } catch (error) {
    console.error(`Error updating lead pool ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a lead pool
 * @param {string} id Lead pool ID
 * @returns {Promise<void>}
 */
export const deleteLeadPool = async (id) => {
  try {
    await axios.delete(`${LEAD_POOLS_ENDPOINT}/${id}`);
  } catch (error) {
    console.error(`Error deleting lead pool ${id}:`, error);
    throw error;
  }
};

/**
 * Get lead pool statistics
 * @param {string} id Lead pool ID
 * @returns {Promise<Object>} Lead pool statistics
 */
export const getLeadPoolStats = async (id) => {
  try {
    const response = await axios.get(`${LEAD_POOLS_ENDPOINT}/${id}/stats`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching lead pool ${id} statistics:`, error);
    throw error;
  }
};

/**
 * Import leads into a lead pool
 * @param {string} id Lead pool ID
 * @param {Array} leads Array of lead data
 * @returns {Promise<Object>} Import results
 */
export const importLeads = async (id, leads) => {
  try {
    const response = await axios.post(`${LEAD_POOLS_ENDPOINT}/${id}/import`, { leads });
    return response.data;
  } catch (error) {
    console.error(`Error importing leads to pool ${id}:`, error);
    throw error;
  }
};

/**
 * Export leads from a lead pool
 * @param {string} id Lead pool ID
 * @param {Object} filters Export filters
 * @returns {Promise<Blob>} Exported file
 */
export const exportLeads = async (id, filters = {}) => {
  try {
    const response = await axios.get(`${LEAD_POOLS_ENDPOINT}/${id}/export`, {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error(`Error exporting leads from pool ${id}:`, error);
    throw error;
  }
};

/**
 * Get lead pool capacity metrics
 * @param {string} id Lead pool ID
 * @returns {Promise<Object>} Capacity metrics
 */
export const getLeadPoolCapacity = async (id) => {
  try {
    const response = await axios.get(`${LEAD_POOLS_ENDPOINT}/${id}/capacity`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching lead pool ${id} capacity:`, error);
    throw error;
  }
}; 