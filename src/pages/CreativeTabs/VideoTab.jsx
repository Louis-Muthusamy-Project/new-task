import React from 'react';
import { Typography, Row, Col, Card, Button, Input, Tag } from 'antd';
import { motion } from 'framer-motion';
import { Play, Check, Wand2 } from 'lucide-react';

const { Title, Text } = Typography;
const { TextArea } = Input;

const VideoTab = ({ itemVariants }) => {
  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
      <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
        <Text type="secondary" style={{ fontSize: 14 }}>Video productions and edits for Prestige Estates</Text>
      </motion.div>

      <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
        {/* Video 1 */}
        <Col xs={24} lg={8}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', overflow: 'hidden', height: '100%' }}>
              <div style={{ background: 'var(--bg-tertiary)', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <Tag color="warning" style={{ borderRadius: 12, fontWeight: 700, margin: 0, border: 'none' }}>IN PRODUCTION</Tag>
                </div>
                <Play size={48} color="var(--text-tertiary)" />
              </div>
              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 12, display: 'block' }}>Prestige Whitefield — Site Walkthrough Reel</strong>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
                  <Tag color="processing" style={{ borderRadius: 12, margin: 0 }}>Instagram Reel</Tag>
                  <Text type="secondary" style={{ fontSize: 13 }}>30-45 sec</Text>
                </div>
                
                <Row gutter={[16, 8]} style={{ fontSize: 13, marginBottom: 16 }}>
                  <Col span={12}><Text type="secondary">Script: <strong style={{ color: 'var(--text-primary)' }}><Check size={14} color="var(--accent-secondary)"/> Approved</strong></Text></Col>
                  <Col span={12}><Text type="secondary">Shoot: <strong style={{ color: 'var(--text-primary)' }}>Jun 14</strong></Text></Col>
                  <Col span={12}><Text type="secondary">Edit: <strong style={{ color: 'var(--text-primary)' }}>Jun 18</strong></Text></Col>
                  <Col span={12}><Text type="secondary">Delivery: <strong style={{ color: 'var(--text-primary)' }}>Jun 20</strong></Text></Col>
                </Row>
                
                <Text type="secondary" style={{ fontSize: 13, marginBottom: 16, display: 'block' }}>Assigned: <strong style={{ color: 'var(--text-primary)' }}>DR</strong></Text>

                <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, marginBottom: 20 }}>
                  <div style={{ height: '100%', width: '50%', background: 'var(--accent-secondary)', borderRadius: 2 }} />
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', gap: 12 }}>
                  <Button style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>View Brief</Button>
                  <Button style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Upload Footage</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* Video 2 */}
        <Col xs={24} lg={8}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', overflow: 'hidden', height: '100%' }}>
              <div style={{ background: 'var(--bg-tertiary)', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <Tag color="success" style={{ borderRadius: 12, fontWeight: 700, margin: 0, border: 'none' }}>DELIVERED</Tag>
                </div>
                <Play size={48} color="var(--text-tertiary)" />
              </div>
              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 12, display: 'block' }}>Prestige Estates — June Brand Story</strong>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
                  <Tag color="processing" style={{ borderRadius: 12, margin: 0 }}>YouTube Video</Tag>
                  <Text type="secondary" style={{ fontSize: 13 }}>3:24</Text>
                </div>
                
                <Row gutter={[16, 8]} style={{ fontSize: 13, marginBottom: 16 }}>
                  <Col span={12}><Text type="secondary">Delivered: <strong style={{ color: 'var(--text-primary)' }}>Jun 5</strong></Text></Col>
                  <Col span={12}><Text type="secondary">Views: <strong style={{ color: 'var(--text-primary)' }}>8,240</strong></Text></Col>
                </Row>

                <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, marginBottom: 20 }}>
                  <div style={{ height: '100%', width: '100%', background: 'var(--accent-secondary)', borderRadius: 2 }} />
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', gap: 12 }}>
                  <Button style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>View</Button>
                  <Button style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Download</Button>
                  <Button type="text" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Metrics</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* Video 3 */}
        <Col xs={24} lg={8}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', overflow: 'hidden', height: '100%' }}>
              <div style={{ background: 'var(--bg-tertiary)', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <Tag style={{ borderRadius: 12, fontWeight: 700, margin: 0, border: 'none', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>BRIEF STAGE</Tag>
                </div>
                <Play size={48} color="var(--text-tertiary)" />
              </div>
              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 12, display: 'block' }}>Q3 Property Launch Teaser</strong>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
                  <Tag color="processing" style={{ borderRadius: 12, margin: 0 }}>Instagram Reel + YouTube Short</Tag>
                </div>
                
                <Row gutter={[16, 8]} style={{ fontSize: 13, marginBottom: 16 }}>
                  <Col span={12}><Text type="secondary">Brief: <strong style={{ color: 'var(--text-primary)' }}>Not started</strong></Text></Col>
                  <Col span={12}><Text type="secondary">Shoot: <strong style={{ color: 'var(--text-primary)' }}>TBD</strong></Text></Col>
                </Row>

                <div style={{ marginTop: 'auto', display: 'flex', gap: 12 }}>
                  <Button type="primary" style={{ borderRadius: 8, fontWeight: 600, background: 'var(--accent-secondary)' }}>Create Brief</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      <motion.div variants={itemVariants} style={{ marginBottom: 40 }}>
        <Card style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)' }}>
          <strong style={{ fontSize: 14, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Video Production Workflow</strong>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 20 }}>Standard pipeline for every video deliverable</Text>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            {['Brief', 'Script', 'Storyboard', 'Shoot', 'Raw Edit', 'Client Review', 'Final', 'Deliver'].map((step, i) => {
              let bg = 'var(--bg-tertiary)';
              let color = 'var(--text-secondary)';
              if (i < 3) { bg = 'var(--accent-secondary)'; color = '#fff'; }
              if (i === 3) { bg = 'rgba(16, 185, 129, 0.2)'; color = 'var(--accent-secondary)'; }

              return (
                <React.Fragment key={step}>
                  <div style={{ background: bg, color: color, padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{step}</div>
                  {i < 7 && <Text type="secondary" style={{ fontSize: 12 }}>→</Text>}
                </React.Fragment>
              );
            })}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <strong style={{ fontSize: 14, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>AI-Assisted Video Tools</strong>
        <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 20 }}>Speed up production with AI</Text>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)', height: '100%', display: 'flex', flexDirection: 'column' }} bodyStyle={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Wand2 size={16} color="var(--accent-secondary)" />
                <strong style={{ color: 'var(--text-primary)' }}>Script Generator</strong>
              </div>
              <Text type="secondary" style={{ fontSize: 12, marginBottom: 16, display: 'block' }}>Generate video script from brief</Text>
              
              <Text type="secondary" style={{ fontSize: 11, marginBottom: 8, display: 'block' }}>Topic / key message</Text>
              <TextArea rows={4} placeholder="e.g. 30-sec reel introducing Prestige Whitefield amenities" style={{ borderRadius: 8, marginBottom: 16 }} />
              
              <Button type="primary" block style={{ marginTop: 'auto', borderRadius: 8, fontWeight: 600, background: '#7dd3fc', color: '#0369a1', border: 'none' }} icon={<Wand2 size={16} />}>Generate Script</Button>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)', height: '100%', display: 'flex', flexDirection: 'column' }} bodyStyle={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Wand2 size={16} color="var(--accent-secondary)" />
                <strong style={{ color: 'var(--text-primary)' }}>B-Roll Suggestions</strong>
              </div>
              <Text type="secondary" style={{ fontSize: 12, marginBottom: 16, display: 'block' }}>Get B-roll shot list for this video</Text>
              
              <Text type="secondary" style={{ fontSize: 11, marginBottom: 8, display: 'block' }}>Video concept</Text>
              <TextArea rows={4} placeholder="e.g. Luxury apartment walkthrough — Whitefield" style={{ borderRadius: 8, marginBottom: 16 }} />
              
              <Button type="primary" block style={{ marginTop: 'auto', borderRadius: 8, fontWeight: 600, background: '#7dd3fc', color: '#0369a1', border: 'none' }} icon={<Wand2 size={16} />}>Generate Shot List</Button>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)', height: '100%', display: 'flex', flexDirection: 'column' }} bodyStyle={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Wand2 size={16} color="var(--accent-secondary)" />
                <strong style={{ color: 'var(--text-primary)' }}>Captions / Subtitles</strong>
              </div>
              <Text type="secondary" style={{ fontSize: 12, marginBottom: 16, display: 'block' }}>Generate captions from script</Text>
              
              <Text type="secondary" style={{ fontSize: 11, marginBottom: 8, display: 'block' }}>Script or video transcript</Text>
              <TextArea rows={4} placeholder="Paste script or transcript..." style={{ borderRadius: 8, marginBottom: 16 }} />
              
              <Button type="primary" block style={{ marginTop: 'auto', borderRadius: 8, fontWeight: 600, background: '#7dd3fc', color: '#0369a1', border: 'none' }} icon={<Wand2 size={16} />}>Generate Captions</Button>
            </Card>
          </Col>
        </Row>
      </motion.div>
    </motion.div>
  );
};

export default VideoTab;
