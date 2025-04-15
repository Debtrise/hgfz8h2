import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Tag, Tabs, Form, Input, Select, InputNumber, Typography, Divider, Progress, Upload, Statistic, Space, Modal, DatePicker } from 'antd';
import { 
  UploadOutlined, 
  BarChartOutlined, 
  DollarOutlined, 
  TeamOutlined, 
  CheckCircleOutlined, 
  HistoryOutlined, 
  PlusOutlined, 
  FileExcelOutlined, 
  FileTextOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const Seller = () => {
  const [listedLeads, setListedLeads] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [earnings, setEarnings] = useState({
    total: 123750,
    thisMonth: 34200,
    pending: 12500,
    leadsSold: 845
  });
  const [addLeadModalVisible, setAddLeadModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  // Simulate fetching data
  useEffect(() => {
    // Mock data
    setListedLeads([
      { id: 1, category: 'Insurance', quantity: 250, available: 175, price: 185, status: 'Active', quality: 92, created: '2023-04-01', sales: 75 },
      { id: 2, category: 'Real Estate', quantity: 200, available: 120, price: 225, status: 'Active', quality: 88, created: '2023-04-05', sales: 80 },
      { id: 3, category: 'Finance', quantity: 150, available: 50, price: 195, status: 'Low Stock', quality: 90, created: '2023-04-10', sales: 100 },
      { id: 4, category: 'Automotive', quantity: 300, available: 0, price: 150, status: 'Sold Out', quality: 85, created: '2023-04-15', sales: 300 },
    ]);
    
    setSalesHistory([
      { id: 101, buyer: 'Enterprise Solutions', category: 'Insurance', quantity: 50, totalPrice: 9250, date: '2023-04-12', status: 'Completed' },
      { id: 102, buyer: 'Growth Marketing', category: 'Real Estate', quantity: 35, totalPrice: 7875, date: '2023-04-11', status: 'Completed' },
      { id: 103, buyer: 'TechBuyers', category: 'Finance', quantity: 25, totalPrice: 4875, date: '2023-04-10', status: 'Processing' },
      { id: 104, buyer: 'LeadConverters', category: 'Automotive', quantity: 40, totalPrice: 6000, date: '2023-04-09', status: 'Completed' },
    ]);
  }, []);

  const handleAddLead = (values) => {
    // In a real app, this would submit to an API
    const newLead = {
      id: listedLeads.length + 100,
      category: values.category,
      quantity: values.quantity,
      available: values.quantity,
      price: values.price,
      status: 'Active',
      quality: 85, // Would be determined later
      created: new Date().toISOString().split('T')[0],
      sales: 0
    };
    
    setListedLeads([newLead, ...listedLeads]);
    setAddLeadModalVisible(false);
    form.resetFields();
  };

  const editListing = (record) => {
    form.setFieldsValue({
      category: record.category,
      quantity: record.quantity,
      price: record.price,
      description: 'High-quality leads with verified contact information'
    });
    setAddLeadModalVisible(true);
  };

  const toggleListingStatus = (id, currentStatus) => {
    let newStatus;
    if (currentStatus === 'Active') {
      newStatus = 'Paused';
    } else if (currentStatus === 'Paused') {
      newStatus = 'Active';
    } else {
      return; // Don't change if Sold Out or Low Stock
    }
    
    setListedLeads(
      listedLeads.map(lead => 
        lead.id === id ? { ...lead, status: newStatus } : lead
      )
    );
  };

  const uploadProps = {
    name: 'file',
    action: 'https://api.example.com/upload',
    headers: {
      authorization: 'auth-token',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        console.log(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        console.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  const listingColumns = [
    { title: 'Category', dataIndex: 'category', key: 'category', 
      render: category => <Tag color="blue">{category}</Tag> 
    },
    { title: 'Total Leads', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Available', dataIndex: 'available', key: 'available' },
    { title: 'Price per Lead', dataIndex: 'price', key: 'price', render: val => `$${val}` },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: status => {
        let color;
        if (status === 'Active') color = 'green';
        else if (status === 'Paused') color = 'orange';
        else if (status === 'Low Stock') color = 'gold';
        else if (status === 'Sold Out') color = 'red';
        
        return <Tag color={color}>{status}</Tag>;
      }
    },
    { 
      title: 'Quality Score', 
      dataIndex: 'quality', 
      key: 'quality',
      render: quality => <Progress percent={quality} size="small" status={quality > 80 ? "success" : "normal"} />
    },
    { title: 'Created', dataIndex: 'created', key: 'created' },
    { title: 'Sales', dataIndex: 'sales', key: 'sales' },
    { 
      title: 'Actions', 
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type={record.status === 'Active' ? 'default' : 'primary'} 
            onClick={() => toggleListingStatus(record.id, record.status)}
            disabled={record.status === 'Sold Out' || record.status === 'Low Stock'}
          >
            {record.status === 'Active' ? 'Pause' : 'Activate'}
          </Button>
          <Button onClick={() => editListing(record)}>Edit</Button>
        </Space>
      ),
    },
  ];

  const salesColumns = [
    { title: 'Order ID', dataIndex: 'id', key: 'id' },
    { title: 'Buyer', dataIndex: 'buyer', key: 'buyer' },
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
        <Tag color={status === 'Completed' ? 'green' : 'geekblue'}>
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

  const topBuyerColumns = [
    { title: 'Buyer', dataIndex: 'buyer', key: 'buyer' },
    { title: 'Total Purchases', dataIndex: 'purchases', key: 'purchases' },
    { title: 'Revenue', dataIndex: 'revenue', key: 'revenue', render: val => `$${val.toLocaleString()}` },
    { title: 'Last Purchase', dataIndex: 'lastPurchase', key: 'lastPurchase' },
  ];

  const topBuyers = [
    { id: 1, buyer: 'Enterprise Solutions', purchases: 215, revenue: 38700, lastPurchase: '2023-04-12' },
    { id: 2, buyer: 'Growth Marketing', purchases: 187, revenue: 33200, lastPurchase: '2023-04-11' },
    { id: 3, buyer: 'TechBuyers', purchases: 156, revenue: 27900, lastPurchase: '2023-04-10' },
  ];

  return (
    <div className="marketplace-seller">
      <Title level={2}>Lead Marketplace - Seller Portal</Title>
      <Divider />
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Earnings"
              value={earnings.total}
              precision={0}
              prefix="$"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="This Month"
              value={earnings.thisMonth}
              precision={0}
              prefix="$"
              valueStyle={{ color: '#0050b3' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Payments"
              value={earnings.pending}
              precision={0}
              prefix="$"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Leads Sold"
              value={earnings.leadsSold}
              valueStyle={{ color: '#722ed1' }}
              suffix="leads"
            />
          </Card>
        </Col>
      </Row>
      
      <Tabs defaultActiveKey="listings">
        <TabPane 
          tab={
            <span>
              <BarChartOutlined />
              My Listings
            </span>
          } 
          key="listings"
        >
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => {
                form.resetFields();
                setAddLeadModalVisible(true);
              }}
            >
              Add New Lead Listing
            </Button>
          </div>
          
          <Table 
            dataSource={listedLeads} 
            columns={listingColumns} 
            rowKey="id"
          />
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <DollarOutlined />
              Sales
            </span>
          } 
          key="sales"
        >
          <Table 
            dataSource={salesHistory} 
            columns={salesColumns} 
            rowKey="id"
          />
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <TeamOutlined />
              Top Buyers
            </span>
          } 
          key="buyers"
        >
          <Table 
            dataSource={topBuyers} 
            columns={topBuyerColumns} 
            rowKey="id"
          />
        </TabPane>
      </Tabs>
      
      <Modal
        title="Add New Lead Listing"
        visible={addLeadModalVisible}
        onCancel={() => setAddLeadModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddLead}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Lead Category"
                rules={[{ required: true, message: 'Please select the category' }]}
              >
                <Select placeholder="Select a category">
                  <Option value="Insurance">Insurance</Option>
                  <Option value="Real Estate">Real Estate</Option>
                  <Option value="Finance">Finance</Option>
                  <Option value="Automotive">Automotive</Option>
                  <Option value="Healthcare">Healthcare</Option>
                  <Option value="Education">Education</Option>
                  <Option value="Technology">Technology</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="Lead Quantity"
                rules={[{ required: true, message: 'Please enter the quantity' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="Enter quantity" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Price per Lead"
                rules={[{ required: true, message: 'Please enter the price' }]}
              >
                <InputNumber
                  min={1}
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  style={{ width: '100%' }}
                  placeholder="Enter price"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiry"
                label="Expiry Date"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={4} placeholder="Describe your leads (quality, source, targeting, etc.)" />
          </Form.Item>
          
          <Divider>Upload Lead Data</Divider>
          
          <Row gutter={16}>
            <Col span={12}>
              <Upload {...uploadProps}>
                <Button icon={<FileExcelOutlined />} style={{ width: '100%', height: 80 }}>
                  Upload CSV / Excel File
                </Button>
              </Upload>
            </Col>
            <Col span={12}>
              <Upload {...uploadProps}>
                <Button icon={<FileTextOutlined />} style={{ width: '100%', height: 80 }}>
                  Upload Sample Leads
                </Button>
              </Upload>
            </Col>
          </Row>
          
          <Paragraph style={{ marginTop: 16 }}>
            <Text type="secondary">
              By uploading, you confirm that your leads comply with our data quality standards
              and you have proper consent to sell this data.
            </Text>
          </Paragraph>
          
          <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
            <Button style={{ marginRight: 8 }} onClick={() => setAddLeadModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" icon={<CheckCircleOutlined />}>
              Create Listing
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Seller; 