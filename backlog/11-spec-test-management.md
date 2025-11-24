# Specification: Unified Test Management System

**Document Version**: 1.0
**Created**: November 24, 2025
**Target Release**: v0.29.0+
**Status**: Planning
**Priority**: P1 - Core UX Improvement

## Executive Summary

This specification addresses fundamental UX issues with test creation, editing, saving, and management in Sentinel. The current architecture has multiple disconnected save points, inconsistent state management, and confusing workflows that lead to duplicate tests and lost work.

**Goal**: Create a unified, intuitive test management experience where users can seamlessly create, edit, save, and compare tests without confusion about where their work is stored or how to access it.

## Current State Analysis

### Architecture Overview

```
Current Architecture (Problematic):

┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  YamlPreview.tsx          TestManager.tsx         Library.tsx       │
│  ┌────────────────┐       ┌────────────────┐     ┌──────────────┐  │
│  │ Save button    │       │ Auto-save      │     │ Rename test  │  │
│  │ (creates NEW)  │       │ Save/Save As   │     │ Delete test  │  │
│  │ Edit/Apply     │       │ (update/create)│     │ Load test    │  │
│  │ Import/Download│       └───────┬────────┘     └──────┬───────┘  │
│  └───────┬────────┘               │                     │          │
│          │                        │                     │          │
│          └────────────────────────┼─────────────────────┘          │
│                                   │                                 │
│  canvasStore.ts                   │    savedTestInfo: { id?, name, │
│  ┌────────────────────────────────┼───  description }               │
│  │ nodes, edges, savedTestInfo    │                                 │
│  └────────────────────────────────┴─────────────────────────────────┤
│                                   │                                 │
├───────────────────────────────────┼─────────────────────────────────┤
│                           BACKEND                                    │
├───────────────────────────────────┼─────────────────────────────────┤
│                                   ▼                                 │
│  SQLite Database (~/.sentinel/sentinel.db)                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ test_definitions: id, name, description, spec_json, spec_yaml,│  │
│  │                   canvas_state, provider, model, category,    │  │
│  │                   is_template, version, created_at, updated_at│  │
│  │ test_runs: id, test_definition_id, provider, model, status,   │  │
│  │            latency_ms, tokens, cost, timestamps               │  │
│  │ test_results: id, test_run_id, assertion_type, passed, etc.  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Filesystem (artifacts/)                                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ templates/*.yaml - Built-in templates (read-only)             │  │
│  │ (NO user tests folder - tests only in database!)              │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Critical Issues Identified

#### 1. Multiple Disconnected Save Points

| Location | Action | Behavior | Problem |
|----------|--------|----------|---------|
| YamlPreview | "Save" button | Always `createTest()` - creates NEW | Creates duplicates |
| TestManager | "Save"/"Save As" | Uses `testId` to decide create/update | Separate state from YamlPreview |
| TestManager | Auto-save toggle | Debounced save | Not connected to YamlPreview |
| Library | Rename/Delete | Updates via API | Works, but separate from editing |

**Impact**: Users can accidentally create many copies of the same test, lose track of which version is current.

#### 2. Inconsistent State Management

```typescript
// YamlPreview tracks:
savedTestInfo: { name: string, description: string } // NO ID!

// TestManager tracks:
testId: number | null
testName: string
description: string

