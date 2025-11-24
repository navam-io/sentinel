"""
Tests for regression detection engine and comparator.
"""

import sys
from pathlib import Path

# Add backend to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.regression.comparator import RunComparator, RunMetrics
from backend.regression.engine import MetricDelta, RegressionEngine, RegressionSeverity


class TestMetricDelta:
    """Tests for MetricDelta calculation."""

    def test_calculate_latency_increase(self):
        """Test latency regression detection."""
        engine = RegressionEngine()
        delta = engine.calculate_delta(
            metric_name="Latency",
            baseline=100,
            current=160,  # 60% increase - above critical threshold
            unit="ms",
            threshold_percent=20.0,
            higher_is_worse=True,
        )

        assert delta.metric_name == "Latency"
        assert delta.baseline_value == 100
        assert delta.current_value == 160
        assert delta.delta == 60
        assert delta.delta_percent == 60.0
        assert delta.severity == RegressionSeverity.CRITICAL  # > 50% increase

    def test_calculate_latency_decrease(self):
        """Test latency improvement detection."""
        engine = RegressionEngine()
        delta = engine.calculate_delta(
            metric_name="Latency",
            baseline=100,
            current=70,
            unit="ms",
            threshold_percent=20.0,
            higher_is_worse=True,
        )

        assert delta.delta == -30
        assert delta.delta_percent == -30.0
        assert delta.severity == RegressionSeverity.IMPROVEMENT

    def test_calculate_small_change(self):
        """Test small change is marked as info."""
        engine = RegressionEngine()
        delta = engine.calculate_delta(
            metric_name="Latency",
            baseline=100,
            current=105,
            unit="ms",
            threshold_percent=20.0,
            higher_is_worse=True,
        )

        assert delta.delta == 5
        assert delta.delta_percent == 5.0
        assert delta.severity == RegressionSeverity.INFO

    def test_calculate_warning_threshold(self):
        """Test warning threshold detection."""
        engine = RegressionEngine()
        delta = engine.calculate_delta(
            metric_name="Latency",
            baseline=100,
            current=130,
            unit="ms",
            threshold_percent=20.0,
            higher_is_worse=True,
        )

        assert delta.delta_percent == 30.0
        assert delta.severity == RegressionSeverity.WARNING

    def test_calculate_with_none_baseline(self):
        """Test handling of None baseline value."""
        engine = RegressionEngine()
        delta = engine.calculate_delta(
            metric_name="Latency",
            baseline=None,
            current=100,
            unit="ms",
            threshold_percent=20.0,
            higher_is_worse=True,
        )

        assert delta.baseline_value is None
        assert delta.current_value == 100
        assert delta.delta is None
        assert delta.severity == RegressionSeverity.INFO

    def test_calculate_with_none_current(self):
        """Test handling of None current value."""
        engine = RegressionEngine()
        delta = engine.calculate_delta(
            metric_name="Latency",
            baseline=100,
            current=None,
            unit="ms",
            threshold_percent=20.0,
            higher_is_worse=True,
        )

        assert delta.baseline_value == 100
        assert delta.current_value is None
        assert delta.delta is None
        assert delta.severity == RegressionSeverity.INFO

    def test_calculate_with_both_none(self):
        """Test handling of both values being None."""
        engine = RegressionEngine()
        delta = engine.calculate_delta(
            metric_name="Latency",
            baseline=None,
            current=None,
            unit="ms",
            threshold_percent=20.0,
            higher_is_worse=True,
        )

        assert delta.baseline_value is None
        assert delta.current_value is None
        assert delta.severity == RegressionSeverity.INFO

    def test_calculate_with_zero_baseline(self):
        """Test handling of zero baseline value."""
        engine = RegressionEngine()
        delta = engine.calculate_delta(
            metric_name="Cost",
            baseline=0,
            current=100,
            unit=" USD",
            threshold_percent=10.0,
            higher_is_worse=True,
        )

        assert delta.delta == 100
        assert delta.delta_percent == 100.0  # 100% when baseline is 0

    def test_metric_delta_to_dict(self):
        """Test MetricDelta serialization."""
        delta = MetricDelta(
            metric_name="Test",
            baseline_value=100,
            current_value=150,
            delta=50,
            delta_percent=50.0,
            unit="ms",
            severity=RegressionSeverity.CRITICAL,
            description="Test: increased by +50.0%",
        )

        result = delta.to_dict()
        assert result["metric_name"] == "Test"
        assert result["severity"] == "critical"
        assert result["delta_percent"] == 50.0


