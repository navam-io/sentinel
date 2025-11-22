"""
Tests for assertion validation.
"""

import pytest
from backend.validators.assertion_validator import (
    AssertionValidator,
    ValidationResult,
    validate_assertions,
)
from backend.providers.base import ExecutionResult


class TestValidationResult:
    """Tests for ValidationResult model."""

    def test_validation_result_creation(self):
        """Test creating a ValidationResult."""
        result = ValidationResult(
            assertion_type="must_contain",
            passed=True,
            message="Test passed",
        )
        assert result.assertion_type == "must_contain"
        assert result.passed is True
        assert result.message == "Test passed"

    def test_validation_result_with_details(self):
        """Test ValidationResult with all fields."""
        result = ValidationResult(
            assertion_type="max_latency_ms",
            passed=False,
            message="Too slow",
            expected=1000,
            actual=1500,
            details={"difference_ms": 500},
        )
        assert result.expected == 1000
        assert result.actual == 1500
        assert result.details == {"difference_ms": 500}


class TestMustContainValidator:
    """Tests for must_contain assertion."""

    def test_must_contain_passes(self):
        """Test must_contain when text is present."""
        result = ExecutionResult(
            success=True,
            output="The price is $500",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=100,
        )

        validator = AssertionValidator()
        validation = validator._validate_must_contain("price", result)

        assert validation.passed is True
        assert "contains" in validation.message.lower()
        assert validation.expected == "price"

    def test_must_contain_case_insensitive(self):
        """Test must_contain is case insensitive."""
        result = ExecutionResult(
            success=True,
            output="The PRICE is $500",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=100,
        )

        validator = AssertionValidator()
        validation = validator._validate_must_contain("price", result)

        assert validation.passed is True

    def test_must_contain_fails(self):
        """Test must_contain when text is absent."""
        result = ExecutionResult(
            success=True,
            output="The cost is $500",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=100,
        )

        validator = AssertionValidator()
        validation = validator._validate_must_contain("price", result)

        assert validation.passed is False
        assert "does not contain" in validation.message.lower()


class TestMustNotContainValidator:
    """Tests for must_not_contain assertion."""

    def test_must_not_contain_passes(self):
        """Test must_not_contain when text is absent."""
        result = ExecutionResult(
            success=True,
            output="The product is available",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=100,
        )

        validator = AssertionValidator()
        validation = validator._validate_must_not_contain("error", result)

        assert validation.passed is True
        assert "does not contain" in validation.message.lower()

    def test_must_not_contain_fails(self):
        """Test must_not_contain when text is present."""
        result = ExecutionResult(
            success=True,
            output="Error: Product not found",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=100,
        )

        validator = AssertionValidator()
        validation = validator._validate_must_not_contain("error", result)

        assert validation.passed is False
        assert "contains" in validation.message.lower()


class TestRegexMatchValidator:
    """Tests for regex_match assertion."""

    def test_regex_match_passes(self):
        """Test regex_match with valid pattern."""
        result = ExecutionResult(
            success=True,
            output="The price is $123.45",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=100,
        )

        validator = AssertionValidator()
        validation = validator._validate_regex_match(r"\$\d+\.\d{2}", result)

        assert validation.passed is True
        assert "matches pattern" in validation.message.lower()
        assert validation.details["matched_text"] == "$123.45"

    def test_regex_match_fails(self):
        """Test regex_match when pattern doesn't match."""
        result = ExecutionResult(
            success=True,
            output="The price is unavailable",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=100,
        )

        validator = AssertionValidator()
        validation = validator._validate_regex_match(r"\$\d+\.\d{2}", result)

        assert validation.passed is False
        assert "does not match" in validation.message.lower()

    def test_regex_match_invalid_pattern(self):
        """Test regex_match with invalid regex."""
        result = ExecutionResult(
            success=True,
            output="Some text",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=100,
        )

        validator = AssertionValidator()
        validation = validator._validate_regex_match(r"[invalid(", result)

        assert validation.passed is False
        assert "invalid regex" in validation.message.lower()

    def test_regex_match_multiline(self):
        """Test regex_match with multiline pattern."""
        result = ExecutionResult(
            success=True,
            output="Line 1\nLine 2\nLine 3",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=100,
        )

        validator = AssertionValidator()
        validation = validator._validate_regex_match(r"Line \d+", result)

        assert validation.passed is True


