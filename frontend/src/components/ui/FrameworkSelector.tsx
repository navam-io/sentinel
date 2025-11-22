import React from 'react';
import { GraphNodes } from '../icons';

export interface Framework {
  id: string;
  name: string;
  type: 'langgraph' | 'claude-agent-sdk' | 'openai-agents-sdk' | 'strands';
}

export interface FrameworkSelectorProps {
  frameworks: Framework[];
  selected?: Framework;
  onSelect: (framework: Framework) => void;
  className?: string;
}

/**
 * FrameworkSelector Component
 *
 * Dropdown selector for agentic frameworks (spec-03.md)
 * Priority order: LangGraph → Claude Agent SDK → OpenAI → Strands
 */
export const FrameworkSelector: React.FC<FrameworkSelectorProps> = ({
  frameworks,
  selected,
  onSelect,
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <GraphNodes size={18} className="text-sentinel-primary" />
        <select
          value={selected?.id || ''}
          onChange={(e) => {
            const framework = frameworks.find((f) => f.id === e.target.value);
            if (framework) onSelect(framework);
          }}
          className="
            sentinel-input
            pr-8 py-1.5 text-sm
            appearance-none
            cursor-pointer
          "
        >
          {!selected && (
            <option value="" disabled>
              Select framework...
            </option>
          )}
          {frameworks.map((framework) => (
            <option key={framework.id} value={framework.id}>
              {framework.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FrameworkSelector;
