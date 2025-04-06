import React, { useState } from 'react';
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

import ImportLeads from './pages/ImportLeads';
import LeadAssignments from './pages/LeadAssignments';

// Import Journey pages
import Journeys from "./pages/Journeys";

// Private Route component to handle authenticated routes
const PrivateRoute = ({ children }) => {
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
              <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                {/* Dashboard */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />

                {/* Campaign routes */}
                <Route path="campaigns" element={<Campaigns />} />
                <Route path="campaigns/new" element={<CampaignBuilder />} />
                <Route path="campaigns/:id" element={<CampaignBuilder />} />
                <Route path="campaigns/:id/detail" element={<CampaignDetail />} />

                {/* Lead Pool routes */}
                <Route path="lead-pools" element={<PrivateRoute><LeadPools /></PrivateRoute>} />
                <Route path="lead-pools/new" element={<PrivateRoute><LeadPoolForm /></PrivateRoute>} />
                <Route path="lead-pools/:id" element={<PrivateRoute><LeadPoolForm /></PrivateRoute>} />
                <Route path="lead-pools/:id/leads" element={<PrivateRoute><LeadPoolLeads /></PrivateRoute>} />

                {/* Leads list routes */}
                <Route path="leads" element={<PrivateRoute><LeadsList /></PrivateRoute>} />
                <Route path="leads/:id" element={<PrivateRoute><LeadDetail /></PrivateRoute>} />
                <Route path="leads/import" element={<PrivateRoute><ImportLeads /></PrivateRoute>} />
                <Route path="leads/assignments" element={<PrivateRoute><LeadAssignments /></PrivateRoute>} />
                
                {/* Lead Management route */}
                <Route path="lead-management" element={<LeadManagement />} />

                {/* Journey routes */}
                <Route path="journeys" element={<PrivateRoute><Journeys /></PrivateRoute>} />
                <Route path="journeys/builder" element={<PrivateRoute><Journeys /></PrivateRoute>} />
                <Route path="journeys/:id" element={<PrivateRoute><Journeys /></PrivateRoute>} />

                {/* DID Pool routes */}
                <Route path="did-pools" element={<PrivateRoute><DIDPools /></PrivateRoute>} />
                <Route path="did-pools/:id" element={<PrivateRoute><DIDPoolDetails /></PrivateRoute>} />
                <Route path="dids" element={<DIDDetail />} />
                <Route path="dids/:id" element={<DIDDetail />} />
                <Route path="dids/:id/edit" element={<PrivateRoute><DIDEdit /></PrivateRoute>} />

                {/* Settings */}
                <Route path="settings" element={<Settings />} />
                <Route path="settings/profile" element={<UserProfile />} />
                <Route path="settings/users" element={<Settings />} />
                <Route path="settings/brands-sources" element={<PrivateRoute><BrandSourceManagement /></PrivateRoute>} />

                {/* Call Center Routes */}
                <Route path="call-center" element={<Navigate to="/call-center/real-time-dashboard" replace />} />
                <Route path="call-center/agent" element={<AgentInterface />} />
                <Route path="call-center/admin" element={<AdminDashboard />} />
                <Route path="call-center/real-time-dashboard" element={<RealTimeAgentDashboard />} />
                <Route path="call-center/FlowInventory" element={<FlowInventory />} />
                <Route path="call-center/FlowBuilder/new" element={<FlowBuilder />} />
                <Route path="call-center/FlowBuilder/:id" element={<FlowBuilder />} />
                <Route path="call-center/recordings" element={<Recordings />} />
                <Route path="call-center/call-logs" element={<CallLogs />} />
                <Route path="call-center/call-config" element={<CallConfig />} />

                {/* User Management */}
                <Route path="users" element={<UserManagement />} />

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
