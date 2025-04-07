import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../config';

const DID_POOLS_ENDPOINT = `${API_BASE_URL}${ENDPOINTS.DID_POOLS}`;

/**
 * Get all DID pools
 * @returns {Promise<Array>} Array of all DID pools
 */
export const getAllDidPools = async () => {
  try {
    console.log('Fetching all DID pools from:', `${DID_POOLS_ENDPOINT}/all`);
    const response = await axios.get(`${DID_POOLS_ENDPOINT}/all`);
    console.log('DID pools API response:', response);
    
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
    console.warn('No DID pools array found in response:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching all DID pools:', error);
    throw error;
  }
};

/**
 * Get a DID pool by ID
 * @param {string} id DID pool ID
 * @returns {Promise<Object>} DID pool object
 */
export const getDidPoolById = async (id) => {
  try {
    const response = await axios.get(`${DID_POOLS_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching DID pool ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new DID pool
 * @param {Object} poolData DID pool data
 * @returns {Promise<Object>} Created DID pool object
 */
export const createDidPool = async (poolData) => {
  try {
    const response = await axios.post(DID_POOLS_ENDPOINT, poolData);
    return response.data;
  } catch (error) {
    console.error('Error creating DID pool:', error);
    throw error;
  }
};

/**
 * Update an existing DID pool
 * @param {string} id DID pool ID
 * @param {Object} poolData Updated DID pool data
 * @returns {Promise<Object>} Updated DID pool object
 */
export const updateDidPool = async (id, poolData) => {
  try {
    const response = await axios.put(`${DID_POOLS_ENDPOINT}/${id}`, poolData);
    return response.data;
  } catch (error) {
    console.error(`Error updating DID pool ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a DID pool
 * @param {string} id DID pool ID
 * @returns {Promise<void>}
 */
export const deleteDidPool = async (id) => {
  try {
    await axios.delete(`${DID_POOLS_ENDPOINT}/${id}`);
  } catch (error) {
    console.error(`Error deleting DID pool ${id}:`, error);
    throw error;
  }
};

/**
 * Get DID pool statistics
 * @param {string} id DID pool ID
 * @returns {Promise<Object>} DID pool statistics
 */
export const getDidPoolStats = async (id) => {
  try {
    const response = await axios.get(`${DID_POOLS_ENDPOINT}/${id}/stats`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching DID pool ${id} statistics:`, error);
    throw error;
  }
};

/**
 * Import DIDs into a pool
 * @param {string} id DID pool ID
 * @param {Array} dids Array of DID numbers
 * @returns {Promise<Object>} Import results
 */
export const importDids = async (id, dids) => {
  try {
    const response = await axios.post(`${DID_POOLS_ENDPOINT}/${id}/import`, { dids });
    return response.data;
  } catch (error) {
    console.error(`Error importing DIDs to pool ${id}:`, error);
    throw error;
  }
};

/**
 * Get available DIDs in a pool
 * @param {string} id DID pool ID
 * @returns {Promise<Array>} Array of available DIDs
 */
export const getAvailableDids = async (id) => {
  try {
    const response = await axios.get(`${DID_POOLS_ENDPOINT}/${id}/available`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching available DIDs for pool ${id}:`, error);
    throw error;
  }
};

/**
 * Reserve a DID in a pool
 * @param {string} id DID pool ID
 * @param {string} did DID number to reserve
 * @returns {Promise<Object>} Reserved DID details
 */
export const reserveDid = async (id, did) => {
  try {
    const response = await axios.post(`${DID_POOLS_ENDPOINT}/${id}/reserve`, { did });
    return response.data;
  } catch (error) {
    console.error(`Error reserving DID ${did} in pool ${id}:`, error);
    throw error;
  }
};

/**
 * Release a DID back to the pool
 * @param {string} id DID pool ID
 * @param {string} did DID number to release
 * @returns {Promise<Object>} Released DID details
 */
export const releaseDid = async (id, did) => {
  try {
    const response = await axios.post(`${DID_POOLS_ENDPOINT}/${id}/release`, { did });
    return response.data;
  } catch (error) {
    console.error(`Error releasing DID ${did} in pool ${id}:`, error);
    throw error;
  }
}; 