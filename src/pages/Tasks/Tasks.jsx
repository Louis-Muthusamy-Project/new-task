import React, { useState } from 'react';
import { Typography, Row, Col, Card, Button, Select, Avatar, Tag, Input, Badge, Progress } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Download, Upload, Filter, Sparkles, ChevronDown, CheckSquare, MessageCircle, AlertCircle, Clock, CheckCircle2, ListTodo, CalendarClock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { taskKanbanData } from '../../data/mock';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Tasks = () => {
  const [activeTab, setActiveTab] = useState('board');

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

  const getTagStyle = (tag) => {
    switch(tag) {
      case 'ADS': return { color: 'var(--accent-info)', bg: 'rgba(59, 130, 246, 0.15)' };
      case 'CONTENT': return { color: 'var(--accent-primary)', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'SOCIAL': return { color: 'var(--accent-secondary)', bg: 'rgba(13, 148, 136, 0.15)' };
      case 'SEO': return { color: 'var(--accent-warning)', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'DESIGN': return { color: 'var(--text-tertiary)', bg: 'var(--bg-tertiary)' };
      default: return { color: 'var(--text-secondary)', bg: 'var(--bg-tertiary)' };
    }
  };

  const getAssigneeColor = (init) => {
    switch(init) {
      case 'AS': return 'var(--accent-secondary)';
      case 'PN': return 'var(--accent-info)';
      case 'KM': return 'var(--accent-warning)';
      case 'DR': return 'var(--text-tertiary)';
      case 'RS': return 'var(--accent-danger)';
      default: return 'var(--text-secondary)';
    }
  };

  const TaskCard = ({ task }) => (
    <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }}>
      <Card bodyStyle={{ padding: 16 }} style={{ borderRadius: 12, marginBottom: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', background: 'var(--bg-primary)', cursor: 'pointer' }}>
        <strong style={{ display: 'block', fontSize: 14, marginBottom: 12, lineHeight: 1.4, color: 'var(--text-primary)' }}>{task.title}</strong>
        
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <Tag style={{ margin: 0, color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, padding: '2px 8px' }}>{task.client}</Tag>
          <Tag style={{ margin: 0, color: getTagStyle(task.tag).color, background: getTagStyle(task.tag).bg, border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, padding: '2px 8px' }}>{task.tag}</Tag>
          {task.tag2 && <Tag style={{ margin: 0, color: getTagStyle(task.tag2).color, background: getTagStyle(task.tag2).bg, border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, padding: '2px 8px' }}>{task.tag2}</Tag>}
        </div>

        {task.blockedReason && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', padding: '8px 12px', borderRadius: 8, fontSize: 12, marginBottom: 16, display: 'flex', gap: 8, alignItems: 'flex-start', fontWeight: 500 }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{task.blockedReason}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar size={24} style={{ backgroundColor: getAssigneeColor(task.assignee), fontSize: 11, fontWeight: 700 }}>{task.assignee}</Avatar>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: task.due.includes('Today') || task.due.includes('Yesterday') ? 'var(--accent-danger)' : task.due.includes('ON TIME') ? 'var(--accent-primary)' : 'var(--text-secondary)', background: task.due.includes('ON TIME') ? 'rgba(16, 185, 129, 0.15)' : 'transparent', padding: task.due.includes('ON TIME') ? '4px 8px' : 0, borderRadius: 6 }}>
              {task.due.includes('ON TIME') ? <CheckCircle2 size={14}/> : <Clock size={14}/>} 
              {task.due}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckSquare size={14}/> {task.sub}</span>
            {task.comments > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MessageCircle size={14}/> {task.comments}</span>}
          </div>
        </div>

        {task.blockedReason && (
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Button size="middle" style={{ flex: 1, fontSize: 13, borderColor: 'var(--accent-warning)', color: 'var(--accent-warning)', fontWeight: 600 }}>Unblock</Button>
            <Button size="middle" style={{ flex: 1, fontSize: 13, background: 'var(--accent-danger)', color: 'var(--bg-primary)', border: 'none', fontWeight: 600 }}>Escalate</Button>
          </div>
        )}
      </Card>
    </motion.div>
  );

  const KanbanColumn = ({ title, count, items, color, bg }) => (
    <div style={{ width: 340, flexShrink: 0, background: bg || 'var(--bg-secondary)', borderRadius: 16, padding: '16px 16px 0 16px', display: 'flex', flexDirection: 'column', height: 700, border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Tag style={{ borderRadius: 16, background: color, color: 'var(--bg-primary)', border: 'none', margin: 0, fontWeight: 700, fontSize: 12, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
          {title} 
          <span style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: 12, fontSize: 11 }}>{count}</span>
        </Tag>
        <Button type="text" icon={<Plus size={16} color="var(--text-secondary)" />} size="small" style={{ background: 'var(--bg-tertiary)', borderRadius: 8 }} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, paddingBottom: 16 }} className="custom-scroll">
        {items.map(task => <TaskCard key={task.id} task={task} />)}
        {items.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '32px 0', fontSize: 13, fontWeight: 500 }}>No tasks</div>}
      </div>
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>PILLAR 02 · EXECUTION</Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>Task Management</Title>
          <Text type="secondary">Every deliverable, campaign task, and internal work — one command centre.</Text>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Select defaultValue="All Clients" style={{ width: 150, fontWeight: 600 }} size="large"><Option value="All Clients">All Clients</Option></Select>
          <Button type="primary" icon={<Plus size={16} />} style={{ borderRadius: 8, height: 40, background: 'var(--accent-secondary)', border: 'none', boxShadow: 'var(--shadow-md)', fontWeight: 600 }}>New Task</Button>
          <Button style={{ borderRadius: 8, height: 40, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', fontWeight: 600 }}>New Project</Button>
          <Button icon={<Download size={16} />} style={{ borderRadius: 8, height: 40, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', fontWeight: 600 }}>Import from Brief</Button>
        </div>
      </motion.div>

      {/* NEW OFFSET 3D ICON BADGE CARDS */}
      <Row gutter={[20, 20]} style={{ marginBottom: 32, marginTop: 12 }}>
        {[
          { label: 'TOTAL OPEN TASKS', val: '127', sub: '18 urgent · 109 normal', color: 'var(--accent-secondary)', icon: <ListTodo size={20} color="var(--bg-primary)" /> },
          { label: 'DUE TODAY', val: '8', sub: '4 overdue from yesterday', alert: true, color: 'var(--accent-warning)', icon: <CalendarClock size={20} color="var(--bg-primary)" /> },
          { label: 'COMPLETED THIS WEEK', val: '34', sub: '68% on-time delivery', pos: true, badge: '▲ +6', color: 'var(--accent-primary)', icon: <CheckCircle size={20} color="var(--bg-primary)" /> },
          { label: 'BLOCKED / AT RISK', val: '6', sub: 'Need attention', risk: true, badge: 'RISK', color: 'var(--accent-danger)', icon: <AlertTriangle size={20} color="var(--bg-primary)" /> },
          { label: 'TEAM VELOCITY', val: '34 / wk', sub: '7-day rolling avg', pos: true, badge: '▲ 12%', color: 'var(--accent-info)', icon: <TrendingUp size={20} color="var(--bg-primary)" /> },
        ].map((kpi, i) => (
          <Col xs={24} sm={12} lg={4} style={{ flex: '1 1 200px', minWidth: 200}} key={i}>
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
              <Card 
                bodyStyle={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }} 
                style={{ 
                  borderRadius: 16, 
                  height: '100%', 
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  overflow: 'visible' // Allow the badge to overflow
                }}
              >
                {/* Offset 3D Badge */}
                <div style={{ 
                  position: 'absolute', 
                  top: -16, 
                  left: -16, 
                  width: 44, 
                  height: 44, 
                  background: kpi.color, 
                  borderRadius: 12, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: `0 8px 16px ${kpi.color}40`,
                  zIndex: 2
                }}>
                  {kpi.icon}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 24, marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5 }}>{kpi.label}</Text>
                  {kpi.badge && <Tag style={{ margin: 0, borderRadius: 12, border: 'none', background: kpi.pos ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: kpi.pos ? 'var(--accent-primary)' : 'var(--accent-danger)', fontSize: 11, fontWeight: 700, padding: '2px 8px' }}>{kpi.badge}</Tag>}
                </div>
                
                <Title level={2} style={{ margin: '8px 0 8px', color: kpi.alert ? 'var(--accent-warning)' : kpi.risk ? 'var(--accent-danger)' : 'var(--text-primary)', fontSize: 36, fontWeight: 800 }}>{kpi.val}</Title>
                <Text style={{ fontSize: 13, fontWeight: 600, color: kpi.alert || kpi.risk ? (kpi.alert ? 'var(--accent-warning)' : 'var(--accent-danger)') : 'var(--text-secondary)', marginTop: 'auto' }}>{kpi.sub}</Text>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <motion.div variants={itemVariants}>
        <Card className="glassmorphism" style={{ borderRadius: 16, marginBottom: 32, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {['Board', 'List', 'Timeline', 'Calendar', 'Table'].map(t => (
                <Button key={t} type={t === 'Board' ? 'default' : 'text'} size="middle" style={{ borderRadius: 8, fontWeight: t === 'Board' ? 600 : 500, background: t === 'Board' ? 'var(--bg-tertiary)' : 'transparent', color: t === 'Board' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{t}</Button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 13 }}>
              <Text type="secondary" style={{ fontWeight: 500 }}>Group by: <strong style={{ color: 'var(--text-primary)' }}>Assignee</strong></Text>
              <Text type="secondary" style={{ fontWeight: 500 }}>Sort: <strong style={{ color: 'var(--text-primary)' }}>Due Date</strong></Text>
              <Button size="middle" icon={<Filter size={14}/>} style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Customize</Button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <Button size="middle" icon={<Filter size={14}/>} style={{ borderRadius: 20, fontWeight: 500, borderColor: 'var(--border-color)' }}>Client: All <ChevronDown size={14}/></Button>
            <Button size="middle" style={{ borderRadius: 20, fontWeight: 500, borderColor: 'var(--border-color)' }}>Assignee: All <ChevronDown size={14}/></Button>
            <Button size="middle" style={{ borderRadius: 20, fontWeight: 500, borderColor: 'var(--border-color)' }}>Priority: All <ChevronDown size={14}/></Button>
            <Button size="middle" style={{ borderRadius: 20, fontWeight: 500, borderColor: 'var(--border-color)' }}>Status: All <ChevronDown size={14}/></Button>
            <Button size="middle" style={{ borderRadius: 20, fontWeight: 500, borderColor: 'var(--border-color)' }}>Due: Any <ChevronDown size={14}/></Button>
            <Button size="middle" style={{ borderRadius: 20, fontWeight: 500, borderColor: 'var(--border-color)' }}>Label: All <ChevronDown size={14}/></Button>
          </div>

          <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 16, minHeight: 700 }}>
            <KanbanColumn title="TO DO" count={16} color="var(--text-tertiary)" items={taskKanbanData.todo} bg="var(--bg-tertiary)" />
            <KanbanColumn title="IN PROGRESS" count={12} color="var(--accent-info)" items={taskKanbanData.inProgress} bg="rgba(59, 130, 246, 0.05)" />
            <KanbanColumn title="IN REVIEW" count={8} color="var(--accent-warning)" items={taskKanbanData.inReview} bg="rgba(245, 158, 11, 0.05)" />
            <KanbanColumn title="DONE" count={34} color="var(--accent-primary)" items={taskKanbanData.done} bg="rgba(16, 185, 129, 0.05)" />
            <KanbanColumn title="BLOCKED" count={6} color="var(--accent-danger)" items={taskKanbanData.blocked} bg="rgba(239, 68, 68, 0.05)" />
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card 
          title={<div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8 }}><Avatar size="default" style={{ backgroundColor: 'var(--accent-secondary)', fontSize: 13, fontWeight: 700 }}>AS</Avatar> <Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>My Tasks — Arjun Sharma</Title></div>} 
          extra={<ChevronDown size={20} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />}
          className="glassmorphism" style={{ borderRadius: 16, marginBottom: 32, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 24 }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={8}>
              <div style={{ border: '2px solid var(--accent-danger)', borderRadius: 12, padding: 20, background: 'rgba(239, 68, 68, 0.02)', height: '100%' }}>
                <strong style={{ fontSize: 15, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, color: 'var(--text-primary)' }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-danger)' }} /> Due Today <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>(3)</span></strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 500 }}><span><CheckSquare size={16} style={{ marginRight: 10, color: 'var(--text-tertiary)', verticalAlign: '-3px' }}/> Fix BharatPe conversion tracking</span> <Tag style={{ margin: 0, borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 700, background: 'var(--bg-tertiary)' }}>BHARATPE</Tag></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 500 }}><span><CheckSquare size={16} style={{ marginRight: 10, color: 'var(--text-tertiary)', verticalAlign: '-3px' }}/> Wakefit SEO audit</span> <Tag style={{ margin: 0, borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 700, color: 'var(--accent-danger)', background: 'rgba(239, 68, 68, 0.15)' }}>WAKEFIT</Tag></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 500 }}><span><CheckSquare size={16} style={{ marginRight: 10, color: 'var(--text-tertiary)', verticalAlign: '-3px' }}/> Prestige perf report review</span> <Tag style={{ margin: 0, borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 700, color: 'var(--accent-secondary)', background: 'rgba(13, 148, 136, 0.15)' }}>PRESTIGE ESTATES</Tag></div>
                </div>
              </div>
            </Col>
            <Col xs={24} lg={8}>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, background: 'var(--bg-primary)', height: '100%' }}>
                <strong style={{ fontSize: 15, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, color: 'var(--text-primary)' }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-warning)' }} /> Due This Week <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>(8)</span></strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 500 }}><span><CheckSquare size={16} style={{ marginRight: 10, color: 'var(--text-tertiary)', verticalAlign: '-3px' }}/> Q3 keyword strategy</span> <Tag style={{ margin: 0, borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 700, background: 'var(--bg-tertiary)' }}>PRESTIGE ESTATES</Tag></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 500 }}><span><CheckSquare size={16} style={{ marginRight: 10, color: 'var(--text-tertiary)', verticalAlign: '-3px' }}/> Rapido monthly SEO report</span> <Tag style={{ margin: 0, borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 700, color: 'var(--accent-warning)', background: 'rgba(245, 158, 11, 0.15)' }}>RAPIDO</Tag></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 500 }}><span><CheckSquare size={16} style={{ marginRight: 10, color: 'var(--text-tertiary)', verticalAlign: '-3px' }}/> Lenskart audit kickoff</span> <Tag style={{ margin: 0, borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 700, color: 'var(--accent-info)', background: 'rgba(59, 130, 246, 0.15)' }}>LENSKART</Tag></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 500 }}><span><CheckSquare size={16} style={{ marginRight: 10, color: 'var(--text-tertiary)', verticalAlign: '-3px' }}/> Meesho campaign review</span> <Tag style={{ margin: 0, borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 700, color: 'var(--accent-primary)', background: 'rgba(16, 185, 129, 0.15)' }}>MEESHO</Tag></div>
                </div>
              </div>
            </Col>
            <Col xs={24} lg={8}>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, background: 'var(--bg-primary)', height: '100%' }}>
                <strong style={{ fontSize: 15, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, color: 'var(--text-primary)' }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-info)' }} /> Upcoming <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>(17)</span></strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 500 }}><span><CheckSquare size={16} style={{ marginRight: 10, color: 'var(--text-tertiary)', verticalAlign: '-3px' }}/> OYO July planning</span> <Tag style={{ margin: 0, borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 700, background: 'var(--bg-tertiary)' }}>OYO</Tag></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 500 }}><span><CheckSquare size={16} style={{ marginRight: 10, color: 'var(--text-tertiary)', verticalAlign: '-3px' }}/> boAt content QA</span> <Tag style={{ margin: 0, borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 700, background: 'var(--bg-tertiary)' }}>BOAT</Tag></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 500 }}><span><CheckSquare size={16} style={{ marginRight: 10, color: 'var(--text-tertiary)', verticalAlign: '-3px' }}/> CRED retainer review</span> <Tag style={{ margin: 0, borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 700, background: 'var(--bg-tertiary)' }}>CRED</Tag></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 500 }}><span><CheckSquare size={16} style={{ marginRight: 10, color: 'var(--text-tertiary)', verticalAlign: '-3px' }}/> Nykaa brand refresh</span> <Tag style={{ margin: 0, borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 700, background: 'var(--bg-tertiary)' }}>NYKAA</Tag></div>
                </div>
              </div>
            </Col>
          </Row>
          <Input placeholder="Add personal task..." style={{ marginTop: 24, borderRadius: 8, height: 44 }} />
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card style={{ borderRadius: 16, marginBottom: 32, background: 'var(--bg-secondary)', border: '2px solid var(--accent-secondary)' }} bodyStyle={{ padding: 24 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <div style={{ background: 'var(--accent-secondary)', padding: 12, borderRadius: 12, height: 'fit-content', boxShadow: '0 8px 16px rgba(13, 148, 136, 0.2)' }}><Sparkles size={24} color="var(--bg-primary)" /></div>
            <div>
              <strong style={{ fontSize: 16, color: 'var(--text-primary)' }}>Generate Tasks from Brief</strong>
              <Text type="secondary" style={{ display: 'block', fontSize: 13, fontWeight: 500, marginTop: 4 }}>Paste a campaign brief, meeting notes, or SOW here — AI creates all tasks automatically.</Text>
            </div>
          </div>
          
          <TextArea rows={4} placeholder="Paste campaign brief, meeting notes, or SOW here..." style={{ borderRadius: 12, marginBottom: 20, fontSize: 14, padding: 16 }} />
          
          <div style={{ display: 'flex', gap: 24, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8, fontWeight: 600 }}>For client:</Text>
              <Select defaultValue="Prestige Estates" style={{ width: '100%' }} size="large"><Option value="Prestige Estates">Prestige Estates</Option></Select>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8, fontWeight: 600 }}>Assign to:</Text>
              <Select defaultValue="Auto by role" style={{ width: '100%' }} size="large"><Option value="Auto by role">Auto by role</Option></Select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <Tag style={{ borderRadius: 20, padding: '6px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontWeight: 600 }}>June content calendar</Tag>
            <Tag style={{ borderRadius: 20, padding: '6px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontWeight: 600 }}>New ad campaign launch</Tag>
            <Tag style={{ borderRadius: 20, padding: '6px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontWeight: 600 }}>Website redesign</Tag>
            <Tag style={{ borderRadius: 20, padding: '6px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontWeight: 600 }}>SEO audit and fixes</Tag>
            <Tag style={{ borderRadius: 20, padding: '6px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontWeight: 600 }}>Monthly report preparation</Tag>
          </div>

          <Button type="primary" icon={<Sparkles size={16} />} style={{ background: 'var(--accent-secondary)', width: '100%', borderRadius: 12, height: 48, fontSize: 15, fontWeight: 700, border: 'none', boxShadow: 'var(--shadow-md)' }}>Generate Tasks</Button>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Team Analytics</Title></div>} 
          extra={<ChevronDown size={20} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />}
          className="glassmorphism" style={{ borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 24 }}
        >
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12} xl={6}>
              <strong style={{ fontSize: 14, display: 'block', color: 'var(--text-primary)' }}>Tasks Completed</strong>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 24, fontWeight: 500, color: 'var(--accent-primary)' }}>↑ 20% growth in output</Text>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{n:'W1', v:28},{n:'W2', v:34},{n:'W3', v:30},{n:'W4', v:42}]} margin={{ left: -20, bottom: 0 }}>
                    <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 500 }} stroke="var(--text-tertiary)" dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 500 }} stroke="var(--text-tertiary)" dx={-10} />
                    <Tooltip cursor={{ fill: 'var(--bg-tertiary)' }} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                    <Bar dataKey="v" fill="var(--accent-secondary)" radius={[6,6,0,0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Col>
            <Col xs={24} md={12} xl={6}>
              <strong style={{ fontSize: 14, display: 'block', color: 'var(--text-primary)' }}>On-time Delivery %</strong>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 24, fontWeight: 500 }}>Target 80%</Text>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[{n:'W1', v:72},{n:'W2', v:76},{n:'W3', v:71},{n:'W4', v:84}]} margin={{ left: -20, bottom: 0 }}>
                    <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 500 }} stroke="var(--text-tertiary)" dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 500 }} domain={[60, 100]} stroke="var(--text-tertiary)" dx={-10} />
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border-color)" />
                    <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                    <Line type="monotone" dataKey="v" stroke="var(--accent-primary)" strokeWidth={3} dot={{ r: 5, fill: 'var(--accent-primary)', strokeWidth: 0 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Col>
            <Col xs={24} md={12} xl={6}>
              <strong style={{ fontSize: 14, display: 'block', marginBottom: 32, color: 'var(--text-primary)' }}>By Assignee</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {['Arjun', 'Rahul', 'Priya', 'Karan', 'Divya'].map((name, i) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                    <div style={{ width: 44 }}>{name}</div>
                    <div style={{ flex: 1, height: 12, background: 'var(--bg-tertiary)', borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${100 - i*15}%`, background: 'var(--accent-secondary)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </Col>
            <Col xs={24} md={12} xl={6}>
              <strong style={{ fontSize: 14, display: 'block', marginBottom: 24, color: 'var(--text-primary)' }}>Status Breakdown</strong>
              <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{n:'To Do', v:16, fill:'var(--text-tertiary)'},{n:'In Prog', v:12, fill:'var(--accent-info)'},{n:'Review', v:8, fill:'var(--accent-warning)'},{n:'Done', v:34, fill:'var(--accent-primary)'},{n:'Blocked', v:6, fill:'var(--accent-danger)'}]} innerRadius={45} outerRadius={65} dataKey="v" stroke="none" />
                    <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', fontSize: 11, fontWeight: 600 }}>
                <span style={{ color: 'var(--text-tertiary)' }}>● To Do</span>
                <span style={{ color: 'var(--accent-info)' }}>● In Progress</span>
                <span style={{ color: 'var(--accent-warning)' }}>● In Review</span>
                <span style={{ color: 'var(--accent-primary)' }}>● Done</span>
                <span style={{ color: 'var(--accent-danger)' }}>● Blocked</span>
              </div>
            </Col>
          </Row>
        </Card>
      </motion.div>

    </motion.div>
  );
};

export default Tasks;
