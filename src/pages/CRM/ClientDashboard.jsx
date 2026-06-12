import React from 'react';
import { Row, Col, Card, Typography, Space, Select, Tag } from 'antd';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const ClientDashboard = () => {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const FunnelStage = ({ title, count, subtitle, subColor, isLast }) => (
    <div style={{ display: 'flex', alignItems: 'center', flex: 1, position: 'relative' }}>
      <div style={{ 
        flex: 1, 
        background: 'var(--bg-secondary)', 
        border: `2px solid ${subColor}`, 
        borderRadius: 16, 
        padding: '24px 16px', 
        textAlign: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
        position: 'relative',
        zIndex: 2
      }}>
        <Text style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: 'var(--text-secondary)' }}>{title}</Text>
        <Title level={2} style={{ margin: '12px 0 4px', fontWeight: 900, color: 'var(--text-primary)' }}>{count}</Title>
        <Text style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>{subtitle}</Text>
      </div>
      {!isLast && (
        <div style={{ padding: '0 16px', color: 'var(--text-tertiary)', position: 'relative', zIndex: 1, fontSize: 12, fontWeight: 600 }}>
          →<br/>
          <span style={{ color: 'var(--accent-warning)', whiteSpace: 'nowrap' }}>+27% lost</span>
        </div>
      )}
    </div>
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>JUNE 2026</Text>
          <Title level={3} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>My Leads</Title>
          <Text type="secondary">123 active leads across your campaigns this month.</Text>
        </div>
        <Tag style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '6px 16px', borderRadius: 20, alignSelf: 'flex-start', fontWeight: 600 }}>
          🔒 Read-only · contact your AM to edit
        </Tag>
      </motion.div>

      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {[
          { label: 'TOTAL LEADS', val: '142', sub: '▲ +23%', desc: 'this month', color: 'var(--accent-primary)' },
          { label: 'QUALIFIED', val: '67', sub: '47.2%', desc: 'of total leads', color: 'var(--accent-info)' },
          { label: 'SITE VISITS', val: '28', sub: '19.7%', desc: 'of total leads', color: 'var(--accent-secondary)' },
          { label: 'BOOKINGS', val: '14', sub: '10%', desc: 'lead-to-booking rate', color: 'var(--accent-warning)', badge: 'Above industry avg ✓' }
        ].map((kpi, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <motion.div variants={itemVariants} whileHover={{ y: -4 }}>
              <Card 
                bodyStyle={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }} 
                style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)' }}
              >
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5 }}>{kpi.label}</Text>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '16px 0 8px' }}>
                  <Title level={2} style={{ margin: 0, fontWeight: 800 }}>{kpi.val}</Title>
                  <Text style={{ fontSize: 14, color: kpi.color, fontWeight: 700 }}>{kpi.sub}</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>{kpi.desc}</Text>
                {kpi.badge && (
                  <Tag style={{ marginTop: 16, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-primary)', border: 'none', borderRadius: 12, fontWeight: 700, padding: '4px 12px', alignSelf: 'flex-start' }}>
                    {kpi.badge}
                  </Tag>
                )}
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <motion.div variants={itemVariants}>
        <Card 
          bodyStyle={{ padding: 32 }} 
          style={{ borderRadius: 24, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-md)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40 }}>
            <div>
              <Title level={4} style={{ margin: 0, fontWeight: 800 }}>Your Lead Journey This Month</Title>
              <Text type="secondary" style={{ fontWeight: 500 }}>How leads move from first contact to booking</Text>
            </div>
            <Space>
              <Tag style={{ background: 'var(--accent-primary)', color: '#fff', border: 'none', padding: '4px 16px', borderRadius: 16, fontWeight: 600 }}>All</Tag>
              {['Google Ads', 'Meta Ads', 'WhatsApp', 'Organic', 'Referral'].map(tag => (
                <Tag key={tag} style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '4px 16px', borderRadius: 16, fontWeight: 600 }}>{tag}</Tag>
              ))}
              <Select defaultValue="This Month" style={{ width: 120, marginLeft: 16 }} size="small" variant="borderless">
                <Select.Option value="This Month">📅 This Month</Select.Option>
              </Select>
            </Space>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
            <FunnelStage title="NEW" count="142" subtitle="100%" subColor="var(--accent-info)" />
            <FunnelStage title="CONTACTED" count="104" subtitle="73%" subColor="var(--accent-secondary)" />
            <FunnelStage title="QUALIFIED" count="67" subtitle="47%" subColor="var(--accent-warning)" />
            <FunnelStage title="SITE VISIT" count="28" subtitle="20%" subColor="var(--accent-primary)" />
            <FunnelStage title="BOOKING" count="14" subtitle="10%" subColor="var(--text-primary)" isLast />
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px 24px', borderRadius: 12, color: 'var(--accent-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12 }}>
            💡 Your 10% booking rate beats the 6.8% industry average by 47%.
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ClientDashboard;
