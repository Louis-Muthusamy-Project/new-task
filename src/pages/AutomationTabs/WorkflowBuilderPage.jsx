import React, { useState, useCallback, useRef, useMemo } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button, Typography } from "antd";
import {
  ArrowLeft,
  Pencil,
  BookOpen,
  CheckCircle2,
  FlaskConical,
  X,
  Save,
  Zap,
  MessageSquare,
  Timer,
  GitBranch,
  Split,
  CircleSlash,
  Play,
} from "lucide-react";
import "./WorkflowBuilder.css";

const { Text } = Typography;

/* ─────────────────────────────────────────────
   PANEL DEFINITION
───────────────────────────────────────────── */
const PANEL_SECTIONS = [
  {
    section: "Triggers",
    desc: "Start your workflow",
    Icon: Zap,
    nodes: [
      { type: "triggerNode", label: "Workflow Trigger", desc: "Start point for your automation", Icon: Play, colorClass: "blue" },
    ],
  },
  {
    section: "Actions",
    desc: "Send messages to users",
    Icon: MessageSquare,
    nodes: [
      { type: "messageNode", label: "Send Message", desc: "Send text, template, or interactive message", Icon: MessageSquare, colorClass: "green" },
    ],
  },
  {
    section: "Logic & Control",
    desc: "Add timing and conditions",
    Icon: GitBranch,
    nodes: [
      { type: "waitNode",   label: "Wait/Delay",        desc: "Pause workflow for specified time",  Icon: Timer,     colorClass: "orange" },
      { type: "branchNode", label: "Conditional Branch", desc: "Split flow based on conditions",     Icon: GitBranch, colorClass: "purple" },
      { type: "splitNode",  label: "Split Paths",        desc: "Create multiple parallel paths",     Icon: Split,     colorClass: "cyan"   },
    ],
  },
  {
    section: "End Points",
    desc: "Complete your workflow",
    Icon: CircleSlash,
    nodes: [
      { type: "endNode", label: "End Workflow", desc: "Mark workflow completion", Icon: CircleSlash, colorClass: "red" },
    ],
  },
];

/* ─────────────────────────────────────────────
   CUSTOM NODE COMPONENTS
───────────────────────────────────────────── */
const NodeWrapper = ({ children, borderColor, className = "" }) => (
  <div className={`rf-node ${className}`} style={{ borderColor, background: 'var(--bg-primary)', boxShadow: 'var(--shadow-sm)' }}>
    {children}
  </div>
);

const TriggerNode = ({ data }) => (
  <NodeWrapper borderColor="#3b82f6" className="rf-node--trigger">
    <Handle type="source" position={Position.Bottom} className="rf-handle" />
    <div className="rf-node-header">
      <span className="rf-node-icon rf-node-icon--blue"><Play size={13} strokeWidth={2} color="#2563eb" /></span>
      <span className="rf-node-badge" style={{ color: "#3b82f6" }}>TRIGGER</span>
    </div>
    <div className="rf-node-body">
      <span className="rf-node-type-chip">Broadcast</span>
      <div className="rf-node-text" style={{ color: 'var(--text-primary)' }}>*Trigger node – {data.label}</div>
    </div>
  </NodeWrapper>
);

const MessageNode = ({ data }) => (
  <NodeWrapper borderColor="#10b981" className="rf-node--message">
    <Handle type="target" position={Position.Top} className="rf-handle" />
    <Handle type="source" position={Position.Bottom} className="rf-handle" />
    <div className="rf-node-header">
      <span className="rf-node-icon rf-node-icon--green"><MessageSquare size={13} strokeWidth={2} color="#10b981" /></span>
      <span className="rf-node-badge" style={{ color: "#10b981" }}>SEND MESSAGE</span>
    </div>
    <div className="rf-node-body">
      <div className="rf-node-subtitle" style={{ color: 'var(--text-secondary)' }}>Template</div>
      <div className="rf-node-text" style={{ color: 'var(--text-primary)' }}>{data.label}</div>
    </div>
  </NodeWrapper>
);

const WaitNode = ({ data }) => (
  <NodeWrapper borderColor="#f59e0b" className="rf-node--wait">
    <Handle type="target" position={Position.Top} className="rf-handle" />
    <Handle type="source" position={Position.Bottom} className="rf-handle" />
    <div className="rf-node-header">
      <span className="rf-node-icon rf-node-icon--orange"><Timer size={13} strokeWidth={2} color="#f59e0b" /></span>
      <span className="rf-node-badge" style={{ color: "#f59e0b" }}>WAIT</span>
      <span className="rf-wait-tag" style={{ color: '#f59e0b' }}>5m</span>
    </div>
    <div className="rf-node-body">
      <div className="rf-wait-inputs">
        {["Days", "Hours", "Min"].map((u, i) => (
          <div key={u} className="rf-wait-col">
            <input className="rf-wait-input" style={{ color: 'var(--text-primary)', background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }} type="number" defaultValue={i === 2 ? 5 : 0} min={0} />
            <label className="rf-wait-label" style={{ color: 'var(--text-secondary)' }}>{u}</label>
          </div>
        ))}
      </div>
    </div>
  </NodeWrapper>
);

