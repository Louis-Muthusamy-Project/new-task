import React, { useState } from 'react';
import { Typography, Row, Col, Card, Button, Tag, Divider } from 'antd';
import { motion } from 'framer-motion';
import { RefreshCw, Search, PenTool, Bookmark, SkipForward, Edit2, Play, Edit3, Smartphone, Briefcase, MessageCircle, Mail, Monitor, Megaphone, Check, Sparkles } from 'lucide-react';

const { Title, Text } = Typography;

const instagramTrends = [
  { type: 'HOT', platform: 'Instagram', title: "The 'Summer of Sanctuaries' Biophilic Estates", desc: "With Jul/Aug marking peak humidity in Bangalore, there is a data-backed shift toward properties offering micro-climate cooling and indoor-outdoor integration as a wellness necessity.", angle: "Can your home drop the temperature by 5 degrees? Step into the Prestige Biophilic Collection.", vol: '42.6K/mo', comp: 'Medium', trend: '+132%', trendColor: 'success', tags: ['Reel', 'Carousel'] },
  { type: 'UP RISING', platform: 'Instagram', title: "Investment Play: The North Bangalore Tech Corridor Shift", desc: "Hyper-growth in the Devanahalli-HBR district is driving a 22% YOY increase in searches for 'future-proof real estate' among NRIs and tech executives.", angle: "Why the world's biggest tech giants are moving next door to your future villa.", vol: '28.8K/mo', comp: 'High', trend: '+18%', trendColor: 'success', tags: ['Carousel', 'Story'] },
  { type: 'UP RISING', platform: 'Instagram', title: "Smart Mansion 2.0: AI-Integrated Living", desc: "Consumer interest in 'AI-integrated homes' for luxury safety and energy management is seeing a steady climb as new residential tech standards are set for 2026.", angle: "Your Prestige home now thinks 10 steps ahead of you.", vol: '18.2K/mo', comp: 'Low', trend: '+214%', trendColor: 'success', tags: ['Reel', 'Single Image'] },
  { type: 'EVERGREEN', platform: 'Instagram', title: "The Eternal Appeal of the Bangalore Penthouse", desc: "Skyline views remains the #1 status signal in Bangalore luxury real estate hashtags, maintaining high stable search intent regardless of market fluctuations.", angle: "The only ceiling you'll ever need is the Bangalore sky.", vol: '62.1K/mo', comp: 'High', trend: 'Stable', trendColor: 'secondary', tags: ['Reel', 'Single Image'] },
  { type: 'EVERGREEN', platform: 'Instagram', title: "The Art of the Ultra-Luxury Villa Layout", desc: "Instructional and aspirational content regarding plot sizes and privacy-first architecture in Bangalore continues to be a top-performing save-to-engagement metric.", angle: "Privacy is the new gold: Inside the layout of Bangalore's most exclusive villas.", vol: '12.4K/mo', comp: 'Medium', trend: 'Stable', trendColor: 'secondary', tags: ['Carousel', 'Story'] }
];

const blogTrends = [
  { type: 'HOT', platform: 'Blog / SEO', title: "The Evolution of Bangalore's 'Satellite Luxury' Corridors for 2026", desc: "Post-infrastructure expansion near North Bangalore and Sarjapur is driving a 40% surge in HNI interest for suburban luxury estates.", angle: "Beyond the City Lights: Why Bangalore's Elite are Moving to the Peripheral Goldmine", vol: '18.5K/mo', comp: 'Medium', trend: '+42%', trendColor: 'success', tags: ['Pillar page', 'Long-form'] },
  { type: 'UP RISING', platform: 'Blog / SEO', title: "Smart Bio-Hacking Homes: Integrating Wellness Tech Into Luxury Villas", desc: "Increased focus on holistic health in 2026 has made 'preventative living' features a top priority for 1 in 3 luxury home buyers.", angle: "The 24/7 Wellness Sanctuary: Inside the Prestige Future-Ready Smart Villa", vol: '9.2K/mo', comp: 'Low', trend: '+28%', trendColor: 'success', tags: ['List post', 'Long-form'] },
  { type: 'UP RISING', platform: 'Blog / SEO', title: "Tax Implications of Luxury Property Investment in Bangalore: June 2026 Update", desc: "Mid-year financial reviews drive a seasonal peak in organic searches for RERA compliance and luxury real estate tax benefits.", angle: "Maximize Your Gains: The Savvy Investor's Guide to Bangalore's 2026 Real Estate Market", vol: '7.8K/mo', comp: 'Medium', trend: '+14%', trendColor: 'success', tags: ['How-to guide', 'List post'] },
  { type: 'EVERGREEN', platform: 'Blog / SEO', title: "Penthouse vs. Independent Villa: Which Bangalore Asset Offers Better ROI?", desc: "The debate remains a high-intent search query for first-time luxury buyers seeking long-term capital appreciation in the Silicon Valley of India.", angle: "Upper-Floor Elegance or Grounded Grandeur? Deciding Your Next Signature Address", vol: '14.1K/mo', comp: 'High', trend: 'Stable', trendColor: 'secondary', tags: ['Pillar page', 'How-to guide'] },
  { type: 'EVERGREEN', platform: 'Blog / SEO', title: "The Prestige Resident's Guide to Central Bangalore Lifestyle and Networking", desc: "Lifestyle-focused SEO content helps capture high-intent 'move-to-bangalore' traffic from C-suite executives and global NRIs.", angle: "The Bangalore Circle: Elite Dining, Golf, and Networking at Your Doorstep", vol: '5.2K/mo', comp: 'Low', trend: 'Stable', trendColor: 'secondary', tags: ['List post', 'Long-form'] }
];

