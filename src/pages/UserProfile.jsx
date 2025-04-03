import React, { useState } from 'react';
import '../styles/UserProfile.css';

const UserProfile = () => {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(123) 456-7890',
    profilePicture: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUser({ ...user, profilePicture: URL.createObjectURL(file) });
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>User Profile</h2>
        <p>Manage your personal information and preferences.</p>
        <div className="back-link">
          <a href="/settings">Back to Settings</a>
        </div>
      </div>
      
      <div className="profile-content">
        <div className="profile-section profile-picture-section">
          <h3>Profile Photo</h3>
          <div className="profile-picture-container">
            <div className="profile-picture">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" />
              ) : (
                <div className="profile-placeholder">
                  <span>{user.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="profile-picture-controls">
              <label className="upload-button" htmlFor="profile-upload">
                Choose File
              </label>
              <input 
                id="profile-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleProfilePictureChange} 
                style={{ display: 'none' }}
              />
              <p className="upload-help">JPG, GIF or PNG. Max size 800K</p>
            </div>
          </div>
        </div>

        <div className="profile-section user-details-section">
          <h3>Personal Information</h3>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={user.name} 
              onChange={handleInputChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={user.email} 
              onChange={handleInputChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone:</label>
            <input 
              type="text" 
              id="phone" 
              name="phone" 
              value={user.phone} 
              onChange={handleInputChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="Change Password" 
              className="form-control"
            />
            <p className="password-help">Leave blank to keep current password</p>
          </div>
        </div>
      </div>

      <div className="profile-actions">
        <button className="save-btn primary-button">Save Changes</button>
        <button className="cancel-btn secondary-button">Cancel</button>
      </div>
    </div>
  );
};

export default UserProfile; 