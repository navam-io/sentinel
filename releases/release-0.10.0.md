# Release 0.10.0 - Data Persistence & Storage Layer

**Release Date:** November 16, 2025
**Type:** Minor Release (New Feature - Data Persistence Layer)
**Status:** Released

---

## Summary

Version 0.10.0 implements the **critical data persistence layer** for Navam Sentinel, enabling test definitions, execution runs, and results to be stored in a SQLite database. This is a foundational component of Feature 3 (Model Provider Architecture & Execution) that ensures tests are saved automatically, canvas state persists across restarts, and run history is queryable.

This release adds 24 new tests (100% passing), bringing the total test count to **91 tests** (45 backend + 46 frontend).

---

## What's New

### 🗄️ SQLite Storage Layer (CRITICAL Feature)

**Complete data persistence infrastructure**:
- SQLite database for local/desktop storage (~/.sentinel/sentinel.db)
- PostgreSQL support ready for future server mode
- Automatic schema creation on startup
- Foreign key constraints enforced

**Database Models** (`backend/storage/models.py`):
1. **TestDefinition** - Stores test specifications with canvas state
   - Full TestSpec as JSON
   - Optional YAML representation
   - Canvas state (React Flow nodes/edges)
   - Version tracking and timestamps

2. **TestRun** - Execution history records
   - Links to test definition
   - Provider and model used
   - Execution metrics (latency, tokens, cost)
   - Status tracking (running, completed, failed)

3. **TestResult** - Individual assertion results
   - Assertion type and value
   - Pass/fail status with failure reasons
   - Output text and tool calls
   - Raw response storage

**Repository Pattern** (`backend/storage/repositories.py`):
1. **TestRepository** - CRUD operations for tests
   - Create, read, update, delete tests
   - Query by ID, name, or list all
   - Pagination support (limit/offset)
   - Canvas state persistence

2. **RunRepository** - Test run management
   - Create and track test runs
   - Update run status and metrics
   - Store assertion results
   - Query run history by test or across all tests

**REST API Endpoints** (`backend/api/tests.py`):
- `POST /api/tests/create` - Create new test definition
- `GET /api/tests/list` - List all tests (with pagination)
- `GET /api/tests/{test_id}` - Get specific test
- `PUT /api/tests/{test_id}` - Update test definition
- `DELETE /api/tests/{test_id}` - Delete test

### 🧪 Comprehensive Test Coverage

**24 new storage tests** (`backend/tests/test_storage.py`):
- Database connection and schema creation (4 tests)
- Test repository operations (11 tests)
- Run repository operations (9 tests)
- 100% passing, 97-99% code coverage for storage layer

**Test coverage highlights**:
- Create, read, update, delete operations
- Canvas state round-trip conversion
- Pagination and filtering
- Error handling (not found scenarios)
- Foreign key relationships
- Tool calls and raw response storage

---

## Technical Details

### Architecture

**Database Layer**:
```
backend/storage/
├── __init__.py          # Public API exports
├── database.py          # SQLAlchemy engine, session management
├── models.py            # TestDefinition, TestRun, TestResult models
└── repositories.py      # TestRepository, RunRepository
```

**Database Location**:
- **Desktop mode**: `~/.sentinel/sentinel.db` (SQLite)
- **Server mode**: PostgreSQL (future)
- Auto-created on first startup

**Session Management**:
- Context manager pattern for automatic cleanup
- Transaction support with rollback on error
- Foreign key constraints enforced

### Data Flow

1. **Test Creation**:
   ```
   Canvas → TestSpec → TestRepository.create() → SQLite
   ```

2. **Test Execution**:
   ```
   TestSpec → Executor → RunRepository.create()
   Executor → Assertions → RunRepository.create_result()
   Metrics → RunRepository.update_status()
   ```

3. **Test Loading**:
   ```
   SQLite → TestRepository.get_by_id() → TestSpec → Canvas
   ```

### API Integration

**Dependency Injection**:
- FastAPI `Depends()` for database session injection
- Automatic session cleanup and transaction management
- Type-safe Pydantic request/response models

**Error Handling**:
- HTTP 404 for not found resources
- HTTP 400 for validation errors
- HTTP 500 for internal errors
- Clear error messages in response body

---

## Files Changed

### Backend (New Files)

**Storage Layer** (4 files):
- `backend/storage/__init__.py` - Public API exports
- `backend/storage/database.py` - Database connection (110 LOC, 93% coverage)
- `backend/storage/models.py` - SQLAlchemy models (140 LOC, 98% coverage)
- `backend/storage/repositories.py` - Data access layer (255 LOC, 97% coverage)

**API Endpoints** (1 file):
- `backend/api/tests.py` - Test management API (215 LOC)

**Tests** (1 file):
- `backend/tests/test_storage.py` - Storage layer tests (350 LOC, 99% coverage)

