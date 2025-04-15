import React, { useState } from 'react';
import 'antd/dist/reset.css';
import './styles/fonts.css';
import './styles/mobile.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { SidebarProvider } from './context/SidebarContext';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

// Import layout components
import Layout from "./components/Layout";

// Import core pages
import Dashboard from "./pages/Dashboard.js";
import Campaigns from "./pages/Campaigns";
import CampaignBuilder from "./pages/CampaignBuilder";
import CampaignDetail from "./pages/CampaignDetail";
import LeadPools from "./pages/LeadPools";
import LeadPoolForm from "./pages/LeadPoolForm";
import LeadPoolDetail from "./pages/LeadPoolDetail";
import LeadPoolLeads from "./pages/LeadPoolLeads";
import LeadsList from "./pages/LeadsList";
import LeadDetail from "./pages/LeadDetail";
import Settings from "./pages/Settings";
import LeadManagement from "./pages/LeadManagement";
import Features from "./pages/Features";

// Import Journey components
import JourneyBuilderList from "./components/JourneyBuilderList";

// Import Call Center pages
import AgentInterface from "./pages/AgentInterface";
import AdminDashboard from "./pages/AdminDashboard";
import Recordings from "./pages/Recordings";
import CallLogs from "./pages/CallLogs";
import CallConfig from "./pages/CallConfig";
import RealTimeAgentDashboard from "./components/RealTimeAgentDashboard";
import FlowBuilder from "./components/CallFlowBuilder";
import FlowInventory from "./pages/FlowInventory";

// Import UserProfile component
import UserProfile from './pages/UserProfile';

// Import the IntegrationsProvider
import { IntegrationsProvider } from './context/IntegrationsContext';

import UserManagement from './pages/UserManagement';
import BrandSourceManagement from './pages/BrandSourceManagement';

// Import DID Pool components
import DIDPools from './pages/DIDPools';
import DIDPoolDetail from './pages/DIDPoolDetail';
import DIDDetail from './pages/DIDDetail';
import DIDPoolDetails from "./pages/DIDPoolDetails";
import DIDEdit from "./pages/DIDEdit";
import DIDs from './pages/DIDs';

import ImportLeads from './pages/ImportLeads';
import LeadAssignments from './pages/LeadAssignments';
import WebhookIngestion from './pages/WebhookIngestion';

// Import Journey pages
import Journeys from "./pages/Journeys";

// Import Marketplace pages
import Marketplace from "./pages/Marketplace";
import MarketplaceResults from "./pages/Marketplace/Results";
import MarketplaceBuyer from "./pages/Marketplace/Buyer";
import MarketplaceSeller from "./pages/Marketplace/Seller";
import MarketplaceSettings from "./pages/Marketplace/Settings";
import WebhookIntegration from "./pages/Marketplace/WebhookIntegration";

// Import Admin and Agent Login pages
import AdminLogin from "./pages/AdminLogin";
import AgentLogin from "./pages/AgentLogin";

// Import Agent Assignment Management
import AgentAssignmentManagement from "./pages/settings/AgentAssignmentManagement";

// Set up axios defaults and interceptors
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://35.202.92.164:8080/api';

// Log the base URL for debugging
console.log('Axios baseURL:', axios.defaults.baseURL);

