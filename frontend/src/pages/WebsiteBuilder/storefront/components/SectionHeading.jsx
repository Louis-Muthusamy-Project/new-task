import React from 'react';

export default function SectionHeading({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>{title}</h2>
      {action}
    </div>
  );
}
