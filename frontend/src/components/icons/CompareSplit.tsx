import React from 'react';
import type { IconProps} from './SentinelShieldSignal';

/**
 * Compare Split Icon - Run comparison representation
 * Style: Side-by-side split view, 2px stroke, minimal
 */
export const CompareSplit: React.FC<IconProps> = ({
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
      {/* Left panel */}
      <rect
        x="3"
        y="4"
        width="8"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right panel */}
      <rect
        x="13"
        y="4"
        width="8"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Split line */}
      <path
        d="M12 4V20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 2"
      />
    </svg>
  );
};

export default CompareSplit;
