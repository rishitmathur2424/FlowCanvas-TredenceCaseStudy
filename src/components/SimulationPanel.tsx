import React, { useState, useEffect } from 'react';
import { X, Play, CheckCircle, XCircle, AlertTriangle, Clock, ChevronUp, Loader, AlertCircle } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { simulateWorkflow } from '../api/workflowApi';
import type { SimulationStep } from '../types';
import { formatDuration } from '../utils';

// ── Spin keyframe injected once ───────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('fc-spin')) {
  const s = document.createElement('style');
  s.id = 'fc-spin';
  s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(s);
}

const STATUS_CFG = {
  success: { icon: CheckCircle, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  warning: { icon: AlertTriangle, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  error:   { icon: XCircle,      color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  skipped: { icon: Clock,        color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
};

function StepRow({ step, index }: { step: SimulationStep; index: number }) {
  const cfg = STATUS_CFG[step.status];
  const Icon = cfg.icon;
  return (
    <div
      className="flex gap-2.5 animate-slide-in-up"
      style={{ animationDelay: `${index * 55}ms`, animationFillMode: 'both' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: 2 }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: cfg.bg, border: `1px solid ${cfg.border}`, flexShrink: 0 }}>
          <Icon size={12} style={{ color: cfg.color }} strokeWidth={2.5} />
        </div>
        <div style={{ width: 1, flex: 1, marginTop: 3, background: 'var(--border-soft)', minHeight: 8 }} />
      </div>
      <div style={{ paddingBottom: 16, flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
          <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {step.nodeTitle}
          </p>
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--text-muted)', flexShrink: 0 }}>
            {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
        <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {step.message}
        </p>
      </div>
    </div>
  );
}

// Topological sort via Kahn's algorithm — returns nodes in execution order
function topoSort(nodeIds: string[], edges: { source: string; target: string }[]): string[] {
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  for (const id of nodeIds) { inDegree.set(id, 0); adj.set(id, []); }
  for (const e of edges) {
    adj.get(e.source)?.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
  }
  const queue = nodeIds.filter(id => inDegree.get(id) === 0);
  const result: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    result.push(id);
    for (const next of adj.get(id) ?? []) {
      const deg = (inDegree.get(next) ?? 1) - 1;
      inDegree.set(next, deg);
      if (deg === 0) queue.push(next);
    }
  }
  // Append any remaining (cycle members or disconnected)
  for (const id of nodeIds) { if (!result.includes(id)) result.push(id); }
  return result;
}

interface Props { onClose: () => void; }

export function SimulationPanel({ onClose }: Props) {
  const {
    nodes, edges,
    simulationResult, isSimulating,
    setSimulationResult, setIsSimulating,
    validateWorkflow, setActiveSimNodeId,
  } = useWorkflowStore();

  const [collapsed, setCollapsed] = useState(false);

  // Live validation shown in idle state
  const validation = validateWorkflow();
  const blockingErrors = validation.errors.filter(e => e.severity === 'error');
  const isBlocked = blockingErrors.length > 0;

  const handleRun = async () => {
    setIsSimulating(true);
    setSimulationResult(null);

    // Re-validate synchronously — block if any errors
    const v = validateWorkflow();
    const errors = v.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
      setSimulationResult({
        success: false,
        duration: 0,
        steps: [],
        errors: errors.map(e => e.message),
      });
      setIsSimulating(false);
      return;
    }

    // Animate highlights through nodes in topological order
    const orderedIds = topoSort(nodes.map(n => n.id), edges);
    for (const id of orderedIds) {
      setActiveSimNodeId(id);
      await new Promise(r => setTimeout(r, 320));
    }
    setActiveSimNodeId(null);

    const result = await simulateWorkflow(nodes, edges);
    setSimulationResult(result);
    setIsSimulating(false);
  };

  useEffect(() => { return () => setActiveSimNodeId(null); }, []);

  const errorCount = simulationResult?.errors.length ?? 0;

  // Header subtitle
  const subtitle = isSimulating
    ? 'Traversing graph…'
    : simulationResult
      ? `${simulationResult.steps.length} step${simulationResult.steps.length !== 1 ? 's' : ''} · ${formatDuration(simulationResult.duration)} · ${simulationResult.success ? '✓ Passed' : `✗ ${errorCount} error${errorCount !== 1 ? 's' : ''}`}`
      : isBlocked
        ? `${blockingErrors.length} issue${blockingErrors.length !== 1 ? 's' : ''} blocking simulation`
        : 'Ready to run';

  return (
    <div
      className="absolute bottom-4 left-1/2 rounded-2xl z-20 animate-slide-in-up"
      style={{
        transform: 'translateX(-50%)',
        width: 480,
        background: 'var(--panel-bg)',
        border: '1px solid var(--border-soft)',
        boxShadow: 'var(--panel-shadow)',
        maxHeight: collapsed ? 56 : 420,
        overflow: 'hidden',
        transition: 'max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px',
          borderBottom: collapsed ? 'none' : '1px solid var(--border-soft)',
        }}
      >
        {/* Icon */}
        <div style={{ width: 28, height: 28, borderRadius: 8, background: isBlocked ? '#d97706' : 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {isSimulating
            ? <Loader size={13} color="white" style={{ animation: 'spin 0.9s linear infinite' }} />
            : isBlocked
              ? <AlertTriangle size={13} color="white" />
              : <Play size={12} color="white" fill="white" style={{ marginLeft: 1 }} />
          }
        </div>

        {/* Title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {isSimulating ? 'Running simulation…' : simulationResult ? 'Simulation complete' : 'Workflow Simulation'}
          </p>
          <p style={{ fontSize: 10.5, color: isBlocked && !simulationResult ? '#d97706' : 'var(--text-muted)', marginTop: 1 }}>
            {subtitle}
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={handleRun}
            disabled={isSimulating}
            className="fc-btn-primary"
            style={{ padding: '5px 12px', fontSize: 11, opacity: isSimulating ? 0.7 : 1 }}
          >
            {isSimulating ? (
              <>
                <span style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.9s linear infinite', display: 'inline-block' }} />
                Running
              </>
            ) : (
              <>
                <Play size={10} fill="currentColor" />
                Run
              </>
            )}
          </button>

          <button onClick={() => setCollapsed(c => !c)} className="fc-btn-ghost" style={{ padding: 5 }}>
            <ChevronUp size={14} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          <button onClick={onClose} className="fc-btn-ghost" style={{ padding: 5 }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      {!collapsed && (
        <div style={{ overflowY: 'auto', maxHeight: 360 }}>

          {/* Idle + valid */}
          {!isSimulating && !simulationResult && !isBlocked && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Play size={20} style={{ color: 'var(--text-muted)' }} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Ready to simulate</p>
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                Press <strong>Run</strong> to execute your workflow step-by-step
              </p>
            </div>
          )}

          {/* Idle + BLOCKED — show validation errors that prevent simulation */}
          {!isSimulating && !simulationResult && isBlocked && (
            <div style={{ padding: '12px 16px' }}>
              <div style={{ padding: '10px 12px', borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a', marginBottom: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>
                  Fix these issues before running simulation
                </p>
                <p style={{ fontSize: 11, color: '#78350f' }}>
                  Nodes highlighted in red/orange on the canvas show where problems are.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {blockingErrors.map((err, i) => (
                  <div
                    key={i}
                    style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '8px 10px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca' }}
                  >
                    <AlertCircle size={12} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: '#991b1b', lineHeight: 1.45 }}>{err.message}</p>
                  </div>
                ))}
                {validation.errors.filter(e => e.severity === 'warning').map((err, i) => (
                  <div
                    key={`w-${i}`}
                    style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '8px 10px', borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a' }}
                  >
                    <AlertTriangle size={12} style={{ color: '#d97706', flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.45 }}>{err.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Simulating spinner */}
          {isSimulating && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', gap: 10 }}>
              <Loader size={18} style={{ color: 'var(--accent)', animation: 'spin 0.9s linear infinite' }} />
              <span className="animate-pulse-soft" style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                Traversing workflow graph…
              </span>
            </div>
          )}

          {/* Results */}
          {simulationResult && !isSimulating && (
            <div style={{ padding: '16px' }}>
              {/* Banner */}
              <div
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 12px', borderRadius: 10, marginBottom: 16,
                  background: simulationResult.success ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${simulationResult.success ? '#bbf7d0' : '#fecaca'}`,
                }}
              >
                {simulationResult.success
                  ? <CheckCircle size={16} style={{ color: '#16a34a', flexShrink: 0, marginTop: 1 }} />
                  : <XCircle    size={16} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
                }
                <div>
                  <p style={{ fontSize: 12.5, fontWeight: 600, color: simulationResult.success ? '#15803d' : '#b91c1c' }}>
                    {simulationResult.success ? 'All steps completed successfully' : 'Workflow has issues'}
                  </p>
                  {errorCount > 0 && (
                    <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {simulationResult.errors.map((e, i) => (
                        <p key={i} style={{ fontSize: 11, color: '#b91c1c' }}>· {e}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Execution log */}
              {simulationResult.steps.length > 0 && (
                <>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 12 }}>
                    Execution Log
                  </p>
                  {simulationResult.steps.map((step, i) => (
                    <StepRow key={`${step.nodeId}-${i}`} step={step} index={i} />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
