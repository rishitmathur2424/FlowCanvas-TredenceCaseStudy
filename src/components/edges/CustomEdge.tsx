import React, { useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
  useReactFlow,
} from 'reactflow';
import { X } from 'lucide-react';

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  markerEnd,
}: EdgeProps) {
  const [hovered, setHovered] = useState(false);
  const { setEdges } = useReactFlow();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25,
  });

  const deleteEdge = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEdges(edges => edges.filter(edge => edge.id !== id));
  };

  const isActive = hovered || selected;

  return (
    <>
      {/* Invisible wide hit area for hover */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={18}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: 'pointer' }}
      />
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: selected
            ? '#2563eb'
            : hovered
            ? '#60a5fa'
            : 'var(--edge-color, #94a3b8)',
          strokeWidth: isActive ? 2.5 : 1.75,
          transition: 'stroke 0.15s ease, stroke-width 0.15s ease',
          strokeLinecap: 'round',
        }}
      />
      {/* Hover delete button */}
      {isActive && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              zIndex: 10,
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <button
              onClick={deleteEdge}
              className="
                w-5 h-5 rounded-full
                bg-white dark:bg-gray-800
                border border-red-300 dark:border-red-700
                text-red-500 dark:text-red-400
                flex items-center justify-center
                shadow-sm
                hover:bg-red-50 dark:hover:bg-red-900/30
                hover:border-red-400
                transition-all duration-100
              "
              title="Delete edge"
            >
              <X size={9} strokeWidth={2.5} />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
