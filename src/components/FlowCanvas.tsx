import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type NodeTypes,
  type EdgeTypes,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type ReactFlowInstance,
  SelectionMode,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { StartNode, TaskNode, ApprovalNode, AutomatedNode, EndNode } from './nodes/NodeTypes';
import { CustomEdge } from './edges/CustomEdge';
import { useWorkflowStore } from '../store/workflowStore';
import { useDarkMode } from '../hooks/useDarkMode';
import type { NodeKind } from '../types';

const nodeTypes: NodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedNode,
  end: EndNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

export function FlowCanvas() {
  const {
    nodes, edges,
    onNodesChange, onEdgesChange, onConnect,
    addNode, setSelectedNodeId,
  } = useWorkflowStore();
  const { isDark: dark } = useDarkMode();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const kind = event.dataTransfer.getData('application/reactflow') as NodeKind;
    if (!kind || !reactFlowInstance.current || !reactFlowWrapper.current) return;

    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.current.project({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });

    const { nodes: currentNodes } = useWorkflowStore.getState();
    if (kind === 'start' && currentNodes.some(n => n.data.kind === 'start')) {
      // Show a nicer non-blocking message
      const el = document.getElementById('fc-toast');
      if (el) {
        el.textContent = 'Only one Start node is allowed.';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        setTimeout(() => {
          el.style.opacity = '0';
          el.style.transform = 'translateY(8px)';
        }, 2500);
      }
      return;
    }

    addNode(kind, position);
  }, [addNode]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);


  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange as OnNodesChange}
        onEdgesChange={onEdgesChange as OnEdgesChange}
        onConnect={onConnect as OnConnect}
        onInit={onInit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.22 }}
        selectionMode={SelectionMode.Partial}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
        defaultEdgeOptions={{
          type: 'custom',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 16,
            height: 16,
            color: dark ? '#2d4a6e' : '#a8a29e',
          },
          style: { stroke: 'var(--edge-color)', strokeWidth: 2 },
        }}
        connectionLineStyle={{
          stroke: 'var(--accent)',
          strokeWidth: 2,
          strokeDasharray: '6,4',
        }}
        snapToGrid
        snapGrid={[16, 16]}
        minZoom={0.25}
        maxZoom={2.5}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: false }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1.4}
          color={dark ? '#1e3355' : '#94a3af'}
        />
        <Controls
          position="bottom-right"
        />
        <MiniMap
          position="top-right"
          nodeColor={(node) => {
            switch (node.data?.kind) {
              case 'start': return '#16a34a';
              case 'task': return '#2563eb';
              case 'approval': return '#d97706';
              case 'automated': return '#7c3aed';
              case 'end': return '#dc2626';
              default: return '#94a3b8';
            }
          }}
          maskColor={dark ? 'rgba(12,21,37,0.86)' : 'rgba(244,243,240,0.86)'}
          pannable
          zoomable
        />
      </ReactFlow>

      {/* Toast notification */}
      <div
        id="fc-toast"
        style={{
          position: 'absolute',
          bottom: 72,
          left: '50%',
          transform: 'translateX(-50%) translateY(8px)',
          background: 'var(--panel-bg)',
          border: '1px solid var(--border-soft)',
          boxShadow: 'var(--panel-shadow)',
          borderRadius: 10,
          padding: '8px 16px',
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--text-primary)',
          opacity: 0,
          transition: 'opacity 0.2s ease, transform 0.2s ease',
          pointerEvents: 'none',
          zIndex: 50,
          whiteSpace: 'nowrap',
        }}
      />

      {/* Empty state */}
      {nodes.length === 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none animate-fade-in"
        >
          <div className="text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: 'var(--bg-subtle)',
                border: '2px dashed var(--border-mid)',
              }}
            >
              <span style={{ fontSize: 22, opacity: 0.4 }}>⟶</span>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Drag nodes from the left panel
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
              Connect them to build your workflow
            </p>
          </div>
        </div>
      )}
    </div>
  );
}