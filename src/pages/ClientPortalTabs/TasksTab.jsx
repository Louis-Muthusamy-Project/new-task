import React, { useState } from 'react';
import { Typography, Row, Col, Input, Button, Tag, Avatar } from 'antd';
import { motion } from 'framer-motion';
import { Search, Plus, Calendar, Clock, CheckCircle2, MessageCircle } from 'lucide-react';
import BubbleCard from '../../components/BubbleCard';

const { Title, Text } = Typography;

const TasksTab = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const initialTasks = {
    todo: [
      { id: 't1', title: 'Q3 Campaign Strategy', tag: 'Strategy', date: 'Jul 15', assignee: 'AS', color: 'var(--accent-primary)' },
      { id: 't2', title: 'Refresh Display Ads', tag: 'Creative', date: 'Jul 05', assignee: 'PN', color: '#8b5cf6' },
      { id: 't3', title: 'Technical SEO Audit', tag: 'SEO', date: 'Jul 20', assignee: 'RS', color: '#f59e0b' },
    ],
    inProgress: [
      { id: 't4', title: 'June Instagram Content', tag: 'Social', date: 'Jun 12', assignee: 'KM', color: '#ec4899' },
      { id: 't5', title: 'Reduce CAC on Meta', tag: 'Ads', date: 'Jun 18', assignee: 'PN', color: '#3b82f6' },
    ],
    inReview: [
      { id: 't6', title: 'Monthly Performance Report', tag: 'Report', date: 'Jun 10', assignee: 'AS', color: 'var(--text-secondary)' },
      { id: 't7', title: 'Landing Page Revisions', tag: 'Web', date: 'Jun 08', assignee: 'KM', color: '#14b8a6' },
    ],
    done: [
      { id: 't8', title: 'Google Ads Reactivation', tag: 'Ads', date: 'Jun 05', assignee: 'PN', color: '#3b82f6' },
      { id: 't9', title: 'Keyword Ranking Setup', tag: 'SEO', date: 'Jun 02', assignee: 'RS', color: '#f59e0b' },
      { id: 't10', title: 'Kickoff Meeting', tag: 'Strategy', date: 'Jun 01', assignee: 'AS', color: 'var(--accent-primary)' },
    ],
  };

  const [tasks] = useState(initialTasks);

  const TaskCard = ({ task }) => (
    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16, marginBottom: 16, cursor: 'grab' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <Tag style={{ background: `${task.color}20`, color: task.color, border: 'none', borderRadius: 8, fontWeight: 700, margin: 0, padding: '2px 8px' }}>
          {task.tag}
        </Tag>
        <Avatar size={24} style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontSize: 10, fontWeight: 700, border: '1px solid var(--border-color)' }}>
          {task.assignee}
        </Avatar>
      </div>
      <Text style={{ display: 'block', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.4 }}>
        {task.title}
      </Text>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
          <Clock size={14} />
          <Text style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{task.date}</Text>
        </div>
        <Button type="text" size="small" icon={<MessageCircle size={14} />} style={{ color: 'var(--text-secondary)' }} />
      </div>
    </div>
  );

  const Column = ({ title, count, items, color }) => (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: '20px 16px', minHeight: 600, border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
          <Text style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>{title}</Text>
        </div>
        <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '2px 8px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
          {count}
        </div>
      </div>
      <div>
        {items.map(task => <TaskCard key={task.id} task={task} />)}
      </div>
      <Button type="dashed" block style={{ borderRadius: 12, borderColor: 'var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600, height: 40 }}>
        <Plus size={16} style={{ marginRight: 8 }} /> Add Request
      </Button>
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: 1400, margin: '0 auto' }}>
      
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={2} style={{ margin: '0 0 8px 0', fontWeight: 800 }}>Project Tasks</Title>
          <Text type="secondary" style={{ fontSize: 15, fontWeight: 500 }}>Track deliverables and ongoing work from your agency team.</Text>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Input 
            prefix={<Search size={16} color="var(--text-secondary)" />} 
            placeholder="Search tasks..." 
            style={{ width: 250, borderRadius: 8, padding: '8px 12px' }} 
          />
          <Button type="primary" icon={<Plus size={16} />} style={{ background: 'var(--accent-primary)', fontWeight: 700, borderRadius: 8, height: 40 }}>
            New Request
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <BubbleCard bodyStyle={{ padding: 32 }}>
          <Row gutter={24}>
            <Col xs={24} md={12} lg={6}>
              <Column title="To Do" count={tasks.todo.length} items={tasks.todo} color="var(--text-secondary)" />
            </Col>
            <Col xs={24} md={12} lg={6}>
              <Column title="In Progress" count={tasks.inProgress.length} items={tasks.inProgress} color="var(--accent-warning)" />
            </Col>
            <Col xs={24} md={12} lg={6}>
              <Column title="In Review" count={tasks.inReview.length} items={tasks.inReview} color="#8b5cf6" />
            </Col>
            <Col xs={24} md={12} lg={6}>
              <Column title="Done" count={tasks.done.length} items={tasks.done} color="var(--accent-primary)" />
            </Col>
          </Row>
        </BubbleCard>
      </motion.div>

    </motion.div>
  );
};

export default TasksTab;
