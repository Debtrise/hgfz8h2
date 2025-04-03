import React, { useState } from 'react';
import { Layout, Steps, Card } from 'antd';
import PageDesigner from './PageDesigner';
import MarketingPixels from './MarketingPixels';
import FormPreview from './FormPreview';

const { Content } = Layout;

const FormBuilderContainer = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    pages: [],
    marketingPixels: [],
  });

  const steps = [
    {
      title: 'Design Pages',
      content: <PageDesigner formData={formData} setFormData={setFormData} />,
    },
    {
      title: 'Marketing Pixels',
      content: <MarketingPixels formData={formData} setFormData={setFormData} />,
    },
    {
      title: 'Preview',
      content: <FormPreview formData={formData} />,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <Card style={{ marginBottom: '24px' }}>
          <Steps
            current={currentStep}
            onChange={setCurrentStep}
            items={steps}
            style={{ marginBottom: '24px' }}
          />
          <div style={{ minHeight: '600px' }}>
            {steps[currentStep].content}
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default FormBuilderContainer; 