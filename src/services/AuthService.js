import { message } from 'antd';

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
    canManageRelationships: true,
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
    canManageRelationships: true,
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
    canManageRelationships: false,
  },
};

class AuthService {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  async login(username, password) {
    try {
      // In a real app, this would be an API call
      // Simulated authentication
      if (username === 'admin' && password === 'admin') {
        const user = {
          id: '1',
          username: 'admin',
          role: ROLES.ADMIN,
          name: 'Admin User',
        };
        this.setSession(user);
        return user;
      } else if (username === 'supervisor' && password === 'supervisor') {
        const user = {
          id: '2',
          username: 'supervisor',
          role: ROLES.SUPERVISOR,
          name: 'Supervisor User',
        };
        this.setSession(user);
        return user;
      } else if (username === 'agent' && password === 'agent') {
        const user = {
          id: '3',
          username: 'agent',
          role: ROLES.AGENT,
          name: 'Agent User',
        };
        this.setSession(user);
        return user;
      }
      throw new Error('Invalid credentials');
    } catch (error) {
      message.error(error.message);
      throw error;
    }
  }

  setSession(user) {
    if (user) {
      localStorage.setItem('authToken', 'dummy-jwt-token');
      localStorage.setItem('user', JSON.stringify(user));
      this.token = 'dummy-jwt-token';
      this.user = user;
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      this.token = null;
      this.user = null;
    }
  }

  logout() {
    this.setSession(null);
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