// canvasStore tracks:
savedTestInfo: { id?: number, name: string, description: string }
activeTestId: string | null
activeTemplateId: string | null
```

**Impact**: ID is optional, leading to "create vs update" confusion. Components don't share test identity.

#### 3. Templates vs Tests Asymmetry

| Aspect | Templates | User Tests |
|--------|-----------|------------|
| Storage | Filesystem (`artifacts/templates/`) | Database only |
| Format | YAML files | JSON in database |
| Loading | Tauri filesystem API | REST API |
| Git-friendly | Yes (version controlled) | No (binary database) |
| Portable | Yes (copy files) | No (database migration) |

**Impact**: Templates are git-friendly, user tests are not. This violates "visual-first, git-friendly" principle.

#### 4. Confusing Save vs Download

- **Download**: Exports YAML to user's Downloads folder
- **Save**: Persists to SQLite database
- **Neither**: Saves to project folder for git tracking

**Impact**: Users can't version-control their tests alongside code.

#### 5. Comparison View Dependency Issues

```typescript
// ComparisonView requires testId to load runs:
function ComparisonView({ testId }: ComparisonViewProps) {
  // If testId is undefined, comparison doesn't work
  const response = await listRunsForTest(testId);
}
```

**Current Workflow Problems**:
1. Create test on canvas → No testId yet
2. Run test → Creates run, but no test_definition_id link
3. Try to compare → "No runs available" (runs aren't linked to test)

**Impact**: Comparison view is effectively broken for tests that aren't explicitly saved first.

#### 6. Screenshot Review Findings

From the provided screenshot:
- "Multi-city" test shown with pencil icon for renaming
- "Test from Canvas" in YAML (name mismatch)
- Edit/Copy/Import/Download buttons visible
- No clear "Save" button in current view
- "Auto-generated from canvas" subtitle implies unsaved state

**Issues Visible**:
1. Name shown ("Multi-city") doesn't match YAML name ("Test from Canvas")
2. No indication if test is saved or dirty
3. No unified save action visible

## Proposed Architecture

### Design Principles

1. **Single Source of Truth**: One test state, one save point
2. **File-First Storage**: Tests as YAML files (like templates), database for metadata
3. **Git-Friendly**: All test content in version-controllable files
4. **Clear Identity**: Every test has a unique ID and filename
5. **Unified Save**: One "Save" action that does everything
6. **Auto-Save by Default**: Changes are automatically persisted
7. **Dirty State Tracking**: Clear indication when changes are unsaved

### New Architecture

```
Proposed Architecture:

┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Unified Test Editor (TestTab.tsx)                                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ┌─────────────────────────────────────────────────────────┐  │  │
│  │ │ Test Header                                              │  │  │
│  │ │ [● Unsaved] "Multi-city Test" (pencil) | Category: Q&A  │  │  │
│  │ │ Description: What is the capital of France?              │  │  │
│  │ └─────────────────────────────────────────────────────────┘  │  │
│  │ ┌─────────────────────────────────────────────────────────┐  │  │
│  │ │ Actions: [Save ⌘S] [Save As...] [Import] [Export]       │  │  │
│  │ └─────────────────────────────────────────────────────────┘  │  │
│  │ ┌─────────────────────────────────────────────────────────┐  │  │
│  │ │ Monaco YAML Editor (read-only by default, Edit to modify)│  │  │
│  │ └─────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Unified Test Store (useTestStore.ts)                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ currentTest: {                                                │  │
│  │   id: number | null,        // Database ID                    │  │
│  │   filename: string | null,  // e.g., "multi-city-test.yaml"   │  │
│  │   name: string,                                               │  │
│  │   description: string,                                        │  │
│  │   category: TestCategory,                                     │  │
│  │   isTemplate: boolean,      // Read-only if true              │  │
│  │   isDirty: boolean,         // Has unsaved changes            │  │
│  │   lastSaved: Date | null,                                     │  │
│  │ }                                                             │  │
│  │ canvas: { nodes, edges }                                      │  │
│  │                                                               │  │
│  │ Actions:                                                      │  │
│  │ - save(): Save to file + update database                      │  │
│  │ - saveAs(name): Create new file + new database entry          │  │
│  │ - load(testId): Load from file + set as current               │  │
│  │ - updateMetadata(): Update name/description/category          │  │
│  │ - markDirty(): Called on any change                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                           BACKEND                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  SQLite Database (Metadata + Runs Only)                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ test_definitions: id, filename, name, description, category,  │  │
│  │                   provider, model, version, created_at,       │  │
│  │                   updated_at, last_run_at                     │  │
│  │ (NO spec_json, spec_yaml, canvas_state - those are in files!) │  │
│  │                                                               │  │
│  │ test_runs: id, test_definition_id, status, metrics, timestamps│  │
│  │ test_results: id, test_run_id, assertion results              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Filesystem (artifacts/)                                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ templates/*.yaml  - Built-in templates (read-only)            │  │
│  │ tests/*.yaml      - User tests (read-write, git-tracked)      │  │
│  │                                                               │  │
│  │ Example: artifacts/tests/multi-city-test.yaml                 │  │
│  │ ```yaml                                                       │  │
│  │ # Auto-generated metadata (parsed on load)                    │  │
│  │ name: Multi-city Test                                         │  │
│  │ description: What is the capital of France?                   │  │
│  │ category: qa                                                  │  │
│  │ model: gpt-5.1                                                │  │
│  │ provider: openai                                              │  │
│  │ inputs:                                                       │  │
│  │   query: What is the capital of France?                       │  │
│  │ assertions:                                                   │  │
│  │   - must_contain: Paris                                       │  │
│  │ ```                                                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### File Naming Convention

```
artifacts/tests/
├── simple-qa-test.yaml           # Kebab-case, descriptive
├── code-generation-python.yaml
├── multi-city-capitals.yaml
├── browser-agent-search.yaml
└── regression-latency-check.yaml
```

**Naming Rules**:
1. Kebab-case (lowercase, hyphens)
2. Maximum 50 characters
3. Auto-generated from test name if not specified
4. Unique within folder (append number if duplicate: `my-test-2.yaml`)

## Implementation Plan

### Phase 1: Unified Test State (v0.29.0)

**Goal**: Single source of truth for test state

#### 1.1 Create useTestStore.ts

```typescript
interface TestState {
  currentTest: {
    id: number | null;
    filename: string | null;
    name: string;
    description: string;
    category: TestCategory | null;
    isTemplate: boolean;
    isDirty: boolean;
    lastSaved: Date | null;
  } | null;

  // Actions
  setCurrentTest: (test: TestState['currentTest']) => void;
  updateMetadata: (updates: Partial<TestState['currentTest']>) => void;
  markDirty: () => void;
  markClean: () => void;
  clearCurrentTest: () => void;
}
```

#### 1.2 Refactor YamlPreview.tsx

- Remove internal save state (`isSaveMode`, `testName`, `testDescription`)
- Read test info from `useTestStore`
- Single "Save" button that calls unified save action
- Show dirty indicator when changes are unsaved

#### 1.3 Remove/Deprecate TestManager.tsx

- Move necessary functionality to Library tab
- Remove duplicate test name/description inputs
- Remove separate auto-save toggle

#### 1.4 Update canvasStore.ts

- Remove `savedTestInfo` (moved to `useTestStore`)
- Keep only canvas state (`nodes`, `edges`)
- Add `markDirty()` call on any node/edge change

### Phase 2: File-Based Storage (v0.30.0)

**Goal**: Tests stored as YAML files in `artifacts/tests/`

#### 2.1 Backend: New Test File Service

```python
# backend/services/test_files.py

class TestFileService:
    """Service for managing test YAML files."""

    def __init__(self, tests_path: str = "artifacts/tests"):
        self.tests_path = tests_path

    def save_test(self, filename: str, yaml_content: str) -> str:
        """Save test YAML to file."""
        pass

    def load_test(self, filename: str) -> str:
        """Load test YAML from file."""
        pass

    def list_tests(self) -> list[dict]:
        """List all test files with metadata."""
        pass

    def delete_test(self, filename: str) -> bool:
        """Delete test file."""
        pass

    def generate_filename(self, name: str) -> str:
        """Generate unique kebab-case filename from test name."""
        pass
```

#### 2.2 Backend: API Endpoints

```python
# New endpoints in backend/api/test_files.py

@router.post("/api/tests/files")
async def save_test_file(request: SaveTestRequest):
    """Save test YAML to file and update database metadata."""
    pass

@router.get("/api/tests/files")
async def list_test_files():
    """List all test files with database metadata."""
    pass

@router.get("/api/tests/files/{filename}")
async def get_test_file(filename: str):
    """Load test YAML from file."""
    pass

@router.delete("/api/tests/files/{filename}")
async def delete_test_file(filename: str):
    """Delete test file and database entry."""
    pass
```

#### 2.3 Frontend: File-Based Save

```typescript
// frontend/src/services/testFiles.ts

export async function saveTestFile(
  filename: string | null,
  yaml: string,
  metadata: TestMetadata
): Promise<{ id: number; filename: string }> {
  // Uses Tauri filesystem API to write file
  // Then updates database via REST API
}

export async function loadTestFile(
  filename: string
): Promise<{ yaml: string; metadata: TestMetadata }> {
  // Uses Tauri filesystem API to read file
}

export async function listTestFiles(): Promise<TestFileInfo[]> {
  // Lists files from artifacts/tests/ folder
}
```

#### 2.4 Database Schema Changes

```sql
-- Migration: Remove full spec storage, keep metadata only

ALTER TABLE test_definitions DROP COLUMN spec_json;
ALTER TABLE test_definitions DROP COLUMN spec_yaml;
ALTER TABLE test_definitions DROP COLUMN canvas_state;
ALTER TABLE test_definitions ADD COLUMN filename VARCHAR(100) UNIQUE;
ALTER TABLE test_definitions ADD COLUMN last_run_at TIMESTAMP;
```

### Phase 3: Unified UI/UX (v0.31.0)

**Goal**: Seamless, consistent editing experience

#### 3.1 Unified Test Header Component

```tsx
// frontend/src/components/test/TestHeader.tsx

function TestHeader() {
  const { currentTest, updateMetadata, markDirty } = useTestStore();

  return (
    <div className="test-header">
      {/* Dirty indicator */}
      {currentTest?.isDirty && (
        <span className="dirty-indicator">●</span>
      )}

      {/* Inline editable name */}
      <InlineEdit
        value={currentTest?.name ?? 'Untitled Test'}
        onSave={(name) => updateMetadata({ name })}
      />

      {/* Category selector */}
      <CategoryDropdown
        value={currentTest?.category}
        onChange={(cat) => updateMetadata({ category: cat })}
      />

      {/* Last saved timestamp */}
      {currentTest?.lastSaved && (
        <span className="last-saved">
          Saved {formatRelative(currentTest.lastSaved)}
        </span>
      )}
    </div>
  );
}
```

#### 3.2 Unified Actions Bar

```tsx
// frontend/src/components/test/TestActions.tsx