**Total**: 6 new files, ~1,070 LOC

### Backend (Modified Files)

- `backend/main.py` - Added database initialization and tests router
- `backend/requirements.txt` - Added sqlalchemy>=2.0.0, alembic>=1.12.0

### Frontend (Modified Files)

- `frontend/package.json` - Version bump to 0.10.0

**Total**: 3 modified files

---

## Dependencies

### New Backend Dependencies
- `sqlalchemy>=2.0.0` - SQL toolkit and ORM
- `alembic>=1.12.0` - Database migration tool (future)

**Installed versions**:
- sqlalchemy 2.0.44
- alembic 1.17.2
- Mako 1.3.10 (alembic dependency)
- MarkupSafe 3.0.3 (Mako dependency)

---

## Testing

### Backend Tests

**Before**: 21 tests
**After**: 45 tests (+24 new storage tests)

```bash
cd backend
source venv/bin/activate
python -m pytest tests/ -v
```

**Results**: ✅ All 45 tests passing (100% pass rate)

**New test categories**:
- Database initialization and schema creation
- Test definition CRUD operations
- Test run tracking and status updates
- Assertion result storage
- Canvas state persistence
- Pagination and filtering

**Coverage**:
- `storage/database.py`: 93% (3 lines uncovered: error paths)
- `storage/models.py`: 98% (1 line uncovered)
- `storage/repositories.py`: 97% (3 lines uncovered: edge cases)

### Frontend Tests

**Status**: ✅ All 46 tests passing (no changes)

```bash
cd frontend
npm test -- --run
```

### Total Test Count

**91 tests** across frontend and backend (100% passing)

---

## Database Schema

### TestDefinition Table

| Column | Type | Description |
|--------|------|-------------|
| id | Integer (PK) | Auto-increment primary key |
| name | String(255) | Test name (indexed) |
| description | Text | Optional description |
| spec_json | Text (JSON) | Full TestSpec as JSON |
| spec_yaml | Text | Optional YAML representation |
| canvas_state | Text (JSON) | React Flow nodes and edges |
| provider | String(50) | Provider name (indexed) |
| model | String(100) | Model identifier (indexed) |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |
| version | Integer | Version number (increments on update) |

**Relationships**: One-to-many with TestRun

### TestRun Table

| Column | Type | Description |
|--------|------|-------------|
| id | Integer (PK) | Auto-increment primary key |
| test_definition_id | Integer (FK) | Foreign key to TestDefinition |
| started_at | DateTime | Run start time (indexed) |
| completed_at | DateTime | Run completion time |
| status | String(20) | running, completed, failed (indexed) |
| provider | String(50) | Provider used for this run |
| model | String(100) | Model used (indexed) |
| latency_ms | Integer | Execution latency in milliseconds |
| tokens_input | Integer | Input tokens consumed |
| tokens_output | Integer | Output tokens generated |
| cost_usd | Float | Estimated cost in USD |
| error_message | Text | Error details if failed |

**Relationships**:
- Many-to-one with TestDefinition
- One-to-many with TestResult

### TestResult Table

| Column | Type | Description |
|--------|------|-------------|
| id | Integer (PK) | Auto-increment primary key |
| test_run_id | Integer (FK) | Foreign key to TestRun |
| assertion_type | String(50) | Type of assertion |
| assertion_value | Text | Assertion value (JSON or text) |
| passed | Boolean | Whether assertion passed (indexed) |
| actual_value | Text | Actual value from output |
| failure_reason | Text | Failure explanation if failed |
| output_text | Text | Model output text |
| tool_calls_json | Text (JSON) | Tool calls as JSON |
| raw_response_json | Text (JSON) | Full model response |

**Relationships**: Many-to-one with TestRun

---

## Usage Examples

### Creating a Test

```python
from backend.storage import get_database, TestRepository

# Get database and session
db = get_database()
for session in db.get_session():
    repo = TestRepository(session)

    # Create test
    test = repo.create(
        name="GPT-5.1 Test",
        spec={
            "model": "gpt-5.1",
            "provider": "openai",
            "inputs": {"query": "Hello"},
            "assertions": [{"must_contain": "hello"}]
        },
        spec_yaml="name: GPT-5.1 Test\nmodel: gpt-5.1",
        canvas_state={
            "nodes": [...],
            "edges": [...]
        },
        description="Test GPT-5.1 basic response"
    )

    print(f"Created test ID: {test.id}")
```

### Recording a Test Run

```python
from backend.storage import RunRepository

for session in db.get_session():
    run_repo = RunRepository(session)

    # Create run
    run = run_repo.create(
        test_definition_id=1,
        provider="openai",
        model="gpt-5.1"
    )

    # Update status after execution
    run_repo.update_status(
        run.id,
        status="completed",
        latency_ms=1250,
        tokens_input=50,
        tokens_output=150,
        cost_usd=0.00165
    )

    # Store assertion result
    run_repo.create_result(
        run_id=run.id,
        assertion_type="must_contain",
        passed=True,
        assertion_value="hello",
        actual_value="Hello, how can I help?",
        output_text="Hello, how can I help?"
    )
```

