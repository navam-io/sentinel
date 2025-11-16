"""
Test execution API endpoints.
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from ..core.schema import TestSpec
from ..providers.base import ExecutionResult

router = APIRouter()


class ExecuteRequest(BaseModel):
    """Request to execute a test."""

    test_spec: TestSpec
    provider: Optional[str] = None  # Future: override provider selection


class ExecuteResponse(BaseModel):
    """Response from test execution."""

    result: ExecutionResult


@router.post("/execute", response_model=ExecuteResponse)
async def execute_test(request: ExecuteRequest, app_request: Request):
    """Execute a test specification.

    Args:
        request: Test execution request with test specification
        app_request: FastAPI request object to access app state

    Returns:
        ExecuteResponse with execution results

    Raises:
        HTTPException: If execution fails or provider is not configured
    """
    try:
        # Get executor from app state
        executor = app_request.app.state.executor

        # Execute the test
        result = await executor.execute(request.test_spec)

        return ExecuteResponse(result=result)

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
