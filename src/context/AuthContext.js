import React, { createContext, useContext, useState, useEffect } from 'react';
import AgentService from '../services/AgentService';
import AuthService from '../services/AuthService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("AuthContext: Initializing authentication state");
        // Check if user is already logged in via AuthService
        if (AuthService.isAuthenticated()) {
          console.log("AuthContext: User is authenticated, getting user data");
          const user = AuthService.getUser();
          console.log("AuthContext: Retrieved user data:", user);
          setCurrentUser(user);
          
          // If user is an agent, also get agent data
          if (user?.role === 'AGENT' && user?.agent_id) {
            console.log("AuthContext: User is an agent, getting agent data");
            try {
              const agent = await AgentService.getAgentById(user.agent_id);
              console.log("AuthContext: Retrieved agent data:", agent);
              setCurrentAgent(agent);
            } catch (agentError) {
              console.error("AuthContext: Error getting agent data:", agentError);
            }
          }
        } else {
          console.log("AuthContext: No authenticated user found");
        }
      } catch (error) {
        console.error('AuthContext: Auth initialization error:', error);
        setError(error);
      } finally {
        setLoading(false);
        console.log("AuthContext: Authentication initialization completed");
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    console.log("AuthContext: Starting login process for", email);
    try {
      console.log("AuthContext: Calling AuthService.login");
      const user = await AuthService.login(email, password);
      console.log("AuthContext: Login successful, received user data:", user);
      
      // Check if the user object is valid before setting it
      if (user) {
        setCurrentUser(user);
        console.log("AuthContext: User state updated with:", user);
        
        // If user is an agent, also get agent data
        if (user.role === 'AGENT' && user.agent_id) {
          console.log("AuthContext: User is an agent, getting agent data");
          try {
            const agent = await AgentService.getAgentById(user.agent_id);
            console.log("AuthContext: Retrieved agent data:", agent);
            setCurrentAgent(agent);
          } catch (agentError) {
            console.error("AuthContext: Error getting agent data:", agentError);
          }
        }
        
        return user;
      } else {
        // If AuthService.login returns undefined/null but doesn't throw an error
        console.error('AuthContext: Login returned undefined user object');
        throw new Error('Login failed: Invalid user data');
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // If there's an agent logged in, update SIP registration
      if (currentAgent) {
        await AgentService.updateSipRegistration({ registered: false });
      }
      
      await AuthService.logout();
      setCurrentUser(null);
      setCurrentAgent(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const isAgent = () => {
    return currentUser && currentUser.role === 'AGENT';
  };

  const isAdmin = () => {
    return currentUser && currentUser.role === 'ADMIN';
  };

  const isSupervisor = () => {
    return currentUser && currentUser.role === 'SUPERVISOR';
  };

  const value = {
    currentUser,
    currentAgent,
    loading,
    error,
    login,
    logout,
    isAgent,
    isAdmin,
    isSupervisor
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 