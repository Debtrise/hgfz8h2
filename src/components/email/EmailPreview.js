import React, { useState, useEffect } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './styles/EmailPreview.css';

const DraggableItem = ({ item, index, onDragStart, onDragEnd, onDrop, onUpdate }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'EMAIL_COMPONENT',
    item: { ...item, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const didDrop = monitor.didDrop();
      if (!didDrop) {
        onDragEnd(item);
      }
    },
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'EMAIL_COMPONENT',
    drop: (draggedItem) => {
      if (draggedItem.index !== index) {
        onDrop(draggedItem.index, index);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={(node) => {
        drag(drop(node));
      }}
      className={`preview-item ${isDragging ? 'dragging' : ''} ${isOver ? 'is-over' : ''}`}
      onClick={() => onUpdate(index)}
    >
      {renderPreviewContent(item, index)}
    </div>
  );
};

const EmailPreview = ({ template, onUpdate }) => {
  const [activeComponent, setActiveComponent] = useState(null);
  const [customizationPanel, setCustomizationPanel] = useState(false);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  useEffect(() => {
    // Save initial state for undo
    setUndoStack([template]);
  }, []);

  const handleComponentClick = (index) => {
    setActiveComponent(index);
    setCustomizationPanel(true);
  };

  const handleCustomizationUpdate = (index, updates) => {
    // Save current state for undo
    setUndoStack([...undoStack, template]);
    setRedoStack([]);
    
    onUpdate(index, updates);
    setCustomizationPanel(false);
  };

  const handleUndo = () => {
    if (undoStack.length > 1) {
      const previousState = undoStack[undoStack.length - 2];
      setRedoStack([...redoStack, template]);
      setUndoStack(undoStack.slice(0, -1));
      onUpdate(null, previousState);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack([...undoStack, nextState]);
      setRedoStack(redoStack.slice(0, -1));
      onUpdate(null, nextState);
    }
  };

  const handleDragEnd = (item) => {
    // Handle drag end logic
  };

  const handleDrop = (fromIndex, toIndex) => {
    const newContent = [...template.content];
    const [movedItem] = newContent.splice(fromIndex, 1);
    newContent.splice(toIndex, 0, movedItem);
    onUpdate(null, { ...template, content: newContent });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`email-preview ${isMobilePreview ? 'mobile-preview' : ''}`}>
        <div className="preview-toolbar">
          <div className="toolbar-group">
            <button
              className={`toolbar-btn ${isMobilePreview ? 'active' : ''}`}
              onClick={() => setIsMobilePreview(!isMobilePreview)}
            >
              {isMobilePreview ? 'Desktop' : 'Mobile'} Preview
            </button>
            <button
              className={`toolbar-btn ${showGrid ? 'active' : ''}`}
              onClick={() => setShowGrid(!showGrid)}
            >
              {showGrid ? 'Hide' : 'Show'} Grid
            </button>
          </div>
          <div className="toolbar-group">
            <button
              className="toolbar-btn"
              onClick={handleUndo}
              disabled={undoStack.length <= 1}
            >
              Undo
            </button>
            <button
              className="toolbar-btn"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
            >
              Redo
            </button>
          </div>
        </div>

        <div className="preview-header">
          <div className="preview-subject">
            <span>Subject:</span>
            <input
              type="text"
              value={template.subject || ''}
              onChange={(e) => onUpdate('subject', e.target.value)}
              placeholder="Enter email subject"
            />
          </div>
          <div className="preview-meta">
            <div className="preview-meta-item">
              <span>From:</span>
              <input
                type="text"
                value={template.from || 'noreply@example.com'}
                onChange={(e) => onUpdate('from', e.target.value)}
              />
            </div>
            <div className="preview-meta-item">
              <span>To:</span>
              <input
                type="text"
                value={template.to || '{{recipient.email}}'}
                onChange={(e) => onUpdate('to', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={`preview-content ${showGrid ? 'show-grid' : ''}`}>
          <TransitionGroup>
            {template.content.map((item, index) => (
              <CSSTransition
                key={index}
                timeout={200}
                classNames="fade"
              >
                <DraggableItem
                  item={item}
                  index={index}
                  onDragStart={() => {}}
                  onDragEnd={handleDragEnd}
                  onDrop={handleDrop}
                  onUpdate={handleComponentClick}
                />
              </CSSTransition>
            ))}
          </TransitionGroup>
        </div>

        <div className="preview-footer">
          <div className="footer-content">
            <div className="social-links">
              {template.socialLinks?.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  className="social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.icon}
                </a>
              ))}
            </div>
            <p>{template.footerText || 'This is a preview of your email template'}</p>
          </div>
        </div>

        {activeComponent !== null && customizationPanel && (
          <div className="customization-panel">
            {renderCustomizationOptions(template.content[activeComponent], activeComponent)}
          </div>
        )}
      </div>
    </DndProvider>
  );
};

