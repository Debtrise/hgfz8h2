import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './styles/EmailTemplates.css';

const EmailTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch templates from backend
    // For now, using mock data
    const mockTemplates = [
      {
        id: 1,
        name: 'Welcome Email',
        description: 'Welcome email for new users',
        lastModified: '2024-03-20',
        createdBy: 'John Doe'
      },
      {
        id: 2,
        name: 'Newsletter Template',
        description: 'Monthly newsletter template',
        lastModified: '2024-03-19',
        createdBy: 'Jane Smith'
      }
    ];
    setTemplates(mockTemplates);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading">Loading templates...</div>;
  }

  return (
    <div className="email-templates-container">
      <div className="email-templates-header">
        <h1>Email Templates</h1>
        <Link to="/email-templates/new" className="create-template-btn">
          Create New Template
        </Link>
      </div>

      <div className="templates-grid">
        {templates.map((template) => (
          <div key={template.id} className="template-card">
            <div className="template-card-header">
              <h3>{template.name}</h3>
              <div className="template-actions">
                <Link to={`/email-templates/${template.id}`} className="edit-btn">
                  Edit
                </Link>
                <Link to={`/email-templates/${template.id}/detail`} className="preview-btn">
                  Preview
                </Link>
              </div>
            </div>
            <p className="template-description">{template.description}</p>
            <div className="template-meta">
              <span>Last modified: {template.lastModified}</span>
              <span>Created by: {template.createdBy}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmailTemplates; 