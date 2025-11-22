"""
Tests for storage layer (database, models, repositories).
"""

import os
import tempfile
from pathlib import Path

import pytest

from ..storage import (
    Database,
    RunRepository,
    TestRepository,
    get_database,
    reset_database,
)


@pytest.fixture
def test_db():
    """Create a temporary test database."""
    # Create temporary database file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".db") as f:
        db_path = f.name

    # Initialize database
    database_url = f"sqlite:///{db_path}"
    db = Database(database_url)
    db.create_tables()

    yield db

    # Cleanup
    try:
        os.unlink(db_path)
    except:
        pass


@pytest.fixture
def session(test_db):
    """Get database session for testing."""
    for session in test_db.get_session():
        yield session


class TestDatabase:
    """Tests for Database class."""

    def test_database_creation(self):
        """Test database can be created."""
        with tempfile.NamedTemporaryFile(delete=False, suffix=".db") as f:
            db_path = f.name

        try:
            db = Database(f"sqlite:///{db_path}")
            assert db.database_url == f"sqlite:///{db_path}"
            assert db.engine is not None
            assert db.SessionLocal is not None
        finally:
            os.unlink(db_path)

    def test_default_database_location(self):
        """Test default database location is ~/.sentinel/sentinel.db."""
        reset_database()
        db = get_database()
        expected_path = Path.home() / ".sentinel" / "sentinel.db"
        assert str(expected_path) in db.database_url

    def test_create_tables(self, test_db):
        """Test creating database tables."""
        test_db.create_tables()
        # No exception means success

    def test_session_context_manager(self, test_db):
        """Test session context manager works."""
        for session in test_db.get_session():
            assert session is not None
            break


class TestTestRepository:
    """Tests for TestRepository."""

    def test_create_test(self, session):
        """Test creating a test definition."""
        repo = TestRepository(session)
        test = repo.create(
            name="Test API Call",
            spec={"model": "gpt-5.1", "inputs": {"query": "Hello"}},
            spec_yaml="name: Test API Call\nmodel: gpt-5.1",
            description="Test basic API call",
        )

        assert test.id is not None
        assert test.name == "Test API Call"
        assert test.description == "Test basic API call"
        assert test.model == "gpt-5.1"
        assert test.version == 1

    def test_create_test_with_canvas_state(self, session):
        """Test creating test with canvas state."""
        repo = TestRepository(session)
        canvas_state = {
            "nodes": [{"id": "1", "type": "input", "data": {"value": "test"}}],
            "edges": [],
        }
        test = repo.create(
            name="Test with Canvas",
            spec={"model": "gpt-5.1"},
            canvas_state=canvas_state,
        )

        assert test.id is not None
        assert test.canvas_state is not None
        test_dict = test.to_dict()
        assert test_dict["canvas_state"]["nodes"][0]["id"] == "1"

    def test_get_by_id(self, session):
        """Test getting test by ID."""
        repo = TestRepository(session)
        created = repo.create(name="Test", spec={"model": "gpt-5.1"})

        retrieved = repo.get_by_id(created.id)
        assert retrieved is not None
        assert retrieved.id == created.id
        assert retrieved.name == "Test"

    def test_get_by_id_not_found(self, session):
        """Test getting non-existent test returns None."""
        repo = TestRepository(session)
        result = repo.get_by_id(99999)
        assert result is None

    def test_get_by_name(self, session):
        """Test getting test by name."""
        repo = TestRepository(session)
        repo.create(name="Unique Test", spec={"model": "gpt-5.1"})

        result = repo.get_by_name("Unique Test")
        assert result is not None
        assert result.name == "Unique Test"

    def test_get_all(self, session):
        """Test getting all tests."""
        repo = TestRepository(session)
        repo.create(name="Test 1", spec={"model": "gpt-5.1"})
        repo.create(name="Test 2", spec={"model": "gpt-5.1"})
        repo.create(name="Test 3", spec={"model": "gpt-5.1"})

        all_tests = repo.get_all()
        assert len(all_tests) == 3

    def test_get_all_with_pagination(self, session):
        """Test pagination in get_all."""
        repo = TestRepository(session)
        for i in range(10):
            repo.create(name=f"Test {i}", spec={"model": "gpt-5.1"})

        page1 = repo.get_all(limit=5, offset=0)
        page2 = repo.get_all(limit=5, offset=5)

        assert len(page1) == 5
        assert len(page2) == 5
        assert page1[0].id != page2[0].id

    def test_update_test(self, session):
        """Test updating a test."""
        repo = TestRepository(session)
        test = repo.create(name="Original", spec={"model": "gpt-5.1"})

        updated = repo.update(
            test.id,
            name="Updated",
            description="New description",
            spec={"model": "gpt-5-mini"},
        )

        assert updated is not None
        assert updated.name == "Updated"
        assert updated.description == "New description"
        assert updated.model == "gpt-5-mini"
        assert updated.version == 2

    def test_update_test_not_found(self, session):
        """Test updating non-existent test returns None."""
        repo = TestRepository(session)
        result = repo.update(99999, name="Updated")
        assert result is None

    def test_delete_test(self, session):
        """Test deleting a test."""
        repo = TestRepository(session)
        test = repo.create(name="To Delete", spec={"model": "gpt-5.1"})

        deleted = repo.delete(test.id)
        assert deleted is True

        result = repo.get_by_id(test.id)
        assert result is None

    def test_delete_test_not_found(self, session):
        """Test deleting non-existent test returns False."""
        repo = TestRepository(session)
        result = repo.delete(99999)
        assert result is False


