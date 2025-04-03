import React, { createContext, useState, useEffect, useContext } from 'react';
import forthCRMService from '../services/ForthCRMService';
import irsLogicsService from '../services/IRSLogicsService';

// Create context
const IntegrationsContext = createContext();

/**
 * Provider component for integrations
 */
export const IntegrationsProvider = ({ children }) => {
  // State for Forth CRM integration
  const [forthCRMStatus, setForthCRMStatus] = useState({
    connected: false,
    lastSync: null,
    syncInProgress: false,
    error: null
  });

  // State for IRS Logics integration
  const [irsLogicsStatus, setIRSLogicsStatus] = useState({
    connected: false,
    lastSync: null,
    syncInProgress: false,
    error: null
  });

  // Check connection status on mount
  useEffect(() => {
    checkForthCRMConnection();
    checkIRSLogicsConnection();
  }, []);

  /**
   * Check Forth CRM connection
   */
  const checkForthCRMConnection = async () => {
    try {
      if (forthCRMService.hasCredentials()) {
        const isConnected = await forthCRMService.testConnection();
        setForthCRMStatus(prev => ({
          ...prev,
          connected: isConnected,
          error: isConnected ? null : 'Connection test failed'
        }));
      } else {
        setForthCRMStatus(prev => ({
          ...prev,
          connected: false
        }));
      }
    } catch (error) {
      console.error('Error checking Forth CRM connection:', error);
      setForthCRMStatus(prev => ({
        ...prev,
        connected: false,
        error: error.message
      }));
    }
  };

  /**
   * Check IRS Logics connection
   */
  const checkIRSLogicsConnection = async () => {
    try {
      if (irsLogicsService.hasCredentials()) {
        const isConnected = await irsLogicsService.testConnection();
        setIRSLogicsStatus(prev => ({
          ...prev,
          connected: isConnected,
          error: isConnected ? null : 'Connection test failed'
        }));
      } else {
        setIRSLogicsStatus(prev => ({
          ...prev,
          connected: false
        }));
      }
    } catch (error) {
      console.error('Error checking IRS Logics connection:', error);
      setIRSLogicsStatus(prev => ({
        ...prev,
        connected: false,
        error: error.message
      }));
    }
  };

  /**
   * Connect to Forth CRM
   * @param {string} apiKey - API key
   * @param {string} apiSecret - API secret
   * @returns {Promise<boolean>} - Promise that resolves to true if successful
   */
  const connectForthCRM = async (apiKey, apiSecret) => {
    try {
      setForthCRMStatus(prev => ({
        ...prev,
        error: null
      }));

      forthCRMService.setCredentials(apiKey, apiSecret);
      const isConnected = await forthCRMService.testConnection();

      if (isConnected) {
        setForthCRMStatus(prev => ({
          ...prev,
          connected: true,
          lastSync: new Date().toISOString()
        }));
        return true;
      } else {
        forthCRMService.clearCredentials();
        setForthCRMStatus(prev => ({
          ...prev,
          connected: false,
          error: 'Connection test failed. Please check your credentials.'
        }));
        return false;
      }
    } catch (error) {
      console.error('Error connecting to Forth CRM:', error);
      forthCRMService.clearCredentials();
      setForthCRMStatus(prev => ({
        ...prev,
        connected: false,
        error: error.message
      }));
      return false;
    }
  };

  /**
   * Connect to IRS Logics
   * @param {string} apiKey - API key
   * @param {string} apiSecret - API secret
   * @returns {Promise<boolean>} - Promise that resolves to true if successful
   */
  const connectIRSLogics = async (apiKey, apiSecret) => {
    try {
      setIRSLogicsStatus(prev => ({
        ...prev,
        error: null
      }));

      irsLogicsService.setCredentials(apiKey, apiSecret);
      const isConnected = await irsLogicsService.testConnection();

      if (isConnected) {
        setIRSLogicsStatus(prev => ({
          ...prev,
          connected: true,
          lastSync: new Date().toISOString()
        }));
        return true;
      } else {
        irsLogicsService.clearCredentials();
        setIRSLogicsStatus(prev => ({
          ...prev,
          connected: false,
          error: 'Connection test failed. Please check your credentials.'
        }));
        return false;
      }
    } catch (error) {
      console.error('Error connecting to IRS Logics:', error);
      irsLogicsService.clearCredentials();
      setIRSLogicsStatus(prev => ({
        ...prev,
        connected: false,
        error: error.message
      }));
      return false;
    }
  };

  /**
   * Disconnect from Forth CRM
   */
  const disconnectForthCRM = () => {
    forthCRMService.clearCredentials();
    setForthCRMStatus({
      connected: false,
      lastSync: null,
      syncInProgress: false,
      error: null
    });
  };

  /**
   * Disconnect from IRS Logics
   */
  const disconnectIRSLogics = () => {
    irsLogicsService.clearCredentials();
    setIRSLogicsStatus({
      connected: false,
      lastSync: null,
      syncInProgress: false,
      error: null
    });
  };

  /**
   * Sync data with Forth CRM
   * @param {Object} options - Sync options
   * @returns {Promise<boolean>} - Promise that resolves to true if successful
   */
  const syncForthCRM = async (options = {}) => {
    try {
      if (!forthCRMStatus.connected) {
        throw new Error('Not connected to Forth CRM');
      }

      setForthCRMStatus(prev => ({
        ...prev,
        syncInProgress: true,
        error: null
      }));

      // Implement sync logic here based on options
      // For example:
      const { contacts = false, leads = false, campaigns = false, tasks = false, callLogs = false } = options;

      // Sync contacts if enabled
      if (contacts) {
        // Implementation would go here
        // await forthCRMService.syncContacts(contactsData);
      }

      // Sync leads if enabled
      if (leads) {
        // Implementation would go here
        // await forthCRMService.syncLeads(leadsData);
      }

      // Update status after successful sync
      setForthCRMStatus(prev => ({
        ...prev,
        syncInProgress: false,
        lastSync: new Date().toISOString()
      }));

      return true;
    } catch (error) {
      console.error('Error syncing with Forth CRM:', error);
      setForthCRMStatus(prev => ({
        ...prev,
        syncInProgress: false,
        error: error.message
      }));
      return false;
    }
  };

  /**
   * Sync data with IRS Logics
   * @param {Object} options - Sync options
   * @returns {Promise<boolean>} - Promise that resolves to true if successful
   */
  const syncIRSLogics = async (options = {}) => {
    try {
      if (!irsLogicsStatus.connected) {
        throw new Error('Not connected to IRS Logics');
      }

      setIRSLogicsStatus(prev => ({
        ...prev,
        syncInProgress: true,
        error: null
      }));

      // Implement sync logic here based on options
      // For example:
      const { taxDocuments = false, clientRecords = false, filingStatuses = false } = options;

      // Sync tax documents if enabled
      if (taxDocuments) {
        // Implementation would go here
        // await irsLogicsService.syncTaxDocuments(documentsData);
      }

      // Sync client records if enabled
      if (clientRecords) {
        // Implementation would go here
        // await irsLogicsService.syncClientRecords(clientsData);
      }

      // Update status after successful sync
      setIRSLogicsStatus(prev => ({
        ...prev,
        syncInProgress: false,
        lastSync: new Date().toISOString()
      }));

      return true;
    } catch (error) {
      console.error('Error syncing with IRS Logics:', error);
      setIRSLogicsStatus(prev => ({
        ...prev,
        syncInProgress: false,
        error: error.message
      }));
      return false;
    }
  };

  // Context value
  const value = {
    forthCRM: {
      ...forthCRMStatus,
      connect: connectForthCRM,
      disconnect: disconnectForthCRM,
      sync: syncForthCRM,
      service: forthCRMService
    },
    irsLogics: {
      ...irsLogicsStatus,
      connect: connectIRSLogics,
      disconnect: disconnectIRSLogics,
      sync: syncIRSLogics,
      service: irsLogicsService
    }
  };

  return (
    <IntegrationsContext.Provider value={value}>
      {children}
    </IntegrationsContext.Provider>
  );
};

/**
 * Custom hook to use the integrations context
 */
export const useIntegrations = () => {
  const context = useContext(IntegrationsContext);
  if (context === undefined) {
    throw new Error('useIntegrations must be used within an IntegrationsProvider');
  }
  return context;
};

export default IntegrationsContext; 