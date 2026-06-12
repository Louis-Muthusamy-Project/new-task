import React from 'react';
import { Drawer, Typography, Button, Tabs, Input, Switch, Radio, Divider, Tag, Space } from 'antd';
import { Shield, Zap, Clock, FileText, AlertTriangle, Target, Bell, Mail, Smartphone } from 'lucide-react';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AIAgentConfigureDrawer = ({ open, onClose, agent }) => {
  if (!agent) return null;

  // Determine icon based on agent
  let IconComponent = Shield;
  if (agent.id === 2) IconComponent = Zap;
  else if (agent.id === 3) IconComponent = Clock;
  else if (agent.id === 4) IconComponent = FileText;
  else if (agent.id === 5) IconComponent = AlertTriangle;
  else if (agent.id === 6) IconComponent = Target;

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: 10, borderRadius: 8, color: agent.color || 'var(--accent-primary)', border: '1px solid var(--border-color)', display: 'flex' }}>
              <IconComponent size={24} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>{agent.name}</Title>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-primary)', fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)', boxShadow: '0 0 8px var(--accent-primary)' }} />
                RUNNING
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button size="small" style={{ borderRadius: 6, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>Pause Agent</Button>
            <Button size="small" type="text" danger style={{ fontWeight: 600 }}>Delete Agent</Button>
          </div>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={600}
      styles={{
        header: { padding: '24px 24px 16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' },
        body: { padding: 0, background: 'var(--bg-primary)' }
      }}
      closeIcon={<div style={{ color: 'var(--text-secondary)' }}>✕</div>}
    >
      <Tabs 
        defaultActiveKey="settings" 
        items={[
          {
            label: <strong style={{ fontWeight: 600 }}>Settings</strong>,
            key: 'settings',
            children: (
              <div style={{ padding: '8px 0 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>
                
                {/* Basic Settings */}
                <div>
                  <strong style={{ display: 'block', fontSize: 15, color: 'var(--text-primary)', marginBottom: 16 }}>Basic Settings</strong>
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>Agent Name</Text>
                    <Input defaultValue={agent.name} style={{ borderRadius: 8, background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontWeight: 500 }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>Description</Text>
                    <TextArea rows={4} defaultValue={agent.desc} style={{ borderRadius: 8, background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontWeight: 500 }} />
                  </div>
                </div>

                <Divider style={{ margin: 0, borderColor: 'var(--border-color)' }} />

                {/* Monitoring Scope */}
                <div>
                  <strong style={{ display: 'block', fontSize: 15, color: 'var(--text-primary)', marginBottom: 16 }}>Monitoring Scope</strong>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Text style={{ fontWeight: 500, color: 'var(--text-primary)' }}>All clients</Text>
                    <Switch defaultChecked style={{ background: 'var(--accent-primary)' }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 13, fontWeight: 500 }}>Monitoring frequency</Text>
                    <Radio.Group defaultValue="real-time" style={{ width: '100%', display: 'flex', gap: 12 }}>
                      <Radio.Button value="real-time" style={{ flex: 1, textAlign: 'center', borderRadius: '8px 0 0 8px', borderColor: 'var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600 }}>Real-time</Radio.Button>
                      <Radio.Button value="hour" style={{ flex: 1, textAlign: 'center', borderColor: 'var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600 }}>Every hour</Radio.Button>
                      <Radio.Button value="6-hours" style={{ flex: 1, textAlign: 'center', borderColor: 'var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600 }}>Every 6 hours</Radio.Button>
                      <Radio.Button value="daily" style={{ flex: 1, textAlign: 'center', borderRadius: '0 8px 8px 0', borderColor: 'var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600 }}>Daily</Radio.Button>
                    </Radio.Group>
                  </div>
                </div>

                <Divider style={{ margin: 0, borderColor: 'var(--border-color)' }} />

                {/* Alert thresholds */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <strong style={{ fontSize: 15, color: 'var(--text-primary)' }}>Alert thresholds</strong>
                    <Tag style={{ margin: 0, borderRadius: 12, border: 'none', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-primary)', fontWeight: 700 }}>5 pts</Tag>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, marginBottom: 24, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '40%', background: 'var(--accent-primary)', borderRadius: 2 }} />
                    <div style={{ position: 'absolute', left: '40%', top: '50%', transform: 'translate(-50%, -50%)', width: 16, height: 16, borderRadius: '50%', background: '#fff', border: '2px solid var(--accent-primary)', boxShadow: 'var(--shadow-sm)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Drop &gt; 3 pts → In-app notification</Text>
                      <Switch defaultChecked style={{ background: 'var(--accent-primary)' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Drop &gt; 5 pts → Email to AM</Text>
                      <Switch defaultChecked style={{ background: 'var(--accent-primary)' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Drop &gt; 10 pts → WhatsApp to AM</Text>
                      <Switch defaultChecked style={{ background: 'var(--accent-primary)' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Drop &gt; 12 pts → WhatsApp to Director</Text>
                      <Switch defaultChecked style={{ background: 'var(--accent-primary)' }} />
                    </div>
                  </div>
                </div>

                <Divider style={{ margin: 0, borderColor: 'var(--border-color)' }} />

                {/* Notification channels */}
                <div>
                  <strong style={{ display: 'block', fontSize: 15, color: 'var(--text-primary)', marginBottom: 16 }}>Notification channels</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Bell size={18} color="var(--text-tertiary)" />
                      <Text style={{ flex: 1, fontWeight: 500, color: 'var(--text-primary)' }}>In-app</Text>
                      <Switch defaultChecked style={{ background: 'var(--accent-primary)' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Mail size={18} color="var(--text-tertiary)" />
                      <Input defaultValue="arjun@bccmartech.com" style={{ flex: 1, borderRadius: 8, background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontWeight: 500 }} />
                      <Switch defaultChecked style={{ background: 'var(--accent-primary)' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Smartphone size={18} color="var(--text-tertiary)" />
                      <Input defaultValue="+91 98765 43210" style={{ flex: 1, borderRadius: 8, background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontWeight: 500 }} />
                      <Switch defaultChecked style={{ background: 'var(--accent-primary)' }} />
                    </div>
                  </div>
                </div>

              </div>
            )
          },
          { label: <span style={{ fontWeight: 600 }}>Activity Log</span>, key: 'activity', children: <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-tertiary)' }}>Activity log content goes here</div> },
          { label: <span style={{ fontWeight: 600 }}>Alert Rules</span>, key: 'rules', children: <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-tertiary)' }}>Alert rules content goes here</div> },
          { label: <span style={{ fontWeight: 600 }}>Performance</span>, key: 'performance', children: <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-tertiary)' }}>Performance metrics go here</div> },
        ]}
      />

      {/* Footer */}
      <div style={{ padding: '20px 24px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <Button onClick={onClose} style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'transparent' }}>Cancel</Button>
        <Button type="primary" onClick={onClose} style={{ borderRadius: 8, background: 'var(--accent-secondary)', color: '#fff', fontWeight: 700, border: 'none', boxShadow: 'var(--shadow-sm)' }}>Save Configuration</Button>
      </div>
    </Drawer>
  );
};

export default AIAgentConfigureDrawer;
