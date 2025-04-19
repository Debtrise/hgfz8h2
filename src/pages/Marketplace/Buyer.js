import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Tag, Tabs, Form, Input, Select, InputNumber, Typography, Divider, Badge, Space, Modal, Rate, Progress, Avatar, Statistic } from 'antd';
import { ShoppingCartOutlined, CheckCircleOutlined, SearchOutlined, HistoryOutlined, StarOutlined, InfoCircleOutlined, FilterOutlined, DollarOutlined, UserOutlined, PercentageOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const Buyer = () => {
  const [availableLeads, setAvailableLeads] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [viewLeadDetails, setViewLeadDetails] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'insurance', name: 'Insurance', icon: '🛡️' },
    { id: 'tax-relief', name: 'Tax Relief', icon: '💰' },
    { id: 'debt-settlement', name: 'Debt Settlement', icon: '💳' },
    { id: 'real-estate', name: 'Real Estate', icon: '🏠' },
    { id: 'mortgage', name: 'Mortgage', icon: '🏦' },
    { id: 'personal-loan', name: 'Personal Loan', icon: '💵' },
  ];

  // Simulate fetching data
  useEffect(() => {
    // Mock data with enhanced lead information
    setAvailableLeads([
      {
        id: 1,
        seller: {
          name: 'Acme Lead Gen',
          rating: 4.8,
          totalSales: 1250,
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
        },
        category: 'insurance',
        title: 'High-Intent Auto Insurance Leads',
        description: 'Fresh leads from our proprietary lead generation system. Verified contact information and purchase intent.',
        quantity: 100,
        price: 175,
        conversionRate: 0.12,
        qualityScore: 92,
        location: 'USA',
        expiry: '2023-05-15',
        uniqueFactors: [
          'Real-time lead delivery',
          '100% phone verified',
          'Purchase intent scoring',
          'Exclusive to our platform'
        ]
      },
      {
        id: 2,
        seller: {
          name: 'LeadMasters',
          rating: 4.5,
          totalSales: 980,
          avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
        },
        category: 'tax-relief',
        title: 'Tax Resolution Qualified Leads',
        description: 'Pre-qualified leads with verified tax debt amounts and resolution interest.',
        quantity: 75,
        price: 225,
        conversionRate: 0.15,
        qualityScore: 88,
        location: 'Europe',
        expiry: '2023-05-20',
        uniqueFactors: [
          'Tax debt amount verified',
          'Resolution timeline provided',
          'Financial situation assessed',
          'Exclusive to our platform'
        ]
      },
      // Add more mock leads...
    ]);
    
    setPurchaseHistory([
      { id: 101, seller: 'Acme Lead Gen', category: 'Insurance', quantity: 50, totalPrice: 8750, date: '2023-04-10', status: 'Delivered' },
      { id: 102, seller: 'LeadMasters', category: 'Tax Relief', quantity: 35, totalPrice: 7875, date: '2023-04-05', status: 'Processing' },
    ]);
  }, []);

  const addToCart = (lead) => {
    const existingItem = cartItems.find(item => item.id === lead.id);
    if (existingItem) {
      setCartItems(
        cartItems.map(item => 
          item.id === lead.id 
            ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.price } 
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { 
        ...lead, 
        purchaseQuantity: 1, 
        totalPrice: lead.price 
      }]);
    }
  };

  const removeFromCart = (leadId) => {
    setCartItems(cartItems.filter(item => item.id !== leadId));
  };

  const checkout = () => {
    Modal.success({
      title: 'Purchase Successful',
      content: `You've purchased ${cartItems.reduce((total, item) => total + item.purchaseQuantity, 0)} leads for 
                $${cartItems.reduce((total, item) => total + item.totalPrice, 0).toLocaleString()}`,
      onOk: () => {
        const purchaseDate = new Date().toISOString().split('T')[0];
        const newPurchases = cartItems.map((item, index) => ({
          id: 1000 + purchaseHistory.length + index,
          seller: item.seller.name,
          category: item.category,
          quantity: item.purchaseQuantity,
          totalPrice: item.totalPrice,
          date: purchaseDate,
          status: 'Processing'
        }));
        
        setPurchaseHistory([...newPurchases, ...purchaseHistory]);
        setCartItems([]);
      }
    });
  };

  const viewDetails = (lead) => {
    setViewLeadDetails(lead);
  };

  const closeDetails = () => {
    setViewLeadDetails(null);
  };

  const updateCartQuantity = (leadId, quantity) => {
    setCartItems(
      cartItems.map(item => 
        item.id === leadId 
          ? { ...item, purchaseQuantity: quantity, totalPrice: quantity * item.price } 
          : item
      )
    );
  };

  const filteredLeads = availableLeads.filter(lead => {
    const matchesCategory = selectedCategory === 'all' || lead.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      lead.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.seller.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="marketplace-buyer">
      <div className="marketplace-header">
        <Title level={2}>Lead Marketplace</Title>
        <Text type="secondary">Find high-quality leads for your business</Text>
      </div>

      <div className="category-selector">
        <div className="category-list">
          <Button 
            type={selectedCategory === 'all' ? 'primary' : 'default'}
            onClick={() => setSelectedCategory('all')}
          >
            All Categories
          </Button>
          {categories.map(category => (
            <Button
              key={category.id}
              type={selectedCategory === category.id ? 'primary' : 'default'}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.icon} {category.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="search-filters">
        <Input
          placeholder="Search leads or sellers..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ width: 300 }}
        />
        <Select defaultValue="relevance" style={{ width: 150 }}>
          <Option value="relevance">Sort by Relevance</Option>
          <Option value="price-asc">Price: Low to High</Option>
          <Option value="price-desc">Price: High to Low</Option>
          <Option value="rating">Highest Rated</Option>
        </Select>
      </div>

      <Row gutter={[24, 24]} className="lead-grid">
        {filteredLeads.map(lead => (
          <Col xs={24} sm={12} lg={8} key={lead.id}>
            <Card 
              className="lead-card"
              hoverable
              cover={
                <div className="lead-card-header">
                  <div className="seller-info">
                    <Avatar src={lead.seller.avatar} icon={<UserOutlined />} />
                    <div className="seller-details">
                      <Text strong>{lead.seller.name}</Text>
                      <Rate disabled defaultValue={lead.seller.rating} allowHalf />
                    </div>
                  </div>
                  <Tag color="blue">{categories.find(c => c.id === lead.category)?.name}</Tag>
                </div>
              }
            >
              <div className="lead-content">
                <Title level={4}>{lead.title}</Title>
                <Text type="secondary">{lead.description}</Text>
                
                <div className="lead-metrics">
                  <Statistic
                    title="Conversion Rate"
                    value={lead.conversionRate * 100}
                    suffix="%"
                    prefix={<PercentageOutlined />}
                  />
                  <Statistic
                    title="Quality Score"
                    value={lead.qualityScore}
                    suffix="/100"
                  />
                </div>

                <div className="unique-factors">
                  {lead.uniqueFactors.map((factor, index) => (
                    <Tag key={index} color="green">{factor}</Tag>
                  ))}
                </div>

                <div className="lead-footer">
                  <div className="price-info">
                    <Text strong>${lead.price}</Text>
                    <Text type="secondary">per lead</Text>
                  </div>
                  <Button 
                    type="primary" 
                    icon={<ShoppingCartOutlined />}
                    onClick={() => addToCart(lead)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title="Lead Details"
        visible={!!viewLeadDetails}
        onCancel={closeDetails}
        width={800}
        footer={[
          <Button key="close" onClick={closeDetails}>Close</Button>,
          <Button 
            key="add" 
            type="primary" 
            onClick={() => {
              if (viewLeadDetails) {
                addToCart(viewLeadDetails);
                closeDetails();
              }
            }}
          >
            Add to Cart
          </Button>
        ]}
      >
        {viewLeadDetails && (
          <div className="lead-details">
            <div className="seller-profile">
              <Avatar size={64} src={viewLeadDetails.seller.avatar} />
              <div>
                <Title level={4}>{viewLeadDetails.seller.name}</Title>
                <Rate disabled defaultValue={viewLeadDetails.seller.rating} allowHalf />
                <Text type="secondary">{viewLeadDetails.seller.totalSales} sales</Text>
              </div>
            </div>

            <Divider />

            <div className="lead-info">
              <Title level={4}>{viewLeadDetails.title}</Title>
              <Text>{viewLeadDetails.description}</Text>

              <div className="metrics-grid">
                <Card>
                  <Statistic
                    title="Conversion Rate"
                    value={viewLeadDetails.conversionRate * 100}
                    suffix="%"
                    prefix={<PercentageOutlined />}
                  />
                </Card>
                <Card>
                  <Statistic
                    title="Quality Score"
                    value={viewLeadDetails.qualityScore}
                    suffix="/100"
                  />
                </Card>
                <Card>
                  <Statistic
                    title="Available Leads"
                    value={viewLeadDetails.quantity}
                  />
                </Card>
                <Card>
                  <Statistic
                    title="Price per Lead"
                    value={viewLeadDetails.price}
                    prefix={<DollarOutlined />}
                  />
                </Card>
              </div>

              <div className="unique-factors">
                <Title level={5}>Unique Selling Points</Title>
                <ul>
                  {viewLeadDetails.uniqueFactors.map((factor, index) => (
                    <li key={index}>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} /> {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Buyer; 