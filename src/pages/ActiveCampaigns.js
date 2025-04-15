import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Spin } from 'antd';
import { PhoneOutlined, TeamOutlined } from '@ant-design/icons';
import apiService from '../services/apiService';
import './ActiveCampaigns.css';

const ActiveCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveCampaigns();
    const interval = setInterval(fetchActiveCampaigns, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveCampaigns = async () => {
    try {
      const response = await apiService.campaigns.getAll({ status: 'active' });
      if (response && response.data) {
        const campaignsWithMetrics = await Promise.all(
          response.data.map(async (campaign) => {
            try {
              const metrics = await apiService.campaigns.getMetrics(campaign.id);
              return {
                ...campaign,
                metrics: metrics.data || {}
              };
            } catch (err) {
              return {
                ...campaign,
                metrics: {}
              };
            }
          })
        );
        setCampaigns(campaignsWithMetrics);
      }
    } catch (err) {
      console.error('Error fetching active campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="small" />
      </div>
    );
  }

  return (
    <div className="active-campaigns">
      <Row gutter={[8, 8]}>
        {campaigns.map(campaign => (
          <Col span={24} key={campaign.id}>
            <Card className="campaign-card">
              <div className="campaign-header">
                <h3>{campaign.name}</h3>
                <span className={`status-badge ${campaign.status}`}>{campaign.status}</span>
              </div>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Total Calls"
                    value={campaign.metrics.totalCalls || 0}
                    prefix={<PhoneOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Active Agents"
                    value={campaign.metrics.activeAgents || 0}
                    prefix={<TeamOutlined />}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ActiveCampaigns; 