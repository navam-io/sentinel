"""
Tests for the recording API endpoints and repositories.

Tests the Record & Replay feature including:
- Recording session lifecycle (start, pause, resume, stop)
- Event capturing and retrieval
- Smart detection analysis
- Test generation from recordings
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.storage.database import Base
from backend.storage.models import RecordingEvent, RecordingSession, TestDefinition
from backend.storage.repositories import RecordingRepository


# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def setup_database():
    """Create tables before each test and drop after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    """Create a database session for tests."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


class TestRecordingRepository:
    """Test RecordingRepository class."""

    def test_create_session(self, db_session):
        """Test creating a recording session."""
        repo = RecordingRepository(db_session)

        session = repo.create_session(name="Test Recording", description="A test")

        assert session.id is not None
        assert session.name == "Test Recording"
        assert session.description == "A test"
        assert session.status == "recording"
        assert session.started_at is not None
        assert session.stopped_at is None

    def test_get_active_session(self, db_session):
        """Test getting the active recording session."""
        repo = RecordingRepository(db_session)

        # No active session initially
        assert repo.get_active_session() is None

        # Create a session
        session = repo.create_session(name="Active Recording")
        active = repo.get_active_session()

        assert active is not None
        assert active.id == session.id

    def test_update_session_status(self, db_session):
        """Test updating recording session status."""
        repo = RecordingRepository(db_session)

        session = repo.create_session(name="Test Recording")
        assert session.status == "recording"

        # Pause
        updated = repo.update_session_status(session.id, "paused")
        assert updated.status == "paused"

        # Resume
        updated = repo.update_session_status(session.id, "recording")
        assert updated.status == "recording"

        # Stop
        updated = repo.update_session_status(session.id, "stopped")
        assert updated.status == "stopped"
        assert updated.stopped_at is not None

    def test_add_event(self, db_session):
        """Test adding events to a recording session."""
        repo = RecordingRepository(db_session)

        session = repo.create_session(name="Test Recording")

        event1 = repo.add_event(
            session_id=session.id,
            event_type="model_call",
            data={"query": "Hello", "model": "gpt-5.1"},
        )

        assert event1.id is not None
        assert event1.event_type == "model_call"
        assert event1.sequence_number == 1

        event2 = repo.add_event(
            session_id=session.id,
            event_type="output",
            data={"text": "World"},
        )

        assert event2.sequence_number == 2

    def test_get_events(self, db_session):
        """Test retrieving events for a session."""
        repo = RecordingRepository(db_session)

        session = repo.create_session(name="Test Recording")
        repo.add_event(session.id, "model_call", {"query": "Q1"})
        repo.add_event(session.id, "output", {"text": "A1"})
        repo.add_event(session.id, "tool_call", {"name": "search"})

        events = repo.get_events(session.id)

        assert len(events) == 3
        assert events[0].event_type == "model_call"
        assert events[1].event_type == "output"
        assert events[2].event_type == "tool_call"

    def test_delete_session(self, db_session):
        """Test deleting a recording session."""
        repo = RecordingRepository(db_session)

        session = repo.create_session(name="Test Recording")
        repo.add_event(session.id, "model_call", {})

        # Delete
        result = repo.delete_session(session.id)
        assert result is True

        # Verify deletion
        assert repo.get_session_by_id(session.id) is None

        # Delete non-existent
        result = repo.delete_session(999)
        assert result is False

    def test_get_session_by_id(self, db_session):
        """Test getting a session by ID."""
        repo = RecordingRepository(db_session)

        # Create a session
        session = repo.create_session(name="Test Session")

        # Get by ID
        retrieved = repo.get_session_by_id(session.id)
        assert retrieved is not None
        assert retrieved.id == session.id
        assert retrieved.name == "Test Session"

        # Non-existent ID
        assert repo.get_session_by_id(999) is None

    def test_set_generated_test(self, db_session):
        """Test linking a recording to a generated test."""
        repo = RecordingRepository(db_session)

        session = repo.create_session(name="Test Recording")
        assert session.generated_test_id is None

        # Link to a test (using a fake ID for now)
        # In real use, this would be a valid test_definition ID
        updated = repo.set_generated_test(session.id, 42)
        assert updated is not None
        assert updated.generated_test_id == 42

    def test_get_all_sessions(self, db_session):
        """Test listing all recording sessions."""
        repo = RecordingRepository(db_session)

        # Create multiple sessions
        repo.create_session(name="Session 1")
        repo.create_session(name="Session 2")
        repo.create_session(name="Session 3")

        # Get all
        sessions = repo.get_all_sessions()
        assert len(sessions) == 3

        # Test limit
        limited = repo.get_all_sessions(limit=2)
        assert len(limited) == 2


class TestSmartDetectionFunctions:
    """Test smart detection helper functions."""

    def test_detect_output_format_json(self):
        """Test JSON format detection."""
        from backend.api.recording import detect_output_format

        assert detect_output_format('{"key": "value"}') == "json"
        assert detect_output_format('[1, 2, 3]') == "json"
        assert detect_output_format('{"nested": {"obj": true}}') == "json"

    def test_detect_output_format_markdown(self):
        """Test markdown format detection."""
        from backend.api.recording import detect_output_format

        assert detect_output_format("# Header\n\nSome text") == "markdown"
        assert detect_output_format("**Bold** and *italic*") == "markdown"
        assert detect_output_format("- Item 1\n- Item 2") == "markdown"
        assert detect_output_format("```python\ncode\n```") == "markdown"

    def test_detect_output_format_code(self):
        """Test code format detection."""
        from backend.api.recording import detect_output_format

        assert detect_output_format("def hello():\n    pass") == "code"
        assert detect_output_format("function test() {}") == "code"
        assert detect_output_format("import os\nimport sys") == "code"

    def test_detect_output_format_text(self):
        """Test plain text format detection."""
        from backend.api.recording import detect_output_format

        assert detect_output_format("Hello, World!") == "text"
        assert detect_output_format("The answer is 42.") == "text"

    def test_analyze_recording_with_tool_calls(self):
        """Test analysis with tool calls present."""
        from backend.api.recording import analyze_recording_for_suggestions

        events = [
            {
                "event_type": "execution_complete",
                "data": {
                    "output": "Result",
                    "tool_calls": [
                        {"name": "search", "input": {"q": "test"}},
                        {"name": "calculator", "input": {"expr": "2+2"}},
                    ],
                },
            }
        ]

        result = analyze_recording_for_suggestions(events)

        assert result.has_tool_calls is True
        assert "search" in result.tool_names
        assert "calculator" in result.tool_names
        # Should suggest must_call_tool assertion
        assertion_types = [s.assertion_type for s in result.suggested_assertions]
        assert "must_call_tool" in assertion_types

    def test_analyze_recording_with_json_output(self):
        """Test analysis with JSON output."""
        from backend.api.recording import analyze_recording_for_suggestions

        events = [
            {
                "event_type": "execution_complete",
                "data": {"output": '{"result": "success", "value": 42}'},
            }
        ]

        result = analyze_recording_for_suggestions(events)

        assert result.output_format == "json"
        # Should suggest output_type: json assertion
        assertion_types = [s.assertion_type for s in result.suggested_assertions]
        assert "output_type" in assertion_types


class TestCanvasGenerationFunctions:
    """Test canvas generation helper functions."""

    def test_generate_basic_canvas(self):
        """Test generating a basic canvas with input and model nodes."""
        from backend.api.recording import generate_canvas_from_events

        events = [
            {
                "event_type": "model_call",
                "data": {
                    "query": "Hello world",
                    "model": "gpt-5.1",
                    "provider": "openai",
                    "temperature": 0.7,
                    "max_tokens": 1000,
                },
            }
        ]

        canvas = generate_canvas_from_events(events)

        # Should have input and model nodes
        node_types = [n["type"] for n in canvas["nodes"]]
        assert "input" in node_types
        assert "model" in node_types

        # Should have at least one edge
        assert len(canvas["edges"]) >= 1

    def test_generate_canvas_with_system_prompt(self):
        """Test generating canvas with system prompt."""
        from backend.api.recording import generate_canvas_from_events

        events = [
            {
                "event_type": "model_call",
                "data": {
                    "query": "Hello",
                    "system_prompt": "You are a helpful assistant.",
                    "model": "gpt-5.1",
                },
            }
        ]

        canvas = generate_canvas_from_events(events)

        node_types = [n["type"] for n in canvas["nodes"]]
        assert "system" in node_types

    def test_generate_canvas_with_tools(self):
        """Test generating canvas with tool nodes."""
        from backend.api.recording import generate_canvas_from_events

        events = [
            {
                "event_type": "model_call",
                "data": {
                    "query": "Search for info",
                    "model": "gpt-5.1",
                    "tools": [{"name": "search", "description": "Search the web"}],
                },
            }
        ]

        canvas = generate_canvas_from_events(events)

        node_types = [n["type"] for n in canvas["nodes"]]
        assert "tool" in node_types


class TestYAMLGenerationFunctions:
    """Test YAML generation helper functions."""

    def test_generate_yaml_basic(self):
        """Test generating basic YAML from events."""
        from backend.api.recording import generate_yaml_from_events

        events = [
            {
                "event_type": "model_call",
                "data": {
                    "query": "What is 2+2?",
                    "model": "gpt-5.1",
                    "provider": "openai",
                },
            }
        ]

        yaml_content = generate_yaml_from_events(events, "Math Test")

        assert "name: Math Test" in yaml_content
        assert "model: gpt-5.1" in yaml_content
        assert "What is 2+2?" in yaml_content

    def test_generate_yaml_with_suggestions(self):
        """Test generating YAML with smart detection suggestions."""
        from backend.api.recording import generate_yaml_from_events, SmartDetectionResult, SuggestedAssertion

        events = [
            {
                "event_type": "model_call",
                "data": {"query": "Test", "model": "gpt-5.1"},
            }
        ]

        suggestions = SmartDetectionResult(
            has_tool_calls=True,
            tool_names=["search"],
            output_format="json",
            suggested_assertions=[
                SuggestedAssertion(
                    assertion_type="must_call_tool",
                    assertion_value=["search"],
                    confidence=0.95,
                    reason="Tool detected",
                ),
                SuggestedAssertion(
                    assertion_type="output_type",
                    assertion_value="json",
                    confidence=0.9,
                    reason="JSON output",
                ),
            ],
            detected_patterns=[],
        )

        yaml_content = generate_yaml_from_events(events, "Test", suggestions)

        assert "assertions:" in yaml_content
