import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography, Row, Col, Card, Button, Input, Modal, Form, Select,
  Tag, Spin, message, Alert, Divider, Progress, Tabs, Avatar, Badge, Tooltip, Statistic
} from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Sparkles, MessageSquare, Target, Play, Download, Plus, Settings2,
  Globe, CheckCircle2, AlertTriangle, TrendingUp, Link2, Activity, RefreshCw,
  ChevronRight, Layers, Zap, Brain, BarChart3, Eye, FileText, Clock,
  Shield, Users, Award, BookOpen, ArrowUpRight, Rocket, Radio
} from 'lucide-react';

import ScoreCard from '../../components/seo/ScoreCard';
import IssueTable from '../../components/seo/IssueTable';
import KeywordTable from '../../components/seo/KeywordTable';
import SEOTab from './tabs/SEOTab';
import AEOTab from './tabs/AEOTab';
import GEOTab from './tabs/GEOTab';

import * as seoApi from '../../api/seoApi';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// ─── Animation Variants ──────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 24 } }
};

// ─── Side Nav Items ───────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: 'overview',  label: 'Overview',     icon: <BarChart3 size={16} /> },
  { key: 'projects',  label: 'Projects',     icon: <Layers size={16} /> },
  { key: 'seo',       label: 'SEO',          icon: <Search size={16} />,       badge: 'SEO' },
  { key: 'aeo',       label: 'AEO',          icon: <MessageSquare size={16} />, badge: 'AEO' },
  { key: 'geo',       label: 'GEO',          icon: <Sparkles size={16} />,     badge: 'GEO' },
  { key: 'reports',   label: 'Reports',      icon: <FileText size={16} /> },
  { key: 'settings',  label: 'Settings',     icon: <Settings2 size={16} /> },
];

const BADGE_COLORS = { SEO: '#10b981', AEO: '#6366f1', GEO: '#f59e0b' };

