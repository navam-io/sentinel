"""
Test management API endpoints (CRUD operations).
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from ..storage import get_database, TestRepository
from ..storage.database import Database

router = APIRouter()


class CreateTestRequest(BaseModel):
    """Request to create a test."""

    name: str
    spec: Dict[str, Any]
    spec_yaml: Optional[str] = None
    canvas_state: Optional[Dict[str, Any]] = None
    description: Optional[str] = None


class UpdateTestRequest(BaseModel):
    """Request to update a test."""

    name: Optional[str] = None
    spec: Optional[Dict[str, Any]] = None
    spec_yaml: Optional[str] = None
    canvas_state: Optional[Dict[str, Any]] = None
    description: Optional[str] = None


class TestResponse(BaseModel):
    """Test definition response."""

    id: int
    name: str
    description: Optional[str]
    spec: Optional[Dict[str, Any]]
    spec_yaml: Optional[str]
    canvas_state: Optional[Dict[str, Any]]
    provider: Optional[str]
    model: Optional[str]
    created_at: Optional[str]
    updated_at: Optional[str]
    version: int


class TestListResponse(BaseModel):
    """List of tests response."""

    tests: List[TestResponse]
    total: int


def get_db_session():
    """Dependency to get database session."""
    db = get_database()
    for session in db.get_session():
        yield session


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
