import React, { useState } from 'react';
import { Typography, Row, Col, Card, Switch, Button, List, Tag, Modal, Form, Input, Select } from 'antd';
import { motion } from 'framer-motion';
import { Check, Plus, CreditCard, Settings, Trash2 } from 'lucide-react';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Subscriptions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  
  const [plans, setPlans] = useState([
    {
      id: 'starter',
      name: 'Starter',
      price: '$299',
      interval: '/month',
      description: 'Perfect for small agencies just getting started.',
      features: ['Up to 5 Users', 'Basic CRM', 'Standard Support', '5 Active Projects', '10GB Storage'],
      popular: false,
      active: 45,
    },
    {
      id: 'pro',
      name: 'Professional',
      price: '$999',
      interval: '/month',
      description: 'For growing agencies that need more power.',
      features: ['Up to 25 Users', 'Advanced CRM & Automation', 'Priority 24/7 Support', 'Unlimited Projects', '100GB Storage', 'White-labeling'],
      popular: true,
      active: 124,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      interval: '',
      description: 'Dedicated resources for large organizations.',
      features: ['Unlimited Users', 'Custom Integrations', 'Dedicated Account Manager', 'On-premise Deployment Option', 'Unlimited Storage', 'Advanced Security'],
      popular: false,
      active: 18,
    },
  ]);

  const handleCreatePlan = () => {
    form.validateFields().then(values => {
      const newPlan = {
        id: values.name.toLowerCase().replace(/\s+/g, '-'),
        name: values.name,
        price: values.price,
        interval: values.interval || '',
        description: values.description,
        features: values.features ? values.features.split('\n').filter(f => f.trim() !== '') : [],
        popular: values.popular || false,
        active: 0,
      };

      if (values.popular) {
        // Only one popular plan allowed
        setPlans(plans.map(p => ({ ...p, popular: false })).concat(newPlan));
      } else {
        setPlans([...plans, newPlan]);
      }
      
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <Title level={2} style={{ margin: '0 0 8px 0', fontWeight: 800, color: 'var(--text-primary)' }}>
            Subscriptions & Plans
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Manage pricing tiers and billing settings for your SaaS platform.
          </Text>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button icon={<Settings size={18} />} style={{ height: 44, borderRadius: 8, fontWeight: 600 }}>Billing Settings</Button>
          <Button 
            type="primary" 
            icon={<Plus size={18} />} 
            onClick={() => setIsModalOpen(true)}
            style={{ background: 'var(--accent-primary)', height: 44, borderRadius: 8, fontWeight: 600 }}
          >
            Create Plan
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40, gap: 12 }}>
        <Text style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Monthly billing</Text>
        <Switch defaultChecked />
        <Text style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Annual billing <Tag color="green" style={{ borderRadius: 12, marginLeft: 8 }}>Save 20%</Tag></Text>
      </div>

      <Row gutter={[24, 24]}>
        {plans.map((plan, index) => (
          <Col xs={24} lg={8} key={plan.id}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} style={{ height: '100%' }}>
              <Card 
                className={`glassmorphism ${plan.popular ? 'popular-plan' : ''}`}
                style={{ 
                  borderRadius: 16, 
                  border: plan.popular ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)', 
                  background: 'var(--bg-secondary)',
                  height: '100%',
                  position: 'relative'
                }}
                bodyStyle={{ padding: 32, display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                {plan.popular && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-primary)', color: '#fff', padding: '4px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
                    MOST POPULAR
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <Title level={4} style={{ margin: '0 0 8px 0', fontWeight: 800 }}>{plan.name}</Title>
                    <Text type="secondary" style={{ fontSize: 14 }}>{plan.description}</Text>
                  </div>
                  <Button type="text" danger icon={<Trash2 size={16} />} onClick={() => setPlans(plans.filter(p => p.id !== plan.id))} style={{ padding: 4 }} />
                </div>

                <div style={{ marginBottom: 32 }}>
                  <span style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)' }}>{plan.price}</span>
                  <span style={{ fontSize: 16, color: 'var(--text-secondary)', fontWeight: 500 }}>{plan.interval}</span>
                </div>

                <Button 
                  type={plan.popular ? 'primary' : 'default'}
                  block 
                  style={{ 
                    height: 44, 
                    borderRadius: 8, 
                    fontWeight: 700, 
                    marginBottom: 32,
                    background: plan.popular ? 'var(--accent-primary)' : 'transparent',
                  }}
                >
                  Edit Plan
                </Button>

                <div style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-secondary)', display: 'block', marginBottom: 16 }}>
                    Features included:
                  </Text>
                  <List
                    split={false}
                    dataSource={plan.features}
                    renderItem={item => (
                      <List.Item style={{ padding: '8px 0', border: 'none', display: 'flex', justifyContent: 'flex-start' }}>
                        <Check size={18} style={{ color: '#10b981', marginRight: 12 }} />
                        <Text style={{ fontSize: 14, fontWeight: 500 }}>{item}</Text>
                      </List.Item>
                    )}
                  />
                </div>

                <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary" style={{ fontWeight: 500 }}>Active Subscriptions</Text>
                  <Tag color="blue" style={{ borderRadius: 12, fontWeight: 700, fontSize: 14, padding: '2px 12px' }}>{plan.active}</Tag>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Modal
        title={<span style={{ fontWeight: 700, fontSize: 18 }}>Create New Plan</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        className="glass-modal"
        centered
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item label={<Text style={{ fontWeight: 600 }}>Plan Name</Text>} name="name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Premium Plan" style={{ borderRadius: 8 }} />
          </Form.Item>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item label={<Text style={{ fontWeight: 600 }}>Price</Text>} name="price" rules={[{ required: true }]}>
              <Input placeholder="e.g. $499" style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item label={<Text style={{ fontWeight: 600 }}>Billing Interval</Text>} name="interval" initialValue="/month">
              <Select style={{ borderRadius: 8 }}>
                <Option value="/month">Monthly</Option>
                <Option value="/year">Yearly</Option>
                <Option value="">None (One-time)</Option>
              </Select>
            </Form.Item>
          </div>
          
          <Form.Item label={<Text style={{ fontWeight: 600 }}>Description</Text>} name="description" rules={[{ required: true }]}>
            <TextArea placeholder="Brief description of who this plan is for..." rows={2} style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item label={<Text style={{ fontWeight: 600 }}>Features (One per line)</Text>} name="features" rules={[{ required: true }]}>
            <TextArea placeholder="Up to 10 Users&#10;Advanced Analytics&#10;Priority Support" rows={4} style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item name="popular" valuePropName="checked" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <Switch />
              <Text style={{ fontWeight: 600 }}>Highlight as "Most Popular" plan</Text>
            </div>
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32 }}>
            <Button onClick={() => setIsModalOpen(false)} style={{ borderRadius: 8, fontWeight: 600 }}>Cancel</Button>
            <Button type="primary" onClick={handleCreatePlan} style={{ background: 'var(--accent-primary)', borderRadius: 8, fontWeight: 600 }}>Publish Plan</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Subscriptions;
