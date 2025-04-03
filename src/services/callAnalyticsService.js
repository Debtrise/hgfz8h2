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
      const response = await fetch(`${BASE_URL}/api/stats/today`);
      if (!response.ok) throw new Error('Failed to fetch today\'s summary');
      return await response.json();
    } catch (error) {
      console.error('Error fetching today\'s summary:', error);
      throw error;
    }
  },

  // Get hourly breakdown for a specific date
  getHourlyBreakdown: async (date) => {
    try {
      const response = await fetch(`${BASE_URL}/api/stats/hourly?date=${date}`);
      if (!response.ok) throw new Error('Failed to fetch hourly breakdown');
      return await response.json();
    } catch (error) {
      console.error('Error fetching hourly breakdown:', error);
      throw error;
    }
  },

  // Get daily statistics for a date range
  getDailyStats: async (startDate, endDate) => {
    try {
      const response = await fetch(`${BASE_URL}/api/stats/daily?startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) throw new Error('Failed to fetch daily statistics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching daily statistics:', error);
      throw error;
    }
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
      throw error;
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
    try {
      const response = await fetch(CALL_DETECTION_URL);
      if (!response.ok) throw new Error('Failed to fetch call detection stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching call detection stats:', error);
      throw error;
    }
  },

  // Get hourly statistics
  getHourlyStats: async () => {
    try {
      const response = await fetch(HOURLY_STATS_URL);
      if (!response.ok) throw new Error('Failed to fetch hourly stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching hourly stats:', error);
      throw error;
    }
  },

  // Get hourly call data for the current day
  async getHourlyData() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/calls/hourly`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch hourly data');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching hourly data:', error);
      throw error;
    }
  },

  // Get call data for a date range
  async getDateRangeData(startDate, endDate) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/calls/range?startDate=${startDate}&endDate=${endDate}`
      );
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch date range data');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching date range data:', error);
      throw error;
    }
  },

  // Get health check status
  async getHealthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      return data.status === 'OK';
    } catch (error) {
      console.error('Error checking API health:', error);
      return false;
    }
  },

  // Get server status
  async getServerStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/status`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch server status');
      }
      
      return data.status;
    } catch (error) {
      console.error('Error fetching server status:', error);
      throw error;
    }
  },

  // Get all calls with pagination and filtering
  async getAllCalls(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 100,
        ...params
      });

      const response = await fetch(`${API_BASE_URL}/api/calls?${queryParams}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch calls');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching calls:', error);
      throw error;
    }
  },

  // Get call details by unique ID
  async getCallDetails(uniqueid) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/calls/${uniqueid}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch call details');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching call details:', error);
      throw error;
    }
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
  async getAgentPerformance(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/api/agents/performance?${queryParams}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch agent performance');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching agent performance:', error);
      throw error;
    }
  },

  // Get real-time metrics
  async getRealTimeMetrics() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/realtime/metrics`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch real-time metrics');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
      throw error;
    }
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
  async getDashboardSummary(period = 'today') {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/summary?period=${period}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch dashboard summary');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
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
  async getDataMix() {
    try {
      const response = await fetch(`${DIALER_API_URL}/getDataMix`);
      if (!response.ok) throw new Error('Failed to fetch data mix settings');
      return await response.json();
    } catch (error) {
      console.error('Error fetching data mix settings:', error);
      throw error;
    }
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
}; 