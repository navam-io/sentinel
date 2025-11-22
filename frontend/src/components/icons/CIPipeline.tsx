import React from 'react';
import type { IconProps } from './SentinelShieldSignal';

/**
 * CI Pipeline Icon - CI/CD integration representation
 * Style: Pipeline nodes, 2px stroke, minimal
 */
export const CIPipeline: React.FC<IconProps> = ({
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
      {/* Pipeline nodes */}
      <circle
        cx="5"
        cy="12"
        r="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12"
        r="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        cx="19"
        cy="12"
        r="2"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Connecting lines */}
      <path
        d="M7 12H10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 12H17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Arrow indicators */}
      <path
        d="M9 11L10 12L9 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 11L17 12L16 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CIPipeline;
