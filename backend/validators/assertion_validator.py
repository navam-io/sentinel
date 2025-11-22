"""
Assertion validation engine for Sentinel test results.

Validates test execution results against assertion specifications.
Supports 8 assertion types:
  - must_contain / must_not_contain: Text matching
  - regex_match: Pattern matching
  - must_call_tool: Tool invocation validation
  - output_type: Format validation (json, markdown, code, etc.)
  - max_latency_ms: Performance validation
  - min_tokens / max_tokens: Length validation
"""

import json
import re
from typing import Any

from pydantic import BaseModel

from ..providers.base import ExecutionResult


class ValidationResult(BaseModel):
    """Result of a single assertion validation."""

    assertion_type: str
    passed: bool
    message: str
    expected: Any | None = None
    actual: Any | None = None
    details: dict[str, Any] | None = None


class AssertionValidator:
    """Validates execution results against assertion specifications."""

    def __init__(self):
        """Initialize the assertion validator."""
        self.validators = {
            "must_contain": self._validate_must_contain,
            "must_not_contain": self._validate_must_not_contain,
            "regex_match": self._validate_regex_match,
            "must_call_tool": self._validate_must_call_tool,
            "output_type": self._validate_output_type,
            "max_latency_ms": self._validate_max_latency,
            "min_tokens": self._validate_min_tokens,
            "max_tokens": self._validate_max_tokens,
        }

    def validate(
        self, assertions: list[dict[str, Any]], result: ExecutionResult
    ) -> list[ValidationResult]:
        """Validate all assertions against execution result.

        Args:
            assertions: List of assertion specifications
            result: Execution result to validate against

        Returns:
            List of ValidationResult objects, one per assertion
        """
        validation_results = []

        for assertion in assertions:
            # Each assertion is a dict with a single key (the assertion type)
            # and value (the assertion parameters)
            if not isinstance(assertion, dict) or len(assertion) != 1:
                validation_results.append(
                    ValidationResult(
                        assertion_type="unknown",
                        passed=False,
                        message=f"Invalid assertion format: {assertion}",
                    )
                )
                continue

            assertion_type = list(assertion.keys())[0]
            assertion_value = assertion[assertion_type]

            # Get validator function
            validator_fn = self.validators.get(assertion_type)

            if not validator_fn:
                validation_results.append(
                    ValidationResult(
                        assertion_type=assertion_type,
                        passed=False,
                        message=f"Unknown assertion type: {assertion_type}",
                    )
                )
                continue

            # Run validation
            try:
                validation_result = validator_fn(assertion_value, result)
                validation_results.append(validation_result)
            except Exception as e:
                validation_results.append(
                    ValidationResult(
                        assertion_type=assertion_type,
                        passed=False,
                        message=f"Validation error: {str(e)}",
                    )
                )

        return validation_results

    # ========================================================================
    # Text Matching Validators
    # ========================================================================

    def _validate_must_contain(self, expected: str, result: ExecutionResult) -> ValidationResult:
        """Validate that output contains expected text.

        Args:
            expected: Text that must be present in output
            result: Execution result

        Returns:
            ValidationResult with pass/fail status
        """
        output = result.output.lower()
        expected_lower = expected.lower()
        passed = expected_lower in output

        return ValidationResult(
            assertion_type="must_contain",
            passed=passed,
            message=(
                f"Output contains '{expected}'"
                if passed
                else f"Output does not contain '{expected}'"
            ),
            expected=expected,
            actual=result.output[:200] + "..." if len(result.output) > 200 else result.output,
        )

    def _validate_must_not_contain(
        self, expected: str, result: ExecutionResult
    ) -> ValidationResult:
        """Validate that output does NOT contain expected text.

        Args:
            expected: Text that must NOT be present in output
            result: Execution result

        Returns:
            ValidationResult with pass/fail status
        """
        output = result.output.lower()
        expected_lower = expected.lower()
        passed = expected_lower not in output

        return ValidationResult(
            assertion_type="must_not_contain",
            passed=passed,
            message=(
                f"Output does not contain '{expected}'"
                if passed
                else f"Output contains '{expected}'"
            ),
            expected=expected,
            actual=result.output[:200] + "..." if len(result.output) > 200 else result.output,
        )

    def _validate_regex_match(self, pattern: str, result: ExecutionResult) -> ValidationResult:
        """Validate that output matches regex pattern.

        Args:
            pattern: Regular expression pattern
            result: Execution result

        Returns:
            ValidationResult with pass/fail status
        """
        try:
            regex = re.compile(pattern, re.MULTILINE | re.DOTALL)
            match = regex.search(result.output)
            passed = match is not None

            return ValidationResult(
                assertion_type="regex_match",
                passed=passed,
                message=(
                    f"Output matches pattern '{pattern}'"
                    if passed
                    else f"Output does not match pattern '{pattern}'"
                ),
                expected=pattern,
                actual=result.output[:200] + "..." if len(result.output) > 200 else result.output,
                details={"matched_text": match.group(0) if match else None},
            )
        except re.error as e:
            return ValidationResult(
                assertion_type="regex_match",
                passed=False,
                message=f"Invalid regex pattern: {str(e)}",
                expected=pattern,
            )

    # ========================================================================
    # Tool Call Validators
    # ========================================================================

    def _validate_must_call_tool(
        self, expected_tools: Any, result: ExecutionResult
    ) -> ValidationResult:
        """Validate that specific tools were called.

        Args:
            expected_tools: Tool name (string) or list of tool names
            result: Execution result

        Returns:
            ValidationResult with pass/fail status
        """
        # Normalize to list
        if isinstance(expected_tools, str):
            expected_tools = [expected_tools]

        # Get called tool names
        called_tools = [call.get("name") for call in result.tool_calls if "name" in call]

        # Check if all expected tools were called
        missing_tools = [tool for tool in expected_tools if tool not in called_tools]
        passed = len(missing_tools) == 0

        return ValidationResult(
            assertion_type="must_call_tool",
            passed=passed,
            message=(
                f"All expected tools called: {expected_tools}"
                if passed
                else f"Missing tool calls: {missing_tools}"
            ),
            expected=expected_tools,
            actual=called_tools,
            details={
                "called_tools": called_tools,
                "missing_tools": missing_tools,
                "tool_call_count": len(called_tools),
            },
        )

    # ========================================================================
    # Output Type Validators
    # ========================================================================

    def _validate_output_type(
        self, expected_type: str, result: ExecutionResult
    ) -> ValidationResult:
        """Validate output format/type.

        Args:
            expected_type: Expected type (json, markdown, code, etc.)
            result: Execution result

        Returns:
            ValidationResult with pass/fail status
        """
        output = result.output.strip()

        if expected_type == "json":
            try:
                json.loads(output)
                return ValidationResult(
                    assertion_type="output_type",
                    passed=True,
                    message="Output is valid JSON",
                    expected="json",
                    actual="json",
                )
            except json.JSONDecodeError as e:
                return ValidationResult(
                    assertion_type="output_type",
                    passed=False,
                    message=f"Output is not valid JSON: {str(e)}",
                    expected="json",
                    actual="invalid",
                )

        elif expected_type == "markdown":
            # Simple heuristic: check for common markdown patterns
            has_markdown = any(
                [
                    output.startswith("#"),  # Headers
                    "```" in output,  # Code blocks
                    output.count("*") >= 2,  # Bold/italic
                    output.count("[") > 0 and output.count("]") > 0,  # Links
                ]
            )
            return ValidationResult(
                assertion_type="output_type",
                passed=has_markdown,
                message=(
                    "Output appears to be markdown"
                    if has_markdown
                    else "Output does not appear to be markdown"
                ),
                expected="markdown",
                actual="markdown" if has_markdown else "text",
            )

        elif expected_type == "code":
            # Simple heuristic: check for code-like patterns
            has_code = any(
                [
                    "def " in output or "function " in output,  # Function definitions
                    "class " in output,  # Class definitions
                    "{" in output and "}" in output,  # Braces
                    "import " in output or "from " in output,  # Imports
                ]
            )
            return ValidationResult(
                assertion_type="output_type",
                passed=has_code,
                message=(
                    "Output appears to be code" if has_code else "Output does not appear to be code"
                ),
                expected="code",
                actual="code" if has_code else "text",
            )

        else:
            return ValidationResult(
                assertion_type="output_type",
                passed=False,
                message=f"Unknown output type: {expected_type}",
                expected=expected_type,
            )

    # ========================================================================
    # Performance Validators
    # ========================================================================

    def _validate_max_latency(self, max_ms: int, result: ExecutionResult) -> ValidationResult:
        """Validate that latency is below threshold.

        Args:
            max_ms: Maximum allowed latency in milliseconds
            result: Execution result

        Returns:
            ValidationResult with pass/fail status
        """
        passed = result.latency_ms <= max_ms

        return ValidationResult(
            assertion_type="max_latency_ms",
            passed=passed,
            message=(
                f"Latency {result.latency_ms}ms is within limit of {max_ms}ms"
                if passed
                else f"Latency {result.latency_ms}ms exceeds limit of {max_ms}ms"
            ),
            expected=max_ms,
            actual=result.latency_ms,
            details={"difference_ms": result.latency_ms - max_ms},
        )

    # ========================================================================
    # Token Count Validators
    # ========================================================================

    def _validate_min_tokens(self, min_tokens: int, result: ExecutionResult) -> ValidationResult:
        """Validate that output has at least min tokens.

        Args:
            min_tokens: Minimum required tokens
            result: Execution result

        Returns:
            ValidationResult with pass/fail status
        """
        if result.tokens_output is None:
            return ValidationResult(
                assertion_type="min_tokens",
                passed=False,
                message="Token count not available in result",
                expected=min_tokens,
            )

        passed = result.tokens_output >= min_tokens

        return ValidationResult(
            assertion_type="min_tokens",
            passed=passed,
            message=(
                f"Output tokens {result.tokens_output} meets minimum of {min_tokens}"
                if passed
                else f"Output tokens {result.tokens_output} below minimum of {min_tokens}"
            ),
            expected=min_tokens,
            actual=result.tokens_output,
            details={"difference": result.tokens_output - min_tokens},
        )

    def _validate_max_tokens(self, max_tokens: int, result: ExecutionResult) -> ValidationResult:
        """Validate that output does not exceed max tokens.

        Args:
            max_tokens: Maximum allowed tokens
            result: Execution result

        Returns:
            ValidationResult with pass/fail status
        """
        if result.tokens_output is None:
            return ValidationResult(
                assertion_type="max_tokens",
                passed=False,
                message="Token count not available in result",
                expected=max_tokens,
            )

        passed = result.tokens_output <= max_tokens

        return ValidationResult(
            assertion_type="max_tokens",
            passed=passed,
            message=(
                f"Output tokens {result.tokens_output} within limit of {max_tokens}"
                if passed
                else f"Output tokens {result.tokens_output} exceeds limit of {max_tokens}"
            ),
            expected=max_tokens,
            actual=result.tokens_output,
            details={"difference": result.tokens_output - max_tokens},
        )


# ============================================================================
# Convenience Functions
# ============================================================================


def validate_assertions(
    assertions: list[dict[str, Any]], result: ExecutionResult
) -> list[ValidationResult]:
    """Validate assertions against execution result.

    Convenience function that creates a validator and runs validations.

    Args:
        assertions: List of assertion specifications
        result: Execution result to validate

    Returns:
        List of ValidationResult objects
    """
    validator = AssertionValidator()
    return validator.validate(assertions, result)
