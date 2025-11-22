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
            "spec": json.loads(self.spec_json) if self.spec_json else None,
            "spec_yaml": self.spec_yaml,
            "canvas_state": json.loads(self.canvas_state) if self.canvas_state else None,
            "provider": self.provider,
            "model": self.model,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
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