// Add a request interceptor
axios.interceptors.request.use(
  (config) => {
    // Log the full URL being requested for debugging
    console.log('Making request to:', config.baseURL + config.url);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('agentId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function App() {
  const [theme, setTheme] = useState('light');

  return (
    <Router>
      <AuthProvider>
        <SidebarProvider>
          <IntegrationsProvider>
            <div className={`app-wrapper theme-${theme}`}>
              <Routes>
                {/* Auth routes - accessible to everyone */}
                <Route path="/login" element={<Login />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/agent-login" element={<AgentLogin />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Agent Portal - accessible to agents, no sidebar layout */}
                <Route path="/agent" element={<AgentInterface />} />

                {/* Admin routes - accessible to admins with layout */}
                <Route path="/" element={<Layout />}>
                  {/* Dashboard */}
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  
                  {/* Features route */}
                  <Route path="features" element={<Features />} />

                  {/* Campaign routes */}
                  <Route path="campaigns" element={<Campaigns />} />
                  <Route path="campaigns/new" element={<CampaignBuilder />} />
                  <Route path="campaigns/:id" element={<CampaignBuilder />} />
                  <Route path="campaigns/:id/detail" element={<CampaignDetail />} />

                  {/* Lead Pool routes */}
                  <Route path="lead-pools" element={<LeadPools />} />
                  <Route path="lead-pools/new" element={<LeadPoolForm />} />
                  <Route path="lead-pools/:id" element={<LeadPoolForm />} />
                  <Route path="lead-pools/:id/leads" element={<LeadPoolLeads />} />

                  {/* Leads routes */}
                  <Route path="leads" element={<LeadsList />} />
                  <Route path="leads/:id" element={<LeadDetail />} />
                  <Route path="leads/import" element={<ImportLeads />} />
                  <Route path="leads/assignments" element={<LeadAssignments />} />
                  <Route path="leads/webhooks" element={<WebhookIngestion />} />
                  
                  {/* Lead Management route */}
                  <Route path="lead-management" element={<LeadManagement />} />

                  {/* Journey routes */}
                  <Route path="journeys" element={<Journeys />} />
                  <Route path="journeys/builder" element={<JourneyBuilderList />} />
                  <Route path="journeys/:id" element={<JourneyBuilderList />} />

                  {/* DID Pool routes */}
                  <Route path="did-pools" element={<DIDPools />} />
                  <Route path="did-pools/:id" element={<DIDPoolDetails />} />
                  <Route path="dids" element={<DIDs />} />
                  <Route path="dids/:id" element={<DIDDetail />} />
                  <Route path="dids/:id/edit" element={<DIDEdit />} />

                  {/* Marketplace Routes */}
                  <Route path="marketplace" element={<Navigate to="/marketplace/results" replace />} />
                  <Route path="marketplace/results" element={<MarketplaceResults />} />
                  <Route path="marketplace/buyer" element={<MarketplaceBuyer />} />
                  <Route path="marketplace/seller" element={<MarketplaceSeller />} />
                  <Route path="marketplace/settings" element={<MarketplaceSettings />} />
                  <Route path="marketplace/webhook-integration" element={<WebhookIntegration />} />

                  {/* Settings routes */}
                  <Route path="settings" element={<Settings />} />
                  <Route path="settings/profile" element={<UserProfile />} />
                  <Route path="settings/users" element={<UserManagement />} />
                  <Route path="settings/brands-sources" element={<BrandSourceManagement />} />
                  <Route path="settings/agents" element={<Settings />} />
                  <Route path="settings/agent-assignments" element={<AgentAssignmentManagement />} />
                  <Route path="settings/notifications" element={<Settings />} />
                  <Route path="settings/relationship" element={<Settings />} />
                  <Route path="settings/integrations" element={<Settings />} />

                  {/* Call Center Routes */}
                  <Route path="call-center" element={<Navigate to="/call-center/real-time-dashboard" replace />} />
                  <Route path="call-center/admin" element={<AdminDashboard />} />
                  <Route path="call-center/real-time-dashboard" element={<RealTimeAgentDashboard />} />
                  <Route path="call-center/FlowInventory" element={<FlowInventory />} />
                  <Route path="call-center/FlowBuilder/new" element={<FlowBuilder />} />
                  <Route path="call-center/FlowBuilder/:id" element={<FlowBuilder />} />
                  <Route path="call-center/recordings" element={<Recordings />} />
                  <Route path="call-center/call-logs" element={<CallLogs />} />
                  <Route path="call-center/call-config" element={<CallConfig />} />

                  {/* Catch-all fallback */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
              </Routes>
            </div>
          </IntegrationsProvider>
        </SidebarProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
