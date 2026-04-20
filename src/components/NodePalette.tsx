import React, { useState } from 'react';
import { Play, CheckSquare, ThumbsUp, Zap, StopCircle } from 'lucide-react';
import type { NodeKind } from '../types';
import { useDarkMode } from '../hooks/useDarkMode';

interface PaletteItem {
  kind: NodeKind;
  label: string;
  description: string;
  icon: React.ReactNode;
  // Glow/gradient colors
  glowColor: string;        // box-shadow glow
  gradFrom: string;         // gradient start
  gradTo: string;           // gradient end
  borderColor: string;      // border
  iconBg: string;           // icon circle bg
  iconColor: string;        // icon fill
  labelColor: string;       // label text
  descColor: string;        // description text
  // Dark mode variants
  darkGlowColor: string;
  darkGradFrom: string;
  darkGradTo: string;
  darkBorderColor: string;
  darkIconBg: string;
  darkIconColor: string;
  darkLabelColor: string;
}

const ITEMS: PaletteItem[] = [
  {
    kind: 'start',
    label: 'Start',
    description: 'Entry point',
    icon: <Play size={15} fill="currentColor" strokeWidth={0} />,
    glowColor: 'rgba(34,197,94,0.22)',
    gradFrom: 'rgba(240,253,244,0.95)',
    gradTo: 'rgba(220,252,231,0.85)',
    borderColor: 'rgba(134,239,172,0.7)',
    iconBg: 'rgba(134,239,172,0.35)',
    iconColor: '#16a34a',
    labelColor: '#15803d',
    descColor: '#4ade80',
    darkGlowColor: 'rgba(34,197,94,0.18)',
    darkGradFrom: 'rgba(5,46,22,0.9)',
    darkGradTo: 'rgba(6,78,59,0.8)',
    darkBorderColor: 'rgba(34,197,94,0.3)',
    darkIconBg: 'rgba(34,197,94,0.2)',
    darkIconColor: '#4ade80',
    darkLabelColor: '#86efac',
  },
  {
    kind: 'task',
    label: 'Task',
    description: 'Manual action',
    icon: <CheckSquare size={15} />,
    glowColor: 'rgba(59,130,246,0.2)',
    gradFrom: 'rgba(239,246,255,0.95)',
    gradTo: 'rgba(219,234,254,0.85)',
    borderColor: 'rgba(147,197,253,0.7)',
    iconBg: 'rgba(147,197,253,0.35)',
    iconColor: '#2563eb',
    labelColor: '#1d4ed8',
    descColor: '#60a5fa',
    darkGlowColor: 'rgba(59,130,246,0.18)',
    darkGradFrom: 'rgba(15,23,42,0.9)',
    darkGradTo: 'rgba(15,40,80,0.8)',
    darkBorderColor: 'rgba(59,130,246,0.3)',
    darkIconBg: 'rgba(59,130,246,0.2)',
    darkIconColor: '#60a5fa',
    darkLabelColor: '#93c5fd',
  },
  {
    kind: 'approval',
    label: 'Approval',
    description: 'Requires sign-off',
    icon: <ThumbsUp size={15} />,
    glowColor: 'rgba(245,158,11,0.22)',
    gradFrom: 'rgba(255,251,235,0.95)',
    gradTo: 'rgba(254,243,199,0.85)',
    borderColor: 'rgba(252,211,77,0.7)',
    iconBg: 'rgba(252,211,77,0.35)',
    iconColor: '#d97706',
    labelColor: '#b45309',
    descColor: '#fbbf24',
    darkGlowColor: 'rgba(245,158,11,0.18)',
    darkGradFrom: 'rgba(28,20,0,0.9)',
    darkGradTo: 'rgba(45,30,0,0.8)',
    darkBorderColor: 'rgba(245,158,11,0.3)',
    darkIconBg: 'rgba(245,158,11,0.2)',
    darkIconColor: '#fbbf24',
    darkLabelColor: '#fde68a',
  },
  {
    kind: 'automated',
    label: 'Automated',
    description: 'System action',
    icon: <Zap size={15} fill="currentColor" strokeWidth={0} />,
    glowColor: 'rgba(139,92,246,0.22)',
    gradFrom: 'rgba(250,245,255,0.95)',
    gradTo: 'rgba(237,233,254,0.85)',
    borderColor: 'rgba(196,181,253,0.7)',
    iconBg: 'rgba(196,181,253,0.35)',
    iconColor: '#7c3aed',
    labelColor: '#6d28d9',
    descColor: '#a78bfa',
    darkGlowColor: 'rgba(139,92,246,0.18)',
    darkGradFrom: 'rgba(26,15,46,0.9)',
    darkGradTo: 'rgba(40,20,70,0.8)',
    darkBorderColor: 'rgba(139,92,246,0.3)',
    darkIconBg: 'rgba(139,92,246,0.2)',
    darkIconColor: '#a78bfa',
    darkLabelColor: '#c4b5fd',
  },
  {
    kind: 'end',
    label: 'End',
    description: 'Terminates flow',
    icon: <StopCircle size={15} />,
    glowColor: 'rgba(239,68,68,0.2)',
    gradFrom: 'rgba(254,242,242,0.95)',
    gradTo: 'rgba(254,226,226,0.85)',
    borderColor: 'rgba(252,165,165,0.7)',
    iconBg: 'rgba(252,165,165,0.35)',
    iconColor: '#dc2626',
    labelColor: '#b91c1c',
    descColor: '#f87171',
    darkGlowColor: 'rgba(239,68,68,0.18)',
    darkGradFrom: 'rgba(31,7,7,0.9)',
    darkGradTo: 'rgba(55,10,10,0.8)',
    darkBorderColor: 'rgba(239,68,68,0.3)',
    darkIconBg: 'rgba(239,68,68,0.2)',
    darkIconColor: '#f87171',
    darkLabelColor: '#fca5a5',
  },
];

