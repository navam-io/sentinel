import React from 'react';
import { FileText, Tag } from 'lucide-react';
import type { TestCategory } from '../../types/test-spec';
import { getCategoryConfig } from '../../lib/categoryConfig';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TestCategory;
  tags: string[];
  model: string;
  provider: string;
  yamlContent: string;
}

export interface TemplateCardProps {
  template: Template;
  onLoad: (template: Template) => void;
  onPreview?: (template: Template) => void;
  className?: string;
}

/**
 * TemplateCard Component
 *
 * Card displaying template information with preview and load actions
 * Part of Feature 7: Template Gallery & Test Suites
 */
export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onLoad,
  onPreview,
  className = '',
}) => {
  const categoryConfig = getCategoryConfig(template.category);
  const categoryColor = categoryConfig.color;

  return (
    <div
      className={`
        bg-sentinel-bg-elevated border border-sentinel-border rounded-md p-3
        hover:border-sentinel-primary hover:shadow-sm
        transition-all duration-160
        ${className}
      `}
    >
      {/* Header with icon and category */}
      <div className="flex items-start justify-between mb-2">
        <FileText size={16} className="text-sentinel-primary flex-shrink-0" />
        <span
          className={`
            px-2 py-1 rounded text-[0.7rem] font-semibold uppercase tracking-wide text-white
            ${categoryColor}
          `}
        >
          {categoryConfig.label}
        </span>
      </div>

      {/* Template name */}
      <h3 className="text-sm font-semibold text-sentinel-text mb-1.5 leading-tight">
        {template.name}
      </h3>

      {/* Description */}
      <p className="text-xs text-sentinel-text-muted mb-2.5 leading-relaxed line-clamp-3">
        {template.description}
      </p>

      {/* Model info */}
      <div className="flex items-center gap-1.5 mb-2.5 text-[0.65rem] text-sentinel-text-muted">
        <span className="font-mono">{template.model}</span>
        <span className="opacity-50">•</span>
        <span>{template.provider}</span>
      </div>

      {/* Tags */}
      {template.tags.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap mb-3">
          <Tag size={10} className="text-sentinel-text-muted" />
          {template.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="
                px-1 py-0.5 rounded text-[0.65rem]
                bg-sentinel-surface border border-sentinel-border
                text-sentinel-text-muted
              "
            >
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="text-[0.65rem] text-sentinel-text-muted">
              +{template.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {onPreview && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview(template);
            }}
            className="
              flex-1 px-2 py-1 rounded text-xs
              bg-sentinel-surface border border-sentinel-border
              text-sentinel-text
              hover:bg-sentinel-hover
              transition-colors duration-120
            "
          >
            Preview
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLoad(template);
          }}
          className="
            flex-1 px-2 py-1 rounded text-xs font-medium
            bg-sentinel-primary text-sentinel-bg
            hover:bg-sentinel-primary-dark
            transition-colors duration-120
          "
        >
          Load to Canvas
        </button>
      </div>
    </div>
  );
};

export default TemplateCard;
