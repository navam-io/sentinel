"""
Test management API endpoints (CRUD operations).
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..storage import TestRepository, get_database

router = APIRouter()


class CreateTestRequest(BaseModel):
    """Request to create a test."""

    name: str
    spec: dict[str, Any]
    spec_yaml: str | None = None
    canvas_state: dict[str, Any] | None = None
    description: str | None = None
    category: str | None = None
    is_template: bool = False


class UpdateTestRequest(BaseModel):
    """Request to update a test."""

    name: str | None = None
    spec: dict[str, Any] | None = None
    spec_yaml: str | None = None
    canvas_state: dict[str, Any] | None = None
    description: str | None = None
    category: str | None = None
    is_template: bool | None = None


class TestResponse(BaseModel):
    """Test definition response."""

    id: int
    name: str
    description: str | None
    category: str | None
    is_template: bool
    spec: dict[str, Any] | None
    spec_yaml: str | None
    canvas_state: dict[str, Any] | None
    provider: str | None
    model: str | None
    created_at: str | None
    updated_at: str | None
    version: int


class TestListResponse(BaseModel):
    """List of tests response."""

    tests: list[TestResponse]
    total: int


def get_db_session():
    """Dependency to get database session."""
    db = get_database()
    yield from db.get_session()


@router.post("/create", response_model=TestResponse)
async def create_test(request: CreateTestRequest, session: Session = Depends(get_db_session)):
    """Create a new test definition.

    Args:
        request: Test creation request
        session: Database session

    Returns:
        Created test definition

    Raises:
        HTTPException: If test creation fails
    """
    try:
        repo = TestRepository(session)
        test = repo.create(
            name=request.name,
            spec=request.spec,
            spec_yaml=request.spec_yaml,
            canvas_state=request.canvas_state,
            description=request.description,
            category=request.category,
            is_template=request.is_template,
        )
        return TestResponse(**test.to_dict())

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create test: {str(e)}")


@router.get("/list", response_model=TestListResponse)
async def list_tests(
    limit: int = 100,
    offset: int = 0,
    session: Session = Depends(get_db_session),
):
    """List all test definitions.

    Args:
        limit: Maximum number of tests to return
        offset: Number of tests to skip
        session: Database session

    Returns:
        List of test definitions
    """
    try:
        repo = TestRepository(session)
        tests = repo.get_all(limit=limit, offset=offset)
        return TestListResponse(
            tests=[TestResponse(**test.to_dict()) for test in tests],
            total=len(tests),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list tests: {str(e)}")


@router.get("/{test_id}", response_model=TestResponse)
async def get_test(test_id: int, session: Session = Depends(get_db_session)):
    """Get a specific test definition.

    Args:
        test_id: Test ID
        session: Database session

    Returns:
        Test definition

    Raises:
        HTTPException: If test not found
    """
    try:
        repo = TestRepository(session)
        test = repo.get_by_id(test_id)
        if not test:
            raise HTTPException(status_code=404, detail=f"Test {test_id} not found")

        return TestResponse(**test.to_dict())

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get test: {str(e)}")


@router.put("/{test_id}", response_model=TestResponse)
async def update_test(
    test_id: int,
    request: UpdateTestRequest,
    session: Session = Depends(get_db_session),
):
    """Update a test definition.

    Args:
        test_id: Test ID
        request: Update request
        session: Database session

    Returns:
        Updated test definition

    Raises:
        HTTPException: If test not found or update fails
    """
    try:
        repo = TestRepository(session)
        test = repo.update(
            test_id=test_id,
            name=request.name,
            spec=request.spec,
            spec_yaml=request.spec_yaml,
            canvas_state=request.canvas_state,
            description=request.description,
            category=request.category,
            is_template=request.is_template,
        )
        if not test:
            raise HTTPException(status_code=404, detail=f"Test {test_id} not found")

        return TestResponse(**test.to_dict())

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update test: {str(e)}")


@router.delete("/{test_id}")
async def delete_test(test_id: int, session: Session = Depends(get_db_session)):
    """Delete a test definition.

    Args:
        test_id: Test ID
        session: Database session

    Returns:
        Success message

    Raises:
        HTTPException: If test not found or deletion fails
    """
    try:
        repo = TestRepository(session)
        deleted = repo.delete(test_id)
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Test {test_id} not found")

        return {"message": f"Test {test_id} deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete test: {str(e)}")
