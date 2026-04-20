import React, { useState, useCallback } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { Toolbar } from './components/Toolbar';
import { NodePalette } from './components/NodePalette';
import { FlowCanvas } from './components/FlowCanvas';
import { NodeEditor } from './components/NodeEditor';
import { SimulationPanel } from './components/SimulationPanel';
import { useWorkflowStore } from './store/workflowStore';
import { useKeyboardShortcuts } from './hooks';

function AppInner() {
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const { undo, redo } = useWorkflowStore();

  const handleRunSimulation = useCallback(() => {
    setIsSimulationOpen(prev => !prev);
  }, []);

  useKeyboardShortcuts({
    'mod+z': undo,
    'mod+shift+z': redo,
    'mod+y': redo,
  });

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--bg-app)', color: 'var(--text-primary)' }}
    >
      <Toolbar onRunSimulation={handleRunSimulation} isSimulationOpen={isSimulationOpen} />
      <div className="flex flex-1 min-h-0 relative">
        <NodePalette />
        <main className="flex-1 relative min-w-0">
          <FlowCanvas />
          {isSimulationOpen && (
            <SimulationPanel onClose={() => setIsSimulationOpen(false)} />
          )}
        </main>
        <NodeEditor />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <AppInner />
    </ReactFlowProvider>
  );
}
