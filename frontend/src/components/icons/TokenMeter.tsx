import React from 'react';
import type { IconProps } from './SentinelShieldSignal';

/**
 * Token Meter Icon - Token usage representation
 * Style: Meter gauge, 2px stroke, minimal
 */
export const TokenMeter: React.FC<IconProps> = ({
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
      {/* Semi-circle gauge */}
      <path
        d="M4 15C4 10 7.5 6 12 6C16.5 6 20 10 20 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Gauge ticks */}
      <path d="M6 14L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 11L8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 9V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 11L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 14L19 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

      {/* Needle */}
      <path
        d="M12 15L14 11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="15" r="1.5" fill="currentColor" />
    </svg>
  );
};

export default TokenMeter;
