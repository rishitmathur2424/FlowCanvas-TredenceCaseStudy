import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from 'reactflow';
import { nanoid } from 'nanoid';
import type {
  FlowNode,
  FlowEdge,
  FlowNodeData,
  NodeKind,
  SimulationResult,
  ValidationResult,
  ValidationError,
} from '../types';

// ─── Default node data factories ─────────────────────────────────────────────

export function createDefaultNodeData(kind: NodeKind): FlowNodeData {
  switch (kind) {
    case 'start':
      return { kind: 'start', title: 'Start', metadata: [] };
    case 'task':
      return { kind: 'task', title: 'New Task', description: '', assignee: '', dueDate: '', customFields: [] };
    case 'approval':
      return { kind: 'approval', title: 'Approval', approverRole: 'Manager', autoApproveThreshold: 0 };
    case 'automated':
      return { kind: 'automated', title: 'Automated Step', actionId: '', params: {} };
    case 'end':
      return { kind: 'end', endMessage: 'Workflow complete.', showSummary: true };
  }
}

// ─── Store Types ──────────────────────────────────────────────────────────────

interface HistoryEntry {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

interface WorkflowState {
  nodes: FlowNode[];
  edges: FlowEdge[];
  selectedNodeId: string | null;
  activeSimNodeId: string | null;
  simulationResult: SimulationResult | null;
  isSimulating: boolean;
  workflowName: string;
  history: HistoryEntry[];
  historyIndex: number;

