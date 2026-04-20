import type { FlowNode, FlowEdge, WorkflowJSON } from '../types';

export function exportWorkflowJSON(
  nodes: FlowNode[],
  edges: FlowEdge[],
  name: string
): WorkflowJSON {
  return {
    nodes,
    edges,
    metadata: {
      name,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    },
  };
}

export function downloadJSON(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseWorkflowJSON(json: string): WorkflowJSON | null {
  try {
    const data = JSON.parse(json);
    if (!data.nodes || !data.edges || !data.metadata) return null;
    return data as WorkflowJSON;
  } catch {
    return null;
  }
}

export function getNodeColorClass(kind: string): string {
  switch (kind) {
    case 'start': return 'node-start';
    case 'task': return 'node-task';
    case 'approval': return 'node-approval';
    case 'automated': return 'node-automated';
    case 'end': return 'node-end';
    default: return 'node-task';
  }
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
