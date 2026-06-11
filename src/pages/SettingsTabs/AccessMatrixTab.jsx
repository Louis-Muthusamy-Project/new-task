import React from 'react';
import { Typography, Button } from 'antd';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const { Title, Text } = Typography;

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: 'spring', stiffness: 300, damping: 24 } 
  }
};

const AccessMatrixTab = () => {
  return (
    <>
      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <Title level={4} style={{ margin: '0 0 4px 0', fontWeight: 800 }}>Access Matrix</Title>
        <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>The full role × permission grid across every feature.</Text>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden', padding: 32, marginBottom: 48 }}>
          <strong style={{ display: 'block', fontSize: 16, color: 'var(--text-primary)', marginBottom: 8 }}>Access Matrix</strong>
          <Text type="secondary" style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 24 }}>The complete permission matrix lives on its own page for clarity.</Text>
          
          <Button type="primary" icon={<ExternalLink size={16}/>} style={{ background: 'var(--accent-primary)', fontWeight: 700, borderRadius: 8, height: 40, padding: '0 24px', display: 'flex', alignItems: 'center' }}>
            Open Access Matrix <span style={{ marginLeft: 4 }}>→</span>
          </Button>
        </div>
      </motion.div>
    </>
  );
};

export default AccessMatrixTab;
