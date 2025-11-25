"""
SQLAlchemy models for test definitions, runs, and results.
"""

import json
from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .database import Base


class TestDefinition(Base):
    """Test definition stored in database."""

    __tablename__ = "test_definitions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(
        String(50), nullable=True, index=True
    )  # Test category (qa, code-generation, etc.)
    is_template = Column(
        Boolean, default=False, nullable=False
    )  # Distinguishes templates from user tests

    # File-based storage (Phase 4 - v0.32.0)
    filename = Column(
        String(100), nullable=True, unique=True, index=True
    )  # YAML filename in artifacts/tests/

    # Test specification (stored as JSON)
    spec_json = Column(Text, nullable=False)  # Full TestSpec as JSON
    spec_yaml = Column(Text, nullable=True)  # Optional YAML representation

    # Canvas state (stored as JSON)
    canvas_state = Column(Text, nullable=True)  # React Flow nodes and edges

    # Metadata
    provider = Column(String(50), nullable=True, index=True)
    model = Column(String(100), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_run_at = Column(DateTime, nullable=True)  # Timestamp of last test run

    # Version tracking
    version = Column(Integer, default=1, nullable=False)

    # Relationships
    runs = relationship("TestRun", back_populates="test_definition", cascade="all, delete-orphan")

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "is_template": self.is_template,
            "filename": self.filename,
            "spec": json.loads(self.spec_json) if self.spec_json else None,
            "spec_yaml": self.spec_yaml,
            "canvas_state": json.loads(self.canvas_state) if self.canvas_state else None,
            "provider": self.provider,
            "model": self.model,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_run_at": self.last_run_at.isoformat() if self.last_run_at else None,
            "version": self.version,
        }


class TestRun(Base):
    """Test run execution record."""

    __tablename__ = "test_runs"

    id = Column(Integer, primary_key=True, index=True)
    test_definition_id = Column(
        Integer, ForeignKey("test_definitions.id"), nullable=False, index=True
    )

    # Execution metadata
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String(20), nullable=False, index=True)  # running, completed, failed

    # Test configuration at time of run
    provider = Column(String(50), nullable=False)
    model = Column(String(100), nullable=False, index=True)

    # Execution metrics
    latency_ms = Column(Integer, nullable=True)
    tokens_input = Column(Integer, nullable=True)
    tokens_output = Column(Integer, nullable=True)
    cost_usd = Column(Float, nullable=True)

    # Error information
    error_message = Column(Text, nullable=True)

    # Relationships
    test_definition = relationship("TestDefinition", back_populates="runs")
    results = relationship("TestResult", back_populates="test_run", cascade="all, delete-orphan")

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "test_definition_id": self.test_definition_id,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "status": self.status,
            "provider": self.provider,
            "model": self.model,
            "latency_ms": self.latency_ms,
            "tokens_input": self.tokens_input,
            "tokens_output": self.tokens_output,
            "cost_usd": self.cost_usd,
            "error_message": self.error_message,
        }


class TestResult(Base):
    """Individual assertion result for a test run."""

    __tablename__ = "test_results"

    id = Column(Integer, primary_key=True, index=True)
    test_run_id = Column(Integer, ForeignKey("test_runs.id"), nullable=False, index=True)

    # Assertion information
    assertion_type = Column(String(50), nullable=False)
    assertion_value = Column(Text, nullable=True)  # JSON or text value

    # Result
    passed = Column(Boolean, nullable=False, index=True)
    actual_value = Column(Text, nullable=True)
    failure_reason = Column(Text, nullable=True)

    # Output captured
    output_text = Column(Text, nullable=True)
    tool_calls_json = Column(Text, nullable=True)  # Tool calls as JSON
    raw_response_json = Column(Text, nullable=True)  # Full response as JSON

    # Relationships
    test_run = relationship("TestRun", back_populates="results")

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "test_run_id": self.test_run_id,
            "assertion_type": self.assertion_type,
            "assertion_value": self.assertion_value,
            "passed": self.passed,
            "actual_value": self.actual_value,
            "failure_reason": self.failure_reason,
            "output_text": self.output_text,
            "tool_calls": json.loads(self.tool_calls_json) if self.tool_calls_json else None,
            "raw_response": json.loads(self.raw_response_json) if self.raw_response_json else None,
        }


class RecordingSession(Base):
    """Recording session for capturing agent interactions."""

    __tablename__ = "recording_sessions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, index=True)  # recording, paused, stopped

    # Timing
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    stopped_at = Column(DateTime, nullable=True)

    # Generated test (if converted to test)
    generated_test_id = Column(Integer, ForeignKey("test_definitions.id"), nullable=True)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    events = relationship("RecordingEvent", back_populates="session", cascade="all, delete-orphan")
    generated_test = relationship("TestDefinition", foreign_keys=[generated_test_id])

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "status": self.status,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "stopped_at": self.stopped_at.isoformat() if self.stopped_at else None,
            "generated_test_id": self.generated_test_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "event_count": len(self.events) if self.events else 0,
        }


class RecordingEvent(Base):
    """Individual event captured during a recording session."""

    __tablename__ = "recording_events"

    id = Column(Integer, primary_key=True, index=True)
    recording_session_id = Column(
        Integer, ForeignKey("recording_sessions.id"), nullable=False, index=True
    )

    # Event information
    event_type = Column(String(50), nullable=False, index=True)  # model_call, tool_call, output
    sequence_number = Column(Integer, nullable=False)  # Order of events
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Event data (JSON-serialized)
    data_json = Column(Text, nullable=False)

    # Relationships
    session = relationship("RecordingSession", back_populates="events")

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "recording_session_id": self.recording_session_id,
            "event_type": self.event_type,
            "sequence_number": self.sequence_number,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "data": json.loads(self.data_json) if self.data_json else None,
        }
