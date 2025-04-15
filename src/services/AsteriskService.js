import axios from 'axios';
import { getSipConfig } from './callCenterConfig';

// Define API base URL
const getApiUrl = () => process.env.REACT_APP_API_URL || 'http://35.202.92.164:8080/api';

/**
 * AsteriskService
 * 
 * Service to handle Asterisk PBX configuration and integration
 */
class AsteriskService {
  /**
   * Check if an extension already exists in Asterisk
   * 
   * @param {string} extension - The extension to check
   * @returns {Promise<boolean>} True if the extension exists
   */
  static async checkExtensionExists(extension) {
    if (!extension) {
      return false;
    }
    
    try {
      const response = await axios({
        method: 'get',
        url: `${getApiUrl()}/asterisk/extensions/${extension}/exists`,
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      return response.data.exists;
    } catch (error) {
      // If the endpoint doesn't exist, try to get the status instead
      try {
        await this.getExtensionStatus(extension);
        return true; // If we get status without error, it exists
      } catch (statusError) {
        // If status check also fails, assume it doesn't exist
        return false;
      }
    }
  }

  /**
   * Configure an extension in Asterisk for a new agent
   * 
   * @param {string} agentId - The agent's ID
   * @param {string} extension - The agent's extension number
   * @param {string} email - The agent's email for notifications
   * @returns {Promise<object>} Configuration result
   */
  static async configureExtension(agentId, extension, email) {
    // Check if extension is valid
    if (!extension) {
      console.error('Cannot configure Asterisk: Extension is undefined or empty');
      throw new Error('Extension is required for Asterisk configuration');
    }
    
    try {
      // Use the sync-asterisk endpoint for creating/updating extensions
      const response = await axios({
        method: 'post',
        url: `${getApiUrl()}/agents/${agentId}/sync-asterisk`,
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      console.log(`Extension ${extension} synchronized with FreePBX successfully`);
      return response.data;
    } catch (error) {
      console.error('Error configuring Asterisk extension:', error);
      throw error;
    }
  }
  
  /**
   * Remove an extension configuration from Asterisk
   * 
   * @param {string} extension - The extension to remove
   * @returns {Promise<object>} Result of the operation
   */
  static async removeExtension(extension) {
    if (!extension) {
      console.error('Cannot remove Asterisk extension: Extension is undefined or empty');
      return { success: false, error: 'Invalid extension' };
    }
    
    try {
      // Since there's no direct endpoint for removing extensions,
      // we need to work with the agent API endpoints
      const response = await axios({
        method: 'delete',
        url: `${getApiUrl()}/agents/extension/${extension}`,
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error removing Asterisk extension:', error);
      throw error;
    }
  }
  
  /**
   * Update an extension configuration in Asterisk
   * 
   * @param {string} agentId - The agent's ID
   * @param {object} configData - New configuration data
   * @returns {Promise<object>} Result of the operation
   */
  static async updateExtension(agentId, configData) {
    if (!agentId) {
      console.error('Cannot update Asterisk extension: Agent ID is undefined or empty');
      throw new Error('Invalid agent ID');
    }
    
    try {
      // Use the sync-asterisk endpoint for updating extensions
      const response = await axios({
        method: 'post',
        url: `${getApiUrl()}/agents/${agentId}/sync-asterisk`,
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating Asterisk extension:', error);
      throw error;
    }
  }
  
  /**
   * Get status of an extension in Asterisk
   * 
   * @param {string} extension - The extension to check
   * @returns {Promise<object>} Extension status
   */
  static async getExtensionStatus(extension) {
    if (!extension) {
      console.error('Cannot get Asterisk extension status: Extension is undefined or empty');
      throw new Error('Invalid extension');
    }
    
    try {
      // There's no direct endpoint for checking extension status,
      // we'll use SIP credentials endpoint as a proxy
      const response = await axios({
        method: 'get',
        url: `${getApiUrl()}/sip/credentials`,
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      return {
        extension,
        status: response.data && response.data.agent_extension === extension ? 'active' : 'unknown'
      };
    } catch (error) {
      console.error('Error getting Asterisk extension status:', error);
      throw error;
    }
  }
  
  /**
   * Get SIP credentials for the current agent
   * 
   * @returns {Promise<object>} SIP credentials
   */
  static async getSipCredentials() {
    try {
      const response = await axios({
        method: 'get',
        url: `${getApiUrl()}/sip/credentials`,
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting SIP credentials:', error);
      throw error;
    }
  }
  
  /**
   * Update SIP registration status
   * 
   * @param {object} registrationData - Registration data
   * @returns {Promise<object>} Result of the operation
   */
  static async updateSipRegistration(registrationData) {
    try {
      const response = await axios({
        method: 'post',
        url: `${getApiUrl()}/sip/registration`,
        data: registrationData,
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating SIP registration:', error);
      throw error;
    }
  }
}

export default AsteriskService; 