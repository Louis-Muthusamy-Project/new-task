import React, { useState } from 'react';
import { Modal, Input, Button, Typography } from 'antd';
import { MessageSquare, Zap, CheckCircle2 } from 'lucide-react';

const { Text } = Typography;

const CreateWorkflowModal = ({ visible, onClose, onCreate }) => {
  const [name, setName] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate({ name: name.trim(), type: "broadcast" });
    setName("");
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: 8, borderRadius: 8, display: 'flex' }}>
            <MessageSquare size={20} />
          </div>
          <span style={{ fontSize: 18, color: 'var(--text-primary)' }}>Create Workflow</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose} style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleCreate} disabled={!name.trim()} style={{ borderRadius: 8, fontWeight: 600, background: 'var(--accent-secondary)' }}>
          Create Workflow
        </Button>,
      ]}
      className="glassmorphism-modal"
      bodyStyle={{ padding: '24px 0' }}
    >
      {/* Step 1 */}
      <div style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 12 }}>
          1. Select Workflow Type <span style={{ color: 'var(--accent-danger)' }}>*</span>
        </Text>
        <div style={{ 
          border: '2px solid var(--accent-secondary)', 
          background: 'rgba(13, 148, 136, 0.05)', 
          borderRadius: 12, 
          padding: 16, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 16,
          position: 'relative',
          cursor: 'pointer'
        }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={24} />
          </div>
          <div>
            <strong style={{ fontSize: 15, color: 'var(--text-primary)', display: 'block' }}>Broadcast</strong>
            <Text type="secondary" style={{ fontSize: 13 }}>Send scheduled messages to your audience</Text>
          </div>
          <div style={{ position: 'absolute', top: 12, right: 12, color: 'var(--accent-secondary)' }}>
            <CheckCircle2 size={20} fill="var(--accent-secondary)" color="var(--bg-primary)" />
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div>
        <Text style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 12 }}>
          2. Enter Workflow Name <span style={{ color: 'var(--accent-danger)' }}>*</span>
        </Text>
        <Input 
          size="large"
          placeholder="Enter workflow name"
          value={name}
          onChange={(e) => { if (e.target.value.length <= 50) setName(e.target.value); }}
          onPressEnter={handleCreate}
          style={{ borderRadius: 8, marginBottom: 8 }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Choose a descriptive name to identify this workflow easily</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{name.length} / 50</Text>
        </div>
      </div>
    </Modal>
  );
};

export default CreateWorkflowModal;