const TrendCard = ({ item, itemVariants }) => (
  <Col xs={24} xl={12}>
    <motion.div variants={itemVariants} style={{ height: '100%' }}>
      <Card 
        className="glassmorphism" 
        bodyStyle={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%' }}
        style={{ 
          borderRadius: 16, 
          height: '100%', 
          border: '1px solid var(--border-color)', 
          borderLeft: `4px solid ${item.type === 'HOT' ? 'var(--accent-danger)' : item.type === 'UP RISING' ? 'var(--accent-warning)' : 'var(--accent-secondary)'}`,
          boxShadow: 'var(--shadow-sm)' 
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Tag color={item.type === 'HOT' ? 'error' : item.type === 'UP RISING' ? 'warning' : 'success'} style={{ borderRadius: 12, fontWeight: 700, margin: 0, padding: '2px 10px' }}>{item.type === 'HOT' ? '🔥 HOT' : item.type === 'UP RISING' ? '🚀 UP RISING' : '🌱 EVERGREEN'}</Tag>
            <Tag style={{ borderRadius: 12, fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', margin: 0 }}>{item.platform}</Tag>
          </div>
          <Button type="primary" size="small" style={{ background: 'var(--accent-secondary)', borderRadius: 16, fontWeight: 600 }}>Generate →</Button>
        </div>

        <Title level={5} style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{item.title}</Title>
        <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.5, display: 'block', marginBottom: 16 }}>{item.desc}</Text>

        <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)', marginBottom: 16 }}>
          <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, display: 'block', marginBottom: 4, color: 'var(--accent-secondary)' }}>CONTENT ANGLE</Text>
          <strong style={{ color: 'var(--text-primary)', fontSize: 14 }}>{item.angle}</strong>
        </div>

        <div style={{ display: 'flex', gap: 16, fontSize: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Text type="secondary">Volume: <strong style={{ color: 'var(--text-primary)' }}>{item.vol}</strong></Text>
          <Text type="secondary">Competition: <strong style={{ color: 'var(--text-primary)' }}>{item.comp}</strong></Text>
          <Text type="secondary">Trend: <strong style={{ color: `var(--accent-${item.trendColor})` }}>{item.trend}</strong></Text>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {item.tags.map(t => <Tag key={t} style={{ borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 11, margin: 0 }}>{t}</Tag>)}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button size="small" icon={<PenTool size={14} />} style={{ borderRadius: 8, fontWeight: 600, background: 'var(--accent-secondary)', color: '#fff', border: 'none' }}>Generate Post</Button>
            <Button size="small" icon={<Edit3 size={14} />} style={{ borderRadius: 8, fontWeight: 600 }}>Generate Blog</Button>
            <Button size="small" type="text" icon={<Bookmark size={14} />} style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Save Idea</Button>
          </div>
          <Button size="small" type="text" style={{ fontWeight: 600, color: 'var(--text-tertiary)' }}>Skip</Button>
        </div>
      </Card>
    </motion.div>
  </Col>
);

const TrendsTab = ({ itemVariants }) => {
  const [selectedChannels, setSelectedChannels] = useState(['Instagram', 'Blog / SEO']);

  const toggleChannel = (channel) => {
    if (selectedChannels.includes(channel)) {
      setSelectedChannels(selectedChannels.filter(c => c !== channel));
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  const platforms = [
    { name: 'Instagram', icon: <Smartphone size={14} /> },
    { name: 'LinkedIn', icon: <Briefcase size={14} /> },
    { name: 'Twitter/X', icon: <MessageCircle size={14} /> },
    { name: 'YouTube', icon: <Play size={14} /> },
    { name: 'Blog / SEO', icon: <Search size={14} /> },
    { name: 'Google Ads', icon: <Megaphone size={14} /> },
    { name: 'Facebook', icon: <Smartphone size={14} /> },
    { name: 'Email', icon: <Mail size={14} /> }
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
      
      <motion.div variants={itemVariants} style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>Trend Analyser</Title>
          <Text type="secondary" style={{ fontSize: 14 }}>Real-time content opportunities for Prestige Estates</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>Last analysed: just now</Text>
          <Button icon={<RefreshCw size={14} />} style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Refresh Trends</Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 24 }}>
          <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, display: 'block', marginBottom: 12 }}>ANALYSING TRENDS FOR:</Text>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Tag color="processing" style={{ borderRadius: 12, fontWeight: 600, fontSize: 13, padding: '4px 12px' }}>Prestige Estates</Tag>
            <Text type="secondary" style={{ fontSize: 13 }}>Real Estate - Luxury residential - Bangalore</Text>
          </div>
          <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>KEYWORDS: <strong style={{ color: 'var(--text-primary)' }}>luxury apartments, villa, real estate investment, Bangalore property</strong> <Button type="link" size="small" style={{ padding: 0 }} icon={<Edit2 size={12}/>}>Edit</Button></Text>
          <Text type="secondary" style={{ fontSize: 12 }}>These are used to find relevant trends</Text>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, display: 'block', marginBottom: 12 }}>SHOW TRENDS FOR:</Text>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {platforms.map(p => {
            const isActive = selectedChannels.includes(p.name);
            return (
              <Button 
                key={p.name}
                onClick={() => toggleChannel(p.name)}
                icon={p.icon}
                style={{ 
                  borderRadius: 20, 
                  background: isActive ? 'var(--accent-secondary)' : 'var(--bg-secondary)', 
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  borderColor: isActive ? 'var(--accent-secondary)' : 'var(--border-color)',
                  fontWeight: 600
                }}
              >
                {p.name}
              </Button>
            );
          })}
          <Button type="primary" style={{ borderRadius: 20, background: 'var(--accent-secondary)', border: 'none', fontWeight: 600, marginLeft: 8 }} icon={<Sparkles size={14}/>}>Analyse Selected Channels</Button>
        </div>
      </motion.div>

      {selectedChannels.includes('Instagram') && (
        <motion.div variants={itemVariants} style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Smartphone size={20} color="var(--text-primary)" />
            <div>
              <Title level={5} style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Instagram Trends — June 2026</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>AI analysis from trending content signals in your industry</Text>
            </div>
          </div>
          <Row gutter={[24, 24]}>
            {instagramTrends.map((item, i) => <TrendCard key={i} item={item} itemVariants={itemVariants} />)}
          </Row>
        </motion.div>
      )}

      {selectedChannels.includes('Blog / SEO') && (
        <motion.div variants={itemVariants} style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Search size={20} color="var(--text-primary)" />
            <div>
              <Title level={5} style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Blog / SEO Trends — June 2026</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>AI analysis from trending search signals in your industry</Text>
            </div>
          </div>
          <Row gutter={[24, 24]}>
            {blogTrends.map((item, i) => <TrendCard key={i} item={item} itemVariants={itemVariants} />)}
          </Row>
        </motion.div>
      )}

      <motion.div variants={itemVariants} style={{ marginTop: 40, borderTop: '1px solid var(--border-color)', paddingTop: 32 }}>
        <Title level={5} style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Saved Ideas</Title>
        <Text type="secondary" style={{ fontSize: 13, marginBottom: 24, display: 'block' }}>Topics saved for later — click any to generate</Text>
        <div style={{ textAlign: 'center', padding: 40, background: 'var(--bg-secondary)', borderRadius: 16, border: '1px dashed var(--border-color)' }}>
          <Text type="secondary" style={{ fontSize: 14 }}>Save trend ideas above to build your content bank.</Text>
        </div>
      </motion.div>

    </motion.div>
  );
};

export default TrendsTab;
