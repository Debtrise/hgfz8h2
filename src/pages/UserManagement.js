import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './UserManagement.css';
import LoadingSpinner from '../components/LoadingSpinner';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    status: 'active',
    password: '',
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.users.getAll();
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open modal for creating a new user
  const handleCreateUser = () => {
    setCurrentUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'user',
      status: 'active',
      password: '',
    });
    setShowUserModal(true);
  };

  // Open modal for editing an existing user
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      role: user.role || 'user',
      status: user.status || 'active',
      password: '', // Don't populate password for security
    });
    setShowUserModal(true);
  };

  // Handle user form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (currentUser) {
        // Update existing user
        await apiService.users.update(currentUser.id, formData);
      } else {
        // Create new user
        await apiService.users.create(formData);
      }
      
      // Refresh user list
      await fetchUsers();
      setShowUserModal(false);
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.response?.data?.message || 'Failed to save user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiService.users.delete(userId);
      await fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle user status toggle
  const handleToggleStatus = async (userId, currentStatus) => {
    setLoading(true);
    setError(null);

    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await apiService.users.toggleStatus(userId, newStatus);
      await fetchUsers();
    } catch (err) {
      console.error('Error toggling user status:', err);
      setError('Failed to update user status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render user modal
  const renderUserModal = () => {
    if (!showUserModal) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>{currentUser ? 'Edit User' : 'Create New User'}</h2>
            <button 
              className="close-button"
              onClick={() => setShowUserModal(false)}
            >
              &times;
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">
                {currentUser ? 'Password (leave blank to keep current)' : 'Password'}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required={!currentUser}
                minLength={6}
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setShowUserModal(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Saving...' : currentUser ? 'Update User' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Render loading state
  if (loading && users.length === 0) {
    return (
      <div className="user-management-container">
        <LoadingSpinner size="large" text="Loading users..." />
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <div className="page-header">
        <h1>User Management</h1>
        <button 
          className="create-button"
          onClick={handleCreateUser}
        >
          Create New User
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
          <button 
            className="dismiss-button"
            onClick={() => setError(null)}
          >
            &times;
          </button>
        </div>
      )}
      
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map(user => (
                <tr key={user.id}>
                  <td>{`${user.firstName} ${user.lastName}`}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.status}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button
                      className="edit-button"
                      onClick={() => handleEditUser(user)}
                      title="Edit User"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className={`toggle-button ${user.status === 'active' ? 'deactivate' : 'activate'}`}
                      onClick={() => handleToggleStatus(user.id, user.status)}
                      title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                    >
                      <i className={`fas fa-${user.status === 'active' ? 'ban' : 'check'}`}></i>
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteUser(user.id)}
                      title="Delete User"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  No users found. Create a new user to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {renderUserModal()}
    </div>
  );
};

export default UserManagement; 