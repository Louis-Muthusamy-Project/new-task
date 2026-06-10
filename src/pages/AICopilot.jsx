import React, { useState } from 'react';
import { Typography, Row, Col, Card, Button, Input, Avatar, Tag, Divider, Tooltip } from 'antd';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Paperclip, Mic, Sparkles, User, FileText, Database, Target, TrendingUp, ChevronRight, Zap, History, Plus } from 'lucide-react';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AICopilot = () => {
  const [inputText, setInputText] = useState('');

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

  const chatHistory = [
    { id: 1, title: 'Prestige Estates Q2 Analysis', time: '2 hours ago' },
    { id: 2, title: 'Draft SEO proposals for Healthcare', time: 'Yesterday' },
    { id: 3, title: 'Meta Ads budget reallocation', time: 'Yesterday' },
    { id: 4, title: 'Generate Q1 performance report', time: '3 days ago' },
  ];

  const suggestedPrompts = [
    { icon: <TrendingUp size={16}/>, text: 'Analyze campaign performance for Prestige Estates' },
    { icon: <FileText size={16}/>, text: 'Draft a creative brief for a Diwali real estate offer' },
    { icon: <Target size={16}/>, text: 'Generate 5 content pillars for a B2B SaaS client' },
    { icon: <Zap size={16}/>, text: 'Calculate projected MRR based on current pipeline' }
  ];

  const conversation = [
    {
      role: 'ai',
      content: 'Good morning! I am your M1 Co-Pilot. I have real-time access to your CRM, active ad campaigns, and agency performance data. How can we accelerate growth today?',
      time: '09:00 AM'
    },
    {
      role: 'user',
      content: 'Can you summarize the recent lead trends for Prestige Estates over the last 7 days? Are we hitting our CPA targets?',
      time: '09:02 AM'
    },
    {
      role: 'ai',
      content: (
        <div>
          <p style={{ margin: '0 0 12px 0' }}>Here is the 7-day lead summary for <strong style={{ color: 'var(--text-primary)' }}>Prestige Estates</strong>:</p>
          <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid var(--border-color)' }}>
            <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--text-secondary)' }}>
              <li><strong style={{ color: 'var(--text-primary)' }}>Total Leads:</strong> 142 <span style={{color: 'var(--accent-primary)', fontWeight: 600}}>(+14% WoW)</span></li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Blended CPA:</strong> ₹450 <span style={{color: 'var(--accent-primary)', fontWeight: 600}}>(-12% WoW)</span> ✅ <em>Below target of ₹500</em></li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Google Ads:</strong> 86 leads @ ₹410 CPA</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Meta Ads:</strong> 56 leads @ ₹512 CPA</li>
            </ul>
          </div>
          <p style={{ margin: 0 }}>While volume and CPA are excellent, the lead-to-opportunity conversion rate has dropped slightly to 18%. Would you like me to draft an email to the client\'s sales team highlighting this, or analyze the search query report for Google Ads?</p>
        </div>
      ),
      time: '09:02 AM',
      contextUsed: ['Google Ads', 'Meta Ads', 'CRM Pipeline']
    }
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      
      <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
        <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>PILLAR 04 · INTELLIGENCE</Text>
        <Title level={2} style={{ margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: 12, fontWeight: 800, color: 'var(--text-primary)' }}>
          AI Co-Pilot 
          <Tag style={{ borderRadius: 12, border: 'none', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-info)', fontWeight: 700, fontSize: 12, margin: 0, padding: '4px 12px' }}>GPT-4o Integration</Tag>
        </Title>
        <Text type="secondary" style={{ fontWeight: 500 }}>Conversational AI assistant trained on your agency\'s marketing strategy and performance data.</Text>
      </motion.div>

      <Row gutter={[24, 24]} style={{ flex: 1, overflow: 'hidden' }}>
        
        {/* Left Sidebar - Chat History */}
        <Col xs={24} lg={5} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Button type="primary" icon={<Plus size={16}/>} block style={{ borderRadius: 8, background: 'var(--accent-secondary)', height: 44, marginBottom: 24, fontWeight: 700, border: 'none', boxShadow: 'var(--shadow-md)' }}>New Conversation</Button>
            
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 8 }}>
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, display: 'block', marginBottom: 16 }}>RECENT CHATS</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {chatHistory.map(chat => (
                  <div key={chat.id} className="hover-bg" style={{ padding: '12px 16px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s', border: '1px solid transparent', ':hover': { borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' } }}>
                    <Text style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>{chat.title}</Text>
                    <Text type="secondary" style={{ fontSize: 11, fontWeight: 500 }}>{chat.time}</Text>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </Col>

        {/* Main Chat Area */}
        <Col xs={24} lg={14} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <motion.div variants={itemVariants} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Card 
              bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }} 
              style={{ 
                borderRadius: 16, 
                height: '100%', 
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
                // NEURAL GRID MATRIX BACKGROUND
                backgroundColor: 'var(--bg-primary)',
                backgroundImage: 'radial-gradient(var(--border-color) 1.5px, transparent 1.5px)',
                backgroundSize: '24px 24px',
                backgroundPosition: '0 0'
              }}
            >
              
              {/* Chat Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 32, display: 'flex', flexDirection: 'column', gap: 32 }}>
                {conversation.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                    <Avatar size={44} style={{ background: msg.role === 'user' ? 'var(--accent-secondary)' : 'var(--accent-info)', flexShrink: 0, border: '2px solid var(--bg-primary)' }} icon={msg.role === 'user' ? <User size={20}/> : <Sparkles size={20}/>} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                      <div style={{ 
                        background: msg.role === 'user' ? 'var(--accent-secondary)' : 'var(--bg-secondary)', 
                        color: msg.role === 'user' ? '#fff' : 'var(--text-secondary)',
                        padding: '20px 24px', 
                        borderRadius: 20, 
                        borderTopRightRadius: msg.role === 'user' ? 4 : 20,
                        borderTopLeftRadius: msg.role === 'ai' ? 4 : 20,
                        fontSize: 14,
                        fontWeight: 500,
                        lineHeight: 1.6,
                        border: msg.role === 'ai' ? '1px solid var(--border-color)' : 'none',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        {msg.content}
                      </div>
                      
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 10 }}>
                        <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>{msg.time}</Text>
                        {msg.contextUsed && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            {msg.contextUsed.map((ctx, idx) => (
                              <Tooltip title={`Data pulled from ${ctx}`} key={idx}>
                                <Tag style={{ fontSize: 10, borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', margin: 0, fontWeight: 600 }}>{ctx}</Tag>
                              </Tooltip>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 'auto', paddingTop: 32 }}>
                  {suggestedPrompts.map((prompt, i) => (
                    <div key={i} className="hover-bg" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', borderRadius: 20, padding: '10px 16px', fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', fontWeight: 500, boxShadow: 'var(--shadow-sm)' }}>
                      <span style={{ color: 'var(--accent-secondary)' }}>{prompt.icon}</span> {prompt.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 20, padding: '12px 20px', transition: 'border 0.2s', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', gap: 8, paddingBottom: 6, marginRight: 12 }}>
                    <Button type="text" icon={<Paperclip size={20} />} style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                  <TextArea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask anything about your agency's performance, clients, or strategy..." 
                    autoSize={{ minRows: 1, maxRows: 4 }} 
                    bordered={false}
                    style={{ padding: '6px 0', fontSize: 15, resize: 'none', flex: 1, fontWeight: 500, color: 'var(--text-primary)' }}
                  />
                  <div style={{ display: 'flex', gap: 8, paddingBottom: 6, marginLeft: 12 }}>
                    <Button type="text" icon={<Mic size={20} />} style={{ color: 'var(--text-tertiary)' }} />
                    <Button type="primary" icon={<Send size={16} />} style={{ borderRadius: 12, background: inputText.length > 0 ? 'var(--accent-secondary)' : 'var(--bg-tertiary)', color: inputText.length > 0 ? '#fff' : 'var(--text-tertiary)', border: 'none', height: 40, width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 500 }}>AI Co-Pilot can make mistakes. Verify important metrics before sharing with clients.</Text>
                </div>
              </div>

            </Card>
          </motion.div>
        </Col>

        {/* Right Sidebar - Context Panel */}
        <Col xs={24} lg={5} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <motion.div variants={itemVariants}>
            <Card 
              bodyStyle={{ padding: 24 }} 
              style={{ 
                borderRadius: 16, 
                marginBottom: 24,
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
                backgroundColor: 'var(--bg-secondary)',
                backgroundImage: 'radial-gradient(var(--border-color) 1.5px, transparent 1.5px)',
                backgroundSize: '16px 16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ background: 'var(--bg-primary)', padding: 8, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  <Database size={16} color="var(--accent-info)" />
                </div>
                <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>Active Data Sources</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--bg-primary)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>M1 CRM Leads</span>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)', boxShadow: '0 0 8px var(--accent-primary)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Google Ads API</span>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)', boxShadow: '0 0 8px var(--accent-primary)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Meta Ads API</span>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)', boxShadow: '0 0 8px var(--accent-primary)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Google Analytics 4</span>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-warning)', boxShadow: '0 0 8px var(--accent-warning)' }}></div>
                </div>
              </div>
              <Divider style={{ margin: '20px 0', borderColor: 'var(--border-color)' }} />
              <Button size="middle" type="link" block style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Manage Connections</Button>
            </Card>

            <Card 
              bodyStyle={{ padding: 24 }} 
              style={{ 
                borderRadius: 16,
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
                backgroundColor: 'var(--bg-secondary)',
                backgroundImage: 'radial-gradient(var(--border-color) 1.5px, transparent 1.5px)',
                backgroundSize: '16px 16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg-primary)', padding: 8, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  <FileText size={16} color="var(--accent-secondary)" />
                </div>
                <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>Workspace Context</strong>
              </div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 20, fontWeight: 500, lineHeight: 1.5 }}>Co-Pilot can read and analyze these recently active documents.</Text>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                  <FileText size={16} color="var(--text-tertiary)" />
                  <Text style={{ fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, color: 'var(--text-secondary)' }}>Prestige_Q2_Strategy.pdf</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                  <FileText size={16} color="var(--text-tertiary)" />
                  <Text style={{ fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, color: 'var(--text-secondary)' }}>Brand_Guidelines_2026.pdf</Text>
                </div>
              </div>
              <Button size="middle" icon={<Plus size={14}/>} style={{ borderRadius: 8, marginTop: 24, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-primary)' }} block>Upload Document</Button>
            </Card>
          </motion.div>
        </Col>

      </Row>
    </motion.div>
  );
};

export default AICopilot;
