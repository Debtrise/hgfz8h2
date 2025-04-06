import apiService from './apiService';

// Configuration for Call Center components

const config = {
  // API endpoints - now using apiService instead of direct endpoints
  api: {
    // Recordings endpoints
    recordings: {
      base: "/api/recordings",
      ivrs: "/api/ivrs",
      voicemails: "/api/voicemails",
      upload: "/api/recordings/upload",
    },

    // TCPA/Config endpoints
    tcpa: {
      settings: "/api/settings/tcpa",
      dncList: "/api/dnc-list",
      dncUpload: "/api/dnc-list/upload",
      callConfig: "/api/settings/call-config",
      byoc: "/api/settings/byoc",
    },

    // Relationship management endpoints
    relationships: {
      ingroups: "/api/ingroups",
      brands: "/api/brands",
      sources: "/api/sources",
      relationships: "/api/relationships",
    },

    // Agent interface endpoints
    agent: {
      status: "/api/agent/status",
      calls: "/api/agent/calls",
      leads: "/api/agent/leads",
      webhook: "/api/agent/webhook",
      sip: "/api/agent/sip",
    },

    // Flow builder endpoints
    flowBuilder: {
      flows: "/api/flows",
      nodes: "/api/flow-nodes",
      save: "/api/flows/save",
    },

    // Admin dashboard endpoints
    admin: {
      stats: "/api/admin/stats",
      agents: "/api/admin/agents",
      queues: "/api/admin/queues",
    },

    // Call logs endpoints
    callLogs: {
      list: "/api/call-logs",
      details: "/api/call-logs/details",
      events: "/api/call-logs/events",
      transcriptions: "/api/call-logs/transcriptions",
    },
  },

  // SIP configuration
  sip: {
    server: process.env.REACT_APP_SIP_SERVER || "wss://35.202.92.164:8443",
    port: 8443,
    domain: process.env.REACT_APP_SIP_DOMAIN || "35.202.92.164",
    debug: process.env.NODE_ENV === "development",
    iceServers: [
      { urls: "stun:stun.35.202.92.164:3478" },
      {
        urls: "turn:turn.35.202.92.164:3478",
        username: "user",
        credential: "password",
      },
    ],
  },

  // Default settings
  defaults: {
    // TCPA compliance
    tcpa: {
      callTimeRestrictions: true,
      allowedCallingHours: ["09:00", "20:00"],
      recordAllCalls: true,
    },

    // Agent settings
    agent: {
      autoAcceptCalls: false,
      wrapUpTime: 30, // seconds
      maxConcurrentCalls: 1,
      defaultStatus: "available",
    },

    // Recording settings
    recordings: {
      format: "mp3",
      quality: "medium", // low, medium, high
      storage: 90, // days
    },

    // Webhook settings
    webhooks: {
      retryCount: 3,
      retryInterval: 5000, // ms
      timeout: 10000, // ms
    },
  },

  // Feature flags
  features: {
    callRecording: true,
    transcription: true,
    amd: true, // Answering machine detection
    realTimeAnalytics: true,
    sipTracking: true,
    webhooks: true,
  },
};

// Environment-specific overrides
if (process.env.NODE_ENV === "development") {
  // Override with development settings
  config.api = Object.keys(config.api).reduce((acc, key) => {
    acc[key] =
      typeof config.api[key] === "object"
        ? Object.keys(config.api[key]).reduce((endpointAcc, endpointKey) => {
            endpointAcc[
              endpointKey
            ] = `http://35.202.92.164:8080${config.api[key][endpointKey]}`;
            return endpointAcc;
          }, {})
        : `http://35.202.92.164:8080${config.api[key]}`;
    return acc;
  }, {});

  config.sip.server = "wss://35.202.92.164:8443";
  config.sip.debug = true;
}

export default config;

// Helper function to get endpoints by component
export const getEndpoints = (component) => {
  return config.api[component] || {};
};

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (feature) => {
  return !!config.features[feature];
};

// Get default settings for a component
export const getDefaultSettings = (component) => {
  return config.defaults[component] || {};
};

// Get SIP configuration
export const getSipConfig = () => {
  return config.sip;
};

// Helper function to get API service for a component
export const getApiService = (component) => {
  return apiService[component] || {};
};
