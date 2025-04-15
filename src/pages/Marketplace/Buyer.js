import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Tag, Tabs, Form, Input, Select, InputNumber, Typography, Divider, Badge, Space, Modal } from 'antd';
import { ShoppingCartOutlined, CheckCircleOutlined, SearchOutlined, HistoryOutlined, StarOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const Buyer = () => {
  const [availableLeads, setAvailableLeads] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [viewLeadDetails, setViewLeadDetails] = useState(null);

  // Simulate fetching data
  useEffect(() => {
    // Mock data
    setAvailableLeads([
      { id: 1, seller: 'Acme Lead Gen', category: 'Insurance', quantity: 100, price: 175, rating: 4.8, location: 'USA', expiry: '2023-05-15' },
      { id: 2, seller: 'LeadMasters', category: 'Real Estate', quantity: 75, price: 225, rating: 4.5, location: 'Europe', expiry: '2023-05-20' },
      { id: 3, seller: 'Prime Data', category: 'Finance', quantity: 50, price: 195, rating: 4.6, location: 'USA', expiry: '2023-05-18' },
      { id: 4, seller: 'Quality Leads Inc', category: 'Automotive', quantity: 120, price: 150, rating: 4.3, location: 'Canada', expiry: '2023-05-25' },
      { id: 5, seller: 'Data Finders', category: 'Healthcare', quantity: 85, price: 210, rating: 4.7, location: 'USA', expiry: '2023-05-22' },
    ]);
    
    setPurchaseHistory([
      { id: 101, seller: 'Acme Lead Gen', category: 'Insurance', quantity: 50, totalPrice: 8750, date: '2023-04-10', status: 'Delivered' },
      { id: 102, seller: 'LeadMasters', category: 'Real Estate', quantity: 35, totalPrice: 7875, date: '2023-04-05', status: 'Processing' },
      { id: 103, seller: 'Prime Data', category: 'Finance', quantity: 25, totalPrice: 4875, date: '2023-04-01', status: 'Delivered' },
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
    // In a real app, this would connect to payment processing
    Modal.success({
      title: 'Purchase Successful',
      content: `You've purchased ${cartItems.reduce((total, item) => total + item.purchaseQuantity, 0)} leads for 
                $${cartItems.reduce((total, item) => total + item.totalPrice, 0).toLocaleString()}`,
      onOk: () => {
        // Add purchases to history and clear cart
        const purchaseDate = new Date().toISOString().split('T')[0];
        const newPurchases = cartItems.map((item, index) => ({
          id: 1000 + purchaseHistory.length + index,
          seller: item.seller,
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

  const leadColumns = [
    { title: 'Seller', dataIndex: 'seller', key: 'seller' },
    { title: 'Category', dataIndex: 'category', key: 'category', 
      render: category => <Tag color="blue">{category}</Tag> 
    },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Price per Lead', dataIndex: 'price', key: 'price', render: val => `$${val}` },
    { title: 'Location', dataIndex: 'location', key: 'location' },
    { title: 'Expiry', dataIndex: 'expiry', key: 'expiry' },
    { title: 'Rating', dataIndex: 'rating', key: 'rating', 
      render: rating => (
        <Space>
          <StarOutlined style={{ color: '#faad14' }} />
          <span>{rating.toFixed(1)}</span>
        </Space>
      ) 
    },
    { 
      title: 'Actions', 
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<ShoppingCartOutlined />} 
            onClick={() => addToCart(record)}
          >
            Add to Cart
          </Button>
          <Button 
            icon={<InfoCircleOutlined />} 
            onClick={() => viewDetails(record)}
          >
            Details
          </Button>
        </Space>
      ),
    },
  ];

  const historyColumns = [
    { title: 'Order ID', dataIndex: 'id', key: 'id' },
    { title: 'Seller', dataIndex: 'seller', key: 'seller' },
    { title: 'Category', dataIndex: 'category', key: 'category', 
      render: category => <Tag color="blue">{category}</Tag> 
    },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Total Price', dataIndex: 'totalPrice', key: 'totalPrice', render: val => `$${val.toLocaleString()}` },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: status => (
        <Tag color={status === 'Delivered' ? 'green' : 'geekblue'}>
          {status}
        </Tag>
      ) 
    },
    { 
      title: 'Actions', 
      key: 'actions',
      render: () => (
        <Button icon={<HistoryOutlined />}>View Details</Button>
      ),
    },
  ];

  const cartColumns = [
    { title: 'Seller', dataIndex: 'seller', key: 'seller' },
    { title: 'Category', dataIndex: 'category', key: 'category', 
      render: category => <Tag color="blue">{category}</Tag> 
    },
    { 
      title: 'Quantity', 
      dataIndex: 'purchaseQuantity', 
      key: 'purchaseQuantity',
      render: (quantity, record) => (
        <InputNumber 
          min={1} 
          max={record.quantity} 
          value={quantity || 1} 
          onChange={val => updateCartQuantity(record.id, val)} 
        />
      )
    },
    { title: 'Price per Lead', dataIndex: 'price', key: 'price', render: val => `$${val}` },
    { title: 'Total', dataIndex: 'totalPrice', key: 'totalPrice', render: val => `$${val}` },
    { 
      title: 'Actions', 
      key: 'actions',
      render: (_, record) => (
        <Button danger onClick={() => removeFromCart(record.id)}>Remove</Button>
      ),
    },
  ];

  return (
    <div className="marketplace-buyer">
      <Title level={2}>Lead Marketplace - Buyer Portal</Title>
      <Divider />
      
      <Tabs defaultActiveKey="browse">
        <TabPane 
          tab={
            <span>
              <SearchOutlined />
              Browse Leads
            </span>
          } 
          key="browse"
        >
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col span={24}>
              <Card title="Find Leads" className="marketplace-stats-card">
                <Form layout="inline">
                  <Form.Item label="Category">
                    <Select style={{ width: 120 }} defaultValue="">
                      <Option value="">All</Option>
                      <Option value="insurance">Insurance</Option>
                      <Option value="real-estate">Real Estate</Option>
                      <Option value="finance">Finance</Option>
                      <Option value="automotive">Automotive</Option>
                      <Option value="healthcare">Healthcare</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Location">
                    <Select style={{ width: 120 }} defaultValue="">
                      <Option value="">All</Option>
                      <Option value="usa">USA</Option>
                      <Option value="europe">Europe</Option>
                      <Option value="canada">Canada</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Price Range">
                    <InputNumber style={{ width: 80 }} placeholder="Min" /> - <InputNumber style={{ width: 80 }} placeholder="Max" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" icon={<SearchOutlined />}>Search</Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
          
          <Table 
            dataSource={availableLeads} 
            columns={leadColumns} 
            rowKey="id"
            className="marketplace-table"
          />
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <ShoppingCartOutlined />
              Cart {cartItems.length > 0 && <Badge count={cartItems.length} style={{ marginLeft: 5 }} />}
            </span>
          } 
          key="cart"
        >
          {cartItems.length > 0 ? (
            <>
              <Table 
                dataSource={cartItems} 
                columns={cartColumns} 
                rowKey="id"
                className="marketplace-table"
                footer={() => (
                  <div style={{ textAlign: 'right' }}>
                    <Text strong style={{ marginRight: 20 }}>
                      Total: ${cartItems.reduce((sum, item) => sum + (item.totalPrice || item.price), 0)}
                    </Text>
                    <Button type="primary" size="large" onClick={checkout} icon={<CheckCircleOutlined />}>Checkout</Button>
                  </div>
                )}
              />
            </>
          ) : (
            <div className="cart-empty">
              <ShoppingCartOutlined style={{ fontSize: 48, color: '#ccc' }} />
              <p>Your cart is empty</p>
              <Button type="primary" onClick={() => document.querySelector('[data-tab-key="browse"]')?.click()}>
                Browse Leads
              </Button>
            </div>
          )}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <HistoryOutlined />
              Purchase History
            </span>
          } 
          key="history"
        >
          <Table 
            dataSource={purchaseHistory} 
            columns={historyColumns} 
            rowKey="id"
            className="marketplace-table"
          />
        </TabPane>
      </Tabs>
      
      <Modal
        title="Lead Details"
        visible={!!viewLeadDetails}
        onCancel={closeDetails}
        footer={[
          <Button key="close" onClick={closeDetails}>Close</Button>,
          <Button key="add" type="primary" onClick={() => {
            if (viewLeadDetails) {
              addToCart(viewLeadDetails);
              closeDetails();
            }
          }}>
            Add to Cart
          </Button>
        ]}
      >
        {viewLeadDetails && (
          <div>
            <p><strong>Seller:</strong> {viewLeadDetails.seller}</p>
            <p><strong>Category:</strong> {viewLeadDetails.category}</p>
            <p><strong>Available Quantity:</strong> {viewLeadDetails.quantity}</p>
            <p><strong>Price per Lead:</strong> ${viewLeadDetails.price}</p>
            <p><strong>Location:</strong> {viewLeadDetails.location}</p>
            <p><strong>Expiry Date:</strong> {viewLeadDetails.expiry}</p>
            <p><strong>Seller Rating:</strong> {viewLeadDetails.rating.toFixed(1)}/5.0</p>
            <Divider />
            <p><strong>Lead Quality Guarantee:</strong> All leads come with a 72-hour verification period.</p>
            <p><strong>Format:</strong> CSV, Excel or direct API integration</p>
            <p><strong>Fields Included:</strong> Name, Email, Phone, Address, Interest Level, Time Stamp</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Buyer; 