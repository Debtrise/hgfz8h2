/**
 * IRSLogicsService.js
 * 
 * This service handles all API calls to the IRS Logics API.
 */

// Base URL for the IRS Logics API
const API_BASE_URL = process.env.REACT_APP_IRS_LOGICS_API_URL || 'https://api.irslogics.com/v1';

/**
 * Class to handle IRS Logics API integration
 */
class IRSLogicsService {
  constructor() {
    this.apiKey = localStorage.getItem('irslogics_api_key') || null;
    this.apiSecret = localStorage.getItem('irslogics_api_secret') || null;
  }

  /**
   * Set API credentials
   * @param {string} apiKey - API key for IRS Logics
   * @param {string} apiSecret - API secret for IRS Logics
   * @returns {boolean} - Returns true if successful
   */
  setCredentials(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    
    // Store credentials in localStorage
    localStorage.setItem('irslogics_api_key', apiKey);
    localStorage.setItem('irslogics_api_secret', apiSecret);
    
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
    localStorage.removeItem('irslogics_api_key');
    localStorage.removeItem('irslogics_api_secret');
    
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
      'Authorization': `Bearer ${this.apiKey}`,
      'X-API-Secret': this.apiSecret,
      'X-Source': 'YourAppName'
    };
  }

  /**
   * Fetch data from IRS Logics API
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
      console.error('Error fetching from IRS Logics API:', error);
      throw error;
    }
  }

  /**
   * Test connection to the IRS Logics API
   * @returns {Promise<boolean>} - Promise that resolves to true if connection is successful
   */
  async testConnection() {
    try {
      const response = await this.fetchFromAPI('/auth/validate');
      return response.valid === true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get tax documents from IRS Logics
   * @param {Object} options - Options for filtering documents
   * @returns {Promise<Array>} - Promise that resolves to array of documents
   */
  async getTaxDocuments(options = {}) {
    const { page = 1, limit = 50, clientId = '', taxYear = '', docType = '' } = options;
    
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(clientId ? { client_id: clientId } : {}),
      ...(taxYear ? { tax_year: taxYear } : {}),
      ...(docType ? { doc_type: docType } : {})
    }).toString();
    
    return this.fetchFromAPI(`/tax-documents?${queryParams}`);
  }

  /**
   * Get client records from IRS Logics
   * @param {Object} options - Options for filtering clients
   * @returns {Promise<Array>} - Promise that resolves to array of clients
   */
  async getClientRecords(options = {}) {
    const { page = 1, limit = 100, query = '' } = options;
    
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(query ? { query } : {})
    }).toString();
    
    return this.fetchFromAPI(`/clients?${queryParams}`);
  }

  /**
   * Get filing statuses from IRS Logics
   * @param {Object} options - Options for filtering filing statuses
   * @returns {Promise<Array>} - Promise that resolves to array of filing statuses
   */
  async getFilingStatuses(options = {}) {
    const { taxYear = new Date().getFullYear() - 1, clientId = '' } = options;
    
    const queryParams = new URLSearchParams({
      tax_year: taxYear,
      ...(clientId ? { client_id: clientId } : {})
    }).toString();
    
    return this.fetchFromAPI(`/filing-statuses?${queryParams}`);
  }

  /**
   * Sync tax documents to IRS Logics
   * @param {Array} documents - Array of document objects to sync
   * @returns {Promise<Object>} - Promise that resolves to response data
   */
  async syncTaxDocuments(documents) {
    return this.fetchFromAPI('/sync/tax-documents', {
      method: 'POST',
      body: JSON.stringify({ documents })
    });
  }

  /**
   * Sync client records to IRS Logics
   * @param {Array} clients - Array of client objects to sync
   * @returns {Promise<Object>} - Promise that resolves to response data
   */
  async syncClientRecords(clients) {
    return this.fetchFromAPI('/sync/clients', {
      method: 'POST',
      body: JSON.stringify({ clients })
    });
  }

  /**
   * Get tax forms from IRS Logics
   * @param {string} formNumber - Form number (e.g., '1040', 'W2')
   * @param {number} taxYear - Tax year
   * @returns {Promise<Object>} - Promise that resolves to form data
   */
  async getTaxForm(formNumber, taxYear = new Date().getFullYear() - 1) {
    return this.fetchFromAPI(`/tax-forms/${formNumber}?tax_year=${taxYear}`);
  }

  /**
   * Get IRS deadlines and important dates
   * @param {number} taxYear - Tax year
   * @returns {Promise<Array>} - Promise that resolves to array of dates
   */
  async getTaxCalendar(taxYear = new Date().getFullYear()) {
    return this.fetchFromAPI(`/tax-calendar?tax_year=${taxYear}`);
  }
}

// Create a singleton instance
const irsLogicsService = new IRSLogicsService();

export default irsLogicsService; 