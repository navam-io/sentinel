"""
Test file management API endpoints.

Provides REST API for managing test files stored as YAML in artifacts/tests/.
"""

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..services import TestFileService

router = APIRouter()

# Initialize file service
file_service = TestFileService()


class SaveTestFileRequest(BaseModel):
    """Request to save a test file."""

    yaml_content: str
    filename: str | None = None  # Optional - will be generated if not provided
    name: str | None = None  # Used for filename generation if filename not provided


class TestFileResponse(BaseModel):
    """Test file response."""

    filename: str
    name: str
    description: str | None
    category: str | None
    provider: str | None
    model: str | None
    created_at: str | None = None
    updated_at: str | None = None


class TestFileListResponse(BaseModel):
    """List of test files response."""

    tests: list[TestFileResponse]
    total: int
    path: str


class RenameTestFileRequest(BaseModel):
    """Request to rename a test file."""

    new_name: str


@router.post("", response_model=TestFileResponse)
async def save_test_file(request: SaveTestFileRequest):
    """Save test YAML to file.

    Creates or updates a test YAML file in artifacts/tests/.

    Args:
        request: Save test file request

    Returns:
        Saved test file metadata

    Raises:
        HTTPException: If save fails
    """
    try:
        filename, metadata = file_service.save_test(
            yaml_content=request.yaml_content,
            filename=request.filename,
            name=request.name,
        )

        return TestFileResponse(
            filename=filename,
            name=metadata["name"],
            description=metadata.get("description"),
            category=metadata.get("category"),
            provider=metadata.get("provider"),
            model=metadata.get("model"),
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save test file: {str(e)}")


@router.get("", response_model=TestFileListResponse)
async def list_test_files():
    """List all test files.

    Returns all YAML test files in artifacts/tests/ with metadata.

    Returns:
        List of test file metadata
    """
    try:
        tests = file_service.list_tests()

        return TestFileListResponse(
            tests=[
                TestFileResponse(
                    filename=t["filename"],
                    name=t["name"],
                    description=t.get("description"),
                    category=t.get("category"),
                    provider=t.get("provider"),
                    model=t.get("model"),
                    created_at=t.get("created_at"),
                    updated_at=t.get("updated_at"),
                )
                for t in tests
            ],
            total=len(tests),
            path=file_service.get_tests_path(),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list test files: {str(e)}")


@router.get("/{filename}")
async def get_test_file(filename: str) -> dict[str, Any]:
    """Load test YAML from file.

    Args:
        filename: Filename (with or without .yaml extension)

    Returns:
        Dict with yaml_content and metadata

    Raises:
        HTTPException: If file not found or invalid
    """
    try:
        yaml_content, metadata = file_service.load_test(filename)

        return {
            "filename": filename.replace(".yaml", "").replace(".yml", ""),
            "yaml_content": yaml_content,
            "name": metadata["name"],
            "description": metadata.get("description"),
            "category": metadata.get("category"),
            "provider": metadata.get("provider"),
            "model": metadata.get("model"),
        }

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Test file not found: {filename}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load test file: {str(e)}")


@router.put("/{filename}", response_model=TestFileResponse)
async def update_test_file(filename: str, request: SaveTestFileRequest):
    """Update an existing test file.

    Args:
        filename: Filename to update (with or without .yaml extension)
        request: Updated content

    Returns:
        Updated test file metadata

    Raises:
        HTTPException: If file not found or update fails
    """
    try:
        # Check if file exists
        if not file_service.test_exists(filename):
            raise HTTPException(status_code=404, detail=f"Test file not found: {filename}")

        # Save with same filename
        normalized_filename = filename.replace(".yaml", "").replace(".yml", "")
        saved_filename, metadata = file_service.save_test(
            yaml_content=request.yaml_content,
            filename=normalized_filename,
        )

        return TestFileResponse(
            filename=saved_filename,
            name=metadata["name"],
            description=metadata.get("description"),
            category=metadata.get("category"),
            provider=metadata.get("provider"),
            model=metadata.get("model"),
        )

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update test file: {str(e)}")


@router.delete("/{filename}")
async def delete_test_file(filename: str):
    """Delete a test file.

    Args:
        filename: Filename to delete (with or without .yaml extension)

    Returns:
        Success message

    Raises:
        HTTPException: If file not found or deletion fails
    """
    try:
        deleted = file_service.delete_test(filename)

        if not deleted:
            raise HTTPException(status_code=404, detail=f"Test file not found: {filename}")

        return {"message": f"Test file {filename} deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete test file: {str(e)}")


@router.post("/{filename}/rename", response_model=TestFileResponse)
async def rename_test_file(filename: str, request: RenameTestFileRequest):
    """Rename a test file.

    Renames both the file and updates the name field in the YAML content.

    Args:
        filename: Current filename (with or without .yaml extension)
        request: New name request

    Returns:
        Updated test file metadata with new filename

    Raises:
        HTTPException: If file not found or rename fails
    """
    try:
        if not file_service.test_exists(filename):
            raise HTTPException(status_code=404, detail=f"Test file not found: {filename}")

        new_filename, metadata = file_service.rename_test(filename, request.new_name)

        return TestFileResponse(
            filename=new_filename,
            name=metadata["name"],
            description=metadata.get("description"),
            category=metadata.get("category"),
            provider=metadata.get("provider"),
            model=metadata.get("model"),
        )

    except HTTPException:
        raise
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Test file not found: {filename}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to rename test file: {str(e)}")


@router.get("/{filename}/exists")
async def check_test_file_exists(filename: str):
    """Check if a test file exists.

    Args:
        filename: Filename to check (with or without .yaml extension)

    Returns:
        Dict with exists boolean
    """
    return {"exists": file_service.test_exists(filename)}
