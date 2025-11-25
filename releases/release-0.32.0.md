# Release 0.32.0 - File-Based Storage & Run Linkage

**Release Date:** November 24, 2025

## Overview

This release implements Feature 11 Phase 4: File-Based Storage, completing the unified test management system. Tests are now automatically saved as YAML files in `artifacts/tests/`, making them git-friendly and version-controllable. Additionally, test runs are automatically linked to saved tests, enabling comprehensive run history tracking and comparison.

## New Features

### File-Based Storage for Tests
- **YAML File Storage**: Tests are saved as `.yaml` files in `artifacts/tests/` directory
- **Auto-generated Filenames**: Filenames are automatically generated from test names in kebab-case
- **Dual Storage**: Tests are saved to both file system (for git) and database (for metadata/runs)
- **Git-Friendly**: YAML files can be version controlled, diffed, and reviewed in PRs

### Run History Integration
- **Run History Section**: New collapsible "Run History" section in the Test tab
- **Last 5 Runs Display**: Shows the last 5 test runs with status, model, and latency
- **Quick Compare Access**: "Compare Runs" button when 2+ runs exist
- **Auto-Linking**: Runs are automatically linked to saved tests when executed

### Enhanced Execution
- **Test ID Linkage**: Execution endpoint now accepts optional `test_id` to auto-link runs
- **Last Run Timestamp**: Tests track when they were last executed (`last_run_at`)
- **Run Records**: Full run records created automatically for saved tests

## Technical Changes

### Backend
- **New Service**: `TestFileService` for YAML file operations
  - `save_test()`: Save YAML content to file
  - `load_test()`: Load test from file
  - `list_tests()`: List all test files
  - `delete_test()`: Delete test file
  - `rename_test()`: Rename test file
  - `generate_filename()`: Generate unique kebab-case filename
- **New API Router**: `/api/tests/files/*` endpoints for file operations
- **Database Schema**: Added `filename` and `last_run_at` columns to `test_definitions`
- **Repository Updates**: New `get_by_filename()` and `update_last_run()` methods
- **Execution Enhancement**: Auto-creates run records when `test_id` is provided

### Frontend
- **New Service**: `testFiles.ts` for file API operations
- **New Component**: `RunHistory` - Displays test run history
- **TestToolbar Update**: Saves to both file and database
- **ExecutionPanel Update**: Passes `testId` when executing saved tests
- **TestTab Update**: Integrated RunHistory component

### Types
- Added `filename` and `last_run_at` to `TestDefinition`
- Added `filename` to `CreateTestRequest` and `UpdateTestRequest`
- Added `run_id` to `ExecuteResponse`
- New types: `TestFileInfo`, `TestFileListResponse`, `SaveTestFileRequest`, `TestFileContent`

## API Changes

### New Endpoints
- `POST /api/tests/files` - Save test YAML file
- `GET /api/tests/files` - List all test files
- `GET /api/tests/files/{filename}` - Load test file
- `PUT /api/tests/files/{filename}` - Update test file
- `DELETE /api/tests/files/{filename}` - Delete test file
- `POST /api/tests/files/{filename}/rename` - Rename test file
- `GET /api/tests/files/{filename}/exists` - Check if file exists

### Modified Endpoints
- `POST /api/execution/execute` - Now accepts optional `test_id` parameter
  - Returns `run_id` when test is linked

## Test Coverage
- **Backend**: 25 new tests for `TestFileService`
- **Frontend**: 24 new tests for `RunHistory` and `testFiles` service
- All existing tests pass (140 backend, 639 frontend)

## File Structure
```
artifacts/
├── templates/     # Built-in templates (existing)
└── tests/         # User test files (new)
    └── my-test-name.yaml
```

## Upgrade Notes
- The `artifacts/tests/` directory is created automatically on first test save
- Existing tests in the database continue to work
- New tests will be saved to both database and file system

## Known Issues
- Template service tests require Tauri runtime (pre-existing)
- ESLint configuration needs v9 migration (pre-existing)
