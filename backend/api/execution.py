"""
Test execution API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..core.schema import TestSpec
from ..providers.base import ExecutionResult
from ..storage import RunRepository, TestRepository, get_database
from ..validators.assertion_validator import ValidationResult, validate_assertions

router = APIRouter()


def get_db_session():
    """Dependency to get database session."""
    db = get_database()
    yield from db.get_session()


class ExecuteRequest(BaseModel):
    """Request to execute a test."""

    test_spec: TestSpec
    test_id: int | None = None  # Optional: Link run to saved test
    provider: str | None = None  # Future: override provider selection


class ExecuteResponse(BaseModel):
    """Response from test execution with assertion validation results."""

    result: ExecutionResult
    assertions: list[ValidationResult]
    all_assertions_passed: bool
    run_id: int | None = None  # ID of the created run record (if test_id provided)


@router.post("/execute", response_model=ExecuteResponse)
async def execute_test(
    request: ExecuteRequest,
    app_request: Request,
    session: Session = Depends(get_db_session),
):
    """Execute a test specification and validate assertions.

    Args:
        request: Test execution request with test specification
        app_request: FastAPI request object to access app state
        session: Database session for storing run records

    Returns:
        ExecuteResponse with execution results and assertion validations

    Raises:
        HTTPException: If execution fails or provider is not configured
    """
    run_id = None

    try:
        # Get executor from app state
        executor = app_request.app.state.executor

        # If test_id provided, create a run record
        if request.test_id:
            test_repo = TestRepository(session)
            run_repo = RunRepository(session)

            # Verify test exists
            test = test_repo.get_by_id(request.test_id)
            if not test:
                raise HTTPException(status_code=404, detail=f"Test {request.test_id} not found")

            # Create run record
            run = run_repo.create(
                test_definition_id=request.test_id,
                provider=request.test_spec.provider or "anthropic",
                model=request.test_spec.model,
            )
            run_id = run.id

        # Execute the test
        result = await executor.execute(request.test_spec)

        # Validate assertions if any
        assertion_results = []
        if request.test_spec.assertions:
            assertion_results = validate_assertions(request.test_spec.assertions, result)

        # Check if all assertions passed
        all_passed = all(ar.passed for ar in assertion_results) if assertion_results else True

        # Update run record with results
        if run_id:
            run_repo = RunRepository(session)
            run_repo.update_status(
                run_id=run_id,
                status="completed" if result.success else "failed",
                latency_ms=result.latency_ms,
                tokens_input=result.tokens_input,
                tokens_output=result.tokens_output,
                cost_usd=result.cost_usd,
                error_message=result.error if not result.success else None,
            )

            # Store assertion results
            for ar in assertion_results:
                run_repo.create_result(
                    run_id=run_id,
                    assertion_type=ar.assertion_type,
                    passed=ar.passed,
                    assertion_value=str(ar.expected) if ar.expected else None,
                    actual_value=str(ar.actual) if ar.actual else None,
                    failure_reason=ar.message if not ar.passed else None,
                    output_text=result.output,
                )

            # Update test's last_run_at timestamp
            test_repo = TestRepository(session)
            test_repo.update_last_run(request.test_id)

        return ExecuteResponse(
            result=result,
            assertions=assertion_results,
            all_assertions_passed=all_passed,
            run_id=run_id,
        )

    except HTTPException:
        raise
    except ValueError as e:
        # Update run record with failure if created
        if run_id:
            run_repo = RunRepository(session)
            run_repo.update_status(run_id=run_id, status="failed", error_message=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Update run record with failure if created
        if run_id:
            run_repo = RunRepository(session)
            run_repo.update_status(run_id=run_id, status="failed", error_message=str(e))
        raise HTTPException(status_code=500, detail=f"Execution failed: {str(e)}")


@router.get("/status")
async def get_execution_status():
    """Get execution service status.

    Returns:
        Status information about the execution service
    """
    return {
        "status": "ready",
        "message": "Execution service is ready to run tests",
    }