function PaletteCard({ item }: { item: PaletteItem }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { isDark } = useDarkMode();

  const glow       = isDark ? item.darkGlowColor   : item.glowColor;
  const gradFrom   = isDark ? item.darkGradFrom     : item.gradFrom;
  const gradTo     = isDark ? item.darkGradTo       : item.gradTo;
  const border     = isDark ? item.darkBorderColor  : item.borderColor;
  const iconBg     = isDark ? item.darkIconBg       : item.iconBg;
  const iconColor  = isDark ? item.darkIconColor    : item.iconColor;
  const labelColor = isDark ? item.darkLabelColor   : item.labelColor;
  const descColor  = isDark ? item.darkIconColor    : item.descColor;

  return (
    <div
      draggable
      onDragStart={e => {
        e.dataTransfer.setData('application/reactflow', item.kind);
        e.dataTransfer.effectAllowed = 'move';
        setIsDragging(true);
      }}
      onDragEnd={() => setIsDragging(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '10px 12px',
        borderRadius: 14,
        border: `1px solid ${border}`,
        background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
        boxShadow: isHovered
          ? `0 0 0 1px ${border}, 0 4px 20px ${glow}, 0 0 12px ${glow}`
          : `0 0 12px ${glow}, 0 1px 4px rgba(0,0,0,0.06)`,
        cursor: 'grab',
        userSelect: 'none',
        transform: isDragging
          ? 'scale(0.96) rotate(1deg)'
          : isHovered
          ? 'translateX(3px) scale(1.01)'
          : 'none',
        transition: 'transform 0.18s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.18s ease',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        overflow: 'hidden',
      }}
    >
      {/* Subtle shimmer line at top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '10%',
        width: '80%',
        height: 1,
        background: `linear-gradient(90deg, transparent, ${border}, transparent)`,
        opacity: 0.8,
      }} />

      {/* Icon circle */}
      <div style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        background: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: iconColor,
        flexShrink: 0,
        border: `1px solid ${border}`,
        boxShadow: `0 2px 8px ${glow}`,
        transition: 'transform 0.15s',
        transform: isHovered ? 'scale(1.08)' : 'scale(1)',
      }}>
        {item.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 650, color: labelColor, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
          {item.label}
        </p>
        <p style={{ fontSize: 11, color: descColor, marginTop: 2, opacity: 0.75, lineHeight: 1.2 }}>
          {item.description}
        </p>
      </div>

      {/* Drag dots */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0, opacity: isHovered ? 0.6 : 0.3, transition: 'opacity 0.15s' }}>
        {[0,1,2].map(r => (
          <div key={r} style={{ display: 'flex', gap: 3 }}>
            {[0,1].map(c => (
              <div key={c} style={{ width: 3, height: 3, borderRadius: '50%', background: iconColor }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function NodePalette() {
  return (
    <aside
      className="animate-slide-in-left"
      style={{
        width: 208,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--panel-bg)',
        borderRight: '1px solid var(--border-soft)',
        transition: 'background 0.25s ease',
      }}
    >
      {/* Header */}
      <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--border-soft)' }}>
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-muted)' }}>
          Node Types
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, opacity: 0.8 }}>
          Drag onto canvas
        </p>
      </div>

      {/* Cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ITEMS.map(item => (
          <PaletteCard key={item.kind} item={item} />
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 14px 12px', borderTop: '1px solid var(--border-soft)' }}>
        <p style={{ fontSize: 10.5, color: 'var(--text-muted)', lineHeight: 1.5, opacity: 0.8 }}>
          Click a node on canvas to configure it.
        </p>
      </div>
    </aside>
  );
}