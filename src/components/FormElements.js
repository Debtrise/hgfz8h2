import React from 'react';
import { useDrag } from 'react-dnd';
import { Input, Select, DatePicker, Button, Card, Checkbox, Radio, Upload } from 'antd';
import styled from 'styled-components';

const { Option } = Select;

const ElementCard = styled(Card)`
  margin-bottom: 8px;
  cursor: move;
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const FormElement = ({ type, label }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'form-element',
    item: { type, label },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const renderElement = () => {
    switch (type) {
      case 'input':
        return <Input placeholder={label} disabled />;
      case 'email':
        return <Input type="email" placeholder="Enter your email" disabled />;
      case 'phone':
        return <Input type="tel" placeholder="Enter your phone number" disabled />;
      case 'address':
        return <Input.TextArea placeholder="Enter your address" disabled />;
      case 'select':
        return (
          <Select placeholder={label} disabled>
            <Option value="option1">Option 1</Option>
            <Option value="option2">Option 2</Option>
          </Select>
        );
      case 'date':
        return <DatePicker placeholder={label} disabled />;
      case 'checkbox':
        return <Checkbox.Group options={['Option 1', 'Option 2']} disabled />;
      case 'radio':
        return <Radio.Group options={['Option 1', 'Option 2']} disabled />;
      case 'file':
        return <Upload disabled><Button disabled>Upload File</Button></Upload>;
      case 'button':
        return <Button type="primary" disabled>{label}</Button>;
      default:
        return null;
    }
  };

  return (
    <ElementCard
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {renderElement()}
    </ElementCard>
  );
};

export default FormElement; 