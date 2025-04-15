import apiService from './apiService';

const BASE_URL = 'http://34.134.140.42:3010';
const AGENT_STATUS_URL = 'https://dialer-api-154842307047.us-west2.run.app/getAgentStatus';
const QUEUE_COUNTS_URL = 'https://dialer-api-154842307047.us-west2.run.app/getDialerQueueCounts';
const DIALER_CONTROL_URL = 'https://dialer-api-154842307047.us-west2.run.app/getDialerControl';
const UPDATE_DIALER_URL = 'https://dialer-api-154842307047.us-west2.run.app/updateDialerControl';
const CALL_DETECTION_URL = 'http://34.134.140.42:8080/stats';
const HOURLY_STATS_URL = 'http://34.134.140.42:3010/api/stats/hourly';
const API_BASE_URL = 'http://35.208.29.228:4000';
const DIALER_API_URL = 'https://dialer-api-154842307047.us-west2.run.app';

export const callAnalyticsService = {
  // Get today's summary statistics
  getTodaySummary: async () => {
    try {
      return await apiService.callCenter.analytics.getTodaySummary();
    } catch (error) {
      console.error('Error fetching today summary:', error);
      // Return default values if API call fails
      return { totalCalls: 0 };
    }
  },

  // Get hourly breakdown for a specific date
  getHourlyBreakdown: async (date) => {
    return apiService.callCenter.analytics.getHourlyBreakdown(date);
  },

  // Get daily statistics for a date range
  getDailyStats: async (startDate, endDate) => {
    return apiService.callCenter.analytics.getDailyStats(startDate, endDate);
  },

  // Get real-time monitoring data
  getRealTimeStats: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/stats/real-time`);
      if (!response.ok) throw new Error('Failed to fetch real-time stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching real-time stats:', error);
      throw error;
    }
  },

  // Get agent status
  async getAgentStatus() {
    try {
      const response = await fetch(`${DIALER_API_URL}/getAgentStatus`);
      if (!response.ok) throw new Error('Failed to fetch agent status');
      return await response.json();
    } catch (error) {
      console.error('Error fetching agent status:', error);
      throw error;
    }
  },

  // Get dialer queue counts
  async getDialerQueueCounts() {
    try {
      const response = await fetch(`${DIALER_API_URL}/getDialerQueueCounts`);
      if (!response.ok) throw new Error('Failed to fetch dialer queue counts');
      return await response.json();
    } catch (error) {
      console.error('Error fetching dialer queue counts:', error);
      // Return default values if API call fails
      return { totalCount: 0 };
    }
  },

  // Get dialer control settings
  async getDialerControl() {
    try {
      const response = await fetch(`${DIALER_API_URL}/getDialerControl`);
      if (!response.ok) throw new Error('Failed to fetch dialer control settings');
      const data = await response.json();
      return {
        speed: data.speed || 0,
        multiplier: data.multiplier || 5,
        status: data.status || 'active',
        min_agent_availability: data.min_agent_availability || 2,
        id: data.id || 1
      };
    } catch (error) {
      console.error('Error fetching dialer control settings:', error);
      throw error;
    }
  },

  // Update dialer control settings
  async updateDialerControl(settings) {
    try {
      const response = await fetch(`${DIALER_API_URL}/updateDialerControl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          speed: settings.speed || 0,
          multiplier: 5,
          status: 'active',
          min_agent_availability: settings.min_agent_availability || 2,
          id: 1
        })
      });
      if (!response.ok) throw new Error('Failed to update dialer control settings');
      return await response.json();
    } catch (error) {
      console.error('Error updating dialer control settings:', error);
      throw error;
    }
  },

  // Get call detection statistics
  getCallDetectionStats: async () => {
    return apiService.callCenter.analytics.getCallDetectionStats();
  },

  // Get hourly statistics
  getHourlyStats: async () => {
    return apiService.callCenter.analytics.getHourlyStats();
  },

  // Get hourly call data for the current day
  getHourlyData: async () => {
    return apiService.callCenter.analytics.getHourlyData();
  },

  // Get call data for a date range
  getDateRangeData: async (startDate, endDate) => {
    return apiService.callCenter.analytics.getDateRangeData(startDate, endDate);
  },

  // Get health check status
  getHealthCheck: async () => {
    return apiService.callCenter.analytics.getHealthCheck();
  },

  // Get server status
  getServerStatus: async () => {
    return apiService.callCenter.analytics.getServerStatus();
  },

  // Get all calls with pagination and filtering
  getAllCalls: async (params = {}) => {
    return apiService.callCenter.logs.getAll(params);
  },

  // Get call details by unique ID
  getCallDetails: async (uniqueid) => {
    return apiService.callCenter.logs.getById(uniqueid);
  },

  // Get call counts by disposition
  async getCallCountsByDisposition(startDate, endDate) {
    try {
      const queryParams = new URLSearchParams({
        startDate,
        endDate
      });

      const response = await fetch(`${API_BASE_URL}/api/calls/counts/disposition?${queryParams}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch call counts');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching call counts:', error);
      throw error;
    }
  },

  // Get call duration statistics
  async getCallDurationStats(startDate, endDate, dcontext) {
    try {
      const queryParams = new URLSearchParams({
        startDate,
        endDate,
        ...(dcontext && { dcontext })
      });

      const response = await fetch(`${API_BASE_URL}/api/calls/stats/duration?${queryParams}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch duration stats');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching duration stats:', error);
      throw error;
    }
  },

  // Get agent performance metrics
  getAgentPerformance: async (params = {}) => {
    return apiService.callCenter.analytics.getAgentPerformance(params);
  },

  // Get real-time metrics
  getRealTimeMetrics: async () => {
    return apiService.callCenter.analytics.getRealTimeMetrics();
  },

  // Search for calls
  async searchCalls(searchParams) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/calls/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams)
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to search calls');
      }
      
      return data;
    } catch (error) {
      console.error('Error searching calls:', error);
      throw error;
    }
  },

  // Export call data
  async exportCallData(startDate, endDate, format = 'csv', params = {}) {
    try {
      const queryParams = new URLSearchParams({
        startDate,
        endDate,
        format,
        ...params
      });

      const response = await fetch(`${API_BASE_URL}/api/calls/export?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to export call data');
      }

      // Handle different export formats
      const contentType = response.headers.get('content-type');
      if (contentType.includes('application/json')) {
        return await response.json();
      } else if (contentType.includes('text/csv')) {
        return await response.text();
      } else if (contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
        return await response.blob();
      }
      
      throw new Error('Unsupported export format');
    } catch (error) {
      console.error('Error exporting call data:', error);
      throw error;
    }
  },

  // Get dashboard summary
  getDashboardSummary: async (period = 'today') => {
    return apiService.callCenter.analytics.getDashboardSummary(period);
  },

  // Register webhook for call events
  async registerWebhook(webhookConfig) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookConfig)
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to register webhook');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error registering webhook:', error);
      throw error;
    }
  },

  // Get data mix settings
  getDataMix: async () => {
    return apiService.callCenter.analytics.getDataMix();
  },

  // Update data mix settings
  async updateDataMix(dataMixSettings) {
    try {
      const response = await fetch(`${DIALER_API_URL}/updateDataMix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataMixSettings)
      });
      if (!response.ok) throw new Error('Failed to update data mix settings');
      return await response.json();
    } catch (error) {
      console.error('Error updating data mix settings:', error);
      throw error;
    }
  },

  // Get transfer statistics
  getTransferStats: async (timeRange = 'today') => {
    try {
      const response = await apiService.callCenter.analytics.getTransferStats(timeRange);
      return response.data;
    } catch (error) {
      console.error('Error fetching transfer stats:', error);
      // Return default values if API call fails
      return {
        totalTransfers: 0,
        successfulTransfers: 0,
        failedTransfers: 0,
        transferRate: 0
      };
    }
  },
}; 