const renderPreviewContent = (item, index) => {
  switch (item.type) {
    case 'text':
      return (
        <div className="preview-text" style={item.style}>
          <p>{item.content || 'Sample text content'}</p>
        </div>
      );
    case 'heading':
      return (
        <div className="preview-text" style={item.style}>
          <h1>{item.content || 'Heading'}</h1>
        </div>
      );
    case 'quote':
      return (
        <div className="preview-text" style={item.style}>
          <blockquote>{item.content || 'Quote text'}</blockquote>
        </div>
      );
    case 'image':
      return (
        <div className="preview-image">
          {item.url ? (
            <img 
              src={item.url} 
              alt={item.alt || ''} 
              style={item.style} 
              className="preview-img"
            />
          ) : (
            <div className="image-placeholder">
              <span className="placeholder-icon">🖼️</span>
              <span>Image</span>
            </div>
          )}
          {item.caption && (
            <div className="image-caption" style={{ textAlign: item.style?.textAlign || 'center' }}>
              {item.caption}
            </div>
          )}
        </div>
      );
    case 'button':
      return (
        <div className="preview-button" style={{ textAlign: item.style?.textAlign || 'center' }}>
          <a 
            href={item.url || '#'} 
            style={item.style}
            className={`preview-btn ${item.buttonStyle ? `btn-${item.buttonStyle}` : ''}`}
            target="_blank" 
            rel="noopener noreferrer"
          >
            {item.content || 'Click me'}
          </a>
        </div>
      );
    case 'spacer':
      return (
        <div 
          className="preview-spacer" 
          style={{ 
            height: item.style?.height || '20px',
            backgroundColor: 'transparent' 
          }}
        ></div>
      );
    case 'divider':
      return (
        <div className="preview-divider">
          <hr style={item.style} />
        </div>
      );
    case 'list':
      return (
        <div className="preview-list" style={item.style}>
          {item.listType === 'numbered' ? (
            <ol>
              {item.items?.map((listItem, i) => (
                <li key={i}>{listItem}</li>
              )) || <li>List item</li>}
            </ol>
          ) : (
            <ul>
              {item.items?.map((listItem, i) => (
                <li key={i}>{listItem}</li>
              )) || <li>List item</li>}
            </ul>
          )}
        </div>
      );
    case 'table':
      return (
        <div className="preview-table">
          <table style={item.style}>
            <tbody>
              {item.rows?.map((row, i) => (
                <tr key={i} className={i === 0 ? 'header-row' : ''}>
                  {row.map((cell, j) => (
                    i === 0 ? 
                    <th key={j}>{cell}</th> : 
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              )) || (
                <>
                  <tr className="header-row">
                    <th>Header 1</th>
                    <th>Header 2</th>
                  </tr>
                  <tr>
                    <td>Cell 1</td>
                    <td>Cell 2</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      );
    case 'container':
      return (
        <div className="preview-container" style={item.style}>
          <div className="container-content">
            {item.children?.length ? 
              item.children.map((child, childIndex) => 
                renderPreviewContent(child, `${index}-${childIndex}`)
              ) : 
              <div className="container-placeholder">Container Content</div>
            }
          </div>
        </div>
      );
    case 'columns':
      return (
        <div className="preview-columns" style={{ display: 'flex', gap: '20px', ...item.style }}>
          <div className="column" style={{ flex: 1 }}>
            {item.leftColumn?.length ? 
              item.leftColumn.map((child, childIndex) => 
                renderPreviewContent(child, `${index}-left-${childIndex}`)
              ) : 
              <div className="column-placeholder">Left Column</div>
            }
          </div>
          <div className="column" style={{ flex: 1 }}>
            {item.rightColumn?.length ? 
              item.rightColumn.map((child, childIndex) => 
                renderPreviewContent(child, `${index}-right-${childIndex}`)
              ) : 
              <div className="column-placeholder">Right Column</div>
            }
          </div>
        </div>
      );
    case 'social':
      return (
        <div className="preview-social" style={{ textAlign: 'center', ...item.style }}>
          <div className="social-icons">
            {item.socialLinks?.length ? 
              item.socialLinks.map((link, i) => (
                <a key={i} href={link.url} className="social-icon" target="_blank" rel="noopener noreferrer">
                  {link.icon || link.name}
                </a>
              )) : (
                <>
                  <span className="social-icon">Facebook</span>
                  <span className="social-icon">Twitter</span>
                  <span className="social-icon">Instagram</span>
                  <span className="social-icon">LinkedIn</span>
                </>
              )
            }
          </div>
        </div>
      );
    default:
      return (
        <div className="preview-unsupported">
          Unsupported component type: {item.type}
        </div>
      );
  }
};

const renderCustomizationOptions = (item, index) => {
  const commonOptions = (
    <>
      <div className="customization-group">
        <label>Font Family</label>
        <select
          className="font-family-selector"
          value={item.style?.fontFamily || 'inherit'}
          onChange={(e) => handleCustomizationUpdate(index, {
            style: { ...item.style, fontFamily: e.target.value }
          })}
        >
          <option value="inherit">Default</option>
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
        </select>
      </div>
      <div className="customization-group">
        <label>Font Size</label>
        <div className="font-size-selector">
          <input
            type="number"
            value={item.style?.fontSize || '16'}
            onChange={(e) => handleCustomizationUpdate(index, {
              style: { ...item.style, fontSize: `${e.target.value}px` }
            })}
          />
          <span>px</span>
        </div>
      </div>
      <div className="customization-group">
        <label>Color</label>
        <input
          type="color"
          className="color-picker"
          value={item.style?.color || '#000000'}
          onChange={(e) => handleCustomizationUpdate(index, {
            style: { ...item.style, color: e.target.value }
          })}
        />
      </div>
      <div className="customization-group">
        <label>Background</label>
        <input
          type="color"
          className="color-picker"
          value={item.style?.backgroundColor || '#ffffff'}
          onChange={(e) => handleCustomizationUpdate(index, {
            style: { ...item.style, backgroundColor: e.target.value }
          })}
        />
      </div>
      <div className="customization-group">
        <label>Alignment</label>
        <div className="alignment-controls">
          <button
            className={`alignment-btn ${item.style?.textAlign === 'left' ? 'active' : ''}`}
            onClick={() => handleCustomizationUpdate(index, {
              style: { ...item.style, textAlign: 'left' }
            })}
          >
            Left
          </button>
          <button
            className={`alignment-btn ${item.style?.textAlign === 'center' ? 'active' : ''}`}
            onClick={() => handleCustomizationUpdate(index, {
              style: { ...item.style, textAlign: 'center' }
            })}
          >
            Center
          </button>
          <button
            className={`alignment-btn ${item.style?.textAlign === 'right' ? 'active' : ''}`}
            onClick={() => handleCustomizationUpdate(index, {
              style: { ...item.style, textAlign: 'right' }
            })}
          >
            Right
          </button>
        </div>
      </div>
    </>
  );

  switch (item.type) {
    case 'text':
    case 'heading':
    case 'quote':
      return (
        <>
          {commonOptions}
          <div className="customization-group">
            <label>Content</label>
            <textarea
              value={item.content || ''}
              onChange={(e) => handleCustomizationUpdate(index, {
                content: e.target.value
              })}
              rows={4}
            />
          </div>
        </>
      );
    case 'image':
      return (
        <>
          {commonOptions}
          <div className="customization-group">
            <label>Image URL</label>
            <input
              type="text"
              value={item.url || ''}
              onChange={(e) => handleCustomizationUpdate(index, {
                url: e.target.value
              })}
              placeholder="Enter image URL"
            />
          </div>
          <div className="customization-group">
            <label>Alt Text</label>
            <input
              type="text"
              value={item.alt || ''}
              onChange={(e) => handleCustomizationUpdate(index, {
                alt: e.target.value
              })}
              placeholder="Enter alt text"
            />
          </div>
          <div className="customization-group">
            <label>Caption</label>
            <input
              type="text"
              value={item.caption || ''}
              onChange={(e) => handleCustomizationUpdate(index, {
                caption: e.target.value
              })}
              placeholder="Enter caption"
            />
          </div>
        </>
      );
    case 'button':
      return (
        <>
          {commonOptions}
          <div className="customization-group">
            <label>Button Text</label>
            <input
              type="text"
              value={item.content || ''}
              onChange={(e) => handleCustomizationUpdate(index, {
                content: e.target.value
              })}
              placeholder="Enter button text"
            />
          </div>
          <div className="customization-group">
            <label>Button Style</label>
            <select
              value={item.buttonStyle || ''}
              onChange={(e) => handleCustomizationUpdate(index, {
                buttonStyle: e.target.value
              })}
            >
              <option value="">Default</option>
              <option value="outline">Outline</option>
              <option value="rounded">Rounded</option>
              <option value="pill">Pill</option>
            </select>
          </div>
        </>
      );
    case 'list':
      return (
        <>
          {commonOptions}
          <div className="customization-group">
            <label>List Items</label>
            <textarea
              value={item.items?.join('\n') || ''}
              onChange={(e) => handleCustomizationUpdate(index, {
                items: e.target.value.split('\n').filter(item => item.trim())
              })}
              rows={4}
              placeholder="Enter list items (one per line)"
            />
          </div>
        </>
      );
    case 'table':
      return (
        <>
          {commonOptions}
          <div className="customization-group">
            <label>Table Data</label>
            <textarea
              value={item.rows?.map(row => row.join('\t')).join('\n') || ''}
              onChange={(e) => handleCustomizationUpdate(index, {
                rows: e.target.value.split('\n').map(row => row.split('\t'))
              })}
              rows={4}
              placeholder="Enter table data (tab-separated columns, newline-separated rows)"
            />
          </div>
        </>
      );
    case 'html':
      return (
        <>
          {commonOptions}
          <div className="customization-group">
            <label>HTML Content</label>
            <textarea
              value={item.content || ''}
              onChange={(e) => handleCustomizationUpdate(index, {
                content: e.target.value
              })}
              rows={8}
              placeholder="Enter HTML content"
            />
          </div>
        </>
      );
    case 'video':
      return (
        <>
          {commonOptions}
          <div className="customization-group">
            <label>Video URL</label>
            <input
              type="text"
              value={item.url || ''}
              onChange={(e) => handleCustomizationUpdate(index, {
                url: e.target.value
              })}
              placeholder="Enter video URL"
            />
          </div>
        </>
      );
    default:
      return commonOptions;
  }
};

export default EmailPreview; 