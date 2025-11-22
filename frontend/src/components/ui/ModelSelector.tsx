import React from 'react';
import { ModelCube } from '../icons';

export interface Model {
  id: string;
  name: string;
  provider: 'anthropic' | 'openai' | 'bedrock' | 'huggingface' | 'ollama';
}

export interface ModelSelectorProps {
  models: Model[];
  selected?: Model;
  onSelect: (model: Model) => void;
  className?: string;
}

/**
 * ModelSelector Component
 *
 * Dropdown selector for AI models (spec-03.md)
 * Supports: Anthropic, OpenAI, Bedrock, HuggingFace, Ollama
 */
export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selected,
  onSelect,
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <ModelCube size={18} className="text-sentinel-secondary" />
        <select
          value={selected?.id || ''}
          onChange={(e) => {
            const model = models.find((m) => m.id === e.target.value);
            if (model) onSelect(model);
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
              Select model...
            </option>
          )}
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name} ({model.provider})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ModelSelector;
