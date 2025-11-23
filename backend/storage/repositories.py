"""
Data access layer (repositories) for tests and runs.
"""

import json
from datetime import datetime
from typing import Any

from sqlalchemy import desc
from sqlalchemy.orm import Session

from .models import TestDefinition, TestResult, TestRun


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

        Returns:
            Created test definition
        """
        test = TestDefinition(
            name=name,
            description=description,
            category=category,
            is_template=is_template,
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
