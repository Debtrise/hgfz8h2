import React, { useState } from 'react';
import { Button, Card, Tabs, Space, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, DragOutlined } from '@ant-design/icons';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import FieldDesigner from './FieldDesigner';

const { TabPane } = Tabs;

const DraggableField = ({ field, index, moveField, removeField }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'FIELD',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'FIELD',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveField(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        padding: '8px',
        marginBottom: '8px',
        background: '#fff',
        border: '1px solid #d9d9d9',
        borderRadius: '4px',
      }}
    >
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <span>
          <DragOutlined style={{ marginRight: '8px' }} />
          {field.type}
        </span>
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeField(index)}
        />
      </Space>
    </div>
  );
};

const PageDesigner = ({ formData, setFormData }) => {
  const [activePage, setActivePage] = useState('0');

  const addPage = () => {
    const newPage = {
      id: Date.now().toString(),
      title: `Page ${formData.pages.length + 1}`,
      fields: [],
    };
    setFormData({
      ...formData,
      pages: [...formData.pages, newPage],
    });
  };

  const removePage = (pageId) => {
    setFormData({
      ...formData,
      pages: formData.pages.filter((page) => page.id !== pageId),
    });
  };

  const addField = (pageId, field) => {
    setFormData({
      ...formData,
      pages: formData.pages.map((page) =>
        page.id === pageId
          ? { ...page, fields: [...page.fields, field] }
          : page
      ),
    });
  };

  const moveField = (pageId, dragIndex, hoverIndex) => {
    const page = formData.pages.find((p) => p.id === pageId);
    const newFields = [...page.fields];
    const draggedField = newFields[dragIndex];
    newFields.splice(dragIndex, 1);
    newFields.splice(hoverIndex, 0, draggedField);

    setFormData({
      ...formData,
      pages: formData.pages.map((p) =>
        p.id === pageId ? { ...p, fields: newFields } : p
      ),
    });
  };

  const removeField = (pageId, fieldIndex) => {
    setFormData({
      ...formData,
      pages: formData.pages.map((page) =>
        page.id === pageId
          ? {
              ...page,
              fields: page.fields.filter((_, index) => index !== fieldIndex),
            }
          : page
      ),
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <Space style={{ marginBottom: '16px' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={addPage}>
            Add Page
          </Button>
        </Space>

        <Tabs
          activeKey={activePage}
          onChange={setActivePage}
          type="editable-card"
          onEdit={(targetKey, action) => {
            if (action === 'remove') {
              removePage(targetKey);
            }
          }}
        >
          {formData.pages.map((page) => (
            <TabPane
              tab={page.title}
              key={page.id}
              closable={formData.pages.length > 1}
            >
              <div style={{ marginBottom: '16px' }}>
                <FieldDesigner onAdd={(field) => addField(page.id, field)} />
              </div>
              <div>
                {page.fields.map((field, index) => (
                  <DraggableField
                    key={index}
                    field={field}
                    index={index}
                    moveField={(dragIndex, hoverIndex) =>
                      moveField(page.id, dragIndex, hoverIndex)
                    }
                    removeField={(index) => removeField(page.id, index)}
                  />
                ))}
              </div>
            </TabPane>
          ))}
        </Tabs>
      </div>
    </DndProvider>
  );
};

export default PageDesigner; 