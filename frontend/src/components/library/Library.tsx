import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { LibraryCard } from './LibraryCard';
import type { TestDefinition, TestCategory } from '../../types/test-spec';
import { CATEGORY_CONFIG } from '../../lib/categoryConfig';

export interface LibraryProps {
  tests: TestDefinition[];
  templates: TestDefinition[];
  loading: boolean;
  suites: Array<{ id: string; name: string; tests: Array<{ id: string; name: string }> }>;
  onLoadTest: (testId: number) => void;
  onRunTest: (testId: number) => void;
  onAddToSuite: (testId: number, suiteId: string) => void;
  onRenameTest: (testId: number, newName: string, newDescription: string, category?: TestCategory) => void;
  onDeleteTest: (testId: number) => void;
}

type CategoryFilter = 'all' | TestCategory;
type TypeFilter = 'all' | 'templates' | 'user';

export function Library({
  tests,
  templates,
  loading,
  suites,
  onLoadTest,
  onRunTest,
  onAddToSuite,
  onRenameTest,
  onDeleteTest,
}: LibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  // Combine templates and user tests
  const allItems = useMemo(() => {
    return [...templates, ...tests];
  }, [templates, tests]);

  // Get unique categories from all items
  const categories = useMemo(() => {
    const cats = new Set(allItems.map((item) => item.category).filter(Boolean));
    return ['all', ...Array.from(cats)] as CategoryFilter[];
  }, [allItems]);

  // Filter items
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Type filter
      if (typeFilter === 'templates' && !item.is_template) return false;
      if (typeFilter === 'user' && item.is_template) return false;

      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          (item.description && item.description.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [allItems, typeFilter, categoryFilter, searchQuery]);

  return (
    <div className="h-full flex flex-col" data-testid="library">
      {/* Header */}
      <div className="border-b border-sentinel-border p-4">
        <h2 className="text-sm font-semibold text-sentinel-text mb-1">
          Library
        </h2>
        <p className="text-xs text-sentinel-text-muted">
          Browse templates and your saved tests
        </p>
      </div>

      {/* Filters */}
      <div className="border-b border-sentinel-border p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sentinel-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search library..."
            className="w-full pl-9 pr-3 py-1.5 bg-sentinel-surface border border-sentinel-border rounded text-sm text-sentinel-text placeholder-sentinel-text-muted focus:outline-none focus:ring-2 focus:ring-sentinel-primary"
            data-testid="library-search"
          />
        </div>

        {/* Type Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              typeFilter === 'all'
                ? 'bg-sentinel-primary text-sentinel-bg'
                : 'bg-sentinel-surface text-sentinel-text hover:bg-sentinel-hover'
            }`}
            data-testid="filter-all"
          >
            All ({allItems.length})
          </button>
          <button
            onClick={() => setTypeFilter('templates')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              typeFilter === 'templates'
                ? 'bg-sentinel-primary text-sentinel-bg'
                : 'bg-sentinel-surface text-sentinel-text hover:bg-sentinel-hover'
            }`}
            data-testid="filter-templates"
          >
            Templates ({templates.length})
          </button>
          <button
            onClick={() => setTypeFilter('user')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              typeFilter === 'user'
                ? 'bg-sentinel-primary text-sentinel-bg'
                : 'bg-sentinel-surface text-sentinel-text hover:bg-sentinel-hover'
            }`}
            data-testid="filter-user"
          >
            My Tests ({tests.length})
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                categoryFilter === cat
                  ? 'bg-sentinel-primary text-sentinel-bg'
                  : 'bg-sentinel-surface text-sentinel-text hover:bg-sentinel-hover'
              }`}
              data-testid={`category-${cat}`}
            >
              {cat === 'all' ? 'All Categories' : CATEGORY_CONFIG[cat as TestCategory].label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-8 text-sm text-sentinel-text-muted">
            Loading library...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8 text-sm text-sentinel-text-muted">
            {searchQuery || categoryFilter !== 'all' || typeFilter !== 'all'
              ? 'No items match your filters'
              : 'No items in library'}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredItems.map((item) => (
              <LibraryCard
                key={item.id}
                test={item}
                suites={suites}
                onLoad={onLoadTest}
                onRun={onRunTest}
                onAddToSuite={onAddToSuite}
                onRename={!item.is_template ? onRenameTest : undefined}
                onDelete={!item.is_template ? onDeleteTest : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
