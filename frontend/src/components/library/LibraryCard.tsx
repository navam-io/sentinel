import { Eye, Plus, Edit2, Trash2, ChevronDown, Sparkles, User, Folder } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { TestDefinition, TestCategory } from '../../types/test-spec';
import { getCategoryConfig, CATEGORY_CONFIG } from '../../lib/categoryConfig';

export interface LibraryCardProps {
  test: TestDefinition;
  suites: Array<{ id: string; name: string; tests: Array<{ id: string; name: string }> }>;
  onLoad: (testId: number) => void;
  onRun: (testId: number) => void;
  onAddToSuite: (testId: number, suiteId: string) => void;
  onRename?: (testId: number, newName: string, category?: TestCategory) => void;
  onDelete?: (testId: number) => void;
}

export function LibraryCard({
  test,
  suites,
  onLoad,
  onRun,
  onAddToSuite,
  onRename,
  onDelete,
}: LibraryCardProps) {
  const [addToSuiteOpen, setAddToSuiteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(test.name);
  const [newCategory, setNewCategory] = useState<TestCategory | undefined>(test.category);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const categoryConfig = getCategoryConfig(test.category);
  const isTemplate = test.is_template ?? false;

  // Find suites that contain this test
  const assignedSuites = useMemo(() => {
    return suites.filter(suite =>
      suite.tests?.some(item => item.id === String(test.id))
    );
  }, [suites, test.id]);

  const handleRename = () => {
    if (newName.trim() && onRename) {
      const hasChanges = newName !== test.name || newCategory !== test.category;
      if (hasChanges) {
        onRename(test.id, newName.trim(), newCategory);
      }
    }
    setIsRenaming(false);
    setCategoryDropdownOpen(false);
  };

  return (
    <div
      className="group relative bg-sentinel-surface border border-sentinel-border rounded-lg p-4 hover:border-sentinel-primary transition-all duration-200"
      data-testid={`library-card-${test.id}`}
    >
      {/* Title with Icon Prefix */}
      <div className="mb-2">
        {isRenaming && !isTemplate ? (
          <div className="space-y-2">
            {/* Name Input */}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500 flex-shrink-0" aria-label="User Test" />
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => {
                  // Delay to allow category dropdown clicks
                  setTimeout(handleRename, 200);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') {
                    setNewName(test.name);
                    setNewCategory(test.category);
                    setIsRenaming(false);
                    setCategoryDropdownOpen(false);
                  }
                }}
                className="flex-1 px-2 py-1 text-sm font-semibold bg-sentinel-bg border border-sentinel-primary rounded text-sentinel-text focus:outline-none"
                autoFocus
                data-testid={`rename-input-${test.id}`}
              />
            </div>

            {/* Category Dropdown */}
            <div className="relative ml-6">
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="w-full flex items-center justify-between px-2 py-1 text-xs bg-sentinel-bg border border-sentinel-border rounded text-sentinel-text hover:bg-sentinel-hover transition-colors"
                data-testid={`category-dropdown-${test.id}`}
              >
                <span>{getCategoryConfig(newCategory).label}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {categoryDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setCategoryDropdownOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-1 w-full bg-sentinel-surface border border-sentinel-border rounded-md shadow-lg z-20 max-h-48 overflow-y-auto">
                    <div className="py-1">
                      {/* Uncategorized option */}
                      <button
                        onClick={() => {
                          setNewCategory(undefined);
                          setCategoryDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-sentinel-text hover:bg-sentinel-hover transition-colors"
                        data-testid="category-option-uncategorized"
                      >
                        Uncategorized
                      </button>
                      {/* All categories */}
                      {(Object.keys(CATEGORY_CONFIG) as TestCategory[]).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setNewCategory(cat);
                            setCategoryDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-sentinel-text hover:bg-sentinel-hover transition-colors"
                          data-testid={`category-option-${cat}`}
                        >
                          {CATEGORY_CONFIG[cat].label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {isTemplate ? (
              <Sparkles className="w-4 h-4 text-yellow-500 flex-shrink-0" aria-label="Template" />
            ) : (
              <User className="w-4 h-4 text-blue-500 flex-shrink-0" aria-label="User Test" />
            )}
            <h3 className="text-sm font-semibold text-sentinel-text truncate">
              {test.name}
            </h3>
          </div>
        )}
      </div>

      {/* Description */}
      {test.description && (
        <p className="text-xs text-sentinel-text-muted line-clamp-2 mb-2">
          {test.description}
        </p>
      )}

      {/* Suite Indicator */}
      {assignedSuites.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3">
          <Folder className="w-3 h-3 text-sentinel-text-muted" />
          <span className="text-xs text-sentinel-text-muted">
            {assignedSuites.map(s => s.name).join(', ')}
          </span>
        </div>
      )}

      {/* Category Badge - Bottom Right (hide when delete confirmation showing) */}
      {!deleteConfirm && (
        <div className="absolute bottom-3 right-3">
          <span className={`${categoryConfig.color} text-white text-xs font-medium px-2 py-0.5 rounded`}>
            {categoryConfig.label}
          </span>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex items-center gap-1 pt-2 border-t border-sentinel-border opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Load to Canvas */}
        <button
          onClick={() => onLoad(test.id)}
          className="p-1.5 hover:bg-sentinel-hover rounded transition-colors"
          title="Load to canvas"
          data-testid={`load-${test.id}`}
        >
          <Eye className="w-4 h-4 text-sentinel-text-muted" />
        </button>

        {/* Add to Suite (Dropdown) */}
        <div className="relative">
          <button
            onClick={() => setAddToSuiteOpen(!addToSuiteOpen)}
            className="p-1.5 hover:bg-sentinel-hover rounded transition-colors flex items-center gap-0.5"
            title="Add to suite"
            data-testid={`add-to-suite-${test.id}`}
          >
            <Plus className="w-4 h-4 text-sentinel-primary" />
            <ChevronDown className="w-3 h-3 text-sentinel-primary" />
          </button>

          {addToSuiteOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setAddToSuiteOpen(false)}
              />
              <div className="absolute left-0 top-full mt-1 w-48 bg-sentinel-surface border border-sentinel-border rounded-md shadow-lg z-20">
                <div className="py-1 max-h-48 overflow-y-auto">
                  {suites.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-sentinel-text-muted">
                      No suites available
                    </div>
                  ) : (
                    suites.map((suite) => (
                      <button
                        key={suite.id}
                        onClick={() => {
                          onAddToSuite(test.id, suite.id);
                          setAddToSuiteOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-sentinel-text hover:bg-sentinel-hover transition-colors"
                        data-testid={`suite-option-${suite.id}`}
                      >
                        {suite.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Rename (only for user tests) */}
        {!isTemplate && onRename && (
          <button
            onClick={() => {
              setIsRenaming(true);
              setNewName(test.name);
              setNewCategory(test.category);
            }}
            className="p-1.5 hover:bg-sentinel-hover rounded transition-colors"
            title="Rename"
            data-testid={`rename-${test.id}`}
          >
            <Edit2 className="w-4 h-4 text-sentinel-text-muted" />
          </button>
        )}

        {/* Delete (only for user tests) - Last button, left aligned */}
        {!isTemplate && onDelete && (
          <>
            {deleteConfirm ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    onDelete(test.id);
                    setDeleteConfirm(false);
                  }}
                  className="px-2 py-1 text-xs bg-sentinel-error text-white rounded hover:opacity-80"
                  data-testid={`confirm-delete-${test.id}`}
                >
                  Confirm
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-2 py-1 text-xs bg-sentinel-surface text-sentinel-text rounded hover:bg-sentinel-hover"
                  data-testid={`cancel-delete-${test.id}`}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="p-1.5 hover:bg-sentinel-hover rounded transition-colors"
                title="Delete"
                data-testid={`delete-${test.id}`}
              >
                <Trash2 className="w-4 h-4 text-sentinel-error" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
