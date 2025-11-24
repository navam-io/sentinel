"""
Run comparator for side-by-side comparison of test runs.
"""

from dataclasses import dataclass, field
from typing import Any

from .engine import RegressionEngine, RegressionResult


@dataclass
class RunMetrics:
    """Metrics extracted from a test run."""

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

    @classmethod
    def from_run_dict(cls, run: dict[str, Any]) -> "RunMetrics":
        """Create from run dictionary."""
        return cls(
            run_id=run.get("id", 0),
            test_id=run.get("test_definition_id", 0),
            status=run.get("status", "unknown"),
            provider=run.get("provider", "unknown"),
            model=run.get("model", "unknown"),
            latency_ms=run.get("latency_ms"),
            tokens_input=run.get("tokens_input"),
            tokens_output=run.get("tokens_output"),
            cost_usd=run.get("cost_usd"),
            started_at=run.get("started_at"),
            completed_at=run.get("completed_at"),
            error_message=run.get("error_message"),
        )

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "run_id": self.run_id,
            "test_id": self.test_id,
            "status": self.status,
            "provider": self.provider,
            "model": self.model,
            "latency_ms": self.latency_ms,
            "tokens_input": self.tokens_input,
            "tokens_output": self.tokens_output,
            "cost_usd": self.cost_usd,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
            "error_message": self.error_message,
        }


@dataclass
class AssertionComparison:
    """Side-by-side comparison of assertion results."""

    assertion_type: str
    baseline_passed: bool | None
    current_passed: bool | None
    baseline_message: str | None
    current_message: str | None
    status: str  # 'unchanged', 'improved', 'regressed', 'new', 'removed'

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "assertion_type": self.assertion_type,
            "baseline_passed": self.baseline_passed,
            "current_passed": self.current_passed,
            "baseline_message": self.baseline_message,
            "current_message": self.current_message,
            "status": self.status,
        }


@dataclass
class OutputComparison:
    """Comparison of output text between runs."""

    baseline_output: str | None
    current_output: str | None
    outputs_differ: bool
    baseline_length: int
    current_length: int
    length_delta: int

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "baseline_output": self.baseline_output,
            "current_output": self.current_output,
            "outputs_differ": self.outputs_differ,
            "baseline_length": self.baseline_length,
            "current_length": self.current_length,
            "length_delta": self.length_delta,
        }


@dataclass
class ComparisonResult:
    """Complete comparison result between two runs."""

    baseline_run: RunMetrics
    current_run: RunMetrics
    regression_analysis: RegressionResult
    assertion_comparisons: list[AssertionComparison] = field(default_factory=list)
    output_comparison: OutputComparison | None = None
    model_changed: bool = False
    provider_changed: bool = False

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "baseline_run": self.baseline_run.to_dict(),
            "current_run": self.current_run.to_dict(),
            "regression_analysis": self.regression_analysis.to_dict(),
            "assertion_comparisons": [a.to_dict() for a in self.assertion_comparisons],
            "output_comparison": (
                self.output_comparison.to_dict() if self.output_comparison else None
            ),
            "model_changed": self.model_changed,
            "provider_changed": self.provider_changed,
        }


class RunComparator:
    """
    Comparator for detailed side-by-side comparison of test runs.
    """

    def __init__(self, regression_engine: RegressionEngine | None = None):
        """
        Initialize comparator.

        Args:
            regression_engine: Optional custom regression engine
        """
        self.engine = regression_engine or RegressionEngine()

    def compare_assertions(
        self,
        baseline_results: list[dict[str, Any]],
        current_results: list[dict[str, Any]],
    ) -> list[AssertionComparison]:
        """
        Create side-by-side assertion comparisons.

        Args:
            baseline_results: Assertion results from baseline run
            current_results: Assertion results from current run

        Returns:
            List of assertion comparisons
        """
        comparisons = []

        # Index by assertion type
        baseline_by_type = {r.get("assertion_type"): r for r in baseline_results}
        current_by_type = {r.get("assertion_type"): r for r in current_results}

        # All unique assertion types
        all_types = set(baseline_by_type.keys()) | set(current_by_type.keys())

        for atype in sorted(t for t in all_types if t is not None):
            baseline = baseline_by_type.get(atype)
            current = current_by_type.get(atype)

            baseline_passed = baseline.get("passed") if baseline else None
            current_passed = current.get("passed") if current else None

            baseline_msg = (
                baseline.get("failure_reason") or baseline.get("message") if baseline else None
            )
            current_msg = (
                current.get("failure_reason") or current.get("message") if current else None
            )

            # Determine status
            if baseline is None:
                status = "new"
            elif current is None:
                status = "removed"
            elif baseline_passed == current_passed:
                status = "unchanged"
            elif current_passed and not baseline_passed:
                status = "improved"
            else:
                status = "regressed"

            comparisons.append(
                AssertionComparison(
                    assertion_type=atype or "unknown",
                    baseline_passed=baseline_passed,
                    current_passed=current_passed,
                    baseline_message=baseline_msg,
                    current_message=current_msg,
                    status=status,
                )
            )

        return comparisons

    def compare_outputs(
        self,
        baseline_output: str | None,
        current_output: str | None,
    ) -> OutputComparison:
        """
        Compare output text between runs.

        Args:
            baseline_output: Output from baseline run
            current_output: Output from current run

        Returns:
            Output comparison result
        """
        baseline_len = len(baseline_output) if baseline_output else 0
        current_len = len(current_output) if current_output else 0

        outputs_differ = baseline_output != current_output

        return OutputComparison(
            baseline_output=baseline_output,
            current_output=current_output,
            outputs_differ=outputs_differ,
            baseline_length=baseline_len,
            current_length=current_len,
            length_delta=current_len - baseline_len,
        )

    def compare(
        self,
        baseline_run: dict[str, Any],
        current_run: dict[str, Any],
        baseline_results: list[dict[str, Any]] | None = None,
        current_results: list[dict[str, Any]] | None = None,
        baseline_output: str | None = None,
        current_output: str | None = None,
    ) -> ComparisonResult:
        """
        Perform full comparison between two runs.

        Args:
            baseline_run: Baseline test run data
            current_run: Current test run data
            baseline_results: Optional assertion results for baseline
            current_results: Optional assertion results for current
            baseline_output: Optional output text from baseline
            current_output: Optional output text from current

        Returns:
            Complete comparison result
        """
        # Extract metrics
        baseline_metrics = RunMetrics.from_run_dict(baseline_run)
        current_metrics = RunMetrics.from_run_dict(current_run)

        # Run regression analysis
        regression = self.engine.analyze(
            baseline_run=baseline_run,
            current_run=current_run,
            baseline_results=baseline_results,
            current_results=current_results,
        )

        # Compare assertions
        assertion_comparisons = []
        if baseline_results is not None and current_results is not None:
            assertion_comparisons = self.compare_assertions(baseline_results, current_results)

        # Compare outputs
        output_comparison = None
        if baseline_output is not None or current_output is not None:
            output_comparison = self.compare_outputs(baseline_output, current_output)

        # Check for model/provider changes
        model_changed = baseline_metrics.model != current_metrics.model
        provider_changed = baseline_metrics.provider != current_metrics.provider

        return ComparisonResult(
            baseline_run=baseline_metrics,
            current_run=current_metrics,
            regression_analysis=regression,
            assertion_comparisons=assertion_comparisons,
            output_comparison=output_comparison,
            model_changed=model_changed,
            provider_changed=provider_changed,
        )