class TestRegressionEngine:
    """Tests for RegressionEngine analysis."""

    def test_analyze_basic_regression(self):
        """Test basic regression analysis with performance degradation."""
        engine = RegressionEngine()

        baseline_run = {
            "latency_ms": 100,
            "tokens_input": 500,
            "tokens_output": 200,
            "cost_usd": 0.01,
            "status": "completed",
        }

        current_run = {
            "latency_ms": 200,  # 100% increase - critical
            "tokens_input": 600,  # 20% increase - warning
            "tokens_output": 200,  # No change
            "cost_usd": 0.015,  # 50% increase - critical
            "status": "completed",
        }

        result = engine.analyze(baseline_run, current_run)

        assert result.has_regressions is True
        assert result.severity == RegressionSeverity.CRITICAL
        assert len(result.metric_deltas) == 4

    def test_analyze_improvement(self):
        """Test analysis with performance improvement."""
        engine = RegressionEngine()

        baseline_run = {
            "latency_ms": 200,
            "tokens_input": 500,
            "tokens_output": 200,
            "cost_usd": 0.02,
            "status": "completed",
        }

        current_run = {
            "latency_ms": 100,  # 50% decrease - improvement
            "tokens_input": 400,  # 20% decrease - improvement
            "tokens_output": 150,  # 25% decrease - improvement
            "cost_usd": 0.01,  # 50% decrease - improvement
            "status": "completed",
        }

        result = engine.analyze(baseline_run, current_run)

        assert result.has_regressions is False
        assert result.severity == RegressionSeverity.IMPROVEMENT

    def test_analyze_no_change(self):
        """Test analysis with no significant change."""
        engine = RegressionEngine()

        baseline_run = {
            "latency_ms": 100,
            "tokens_input": 500,
            "tokens_output": 200,
            "cost_usd": 0.01,
            "status": "completed",
        }

        current_run = {
            "latency_ms": 105,  # 5% change - info
            "tokens_input": 510,  # 2% change - info
            "tokens_output": 205,  # 2.5% change - info
            "cost_usd": 0.0105,  # 5% change - info
            "status": "completed",
        }

        result = engine.analyze(baseline_run, current_run)

        assert result.has_regressions is False
        assert result.severity == RegressionSeverity.INFO

    def test_analyze_with_assertions(self):
        """Test analysis with assertion results."""
        engine = RegressionEngine()

        baseline_run = {"latency_ms": 100, "status": "completed"}
        current_run = {"latency_ms": 105, "status": "completed"}

        baseline_results = [
            {"assertion_type": "must_contain", "passed": True},
            {"assertion_type": "max_latency", "passed": True},
        ]

        current_results = [
            {
                "assertion_type": "must_contain",
                "passed": False,
                "failure_reason": "Missing expected text",
            },
            {"assertion_type": "max_latency", "passed": True},
        ]

        result = engine.analyze(baseline_run, current_run, baseline_results, current_results)

        assert result.has_regressions is True
        assert result.severity == RegressionSeverity.CRITICAL  # New assertion failure
        assert result.assertion_changes["has_new_failures"] is True
        assert len(result.assertion_changes["new_failures"]) == 1

    def test_analyze_assertion_fix(self):
        """Test detection of fixed assertion."""
        engine = RegressionEngine()

        baseline_run = {"latency_ms": 100, "status": "completed"}
        current_run = {"latency_ms": 100, "status": "completed"}

        baseline_results = [
            {"assertion_type": "must_contain", "passed": False, "failure_reason": "Missing"},
        ]

        current_results = [
            {"assertion_type": "must_contain", "passed": True},
        ]

        result = engine.analyze(baseline_run, current_run, baseline_results, current_results)

        assert result.assertion_changes["has_fixes"] is True
        assert len(result.assertion_changes["fixed_failures"]) == 1

    def test_analyze_status_change_to_failed(self):
        """Test detection of status change from completed to failed."""
        engine = RegressionEngine()

        baseline_run = {"latency_ms": 100, "status": "completed"}
        current_run = {"latency_ms": 100, "status": "failed", "error_message": "API error"}

        result = engine.analyze(baseline_run, current_run)

        assert result.has_regressions is True
        assert result.severity == RegressionSeverity.CRITICAL

    def test_analyze_custom_thresholds(self):
        """Test analysis with custom thresholds."""
        engine = RegressionEngine(
            latency_threshold_percent=50.0,
            cost_threshold_percent=30.0,
            tokens_threshold_percent=25.0,
        )

        baseline_run = {"latency_ms": 100, "cost_usd": 0.01}
        current_run = {"latency_ms": 140, "cost_usd": 0.012}  # 40% latency, 20% cost

        result = engine.analyze(baseline_run, current_run)

        # With 50% threshold, 40% latency increase is info, not warning
        latency_delta = next(d for d in result.metric_deltas if d.metric_name == "Latency")
        assert latency_delta.severity == RegressionSeverity.INFO

    def test_regression_result_to_dict(self):
        """Test RegressionResult serialization."""
        engine = RegressionEngine()

        baseline_run = {"latency_ms": 100, "status": "completed"}
        current_run = {"latency_ms": 200, "status": "completed"}

        result = engine.analyze(baseline_run, current_run)
        result_dict = result.to_dict()

        assert "has_regressions" in result_dict
        assert "severity" in result_dict
        assert "metric_deltas" in result_dict
        assert "summary" in result_dict
        assert isinstance(result_dict["severity"], str)


