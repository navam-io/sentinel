# Release 0.29.0 - Unified Test Management System (Phase 1)

**Release Date**: November 24, 2025

## Overview

This release introduces the foundation for unified test state management, addressing critical UX issues with test saving, editing, and tracking. Phase 1 focuses on creating a centralized test store that serves as the single source of truth for test identity and dirty state.

## Key Features

### Unified Test Store (`useTestStore`)

A new centralized Zustand store that manages all test-related state:

```typescript
interface CurrentTest {
  id: number | null;          // Database ID (null if never saved)
  filename: string | null;    // YAML filename (null if never saved)
  name: string;               // Test name
  description: string;        // Test description
  category: TestCategory | null;  // Test category
  isTemplate: boolean;        // Whether this is a read-only template
  isDirty: boolean;           // Whether there are unsaved changes
  lastSaved: Date | null;     // Last save timestamp
}
```

### Auto-Dirty Detection

Canvas changes now automatically mark the current test as dirty:

- **Node changes**: Adding, removing, or updating nodes triggers dirty state
- **Edge changes**: Adding or removing edges triggers dirty state
- **Smart filtering**: Position-only changes (dragging nodes) do NOT mark dirty

### Improved Save/Edit Workflow

- **Visual indicators**: Clear "Unsaved changes" indicator when dirty
- **Save timestamps**: Shows "Saved X ago" after saving
- **Update vs Create**: Automatically uses update API for existing tests

## Technical Changes

### New Files

- `frontend/src/stores/testStore.ts` - Unified test state management store
- `frontend/src/stores/testStore.test.ts` - Comprehensive test suite (21 tests)

### Modified Files

- `frontend/src/stores/canvasStore.ts` - Removed `savedTestInfo`, added `markDirty()` integration
- `frontend/src/components/yaml/YamlPreview.tsx` - Uses unified testStore
- `frontend/src/components/RightPanel.tsx` - Uses testStore for loading
- `frontend/src/components/execution/ExecutionPanel.tsx` - Uses testStore for comparison

### Removed

- `savedTestInfo` from canvasStore (migrated to testStore)
- `setSavedTestInfo` action (replaced by `setCurrentTest`)

## API Reference

### useTestStore Actions

| Action | Description |
|--------|-------------|
| `setCurrentTest(test)` | Set the current test (when loading from library) |
| `updateMetadata(updates)` | Update name, description, or category |
| `markDirty()` | Mark test as having unsaved changes |
| `markClean(updates)` | Mark test as saved with optional id/filename updates |
| `clearCurrentTest()` | Clear current test (reset to empty state) |
| `newTest(name, description)` | Create a new unsaved test |
| `loadTest(test)` | Load a test from library (marks as clean) |

## Test Results

- **Frontend Unit Tests**: 551 passing (21 new)
- **Backend Tests**: 115 passing
- **TypeScript**: 0 errors
- **Code Quality**: ESLint, Black, Ruff, MyPy all passing

## Migration Notes

### For Developers

Components that previously used `savedTestInfo` from `canvasStore` should now use `currentTest` from `testStore`:

```typescript
// Before
const { savedTestInfo } = useCanvasStore();
const testId = savedTestInfo?.id;

// After
const { currentTest } = useTestStore();
const testId = currentTest?.id;
```

### For Users

No user-facing changes in this release. The improvements are internal architecture that enable future features like:

- Unsaved changes warnings
- Auto-save functionality
- Better test editing UX

## What's Next

Phase 2-4 of Unified Test Management (Feature 11):

- **Phase 2**: Toolbar with New/Save/SaveAs buttons
- **Phase 3**: New test creation flow
- **Phase 4**: Session persistence and recovery

See `backlog/11-spec-test-management.md` for the complete specification.

## Related Issues

This release addresses the following UX issues identified in the codebase review:

- Fragmented test state across multiple components
- No clear indication of unsaved changes
- Confusing save vs update behavior
- Missing test identity after canvas modifications
