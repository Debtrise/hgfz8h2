import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserOutlined,
  PlusOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UpOutlined,
  DownOutlined,
  LockOutlined,
  UnlockOutlined,
  UserAddOutlined,
  TeamOutlined
} from '@ant-design/icons';
import "../styles/new/settings.css";

const UserManagement = () => {
  const navigate = useNavigate();
  
  // Mock roles for the dropdown
  const roles = [
    { id: 1, name: "Administrator", level: 3 },
    { id: 2, name: "Manager", level: 2 },
    { id: 3, name: "Agent", level: 1 },
    { id: 4, name: "Viewer", level: 0 }
  ];
  
  // Mock users data
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Administrator",
      status: "active",
      lastLogin: "2023-06-15T14:30:00Z",
      department: "Operations"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "Manager",
      status: "active",
      lastLogin: "2023-06-16T09:45:00Z",
      department: "Sales"
    },
    {
      id: 3,
      name: "Michael Johnson",
      email: "michael.johnson@example.com",
      role: "Agent",
      status: "active",
      lastLogin: "2023-06-16T11:20:00Z",
      department: "Support"
    },
    {
      id: 4,
      name: "Emily Williams",
      email: "emily.williams@example.com",
      role: "Agent",
      status: "inactive",
      lastLogin: "2023-06-10T15:10:00Z",
      department: "Marketing"
    },
    {
      id: 5,
      name: "Robert Brown",
      email: "robert.brown@example.com",
      role: "Viewer",
      status: "active",
      lastLogin: "2023-06-14T08:30:00Z",
      department: "Finance"
    }
  ]);
  
  // Form for adding/editing users
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    email: "",
    role: "Agent",
    status: "active",
    department: ""
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const handleBackButton = () => {
    navigate('/settings');
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleAddUser = () => {
    setFormData({
      id: null,
      name: "",
      email: "",
      role: "Agent",
      status: "active",
      department: ""
    });
    setIsEditing(false);
    setShowForm(true);
  };
  
  const handleEditUser = (user) => {
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      department: user.department
    });
    setIsEditing(true);
    setShowForm(true);
  };
  
  const handleDeleteUser = (id) => {
    // Show confirmation dialog
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(user => user.id !== id));
    }
  };
  
  const handlePromoteUser = (id) => {
    setUsers(users.map(user => {
      if (user.id === id) {
        // Find the current role index and promote if possible
        const currentRoleIndex = roles.findIndex(role => role.name === user.role);
        if (currentRoleIndex > 0) { // If not already at the highest role
          return { ...user, role: roles[currentRoleIndex - 1].name };
        }
      }
      return user;
    }));
  };
  
  const handleDemoteUser = (id) => {
    setUsers(users.map(user => {
      if (user.id === id) {
        // Find the current role index and demote if possible
        const currentRoleIndex = roles.findIndex(role => role.name === user.role);
        if (currentRoleIndex < roles.length - 1) { // If not already at the lowest role
          return { ...user, role: roles[currentRoleIndex + 1].name };
        }
      }
      return user;
    }));
  };
  
  const handleToggleStatus = (id) => {
    setUsers(users.map(user => {
      if (user.id === id) {
        return { 
          ...user, 
          status: user.status === 'active' ? 'inactive' : 'active' 
        };
      }
      return user;
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isEditing) {
      // Update existing user
      setUsers(users.map(user => 
        user.id === formData.id ? { ...user, ...formData } : user
      ));
    } else {
      // Add new user with generated ID and current date for lastLogin
      const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        ...formData,
        lastLogin: new Date().toISOString()
      };
      setUsers([...users, newUser]);
    }
    
    setShowForm(false);
  };
  
  // Filter users based on search query and filters
  const filteredUsers = users.filter(user => {
    // Check if the user matches the search query
    const matchesSearch = searchQuery === "" || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check if the user matches the role filter
    const matchesRole = filterRole === "all" || user.role === filterRole;
    
    // Check if the user matches the status filter
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });
  
  // Format date for readable display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="settings-page">
      <button 
        className="button-secondary" 
        onClick={handleBackButton}
        style={{ marginBottom: 'var(--space-md)' }}
      >
        Back to Settings
      </button>
      
      <div className="feature-card">
        <div className="feature-title">
          <TeamOutlined className="icon" />
          User Management
        </div>
        <div className="feature-description">
          Add, edit, and manage users and their permissions within the system.
        </div>
      </div>

      <div className="settings-form">
        <div className="settings-form-header">
          <h3>System Users</h3>
          <button 
            className="button-blue" 
            onClick={handleAddUser}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <UserAddOutlined /> Add User
          </button>
        </div>
        
        <div className="filter-controls">
          <div className="search-box">
            <SearchOutlined />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-selects">
            <div className="filter-select-container">
              <label>Role:</label>
              <select 
                value={filterRole} 
                onChange={(e) => setFilterRole(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Roles</option>
                {roles.map(role => (
                  <option key={role.id} value={role.name}>{role.name}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-select-container">
              <label>Status:</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
        
        {showForm && (
          <div className="user-form">
            <form onSubmit={handleSubmit}>
              <div className="form-header">
                <h3>{isEditing ? "Edit User" : "Add New User"}</h3>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="close-button"
                >
                  <CloseOutlined />
                </button>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    className="form-control" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    className="form-control" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select 
                    id="role" 
                    name="role" 
                    className="form-control" 
                    value={formData.role} 
                    onChange={handleInputChange}
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <input 
                    type="text" 
                    id="department" 
                    name="department" 
                    className="form-control" 
                    value={formData.department} 
                    onChange={handleInputChange} 
                    placeholder="Sales, Support, etc."
                  />
                </div>
                
                <div className="form-group status-group">
                  <label>Status</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="status" 
                        value="active" 
                        checked={formData.status === "active"} 
                        onChange={handleInputChange} 
                      />
                      Active
                    </label>
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="status" 
                        value="inactive" 
                        checked={formData.status === "inactive"} 
                        onChange={handleInputChange} 
                      />
                      Inactive
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="button-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="button-blue">
                  {isEditing ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="users-list">
          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <UserOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
              <p>No users found matching your criteria</p>
              <button className="button-blue" onClick={handleAddUser}>Add Your First User</button>
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className={user.status === 'inactive' ? 'inactive-row' : ''}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <div className="user-name">{user.name}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="role-badge">{user.role}</div>
                    </td>
                    <td>{user.department}</td>
                    <td>
                      <div className="status-badge" data-status={user.status}>
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </div>
                    </td>
                    <td className="last-login">
                      {formatDate(user.lastLogin)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="icon-button" 
                          onClick={() => handleEditUser(user)}
                          title="Edit User"
                        >
                          <EditOutlined />
                        </button>
                        <button 
                          className="icon-button" 
                          onClick={() => handleToggleStatus(user.id)}
                          title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                        >
                          {user.status === 'active' ? <LockOutlined /> : <UnlockOutlined />}
                        </button>
                        <button 
                          className="icon-button" 
                          onClick={() => handlePromoteUser(user.id)}
                          title="Promote User"
                          disabled={user.role === roles[0].name}
                        >
                          <UpOutlined />
                        </button>
                        <button 
                          className="icon-button" 
                          onClick={() => handleDemoteUser(user.id)}
                          title="Demote User"
                          disabled={user.role === roles[roles.length - 1].name}
                        >
                          <DownOutlined />
                        </button>
                        <button 
                          className="icon-button delete" 
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete User"
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <div className="settings-form" style={{ marginTop: '24px' }}>
        <div className="settings-form-header">
          <h3>Role Permissions</h3>
        </div>
        
        <p className="settings-description">
          Define what each role can access and modify in the system.
        </p>
        
        <div className="role-permissions">
          <table className="permissions-table">
            <thead>
              <tr>
                <th>Feature</th>
                {roles.map(role => (
                  <th key={role.id}>{role.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Dashboard Access</td>
                <td><span className="checkmark">✓</span></td>
                <td><span className="checkmark">✓</span></td>
                <td><span className="checkmark">✓</span></td>
                <td><span className="checkmark">✓</span></td>
              </tr>
              <tr>
                <td>Manage Campaigns</td>
                <td><span className="checkmark">✓</span></td>
                <td><span className="checkmark">✓</span></td>
                <td><span className="checkmark">✓</span></td>
                <td><span className="x-mark">✗</span></td>
              </tr>
              <tr>
                <td>Manage Leads</td>
                <td><span className="checkmark">✓</span></td>
                <td><span className="checkmark">✓</span></td>
                <td><span className="checkmark">✓</span></td>
                <td><span className="x-mark">✗</span></td>
              </tr>
              <tr>
                <td>Manage DIDs</td>
                <td><span className="checkmark">✓</span></td>
                <td><span className="checkmark">✓</span></td>
                <td><span className="x-mark">✗</span></td>
                <td><span className="x-mark">✗</span></td>
              </tr>
              <tr>
                <td>Edit System Settings</td>
                <td><span className="checkmark">✓</span></td>
                <td><span className="x-mark">✗</span></td>
                <td><span className="x-mark">✗</span></td>
                <td><span className="x-mark">✗</span></td>
              </tr>
              <tr>
                <td>Manage Users</td>
                <td><span className="checkmark">✓</span></td>
                <td><span className="x-mark">✗</span></td>
                <td><span className="x-mark">✗</span></td>
                <td><span className="x-mark">✗</span></td>
              </tr>
              <tr>
                <td>API Access</td>
                <td><span className="checkmark">✓</span></td>
                <td><span className="checkmark">✓</span></td>
                <td><span className="x-mark">✗</span></td>
                <td><span className="x-mark">✗</span></td>
              </tr>
              <tr>
                <td>View Reports</td>
                <td><span className="checkmark">✓</span></td>
                <td><span className="checkmark">✓</span></td>
                <td><span className="checkmark">✓</span></td>
                <td><span className="checkmark">✓</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement; 