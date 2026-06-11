import React from 'react';
import { Typography, Row, Col, Card, Switch, Button, Tag, Avatar } from 'antd';
import { motion } from 'framer-motion';
import { Settings, ExternalLink, Link2, Search } from 'lucide-react';

const { Title, Text } = Typography;

const Integrations = () => {
  const integrationCategories = [
    {
      category: 'Payment Gateways',
      items: [
        { id: 'stripe', name: 'Stripe', description: 'Process global payments and subscriptions.', status: true, icon: 'S', color: '#6366f1' },
        { id: 'paypal', name: 'PayPal', description: 'Accept payments via PayPal globally.', status: false, icon: 'P', color: '#003087' },
        { id: 'razorpay', name: 'Razorpay', description: 'Payment gateway for Indian businesses.', status: true, icon: 'R', color: '#0ea5e9' },
      ]
    },
    {
      category: 'AI Models & Providers',
      items: [
        { id: 'openai', name: 'OpenAI', description: 'GPT-4 and DALL-E integration for AI Copilot.', status: true, icon: 'O', color: '#10a37f' },
        { id: 'anthropic', name: 'Anthropic', description: 'Claude AI models integration.', status: false, icon: 'A', color: '#d97757' },
        { id: 'midjourney', name: 'Midjourney', description: 'Advanced image generation via API.', status: true, icon: 'M', color: '#ffffff', bg: '#000000' },
      ]
    },
    {
      category: 'Communication & Email',
      items: [
        { id: 'sendgrid', name: 'SendGrid', description: 'Transactional email delivery service.', status: true, icon: 'S', color: '#1a82e2' },
        { id: 'twilio', name: 'Twilio', description: 'SMS and WhatsApp API integration.', status: false, icon: 'T', color: '#f22f46' },
      ]
    },
    {
      category: 'Storage & Infrastructure',
      items: [
        { id: 'aws', name: 'AWS S3', description: 'Cloud storage for user files and media.', status: true, icon: 'A', color: '#ff9900' },
        { id: 'cloudflare', name: 'Cloudflare', description: 'CDN, DNS, and Security management.', status: true, icon: 'C', color: '#f38020' },
      ]
    }
  ];

  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <Title level={2} style={{ margin: '0 0 8px 0', fontWeight: 800, color: 'var(--text-primary)' }}>
            Global Integrations
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Manage platform-wide API keys, third-party services, and core infrastructure integrations.
          </Text>
        </div>
        <Button 
          type="primary" 
          icon={<Search size={18} />} 
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', height: 44, borderRadius: 8, fontWeight: 600 }}
        >
          Browse App Directory
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {integrationCategories.map((categoryGroup, idx) => (
          <div key={idx}>
            <Title level={4} style={{ marginBottom: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{categoryGroup.category}</Title>
            <Row gutter={[24, 24]}>
              {categoryGroup.items.map((integration, index) => (
                <Col xs={24} md={12} xl={8} key={integration.id}>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (idx * 0.1) + (index * 0.05) }}>
                    <Card 
                      className="glassmorphism hover-lift"
                      style={{ 
                        borderRadius: 16, 
                        border: integration.status ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)', 
                        background: 'var(--bg-secondary)',
                      }}
                      bodyStyle={{ padding: 24 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div style={{ display: 'flex', gap: 16 }}>
                          <Avatar 
                            size={48} 
                            style={{ 
                              background: integration.bg || integration.color, 
                              color: integration.bg ? integration.color : '#fff',
                              fontWeight: 800,
                              fontSize: 20,
                              borderRadius: 12
                            }}
                          >
                            {integration.icon}
                          </Avatar>
                          <div>
                            <Text style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
                              {integration.name}
                            </Text>
                            <Tag color={integration.status ? 'green' : 'default'} style={{ borderRadius: 12 }}>
                              {integration.status ? 'Connected' : 'Disconnected'}
                            </Tag>
                          </div>
                        </div>
                        <Switch defaultChecked={integration.status} />
                      </div>
                      
                      <Text type="secondary" style={{ display: 'block', marginBottom: 24, fontSize: 14, minHeight: 44 }}>
                        {integration.description}
                      </Text>

                      <div style={{ display: 'flex', gap: 12, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                        <Button type="text" icon={<Settings size={16} />} style={{ flex: 1, fontWeight: 600, color: 'var(--text-secondary)' }}>Configure</Button>
                        <Button type="text" icon={<ExternalLink size={16} />} style={{ flex: 1, fontWeight: 600, color: 'var(--text-secondary)' }}>Docs</Button>
                      </div>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Integrations;
