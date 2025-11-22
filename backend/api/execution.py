"""
Test execution API endpoints.
"""


from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from ..core.schema import TestSpec
from ..providers.base import ExecutionResult
from ..validators.assertion_validator import ValidationResult, validate_assertions

router = APIRouter()


class ExecuteRequest(BaseModel):
    """Request to execute a test."""

    test_spec: TestSpec
    provider: str | None = None  # Future: override provider selection


class ExecuteResponse(BaseModel):
    """Response from test execution with assertion validation results."""

    result: ExecutionResult
    assertions: list[ValidationResult]
    all_assertions_passed: bool


@router.post("/execute", response_model=ExecuteResponse)
async def execute_test(request: ExecuteRequest, app_request: Request):
    """Execute a test specification and validate assertions.

    Args:
        request: Test execution request with test specification
        app_request: FastAPI request object to access app state

    Returns:
        ExecuteResponse with execution results and assertion validations

    Raises:
        HTTPException: If execution fails or provider is not configured
    """
    try:
        # Get executor from app state
        executor = app_request.app.state.executor

        # Execute the test
        result = await executor.execute(request.test_spec)

        # Validate assertions if any
        assertion_results = []
        if request.test_spec.assertions:
            assertion_results = validate_assertions(request.test_spec.assertions, result)

        # Check if all assertions passed
        all_passed = all(ar.passed for ar in assertion_results) if assertion_results else True

        return ExecuteResponse(
            result=result,
            assertions=assertion_results,
            all_assertions_passed=all_passed,
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
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