  // Actions
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (kind: NodeKind, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<FlowNodeData>) => void;
  setSelectedNodeId: (id: string | null) => void;
  setActiveSimNodeId: (id: string | null) => void;
  deleteNode: (id: string) => void;
  setSimulationResult: (result: SimulationResult | null) => void;
  setIsSimulating: (v: boolean) => void;
  setWorkflowName: (name: string) => void;
  importWorkflow: (nodes: FlowNode[], edges: FlowEdge[], name?: string) => void;
  resetWorkflow: () => void;
  undo: () => void;
  redo: () => void;
  validateWorkflow: () => ValidationResult;
  pushHistory: () => void;
}

// ─── Initial Nodes ────────────────────────────────────────────────────────────

const INITIAL_NODES: FlowNode[] = [
  {
    id: 'start-1',
    type: 'start',
    position: { x: 100, y: 200 },
    data: { kind: 'start', title: 'Onboarding Start', metadata: [{ id: 'k1', key: 'department', value: 'Engineering' }] },
  },
  {
    id: 'task-1',
    type: 'task',
    position: { x: 380, y: 120 },
    data: { kind: 'task', title: 'Send Welcome Email', description: 'Send a welcome email to new hire.', assignee: 'HR Team', dueDate: '2024-09-01', customFields: [] },
  },
  {
    id: 'approval-1',
    type: 'approval',
    position: { x: 380, y: 280 },
    data: { kind: 'approval', title: 'Manager Approval', approverRole: 'Manager', autoApproveThreshold: 80 },
  },
  {
    id: 'automated-1',
    type: 'automated',
    position: { x: 660, y: 200 },
    data: { kind: 'automated', title: 'Provision Access', actionId: 'provision_access', params: { userId: 'new_hire', system: 'GitHub', role: 'developer' } },
  },
  {
    id: 'end-1',
    type: 'end',
    position: { x: 940, y: 200 },
    data: { kind: 'end', endMessage: 'Onboarding complete! Welcome aboard.', showSummary: true },
  },
];

const INITIAL_EDGES: FlowEdge[] = [
  { id: 'e1', source: 'start-1', target: 'task-1', animated: true },
  { id: 'e2', source: 'start-1', target: 'approval-1', animated: true },
  { id: 'e3', source: 'task-1', target: 'automated-1' },
  { id: 'e4', source: 'approval-1', target: 'automated-1' },
  { id: 'e5', source: 'automated-1', target: 'end-1' },
];

// ─── Store ────────────────────────────────────────────────────────────────────

export const useWorkflowStore = create<WorkflowState>()(
  immer((set, get) => ({
    nodes: INITIAL_NODES,
    edges: INITIAL_EDGES,
    selectedNodeId: null,
    activeSimNodeId: null,
    simulationResult: null,
    isSimulating: false,
    workflowName: 'Onboarding Flow',
    history: [],
    historyIndex: -1,

    pushHistory: () => {
      set(state => {
        const entry: HistoryEntry = {
          nodes: JSON.parse(JSON.stringify(state.nodes)),
          edges: JSON.parse(JSON.stringify(state.edges)),
        };
        const trimmed = state.history.slice(0, state.historyIndex + 1);
        state.history = [...trimmed, entry].slice(-50);
        state.historyIndex = state.history.length - 1;
      });
    },

    onNodesChange: (changes) => {
      set(state => {
        state.nodes = applyNodeChanges(changes, state.nodes) as FlowNode[];
      });
    },

    onEdgesChange: (changes) => {
      set(state => {
        state.edges = applyEdgeChanges(changes, state.edges) as FlowEdge[];
      });
    },

    onConnect: (connection) => {
      get().pushHistory();
      set(state => {
        state.edges = addEdge(
          { ...connection, id: `e-${nanoid(6)}`, animated: false },
          state.edges
        ) as FlowEdge[];
      });
    },

    addNode: (kind, position) => {
      get().pushHistory();
      set(state => {
        const id = `${kind}-${nanoid(6)}`;
        const newNode: FlowNode = {
          id,
          type: kind,
          position,
          data: createDefaultNodeData(kind),
        };
        state.nodes.push(newNode);
        state.selectedNodeId = id;
      });
    },

    updateNodeData: (nodeId, data) => {
      set(state => {
        const node = state.nodes.find(n => n.id === nodeId);
        if (node) {
          Object.assign(node.data, data);
        }
      });
    },

    setActiveSimNodeId: (id) => {
      set(state => { state.activeSimNodeId = id; });
    },

    setSelectedNodeId: (id) => {
      set(state => { state.selectedNodeId = id; });
    },

    deleteNode: (id) => {
      get().pushHistory();
      set(state => {
        state.nodes = state.nodes.filter(n => n.id !== id);
        state.edges = state.edges.filter(e => e.source !== id && e.target !== id);
        if (state.selectedNodeId === id) state.selectedNodeId = null;
      });
    },

    setSimulationResult: (result) => {
      set(state => { state.simulationResult = result; });
    },

    setIsSimulating: (v) => {
      set(state => { state.isSimulating = v; });
    },

    setWorkflowName: (name) => {
      set(state => { state.workflowName = name; });
    },

    importWorkflow: (nodes, edges, name) => {
      get().pushHistory();
      set(state => {
        state.nodes = nodes;
        state.edges = edges;
        if (name) state.workflowName = name;
        state.selectedNodeId = null;
        state.simulationResult = null;
      });
    },

    resetWorkflow: () => {
      get().pushHistory();
      set(state => {
        state.nodes = [];
        state.edges = [];
        state.selectedNodeId = null;
        state.simulationResult = null;
      });
    },

    undo: () => {
      const { historyIndex, history } = get();
      if (historyIndex <= 0) return;
      set(state => {
        const prev = history[historyIndex - 1];
        state.nodes = prev.nodes;
        state.edges = prev.edges;
        state.historyIndex = historyIndex - 1;
        state.selectedNodeId = null;
      });
    },

    redo: () => {
      const { historyIndex, history } = get();
      if (historyIndex >= history.length - 1) return;
      set(state => {
        const next = history[historyIndex + 1];
        state.nodes = next.nodes;
        state.edges = next.edges;
        state.historyIndex = historyIndex + 1;
      });
    },

    validateWorkflow: () => {
      const { nodes, edges } = get();
      const errors: ValidationError[] = [];

      if (nodes.length === 0) {
        errors.push({ message: 'Canvas is empty. Add nodes to build a workflow.', severity: 'error' });
        return { valid: false, errors };
      }

      const startNodes = nodes.filter(n => n.data.kind === 'start');
      const endNodes   = nodes.filter(n => n.data.kind === 'end');

      // ── Rule 1: Exactly one Start ──────────────────────────────────────────
      if (startNodes.length === 0) {
        errors.push({ message: 'Workflow must have exactly one Start node.', severity: 'error' });
      } else if (startNodes.length > 1) {
        errors.push({ message: `Found ${startNodes.length} Start nodes — only one is allowed.`, severity: 'error' });
        startNodes.slice(1).forEach(n =>
          errors.push({ nodeId: n.id, message: 'Only one Start node is allowed.', severity: 'error' })
        );
      }

      // ── Rule 2: At least one End ───────────────────────────────────────────
      if (endNodes.length === 0) {
        errors.push({ message: 'Workflow must have at least one End node.', severity: 'error' });
      }

      // Early exit — graph algorithms need start + end to be meaningful
      if (startNodes.length !== 1 || endNodes.length === 0) {
        return { valid: false, errors };
      }

      const startNode = startNodes[0];

      // ── Build adjacency maps ───────────────────────────────────────────────
      const forward  = new Map<string, string[]>(); // node → successors
      const backward = new Map<string, string[]>(); // node → predecessors
      for (const n of nodes) { forward.set(n.id, []); backward.set(n.id, []); }
      for (const e of edges) {
        forward.get(e.source)?.push(e.target);
        backward.get(e.target)?.push(e.source);
      }

      // ── BFS helper ────────────────────────────────────────────────────────
      const bfs = (starts: string[], adj: Map<string, string[]>): Set<string> => {
        const visited = new Set<string>();
        const queue = [...starts];
        while (queue.length > 0) {
          const id = queue.shift()!;
          if (visited.has(id)) continue;
          visited.add(id);
          for (const next of adj.get(id) ?? []) {
            if (!visited.has(next)) queue.push(next);
          }
        }
        return visited;
      };

      // ── Rule 3: Forward reachability from Start ────────────────────────────
      // Which nodes can be reached starting from Start?
      const reachableFromStart = bfs([startNode.id], forward);

      // ── Rule 4: Backward reachability from all End nodes ───────────────────
      // Which nodes have a path that eventually leads to an End node?
      const canReachEnd = bfs(endNodes.map(n => n.id), backward);

      // ── Classify every node ────────────────────────────────────────────────
      for (const node of nodes) {
        const fromStart = reachableFromStart.has(node.id);
        const toEnd     = canReachEnd.has(node.id);

        if (node.data.kind === 'start') {
          // Start itself must be able to reach an End
          if (!toEnd) {
            errors.push({
              nodeId: node.id,
              message: 'Start node has no path leading to an End node.',
              severity: 'error',
            });
          }
          continue;
        }

        if (node.data.kind === 'end') {
          // End must be reachable from Start
          if (!fromStart) {
            errors.push({
              nodeId: node.id,
              message: 'End node is not reachable from the Start node.',
              severity: 'error',
            });
          }
          continue;
        }

        // Intermediate node checks
        if (!fromStart && !toEnd) {
          errors.push({
            nodeId: node.id,
            message: 'Node is completely disconnected — not reachable from Start and has no path to End.',
            severity: 'error',
          });
        } else if (!fromStart) {
          errors.push({
            nodeId: node.id,
            message: 'Node is not reachable from the Start node.',
            severity: 'error',
          });
        } else if (!toEnd) {
          errors.push({
            nodeId: node.id,
            message: 'Node does not lead to an End node (dead-end path).',
            severity: 'error',
          });
        }
      }

      // ── Rule 5: Task must have a title ────────────────────────────────────
      for (const node of nodes) {
        if (node.data.kind === 'task' && !node.data.title?.trim()) {
          errors.push({ nodeId: node.id, message: 'Task node requires a title.', severity: 'error' });
        }
      }

      // ── Rule 6: Automated node must have an action selected ───────────────
      for (const node of nodes) {
        if (node.data.kind === 'automated' && !node.data.actionId) {
          errors.push({ nodeId: node.id, message: 'Automated node has no action selected.', severity: 'warning' });
        }
      }

      return { valid: errors.every(e => e.severity !== 'error'), errors };
    },
  }))
);
