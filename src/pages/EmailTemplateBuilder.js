import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './styles/EmailTemplateBuilder.css';

// Import drag and drop components
import DraggableComponent from '../components/email/DraggableComponent';
import DropZone from '../components/email/DropZone';
import EmailPreview from '../components/email/EmailPreview';

const EmailTemplateBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState({
    name: '',
    description: '',
    subject: '',
    content: [],
    variables: [],
    from: 'noreply@example.com',
    to: '{{recipient.email}}',
    socialLinks: [],
    footerText: 'Unsubscribe | Privacy Policy | View in Browser'
  });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedComponentCategory, setSelectedComponentCategory] = useState('basic');

  // Component categories
  const componentCategories = {
    basic: [
      { type: 'text', label: 'Text Block', description: 'Simple text content' },
      { type: 'heading', label: 'Heading', description: 'Section title' },
      { type: 'image', label: 'Image', description: 'Image with optional caption' },
      { type: 'button', label: 'Button', description: 'Call to action button' },
      { type: 'spacer', label: 'Spacer', description: 'Add vertical space' },
      { type: 'divider', label: 'Divider', description: 'Horizontal line separator' }
    ],
    advanced: [
      { type: 'quote', label: 'Quote', description: 'Highlighted quote text' },
      { type: 'list', label: 'List', description: 'Bulleted or numbered list' },
      { type: 'table', label: 'Table', description: 'Tabular data layout' },
      { type: 'video', label: 'Video', description: 'Embedded video content' }
    ],
    layout: [
      { type: 'container', label: 'Container', description: 'Content container' },
      { type: 'columns', label: 'Columns', description: '2-column layout' },
      { type: 'section', label: 'Section', description: 'Content section with background' }
    ],
    social: [
      { type: 'social', label: 'Social Links', description: 'Social media links' },
      { type: 'footer', label: 'Footer', description: 'Email footer section' },
      { type: 'header', label: 'Header', description: 'Email header section' }
    ]
  };

  useEffect(() => {
    if (id) {
      // TODO: Fetch template data from backend
      // For now, using mock data
      const mockTemplate = {
        id,
        name: 'Welcome Email',
        description: 'Welcome email for new users',
        subject: 'Welcome to Our Platform!',
        content: [],
        variables: ['{{user.name}}', '{{user.email}}'],
        from: 'noreply@example.com',
        to: '{{recipient.email}}',
        socialLinks: [],
        footerText: 'Unsubscribe | Privacy Policy | View in Browser'
      };
      setTemplate(mockTemplate);
    }
    setLoading(false);
  }, [id]);

  const handleSave = async () => {
    // TODO: Implement save functionality
    console.log('Saving template:', template);
    navigate('/email-templates');
  };

  const handleDrop = (item, index) => {
    const newContent = [...template.content];
    
    // Add default styling and content based on component type
    const newItem = {
      ...item,
      style: getDefaultStyleForComponent(item.type),
      ...getDefaultContentForComponent(item.type)
    };
    
    newContent.splice(index, 0, newItem);
    setTemplate({ ...template, content: newContent });
  };

  const handleRemove = (index) => {
    const newContent = [...template.content];
    newContent.splice(index, 1);
    setTemplate({ ...template, content: newContent });
  };

  const handleUpdate = (index, updates) => {
    if (index === null) {
      // Update the entire template
      setTemplate(updates);
    } else if (typeof index === 'string') {
      // Update a specific field in the template
      setTemplate({ ...template, [index]: updates });
    } else {
      // Update a specific component
      const newContent = [...template.content];
      newContent[index] = { ...newContent[index], ...updates };
      setTemplate({ ...template, content: newContent });
    }
  };

  // Helper function to get default styling for component types
  const getDefaultStyleForComponent = (type) => {
    switch (type) {
      case 'button':
        return { 
          backgroundColor: '#0066cc', 
          color: '#ffffff', 
          padding: '10px 20px',
          textAlign: 'center',
          borderRadius: '4px',
          fontWeight: 'bold'
        };
      case 'heading':
        return { fontSize: '24px', fontWeight: 'bold', color: '#333333' };
      case 'divider':
        return { borderTop: '1px solid #e0e0e0', margin: '20px 0' };
      case 'spacer':
        return { height: '20px' };
      default:
        return { color: '#333333', fontSize: '16px' };
    }
  };

  // Helper function to get default content for component types
  const getDefaultContentForComponent = (type) => {
    switch (type) {
      case 'text':
        return { content: 'Enter your text here. You can edit this text to add your content.' };
      case 'heading':
        return { content: 'Heading Text' };
      case 'button':
        return { content: 'Click Here', url: 'https://example.com' };
      case 'list':
        return { items: ['Item 1', 'Item 2', 'Item 3'] };
      case 'quote':
        return { content: 'This is a quote. You can edit this text.' };
      case 'table':
        return { rows: [['Header 1', 'Header 2'], ['Cell 1', 'Cell 2'], ['Cell 3', 'Cell 4']] };
      case 'image':
        return { alt: 'Image description', caption: 'Image caption text' };
      default:
        return {};
    }
  };

  if (loading) {
    return <div className="loading">Loading template...</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="email-template-builder">
        <div className="builder-header">
          <div className="header-left">
            <input
              type="text"
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              placeholder="Template Name"
              className="template-name-input"
            />
            <input
              type="text"
              value={template.subject}
              onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
              placeholder="Email Subject"
              className="template-subject-input"
            />
          </div>
          <div className="header-right">
            <button
              className="preview-btn"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              {isPreviewMode ? 'Edit' : 'Preview'}
            </button>
            <button className="save-btn" onClick={handleSave}>
              Save Template
            </button>
          </div>
        </div>

        {isPreviewMode ? (
          <div className="preview-mode">
            <EmailPreview template={template} onUpdate={handleUpdate} />
          </div>
        ) : (
          <div className="builder-content">
            <div className="components-sidebar">
              <h3>Components</h3>
              <div className="component-categories">
                {Object.keys(componentCategories).map(category => (
                  <button
                    key={category}
                    className={`category-btn ${selectedComponentCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedComponentCategory(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
              <div className="component-list">
                {componentCategories[selectedComponentCategory].map((component, index) => (
                  <DraggableComponent 
                    key={index}
                    type={component.type} 
                    label={component.label} 
                    description={component.description}
                  />
                ))}
              </div>
            </div>

            <div className="drop-zone-container">
              <DropZone
                content={template.content}
                onDrop={handleDrop}
                onRemove={handleRemove}
                onUpdate={handleUpdate}
              />
            </div>

            <div className="variables-sidebar">
              <h3>Variables</h3>
              <p className="sidebar-description">Drag these variables into your template content</p>
              {template.variables.map((variable, index) => (
                <div key={index} className="variable-item">
                  {variable}
                </div>
              ))}
              <div className="variables-actions">
                <button className="add-variable-btn">
                  Add Custom Variable
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default EmailTemplateBuilder; 