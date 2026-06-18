import React, { useState } from 'react';
import { Typography, Row, Col, Card, Button, Select, Table, Tag } from 'antd';
import { motion } from 'framer-motion';
import { Calendar, Plus, FileText, BarChart2, Target, Zap, Edit3, PauseCircle, PlayCircle, Download, CheckCircle2, Clock } from 'lucide-react';
import { scheduledReports, recentSentReports } from '../../data/mock';
import CreateReportModal from '../../components/CreateReportModal';

const { Title, Text } = Typography;

const Reports = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const scheduledCols = [
    { title: 'REPORT NAME', dataIndex: 'name', key: 'name', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { title: 'CLIENT', dataIndex: 'client', key: 'client', render: text => <Text style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{text}</Text> },
    { title: 'TEMPLATE', dataIndex: 'template', key: 'template', render: text => <Text style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{text}</Text> },
    { title: 'FREQUENCY', dataIndex: 'frequency', key: 'frequency', render: text => <span style={{ fontWeight: 500 }}>{text}</span> },
    { title: 'NEXT SEND', dataIndex: 'nextSend', key: 'nextSend', render: text => <span style={{ fontWeight: 600 }}>{text}</span> },
    { title: 'FORMAT', dataIndex: 'format', key: 'format', render: text => <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontWeight: 500 }}><FileText size={16}/> {text}</span> },
    { 
      title: 'STATUS', 
      dataIndex: 'status', 
      key: 'status', 
      render: text => <Tag style={{ borderRadius: 12, border: 'none', background: text === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-tertiary)', color: text === 'Active' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 700, padding: '2px 8px', margin: 0 }}>{text}</Tag> 
    },
    { 
      title: 'ACTIONS', 
      key: 'actions', 
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 16 }}>
          <a style={{ color: 'var(--text-tertiary)' }}><Edit3 size={18} /></a>
          <a style={{ color: 'var(--text-tertiary)' }}>{record.status === 'Active' ? <PauseCircle size={18}/> : <PlayCircle size={18}/>}</a>
        </div>
      ) 
    }
  ];

  const recentCols = [
    { title: 'REPORT NAME', dataIndex: 'name', key: 'name', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { title: 'CLIENT', dataIndex: 'client', key: 'client', render: text => <Text style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{text}</Text> },
    { title: 'SENT AT', dataIndex: 'sentAt', key: 'sentAt', render: text => <Text style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{text}</Text> },
    { title: 'DELIVERED TO', dataIndex: 'deliveredTo', key: 'deliveredTo', render: text => <Text style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{text}</Text> },
    { 
      title: 'OPENED', 
      dataIndex: 'opened', 
      key: 'opened', 
      render: text => text === 'Opened' ? <span style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}><CheckCircle2 size={16}/> Opened</span> : <span style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}><Clock size={16}/> Pending</span>
    },
    { title: 'PAGES', dataIndex: 'pages', key: 'pages', render: text => <Text style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{text}</Text> },
    { 
      title: 'DOWNLOAD', 
      key: 'download', 
      render: () => <a style={{ color: 'var(--text-tertiary)' }}><Download size={18} /></a> 
    }
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>INTELLIGENCE</Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>Reports</Title>
          <Text type="secondary" style={{ fontWeight: 500 }}>Automated branded reports delivered to clients on schedule.</Text>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button icon={<Calendar size={16} />} style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', height: 40 }}>Schedule New</Button>
          <Button onClick={() => setIsModalOpen(true)} type="primary" icon={<Plus size={16} />} style={{ borderRadius: 8, background: 'var(--accent-secondary)', height: 40, fontWeight: 700, border: 'none', boxShadow: 'var(--shadow-md)' }}>Create Report</Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>Report Templates</Title>
        <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Start from a proven template or build from scratch.</Text>
      </motion.div>

      {/* NEW STACKED DOCUMENT DECK CARDS */}
      <Row gutter={[32, 32]} style={{ marginBottom: 48 }}>
        {[
          { name: 'Monthly Performance Report', desc: 'All KPIs across SEO, ads, leads, social and content in one comprehensive deck.', pages: '12-16 PAGES', icon: <FileText size={24} color="var(--accent-secondary)" />, tag: 'MOST USED', color: 'rgba(13, 148, 136, 0.15)' },
          { name: 'SEO Ranking Report', desc: 'Keyword positions, organic traffic, top pages and backlink growth.', pages: '6-8 PAGES', icon: <BarChart2 size={24} color="var(--accent-primary)" />, color: 'rgba(16, 185, 129, 0.15)' },
          { name: 'Paid Media Report', desc: 'Ad spend, leads, ROAS and campaign-level breakdown across platforms.', pages: '8-10 PAGES', icon: <Target size={24} color="var(--accent-warning)" />, color: 'rgba(245, 158, 11, 0.15)' },
          { name: 'Executive Summary', desc: '1-page MOS score with top wins, risks and next steps for leadership.', pages: '1 PAGE', icon: <Zap size={24} color="var(--accent-info)" />, color: 'rgba(139, 92, 246, 0.15)' },
        ].map((tpl, i) => (
          <Col xs={24} lg={6} key={i}>
            <motion.div whileHover={{ scale: 1.02, x: -4, y: -4, transition: { duration: 0.2 } }} style={{ height: '100%', position: 'relative' }}>
              
              {/* Stacked shadows effect applied directly to the Card to simulate multiple papers */}
              <Card 
                style={{ 
                  borderRadius: 4, // Sharp paper-like edges
                  height: '100%', 
                  border: '1px solid var(--border-color)', 
                  background: 'var(--bg-secondary)',
                  boxShadow: '4px 4px 0px 0px var(--bg-tertiary), 8px 8px 0px 0px var(--border-color)', // Multi-layered brutalist shadow
                  transition: 'all 0.2s ease-in-out',
                }} 
                bodyStyle={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%' }}
                className="hover-stack-expand"
              >
                {/* Decorative Top Binding/Line */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: tpl.icon.props.color, borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, marginTop: 4 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: tpl.color, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid var(--border-color)' }}>{tpl.icon}</div>
                  {tpl.tag && <Tag style={{ margin: 0, borderRadius: 12, height: 'fit-content', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-primary)', fontWeight: 700, border: 'none', padding: '4px 12px' }}>{tpl.tag}</Tag>}
                </div>
                
                <strong style={{ fontSize: 16, display: 'block', marginBottom: 12, color: 'var(--text-primary)' }}>{tpl.name}</strong>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 14, display: 'block', flex: 1, lineHeight: 1.6, fontWeight: 500 }}>{tpl.desc}</Text>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '24px 0' }}>
                  <FileText size={14} color="var(--text-tertiary)" />
                  <Text style={{ color: 'var(--text-tertiary)', fontSize: 11, fontWeight: 800, letterSpacing: 1.5, display: 'block', margin: 0 }}>{tpl.pages}</Text>
                </div>
                
                <Button onClick={() => setIsModalOpen(true)} block style={{ borderRadius: 8, height: 44, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-primary)' }}>Use Template</Button>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <style dangerouslySetInnerHTML={{__html: `
        .hover-stack-expand:hover {
          box-shadow: 6px 6px 0px 0px var(--bg-tertiary), 12px 12px 0px 0px var(--border-color) !important;
        }
      `}} />

      <motion.div variants={itemVariants}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Scheduled Reports</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Automated delivery to clients on a recurring cadence.</Text></div>} 
          className="glassmorphism" style={{ borderRadius: 16, marginBottom: 32, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 0 }}
        >
          <Table columns={scheduledCols} dataSource={scheduledReports} pagination={false} rowKey="id" size="middle" scroll={{ x: 1000 }} rowClassName={() => 'hover-bg'} />
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Sent Reports</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>History of delivered reports and engagement.</Text></div>} 
          className="glassmorphism" style={{ borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', marginBottom: 40 }} bodyStyle={{ padding: 0 }}
        >
          <Table columns={recentCols} dataSource={recentSentReports} pagination={false} rowKey="id" size="middle" scroll={{ x: 1000 }} rowClassName={() => 'hover-bg'} />
        </Card>
      </motion.div>

      <CreateReportModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </motion.div>
  );
};

export default Reports;
