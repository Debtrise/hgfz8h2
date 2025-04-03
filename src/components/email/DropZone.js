import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './styles/DropZone.css';

const DropZone = ({ content, onDrop, onRemove, onUpdate }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'EMAIL_COMPONENT',
    drop: (item, monitor) => {
      if (!monitor.didDrop()) {
        const dropIndex = content.length;
        onDrop(item, dropIndex);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }));

  const [activeComponent, setActiveComponent] = useState(null);
  const [customizationPanel, setCustomizationPanel] = useState(false);

  const handleComponentClick = (index) => {
    setActiveComponent(index);
    setCustomizationPanel(true);
  };

  const handleCustomizationUpdate = (index, updates) => {
    onUpdate(index, updates);
    setCustomizationPanel(false);
  };

  return (
    <div
      ref={drop}
      className={`drop-zone ${isOver ? 'is-over' : ''}`}
    >
      <TransitionGroup>
        {content.map((item, index) => (
          <CSSTransition
            key={index}
            timeout={200}
            classNames="fade"
          >
            <div 
              className={`dropped-item ${activeComponent === index ? 'active' : ''}`}
              onClick={() => handleComponentClick(index)}
            >
              <div className="item-header">
                <span className="item-type">
                  {getComponentIcon(item.type)}
                  {item.label}
                </span>
                <button
                  className="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(index);
                  }}
                >
                  ×
                </button>
              </div>
              <div className="item-content">
                {renderComponentContent(item, index)}
              </div>
              {activeComponent === index && customizationPanel && (
                <div className="customization-panel">
                  {renderCustomizationOptions(item, index, handleCustomizationUpdate)}
                </div>
              )}
            </div>
          </CSSTransition>
        ))}
      </TransitionGroup>
      {content.length === 0 && (
        <div className="empty-drop-zone">
          <span className="empty-drop-zone-icon">📧</span>
          <span>Drag and drop components here</span>
        </div>
      )}
    </div>
  );
};

const getComponentIcon = (type) => {
  // This is just a placeholder, actual icons would come from your icon library
  const iconMap = {
    text: "📝",
    heading: "𝗛",
    image: "🖼️",
    button: "🔘",
    spacer: "↕️",
    divider: "⎯",
    quote: "📣",
    list: "📋", 
    table: "🗃️",
    video: "📹",
    social: "🔗",
    form: "📊",
    container: "📦",
    columns: "🔲",
    section: "🖹",
    footer: "↓",
    header: "↑"
  };
  
  return iconMap[type] || "📄";
};

