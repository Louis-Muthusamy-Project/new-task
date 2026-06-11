import React from 'react';
import { Typography, Card, Button } from 'antd';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const { Title, Text } = Typography;

const calendarEvents = {
  1: [{ title: 'Top 10 Luxury Projects Banga...', type: 'Blog', color: '#3b82f6' }],
  8: [{ title: 'June Instagram Grid (6 posts)', type: 'Social', color: '#0d9488' }],
  10: [{ title: 'Prestige Somerville — Full Ov...', type: 'Landing Page', color: '#ec4899' }],
  12: [{ title: 'Google Ads Copy — Summer...', type: 'Ad Copy', color: '#f59e0b' }],
  18: [{ title: 'Luxury Living Guide 2026', type: 'Blog', color: '#3b82f6' }],
  20: [
    { title: 'Investment Guide: Bangalore...', type: 'Blog', color: '#3b82f6' },
    { title: 'June Email Newsletter', type: 'Email', color: '#8b5cf6' }
  ],
  25: [{ title: 'Whitefield Property Price Rep...', type: 'Blog', color: '#3b82f6' }],
  28: [{ title: 'Meta Ad Creatives — July', type: 'Ad Copy', color: '#f59e0b' }],
  30: [{ title: 'July Instagram Grid', type: 'Social', color: '#0d9488' }]
};

const CalendarViewTab = ({ itemVariants }) => {
  const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  
  // Generating a simple 30 day grid starting on Tuesday (for June 2026 mock)
  const days = [];
  // 1 empty cell for Monday
  days.push({ date: null, events: [] });
  // 30 days
  for (let i = 1; i <= 30; i++) {
    days.push({ date: i, events: calendarEvents[i] || [] });
  }
  // Fill remaining cells for 5 rows (35 total)
  while (days.length < 35) {
    days.push({ date: null, events: [] });
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
      <motion.div variants={itemVariants}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <Title level={4} style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>June 2026</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>Click a pill to open the detail drawer</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button icon={<ChevronLeft size={16} />} style={{ borderRadius: 8, borderColor: 'var(--border-color)' }} />
            <Button style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Today</Button>
            <Button icon={<ChevronRight size={16} />} style={{ borderRadius: 8, borderColor: 'var(--border-color)' }} />
          </div>
        </div>

        <Card className="glassmorphism" style={{ borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 900 }}>
              {/* Header Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                {daysOfWeek.map(day => (
                  <div key={day} style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text-secondary)', borderRight: '1px solid var(--border-color)' }}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid Rows */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(5, 120px)' }}>
                {days.map((cell, i) => (
                  <div key={i} style={{ 
                    borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--border-color)' : 'none', 
                    borderBottom: i < 28 ? '1px solid var(--border-color)' : 'none',
                    padding: 8,
                    background: cell.date === 9 ? 'var(--bg-primary)' : 'transparent', // highlight 9th just for visual
                    border: cell.date === 9 ? '2px solid var(--accent-secondary)' : 'none',
                    margin: cell.date === 9 ? -1 : 0,
                    zIndex: cell.date === 9 ? 2 : 1,
                    position: 'relative'
                  }}>
                    {cell.date && <Text type="secondary" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8, paddingLeft: 4 }}>{cell.date}</Text>}
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {cell.events.map((ev, idx) => (
                        <div key={idx} style={{ 
                          background: ev.color, 
                          color: '#fff', 
                          fontSize: 11, 
                          fontWeight: 600, 
                          padding: '4px 8px', 
                          borderRadius: 4, 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          cursor: 'pointer'
                        }}>
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { type: 'Blog', color: '#3b82f6' },
              { type: 'Social', color: '#0d9488' },
              { type: 'Ad Copy', color: '#f59e0b' },
              { type: 'Email', color: '#8b5cf6' },
              { type: 'Landing Page', color: '#ec4899' }
            ].map(l => (
              <div key={l.type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color }} />
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>{l.type}</Text>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default CalendarViewTab;
