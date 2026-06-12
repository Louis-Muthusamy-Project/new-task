import React from 'react';
import { Row, Col, Card, Typography, Select, Progress, Space, Avatar, Table, Button, Tag } from 'antd';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { TeamOutlined, FireOutlined, RiseOutlined, CheckCircleOutlined, CalendarOutlined, TrophyOutlined, FilterOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const statusData = [
    { name: 'New Lead', value: 249, color: '#3b82f6' },
    { name: 'In Progress', value: 0, color: '#8b5cf6' }
  ];

  const trendData = [
    { date: '16 May', leads: 0 }, { date: '19 May', leads: 240 },
    { date: '22 May', leads: 50 }, { date: '25 May', leads: 10 },
    { date: '28 May', leads: 0 }, { date: '31 May', leads: 0 },
    { date: '03 Jun', leads: 0 }, { date: '06 Jun', leads: 0 },
    { date: '09 Jun', leads: 1 }, { date: '12 Jun', leads: 0 }
  ];

  const statusMovementData = [
    { date: '16 May', count: 240 }, { date: '19 May', count: 0 },
    { date: '22 May', count: 0 }, { date: '25 May', count: 0 },
    { date: '28 May', count: 0 }, { date: '31 May', count: 0 },
    { date: '03 Jun', count: 5 }, { date: '06 Jun', count: 5 },
    { date: '09 Jun', count: 5 }, { date: '12 Jun', count: 0 }
  ];

  const sourceData = [
    { name: 'WhatsApp', value: 240 },
    { name: 'Website', value: 9 }
  ];

  const healthData = [
    { name: 'Assigned', value: 0 },
    { name: 'Contact Ready', value: 249 },
    { name: 'Phone Added', value: 249 },
    { name: 'Email Added', value: 15 },
    { name: 'Project Tagged', value: 0 },
    { name: 'Need Follow-up', value: 0 }
  ];

  const projectMixData = [
    { name: 'General', count: 260 }
  ];

  const kpiCards = [
    { title: 'Total Leads', val: '249', sub: 'Last 30 days', icon: <TeamOutlined /> },
    { title: 'New Leads', val: '249', sub: 'Fresh leads in this view', icon: <FireOutlined /> },
    { title: 'Active Leads', val: '0', sub: 'In progress + follow-up', icon: <RiseOutlined /> },
    { title: 'Assigned Leads', val: '0%', sub: '0 assigned, 249 unassigned', icon: <CheckCircleOutlined /> },
    { title: 'Reminder Leads', val: '0', sub: '0 pending reminders', icon: <CalendarOutlined /> },
    { title: 'Conversion Rate', val: '0%', sub: '0 converted leads', icon: <TrophyOutlined /> }
  ];

  const ownerColumns = [
    { title: 'Owner', dataIndex: 'owner', key: 'owner', render: (text, record) => (
      <Space>
        <Avatar style={{ backgroundColor: record.color, fontWeight: 700 }}>{record.initials}</Avatar>
        <strong>{text}</strong>
      </Space>
    )},
    { title: 'Leads', dataIndex: 'leads', key: 'leads', render: t => <Tag color="blue">{t}</Tag> },
    { title: 'New', dataIndex: 'new', key: 'new' },
    { title: 'Active', dataIndex: 'active', key: 'active' },
    { title: 'Follow Up', dataIndex: 'followup', key: 'followup' },
    { title: 'Reminders', dataIndex: 'reminders', key: 'reminders' },
    { title: 'Contact Ready', dataIndex: 'contactReady', key: 'contactReady', render: t => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Progress percent={t} showInfo={false} strokeColor="var(--accent-primary)" style={{ width: 100 }} />
        <span>{t}%</span>
      </div>
    )},
    { title: 'Conversion Rate', dataIndex: 'conversionRate', key: 'conversionRate', render: t => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Progress percent={t} showInfo={false} strokeColor="var(--text-tertiary)" style={{ width: 100 }} />
        <span>{t}%</span>
      </div>
    )}
  ];

  const ownerData = [
    { key: '1', initials: 'UN', owner: 'Unassigned', color: '#10b981', leads: 249, new: 249, active: 0, followup: 0, reminders: 0, contactReady: 99, conversionRate: 0 }
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
      
      {/* Filters Section */}
      <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
        <Card bodyStyle={{ padding: '20px 24px' }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FilterOutlined style={{ color: 'var(--accent-primary)' }} />
              <strong style={{ color: 'var(--accent-primary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Dashboard Filters</strong>
            </div>
            <Button size="small" style={{ borderRadius: 6, fontWeight: 600 }}>Clear all</Button>
          </div>
          <Title level={4} style={{ margin: '0 0 20px 0', fontWeight: 800 }}>View performance by week, month or pipeline stage</Title>
          
          <Row gutter={[16, 16]}>
            <Col xs={12} md={4}><Select defaultValue="Month" style={{ width: '100%' }} size="large"><Select.Option value="Month">Month</Select.Option></Select></Col>
            <Col xs={12} md={4}><Select defaultValue="All" style={{ width: '100%' }} size="large"><Select.Option value="All">All (249)</Select.Option></Select></Col>
            <Col xs={12} md={4}><Select placeholder="Source" style={{ width: '100%' }} size="large" /></Col>
            <Col xs={12} md={4}><Select placeholder="Project" style={{ width: '100%' }} size="large" /></Col>
            <Col xs={12} md={4}><Select placeholder="Owner" style={{ width: '100%' }} size="large" /></Col>
            <Col xs={12} md={4}><Select placeholder="Search lead or company" style={{ width: '100%' }} size="large" /></Col>
          </Row>
        </Card>
      </motion.div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {kpiCards.map((kpi, i) => (
          <Col xs={12} sm={8} lg={4} key={i}>
            <motion.div variants={itemVariants} whileHover={{ y: -4 }} style={{ height: '100%' }}>
              <Card bodyStyle={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', height: '100%' }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)', height: '100%' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, color: 'var(--accent-primary)' }}>
                  {kpi.icon}
                  <Text type="secondary" style={{ fontSize: 12, fontWeight: 700 }}>{kpi.title}</Text>
                </div>
                <Title level={2} style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>{kpi.val}</Title>
                <Text type="secondary" style={{ fontSize: 12, marginTop: 'auto', paddingTop: 8 }}>{kpi.sub}</Text>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Top 3 Panels */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card title={<><PieChart style={{marginRight: 8, color: 'var(--accent-primary)'}} /> Lead Status</>} style={{ borderRadius: 16, border: '1px solid var(--border-color)', height: '100%', background: 'var(--bg-secondary)' }} headStyle={{ borderBottom: 'none', padding: '20px 24px 0', fontSize: 16, fontWeight: 800 }}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={90}>
                    {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 24px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 13 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6' }}/> New Lead</div>
                <strong style={{ fontSize: 13 }}>249</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#8b5cf6' }}/> In Progress</div>
                <strong style={{ fontSize: 13, color: 'var(--text-secondary)' }}>0</strong>
              </div>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} lg={8}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card title={<><TrophyOutlined style={{marginRight: 8, color: 'var(--accent-primary)'}} /> Top Performers</>} style={{ borderRadius: 16, border: '1px solid var(--border-color)', height: '100%', background: 'var(--bg-secondary)' }} headStyle={{ borderBottom: 'none', padding: '20px 24px 0', fontSize: 16, fontWeight: 800 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>UN</div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Unassigned</strong>
                    <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>249 leads • 0% conversion</Text>
                  </div>
                </div>
                <strong style={{ color: 'var(--accent-primary)', fontSize: 13 }}>0 converted</strong>
              </div>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} lg={8}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card title={<><RiseOutlined style={{marginRight: 8, color: 'var(--accent-primary)'}} /> Conversion Funnel</>} style={{ borderRadius: 16, border: '1px solid var(--border-color)', height: '100%', background: 'var(--bg-secondary)' }} headStyle={{ borderBottom: 'none', padding: '20px 24px 0', fontSize: 16, fontWeight: 800 }}>
              <div style={{ background: '#3b82f6', color: '#fff', padding: '10px 16px', borderRadius: 8, marginBottom: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>Total Leads</span><span>249 (100%)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 24 }}>
                <div style={{ background: '#0ea5e9', color: '#fff', padding: '8px 16px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 600, width: '90%' }}>
                  <span>Engaged</span><span>0 (0%)</span>
                </div>
                <div style={{ background: '#8b5cf6', color: '#fff', padding: '8px 16px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 600, width: '80%' }}>
                  <span>Follow Up</span><span>0 (0%)</span>
                </div>
                <div style={{ background: '#10b981', color: '#fff', padding: '8px 16px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 600, width: '70%' }}>
                  <span>Converted</span><span>0 (0%)</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card title={<><RiseOutlined style={{marginRight: 8, color: 'var(--accent-primary)'}} /> Last 30 days Trend</>} extra={<Button size="small" style={{ borderRadius: 20, color: 'var(--accent-primary)', fontWeight: 600 }}>Leads vs Converted</Button>} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', height: '100%' }} headStyle={{ borderBottom: 'none', padding: '20px 24px 0', fontSize: 16, fontWeight: 800 }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={12} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="var(--text-tertiary)" fontSize={12} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip cursor={{ stroke: 'var(--border-color)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                  <Line type="monotone" dataKey="leads" stroke="#8b5cf6" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} lg={8}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card title={<><PieChart style={{marginRight: 8, color: 'var(--accent-primary)'}} /> Lead Sources</>} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', height: '100%' }} headStyle={{ borderBottom: 'none', padding: '20px 24px 0', fontSize: 16, fontWeight: 800 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sourceData} layout="vertical" margin={{ top: 20, right: 20, left: 30, bottom: 0 }} barSize={16}>
                  <XAxis type="number" stroke="var(--text-tertiary)" fontSize={12} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="var(--text-tertiary)" fontSize={12} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'var(--bg-tertiary)' }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card title={<><CalendarOutlined style={{marginRight: 8, color: 'var(--accent-primary)'}} /> Status Movement</>} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', height: '100%' }} headStyle={{ borderBottom: 'none', padding: '20px 24px 0', fontSize: 16, fontWeight: 800 }}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusMovementData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={11} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="var(--text-tertiary)" fontSize={11} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip cursor={{ fill: 'var(--bg-tertiary)' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} lg={12}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card title={<><TeamOutlined style={{marginRight: 8, color: 'var(--accent-primary)'}} /> Company Analytics</>} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', height: '100%' }} headStyle={{ borderBottom: 'none', padding: '20px 24px 0', fontSize: 16, fontWeight: 800 }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 250, overflowY: 'auto', paddingRight: 8 }}>
                <div style={{ background: 'var(--bg-primary)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar style={{ backgroundColor: '#1e3a8a', fontWeight: 700 }}>UC</Avatar>
                      <div>
                        <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Unknown Company</strong>
                        <Text type="secondary" style={{ fontSize: 12 }}>0 converted • 2 sources • 1 agents</Text>
                      </div>
                    </div>
                    <strong style={{ color: 'var(--accent-primary)', fontSize: 13 }}>248 leads</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
                    <span>99% contact ready</span>
                    <span>0% conversion</span>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-primary)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar style={{ backgroundColor: '#0ea5e9', fontWeight: 700 }}>AS</Avatar>
                      <div>
                        <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Askuva</strong>
                        <Text type="secondary" style={{ fontSize: 12 }}>0 converted • 1 sources • 1 agents</Text>
                      </div>
                    </div>
                    <strong style={{ color: 'var(--accent-primary)', fontSize: 13 }}>1 leads</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
                    <span>100% contact ready</span>
                    <span>0% conversion</span>
                  </div>
                </div>
              </div>

            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Charts Row 3 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card title={<><CheckCircleOutlined style={{marginRight: 8, color: 'var(--accent-primary)'}} /> Management Health</>} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', height: '100%' }} headStyle={{ borderBottom: 'none', padding: '20px 24px 0', fontSize: 16, fontWeight: 800 }}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={healthData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }} barSize={16}>
                  <XAxis type="number" stroke="var(--text-tertiary)" fontSize={12} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="var(--text-tertiary)" fontSize={12} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'var(--bg-tertiary)' }} />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} lg={12}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card title={<><RiseOutlined style={{marginRight: 8, color: 'var(--accent-primary)'}} /> Project Type Mix</>} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', height: '100%' }} headStyle={{ borderBottom: 'none', padding: '20px 24px 0', fontSize: 16, fontWeight: 800 }}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={projectMixData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={11} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="var(--text-tertiary)" fontSize={11} axisLine={false} tickLine={false} dx={-10} domain={[0, 260]} />
                  <Tooltip cursor={{ fill: 'var(--bg-tertiary)' }} />
                  <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Leads Table */}
      <motion.div variants={itemVariants}>
        <Card title={<><TeamOutlined style={{marginRight: 8, color: 'var(--accent-primary)'}} /> Lead Management Workload</>} extra={<Button size="small" style={{ borderRadius: 20, color: 'var(--accent-primary)', fontWeight: 600 }}>1 owners</Button>} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }} headStyle={{ borderBottom: '1px solid var(--border-color)', padding: '20px 24px', fontSize: 16, fontWeight: 800 }}>
          <Table 
            columns={ownerColumns} 
            dataSource={ownerData} 
            pagination={false} 
            scroll={{ x: 'max-content' }} 
            className="ant-table-striped"
          />
        </Card>
      </motion.div>

    </motion.div>
  );
};

export default AdminDashboard;
