import React from 'react';
import { useDrop } from 'react-dnd';
import { Form, Button, Space, Input, Select, DatePicker, Checkbox, Radio, Upload } from 'antd';
import styled from 'styled-components';

const { Option } = Select;

const DropZone = styled.div`
  min-height: 200px;
  border: 2px dashed ${props => props.isOver ? '#1890ff' : '#d9d9d9'};
  border-radius: 8px;
  padding: 24px;
  background: ${props => props.isOver ? 'rgba(24, 144, 255, 0.1)' : '#fff'};
  transition: all 0.3s;
`;

const FormItemWrapper = styled.div`
  position: relative;
  padding: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  margin-bottom: 16px;
  background: #fff;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
`;

const FormItemActions = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.3s;

  ${FormItemWrapper}:hover & {
    opacity: 1;
  }
`;

const renderFormElement = (item) => {
  switch (item.type) {
    case 'input':
      return <Input placeholder={item.placeholder} />;
    case 'email':
      return <Input type="email" placeholder="Enter your email" />;
    case 'phone':
      return <Input type="tel" placeholder="Enter your phone number" />;
    case 'address':
      return <Input.TextArea placeholder="Enter your address" />;
    case 'select':
      return (
        <Select placeholder={item.placeholder}>
          {item.options?.map((option, index) => (
            <Option key={index} value={option}>{option}</Option>
          ))}
        </Select>
      );
    case 'date':
      return <DatePicker placeholder={item.placeholder} />;
    case 'checkbox':
      return <Checkbox.Group options={item.options} />;
    case 'radio':
      return <Radio.Group options={item.options} />;
    case 'file':
      return <Upload><Button>Upload File</Button></Upload>;
    case 'button':
      return <Button type="primary">{item.label}</Button>;
    default:
      return null;
  }
};

const FormDropZone = ({ formItems, onDrop, onUpdate, onRemove }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'form-element',
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleUpdate = (index, field, value) => {
    onUpdate(index, { [field]: value });
  };

  return (
    <DropZone ref={drop} isOver={isOver}>
      {formItems.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999' }}>
          Drag and drop form elements here
        </div>
      ) : (
        formItems.map((item, index) => (
          <FormItemWrapper key={item.id}>
            <FormItemActions>
              <Space>
                <Button 
                  type="text" 
                  danger 
                  onClick={() => onRemove(index)}
                >
                  Remove
                </Button>
              </Space>
            </FormItemActions>
            <Form.Item
              label={
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => handleUpdate(index, 'label', e.target.value)}
                  style={{ 
                    border: 'none', 
                    borderBottom: '1px solid #d9d9d9',
                    padding: '4px 0',
                    background: 'transparent',
                    width: '100%'
                  }}
                />
              }
            >
              {renderFormElement(item)}
            </Form.Item>
            {item.type === 'select' || item.type === 'radio' || item.type === 'checkbox' ? (
              <div style={{ marginTop: 8 }}>
                <Button 
                  type="link" 
                  onClick={() => {
                    const newOptions = [...(item.options || []), `Option ${(item.options?.length || 0) + 1}`];
                    handleUpdate(index, 'options', newOptions);
                  }}
                >
                  Add Option
                </Button>
              </div>
            ) : null}
          </FormItemWrapper>
        ))
      )}
    </DropZone>
  );
};

export default FormDropZone; 