const BranchNode = ({ data }) => (
  <NodeWrapper borderColor="#8b5cf6" className="rf-node--branch">
    <Handle type="target" position={Position.Top} className="rf-handle" />
    <Handle type="source" position={Position.Bottom} id="yes" className="rf-handle rf-handle--left" style={{ left: "30%" }} />
    <Handle type="source" position={Position.Bottom} id="no"  className="rf-handle rf-handle--right" style={{ left: "70%" }} />
    <div className="rf-node-header">
      <span className="rf-node-icon rf-node-icon--purple"><GitBranch size={13} strokeWidth={2} color="#8b5cf6" /></span>
      <span className="rf-node-badge" style={{ color: "#8b5cf6" }}>CONDITION</span>
    </div>
    <div className="rf-node-body">
      <div className="rf-node-text" style={{ color: 'var(--text-primary)' }}>{data.label}</div>
    </div>
  </NodeWrapper>
);

const SplitNode = ({ data }) => (
  <NodeWrapper borderColor="#06b6d4" className="rf-node--split">
    <Handle type="target" position={Position.Top} className="rf-handle" />
    <Handle type="source" position={Position.Bottom} className="rf-handle" />
    <div className="rf-node-header">
      <span className="rf-node-icon rf-node-icon--cyan"><Split size={13} strokeWidth={2} color="#06b6d4" /></span>
      <span className="rf-node-badge" style={{ color: "#06b6d4" }}>SPLIT PATHS</span>
    </div>
    <div className="rf-node-body">
      <div className="rf-node-text" style={{ color: 'var(--text-primary)' }}>{data.label}</div>
    </div>
  </NodeWrapper>
);

const EndNode = ({ data }) => (
  <NodeWrapper borderColor="#ef4444" className="rf-node--end">
    <Handle type="target" position={Position.Top} className="rf-handle" />
    <div className="rf-node-header">
      <span className="rf-node-icon rf-node-icon--red"><CircleSlash size={13} strokeWidth={2} color="#ef4444" /></span>
      <span className="rf-node-badge" style={{ color: "#ef4444" }}>END WORKFLOW</span>
    </div>
    <div className="rf-node-body">
      <div className="rf-node-text" style={{ color: 'var(--text-primary)' }}>Workflow completed</div>
    </div>
  </NodeWrapper>
);

/* Node type registry */
const NODE_TYPES = {
  triggerNode: TriggerNode,
  messageNode: MessageNode,
  waitNode:    WaitNode,
  branchNode:  BranchNode,
  splitNode:   SplitNode,
  endNode:     EndNode,
};

/* ─────────────────────────────────────────────
   INITIAL NODES & EDGES
───────────────────────────────────────────── */
const INITIAL_NODES = [
  { id: "1", type: "triggerNode", position: { x: 200, y: 50  }, data: { label: "Broadcast" } },
  { id: "2", type: "waitNode",    position: { x: 200, y: 220 }, data: { label: "Wait 5m" } },
  { id: "3", type: "messageNode", position: { x: 200, y: 400 }, data: { label: "This is from ASKEVAI" } },
  { id: "4", type: "endNode",     position: { x: 200, y: 550 }, data: { label: "End" } },
];

const INITIAL_EDGES = [
  { id: "e1-2", source: "1", target: "2", type: "smoothstep", animated: true, style: { stroke: "var(--accent-secondary)", strokeWidth: 2, strokeDasharray: "5,5" } },
  { id: "e2-3", source: "2", target: "3", type: "smoothstep", animated: true, style: { stroke: "var(--accent-secondary)", strokeWidth: 2, strokeDasharray: "5,5" } },
  { id: "e3-4", source: "3", target: "4", type: "smoothstep", animated: true, style: { stroke: "var(--accent-secondary)", strokeWidth: 2, strokeDasharray: "5,5" } },
];

/* ─────────────────────────────────────────────
   MAIN BUILDER COMPONENT
───────────────────────────────────────────── */
let nodeIdCounter = 10;
const getNewId = () => `n${++nodeIdCounter}`;

