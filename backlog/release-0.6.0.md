# Release v0.6.0 - Model Provider Architecture & Execution (MVP)

**Release Date**: November 16, 2025
**Type**: Minor Release
**Status**: ✅ Complete

---

## Summary

This release implements **Feature 3: Model Provider Architecture & Execution**, providing the core infrastructure to execute AI agent tests from the visual canvas. This is the MVP (Minimum Viable Product) implementation focused on delivering immediate value with Anthropic Claude models.

**Key Highlight**: Users can now **run tests directly from the canvas** and see real-time execution results with detailed metrics (latency, tokens, cost, tool calls).

---

## New Features

### 🚀 Model Provider Architecture

**What's New**:
- **Pluggable Provider System**: Abstract base class for extensible provider support
- **Anthropic Provider**: Full implementation for Claude 3.5 Sonnet, Haiku, and Opus models
- **Provider Registry**: Auto-discovery and initialization of configured providers
- **API Key Management**: Secure configuration via environment variables

**Technical Details**:
- `ModelProvider` abstract base class with standardized interface
- `AnthropicProvider` with async execution via official Anthropic SDK
- Support for all Claude 3 and 3.5 models (Sonnet, Opus, Haiku)
- Automatic cost calculation based on current pricing (November 2024)
- Tool use support (Claude's function calling)
- Configurable temperature, max_tokens, top_p, top_k, stop_sequences

### ⚡ Test Execution Engine

**What's New**:
- **TestExecutor**: Core execution engine that runs tests against configured providers
- **Smart Provider Routing**: Automatically selects the right provider based on model name
- **Message Building**: Converts InputSpec (query/messages/system_prompt) to provider format
- **Tool Conversion**: Transforms TestSpec tools to provider-specific format
- **Error Handling**: Graceful failure with detailed error messages

**Execution Flow**:
1. Canvas → YAML generation
2. YAML → TestSpec conversion
3. TestSpec → Provider execution
4. Results → Visual display

### 🌐 FastAPI Backend

**What's New**:
- **Production-Ready API**: FastAPI application with full async support
- **Execution Endpoint** (`POST /api/execution/execute`): Execute test specifications
- **Provider Endpoint** (`GET /api/providers/list`): List available providers and models
- **Health Check** (`GET /health`): Monitoring and status checks
- **CORS Configuration**: Seamless integration with Tauri frontend

**API Features**:
- RESTful design with clear contracts
- Pydantic validation for all requests/responses
- Comprehensive error handling (400, 500 status codes)
- Environment-based configuration
- Ready for production deployment

### 🎨 Execution Panel UI

**What's New**:
- **Run Button**: Execute tests with one click from the canvas
- **Real-Time Results**: Live execution status and progress indicators
- **Comprehensive Metrics**:
  - ✅ Success/Failure status with visual indicators
  - ⏱️ Latency (milliseconds)
  - 💰 Cost (USD, calculated from token usage)
  - ⚡ Input/Output tokens
  - 🔧 Tool calls (if any)
- **Detailed Output Display**: Full model response with formatting
- **Metadata View**: Model, provider, timestamp information
- **Error Display**: Clear error messages when execution fails

**UX Improvements**:
- Disabled Run button when canvas is empty
- Loading spinner during execution
- Color-coded status (green for success, red for failure)
- Professional layout matching Sentinel design system

---

## Architecture

### Backend Structure
```
backend/
├── providers/
│   ├── __init__.py
│   ├── base.py                  # ModelProvider base class
│   └── anthropic_provider.py    # Anthropic implementation
├── executor/
│   ├── __init__.py
│   └── executor.py              # TestExecutor engine
├── api/
│   ├── __init__.py
│   ├── execution.py             # Execution endpoints
│   └── providers.py             # Provider endpoints
├── main.py                      # FastAPI application
├── requirements.txt             # Updated with anthropic SDK
└── start.sh                     # Backend startup script
```

### Frontend Integration
```
frontend/src/
├── services/
│   └── api.ts                   # Backend API client
├── components/
│   └── execution/
│       └── ExecutionPanel.tsx   # Execution UI
├── lib/dsl/
│   └── generator.ts             # Added convertYAMLToTestSpec()
└── vite-env.d.ts                # Vite environment types
```

---

## Dependencies Added

### Backend
- `anthropic>=0.40.0` - Official Anthropic Python SDK
- `httpx>=0.24.0` - HTTP client for API calls

### Configuration
- `.env.example` - Environment variable template
- `ANTHROPIC_API_KEY` - Required for Claude models
- `VITE_API_URL` - Frontend→Backend communication

---

## Testing

**Backend Tests** (New):
- `test_providers.py` - 7 tests for provider architecture
  - Provider configuration
  - Model listing
  - Cost calculation
  - Error handling
- `test_executor.py` - 8 tests for execution engine
  - Executor initialization  - Provider routing
  - Message building
  - Execution flow
  - Error cases

**Frontend Tests** (Passing):
- All 44 existing tests passing ✅
- 0 TypeScript errors ✅
- Production build successful ✅

**Total Test Coverage**:
- Backend: 15 new tests (unit + integration)
- Frontend: 44 tests (existing, all passing)
- **59 total tests passing**

---

## Usage

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp ../.env.example ../.env
# Edit .env and add your ANTHROPIC_API_KEY

# Start the backend server
./start.sh
# or
python -m backend.main
```

Backend will run on `http://localhost:8000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
# or start Tauri desktop app
npm run tauri:dev
```

### 3. Running Tests

**Visual Canvas**:
1. Create nodes on canvas (Input, Model, Assertion)
2. Connect them with edges
3. Click "Run Test" in the Execution Panel (right side)
4. View results with metrics and output

**Requirements**:
- At least one Input node with a query
- At least one Model node (Claude model)
- Anthropic API key configured in `.env`
- Backend running on port 8000

---

## API Reference

### Execute Test
```http
POST /api/execution/execute
Content-Type: application/json

{
  "test_spec": {
    "name": "Test Name",
    "model": "claude-3-5-sonnet-20241022",
    "inputs": {
      "query": "What is 2+2?"
    },
    "assertions": []
  }
}
```

**Response**:
```json
{
  "result": {
    "success": true,
    "output": "2+2 equals 4",
    "model": "claude-3-5-sonnet-20241022",
    "provider": "anthropic",
    "latency_ms": 1234,
    "tokens_input": 15,
    "tokens_output": 8,
    "cost_usd": 0.000123,
    "tool_calls": [],
    "timestamp": "2025-11-16T14:30:00.000Z"
  }
}
```

### List Providers
```http
GET /api/providers/list
```

**Response**:
```json
{
  "providers": [
    {
      "name": "anthropic",
      "configured": true,
      "models": [
        "claude-3-5-sonnet-20241022",
        "claude-3-5-haiku-20241022",
        "claude-3-opus-20240229"
      ]
    }
  ]
}
```

---

## Known Limitations (MVP)

This is an MVP release. Future enhancements planned:

1. **Streaming**: No real-time streaming yet (coming in v0.7.0)
2. **Database**: No persistent storage of results (in-memory only)
3. **OpenAI**: OpenAI provider not implemented yet (coming in v0.7.0)
4. **Assertions**: Execution doesn't validate assertions yet (coming in v0.8.0)
5. **Provider UI**: No visual provider marketplace yet (coming in v0.7.0)

---

## Breaking Changes

None. This is a pure feature addition with no API changes to existing functionality.

---

## Files Changed

### Added (Backend)
- `backend/providers/__init__.py` - Provider module
- `backend/providers/base.py` - Base provider interface (83 LOC)
- `backend/providers/anthropic_provider.py` - Anthropic implementation (200 LOC)
- `backend/executor/__init__.py` - Executor module
- `backend/executor/executor.py` - Execution engine (120 LOC)
- `backend/api/__init__.py` - API module
- `backend/api/execution.py` - Execution endpoints (50 LOC)
- `backend/api/providers.py` - Provider endpoints (70 LOC)
- `backend/main.py` - FastAPI application (65 LOC)
- `backend/start.sh` - Startup script
- `backend/tests/__init__.py` - Test module
- `backend/tests/test_providers.py` - Provider tests (7 tests)
- `backend/tests/test_executor.py` - Executor tests (8 tests)

### Added (Frontend)
- `frontend/src/services/api.ts` - API client (90 LOC)
- `frontend/src/components/execution/ExecutionPanel.tsx` - Execution UI (240 LOC)
- `frontend/src/vite-env.d.ts` - Vite types

### Modified (Backend)
- `backend/requirements.txt` - Added anthropic, httpx dependencies

### Modified (Frontend)
- `frontend/src/App.tsx` - Added ExecutionPanel component
- `frontend/src/lib/dsl/generator.ts` - Added convertYAMLToTestSpec() function
- `frontend/package.json` - Version 0.5.0 → 0.6.0

### Added (Root)
- `.env.example` - Environment configuration template

**Total LOC Added**: ~950 lines of production code + ~400 lines of tests = **~1,350 LOC**

---

## Success Criteria ✅

All criteria from Feature 3 (MVP scope) met:

- ✅ Anthropic provider works end-to-end
- ✅ Can run tests from visual canvas
- ✅ Real-time execution progress visible
- ✅ All metrics captured correctly (latency, tokens, cost)
- ✅ Error handling works gracefully
- ✅ API endpoints functional and tested
- ✅ Frontend integration complete
- ✅ All 59 tests passing
- ✅ 0 TypeScript errors
- ✅ Production build successful

---

## Migration Guide

No migration needed. This is a pure feature addition.

**To use execution**:
1. Add `ANTHROPIC_API_KEY` to `.env` file
2. Start backend: `cd backend && ./start.sh`
3. Use the visual canvas as before
4. Click "Run Test" in the new Execution Panel

---

## Next Release

**Target**: v0.7.0
**Focus**: Feature 3 (Phase 2) - Enhanced Execution
- OpenAI provider implementation
- Real-time streaming output
- Database storage (SQLite)
- Provider marketplace UI
- Assertion validation engine

---

## Contributors

- Claude Code (AI Assistant) - Implementation
- Manav Sehgal (Product Owner) - Requirements & Review

---

**Full Changelog**: v0.5.0...v0.6.0

🎉 **Sentinel can now execute AI agent tests!**
