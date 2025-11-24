import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import YamlPreview from './YamlPreview';
import ExecutionPanel from '../execution/ExecutionPanel';
import { TestToolbar } from '../test';

const RUN_DETAILS_EXPANDED_KEY = 'sentinel-run-details-expanded';

/**
 * TestTab Component
 *
 * Combines YAML editor and execution panel in a single tab.
 * - YAML editor is always visible at top
 * - Run section slides up from bottom when active
 * - Both sections are independently scrollable
 * - Persists expanded/collapsed state in localStorage
 */
function TestTab() {
  // Load persisted state, default to false (collapsed)
  const [isRunExpanded, setIsRunExpanded] = useState(() => {
    const stored = localStorage.getItem(RUN_DETAILS_EXPANDED_KEY);
    return stored === 'true' ? true : false;
  });

  // Persist state changes to localStorage
  useEffect(() => {
    localStorage.setItem(RUN_DETAILS_EXPANDED_KEY, String(isRunExpanded));
  }, [isRunExpanded]);

  return (
    <div className="h-full flex flex-col">
      {/* Test Toolbar */}
      <TestToolbar />

      {/* YAML Editor Section */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isRunExpanded ? 'h-1/2' : 'flex-1'
        }`}
      >
        <div className="h-full overflow-y-auto custom-scrollbar">
          <YamlPreview />
        </div>
      </div>

      {/* Run Section - Collapsible */}
      <div
        className={`border-t border-sentinel-border transition-all duration-300 ease-in-out ${
          isRunExpanded ? 'h-1/2' : 'h-12'
        }`}
      >
        {/* Collapse/Expand Header */}
        <button
          onClick={() => setIsRunExpanded(!isRunExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 bg-sentinel-surface hover:bg-sentinel-hover transition-colors"
        >
          <span className="text-sm font-semibold text-sentinel-text">
            Run Details
          </span>
          {isRunExpanded ? (
            <ChevronDown className="w-4 h-4 text-sentinel-text-muted" />
          ) : (
            <ChevronUp className="w-4 h-4 text-sentinel-text-muted" />
          )}
        </button>

        {/* Run Content */}
        {isRunExpanded && (
          <div className="h-[calc(100%-48px)] overflow-y-auto custom-scrollbar">
            <ExecutionPanel />
          </div>
        )}
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        /* Only show scrollbar during scroll */
        .custom-scrollbar::-webkit-scrollbar-thumb {
          opacity: 0;
          transition: opacity 0.3s;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          opacity: 1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

export default TestTab;