const WorkflowBuilderInner = ({ workflow, onClose }) => {
  const [workflowName, setWorkflowName] = useState(workflow?.name || "new-campaign");
  const [editingName,  setEditingName]  = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const reactFlowWrapper = useRef(null);
  const [rfInstance, setRfInstance]      = useState(null);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          { ...params, type: "smoothstep", animated: true, style: { stroke: "var(--accent-secondary)", strokeWidth: 2, strokeDasharray: "5,5" } },
          eds
        )
      ),
    [setEdges]
  );

  /* ── Drag from panel ── */
  const onDragStart = (e, nodeType, label) => {
    e.dataTransfer.setData("application/reactflow-type",  nodeType);
    e.dataTransfer.setData("application/reactflow-label", label);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      if (!rfInstance || !reactFlowWrapper.current) return;

      const type  = e.dataTransfer.getData("application/reactflow-type");
      const label = e.dataTransfer.getData("application/reactflow-label");
      if (!type) return;

      const bounds   = reactFlowWrapper.current.getBoundingClientRect();
      const position = rfInstance.screenToFlowPosition({
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      });

      setNodes((nds) => [
        ...nds,
        {
          id:       getNewId(),
          type,
          position,
          data: { label },
        },
      ]);
    },
    [rfInstance, setNodes]
  );

  const nodeTypes = useMemo(() => NODE_TYPES, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-primary)' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button icon={<ArrowLeft size={16} />} onClick={onClose} style={{ border: 'none', background: 'transparent', boxShadow: 'none' }} />
          
          {editingName ? (
            <input
              style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '4px 8px', borderRadius: 4, fontWeight: 700, fontSize: 16 }}
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              onBlur={() => setEditingName(false)}
              autoFocus
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong style={{ fontSize: 16, color: 'var(--text-primary)' }}>{workflowName}</strong>
              <Button type="text" size="small" icon={<Pencil size={14} color="var(--text-secondary)" />} onClick={() => setEditingName(true)} />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<BookOpen size={14} />} style={{ fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Drip Flow Guide</Button>
          <Button icon={<CheckCircle2 size={14} />} style={{ fontWeight: 600, borderColor: '#10b981', color: '#10b981' }}>Validate Flow</Button>
          <Button icon={<FlaskConical size={14} />} style={{ fontWeight: 600, borderColor: '#f59e0b', color: '#f59e0b' }}>Test Workflow</Button>
          <Button icon={<X size={14} />} style={{ fontWeight: 600, borderColor: '#ef4444', color: '#ef4444' }} onClick={onClose}>Cancel</Button>
          <Button type="primary" style={{ fontWeight: 600, background: 'var(--accent-secondary)' }}>Update</Button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left panel */}
        <aside style={{ width: 260, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {PANEL_SECTIONS.map(({ section, desc, Icon, nodes: panelNodes }) => (
            <div key={section} style={{ padding: '20px 16px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Icon size={14} color="var(--text-secondary)" />
                <strong style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: 1 }}>{section}</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {panelNodes.map(({ type, label, desc: nd, Icon: NIcon, colorClass }) => {
                  let badgeColor;
                  if (colorClass === 'blue') badgeColor = '#3b82f6';
                  if (colorClass === 'green') badgeColor = '#10b981';
                  if (colorClass === 'orange') badgeColor = '#f59e0b';
                  if (colorClass === 'purple') badgeColor = '#8b5cf6';
                  if (colorClass === 'cyan') badgeColor = '#06b6d4';
                  if (colorClass === 'red') badgeColor = '#ef4444';

                  return (
                    <div
                      key={type}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 12, 
                        background: 'var(--bg-primary)', 
                        padding: 12, 
                        borderRadius: 8, 
                        border: '1px solid var(--border-color)',
                        cursor: 'grab'
                      }}
                      draggable
                      onDragStart={(e) => onDragStart(e, type, label)}
                    >
                      <div style={{ background: `${badgeColor}15`, width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: badgeColor, flexShrink: 0 }}>
                        <NIcon size={16} />
                      </div>
                      <div>
                        <strong style={{ fontSize: 13, color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>{label}</strong>
                        <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.2 }}>{nd}</Text>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        {/* Canvas */}
        <div style={{ flex: 1, position: 'relative' }} ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setRfInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={{
              type: "smoothstep",
              animated: true,
              style: { stroke: "var(--accent-secondary)", strokeWidth: 2, strokeDasharray: "5,5" },
            }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1.5}
              color="var(--text-tertiary)"
            />
            <Controls showInteractive={false} style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden' }} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

const WorkflowBuilderPage = (props) => (
  <ReactFlowProvider>
    <WorkflowBuilderInner {...props} />
  </ReactFlowProvider>
);

export default WorkflowBuilderPage;
