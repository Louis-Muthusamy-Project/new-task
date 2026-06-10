import React, { useState } from 'react';
import { Typography, Row, Col, Input, Button, Avatar, List, Tag } from 'antd';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles, Image as ImageIcon, FileText, Settings, History } from 'lucide-react';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AIStudio = () => {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hello! I am your Agency AI Co-Pilot. I can help you generate content, create images, analyze data, or build marketing campaigns. What would you like to do today?' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), type: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: 'I am processing your request. As a mock AI, I cannot actually generate live responses, but I would be generating amazing agency-focused content for you right now!' }]);
    }, 1000);
  };

  const tools = [
    { name: 'Content Generator', icon: <FileText size={16} /> },
    { name: 'Image Creator', icon: <ImageIcon size={16} /> },
    { name: 'SEO Optimizer', icon: <Sparkles size={16} /> },
    { name: 'Campaign Builder', icon: <Settings size={16} /> },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>AI Studio</Title>
        <Text type="secondary">Your all-in-one generative AI workspace for agency tasks.</Text>
      </div>

      <Row gutter={[24, 24]} style={{ flex: 1, minHeight: 0 }}>
        {/* Tools Sidebar */}
        <Col xs={0} lg={6} style={{ height: '100%' }}>
          <div className="glassmorphism" style={{ padding: 20, borderRadius: 12, height: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Sparkles size={16} /> Quick Tools</Title>
              <List
                dataSource={tools}
                renderItem={item => (
                  <List.Item style={{ padding: '12px 8px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }} className="hover-bg">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-primary)' }}>
                      <div style={{ color: 'var(--accent-primary)' }}>{item.icon}</div>
                      {item.name}
                    </div>
                  </List.Item>
                )}
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><History size={16} /> Recent Chats</Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Tag color="blue" style={{ padding: '6px 12px', cursor: 'pointer', borderRadius: 8 }}>Q3 SEO Strategy...</Tag>
                <Tag style={{ padding: '6px 12px', cursor: 'pointer', borderRadius: 8, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Email Copy for...</Tag>
                <Tag style={{ padding: '6px 12px', cursor: 'pointer', borderRadius: 8, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Social Posts...</Tag>
              </div>
            </div>
          </div>
        </Col>

        {/* Chat Area */}
        <Col xs={24} lg={18} style={{ height: '100%' }}>
          <div className="glassmorphism" style={{ borderRadius: 12, height: '100%', display: 'flex', flexDirection: 'column' }}>
            
            {/* Messages */}
            <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
              {messages.map((msg, idx) => (
                <motion.div 
                  key={msg.id} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', gap: 16, flexDirection: msg.type === 'user' ? 'row-reverse' : 'row' }}
                >
                  <Avatar 
                    style={{ backgroundColor: msg.type === 'bot' ? 'var(--accent-primary)' : 'var(--accent-secondary)' }} 
                    icon={msg.type === 'bot' ? <Bot size={20} /> : <User size={20} />} 
                  />
                  <div style={{ 
                    maxWidth: '70%', 
                    padding: '16px 20px', 
                    borderRadius: 16, 
                    background: msg.type === 'user' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                    color: msg.type === 'user' ? '#fff' : 'var(--text-primary)',
                    boxShadow: 'var(--shadow-sm)',
                    border: msg.type === 'bot' ? '1px solid var(--border-color)' : 'none',
                    borderTopLeftRadius: msg.type === 'bot' ? 4 : 16,
                    borderTopRightRadius: msg.type === 'user' ? 4 : 16,
                  }}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input Area */}
            <div style={{ padding: 20, borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                <TextArea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask the AI to generate something..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  style={{ borderRadius: 12, padding: '12px 16px', background: 'var(--bg-primary)' }}
                  onPressEnter={(e) => {
                    if (!e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button 
                  type="primary" 
                  icon={<Send size={18} />} 
                  onClick={handleSend}
                  style={{ height: 46, width: 46, borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                />
              </div>
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>AI can make mistakes. Consider verifying important information.</Text>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </motion.div>
  );
};

export default AIStudio;
