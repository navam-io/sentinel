import React from 'react';
import type { IconProps } from './SentinelShieldSignal';

/**
 * Graph Nodes Icon - Agent framework representation
 * Style: 3-node LangGraph-like graph, 2px stroke, minimal
 */
export const GraphNodes: React.FC<IconProps> = ({
  size = 24,
  className = '',
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Three nodes */}
      <circle
        cx="6"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx="18"
        cy="8"
        r="3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx="18"
        cy="16"
        r="3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Connecting edges */}
      <path
        d="M9 12H15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 11L15 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 13L15 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default GraphNodes;
