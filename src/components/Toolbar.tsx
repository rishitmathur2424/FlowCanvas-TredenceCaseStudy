import React, { useRef, useState } from 'react';
import {
  Play, Download, Upload, RotateCcw, RotateCw, Trash2,
  AlertCircle, AlertTriangle, CheckCircle, ChevronDown,
  Workflow, X,
} from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { exportWorkflowJSON, downloadJSON, parseWorkflowJSON } from '../utils';
import { useDarkMode } from '../hooks/useDarkMode';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { useReactFlow } from 'reactflow';

interface ToolbarProps {
  onRunSimulation: () => void;
  isSimulationOpen: boolean;
}

export function Toolbar({ onRunSimulation, isSimulationOpen }: ToolbarProps) {
  const {
    workflowName, setWorkflowName, undo, redo, resetWorkflow,
    importWorkflow, nodes, edges, historyIndex, history, validateWorkflow,
  } = useWorkflowStore();
  const { fitView } = useReactFlow();

  const { isDark, toggle } = useDarkMode();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nameEditing, setNameEditing] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const validation = validateWorkflow();
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const errorCount = validation.errors.filter(e => e.severity === 'error').length;
  const warnCount  = validation.errors.filter(e => e.severity === 'warning').length;

  const handleExport = () => {
    const json = exportWorkflowJSON(nodes, edges, workflowName);
    downloadJSON(json, `${workflowName.toLowerCase().replace(/\s+/g, '-')}.json`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseWorkflowJSON(text);
      if (parsed) {
        importWorkflow(parsed.nodes, parsed.edges, parsed.metadata.name);
        setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 100);
      } else {
        alert('Invalid workflow JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const validationStyle = errorCount > 0
    ? { color: '#dc2626', bg: 'rgba(254,242,242,1)', hbg: 'rgba(254,226,226,1)' }
    : warnCount > 0
    ? { color: '#d97706', bg: 'rgba(255,251,235,1)', hbg: 'rgba(254,243,199,1)' }
    : { color: '#16a34a', bg: 'rgba(240,253,244,1)', hbg: 'rgba(220,252,231,1)' };

  return (
    <>
      <header
        className="flex items-center px-3 gap-2 flex-shrink-0 z-10"
        style={{
          height: 52,
          background: 'var(--panel-bg)',
          borderBottom: '1px solid var(--border-soft)',
          transition: 'background 0.25s ease',
        }}
      >
        {/* Logo */}
<div className="flex items-center gap-2 mr-2">
  
  {/* Custom Logo Icon */}
  <div
    style={{
      width: 28,
      height: 28,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <img
  src="/logo.png"
  alt="FC LOGO"
  style={{
    width: 28,
    height: 28,
    objectFit: 'contain',
  }}
/>
  </div>

  {/* Logo Text */}
  <span
    style={{
      fontWeight: 700,
      fontSize: 14,
      letterSpacing: '-0.01em',
      display: 'flex',
      alignItems: 'center',
    }}
  >
    <span style={{ color: 'var(--text-primary)' }}>Flow</span>
    <span
  style={{
    color: isDark ? '#60a5fa' : '#2563eb',
    marginLeft: 2,
  }}
>
  Canvas
</span>
  </span>
</div>

        <div className="toolbar-divider" />

        {/* Workflow name */}
        {nameEditing ? (
          <input
            autoFocus
            value={workflowName}
            onChange={e => setWorkflowName(e.target.value)}
            onBlur={() => setNameEditing(false)}
            onKeyDown={e => e.key === 'Enter' && setNameEditing(false)}
            style={{
              fontSize: 13, fontWeight: 600, borderBottom: '2px solid #2563eb',
              background: 'transparent', outline: 'none', padding: '0 4px',
              color: 'var(--text-primary)', width: 180, fontFamily: 'inherit',
            }}
          />
        ) : (
          <button
            onClick={() => setNameEditing(true)}
            style={{
              fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
              background: 'none', border: 'none', cursor: 'text',
              padding: '0 4px', maxWidth: 200, overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
            title="Click to rename"
          >
            {workflowName}
          </button>
        )}

        <div style={{ flex: 1 }} />

        {/* Validation badge */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowValidation(v => !v)}
            className="fc-btn-ghost"
            style={{
              color: validationStyle.color,
              background: validationStyle.bg,
              padding: '4px 10px',
              fontWeight: 500,
              fontSize: 12,
              borderRadius: 8,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = validationStyle.hbg)}
            onMouseLeave={e => (e.currentTarget.style.background = validationStyle.bg)}
          >
            {errorCount > 0 ? <AlertCircle size={12} /> : warnCount > 0 ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
            <span>
              {errorCount > 0 ? `${errorCount} error${errorCount !== 1 ? 's' : ''}`
                : warnCount > 0 ? `${warnCount} warning${warnCount !== 1 ? 's' : ''}`
                : 'Valid'}
            </span>
            <ChevronDown size={10} style={{ opacity: 0.6 }} />
          </button>

          {showValidation && (
            <>
              <div className="fixed inset-0 z-40" style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowValidation(false)} />
              <div
                className="animate-slide-in-up"
                style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 6,
                  width: 280, borderRadius: 12, zIndex: 50, paddingBottom: 8,
                  background: 'var(--panel-bg)', border: '1px solid var(--border-soft)',
                  boxShadow: 'var(--panel-shadow)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px 8px', borderBottom: '1px solid var(--border-soft)' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                    Validation
                  </p>
                  <button onClick={() => setShowValidation(false)} className="fc-btn-ghost" style={{ padding: 3 }}>
                    <X size={12} />
                  </button>
                </div>

                {validation.errors.length === 0 ? (
                  <div style={{ padding: '16px 12px', textAlign: 'center' }}>
                    <CheckCircle size={20} style={{ color: '#16a34a', margin: '0 auto 6px' }} />
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>No issues found</p>
                  </div>
                ) : (
                  <div style={{ padding: '6px 8px', maxHeight: 220, overflowY: 'auto' }}>
                    {validation.errors.map((err, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '6px', borderRadius: 7 }}>
                        <span style={{ flexShrink: 0, marginTop: 1, color: err.severity === 'error' ? '#dc2626' : '#d97706' }}>
                          {err.severity === 'error' ? <AlertCircle size={11} /> : <AlertTriangle size={11} />}
                        </span>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45 }}>{err.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="toolbar-divider" />

        {/* Undo / Redo */}
        <button onClick={undo} disabled={!canUndo} className="fc-btn-ghost" style={{ padding: 6 }} title="Undo (⌘Z)">
          <RotateCcw size={14} />
        </button>
        <button onClick={redo} disabled={!canRedo} className="fc-btn-ghost" style={{ padding: 6 }} title="Redo (⌘⇧Z)">
          <RotateCw size={14} />
        </button>

        <div className="toolbar-divider" />

        {/* Export / Import */}
        <button onClick={handleExport} className="fc-btn-ghost" title="Export JSON">
          <Download size={13} />
          <span style={{ display: 'none' }} className="md:inline">Export</span>
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="fc-btn-ghost" title="Import JSON">
          <Upload size={13} />
          <span style={{ display: 'none' }} className="md:inline">Import</span>
        </button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />

        {/* Clear canvas — opens custom dialog */}
        <button
          onClick={() => setShowClearConfirm(true)}
          className="fc-btn-ghost"
          style={{ padding: 6, color: 'var(--text-secondary)' }}
          title="Clear canvas"
        >
          <Trash2 size={13} />
        </button>

        <div className="toolbar-divider" />

        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className={`dark-toggle ${isDark ? 'active' : ''}`}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle dark mode"
        >
          <span className="dark-toggle-thumb" />
        </button>

        <div className="toolbar-divider" />

        {/* Run */}
        <button
          onClick={onRunSimulation}
          className="fc-btn-primary"
          style={isSimulationOpen ? { opacity: 0.85 } : undefined}
        >
          <Play size={12} fill="currentColor" />
          Run
        </button>
      </header>

      {/* Custom clear canvas confirm dialog */}
      <ConfirmDialog
        open={showClearConfirm}
        title="Clear the canvas?"
        message="All nodes and connections will be permanently removed. This cannot be undone."
        confirmLabel="Clear canvas"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => { resetWorkflow(); setShowClearConfirm(false); }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </>
  );
}
