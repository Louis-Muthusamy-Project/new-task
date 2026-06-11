import React, { useState } from 'react';
import { Typography, Card, Table, Button, Input, Tag, Space, Dropdown, Menu, Modal, Form, Select } from 'antd';
import { motion } from 'framer-motion';
import { Search, Plus, MoreVertical, Edit2, Trash2, Shield, Eye } from 'lucide-react';

const { Title, Text } = Typography;
const { Option } = Select;

const Companies = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const companiesData = [
    { key: '1', name: 'Acme Corp', email: 'admin@acmecorp.com', users: 45, plan: 'Enterprise', status: 'Active', mrr: '$4,500', joined: 'Oct 24, 2023' },
    { key: '2', name: 'Globex Inc', email: 'hello@globex.io', users: 12, plan: 'Pro', status: 'Active', mrr: '$999', joined: 'Oct 23, 2023' },
    { key: '3', name: 'Soylent Corp', email: 'contact@soylent.co', users: 3, plan: 'Starter', status: 'Trial', mrr: '$0', joined: 'Oct 22, 2023' },
    { key: '4', name: 'Initech', email: 'bill@initech.com', users: 85, plan: 'Enterprise', status: 'Active', mrr: '$3,200', joined: 'Oct 20, 2023' },
    { key: '5', name: 'Umbrella Corp', email: 'admin@umbrella.net', users: 1, plan: 'Pro', status: 'Churned', mrr: '$0', joined: 'Oct 15, 2023' },
    { key: '6', name: 'Stark Industries', email: 'tony@stark.com', users: 120, plan: 'Enterprise', status: 'Active', mrr: '$8,500', joined: 'Sep 12, 2023' },
    { key: '7', name: 'Wayne Enterprises', email: 'bruce@wayne.com', users: 95, plan: 'Enterprise', status: 'Active', mrr: '$7,200', joined: 'Sep 10, 2023' },
  ];

  const getActionMenu = (record) => (
    <Menu>
      <Menu.Item key="view" icon={<Eye size={16} />}>View Details</Menu.Item>
      <Menu.Item key="edit" icon={<Edit2 size={16} />}>Edit Company</Menu.Item>
      <Menu.Item key="login" icon={<Shield size={16} />}>Login as Admin</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="delete" danger icon={<Trash2 size={16} />}>Delete Company</Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: 'Company / Agency',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
        </div>
      ),
    },
    {
      title: 'Active Users',
      dataIndex: 'users',
      key: 'users',
      render: (text) => <Text style={{ fontWeight: 500 }}>{text}</Text>,
    },
    {
      title: 'Subscription Plan',
      dataIndex: 'plan',
      key: 'plan',
      render: (plan) => (
        <Tag color={plan === 'Enterprise' ? 'purple' : plan === 'Pro' ? 'blue' : 'default'} style={{ borderRadius: 12, px: 8 }}>
          {plan}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'green';
        if (status === 'Trial') color = 'orange';
        if (status === 'Churned') color = 'red';
        return <Tag color={color} style={{ borderRadius: 12 }}>{status}</Tag>;
      },
    },
    {
      title: 'MRR',
      dataIndex: 'mrr',
      key: 'mrr',
      render: (text) => <Text style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{text}</Text>,
    },
    {
      title: 'Joined Date',
      dataIndex: 'joined',
      key: 'joined',
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: '',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Dropdown overlay={getActionMenu(record)} trigger={['click']} placement="bottomRight">
          <Button type="text" icon={<MoreVertical size={16} style={{ color: 'var(--text-secondary)' }} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <Title level={2} style={{ margin: '0 0 8px 0', fontWeight: 800, color: 'var(--text-primary)' }}>
            Companies
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Manage agencies and companies using the platform.
          </Text>
        </div>
        <Button 
          type="primary" 
          icon={<Plus size={18} />} 
          style={{ background: 'var(--accent-primary)', height: 44, borderRadius: 8, fontWeight: 600 }}
          onClick={() => setIsModalOpen(true)}
        >
          Add Company
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card 
          className="glassmorphism"
          style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}
          bodyStyle={{ padding: '20px 24px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <Input 
              placeholder="Search companies by name or email..." 
              prefix={<Search size={18} style={{ color: 'var(--text-tertiary)' }} />}
              style={{ width: 320, borderRadius: 8, height: 40 }}
            />
            <Space>
              <Select defaultValue="all" style={{ width: 140, height: 40 }} className="custom-select">
                <Option value="all">All Plans</Option>
                <Option value="enterprise">Enterprise</Option>
                <Option value="pro">Pro</Option>
                <Option value="starter">Starter</Option>
              </Select>
              <Select defaultValue="active" style={{ width: 140, height: 40 }} className="custom-select">
                <Option value="all">All Status</Option>
                <Option value="active">Active</Option>
                <Option value="trial">Trial</Option>
                <Option value="churned">Churned</Option>
              </Select>
            </Space>
          </div>

          <Table 
            columns={columns} 
            dataSource={companiesData} 
            pagination={{ pageSize: 10 }}
            className="custom-table"
          />
        </Card>
      </motion.div>

      <Modal
        title={<span style={{ fontWeight: 700, fontSize: 18 }}>Add New Company</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        className="glass-modal"
        centered
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item label={<Text style={{ fontWeight: 600 }}>Company Name</Text>} name="name" rules={[{ required: true }]}>
              <Input placeholder="e.g. Acme Corp" style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item label={<Text style={{ fontWeight: 600 }}>Admin Email</Text>} name="email" rules={[{ required: true, type: 'email' }]}>
              <Input placeholder="admin@company.com" style={{ borderRadius: 8 }} />
            </Form.Item>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item label={<Text style={{ fontWeight: 600 }}>Subscription Plan</Text>} name="plan" initialValue="pro">
              <Select style={{ borderRadius: 8 }}>
                <Option value="starter">Starter</Option>
                <Option value="pro">Pro</Option>
                <Option value="enterprise">Enterprise</Option>
              </Select>
            </Form.Item>
            <Form.Item label={<Text style={{ fontWeight: 600 }}>Status</Text>} name="status" initialValue="active">
              <Select style={{ borderRadius: 8 }}>
                <Option value="trial">Trial</Option>
                <Option value="active">Active</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item label={<Text style={{ fontWeight: 600 }}>Initial Allowed Users</Text>} name="users" initialValue="5">
            <Input type="number" style={{ borderRadius: 8 }} />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32 }}>
            <Button onClick={() => setIsModalOpen(false)} style={{ borderRadius: 8, fontWeight: 600 }}>Cancel</Button>
            <Button type="primary" onClick={() => setIsModalOpen(false)} style={{ background: 'var(--accent-primary)', borderRadius: 8, fontWeight: 600 }}>Create Company</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Companies;
