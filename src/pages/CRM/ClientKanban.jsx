import React from 'react';
import { Row, Col, Card, Typography, Space, Select, Tag, Avatar, Badge, Button } from 'antd';
import { motion } from 'framer-motion';
import { Plus, Phone, Calendar as CalendarIcon, Clock, MessageCircle, Mail, Briefcase, Filter } from 'lucide-react';
import { crmLeadsFull } from '../../data/mock';

const { Title, Text } = Typography;
const { Option } = Select;

const ClientKanban = () => {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const getTempColor = (temp) => {
    switch (temp) {
      case 'HOT': return { color: 'var(--accent-danger)', bg: 'rgba(239, 68, 68, 0.15)' };
      case 'WARM': return { color: 'var(--accent-warning)', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'COLD': return { color: 'var(--accent-info)', bg: 'rgba(59, 130, 246, 0.15)' };
      case 'CONVERTED': return { color: 'var(--accent-primary)', bg: 'rgba(16, 185, 129, 0.15)' };
      default: return { color: 'var(--text-secondary)', bg: 'var(--bg-tertiary)' };
    }
  };

  const LeadCard = ({ lead }) => {
    const tempStyle = getTempColor(lead.temp);
    return (
      <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }}>
        <Card bodyStyle={{ padding: 16 }} style={{ borderRadius: 12, marginBottom: 12, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', background: 'var(--bg-primary)', cursor: 'pointer' }}>
          <strong style={{ display: 'block', fontSize: 14, marginBottom: 12, color: 'var(--text-primary)' }}>{lead.name}</strong>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <Tag style={{ margin: 0, color: tempStyle.color, background: tempStyle.bg, border: 'none', borderRadius: 12, fontSize: 10, fontWeight: 700, padding: '2px 8px' }}>● {lead.temp}</Tag>
            <Tag style={{ margin: 0, color: 'var(--accent-info)', background: 'rgba(59, 130, 246, 0.1)', border: 'none', borderRadius: 12, fontSize: 10, fontWeight: 600, padding: '2px 8px' }}>{lead.source}</Tag>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><Phone size={14} color="var(--text-tertiary)" /> {lead.phone}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><Briefcase size={14} color="var(--text-tertiary)" /> {lead.project}</span>
            <Tag style={{ background: 'var(--bg-tertiary)', border: 'none', color: 'var(--accent-primary)', alignSelf: 'flex-start', borderRadius: 6, fontWeight: 700, padding: '2px 8px' }}>{lead.budget}</Tag>
          </div>

          {lead.action && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--accent-warning)', background: 'rgba(245, 158, 11, 0.05)', padding: '6px 10px', borderRadius: 6, marginBottom: 12, fontWeight: 600 }}>
              {lead.action.includes('WhatsApp') ? <MessageCircle size={14}/> : lead.action.includes('Email') ? <Mail size={14}/> : <Phone size={14}/>}
              {lead.action}
            </div>
          )}

          {lead.visitTime && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--accent-secondary)', background: 'rgba(13, 148, 136, 0.05)', padding: '6px 10px', borderRadius: 6, marginBottom: 12, fontWeight: 600 }}>
              <CalendarIcon size={14}/> {lead.visitTime}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 12, fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12}/> {lead.time}</span>
            <Avatar size="small" style={{ backgroundColor: lead.assignee === 'AS' ? 'var(--accent-secondary)' : lead.assignee === 'PN' ? 'var(--accent-info)' : lead.assignee === 'RS' ? 'var(--accent-danger)' : 'var(--accent-warning)', fontSize: 11, fontWeight: 700 }}>{lead.assignee}</Avatar>
          </div>
        </Card>
      </motion.div>
    );
  };

  const KanbanColumn = ({ title, count, value, color, leads }) => (
    <div style={{ width: 340, flexShrink: 0, background: 'var(--bg-secondary)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 250px)', overflowY: 'auto', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: `3px solid ${color}`, paddingBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <strong style={{ fontSize: 13, letterSpacing: 1.5, color: 'var(--text-primary)' }}>{title}</strong> 
            <Badge count={count} style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontWeight: 700, boxShadow: 'none' }} />
          </div>
          <Text type="secondary" style={{ display: 'block', fontSize: 12, fontWeight: 500, marginTop: 4 }}>{value} value</Text>
        </div>
        <Button type="text" icon={<Plus size={16} color="var(--text-secondary)" />} size="small" style={{ background: 'var(--bg-tertiary)', borderRadius: 8 }} />
      </div>
      <div style={{ flex: 1, paddingRight: 4, marginRight: -4 }}>
        {leads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
      </div>
    </div>
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <motion.div variants={itemVariants} style={{ display: 'flex', gap: 24, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {['Today', 'This Week', 'This Month', 'Last Month', 'Custom'].map(filter => (
            <Tag 
              key={filter} 
              style={{ 
                background: filter === 'This Month' ? 'var(--accent-secondary)' : 'transparent', 
                color: filter === 'This Month' ? 'var(--bg-primary)' : 'var(--text-secondary)', 
                border: filter === 'This Month' ? 'none' : '1px solid var(--border-color)', 
                borderRadius: 20, 
                margin: 0, 
                padding: '6px 16px', 
                fontWeight: 600, 
                fontSize: 13, 
                cursor: 'pointer' 
              }}
            >
              {filter === 'Custom' && <Filter size={12} style={{ marginRight: 4, display: 'inline-block', verticalAlign: '-2px' }}/>}
              {filter}
            </Tag>
          ))}
        </div>
      </motion.div>

      {/* NEW GHOST TYPOGRAPHY CARDS */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32, flexShrink: 0 }}>
        {[
          { label: 'TOTAL LEADS', val: '142', sub: '▲ +23 vs last mo', desc: '38 new this week', color: 'var(--accent-primary)' },
          { label: 'QUALIFIED LEADS', val: '67', sub: '▲ 47.2% rate', desc: 'of 142 total leads', color: 'var(--accent-info)' },
          { label: 'COST PER LEAD', val: '₹5,929', sub: '▼ -₹340 vs last mo', desc: 'Target ₹6,500 ✓', color: 'var(--accent-secondary)' },
          { label: 'CONVERSION RATE', val: '8.4%', sub: '▲ +1.2% vs last mo', desc: 'Lead → Site Visit', color: 'var(--accent-warning)' },
          { label: 'PIPELINE VALUE', val: '₹2.84Cr', sub: '▲ +18% vs last mo', desc: 'Across all open stages', color: 'var(--accent-primary)' }
        ].map((kpi, i) => (
          <Col xs={24} sm={12} lg={8} xl={8} xxl={4} style={{ flex: '1 1 240px', minWidth: 240}} key={i}>
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
              <Card 
                bodyStyle={{ padding: '24px 20px', position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column' }} 
                style={{ 
                  borderRadius: 16, 
                  height: '100%',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Ghost Typography Watermark */}
                <div style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)', 
                  fontSize: 120, 
                  fontWeight: 900, 
                  color: 'var(--text-primary)', 
                  opacity: 0.03, 
                  zIndex: 1, 
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                  {kpi.val.replace(/[^0-9.]/g, '')}
                </div>

                <Text type="secondary" style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, position: 'relative', zIndex: 2 }}>{kpi.label}</Text>
                <Title level={2} style={{ margin: '16px 0 8px', color: 'var(--text-primary)', position: 'relative', zIndex: 2, fontSize: 36, fontWeight: 800 }}>{kpi.val}</Title>
                <Text style={{ fontSize: 13, color: kpi.color, display: 'block', position: 'relative', zIndex: 2, fontWeight: 600 }}>{kpi.sub}</Text>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 'auto', paddingTop: 8, position: 'relative', zIndex: 2, fontWeight: 500 }}>{kpi.desc}</Text>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <motion.div variants={itemVariants} style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 24, flex: 1, minHeight: 600 }}>
        <KanbanColumn title="NEW" count={38} value="₹76L" color="var(--border-color)" leads={crmLeadsFull.new} />
        <KanbanColumn title="CONTACTED" count={20} value="₹58L" color="var(--accent-info)" leads={crmLeadsFull.contacted} />
        <KanbanColumn title="QUALIFIED" count={24} value="₹62L" color="var(--accent-warning)" leads={crmLeadsFull.qualified} />
        <KanbanColumn title="SITE VISIT" count={18} value="₹54L" color="var(--accent-secondary)" leads={crmLeadsFull.siteVisit} />
        <KanbanColumn title="CONVERTED" count={14} value="₹34L" color="var(--accent-primary)" leads={crmLeadsFull.converted} />
      </motion.div>
    </motion.div>
  );
};

export default ClientKanban;
