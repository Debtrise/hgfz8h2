import React, { useState } from 'react';
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Space,
  InputNumber,
  Divider,
} from 'antd';
import {
  FormOutlined,
  CheckSquareOutlined,
  CheckCircleOutlined,
  SelectOutlined,
  NumberOutlined,
  CalendarOutlined,
  UploadOutlined,
  PlusOutlined,
  MinusCircleOutlined
} from '@ant-design/icons';

const { Option } = Select;

const fieldTypes = [
  { value: 'text', label: 'Text Input', icon: <FormOutlined /> },
  { value: 'textarea', label: 'Text Area', icon: <FormOutlined /> },
  { value: 'checkbox', label: 'Checkbox', icon: <CheckSquareOutlined /> },
  { value: 'radio', label: 'Radio Button', icon: <CheckCircleOutlined /> },
  { value: 'select', label: 'Dropdown Select', icon: <SelectOutlined /> },
  { value: 'number', label: 'Number Input', icon: <NumberOutlined /> },
  { value: 'date', label: 'Date Picker', icon: <CalendarOutlined /> },
  { value: 'file', label: 'File Upload', icon: <UploadOutlined /> },
];

const FieldDesigner = ({ onAdd }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState(null);
  const [options, setOptions] = useState([]);

  const handleAddOption = () => {
    setOptions([...options, { label: '', value: '' }]);
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const handleRemoveOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const fieldData = {
        ...values,
        type: selectedType,
        options: selectedType === 'select' || selectedType === 'radio' ? options : undefined,
      };
      onAdd(fieldData);
      setIsModalVisible(false);
      form.resetFields();
      setOptions([]);
    });
  };

  return (
    <>
      <Button
        type="primary"
        onClick={() => setIsModalVisible(true)}
        icon={<FormOutlined />}
      >
        Add Field
      </Button>

      <Modal
        title="Add Form Field"
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setOptions([]);
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="type"
            label="Field Type"
            rules={[{ required: true, message: 'Please select a field type' }]}
          >
            <Select
              placeholder="Select field type"
              onChange={setSelectedType}
              style={{ width: '100%' }}
            >
              {fieldTypes.map((type) => (
                <Option key={type.value} value={type.value}>
                  <Space>
                    {type.icon}
                    {type.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="label"
            label="Field Label"
            rules={[{ required: true, message: 'Please enter a field label' }]}
          >
            <Input placeholder="Enter field label" />
          </Form.Item>

          <Form.Item
            name="placeholder"
            label="Placeholder Text"
          >
            <Input placeholder="Enter placeholder text" />
          </Form.Item>

          <Form.Item
            name="required"
            label="Required Field"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          {(selectedType === 'select' || selectedType === 'radio') && (
            <>
              <Divider>Options</Divider>
              {options.map((option, index) => (
                <Space key={index} style={{ display: 'flex', marginBottom: 8 }}>
                  <Input
                    placeholder="Option Label"
                    value={option.label}
                    onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                  />
                  <Input
                    placeholder="Option Value"
                    value={option.value}
                    onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                  />
                  <Button
                    type="text"
                    danger
                    onClick={() => handleRemoveOption(index)}
                  >
                    Remove
                  </Button>
                </Space>
              ))}
              <Button type="dashed" onClick={handleAddOption} block>
                Add Option
              </Button>
            </>
          )}

          {selectedType === 'number' && (
            <>
              <Form.Item name="min" label="Minimum Value">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="max" label="Maximum Value">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default FieldDesigner; 