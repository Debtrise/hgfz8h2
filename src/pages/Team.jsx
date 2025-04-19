import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Avatar,
  List,
  Button,
  Badge,
  Typography,
  Space,
  Divider,
  Tooltip,
} from 'antd';
import {
  TeamOutlined,
  TrophyOutlined,
  FireOutlined,
  StarOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Content } = Layout;
const { Title, Text } = Typography;

// Mock data for team stats
const mockTeamStats = {
  teamName: "Sales Team Alpha",
  totalAgents: 12,
  activeAgents: 10,
  teamGoals: {
    dailyCalls: 200,
    currentCalls: 156,
    dailyDeals: 15,
    currentDeals: 9,
    customerSatisfaction: 92,
  },
  topPerformers: [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "SJ",
      calls: 45,
      deals: 8,
      satisfaction: 98,
    },
    {
      id: 2,
      name: "Michael Chen",
      avatar: "MC",
      calls: 42,
      deals: 7,
      satisfaction: 96,
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      avatar: "ER",
      calls: 38,
      deals: 6,
      satisfaction: 95,
    },
  ],
  teamMotivation: {
    currentStreak: 5,
    longestStreak: 12,
    dailyQuote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
  },
};

const Team = () => {
  const { currentAgent } = useAuth();
  const [teamStats, setTeamStats] = useState(mockTeamStats);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, this would fetch updated stats from the server
      setTeamStats(prevStats => ({
        ...prevStats,
        teamGoals: {
          ...prevStats.teamGoals,
          currentCalls: Math.min(
            prevStats.teamGoals.currentCalls + Math.floor(Math.random() * 3),
            prevStats.teamGoals.dailyCalls
          ),
          currentDeals: Math.min(
            prevStats.teamGoals.currentDeals + Math.floor(Math.random() * 2),
            prevStats.teamGoals.dailyDeals
          ),
        },
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const renderTeamStats = () => (
    <Card title="Team Overview" style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Statistic
            title="Active Agents"
            value={teamStats.activeAgents}
            suffix={`/ ${teamStats.totalAgents}`}
            prefix={<TeamOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Daily Calls"
            value={teamStats.teamGoals.currentCalls}
            suffix={`/ ${teamStats.teamGoals.dailyCalls}`}
            prefix={<PhoneOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Daily Deals"
            value={teamStats.teamGoals.currentDeals}
            suffix={`/ ${teamStats.teamGoals.dailyDeals}`}
            prefix={<CheckCircleOutlined />}
          />
        </Col>
      </Row>
    </Card>
  );

  const renderTeamGoals = () => (
    <Card title="Team Goals" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>Daily Calls Target</Text>
          <Progress
            percent={Math.round((teamStats.teamGoals.currentCalls / teamStats.teamGoals.dailyCalls) * 100)}
            status={teamStats.teamGoals.currentCalls >= teamStats.teamGoals.dailyCalls ? 'success' : 'active'}
          />
        </div>
        <div>
          <Text strong>Daily Deals Target</Text>
          <Progress
            percent={Math.round((teamStats.teamGoals.currentDeals / teamStats.teamGoals.dailyDeals) * 100)}
            status={teamStats.teamGoals.currentDeals >= teamStats.teamGoals.dailyDeals ? 'success' : 'active'}
          />
        </div>
        <div>
          <Text strong>Customer Satisfaction</Text>
          <Progress
            percent={teamStats.teamGoals.customerSatisfaction}
            status={teamStats.teamGoals.customerSatisfaction >= 90 ? 'success' : 'active'}
          />
        </div>
      </Space>
    </Card>
  );

  const renderTopPerformers = () => (
    <Card title="Top Performers" style={{ marginBottom: 16 }}>
      <List
        dataSource={teamStats.topPerformers}
        renderItem={(agent) => (
          <List.Item
            actions={[
              <Tooltip title="Calls Today">
                <Space>
                  <PhoneOutlined />
                  <Text strong>{agent.calls}</Text>
                </Space>
              </Tooltip>,
              <Tooltip title="Deals Closed">
                <Space>
                  <CheckCircleOutlined />
                  <Text strong>{agent.deals}</Text>
                </Space>
              </Tooltip>,
              <Tooltip title="Satisfaction Score">
                <Space>
                  <StarOutlined />
                  <Text strong>{agent.satisfaction}%</Text>
                </Space>
              </Tooltip>,
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar>{agent.avatar}</Avatar>}
              title={<Text strong>{agent.name}</Text>}
            />
          </List.Item>
        )}
      />
    </Card>
  );

  const renderMotivation = () => (
    <Card title="Team Motivation">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <Title level={4} style={{ fontStyle: 'italic' }}>
            "{teamStats.teamMotivation.dailyQuote}"
          </Title>
          <Text type="secondary">- {teamStats.teamMotivation.author}</Text>
        </div>
        <Divider />
        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="Current Streak"
              value={teamStats.teamMotivation.currentStreak}
              prefix={<FireOutlined />}
              suffix="days"
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Longest Streak"
              value={teamStats.teamMotivation.longestStreak}
              prefix={<TrophyOutlined />}
              suffix="days"
            />
          </Col>
        </Row>
      </Space>
    </Card>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <Title level={2}>Team Dashboard</Title>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            {renderTeamStats()}
          </Col>
          <Col span={16}>
            {renderTeamGoals()}
            {renderTopPerformers()}
          </Col>
          <Col span={8}>
            {renderMotivation()}
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Team; 