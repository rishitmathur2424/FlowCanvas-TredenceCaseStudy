import React from 'react';
import { type NodeProps } from 'reactflow';
import { Play, CheckSquare, ThumbsUp, Zap, StopCircle, User, Calendar, Percent } from 'lucide-react';
import { NodeWrapper } from './NodeWrapper';
import type {
  FlowNodeData,
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
} from '../../types';
import { useWorkflowStore } from '../../store/workflowStore';

// ─── Start Node ───────────────────────────────────────────────────────────────

export function StartNode(props: NodeProps<StartNodeData>) {
  const { data } = props;
  return (
    <NodeWrapper
      nodeProps={props as NodeProps<FlowNodeData>}
      config={{
        kind: 'start',
        label: 'Start',
        labelColor: 'text-green-700 dark:text-green-400',
        iconColor: 'text-green-600 dark:text-green-400',
        icon: <Play size={12} fill="currentColor" />,
        showTarget: false,
      }}
    >
      <p className="text-[13px] font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
        {data.title || 'Start'}
      </p>
      {data.metadata.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {data.metadata.slice(0, 2).map(m => (
            <span
              key={m.id}
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}
            >
              {m.key}: {m.value}
            </span>
          ))}
          {data.metadata.length > 2 && (
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              +{data.metadata.length - 2}
            </span>
          )}
        </div>
      )}
    </NodeWrapper>
  );
}

// ─── Task Node ────────────────────────────────────────────────────────────────

export function TaskNode(props: NodeProps<TaskNodeData>) {
  const { data } = props;
  return (
    <NodeWrapper
      nodeProps={props as NodeProps<FlowNodeData>}
      config={{
        kind: 'task',
        label: 'Task',
        labelColor: 'text-blue-700 dark:text-blue-400',
        iconColor: 'text-blue-600 dark:text-blue-400',
        icon: <CheckSquare size={12} />,
      }}
    >
      <p className="text-[13px] font-semibold leading-snug truncate" style={{ color: 'var(--text-primary)' }}>
        {data.title || 'Untitled Task'}
      </p>

      <div className="mt-2 space-y-1.5">
        {data.assignee && (
          <div className="flex items-center gap-1.5">
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
              style={{ background: '#dbeafe', color: '#1d4ed8' }}
            >
              {data.assignee[0]?.toUpperCase()}
            </span>
            <span className="text-[11.5px] truncate" style={{ color: 'var(--text-secondary)' }}>
              {data.assignee}
            </span>
          </div>
        )}
        {data.dueDate && (
          <div className="flex items-center gap-1.5">
            <Calendar size={10} style={{ color: 'var(--text-muted)' }} />
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {new Date(data.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        )}
      </div>
    </NodeWrapper>
  );
}

// ─── Approval Node ────────────────────────────────────────────────────────────

export function ApprovalNode(props: NodeProps<ApprovalNodeData>) {
  const { data } = props;
  return (
    <NodeWrapper
      nodeProps={props as NodeProps<FlowNodeData>}
      config={{
        kind: 'approval',
        label: 'Approval',
        labelColor: 'text-amber-700 dark:text-amber-400',
        iconColor: 'text-amber-600 dark:text-amber-400',
        icon: <ThumbsUp size={12} />,
      }}
    >
      <p className="text-[13px] font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
        {data.title || 'Approval'}
      </p>
      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
        <span
          className="flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-full font-medium"
          style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}
        >
          <User size={9} />
          {data.approverRole}
        </span>
        {data.autoApproveThreshold > 0 && (
          <span
            className="flex items-center gap-0.5 text-[10.5px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}
          >
            <Percent size={8} />
            {data.autoApproveThreshold} auto
          </span>
        )}
      </div>
    </NodeWrapper>
  );
}

// ─── Automated Node ───────────────────────────────────────────────────────────

export function AutomatedNode(props: NodeProps<AutomatedNodeData>) {
  const { data } = props;
  const paramCount = Object.keys(data.params ?? {}).length;
  return (
    <NodeWrapper
      nodeProps={props as NodeProps<FlowNodeData>}
      config={{
        kind: 'automated',
        label: 'Automated',
        labelColor: 'text-purple-700 dark:text-purple-400',
        iconColor: 'text-purple-600 dark:text-purple-400',
        icon: <Zap size={12} />,
      }}
    >
      <p className="text-[13px] font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
        {data.title || 'Automated Step'}
      </p>
      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
        {data.actionId ? (
          <span
            className="text-[10.5px] px-1.5 py-0.5 rounded font-mono font-medium"
            style={{ background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}
          >
            {data.actionId.replace(/_/g, ' ')}
          </span>
        ) : (
          <span className="text-[11px] italic" style={{ color: 'var(--text-muted)' }}>No action</span>
        )}
        {paramCount > 0 && (
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {paramCount}p
          </span>
        )}
      </div>
    </NodeWrapper>
  );
}

// ─── End Node ─────────────────────────────────────────────────────────────────

export function EndNode(props: NodeProps<EndNodeData>) {
  const { data } = props;
  const nodes = useWorkflowStore(s => s.nodes);
  const edges = useWorkflowStore(s => s.edges);

  // Build a real workflow summary from the graph
  const summary = (() => {
    if (!data.showSummary) return null;
    const counts = { task: 0, approval: 0, automated: 0 };
    for (const n of nodes) {
      if (n.data.kind === 'task') counts.task++;
      else if (n.data.kind === 'approval') counts.approval++;
      else if (n.data.kind === 'automated') counts.automated++;
    }
    const parts: string[] = [];
    if (counts.task > 0) parts.push(`${counts.task} task${counts.task !== 1 ? 's' : ''}`);
    if (counts.approval > 0) parts.push(`${counts.approval} approval${counts.approval !== 1 ? 's' : ''}`);
    if (counts.automated > 0) parts.push(`${counts.automated} automated`);
    return {
      steps: parts.join(' · ') || 'No steps',
      connections: edges.length,
    };
  })();

  return (
    <NodeWrapper
      nodeProps={props as NodeProps<FlowNodeData>}
      config={{
        kind: 'end',
        label: 'End',
        labelColor: 'text-red-700 dark:text-red-400',
        iconColor: 'text-red-600 dark:text-red-400',
        icon: <StopCircle size={12} />,
        showSource: false,
      }}
    >
      <p className="text-[13px] font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
        {data.endMessage || 'Workflow complete'}
      </p>
      {summary && (
        <div
          style={{
            marginTop: 8,
            padding: '6px 8px',
            borderRadius: 6,
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.15)',
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#dc2626', marginBottom: 3, opacity: 0.8 }}>
            Summary
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            {summary.steps}
          </p>
          <p style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>
            {summary.connections} connection{summary.connections !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </NodeWrapper>
  );
}
