import React from 'react';
import { Card } from 'antd';

const BubbleCard = ({ children, style, bodyStyle, large = false }) => (
  <Card 
    className="glassmorphism" 
    bodyStyle={{ padding: large ? '40px 48px' : '24px 32px', ...bodyStyle }} 
    style={{ 
      borderRadius: large ? '40px 40px 40px 12px' : '24px 24px 24px 8px', 
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-md)',
      background: 'var(--bg-secondary)',
      ...style 
    }}
  >
    {children}
  </Card>
);

export default BubbleCard;
