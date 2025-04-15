import axios from 'axios';
import AsteriskService from './AsteriskService';

// Define API base URL
const getApiUrl = () => process.env.REACT_APP_API_URL || 'http://35.202.92.164:8080/api';

/**
 * Agent Service
 * 
 * Service to handle agent management and SIP functionality
 */
class AgentService {
  /**
   * Get all agents (Admin/Manager only)
   * 
   * @returns {Promise<Array>} List of all agents
   */
  static async getAllAgents() {
    const response = await axios({
      method: 'get',
      url: `${getApiUrl()}/agents`,
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });
    return response.data;
  }

  /**
   * Get agent by ID
   * 
   * @param {number} id - Agent ID
   * @returns {Promise<Object>} Agent details
   */
  static async getAgentById(id) {
    const response = await axios({
      method: 'get',
      url: `${getApiUrl()}/agents/${id}`,
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });
    return response.data;
  }

  /**
   * Create new agent (Admin only)
   * 
   * @param {Object} agentData - Agent data
   * @returns {Promise<Object>} Created agent data
   */
  static async createAgent(agentData) {
    // Ensure the data matches the API specification
    const payload = {
      email: agentData.email,
      password: agentData.password,
      first_name: agentData.first_name,
      last_name: agentData.last_name,
      agent_extension: agentData.agent_extension,
      max_concurrent_calls: agentData.max_concurrent_calls
    };
    console.log('Creating agent with payload:', payload); // Debug log
    
    // Create the agent in the backend
    try {
      // Log the URL to debug the issue
      console.log('Creating agent at URL:', getApiUrl() + '/agents');
      
      // Make the request with the full URL
      const response = await axios({
        method: 'post',
        url: `${getApiUrl()}/agents`,
        data: payload,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Agent created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error during agent creation:', error);
      throw error;
    }
  }

  /**
   * Update agent details
   * 
   * @param {number} id - Agent ID
   * @param {Object} agentData - Updated agent data
   * @returns {Promise<Object>} Updated agent data
   */
  static async updateAgent(id, agentData) {
    const response = await axios({
      method: 'put',
      url: `${getApiUrl()}/agents/${id}`,
      data: agentData,
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });
    return response.data;
  }

  /**
   * Delete agent
   * 
   * @param {number} id - Agent ID
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteAgent(id) {
    const response = await axios({
      method: 'delete',
      url: `${getApiUrl()}/agents/${id}`,
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });
    return response.data;
  }

  /**
   * Update agent status
   * 
   * @param {number} id - Agent ID
   * @param {Object} statusData - Status update data
   * @param {string} statusData.agent_status - Agent status (online, offline, etc.)
   * @param {boolean} statusData.available_for_calls - Whether agent is available for calls
   * @returns {Promise<Object>} Updated agent status
   */
  static async updateAgentStatus(id, statusData) {
    const response = await axios({
      method: 'put',
      url: `${getApiUrl()}/agents/${id}/status`,
      data: statusData,
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });
    return response.data;
  }

  /**
   * Get agent stats
   * 
   * @param {number} id - Agent ID
   * @returns {Promise<Object>} Agent statistics
   */
  static async getAgentStats(id) {
    const response = await axios({
      method: 'get',
      url: `${getApiUrl()}/agents/${id}/stats`,
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });
    return response.data;
  }

  /**
   * Sync agent with FreePBX (recovery function)
   * 
   * @param {number} id - Agent ID
   * @returns {Promise<Object>} Sync result
   */
  static async syncAgentWithAsterisk(id) {
    const response = await axios({
      method: 'post',
      url: `${getApiUrl()}/agents/${id}/sync-asterisk`,
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });
    return response.data;
  }

  /**
   * Get SIP credentials for the current agent
   * 
   * @returns {Promise<Object>} SIP credentials
   */
  static async getSipCredentials() {
    const response = await axios({
      method: 'get',
      url: `${getApiUrl()}/sip/credentials`,
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });
    return response.data;
  }

  /**
   * Update SIP registration status
   * 
   * @param {Object} registrationData - Registration data
   * @param {boolean} registrationData.registered - Whether agent is registered with SIP
   * @returns {Promise<Object>} Updated registration status
   */
  static async updateSipRegistration(registrationData) {
    const response = await axios({
      method: 'post',
      url: `${getApiUrl()}/sip/registration`,
      data: registrationData,
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });
    return response.data;
  }
}

export default AgentService; 