class TestMustCallToolValidator:
    """Tests for must_call_tool assertion."""

    def test_must_call_tool_single_passes(self):
        """Test must_call_tool with single tool (string)."""
        result = ExecutionResult(
            success=True,
            output="Search complete",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=100,
            tool_calls=[
                {"id": "1", "name": "browser", "input": {"query": "laptops"}},
            ],
        )

        validator = AssertionValidator()
        validation = validator._validate_must_call_tool("browser", result)

        assert validation.passed is True
        assert "all expected tools called" in validation.message.lower()
        assert validation.actual == ["browser"]

    def test_must_call_tool_multiple_passes(self):
        """Test must_call_tool with multiple tools (list)."""
        result = ExecutionResult(
            success=True,
            output="Calculation and search complete",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=100,
            tool_calls=[
                {"id": "1", "name": "calculator", "input": {"expr": "2+2"}},
                {"id": "2", "name": "browser", "input": {"query": "laptops"}},
            ],
        )

        validator = AssertionValidator()
        validation = validator._validate_must_call_tool(["browser", "calculator"], result)

        assert validation.passed is True
        assert validation.details["tool_call_count"] == 2

    def test_must_call_tool_fails_missing_tool(self):
        """Test must_call_tool when required tool not called."""
        result = ExecutionResult(
            success=True,
            output="Search complete",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=100,
            tool_calls=[
                {"id": "1", "name": "browser", "input": {"query": "laptops"}},
            ],
        )

        validator = AssertionValidator()
        validation = validator._validate_must_call_tool(["browser", "calculator"], result)

        assert validation.passed is False
        assert "missing tool calls" in validation.message.lower()
        assert "calculator" in validation.details["missing_tools"]

    def test_must_call_tool_no_calls(self):
        """Test must_call_tool when no tools called."""
        result = ExecutionResult(
            success=True,
            output="No tools needed",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=100,
            tool_calls=[],
        )

        validator = AssertionValidator()
        validation = validator._validate_must_call_tool("browser", result)

        assert validation.passed is False


class TestOutputTypeValidator:
    """Tests for output_type assertion."""

    def test_output_type_json_valid(self):
        """Test output_type with valid JSON."""
        result = ExecutionResult(
            success=True,
            output='{"name": "laptop", "price": 500}',
            model="gpt-5-nano",
            provider="openai",
            latency_ms=100,
        )

        validator = AssertionValidator()
        validation = validator._validate_output_type("json", result)

        assert validation.passed is True
        assert "valid json" in validation.message.lower()

    def test_output_type_json_invalid(self):
        """Test output_type with invalid JSON."""
        result = ExecutionResult(
            success=True,
            output="This is not JSON",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=100,
        )

        validator = AssertionValidator()
        validation = validator._validate_output_type("json", result)

        assert validation.passed is False
        assert "not valid json" in validation.message.lower()

    def test_output_type_markdown(self):
        """Test output_type with markdown."""
        result = ExecutionResult(
            success=True,
            output="# Heading\n\nSome **bold** text",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=100,
        )

        validator = AssertionValidator()
        validation = validator._validate_output_type("markdown", result)

        assert validation.passed is True

    def test_output_type_code(self):
        """Test output_type with code."""
        result = ExecutionResult(
            success=True,
            output="def hello():\n    print('Hello')",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=100,
        )

        validator = AssertionValidator()
        validation = validator._validate_output_type("code", result)

        assert validation.passed is True

    def test_output_type_unknown(self):
        """Test output_type with unknown type."""
        result = ExecutionResult(
            success=True,
            output="Some text",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=100,
        )

        validator = AssertionValidator()
        validation = validator._validate_output_type("unknown_type", result)

        assert validation.passed is False
        assert "unknown output type" in validation.message.lower()


class TestMaxLatencyValidator:
    """Tests for max_latency_ms assertion."""

    def test_max_latency_passes(self):
        """Test max_latency_ms when under threshold."""
        result = ExecutionResult(
            success=True,
            output="Response",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=500,
        )

        validator = AssertionValidator()
        validation = validator._validate_max_latency(1000, result)

        assert validation.passed is True
        assert "within limit" in validation.message.lower()
        assert validation.expected == 1000
        assert validation.actual == 500

    def test_max_latency_fails(self):
        """Test max_latency_ms when over threshold."""
        result = ExecutionResult(
            success=True,
            output="Response",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=1500,
        )

        validator = AssertionValidator()
        validation = validator._validate_max_latency(1000, result)

        assert validation.passed is False
        assert "exceeds limit" in validation.message.lower()
        assert validation.details["difference_ms"] == 500

    def test_max_latency_exact(self):
        """Test max_latency_ms at exact threshold."""
        result = ExecutionResult(
            success=True,
            output="Response",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=1000,
        )

        validator = AssertionValidator()
        validation = validator._validate_max_latency(1000, result)

        assert validation.passed is True


