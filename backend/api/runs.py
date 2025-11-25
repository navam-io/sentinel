"""
Test run management and comparison API endpoints.
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..regression import RegressionEngine, RunComparator
from ..storage import RunRepository, get_database

router = APIRouter()


class RunResponse(BaseModel):
    """Test run response."""

    id: int
    test_definition_id: int
    started_at: str | None
    completed_at: str | None
    status: str
    provider: str
    model: str
    latency_ms: int | None
    tokens_input: int | None
    tokens_output: int | None
    cost_usd: float | None
    error_message: str | None = None


class RunResultResponse(BaseModel):
    """Test result response."""

    id: int
    test_run_id: int
    assertion_type: str
    assertion_value: str | None
    passed: bool
    actual_value: str | None
    failure_reason: str | None
    output_text: str | None
    tool_calls: list[dict[str, Any]] | None
    raw_response: dict[str, Any] | None


class RunListResponse(BaseModel):
    """List of runs response."""

    runs: list[RunResponse]
    total: int


class MetricDeltaResponse(BaseModel):
    """Metric delta response."""

    metric_name: str
    baseline_value: float | int | None
    current_value: float | int | None
    delta: float | None
    delta_percent: float | None
    unit: str
    severity: str
    description: str


class RegressionAnalysisResponse(BaseModel):
    """Regression analysis response."""

    has_regressions: bool
    severity: str
    metric_deltas: list[MetricDeltaResponse]
    assertion_changes: dict[str, Any]
    summary: str


class AssertionComparisonResponse(BaseModel):
    """Assertion comparison response."""

    assertion_type: str
    baseline_passed: bool | None
    current_passed: bool | None
    baseline_message: str | None
    current_message: str | None
    status: str


class OutputComparisonResponse(BaseModel):
    """Output comparison response."""

    baseline_output: str | None
    current_output: str | None
    outputs_differ: bool
    baseline_length: int
    current_length: int
    length_delta: int


class RunMetricsResponse(BaseModel):
    """Run metrics response."""

    run_id: int
    test_id: int
    status: str
    provider: str
    model: str
    latency_ms: int | None
    tokens_input: int | None
    tokens_output: int | None
    cost_usd: float | None
    started_at: str | None
    completed_at: str | None
    error_message: str | None = None


class ComparisonResponse(BaseModel):
    """Complete comparison response."""

    baseline_run: RunMetricsResponse
    current_run: RunMetricsResponse
    regression_analysis: RegressionAnalysisResponse
    assertion_comparisons: list[AssertionComparisonResponse]
    output_comparison: OutputComparisonResponse | None
    model_changed: bool
    provider_changed: bool


def get_db_session():
    """Dependency to get database session."""
    db = get_database()
    yield from db.get_session()


@router.get("/list", response_model=RunListResponse)
async def list_runs(
    limit: int = 100,
    offset: int = 0,
    session: Session = Depends(get_db_session),
):
    """List all test runs.

    Args:
        limit: Maximum number of runs to return
        offset: Number of runs to skip
        session: Database session

    Returns:
        List of test runs
    """
    try:
        repo = RunRepository(session)
        runs = repo.get_all(limit=limit, offset=offset)
        return RunListResponse(
            runs=[RunResponse(**run.to_dict()) for run in runs],
            total=len(runs),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list runs: {str(e)}")


@router.get("/test/{test_id}", response_model=RunListResponse)
async def list_runs_for_test(
    test_id: int,
    limit: int = 50,
    offset: int = 0,
    session: Session = Depends(get_db_session),
):
    """List all runs for a specific test.

    Args:
        test_id: Test definition ID
        limit: Maximum number of runs to return
        offset: Number of runs to skip
        session: Database session

    Returns:
        List of test runs for the specified test
    """
    try:
        repo = RunRepository(session)
        runs = repo.get_by_test(test_definition_id=test_id, limit=limit, offset=offset)
        return RunListResponse(
            runs=[RunResponse(**run.to_dict()) for run in runs],
            total=len(runs),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list runs: {str(e)}")


@router.get("/{run_id}", response_model=RunResponse)
async def get_run(run_id: int, session: Session = Depends(get_db_session)):
    """Get a specific test run.

    Args:
        run_id: Run ID
        session: Database session

    Returns:
        Test run

    Raises:
        HTTPException: If run not found
    """
    try:
        repo = RunRepository(session)
        run = repo.get_by_id(run_id)
        if not run:
            raise HTTPException(status_code=404, detail=f"Run {run_id} not found")

        return RunResponse(**run.to_dict())

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get run: {str(e)}")


@router.get("/{run_id}/results", response_model=list[RunResultResponse])
async def get_run_results(run_id: int, session: Session = Depends(get_db_session)):
    """Get assertion results for a test run.

    Args:
        run_id: Run ID
        session: Database session

    Returns:
        List of assertion results
    """
    try:
        repo = RunRepository(session)
        run = repo.get_by_id(run_id)
        if not run:
            raise HTTPException(status_code=404, detail=f"Run {run_id} not found")

        results = repo.get_results_by_run(run_id)
        return [RunResultResponse(**result.to_dict()) for result in results]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get results: {str(e)}")


@router.get("/compare/{baseline_id}/{current_id}", response_model=ComparisonResponse)
async def compare_runs(
    baseline_id: int,
    current_id: int,
    session: Session = Depends(get_db_session),
):
    """Compare two test runs.

    Args:
        baseline_id: Baseline run ID
        current_id: Current run ID
        session: Database session

    Returns:
        Comparison result with regression analysis

    Raises:
        HTTPException: If either run not found
    """
    try:
        repo = RunRepository(session)

        # Get runs
        baseline_run = repo.get_by_id(baseline_id)
        if not baseline_run:
            raise HTTPException(status_code=404, detail=f"Baseline run {baseline_id} not found")

        current_run = repo.get_by_id(current_id)
        if not current_run:
            raise HTTPException(status_code=404, detail=f"Current run {current_id} not found")

        # Get results
        baseline_results = repo.get_results_by_run(baseline_id)
        current_results = repo.get_results_by_run(current_id)

        # Extract outputs from results (if available)
        baseline_output: str | None = None
        current_output: str | None = None
        if baseline_results:
            baseline_output = (
                str(baseline_results[0].output_text) if baseline_results[0].output_text else None
            )
        if current_results:
            current_output = (
                str(current_results[0].output_text) if current_results[0].output_text else None
            )

        # Perform comparison
        comparator = RunComparator()
        comparison = comparator.compare(
            baseline_run=baseline_run.to_dict(),
            current_run=current_run.to_dict(),
            baseline_results=[r.to_dict() for r in baseline_results],
            current_results=[r.to_dict() for r in current_results],
            baseline_output=baseline_output,
            current_output=current_output,
        )

        # Convert to response
        return ComparisonResponse(**comparison.to_dict())

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compare runs: {str(e)}")


@router.get("/regression/{baseline_id}/{current_id}", response_model=RegressionAnalysisResponse)
async def analyze_regression(
    baseline_id: int,
    current_id: int,
    latency_threshold: float = 20.0,
    cost_threshold: float = 10.0,
    tokens_threshold: float = 15.0,
    session: Session = Depends(get_db_session),
):
    """Perform regression analysis between two runs.

    Args:
        baseline_id: Baseline run ID
        current_id: Current run ID
        latency_threshold: Percentage threshold for latency warnings
        cost_threshold: Percentage threshold for cost warnings
        tokens_threshold: Percentage threshold for token warnings
        session: Database session

    Returns:
        Regression analysis result

    Raises:
        HTTPException: If either run not found
    """
    try:
        repo = RunRepository(session)

        # Get runs
        baseline_run = repo.get_by_id(baseline_id)
        if not baseline_run:
            raise HTTPException(status_code=404, detail=f"Baseline run {baseline_id} not found")

        current_run = repo.get_by_id(current_id)
        if not current_run:
            raise HTTPException(status_code=404, detail=f"Current run {current_id} not found")

        # Get results
        baseline_results = repo.get_results_by_run(baseline_id)
        current_results = repo.get_results_by_run(current_id)

        # Perform regression analysis
        engine = RegressionEngine(
            latency_threshold_percent=latency_threshold,
            cost_threshold_percent=cost_threshold,
            tokens_threshold_percent=tokens_threshold,
        )
        result = engine.analyze(
            baseline_run=baseline_run.to_dict(),
            current_run=current_run.to_dict(),
            baseline_results=[r.to_dict() for r in baseline_results],
            current_results=[r.to_dict() for r in current_results],
        )

        return RegressionAnalysisResponse(**result.to_dict())

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze regression: {str(e)}")
