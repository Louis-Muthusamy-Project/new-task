import React, { useState } from 'react';
import { Typography, Row, Col, Card, Button, Table, Tag, Avatar, Progress, Modal, Form, Select, Input, DatePicker, Switch } from 'antd';
import { motion } from 'framer-motion';
import { Download, Plus, Edit3, Trash2, CheckCircle2, AlertCircle, Clock, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { recentTimeEntries } from '../../data/mock';

const { Title, Text } = Typography;

const TimeTracking = () => {
  const [isLogTimeModalVisible, setIsLogTimeModalVisible] = useState(false);

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

  const timesheetData = [
    { name: 'Arjun Sharma', role: 'SEO Lead', initials: 'AS', color: 'var(--accent-warning)', mon: 7, tue: 8, wed: 6, thu: 8, fri: 7, sat: '-', sun: '-', total: 36 },
    { name: 'Priya Nair', role: 'Paid Media', initials: 'PN', color: 'var(--accent-primary)', mon: 8, tue: 8, wed: 8, thu: 7, fri: 6, sat: '-', sun: '-', total: 37 },
    { name: 'Karan Mehta', role: 'Content', initials: 'KM', color: 'var(--accent-info)', mon: 5, tue: 6, wed: 8, thu: 8, fri: 7, sat: '-', sun: '-', total: 34 },
    { name: 'Divya Rao', role: 'Design', initials: 'DR', color: 'var(--accent-secondary)', mon: 7, tue: 7, wed: 7, thu: 6, fri: 7, sat: '-', sun: '-', total: 34 },
    { name: 'Rahul Singh', role: 'Account Mgr', initials: 'RS', color: 'var(--accent-danger)', mon: 6, tue: 8, wed: 5, thu: 7, fri: 8, sat: '-', sun: '-', total: 34 },
  ];

  const timeByClient = [
    { client: 'Prestige Estates', billable: 104, nonBillable: 18 },
    { client: 'Rapido', billable: 72, nonBillable: 8 },
    { client: 'Meesho', billable: 68, nonBillable: 4 },
    { client: 'Lenskart', billable: 54, nonBillable: 6 },
    { client: 'BharatPe', billable: 48, nonBillable: 12 },
    { client: 'Wakefit', billable: 32, nonBillable: 10 },
  ];

  const getHourTag = (h) => {
    if (h === '-') return <span style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>—</span>;
    if (h >= 7 && h <= 8) return <Tag style={{ margin: 0, borderRadius: 16, color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', background: 'transparent', fontWeight: 600 }}>{h}h</Tag>;
    if (h < 7) return <Tag style={{ margin: 0, borderRadius: 16, color: 'var(--accent-warning)', border: '1px solid var(--accent-warning)', background: 'transparent', fontWeight: 600 }}>{h}h</Tag>;
    return <Tag style={{ margin: 0, borderRadius: 16, color: 'var(--accent-danger)', border: '1px solid var(--accent-danger)', background: 'transparent', fontWeight: 600 }}>{h}h</Tag>;
  };

  const tsCols = [
    { title: 'TEAM MEMBER', dataIndex: 'name', key: 'name', render: (text, r) => <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Avatar size="small" style={{ backgroundColor: r.color, fontWeight: 700 }}>{r.initials}</Avatar> <div><strong style={{ display: 'block', fontSize: 13, color: 'var(--text-primary)' }}>{text}</strong><Text type="secondary" style={{ fontSize: 11, fontWeight: 500 }}>{r.role}</Text></div></div> },
    { title: 'MON', dataIndex: 'mon', key: 'mon', render: getHourTag },
    { title: 'TUE', dataIndex: 'tue', key: 'tue', render: getHourTag },
    { title: 'WED', dataIndex: 'wed', key: 'wed', render: getHourTag },
    { title: 'THU', dataIndex: 'thu', key: 'thu', render: getHourTag },
    { title: 'FRI', dataIndex: 'fri', key: 'fri', render: getHourTag },
    { title: 'SAT', dataIndex: 'sat', key: 'sat', render: getHourTag },
    { title: 'SUN', dataIndex: 'sun', key: 'sun', render: getHourTag },
    { title: 'TOTAL', dataIndex: 'total', key: 'total', render: val => <strong style={{ color: 'var(--text-primary)' }}>{val}h</strong> },
  ];

  const entryCols = [
    { title: 'DATE', dataIndex: 'date', key: 'date', render: text => <Text type="secondary" style={{ fontWeight: 500 }}>{text}</Text> },
    { title: 'TEAM MEMBER', dataIndex: 'member', key: 'member', render: (text, r) => <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar size="small" style={{ fontSize: 10, fontWeight: 700, backgroundColor: 'var(--accent-secondary)' }}>{r.memberInit}</Avatar> <strong style={{ color: 'var(--text-primary)' }}>{text}</strong></div> },
    { title: 'CLIENT', dataIndex: 'client', key: 'client', render: text => text ? <Text style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{text}</Text> : <Text type="secondary">—</Text> },
    { title: 'MODULE', dataIndex: 'module', key: 'module', render: text => <Tag style={{ borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--accent-info)', fontSize: 10, fontWeight: 600 }}>{text}</Tag> },
    { title: 'TASK', dataIndex: 'task', key: 'task', render: text => <Text style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{text}</Text> },
    { title: 'HOURS', dataIndex: 'hours', key: 'hours', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}h</strong> },
    { title: 'BILLABLE', dataIndex: 'billable', key: 'billable', render: val => val ? <CheckCircle2 size={18} color="var(--accent-primary)" /> : <AlertCircle size={18} color="var(--text-tertiary)" /> },
    { 
      title: 'ACTIONS', 
      key: 'actions', 
      render: () => (
        <div style={{ display: 'flex', gap: 16 }}>
          <a style={{ color: 'var(--text-tertiary)' }}><Edit3 size={16} /></a>
          <a style={{ color: 'var(--text-tertiary)' }}><Trash2 size={16} /></a>
        </div>
      ) 
    }
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>PILLAR 04 · AGENCY OPS</Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>Time Tracking</Title>
          <Text type="secondary" style={{ fontWeight: 500 }}>Log billable and non-billable hours across clients and campaigns.</Text>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button icon={<Download size={16} />} style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', height: 40 }}>Export Timesheet</Button>
          <Button type="primary" onClick={() => setIsLogTimeModalVisible(true)} icon={<Plus size={16} />} style={{ borderRadius: 8, background: 'var(--accent-secondary)', height: 40, fontWeight: 700, border: 'none', boxShadow: 'var(--shadow-md)' }}>Log Time</Button>
        </div>
      </motion.div>

      {/* UPDATED KPI CARDS */}
      <motion.div variants={itemVariants}>
        <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
          {[
            { label: 'HOURS LOGGED', val: '284h', sub: 'of 320h capacity', msg: 'This week', color: 'var(--accent-info)', icon: <Clock size={20} /> },
            { label: 'BILLABLE HOURS', val: '241h', sub: '85% billable', msg: 'Across clients', color: 'var(--accent-primary)', pos: true, icon: <CheckCircle2 size={20} /> },
            { label: 'NON-BILLABLE', val: '43h', sub: '15% non-bill.', msg: 'Admin & internal', color: 'var(--accent-warning)', alert: true, icon: <AlertCircle size={20} /> },
            { label: 'UTILISATION RATE', val: '85%', msg: 'Target > 80%', color: 'var(--accent-secondary)', prog: 85, icon: <Target size={20} /> },
          ].map((kpi, i) => (
            <Col xs={24} sm={12} lg={12} xl={12} xxl={6} key={i}>
              <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
                <Card 
                  className="glassmorphism hover-bg"
                  style={{ 
                    borderRadius: 16, 
                    border: '1px solid var(--border-color)', 
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden'
                  }} 
                  bodyStyle={{ padding: '24px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: kpi.color }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5 }}>{kpi.label}</Text>
                    <div style={{ padding: 8, borderRadius: 10, backgroundColor: 'var(--bg-secondary)', color: kpi.color, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                      {kpi.icon}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 'auto' }}>
                    <Title level={2} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 800, lineHeight: 1 }}>{kpi.val}</Title>
                    {kpi.sub && <Text style={{ color: kpi.alert ? 'var(--accent-warning)' : kpi.pos ? 'var(--accent-primary)' : 'var(--text-secondary)', fontSize: 13, fontWeight: 700 }}>{kpi.sub}</Text>}
                  </div>
                  
                  <Text style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginTop: 8, fontWeight: 500 }}>{kpi.msg}</Text>
                  
                  {kpi.prog && <Progress percent={kpi.prog} showInfo={false} strokeColor={kpi.color} trailColor="var(--bg-tertiary)" size="small" style={{ marginTop: 16 }} />}
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Weekly timesheet</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Week of 8 - 14 June · daily target 7h</Text></div>} 
          extra={<div style={{ display: 'flex', gap: 16, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-primary)' }}/> On target</span><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-warning)' }}/> Partial</span><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-danger)' }}/> Low</span><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--text-tertiary)' }}/> Off</span></div>}
          className="glassmorphism" style={{ borderRadius: 16, marginBottom: 32, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 0 }}
        >
          <Table columns={tsCols} dataSource={timesheetData} pagination={false} rowKey="name" size="middle" scroll={{ x: 1000 }} rowClassName={() => 'hover-bg'} />
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Time by client</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Hours logged this month — billable vs non-billable</Text></div>} 
          className="glassmorphism" style={{ borderRadius: 16, marginBottom: 32, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
        >
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeByClient} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                <XAxis type="number" stroke="var(--text-tertiary)" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                <YAxis dataKey="client" type="category" stroke="var(--text-secondary)" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 13, fontWeight: 600 }} />
                <Tooltip cursor={{ fill: 'var(--bg-tertiary)' }} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }} itemStyle={{ color: 'var(--text-primary)' }} />
                <Legend wrapperStyle={{ paddingTop: 20, fontWeight: 500, color: 'var(--text-secondary)' }} />
                <Bar dataKey="billable" name="Billable" stackId="a" fill="var(--accent-secondary)" radius={[0, 0, 0, 0]} maxBarSize={32} />
                <Bar dataKey="nonBillable" name="Non-billable" stackId="a" fill="var(--bg-tertiary)" radius={[0, 4, 4, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Recent time entries</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Last 20 entries across the team</Text></div>} 
          extra={<Button size="middle" style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>View all</Button>}
          className="glassmorphism" style={{ borderRadius: 16, marginBottom: 40, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 0 }}
        >
          <Table columns={entryCols} dataSource={recentTimeEntries} pagination={false} rowKey="id" size="middle" scroll={{ x: 1000 }} rowClassName={() => 'hover-bg'} />
        </Card>
      </motion.div>

      {/* Log Time Modal */}
      <Modal
        open={isLogTimeModalVisible}
        onCancel={() => setIsLogTimeModalVisible(false)}
        footer={null}
        width={560}
        style={{ top: 60 }}
        closeIcon={<span style={{ color: 'var(--text-tertiary)', fontSize: 20 }}>×</span>}
        title={
          <div style={{ marginBottom: 24 }}>
            <Title level={4} style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>Log time entry</Title>
            <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>Every hour logged feeds the Profitability Engine.</Text>
          </div>
        }
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={<span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1 }}>CLIENT</span>}>
                <Select defaultValue="prestige" size="large" style={{ fontWeight: 600 }}>
                  <Select.Option value="prestige">Prestige Estates</Select.Option>
                  <Select.Option value="rapido">Rapido</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1 }}>PROJECT / MODULE</span>}>
                <Select defaultValue="seo" size="large" style={{ fontWeight: 600 }}>
                  <Select.Option value="seo">SEO</Select.Option>
                  <Select.Option value="ads">Ads</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label={<span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1 }}>TASK DESCRIPTION</span>}>
            <Input placeholder="e.g. Keyword research – luxury apts cluster" size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={<span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1 }}>DATE</span>}>
                <DatePicker size="large" style={{ width: '100%' }} placeholder="June 11th, 2026" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1 }}>HOURS</span>}>
                <Input size="large" defaultValue="1.0" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={<span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1 }}>TEAM MEMBER</span>}>
                <Select defaultValue="arjun" size="large" style={{ fontWeight: 600 }}>
                  <Select.Option value="arjun">Arjun Sharma</Select.Option>
                  <Select.Option value="priya">Priya Nair</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1 }}>BILLABLE</span>}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 16px', height: 40 }}>
                  <Text style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Billable to client</Text>
                  <Switch defaultChecked style={{ background: 'var(--accent-secondary)' }} />
                </div>
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 16 }}>
            <Button size="large" onClick={() => setIsLogTimeModalVisible(false)} style={{ borderRadius: 8, fontWeight: 600, color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>Cancel</Button>
            <Button size="large" type="primary" icon={<Clock size={16} />} style={{ background: 'var(--accent-secondary)', borderRadius: 8, fontWeight: 700, border: 'none' }}>Save entry</Button>
          </div>
        </Form>
      </Modal>

    </motion.div>
  );
};

export default TimeTracking;
