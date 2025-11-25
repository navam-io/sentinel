# Release v0.33.0 - Record & Replay Test Generation

**Release Date**: November 25, 2025

## Overview

This release implements Feature 6 (Record & Replay Test Generation), enabling users to record agent interactions and automatically generate tests from those recordings. The feature includes smart detection of tool calls and JSON outputs, auto-generated assertion suggestions, and seamless test creation with canvas visualization.

## New Features

### Recording Mode

Watch agent interactions and capture them for test generation:

- **Start/Stop Recording**: Begin capturing agent interactions with a single click
- **Pause/Resume**: Temporarily pause recording without losing captured events
- **Event Capture**: Automatically captures prompts, tool calls, outputs, and timing
- **Real-time Event Feed**: View captured events as they happen

### Smart Detection

Intelligent analysis of recorded interactions to suggest assertions:

- **Tool Call Detection**: Identifies tool calls and suggests `must_call_tool` assertions
- **Output Format Detection**: Detects JSON, Markdown, Code, or plain text outputs
- **Auto-generated Assertions**: Creates appropriate assertions based on detected patterns
- **Confidence Scoring**: Each suggestion includes a confidence score and reasoning

### Test Generation

Convert recordings into fully-formed visual tests:

- **Canvas Generation**: Automatically creates React Flow nodes from recorded events
- **YAML Generation**: Produces valid test specification YAML
- **Assertion Integration**: Includes smart detection suggestions as test assertions
- **Immediate Editing**: Generated tests load directly onto the canvas for refinement

### Recording UI

New "Record" mode tab in the Execution Panel:

- **Recording Controls**: Start, pause, resume, and stop buttons
- **Status Indicator**: Shows current recording state with event count
- **Smart Detection Panel**: Displays detected patterns and suggested assertions
- **Generate Test Button**: One-click test creation from recording

## Technical Changes

### New Backend Components

**Models** (`backend/storage/models.py`):
- `RecordingSession`: Tracks recording lifecycle (recording, paused, stopped)
- `RecordingEvent`: Stores captured events with sequence numbers and timestamps

**Repository** (`backend/storage/repositories.py`):
- `RecordingRepository`: CRUD operations for recording sessions and events

**API** (`backend/api/recording.py` - 890 LOC):
- 12 REST endpoints for recording management
- Smart detection functions: `detect_output_format()`, `analyze_recording_for_suggestions()`
- Canvas/YAML generation: `generate_canvas_from_events()`, `generate_yaml_from_events()`

### New Frontend Components

**Types** (`frontend/src/types/test-spec.ts`):
- `RecordingStatus`, `RecordingSession`, `RecordingEvent`
- `SuggestedAssertion`, `SmartDetectionResult`, `GeneratedTestResponse`

**API Client** (`frontend/src/services/api.ts`):
- 12 recording API functions for full recording lifecycle

**Store** (`frontend/src/stores/recordingStore.ts`):
- Zustand store for recording state management
- `useIsRecording` and `useRecordingStatus` selectors

**UI** (`frontend/src/components/recording/RecordingControls.tsx`):
- Recording controls with state-aware button display
- Event feed and smart detection results panel

### Updated Files

- `frontend/src/components/execution/ExecutionPanel.tsx`: Added "Record" mode tab
- `backend/main.py`: Registered recording router
- Version bumps in `package.json`, `tauri.conf.json`, `main.py`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/recording/start` | Start a new recording session |
| POST | `/api/recording/stop/{id}` | Stop a recording session |
| POST | `/api/recording/pause/{id}` | Pause a recording session |
| POST | `/api/recording/resume/{id}` | Resume a paused session |
| GET | `/api/recording/active` | Get the active recording session |
| GET | `/api/recording/{id}` | Get a specific recording session |
| POST | `/api/recording/{id}/event` | Add an event to a recording |
| GET | `/api/recording/{id}/events` | Get all events for a recording |
| POST | `/api/recording/{id}/analyze` | Analyze recording for suggestions |
| POST | `/api/recording/{id}/generate-test` | Generate a test from recording |
| GET | `/api/recording/list` | List all recording sessions |
| DELETE | `/api/recording/{id}` | Delete a recording session |

## Test Results

- **20 new backend tests** for recording repository and smart detection
- **13 new store tests** for recordingStore actions
- **8 new component tests** for RecordingControls UI states
- All tests passing (181 backend + 660 frontend = 841 total)
- TypeScript: 0 errors with strict mode

### Test Coverage Areas

**Backend**:
- Recording session CRUD operations
- Event management and sequencing
- Output format detection (JSON, Markdown, Code, Text)
- Tool call analysis and assertion generation
- Canvas node generation from events
- YAML specification generation

**Frontend**:
- Store action handling (start, stop, pause, resume)
- Event refresh and analysis
- Error handling and loading states
- UI state transitions (idle, recording, paused, stopped)
- Smart detection display

## Upgrade Notes

No breaking changes. The Record & Replay feature is additive and doesn't affect existing functionality.

### How to Use

1. Click the "Record" tab in the Execution Panel
2. Click "Record" to start capturing
3. Run agent interactions in a separate terminal
4. Click "Stop" when done
5. Review smart detection suggestions
6. Click "Generate Test" to create a visual test

## What's Next

Feature 7 (Multi-Model Comparison):
- Side-by-side model comparison
- Parallel execution across models
- Unified diff view for outputs
- Cost and latency comparison

---

**Full Changelog**: v0.32.0...v0.33.0
