# FlowCanvas — HR Workflow Designer

A production-quality visual workflow builder for HR processes. Design, configure, and simulate multi-step HR workflows (onboarding, approvals, automated actions) using an interactive drag-and-drop canvas.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
# → http://localhost:5173

# 3. Build for production
npm run build
```

**Requirements:** Node.js 18+, npm 9+

---

## Deliverables Checklist

| # | Deliverable | Status | Detail |
|---|---|---|---|
| 1 | React application (Vite) | ✅ | React 18 + Vite 5 + TypeScript 5 |
| 2 | React Flow canvas with custom nodes | ✅ | 5 node types, custom edges, minimap, controls |
| 3 | Node configuration forms for each type | ✅ | Dedicated form per node kind, live-edit |
| 4 | Mock API integration | ✅ | `workflowApi.ts` — automations + simulation |
| 5 | Workflow Test / Sandbox panel | ✅ | Simulation panel with step-by-step execution log |
| 6 | README with architecture & decisions | ✅ | This document |

No authentication or backend persistence required — none implemented.

---

## Architecture

```
src/
├── api/
│   └── workflowApi.ts          # Mock API: getAutomations(), simulateWorkflow()
│
├── components/
│   ├── nodes/
│   │   ├── NodeWrapper.tsx     # Shared node shell: handles, delete btn, validation badge
│   │   └── NodeTypes.tsx       # 5 typed node components (Start/Task/Approval/Automated/End)
│   ├── edges/
│   │   └── CustomEdge.tsx      # Hover-delete edge with animated bezier curves
│   ├── forms/
│   │   └── NodeForms.tsx       # Per-kind configuration forms (inline primitives)
│   ├── ui/
│   │   ├── FormControls.tsx    # Shared: Input, Select, Toggle, KeyValueEditor
│   │   └── ConfirmDialog.tsx   # Custom modal (replaces browser confirm())
│   ├── FlowCanvas.tsx          # React Flow canvas, DnD, edge/node wiring
│   ├── NodeEditor.tsx          # Right sidebar — selected node form + per-node issues
│   ├── NodePalette.tsx         # Left sidebar — draggable node palette
│   ├── SimulationPanel.tsx     # Bottom drawer — run, animate, execution log
│   └── Toolbar.tsx             # Top bar — name, undo/redo, export/import, dark mode
│
├── hooks/
│   ├── index.ts                # useAutomations(), useKeyboardShortcuts()
│   └── useDarkMode.ts          # Zustand-backed dark mode (persisted, no-flash)
│
├── store/
│   └── workflowStore.ts        # Zustand + Immer — all graph state + validation
│
├── types/
│   └── index.ts                # All TypeScript types (nodes, edges, API, validation)
│
└── utils/
    └── index.ts                # Export/import JSON, download helper, formatDuration
```

### Data flow

```
User interaction
      ↓
React Flow (onNodesChange / onEdgesChange / onConnect)
      ↓
Zustand store (workflowStore.ts)
      ↓
Components re-render via selectors
      ↓
