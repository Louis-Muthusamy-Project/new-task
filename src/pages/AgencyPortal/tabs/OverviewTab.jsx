import React, { useState } from 'react';
import { Typography, Row, Col, Card, Button, Tag, Progress, Table } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronRight, Activity, Calendar, DollarSign, Clock, Users, ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react';
import SlabCard from '../../../components/SlabCard';

const { Title, Text } = Typography;

const OverviewTab = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { type: 'spring', stiffness: 300, damping: 24 } 
    }
  };

  const stats = [
    { label: 'ACTIVE CLIENTS', value: '12', sub: '+3 this month', color: 'var(--accent-primary)', trend: 'up' },
    { label: 'TOTAL MRR', value: '₹42.8L', sub: '+12% MoM', color: 'var(--accent-primary)', trend: 'up' },
    { label: 'SLA COMPLIANCE', value: '94%', sub: '-3% - 3 breaches', color: 'var(--accent-danger)', trend: 'down' },
    { label: 'OPEN ESCALATIONS', value: '3', sub: 'Needs attention today', color: 'var(--accent-warning)', trend: 'neutral' },
    { label: 'TEAM UTILISATION', value: '81%', sub: '+3% - 5 members', color: 'var(--accent-primary)', trend: 'up' },
    { label: 'COLLECTION RATE', value: '89.7%', sub: '₹4.4L outstanding', color: 'var(--accent-primary)', trend: 'up' },
  ];

  const clients = [
    { id: 'pe', code: 'PE', name: 'Prestige Estates', industry: 'Real Estate', mos: 84, status: 'Healthy', scores: { seo: 91, ads: 86, leads: 83, social: 70, web: 88, cro: 72 }, am: 'AS' },
    { id: 'bt', code: 'BT', name: 'boAt', industry: 'Consumer Electronics', mos: 81, status: 'Healthy', scores: { seo: 78, ads: 84, leads: 70, social: 88, web: 82, cro: 84 }, am: 'PN' },
    { id: 'rp', code: 'RP', name: 'Rapido', industry: 'Mobility', mos: 78, status: 'Healthy', scores: { seo: 74, ads: 70, leads: 81, social: 82, web: 76, cro: 58 }, am: 'RS' },
    { id: 'ny', code: 'NY', name: 'Nykaa', industry: 'Beauty & Personal Care', mos: 76, status: 'Healthy', scores: { seo: 72, ads: 74, leads: 77, social: 86, web: 70, cro: 52 }, am: 'PN' },
    { id: 'cr', code: 'CR', name: 'CRED', industry: 'Fintech', mos: 73, status: 'Healthy', scores: { seo: 76, ads: 72, leads: 74, social: 70, web: 74, cro: 60 }, am: 'AS' },
    { id: 'me', code: 'ME', name: 'Meesho', industry: 'E-Commerce', mos: 71, status: 'Healthy', scores: { seo: 68, ads: 72, leads: 76, social: 74, web: 72, cro: 58 }, am: 'KM' },
    { id: 'zp', code: 'ZP', name: 'Zepto', industry: 'Quick Commerce', mos: 67, status: 'At Risk', scores: { seo: 64, ads: 68, leads: 72, social: 71, web: 65, cro: 48 }, am: 'RS' },
    { id: 'lk', code: 'LK', name: 'Lenskart', industry: 'Eyewear', mos: 63, status: 'At Risk', scores: { seo: 62, ads: 58, leads: 68, social: 68, web: 61, cro: 44 }, alert: 'SLA breach - 2 deliverables overdue', am: 'KM' },
    { id: 'oy', code: 'OY', name: 'OYO', industry: 'Hospitality', mos: 62, status: 'At Risk', scores: { seo: 58, ads: 63, leads: 61, social: 64, web: 60, cro: 42 }, am: 'DM' },
    { id: 'bp', code: 'BP', name: 'BharatPe', industry: 'Fintech', mos: 58, status: 'At Risk', scores: { seo: 60, ads: 48, leads: 62, social: 54, web: 56, cro: 38 }, alert: 'Ad spend 40% over budget', am: 'PN' },
    { id: 'uc', code: 'UC', name: 'Urban Company', industry: 'Services', mos: 55, status: 'At Risk', scores: { seo: 52, ads: 54, leads: 58, social: 56, web: 58, cro: 38 }, am: 'AR' },
    { id: 'wk', code: 'WF', name: 'Wakefit', industry: 'D2C / Sleep', mos: 49, status: 'Critical', scores: { seo: 42, ads: 46, leads: 48, social: 52, web: 44, cro: 32 }, alert: 'MOS dropped 12 pts - Emergency action needed', am: 'AS' }
  ];

  const clientCodes = ['PE', 'BT', 'RP', 'NY', 'CR', 'ME', 'ZP', 'LK', 'OY', 'BP', 'UC', 'WF'];
  const getCodeColor = (idx) => {
    if (idx < 6) return 'var(--accent-primary)'; // Healthy
    if (idx < 11) return 'var(--accent-warning)'; // At Risk
    return 'var(--accent-danger)'; // Critical
  };

  const getStatusColor = (status) => {
    if (status === 'Healthy') return 'var(--accent-primary)';
    if (status === 'At Risk') return 'var(--accent-warning)';
    return 'var(--accent-danger)';
  };

  const upcoming = [
    { icon: <Calendar size={20} color="var(--accent-secondary)" />, title: 'Quarterly Business Review — Prestige Estates', desc: '15 July 2026 · With: Rahul Kapoor', btn: 'Prepare', btnColor: 'var(--accent-secondary)' },
    { icon: <Activity size={20} color="var(--accent-warning)" />, title: 'BharatPe contract renewal — 30 Jun 2026', desc: '21 days away · Prepare renewal proposal', btn: 'Create Proposal', btnColor: 'var(--accent-warning)' },
    { icon: <DollarSign size={20} color="var(--accent-primary)" />, title: 'June invoices — 2 pending payments', desc: 'Zepto ₹2.4L · Lenskart ₹1.8L outstanding', btn: 'Send Reminders', btnColor: 'var(--accent-primary)' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: 1400, margin: '0 auto' }}>
      
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Good morning, Arjun.</Title>
          <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>Here's BCC Martech at a glance — June 2026.</Text>
        </div>
        <Tag style={{ borderRadius: 8, padding: '6px 16px', background: 'var(--bg-tertiary)', border: '2px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 700, fontSize: 13, boxShadow: '2px 2px 0 var(--border-color)' }}>June 2026</Tag>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '2px solid rgba(245, 158, 11, 0.4)', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16, boxShadow: '4px 4px 0 var(--accent-warning)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--accent-warning)' }}>
            <AlertTriangle size={20} />
            <span style={{ fontWeight: 800, fontSize: 15 }}>3 clients need attention</span>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500, marginLeft: 8 }}>Wakefit MOS dropped, Lenskart SLA breach, BharatPe ad overspend.</span>
          </div>
          <Button type="primary" style={{ background: 'var(--accent-warning)', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 8 }}>Review Now →</Button>
        </div>
      </motion.div>

      {/* The Global Dashboard Matrix */}
      <motion.div variants={itemVariants}>
        <SlabCard bodyStyle={{ padding: 40 }} style={{ marginBottom: 40, border: '2px solid var(--accent-secondary)' }} shadowColor="var(--accent-secondary)">
          <Row gutter={48}>
            <Col xs={24} md={8} style={{ borderRight: '1px dashed var(--border-color)' }}>
              <Text style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 800, letterSpacing: 1.5, display: 'block', marginBottom: 24 }}>GLOBAL AGENCY MOS</Text>
              <div style={{ position: 'relative', width: 160, height: 160, marginBottom: 24 }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 8px rgba(13,148,136,0.4))' }}>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--bg-tertiary)" strokeWidth="4" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--accent-secondary)" strokeWidth="4" strokeDasharray="68, 100" strokeLinecap="round" />
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 48, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>68</span>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>/100</span>
                </div>
              </div>
              <Tag style={{ background: 'var(--accent-secondary)', border: 'none', color: '#fff', borderRadius: 6, fontWeight: 800, marginBottom: 16, padding: '4px 12px', fontSize: 13 }}>GOOD STATUS</Tag>
              <Text style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Avg across 12 active clients</Text>
              <Text style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: 12, fontSize: 13, fontWeight: 700 }}>▲ +4 pts vs last month</Text>
              <Text style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: 12, fontWeight: 500 }}>Top 24% of agencies on M1</Text>
            </Col>
            
            <Col xs={24} md={16}>
              <Text style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 800, display: 'block', marginBottom: 32 }}>Client Health Breakdown Matrix</Text>
              
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Healthy (MOS ≥ 70)</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>6 clients</span>
                </div>
                <div style={{ width: '100%', height: 12, background: 'var(--bg-tertiary)', borderRadius: 6, overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ width: '50%', height: '100%', background: 'var(--accent-primary)', borderRadius: 6 }}></div>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>At Risk (50-69)</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>5 clients</span>
                </div>
                <div style={{ width: '100%', height: 12, background: 'var(--bg-tertiary)', borderRadius: 6, overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ width: '41.6%', height: '100%', background: 'var(--accent-warning)', borderRadius: 6 }}></div>
                </div>
              </div>

              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Critical (&lt; 50)</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>1 clients</span>
                </div>
                <div style={{ width: '100%', height: 12, background: 'var(--bg-tertiary)', borderRadius: 6, overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ width: '8.3%', height: '100%', background: 'var(--accent-danger)', borderRadius: 6 }}></div>
                </div>
              </div>

              <Text style={{ color: 'var(--text-tertiary)', fontSize: 12, fontWeight: 800, letterSpacing: 1.5, display: 'block', marginBottom: 16 }}>GLOBAL CLIENT PORTFOLIO</Text>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {clientCodes.map((code, idx) => (
                  <div key={idx} style={{ width: 32, height: 32, borderRadius: 8, background: getCodeColor(idx), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800, boxShadow: `2px 2px 0 var(--border-color)` }}>
                    {code}
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </SlabCard>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
          {stats.map((stat, idx) => (
            <Col xs={24} sm={12} lg={8} xl={8} xxl={4} key={idx}>
              <SlabCard style={{ height: '100%' }} bodyStyle={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, display: 'block', marginBottom: 12, color: 'var(--text-tertiary)' }}>{stat.label}</Text>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  {stat.trend === 'up' && <ArrowUpRight size={16} color={stat.color} />}
                  {stat.trend === 'down' && <ArrowDownRight size={16} color={stat.color} />}
                  {stat.trend === 'neutral' && <AlertTriangle size={16} color={stat.color} />}
                  <span style={{ color: stat.color, fontWeight: 700 }}>{stat.sub}</span>
                </div>
              </SlabCard>
            </Col>
          ))}
        </Row>
      </motion.div>

      {/* Massive Client List */}
      <motion.div variants={itemVariants} style={{ marginBottom: 64 }}>
        <Title level={3} style={{ margin: '0 0 8px 0', fontWeight: 800 }}>Your Clients — June 2026</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 32, fontSize: 14, fontWeight: 500 }}>All 12 active clients - ranked by MOS score</Text>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {clients.map(client => (
            <SlabCard key={client.id} shadowColor={getStatusColor(client.status)} bodyStyle={{ padding: '24px 32px' }} style={{ borderLeft: `6px solid ${getStatusColor(client.status)}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 220 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: getStatusColor(client.status), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15, boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.2)' }}>{client.code}</div>
                  <div>
                    <Text style={{ fontWeight: 800, display: 'block', color: 'var(--text-primary)', fontSize: 16, marginBottom: 4 }}>{client.name}</Text>
                    <Text type="secondary" style={{ fontSize: 13, fontWeight: 600 }}>{client.industry}</Text>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag style={{ background: 'var(--bg-tertiary)', color: getStatusColor(client.status), border: `1px solid ${getStatusColor(client.status)}40`, borderRadius: 8, fontWeight: 800, padding: '6px 16px', fontSize: 14 }}>
                    {client.mos} • {client.status}
                  </Tag>
                </div>

                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {Object.entries(client.scores).map(([key, val]) => (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'var(--bg-tertiary)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>{key}</span>
                      <span style={{ color: val >= 70 ? 'var(--accent-primary)' : val >= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)', fontWeight: 800, fontSize: 14 }}>{val}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20, minWidth: 120, justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <span style={{ fontSize: 9, color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: 0.5 }}>AM</span>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>{client.am}</div>
                  </div>
                  <Button type="text" icon={<ExternalLink size={18} />} style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>View</Button>
                </div>

              </div>

              {client.alert && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', gap: 12, color: 'var(--accent-danger)', fontSize: 14, fontWeight: 600 }}>
                  <AlertTriangle size={18} /> {client.alert}
                </div>
              )}
            </SlabCard>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Title level={4} style={{ margin: '0 0 8px 0', fontWeight: 800 }}>Upcoming Action Items</Title>
        <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 32, fontWeight: 500 }}>Key dates and deadlines this month</Text>
        
        <Row gutter={[24, 24]}>
          {upcoming.map((item, idx) => (
            <Col xs={24} md={8} key={idx}>
              <SlabCard style={{ height: '100%' }} shadowColor={item.btnColor} bodyStyle={{ padding: 32, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ marginBottom: 16, background: 'var(--bg-tertiary)', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>{item.icon}</div>
                <Text style={{ fontWeight: 800, fontSize: 16, display: 'block', marginBottom: 12, color: 'var(--text-primary)' }}>{item.title}</Text>
                <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 32, flex: 1, fontWeight: 500, lineHeight: 1.6 }}>{item.desc}</Text>
                <Button style={{ background: item.btnColor, color: '#fff', borderRadius: 8, border: 'none', fontWeight: 700, width: '100%', height: 40, boxShadow: '2px 2px 0 var(--border-color)' }}>{item.btn}</Button>
              </SlabCard>
            </Col>
          ))}
        </Row>
      </motion.div>

    </motion.div>
  );
};

export default OverviewTab;
