// ─── Node Data Types ────────────────────────────────────────────────────────

export type NodeKind = 'start' | 'task' | 'approval' | 'automated' | 'end';

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
}

export interface StartNodeData {
  kind: 'start';
  title: string;
  metadata: KeyValuePair[];
}

export interface TaskNodeData {
  kind: 'task';
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: KeyValuePair[];
}

export interface ApprovalNodeData {
  kind: 'approval';
  title: string;
  approverRole: 'Manager' | 'HR' | 'Director' | 'CEO' | 'Team Lead';
  autoApproveThreshold: number;
}

export interface AutomatedNodeData {
  kind: 'automated';
  title: string;
  actionId: string;
  params: Record<string, string>;
}

export interface EndNodeData {
  kind: 'end';
  endMessage: string;
  showSummary: boolean;
}

export type FlowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData;

// ─── React Flow Types ────────────────────────────────────────────────────────

import type { Node, Edge } from 'reactflow';

export type FlowNode = Node<FlowNodeData>;
export type FlowEdge = Edge;

// ─── Mock API Types ──────────────────────────────────────────────────────────

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

export interface SimulationStep {
  nodeId: string;
  nodeTitle: string;
  nodeKind: NodeKind;
  status: 'success' | 'warning' | 'error' | 'skipped';
  message: string;
  timestamp: number;
}

export interface SimulationResult {
  success: boolean;
  duration: number;
  steps: SimulationStep[];
  errors: string[];
}

export interface WorkflowJSON {
  nodes: FlowNode[];
  edges: FlowEdge[];
  metadata: {
    name: string;
    exportedAt: string;
    version: string;
  };
}

// ─── Validation Types ────────────────────────────────────────────────────────

export interface ValidationError {
  nodeId?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
