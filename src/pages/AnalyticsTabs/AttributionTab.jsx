import React from 'react';
import { Typography, Card, Select, Table, Tag, Row, Col } from 'antd';
import { motion } from 'framer-motion';
import { Activity, Info, ArrowRight } from 'lucide-react';

const { Title, Text } = Typography;
const { Option } = Select;

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: 'spring', stiffness: 300, damping: 24 } 
  }
};

// SVG Flow Diagram Component
const CustomerJourneyFlow = () => {
  // Columns X coordinates
  const c1x = 0;
  const c2x = 420;
  const c3x = 840;
  const nodeWidth = 160;

  // Nodes definition
  const nodes = [
    // Column 1
    { id: 'organic', label: 'Organic', value: '3,840', x: c1x, y: 0, h: 120, color: '#34d399' },
    { id: 'google', label: 'Google Ads', value: '1,842', x: c1x, y: 130, h: 80, color: '#38bdf8' },
    { id: 'meta', label: 'Meta Ads', value: '1,240', x: c1x, y: 220, h: 60, color: '#6366f1' },
    { id: 'whatsapp1', label: 'WhatsApp', value: '642', x: c1x, y: 290, h: 30, color: '#4ade80' },
    { id: 'direct', label: 'Direct', value: '420', x: c1x, y: 330, h: 20, color: '#fbbf24' },

    // Column 2
    { id: 'landing', label: 'Landing Page', value: '2,922', x: c2x, y: 0, h: 110, color: '#7dd3fc' },
    { id: 'blog', label: 'Blog', value: '1,800', x: c2x, y: 120, h: 70, color: '#a78bfa' },
    { id: 'product', label: 'Product Page', value: '2,542', x: c2x, y: 200, h: 90, color: '#67e8f9' },
    { id: 'retargeting', label: 'Retargeting Ad', value: '720', x: c2x, y: 300, h: 50, color: '#f472b6' },

    // Column 3
    { id: 'lead', label: 'Lead Captured', value: '2,202', x: c3x, y: 0, h: 100, color: '#4ade80' },
    { id: 'form', label: 'Form Submit', value: '2,080', x: c3x, y: 110, h: 90, color: '#2dd4bf' },
    { id: 'call', label: 'Call', value: '1,020', x: c3x, y: 210, h: 50, color: '#fbbf24' },
    { id: 'whatsapp2', label: 'WhatsApp Inquiry', value: '2,382', x: c3x, y: 270, h: 80, color: '#22c55e' },
  ];

  // Helper to draw bezier path between two nodes
  const drawLink = (fromId, toId, yOffsetFrom, yOffsetTo, thickness, color1, color2) => {
    const fromNode = nodes.find(n => n.id === fromId);
    const toNode = nodes.find(n => n.id === toId);
    
    const x1 = fromNode.x + nodeWidth;
    const y1 = fromNode.y + yOffsetFrom;
    const x2 = toNode.x;
    const y2 = toNode.y + yOffsetTo;
    
    const cp1x = x1 + (x2 - x1) * 0.5;
    const cp2x = x1 + (x2 - x1) * 0.5;
    
    const path = `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`;
    const gradId = `grad-${fromId}-${toId}`;

    return (
      <g key={`${fromId}-${toId}`}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color1} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color2} stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path d={path} stroke={`url(#${gradId})`} strokeWidth={thickness} fill="none" />
      </g>
    );
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto', padding: '20px 0' }}>
      <svg viewBox="0 0 1000 370" style={{ minWidth: 800, width: '100%', height: 'auto' }}>
        {/* Draw Links */}
        {/* Organic -> Columns */}
        {drawLink('organic', 'blog', 30, 20, 40, '#34d399', '#a78bfa')}
        {drawLink('organic', 'landing', 80, 20, 30, '#34d399', '#7dd3fc')}
        {drawLink('organic', 'product', 105, 20, 20, '#34d399', '#67e8f9')}
        
        {/* Google -> Columns */}
        {drawLink('google', 'landing', 20, 70, 30, '#38bdf8', '#7dd3fc')}
        {drawLink('google', 'product', 60, 45, 25, '#38bdf8', '#67e8f9')}
        
        {/* Meta -> Columns */}
        {drawLink('meta', 'landing', 15, 95, 15, '#6366f1', '#7dd3fc')}
        {drawLink('meta', 'retargeting', 45, 15, 25, '#6366f1', '#f472b6')}
        
        {/* WhatsApp -> Columns */}
        {drawLink('whatsapp1', 'product', 15, 75, 20, '#4ade80', '#67e8f9')}
        
        {/* Direct -> Columns */}
        {drawLink('direct', 'blog', 10, 55, 10, '#fbbf24', '#a78bfa')}

        {/* Col2 -> Col3 */}
        {/* Landing -> Col3 */}
        {drawLink('landing', 'lead', 20, 20, 30, '#7dd3fc', '#4ade80')}
        {drawLink('landing', 'form', 60, 20, 20, '#7dd3fc', '#2dd4bf')}
        {drawLink('landing', 'whatsapp2', 90, 20, 25, '#7dd3fc', '#22c55e')}
        
        {/* Blog -> Col3 */}
        {drawLink('blog', 'form', 25, 55, 30, '#a78bfa', '#2dd4bf')}
        {drawLink('blog', 'lead', 55, 65, 15, '#a78bfa', '#4ade80')}
        
        {/* Product -> Col3 */}
        {drawLink('product', 'form', 20, 75, 25, '#67e8f9', '#2dd4bf')}
        {drawLink('product', 'call', 50, 25, 30, '#67e8f9', '#fbbf24')}
        {drawLink('product', 'lead', 75, 85, 10, '#67e8f9', '#4ade80')}
        
        {/* Retargeting -> Col3 */}
        {drawLink('retargeting', 'whatsapp2', 25, 60, 35, '#f472b6', '#22c55e')}

        {/* Draw Nodes */}
        {nodes.map(node => (
          <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
            <rect width={nodeWidth} height={node.h} fill={node.color} rx={8} />
            <text x={12} y={24} fill="#fff" fontSize={12} fontWeight="700" fontFamily="Inter, sans-serif">{node.label}</text>
            <text x={12} y={40} fill="rgba(255,255,255,0.9)" fontSize={11} fontWeight="500" fontFamily="Inter, sans-serif">{node.value}</text>
          </g>
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px 0', fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: 1 }}>
        <span>SOURCE</span>
        <span>TOUCHPOINT</span>
        <span>OUTCOME</span>
      </div>
    </div>
  );
};

const AttributionTab = () => {

  const breakdownCols = [
    { title: 'Channel', dataIndex: 'channel', key: 'channel', render: t => <strong style={{ color: 'var(--text-primary)' }}>{t}</strong> },
    { title: 'Touchpoints', dataIndex: 'touchpoints', key: 'touchpoints', align: 'right', render: t => <Text style={{ fontWeight: 500 }}>{t}</Text> },
    { title: 'Assisted', dataIndex: 'assisted', key: 'assisted', align: 'right', render: t => <Text type="secondary" style={{ fontWeight: 500 }}>{t}</Text> },
    { title: 'Direct', dataIndex: 'direct', key: 'direct', align: 'right', render: t => <strong style={{ color: 'var(--text-primary)' }}>{t}</strong> },
    { title: 'Revenue', dataIndex: 'revenue', key: 'revenue', align: 'right', render: t => <Text style={{ fontWeight: 600 }}>{t}</Text> },
    { title: 'Cost', dataIndex: 'cost', key: 'cost', align: 'right', render: t => <Text type="secondary" style={{ fontWeight: 500 }}>{t}</Text> },
    { title: 'ROAS', dataIndex: 'roas', key: 'roas', align: 'right', render: t => (
      t === '∞' 
      ? <Tag style={{ margin: 0, borderRadius: 12, border: 'none', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-primary)', fontWeight: 800 }}>∞</Tag>
      : <Text style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{t}</Text>
    ) },
    { title: 'CPA', dataIndex: 'cpa', key: 'cpa', align: 'right', render: t => <Text style={{ fontWeight: 600 }}>{t}</Text> },
  ];

  const breakdownData = [
    { key: '1', channel: 'Google Ads', touchpoints: '1,842', assisted: '312', direct: '486', revenue: '₹28.4L', cost: '₹24.2L', roas: '4.2x', cpa: '₹4,980' },
    { key: '2', channel: 'Meta Ads', touchpoints: '1,240', assisted: '428', direct: '298', revenue: '₹19.2L', cost: '₹18.6L', roas: '3.8x', cpa: '₹6,242' },
    { key: '3', channel: 'Organic SEO', touchpoints: '3,840', assisted: '284', direct: '186', revenue: '₹14.8L', cost: '₹0', roas: '∞', cpa: '₹0' },
    { key: '4', channel: 'WhatsApp', touchpoints: '642', assisted: '184', direct: '142', revenue: '₹9.4L', cost: '₹2.2L', roas: '12.4x', cpa: '₹1,549' },
    { key: '5', channel: 'Direct/Referral', touchpoints: '420', assisted: '98', direct: '88', revenue: '₹6.2L', cost: '₹0', roas: '∞', cpa: '₹0' },
  ];

  const PathTag = ({ text, color }) => (
    <div style={{ padding: '4px 12px', background: `var(--bg-tertiary)`, border: `1px solid ${color}`, color: color, borderRadius: 16, fontSize: 12, fontWeight: 600 }}>
      {text}
    </div>
  );

  const Arrow = () => <ArrowRight size={14} color="var(--text-tertiary)" />;

  return (
    <>
      {/* Model Selection */}
      <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
        <Card className="glassmorphism" style={{ borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}><Activity size={14}/> ATTRIBUTION MODEL</Text>
              <Title level={4} style={{ margin: '0 0 8px 0', fontWeight: 800, color: 'var(--text-primary)' }}>Last Click</Title>
              <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>100% of the credit goes to the last channel a user touched before converting. Best for short, <br/>transactional journeys — but undervalues awareness and assist channels.</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Last Click</Text>
              <Tag color="default" style={{ borderRadius: 12, border: 'none', margin: 0, fontWeight: 600 }}>default</Tag>
              <Select defaultValue="last" style={{ width: 40 }} bordered={false} suffixIcon={null} dropdownMatchSelectWidth={false}>
                <Option value="last">Last Click</Option>
                <Option value="first">First Click</Option>
                <Option value="linear">Linear</Option>
                <Option value="decay">Time Decay</Option>
              </Select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Customer Journey Flow */}
      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Customer Journey Flow</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Where users come from, where they engage, and how they convert.</Text></div>}
          extra={<div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, background: 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: 12, border: '1px solid var(--border-color)' }}><Info size={14}/> Width ∝ volume</div>}
          className="glassmorphism" style={{ borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: '0 24px 24px' }}
        >
          <CustomerJourneyFlow />
        </Card>
      </motion.div>

      {/* Channel Breakdown */}
      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Channel Attribution Breakdown</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Assist + direct conversions per channel · Last Click model</Text></div>}
          className="glassmorphism" style={{ borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 0 }}
        >
          <Table columns={breakdownCols} dataSource={breakdownData} pagination={false} size="middle" rowClassName={() => 'hover-bg'} scroll={{ x: 'max-content' }} />
        </Card>
      </motion.div>

      {/* Conversion Paths */}
      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Most Common Conversion Paths</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Top 5 sequences leading to a conversion</Text></div>}
          className="glassmorphism" style={{ borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: '24px 32px' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Path 1 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: 12, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)' }}>1</div>
                <PathTag text="Google Ad" color="#38bdf8" /> <Arrow/> <PathTag text="Landing Page" color="var(--text-secondary)" /> <Arrow/> <PathTag text="WhatsApp Inquiry" color="#4ade80" />
              </div>
              <div><strong style={{ fontSize: 16, color: 'var(--text-primary)' }}>486</strong> <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>conversions</Text></div>
            </div>
            
            {/* Path 2 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: 12, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)' }}>2</div>
                <PathTag text="Organic Blog" color="#34d399" /> <Arrow/> <PathTag text="Product Page" color="var(--text-secondary)" /> <Arrow/> <PathTag text="Form Submit" color="var(--text-secondary)" />
              </div>
              <div><strong style={{ fontSize: 16, color: 'var(--text-primary)' }}>284</strong> <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>conversions</Text></div>
            </div>

            {/* Path 3 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: 12, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)' }}>3</div>
                <PathTag text="Meta Ad" color="#6366f1" /> <Arrow/> <PathTag text="Retargeting" color="#f472b6" /> <Arrow/> <PathTag text="WhatsApp" color="#4ade80" />
              </div>
              <div><strong style={{ fontSize: 16, color: 'var(--text-primary)' }}>241</strong> <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>conversions</Text></div>
            </div>

            {/* Path 4 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: 12, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)' }}>4</div>
                <PathTag text="Direct" color="#fbbf24" /> <Arrow/> <PathTag text="Product Page" color="var(--text-secondary)" /> <Arrow/> <PathTag text="Call" color="var(--text-secondary)" />
              </div>
              <div><strong style={{ fontSize: 16, color: 'var(--text-primary)' }}>188</strong> <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>conversions</Text></div>
            </div>

            {/* Path 5 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: 12, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)' }}>5</div>
                <PathTag text="Organic" color="#34d399" /> <Arrow/> <PathTag text="Blog" color="#a78bfa" /> <Arrow/> <PathTag text="Blog" color="#a78bfa" /> <Arrow/> <PathTag text="Form" color="var(--text-secondary)" />
              </div>
              <div><strong style={{ fontSize: 16, color: 'var(--text-primary)' }}>142</strong> <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>conversions</Text></div>
            </div>
          </div>
        </Card>
      </motion.div>
    </>
  );
};

export default AttributionTab;