const renderComponentContent = (item, index) => {
  switch (item.type) {
    case 'text':
      return (
        <div className="text-component" style={item.style}>
          <p>{item.content || 'Sample text content'}</p>
        </div>
      );
    case 'heading':
      return (
        <div className="heading-component" style={item.style}>
          <h1>{item.content || 'Heading'}</h1>
        </div>
      );
    case 'quote':
      return (
        <div className="quote-component" style={item.style}>
          <blockquote>{item.content || 'Quote text'}</blockquote>
        </div>
      );
    case 'image':
      return (
        <div className="image-component">
          {item.url ? (
            <img src={item.url} alt={item.alt || ''} style={item.style} />
          ) : (
            <div className="image-placeholder">
              <span>Image placeholder</span>
              <button className="image-upload-btn">Upload Image</button>
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
        <div className="button-component">
          <button 
            style={item.style}
            className={item.buttonStyle ? `btn-${item.buttonStyle}` : ''}
          >
            {item.content || 'Click me'}
          </button>
        </div>
      );
    case 'spacer':
      return (
        <div className="spacer-component">
          <div className="spacer-line" style={{ height: item.style?.height || '20px' }}></div>
        </div>
      );
    case 'divider':
      return (
        <div className="divider-component">
          <hr style={item.style} />
        </div>
      );
    case 'list':
      return (
        <div className="list-component" style={item.style}>
          <ul>
            {item.items?.map((listItem, i) => (
              <li key={i}>{listItem}</li>
            )) || <li>List item</li>}
          </ul>
        </div>
      );
    case 'table':
      return (
        <div className="table-component">
          <table style={item.style}>
            <tbody>
              {item.rows?.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              )) || (
                <tr>
                  <td>Cell 1</td>
                  <td>Cell 2</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    case 'container':
      return (
        <div className="container-component" style={item.style}>
          <div className="container-placeholder">Container Component</div>
        </div>
      );
    case 'columns':
      return (
        <div className="columns-component" style={{ display: 'flex', gap: '20px', ...item.style }}>
          <div className="column" style={{ flex: 1, background: '#f5f5f5', padding: '10px' }}>
            Column 1
          </div>
          <div className="column" style={{ flex: 1, background: '#f5f5f5', padding: '10px' }}>
            Column 2
          </div>
        </div>
      );
    case 'section':
      return (
        <div className="section-component" style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', ...item.style }}>
          <div className="section-placeholder">Section Component</div>
        </div>
      );
    case 'social':
      return (
        <div className="social-component" style={{ textAlign: 'center', ...item.style }}>
          <div className="social-icons">
            <span className="social-icon">Facebook</span>
            <span className="social-icon">Twitter</span>
            <span className="social-icon">Instagram</span>
            <span className="social-icon">LinkedIn</span>
          </div>
        </div>
      );
    default:
      return null;
  }
};

const renderCustomizationOptions = (item, index, handleCustomizationUpdate) => {
  const updateItem = (updates) => {
    handleCustomizationUpdate(index, updates);
  };

  const updateStyle = (styleUpdates) => {
    updateItem({ style: { ...item.style, ...styleUpdates } });
  };

  // Common style options that apply to most components
  const commonOptions = (
    <>
      <div className="customization-group">
        <label>Font Family</label>
        <select
          className="font-family-selector"
          value={item.style?.fontFamily || 'inherit'}
          onChange={(e) => updateStyle({ fontFamily: e.target.value })}
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
            value={parseInt(item.style?.fontSize) || 16}
            onChange={(e) => updateStyle({ fontSize: `${e.target.value}px` })}
            min="8"
            max="72"
          />
          <span>px</span>
        </div>
      </div>
      <div className="customization-group">
        <label>Text Color</label>
        <input
          type="color"
          className="color-picker"
          value={item.style?.color || '#000000'}
          onChange={(e) => updateStyle({ color: e.target.value })}
        />
      </div>
      <div className="customization-group">
        <label>Background Color</label>
        <input
          type="color"
          className="color-picker"
          value={item.style?.backgroundColor || '#ffffff'}
          onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
        />
      </div>
      <div className="customization-group">
        <label>Text Alignment</label>
        <div className="alignment-controls">
          <button
            className={`alignment-btn ${item.style?.textAlign === 'left' ? 'active' : ''}`}
            onClick={() => updateStyle({ textAlign: 'left' })}
          >
            Left
          </button>
          <button
            className={`alignment-btn ${item.style?.textAlign === 'center' ? 'active' : ''}`}
            onClick={() => updateStyle({ textAlign: 'center' })}
          >
            Center
          </button>
          <button
            className={`alignment-btn ${item.style?.textAlign === 'right' ? 'active' : ''}`}
            onClick={() => updateStyle({ textAlign: 'right' })}
          >
            Right
          </button>
        </div>
      </div>
      <div className="customization-group">
        <label>Padding</label>
        <div className="alignment-controls">
          <input
            type="number"
            value={parseInt(item.style?.padding) || 0}
            onChange={(e) => updateStyle({ padding: `${e.target.value}px` })}
            min="0"
            max="50"
          />
          <span>px</span>
        </div>
      </div>
    </>
  );

  // Component-specific options
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
              onChange={(e) => updateItem({ content: e.target.value })}
              rows={4}
              placeholder="Enter content"
            />
          </div>
          <div className="customization-group">
            <label>Font Weight</label>
            <select
              value={item.style?.fontWeight || 'normal'}
              onChange={(e) => updateStyle({ fontWeight: e.target.value })}
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
              <option value="lighter">Light</option>
            </select>
          </div>
        </>
      );
    
    case 'image':
      return (
        <>
          <div className="customization-group">
            <label>Image URL</label>
            <input
              type="text"
              value={item.url || ''}
              onChange={(e) => updateItem({ url: e.target.value })}
              placeholder="Enter image URL"
            />
          </div>
          <div className="customization-group">
            <label>Alt Text</label>
            <input
              type="text"
              value={item.alt || ''}
              onChange={(e) => updateItem({ alt: e.target.value })}
              placeholder="Describe the image"
            />
          </div>
          <div className="customization-group">
            <label>Caption</label>
            <input
              type="text"
              value={item.caption || ''}
              onChange={(e) => updateItem({ caption: e.target.value })}
              placeholder="Image caption"
            />
          </div>
          <div className="customization-group">
            <label>Width</label>
            <div className="alignment-controls">
              <input
                type="number"
                value={parseInt(item.style?.width) || 100}
                onChange={(e) => updateStyle({ width: `${e.target.value}%` })}
                min="10"
                max="100"
              />
              <span>%</span>
            </div>
          </div>
          <div className="customization-group">
            <label>Alignment</label>
            <div className="alignment-controls">
              <button
                className={`alignment-btn ${item.style?.margin === '0 auto' ? 'active' : ''}`}
                onClick={() => updateStyle({ 
                  display: 'block',
                  margin: '0 auto',
                  textAlign: 'center'
                })}
              >
                Center
              </button>
              <button
                className={`alignment-btn ${item.style?.margin === '0 0 0 auto' ? 'active' : ''}`}
                onClick={() => updateStyle({ 
                  display: 'block',
                  margin: '0 0 0 auto',
                  textAlign: 'right'
                })}
              >
                Right
              </button>
              <button
                className={`alignment-btn ${item.style?.margin === '0' ? 'active' : ''}`}
                onClick={() => updateStyle({ 
                  display: 'block',
                  margin: '0',
                  textAlign: 'left'
                })}
              >
                Left
              </button>
            </div>
          </div>
        </>
      );
    
    case 'button':
      return (
        <>
          <div className="customization-group">
            <label>Button Text</label>
            <input
              type="text"
              value={item.content || ''}
              onChange={(e) => updateItem({ content: e.target.value })}
              placeholder="Button text"
            />
          </div>
          <div className="customization-group">
            <label>URL</label>
            <input
              type="text"
              value={item.url || ''}
              onChange={(e) => updateItem({ url: e.target.value })}
              placeholder="Button link URL"
            />
          </div>
          <div className="customization-group">
            <label>Button Style</label>
            <select
              value={item.buttonStyle || ''}
              onChange={(e) => updateItem({ buttonStyle: e.target.value })}
            >
              <option value="">Default</option>
              <option value="outline">Outline</option>
              <option value="rounded">Rounded</option>
              <option value="pill">Pill</option>
            </select>
          </div>
          <div className="customization-group">
            <label>Button Color</label>
            <input
              type="color"
              className="color-picker"
              value={item.style?.backgroundColor || '#0066cc'}
              onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
            />
          </div>
          <div className="customization-group">
            <label>Text Color</label>
            <input
              type="color"
              className="color-picker"
              value={item.style?.color || '#ffffff'}
              onChange={(e) => updateStyle({ color: e.target.value })}
            />
          </div>
          <div className="customization-group">
            <label>Alignment</label>
            <div className="alignment-controls">
              <button
                className={`alignment-btn ${item.style?.margin === '0 auto' ? 'active' : ''}`}
                onClick={() => updateStyle({ 
                  display: 'block',
                  margin: '0 auto',
                  textAlign: 'center'
                })}
              >
                Center
              </button>
              <button
                className={`alignment-btn ${item.style?.margin === '0 0 0 auto' ? 'active' : ''}`}
                onClick={() => updateStyle({ 
                  display: 'block',
                  margin: '0 0 0 auto',
                  textAlign: 'right'
                })}
              >
                Right
              </button>
              <button
                className={`alignment-btn ${item.style?.margin === '0' ? 'active' : ''}`}
                onClick={() => updateStyle({ 
                  display: 'block',
                  margin: '0',
                  textAlign: 'left'
                })}
              >
                Left
              </button>
            </div>
          </div>
        </>
      );
    
    case 'spacer':
      return (
        <div className="customization-group">
          <label>Height</label>
          <div className="alignment-controls">
            <input
              type="number"
              value={parseInt(item.style?.height) || 20}
              onChange={(e) => updateStyle({ height: `${e.target.value}px` })}
              min="5"
              max="100"
            />
            <span>px</span>
          </div>
        </div>
      );
    
    case 'divider':
      return (
        <>
          <div className="customization-group">
            <label>Line Color</label>
            <input
              type="color"
              className="color-picker"
              value={item.style?.borderTopColor || '#e0e0e0'}
              onChange={(e) => updateStyle({ borderTopColor: e.target.value })}
            />
          </div>
          <div className="customization-group">
            <label>Line Style</label>
            <select
              value={item.style?.borderTopStyle || 'solid'}
              onChange={(e) => updateStyle({ borderTopStyle: e.target.value })}
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="double">Double</option>
            </select>
          </div>
          <div className="customization-group">
            <label>Line Thickness</label>
            <div className="alignment-controls">
              <input
                type="number"
                value={parseInt(item.style?.borderTopWidth) || 1}
                onChange={(e) => updateStyle({ borderTopWidth: `${e.target.value}px` })}
                min="1"
                max="10"
              />
              <span>px</span>
            </div>
          </div>
          <div className="customization-group">
            <label>Margin</label>
            <div className="alignment-controls">
              <input
                type="number"
                value={parseInt(item.style?.margin?.split(' ')[0]) || 20}
                onChange={(e) => updateStyle({ margin: `${e.target.value}px 0` })}
                min="0"
                max="100"
              />
              <span>px</span>
            </div>
          </div>
        </>
      );
    
    case 'list':
      return (
        <>
          {commonOptions}
          <div className="customization-group">
            <label>List Items (one per line)</label>
            <textarea
              value={item.items?.join('\n') || ''}
              onChange={(e) => updateItem({
                items: e.target.value.split('\n').filter(item => item.trim())
              })}
              rows={6}
              placeholder="Enter list items (one per line)"
            />
          </div>
          <div className="customization-group">
            <label>List Type</label>
            <select
              value={item.listType || 'bullet'}
              onChange={(e) => updateItem({ listType: e.target.value })}
            >
              <option value="bullet">Bullet Points</option>
              <option value="numbered">Numbered</option>
            </select>
          </div>
        </>
      );
    
    case 'table':
      return (
        <>
          {commonOptions}
          <div className="customization-group">
            <label>Table Data (CSV format)</label>
            <textarea
              value={item.rows?.map(row => row.join(',')).join('\n') || ''}
              onChange={(e) => updateItem({
                rows: e.target.value
                  .split('\n')
                  .filter(line => line.trim())
                  .map(line => line.split(',').map(cell => cell.trim()))
              })}
              rows={6}
              placeholder="Header 1, Header 2\nCell 1, Cell 2\nCell 3, Cell 4"
            />
          </div>
          <div className="customization-group">
            <label>Border Color</label>
            <input
              type="color"
              className="color-picker"
              value={item.style?.borderColor || '#e0e0e0'}
              onChange={(e) => updateStyle({ borderColor: e.target.value })}
            />
          </div>
        </>
      );
    
    default:
      return commonOptions;
  }
};

export default DropZone; 