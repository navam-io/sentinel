# Release v0.28.0 - Regression Engine & Comparison View

**Release Date**: November 24, 2025

## Overview

This release introduces the Regression Engine and Comparison View feature, enabling users to compare test runs side-by-side and detect performance regressions. This is a core capability for the Sentinel platform, allowing teams to catch regressions in AI agent behavior before they impact production.

## New Features

### Regression Detection Engine (Backend)
- **RegressionEngine**: Configurable engine for detecting performance regressions
  - Latency threshold detection (default: 20%)
  - Cost threshold detection (default: 10%)
  - Token usage threshold detection (default: 15%)
  - Severity levels: `critical`, `warning`, `info`, `improvement`
  - Assertion pass/fail rate comparison
  - New failure and fixed failure detection

### Run Comparison API (Backend)
- **New endpoints**:
  - `GET /api/runs/list` - List all test runs
  - `GET /api/runs/test/{test_id}` - List runs for a specific test
  - `GET /api/runs/{run_id}` - Get a specific run
  - `GET /api/runs/{run_id}/results` - Get assertion results for a run
  - `GET /api/runs/compare/{baseline_id}/{current_id}` - Full run comparison
  - `GET /api/runs/regression/{baseline_id}/{current_id}` - Regression analysis only

### Comparison View (Frontend)
- **Mode Toggle**: Switch between "Run" and "Compare" modes in the execution panel
- **Run Selectors**: Dropdown selectors for baseline and current runs with auto-selection
- **MetricDeltaCard**: Visual cards showing metric changes with severity indicators
- **Comparison Summary**: Overall regression status with severity badge
- **Assertion Comparison Table**: Side-by-side assertion status comparison
- **Output Comparison**: Detection of output changes between runs
- **Configuration Change Detection**: Alerts for model or provider changes

## Technical Details

### New Files
- `backend/regression/` - Regression detection module
  - `engine.py` - Core regression detection logic
  - `comparator.py` - Run comparison utilities
- `backend/api/runs.py` - Run management API endpoints
- `frontend/src/components/comparison/` - Comparison UI components
  - `ComparisonView.tsx` - Main comparison view
  - `MetricDeltaCard.tsx` - Metric delta visualization
  - `RunSelector.tsx` - Run selection dropdown

### Type Definitions
- Added to `frontend/src/types/test-spec.ts`:
  - `TestRun`, `TestRunResult`, `RunListResponse`
  - `RegressionSeverity`, `MetricDelta`, `AssertionChanges`
  - `RegressionAnalysis`, `AssertionComparison`, `OutputComparison`
  - `RunMetrics`, `ComparisonResult`

### API Functions
- Added to `frontend/src/services/api.ts`:
  - `listRuns()`, `listRunsForTest()`, `getRun()`, `getRunResults()`
  - `compareRuns()`, `analyzeRegression()`

### Canvas Store Update
- `savedTestInfo` now includes optional `id` field for comparison view integration

## Test Coverage

### Backend Tests (27 new tests)
- `test_regression.py`:
  - MetricDelta calculation tests
  - RegressionEngine analysis tests
  - RunComparator comparison tests
  - Serialization tests

### Frontend Tests (38 new tests)
- `MetricDeltaCard.test.tsx`: 14 tests
- `RunSelector.test.tsx`: 11 tests
- `ComparisonView.test.tsx`: 13 tests

## Code Quality
- All new code formatted with Black
- All new code passes Ruff linting
- All new code passes MyPy type checking
- TypeScript strict mode compliance (0 errors)

## Breaking Changes
None. This release is fully backward compatible.

## Migration Guide
No migration required. The new features are additive and do not affect existing functionality.

## Dependencies
No new dependencies added.

## Contributors
- Claude (AI Assistant)
