import React, { useState } from 'react';
import { Typography, Button, Table, Modal, Input, Switch, Tag, message } from 'antd';
import { Plus, Edit, Trash2, Shield, Zap, Globe, Users, AlertTriangle } from 'lucide-react';
import { useFeatures } from '../../../contexts/FeatureContext';

const { Title, Text } = Typography;

const availableFeatures = [
  { id: 'dashboard', label: 'Client Dashboard', icon: <AlertTriangle size={14} /> },
  { id: 'performance', label: 'Performance Analytics', icon: <Zap size={14} /> },
  { id: 'leads', label: 'Lead Management (CRM)', icon: <Users size={14} /> },
  { id: 'website', label: 'Website Builder', icon: <Globe size={14} /> },
  { id: 'store', label: 'Asset Store', icon: <Shield size={14} /> },
  { id: 'tasks', label: 'Task Management', icon: <AlertTriangle size={14} /> },
  { id: 'billing', label: 'Billing & Invoices', icon: <AlertTriangle size={14} /> },
  { id: 'support', label: 'Support System', icon: <AlertTriangle size={14} /> },
];

const ClientPackagesTab = () => {
  const { packages, createPackage, updatePackage, deletePackage } = useFeatures();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    features: []
  });

  const handleOpenModal = (pkg = null) => {
    if (pkg) {
      setEditingPkg(pkg);
      setFormData({
        name: pkg.name,
        description: pkg.description || '',
        price: pkg.price || '',
        features: pkg.features || []
      });
    } else {
      setEditingPkg(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        features: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      message.error("Package name is required");
      return;
    }

    if (editingPkg) {
      updatePackage(editingPkg.id, formData);
      message.success("Package updated successfully");
    } else {
      createPackage(formData);
      message.success("Package created successfully");
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    deletePackage(id);
    message.success("Package deleted successfully");
  };

  const toggleFeature = (featureId, checked) => {
    setFormData(prev => ({
      ...prev,
      features: checked 
        ? [...prev.features, featureId]
        : prev.features.filter(f => f !== featureId)
    }));
  };

  const columns = [
    {
      title: 'Package Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (text) => <Text type="secondary" style={{ fontWeight: 600 }}>{text || 'Custom'}</Text>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Included Features',
      key: 'features',
      render: (_, record) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {record.features.slice(0, 3).map(feat => (
            <Tag key={feat} color="blue">{feat}</Tag>
          ))}
          {record.features.length > 3 && <Tag>+{record.features.length - 3}</Tag>}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button type="text" icon={<Edit size={16} />} onClick={() => handleOpenModal(record)} />
          <Button type="text" danger icon={<Trash2 size={16} />} onClick={() => handleDelete(record.id)} />
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 800 }}>Client Packages</Title>
          <Text type="secondary">Define feature tiers and pricing for your agency clients.</Text>
        </div>
        <Button 
          type="primary" 
          icon={<Plus size={16} />} 
          style={{ background: 'var(--accent-primary)', fontWeight: 700, borderRadius: 8 }}
          onClick={() => handleOpenModal()}
        >
          Create Package
        </Button>
      </div>

      <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: 16, border: '1px solid var(--border-color)' }}>
        <Table 
          columns={columns} 
          dataSource={packages} 
          rowKey="id" 
          pagination={false}
        />
      </div>

      <Modal
        title={editingPkg ? "Edit Package" : "Create New Package"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        okText="Save Package"
        okButtonProps={{ style: { background: 'var(--accent-primary)' } }}
        width={600}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-secondary)' }}>Package Name</label>
            <Input 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              placeholder="e.g., VIP Tier" 
              size="large"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-secondary)' }}>Description</label>
            <Input.TextArea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              placeholder="Brief description of this tier" 
              rows={2}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-secondary)' }}>Price (Optional)</label>
            <Input 
              value={formData.price} 
              onChange={e => setFormData({...formData, price: e.target.value})} 
              placeholder="e.g., ₹5.0L/mo" 
              size="large"
            />
          </div>

          <div style={{ marginTop: 8 }}>
            <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Included Features</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {availableFeatures.map(feat => (
                <div key={feat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{feat.label}</span>
                  <Switch 
                    size="small" 
                    checked={formData.features.includes(feat.id)} 
                    onChange={(checked) => toggleFeature(feat.id, checked)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClientPackagesTab;
