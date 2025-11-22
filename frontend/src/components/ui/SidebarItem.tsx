import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface SidebarItemProps {
  icon?: LucideIcon | React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
  className?: string;
}

/**
 * SidebarItem Component
 *
 * Individual item in sidebar navigation
 * - Shows icon + label when expanded
 * - Shows icon only when collapsed
 * - Hover glow effect (spec-03.md)
 */
export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  active = false,
  onClick,
  collapsed = false,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3
        px-4 py-3 rounded-md
        text-sm font-medium
        transition-all duration-120
        ${
          active
            ? 'bg-sentinel-hover text-sentinel-primary shadow-sentinel-glow'
            : 'text-sentinel-text-dim hover:text-sentinel-text hover:bg-sentinel-hover'
        }
        ${collapsed ? 'justify-center' : ''}
        ${className}
      `}
    >
      {Icon && <Icon size={18} className={active ? 'text-sentinel-primary' : ''} />}
      {!collapsed && <span>{label}</span>}
    </button>
  );
};

export default SidebarItem;
