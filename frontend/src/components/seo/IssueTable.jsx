import React from 'react';
import { Tag, Button } from 'antd';
import { AlertTriangle, CheckCircle2, Info, Wrench, EyeOff } from 'lucide-react';
import { updateIssueStatus } from '../../api/seoApi';

const SEVERITY_CONFIG = {
  critical: { color: 'var(--accent-danger)', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', icon: <AlertTriangle size={14} />, label: 'Critical' },
  warning: { color: 'var(--accent-warning)', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: <AlertTriangle size={14} />, label: 'Warning' },
  info: { color: 'var(--accent-info)', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', icon: <Info size={14} />, label: 'Info' }
};

const STATUS_TAG = {
  open: { color: 'error', label: 'Open' },
  in_progress: { color: 'processing', label: 'In Progress' },
  fixed: { color: 'success', label: 'Fixed' },
  ignored: { color: 'default', label: 'Ignored' }
};

/**
 * IssueTable — Renders a list of SEO issues grouped by severity with Fix/Ignore actions.
 * Props: issues[], onIssueUpdated() callback
 */
const IssueTable = ({ issues = [], onIssueUpdated }) => {
  const handleAction = async (id, status) => {
    try {
      await updateIssueStatus(id, status);
      onIssueUpdated?.();
    } catch (err) {
      console.error('Failed to update issue status:', err);
    }
  };

  const groupedByType = issues.reduce((acc, issue) => {
    const key = issue.severity;
    if (!acc[key]) acc[key] = [];
    acc[key].push(issue);
    return acc;
  }, {});

  const order = ['critical', 'warning', 'info'];

  if (issues.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: 12, color: 'var(--text-tertiary)' }}>
        <CheckCircle2 size={36} color="var(--accent-secondary)" />
        <span style={{ fontSize: 15, fontWeight: 600 }}>No issues found — great work!</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {order.flatMap((sev) =>
        (groupedByType[sev] || []).map((issue) => {
          const cfg = SEVERITY_CONFIG[sev] || SEVERITY_CONFIG.info;
          const statusCfg = STATUS_TAG[issue.status] || STATUS_TAG.open;

          return (
            <div
              key={issue._id || issue.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderRadius: 10,
                background: issue.status === 'fixed' ? 'var(--bg-secondary)' : cfg.bg,
                border: `1px solid ${issue.status === 'fixed' ? 'var(--border-color)' : cfg.border}`,
                opacity: issue.status === 'fixed' || issue.status === 'ignored' ? 0.6 : 1,
                gap: 12, flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 }}>
                <span style={{ color: cfg.color, marginTop: 1 }}>{cfg.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{issue.title}</div>
                  {issue.url && (
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                      {issue.url.length > 80 ? issue.url.slice(0, 80) + '…' : issue.url}
                    </div>
                  )}
                  {issue.description && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{issue.description}</div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                <Tag color={statusCfg.color} style={{ borderRadius: 10, fontWeight: 600, fontSize: 11 }}>{statusCfg.label}</Tag>
                {issue.status === 'open' && (
                  <>
                    <Button
                      size="small"
                      icon={<Wrench size={12} />}
                      style={{ borderRadius: 8, fontSize: 12, fontWeight: 600, color: 'var(--accent-secondary)', borderColor: 'var(--accent-secondary)', background: 'rgba(16,185,129,0.05)' }}
                      onClick={() => handleAction(issue._id || issue.id, 'in_progress')}
                    >
                      Fix
                    </Button>
                    <Button
                      size="small"
                      icon={<EyeOff size={12} />}
                      style={{ borderRadius: 8, fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', borderColor: 'var(--border-color)', background: 'transparent' }}
                      onClick={() => handleAction(issue._id || issue.id, 'ignored')}
                    >
                      Ignore
                    </Button>
                  </>
                )}
                {issue.status === 'in_progress' && (
                  <Button size="small" style={{ borderRadius: 8, fontSize: 12, fontWeight: 600, color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)', background: 'rgba(16,185,129,0.05)' }} onClick={() => handleAction(issue._id || issue.id, 'fixed')}>
                    Mark Fixed
                  </Button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default IssueTable;