class TestRunComparator:
    """Tests for RunComparator."""

    def test_compare_basic(self):
        """Test basic run comparison."""
        comparator = RunComparator()

        baseline_run = {
            "id": 1,
            "test_definition_id": 100,
            "status": "completed",
            "provider": "openai",
            "model": "gpt-5.1",
            "latency_ms": 100,
            "tokens_input": 500,
            "tokens_output": 200,
            "cost_usd": 0.01,
            "started_at": "2025-01-01T10:00:00",
            "completed_at": "2025-01-01T10:00:01",
        }

        current_run = {
            "id": 2,
            "test_definition_id": 100,
            "status": "completed",
            "provider": "openai",
            "model": "gpt-5.1",
            "latency_ms": 150,
            "tokens_input": 550,
            "tokens_output": 220,
            "cost_usd": 0.012,
            "started_at": "2025-01-02T10:00:00",
            "completed_at": "2025-01-02T10:00:01",
        }

        result = comparator.compare(baseline_run, current_run)

        assert result.baseline_run.run_id == 1
        assert result.current_run.run_id == 2
        assert result.model_changed is False
        assert result.provider_changed is False

    def test_compare_model_change(self):
        """Test detection of model change."""
        comparator = RunComparator()

        baseline_run = {
            "id": 1,
            "test_definition_id": 100,
            "status": "completed",
            "provider": "openai",
            "model": "gpt-5.1",
            "latency_ms": 100,
        }

        current_run = {
            "id": 2,
            "test_definition_id": 100,
            "status": "completed",
            "provider": "openai",
            "model": "gpt-5-mini",
            "latency_ms": 80,
        }

        result = comparator.compare(baseline_run, current_run)

        assert result.model_changed is True
        assert result.provider_changed is False

    def test_compare_provider_change(self):
        """Test detection of provider change."""
        comparator = RunComparator()

        baseline_run = {
            "id": 1,
            "test_definition_id": 100,
            "status": "completed",
            "provider": "openai",
            "model": "gpt-5.1",
            "latency_ms": 100,
        }

        current_run = {
            "id": 2,
            "test_definition_id": 100,
            "status": "completed",
            "provider": "anthropic",
            "model": "claude-4-sonnet",
            "latency_ms": 120,
        }

        result = comparator.compare(baseline_run, current_run)

        assert result.model_changed is True
        assert result.provider_changed is True

    def test_compare_assertions(self):
        """Test assertion comparison."""
        comparator = RunComparator()

        baseline_results = [
            {"assertion_type": "must_contain", "passed": True, "message": "OK"},
            {"assertion_type": "max_latency", "passed": False, "failure_reason": "Too slow"},
        ]

        current_results = [
            {"assertion_type": "must_contain", "passed": True, "message": "OK"},
            {"assertion_type": "max_latency", "passed": True, "message": "OK"},
            {"assertion_type": "output_type", "passed": False, "failure_reason": "Wrong type"},
        ]

        comparisons = comparator.compare_assertions(baseline_results, current_results)

        # Find each comparison
        must_contain = next(c for c in comparisons if c.assertion_type == "must_contain")
        max_latency = next(c for c in comparisons if c.assertion_type == "max_latency")
        output_type = next(c for c in comparisons if c.assertion_type == "output_type")

        assert must_contain.status == "unchanged"
        assert max_latency.status == "improved"
        assert output_type.status == "new"

    def test_compare_outputs(self):
        """Test output comparison."""
        comparator = RunComparator()

        result = comparator.compare_outputs(
            baseline_output="Hello, world!",
            current_output="Hello, world! How are you?",
        )

        assert result.outputs_differ is True
        assert result.baseline_length == 13
        assert result.current_length == 26
        assert result.length_delta == 13

    def test_compare_outputs_identical(self):
        """Test comparison of identical outputs."""
        comparator = RunComparator()

        result = comparator.compare_outputs(
            baseline_output="Hello, world!",
            current_output="Hello, world!",
        )

        assert result.outputs_differ is False
        assert result.length_delta == 0

    def test_comparison_result_to_dict(self):
        """Test ComparisonResult serialization."""
        comparator = RunComparator()

        baseline_run = {
            "id": 1,
            "test_definition_id": 100,
            "status": "completed",
            "provider": "openai",
            "model": "gpt-5.1",
            "latency_ms": 100,
        }

        current_run = {
            "id": 2,
            "test_definition_id": 100,
            "status": "completed",
            "provider": "openai",
            "model": "gpt-5.1",
            "latency_ms": 150,
        }

        result = comparator.compare(baseline_run, current_run)
        result_dict = result.to_dict()

        assert "baseline_run" in result_dict
        assert "current_run" in result_dict
        assert "regression_analysis" in result_dict
        assert "model_changed" in result_dict
        assert result_dict["baseline_run"]["run_id"] == 1


