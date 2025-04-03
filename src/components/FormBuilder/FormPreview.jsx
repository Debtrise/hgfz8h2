import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Checkbox,
  Radio,
  DatePicker,
  Upload,
  Steps,
  Space,
  Typography,
  Alert,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title, Text } = Typography;
const { Step } = Steps;

const FormPreview = ({ formData }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [form] = Form.useForm();

  const renderField = (field) => {
    const commonProps = {
      placeholder: field.placeholder,
      required: field.required,
    };

    switch (field.type) {
      case 'text':
        return <Input {...commonProps} />;
      case 'textarea':
        return <Input.TextArea {...commonProps} rows={4} />;
      case 'checkbox':
        return <Checkbox {...commonProps}>{field.label}</Checkbox>;
      case 'radio':
        return (
          <Radio.Group {...commonProps}>
            {field.options.map((option, index) => (
              <Radio key={index} value={option.value}>
                {option.label}
              </Radio>
            ))}
          </Radio.Group>
        );
      case 'select':
        return (
          <Select {...commonProps}>
            {field.options.map((option, index) => (
              <Option key={index} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        );
      case 'number':
        return (
          <InputNumber
            {...commonProps}
            min={field.min}
            max={field.max}
            style={{ width: '100%' }}
          />
        );
      case 'date':
        return <DatePicker {...commonProps} style={{ width: '100%' }} />;
      case 'file':
        return (
          <Upload {...commonProps}>
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        );
      default:
        return null;
    }
  };

  const handleSubmit = (values) => {
    console.log('Form submitted:', values);
    // Here you would typically handle the form submission
    // and trigger the marketing pixels
  };

  if (formData.pages.length === 0) {
    return (
      <Alert
        message="No form pages"
        description="Add pages and fields to your form to see the preview"
        type="info"
        showIcon
      />
    );
  }

  return (
    <div>
      <Title level={4}>Form Preview</Title>
      <Text type="secondary">
        This is how your form will appear to users
      </Text>

      <Card style={{ marginTop: 24 }}>
        <Steps
          current={currentPage}
          onChange={setCurrentPage}
          style={{ marginBottom: 24 }}
        >
          {formData.pages.map((page, index) => (
            <Step key={index} title={page.title} />
          ))}
        </Steps>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{}}
        >
          {formData.pages.map((page, pageIndex) => (
            <div
              key={pageIndex}
              style={{ display: pageIndex === currentPage ? 'block' : 'none' }}
            >
              {page.fields.map((field, fieldIndex) => (
                <Form.Item
                  key={fieldIndex}
                  label={field.type !== 'checkbox' ? field.label : null}
                  name={field.label.toLowerCase().replace(/\s+/g, '_')}
                  rules={[
                    {
                      required: field.required,
                      message: `Please input ${field.label.toLowerCase()}`,
                    },
                  ]}
                >
                  {renderField(field)}
                </Form.Item>
              ))}
            </div>
          ))}

          <Form.Item>
            <Space>
              {currentPage > 0 && (
                <Button onClick={() => setCurrentPage(currentPage - 1)}>
                  Previous
                </Button>
              )}
              {currentPage < formData.pages.length - 1 ? (
                <Button
                  type="primary"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              ) : (
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {formData.marketingPixels.length > 0 && (
        <Card style={{ marginTop: 24 }}>
          <Title level={5}>Active Marketing Pixels</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            {formData.marketingPixels
              .filter((pixel) => pixel.active)
              .map((pixel) => (
                <Alert
                  key={pixel.id}
                  message={`${pixel.name} (${pixel.type})`}
                  description={`Pixel ID: ${pixel.pixelId}`}
                  type="info"
                  showIcon
                />
              ))}
          </Space>
        </Card>
      )}
    </div>
  );
};

export default FormPreview; 