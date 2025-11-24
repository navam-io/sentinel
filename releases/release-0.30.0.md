# Release v0.30.0 - Test Toolbar with Keyboard Shortcuts

**Release Date**: November 24, 2025

## Overview

This release introduces a unified Test Toolbar component with New, Save, and Save As functionality, complete with keyboard shortcuts. This is Phase 2 of the Unified Test Management System (Feature 11).

## New Features

### Test Toolbar Component

A new toolbar at the top of the Test tab provides quick access to test management actions:

- **New Button** (⌘N / Ctrl+N): Create a new test, clearing the canvas and resetting test state
- **Save Button** (⌘S / Ctrl+S): Save the current test (create if new, update if existing)
- **Save As Button** (⌘⇧S / Ctrl+Shift+S): Save a copy of the current test with a new name

### Keyboard Shortcuts

Cross-platform keyboard shortcuts for all test management actions:
- **New Test**: ⌘N (Mac) / Ctrl+N (Windows/Linux)
- **Save**: ⌘S (Mac) / Ctrl+S (Windows/Linux)
- **Save As**: ⌘⇧S (Mac) / Ctrl+Shift+S (Windows/Linux)

### Visual Indicators

- **Unsaved Changes**: Orange "● Unsaved" indicator when test has pending changes
- **Saved Status**: Green "✓ Saved" indicator with relative timestamp (e.g., "Just now", "5m ago")
- **Template Badge**: Blue "Template" indicator for read-only templates
- **Highlighted Save Button**: Primary color when test has unsaved changes

### Save Dialog

Modal dialog for saving tests with:
- Test name input (required)
- Description textarea (optional)
- Category dropdown with all available categories
- Cancel/Save buttons
- Enter key to save, Escape to cancel
- Error message display for validation failures

## Technical Changes

### New Components

- `frontend/src/components/test/TestToolbar.tsx`: Main toolbar component
- `frontend/src/components/test/index.tsx`: Export file for test components
- `frontend/src/components/test/TestToolbar.test.tsx`: Comprehensive test suite (39 tests)

### Updated Components

- `frontend/src/components/yaml/TestTab.tsx`: Integrates TestToolbar at the top
- `frontend/src/components/yaml/YamlPreview.tsx`: Simplified - save functionality moved to toolbar

### Integration with Unified Test Store

The toolbar fully integrates with `useTestStore` from v0.29.0:
- Uses `currentTest` for state tracking
- Calls `markClean()` after successful saves
- Uses `newTest()` and `clearCurrentTest()` for new test creation
- Updates metadata via `updateMetadata()`

## Test Results

- **39 new tests** for TestToolbar component
- All tests passing (590 frontend + 115 backend = 705 total)
- TypeScript: 0 errors with strict mode

## Files Changed

```
frontend/src/components/test/TestToolbar.tsx      (new)
frontend/src/components/test/TestToolbar.test.tsx (new)
frontend/src/components/test/index.tsx            (new)
frontend/src/components/yaml/TestTab.tsx          (modified)
frontend/src/components/yaml/YamlPreview.tsx      (modified)
frontend/package.json                             (version bump)
frontend/src-tauri/tauri.conf.json               (version bump)
backend/main.py                                   (version bump)
CLAUDE.md                                         (updated)
```

## Upgrade Notes

No breaking changes. The new toolbar is automatically available in the Test tab.

## What's Next

Phase 3-4 of Unified Test Management (Feature 11):
- **Phase 3**: New test creation flow with canvas reset
- **Phase 4**: Session persistence and recovery (auto-reload last test on app restart)

---

**Full Changelog**: v0.29.0...v0.30.0
