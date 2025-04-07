import axios from 'axios';

const API_BASE_URL = 'http://35.202.92.164:8080/api';

// Authentication credentials
const credentials = {
  email: 'admin@dialer-saas.com',
  password: 'admin123'
};

// Helper function to log test results
const logTestResult = (testName, success, error = null) => {
  console.log(`Test: ${testName}`);
  console.log(`Status: ${success ? '✅ PASSED' : '❌ FAILED'}`);
  if (error) {
    console.error('Error:', error.message);
    console.error('Details:', error.response?.data || error);
  }
  console.log('-------------------');
};

// Login and get authentication token
const login = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    const token = response.data.token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    logTestResult('Authentication', true);
    return true;
  } catch (error) {
    logTestResult('Authentication', false, error);
    return false;
  }
};

// Get available lead pools
const getLeadPools = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/lead-pools`);
    logTestResult('Get Lead Pools', true);
    return response.data;
  } catch (error) {
    logTestResult('Get Lead Pools', false, error);
    return null;
  }
};

// Get available DID pools
const getDidPools = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/did-pools`);
    logTestResult('Get DID Pools', true);
    return response.data;
  } catch (error) {
    logTestResult('Get DID Pools', false, error);
    return null;
  }
};

// Get available journeys
const getJourneys = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/journeys`);
    logTestResult('Get Journeys', true);
    return response.data;
  } catch (error) {
    logTestResult('Get Journeys', false, error);
    return null;
  }
};

// Test data (will be populated with valid IDs)
let testCampaign = {
  name: "Test Campaign",
  brand: "Test Brand",
  source: "Email",
  leadPoolId: null,
  didPoolId: null,
  description: "A test campaign for API verification",
  status: "active",
  journeyMappings: []
};

// Test campaign creation
const testCreateCampaign = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/campaigns`, testCampaign);
    logTestResult('Create Campaign', true);
    return response.data.id; // Return the created campaign ID for subsequent tests
  } catch (error) {
    logTestResult('Create Campaign', false, error);
    return null;
  }
};

// Test getting all campaigns
const testGetAllCampaigns = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/campaigns`);
    logTestResult('Get All Campaigns', true);
    return response.data;
  } catch (error) {
    logTestResult('Get All Campaigns', false, error);
    return null;
  }
};

// Test getting a specific campaign
const testGetCampaign = async (campaignId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/campaigns/${campaignId}`);
    logTestResult('Get Campaign', true);
    return response.data;
  } catch (error) {
    logTestResult('Get Campaign', false, error);
    return null;
  }
};

// Test updating a campaign
const testUpdateCampaign = async (campaignId) => {
  const updateData = {
    ...testCampaign,
    name: "Updated Test Campaign",
    description: "Updated test campaign description"
  };

  try {
    const response = await axios.put(`${API_BASE_URL}/campaigns/${campaignId}`, updateData);
    logTestResult('Update Campaign', true);
    return response.data;
  } catch (error) {
    logTestResult('Update Campaign', false, error);
    return null;
  }
};

// Test campaign journey mappings
const testJourneyMappings = async (campaignId, availableJourneys) => {
  try {
    // Get journey mappings
    const getResponse = await axios.get(`${API_BASE_URL}/campaigns/${campaignId}/journey-mappings`);
    logTestResult('Get Journey Mappings', true);

    // Add a new journey mapping using a different available journey
    const newMapping = {
      journeyId: availableJourneys[1]?.id || availableJourneys[0].id, // Use second journey if available, otherwise use first
      leadAgeMin: 31,
      leadAgeMax: 60,
      durationDays: 14
    };
    const addResponse = await axios.post(`${API_BASE_URL}/campaigns/${campaignId}/journey-mappings`, newMapping);
    logTestResult('Add Journey Mapping', true);

    return {
      existing: getResponse.data,
      new: addResponse.data
    };
  } catch (error) {
    logTestResult('Journey Mappings Operations', false, error);
    return null;
  }
};

// Helper function to wait for campaign status
const waitForStatus = async (campaignId, expectedStatus, maxAttempts = 10) => {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await axios.get(`${API_BASE_URL}/campaigns/${campaignId}`);
    if (response.data.status === expectedStatus) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
};

