"""
Data access layer (repositories) for tests, runs, and recordings.
"""

import json
from datetime import datetime
from typing import Any

from sqlalchemy import desc
from sqlalchemy.orm import Session

from .models import RecordingEvent, RecordingSession, TestDefinition, TestResult, TestRun


class TestRepository:
    """Repository for test definitions."""

    def __init__(self, session: Session):
        """Initialize repository.

        Args:
            session: Database session
        """
        self.session = session

    def create(
        self,
        name: str,
        spec: dict[str, Any],
        spec_yaml: str | None = None,
        canvas_state: dict[str, Any] | None = None,
        description: str | None = None,
        category: str | None = None,
        is_template: bool = False,
        filename: str | None = None,
    ) -> TestDefinition:
        """Create a new test definition.

        Args:
            name: Test name
            spec: Test specification (as dict)
            spec_yaml: Optional YAML representation
            canvas_state: Optional canvas state (React Flow nodes/edges)
            description: Optional description
            category: Optional test category
            is_template: Whether this is a template (default False)
            filename: Optional YAML filename in artifacts/tests/

        Returns:
            Created test definition
        """
        test = TestDefinition(
            name=name,
            description=description,
            category=category,
            is_template=is_template,
            filename=filename,
            spec_json=json.dumps(spec),
            spec_yaml=spec_yaml,
            canvas_state=json.dumps(canvas_state) if canvas_state else None,
            provider=spec.get("provider"),
            model=spec.get("model"),
        )
        self.session.add(test)
        self.session.commit()
        self.session.refresh(test)
        return test

    def get_by_id(self, test_id: int) -> TestDefinition | None:
        """Get test definition by ID.

        Args:
            test_id: Test ID

        Returns:
            Test definition or None if not found
        """
        return self.session.query(TestDefinition).filter(TestDefinition.id == test_id).first()

    def get_by_name(self, name: str) -> TestDefinition | None:
        """Get test definition by name.

        Args:
            name: Test name

        Returns:
            Test definition or None if not found
        """
        return self.session.query(TestDefinition).filter(TestDefinition.name == name).first()

    def get_all(self, limit: int = 100, offset: int = 0) -> list[TestDefinition]:
        """Get all test definitions.

        Args:
            limit: Maximum number of tests to return
            offset: Number of tests to skip

        Returns:
            List of test definitions
        """
        return (
            self.session.query(TestDefinition)
            .order_by(desc(TestDefinition.updated_at))
            .limit(limit)
            .offset(offset)
            .all()
        )

    def get_by_filename(self, filename: str) -> TestDefinition | None:
        """Get test definition by filename.

        Args:
            filename: YAML filename (without extension)

        Returns:
            Test definition or None if not found
        """
        return (
            self.session.query(TestDefinition).filter(TestDefinition.filename == filename).first()
        )

    def update(
        self,
        test_id: int,
        name: str | None = None,
        spec: dict[str, Any] | None = None,
        spec_yaml: str | None = None,
        canvas_state: dict[str, Any] | None = None,
        description: str | None = None,
        category: str | None = None,
        is_template: bool | None = None,
        filename: str | None = None,
    ) -> TestDefinition | None:
        """Update test definition.

        Args:
            test_id: Test ID
            name: Optional new name
            spec: Optional new test specification
            spec_yaml: Optional new YAML representation
            canvas_state: Optional new canvas state
            description: Optional new description
            category: Optional new category
            is_template: Optional new template flag
            filename: Optional new filename

        Returns:
            Updated test definition or None if not found
        """
        test = self.get_by_id(test_id)
        if not test:
            return None

        if name is not None:
            test.name = name
        if description is not None:
            test.description = description
        if category is not None:
            test.category = category
        if is_template is not None:
            test.is_template = is_template
        if filename is not None:
            test.filename = filename
        if spec is not None:
            test.spec_json = json.dumps(spec)
            test.provider = spec.get("provider")
            test.model = spec.get("model")
        if spec_yaml is not None:
            test.spec_yaml = spec_yaml
        if canvas_state is not None:
            test.canvas_state = json.dumps(canvas_state)

        test.version += 1
        test.updated_at = datetime.utcnow()

        self.session.commit()
        self.session.refresh(test)
        return test

    def update_last_run(self, test_id: int) -> TestDefinition | None:
        """Update last_run_at timestamp for a test.

        Args:
            test_id: Test ID

        Returns:
            Updated test definition or None if not found
        """
        test = self.get_by_id(test_id)
        if not test:
            return None

        test.last_run_at = datetime.utcnow()
        self.session.commit()
        self.session.refresh(test)
        return test

    def delete(self, test_id: int) -> bool:
        """Delete test definition.

        Args:
            test_id: Test ID

        Returns:
            True if deleted, False if not found
        """
        test = self.get_by_id(test_id)
        if not test:
            return False

        self.session.delete(test)
        self.session.commit()
        return True


