import React from 'react';
import type { IconProps } from './SentinelShieldSignal';

/**
 * Diff Text Icon - Output diff representation
 * Style: Brackets with +/-, 2px stroke, minimal
 */
export const DiffText: React.FC<IconProps> = ({
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
      {/* Left bracket */}
      <path
        d="M8 6H5V18H8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right bracket */}
      <path
        d="M16 6H19V18H16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Plus sign (added) */}
      <path
        d="M10 9H14M12 7V11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Minus sign (removed) */}
      <path
        d="M10 15H14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default DiffText;
