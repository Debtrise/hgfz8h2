import axios from 'axios';

// Define API base URL
const getApiUrl = () => process.env.REACT_APP_API_URL || 'http://35.202.92.164:8080/api';

/**
 * CallService
 * 
 * Service to handle call logging and tracking via the API
 */
class CallService {
  /**
   * Log the start of a call
   * 
   * @param {Object} callData - Call start data
   * @param {string} callData.destination - Destination phone number
   * @param {string} [callData.direction='outbound'] - Call direction ('outbound' or 'inbound')
   * @returns {Promise<Object>} Call logging result with call_id
   */
  static async logCallStart(callData) {
    const response = await axios({
      method: 'post',
      url: `${getApiUrl()}/calls/start`,
      data: callData,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });
    return response.data;
  }

  /**
   * Log the end of a call
   * 
   * @param {Object} callData - Call end data
   * @param {number} callData.call_id - ID of the call to update
   * @param {number} callData.duration - Call duration in seconds
   * @param {string} callData.status - Call status ('completed', 'missed', 'failed')
   * @returns {Promise<Object>} Updated call log
   */
  static async logCallEnd(callData) {
    const response = await axios({
      method: 'post',
      url: `${getApiUrl()}/calls/end`,
      data: callData,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });
    return response.data;
  }

  /**
   * Get call logs with optional filtering
   * 
   * @param {Object} params - Optional filter parameters
   * @param {string} [params.start_date] - Filter calls after this date (YYYY-MM-DD)
   * @param {string} [params.end_date] - Filter calls before this date (YYYY-MM-DD)
   * @param {string} [params.status] - Filter by status ('completed', 'missed', 'failed')
   * @param {number} [params.page=1] - Page number for pagination
   * @param {number} [params.limit=50] - Results per page
   * @returns {Promise<Object>} Call logs with pagination info
   */
  static async getCallLogs(params = {}) {
    const response = await axios({
      method: 'get',
      url: `${getApiUrl()}/calls`,
      params,
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });
    return response.data;
  }
}

export default CallService; 