import React, { useState } from 'react';
import { Typography, Row, Col, Card, Button, Table, Tag, Switch, Tabs } from 'antd';
import { motion } from 'framer-motion';
import { Bot, Zap, Activity, Clock, Target, Shield, Search, FileText, Users, MessageSquare, DollarSign, AlertTriangle } from 'lucide-react';
import AIAgentConfigureDrawer from '../../components/AIAgentConfigureDrawer';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const AIAgents = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [configuringAgent, setConfiguringAgent] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleConfigure = (agent) => {
    setConfiguringAgent(agent);
    setIsDrawerOpen(true);
  };

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

  const runningAgents = [
    {
      id: 1,
      name: 'MOS Guardian',
      category: 'Client Success',
      color: 'var(--accent-info)',
      desc: 'Monitors MOS scores across all clients in real-time. Triggers alerts when scores drop >5 points and auto-creates escalation tasks for the account manager.',
      actions: [
        { time: '12 min ago', text: 'Prestige MOS dropped 8 pts — Alert sent to Arjun Sharma' },
        { time: '2h ago', text: 'Prestige Estates (MOS 84) near high 86 — Success note logged' },
        { time: 'Yesterday', text: 'Bhartiya MOS at 62, -4 pts — Escalation created' }
      ],
      runs: 48,
      metric1: 'Clients: 12',
      metric2: 'Alerts MTD: 34',
      status: 'Running'
    },
    {
      id: 2,
      name: 'Lead Sync Agent',
      category: 'CRM/Leads',
      color: 'var(--accent-primary)',
      desc: 'Automatically syncs new leads from Google Ads, Meta Ads, and WhatsApp into the CRM. Deduplicates, scores lead quality, and assigns to the right account manager.',
      actions: [
        { time: '15 min ago', text: '38 leads synced — Macrotech Google Ads campaign' },
        { time: '35 min ago', text: '14 leads synced — Prestige Estates Meta Ads' },
        { time: 'Yesterday', text: '2 duplicate leads merged — Shriram Properties' }
      ],
      runs: 142,
      metric1: 'Synced MTD: 1,240',
      metric2: 'Dupes: 28',
      status: 'Running'
    },
    {
      id: 3,
      name: 'SLA Watchdog',
      category: 'Client Success',
      color: 'var(--accent-info)',
      desc: 'Tracks all client deliverables against SLA timelines. Sends automatic warnings when deadlines approach and escalates breaches immediately to the account manager.',
      actions: [
        { time: '2h ago', text: 'Escalated SLA breach — Escalation to Arjun + WhatsApp alert' },
        { time: '12 hrs ago', text: 'Sylvia deliverable due in 24hrs — Reminder sent to Karan' },
        { time: 'Yesterday', text: '14 deliverables completed on time — Prestige Estates' }
      ],
      runs: 96,
      metric1: 'Breaches MTD: 0',
      metric2: 'Reminders: 84',
      status: 'Running'
    },
    {
      id: 4,
      name: 'Report Dispatcher',
      category: 'Reporting',
      color: 'var(--accent-secondary)',
      desc: 'Automatically generates and delivers branded performance reports to clients on schedule. Tracks open rates, follows up on unread reports, and logs delivery confirmations.',
      actions: [
        { time: '2 days ago', text: 'June report sent to Prestige Estates — Opened by Vithal' },
        { time: '3 days ago', text: 'June report sent to Aditi — Opened 2x' },
        { time: '4 days ago', text: 'Lodha report not opened — Follow-up WhatsApp sent' }
      ],
      runs: 12,
      metric1: 'Open rate: 83%',
      metric2: 'Follow-ups: 2',
      status: 'Running'
    },
    {
      id: 5,
      name: 'Ad Budget Guardian',
      category: 'Performance Ads',
      color: 'var(--accent-danger)',
      desc: 'Monitors client pacing across Google and Meta campaigns. Alerts when ad spend exceeds budget threshold and auto-pauses overspending campaigns automatically (if enabled).',
      actions: [
        { time: '14 hrs ago', text: 'Bhartiya Meta spend 85% over budget — Alert sent to Priya' },
        { time: 'Yesterday', text: 'Brigade Google spend at 50% of budget — Pacing alert' },
        { time: 'Yesterday', text: 'Prestige Estates spend on track across all campaigns' }
      ],
      runs: 24,
      metric1: 'Alerts MTD: 8',
      metric2: 'Saved: ₹1.2L',
      status: 'Running'
    },
    {
      id: 6,
      name: 'CRO Tweaker',
      category: 'Website & CRO',
      color: 'var(--accent-warning)',
      desc: 'Monitors funnel metrics across Google Analytics, Clarity, and CRM daily. Tracks click-to-lead ratio, identifies drop-offs, and flags CRO opportunities.',
      actions: [
        { time: 'Today', text: 'New A/B test ideas detected — Prestige Estates' },
        { time: 'Yesterday', text: 'Drop-off on Step 2 of form — Alerted CRO team' },
        { time: '2 days ago', text: 'Bhartiya conversion rate improved +1.4% WoW' }
      ],
      runs: 84,
      metric1: 'New Insights: 5',
      metric2: 'Completed: 2',
      status: 'Running'
    }
  ];

  const marketplaceAgents = [
    { icon: <Search size={20}/>, name: 'SEO Optimiser Agent', desc: 'Continuously monitors keyword rankings and implements on-page SEO tweaks automatically.', users: '847 agencies', impact: '+12 MOS pts', rating: '4.8 (212 reviews)' },
    { icon: <FileText size={20}/>, name: 'Content Strategist Agent', desc: 'Generates SEO-optimised content briefs based on trending topics in your client\'s industry.', users: '624 agencies', impact: '+8 MOS pts', rating: '4.6 (128 reviews)' },
    { icon: <Users size={20}/>, name: 'Churn Predictor Agent', desc: 'Analyzes engagement signals, MOS trends, and SLA scores to predict client churn 30 days in advance.', users: '412 agencies', impact: '-45% churn rate', rating: '4.9 (184 reviews)' },
    { icon: <MessageSquare size={20}/>, name: 'Social Scheduler Agent', desc: 'Schedules and publishes social posts at AI-determined optimal engagement times. Monitors performance.', users: '1,204 agencies', impact: '+24% engagement', rating: '4.7 (421 reviews)' },
    { icon: <Target size={20}/>, name: 'Competitor Monitor Agent', desc: 'Tracks competitor rankings, ad activity, and content publishing. Sends weekly intelligence reports.', users: '389 agencies', impact: '+15% strategic wins', rating: '4.5 (142 reviews)' },
    { icon: <DollarSign size={20}/>, name: 'Invoice Chaser Agent', desc: 'Sends automated payment reminders via WhatsApp and email. Escalates overdue invoices internally.', users: '921 agencies', impact: '94% on-time recovery', rating: '4.8 (316 reviews)' },
    { icon: <Activity size={20}/>, name: 'Lead Scorer Agent', desc: 'Automatically scores every incoming lead on budget, intent, source quality, and behavioral signals.', users: '753 agencies', impact: '+31% conversion rate', rating: '4.8 (281 reviews)' }
  ];

  const activityData = [
    { id: 1, time: 'Just now', agent: 'MOS Guardian', client: 'Prestige', action: 'MOS dropped 8 pts - Alert', status: 'ALERT' },
    { id: 2, time: '15 min ago', agent: 'Lead Sync Agent', client: 'Macrotech', action: '38 leads synced from Google Ads', status: 'SUCCESS' },
    { id: 3, time: '35 min ago', agent: 'Lead Sync Agent', client: 'Prestige Estates', action: '14 leads synced from Meta Ads', status: 'SUCCESS' },
    { id: 4, time: '2 hrs ago', agent: 'SLA Watchdog', client: 'Escalation', action: 'SLA Breach - Escalated to Arjun + Alert', status: 'ALERT' },
    { id: 5, time: '2 hrs ago', agent: 'MOS Guardian', client: 'Prestige', action: 'MOS 84 - Success note logged', status: 'SUCCESS' },
    { id: 6, time: '4 hrs ago', agent: 'CRO Tweaker', client: 'Prestige Estates', action: 'New A/B test ideas detected', status: 'SUCCESS' },
  ];

  const activityCols = [
    { title: 'TIME', dataIndex: 'time', key: 'time', render: text => <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>{text}</Text> },
    { title: 'AGENT', dataIndex: 'agent', key: 'agent', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { title: 'CLIENT/PROJECT', dataIndex: 'client', key: 'client', render: text => <Text style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>{text}</Text> },
    { title: 'ACTION TAKEN', dataIndex: 'action', key: 'action', render: text => <span style={{ fontWeight: 500 }}>{text}</span> },
    { 
      title: 'STATUS', 
      dataIndex: 'status', 
      key: 'status', 
      align: 'right',
      render: status => (
        <Tag style={{ borderRadius: 12, border: 'none', background: status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.15)' : status === 'ALERT' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: status === 'SUCCESS' ? 'var(--accent-primary)' : status === 'ALERT' ? 'var(--accent-danger)' : 'var(--accent-warning)', fontWeight: 700, padding: '2px 8px', margin: 0 }}>
          {status}
        </Tag>
      )
    }
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
        <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>PILLAR 04 · INTELLIGENCE</Text>
        <Title level={2} style={{ margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: 12, fontWeight: 800 }}>
          AI Agent Marketplace 
        </Title>
        <Text type="secondary">Autonomous agents that monitor, optimize, and act — 24 hours a day, across every client.</Text>
        <div style={{ marginTop: 12, display: 'flex', gap: 16, alignItems: 'center', fontSize: 13, flexWrap: 'wrap' }}>
          <Text type="secondary" style={{ fontWeight: 500 }}>Monitoring <strong style={{color: 'var(--text-primary)'}}>12 clients</strong></Text>
          <Text type="secondary">|</Text>
          <Text type="secondary" style={{ fontWeight: 500 }}><strong style={{color: 'var(--text-primary)'}}>14</strong> data sources connected</Text>
          <Text type="secondary">|</Text>
          <Tag style={{ borderRadius: 12, border: 'none', background: 'rgba(13, 148, 136, 0.15)', color: 'var(--accent-secondary)', fontWeight: 700, padding: '4px 12px', margin: 0 }}>• 6 agents running now</Tag>
        </div>
      </motion.div>

      {/* KPI Stats - Restored to CSS Variables */}
      <motion.div variants={itemVariants} style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: 32, marginBottom: 40, display: 'flex', gap: 32, flexWrap: 'wrap', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ flex: 1, minWidth: 150 }}>
          <Text style={{ color: 'var(--text-tertiary)', fontSize: 11, fontWeight: 800, letterSpacing: 1.5, display: 'block', marginBottom: 12 }}>AGENTS DEPLOYED</Text>
          <div style={{ color: 'var(--text-primary)', fontSize: 36, fontWeight: 800, lineHeight: 1, marginBottom: 8 }}>6</div>
          <Text style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>Of 12 available</Text>
        </div>
        <div style={{ width: 1, background: 'var(--border-color)' }}></div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <Text style={{ color: 'var(--text-tertiary)', fontSize: 11, fontWeight: 800, letterSpacing: 1.5, display: 'block', marginBottom: 12 }}>ACTIONS TAKEN TODAY</Text>
          <div style={{ color: 'var(--text-primary)', fontSize: 36, fontWeight: 800, lineHeight: 1, marginBottom: 8 }}>284 <span style={{ color: 'var(--accent-primary)', fontSize: 16, fontWeight: 700, verticalAlign: 'middle' }}>↑</span></div>
          <Text style={{ color: 'var(--accent-primary)', fontSize: 13, fontWeight: 600 }}>+ 142 vs yesterday</Text>
        </div>
        <div style={{ width: 1, background: 'var(--border-color)' }}></div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <Text style={{ color: 'var(--text-tertiary)', fontSize: 11, fontWeight: 800, letterSpacing: 1.5, display: 'block', marginBottom: 12 }}>HOURS SAVED (YTD)</Text>
          <div style={{ color: 'var(--text-primary)', fontSize: 36, fontWeight: 800, lineHeight: 1, marginBottom: 8 }}>1,840</div>
          <Text style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>Across all clients</Text>
        </div>
        <div style={{ width: 1, background: 'var(--border-color)' }}></div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <Text style={{ color: 'var(--text-tertiary)', fontSize: 11, fontWeight: 800, letterSpacing: 1.5, display: 'block', marginBottom: 12 }}>AGENCY VALUE (EST.)</Text>
          <div style={{ color: 'var(--text-primary)', fontSize: 36, fontWeight: 800, lineHeight: 1, marginBottom: 8 }}>312h</div>
          <Text style={{ color: 'var(--accent-warning)', fontSize: 13, fontWeight: 600 }}>≈ ₹1.8L in base cost</Text>
        </div>
        <div style={{ width: 1, background: 'var(--border-color)' }}></div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <Text style={{ color: 'var(--text-tertiary)', fontSize: 11, fontWeight: 800, letterSpacing: 1.5, display: 'block', marginBottom: 12 }}>AGENT ACCURACY</Text>
          <div style={{ color: 'var(--text-primary)', fontSize: 36, fontWeight: 800, lineHeight: 1, marginBottom: 8 }}>97.4%</div>
          <Text style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>Across actions</Text>
        </div>
      </motion.div>

      {/* Running Now */}
      <motion.div variants={itemVariants} style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={4} style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>Running Now</Title>
            <Text type="secondary" style={{ fontWeight: 500 }}>6 agents actively monitoring your clients and campaigns.</Text>
          </div>
          <Button icon={<Activity size={16}/>} style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>Sort by: Activity</Button>
        </div>

        <Tabs defaultActiveKey="all" style={{ marginBottom: 24 }}>
          <TabPane tab={<span style={{ fontWeight: 600 }}>All (6)</span>} key="all" />
          <TabPane tab={<span style={{ fontWeight: 600 }}>Client Success</span>} key="cs" />
          <TabPane tab={<span style={{ fontWeight: 600 }}>Leads</span>} key="leads" />
          <TabPane tab={<span style={{ fontWeight: 600 }}>Ads</span>} key="ads" />
          <TabPane tab={<span style={{ fontWeight: 600 }}>Reporting</span>} key="rep" />
          <TabPane tab={<span style={{ fontWeight: 600 }}>CRO</span>} key="cro" />
        </Tabs>

        {/* NEW TECHNICAL SCHEMATIC / DASHED FRAMEWORK CARDS */}
        <Row gutter={[24, 24]}>
          {runningAgents.map(agent => (
            <Col xs={24} lg={12} key={agent.id}>
              <motion.div whileHover={{ scale: 1.01, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
                <Card 
                  style={{ 
                    borderRadius: 8, // Sharper corners for structural look
                    height: '100%', 
                    border: '1px dashed var(--border-color)', // Dashed outer border
                    background: 'var(--bg-primary)',
                    boxShadow: 'none',
                    overflow: 'hidden',
                    position: 'relative'
                  }} 
                  bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                  {/* Solid Glowing Top-Border */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: agent.color, boxShadow: `0 0 12px ${agent.color}` }} />

                  {/* Header Section */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '24px 24px 16px', borderBottom: '1px dashed var(--border-color)', background: 'var(--bg-secondary)' }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ background: 'var(--bg-tertiary)', padding: 12, borderRadius: 8, color: agent.color, border: '1px solid var(--border-color)' }}>
                        {agent.id === 1 ? <Shield size={24} /> : agent.id === 2 ? <Zap size={24} /> : agent.id === 3 ? <Clock size={24} /> : agent.id === 4 ? <FileText size={24} /> : agent.id === 5 ? <AlertTriangle size={24} /> : <Target size={24} />}
                      </div>
                      <div>
                        <Title level={5} style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>{agent.name}</Title>
                        <Tag style={{ borderRadius: 4, marginTop: 6, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontWeight: 600, margin: 0 }}>{agent.category}</Tag>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-primary)', fontSize: 12, fontWeight: 700 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)', boxShadow: '0 0 8px var(--accent-primary)' }} />
                        RUNNING
                      </div>
                      <Switch defaultChecked size="small" style={{ background: 'var(--accent-primary)' }} />
                    </div>
                  </div>

                  {/* Description Section */}
                  <div style={{ padding: '20px 24px', borderBottom: '1px dashed var(--border-color)' }}>
                    <Text style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, lineHeight: 1.6, display: 'block', minHeight: 48 }}>{agent.desc}</Text>
                  </div>

                  {/* Logs Section */}
                  <div style={{ background: 'var(--bg-tertiary)', padding: '20px 24px', flex: 1 }}>
                    <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--text-secondary)', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 12, fontWeight: 500 }}>
                      {agent.actions.map((act, idx) => (
                        <li key={idx}><strong style={{ color: 'var(--text-primary)' }}>{act.time}</strong>: {act.text}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Footer Metrics Section */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px dashed var(--border-color)', background: 'var(--bg-secondary)' }}>
                    <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
                      <span><Text type="secondary" style={{ fontWeight: 600 }}>Runs today:</Text> <strong style={{ color: 'var(--text-primary)' }}>{agent.runs}</strong></span>
                      <span><Text type="secondary" style={{ fontWeight: 600 }}>{agent.metric1.split(':')[0]}:</Text> <strong style={{ color: 'var(--text-primary)' }}>{agent.metric1.split(':')[1]}</strong></span>
                      <span><Text type="secondary" style={{ fontWeight: 600 }}>{agent.metric2.split(':')[0]}:</Text> <strong style={{ color: 'var(--text-primary)' }}>{agent.metric2.split(':')[1]}</strong></span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <a style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-secondary)' }}>View Logs</a>
                      <Button size="middle" onClick={() => handleConfigure(agent)} style={{ borderRadius: 6, fontWeight: 600, borderColor: 'var(--border-color)' }}>Configure</Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      {/* Live Activity Feed */}
      <motion.div variants={itemVariants} style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={4} style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>Live Activity Feed</Title>
            <Text type="secondary" style={{ fontWeight: 500 }}>Everything your agents did in the last 24 hours.</Text>
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}><Clock size={16}/> Auto-refreshing every 60s</span>
            <Button style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>View Full Log</Button>
          </div>
        </div>

        <Card className="glassmorphism" bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <Table columns={activityCols} dataSource={activityData} pagination={false} rowKey="id" size="middle" scroll={{ x: 1000 }} rowClassName={() => 'hover-bg'} />
        </Card>
      </motion.div>

      {/* Add More Agents */}
      <motion.div variants={itemVariants}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={4} style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>Add More Agents</Title>
            <Text type="secondary" style={{ fontWeight: 500 }}>Deploy from the marketplace — each agent is pre-trained on your data.</Text>
          </div>
          <a style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: 14 }}>Request Custom Agent</a>
        </div>

        <Row gutter={[24, 24]}>
          {marketplaceAgents.map((agent, idx) => (
            <Col xs={24} sm={12} lg={8} key={idx}>
              <motion.div whileHover={{ y: idx < 7 ? -4 : 0, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
                <Card 
                  style={{ 
                    borderRadius: 8, // Match the schematic look
                    height: '100%', 
                    opacity: idx >= 7 ? 0.6 : 1, 
                    border: '1px dashed var(--border-color)', 
                    background: 'var(--bg-secondary)',
                    boxShadow: 'none'
                  }} 
                  bodyStyle={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
                    <div style={{ background: idx >= 7 ? 'var(--bg-tertiary)' : 'rgba(139, 92, 246, 0.1)', color: idx >= 7 ? 'var(--text-secondary)' : 'var(--accent-primary)', padding: 12, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                      {agent.icon}
                    </div>
                    <div>
                      <Title level={5} style={{ margin: '0 0 6px 0', fontWeight: 700, color: 'var(--text-primary)' }}>{agent.name}</Title>
                      {idx >= 7 && <Tag style={{ borderRadius: 12, fontSize: 10, border: 'none', background: 'var(--bg-tertiary)' }}>Coming Soon</Tag>}
                    </div>
                  </div>
                  
                  <Text style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, marginBottom: 24, flex: 1, lineHeight: 1.6 }}>{agent.desc}</Text>
                  
                  {idx < 7 && (
                    <div style={{ marginBottom: 24, padding: '16px', background: 'var(--bg-primary)', borderRadius: 8, border: '1px dashed var(--border-color)' }}>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                        <Tag style={{ borderRadius: 4, border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Auto-execution</Tag>
                        <Tag style={{ borderRadius: 4, border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Alerting</Tag>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                        Used by: <strong style={{ color: 'var(--text-primary)' }}>{agent.users}</strong><br/>
                        Avg Impact: <strong style={{ color: 'var(--accent-primary)' }}>{agent.impact}</strong>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--accent-warning)', marginTop: 8, fontWeight: 700 }}>
                        ★★★★★ <Text type="secondary" style={{ marginLeft: 6, fontWeight: 500 }}>{agent.rating}</Text>
                      </div>
                    </div>
                  )}

                  {idx < 7 ? (
                    <Button type="primary" block style={{ background: 'var(--accent-secondary)', borderRadius: 8, height: 44, fontWeight: 700, border: 'none', fontSize: 15, boxShadow: 'var(--shadow-sm)' }}>Deploy Agent</Button>
                  ) : (
                    <Button block style={{ borderRadius: 8, height: 44, fontWeight: 600, borderColor: 'var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>Notify me when available</Button>
                  )}
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      <AIAgentConfigureDrawer 
        open={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        agent={configuringAgent} 
      />

    </motion.div>
  );
};

export default AIAgents;
