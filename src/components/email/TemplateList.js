import React, { useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './styles/TemplateList.css';

const TemplateList = ({ templates, onSelect, onCreateNew }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'popular':
        return b.usageCount - a.usageCount;
      default:
        return 0;
    }
  });

  return (
    <div className="template-list">
      <div className="template-header">
        <div className="template-title">
          <h1>Email Templates</h1>
          <p>Create and manage your email templates</p>
        </div>
        <button className="create-template-btn" onClick={onCreateNew}>
          Create New Template
        </button>
      </div>

      <div className="template-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="view-controls">
          <div className="view-mode">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>

          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recent">Recently Updated</option>
            <option value="name">Name</option>
            <option value="popular">Most Used</option>
          </select>
        </div>
      </div>

      <TransitionGroup className={`template-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
        {sortedTemplates.map((template) => (
          <CSSTransition
            key={template.id}
            timeout={200}
            classNames="fade"
          >
            <div
              className="template-card"
              onClick={() => onSelect(template)}
            >
              <div className="template-preview">
                <img
                  src={template.thumbnail || '/default-template-thumbnail.png'}
                  alt={template.name}
                  className="template-thumbnail"
                />
                <div className="template-overlay">
                  <button className="preview-btn">Preview</button>
                  <button className="edit-btn">Edit</button>
                </div>
              </div>
              <div className="template-info">
                <h3>{template.name}</h3>
                <p>{template.description}</p>
                <div className="template-meta">
                  <span className="template-date">
                    Updated {new Date(template.updatedAt).toLocaleDateString()}
                  </span>
                  <span className="template-usage">
                    Used {template.usageCount} times
                  </span>
                </div>
                <div className="template-tags">
                  {template.tags?.map((tag, index) => (
                    <span key={index} className="template-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CSSTransition>
        ))}
      </TransitionGroup>

      {sortedTemplates.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📧</div>
          <h2>No templates found</h2>
          <p>Create your first email template to get started</p>
          <button className="create-template-btn" onClick={onCreateNew}>
            Create New Template
          </button>
        </div>
      )}
    </div>
  );
};

export default TemplateList; 