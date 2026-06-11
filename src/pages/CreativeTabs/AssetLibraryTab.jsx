import React from 'react';
import { Typography, Row, Col, Card, Button, Select } from 'antd';
import { motion } from 'framer-motion';
import { FileText, Play, Upload, Link } from 'lucide-react';

const { Title, Text } = Typography;
const { Option } = Select;

const AssetLibraryTab = ({ itemVariants }) => {
  const assets = [
    { name: 'PE_Logo_Primary.svg', type: 'Logo', size: '24 KB', color: '#d1fae5', icon: <FileText size={24} color="#64748b" /> },
    { name: 'PE_Logo_White.svg', type: 'Logo', size: '18 KB', color: '#d1fae5', icon: <FileText size={24} color="#64748b" /> },
    { name: 'PE_Brand_Colors.pdf', type: 'Guidelines', size: '2.1 MB', color: '#fef3c7', icon: <FileText size={24} color="#64748b" /> },
    { name: 'Homepage_Hero_Jan26.jpg', type: 'Image', size: '4.2 MB', color: '#fef3c7', icon: <FileText size={24} color="#64748b" /> },
    { name: 'Somerville_Aerial.mp4', type: 'Video', size: '84 MB', color: '#fce7f3', icon: <Play size={24} color="#64748b" /> },
    { name: 'Instagram_Template_1x1.psd', type: 'Template', size: '12 MB', color: '#f3e8ff', icon: <FileText size={24} color="#64748b" /> },
    { name: 'Instagram_Template_Story.psd', type: 'Template', size: '14 MB', color: '#f3e8ff', icon: <FileText size={24} color="#64748b" /> },
    { name: 'Font_Inter_Family.zip', type: 'Font', size: '8 MB', color: '#d1fae5', icon: <strong style={{ fontSize: 24, color: '#000' }}>Aa</strong> }
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
      <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
        <strong style={{ fontSize: 16, color: 'var(--text-primary)', display: 'block', marginBottom: 16 }}>Asset Library — Prestige Estates</strong>
        
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Select defaultValue="All Types" style={{ width: 150 }} size="middle"><Option value="All Types">All Types</Option></Select>
          <Select defaultValue="All Status" style={{ width: 150 }} size="middle"><Option value="All Status">All Status</Option></Select>
          <Select defaultValue="Recent" style={{ width: 150 }} size="middle"><Option value="Recent">Recent</Option></Select>
        </div>
      </motion.div>

      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {assets.map((asset, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
              <Card 
                bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }} 
                style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', overflow: 'hidden', height: '100%' }}
              >
                <div style={{ background: asset.color, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {asset.icon}
                </div>
                <div style={{ padding: '16px 20px' }}>
                  <Text style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.name}</Text>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 12, fontSize: 12, color: 'var(--text-secondary)' }}>{asset.type}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>· {asset.size}</Text>
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <a style={{ color: 'var(--accent-secondary)', fontSize: 13, fontWeight: 500 }}>Download</a>
                    <a style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}><Link size={12}/> Copy URL</a>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <motion.div variants={itemVariants}>
        <div style={{ 
          border: '1px dashed var(--border-color)', 
          borderRadius: 16, 
          padding: 40, 
          textAlign: 'center', 
          background: 'var(--bg-secondary)',
          cursor: 'pointer'
        }}>
          <Upload size={24} color="var(--text-secondary)" style={{ marginBottom: 12 }} />
          <Text type="secondary" style={{ fontSize: 14, display: 'block' }}>Drag & drop assets here, or click to upload</Text>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AssetLibraryTab;