class TestTokenValidators:
    """Tests for min_tokens and max_tokens assertions."""

    def test_min_tokens_passes(self):
        """Test min_tokens when above minimum."""
        result = ExecutionResult(
            success=True,
            output="Long response",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=100,
            tokens_output=150,
        )

        validator = AssertionValidator()
        validation = validator._validate_min_tokens(100, result)

        assert validation.passed is True
        assert "meets minimum" in validation.message.lower()

    def test_min_tokens_fails(self):
        """Test min_tokens when below minimum."""
        result = ExecutionResult(
            success=True,
            output="Short",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=100,
            tokens_output=50,
        )

        validator = AssertionValidator()
        validation = validator._validate_min_tokens(100, result)

        assert validation.passed is False
        assert "below minimum" in validation.message.lower()

    def test_min_tokens_no_count(self):
        """Test min_tokens when token count not available."""
        result = ExecutionResult(
            success=True,
            output="Response",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=100,
            tokens_output=None,
        )

        validator = AssertionValidator()
        validation = validator._validate_min_tokens(100, result)

        assert validation.passed is False
        assert "not available" in validation.message.lower()

    def test_max_tokens_passes(self):
        """Test max_tokens when under maximum."""
        result = ExecutionResult(
            success=True,
            output="Response",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=100,
            tokens_output=80,
        )

        validator = AssertionValidator()
        validation = validator._validate_max_tokens(100, result)

        assert validation.passed is True
        assert "within limit" in validation.message.lower()

    def test_max_tokens_fails(self):
        """Test max_tokens when over maximum."""
        result = ExecutionResult(
            success=True,
            output="Very long response",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=100,
            tokens_output=150,
        )

        validator = AssertionValidator()
        validation = validator._validate_max_tokens(100, result)

        assert validation.passed is False
        assert "exceeds limit" in validation.message.lower()


class TestAssertionValidatorIntegration:
    """Integration tests for complete validation."""

    def test_validate_multiple_assertions_all_pass(self):
        """Test validating multiple assertions that all pass."""
        result = ExecutionResult(
            success=True,
            output='{"price": 500, "product": "laptop"}',
            model="gpt-5-nano",
            provider="openai",
            latency_ms=800,
            tokens_output=50,
            tool_calls=[{"id": "1", "name": "browser", "input": {}}],
        )

        assertions = [
            {"must_contain": "price"},
            {"output_type": "json"},
            {"max_latency_ms": 1000},
            {"must_call_tool": "browser"},
        ]

        validator = AssertionValidator()
        validations = validator.validate(assertions, result)

        assert len(validations) == 4
        assert all(v.passed for v in validations)

    def test_validate_multiple_assertions_some_fail(self):
        """Test validating multiple assertions with some failures."""
        result = ExecutionResult(
            success=True,
            output="Product not found",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=1500,
            tokens_output=10,
            tool_calls=[],
        )

        assertions = [
            {"must_contain": "price"},  # Will fail
            {"max_latency_ms": 1000},  # Will fail
            {"min_tokens": 50},  # Will fail
            {"must_not_contain": "error"},  # Will pass
        ]

        validator = AssertionValidator()
        validations = validator.validate(assertions, result)

        assert len(validations) == 4
        failed = [v for v in validations if not v.passed]
        passed = [v for v in validations if v.passed]

        assert len(failed) == 3
        assert len(passed) == 1

    def test_validate_invalid_assertion_format(self):
        """Test validation with invalid assertion format."""
        result = ExecutionResult(
            success=True,
            output="Test",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=100,
        )

        assertions = [
            {"must_contain": "test"},  # Valid
            "invalid",  # Invalid format
            {"unknown_type": "value"},  # Unknown type
        ]

        validator = AssertionValidator()
        validations = validator.validate(assertions, result)

        assert len(validations) == 3
        assert validations[0].passed is True
        assert validations[1].passed is False
        assert "invalid assertion format" in validations[1].message.lower()
        assert validations[2].passed is False
        assert "unknown assertion type" in validations[2].message.lower()

    def test_validate_assertions_convenience_function(self):
        """Test the convenience function for validation."""
        result = ExecutionResult(
            success=True,
            output="The price is $500",
            model="gpt-5-nano",
            provider="openai",
            latency_ms=100,
        )

        assertions = [{"must_contain": "price"}]

        validations = validate_assertions(assertions, result)

        assert len(validations) == 1
        assert validations[0].passed is True
        assert validations[0].assertion_type == "must_contain"

    def test_validate_complex_assertions(self):
        """Test validation with all assertion types."""
        result = ExecutionResult(
            success=True,
            output='{"items": [{"name": "laptop", "price": "$999.99"}]}',
            model="gpt-5-nano",
            provider="openai",
            latency_ms=500,
            tokens_input=50,
            tokens_output=100,
            tool_calls=[
                {"id": "1", "name": "search", "input": {"query": "laptops"}},
                {"id": "2", "name": "filter", "input": {"max_price": 1000}},
            ],
        )

        assertions = [
            {"must_contain": "laptop"},
            {"must_not_contain": "error"},
            {"regex_match": r"\$\d+\.\d{2}"},
            {"must_call_tool": ["search", "filter"]},
            {"output_type": "json"},
            {"max_latency_ms": 1000},
            {"min_tokens": 50},
            {"max_tokens": 200},
        ]

        validator = AssertionValidator()
        validations = validator.validate(assertions, result)

        assert len(validations) == 8
        assert all(v.passed for v in validations), [
            f"{v.assertion_type}: {v.message}" for v in validations if not v.passed
        ]
