"""YAML/JSON parser for test specifications.

This module provides parsing and validation functionality for Sentinel
test specifications in YAML or JSON format.
"""

import json
from pathlib import Path
from typing import Union

import yaml
from pydantic import ValidationError

from sentinel.core.schema import TestSpec, TestSuite


class ParsingError(Exception):
    """Raised when test spec parsing fails."""

    def __init__(self, message: str, errors: list[dict] = None) -> None:
        """Initialize parsing error with optional validation errors."""
        super().__init__(message)
        self.errors = errors or []


class TestSpecParser:
    """Parser for YAML/JSON test specifications.

    Supports parsing single test specs or test suites from YAML or JSON files,
    with comprehensive validation and clear error messages.
    """

    @staticmethod
    def parse_yaml(content: str) -> Union[TestSpec, TestSuite]:
        """Parse YAML content into a TestSpec or TestSuite.

        Args:
            content: YAML string content

        Returns:
            Parsed and validated TestSpec or TestSuite

        Raises:
            ParsingError: If YAML is invalid or validation fails
        """
        try:
            data = yaml.safe_load(content)
        except yaml.YAMLError as e:
            raise ParsingError(f"Invalid YAML syntax: {e}")

        if not isinstance(data, dict):
            raise ParsingError("YAML content must be a dictionary/object")

        return TestSpecParser._parse_dict(data)

    @staticmethod
    def parse_json(content: str) -> Union[TestSpec, TestSuite]:
        """Parse JSON content into a TestSpec or TestSuite.

        Args:
            content: JSON string content

        Returns:
            Parsed and validated TestSpec or TestSuite

        Raises:
            ParsingError: If JSON is invalid or validation fails
        """
        try:
            data = json.loads(content)
        except json.JSONDecodeError as e:
            raise ParsingError(f"Invalid JSON syntax: {e}")

        if not isinstance(data, dict):
            raise ParsingError("JSON content must be an object")

        return TestSpecParser._parse_dict(data)

    @staticmethod
    def parse_file(file_path: Union[str, Path]) -> Union[TestSpec, TestSuite]:
        """Parse a test specification file (YAML or JSON).

        Automatically detects file format based on extension (.yaml, .yml, .json).

        Args:
            file_path: Path to the test specification file

        Returns:
            Parsed and validated TestSpec or TestSuite

        Raises:
            ParsingError: If file format is unsupported or parsing fails
            FileNotFoundError: If file doesn't exist
        """
        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(f"Test spec file not found: {file_path}")

        content = path.read_text(encoding="utf-8")
        suffix = path.suffix.lower()

        if suffix in [".yaml", ".yml"]:
            return TestSpecParser.parse_yaml(content)
        elif suffix == ".json":
            return TestSpecParser.parse_json(content)
        else:
            raise ParsingError(
                f"Unsupported file format: {suffix}. "
                "Supported formats: .yaml, .yml, .json"
            )

    @staticmethod
    def _parse_dict(data: dict) -> Union[TestSpec, TestSuite]:
        """Parse a dictionary into TestSpec or TestSuite.

        Determines whether the data represents a single test spec or a test suite
        based on the presence of a 'tests' field.

        Args:
            data: Dictionary containing test specification data

        Returns:
            Parsed TestSpec or TestSuite

        Raises:
            ParsingError: If validation fails
        """
        # Determine if this is a test suite or single test spec
        is_suite = "tests" in data

        try:
            if is_suite:
                return TestSuite(**data)
            else:
                return TestSpec(**data)
        except ValidationError as e:
            # Format validation errors for better readability
            error_messages = []
            for error in e.errors():
                loc = " -> ".join(str(x) for x in error["loc"])
                msg = error["msg"]
                error_messages.append(f"  • {loc}: {msg}")

            spec_type = "test suite" if is_suite else "test spec"
            raise ParsingError(
                f"Validation failed for {spec_type}:\n" + "\n".join(error_messages),
                errors=e.errors(),
            )

    @staticmethod
    def validate_spec(spec: Union[TestSpec, TestSuite]) -> bool:
        """Validate an already-parsed test spec or suite.

        This is useful for programmatically created specs.

        Args:
            spec: TestSpec or TestSuite to validate

        Returns:
            True if valid

        Raises:
            ParsingError: If validation fails
        """
        try:
            # Pydantic models are already validated on creation,
            # but we can re-validate by dumping and parsing
            if isinstance(spec, TestSuite):
                TestSuite(**spec.model_dump())
            else:
                TestSpec(**spec.model_dump())
            return True
        except ValidationError as e:
            raise ParsingError(
                "Validation failed:\n"
                + "\n".join(f"  • {err['loc']}: {err['msg']}" for err in e.errors()),
                errors=e.errors(),
            )

    @staticmethod
    def to_yaml(spec: Union[TestSpec, TestSuite]) -> str:
        """Convert a TestSpec or TestSuite to YAML string.

        Args:
            spec: TestSpec or TestSuite to serialize

        Returns:
            YAML string representation
        """
        data = spec.model_dump(exclude_none=True, by_alias=True)
        return yaml.dump(data, sort_keys=False, allow_unicode=True, default_flow_style=False)

    @staticmethod
    def to_json(spec: Union[TestSpec, TestSuite], indent: int = 2) -> str:
        """Convert a TestSpec or TestSuite to JSON string.

        Args:
            spec: TestSpec or TestSuite to serialize
            indent: JSON indentation level (default: 2)

        Returns:
            JSON string representation
        """
        return spec.model_dump_json(exclude_none=True, by_alias=True, indent=indent)

    @staticmethod
    def write_file(
        spec: Union[TestSpec, TestSuite],
        file_path: Union[str, Path],
        format: str = "yaml",
    ) -> None:
        """Write a TestSpec or TestSuite to a file.

        Args:
            spec: TestSpec or TestSuite to write
            file_path: Output file path
            format: Output format ('yaml' or 'json')

        Raises:
            ParsingError: If format is unsupported
        """
        path = Path(file_path)
        path.parent.mkdir(parents=True, exist_ok=True)

        if format == "yaml":
            content = TestSpecParser.to_yaml(spec)
        elif format == "json":
            content = TestSpecParser.to_json(spec)
        else:
            raise ParsingError(f"Unsupported format: {format}. Use 'yaml' or 'json'")

        path.write_text(content, encoding="utf-8")
