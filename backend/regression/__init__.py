"""
Regression detection engine for comparing test runs.
"""

from .comparator import ComparisonResult, RunComparator
from .engine import MetricDelta, RegressionEngine, RegressionResult, RegressionSeverity

__all__ = [
    "RegressionEngine",
    "RegressionResult",
    "MetricDelta",
    "RegressionSeverity",
    "RunComparator",
    "ComparisonResult",
]
