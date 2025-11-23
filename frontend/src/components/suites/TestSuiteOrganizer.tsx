import { useState, useEffect } from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Play,
  Download,
  ChevronRight,
  ChevronDown,
  ListPlus,
} from 'lucide-react';
import type { TestDefinition } from '../../services/api';

export interface TestSuite {
  id: string;
  name: string;
  description?: string;
  tests: TestSuiteItem[];
  isExpanded?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestSuiteItem {
  id: string;
  name: string;
  status?: 'passed' | 'failed' | 'pending';
  lastRun?: Date;
}

export interface TestSuiteOrganizerProps {
  suites: TestSuite[];
  availableTests: TestDefinition[];
  loadingTests: boolean;
  onCreateSuite: (name: string, description?: string) => void;
  onDeleteSuite: (suiteId: string) => void;
  onRenameSuite: (suiteId: string, newName: string) => void;
  onAddTestToSuite: (suiteId: string, testId: string) => void;
  onRemoveTestFromSuite: (suiteId: string, testId: string) => void;
  onRunSuite: (suiteId: string) => void;
  onRunTest: (suiteId: string, testId: string) => void;
  onExportSuite: (suiteId: string) => void;
  onLoadTest: (testId: string) => void;
}

export function TestSuiteOrganizer({
  suites: initialSuites,
  availableTests,
  loadingTests,
  onCreateSuite,
  onDeleteSuite,
  onRenameSuite,
  onAddTestToSuite,
  onRemoveTestFromSuite,
  onRunSuite,
  onRunTest,
  onExportSuite,
  onLoadTest,
}: TestSuiteOrganizerProps) {
  const [suites, setSuites] = useState<TestSuite[]>(initialSuites);
  const [isCreating, setIsCreating] = useState(false);
  const [newSuiteName, setNewSuiteName] = useState('');
  const [newSuiteDescription, setNewSuiteDescription] = useState('');
  const [editingSuiteId, setEditingSuiteId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [addingTestToSuite, setAddingTestToSuite] = useState<string | null>(null);

  // Update local state when props change
  useEffect(() => {
    setSuites(initialSuites);
  }, [initialSuites]);

  const handleToggleSuite = (suiteId: string) => {
    setSuites(
      suites.map((suite) =>
        suite.id === suiteId ? { ...suite, isExpanded: !suite.isExpanded } : suite
      )
    );
  };

  const handleCreateSuite = () => {
    if (!newSuiteName.trim()) return;

    onCreateSuite(newSuiteName.trim(), newSuiteDescription.trim() || undefined);
    setNewSuiteName('');
    setNewSuiteDescription('');
    setIsCreating(false);
  };

  const handleStartRename = (suite: TestSuite) => {
    setEditingSuiteId(suite.id);
    setEditingName(suite.name);
  };

  const handleSaveRename = () => {
    if (!editingSuiteId || !editingName.trim()) return;

    onRenameSuite(editingSuiteId, editingName.trim());
    setEditingSuiteId(null);
    setEditingName('');
  };

  const handleCancelRename = () => {
    setEditingSuiteId(null);
    setEditingName('');
  };

  const handleDeleteSuite = (suiteId: string) => {
    onDeleteSuite(suiteId);
    setDeleteConfirm(null);
  };

  const getStatusColor = (status?: 'passed' | 'failed' | 'pending') => {
    switch (status) {
      case 'passed':
        return 'text-sentinel-success';
      case 'failed':
        return 'text-sentinel-error';
      case 'pending':
        return 'text-sentinel-warning';
      default:
        return 'text-sentinel-text-muted';
    }
  };

  const getStatusBadge = (status?: 'passed' | 'failed' | 'pending') => {
    if (!status) return null;

    return (
      <span
        className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded ${
          status === 'passed'
            ? 'bg-sentinel-success/20 text-sentinel-success'
            : status === 'failed'
            ? 'bg-sentinel-error/20 text-sentinel-error'
            : 'bg-sentinel-warning/20 text-sentinel-warning'
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col" data-testid="test-suite-organizer">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sentinel-border">
        <h2 className="text-lg font-semibold text-sentinel-text">Test Suites</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-sentinel-primary text-sentinel-bg rounded-md hover:bg-sentinel-primary-dark transition-colors duration-150 text-sm font-medium"
          data-testid="create-suite-button"
        >
          <Plus className="w-4 h-4" />
          New Suite
        </button>
      </div>

      {/* Create Suite Form */}
      {isCreating && (
        <div
          className="p-4 bg-sentinel-bg-elevated border-b border-sentinel-border"
          data-testid="create-suite-form"
        >
          <input
            type="text"
            value={newSuiteName}
            onChange={(e) => setNewSuiteName(e.target.value)}
            placeholder="Suite name"
            className="w-full px-3 py-2 mb-2 bg-sentinel-surface border border-sentinel-border rounded-md text-sentinel-text placeholder-sentinel-text-muted focus:outline-none focus:ring-2 focus:ring-sentinel-primary"
            autoFocus
            data-testid="suite-name-input"
          />
          <input
            type="text"
            value={newSuiteDescription}
            onChange={(e) => setNewSuiteDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-3 py-2 mb-3 bg-sentinel-surface border border-sentinel-border rounded-md text-sentinel-text placeholder-sentinel-text-muted focus:outline-none focus:ring-2 focus:ring-sentinel-primary"
            data-testid="suite-description-input"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateSuite}
              className="px-3 py-1.5 bg-sentinel-primary text-sentinel-bg rounded-md hover:bg-sentinel-primary-dark transition-colors duration-150 text-sm font-medium"
              data-testid="confirm-create-suite"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewSuiteName('');
                setNewSuiteDescription('');
              }}
              className="px-3 py-1.5 bg-sentinel-surface text-sentinel-text rounded-md hover:bg-sentinel-hover transition-colors duration-150 text-sm"
              data-testid="cancel-create-suite"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Suites List */}
      <div className="flex-1 overflow-y-auto" data-testid="suites-list">
        {suites.length === 0 ? (
          <div className="p-8 text-center text-sentinel-text-muted">
            <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No test suites yet</p>
            <p className="text-xs mt-1">Create a suite to organize your tests</p>
          </div>
        ) : (
          <div className="p-2">
            {suites.map((suite) => (
              <div key={suite.id} className="mb-2" data-testid={`suite-${suite.id}`}>
                {/* Suite Header */}
                <div className="flex items-center gap-2 p-2 bg-sentinel-surface hover:bg-sentinel-hover rounded-lg transition-colors duration-150">
                  <button
                    onClick={() => handleToggleSuite(suite.id)}
                    className="p-1 hover:bg-sentinel-active rounded transition-colors duration-150"
                    data-testid={`toggle-suite-${suite.id}`}
                  >
                    {suite.isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-sentinel-text" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-sentinel-text" />
                    )}
                  </button>

                  {suite.isExpanded ? (
                    <FolderOpen className="w-5 h-5 text-sentinel-primary" />
                  ) : (
                    <Folder className="w-5 h-5 text-sentinel-primary" />
                  )}

                  {editingSuiteId === suite.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename();
                        if (e.key === 'Escape') handleCancelRename();
                      }}
                      onBlur={handleSaveRename}
                      className="flex-1 px-2 py-1 bg-sentinel-bg border border-sentinel-primary rounded text-sentinel-text focus:outline-none"
                      autoFocus
                      data-testid={`edit-suite-name-${suite.id}`}
                    />
                  ) : (
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium text-sentinel-text">{suite.name}</span>
                        <span className="ml-2 text-xs text-sentinel-text-muted">
                          ({suite.tests.length} tests)
                        </span>
                      </div>
                      {suite.description && (
                        <p className="text-xs text-sentinel-text-muted mt-0.5">
                          {suite.description}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Suite Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onRunSuite(suite.id)}
                      className="p-1.5 hover:bg-sentinel-active rounded transition-colors duration-150"
                      title="Run all tests"
                      data-testid={`run-suite-${suite.id}`}
                    >
                      <Play className="w-4 h-4 text-sentinel-success" />
                    </button>
                    <button
                      onClick={() => onExportSuite(suite.id)}
                      className="p-1.5 hover:bg-sentinel-active rounded transition-colors duration-150"
                      title="Export suite"
                      data-testid={`export-suite-${suite.id}`}
                    >
                      <Download className="w-4 h-4 text-sentinel-text-muted" />
                    </button>
                    <button
                      onClick={() => handleStartRename(suite)}
                      className="p-1.5 hover:bg-sentinel-active rounded transition-colors duration-150"
                      title="Rename suite"
                      data-testid={`rename-suite-${suite.id}`}
                    >
                      <Edit2 className="w-4 h-4 text-sentinel-text-muted" />
                    </button>
                    {deleteConfirm === suite.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteSuite(suite.id)}
                          className="px-2 py-1 text-xs bg-sentinel-error text-white rounded hover:opacity-80"
                          data-testid={`confirm-delete-suite-${suite.id}`}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 text-xs bg-sentinel-surface text-sentinel-text rounded hover:bg-sentinel-hover"
                          data-testid={`cancel-delete-suite-${suite.id}`}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(suite.id)}
                        className="p-1.5 hover:bg-sentinel-active rounded transition-colors duration-150"
                        title="Delete suite"
                        data-testid={`delete-suite-${suite.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-sentinel-error" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Tests List (when expanded) */}
                {suite.isExpanded && (
                  <div className="ml-8 mt-1 space-y-1" data-testid={`suite-tests-${suite.id}`}>
                    {/* Add Test Button */}
                    {addingTestToSuite === suite.id ? (
                      <div className="p-2 bg-sentinel-bg-elevated rounded border border-sentinel-primary">
                        <div className="text-xs text-sentinel-text-muted mb-2">Select a test to add:</div>
                        {loadingTests ? (
                          <div className="p-2 text-center text-xs text-sentinel-text-muted">
                            Loading tests...
                          </div>
                        ) : availableTests.length === 0 ? (
                          <div className="p-2 text-center text-xs text-sentinel-text-muted">
                            No saved tests available. Create a test first.
                          </div>
                        ) : (
                          <div className="max-h-48 overflow-y-auto space-y-1">
                            {availableTests.map((test) => (
                              <button
                                key={test.id}
                                onClick={() => {
                                  onAddTestToSuite(suite.id, test.id.toString());
                                  setAddingTestToSuite(null);
                                }}
                                className="w-full text-left p-2 bg-sentinel-surface hover:bg-sentinel-hover rounded text-sm text-sentinel-text transition-colors duration-150"
                              >
                                <div className="font-medium">{test.name}</div>
                                {test.description && (
                                  <div className="text-xs text-sentinel-text-muted line-clamp-1">
                                    {test.description}
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={() => setAddingTestToSuite(null)}
                            className="px-2 py-1 text-xs bg-sentinel-surface text-sentinel-text rounded hover:bg-sentinel-hover"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingTestToSuite(suite.id)}
                        className="w-full p-2 bg-sentinel-bg-elevated hover:bg-sentinel-hover rounded border border-dashed border-sentinel-border flex items-center justify-center gap-2 text-sm text-sentinel-text-muted hover:text-sentinel-text transition-colors duration-150"
                        data-testid={`add-test-to-suite-${suite.id}`}
                      >
                        <ListPlus className="w-4 h-4" />
                        Add Test to Suite
                      </button>
                    )}

                    {suite.tests.length === 0 ? (
                      <div className="p-4 text-center text-sentinel-text-muted text-sm">
                        No tests in this suite yet
                      </div>
                    ) : (
                      suite.tests.map((test) => (
                        <div
                          key={test.id}
                          className="flex items-center gap-2 p-2 bg-sentinel-bg-elevated hover:bg-sentinel-hover rounded transition-colors duration-150"
                          data-testid={`test-${test.id}`}
                        >
                          <FileText className={`w-4 h-4 ${getStatusColor(test.status)}`} />
                          <button
                            onClick={() => onLoadTest(test.id)}
                            className="flex-1 text-left text-sm text-sentinel-text hover:text-sentinel-primary transition-colors duration-150"
                          >
                            {test.name}
                          </button>
                          {getStatusBadge(test.status)}
                          {test.lastRun && (
                            <span className="text-xs text-sentinel-text-muted">
                              {new Date(test.lastRun).toLocaleDateString()}
                            </span>
                          )}
                          <button
                            onClick={() => onRunTest(suite.id, test.id)}
                            className="p-1 hover:bg-sentinel-active rounded transition-colors duration-150"
                            title="Run test"
                            data-testid={`run-test-${test.id}`}
                          >
                            <Play className="w-3 h-3 text-sentinel-success" />
                          </button>
                          <button
                            onClick={() => onRemoveTestFromSuite(suite.id, test.id)}
                            className="p-1 hover:bg-sentinel-active rounded transition-colors duration-150"
                            title="Remove from suite"
                            data-testid={`remove-test-${test.id}`}
                          >
                            <Trash2 className="w-3 h-3 text-sentinel-error" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
