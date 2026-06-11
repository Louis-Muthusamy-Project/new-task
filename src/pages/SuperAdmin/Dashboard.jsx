import React from 'react';
import { Typography, Row, Col, Card, Statistic, Table, Tag } from 'antd';
import { motion } from 'framer-motion';
import { Building2, Users, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const { Title, Text } = Typography;

const Dashboard = () => {
  const stats = [
    { title: 'Total Companies', value: '1,248', prefix: <Building2 size={20} />, trend: '+12%', isPositive: true },
    { title: 'Active Users', value: '45,231', prefix: <Users size={20} />, trend: '+5.4%', isPositive: true },
    { title: 'MRR', value: '$842,500', prefix: <CreditCard size={20} />, trend: '+8.2%', isPositive: true },
    { title: 'Churn Rate', value: '2.1%', prefix: <TrendingUp size={20} />, trend: '-0.4%', isPositive: true },
  ];

  const recentCompanies = [
    { key: '1', name: 'Acme Corp', plan: 'Enterprise', status: 'Active', mrr: '$4,500', joined: 'Oct 24, 2023' },
    { key: '2', name: 'Globex Inc', plan: 'Pro', status: 'Active', mrr: '$999', joined: 'Oct 23, 2023' },
    { key: '3', name: 'Soylent Corp', plan: 'Starter', status: 'Trial', mrr: '$0', joined: 'Oct 22, 2023' },
    { key: '4', name: 'Initech', plan: 'Enterprise', status: 'Active', mrr: '$3,200', joined: 'Oct 20, 2023' },
    { key: '5', name: 'Umbrella Corp', plan: 'Pro', status: 'Churned', mrr: '$0', joined: 'Oct 15, 2023' },
  ];

  const columns = [
    {
      title: 'Company Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{text}</Text>,
    },
    {
      title: 'Plan',
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
      render: (text) => <Text style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{text}</Text>,
    },
    {
      title: 'Joined Date',
      dataIndex: 'joined',
      key: 'joined',
      render: (text) => <Text type="secondary">{text}</Text>,
    },
  ];

  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: '0 0 8px 0', fontWeight: 800, color: 'var(--text-primary)' }}>
          Platform Overview
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Monitor global platform performance and metrics.
        </Text>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="glassmorphism hover-lift"
                style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}
                bodyStyle={{ padding: 24 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ background: 'var(--bg-tertiary)', padding: 10, borderRadius: 12, color: 'var(--accent-primary)' }}>
                    {stat.prefix}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: stat.isPositive ? '#10b981' : '#ef4444', fontWeight: 600, fontSize: 13, background: stat.isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: 12 }}>
                    {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {stat.trend}
                  </div>
                </div>
                <Text type="secondary" style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 4 }}>{stat.title}</Text>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{stat.value}</div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card 
              title={<span style={{ fontWeight: 700, fontSize: 18 }}>Recent Companies</span>}
              className="glassmorphism"
              style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', height: '100%' }}
              headStyle={{ borderBottom: '1px solid var(--border-color)', padding: '20px 24px' }}
              bodyStyle={{ padding: 0 }}
            >
              <Table 
                columns={columns} 
                dataSource={recentCompanies} 
                pagination={false}
                className="custom-table"
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} lg={8}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card 
              title={<span style={{ fontWeight: 700, fontSize: 18 }}>Platform Health</span>}
              className="glassmorphism"
              style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', height: '100%' }}
              headStyle={{ borderBottom: '1px solid var(--border-color)', padding: '20px 24px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Server Uptime</Text>
                    <Text style={{ fontWeight: 600, color: '#10b981' }}>99.99%</Text>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '99.99%', background: '#10b981', borderRadius: 4 }}></div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontWeight: 500, color: 'var(--text-primary)' }}>API Response Time</Text>
                    <Text style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>124ms</Text>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '40%', background: 'var(--accent-primary)', borderRadius: 4 }}></div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Storage Used</Text>
                    <Text style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>45TB / 100TB</Text>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '45%', background: '#f59e0b', borderRadius: 4 }}></div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
