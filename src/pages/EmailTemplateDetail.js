import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import EmailPreview from '../components/email/EmailPreview';
import './styles/EmailTemplateDetail.css';

const EmailTemplateDetail = () => {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch template data from backend
    // For now, using mock data
    const mockTemplate = {
      id,
      name: 'Welcome Email',
      description: 'Welcome email for new users',
      subject: 'Welcome to Our Platform!',
      content: [
        {
          type: 'text',
          label: 'Text Block',
          content: 'Welcome to our platform! We\'re excited to have you on board.'
        },
        {
          type: 'button',
          label: 'Button',
          text: 'Get Started',
          url: 'https://example.com/get-started'
        }
      ],
      variables: ['{{user.name}}', '{{user.email}}'],
      lastModified: '2024-03-20',
      createdBy: 'John Doe'
    };
    setTemplate(mockTemplate);
    setLoading(false);
  }, [id]);

  if (loading) {
    return <div className="loading">Loading template details...</div>;
  }

  if (!template) {
    return <div className="error">Template not found</div>;
  }

  return (
    <div className="email-template-detail">
      <div className="detail-header">
        <div className="header-left">
          <h1>{template.name}</h1>
          <p className="description">{template.description}</p>
        </div>
        <div className="header-right">
          <Link to={`/email-templates/${id}`} className="edit-btn">
            Edit Template
          </Link>
        </div>
      </div>

      <div className="detail-content">
        <div className="template-info">
          <h2>Template Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Subject</label>
              <span>{template.subject}</span>
            </div>
            <div className="info-item">
              <label>Last Modified</label>
              <span>{template.lastModified}</span>
            </div>
            <div className="info-item">
              <label>Created By</label>
              <span>{template.createdBy}</span>
            </div>
          </div>

          <div className="variables-section">
            <h2>Available Variables</h2>
            <div className="variables-list">
              {template.variables.map((variable, index) => (
                <div key={index} className="variable-item">
                  {variable}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="template-preview">
          <h2>Preview</h2>
          <EmailPreview template={template} />
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateDetail; 