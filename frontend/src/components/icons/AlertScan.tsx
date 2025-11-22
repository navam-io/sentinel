import React from 'react';
import type { IconProps } from './SentinelShieldSignal';

/**
 * Alert Scan Icon - Safety evaluator representation
 * Style: Shield + spark, 2px stroke, minimal
 */
export const AlertScan: React.FC<IconProps> = ({
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
      {/* Shield */}
      <path
        d="M12 3L4 6V11C4 16 8 20 12 21C16 20 20 16 20 11V6L12 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Alert exclamation */}
      <path
        d="M12 9V13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  );
};

export default AlertScan;
