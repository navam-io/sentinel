import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

/**
 * Sentinel Logo Icon - Shield with Signal Arcs
 * Constructed from circular backdrop, shield silhouette, and three radiating arcs
 * Style: 2px stroke, rounded ends, geometric minimal
 */
export const SentinelShieldSignal: React.FC<IconProps> = ({
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
      {/* Circular backdrop */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Shield silhouette */}
      <path
        d="M12 4L8 6V10C8 13 10 16 12 17C14 16 16 13 16 10V6L12 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Three radiating signal arcs */}
      <path
        d="M15 9C15.5 9.5 16 10.5 16 11.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M17 8C18 9 19 11 19 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M19 7C20.5 8.5 21.5 11 21.5 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default SentinelShieldSignal;
