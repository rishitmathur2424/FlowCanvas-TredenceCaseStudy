import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Trash2, AlertCircle, AlertTriangle } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import type { FlowNodeData, NodeKind } from '../../types';

interface NodeConfig {
  kind: NodeKind;
  label: string;
  labelColor: string;
  iconColor: string;
  icon: React.ReactNode;
  showSource?: boolean;
  showTarget?: boolean;
}

interface NodeWrapperProps {
  nodeProps: NodeProps<FlowNodeData>;
  config: NodeConfig;
  children: React.ReactNode;
}

export function NodeWrapper({ nodeProps, config, children }: NodeWrapperProps) {
  const { id, selected } = nodeProps;
  const deleteNode = useWorkflowStore(s => s.deleteNode);
  const setSelectedNodeId = useWorkflowStore(s => s.setSelectedNodeId);
  const activeSimNodeId = useWorkflowStore(s => s.activeSimNodeId);
  const validateWorkflow = useWorkflowStore(s => s.validateWorkflow);

  const showSource = config.showSource !== false;
  const showTarget = config.showTarget !== false;

  // Get validation state for this node
  const validation = validateWorkflow();
  const nodeErrors = validation.errors.filter(e => e.nodeId === id && e.severity === 'error');
  const nodeWarnings = validation.errors.filter(e => e.nodeId === id && e.severity === 'warning');
  const hasError = nodeErrors.length > 0;
  const hasWarning = nodeWarnings.length > 0 && !hasError;

  const isSimActive = activeSimNodeId === id;

  let shadowClass = '';
  if (isSimActive) shadowClass = 'node-selected';
  else if (selected) shadowClass = 'node-selected';
  else if (hasError) shadowClass = 'node-error';
  else if (hasWarning) shadowClass = 'node-warning';

  return (
    <div
      className={`flow-node node-border-${config.kind} ${shadowClass}`}
      onClick={() => setSelectedNodeId(id)}
      title={hasError ? nodeErrors[0]?.message : hasWarning ? nodeWarnings[0]?.message : undefined}
    >
      {/* Header band */}
      <div className={`node-header node-header-${config.kind}`}>
        <span className={config.iconColor}>{config.icon}</span>
        <span className={`text-[10.5px] font-semibold tracking-wide uppercase ${config.labelColor}`}>
          {config.label}
        </span>
        {isSimActive && (
          <span className="ml-auto flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Running</span>
          </span>
        )}
      </div>

      {/* Body */}
      <div className="node-body">
        {children}
      </div>

      {/* Validation badge */}
      {(hasError || hasWarning) && (
        <div
          className={`node-validation-badge ${hasError ? 'bg-red-500' : 'bg-amber-400'}`}
          title={hasError ? nodeErrors[0]?.message : nodeWarnings[0]?.message}
        >
          {hasError
            ? <AlertCircle size={10} strokeWidth={2.5} className="text-white" />
            : <AlertTriangle size={10} strokeWidth={2.5} className="text-white" />
          }
        </div>
      )}

      {/* Delete button */}
      <button
        className="node-delete-btn"
        onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
        title="Delete node"
      >
        <Trash2 size={9} strokeWidth={2.5} />
      </button>

      {/* Handles */}
      {showTarget && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: 'var(--border-strong)', borderColor: 'var(--node-bg)' }}
        />
      )}
      {showSource && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: 'var(--border-strong)', borderColor: 'var(--node-bg)' }}
        />
      )}
    </div>
  );
}