// Test campaign status operations
const testCampaignStatus = async (campaignId) => {
  try {
    // Test pause
    await axios.post(`${API_BASE_URL}/campaigns/${campaignId}/pause`);
    if (!await waitForStatus(campaignId, 'paused')) {
      throw new Error('Campaign failed to enter paused state');
    }
    logTestResult('Pause Campaign', true);

    // Test start
    await axios.post(`${API_BASE_URL}/campaigns/${campaignId}/start`);
    if (!await waitForStatus(campaignId, 'active')) {
      throw new Error('Campaign failed to enter active state');
    }
    logTestResult('Start Campaign', true);

    // Test pause again
    await axios.post(`${API_BASE_URL}/campaigns/${campaignId}/pause`);
    if (!await waitForStatus(campaignId, 'paused')) {
      throw new Error('Campaign failed to enter paused state');
    }
    logTestResult('Pause Campaign Again', true);

    // Test complete
    await axios.post(`${API_BASE_URL}/campaigns/${campaignId}/complete`);
    if (!await waitForStatus(campaignId, 'completed')) {
      throw new Error('Campaign failed to enter completed state');
    }
    logTestResult('Complete Campaign', true);

    return true;
  } catch (error) {
    logTestResult('Campaign Status Operations', false, error);
    return false;
  }
};

// Test campaign metrics
const testCampaignMetrics = async (campaignId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/campaigns/${campaignId}/metrics`, {
      params: { timeRange: '7d' }
    });
    logTestResult('Get Campaign Metrics', true);
    return response.data;
  } catch (error) {
    logTestResult('Get Campaign Metrics', false, error);
    return null;
  }
};

// Test deleting a campaign
const testDeleteCampaign = async (campaignId) => {
  try {
    // Verify campaign status before deletion
    const campaignResponse = await axios.get(`${API_BASE_URL}/campaigns/${campaignId}`);
    if (campaignResponse.data.status !== 'completed') {
      throw new Error(`Campaign status is ${campaignResponse.data.status}, must be 'completed' before deletion`);
    }

    // Attempt deletion
    await axios.delete(`${API_BASE_URL}/campaigns/${campaignId}`);
    logTestResult('Delete Campaign', true);

    // Verify deletion
    try {
      await axios.get(`${API_BASE_URL}/campaigns/${campaignId}`);
      throw new Error('Campaign still exists after deletion');
    } catch (error) {
      if (error.response?.status === 404) {
        return true; // Campaign was successfully deleted
      }
      throw error;
    }
  } catch (error) {
    logTestResult('Delete Campaign', false, error);
    return false;
  }
};

// Run all tests
const runTests = async () => {
  console.log('Starting Campaign API Tests...\n');

  // First authenticate
  const isAuthenticated = await login();
  if (!isAuthenticated) {
    console.log('❌ Failed to authenticate. Stopping tests.');
    return;
  }

  // Get available resources
  const leadPools = await getLeadPools();
  if (!leadPools || !leadPools.length) {
    console.log('❌ No lead pools available. Stopping tests.');
    return;
  }

  const didPools = await getDidPools();
  if (!didPools || !didPools.length) {
    console.log('❌ No DID pools available. Stopping tests.');
    return;
  }

  const journeys = await getJourneys();
  if (!journeys || !journeys.length) {
    console.log('❌ No journeys available. Stopping tests.');
    return;
  }

  // Update test data with valid IDs
  testCampaign = {
    ...testCampaign,
    leadPoolId: leadPools[0].id,
    didPoolId: didPools[0].id,
    journeyMappings: [{
      journeyId: journeys[0].id,
      leadAgeMin: 0,
      leadAgeMax: 30,
      durationDays: 7
    }]
  };

  // Create a new campaign
  const campaignId = await testCreateCampaign();
  if (!campaignId) {
    console.log('❌ Failed to create test campaign. Stopping tests.');
    return;
  }

  // Run remaining tests
  await testGetAllCampaigns();
  await testGetCampaign(campaignId);
  await testUpdateCampaign(campaignId);
  await testJourneyMappings(campaignId, journeys);
  await testCampaignStatus(campaignId);
  await testCampaignMetrics(campaignId);
  
  // Add a delay before deletion to ensure status changes are processed
  await new Promise(resolve => setTimeout(resolve, 1000));
  await testDeleteCampaign(campaignId);

  console.log('\nCampaign API Tests Completed!');
};

// Execute tests
runTests().catch(error => {
  console.error('Test suite failed:', error);
}); 