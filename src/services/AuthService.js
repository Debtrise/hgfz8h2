import { message } from 'antd';
import apiService from './apiService';

// User Roles
export const ROLES = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  AGENT: 'AGENT',
};

// Role-based access permissions
export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    canAccessAdmin: true,
    canAccessAgent: false,
    canAccessDashboard: true,
    canManageUsers: true,
    canManageFlows: true,
    canAccessConfig: true,
    canAccessLogs: true,
    canAccessRecordings: true,
    canManageCampaigns: true,
  },
  [ROLES.SUPERVISOR]: {
    canAccessAdmin: false,
    canAccessAgent: false,
    canAccessDashboard: true,
    canManageUsers: false,
    canManageFlows: true,
    canAccessConfig: false,
    canAccessLogs: true,
    canAccessRecordings: true,
    canManageCampaigns: true,
  },
  [ROLES.AGENT]: {
    canAccessAdmin: false,
    canAccessAgent: true,
    canAccessDashboard: false,
    canManageUsers: false,
    canManageFlows: false,
    canAccessConfig: false,
    canAccessLogs: false,
    canAccessRecordings: false,
    canManageCampaigns: false,
  },
};

class AuthService {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  async login(username, password) {
    try {
      const response = await apiService.auth.login({ email: username, password });
      const user = response.user;
      this.setSession(user, response.token);
      return user;
    } catch (error) {
      message.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
      throw error;
    }
  }

  setSession(user, token) {
    if (user) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      this.token = token;
      this.user = user;
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      this.token = null;
      this.user = null;
    }
  }

  async logout() {
    try {
      await apiService.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.setSession(null, null);
    }
  }

  isAuthenticated() {
    return !!this.token;
  }

  getUser() {
    return this.user;
  }

  hasPermission(permission) {
    if (!this.user) return false;
    return PERMISSIONS[this.user.role][permission];
  }

  getRole() {
    return this.user?.role;
  }
}

export default new AuthService(); 