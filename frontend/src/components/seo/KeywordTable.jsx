import React, { useState } from 'react';
import { Table, Tag, Button, Input } from 'antd';
import { ArrowUp, ArrowDown, Minus, Star, RefreshCw, Trash2 } from 'lucide-react';
import { deleteKeyword } from '../../api/seoApi';

const DIFFICULTY_COLOR = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };
const INTENT_STYLE = {
  Informational: { color: '#6366f1', border: '#6366f1' },
  Commercial:    { color: '#10b981', border: '#10b981' },
  Transactional: { color: '#f59e0b', border: '#f59e0b' },
  Navigational:  { color: '#8b5cf6', border: '#8b5cf6' },
  Brand:         { color: '#fff', border: 'transparent', bg: '#374151' },
  Unknown:       { color: 'var(--text-tertiary)', border: 'var(--border-color)' }
};

/**
 * KeywordTable — Full-featured keyword tracking table with search filter, intent tags,
 * difficulty badges, position change arrows, and delete actions.
 * Props: keywords[], onKeywordDeleted() callback, onRefresh() callback
 */
const KeywordTable = ({ keywords = [], onKeywordDeleted, onRefresh, loading = false }) => {
  const [filter, setFilter] = useState('');
  const [posFilter, setPosFilter] = useState('all');

  const filtered = keywords.filter(k => {
    const matchText = !filter || k.keyword.toLowerCase().includes(filter.toLowerCase());
    const matchPos = posFilter === 'all'
      || (posFilter === 'top3' && k.position <= 3)
      || (posFilter === 'top10' && k.position <= 10)
      || (posFilter === 'top20' && k.position <= 20)
      || (posFilter === 'dropped' && k.position > k.previousPosition && k.previousPosition != null);
    return matchText && matchPos;
  });

  const handleDelete = async (id) => {
    try {
      await deleteKeyword(id);
      onKeywordDeleted?.();
    } catch (err) {
      console.error('Delete keyword failed:', err);
    }
  };

  const columns = [
    {
      title: 'KEYWORD', dataIndex: 'keyword', key: 'keyword',
      render: (text) => <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>{text}</strong>
    },
    {
      title: 'POS', dataIndex: 'position', key: 'position', width: 70,
      render: (val) => {
        const color = val <= 3 ? 'var(--accent-warning)' : val <= 10 ? 'var(--accent-primary)' : val <= 30 ? 'var(--accent-info)' : 'var(--accent-danger)';
        return (
          <span style={{ fontWeight: 800, fontSize: 16, color }}>
            {val <= 3 && <Star size={12} style={{ marginRight: 2 }} />}{val || '–'}
          </span>
        );
      }
    },
    {
      title: 'CHANGE', key: 'change',
      render: (_, row) => {
        const change = row.previousPosition != null ? row.previousPosition - row.position : 0;
        if (change === 0) return <Minus size={14} color="var(--text-tertiary)" />;
        const positive = change > 0;
        return (
          <Tag style={{
            color: positive ? 'var(--accent-primary)' : 'var(--accent-danger)',
            background: positive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: 'none', borderRadius: 12, fontWeight: 700, padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: 4
          }}>
            {positive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {Math.abs(change)}
          </Tag>
        );
      }
    },
    {
      title: 'VOLUME', dataIndex: 'volume', key: 'volume',
      render: (val) => <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{(val || 0).toLocaleString()}</span>
    },
    {
      title: 'DIFFICULTY', dataIndex: 'difficulty', key: 'difficulty',
      render: (val) => (
        <Tag style={{ borderRadius: 12, fontWeight: 700, border: 'none', background: `${DIFFICULTY_COLOR[val] || '#888'}22`, color: DIFFICULTY_COLOR[val] || '#888' }}>
          {val || '–'}
        </Tag>
      )
    },
    {
      title: 'INTENT', dataIndex: 'intent', key: 'intent',
      render: (val) => {
        const s = INTENT_STYLE[val] || INTENT_STYLE.Unknown;
        return (
          <Tag style={{ borderRadius: 12, fontWeight: 600, padding: '2px 10px', background: s.bg || 'transparent', color: s.color, border: `1px solid ${s.border}` }}>
            {val}
          </Tag>
        );
      }
    },
    {
      title: '', key: 'actions', width: 40,
      render: (_, row) => (
        <Button
          size="small" type="text"
          icon={<Trash2 size={13} color="var(--accent-danger)" />}
          onClick={() => handleDelete(row._id)}
          style={{ padding: '4px', minWidth: 'auto' }}
        />
      )
    }
  ];

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Input.Search
          placeholder="Filter keywords…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ width: 280 }}
          allowClear
        />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: `All (${keywords.length})` },
            { key: 'top3', label: `Top 3 (${keywords.filter(k => k.position <= 3).length})` },
            { key: 'top10', label: `Top 10 (${keywords.filter(k => k.position <= 10).length})` },
            { key: 'top20', label: `Top 20 (${keywords.filter(k => k.position <= 20).length})` },
            { key: 'dropped', label: `Dropped` }
          ].map(f => (
            <Button
              key={f.key} size="small"
              onClick={() => setPosFilter(f.key)}
              style={{
                borderRadius: 16, fontWeight: 600, fontSize: 12,
                background: posFilter === f.key ? 'var(--text-primary)' : 'transparent',
                color: posFilter === f.key ? 'var(--bg-primary)' : 'var(--text-secondary)',
                borderColor: posFilter === f.key ? 'var(--text-primary)' : 'var(--border-color)'
              }}
            >
              {f.label}
            </Button>
          ))}
          <Button size="small" icon={<RefreshCw size={12} />} onClick={onRefresh} loading={loading}
            style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--accent-secondary)', color: 'var(--accent-secondary)', background: 'rgba(16,185,129,0.05)' }}>
            Refresh Ranks
          </Button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="_id"
          pagination={{ pageSize: 15, showSizeChanger: false, size: 'small' }}
          size="small"
          scroll={{ x: 800 }}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default KeywordTable;
