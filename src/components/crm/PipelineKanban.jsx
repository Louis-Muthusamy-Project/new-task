import React from 'react';
import { Card, Typography, Avatar, Tag } from 'antd';
import { motion } from 'framer-motion';
import { pipelineData } from '../../data/mock';

const { Title, Text } = Typography;

const PipelineKanban = () => {
  return (
    <div style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 16 }}>
      {pipelineData.columns.map(column => (
        <div key={column.id} style={{ minWidth: 300, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
            <Title level={5} style={{ margin: 0 }}>{column.title}</Title>
            <Tag style={{ borderRadius: 12 }}>
              {pipelineData.deals.filter(d => d.column === column.id).length}
            </Tag>
          </div>
          
          <div className="glassmorphism" style={{ padding: 12, borderRadius: 12, minHeight: 500, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pipelineData.deals.filter(d => d.column === column.id).map((deal, idx) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card 
                  size="small" 
                  hoverable 
                  style={{ borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                  bodyStyle={{ padding: 16 }}
                >
                  <Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>{deal.title}</Title>
                  <Text type="secondary">{deal.company}</Text>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                    <strong style={{ color: 'var(--accent-secondary)' }}>{deal.value}</strong>
                    <Avatar.Group size="small">
                      <Avatar style={{ backgroundColor: 'var(--accent-primary)' }}>M</Avatar>
                    </Avatar.Group>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PipelineKanban;
