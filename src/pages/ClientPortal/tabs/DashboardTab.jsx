import React from 'react';
import { Typography, Row, Col, Button, Tag } from 'antd';
import { motion } from 'framer-motion';
import { AlertTriangle, Download, Calendar, MessageCircle, BarChart2, CheckCircle2, Eye, FileText } from 'lucide-react';
import BubbleCard from '../../../components/BubbleCard';

const { Title, Text } = Typography;

const DashboardTab = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const kpis = [
    { label: 'ORGANIC TRAFFIC', value: '48,200', trend: '+18% MoM', trendColor: 'var(--accent-primary)', lineData: 'M 0 20 L 20 25 L 40 15 L 60 22 L 80 10 L 100 5', lineColor: 'var(--accent-secondary)' },
    { label: 'LEADS GENERATED', value: '142', trend: '+23% MoM', trendColor: 'var(--accent-primary)', lineData: 'M 0 25 L 20 22 L 40 20 L 60 15 L 80 12 L 100 8', lineColor: 'var(--accent-primary)' },
    { label: 'AD ROAS', value: '4.2x', trend: '+ 0.7 vs target', trendColor: 'var(--accent-primary)', lineData: null, lineColor: null },
    { label: 'SLA SCORE', value: '98%', trend: 'On track', trendColor: 'var(--accent-primary)', badge: true },
    { label: 'SOCIAL REACH', value: '2.8M', trend: '+12% MoM', trendColor: 'var(--accent-primary)', lineData: 'M 0 25 L 20 23 L 40 24 L 60 21 L 80 18 L 100 15', lineColor: 'var(--accent-info)' },
    { label: 'KEYWORD RANKINGS', value: '142', trend: '+12 in Top 10', trendColor: 'var(--accent-primary)', lineData: null, lineColor: null },
  ];

  const comparisons = [
    { metric: 'Leads', current: '142', prev: 'vs 115 last month', trend: '▲ +23.5%', color: 'var(--accent-primary)' },
    { metric: 'ROAS', current: '4.2x', prev: 'vs 3.8x last month', trend: '▲ +10.5%', color: 'var(--accent-primary)' },
    { metric: 'Organic Sessions', current: '48,200', prev: 'vs 40,800 last month', trend: '▲ +18.1%', color: 'var(--accent-primary)' },
  ];

  const deliverables = [
    { title: 'SEO Performance Report', date: 'Jun 2026', status: 'Delivered', icon: <FileText size={18}/>, action: 'View report', actionIcon: <Eye size={16}/> },
    { title: '3 Social Posts - Instagram', date: '5 Jun', status: 'Approved', statusColor: 'var(--accent-primary)', icon: <FileText size={18}/>, action: '', actionIcon: <CheckCircle2 size={18} color="var(--accent-primary)"/> },
    { title: 'Blog: Top 10 Luxury Projects in Bangalore', date: '4 Jun', status: 'Pending', statusColor: 'var(--accent-warning)', icon: <FileText size={18}/>, action: 'Review', actionIcon: <Eye size={16}/> },
    { title: 'Monthly Ad Campaign Report', date: '2 Jun', status: 'Viewed', statusColor: 'var(--accent-primary)', icon: <FileText size={18}/>, action: '', actionIcon: <CheckCircle2 size={18} color="var(--accent-primary)"/> },
    { title: 'Landing page revisions - Whitefield', date: '30 May', status: 'Delivered', icon: <FileText size={18}/>, action: 'View', actionIcon: <Eye size={16}/> },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      
      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <Text type="secondary" style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5 }}>JUNE 2026</Text>
        <Title level={2} style={{ margin: '4px 0 8px 0', fontWeight: 800 }}>Good morning, Rahul.</Title>
        <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>Here's how Prestige Estates is performing this month.</Text>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '24px 24px 24px 8px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--accent-warning)' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: 12, borderRadius: '50%' }}><AlertTriangle size={20} /></div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>You have 2 content pieces pending your approval</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}>Review before 5 PM today to keep this week's content calendar on track.</div>
            </div>
          </div>
          <Button style={{ color: 'var(--accent-warning)', border: '2px solid rgba(245, 158, 11, 0.4)', background: 'transparent', borderRadius: 12, fontWeight: 700, height: 40 }}>Review approvals</Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <BubbleCard large style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', gap: 40, alignItems: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 8px rgba(13,148,136,0.2))' }}>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--border-color)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--accent-secondary)" strokeWidth="3" strokeDasharray="84, 100" strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 44, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>84</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700, marginTop: 4 }}>OF 100</span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 300 }}>
              <Text style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 800, letterSpacing: 1.5, display: 'block', marginBottom: 8 }}>MARKETING OPERATING SCORE</Text>
              <Title level={2} style={{ margin: '0 0 12px 0', fontWeight: 800 }}>Marketing Health Score</Title>
              <Tag style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 12, fontWeight: 700, padding: '4px 16px', marginBottom: 16, fontSize: 14 }}>
                <CheckCircle2 size={16} style={{ marginRight: 6, verticalAlign: '-3px' }} /> Excellent
              </Tag>
              <Text type="secondary" style={{ display: 'block', maxWidth: 600, fontSize: 15, fontWeight: 500, lineHeight: 1.6 }}>Your marketing health is in the <strong style={{color: 'var(--text-primary)'}}>top 20%</strong> of all clients on M1. Strong wins this month across SEO and lead generation.</Text>
            </div>
          </div>

          <Text style={{ color: 'var(--text-tertiary)', fontSize: 11, fontWeight: 800, letterSpacing: 1.5, display: 'block', marginBottom: 20 }}>TREND — LAST 6 MONTHS</Text>
          <div style={{ height: 60, position: 'relative', borderBottom: '1px dashed var(--border-color)', marginBottom: 16 }}>
            <svg width="100%" height="100%" preserveAspectRatio="none" style={{ filter: 'drop-shadow(0 4px 6px rgba(13,148,136,0.3))' }}>
              <path d="M 0 45 L 150 35 L 300 40 L 450 20 L 600 25 L 800 5" fill="none" stroke="var(--accent-secondary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: 'var(--text-primary)', fontSize: 15 }}>71</span>
              <span style={{ color: 'var(--accent-primary)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: 8 }}>▲ +13 pts over 6 months</span>
            </div>
            <span style={{ color: 'var(--text-primary)', fontSize: 15 }}>84</span>
          </div>
        </BubbleCard>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginBottom: 48 }}>
        <Title level={4} style={{ margin: '0 0 24px 0', fontWeight: 800 }}>Performance this month</Title>
        <Row gutter={[24, 24]}>
          {kpis.map((kpi, idx) => (
            <Col xs={24} md={12} lg={8} key={idx}>
              <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
                <BubbleCard bodyStyle={{ padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} style={{ height: '100%' }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, display: 'block', marginBottom: 16 }}>{kpi.label}</Text>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: kpi.lineData ? 16 : 0, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{kpi.value}</span>
                      {kpi.badge ? (
                        <Tag style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 8, fontWeight: 700, fontSize: 12, marginLeft: 'auto', padding: '2px 10px' }}>{kpi.trend}</Tag>
                      ) : (
                        <span style={{ color: kpi.trendColor, fontSize: 14, fontWeight: 700 }}>{kpi.trend}</span>
                      )}
                    </div>
                  </div>
                  {kpi.lineData && (
                    <div style={{ height: 40, width: '100%', marginTop: 'auto' }}>
                      <svg width="100%" height="100%" preserveAspectRatio="none">
                        <path d={kpi.lineData} fill="none" stroke={kpi.lineColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </BubbleCard>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      <motion.div variants={itemVariants}>
        <BubbleCard large style={{ marginBottom: 48 }}>
          <Title level={4} style={{ margin: '0 0 32px 0', fontWeight: 800 }}>This Month vs Last Month</Title>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {comparisons.map((comp, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 16, border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: 16 }}>
                <Text style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 700, minWidth: 150 }}>{comp.metric}</Text>
                
                <div style={{ display: 'flex', gap: 48, flex: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100 }}>
                    <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--text-primary)' }}>{comp.current}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}>this month</span>
                  </div>
                  <div style={{ width: 1, background: 'var(--border-color)' }}></div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100 }}>
                    <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-secondary)' }}>{comp.prev.split(' ')[1]}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500, marginTop: 4 }}>last month</span>
                  </div>
                </div>

                <div style={{ minWidth: 100, textAlign: 'right' }}>
                  <span style={{ color: comp.color, fontWeight: 800, fontSize: 16, background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: 8 }}>{comp.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </BubbleCard>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
          <Col xs={24} sm={12} lg={6}>
            <Button block size="large" icon={<Download size={18}/>} style={{ borderRadius: '20px 20px 20px 6px', height: 56, fontWeight: 700, background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-sm)' }}>Download Report</Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button block size="large" icon={<Calendar size={18}/>} style={{ borderRadius: '20px 20px 20px 6px', height: 56, fontWeight: 700, background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-sm)' }}>Book a Review</Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button block size="large" icon={<MessageCircle size={18}/>} style={{ borderRadius: '20px 20px 20px 6px', height: 56, fontWeight: 800, color: '#fff', background: 'var(--accent-primary)', border: 'none', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>WhatsApp Arjun</Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button block size="large" icon={<BarChart2 size={18}/>} style={{ borderRadius: '20px 20px 20px 6px', height: 56, fontWeight: 700, background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-sm)' }}>View All Channels</Button>
          </Col>
        </Row>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Row gutter={48}>
          <Col xs={24} lg={16}>
            <Title level={4} style={{ margin: '0 0 8px 0', fontWeight: 800 }}>Recent deliverables</Title>
            <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 24, fontWeight: 500 }}>Last 5 items from your account team</Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {deliverables.map((item, idx) => (
                <div key={idx} className="hover-bg" style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', background: 'var(--bg-secondary)', borderRadius: '24px 24px 24px 8px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap', gap: 16 }}>
                  <div style={{ background: 'var(--bg-tertiary)', padding: 12, borderRadius: 12, color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <Text style={{ fontWeight: 700, display: 'block', fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>{item.title}</Text>
                    <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>{item.date}</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24, minWidth: 150, justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: item.statusColor || 'var(--accent-secondary)' }}>{item.status}</span>
                    {item.action ? (
                      <Button size="middle" icon={item.actionIcon} style={{ borderRadius: 8, fontSize: 13, fontWeight: 600, background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>{item.action}</Button>
                    ) : (
                      <div style={{ width: 100, display: 'flex', justifyContent: 'flex-end' }}>{item.actionIcon}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Col>
          <Col xs={24} lg={8} style={{ marginTop: { xs: 48, lg: 0 } }}>
            <Title level={4} style={{ margin: '0 0 8px 0', fontWeight: 800 }}>Upcoming</Title>
            <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 24, fontWeight: 500 }}>Key dates this quarter</Text>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <BubbleCard bodyStyle={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ color: 'var(--text-secondary)', marginTop: 4, background: 'var(--bg-tertiary)', padding: 12, borderRadius: 12, border: '1px solid var(--border-color)' }}><FileText size={20} /></div>
                    <div>
                      <Text style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', fontWeight: 600, marginBottom: 4 }}>Next Invoice</Text>
                      <Text style={{ fontSize: 18, fontWeight: 800, display: 'block', color: 'var(--text-primary)', marginBottom: 4 }}>₹3,20,000</Text>
                      <Text style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>due 1 July 2026</Text>
                    </div>
                  </div>
                  <a style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-secondary)' }}>View</a>
                </div>
              </BubbleCard>
              
              <BubbleCard bodyStyle={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ color: 'var(--text-secondary)', marginTop: 4, background: 'var(--bg-tertiary)', padding: 12, borderRadius: 12, border: '1px solid var(--border-color)' }}><Calendar size={20} /></div>
                    <div>
                      <Text style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', fontWeight: 600, marginBottom: 4 }}>Next SLA review</Text>
                      <Text style={{ fontSize: 16, fontWeight: 800, display: 'block', color: 'var(--text-primary)', marginBottom: 4 }}>15 July 2026</Text>
                      <Text style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500, lineHeight: 1.6 }}>Quarterly business review with Arjun R.</Text>
                    </div>
                  </div>
                </div>
              </BubbleCard>
            </div>
          </Col>
        </Row>
      </motion.div>

    </motion.div>
  );
};

export default DashboardTab;