class RunRepository:
    """Repository for test runs."""

    def __init__(self, session: Session):
        """Initialize repository.

        Args:
            session: Database session
        """
        self.session = session

    def create(
        self,
        test_definition_id: int,
        provider: str,
        model: str,
    ) -> TestRun:
        """Create a new test run.

        Args:
            test_definition_id: Test definition ID
            provider: Provider name
            model: Model identifier

        Returns:
            Created test run
        """
        run = TestRun(
            test_definition_id=test_definition_id,
            provider=provider,
            model=model,
            status="running",
        )
        self.session.add(run)
        self.session.commit()
        self.session.refresh(run)
        return run

    def update_status(
        self,
        run_id: int,
        status: str,
        latency_ms: int | None = None,
        tokens_input: int | None = None,
        tokens_output: int | None = None,
        cost_usd: float | None = None,
        error_message: str | None = None,
    ) -> TestRun | None:
        """Update test run status.

        Args:
            run_id: Run ID
            status: New status (running, completed, failed)
            latency_ms: Optional latency in milliseconds
            tokens_input: Optional input tokens
            tokens_output: Optional output tokens
            cost_usd: Optional cost in USD
            error_message: Optional error message

        Returns:
            Updated test run or None if not found
        """
        run = self.session.query(TestRun).filter(TestRun.id == run_id).first()
        if not run:
            return None

        run.status = status
        if status in ("completed", "failed"):
            run.completed_at = datetime.utcnow()

        if latency_ms is not None:
            run.latency_ms = latency_ms
        if tokens_input is not None:
            run.tokens_input = tokens_input
        if tokens_output is not None:
            run.tokens_output = tokens_output
        if cost_usd is not None:
            run.cost_usd = cost_usd
        if error_message is not None:
            run.error_message = error_message

        self.session.commit()
        self.session.refresh(run)
        return run

    def get_by_id(self, run_id: int) -> TestRun | None:
        """Get test run by ID.

        Args:
            run_id: Run ID

        Returns:
            Test run or None if not found
        """
        return self.session.query(TestRun).filter(TestRun.id == run_id).first()

    def get_by_test(
        self,
        test_definition_id: int,
        limit: int = 50,
        offset: int = 0,
    ) -> list[TestRun]:
        """Get runs for a specific test.

        Args:
            test_definition_id: Test definition ID
            limit: Maximum number of runs to return
            offset: Number of runs to skip

        Returns:
            List of test runs
        """
        return (
            self.session.query(TestRun)
            .filter(TestRun.test_definition_id == test_definition_id)
            .order_by(desc(TestRun.started_at))
            .limit(limit)
            .offset(offset)
            .all()
        )

    def get_all(self, limit: int = 100, offset: int = 0) -> list[TestRun]:
        """Get all test runs.

        Args:
            limit: Maximum number of runs to return
            offset: Number of runs to skip

        Returns:
            List of test runs
        """
        return (
            self.session.query(TestRun)
            .order_by(desc(TestRun.started_at))
            .limit(limit)
            .offset(offset)
            .all()
        )

    def create_result(
        self,
        run_id: int,
        assertion_type: str,
        passed: bool,
        assertion_value: str | None = None,
        actual_value: str | None = None,
        failure_reason: str | None = None,
        output_text: str | None = None,
        tool_calls: list[dict[str, Any]] | None = None,
        raw_response: dict[str, Any] | None = None,
    ) -> TestResult:
        """Create assertion result for a run.

        Args:
            run_id: Test run ID
            assertion_type: Type of assertion
            passed: Whether assertion passed
            assertion_value: Optional assertion value
            actual_value: Optional actual value
            failure_reason: Optional failure reason
            output_text: Optional output text
            tool_calls: Optional tool calls
            raw_response: Optional raw response

        Returns:
            Created test result
        """
        result = TestResult(
            test_run_id=run_id,
            assertion_type=assertion_type,
            assertion_value=assertion_value,
            passed=passed,
            actual_value=actual_value,
            failure_reason=failure_reason,
            output_text=output_text,
            tool_calls_json=json.dumps(tool_calls) if tool_calls else None,
            raw_response_json=json.dumps(raw_response) if raw_response else None,
        )
        self.session.add(result)
        self.session.commit()
        self.session.refresh(result)
        return result

    def get_results_by_run(self, run_id: int) -> list[TestResult]:
        """Get all results for a test run.

        Args:
            run_id: Run ID

        Returns:
            List of test results
        """
        return self.session.query(TestResult).filter(TestResult.test_run_id == run_id).all()


