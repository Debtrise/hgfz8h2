import axios from "axios";
import { getEndpoints } from "./callCenterConfig";

// Create base axios instance
const api = axios.create({
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // In a real implementation, you would add auth token here
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common error cases
    if (error.response) {
      // Server responded with an error status code
      console.error("API Error:", error.response.status, error.response.data);

      // Handle 401 Unauthorized - redirect to login
      if (error.response.status === 401) {
        // window.location.href = '/login';
        console.warn("Authentication required");
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("No response received:", error.request);
    } else {
      // Error setting up the request
      console.error("Request error:", error.message);
    }

    return Promise.reject(error);
  }
);

// API service for call center components
const callCenterService = {
  // Recordings API methods
  recordings: {
    getAll: async (filters = {}) => {
      const endpoints = getEndpoints("recordings");
      const response = await api.get(endpoints.base, { params: filters });
      return response.data;
    },

    getIVRs: async (filters = {}) => {
      const endpoints = getEndpoints("recordings");
      const response = await api.get(endpoints.ivrs, { params: filters });
      return response.data;
    },

    getVoicemails: async (filters = {}) => {
      const endpoints = getEndpoints("recordings");
      const response = await api.get(endpoints.voicemails, { params: filters });
      return response.data;
    },

    uploadFile: async (file, type, metadata = {}) => {
      const endpoints = getEndpoints("recordings");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      formData.append("metadata", JSON.stringify(metadata));

      const response = await api.post(endpoints.upload, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },

    deleteRecording: async (id, type = "recording") => {
      const endpoints = getEndpoints("recordings");
      const endpoint =
        type === "ivr"
          ? endpoints.ivrs
          : type === "voicemail"
          ? endpoints.voicemails
          : endpoints.base;

      const response = await api.delete(`${endpoint}/${id}`);
      return response.data;
    },
  },

  // TCPA API methods
  tcpa: {
    getSettings: async () => {
      const endpoints = getEndpoints("tcpa");
      const response = await api.get(endpoints.settings);
      return response.data;
    },

    saveSettings: async (settings) => {
      const endpoints = getEndpoints("tcpa");
      const response = await api.post(endpoints.settings, settings);
      return response.data;
    },

    getDNCList: async () => {
      const endpoints = getEndpoints("tcpa");
      const response = await api.get(endpoints.dncList);
      return response.data;
    },

    addToDNC: async (phoneNumber, reason) => {
      const endpoints = getEndpoints("tcpa");
      const response = await api.post(endpoints.dncList, {
        phoneNumber,
        reason,
      });
      return response.data;
    },

    removeFromDNC: async (id) => {
      const endpoints = getEndpoints("tcpa");
      const response = await api.delete(`${endpoints.dncList}/${id}`);
      return response.data;
    },

    uploadDNCList: async (file) => {
      const endpoints = getEndpoints("tcpa");
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(endpoints.dncUpload, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },

    getCallConfig: async () => {
      const endpoints = getEndpoints("tcpa");
      const response = await api.get(endpoints.callConfig);
      return response.data;
    },

    saveCallConfig: async (config) => {
      const endpoints = getEndpoints("tcpa");
      const response = await api.post(endpoints.callConfig, config);
      return response.data;
    },

    getBYOCSettings: async () => {
      const endpoints = getEndpoints("tcpa");
      const response = await api.get(endpoints.byoc);
      return response.data;
    },

    saveBYOCSettings: async (settings) => {
      const endpoints = getEndpoints("tcpa");
      const response = await api.post(endpoints.byoc, settings);
      return response.data;
    },
  },

  // Relationships API methods
  relationships: {
    getIngroups: async () => {
      const endpoints = getEndpoints("relationships");
      const response = await api.get(endpoints.ingroups);
      return response.data;
    },

    getBrands: async () => {
      const endpoints = getEndpoints("relationships");
      const response = await api.get(endpoints.brands);
      return response.data;
    },

    getSources: async () => {
      const endpoints = getEndpoints("relationships");
      const response = await api.get(endpoints.sources);
      return response.data;
    },

    getRelationships: async () => {
      const endpoints = getEndpoints("relationships");
      const response = await api.get(endpoints.relationships);
      return response.data;
    },

    createIngroup: async (ingroup) => {
      const endpoints = getEndpoints("relationships");
      const response = await api.post(endpoints.ingroups, ingroup);
      return response.data;
    },

    createBrand: async (brand) => {
      const endpoints = getEndpoints("relationships");
      const response = await api.post(endpoints.brands, brand);
      return response.data;
    },

    createSource: async (source) => {
      const endpoints = getEndpoints("relationships");
      const response = await api.post(endpoints.sources, source);
      return response.data;
    },

    createRelationship: async (relationship) => {
      const endpoints = getEndpoints("relationships");
      const response = await api.post(endpoints.relationships, relationship);
      return response.data;
    },

    updateIngroup: async (id, ingroup) => {
      const endpoints = getEndpoints("relationships");
      const response = await api.put(`${endpoints.ingroups}/${id}`, ingroup);
      return response.data;
    },

    updateBrand: async (id, brand) => {
      const endpoints = getEndpoints("relationships");
      const response = await api.put(`${endpoints.brands}/${id}`, brand);
      return response.data;
    },

    updateSource: async (id, source) => {
      const endpoints = getEndpoints("relationships");
      const response = await api.put(`${endpoints.sources}/${id}`, source);
      return response.data;
    },

    deleteIngroup: async (id) => {
      const endpoints = getEndpoints("relationships");
      const response = await api.delete(`${endpoints.ingroups}/${id}`);
      return response.data;
    },

    deleteBrand: async (id) => {
      const endpoints = getEndpoints("relationships");
      const response = await api.delete(`${endpoints.brands}/${id}`);
      return response.data;
    },

    deleteSource: async (id) => {
      const endpoints = getEndpoints("relationships");
      const response = await api.delete(`${endpoints.sources}/${id}`);
      return response.data;
    },

    deleteRelationship: async (id) => {
      const endpoints = getEndpoints("relationships");
      const response = await api.delete(`${endpoints.relationships}/${id}`);
      return response.data;
    },
  },

  // Agent interface API methods
  agent: {
    updateStatus: async (status) => {
      const endpoints = getEndpoints("agent");
      const response = await api.post(`${endpoints.status}`, { status });
      return response.data;
    },

    getCallHistory: async () => {
      const endpoints = getEndpoints("agent");
      const response = await api.get(`${endpoints.calls}`);
      return response.data;
    },

    getLeadInfo: async (leadId) => {
      const endpoints = getEndpoints("agent");
      const response = await api.get(`${endpoints.leads}/${leadId}`);
      return response.data;
    },

    executeWebhook: async (data) => {
      const endpoints = getEndpoints("agent");
      const response = await api.post(`${endpoints.webhook}`, data);
      return response.data;
    },

    initializeSIP: async (config) => {
      const endpoints = getEndpoints("agent");
      const response = await api.post(`${endpoints.sip}/initialize`, config);
      return response.data;
    },

    disconnectSIP: async (sessionId) => {
      const endpoints = getEndpoints("agent");
      const response = await api.post(`${endpoints.sip}/disconnect`, {
        sessionId,
      });
      return response.data;
    },
  },

  // Flow builder API methods
  flowBuilder: {
    getFlows: async () => {
      const endpoints = getEndpoints("flowBuilder");
      const response = await api.get(endpoints.flows);
      return response.data;
    },

    getFlow: async (id) => {
      const endpoints = getEndpoints("flowBuilder");
      const response = await api.get(`${endpoints.flows}/${id}`);
      return response.data;
    },

    saveFlow: async (flow) => {
      const endpoints = getEndpoints("flowBuilder");
      const response = await api.post(endpoints.save, flow);
      return response.data;
    },

    deleteFlow: async (id) => {
      const endpoints = getEndpoints("flowBuilder");
      const response = await api.delete(`${endpoints.flows}/${id}`);
      return response.data;
    },
  },

  // Admin dashboard API methods
  admin: {
    getStats: async (filters = {}) => {
      const endpoints = getEndpoints("admin");
      const response = await api.get(endpoints.stats, { params: filters });
      return response.data;
    },

    getAgents: async () => {
      const endpoints = getEndpoints("admin");
      const response = await api.get(endpoints.agents);
      return response.data;
    },

    getAgentDetails: async (id) => {
      const endpoints = getEndpoints("admin");
      const response = await api.get(`${endpoints.agents}/${id}`);
      return response.data;
    },

    getQueues: async () => {
      const endpoints = getEndpoints("admin");
      const response = await api.get(endpoints.queues);
      return response.data;
    },

    getQueueDetails: async (id) => {
      const endpoints = getEndpoints("admin");
      const response = await api.get(`${endpoints.queues}/${id}`);
      return response.data;
    },
  },

  // Call logs API methods
  callLogs: {
    getLogs: async (filters = {}) => {
      const endpoints = getEndpoints("callLogs");
      const response = await api.get(endpoints.list, { params: filters });
      return response.data;
    },

    getCallDetails: async (id) => {
      const endpoints = getEndpoints("callLogs");
      const response = await api.get(`${endpoints.details}/${id}`);
      return response.data;
    },

    getCallEvents: async (callId) => {
      const endpoints = getEndpoints("callLogs");
      const response = await api.get(`${endpoints.events}/${callId}`);
      return response.data;
    },

    getTranscription: async (callId) => {
      const endpoints = getEndpoints("callLogs");
      const response = await api.get(`${endpoints.transcriptions}/${callId}`);
      return response.data;
    },
  },
};

export default callCenterService;
