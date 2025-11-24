# Release v0.31.0 - Session Persistence and Auto-Save

**Release Date**: November 24, 2025

## Overview

This release implements Phase 3 of the Unified Test Management System (Feature 11), adding session persistence and auto-save functionality. Tests are now automatically saved after changes, and users receive warnings before closing the app with unsaved changes.

## New Features

### Auto-Save with Debounce

Existing tests are now automatically saved after changes with a 3-second debounce:

- **Smart Debounce**: Only triggers save after 3 seconds of inactivity
- **Existing Tests Only**: Auto-save only works for tests that have already been saved (have an ID)
- **Template Protection**: Templates are read-only and won't be auto-saved
- **Error Handling**: Graceful error recovery with console logging

### Unsaved Changes Warning

Users are now warned before losing unsaved work:

- **Browser Integration**: Uses `beforeunload` event for browser/Tauri compatibility
- **Conditional Warning**: Only shows when there are actual unsaved changes
- **Native Dialog**: Uses browser's native confirmation dialog

### Session Persistence

Test state is now persisted across app restarts:

- **Zustand Persist**: Canvas and test state automatically saved to localStorage
- **Seamless Recovery**: Last test reloads automatically on app restart
- **No Configuration**: Works out of the box with sensible defaults

### useSessionPersistence Hook

New React hook that orchestrates all persistence features:

```typescript
const { isSaving, saveNow, autoSaveError } = useSessionPersistence({
  autoSaveEnabled: true,
  autoSaveDelay: 3000,
  warnOnUnsavedChanges: true,
});
```

**Features**:
- Configurable auto-save delay (default: 3000ms)
- Enable/disable auto-save and warnings independently
- Manual save trigger via `saveNow()` function
- Saving state indicator for UI feedback
- Error state for displaying auto-save failures

## Technical Changes

### New Files

- `frontend/src/hooks/useSessionPersistence.ts`: Session persistence hook (226 LOC)
- `frontend/src/hooks/useSessionPersistence.test.ts`: Comprehensive test suite (25 tests)

### Updated Files

- `frontend/src/App.tsx`: Integrates useSessionPersistence hook
- `frontend/package.json`: Version bump to 0.31.0
- `frontend/src-tauri/tauri.conf.json`: Version bump to 0.31.0
- `backend/main.py`: Version bump to 0.31.0
- `CLAUDE.md`: Updated project status
- `backlog/active.md`: Marked Phase 3 complete

### Integration Details

The hook integrates with existing stores:
- **testStore**: Reads `currentTest` state, calls `markClean()` after saves
- **canvasStore**: Reads nodes/edges for YAML generation
- **API client**: Uses `updateTest()` for persistence

## Test Results

- **25 new tests** for useSessionPersistence hook
- All tests passing (730 total - 615 frontend + 115 backend)
- TypeScript: 0 errors with strict mode

### Test Coverage Areas

1. **Return Values**: Hook returns correct initial values
2. **Auto-Save Behavior**:
   - Skips when disabled
   - Skips for new tests (no ID)
   - Skips for templates (read-only)
   - Skips when already saving
   - Triggers after debounce delay
   - Clears timeout on cleanup
   - Marks test clean after save
3. **Manual Save**:
   - `saveNow()` triggers immediate save
   - Clears pending auto-save on manual trigger
4. **Unsaved Changes Warning**:
   - Adds beforeunload listener when enabled
   - Skips warning when no unsaved changes
   - Removes listener on cleanup
5. **Error Handling**:
   - Logs errors to console
   - Continues operation after errors

## Upgrade Notes

No breaking changes. Auto-save and unsaved changes warnings are enabled by default.

To customize behavior, modify the options in `App.tsx`:

```typescript
useSessionPersistence({
  autoSaveEnabled: true,      // Set to false to disable auto-save
  autoSaveDelay: 3000,        // Adjust debounce delay (ms)
  warnOnUnsavedChanges: true, // Set to false to disable warning
});
```

## What's Next

Phase 4 of Unified Test Management (Feature 11):
- **File-Based Storage**: Store tests as YAML files in `artifacts/tests/`
- **Database Metadata Only**: Lightweight database with just metadata
- **Run Linkage**: Auto-link test runs to test definitions
- **Run History**: Show last 5 runs in Test tab for quick comparison

---

**Full Changelog**: v0.30.0...v0.31.0
