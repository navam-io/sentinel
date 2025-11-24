"""
Regression detection engine for identifying performance and quality regressions.
"""

from dataclasses import dataclass
from enum import Enum
from typing import Any


class RegressionSeverity(str, Enum):
    """Severity levels for detected regressions."""

    CRITICAL = "critical"  # > 50% degradation or test failure
    WARNING = "warning"  # 10-50% degradation
    INFO = "info"  # < 10% change (informational)
    IMPROVEMENT = "improvement"  # Better performance than baseline


@dataclass
class MetricDelta:
    """Delta between two metric values with percentage change."""

    metric_name: str
    baseline_value: float | int | None
    current_value: float | int | None
    delta: float | None  # absolute difference
    delta_percent: float | None  # percentage change
    unit: str  # e.g., "ms", "tokens", "USD"
    severity: RegressionSeverity
    description: str

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "metric_name": self.metric_name,
            "baseline_value": self.baseline_value,
            "current_value": self.current_value,
            "delta": self.delta,
            "delta_percent": self.delta_percent,
            "unit": self.unit,
            "severity": self.severity.value,
            "description": self.description,
        }


@dataclass
class RegressionResult:
    """Result of regression analysis between two runs."""

    has_regressions: bool
    severity: RegressionSeverity  # Worst severity found
    metric_deltas: list[MetricDelta]
    assertion_changes: dict[str, Any]  # Changes in assertion pass/fail status
    summary: str  # Human-readable summary

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "has_regressions": self.has_regressions,
            "severity": self.severity.value,
            "metric_deltas": [m.to_dict() for m in self.metric_deltas],
            "assertion_changes": self.assertion_changes,
            "summary": self.summary,
        }


