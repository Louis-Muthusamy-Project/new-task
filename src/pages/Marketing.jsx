import React from 'react';
import { Typography, Empty } from 'antd';

const { Title, Text } = Typography;

const Marketing = () => {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Marketing</Title>
        <Text type="secondary">Manage campaigns, automations, and email center.</Text>
      </div>
      
      <div className="glassmorphism" style={{ padding: 48, borderRadius: 12, display: 'flex', justifyContent: 'center' }}>
        <Empty 
          description={
            <span>
              Marketing module is currently under development.<br/>
              Check back soon for campaigns and automations.
            </span>
          }
        />
      </div>
    </div>
  );
};

export default Marketing;
