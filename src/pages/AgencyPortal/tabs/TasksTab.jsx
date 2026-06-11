import React from 'react';
import { Typography, Row, Col, Button, Tag, Collapse } from 'antd';
import { Plus, ArrowUpRight, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import SlabCard from '../../../components/SlabCard';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const TasksTab = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const stats = [
    { label: 'OPEN', value: '127', sub: 'across all clients', color: 'var(--text-secondary)', border: 'var(--border-color)' },
    { label: 'DUE TODAY', value: '8', sub: 'needs attention', color: 'var(--accent-warning)', border: 'var(--accent-warning)' },
    { label: 'OVERDUE', value: '3', sub: 'action required', color: 'var(--accent-danger)', border: 'var(--accent-danger)' },
    { label: 'COMPLETED THIS WEEK', value: '34', sub: '▲ +12 vs last wk', color: 'var(--accent-primary)', border: 'var(--border-color)' },
  ];

  const getStatusColor = (val) => {
    if (val >= 70) return 'var(--accent-primary)';
    if (val >= 50) return 'var(--accent-warning)';
    return 'var(--accent-danger)';
  };

  const ClientTaskHeader = ({ code, name, count, mos }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: getStatusColor(mos), color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {code}
      </div>
      <Text style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{name}</Text>
      <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>({count} tasks)</Text>
    </div>
  );

  const TaskRow = ({ priority, title, dept, code, am, date, dateColor, status }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dashed var(--border-color)', flexWrap: 'wrap', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Tag style={{ margin: 0, border: 'none', background: priority === 'CRITICAL' ? 'var(--accent-danger)' : 'var(--accent-warning)', color: '#fff', fontWeight: 800, fontSize: 10, borderRadius: 12, padding: '2px 8px' }}>
          {priority}
        </Tag>
        <Text style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{title}</Text>
        <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>· {dept} · {code} · {am}</Text>
        {date && <Text style={{ fontSize: 12, fontWeight: 700, color: dateColor }}>· {date}</Text>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Tag style={{ margin: 0, border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontWeight: 700, borderRadius: 12, padding: '2px 10px' }}>
          {status}
        </Tag>
        <Button type="text" style={{ padding: 0, fontWeight: 700, color: 'var(--accent-secondary)' }}>View</Button>
      </div>
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: 1400, margin: '0 auto' }}>
      
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={2} style={{ margin: '0 0 8px 0', fontWeight: 800 }}>Agency Tasks</Title>
          <Text type="secondary" style={{ fontSize: 15, fontWeight: 500 }}>All open tasks and deliverables across all clients</Text>
        </div>
        <Button type="primary" icon={<Plus size={18} />} style={{ background: 'var(--accent-secondary)', fontWeight: 700, borderRadius: 8, height: 40, padding: '0 20px', boxShadow: '2px 2px 0 var(--border-color)' }}>
          New Task
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: 6, borderRadius: 12, width: 'fit-content' }}>
          {['All', 'My Tasks', 'By Client', 'By AM', 'Overdue', 'Due Today'].map((filter, idx) => (
            <Button key={filter} type="text" style={{ background: idx === 0 ? 'var(--accent-primary)' : 'transparent', color: idx === 0 ? '#fff' : 'var(--text-secondary)', fontWeight: 700, borderRadius: 8 }}>
              {filter}
            </Button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
          {stats.map((stat, idx) => (
            <Col xs={24} sm={12} lg={6} key={idx}>
              <SlabCard bodyStyle={{ padding: '24px' }} style={{ borderColor: stat.border }}>
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, display: 'block', marginBottom: 16 }}>{stat.label}</Text>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: stat.color }}>{stat.sub}</div>
              </SlabCard>
            </Col>
          ))}
        </Row>
      </motion.div>

      <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
        
        {/* Prestige Estates */}
        <SlabCard bodyStyle={{ padding: '20px 24px' }}>
          <ClientTaskHeader code="PE" name="Prestige Estates" count={14} mos={84} />
          <div style={{ marginTop: 16 }}>
            <TaskRow priority="CRITICAL" title="Fix conversion tracking" dept="Ads" code="PE" am="AS" date="Due Today" dateColor="var(--accent-danger)" status="In Progress" />
            <TaskRow priority="HIGH" title="Publish June blog post" dept="Content" code="PE" am="KM" date="Jun 15" dateColor="var(--text-secondary)" status="To Do" />
          </div>
          <Button type="text" style={{ padding: 0, marginTop: 16, fontWeight: 700, color: 'var(--accent-secondary)' }}>Show all 14 →</Button>
        </SlabCard>

        {/* boAt */}
        <SlabCard bodyStyle={{ padding: '20px 24px' }}>
          <ClientTaskHeader code="BT" name="boAt" count={8} mos={81} />
          <Button type="text" style={{ padding: 0, marginTop: 16, fontWeight: 700, color: 'var(--accent-secondary)' }}>Show all 8 →</Button>
        </SlabCard>

        {/* Rapido */}
        <SlabCard bodyStyle={{ padding: '20px 24px' }}>
          <ClientTaskHeader code="RP" name="Rapido" count={6} mos={78} />
          <Button type="text" style={{ padding: 0, marginTop: 16, fontWeight: 700, color: 'var(--accent-secondary)' }}>Show all 6 →</Button>
        </SlabCard>

        {/* Nykaa */}
        <SlabCard bodyStyle={{ padding: '20px 24px' }}>
          <ClientTaskHeader code="NY" name="Nykaa" count={6} mos={76} />
          <Button type="text" style={{ padding: 0, marginTop: 16, fontWeight: 700, color: 'var(--accent-secondary)' }}>Show all 6 →</Button>
        </SlabCard>

        {/* CRED */}
        <SlabCard bodyStyle={{ padding: '20px 24px' }}>
          <ClientTaskHeader code="CR" name="CRED" count={8} mos={73} />
          <Button type="text" style={{ padding: 0, marginTop: 16, fontWeight: 700, color: 'var(--accent-secondary)' }}>Show all 8 →</Button>
        </SlabCard>

        {/* Meesho */}
        <SlabCard bodyStyle={{ padding: '20px 24px' }}>
          <ClientTaskHeader code="ME" name="Meesho" count={5} mos={71} />
          <Button type="text" style={{ padding: 0, marginTop: 16, fontWeight: 700, color: 'var(--accent-secondary)' }}>Show all 5 →</Button>
        </SlabCard>

        {/* Zepto */}
        <SlabCard bodyStyle={{ padding: '20px 24px' }}>
          <ClientTaskHeader code="ZP" name="Zepto" count={5} mos={67} />
          <Button type="text" style={{ padding: 0, marginTop: 16, fontWeight: 700, color: 'var(--accent-secondary)' }}>Show all 5 →</Button>
        </SlabCard>

        {/* Lenskart */}
        <SlabCard bodyStyle={{ padding: '20px 24px' }}>
          <ClientTaskHeader code="LK" name="Lenskart" count={5} mos={63} />
          <div style={{ marginTop: 16 }}>
            <TaskRow priority="HIGH" title="Resolve overdue creatives" dept="Creative" code="LK" am="KM" date="Overdue" dateColor="var(--accent-danger)" status="In Progress" />
          </div>
          <Button type="text" style={{ padding: 0, marginTop: 16, fontWeight: 700, color: 'var(--accent-secondary)' }}>Show all 5 →</Button>
        </SlabCard>

        {/* OYO */}
        <SlabCard bodyStyle={{ padding: '20px 24px' }}>
          <ClientTaskHeader code="OY" name="OYO" count={5} mos={62} />
          <Button type="text" style={{ padding: 0, marginTop: 16, fontWeight: 700, color: 'var(--accent-secondary)' }}>Show all 5 →</Button>
        </SlabCard>

        {/* BharatPe */}
        <SlabCard bodyStyle={{ padding: '20px 24px' }}>
          <ClientTaskHeader code="BP" name="BharatPe" count={4} mos={58} />
          <Button type="text" style={{ padding: 0, marginTop: 16, fontWeight: 700, color: 'var(--accent-secondary)' }}>Show all 4 →</Button>
        </SlabCard>

        {/* Urban Company */}
        <SlabCard bodyStyle={{ padding: '20px 24px' }}>
          <ClientTaskHeader code="UC" name="Urban Company" count={4} mos={55} />
          <Button type="text" style={{ padding: 0, marginTop: 16, fontWeight: 700, color: 'var(--accent-secondary)' }}>Show all 4 →</Button>
        </SlabCard>

        {/* Wakefit (Red background highlight) */}
        <SlabCard bodyStyle={{ padding: '20px 24px' }} style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <ClientTaskHeader code="WF" name="Wakefit" count={8} mos={49} />
          <div style={{ marginTop: 16 }}>
            <TaskRow priority="CRITICAL" title="Emergency SEO audit" dept="SEO" code="WF" am="AS" date="Jun 10" dateColor="var(--text-secondary)" status="In Progress" />
            <TaskRow priority="CRITICAL" title="Reactivate Google Ads" dept="Ads" code="WF" am="PN" date="Jun 12" dateColor="var(--text-secondary)" status="To Do" />
          </div>
          <Button type="text" style={{ padding: 0, marginTop: 16, fontWeight: 700, color: 'var(--accent-secondary)' }}>Show all 8 →</Button>
        </SlabCard>

      </motion.div>

      <motion.div variants={itemVariants} style={{ marginBottom: 40 }}>
        <Button type="link" style={{ padding: 0, fontWeight: 800, fontSize: 14, color: 'var(--accent-secondary)' }}>
          Open Task Management <ArrowUpRight size={16} style={{ marginLeft: 4 }} />
        </Button>
      </motion.div>

    </motion.div>
  );
};

export default TasksTab;
