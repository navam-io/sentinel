import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface SidebarProps {
  children: React.ReactNode;
  className?: string;
  defaultCollapsed?: boolean;
}

/**
 * Sidebar Component
 *
 * Layout component for left navigation panel
 * - Default width: 280px
 * - Collapsed width: 80px (icon-only)
 * - Follows Sentinel design system (spec-03.md)
 */
export const Sidebar: React.FC<SidebarProps> = ({
  children,
  className = '',
  defaultCollapsed = false,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <aside
      className={`
        ${collapsed ? 'w-20' : 'w-[280px]'}
        bg-sentinel-bg-elevated border-r border-sentinel-border
        flex flex-col transition-all duration-160
        ${className}
      `}
    >
      {/* Collapse/Expand button */}
      <div className="flex justify-end p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="
            p-2 rounded-md
            text-sentinel-text-dim hover:text-sentinel-primary
            hover:bg-sentinel-hover
            transition-colors duration-120
          "
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </button>
      </div>

      {/* Sidebar content */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </aside>
  );
};

export default Sidebar;
