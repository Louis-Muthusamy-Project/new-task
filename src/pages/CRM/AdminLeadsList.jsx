import React, { useState } from 'react';
import { Table, Tag, Space, Button, Typography, Input, Card, Modal, Select, Form } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const AdminLeadsList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  
  const [data, setData] = useState([
    { id: '1', name: 'Developer TEst', phone: '+919087654321', email: 'test@gmail.com', project: '—', source: 'Website', status: 'NEW', assigned: '—' },
    { id: '2', name: 'Test', phone: '+919087654321', email: 'test@gmail.com', project: '—', source: 'Website', status: 'NEW', assigned: '—' },
    { id: '3', name: 'BCC Test', phone: '+919087654321', email: 'test@gmail.com', project: '—', source: 'Website', status: 'NEW', assigned: '—' },
    { id: '4', name: 'Test', phone: '+919087654321', email: 'test@gmail.com', project: '—', source: 'Website', status: 'NEW', assigned: '—' },
    { id: '5', name: 'Sabapathi Balasubrama...', phone: '+971522217129', email: 'saba2809@gmail.com', project: '—', source: 'Website', status: 'NEW', assigned: '—' },
    { id: '6', name: 'K SASIKUMAR', phone: '+919597930687', email: 'sasikumark1005@gmail....', project: '—', source: 'Website', status: 'NEW', assigned: '—' },
    { id: '7', name: 'A Gowthaman', phone: '+919448780914', email: 'gowtheman@gmail.com', project: '—', source: 'Website', status: 'NEW', assigned: '—' },
  ]);

  const columns = [
    { title: <strong style={{ color: 'var(--text-secondary)' }}>Name</strong>, dataIndex: 'name', key: 'name', render: t => <strong style={{ color: 'var(--text-primary)' }}>{t}</strong> },
    { title: <strong style={{ color: 'var(--text-secondary)' }}>Phone Number</strong>, dataIndex: 'phone', key: 'phone' },
    { title: <strong style={{ color: 'var(--text-secondary)' }}>Email</strong>, dataIndex: 'email', key: 'email' },
    { title: <strong style={{ color: 'var(--text-secondary)' }}>Project Type</strong>, dataIndex: 'project', key: 'project' },
    { title: <strong style={{ color: 'var(--text-secondary)' }}>Lead Source</strong>, dataIndex: 'source', key: 'source', render: s => <Tag color="purple" style={{ borderRadius: 6, fontWeight: 600 }}>{s}</Tag> },
    { title: <strong style={{ color: 'var(--text-secondary)' }}>Status</strong>, dataIndex: 'status', key: 'status', render: s => <Tag color="blue" style={{ borderRadius: 6, fontWeight: 700 }}>{s}</Tag> },
    { title: <strong style={{ color: 'var(--text-secondary)' }}>Assigned To</strong>, dataIndex: 'assigned', key: 'assigned' },
    { 
      title: <strong style={{ color: 'var(--text-secondary)' }}>Action</strong>, key: 'action', fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="text" icon={<EyeOutlined />} style={{ color: 'var(--accent-info)' }} />
          <Button type="text" icon={<EditOutlined />} style={{ color: 'var(--accent-secondary)' }} />
          <Button type="text" icon={<DeleteOutlined />} danger />
        </Space>
      )
    }
  ];

  const handleAdd = () => {
    form.validateFields().then(values => {
      setData([{ id: Date.now().toString(), ...values, project: '—', assigned: '—' }, ...data]);
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card 
        bodyStyle={{ padding: 0 }} 
        style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', overflow: 'hidden' }}
      >
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
          <Space>
            <Button type="text" style={{ fontWeight: 600, color: 'var(--accent-primary)', borderBottom: '2px solid var(--accent-primary)', borderRadius: 0, paddingBottom: 8 }}>All leads</Button>
            <Button type="text" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Reminder leads</Button>
          </Space>
          
          <Space>
            <Button icon={<UploadOutlined />} style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)' }}>Import</Button>
            <Button icon={<DownloadOutlined />} style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)' }}>Export</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} style={{ borderRadius: 8, fontWeight: 600, background: 'var(--accent-primary)', border: 'none' }}>Add Lead</Button>
          </Space>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
          rowSelection={{ type: 'checkbox' }}
          style={{ padding: 24 }}
          scroll={{ x: 'max-content' }}
          rowClassName={() => 'hover-bg'}
        />
      </Card>

      <Modal
        title={<Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>Add New Lead</Title>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAdd}
        className="glassmorphism-modal"
        okButtonProps={{ style: { background: 'var(--accent-primary)', border: 'none', borderRadius: 8, fontWeight: 600 } }}
        cancelButtonProps={{ style: { borderRadius: 8, fontWeight: 600 } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item name="name" label={<strong style={{ color: 'var(--text-secondary)' }}>Name</strong>} rules={[{ required: true }]}>
            <Input size="large" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="phone" label={<strong style={{ color: 'var(--text-secondary)' }}>Phone Number</strong>} rules={[{ required: true }]}>
            <Input size="large" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="email" label={<strong style={{ color: 'var(--text-secondary)' }}>Email</strong>}>
            <Input size="large" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="source" label={<strong style={{ color: 'var(--text-secondary)' }}>Lead Source</strong>} initialValue="Website">
            <Select size="large">
              <Option value="Website">Website</Option>
              <Option value="Referral">Referral</Option>
              <Option value="Social Media">Social Media</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label={<strong style={{ color: 'var(--text-secondary)' }}>Status</strong>} initialValue="NEW">
            <Select size="large">
              <Option value="NEW">New</Option>
              <Option value="CONTACTED">Contacted</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default AdminLeadsList;
