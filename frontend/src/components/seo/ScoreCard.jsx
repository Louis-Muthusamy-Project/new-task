import React from 'react';
import { motion } from 'framer-motion';

/**
 * Animated circular score gauge with a radial glow aura.
 * Props: score (0-100), color, label, size (default 120), showLabel
 */
const ScoreCard = ({ score = 0, color = '#10b981', label = '', size = 120, showLabel = true, subtitle = '' }) => {
  const radius = (size / 2) - 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return '#10b981'; // green
    if (s >= 60) return '#f59e0b'; // amber
    return '#ef4444';              // red
  };

  const resolvedColor = color || getColor(score);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative' }}>
      {/* Glow aura */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: size * 1.4, height: size * 1.4,
        background: `radial-gradient(circle, ${resolvedColor} 0%, transparent 70%)`,
        opacity: 0.12,
        filter: `blur(${size / 4}px)`,
        pointerEvents: 'none'
      }} />

      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'relative', zIndex: 1 }}>
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--bg-tertiary)" strokeWidth={8} />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={resolvedColor} strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - strokeDash }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>

      {/* Center label */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center', zIndex: 2
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ fontSize: size / 4, fontWeight: 800, color: resolvedColor, lineHeight: 1 }}
        >
          {score}
        </motion.div>
        <div style={{ fontSize: size / 10, color: 'var(--text-tertiary)', fontWeight: 600 }}>/100</div>
      </div>

      {/* Label below */}
      {showLabel && (
        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
          {subtitle && <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{subtitle}</div>}
        </div>
      )}
    </div>
  );
};

export default ScoreCard;
