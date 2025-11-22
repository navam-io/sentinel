import React from 'react';
import type { IconProps } from './SentinelShieldSignal';

/**
 * Timeline Run Icon - Run history representation
 * Style: Clock + dot timeline, 2px stroke, minimal
 */
export const TimelineRun: React.FC<IconProps> = ({
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
      {/* Clock circle */}
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Clock hands */}
      <path
        d="M12 7V12L15 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Timeline dots */}
      <circle cx="4" cy="12" r="1.5" fill="currentColor" />
      <circle cx="20" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="4" r="1.5" fill="currentColor" />
    </svg>
  );
};

export default TimelineRun;