// ─── Project Onboard Modal ────────────────────────────────────────────
const OnboardModal = ({ open, onClose, onCreated }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await seoApi.createProject({
        name: values.name,
        siteUrl: values.siteUrl,
        cms: values.cms || 'custom',
        targets: {
          primaryKeywords: (values.keywords || '').split(',').map(k => k.trim()).filter(Boolean),
          goals: (values.goals || '').split(',').map(g => g.trim()).filter(Boolean)
        }
      });
      message.success('SEO Project created! You can now run an audit.');
      form.resetFields();
      onCreated?.();
      onClose();
    } catch (err) {
      if (err.errorFields) return; // Validation error
      message.error('Failed to create project: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open} onCancel={onClose}
      title={<><Rocket size={18} style={{ marginRight: 8, color: 'var(--accent-primary)' }} />New SEO Project</>}
      footer={null} width={540}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item label="Project / Client Name" name="name" rules={[{ required: true }]}>
          <Input placeholder="e.g. Prestige Estates" />
        </Form.Item>
        <Form.Item label="Website URL" name="siteUrl" rules={[{ required: true, type: 'url', message: 'Enter a valid URL' }]}>
          <Input placeholder="https://example.com" prefix={<Globe size={14} />} />
        </Form.Item>
        <Form.Item label="CMS" name="cms">
          <Select defaultValue="custom">
            <Select.Option value="custom">Custom / Other</Select.Option>
            <Select.Option value="wordpress">WordPress</Select.Option>
            <Select.Option value="shopify">Shopify</Select.Option>
            <Select.Option value="wix">Wix</Select.Option>
            <Select.Option value="squarespace">Squarespace</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Primary Target Keywords (comma separated)" name="keywords">
          <Input.TextArea rows={2} placeholder="luxury apartments bangalore, prestige estates, real estate bangalore" />
        </Form.Item>
        <Form.Item label="Goals (comma separated)" name="goals">
          <Input placeholder="Grow organic traffic, Rank top 5, Improve site health" />
        </Form.Item>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}
            style={{ background: 'var(--accent-primary)', borderColor: 'var(--accent-primary)', borderRadius: 8, fontWeight: 700 }}>
            Create Project
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

// ─── Overview Panel ───────────────────────────────────────────────────
const OverviewPanel = ({ project, issues, keywords, onTriggerAudit, auditLoading }) => {
  const criticals = issues.filter(i => i.severity === 'critical' && i.status === 'open').length;
  const warnings = issues.filter(i => i.severity === 'warning' && i.status === 'open').length;
  const top10 = keywords.filter(k => k.position <= 10).length;

  const widgets = [
    { label: 'Critical Issues', val: criticals, icon: <AlertTriangle size={20} />, color: criticals > 0 ? 'var(--accent-danger)' : 'var(--accent-secondary)', sub: criticals > 0 ? 'Needs immediate attention' : 'All clear' },
    { label: 'Warnings', val: warnings, icon: <AlertTriangle size={20} />, color: 'var(--accent-warning)', sub: `${issues.length} total issues` },
    { label: 'Keywords in Top 10', val: top10, icon: <TrendingUp size={20} />, color: 'var(--accent-primary)', sub: `of ${keywords.length} tracked` },
    { label: 'Total Keywords', val: keywords.length, icon: <Search size={20} />, color: 'var(--accent-info)', sub: 'Being monitored' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Hero Action Row */}
      <motion.div variants={itemVariants} style={{ marginBottom: 24, padding: '24px 28px', borderRadius: 16, background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(99,102,241,0.1) 100%)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
            {project ? `Project: ${project.name}` : 'No Active Project'}
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {project ? `${project.siteUrl} · Phase: ${project.phase.charAt(0).toUpperCase() + project.phase.slice(1)}` : 'Create a project to get started.'}
          </Text>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {project && (
            <Button
              icon={<Play size={15} />}
              loading={auditLoading}
              onClick={onTriggerAudit}
              style={{ background: 'var(--accent-secondary)', borderColor: 'var(--accent-secondary)', color: '#fff', borderRadius: 8, fontWeight: 700 }}
              type="primary"
            >
              Run Full Audit
            </Button>
          )}
        </div>
      </motion.div>

      {/* Widget Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {widgets.map((w, i) => (
          <Col xs={24} sm={12} xl={6} key={i}>
            <motion.div variants={itemVariants}>
              <Card
                bodyStyle={{ padding: 20 }}
                style={{ borderRadius: 14, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderTop: `3px solid ${w.color}`, boxShadow: 'var(--shadow-sm)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>{w.label.toUpperCase()}</Text>
                  <span style={{ color: w.color, opacity: 0.8 }}>{w.icon}</span>
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{w.val}</div>
                <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>{w.sub}</Text>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Issues + Phase Progress */}
      <Row gutter={[24, 24]}>
        <Col xs={24} xl={16}>
          <motion.div variants={itemVariants}>
            <Card title={<Title level={5} style={{ margin: 0, color: 'var(--text-primary)' }}>Open Issues</Title>}
              bodyStyle={{ padding: '16px 20px', maxHeight: 420, overflowY: 'auto' }}
              style={{ borderRadius: 16, border: '1px solid var(--border-color)' }}>
              <IssueTable issues={issues} onIssueUpdated={() => {}} />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} xl={8}>
          <motion.div variants={itemVariants}>
            <Card title={<Title level={5} style={{ margin: 0, color: 'var(--text-primary)' }}>Pipeline Progress</Title>}
              style={{ borderRadius: 16, border: '1px solid var(--border-color)', marginBottom: 16 }}>
              {['intake', 'audit', 'strategy', 'implementation', 'reaudit', 'report', 'monitoring'].map((phase, idx) => {
                const done = project?.phasesCompleted?.includes(phase);
                const active = project?.phase === phase;
                return (
                  <div key={phase} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: idx < 6 ? '1px solid var(--border-color)' : 'none' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: done ? 'var(--accent-secondary)' : active ? 'var(--accent-info)' : 'var(--bg-tertiary)', color: done || active ? '#fff' : 'var(--text-tertiary)' }}>
                      {done ? <CheckCircle2 size={14} /> : idx + 1}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: done ? 'var(--text-primary)' : active ? 'var(--accent-info)' : 'var(--text-tertiary)', textTransform: 'capitalize' }}>
                      {phase}
                    </span>
                    {active && <Tag color="processing" style={{ marginLeft: 'auto', borderRadius: 10, fontSize: 10, fontWeight: 700 }}>Active</Tag>}
                    {done && <CheckCircle2 size={14} color="var(--accent-secondary)" style={{ marginLeft: 'auto' }} />}
                  </div>
                );
              })}
            </Card>
          </motion.div>
        </Col>
      </Row>
    </motion.div>
  );
};

