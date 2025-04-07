import axios from 'axios';

// Utility function to get tenant ID
const getTenantId = () => {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  return currentUser.tenantId || 1;
};

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://35.202.92.164:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token and tenant ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      tenantId: getTenantId()
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add tenant_id to all requests except auth endpoints and leads endpoints
    if (!config.url.startsWith('/auth') && !config.url.startsWith('/leads')) {
      config.params = {
        ...config.params,
        tenant_id: getTenantId()
      };
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Add the handleApiError function
const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Error response data:', error.response.data);
    console.error('Error response status:', error.response.status);
    
    // Return a formatted error message
    return {
      message: error.response.data.message || `Server error: ${error.response.status}`,
      status: error.response.status,
      data: error.response.data
    };
  } else if (error.request) {
    // The request was made but no response was received
    console.error('Error request:', error.request);
    return {
      message: 'No response from server. Please check your connection.',
      status: 0
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error message:', error.message);
    return {
      message: error.message,
      status: 0
    };
  }
};

// API service object
const apiService = {
  // Auth endpoints
  auth: {
    login: async (credentials) => {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      // Store the token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response;
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return Promise.resolve();
    },
    refreshToken: () => api.post('/auth/refresh-token'),
    register: (userData) => api.post('/auth/register', userData),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
    verifyEmail: (token) => api.post('/auth/verify-email', { token }),
    getCurrentUser: () => api.get('/auth/me'),
  },

  // Campaign endpoints
  campaigns: {
    getAll: (params) => api.get('/campaigns', { params }),
    getById: (id) => api.get(`/campaigns/${id}`),
    create: (data) => api.post('/campaigns', {
      ...data,
      leadPoolId: parseInt(data.leadPoolId),
      didPoolId: parseInt(data.didPoolId),
      journeyMappings: data.journeyMappings.map(mapping => ({
        journeyId: parseInt(mapping.journeyId),
        leadAgeMin: parseInt(mapping.leadAgeMin),
        leadAgeMax: parseInt(mapping.leadAgeMax),
        durationDays: parseInt(mapping.durationDays)
      }))
    }),
    update: (id, data) => api.put(`/campaigns/${id}`, {
      ...data,
      leadPoolId: parseInt(data.leadPoolId),
      didPoolId: parseInt(data.didPoolId),
      journeyMappings: data.journeyMappings.map(mapping => ({
        journeyId: parseInt(mapping.journeyId),
        leadAgeMin: parseInt(mapping.leadAgeMin),
        leadAgeMax: parseInt(mapping.leadAgeMax),
        durationDays: parseInt(mapping.durationDays)
      }))
    }),
    delete: (id) => api.delete(`/campaigns/${id}`),
    
    // Journey mappings
    getJourneyMappings: (id) => api.get(`/campaigns/${id}/journey-mappings`),
    addJourneyMapping: (id, data) => api.post(`/campaigns/${id}/journey-mappings`, {
      ...data,
      journeyId: parseInt(data.journeyId),
      leadAgeMin: parseInt(data.leadAgeMin),
      leadAgeMax: parseInt(data.leadAgeMax),
      durationDays: parseInt(data.durationDays)
    }),
    
    // Campaign status management
    start: (id) => api.post(`/campaigns/${id}/start`),
    pause: (id) => api.post(`/campaigns/${id}/pause`),
    complete: (id) => api.post(`/campaigns/${id}/complete`),
    
    // Campaign metrics
    getMetrics: (id, timeRange = '7d') => api.get(`/campaigns/${id}/metrics`, { params: { timeRange } })
  },

  // Lead pool endpoints
  leadPools: {
    getAll: async () => {
      const response = await api.get('/lead-pools');
      return response;
    },
    getById: (id) => api.get(`/lead-pools/${id}`),
    create: (data) => {
      // Transform the data to match the API's expected format
      const poolData = {
        name: data.name,
        description: data.description || null,
        lead_age_min: data.leadAgeMin || 0,
        lead_age_max: data.leadAgeMax || 30,
        criteria: data.criteria || null,
        status: data.status || 'active'
      };
      return api.post('/lead-pools', poolData);
    },
    update: (id, data) => {
      // Transform the data to match the API's expected format
      const poolData = {
        name: data.name,
        description: data.description || null,
        lead_age_min: data.leadAgeMin || 0,
        lead_age_max: data.leadAgeMax || 30,
        criteria: data.criteria || null,
        status: data.status || 'active'
      };
      return api.put(`/lead-pools/${id}`, poolData);
    },
    delete: (id) => api.delete(`/lead-pools/${id}`),
    getLeads: (id, params = {}) => {
      // Convert all parameters to query string format
      const queryParams = new URLSearchParams();
      
      // Add all parameters to the query string
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      });
      
      // Make the request with all parameters in the query string
      return api.get(`/lead-pools/${id}/leads?${queryParams.toString()}`);
    },
    importLeads: async (poolId, formData) => {
      try {
        const response = await api.post(`/lead-pools/${poolId}/import`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
  },

  // Lead endpoints
  leads: {
    getAll: async (params = {}) => {
      try {
        // Convert params to URLSearchParams to properly format query parameters
        const queryParams = new URLSearchParams();
        
        // Add all parameters to the query string
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value);
          }
        });
        
        // Make the request with the formatted query string
        const response = await api.get(`/leads?${queryParams.toString()}`);
        return response.data; // Return the data directly since it's already in the correct format
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    getById: async (id) => {
      try {
        const response = await api.get(`/leads/${id}`);
        return response.data;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    getByLeadPool: async (leadPoolId, params = {}) => {
      try {
        // Convert params to URLSearchParams to properly format query parameters
        const queryParams = new URLSearchParams();
        
        // Add all parameters to the query string
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value);
          }
        });
        
        // Make the request with the formatted query string
        const response = await api.get(`/leads/by-lead-pool/${leadPoolId}?${queryParams.toString()}`);
        return response.data;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    create: async (leadData) => {
      try {
        // Format the data according to the new API requirements
        const formattedData = {
          phone: leadData.phone,
          firstName: leadData.firstName,
          lastName: leadData.lastName,
          email: leadData.email,
          leadAge: leadData.leadAge || 0,
          brand: leadData.brand,
          source: leadData.source,
          status: leadData.status || "new",
          additionalData: leadData.additionalData || {},
          poolIds: leadData.poolIds || []
        };
        
        const response = await api.post('/leads', formattedData);
        return response.data;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    update: async (id, leadData) => {
      try {
        // Format the data according to the new API requirements
        const formattedData = {
          phone: leadData.phone,
          firstName: leadData.firstName,
          lastName: leadData.lastName,
          email: leadData.email,
          leadAge: leadData.leadAge,
          brand: leadData.brand,
          source: leadData.source,
          status: leadData.status,
          additionalData: leadData.additionalData || {},
          poolIds: leadData.poolIds || []
        };
        
        const response = await api.put(`/leads/${id}`, formattedData);
        return response.data;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    delete: async (id) => {
      try {
        const response = await api.delete(`/leads/${id}`);
        return response.data;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    import: async (data) => {
      try {
        // Format the data according to the API requirements
        const formattedData = {
          leads: data.leads.map(lead => ({
            phone: lead.phone,
            firstName: lead.firstName,
            lastName: lead.lastName,
            email: lead.email,
            leadAge: lead.leadAge || 0,
            brand: lead.brand,
            source: lead.source,
            status: lead.status || "new",
            additionalData: lead.additionalData || {}
          })),
          defaultPoolId: data.defaultPoolId
        };
        
        const response = await api.post('/leads/import', formattedData);
        return {
          msg: response.data.msg,
          imported: response.data.imported || [],
          skipped: response.data.skipped || []
        };
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    assignToAgent: (id, agentId) => api.put(`/leads/${id}/assign`, { agentId }),
    assignLeads: async ({ leadIds, agentId }) => {
      try {
        const response = await api.post('/leads/assign', {
          lead_ids: leadIds,
          agent_id: agentId
        });
        return response.data;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    unassignLeads: async (leadIds) => {
      try {
        const response = await api.post('/leads/unassign', {
          lead_ids: leadIds
        });
        return response.data;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    getAssignmentHistory: async (params = {}) => {
      try {
        const response = await api.get('/leads/assignment-history', { params });
        return response.data;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    importFromFile: async (formData) => {
      try {
        const response = await api.post(
          `/leads/import-file`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
  },

  // DID Pool endpoints
  didPools: {
    getAll: async () => {
      try {
        console.log('Fetching all DID pools');
        const response = await api.get('/did-pools');
        console.log('DID pools response:', response);
        return {
          ...response,
          data: Array.isArray(response.data) ? response.data : []
        };
      } catch (error) {
        console.error('Error fetching DID pools:', error);
        handleApiError(error);
        throw error;
      }
    },
    getById: async (id) => {
      try {
        if (!id) {
          throw new Error('DID pool ID is required');
        }
        console.log(`Fetching DID pool with ID: ${id}`);
        const response = await api.get(`/did-pools/${id}`);
        console.log('DID pool response:', response);
        return response;
      } catch (error) {
        console.error(`Error fetching DID pool ${id}:`, error);
        handleApiError(error);
        throw error;
      }
    },
    create: async (data) => {
      try {
        console.log('Creating DID pool with data:', data);
        const response = await api.post('/did-pools', {
          name: data.name,
          description: data.description,
          status: data.status || 'active',
          region: data.region,
          timezone: data.timezone
        });
        console.log('Create DID pool response:', response);
        return response;
      } catch (error) {
        console.error('Error creating DID pool:', error);
        handleApiError(error);
        throw error;
      }
    },
    update: async (id, data) => {
      try {
        console.log(`Updating DID pool ${id} with data:`, data);
        const response = await api.put(`/did-pools/${id}`, {
          name: data.name,
          description: data.description,
          status: data.status,
          region: data.region,
          timezone: data.timezone
        });
        console.log('Update DID pool response:', response);
        return response;
      } catch (error) {
        console.error(`Error updating DID pool ${id}:`, error);
        handleApiError(error);
        throw error;
      }
    },
    delete: async (id) => {
      try {
        console.log(`Deleting DID pool ${id}`);
        const response = await api.delete(`/did-pools/${id}`);
        console.log('Delete DID pool response:', response);
        return response;
      } catch (error) {
        console.error(`Error deleting DID pool ${id}:`, error);
        handleApiError(error);
        throw error;
      }
    },
    getDids: async (id, params = {}) => {
      try {
        if (!id) {
          throw new Error('DID pool ID is required');
        }
        console.log(`Fetching DIDs for pool ${id} with params:`, params);
        const response = await api.get(`/did-pools/${id}/dids`, { params });
        console.log('DIDs response:', response);
        return response;
      } catch (error) {
        console.error(`Error fetching DIDs for pool ${id}:`, error);
        handleApiError(error);
        throw error;
      }
    },
    addDidToPool: async (id, data) => {
      try {
        console.log(`Adding DID to pool ${id} with data:`, data);
        const response = await api.post(`/did-pools/${id}/dids`, {
          phoneNumber: data.phoneNumber,
          provider: data.provider,
          callerIdName: data.callerIdName,
          region: data.region,
          status: data.status || 'active',
          monthlyCost: data.monthlyCost
        });
        console.log('Add DID to pool response:', response);
        return response;
      } catch (error) {
        console.error(`Error adding DID to pool ${id}:`, error);
        handleApiError(error);
        throw error;
      }
    },
    removeDidFromPool: async (poolId, didId) => {
      try {
        console.log(`Removing DID ${didId} from pool ${poolId}`);
        const response = await api.delete(`/did-pools/${poolId}/dids/${didId}`);
        console.log('Remove DID from pool response:', response);
        return response;
      } catch (error) {
        console.error(`Error removing DID ${didId} from pool ${poolId}:`, error);
        handleApiError(error);
        throw error;
      }
    },
    bulkAddDids: async (poolId, didIds) => {
      try {
        console.log(`Bulk adding DIDs to pool ${poolId}:`, didIds);
        const response = await api.post(`/did-pools/${poolId}/dids/bulk`, {
          didIds
        });
        console.log('Bulk add DIDs response:', response);
        return response;
      } catch (error) {
        console.error(`Error bulk adding DIDs to pool ${poolId}:`, error);
        handleApiError(error);
        throw error;
      }
    },
    moveDids: async (poolId, data) => {
      try {
        console.log(`Moving DIDs from pool ${poolId} with data:`, data);
        const response = await api.post(`/did-pools/${poolId}/move-dids`, {
          didIds: data.didIds,
          targetPoolId: data.targetPoolId
        });
        console.log('Move DIDs response:', response);
        return response;
      } catch (error) {
        console.error(`Error moving DIDs from pool ${poolId}:`, error);
        handleApiError(error);
        throw error;
      }
    }
  },

  // DID endpoints
  dids: {
    getAll: async (params = {}) => {
      try {
        console.log('Fetching all DIDs with params:', params);
        const response = await api.get('/dids', { params });
        console.log('DIDs response:', response);
        return {
          ...response,
          data: response.data.dids || [],
          pagination: response.data.pagination || {
            page: 1,
            limit: 50,
            total: 0,
            pages: 1
          },
          filters: response.data.filters || {
            providers: [],
            regions: [],
            statuses: []
          }
        };
      } catch (error) {
        console.error('Error fetching DIDs:', error);
        handleApiError(error);
        throw error;
      }
    },
    getProviders: async () => {
      try {
        console.log('Fetching DID providers');
        const response = await api.get('/dids/providers');
        console.log('DID providers response:', response);
        return response;
      } catch (error) {
        console.error('Error fetching DID providers:', error);
        handleApiError(error);
        throw error;
      }
    },
    getById: async (id) => {
      try {
        if (!id) {
          throw new Error('DID ID is required');
        }
        console.log(`Fetching DID with ID: ${id}`);
        const response = await api.get(`/dids/${id}`);
        console.log('DID response:', response);
        return response;
      } catch (error) {
        console.error(`Error fetching DID ${id}:`, error);
        handleApiError(error);
        throw error;
      }
    },
    create: async (data) => {
      try {
        console.log('Creating DID with data:', data);
        const response = await api.post('/dids', {
          phoneNumber: data.phoneNumber,
          provider: data.provider,
          callerIdName: data.callerIdName,
          region: data.region,
          status: data.status || 'active',
          monthlyCost: data.monthlyCost,
          didPoolId: data.didPoolId
        });
        console.log('Create DID response:', response);
        return response;
      } catch (error) {
        console.error('Error creating DID:', error);
        handleApiError(error);
        throw error;
      }
    },
    update: async (id, data) => {
      try {
        console.log(`Updating DID ${id} with data:`, data);
        const response = await api.put(`/dids/${id}`, {
          phoneNumber: data.phoneNumber,
          provider: data.provider,
          callerIdName: data.callerIdName,
          region: data.region,
          status: data.status,
          monthlyCost: data.monthlyCost,
          didPoolId: data.didPoolId
        });
        console.log('Update DID response:', response);
        return response;
      } catch (error) {
        console.error(`Error updating DID ${id}:`, error);
        handleApiError(error);
        throw error;
      }
    },
    delete: async (id) => {
      try {
        console.log(`Deleting DID ${id}`);
        const response = await api.delete(`/dids/${id}`);
        console.log('Delete DID response:', response);
        return response;
      } catch (error) {
        console.error(`Error deleting DID ${id}:`, error);
        handleApiError(error);
        throw error;
      }
    },
    import: async (data) => {
      try {
        console.log('Importing DIDs with data:', data);
        const response = await api.post('/dids/import', {
          dids: data.dids.map(did => ({
            phoneNumber: did.phoneNumber,
            provider: did.provider,
            callerIdName: did.callerIdName,
            region: did.region,
            status: did.status || 'active',
            monthlyCost: did.monthlyCost
          }))
        });
        console.log('Import DIDs response:', response);
        return response;
      } catch (error) {
        console.error('Error importing DIDs:', error);
        handleApiError(error);
        throw error;
      }
    },
    test: async (id, testPhone) => {
      try {
        console.log(`Testing DID ${id} with phone: ${testPhone}`);
        const response = await api.post(`/dids/${id}/test`, {
          testPhone
        });
        console.log('Test DID response:', response);
        return response;
      } catch (error) {
        console.error(`Error testing DID ${id}:`, error);
        handleApiError(error);
        throw error;
      }
    }
  },

  // Brand endpoints
  brands: {
    getAll: async () => {
      const response = await api.get('/brands');
      // Transform the response to match the expected format
      const transformedData = response.data.map(item => ({
        id: item.brand,
        name: item.brand,
        lead_count: item.lead_count
      }));
      return { ...response, data: transformedData };
    },
    getById: (brandName) => api.get(`/brands/${encodeURIComponent(brandName)}`),
    create: (data) => {
      // Ensure data is properly formatted as JSON
      const brandData = {
        brands: [{
          name: data.name,
          description: data.description || null,
          logo: data.logo || null,
          color: data.color || '#007bff'
        }]
      };
      return api.post('/brands', brandData);
    },
    update: (brandName, data) => {
      // Ensure data is properly formatted as JSON
      const brandData = {
        brands: [{
          name: brandName,
          description: data.description || null,
          logo: data.logo || null,
          color: data.color || '#007bff'
        }]
      };
      return api.post('/brands', brandData);
    },
    delete: (brandName) => api.delete(`/brands/${encodeURIComponent(brandName)}`)
  },

  // Source endpoints
  sources: {
    getAll: async () => {
      const response = await api.get('/sources');
      // Transform the response to match the expected format
      const transformedData = response.data.map(item => ({
        id: item.source,
        name: item.source,
        lead_count: item.lead_count
      }));
      return { ...response, data: transformedData };
    },
    getById: (sourceName) => api.get(`/sources/${encodeURIComponent(sourceName)}`),
    create: (data) => {
      // Ensure data is properly formatted as JSON
      const sourceData = {
        sources: [{
          name: data.name,
          description: data.description || null,
          category: data.category || 'Other',
          cost_per_lead: data.cost_per_lead || 0
        }]
      };
      return api.post('/sources', sourceData);
    },
    update: (sourceName, data) => {
      // Ensure data is properly formatted as JSON
      const sourceData = {
        sources: [{
          name: sourceName,
          description: data.description || null,
          category: data.category || 'Other',
          cost_per_lead: data.cost_per_lead || 0
        }]
      };
      return api.post('/sources', sourceData);
    },
    delete: (sourceName) => api.delete(`/sources/${encodeURIComponent(sourceName)}`)
  },

  // Journey endpoints
  journeys: {
    getAll: () => api.get('/journeys'),
    getById: (id) => api.get(`/journeys/${id}`),
    create: (data) => api.post('/journeys', { ...data, tenant_id: getTenantId() }),
    update: (id, data) => api.put(`/journeys/${id}`, { ...data, tenant_id: getTenantId() }),
    delete: (id) => api.delete(`/journeys/${id}`),
    clone: (id, data) => api.post(`/journeys/${id}/clone`, data),
    getSteps: (id) => api.get(`/journeys/${id}/steps`),
    addStep: (id, data) => api.post(`/journeys/${id}/steps`, data),
    addBulkSteps: (id, data) => api.post(`/journeys/${id}/steps/bulk`, data),
    updateStep: (id, stepId, data) => api.put(`/journeys/${id}/steps/${stepId}`, data),
    deleteStep: (id, stepId) => api.delete(`/journeys/${id}/steps/${stepId}`),
    reorderSteps: (id, data) => api.post(`/journeys/${id}/steps/reorder`, data),
    testStep: (id, stepId, data) => api.post(`/journeys/${id}/steps/${stepId}/test`, data),
    getMetrics: (id, params) => api.get(`/journeys/${id}/metrics`, { params }),
    start: (id) => api.post(`/journeys/${id}/start`),
    pause: (id) => api.post(`/journeys/${id}/pause`),
    archive: (id) => api.post(`/journeys/${id}/archive`),
    getCampaigns: (id) => api.get(`/journeys/${id}/campaigns`),
  },

  // Call center endpoints
  callCenter: {
    // Analytics
    analytics: {
      getCampaignMetrics: (campaignId, timeRange) => 
        api.get(`/call-center/analytics/campaigns/${campaignId}`, { params: { timeRange } }),
      getAgentMetrics: (agentId, timeRange) => 
        api.get(`/call-center/analytics/agents/${agentId}`, { params: { timeRange } }),
      getHourlyData: (timeRange) => 
        api.get('/call-center/analytics/hourly', { params: { timeRange } }),
    },
    
    // Agents
    agents: {
      getAll: () => api.get('/call-center/agents'),
      getById: (id) => api.get(`/call-center/agents/${id}`),
      create: (data) => api.post('/call-center/agents', { ...data, tenant_id: getTenantId() }),
      update: (id, data) => api.put(`/call-center/agents/${id}`, { ...data, tenant_id: getTenantId() }),
      delete: (id) => api.delete(`/call-center/agents/${id}`),
    },
    
    // Calls
    calls: {
      getAll: () => api.get('/call-center/calls'),
      getById: (id) => api.get(`/call-center/calls/${id}`),
      create: (data) => api.post('/call-center/calls', { ...data, tenant_id: getTenantId() }),
      update: (id, data) => api.put(`/call-center/calls/${id}`, { ...data, tenant_id: getTenantId() }),
      delete: (id) => api.delete(`/call-center/calls/${id}`),
    },
  },

  // User endpoints
  users: {
    getAll: async (params = {}) => {
      try {
        const response = await api.get('/users', { params });
        return response.data;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', { ...data, tenant_id: getTenantId() }),
    update: (id, data) => api.put(`/users/${id}`, { ...data, tenant_id: getTenantId() }),
    delete: (id) => api.delete(`/users/${id}`),
    toggleStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
    changePassword: (id, data) => api.post(`/users/${id}/change-password`, data),
  },
};

export default apiService;