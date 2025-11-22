import React from 'react';
import type { IconProps } from './SentinelShieldSignal';

/**
 * Latency Curve Icon - Latency chart representation
 * Style: Curve line, 2px stroke, minimal
 */
export const LatencyCurve: React.FC<IconProps> = ({
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
      {/* Axes */}
      <path
        d="M4 20V4M4 20H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Curve line */}
      <path
        d="M6 16C8 14 10 12 12 10C14 8 16 10 18 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Data points */}
      <circle cx="6" cy="16" r="1.5" fill="currentColor" />
      <circle cx="12" cy="10" r="1.5" fill="currentColor" />
      <circle cx="18" cy="8" r="1.5" fill="currentColor" />
    </svg>
  );
};

export default LatencyCurve;
