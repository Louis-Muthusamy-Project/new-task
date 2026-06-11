import React from 'react';
import { Typography, Empty } from 'antd';

const { Title, Text } = Typography;

const Reporting = () => {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Reporting</Title>
        <Text type="secondary">View analytics, conversions, and team reports.</Text>
      </div>
      
      <div className="glassmorphism" style={{ padding: 48, borderRadius: 12, display: 'flex', justifyContent: 'center' }}>
        <Empty 
          description={
            <span>
              Reporting module is currently under development.<br/>
              Check back soon for advanced analytics.
            </span>
          }
        />
      </div>
    </div>
  );
};

export default Reporting;
