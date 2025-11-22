import React, { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { TemplateCard, type Template } from './TemplateCard';

export interface TemplateGalleryProps {
  templates: Template[];
  onLoadTemplate: (template: Template) => void;
  onPreviewTemplate?: (template: Template) => void;
  className?: string;
}

type CategoryFilter = 'all' | Template['category'];

/**
 * TemplateGallery Component
 *
 * Browse and load pre-built test templates
 * Part of Feature 7: Template Gallery & Test Suites
 *
 * Features:
 * - Category filtering
 * - Search by name/description/tags
 * - Grid layout with responsive columns
 * - One-click load to canvas
 */
export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  templates,
  onLoadTemplate,
  onPreviewTemplate,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  // Get unique categories from templates
  const categories = useMemo(() => {
    const cats = new Set(templates.map((t) => t.category));
    return ['all', ...Array.from(cats)] as CategoryFilter[];
  }, [templates]);

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      // Category filter
      if (categoryFilter !== 'all' && template.category !== categoryFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          template.name.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [templates, searchQuery, categoryFilter]);

  const categoryLabels: Record<string, string> = {
    all: 'All Templates',
    'qa': 'Q&A',
    'code-generation': 'Code Generation',
    'browser': 'Browser Agents',
    'multi-turn': 'Multi-turn',
    'langgraph': 'LangGraph',
    'safety': 'Safety',
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="border-b border-sentinel-border pb-4">
        <h2 className="text-sm font-semibold text-sentinel-text mb-1">
          Template Gallery
        </h2>
        <p className="text-xs text-sentinel-text-muted">
          Browse and load pre-built test templates to get started quickly
        </p>
      </div>

      {/* Search and filter bar */}
      <div className="flex flex-col gap-3">
        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sentinel-text-muted"
          />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              w-full pl-9 pr-3 py-1.5 rounded text-xs
              bg-sentinel-surface border border-sentinel-border
              text-sentinel-text placeholder-sentinel-text-muted
              focus:outline-none focus:ring-1 focus:ring-sentinel-primary
              focus:border-transparent
            "
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-sentinel-text-muted flex-shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
            className="
              flex-1 px-2 py-1.5 rounded text-xs
              bg-sentinel-surface border border-sentinel-border
              text-sentinel-text
              focus:outline-none focus:ring-1 focus:ring-sentinel-primary
              cursor-pointer
            "
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {categoryLabels[cat] || cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Template count */}
      <div className="text-xs text-sentinel-text-muted">
        Showing {filteredTemplates.length} of {templates.length} templates
      </div>

      {/* Template grid */}
      {filteredTemplates.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onLoad={onLoadTemplate}
              onPreview={onPreviewTemplate}
            />
          ))}
        </div>
      ) : (
        <div className="
          text-center py-8
          text-sentinel-text-muted
        ">
          <p className="text-sm mb-1">No templates found</p>
          <p className="text-xs">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default TemplateGallery;
