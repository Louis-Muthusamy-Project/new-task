import React from 'react';
import { Typography, Row, Col, Card, Button, Table, Tag, Avatar, Progress } from 'antd';
import { motion } from 'framer-motion';
import { Download, Plus, Target, FileText, TrendingUp, Mail, ExternalLink, Clock, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { newBusinessPipelineData, activeProposals } from '../../data/mock';

const { Title, Text } = Typography;

const NewBusiness = () => {
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

  const proposalCols = [
    { title: 'Company', dataIndex: 'company', key: 'company', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { title: 'MRR Potential', dataIndex: 'mrr', key: 'mrr', render: text => <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>{text}</span> },
    { title: 'Sent', dataIndex: 'sent', key: 'sent', render: text => <Text type="secondary" style={{ fontWeight: 500 }}>{text}</Text> },
    { title: 'Proposal Value', dataIndex: 'val', key: 'val', render: text => <span style={{ fontWeight: 600 }}>{text}</span> },
    { title: 'Follow-up', dataIndex: 'follow', key: 'follow', render: text => <Text type="secondary" style={{ fontWeight: 500 }}>{text}</Text> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: val => <Tag style={{ borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontWeight: 600 }}>{val}</Tag> },
    { 
      title: 'Actions', 
      key: 'actions', 
      align: 'right',
      render: () => (
        <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
          <a style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}><Mail size={14}/> Remind</a>
          <a style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}><ExternalLink size={14}/> View</a>
        </div>
      ) 
    }
  ];

  const StageColumn = ({ title, count, val, items, colorVar, bgColorVar }) => (
    <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ padding: '16px 20px', background: bgColorVar, borderRadius: 12, border: '1px solid var(--border-color)', borderTop: `4px solid ${colorVar}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <strong style={{ fontSize: 12, letterSpacing: 1.5, color: 'var(--text-primary)' }}>{title}</strong>
          <Plus size={16} color="var(--text-tertiary)" style={{ cursor: 'pointer' }} />
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
          {count} prospects · <span style={{ color: colorVar, fontWeight: 700 }}>{val}</span>
        </div>
      </div>

      {items.map((item, i) => (
        <Card key={i} bodyStyle={{ padding: 20 }} style={{ borderRadius: 12, border: '1px solid var(--border-color)', cursor: 'grab', boxShadow: 'var(--shadow-sm)' }} className="glassmorphism">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <strong style={{ fontSize: 15, color: 'var(--text-primary)' }}>{item.name}</strong>
            <Avatar size="small" style={{ fontSize: 11, backgroundColor: colorVar, fontWeight: 700, color: '#fff' }}>{item.ownerInit}</Avatar>
          </div>
          <Tag style={{ borderRadius: 12, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 600, margin: '0 0 16px 0' }}>{item.category}</Tag>
          <div style={{ color: colorVar, fontWeight: 800, fontSize: 16, marginBottom: 16 }}>{item.value}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Users size={14}/> {item.rep}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={14}/> {item.date}</span>
            {item.follow && <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-warning)' }}><Clock size={14}/> Follow-up {item.follow}</span>}
          </div>
        </Card>
      ))}
    </div>
  );

  const Users = ({size}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>AGENCY OPS</Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>New Business Pipeline</Title>
          <Text type="secondary" style={{ fontWeight: 500 }}>Prospects, proposals, and revenue growth.</Text>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button icon={<Download size={16} />} style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', height: 40 }}>Export</Button>
          <Button icon={<FileText size={16} />} style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', height: 40 }}>New Proposal</Button>
          <Button type="primary" icon={<Plus size={16} />} style={{ borderRadius: 8, background: 'var(--accent-secondary)', height: 40, fontWeight: 700, border: 'none', boxShadow: 'var(--shadow-md)' }}>Add Prospect</Button>
        </div>
      </motion.div>

      {/* NEW PHYSICAL FILE FOLDER CARDS */}
      <motion.div variants={itemVariants}>
        <Row gutter={[24, 32]} style={{ marginBottom: 40 }}>
          {[
            { label: 'TOTAL PIPELINE VALUE', val: '₹18.4L', sub: 'Monthly recurring potential', icon: <TrendingUp size={20} />, color: 'var(--text-primary)' },
            { label: 'ACTIVE PROSPECTS', val: '8', sub: 'Across 4 stages', icon: <Target size={20} />, color: 'var(--text-primary)' },
            { label: 'PROPOSALS SENT', val: '3', sub: 'Awaiting response or decision', icon: <FileText size={20} />, color: 'var(--text-primary)' },
            { label: 'WIN RATE (YTD)', val: '42%', sub: '3 won · 4 lost · 6 active', color: 'var(--accent-primary)', icon: <Target size={20} /> },
          ].map((kpi, i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
                {/* File Folder Tab */}
                <div style={{ 
                  display: 'inline-block',
                  background: 'var(--bg-tertiary)',
                  padding: '8px 20px',
                  borderRadius: '12px 12px 0 0',
                  border: '1px solid var(--border-color)',
                  borderBottom: 'none',
                  marginLeft: 16
                }}>
                  <Text type="secondary" style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5 }}>{kpi.label}</Text>
                </div>
                {/* File Folder Body */}
                <Card 
                  style={{ 
                    borderRadius: 16, 
                    borderTopLeftRadius: 0,
                    border: '1px solid var(--border-color)', 
                    background: 'var(--bg-secondary)',
                    boxShadow: 'var(--shadow-sm)',
                    height: 'calc(100% - 30px)', // adjust for tab height
                    marginTop: '-1px' // overlap border
                  }} 
                  bodyStyle={{ padding: '24px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <Title level={2} style={{ margin: 0, color: kpi.color, fontWeight: 800 }}>{kpi.val}</Title>
                    <div style={{ color: 'var(--accent-secondary)', background: 'rgba(13, 148, 136, 0.1)', padding: 8, borderRadius: '50%' }}>{kpi.icon}</div>
                  </div>
                  <Text type="secondary" style={{ fontSize: 13, fontWeight: 600 }}>{kpi.sub}</Text>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginBottom: 40 }}>
        <Title level={5} style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Pipeline</Title>
        <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 24 }}>Drag-and-drop prospects through stages</Text>
        
        <div style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 24 }}>
          <StageColumn title="LEAD" count={3} val="₹8.4L" items={newBusinessPipelineData.lead} colorVar="var(--accent-warning)" bgColorVar="rgba(245, 158, 11, 0.05)" />
          <StageColumn title="QUALIFIED" count={2} val="₹6.0L" items={newBusinessPipelineData.qualified} colorVar="var(--accent-info)" bgColorVar="rgba(59, 130, 246, 0.05)" />
          <StageColumn title="PROPOSAL SENT" count={2} val="₹6.0L" items={newBusinessPipelineData.proposal} colorVar="var(--accent-secondary)" bgColorVar="rgba(13, 148, 136, 0.05)" />
          <StageColumn title="NEGOTIATION" count={1} val="₹4.2L" items={newBusinessPipelineData.negotiation} colorVar="var(--accent-warning)" bgColorVar="rgba(245, 158, 11, 0.05)" />
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Closed Deals — This Month</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Won and lost outcomes</Text></div>} 
          extra={<div style={{ display: 'flex', gap: 12 }}><Button size="middle" style={{ borderRadius: 12, fontWeight: 600, color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)', background: 'rgba(16, 185, 129, 0.05)' }} icon={<CheckCircle2 size={16}/>}>Won (1)</Button><Button type="text" size="middle" style={{ borderRadius: 12, color: 'var(--text-secondary)', fontWeight: 600 }} icon={<XCircle size={16}/>}>Lost (1)</Button></div>}
          className="glassmorphism" style={{ borderRadius: 16, marginBottom: 40, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <Avatar size="large" style={{ backgroundColor: 'var(--accent-info)', fontWeight: 700, fontSize: 14 }}>PN</Avatar>
              <div>
                <strong style={{ fontSize: 16, display: 'block', color: 'var(--text-primary)', marginBottom: 4 }}>Zepto</strong>
                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Q-Commerce · closed 1 Jun · Onboarding scheduled 18 Jun</Text>
              </div>
            </div>
            <strong style={{ color: 'var(--accent-primary)', fontSize: 18, fontWeight: 800 }}>₹2.4L / mo</strong>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Row gutter={[32, 32]} style={{ marginBottom: 40 }}>
          <Col xs={24} lg={16}>
            <Card 
              title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Active Proposals</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Sent and awaiting decision</Text></div>} 
              className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 0 }}
            >
              <Table columns={proposalCols} dataSource={activeProposals} pagination={false} rowKey="company" size="middle" scroll={{ x: 800 }} rowClassName={() => 'hover-bg'} />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card 
              title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Win / Loss Analysis</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>This Quarter</Text></div>} 
              className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
            >
              <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                <Col span={12}>
                  <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                    <Text type="secondary" style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, display: 'block', marginBottom: 8 }}>PROPOSALS SENT</Text>
                    <strong style={{ fontSize: 28, color: 'var(--text-primary)' }}>8</strong>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ padding: 20, background: 'rgba(16, 185, 129, 0.05)', borderRadius: 12, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <Text type="secondary" style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, display: 'block', marginBottom: 8, color: 'var(--accent-primary)' }}>WON</Text>
                    <strong style={{ fontSize: 28, color: 'var(--accent-primary)' }}>3</strong>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ padding: 20, background: 'rgba(239, 68, 68, 0.05)', borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <Text type="secondary" style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, display: 'block', marginBottom: 8, color: 'var(--accent-danger)' }}>LOST</Text>
                    <strong style={{ fontSize: 28, color: 'var(--accent-danger)' }}>2</strong>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ padding: 20, background: 'rgba(245, 158, 11, 0.05)', borderRadius: 12, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    <Text type="secondary" style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, display: 'block', marginBottom: 8, color: 'var(--accent-warning)' }}>IN PROGRESS</Text>
                    <strong style={{ fontSize: 28, color: 'var(--accent-warning)' }}>3</strong>
                  </div>
                </Col>
              </Row>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <Text type="secondary" style={{ fontSize: 14, fontWeight: 600 }}>Win rate</Text>
                  <strong style={{ fontSize: 18, color: 'var(--text-primary)' }}>37.5%</strong>
                </div>
                <Progress percent={37.5} showInfo={false} strokeColor="var(--accent-primary)" trailColor="var(--bg-tertiary)" size="small" style={{ marginBottom: 32 }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><Clock size={16}/> Avg deal cycle</span>
                    <strong style={{ color: 'var(--text-primary)' }}>24 days</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><CheckCircle2 size={16} color="var(--accent-primary)"/> Top win reason</span>
                    <strong style={{ color: 'var(--text-primary)' }}>"Strong SEO case study"</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><XCircle size={16} color="var(--accent-danger)"/> Top loss reason</span>
                    <strong style={{ color: 'var(--text-primary)' }}>"Price — 2 deals"</strong>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </motion.div>

    </motion.div>
  );
};

export default NewBusiness;
