import React from 'react';

export interface DashboardLayoutProps {
  sidebar?: React.ReactNode;
  topbar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * DashboardLayout Component
 *
 * Main app layout with sidebar, topbar, and content pane
 * Follows the layout system from spec-03.md:
 *
 * ┌───────────────────────────────────────────────┐
 * │ Top Nav (Model Selector, Project Selector)    │
 * ├───────────┬───────────────────────────────────┤
 * │ Side Nav  │ Main Pane                         │
 * │           │ - Page Header                     │
 * │           │ - Content / Tables / Charts       │
 * │           │ - Inspector Panel (optional)      │
 * └───────────┴───────────────────────────────────┘
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  sidebar,
  topbar,
  children,
  className = '',
}) => {
  return (
    <div className={`h-screen flex flex-col bg-sentinel-bg ${className}`}>
      {/* Topbar */}
      {topbar && <div className="flex-shrink-0">{topbar}</div>}

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebar && <div className="flex-shrink-0">{sidebar}</div>}

        {/* Main content pane */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