function TestActions() {
  const { currentTest, save, saveAs } = useTestStore();

  return (
    <div className="test-actions">
      {/* Save - enabled when dirty */}
      <button
        onClick={save}
        disabled={!currentTest?.isDirty}
        title="Save (⌘S)"
      >
        <Save size={14} />
        Save
      </button>

      {/* Save As - always available */}
      <button onClick={() => setSaveAsOpen(true)}>
        Save As...
      </button>

      {/* Import from file */}
      <button onClick={handleImport}>
        <Upload size={14} />
        Import
      </button>

      {/* Export to downloads */}
      <button onClick={handleExport}>
        <Download size={14} />
        Export
      </button>
    </div>
  );
}
```

#### 3.3 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘S / Ctrl+S | Save current test |
| ⌘⇧S / Ctrl+Shift+S | Save As... |
| ⌘O / Ctrl+O | Open test from Library |
| ⌘N / Ctrl+N | New test (clear canvas) |

#### 3.4 Auto-Save Behavior

- **Enabled by default** (no toggle needed)
- **Debounce**: 3 seconds after last change
- **Conditions**: Only auto-save if:
  - Test has been saved at least once (has filename)
  - Test is not a template
  - Canvas has nodes
- **Visual feedback**: "Saving..." → "Saved at HH:MM:SS"

### Phase 4: Comparison Integration (v0.32.0)

**Goal**: Seamless workflow from edit → run → compare

#### 4.1 Auto-Link Runs to Tests

When executing a test:
1. If test is saved (has ID), link run to test_definition_id
2. If test is unsaved, prompt to save first
3. Store test snapshot with run (for historical comparison)

#### 4.2 Comparison View Improvements

```tsx
function ComparisonView({ testId }: { testId?: number }) {
  // If no testId, show prompt to save test
  if (!testId) {
    return (
      <EmptyState
        icon={Save}
        title="Save test to enable comparison"
        description="Comparison requires test history. Save this test to start tracking runs."
        action={<button onClick={save}>Save Test</button>}
      />
    );
  }

  // ... existing comparison logic
}
```

#### 4.3 Run History in Test Editor

Add collapsible "Run History" section in Test tab:
- Shows last 5 runs with status
- Quick "Compare" button to open comparison view
- Link to full run details

## UI/UX Specifications

### Test Editor Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ Right Panel - Test Tab                                               │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Test Script                              Auto-saved 2:35:42 PM  │ │
│ │ [Save] [Save As...] [Import] [Export]                           │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ ● Multi-city Test ✏️                              [Q&A ▾]   │ │ │
│ │ │ What is the capital of France?                              │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │  1 │ name: Multi-city Test                                  │ │ │
│ │ │  2 │ description: What is the capital of France?            │ │ │
│ │ │  3 │ category: qa                                           │ │ │
│ │ │  4 │ model: gpt-5.1                                         │ │ │
│ │ │  5 │ provider: openai                                       │ │ │
│ │ │  6 │ inputs:                                                 │ │ │
│ │ │  7 │   query: What is the capital of France?                │ │ │
│ │ │  8 │ assertions:                                            │ │ │
│ │ │  9 │   - must_contain: Paris                                │ │ │
│ │ │ 10 │   - must_not_contain: London                           │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ ▼ Run Details                                                   │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ [Run ▶] [Compare ↔]                    Mode: [Run][Compare] │ │ │
│ │ │ ...                                                         │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### State Indicators

| State | Visual | Meaning |
|-------|--------|---------|
| ● (orange) | Dirty indicator | Unsaved changes |
| ✓ (green) | Saved indicator | All changes saved |
| ⟳ (blue spinner) | Saving indicator | Currently saving |
| Template badge | Read-only | Loaded from templates |
| File badge | Saved | Stored in artifacts/tests |

### Save Dialog (Save As...)

```
┌─────────────────────────────────────────────────────────┐
│ Save Test As                                       [X] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Test Name *                                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Multi-city Test                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Description                                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ What is the capital of France?                      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Category                                                │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Q&A                                            [▾] │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Filename (auto-generated)                               │
│ artifacts/tests/multi-city-test.yaml                    │
│                                                         │
│                              [Cancel]  [Save]           │
└─────────────────────────────────────────────────────────┘
```

## Migration Strategy

### For Existing Users

1. **Database Migration**: One-time export of existing tests to YAML files
2. **File Generation**: Create `artifacts/tests/*.yaml` from database records
3. **ID Mapping**: Keep database IDs for run history linkage
4. **Notification**: Inform users of new file location on first launch

### Migration Script

```python
# backend/migrations/export_tests_to_files.py

async def migrate_tests_to_files():
    """Export all database tests to YAML files."""
    tests = await list_all_tests()

    for test in tests:
        # Generate filename
        filename = generate_filename(test.name)

        # Write YAML file
        yaml_path = f"artifacts/tests/{filename}.yaml"
        write_yaml_file(yaml_path, test.spec_yaml)

        # Update database with filename
        await update_test(test.id, filename=filename)

    print(f"Migrated {len(tests)} tests to artifacts/tests/")
```

## Success Criteria

### Functional Requirements

1. **Single Save Point**: Only one "Save" button, consistent behavior
2. **File-Based Storage**: All tests stored as YAML in `artifacts/tests/`
3. **Git-Friendly**: Tests can be version controlled with project
4. **Dirty State**: Clear indication of unsaved changes
5. **Auto-Save**: Automatic saving after changes (configurable)
6. **Keyboard Shortcuts**: ⌘S to save, ⌘⇧S to save as

### User Experience Requirements

1. **No Duplicate Tests**: Save updates existing, Save As creates new
2. **Clear Identity**: Every test has visible name and file location
3. **Seamless Editing**: Edit name/description inline without modal
4. **Run Linking**: All runs automatically linked to saved test
5. **Comparison Ready**: Save once, compare forever

### Technical Requirements

1. **Database Slimmer**: No full spec in database (just metadata)
2. **File Validation**: YAML schema validation on save/load
3. **Conflict Detection**: Warn if file modified externally
4. **Backup Strategy**: Auto-backup before overwrite

## Timeline Estimate

| Phase | Description | Estimated Effort |
|-------|-------------|------------------|
| Phase 1 | Unified Test State | 2-3 days |
| Phase 2 | File-Based Storage | 3-4 days |
| Phase 3 | Unified UI/UX | 2-3 days |
| Phase 4 | Comparison Integration | 1-2 days |
| **Total** | | **8-12 days** |

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss during migration | High | Backup database before migration, keep old table |
| File permission issues | Medium | Check/request permissions on startup |
| Large test files | Low | Warn if file > 1MB, suggest splitting |
| External file edits | Medium | Watch for file changes, prompt to reload |

## References

- Current YamlPreview.tsx implementation
- Current TestManager.tsx implementation
- Template loading service (templates.ts)
- Comparison view (ComparisonView.tsx)
- Canvas store (canvasStore.ts)

---

**Approval**: [ ] Product [ ] Engineering [ ] Design

**Next Steps**:
1. Review and approve specification
2. Create implementation tasks
3. Begin Phase 1 development