validateWorkflow() runs on every render (zero-cost — pure function over store state)
```

---

## Node Types

| Node | Purpose | Key fields |
|---|---|---|
| **Start** | Entry point — one per workflow | Title, metadata key-value pairs |
| **Task** | Manual action assigned to a person/team | Title (required), description, assignee, due date, custom fields |
| **Approval** | Requires a role to approve before continuing | Approver role, auto-approve threshold % |
| **Automated** | Executes a system action via mock API | Action selector, dynamic params per action |
| **End** | Terminates the workflow | End message, optional workflow summary |

---

## Mock API (`src/api/workflowApi.ts`)

Two async functions simulate network latency with `setTimeout`:

### `GET /automations`
Returns 8 available automation actions, each with an id, label, and param list:
```ts
getAutomations() → AutomationAction[]
// e.g. { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] }
```

### `POST /simulate`
Accepts the current graph (nodes + edges) and returns a `SimulationResult`:
```ts
simulateWorkflow(nodes, edges) → SimulationResult
// { success, duration, steps: SimulationStep[], errors: string[] }
```

The simulation engine uses **Kahn's algorithm** (topological BFS) to traverse the graph in dependency order. Nodes with multiple incoming edges (fan-in patterns) are only processed once all predecessors complete — preventing false "cycle detected" errors on valid diamond-shaped graphs.

---

## Validation System

`validateWorkflow()` in the store runs on every render as a pure function. It uses **two BFS sweeps** over the graph:

1. **Forward BFS from Start** → `reachableFromStart` set
2. **Backward BFS from all End nodes** (edges reversed) → `canReachEnd` set

Each node is then classified:

| `reachableFromStart` | `canReachEnd` | Result |
|---|---|---|
| ✅ | ✅ | Valid |
| ✅ | ❌ | **Error** — "dead-end path, does not lead to End" |
| ❌ | ✅ | **Error** — "not reachable from Start" |
| ❌ | ❌ | **Error** — "completely disconnected" |

Validation errors surface in three places:
- **Toolbar badge** — shows error/warning count, dropdown with full list
- **Node card** — red/amber ring + badge icon on affected nodes
- **Right panel** — issues listed under the selected node's form
- **Simulation panel** — blocks Run and shows errors upfront if any blocking issues exist

---

## Design Decisions

### Zustand + Immer for state
Zustand gives a lightweight global store without context boilerplate. Immer enables safe direct mutations inside reducers. History (undo/redo) is stored as a capped array of snapshots (max 50 entries).

### Dark mode via Zustand store
Dark mode state lives in a dedicated Zustand store (`useDarkMode.ts`) so every component that calls it shares the same atom. The `applyAndPersist()` function runs at **module load time** (before first React render) to apply the saved preference and prevent any flash of incorrect theme.

### CSS custom properties for theming
All colors use CSS variables (`--text-primary`, `--bg-surface`, `--border-soft`, etc.) defined on `:root` and overridden on `html.dark`. This means:
- No Tailwind dark: variants needed for most elements
- No React state needed to apply theme — a single class on `<html>` drives everything
- Smooth transitions with `transition: background 0.25s ease`

### Separation of UI and logic
- Node *components* are purely presentational — they render data and emit events
- All mutations go through Zustand actions
- Validation is a pure function over store state (no side effects)
- The mock API layer is a drop-in replacement — swap `workflowApi.ts` for real fetch calls with no component changes

### Custom edge component
React Flow's default edges have no hover interaction. `CustomEdge.tsx` adds:
- A wide (18px) invisible hit area so hover is easy to trigger
- A midpoint delete button that appears on hover or select
- Smooth bezier curves with animated dashed connection line while dragging

### Graph traversal correctness
The simulation uses Kahn's algorithm (not simple BFS with a visited set) because a simple visited set incorrectly reports cycles on any diamond/fan-in shape: node A → B, node A → C, both B and C → D. When BFS dequeues D twice (from B and C), a naive implementation flags it as a cycle. Kahn's tracks in-degree and only processes a node when all predecessors are done.

---

## Features

- **Drag & drop** nodes from palette onto canvas (snap-to-grid: 16px)
- **Connect nodes** by dragging from source handle (right) to target handle (left)
- **Delete** nodes (×  button on hover) or edges (delete button on edge hover/select)
- **Edit** any node by clicking it — right panel opens with its configuration form
- **Undo / Redo** — ⌘Z / ⌘⇧Z, up to 50 steps
- **Export** workflow as JSON — downloads a structured file with nodes, edges, metadata
- **Import** workflow from JSON — restores full canvas state
- **Simulate** — step-by-step execution log with timestamps and status icons
- **Dark mode** — toggle in toolbar, persisted to localStorage, system preference default
- **Validation** — live graph analysis, highlighted nodes, blocked simulation on errors
- **Minimap** — color-coded overview, pannable and zoomable
- **Keyboard shortcuts** — ⌘Z undo, ⌘⇧Z redo, Delete to remove selected node/edge

---

## Assumptions

- One Start node per workflow is enforced at the UI level (drop is blocked if one already exists)
- The `autoApproveThreshold` in Approval nodes simulates probabilistic approval using `Math.random()` — not a real scoring system
- Automated node params are free-text strings; no type validation of actual service payloads
- Workflow simulation is entirely client-side — no actual actions are executed
- Timestamps in the execution log all show the same second because the mock delay is minimal

---

## What Could Be Improved

- **Real backend** — replace `workflowApi.ts` with REST/GraphQL calls; add persistence (PostgreSQL + Prisma or Supabase)
- **Authentication** — per-user workflow ownership and permissions
- **Versioning** — named workflow versions with server-side history
- **Conditional branching** — edges with conditions (approval accepted vs rejected paths)
- **Auto-layout** — Dagre or ELK to automatically arrange nodes without manual positioning
- **Collaborative editing** — WebSocket-based multi-user canvas (Liveblocks or Yjs)
- **Node templates** — save and reuse common sub-patterns
- **Testing** — Vitest unit tests for store actions and validation logic; Playwright E2E for canvas interactions
- **Accessibility** — keyboard-only node placement, ARIA roles for canvas elements
- **Mobile** — the canvas is usable but not optimized for touch; pinch-to-zoom and tap interactions need work

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| Framework | React | 18.3 |
| Build tool | Vite | 5.3 |
| Language | TypeScript | 5.5 |
| Canvas | React Flow | 11.11 |
| State | Zustand + Immer | 4.5 + 10.1 |
| Styling | Tailwind CSS | 3.4 |
| Icons | Lucide React | 0.383 |
| IDs | nanoid | 5.0 |
