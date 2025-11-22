import React from 'react';

export interface TopbarProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Topbar Component
 *
 * Top navigation bar for model selector, project selector, etc.
 * - Follows Sentinel design system (spec-03.md)
 */
export const Topbar: React.FC<TopbarProps> = ({
  children,
  className = '',
}) => {
  return (
    <header
      className={`
        h-14 px-4
        bg-sentinel-bg-elevated border-b border-sentinel-border
        flex items-center gap-4
        ${className}
      `}
    >
      {children}
    </header>
  );
};

export default Topbar;