class RegressionEngine:
    """
    Engine for detecting regressions between test runs.

    Analyzes performance metrics, cost, and assertion results
    to identify degradations and improvements.
    """

    def __init__(
        self,
        latency_threshold_percent: float = 20.0,
        cost_threshold_percent: float = 10.0,
        tokens_threshold_percent: float = 15.0,
    ):
        """
        Initialize regression engine with configurable thresholds.

        Args:
            latency_threshold_percent: Percentage increase that triggers warning
            cost_threshold_percent: Percentage increase that triggers warning
            tokens_threshold_percent: Percentage increase that triggers warning
        """
        self.latency_threshold = latency_threshold_percent
        self.cost_threshold = cost_threshold_percent
        self.tokens_threshold = tokens_threshold_percent

    def calculate_delta(
        self,
        metric_name: str,
        baseline: float | int | None,
        current: float | int | None,
        unit: str,
        threshold_percent: float,
        higher_is_worse: bool = True,
    ) -> MetricDelta:
        """
        Calculate delta between two metric values.

        Args:
            metric_name: Name of the metric
            baseline: Baseline value
            current: Current value
            unit: Unit string (e.g., "ms")
            threshold_percent: Threshold for warning severity
            higher_is_worse: If True, increase is regression; if False, decrease is regression

        Returns:
            MetricDelta with severity assessment
        """
        # Handle None values
        if baseline is None and current is None:
            return MetricDelta(
                metric_name=metric_name,
                baseline_value=None,
                current_value=None,
                delta=None,
                delta_percent=None,
                unit=unit,
                severity=RegressionSeverity.INFO,
                description=f"{metric_name}: No data available",
            )

        if baseline is None:
            return MetricDelta(
                metric_name=metric_name,
                baseline_value=None,
                current_value=current,
                delta=None,
                delta_percent=None,
                unit=unit,
                severity=RegressionSeverity.INFO,
                description=f"{metric_name}: New measurement ({current}{unit})",
            )

        if current is None:
            return MetricDelta(
                metric_name=metric_name,
                baseline_value=baseline,
                current_value=None,
                delta=None,
                delta_percent=None,
                unit=unit,
                severity=RegressionSeverity.INFO,
                description=f"{metric_name}: No current measurement (was {baseline}{unit})",
            )

        # Calculate absolute and percentage delta
        delta = current - baseline
        delta_percent = (
            (delta / baseline * 100) if baseline != 0 else (100.0 if delta != 0 else 0.0)
        )

        # Determine severity based on direction and magnitude
        abs_percent = abs(delta_percent)
        is_worse = (delta > 0 and higher_is_worse) or (delta < 0 and not higher_is_worse)

        if is_worse:
            if abs_percent > 50:
                severity = RegressionSeverity.CRITICAL
            elif abs_percent > threshold_percent:
                severity = RegressionSeverity.WARNING
            else:
                severity = RegressionSeverity.INFO
        else:
            if abs_percent > threshold_percent:
                severity = RegressionSeverity.IMPROVEMENT
            else:
                severity = RegressionSeverity.INFO

        # Build description
        direction = "increased" if delta > 0 else "decreased"
        sign = "+" if delta > 0 else ""
        description = f"{metric_name}: {direction} by {sign}{delta_percent:.1f}% ({baseline}{unit} → {current}{unit})"

        return MetricDelta(
            metric_name=metric_name,
            baseline_value=baseline,
            current_value=current,
            delta=delta,
            delta_percent=delta_percent,
            unit=unit,
            severity=severity,
            description=description,
        )

    def compare_assertions(
        self,
        baseline_results: list[dict[str, Any]],
        current_results: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """
        Compare assertion results between runs.

        Args:
            baseline_results: List of assertion results from baseline run
            current_results: List of assertion results from current run

        Returns:
            Dictionary with assertion comparison details
        """
        baseline_count = len(baseline_results)
        current_count = len(current_results)

        baseline_passed = sum(1 for r in baseline_results if r.get("passed", False))
        current_passed = sum(1 for r in current_results if r.get("passed", False))

        baseline_rate = (baseline_passed / baseline_count * 100) if baseline_count > 0 else 0
        current_rate = (current_passed / current_count * 100) if current_count > 0 else 0

        # Check for new failures
        new_failures = []
        fixed_failures = []

        baseline_by_type = {r.get("assertion_type"): r for r in baseline_results}
        current_by_type = {r.get("assertion_type"): r for r in current_results}

        for atype, result in current_by_type.items():
            if not result.get("passed", False):
                baseline_result = baseline_by_type.get(atype)
                if baseline_result is None or baseline_result.get("passed", False):
                    new_failures.append(
                        {
                            "assertion_type": atype,
                            "message": result.get(
                                "failure_reason", result.get("message", "Unknown")
                            ),
                        }
                    )

        for atype, result in baseline_by_type.items():
            if not result.get("passed", False):
                current_result = current_by_type.get(atype)
                if current_result is not None and current_result.get("passed", False):
                    fixed_failures.append({"assertion_type": atype})

        return {
            "baseline_total": baseline_count,
            "current_total": current_count,
            "baseline_passed": baseline_passed,
            "current_passed": current_passed,
            "baseline_pass_rate": baseline_rate,
            "current_pass_rate": current_rate,
            "pass_rate_delta": current_rate - baseline_rate,
            "new_failures": new_failures,
            "fixed_failures": fixed_failures,
            "has_new_failures": len(new_failures) > 0,
            "has_fixes": len(fixed_failures) > 0,
        }

    def analyze(
        self,
        baseline_run: dict[str, Any],
        current_run: dict[str, Any],
        baseline_results: list[dict[str, Any]] | None = None,
        current_results: list[dict[str, Any]] | None = None,
    ) -> RegressionResult:
        """
        Perform full regression analysis between two runs.

        Args:
            baseline_run: Baseline test run data
            current_run: Current test run data
            baseline_results: Optional assertion results for baseline
            current_results: Optional assertion results for current

        Returns:
            RegressionResult with complete analysis
        """
        metric_deltas = []

        # Compare latency
        latency_delta = self.calculate_delta(
            metric_name="Latency",
            baseline=baseline_run.get("latency_ms"),
            current=current_run.get("latency_ms"),
            unit="ms",
            threshold_percent=self.latency_threshold,
            higher_is_worse=True,
        )
        metric_deltas.append(latency_delta)

        # Compare input tokens
        input_tokens_delta = self.calculate_delta(
            metric_name="Input Tokens",
            baseline=baseline_run.get("tokens_input"),
            current=current_run.get("tokens_input"),
            unit=" tokens",
            threshold_percent=self.tokens_threshold,
            higher_is_worse=True,
        )
        metric_deltas.append(input_tokens_delta)

        # Compare output tokens
        output_tokens_delta = self.calculate_delta(
            metric_name="Output Tokens",
            baseline=baseline_run.get("tokens_output"),
            current=current_run.get("tokens_output"),
            unit=" tokens",
            threshold_percent=self.tokens_threshold,
            higher_is_worse=True,
        )
        metric_deltas.append(output_tokens_delta)

        # Compare cost
        cost_delta = self.calculate_delta(
            metric_name="Cost",
            baseline=baseline_run.get("cost_usd"),
            current=current_run.get("cost_usd"),
            unit=" USD",
            threshold_percent=self.cost_threshold,
            higher_is_worse=True,
        )
        metric_deltas.append(cost_delta)

        # Compare assertions if provided
        assertion_changes: dict[str, Any] = {}
        if baseline_results is not None and current_results is not None:
            assertion_changes = self.compare_assertions(baseline_results, current_results)

        # Determine overall severity
        worst_severity = RegressionSeverity.INFO
        severity_order = [
            RegressionSeverity.INFO,
            RegressionSeverity.IMPROVEMENT,
            RegressionSeverity.WARNING,
            RegressionSeverity.CRITICAL,
        ]

        for delta in metric_deltas:
            if severity_order.index(delta.severity) > severity_order.index(worst_severity):
                worst_severity = delta.severity

        # Check for assertion failures (always critical)
        if assertion_changes.get("has_new_failures", False):
            worst_severity = RegressionSeverity.CRITICAL

        # Check execution status changes
        baseline_status = baseline_run.get("status", "completed")
        current_status = current_run.get("status", "completed")
        if baseline_status == "completed" and current_status == "failed":
            worst_severity = RegressionSeverity.CRITICAL

        has_regressions = worst_severity in [
            RegressionSeverity.WARNING,
            RegressionSeverity.CRITICAL,
        ]

        # Build summary
        summary_parts = []
        if worst_severity == RegressionSeverity.CRITICAL:
            summary_parts.append("Critical regression detected!")
        elif worst_severity == RegressionSeverity.WARNING:
            summary_parts.append("Performance regression detected.")
        elif worst_severity == RegressionSeverity.IMPROVEMENT:
            summary_parts.append("Performance improved!")
        else:
            summary_parts.append("No significant changes detected.")

        if assertion_changes.get("has_new_failures"):
            count = len(assertion_changes.get("new_failures", []))
            summary_parts.append(f"{count} new assertion failure(s).")
        if assertion_changes.get("has_fixes"):
            count = len(assertion_changes.get("fixed_failures", []))
            summary_parts.append(f"{count} assertion(s) now passing.")

        # Add key metric changes
        for delta in metric_deltas:
            if delta.severity in [RegressionSeverity.WARNING, RegressionSeverity.CRITICAL]:
                summary_parts.append(delta.description)

        return RegressionResult(
            has_regressions=has_regressions,
            severity=worst_severity,
            metric_deltas=metric_deltas,
            assertion_changes=assertion_changes,
            summary=" ".join(summary_parts),
        )
