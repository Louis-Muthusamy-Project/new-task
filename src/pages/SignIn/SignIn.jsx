import React, { useState } from 'react';
import { Typography, Card, Button, Form, Input, Alert, Divider } from 'antd';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock } from 'lucide-react';

const { Title, Text } = Typography;

const SignIn = () => {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      const { email, password } = values;
      
      if (password !== '#India123') {
        setError('Invalid password. Please use "#India123".');
        setLoading(false);
        return;
      }

      if (email === 'admin@gmail.com') {
        login('admin');
      } else if (email === 'agency@gmail.com') {
        login('agency');
      } else if (email === 'client@gmail.com') {
        login('client');
      } else {
        setError('Invalid email address. Please use one of the demo emails.');
      }
      
      setLoading(false);
    }, 800); // Simulate network request
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 24 }}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: 440, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ background: 'var(--accent-primary)', color: '#fff', borderRadius: 12, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20 }}>M1</div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontWeight: 800, fontSize: 24, lineHeight: 1, color: 'var(--text-primary)' }}>M1</span>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-secondary)' }}>AGENCY GROWTH OS</span>
            </div>
          </div>
          <Title level={3} style={{ fontWeight: 800, margin: '0 0 8px 0' }}>Welcome back</Title>
          <Text type="secondary" style={{ fontSize: 15, fontWeight: 500 }}>Please enter your details to sign in.</Text>
        </div>

        <Card 
          className="glassmorphism"
          style={{ borderRadius: 24, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}
          bodyStyle={{ padding: '32px 40px' }}
        >
          {error && (
            <Alert 
              message={error} 
              type="error" 
              showIcon 
              style={{ marginBottom: 24, borderRadius: 8, fontWeight: 500 }} 
            />
          )}

          <Form
            name="login"
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            size="large"
          >
            <Form.Item
              name="email"
              label={<Text style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Email</Text>}
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input 
                prefix={<Mail size={18} style={{ color: 'var(--text-tertiary)', marginRight: 8 }} />} 
                placeholder="Enter your email" 
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<Text style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Password</Text>}
              rules={[{ required: true, message: 'Please input your password!' }]}
              style={{ marginBottom: 24 }}
            >
              <Input.Password 
                prefix={<Lock size={18} style={{ color: 'var(--text-tertiary)', marginRight: 8 }} />} 
                placeholder="••••••••" 
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading} style={{ background: 'var(--accent-primary)', fontWeight: 700, height: 44, borderRadius: 8, fontSize: 16 }}>
                Sign in
              </Button>
            </Form.Item>
          </Form>

          {/* <Divider style={{ borderColor: 'var(--border-color)' }}>
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>DEMO CREDENTIALS</Text>
          </Divider>

          <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)' }}>
            <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--text-secondary)', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8, fontWeight: 500 }}>
              <li><strong>Admin:</strong> admin@gmail.com</li>
              <li><strong>Agency:</strong> agency@gmail.com</li>
              <li><strong>Client:</strong> client@gmail.com</li>
            </ul>
            <Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 12, textAlign: 'center', fontStyle: 'italic' }}>
              * Password for all accounts: <strong>#India123</strong>
            </Text>
          </div> */}
        </Card>
      </motion.div>
    </div>
  );
};

export default SignIn;
