import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { SidebarProvider } from './context/SidebarContext';

// Auth pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

// Import layout components
import Layout from "./components/Layout";

// Import existing pages
import Dashboard from "./pages/Dashboard.js";
import Campaigns from "./pages/Campaigns";
import CampaignBuilder from "./pages/CampaignBuilder";
import CampaignDetail from "./pages/CampaignDetail";
import LeadPools from "./pages/LeadPools";
import LeadPoolForm from "./pages/LeadPoolForm";
import LeadPoolDetail from "./pages/LeadPoolDetail";
import DIDPools from "./pages/DIDPools";
import DIDPoolForm from "./pages/DIDPoolForm";
import DIDPoolDetail from "./pages/DIDPoolDetail";
import LeadsList from "./pages/LeadsList";
import LeadDetail from "./pages/LeadDetail";
import DIDsList from "./pages/DIDsList";
import DIDDetail from "./pages/DIDDetail";
import Settings from "./pages/Settings";

// Import Form Builder pages
import Forms from "./pages/Forms";
import FormBuilder from "./pages/FormBuilder";

// Import new Call Center / Dialer pages
import AgentInterface from "./pages/AgentInterface";
import AdminDashboard from "./pages/AdminDashboard";
import Recordings from "./pages/Recordings";
import CallLogs from "./pages/CallLogs";
import TCPAConfig from "./pages/TCPAConfig";
import RelationshipManagement from "./pages/RelationshipManagement";
import CallConfig from "./pages/CallConfig";
import RealTimeAgentDashboard from "./components/RealTimeAgentDashboard";

// Import Email Template components
import EmailTemplates from "./pages/EmailTemplates";
import EmailTemplateBuilder from "./pages/EmailTemplateBuilder";
import EmailTemplateDetail from "./pages/EmailTemplateDetail";

// Import SMS Messaging component
import SMSMessaging from "./pages/SMSMessaging";

// Import new Flow Builder components
import FlowBuilder from "./components/CallFlowBuilder";
import FlowInventory from "./pages/FlowInventory";
import CallFlowBuilder from "./components/CallFlowBuilder.js";

// Import styles
import "./App.css";

// Import the new Integrations component
import Integrations from "./pages/Integrations";

// Import the UserManagement component
import UserManagement from "./pages/UserManagement";

// Import UserProfile component
import UserProfile from './pages/UserProfile';

// Import UserProfile CSS
import './styles/UserProfile.css';

// Import the CallCenterHome component
import CallCenterHome from "./pages/CallCenterHome";

// Import the IntegrationsProvider
import { IntegrationsProvider } from './context/IntegrationsContext';

// Import Journeys and JourneyBuilder components
import Journeys from "./pages/Journeys";
import JourneyBuilder from "./JourneyBuilder";

// Import SMS Blaster component
import SMSBlaster from "./pages/SMSBlaster";

// Import QueueBuilder component
import QueueBuilder from "./pages/QueueBuilder";

// Import TextToSpeech component
import TextToSpeech from "./components/TextToSpeech";

// Private Route component to handle authenticated routes
const PrivateRoute = ({ children }) => {
  // For demo purposes, always authenticate
  const isAuthenticated = true;
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  const [theme, setTheme] = useState('light');

  return (
    <Router>
      <SidebarProvider>
        <IntegrationsProvider>
          <div className={`app-wrapper theme-${theme}`}>
            <Routes>
              {/* Auth routes - accessible to everyone */}
              <Route path="/Login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Redirect root to dashboard if authenticated, otherwise to login */}
              <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}
              >
                {/* Dashboard */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />

                {/* Campaign routes */}
                <Route path="campaigns" element={<Campaigns />} />
                <Route path="campaigns/new" element={<CampaignBuilder />} />
                <Route path="campaigns/:id" element={<CampaignBuilder />} />
                <Route path="campaigns/:id/preview" element={<CampaignBuilder />} />
                <Route path="campaigns/:id/detail" element={<CampaignDetail />} />

                {/* Form Builder routes */}
                <Route path="forms" element={<Forms />} />
                <Route path="forms/new" element={<FormBuilder />} />
                <Route path="forms/:id" element={<FormBuilder />} />

                {/* Lead Pool routes */}
                <Route path="lead-pools" element={<LeadPools />} />
                <Route path="lead-pools/new" element={<LeadPoolForm />} />
                <Route path="lead-pools/:id" element={<LeadPoolForm />} />
                <Route path="leads/pools/:id" element={<LeadPoolDetail />} />

                {/* DID Pool routes */}
                <Route path="did-pools" element={<DIDPools />} />
                <Route path="did-pools/new" element={<DIDPoolForm />} />
                <Route path="did-pools/:id" element={<DIDPoolForm />} />
                <Route path="dids/pools/:id" element={<DIDPoolDetail />} />

                {/* Leads list routes */}
                <Route path="leads" element={<LeadsList />} />
                <Route path="leads/:id" element={<LeadDetail />} />

                {/* DIDs list routes */}
                <Route path="dids" element={<DIDsList />} />
                <Route path="dids/:id" element={<DIDDetail />} />

                {/* Settings */}
                <Route path="settings" element={<Settings />} />
                <Route path="settings/profile" element={<UserProfile />} />
                <Route path="settings/roles" element={<Settings />} />
                <Route path="settings/notifications" element={<Settings />} />
                <Route path="settings/agents" element={<Settings />} />
                <Route path="settings/integrations" element={<Settings />} />
                <Route path="settings/users" element={<Settings />} />

                {/* Relationship Management */}
                <Route path="relationship" element={<RelationshipManagement />} />

                {/* New Call Center / Dialer Routes */}
                <Route path="call-center" element={<Navigate to="/call-center/real-time-dashboard" replace />} />
                <Route path="call-center/agent" element={<AgentInterface />} />
                <Route path="call-center/admin" element={<AdminDashboard />} />
                <Route path="call-center/real-time-dashboard" element={<RealTimeAgentDashboard />} />

                {/* Updated Flow Builder Routes */}
                <Route path="call-center/FlowInventory" element={<FlowInventory />} />
                <Route path="call-center/FlowBuilder/new" element={<FlowBuilder />} />
                <Route path="call-center/FlowBuilder/:id" element={<FlowBuilder />} />

                <Route path="call-center/recordings" element={<Recordings />} />
                <Route path="call-center/call-logs" element={<CallLogs />} />
                <Route path="call-center/tcpa-config" element={<TCPAConfig />} />
                <Route path="call-center/call-config" element={<CallConfig />} />

                {/* Email Template Routes */}
                <Route path="email-templates" element={<EmailTemplates />} />
                <Route path="email-templates/new" element={<EmailTemplateBuilder />} />
                <Route path="email-templates/:id" element={<EmailTemplateBuilder />} />
                <Route path="email-templates/:id/detail" element={<EmailTemplateDetail />} />
                
                {/* SMS Messaging Routes */}
                <Route path="sms-messaging" element={<SMSMessaging />} />
                <Route path="sms-blaster" element={<SMSBlaster />} />

                {/* Text to Speech Route */}
                <Route path="text-to-speech" element={<TextToSpeech />} />

                {/* Journeys routes */}
                <Route path="journeys" element={<Journeys />} />
                <Route path="journeys/builder" element={<JourneyBuilder />} />
                <Route path="journeys/builder/:id" element={<JourneyBuilder />} />

                {/* Queue Builder route */}
                <Route path="/queue-builder" element={<PrivateRoute><QueueBuilder /></PrivateRoute>} />

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </div>
        </IntegrationsProvider>
      </SidebarProvider>
    </Router>
  );
}

export default App;
