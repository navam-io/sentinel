"""
YAML/JSON parser for Sentinel test specifications.

This module provides parsing and serialization for test specs, enabling:
1. Visual → DSL: Convert canvas state to YAML/JSON
2. DSL → Visual: Import YAML/JSON files to canvas
3. Validation: Ensure specs are valid before execution
4. Round-trip: Parse → Serialize should be lossless
"""

import json
from pathlib import Path
from typing import Union

import yaml
from pydantic import ValidationError

from .schema import TestSpec, TestSuite, TestSpecOrSuite


class ParsingError(Exception):
    """Raised when parsing or validation fails.

    Attributes:
        message: Human-readable error message
        errors: List of detailed validation errors from Pydantic
    """

    def __init__(self, message: str, errors: list = None):
        super().__init__(message)
        self.message = message
        self.errors = errors or []

    def __str__(self) -> str:
        if not self.errors:
            return self.message

        error_details = []
        for error in self.errors:
            loc = " -> ".join(str(x) for x in error.get("loc", []))
            msg = error.get("msg", "Unknown error")
            error_details.append(f"  • {loc}: {msg}")

        return f"{self.message}\n" + "\n".join(error_details)


class TestSpecParser:
    """Parser for test specifications.

    Provides methods to:
    - Parse YAML/JSON strings or files
    - Serialize TestSpec/TestSuite to YAML/JSON
    - Validate specifications
    - Write specifications to files

    Example:
        ```python
        # Parse from file
        spec = TestSpecParser.parse_file("test.yaml")

        # Parse from string
        yaml_str = '''
        name: "My Test"
        model: "gpt-4"
        inputs:
          query: "Test"
        assertions:
          - must_contain: "result"
        '''
        spec = TestSpecParser.parse_yaml(yaml_str)

        # Export to YAML
        yaml_output = TestSpecParser.to_yaml(spec)

        # Write to file
        TestSpecParser.write_file(spec, "output.yaml")
        ```
    """

    @staticmethod
    def parse_yaml(content: str) -> TestSpecOrSuite:
        """Parse YAML string into a TestSpec or TestSuite.

        Args:
            content: YAML string to parse

        Returns:
            TestSpec or TestSuite object

        Raises:
            ParsingError: If YAML is invalid or validation fails
        """
        try:
            data = yaml.safe_load(content)
        except yaml.YAMLError as e:
            raise ParsingError(f"Invalid YAML: {str(e)}")

        if not isinstance(data, dict):
            raise ParsingError("YAML must contain a dictionary at the root level")

        return TestSpecParser._parse_dict(data)

    @staticmethod
    def parse_json(content: str) -> TestSpecOrSuite:
        """Parse JSON string into a TestSpec or TestSuite.

        Args:
            content: JSON string to parse

        Returns:
            TestSpec or TestSuite object

        Raises:
            ParsingError: If JSON is invalid or validation fails
        """
        try:
            data = json.loads(content)
        except json.JSONDecodeError as e:
            raise ParsingError(f"Invalid JSON: {str(e)}")

        if not isinstance(data, dict):
            raise ParsingError("JSON must contain an object at the root level")

        return TestSpecParser._parse_dict(data)

    @staticmethod
    def parse_file(file_path: Union[str, Path]) -> TestSpecOrSuite:
        """Parse a test specification file (YAML or JSON).

        Args:
            file_path: Path to the test spec file (.yaml, .yml, or .json)

        Returns:
            TestSpec or TestSuite object

        Raises:
            FileNotFoundError: If file doesn't exist
            ParsingError: If file format is invalid or validation fails
        """
        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        content = path.read_text(encoding="utf-8")

        # Determine format from extension
        if path.suffix in [".yaml", ".yml"]:
            return TestSpecParser.parse_yaml(content)
        elif path.suffix == ".json":
            return TestSpecParser.parse_json(content)
        else:
            raise ParsingError(
                f"Unsupported file extension: {path.suffix}. " "Use .yaml, .yml, or .json"
            )

    @staticmethod
    def _parse_dict(data: dict) -> TestSpecOrSuite:
        """Parse a dictionary into TestSpec or TestSuite.

        Determines whether the data represents a single test or a suite
        based on the presence of a 'tests' field.
        """
        try:
            # Check if this is a test suite (has 'tests' field)
            if "tests" in data:
                return TestSuite(**data)
            else:
                return TestSpec(**data)
        except ValidationError as e:
            errors = e.errors()
            raise ParsingError("Validation failed for test specification", errors)

    @staticmethod
    def to_yaml(spec: TestSpecOrSuite) -> str:
        """Convert a TestSpec or TestSuite to YAML string.

        Args:
            spec: TestSpec or TestSuite to serialize

        Returns:
            YAML string representation
        """
        # Convert to dict, excluding None values for cleaner output
        data = spec.model_dump(exclude_none=True, by_alias=True)

        # Use safe_dump for security and readability
        return yaml.safe_dump(
            data,
            default_flow_style=False,
            sort_keys=False,  # Preserve field order
            allow_unicode=True,
        )

    @staticmethod
    def to_json(spec: TestSpecOrSuite, indent: int = 2) -> str:
        """Convert a TestSpec or TestSuite to JSON string.

        Args:
            spec: TestSpec or TestSuite to serialize
            indent: Number of spaces for indentation (default: 2)

        Returns:
            JSON string representation
        """
        # Use Pydantic's built-in JSON serialization
        return spec.model_dump_json(
            exclude_none=True, by_alias=True, indent=indent
        )

    @staticmethod
    def write_file(
        spec: TestSpecOrSuite,
        file_path: Union[str, Path],
        format: str = None,
    ) -> None:
        """Write a TestSpec or TestSuite to a file.

        Args:
            spec: TestSpec or TestSuite to write
            file_path: Output file path
            format: Output format ('yaml' or 'json'). If None, determined from file extension

        Raises:
            ParsingError: If format is unsupported
        """
        path = Path(file_path)

        # Create parent directories if they don't exist
        path.parent.mkdir(parents=True, exist_ok=True)

        # Determine format
        if format is None:
            if path.suffix in [".yaml", ".yml"]:
                format = "yaml"
            elif path.suffix == ".json":
                format = "json"
            else:
                raise ParsingError(
                    f"Cannot determine format from extension: {path.suffix}. "
                    "Specify format='yaml' or format='json'"
                )

        # Serialize and write
        if format == "yaml":
            content = TestSpecParser.to_yaml(spec)
        elif format == "json":
            content = TestSpecParser.to_json(spec)
        else:
            raise ParsingError(f"Unsupported format: {format}. Use 'yaml' or 'json'")

        path.write_text(content, encoding="utf-8")

    @staticmethod
    def validate_spec(spec: TestSpecOrSuite) -> bool:
        """Validate an already-parsed test specification.

        This re-validates a spec object to ensure it's still valid.
        Useful after programmatic modifications.

        Args:
            spec: TestSpec or TestSuite to validate

        Returns:
            True if valid

        Raises:
            ParsingError: If validation fails
        """
        try:
            # Re-parse through Pydantic to trigger all validators
            if isinstance(spec, TestSuite):
                TestSuite(**spec.model_dump())
            else:
                TestSpec(**spec.model_dump())
            return True
        except ValidationError as e:
            errors = e.errors()
            raise ParsingError("Validation failed", errors)
