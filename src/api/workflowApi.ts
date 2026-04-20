import type {
  AutomationAction,
  FlowNode,
  FlowEdge,
  SimulationResult,
  SimulationStep,
} from '../types';

const MOCK_AUTOMATIONS: AutomationAction[] = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
  { id: 'create_ticket', label: 'Create JIRA Ticket', params: ['project', 'summary', 'priority'] },
  { id: 'slack_notify', label: 'Send Slack Notification', params: ['channel', 'message'] },
  { id: 'update_hris', label: 'Update HRIS Record', params: ['employeeId', 'field', 'value'] },
  { id: 'schedule_meeting', label: 'Schedule Meeting', params: ['attendees', 'duration', 'agenda'] },
  { id: 'assign_training', label: 'Assign Training Module', params: ['employeeId', 'courseId'] },
  { id: 'provision_access', label: 'Provision System Access', params: ['userId', 'system', 'role'] },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getAutomations(): Promise<AutomationAction[]> {
  await delay(150);
  return MOCK_AUTOMATIONS;
}

export async function simulateWorkflow(
  nodes: FlowNode[],
  edges: FlowEdge[]
): Promise<SimulationResult> {
  await delay(600);

  const steps: SimulationStep[] = [];
  const errors: string[] = [];
  const startTime = Date.now();

  // Build adjacency and in-degree maps
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const node of nodes) {
    adjacency.set(node.id, []);
    inDegree.set(node.id, 0);
  }
  for (const edge of edges) {
    adjacency.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  const startNode = nodes.find(n => n.data.kind === 'start');
  if (!startNode) {
    errors.push('No Start node found in workflow.');
    return { success: false, duration: Date.now() - startTime, steps, errors };
  }

  // Real cycle detection via DFS coloring (separate from traversal)
  if (detectCycle(nodes, adjacency)) {
    errors.push('Cycle detected in workflow — circular connections are not allowed.');
    return { success: false, duration: Date.now() - startTime, steps, errors };
  }

  // Kahn's algorithm BFS from start node only.
  // A node is only processed once ALL its predecessors have been processed.
  // This correctly handles diamond/fan-in patterns without false cycle reports.
  const processed = new Set<string>();
  const pendingDegree = new Map(inDegree); // mutable copy
  const queue: string[] = [startNode.id];
  pendingDegree.set(startNode.id, 0); // start has no predecessors to wait for

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    if (processed.has(nodeId)) continue;

    // Only process when all predecessors are done
    if ((pendingDegree.get(nodeId) ?? 0) > 0) {
      queue.push(nodeId); // re-queue until ready
      continue;
    }

    processed.add(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (!node) continue;

    steps.push(simulateNode(node));

    for (const succId of adjacency.get(nodeId) ?? []) {
      const newDeg = (pendingDegree.get(succId) ?? 1) - 1;
      pendingDegree.set(succId, newDeg);
      if (!processed.has(succId)) queue.push(succId);
    }
  }

  // Nodes that were never reached from start
  for (const node of nodes) {
    if (!processed.has(node.id)) {
      errors.push(`"${getNodeTitle(node)}" is not reachable from the Start node.`);
    }
  }

  // Collect simulation-level errors (e.g. automated node with no action)
  for (const step of steps) {
    if (step.status === 'error') errors.push(step.message);
  }

  return {
    success: errors.length === 0,
    duration: Date.now() - startTime,
    steps,
    errors,
  };
}

// DFS-based cycle detection — completely separate from simulation traversal
function detectCycle(nodes: FlowNode[], adjacency: Map<string, string[]>): boolean {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();
  for (const n of nodes) color.set(n.id, WHITE);

  function dfs(id: string): boolean {
    color.set(id, GRAY);
    for (const neighbor of adjacency.get(id) ?? []) {
      const c = color.get(neighbor);
      if (c === GRAY) return true;
      if (c === WHITE && dfs(neighbor)) return true;
    }
    color.set(id, BLACK);
    return false;
  }

  for (const n of nodes) {
    if (color.get(n.id) === WHITE && dfs(n.id)) return true;
  }
  return false;
}

function getNodeTitle(node: FlowNode): string {
  const d = node.data;
  if (d.kind === 'end') return 'End';
  if ('title' in d) return (d as { title?: string }).title || node.id;
  return node.id;
}

function simulateNode(node: FlowNode): SimulationStep {
  const base = { nodeId: node.id, nodeKind: node.data.kind, timestamp: Date.now() };

  switch (node.data.kind) {
    case 'start':
      return { ...base, nodeTitle: node.data.title || 'Start', status: 'success',
        message: `Workflow started: "${node.data.title || 'Untitled'}"` };

    case 'task': {
      const missing = !node.data.title?.trim();
      return { ...base, nodeTitle: node.data.title || 'Unnamed Task',
        status: missing ? 'warning' : 'success',
        message: missing
          ? 'Task has no title — proceeding with caution.'
          : `Task "${node.data.title}" assigned to ${node.data.assignee || 'Unassigned'}.${node.data.dueDate ? ` Due: ${node.data.dueDate}` : ''}` };
    }

    case 'approval': {
      const autoApproved = (node.data.autoApproveThreshold ?? 0) > 0
        && Math.random() * 100 < node.data.autoApproveThreshold;
      return { ...base, nodeTitle: node.data.title || 'Approval', status: 'success',
        message: autoApproved
          ? `Auto-approved by threshold (${node.data.autoApproveThreshold}%). Role: ${node.data.approverRole}.`
          : `Approval request sent to ${node.data.approverRole}. Awaiting decision.` };
    }

    case 'automated': {
      const hasAction = !!node.data.actionId;
      return { ...base, nodeTitle: node.data.title || 'Automated Step',
        status: hasAction ? 'success' : 'error',
        message: hasAction
          ? `Action "${node.data.actionId}" executed with ${Object.keys(node.data.params ?? {}).length} parameter(s).`
          : 'No action selected for automated step.' };
    }

    case 'end':
      return { ...base, nodeTitle: 'End', status: 'success',
        message: node.data.endMessage || 'Workflow completed successfully.' };

    default:
      return { ...base, nodeTitle: 'Unknown', status: 'warning',
        message: 'Unknown node type encountered.' };
  }
}
