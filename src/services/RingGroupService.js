import axios from 'axios';

// Define API base URL
const getApiUrl = () => process.env.REACT_APP_API_URL || 'http://35.202.92.164:8080/api';

/**
 * RingGroupService
 * 
 * Service to handle Ring Group management via the API
 */
class RingGroupService {
  /**
   * Get all ring groups in the system
   * 
   * @returns {Promise<Array>} List of ring groups
   */
  static async getAllRingGroups() {
    const response = await axios({
      method: 'get',
      url: `${getApiUrl()}/ringgroups`,
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });
    return response.data;
  }

  /**
   * Get a specific ring group by ID
   * 
   * @param {string} id - Ring group ID/number
   * @returns {Promise<Object>} Ring group details
   */
  static async getRingGroupById(id) {
    const response = await axios({
      method: 'get',
      url: `${getApiUrl()}/ringgroups/${id}`,
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });
    return response.data;
  }

  /**
   * Create a new ring group
   * 
   * @param {Object} groupData - Ring group data
   * @param {string} groupData.groupNumber - Group number (e.g., "600")
   * @param {string} groupData.description - Group description
   * @param {Array<string>} groupData.extensions - List of extensions to include
   * @param {string} groupData.strategy - Ring strategy ("ringall", "hunt", etc.)
   * @param {number} groupData.ringTime - Ring time in seconds
   * @returns {Promise<Object>} Created ring group info
   */
  static async createRingGroup(groupData) {
    const response = await axios({
      method: 'post',
      url: `${getApiUrl()}/ring-groups`,
      data: groupData,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Beearer ${localStorage.getItem('token')}` 
      }
    });
    return response.data;
  }

  /**
   * Update an existing ring group
   * 
   * @param {string} id - Ring group ID/number
   * @param {Object} groupData - Ring group data to update
   * @returns {Promise<Object>} Updated ring group info
   */
  static async updateRingGroup(id, groupData) {
    const response = await axios({
      method: 'put',
      url: `${getApiUrl()}/ringgroups/${id}`,
      data: groupData,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });
    return response.data;
  }

  /**
   * Delete a ring group
   * 
   * @param {string} id - Ring group ID/number
   * @returns {Promise<Object>} Result of the deletion
   */
  static async deleteRingGroup(id) {
    const response = await axios({
      method: 'delete',
      url: `${getApiUrl()}/ringgroups/${id}`,
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });
    return response.data;
  }

  /**
   * Add an extension to a ring group
   * 
   * @param {string} groupId - Ring group ID/number
   * @param {string} extension - Extension to add
   * @returns {Promise<Object>} Result of the operation
   */
  static async addExtensionToRingGroup(groupId, extension) {
    const response = await axios({
      method: 'post',
      url: `${getApiUrl()}/ringgroups/${groupId}/extensions`,
      data: { extension },
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });
    return response.data;
  }

  /**
   * Remove an extension from a ring group
   * 
   * @param {string} groupId - Ring group ID/number
   * @param {string} extension - Extension to remove
   * @returns {Promise<Object>} Result of the operation
   */
  static async removeExtensionFromRingGroup(groupId, extension) {
    const response = await axios({
      method: 'delete',
      url: `${getApiUrl()}/ringgroups/${groupId}/extensions/${extension}`,
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });
    return response.data;
  }

  /**
   * Create a tiered ring group (for call queue simulation)
   * 
   * @param {Object} tierData - Tiered ring group configuration
   * @param {string} tierData.baseGroupNumber - Base group number
   * @param {string} tierData.description - Group description
   * @param {Array<Object>} tierData.tiers - List of tier configurations
   * @returns {Promise<Object>} Result of the operation
   */
  static async createTieredRingGroup(tierData) {
    const response = await axios({
      method: 'post',
      url: `${getApiUrl()}/ringgroups/tiered`,
      data: tierData,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });
    return response.data;
  }
}

export default RingGroupService; 