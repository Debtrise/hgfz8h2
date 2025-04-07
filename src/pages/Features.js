import React from 'react';
import { Card, Row, Col, Typography, Space, Button, Table, Collapse, Avatar, Divider } from 'antd';
import {
  PhoneOutlined,
  TeamOutlined,
  BarChartOutlined,
  ProjectOutlined,
  SafetyCertificateOutlined,
  LineChartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  StarFilled
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

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

  // Comparison data
  const comparisonColumns = [
    {
      title: 'Features',
      dataIndex: 'feature',
      key: 'feature',
    },
    {
      title: 'Our Solution',
      dataIndex: 'ourSolution',
      key: 'ourSolution',
      render: (text) => (
        <div style={{ textAlign: 'center' }}>
          {text === 'Yes' ? (
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
          ) : (
            <Text>{text}</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Competitor A',
      dataIndex: 'competitorA',
      key: 'competitorA',
      render: (text) => (
        <div style={{ textAlign: 'center' }}>
          {text === 'Yes' ? (
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
          ) : text === 'No' ? (
            <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
          ) : (
            <Text>{text}</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Competitor B',
      dataIndex: 'competitorB',
      key: 'competitorB',
      render: (text) => (
        <div style={{ textAlign: 'center' }}>
          {text === 'Yes' ? (
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
          ) : text === 'No' ? (
            <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
          ) : (
            <Text>{text}</Text>
          )}
        </div>
      ),
    },
  ];

  const comparisonData = [
    {
      key: '1',
      feature: 'Real-time Call Monitoring',
      ourSolution: 'Yes',
      competitorA: 'Yes',
      competitorB: 'No',
    },
    {
      key: '2',
      feature: 'Advanced Lead Management',
      ourSolution: 'Yes',
      competitorA: 'Limited',
      competitorB: 'Yes',
    },
    {
      key: '3',
      feature: 'Journey Builder',
      ourSolution: 'Yes',
      competitorA: 'No',
      competitorB: 'No',
    },
    {
      key: '4',
      feature: 'TCPA Compliance',
      ourSolution: 'Yes',
      competitorA: 'Limited',
      competitorB: 'Yes',
    },
    {
      key: '5',
      feature: 'Custom Analytics',
      ourSolution: 'Yes',
      competitorA: 'No',
      competitorB: 'Limited',
    },
    {
      key: '6',
      feature: 'API Integration',
      ourSolution: 'Yes',
      competitorA: 'Limited',
      competitorB: 'Yes',
    },
  ];

  // FAQ data
  const faqItems = [
    {
      key: '1',
      question: 'How does your call center solution improve efficiency?',
      answer: 'Our solution improves efficiency through automated workflows, intelligent call routing, and comprehensive analytics that help identify bottlenecks and optimize agent performance. The real-time dashboard provides immediate insights, while the journey builder allows for complex automation of customer interactions.',
    },
    {
      key: '2',
      question: 'Can I integrate this with my existing CRM system?',
      answer: 'Yes, our platform offers robust API integration capabilities with popular CRM systems like Salesforce, HubSpot, and Zoho. We also provide custom integration options for proprietary systems through our developer-friendly API documentation.',
    },
    {
      key: '3',
      question: 'How does your solution ensure TCPA compliance?',
      answer: 'We implement multiple layers of compliance features including consent management, call time restrictions, opt-out mechanisms, and comprehensive call logging. Our system automatically flags potential compliance issues and provides detailed audit trails for regulatory requirements.',
    },
    {
      key: '4',
      question: 'What kind of analytics and reporting capabilities do you offer?',
      answer: 'Our analytics platform provides real-time dashboards, customizable reports, and predictive analytics. You can track agent performance, campaign effectiveness, call quality metrics, and customer satisfaction scores. We also offer advanced data visualization tools and export capabilities for further analysis.',
    },
    {
      key: '5',
      question: 'How scalable is your solution for growing call centers?',
      answer: 'Our cloud-based architecture is designed to scale seamlessly from small teams to enterprise-level operations. We support thousands of concurrent users and can handle millions of calls per month. Our pricing model is also designed to grow with your business, with flexible plans that adapt to your needs.',
    },
  ];

  // Testimonials data
  const testimonials = [
    {
      key: '1',
      name: 'Sarah Johnson',
      position: 'Call Center Director, TechCorp',
      avatar: 'SJ',
      rating: 5,
      text: 'Implementing this solution has transformed our call center operations. The lead management features alone have increased our conversion rates by 35%, and the analytics have given us insights we never had before.',
    },
    {
      key: '2',
      name: 'Michael Rodriguez',
      position: 'Operations Manager, CustomerFirst',
      avatar: 'MR',
      rating: 5,
      text: 'The journey builder has been a game-changer for our customer service team. We\'ve been able to automate complex workflows and reduce average handle time by 25%. The ROI has been incredible.',
    },
    {
      key: '3',
      name: 'Emily Chen',
      position: 'Marketing Director, Global Services',
      avatar: 'EC',
      rating: 5,
      text: 'As someone who manages multiple campaigns, the campaign management tools are exactly what I needed. The performance tracking and analytics have helped us optimize our marketing spend and improve results across all channels.',
    },
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

        {/* Feature Showcase Section */}
        <div style={{ marginTop: '60px' }}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: '40px' }}>
            Feature Showcase
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card
                hoverable
                style={{ height: '100%' }}
                bodyStyle={{ padding: '24px' }}
              >
                <Title level={4}>Advanced Call Management</Title>
                <Paragraph>
                  Our call management system provides a comprehensive suite of tools designed to maximize efficiency and quality in your call center operations.
                </Paragraph>
                <ul>
                  <li><strong>Intelligent Call Routing:</strong> Automatically directs calls to the most qualified agent based on skills, availability, and customer history.</li>
                  <li><strong>Call Recording & Quality Monitoring:</strong> Record and review calls for quality assurance and training purposes.</li>
                  <li><strong>Answering Machine Detection:</strong> Automatically detects answering machines and adjusts call handling accordingly.</li>
                  <li><strong>Call Whispering:</strong> Supervisors can listen in on calls and provide real-time guidance to agents without the customer hearing.</li>
                </ul>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                hoverable
                style={{ height: '100%' }}
                bodyStyle={{ padding: '24px' }}
              >
                <Title level={4}>Journey Management</Title>
                <Paragraph>
                  Design and automate complex customer journeys that guide interactions through multiple touchpoints and channels.
                </Paragraph>
                <ul>
                  <li><strong>Visual Journey Builder:</strong> Drag-and-drop interface for creating sophisticated customer journeys.</li>
                  <li><strong>Multi-channel Orchestration:</strong> Coordinate interactions across voice, email, SMS, and web channels.</li>
                  <li><strong>Conditional Logic:</strong> Create dynamic paths based on customer behavior, responses, and data.</li>
                  <li><strong>A/B Testing:</strong> Test different journey configurations to optimize customer experience and outcomes.</li>
                </ul>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Comparison Section */}
        <div style={{ marginTop: '60px' }}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: '40px' }}>
            How We Compare
          </Title>
          <Table 
            columns={comparisonColumns} 
            dataSource={comparisonData} 
            pagination={false}
            style={{ overflowX: 'auto' }}
          />
        </div>

        {/* FAQ Section */}
        <div style={{ marginTop: '60px' }}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: '40px' }}>
            Frequently Asked Questions
          </Title>
          <Collapse defaultActiveKey={['1']} style={{ maxWidth: '800px', margin: '0 auto' }}>
            {faqItems.map(item => (
              <Panel 
                header={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <QuestionCircleOutlined style={{ marginRight: '10px', color: '#3a84af' }} />
                    <span>{item.question}</span>
                  </div>
                } 
                key={item.key}
              >
                <Paragraph>{item.answer}</Paragraph>
              </Panel>
            ))}
          </Collapse>
        </div>

        {/* Testimonials Section */}
        <div style={{ marginTop: '60px' }}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: '40px' }}>
            What Our Customers Say
          </Title>
          <Row gutter={[24, 24]}>
            {testimonials.map(testimonial => (
              <Col xs={24} md={8} key={testimonial.key}>
                <Card
                  hoverable
                  style={{ height: '100%' }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Avatar size={50} style={{ backgroundColor: '#3a84af' }}>
                        {testimonial.avatar}
                      </Avatar>
                      <div>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <StarFilled key={i} style={{ color: '#faad14' }} />
                        ))}
                      </div>
                    </div>
                    <Paragraph style={{ fontStyle: 'italic' }}>
                      "{testimonial.text}"
                    </Paragraph>
                    <Divider style={{ margin: '12px 0' }} />
                    <div>
                      <Text strong>{testimonial.name}</Text>
                      <br />
                      <Text type="secondary">{testimonial.position}</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

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