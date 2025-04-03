/**
 * ForthCRMService.js
 * 
 * This service handles all API calls to the Forth CRM API.
 */

// Base URL for the Forth CRM API
const API_BASE_URL = process.env.REACT_APP_FORTH_CRM_API_URL || 'https://api.forthcrm.com/v1';

/**
 * Class to handle Forth CRM API integration
 */
class ForthCRMService {
  constructor() {
    this.apiKey = localStorage.getItem('forthcrm_api_key') || null;
    this.apiSecret = localStorage.getItem('forthcrm_api_secret') || null;
  }

  /**
   * Set API credentials
   * @param {string} apiKey - API key for Forth CRM
   * @param {string} apiSecret - API secret for Forth CRM
   * @returns {boolean} - Returns true if successful
   */
  setCredentials(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    
    // Store credentials in localStorage
    localStorage.setItem('forthcrm_api_key', apiKey);
    localStorage.setItem('forthcrm_api_secret', apiSecret);
    
    return true;
  }

  /**
   * Clear API credentials
   * @returns {boolean} - Returns true if successful
   */
  clearCredentials() {
    this.apiKey = null;
    this.apiSecret = null;
    
    // Remove credentials from localStorage
    localStorage.removeItem('forthcrm_api_key');
    localStorage.removeItem('forthcrm_api_secret');
    
    return true;
  }

  /**
   * Check if credentials are set
   * @returns {boolean} - Returns true if credentials are set
   */
  hasCredentials() {
    return !!(this.apiKey && this.apiSecret);
  }

  /**
   * Generate headers for API requests
   * @returns {Object} - Headers object
   */
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(`${this.apiKey}:${this.apiSecret}`)}`,
      'X-Source': 'YourAppName'
    };
  }

  /**
   * Fetch data from Forth CRM API
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} - Promise that resolves to response data
   */
  async fetchFromAPI(endpoint, options = {}) {
    if (!this.hasCredentials()) {
      throw new Error('API credentials not set');
    }

    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
      headers: this.getHeaders(),
      method: 'GET',
    };
    
    const fetchOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {})
      }
    };
    
    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching from Forth CRM API:', error);
      throw error;
    }
  }

  /**
   * Test connection to the Forth CRM API
   * @returns {Promise<boolean>} - Promise that resolves to true if connection is successful
   */
  async testConnection() {
    try {
      const response = await this.fetchFromAPI('/auth/test');
      return response.success === true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get contacts from Forth CRM
   * @param {Object} options - Options for filtering contacts
   * @returns {Promise<Array>} - Promise that resolves to array of contacts
   */
  async getContacts(options = {}) {
    const { page = 1, limit = 100, query = '' } = options;
    
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(query ? { query } : {})
    }).toString();
    
    return this.fetchFromAPI(`/contacts?${queryParams}`);
  }

  /**
   * Get leads from Forth CRM
   * @param {Object} options - Options for filtering leads
   * @returns {Promise<Array>} - Promise that resolves to array of leads
   */
  async getLeads(options = {}) {
    const { page = 1, limit = 100, query = '', status = '' } = options;
    
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(query ? { query } : {}),
      ...(status ? { status } : {})
    }).toString();
    
    return this.fetchFromAPI(`/leads?${queryParams}`);
  }

  /**
   * Sync contacts to Forth CRM
   * @param {Array} contacts - Array of contact objects to sync
   * @returns {Promise<Object>} - Promise that resolves to response data
   */
  async syncContacts(contacts) {
    return this.fetchFromAPI('/sync/contacts', {
      method: 'POST',
      body: JSON.stringify({ contacts })
    });
  }

  /**
   * Sync leads to Forth CRM
   * @param {Array} leads - Array of lead objects to sync
   * @returns {Promise<Object>} - Promise that resolves to response data
   */
  async syncLeads(leads) {
    return this.fetchFromAPI('/sync/leads', {
      method: 'POST',
      body: JSON.stringify({ leads })
    });
  }

  /**
   * Get campaigns from Forth CRM
   * @param {Object} options - Options for filtering campaigns
   * @returns {Promise<Array>} - Promise that resolves to array of campaigns
   */
  async getCampaigns(options = {}) {
    const { page = 1, limit = 50, status = '' } = options;
    
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(status ? { status } : {})
    }).toString();
    
    return this.fetchFromAPI(`/campaigns?${queryParams}`);
  }

  /**
   * Sync call logs to Forth CRM
   * @param {Array} callLogs - Array of call log objects to sync
   * @returns {Promise<Object>} - Promise that resolves to response data
   */
  async syncCallLogs(callLogs) {
    return this.fetchFromAPI('/sync/call-logs', {
      method: 'POST',
      body: JSON.stringify({ callLogs })
    });
  }

  /**
   * Sync tasks to Forth CRM
   * @param {Array} tasks - Array of task objects to sync
   * @returns {Promise<Object>} - Promise that resolves to response data
   */
  async syncTasks(tasks) {
    return this.fetchFromAPI('/sync/tasks', {
      method: 'POST',
      body: JSON.stringify({ tasks })
    });
  }
}

// Create a singleton instance
const forthCRMService = new ForthCRMService();

export default forthCRMService; 