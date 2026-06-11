import React, { useState } from 'react';
import { Typography, Card, Table, Button, Input, Tag, Space, Dropdown, Menu, Modal, Form, Select, Avatar } from 'antd';
import { motion } from 'framer-motion';
import { Search, Plus, MoreVertical, Edit2, Trash2, Shield, UserX, UserCheck } from 'lucide-react';

const { Title, Text } = Typography;
const { Option } = Select;

const Admins = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const adminsData = [
    { key: '1', name: 'Rajesh Kumar', email: 'rajesh@m1platform.com', role: 'Super Admin', status: 'Active', lastLogin: '2 mins ago', addedOn: 'Oct 24, 2023', initial: 'R' },
    { key: '2', name: 'John Doe', email: 'john@m1platform.com', role: 'Admin', status: 'Active', lastLogin: '1 hour ago', addedOn: 'Oct 23, 2023', initial: 'J' },
    { key: '3', name: 'Jane Smith', email: 'jane@m1platform.com', role: 'Support Admin', status: 'Inactive', lastLogin: '5 days ago', addedOn: 'Sep 12, 2023', initial: 'S' },
    { key: '4', name: 'Alex Johnson', email: 'alex@m1platform.com', role: 'Admin', status: 'Active', lastLogin: 'Yesterday', addedOn: 'Oct 15, 2023', initial: 'A' },
  ];

  const getActionMenu = (record) => (
    <Menu>
      <Menu.Item key="edit" icon={<Edit2 size={16} />}>Edit Admin</Menu.Item>
      {record.status === 'Active' ? (
        <Menu.Item key="deactivate" icon={<UserX size={16} />}>Deactivate Account</Menu.Item>
      ) : (
        <Menu.Item key="activate" icon={<UserCheck size={16} />}>Activate Account</Menu.Item>
      )}
      <Menu.Divider />
      <Menu.Item key="delete" danger icon={<Trash2 size={16} />}>Delete Admin</Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: 'Admin User',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar size={40} style={{ background: 'var(--accent-primary)', color: '#fff', fontWeight: 700 }}>
            {record.initial}
          </Avatar>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{text}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'Super Admin' ? 'purple' : role === 'Admin' ? 'blue' : 'default'} style={{ borderRadius: 12, px: 8 }}>
          {role}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'} style={{ borderRadius: 12 }}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (text) => <Text style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{text}</Text>,
    },
    {
      title: 'Added On',
      dataIndex: 'addedOn',
      key: 'addedOn',
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
            Super Admins
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Manage super admin users, system roles, and access permissions.
          </Text>
        </div>
        <Button 
          type="primary" 
          icon={<Plus size={18} />} 
          style={{ background: 'var(--accent-primary)', height: 44, borderRadius: 8, fontWeight: 600 }}
          onClick={() => setIsModalOpen(true)}
        >
          Add Admin
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
              placeholder="Search admins by name or email..." 
              prefix={<Search size={18} style={{ color: 'var(--text-tertiary)' }} />}
              style={{ width: 320, borderRadius: 8, height: 40 }}
            />
            <Space>
              <Select defaultValue="all" style={{ width: 140, height: 40 }} className="custom-select">
                <Option value="all">All Roles</Option>
                <Option value="superadmin">Super Admin</Option>
                <Option value="admin">Admin</Option>
                <Option value="support">Support</Option>
              </Select>
              <Select defaultValue="active" style={{ width: 140, height: 40 }} className="custom-select">
                <Option value="all">All Status</Option>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Space>
          </div>

          <Table 
            columns={columns} 
            dataSource={adminsData} 
            pagination={{ pageSize: 10 }}
            className="custom-table"
          />
        </Card>
      </motion.div>

      <Modal
        title={<span style={{ fontWeight: 700, fontSize: 18 }}>Add New Admin User</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        className="glass-modal"
        centered
        width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item label={<Text style={{ fontWeight: 600 }}>Full Name</Text>} name="name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Sarah Connor" style={{ borderRadius: 8 }} />
          </Form.Item>
          
          <Form.Item label={<Text style={{ fontWeight: 600 }}>Email Address</Text>} name="email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="sarah@m1platform.com" style={{ borderRadius: 8 }} />
          </Form.Item>
          
          <Form.Item label={<Text style={{ fontWeight: 600 }}>System Role</Text>} name="role" initialValue="admin">
            <Select style={{ borderRadius: 8 }}>
              <Option value="superadmin">Super Admin</Option>
              <Option value="admin">Admin</Option>
              <Option value="support">Support Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item label={<Text style={{ fontWeight: 600 }}>Status</Text>} name="status" initialValue="active">
            <Select style={{ borderRadius: 8 }}>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32 }}>
            <Button onClick={() => setIsModalOpen(false)} style={{ borderRadius: 8, fontWeight: 600 }}>Cancel</Button>
            <Button type="primary" onClick={() => setIsModalOpen(false)} style={{ background: 'var(--accent-primary)', borderRadius: 8, fontWeight: 600 }}>Create Admin</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Admins;
