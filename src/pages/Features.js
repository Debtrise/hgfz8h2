import React from 'react';
import { Card, Row, Col, Typography, Space, Button } from 'antd';
import {
  PhoneOutlined,
  TeamOutlined,
  BarChartOutlined,
  ProjectOutlined,
  SafetyCertificateOutlined,
  LineChartOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Features = () => {
  const features = [
    {
      icon: <PhoneOutlined style={{ fontSize: '2rem', color: '#3a84af' }} />,
      title: 'Advanced Call Management',
      description: 'Streamline your call center operations with powerful tools designed for efficiency.',
      items: [
        'Real-time agent dashboard',
        'Call recording and logging',
        'Answering machine detection',
        'TCPA compliance features'
      ]
    },
    {
      icon: <TeamOutlined style={{ fontSize: '2rem', color: '#3a84af' }} />,
      title: 'Lead Management',
      description: 'Efficiently manage and track leads throughout your sales pipeline.',
      items: [
        'Lead pool creation and management',
        'Lead import functionality',
        'Lead assignment system',
        'Lead source tracking'
      ]
    },
    {
      icon: <BarChartOutlined style={{ fontSize: '2rem', color: '#3a84af' }} />,
      title: 'Campaign Management',
      description: 'Create, manage, and optimize your marketing campaigns for maximum ROI.',
      items: [
        'Campaign creation and configuration',
        'Campaign builder interface',
        'Performance tracking',
        'Analytics and reporting'
      ]
    },
    {
      icon: <ProjectOutlined style={{ fontSize: '2rem', color: '#3a84af' }} />,
      title: 'Journey Management',
      description: 'Design and automate customer journeys for seamless interactions.',
      items: [
        'Journey builder interface',
        'Flow configuration',
        'Journey tracking',
        'Automation rules'
      ]
    },
    {
      icon: <SafetyCertificateOutlined style={{ fontSize: '2rem', color: '#3a84af' }} />,
      title: 'Security & Compliance',
      description: 'Ensure your operations meet industry standards and regulations.',
      items: [
        'JWT-based authentication',
        'Role-based access control',
        'TCPA compliance features',
        'Data privacy controls'
      ]
    },
    {
      icon: <LineChartOutlined style={{ fontSize: '2rem', color: '#3a84af' }} />,
      title: 'Analytics & Reporting',
      description: 'Gain valuable insights with comprehensive analytics and reporting tools.',
      items: [
        'Real-time call monitoring',
        'Agent performance tracking',
        'Campaign analytics',
        'Usage statistics'
      ]
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Title level={2}>Powerful Features for Modern Call Centers</Title>
          <Paragraph style={{ fontSize: '16px', color: '#666' }}>
            Our comprehensive call center solution streamlines operations, enhances customer experience, and drives business growth.
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card
                hoverable
                style={{ height: '100%' }}
                bodyStyle={{ padding: '24px' }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div style={{ textAlign: 'center' }}>
                    {feature.icon}
                  </div>
                  <Title level={4} style={{ textAlign: 'center', margin: 0 }}>
                    {feature.title}
                  </Title>
                  <Paragraph style={{ textAlign: 'center', color: '#666' }}>
                    {feature.description}
                  </Paragraph>
                  <ul style={{ paddingLeft: '20px' }}>
                    {feature.items.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '8px' }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Button type="primary" size="large" href="#contact">
            Get Started Today
          </Button>
        </div>
      </Space>
    </div>
  );
};

export default Features; 