class RecordingRepository:
    """Repository for recording sessions and events."""

    def __init__(self, session: Session):
        """Initialize repository.

        Args:
            session: Database session
        """
        self.session = session

    def create_session(
        self,
        name: str,
        description: str | None = None,
    ) -> RecordingSession:
        """Create a new recording session.

        Args:
            name: Session name
            description: Optional description

        Returns:
            Created recording session
        """
        recording = RecordingSession(
            name=name,
            description=description,
            status="recording",
        )
        self.session.add(recording)
        self.session.commit()
        self.session.refresh(recording)
        return recording

    def get_session_by_id(self, session_id: int) -> RecordingSession | None:
        """Get recording session by ID.

        Args:
            session_id: Recording session ID

        Returns:
            Recording session or None if not found
        """
        return (
            self.session.query(RecordingSession).filter(RecordingSession.id == session_id).first()
        )

    def get_active_session(self) -> RecordingSession | None:
        """Get the currently active (recording) session.

        Returns:
            Active recording session or None
        """
        return (
            self.session.query(RecordingSession)
            .filter(RecordingSession.status == "recording")
            .order_by(desc(RecordingSession.started_at))
            .first()
        )

    def update_session_status(
        self,
        session_id: int,
        status: str,
    ) -> RecordingSession | None:
        """Update recording session status.

        Args:
            session_id: Recording session ID
            status: New status (recording, paused, stopped)

        Returns:
            Updated recording session or None if not found
        """
        recording = self.get_session_by_id(session_id)
        if not recording:
            return None

        recording.status = status
        if status == "stopped":
            recording.stopped_at = datetime.utcnow()

        self.session.commit()
        self.session.refresh(recording)
        return recording

    def set_generated_test(
        self,
        session_id: int,
        test_id: int,
    ) -> RecordingSession | None:
        """Link recording session to generated test.

        Args:
            session_id: Recording session ID
            test_id: Generated test definition ID

        Returns:
            Updated recording session or None if not found
        """
        recording = self.get_session_by_id(session_id)
        if not recording:
            return None

        recording.generated_test_id = test_id
        self.session.commit()
        self.session.refresh(recording)
        return recording

    def add_event(
        self,
        session_id: int,
        event_type: str,
        data: dict[str, Any],
    ) -> RecordingEvent:
        """Add an event to a recording session.

        Args:
            session_id: Recording session ID
            event_type: Type of event (model_call, tool_call, output, etc.)
            data: Event data as dictionary

        Returns:
            Created recording event
        """
        # Get the current sequence number
        max_seq = (
            self.session.query(RecordingEvent.sequence_number)
            .filter(RecordingEvent.recording_session_id == session_id)
            .order_by(desc(RecordingEvent.sequence_number))
            .first()
        )
        next_seq = (max_seq[0] + 1) if max_seq else 1

        event = RecordingEvent(
            recording_session_id=session_id,
            event_type=event_type,
            sequence_number=next_seq,
            data_json=json.dumps(data),
        )
        self.session.add(event)
        self.session.commit()
        self.session.refresh(event)
        return event

    def get_events(self, session_id: int) -> list[RecordingEvent]:
        """Get all events for a recording session.

        Args:
            session_id: Recording session ID

        Returns:
            List of recording events in order
        """
        return (
            self.session.query(RecordingEvent)
            .filter(RecordingEvent.recording_session_id == session_id)
            .order_by(RecordingEvent.sequence_number)
            .all()
        )

    def get_all_sessions(
        self,
        limit: int = 50,
        offset: int = 0,
    ) -> list[RecordingSession]:
        """Get all recording sessions.

        Args:
            limit: Maximum number of sessions to return
            offset: Number of sessions to skip

        Returns:
            List of recording sessions
        """
        return (
            self.session.query(RecordingSession)
            .order_by(desc(RecordingSession.created_at))
            .limit(limit)
            .offset(offset)
            .all()
        )

    def delete_session(self, session_id: int) -> bool:
        """Delete a recording session and all its events.

        Args:
            session_id: Recording session ID

        Returns:
            True if deleted, False if not found
        """
        recording = self.get_session_by_id(session_id)
        if not recording:
            return False

        self.session.delete(recording)
        self.session.commit()
        return True