class TestRunRepository:
    """Tests for RunRepository."""

    def test_create_run(self, session):
        """Test creating a test run."""
        # First create a test
        test_repo = TestRepository(session)
        test = test_repo.create(name="Test", spec={"model": "gpt-5.1"})

        # Create a run
        run_repo = RunRepository(session)
        run = run_repo.create(
            test_definition_id=test.id,
            provider="openai",
            model="gpt-5.1",
        )

        assert run.id is not None
        assert run.test_definition_id == test.id
        assert run.provider == "openai"
        assert run.model == "gpt-5.1"
        assert run.status == "running"
        assert run.started_at is not None
        assert run.completed_at is None

    def test_update_run_status_completed(self, session):
        """Test updating run status to completed."""
        test_repo = TestRepository(session)
        test = test_repo.create(name="Test", spec={"model": "gpt-5.1"})

        run_repo = RunRepository(session)
        run = run_repo.create(test.id, "openai", "gpt-5.1")

        updated = run_repo.update_status(
            run.id,
            status="completed",
            latency_ms=1500,
            tokens_input=100,
            tokens_output=200,
            cost_usd=0.0015,
        )

        assert updated is not None
        assert updated.status == "completed"
        assert updated.completed_at is not None
        assert updated.latency_ms == 1500
        assert updated.tokens_input == 100
        assert updated.tokens_output == 200
        assert updated.cost_usd == 0.0015

    def test_update_run_status_failed(self, session):
        """Test updating run status to failed."""
        test_repo = TestRepository(session)
        test = test_repo.create(name="Test", spec={"model": "gpt-5.1"})

        run_repo = RunRepository(session)
        run = run_repo.create(test.id, "openai", "gpt-5.1")

        updated = run_repo.update_status(
            run.id,
            status="failed",
            error_message="API key invalid",
        )

        assert updated is not None
        assert updated.status == "failed"
        assert updated.completed_at is not None
        assert updated.error_message == "API key invalid"

    def test_get_run_by_id(self, session):
        """Test getting run by ID."""
        test_repo = TestRepository(session)
        test = test_repo.create(name="Test", spec={"model": "gpt-5.1"})

        run_repo = RunRepository(session)
        created = run_repo.create(test.id, "openai", "gpt-5.1")

        retrieved = run_repo.get_by_id(created.id)
        assert retrieved is not None
        assert retrieved.id == created.id

    def test_get_runs_by_test(self, session):
        """Test getting runs for a specific test."""
        test_repo = TestRepository(session)
        test = test_repo.create(name="Test", spec={"model": "gpt-5.1"})

        run_repo = RunRepository(session)
        run_repo.create(test.id, "openai", "gpt-5.1")
        run_repo.create(test.id, "openai", "gpt-5-mini")
        run_repo.create(test.id, "anthropic", "claude-sonnet-4-5-20250929")

        runs = run_repo.get_by_test(test.id)
        assert len(runs) == 3

    def test_get_all_runs(self, session):
        """Test getting all runs."""
        test_repo = TestRepository(session)
        test1 = test_repo.create(name="Test 1", spec={"model": "gpt-5.1"})
        test2 = test_repo.create(name="Test 2", spec={"model": "gpt-5.1"})

        run_repo = RunRepository(session)
        run_repo.create(test1.id, "openai", "gpt-5.1")
        run_repo.create(test2.id, "openai", "gpt-5.1")

        all_runs = run_repo.get_all()
        assert len(all_runs) == 2

    def test_create_result(self, session):
        """Test creating an assertion result."""
        test_repo = TestRepository(session)
        test = test_repo.create(name="Test", spec={"model": "gpt-5.1"})

        run_repo = RunRepository(session)
        run = run_repo.create(test.id, "openai", "gpt-5.1")

        result = run_repo.create_result(
            run_id=run.id,
            assertion_type="must_contain",
            passed=True,
            assertion_value="Hello",
            actual_value="Hello, World!",
            output_text="Hello, World!",
        )

        assert result.id is not None
        assert result.test_run_id == run.id
        assert result.assertion_type == "must_contain"
        assert result.passed is True

    def test_create_result_with_tool_calls(self, session):
        """Test creating result with tool calls."""
        test_repo = TestRepository(session)
        test = test_repo.create(name="Test", spec={"model": "gpt-5.1"})

        run_repo = RunRepository(session)
        run = run_repo.create(test.id, "openai", "gpt-5.1")

        tool_calls = [{"id": "1", "name": "search", "arguments": '{"query": "test"}'}]

        result = run_repo.create_result(
            run_id=run.id,
            assertion_type="must_call_tool",
            passed=True,
            tool_calls=tool_calls,
        )

        assert result.id is not None
        result_dict = result.to_dict()
        assert len(result_dict["tool_calls"]) == 1
        assert result_dict["tool_calls"][0]["name"] == "search"

    def test_get_results_by_run(self, session):
        """Test getting all results for a run."""
        test_repo = TestRepository(session)
        test = test_repo.create(name="Test", spec={"model": "gpt-5.1"})

        run_repo = RunRepository(session)
        run = run_repo.create(test.id, "openai", "gpt-5.1")

        run_repo.create_result(run.id, "must_contain", True)
        run_repo.create_result(run.id, "max_latency_ms", True)
        run_repo.create_result(run.id, "must_call_tool", False)

        results = run_repo.get_results_by_run(run.id)
        assert len(results) == 3
        assert sum(1 for r in results if r.passed) == 2
        assert sum(1 for r in results if not r.passed) == 1
