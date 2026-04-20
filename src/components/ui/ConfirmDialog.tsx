import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onConfirm, onCancel]);

  if (!open) return null;

  const accentColor = variant === 'danger' ? '#dc2626' : '#d97706';
  const accentBg    = variant === 'danger' ? '#fef2f2' : '#fffbeb';
  const accentHover = variant === 'danger' ? '#b91c1c' : '#b45309';
  const iconBg      = variant === 'danger' ? '#fee2e2' : '#fef3c7';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(2px)',
          zIndex: 9998,
          animation: 'fadeIn 0.15s ease',
        }}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          width: 360,
          background: 'var(--panel-bg)',
          border: '1px solid var(--border-soft)',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          padding: '24px',
          animation: 'dialogPop 0.18s cubic-bezier(0.34,1.3,0.64,1)',
        }}
      >
        <style>{`
          @keyframes dialogPop {
            from { transform: translate(-50%, -50%) scale(0.92); opacity: 0; }
            to   { transform: translate(-50%, -50%) scale(1);    opacity: 1; }
          }
        `}</style>

        {/* Icon */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <AlertTriangle size={22} style={{ color: accentColor }} />
        </div>

        {/* Title */}
        <p style={{
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 6,
          lineHeight: 1.3,
        }}>
          {title}
        </p>

        {/* Message */}
        <p style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.55,
          marginBottom: 24,
        }}>
          {message}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              border: '1px solid var(--border-soft)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontFamily: 'inherit',
              transition: 'background 0.13s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-muted)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            autoFocus
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: accentColor,
              color: 'white',
              fontFamily: 'inherit',
              transition: 'background 0.13s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = accentHover)}
            onMouseLeave={e => (e.currentTarget.style.background = accentColor)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