// ─── Projects Panel ───────────────────────────────────────────────────
const ProjectsPanel = ({ projects, activeProject, onSelectProject, onOpenOnboard, loading }) => (
  <motion.div variants={containerVariants} initial="hidden" animate="visible">
    <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>SEO Projects</Title>
      <Button type="primary" icon={<Plus size={15} />} onClick={onOpenOnboard}
        style={{ background: 'var(--accent-primary)', borderRadius: 8, fontWeight: 700, border: 'none' }}>
        New Project
      </Button>
    </motion.div>

    {loading ? (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spin size="large" /></div>
    ) : projects.length === 0 ? (
      <motion.div variants={itemVariants} style={{ textAlign: 'center', padding: '60px 0' }}>
        <Globe size={48} color="var(--text-tertiary)" style={{ marginBottom: 16 }} />
        <Title level={4} style={{ color: 'var(--text-secondary)' }}>No projects yet</Title>
        <Text type="secondary">Create your first SEO project to get started.</Text>
        <div style={{ marginTop: 24 }}>
          <Button type="primary" icon={<Plus size={16} />} onClick={onOpenOnboard}
            style={{ background: 'var(--accent-primary)', borderRadius: 8, fontWeight: 700, border: 'none', height: 42, paddingInline: 28 }}>
            Create First Project
          </Button>
        </div>
      </motion.div>
    ) : (
      <Row gutter={[16, 16]}>
        {projects.map((p) => {
          const isActive = activeProject?.slug === p.slug;
          return (
            <Col xs={24} sm={12} xl={8} key={p._id}>
              <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                <Card
                  bodyStyle={{ padding: 20 }}
                  style={{
                    borderRadius: 14, border: `1px solid ${isActive ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    background: isActive ? 'rgba(16,185,129,0.04)' : 'var(--bg-primary)', cursor: 'pointer',
                    boxShadow: isActive ? '0 0 0 2px rgba(16,185,129,0.2)' : 'var(--shadow-sm)'
                  }}
                  onClick={() => onSelectProject(p)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-info))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14 }}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <Tag color={p.status === 'Active' ? 'success' : p.status === 'Paused' ? 'warning' : 'default'} style={{ borderRadius: 10, fontWeight: 600, fontSize: 11 }}>
                      {p.status}
                    </Tag>
                  </div>
                  <Title level={5} style={{ margin: '0 0 4px 0', color: 'var(--text-primary)', fontSize: 15 }}>{p.name}</Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>{p.siteUrl}</Text>
                  <Divider style={{ margin: '12px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tag style={{ borderRadius: 8, fontWeight: 600, textTransform: 'capitalize', background: 'var(--bg-secondary)', border: 'none', color: 'var(--text-secondary)' }}>
                      Phase: {p.phase}
                    </Tag>
                    {isActive && <CheckCircle2 size={16} color="var(--accent-primary)" />}
                  </div>
                </Card>
              </motion.div>
            </Col>
          );
        })}
      </Row>
    )}
  </motion.div>
);

// ─── SEO Intelligence Panel ───────────────────────────────────────────
const SEOIntelligencePanel = ({ project, issues, keywords, onRefreshKeywords, onIssueUpdated, keywordLoading }) => {
  const [innerTab, setInnerTab] = useState('dashboard');
  const [addKwVisible, setAddKwVisible] = useState(false);
  const [kwInput, setKwInput] = useState('');
  const [addingKw, setAddingKw] = useState(false);

  const handleAddKeywords = async () => {
    if (!kwInput.trim() || !project) return;
    setAddingKw(true);
    try {
      const kws = kwInput.split(',').map(k => k.trim()).filter(Boolean);
      await seoApi.addKeywords(project.slug, kws);
      message.success(`${kws.length} keyword(s) added!`);
      setKwInput('');
      setAddKwVisible(false);
      onRefreshKeywords?.();
    } catch (err) {
      message.error('Failed to add keywords: ' + err.message);
    } finally {
      setAddingKw(false);
    }
  };

  const overall = project ? 82 : 0; // Demo score until audit engine returns one

  const innerNav = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'audit', label: 'Audit & Issues' },
    { key: 'keywords', label: 'Keywords' },
    { key: 'strategy', label: 'Strategy' },
    { key: 'technical', label: 'Technical' }
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Inner sub-nav */}
      <motion.div variants={itemVariants} style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-secondary)', padding: 4, borderRadius: 12, width: 'fit-content' }}>
        {innerNav.map(n => (
          <button key={n.key} onClick={() => setInnerTab(n.key)}
            style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: innerTab === n.key ? 'var(--accent-primary)' : 'transparent', color: innerTab === n.key ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
            {n.label}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div key={innerTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
          {innerTab === 'dashboard' && <SEOTab itemVariants={itemVariants} />}

          {innerTab === 'audit' && (
            <Card title={<Title level={5} style={{ margin: 0 }}>Audit Issues</Title>}
              extra={<Text type="secondary">{issues.length} total issues</Text>}
              style={{ borderRadius: 16, border: '1px solid var(--border-color)' }}
              bodyStyle={{ padding: '16px 20px' }}>
              <IssueTable issues={issues} onIssueUpdated={onIssueUpdated} />
            </Card>
          )}

          {innerTab === 'keywords' && (
            <Card
              title={<Title level={5} style={{ margin: 0 }}>Keyword Rankings</Title>}
              extra={
                <Button type="primary" icon={<Plus size={15} />} onClick={() => setAddKwVisible(true)}
                  style={{ background: 'var(--accent-secondary)', borderColor: 'var(--accent-secondary)', borderRadius: 8, fontWeight: 700 }}>
                  Add Keywords
                </Button>
              }
              style={{ borderRadius: 16, border: '1px solid var(--border-color)' }}
              bodyStyle={{ padding: '20px' }}>
              <Modal open={addKwVisible} onCancel={() => setAddKwVisible(false)} footer={null}
                title={<><Plus size={16} style={{ marginRight: 6 }} />Add Keywords</>}>
                <Text type="secondary" style={{ fontSize: 13 }}>Enter keywords separated by commas.</Text>
                <Input.TextArea
                  rows={3} value={kwInput} onChange={(e) => setKwInput(e.target.value)}
                  placeholder="luxury apartments bangalore, prestige estates whitefield, buy flat bangalore"
                  style={{ marginTop: 12, marginBottom: 16 }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <Button onClick={() => setAddKwVisible(false)}>Cancel</Button>
                  <Button type="primary" onClick={handleAddKeywords} loading={addingKw}
                    style={{ background: 'var(--accent-secondary)', borderColor: 'var(--accent-secondary)', borderRadius: 8, fontWeight: 700 }}>
                    Add Keywords
                  </Button>
                </div>
              </Modal>
              <KeywordTable
                keywords={keywords}
                onKeywordDeleted={onRefreshKeywords}
                onRefresh={() => {
                  if (!project) return;
                  seoApi.refreshKeywordRanks(project.slug).then(onRefreshKeywords).catch((e) => message.error(e.message));
                }}
                loading={keywordLoading}
              />
            </Card>
          )}

          {innerTab === 'strategy' && (
            <Card title={<Title level={5} style={{ margin: 0 }}>SEO Strategy</Title>}
              style={{ borderRadius: 16, border: '1px solid var(--border-color)' }}
              bodyStyle={{ padding: '24px' }}>
              {!project ? (
                <Alert message="No active project. Select or create an SEO project first." type="info" showIcon />
              ) : (
                <div>
                  <Alert
                    message="Gate 1 — Strategy Approval Required"
                    description="Generate a strategy, review it, and approve it before the implementation phase begins."
                    type="info" showIcon style={{ marginBottom: 20, borderRadius: 10 }}
                  />
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Button icon={<Brain size={16} />} type="primary"
                      style={{ background: 'var(--accent-primary)', borderColor: 'var(--accent-primary)', borderRadius: 8, fontWeight: 700 }}
                      onClick={() => seoApi.generateStrategy(project.slug).then(() => message.success('Strategy generated!')).catch(e => message.error(e.message))}>
                      Generate AI Strategy
                    </Button>
                    <Button icon={<CheckCircle2 size={16} />}
                      style={{ borderRadius: 8, fontWeight: 700, borderColor: 'var(--accent-secondary)', color: 'var(--accent-secondary)' }}
                      onClick={() => seoApi.approveStrategy(project.slug, 'User').then(() => message.success('Strategy approved — Gate 1 opened!')).catch(e => message.error(e.message))}>
                      Approve Strategy
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {innerTab === 'technical' && (
            <Row gutter={[16, 16]}>
              {[
                { label: 'Performance', score: 91, icon: <Zap size={18} />, color: '#10b981' },
                { label: 'Crawlability', score: 96, icon: <Eye size={18} />, color: '#6366f1' },
                { label: 'Security (HTTPS)', score: 100, icon: <Shield size={18} />, color: '#10b981' },
                { label: 'On-Page SEO', score: 82, icon: <Search size={18} />, color: '#f59e0b' },
                { label: 'Core Web Vitals', score: 78, icon: <Activity size={18} />, color: '#f59e0b' },
                { label: 'Mobile Usability', score: 94, icon: <Radio size={18} />, color: '#10b981' },
              ].map((item, i) => (
                <Col xs={24} sm={12} xl={8} key={i}>
                  <motion.div variants={itemVariants}>
                    <Card bodyStyle={{ padding: 20 }} style={{ borderRadius: 14, border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: item.color }}>{item.icon}</span>
                          <Text style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.label}</Text>
                        </div>
                        <Text style={{ fontWeight: 800, fontSize: 20, color: item.color }}>{item.score}</Text>
                      </div>
                      <Progress percent={item.score} strokeColor={item.color} trailColor="var(--bg-tertiary)" showInfo={false} size={['100%', 6]} style={{ marginBottom: 0 }} />
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Reports Panel ────────────────────────────────────────────────────
const ReportsPanel = () => (
  <motion.div variants={containerVariants} initial="hidden" animate="visible">
    <motion.div variants={itemVariants} style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Title level={4} style={{ margin: 0 }}>Reports</Title>
      <Button icon={<Download size={15} />} style={{ borderRadius: 8, fontWeight: 700, borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>Export PDF</Button>
    </motion.div>
    {[
      { title: 'Full SEO Audit Report', type: 'SEO', date: 'Today', status: 'Ready' },
      { title: 'AEO Readiness Report', type: 'AEO', date: 'Yesterday', status: 'Ready' },
      { title: 'GEO Visibility Report', type: 'GEO', date: '3 days ago', status: 'Ready' },
      { title: 'Combined Executive Summary', type: 'Combined', date: 'Last week', status: 'Ready' },
    ].map((r, i) => (
      <motion.div key={i} variants={itemVariants}>
        <Card bodyStyle={{ padding: '16px 20px' }}
          style={{ borderRadius: 14, border: '1px solid var(--border-color)', marginBottom: 12, cursor: 'pointer' }}
          hoverable>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={18} color="var(--accent-primary)" />
              </div>
              <div>
                <Text style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>{r.title}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{r.date}</Text>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Tag color="success" style={{ borderRadius: 10 }}>{r.status}</Tag>
              <Tag style={{ borderRadius: 10, background: 'var(--bg-secondary)', border: 'none', fontWeight: 700 }}>{r.type}</Tag>
              <Button type="text" icon={<Download size={14} />} />
            </div>
          </div>
        </Card>
      </motion.div>
    ))}
  </motion.div>
);

// ─── Settings Panel ───────────────────────────────────────────────────
const SettingsPanel = () => (
  <motion.div variants={containerVariants} initial="hidden" animate="visible">
    <motion.div variants={itemVariants}>
      <Title level={4} style={{ marginBottom: 24 }}>SEO Workspace Settings</Title>
      <Card title="AI Provider" style={{ borderRadius: 14, border: '1px solid var(--border-color)', marginBottom: 16 }}>
        <Alert message="Configure GEMINI_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY in your backend .env file to enable AI-powered strategy and content generation." type="info" showIcon style={{ borderRadius: 8 }} />
      </Card>
      <Card title="DataForSEO Integration" style={{ borderRadius: 14, border: '1px solid var(--border-color)', marginBottom: 16 }}>
        <Alert message="Set DATAFORSEO_USER and DATAFORSEO_PASS in backend .env to enable live keyword volume, rank tracking, and competitor discovery. Without credentials, demo mock data is used." type="info" showIcon style={{ borderRadius: 8 }} />
      </Card>
      <Card title="Google Search Console" style={{ borderRadius: 14, border: '1px solid var(--border-color)' }}>
        <Alert message="Upload a Google Service Account JSON file per project and set GSC_SITE_URL to enable organic search data imports from Search Console." type="info" showIcon style={{ borderRadius: 8 }} />
      </Card>
    </motion.div>
  </motion.div>
);

// ─── Main SEO Workspace ───────────────────────────────────────────────
const SEO = () => {
  const [activeNav, setActiveNav] = useState('overview');
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [keywordLoading, setKeywordLoading] = useState(false);
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load projects
  const loadProjects = useCallback(async () => {
    setProjectsLoading(true);
    try {
      const list = await seoApi.getProjects();
      setProjects(list);
      // Auto-select first project
      if (list.length > 0 && !activeProject) {
        setActiveProject(list[0]);
      }
    } catch {
      // Silently fail — backend may not have credentials yet
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  // Load issues for active project
  const loadIssues = useCallback(async () => {
    if (!activeProject) return;
    try {
      const list = await seoApi.getIssues(activeProject.slug);
      setIssues(list);
    } catch { setIssues([]); }
  }, [activeProject]);

  // Load keywords for active project
  const loadKeywords = useCallback(async () => {
    if (!activeProject) return;
    setKeywordLoading(true);
    try {
      const list = await seoApi.getKeywords(activeProject.slug);
      setKeywords(list);
    } catch { setKeywords([]); }
    finally { setKeywordLoading(false); }
  }, [activeProject]);

  useEffect(() => { loadProjects(); }, [loadProjects]);
  useEffect(() => { loadIssues(); loadKeywords(); }, [loadIssues, loadKeywords]);

  const handleTriggerAudit = async () => {
    if (!activeProject) return;
    setAuditLoading(true);
    try {
      const result = await seoApi.triggerAudit(activeProject.slug);
      message.success(`Audit complete — ${result.issuesCount} issues found, score: ${result.audit?.scores?.overall || 0}/100`);
      loadIssues();
    } catch (err) {
      message.error('Audit failed: ' + err.message);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleSelectProject = (p) => {
    setActiveProject(p);
    setActiveNav('overview');
  };

  const renderPanel = () => {
    switch (activeNav) {
      case 'overview': return <OverviewPanel project={activeProject} issues={issues} keywords={keywords} onTriggerAudit={handleTriggerAudit} auditLoading={auditLoading} />;
      case 'projects': return <ProjectsPanel projects={projects} activeProject={activeProject} onSelectProject={handleSelectProject} onOpenOnboard={() => setOnboardOpen(true)} loading={projectsLoading} />;
      case 'seo':      return <SEOIntelligencePanel project={activeProject} issues={issues} keywords={keywords} onRefreshKeywords={loadKeywords} onIssueUpdated={loadIssues} keywordLoading={keywordLoading} />;
      case 'aeo':      return <AEOTab itemVariants={itemVariants} />;
      case 'geo':      return <GEOTab itemVariants={itemVariants} />;
      case 'reports':  return <ReportsPanel />;
      case 'settings': return <SettingsPanel />;
      default:         return null;
    }
  };

  return (
    <div style={{ display: 'flex', gap: 0, minHeight: '80vh' }}>
      {/* ─── Sidebar ─── */}
      <motion.div
        initial={{ width: 220 }}
        animate={{ width: sidebarCollapsed ? 60 : 220 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={{
          flexShrink: 0, background: 'var(--bg-primary)', borderRight: '1px solid var(--border-color)',
          borderRadius: '16px 0 0 16px', padding: sidebarCollapsed ? '20px 8px' : '20px 12px',
          display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden'
        }}
      >
        {/* Sidebar header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, marginBottom: 8, borderBottom: '1px solid var(--border-color)', overflow: 'hidden' }}>
          {!sidebarCollapsed && (
            <div>
              <Text style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-tertiary)' }}>SEO WORKSPACE</Text>
            </div>
          )}
          <button onClick={() => setSidebarCollapsed(c => !c)}
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer', padding: '6px 8px', display: 'flex', alignItems: 'center' }}>
            <Layers size={14} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Nav items */}
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.key;
          return (
            <Tooltip key={item.key} title={sidebarCollapsed ? item.label : ''} placement="right">
              <button
                onClick={() => setActiveNav(item.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: sidebarCollapsed ? '10px 12px' : '10px 14px',
                  borderRadius: 10, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                  background: isActive ? 'rgba(16,185,129,0.12)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500, fontSize: 13, transition: 'all 0.2s', whiteSpace: 'nowrap', overflow: 'hidden'
                }}
              >
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {!sidebarCollapsed && (
                  <>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 8, background: `${BADGE_COLORS[item.badge]}22`, color: BADGE_COLORS[item.badge] }}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            </Tooltip>
          );
        })}

        {/* Active project indicator at bottom */}
        {!sidebarCollapsed && activeProject && (
          <div style={{ marginTop: 'auto', padding: '12px 14px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <Text type="secondary" style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, display: 'block', marginBottom: 6 }}>ACTIVE PROJECT</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)', flexShrink: 0 }} />
              <Text style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeProject.name}
              </Text>
            </div>
          </div>
        )}
      </motion.div>

      {/* ─── Main Content ─── */}
      <div style={{ flex: 1, padding: '20px 24px', overflow: 'hidden' }}>
        {/* Top header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5 }}>PILLAR 02 · EXECUTION</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>
              {NAV_ITEMS.find(n => n.key === activeNav)?.label || 'SEO Workspace'}
            </Title>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Button icon={<Plus size={15} />} onClick={() => setOnboardOpen(true)}
              style={{ borderRadius: 8, fontWeight: 700, borderColor: 'var(--accent-secondary)', color: 'var(--accent-secondary)', background: 'rgba(16,185,129,0.05)' }}>
              New Project
            </Button>
            {activeProject && (
              <Button icon={<Play size={15} />} loading={auditLoading} onClick={handleTriggerAudit}
                type="primary"
                style={{ background: 'var(--accent-primary)', borderColor: 'var(--accent-primary)', borderRadius: 8, fontWeight: 700 }}>
                Run Audit
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeNav} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
            {renderPanel()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Onboard Modal */}
      <OnboardModal open={onboardOpen} onClose={() => setOnboardOpen(false)} onCreated={loadProjects} />
    </div>
  );
};

export default SEO;
