import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Progress, Typography, Divider } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined, PhoneOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Results = () => {
  const [metrics, setMetrics] = useState({
    totalSales: 24890,
    totalLeads: 1256,
    conversionRate: 5.2,
    averageDealSize: 178.5,
    topSellers: [],
    topBuyers: [],
    recentTransactions: []
  });

  // In a real app, fetch actual data
  useEffect(() => {
    // Simulating data fetch
    setMetrics({
      totalSales: 24890,
      totalLeads: 1256,
      conversionRate: 5.2,
      averageDealSize: 178.5,
      topSellers: [
        { id: 1, name: 'Acme Lead Gen', sales: 452, revenue: 78500, performance: 87 },
        { id: 2, name: 'LeadMasters', sales: 389, revenue: 65400, performance: 82 },
        { id: 3, name: 'Prime Data', sales: 310, revenue: 54200, performance: 79 },
        { id: 4, name: 'Quality Leads Inc', sales: 245, revenue: 42300, performance: 73 },
      ],
      topBuyers: [
        { id: 1, name: 'Enterprise Solutions', purchases: 215, spent: 38700, leadQuality: 92 },
        { id: 2, name: 'Growth Marketing', purchases: 187, spent: 33200, leadQuality: 88 },
        { id: 3, name: 'TechBuyers', purchases: 156, spent: 27900, leadQuality: 85 },
        { id: 4, name: 'LeadConverters', purchases: 132, spent: 23100, leadQuality: 79 },
      ],
      recentTransactions: [
        { id: 1, seller: 'Acme Lead Gen', buyer: 'Enterprise Solutions', quantity: 50, amount: 8750, date: '2023-04-12' },
        { id: 2, seller: 'LeadMasters', buyer: 'Growth Marketing', quantity: 35, amount: 5950, date: '2023-04-11' },
        { id: 3, seller: 'Prime Data', buyer: 'TechBuyers', quantity: 25, amount: 4375, date: '2023-04-10' },
        { id: 4, seller: 'Quality Leads Inc', buyer: 'LeadConverters', quantity: 40, amount: 6800, date: '2023-04-09' },
      ]
    });
  }, []);

  const sellerColumns = [
    { title: 'Seller', dataIndex: 'name', key: 'name' },
    { title: 'Leads Sold', dataIndex: 'sales', key: 'sales' },
    { title: 'Revenue', dataIndex: 'revenue', key: 'revenue', render: val => `$${val.toLocaleString()}` },
    { 
      title: 'Performance', 
      dataIndex: 'performance', 
      key: 'performance',
      render: val => <Progress percent={val} size="small" status={val > 80 ? "success" : val > 60 ? "normal" : "exception"} />
    },
  ];

  const buyerColumns = [
    { title: 'Buyer', dataIndex: 'name', key: 'name' },
    { title: 'Leads Purchased', dataIndex: 'purchases', key: 'purchases' },
    { title: 'Total Spent', dataIndex: 'spent', key: 'spent', render: val => `$${val.toLocaleString()}` },
    { 
      title: 'Lead Quality', 
      dataIndex: 'leadQuality', 
      key: 'leadQuality',
      render: val => <Progress percent={val} size="small" status={val > 80 ? "success" : val > 60 ? "normal" : "exception"} />
    },
  ];

  const transactionColumns = [
    { title: 'Seller', dataIndex: 'seller', key: 'seller' },
    { title: 'Buyer', dataIndex: 'buyer', key: 'buyer' },
    { title: 'Leads', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: val => `$${val.toLocaleString()}` },
    { title: 'Date', dataIndex: 'date', key: 'date' },
  ];

  return (
    <div className="marketplace-results">
      <Title level={2}>Marketplace Results</Title>
      <Divider />
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Sales"
              value={metrics.totalSales}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Leads"
              value={metrics.totalLeads}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#0050b3' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Conversion Rate"
              value={metrics.conversionRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: metrics.conversionRate > 5 ? '#3f8600' : '#cf1322' }}
              prefix={metrics.conversionRate > 5 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Average Deal Size"
              value={metrics.averageDealSize}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">Top Sellers</Divider>
      <Table 
        dataSource={metrics.topSellers} 
        columns={sellerColumns} 
        rowKey="id"
        pagination={false}
      />

      <Divider orientation="left">Top Buyers</Divider>
      <Table 
        dataSource={metrics.topBuyers} 
        columns={buyerColumns} 
        rowKey="id"
        pagination={false}
      />

      <Divider orientation="left">Recent Transactions</Divider>
      <Table 
        dataSource={metrics.recentTransactions} 
        columns={transactionColumns} 
        rowKey="id"
        pagination={false}
      />
    </div>
  );
};

export default Results; 