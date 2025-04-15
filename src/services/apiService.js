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

// Export api for debugging purposes
export { api };

// Add request interceptor to add auth token and tenant ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // More detailed logging
    console.log('API Request Interceptor:', {
      url: config.url,
      method: config.method,
      initialHeaders: { ...config.headers }, // Log headers before modification
      initialParams: { ...config.params },   // Log params before modification
      tokenExists: !!token // Log if token exists without exposing the token
    });

    if (token) {
      // Make sure the token is not undefined, null, or empty
      if (token.trim().length > 0) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn(`Invalid token found in localStorage for request to ${config.url}. Token was empty or whitespace.`);
      }
    } else {
      // Log if no token is found
      console.warn(`No token found in localStorage for request to ${config.url}`);
    }

    // Add tenant_id to all GET requests except auth, leads, and dataMix endpoints
    // For POST/PUT requests, tenant_id should be in the body, not the query params
    const isDataMixUrl = config.url.includes('/getDataMix') || config.url.includes('/updateDataMix');
    const tenantId = getTenantId();
    
    const isGetRequest = config.method === 'get' || config.method === 'GET';
    
    if (isGetRequest && !config.url.startsWith('/auth') && !config.url.startsWith('/leads') && !isDataMixUrl) {
      config.params = {
        ...config.params,
        tenant_id: tenantId
      };
    }

    // Log the final state before sending
    console.log('Modified API Request:', {
      url: config.url,
      method: config.method,
      finalHeaders: { ...config.headers },
      finalParams: { ...config.params },
      tenant_id: tenantId
    });

    return config;
  },
  (error) => {
    // More specific error logging
    console.error('API Request Interceptor Error:', {
      message: error.message,
      config: error.config,
      stack: error.stack // Include stack trace if available
    });
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
    
    // Special handling for 400 Bad Request errors
    if (error.response.status === 400) {
      console.error('Bad Request Error. Request data:', error.config?.data);
      
      // Try to parse the request data to see what was sent
      try {
        if (error.config?.data) {
          const requestData = JSON.parse(error.config.data);
          console.error('Parsed request data:', requestData);
        }
      } catch (e) {
        console.error('Error parsing request data:', e);
      }
      
      // Create a more specific error message for Bad Request
      let message = 'Bad Request: The server could not understand the request.';
      
      // Add more details if available
      if (error.response.data?.message) {
        message = `${message} ${error.response.data.message}`;
      } else if (error.response.data?.error) {
        message = `${message} ${error.response.data.error}`;
      } else if (typeof error.response.data === 'string') {
        message = `${message} ${error.response.data}`;
      }
      
      return {
        message,
        status: error.response.status,
        data: error.response.data
      };
    }
    
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
      try {
        console.log('API Service: Starting login request with credentials:', {
          email: credentials.email,
          hasPassword: !!credentials.password
        });
        
        const response = await api.post('/auth/login', credentials);
        console.log('API Service: Login response received:', response);
        
        // Validate response data
        if (!response.data) {
          console.error('API Service: Invalid login response: Missing data');
          throw new Error('Login failed: Invalid server response');
        }
        
        // Extract token and user from response data
        const { token, user } = response.data;
        console.log('API Service: Extracted token and user:', { 
          hasToken: !!token, 
          user 
        });
        
        // Validate token and user
        if (!token) {
          console.error('API Service: Invalid login response: Missing token');
          throw new Error('Login failed: Missing authentication token');
        }
        
        if (!user) {
          console.error('API Service: Invalid login response: Missing user data');
          throw new Error('Login failed: Missing user information');
        }
        
        // Ensure user has required fields
        const validatedUser = {
          ...user,
          role: user.role || 'ADMIN', // Default role if not provided
          id: user.id || user._id || Math.random().toString(36).substr(2, 9), // Ensure there's an ID
        };
        
        console.log('API Service: Created validated user object:', validatedUser);
        
        // Store the token and user info
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(validatedUser));
        
        console.log('API Service: Stored token and user in localStorage');
        
        // Return the validated data with clear structure
        return {
          token: token,
          user: validatedUser
        };
      } catch (error) {
        console.error('API Service: Login API error:', error);
        throw error;
      }
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
    create: async (data) => {
      try {
        // No transformation needed as API expects camelCase
        const response = await api.post('/lead-pools', data);
        return response;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
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
            phone: lead.phone || '',
            firstName: lead.firstName || '',
            lastName: lead.lastName || '',
            email: lead.email || '',  // Ensure email is never null/undefined
            leadAge: parseInt(lead.leadAge || 0),
            brand: lead.brand || '',
            source: lead.source || '',
            status: lead.status || "new",
            additionalData: lead.additionalData || {}
          })),
          defaultPoolId: data.defaultPoolId || '1',
          tenant_id: data.tenant_id || getTenantId(),
          updateExisting: !!data.updateExisting
        };
        
        console.log('Import leads request data:', formattedData);
        const response = await api.post('/leads/import', formattedData);
        console.log('Import leads response:', response.data);
        
        // Process the response to ensure consistent format
        const result = {
          message: response.data.msg || 'Import completed successfully',
          imported: Array.isArray(response.data.imported) ? response.data.imported : [],
          skipped: Array.isArray(response.data.skipped) ? response.data.skipped : [],
          updated: Array.isArray(response.data.updated) ? response.data.updated : []
        };
        
        return result;
      } catch (error) {
        console.error('Error in import leads:', error);
        const errorData = handleApiError(error);
        // Add a more user-friendly error message
        errorData.message = errorData.message || 'Failed to import leads. Please check your data and try again.';
        throw errorData;
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
        // Log the form data for debugging
        console.log('Form data keys:', [...formData.keys()]);
        
        // Debug field mapping
        const fieldMapping = formData.get('fieldMapping');
        if (fieldMapping) {
          console.log('Field mapping:', JSON.parse(fieldMapping));
        }
        
        // Debug options
        const options = formData.get('options');
        if (options) {
          console.log('Import options:', JSON.parse(options));
        }
        
        const response = await api.post(
          `/leads/import-file`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        
        // Ensure email fields are properly handled in response
        if (response.data && response.data.imported) {
          response.data.imported = response.data.imported.map(lead => ({
            ...lead,
            email: lead.email || '',  // Ensure email is never null/undefined
          }));
        }
        
        if (response.data && response.data.skipped) {
          response.data.skipped = response.data.skipped.map(lead => ({
            ...lead,
            email: lead.email || '',  // Ensure email is never null/undefined
          }));
        }
        
        console.log('Import file response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Import file error details:', error);
        
        // Enhanced error messages for common issues
        if (error.response && error.response.data) {
          const errorData = error.response.data;
          
          // Check for specific error types
          if (errorData.message && errorData.message.includes('missing required field')) {
            const errorMsg = 'Missing required fields in the import file. Please ensure all required fields (phone, firstName, lastName) are properly mapped.';
            error.message = errorMsg;
          }
          
          // API validation errors
          if (errorData.errors && Array.isArray(errorData.errors)) {
            const errorMsg = errorData.errors.map(e => e.message || e).join(', ');
            error.message = `Validation failed: ${errorMsg}`;
          }
        }
        
        throw handleApiError(error);
      }
    },
  },

  // DID Pool endpoints
  didPools: {
    getAll: async (params = {}) => {
      try {
        console.log('Fetching all DID pools with params:', params);
        const response = await api.get('/did-pools', {
          params: {
            ...params,
            tenant_id: getTenantId()
          }
        });
        console.log('Raw DID pools response:', response);
        
        // Ensure we have a valid response with data
        if (!response || !response.data) {
          console.warn('Invalid response format:', response);
          return { data: [] };
        }
        
        // If response.data is already an array, return it directly
        if (Array.isArray(response.data)) {
          return { data: response.data };
        }
        
        // If response.data has a data property that's an array, use that
        if (response.data.data && Array.isArray(response.data.data)) {
          return { data: response.data.data };
        }
        
        // If we have a different structure, try to extract the array
        const dataArray = Object.values(response.data).find(value => Array.isArray(value));
        return { data: dataArray || [] };
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
        const response = await api.get(`/did-pools/${id}`, {
          params: {
            tenant_id: getTenantId()
          }
        });
        console.log('DID pool response:', response);
        return response;
      } catch (error) {
        console.error(`Error fetching DID pool ${id}:`, error);
        handleApiError(error);
        throw error;
      }
    },
    getDidPoolWithStats: async (id) => {
      try {
        if (!id) {
          throw new Error('DID pool ID is required');
        }
        console.log(`Fetching DID pool with stats for ID: ${id}`);
        const response = await api.get(`/did-pools/${id}/stats`, {
          params: {
            tenant_id: getTenantId()
          }
        });
        console.log('DID pool with stats response:', response);
        return response;
      } catch (error) {
        console.error(`Error fetching DID pool stats ${id}:`, error);
        handleApiError(error);
        throw error;
      }
    },
    create: async (data) => {
      try {
        console.log('Creating DID pool with data:', data);
        const response = await api.post('/did-pools', {
          ...data,
          tenant_id: getTenantId()
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
          ...data,
          tenant_id: getTenantId()
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
        const response = await api.delete(`/did-pools/${id}`, {
          params: {
            tenant_id: getTenantId()
          }
        });
        console.log('Delete DID pool response:', response);
        return response;
      } catch (error) {
        console.error(`Error deleting DID pool ${id}:`, error);
        handleApiError(error);
        throw error;
      }
    },
    getDids: async (poolId, params = {}) => {
      try {
        if (!poolId) {
          throw new Error('DID pool ID is required');
        }
        console.log(`Fetching DIDs for pool ${poolId} with params:`, params);
        const response = await api.get(`/did-pools/${poolId}/dids`, {
          params: {
            ...params,
            tenant_id: getTenantId()
          }
        });
        console.log('Get DIDs response:', response);
        return response;
      } catch (error) {
        console.error(`Error fetching DIDs for pool ${poolId}:`, error);
        handleApiError(error);
        throw error;
      }
    },
    addDidToPool: async (poolId, didData) => {
      try {
        if (!poolId) {
          throw new Error('DID pool ID is required');
        }
        console.log(`Adding DID to pool ${poolId} with data:`, didData);
        const response = await api.post(`/did-pools/${poolId}/dids`, didData);
        console.log('Add DID to pool response:', response);
        return response;
      } catch (error) {
        console.error(`Error adding DID to pool ${poolId}:`, error);
        handleApiError(error);
        throw error;
      }
    },
    removeDidFromPool: async (poolId, didId) => {
      try {
        console.log(`Removing DID ${didId} from pool ${poolId}`);
        const response = await api.delete(`/did-pools/${poolId}/dids/${didId}`, {
          params: {
            tenant_id: getTenantId()
          }
        });
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
          didIds,
          tenant_id: getTenantId()
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
          ...data,
          tenant_id: getTenantId()
        });
        console.log('Move DIDs response:', response);
        return response;
      } catch (error) {
        console.error(`Error moving DIDs from pool ${poolId}:`, error);
        handleApiError(error);
        throw error;
      }
    },
    toggleActive: async (id) => {
      try {
        console.log(`Toggling active status for DID pool ${id}`);
        const response = await api.post(`/did-pools/${id}/toggle-status`, {
          tenant_id: getTenantId()
        });
        console.log('Toggle DID pool active status response:', response);
        return response;
      } catch (error) {
        console.error(`Error toggling active status for DID pool ${id}:`, error);
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
        const response = await api.get('/dids', { 
          params: {
            ...params,
            tenant_id: getTenantId()
          } 
        });
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
        
        // Format phone number to ensure it's in the correct format
        const formattedPhoneNumber = data.phoneNumber.startsWith('+') 
          ? data.phoneNumber 
          : `+${data.phoneNumber.replace(/\D/g, '')}`;

        // Format the data according to API requirements
        const formattedData = {
          phoneNumber: formattedPhoneNumber,
          provider: data.provider || 'default',
          callerIdName: data.callerIdName || '',
          region: data.region || '',
          status: data.status || 'active',
          monthlyCost: data.monthlyCost ? parseFloat(data.monthlyCost) : 0,
          didPoolId: parseInt(data.didPoolId),
          tenant_id: data.tenant_id || getTenantId()
        };

        // Log the exact data being sent
        console.log('Sending formatted data to API:', JSON.stringify(formattedData, null, 2));

        const response = await api.post('/dids', formattedData);
        console.log('API Response:', response);
        return response;
      } catch (error) {
        console.error('Error in dids.create:', error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
          console.error('Error response headers:', error.response.headers);
          
          // Check for specific error cases
          if (error.response.status === 400) {
            if (error.response.data?.msg?.includes('phone number')) {
              throw new Error('This phone number is already in use. Please use a different number.');
            } else if (error.response.data?.msg?.includes('DID pool')) {
              throw new Error('Invalid DID Pool selected. Please choose a valid pool.');
            } else {
              throw new Error(`Invalid data: ${error.response.data?.msg || 'Please check your input'}`);
            }
          }
        }
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
      try {
        console.log('Calling brands API endpoint');
        const response = await api.get('/brands');
        console.log('Raw brands API response:', response);
        
        // Get campaign brands for debugging
        try {
          console.log('Fetching campaigns to check brands in use...');
          const campaignsResponse = await api.get('/campaigns');
          console.log('Campaigns for brand check:', campaignsResponse);
          
          if (campaignsResponse.data && Array.isArray(campaignsResponse.data)) {
            const campaignBrands = [...new Set(campaignsResponse.data.map(c => c.brand))].filter(Boolean);
            console.log('Brands found in campaigns:', campaignBrands);
          }
        } catch (e) {
          console.error('Error checking campaign brands:', e);
        }
        
        // Safety check - if data is null or undefined, use empty array
        const brandsData = response.data || [];
        
        // Transform the response to match the expected format
        const transformedData = Array.isArray(brandsData) 
          ? brandsData.map(item => ({
              id: item.brand || item.id || '',
              name: item.brand || item.name || '[Unnamed Brand]',
              description: item.description || '',
              logo: item.logo || null,
              color: item.color || '#007bff',
              lead_count: item.lead_count || 0
            }))
          : [];
        
        console.log('Transformed brands data:', transformedData);
        return { ...response, data: transformedData };
      } catch (error) {
        console.error('Error in brands.getAll:', error);
        // Return empty array instead of failing completely
        return { data: [] };
      }
    },
    getById: (brandName) => api.get(`/brands/${encodeURIComponent(brandName)}`),
    create: async (data) => {
      try {
        console.log('Creating brand with data:', data);
        // Extract tenant_id from data
        const tenant_id = data.tenant_id || getTenantId();
        
        // Format 4: Array of brands - try this format
        const brandData = {
          tenant_id,
          brands: [data.name]
        };
        
        console.log('Trying array format for brand creation:', brandData);
        
        const response = await api.post('/brands', brandData);
        console.log('Brand creation response:', response);
        return response;
      } catch (error) {
        console.error('Error creating brand:', error);
        console.error('Error response data:', error.response?.data);
        console.error('Error request data:', error.config?.data);
        
        // Pass detailed error information
        const errorInfo = handleApiError(error);
        throw errorInfo;
      }
    },
    update: async (brandName, data) => {
      try {
        console.log(`Updating brand "${brandName}" with data:`, data);
        // Extract tenant_id from data
        const tenant_id = data.tenant_id || getTenantId();
        
        // Use array format for consistency with create method
        const brandData = {
          tenant_id,
          brands: [brandName]
        };
        
        console.log('Using array format for brand update:', brandData);
        const response = await api.post('/brands', brandData); // Using POST for update too as this might be what API expects
        console.log('Brand update response:', response);
        return response;
      } catch (error) {
        console.error(`Error updating brand "${brandName}":`, error);
        console.error('Error response data:', error.response?.data);
        console.error('Error request data:', error.config?.data);
        
        // Pass detailed error information
        const errorInfo = handleApiError(error);
        throw errorInfo;
      }
    },
    delete: async (brandName) => {
      try {
        console.log(`Deleting brand "${brandName}"`);
        const response = await api.delete(`/brands/${encodeURIComponent(brandName)}`);
        console.log('Brand deletion response:', response);
        return response;
      } catch (error) {
        console.error(`Error deleting brand "${brandName}":`, error);
        // Pass detailed error information
        const errorInfo = handleApiError(error);
        throw errorInfo;
      }
    }
  },

  // Source endpoints
  sources: {
    getAll: async () => {
      try {
        console.log('Calling sources API endpoint');
        const response = await api.get('/sources');
        console.log('Raw sources API response:', response);
        
        // Safety check - if data is null or undefined, use empty array
        const sourcesData = response.data || [];
        
        // Transform the response to match the expected format
        const transformedData = Array.isArray(sourcesData)
          ? sourcesData.map(item => ({
              id: item.source || item.id || '',
              name: item.source || item.name || '[Unnamed Source]',
              description: item.description || '',
              category: item.category || 'Other',
              cost_per_lead: item.cost_per_lead || 0,
              lead_count: item.lead_count || 0
            }))
          : [];
        
        console.log('Transformed sources data:', transformedData);
        return { ...response, data: transformedData };
      } catch (error) {
        console.error('Error in sources.getAll:', error);
        // Return empty array instead of failing completely
        return { data: [] };
      }
    },
    getById: (sourceName) => api.get(`/sources/${encodeURIComponent(sourceName)}`),
    create: async (data) => {
      try {
        console.log('Creating source with data:', data);
        // Extract tenant_id from data
        const tenant_id = data.tenant_id || getTenantId();
        
        // Use array format similar to brands
        const sourceData = {
          tenant_id,
          sources: [data.name]
        };
        
        console.log('Using array format for source creation:', sourceData);
        const response = await api.post('/sources', sourceData);
        console.log('Source creation response:', response);
        return response;
      } catch (error) {
        console.error('Error creating source:', error);
        console.error('Error response data:', error.response?.data);
        console.error('Error request data:', error.config?.data);
        
        // Pass detailed error information
        const errorInfo = handleApiError(error);
        throw errorInfo;
      }
    },
    update: async (sourceName, data) => {
      try {
        console.log(`Updating source "${sourceName}" with data:`, data);
        // Extract tenant_id from data
        const tenant_id = data.tenant_id || getTenantId();
        
        // Use array format similar to brands
        const sourceData = {
          tenant_id,
          sources: [sourceName]
        };
        
        console.log('Using array format for source update:', sourceData);
        const response = await api.post('/sources', sourceData); // Using POST for update too as this might be what API expects
        console.log('Source update response:', response);
        return response;
      } catch (error) {
        console.error(`Error updating source "${sourceName}":`, error);
        console.error('Error response data:', error.response?.data);
        console.error('Error request data:', error.config?.data);
        
        // Pass detailed error information
        const errorInfo = handleApiError(error);
        throw errorInfo;
      }
    },
    delete: async (sourceName) => {
      try {
        console.log(`Deleting source "${sourceName}"`);
        const response = await api.delete(`/sources/${encodeURIComponent(sourceName)}`);
        console.log('Source deletion response:', response);
        return response;
      } catch (error) {
        console.error(`Error deleting source "${sourceName}":`, error);
        // Pass detailed error information
        const errorInfo = handleApiError(error);
        throw errorInfo;
      }
    }
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
      getTransferStats: (timeRange = 'today') => 
        api.get('/call-center/analytics/transfers', { params: { timeRange } }),
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
        console.log('Fetching users with params:', params);
        const response = await api.get('/users', { 
          params: {
            ...params,
            tenant_id: getTenantId()
          } 
        });
        console.log('Users response:', response);
        return {
          ...response,
          data: response.data.users || [],
          pagination: response.data.pagination || {
            page: 1,
            limit: 50,
            total: 0,
            pages: 1
          }
        };
      } catch (error) {
        console.error('Error fetching users:', error);
        handleApiError(error);
        throw error;
      }
    },
    getById: async (id) => {
      try {
        if (!id) {
          throw new Error('User ID is required');
        }
        console.log(`Fetching user with ID: ${id}`);
        const response = await api.get(`/users/${id}`);
        console.log('User response:', response);
        return response;
      } catch (error) {
        console.error(`Error fetching user ${id}:`, error);
        handleApiError(error);
        throw error;
      }
    },
    create: async (data) => {
      try {
        console.log('Creating user with data:', data);
        const response = await api.post('/users', {
          ...data,
          tenant_id: getTenantId()
        });
        console.log('Create user response:', response);
        return response;
      } catch (error) {
        console.error('Error creating user:', error);
        handleApiError(error);
        throw error;
      }
    },
    update: async (id, data) => {
      try {
        console.log(`Updating user ${id} with data:`, data);
        const response = await api.put(`/users/${id}`, {
          ...data,
          tenant_id: getTenantId()
        });
        console.log('Update user response:', response);
        return response;
      } catch (error) {
        console.error(`Error updating user ${id}:`, error);
        handleApiError(error);
        throw error;
      }
    },
    delete: async (id) => {
      try {
        console.log(`Deleting user ${id}`);
        const response = await api.delete(`/users/${id}`);
        console.log('Delete user response:', response);
        return response;
      } catch (error) {
        console.error(`Error deleting user ${id}:`, error);
        handleApiError(error);
        throw error;
      }
    },
    toggleStatus: async (id, status) => {
      try {
        console.log(`Toggling user ${id} status to ${status}`);
        const response = await api.patch(`/users/${id}/status`, { 
          status,
          tenant_id: getTenantId()
        });
        console.log('Toggle user status response:', response);
        return response;
      } catch (error) {
        console.error(`Error toggling user ${id} status:`, error);
        handleApiError(error);
        throw error;
      }
    },
    changePassword: async (id, data) => {
      try {
        console.log(`Changing password for user ${id}`);
        const response = await api.post(`/users/${id}/change-password`, {
          ...data,
          tenant_id: getTenantId()
        });
        console.log('Change password response:', response);
        return response;
      } catch (error) {
        console.error(`Error changing password for user ${id}:`, error);
        handleApiError(error);
        throw error;
      }
    },
    resetPassword: async (id) => {
      try {
        console.log(`Resetting password for user ${id}`);
        const response = await api.post(`/users/${id}/reset-password`, {
          tenant_id: getTenantId()
        });
        console.log('Reset password response:', response);
        return response;
      } catch (error) {
        console.error(`Error resetting password for user ${id}:`, error);
        handleApiError(error);
        throw error;
      }
    },
    getRoles: async () => {
      try {
        console.log('Fetching available user roles');
        const response = await api.get('/users/roles');
        console.log('Roles response:', response);
        return response;
      } catch (error) {
        console.error('Error fetching user roles:', error);
        handleApiError(error);
        throw error;
      }
    },
    getPermissions: async (id) => {
      try {
        console.log(`Fetching permissions for user ${id}`);
        const response = await api.get(`/users/${id}/permissions`);
        console.log('Permissions response:', response);
        return response;
      } catch (error) {
        console.error(`Error fetching permissions for user ${id}:`, error);
        handleApiError(error);
        throw error;
      }
    },
    updatePermissions: async (id, permissions) => {
      try {
        console.log(`Updating permissions for user ${id}:`, permissions);
        const response = await api.put(`/users/${id}/permissions`, {
          permissions,
          tenant_id: getTenantId()
        });
        console.log('Update permissions response:', response);
        return response;
      } catch (error) {
        console.error(`Error updating permissions for user ${id}:`, error);
        handleApiError(error);
        throw error;
      }
    }
  },

  // Data Mix endpoints
  dataMix: {
    get: async () => {
      try {
        // Use hardcoded URL for this specific endpoint
        const response = await api.get('https://dialer-api-154842307047.us-west2.run.app/getDataMix');
        // Assuming the API returns low_mix, mid_mix, high_mix etc.
        // Map to frontend naming convention if necessary, e.g., freshMix: response.data.low_mix
        return response.data; 
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    update: async (data) => {
      try {
        // Ensure data matches the API endpoint's expected format
        // Use hardcoded URL for this specific endpoint
        const response = await api.post('https://dialer-api-154842307047.us-west2.run.app/updateDataMix', data);
        return response.data;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
  },

  // Webhook endpoints
  webhooks: {
    getAll: async () => {
      try {
        console.log('Fetching all webhooks');
        const response = await api.get('/webhooks');
        console.log('Webhooks response:', response);
        return {
          ...response,
          data: Array.isArray(response.data) ? response.data : []
        };
      } catch (error) {
        console.error('Error fetching webhooks:', error);
        // Return empty array instead of failing completely
        return { data: [] };
      }
    },
    getById: async (id) => {
      try {
        if (!id) {
          throw new Error('Webhook ID is required');
        }
        console.log(`Fetching webhook with ID: ${id}`);
        const response = await api.get(`/webhooks/${id}`);
        console.log('Webhook response:', response);
        return response;
      } catch (error) {
        console.error(`Error fetching webhook ${id}:`, error);
        handleApiError(error);
        throw error;
      }
    },
    create: async (data) => {
      try {
        console.log('Creating webhook with data:', data);
        const response = await api.post('/webhooks', {
          name: data.name,
          description: data.description,
          defaultPoolId: data.defaultPoolId,
          defaultBrand: data.defaultBrand || '',
          defaultSource: data.defaultSource || '',
          defaultLeadAge: data.defaultLeadAge || 0,
          fieldMapping: data.fieldMapping,
          active: data.active,
          authToken: data.authToken,
          tenant_id: getTenantId()
        });
        console.log('Create webhook response:', response);
        return response;
      } catch (error) {
        console.error('Error creating webhook:', error);
        handleApiError(error);
        throw error;
      }
    },
    update: async (id, data) => {
      try {
        console.log(`Updating webhook ${id} with data:`, data);
        const response = await api.put(`/webhooks/${id}`, {
          name: data.name,
          description: data.description,
          defaultPoolId: data.defaultPoolId,
          defaultBrand: data.defaultBrand || '',
          defaultSource: data.defaultSource || '',
          defaultLeadAge: data.defaultLeadAge || 0,
          fieldMapping: data.fieldMapping,
          active: data.active,
          authToken: data.authToken,
          tenant_id: getTenantId()
        });
        console.log('Update webhook response:', response);
        return response;
      } catch (error) {
        console.error(`Error updating webhook ${id}:`, error);
        handleApiError(error);
        throw error;
      }
    },
    delete: async (id) => {
      try {
        console.log(`Deleting webhook ${id}`);
        const response = await api.delete(`/webhooks/${id}`);
        console.log('Delete webhook response:', response);
        return response;
      } catch (error) {
        console.error(`Error deleting webhook ${id}:`, error);
        handleApiError(error);
        throw error;
      }
    },
    toggleStatus: async (id, active) => {
      try {
        console.log(`Toggling webhook ${id} status to ${active}`);
        const response = await api.patch(`/webhooks/${id}/status`, { active });
        console.log('Toggle webhook status response:', response);
        return response;
      } catch (error) {
        console.error(`Error toggling webhook ${id} status:`, error);
        handleApiError(error);
        throw error;
      }
    },
    getWebhookStats: async (id) => {
      try {
        console.log(`Fetching webhook ${id} stats`);
        const response = await api.get(`/webhooks/${id}/stats`);
        console.log('Webhook stats response:', response);
        return response;
      } catch (error) {
        console.error(`Error fetching webhook ${id} stats:`, error);
        handleApiError(error);
        throw error;
      }
    },
  },
};

export default apiService;