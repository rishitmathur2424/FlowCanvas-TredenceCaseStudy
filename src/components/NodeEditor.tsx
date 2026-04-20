import React from 'react';
import { X, Play, StopCircle, CheckSquare, ThumbsUp, Zap, AlertCircle, AlertTriangle } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import {
  StartNodeForm,
  TaskNodeForm,
  ApprovalNodeForm,
  AutomatedNodeForm,
  EndNodeForm,
} from './forms/NodeForms';
import type { FlowNodeData } from '../types';

const KIND_META = {
  start:     { label: 'Start',     icon: <Play size={13} fill="currentColor" />,  accent: '#16a34a', bg: '#f0fdf4' },
  task:      { label: 'Task',      icon: <CheckSquare size={13} />,               accent: '#2563eb', bg: '#eff6ff' },
  approval:  { label: 'Approval',  icon: <ThumbsUp size={13} />,                  accent: '#d97706', bg: '#fffbeb' },
  automated: { label: 'Automated', icon: <Zap size={13} />,                        accent: '#7c3aed', bg: '#faf5ff' },
  end:       { label: 'End',       icon: <StopCircle size={13} />,                accent: '#dc2626', bg: '#fef2f2' },
};

export function NodeEditor() {
  const { nodes, selectedNodeId, updateNodeData, setSelectedNodeId, deleteNode, validateWorkflow } = useWorkflowStore();

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <aside
        className="w-60 flex-shrink-0 flex flex-col h-full"
        style={{ background: 'var(--panel-bg)', borderLeft: '1px solid var(--border-soft)', transition: 'background 0.25s ease' }}
      >
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'var(--bg-subtle)' }}
            >
              <CheckSquare size={18} style={{ color: 'var(--border-mid)' }} />
            </div>
            <p className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>No node selected</p>
            <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Click any node to edit
            </p>
          </div>
        </div>
      </aside>
    );
  }

  const data = selectedNode.data;
  const meta = KIND_META[data.kind];
  const validation = validateWorkflow();
  const nodeIssues = validation.errors.filter(e => e.nodeId === selectedNode.id);

  const handleChange = (partial: Partial<FlowNodeData>) => {
    updateNodeData(selectedNode.id, partial);
  };

  return (
    <aside
      className="w-60 flex-shrink-0 flex flex-col h-full animate-slide-in-right"
      style={{ background: 'var(--panel-bg)', borderLeft: '1px solid var(--border-soft)', transition: 'background 0.25s ease' }}
    >
      {/* Header */}
      <div
        className="px-3 py-3 flex items-center gap-2.5"
        style={{ borderBottom: '1px solid var(--border-soft)' }}
      >
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: meta.bg, color: meta.accent }}
        >
          {meta.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {meta.label} Node
          </p>
          <p className="text-[10px] font-mono truncate" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
            {selectedNode.id}
          </p>
        </div>
        <button
          onClick={() => setSelectedNodeId(null)}
          className="fc-btn-ghost"
          style={{ padding: 4 }}
        >
          <X size={13} />
        </button>
      </div>

      {/* Validation issues for this node */}
      {nodeIssues.length > 0 && (
        <div
          className="mx-3 mt-3 px-2.5 py-2 rounded-lg space-y-1"
          style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-soft)' }}
        >
          {nodeIssues.map((issue, i) => (
            <div key={i} className="flex items-start gap-1.5">
              {issue.severity === 'error'
                ? <AlertCircle size={11} className="text-red-500 flex-shrink-0 mt-0.5" />
                : <AlertTriangle size={11} className="text-amber-500 flex-shrink-0 mt-0.5" />
              }
              <p className="text-[11px] leading-snug" style={{ color: 'var(--text-secondary)' }}>
                {issue.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Form body */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {data.kind === 'start'     && <StartNodeForm     data={data} onChange={handleChange} />}
        {data.kind === 'task'      && <TaskNodeForm      data={data} onChange={handleChange} />}
        {data.kind === 'approval'  && <ApprovalNodeForm  data={data} onChange={handleChange} />}
        {data.kind === 'automated' && <AutomatedNodeForm data={data} onChange={handleChange} />}
        {data.kind === 'end'       && <EndNodeForm       data={data} onChange={handleChange} />}
      </div>

      {/* Footer */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid var(--border-soft)' }}>
        <button
          onClick={() => deleteNode(selectedNode.id)}
          className="w-full py-2 px-3 rounded-lg text-[12px] font-medium transition-colors"
          style={{
            background: 'transparent',
            border: '1px solid var(--border-soft)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
          onMouseEnter={e => {
            (e.target as HTMLElement).style.background = '#fef2f2';
            (e.target as HTMLElement).style.borderColor = '#fecaca';
            (e.target as HTMLElement).style.color = '#dc2626';
          }}
          onMouseLeave={e => {
            (e.target as HTMLElement).style.background = 'transparent';
            (e.target as HTMLElement).style.borderColor = 'var(--border-soft)';
            (e.target as HTMLElement).style.color = 'var(--text-secondary)';
          }}
        >
          Delete node
        </button>
      </div>
    </aside>
  );
}
