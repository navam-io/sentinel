import React from 'react';
import type { IconProps } from './SentinelShieldSignal';

/**
 * Test Flask Icon - Test spec representation
 * Style: Flask with spark, 2px stroke, minimal
 */
export const TestFlask: React.FC<IconProps> = ({
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
      {/* Flask outline */}
      <path
        d="M9 3V9L5 17C4.5 18 5 20 6.5 20H17.5C19 20 19.5 18 19 17L15 9V3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 3H15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Spark inside flask */}
      <path
        d="M12 12L10 15H14L12 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default TestFlask;