class TestRunMetrics:
    """Tests for RunMetrics."""

    def test_from_run_dict(self):
        """Test creating RunMetrics from dictionary."""
        run_dict = {
            "id": 1,
            "test_definition_id": 100,
            "status": "completed",
            "provider": "openai",
            "model": "gpt-5.1",
            "latency_ms": 150,
            "tokens_input": 500,
            "tokens_output": 200,
            "cost_usd": 0.01,
            "started_at": "2025-01-01T10:00:00",
            "completed_at": "2025-01-01T10:00:01",
        }

        metrics = RunMetrics.from_run_dict(run_dict)

        assert metrics.run_id == 1
        assert metrics.test_id == 100
        assert metrics.status == "completed"
        assert metrics.model == "gpt-5.1"
        assert metrics.latency_ms == 150

    def test_from_run_dict_missing_fields(self):
        """Test creating RunMetrics with missing optional fields."""
        run_dict = {
            "id": 1,
            "test_definition_id": 100,
            "status": "completed",
            "provider": "openai",
            "model": "gpt-5.1",
        }

        metrics = RunMetrics.from_run_dict(run_dict)

        assert metrics.run_id == 1
        assert metrics.latency_ms is None
        assert metrics.cost_usd is None

    def test_to_dict(self):
        """Test RunMetrics serialization."""
        metrics = RunMetrics(
            run_id=1,
            test_id=100,
            status="completed",
            provider="openai",
            model="gpt-5.1",
            latency_ms=150,
            tokens_input=500,
            tokens_output=200,
            cost_usd=0.01,
            started_at="2025-01-01T10:00:00",
            completed_at="2025-01-01T10:00:01",
        )

        result = metrics.to_dict()

        assert result["run_id"] == 1
        assert result["model"] == "gpt-5.1"
        assert result["latency_ms"] == 150
