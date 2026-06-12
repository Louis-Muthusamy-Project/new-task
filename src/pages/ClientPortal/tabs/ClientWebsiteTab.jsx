import React from 'react';
import { Typography } from 'antd';
import { motion } from 'framer-motion';
import WebsiteBuilder from '../../WebsiteBuilder/WebsiteBuilder';

const { Title, Text } = Typography;

const ClientWebsiteTab = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: 1400, margin: '0 auto' }}>
      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: '0 0 8px 0', fontWeight: 800 }}>Website Management</Title>
        <Text type="secondary" style={{ fontSize: 15, fontWeight: 500 }}>
          Manage your landing pages, performance, and integrations.
        </Text>
      </motion.div>

      <motion.div variants={itemVariants} style={{ height: 'calc(100vh - 200px)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        {/* We embed the WebsiteBuilder directly to give clients access to the same powerful tool */}
        <div style={{ transform: 'scale(1)', transformOrigin: 'top left', width: '100%', height: '100%', overflow: 'auto' }}>
          <WebsiteBuilder />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ClientWebsiteTab;