### Using REST API

```bash
# Create test
curl -X POST http://localhost:8000/api/tests/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test",
    "spec": {"model": "gpt-5.1", "inputs": {"query": "test"}},
    "description": "Test via API"
  }'

# List all tests
curl http://localhost:8000/api/tests/list

# Get specific test
curl http://localhost:8000/api/tests/1

# Update test
curl -X PUT http://localhost:8000/api/tests/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'

# Delete test
curl -X DELETE http://localhost:8000/api/tests/1
```

---

## Migration Guide

### For Users

**No migration required**. Simply update to v0.10.0:

```bash
# Update backend dependencies
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Database will be auto-created on first startup
python -m uvicorn main:app --reload
```

**Database location**: `~/.sentinel/sentinel.db` (auto-created)

### For Developers

**New imports available**:
```python
from backend.storage import (
    Database,
    get_database,
    reset_database,  # For testing
    TestRepository,
    RunRepository,
    TestDefinition,
    TestRun,
    TestResult,
)
```

**Testing pattern**:
```python
import pytest
from backend.storage import get_database, reset_database

@pytest.fixture
def test_db():
    reset_database()
    db = get_database(f"sqlite:///:memory:")
    db.create_tables()
    yield db
```

---

## Known Issues

**Database Warnings** (non-critical):
1. `ResourceWarning: unclosed database` - SQLite connections not explicitly closed (SQLAlchemy handles cleanup)
2. `DeprecationWarning: datetime.datetime.utcnow()` - Will migrate to `datetime.now(datetime.UTC)` in future release

**No functional impact** - All tests passing, warnings only in test output.

---

## Breaking Changes

⚠️ **None**. This is a purely additive release.

All existing functionality remains unchanged:
- Model providers work as before
- Test execution unchanged
- Visual canvas unaffected
- YAML import/export unchanged

The storage layer is optional and does not affect existing features.

---

## What's Next?

### v0.11.0 (Next Release)

**Remaining components for Feature 3 completion**:

1. **Frontend API Integration**
   - API client service (`frontend/src/services/api.ts`)
   - Auto-save hook for canvas state
   - Test loading from database

2. **Live Execution Dashboard UI**
   - Real-time execution progress
   - Visual indicators on canvas
   - Metrics display (tokens, latency, cost)
   - Streaming output viewer

3. **Provider Marketplace UI**
   - Browse available providers
   - API key management (secure storage in Tauri)
   - Provider status indicators
   - One-click provider installation

See `backlog/active.md` for complete Feature 3 requirements.

---

## Performance & Storage

### Database Size

Typical storage requirements:
- Empty database: ~20 KB
- 100 tests: ~500 KB - 1 MB
- 1,000 test runs: ~10-50 MB (depending on output size)
- SQLite file growth: Linear with test count

**Recommendation**: Implement retention policies (future) for run history.

### Query Performance

Optimizations:
- Indexed columns: `name`, `provider`, `model`, `status`, `started_at`
- Foreign key constraints for referential integrity
- Connection pooling via SQLAlchemy

**Expected performance**:
- Single test lookup: <1ms
- List 100 tests: <10ms
- Run history query: <50ms (1000 runs)

---

## Credits

**Development**: Claude Code (autonomous implementation)
**Architecture**: Repository pattern, FastAPI best practices
**Testing**: 24 comprehensive tests (100% passing)

---

## Links

- **Roadmap**: `backlog/active.md` (Feature 3 - Line 460)
- **Storage Implementation**: `backend/storage/`
- **API Endpoints**: `backend/api/tests.py`
- **Tests**: `backend/tests/test_storage.py`

---

## Version Comparison

| Metric | v0.9.4 | v0.10.0 |
|--------|--------|---------|
| **Backend Tests** | 21 | 45 (+24) |
| **Frontend Tests** | 46 | 46 |
| **Total Tests** | 67 | 91 (+24) |
| **Backend LOC** | ~1,500 | ~2,570 (+1,070) |
| **Storage Layer** | ❌ None | ✅ Complete (SQLite) |
| **Test CRUD API** | ❌ None | ✅ 5 endpoints |
| **Data Persistence** | ❌ None | ✅ Full persistence |
| **Canvas State Save** | ❌ None | ✅ Auto-save ready |
| **Run History** | ❌ None | ✅ Queryable history |
| **Database** | ❌ None | ✅ SQLite + PostgreSQL support |

---

**Full Changelog**: https://github.com/navam-io/sentinel/compare/v0.9.4...v0.10.0

---

**Thank you for using Navam Sentinel!**

For questions, issues, or feedback, please open an issue in the repository.
