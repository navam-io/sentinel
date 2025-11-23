import { useState } from 'react';
import { Eye, Play, Plus, Trash2, Search, ChevronDown } from 'lucide-react';
import type { TestDefinition } from '../../services/api';

export interface MyTestsProps {
  tests: TestDefinition[];
  loading: boolean;
  suites: Array<{ id: string; name: string }>;
  onLoadTest: (testId: number) => void;
  onRunTest: (testId: number) => void;
  onDeleteTest: (testId: number) => void;
  onAddToSuite: (testId: number, suiteId: string) => void;
  onRefresh: () => void;
}

export function MyTests({
  tests,
  loading,
  suites,
  onLoadTest,
  onRunTest,
  onDeleteTest,
  onAddToSuite,
  onRefresh,
}: MyTestsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [addToSuiteOpen, setAddToSuiteOpen] = useState<number | null>(null);

  // Filter tests based on search
  const filteredTests = tests.filter((test) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      test.name.toLowerCase().includes(query) ||
      (test.description && test.description.toLowerCase().includes(query))
    );
  });

  const handleAddToSuite = (testId: number, suiteId: string) => {
    onAddToSuite(testId, suiteId);
    setAddToSuiteOpen(null);
  };

  return (
    <div className="border-b border-sentinel-border pb-4" data-testid="my-tests">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="text-sm font-semibold text-sentinel-text">My Tests</h3>
        <button
          onClick={onRefresh}
          className="text-xs text-sentinel-text-muted hover:text-sentinel-text transition-colors"
          title="Refresh tests"
        >
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sentinel-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tests..."
            className="w-full pl-9 pr-3 py-1.5 bg-sentinel-surface border border-sentinel-border rounded text-sm text-sentinel-text placeholder-sentinel-text-muted focus:outline-none focus:ring-2 focus:ring-sentinel-primary"
            data-testid="my-tests-search"
          />
        </div>
      </div>

      {/* Tests List */}
      <div className="px-2 max-h-64 overflow-y-auto" data-testid="my-tests-list">
        {loading ? (
          <div className="text-center py-8 text-sm text-sentinel-text-muted">
            Loading tests...
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="text-center py-8 text-sm text-sentinel-text-muted">
            {searchQuery ? 'No tests match your search' : 'No saved tests yet'}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className="group flex items-center gap-2 p-2 bg-sentinel-surface hover:bg-sentinel-hover rounded-lg transition-colors duration-150"
                data-testid={`my-test-${test.id}`}
              >
                {/* Test Info */}
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => onLoadTest(test.id)}
                    className="text-left w-full"
                    title="Click to load test to canvas"
                  >
                    <div className="text-sm font-medium text-sentinel-text truncate">
                      {test.name}
                    </div>
                    {test.description && (
                      <div className="text-xs text-sentinel-text-muted truncate">
                        {test.description}
                      </div>
                    )}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Load to Canvas */}
                  <button
                    onClick={() => onLoadTest(test.id)}
                    className="p-1.5 hover:bg-sentinel-active rounded transition-colors duration-150"
                    title="Load to canvas"
                    data-testid={`load-test-${test.id}`}
                  >
                    <Eye className="w-4 h-4 text-sentinel-text-muted" />
                  </button>

                  {/* Run Test */}
                  <button
                    onClick={() => onRunTest(test.id)}
                    className="p-1.5 hover:bg-sentinel-active rounded transition-colors duration-150"
                    title="Run test"
                    data-testid={`run-test-${test.id}`}
                  >
                    <Play className="w-4 h-4 text-sentinel-success" />
                  </button>

                  {/* Add to Suite (Dropdown) */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setAddToSuiteOpen(addToSuiteOpen === test.id ? null : test.id)
                      }
                      className="p-1.5 hover:bg-sentinel-active rounded transition-colors duration-150 flex items-center gap-0.5"
                      title="Add to suite"
                      data-testid={`add-to-suite-${test.id}`}
                    >
                      <Plus className="w-4 h-4 text-sentinel-primary" />
                      <ChevronDown className="w-3 h-3 text-sentinel-primary" />
                    </button>

                    {/* Dropdown Menu */}
                    {addToSuiteOpen === test.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-sentinel-surface border border-sentinel-border rounded-md shadow-lg z-10">
                        <div className="py-1">
                          {suites.length === 0 ? (
                            <div className="px-3 py-2 text-xs text-sentinel-text-muted">
                              No suites available
                            </div>
                          ) : (
                            suites.map((suite) => (
                              <button
                                key={suite.id}
                                onClick={() => handleAddToSuite(test.id, suite.id)}
                                className="w-full text-left px-3 py-2 text-sm text-sentinel-text hover:bg-sentinel-hover transition-colors"
                                data-testid={`add-to-suite-option-${suite.id}`}
                              >
                                {suite.name}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Delete */}
                  {deleteConfirm === test.id ? (
                    <div className="flex items-center gap-1 ml-1">
                      <button
                        onClick={() => {
                          onDeleteTest(test.id);
                          setDeleteConfirm(null);
                        }}
                        className="px-2 py-1 text-xs bg-sentinel-error text-white rounded hover:opacity-80"
                        data-testid={`confirm-delete-test-${test.id}`}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-2 py-1 text-xs bg-sentinel-surface text-sentinel-text rounded hover:bg-sentinel-hover"
                        data-testid={`cancel-delete-test-${test.id}`}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(test.id)}
                      className="p-1.5 hover:bg-sentinel-active rounded transition-colors duration-150"
                      title="Delete test"
                      data-testid={`delete-test-${test.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-sentinel-error" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
