"""
Tests for YAML/JSON parser.

These tests ensure that:
1. Parsing from YAML/JSON works correctly
2. Serialization to YAML/JSON works correctly
3. Round-trip conversion is lossless
4. Error handling provides helpful messages
5. File I/O operations work properly
"""

import json
import pytest
from pathlib import Path

from backend.core.parser import ParsingError, TestSpecParser
from backend.core.schema import TestSpec, TestSuite


class TestParseYAML:
    """Tests for YAML parsing."""

    def test_parse_minimal_test_spec(self):
        """Test parsing a minimal test spec from YAML."""
        yaml_content = """
name: "Minimal Test"
model: "gpt-4"
inputs:
  query: "Test query"
assertions:
  - must_contain: "result"
        """
        spec = TestSpecParser.parse_yaml(yaml_content)
        assert isinstance(spec, TestSpec)
        assert spec.name == "Minimal Test"
        assert spec.model == "gpt-4"

    def test_parse_complete_test_spec(self):
        """Test parsing a complete test spec with all fields."""
        yaml_content = """
name: "Complete Test"
description: "Full specification"
model: "claude-3-5-sonnet-20241022"
provider: "anthropic"
seed: 42
model_config:
  temperature: 0.7
  max_tokens: 1000
tools:
  - browser
  - calculator
inputs:
  query: "Find laptops"
  context:
    budget: 1000
assertions:
  - must_call_tool: ["browser"]
  - must_contain: "price"
  - output_type: "json"
tags:
  - e2e
  - shopping
timeout_ms: 30000
        """
        spec = TestSpecParser.parse_yaml(yaml_content)
        assert spec.name == "Complete Test"
        assert spec.seed == 42
        assert spec.model_config_params.temperature == 0.7
        assert len(spec.tools) == 2
        assert len(spec.assertions) == 3

    def test_parse_test_suite(self):
        """Test parsing a test suite."""
        yaml_content = """
name: "Test Suite"
version: "1.0.0"
defaults:
  model: "gpt-4"
tests:
  - name: "Test 1"
    model: "gpt-4"
    inputs:
      query: "Q1"
    assertions:
      - must_contain: "A1"
  - name: "Test 2"
    model: "gpt-4"
    inputs:
      query: "Q2"
    assertions:
      - must_contain: "A2"
        """
        suite = TestSpecParser.parse_yaml(yaml_content)
        assert isinstance(suite, TestSuite)
        assert suite.name == "Test Suite"
        assert len(suite.tests) == 2

    def test_parse_invalid_yaml(self):
        """Test that invalid YAML raises ParsingError."""
        invalid_yaml = """
name: "Test
model: unclosed string
        """
        with pytest.raises(ParsingError, match="Invalid YAML"):
            TestSpecParser.parse_yaml(invalid_yaml)

    def test_parse_non_dict_yaml(self):
        """Test that non-dictionary YAML raises error."""
        with pytest.raises(ParsingError, match="must contain a dictionary"):
            TestSpecParser.parse_yaml("- item1\n- item2")

    def test_parse_yaml_with_validation_error(self):
        """Test that validation errors are caught and reported."""
        yaml_content = """
name: ""
model: "gpt-4"
inputs:
  query: "Test"
assertions: []
        """
        with pytest.raises(ParsingError, match="Validation failed"):
            TestSpecParser.parse_yaml(yaml_content)


class TestParseJSON:
    """Tests for JSON parsing."""

    def test_parse_minimal_test_spec(self):
        """Test parsing a minimal test spec from JSON."""
        json_content = json.dumps(
            {
                "name": "Minimal Test",
                "model": "gpt-4",
                "inputs": {"query": "Test query"},
                "assertions": [{"must_contain": "result"}],
            }
        )
        spec = TestSpecParser.parse_json(json_content)
        assert isinstance(spec, TestSpec)
        assert spec.name == "Minimal Test"

    def test_parse_test_suite(self):
        """Test parsing a test suite from JSON."""
        json_content = json.dumps(
            {
                "name": "Suite",
                "tests": [
                    {
                        "name": "Test 1",
                        "model": "gpt-4",
                        "inputs": {"query": "Q1"},
                        "assertions": [{}],
                    }
                ],
            }
        )
        suite = TestSpecParser.parse_json(json_content)
        assert isinstance(suite, TestSuite)

    def test_parse_invalid_json(self):
        """Test that invalid JSON raises ParsingError."""
        with pytest.raises(ParsingError, match="Invalid JSON"):
            TestSpecParser.parse_json("{invalid json")

    def test_parse_non_object_json(self):
        """Test that non-object JSON raises error."""
        with pytest.raises(ParsingError, match="must contain an object"):
            TestSpecParser.parse_json("[1, 2, 3]")


class TestParseFile:
    """Tests for file parsing."""

    def test_parse_yaml_file(self, tmp_path):
        """Test parsing a YAML file."""
        test_file = tmp_path / "test.yaml"
        test_file.write_text(
            """
name: "File Test"
model: "gpt-4"
inputs:
  query: "Test"
assertions:
  - must_contain: "result"
        """
        )
        spec = TestSpecParser.parse_file(test_file)
        assert spec.name == "File Test"

    def test_parse_yml_file(self, tmp_path):
        """Test parsing a .yml file."""
        test_file = tmp_path / "test.yml"
        test_file.write_text(
            """
name: "YML Test"
model: "gpt-4"
inputs:
  query: "Test"
assertions:
  - must_contain: "result"
        """
        )
        spec = TestSpecParser.parse_file(test_file)
        assert spec.name == "YML Test"

    def test_parse_json_file(self, tmp_path):
        """Test parsing a JSON file."""
        test_file = tmp_path / "test.json"
        test_file.write_text(
            json.dumps(
                {
                    "name": "JSON Test",
                    "model": "gpt-4",
                    "inputs": {"query": "Test"},
                    "assertions": [{}],
                }
            )
        )
        spec = TestSpecParser.parse_file(test_file)
        assert spec.name == "JSON Test"

    def test_parse_nonexistent_file(self):
        """Test that missing file raises FileNotFoundError."""
        with pytest.raises(FileNotFoundError):
            TestSpecParser.parse_file("/nonexistent/file.yaml")

    def test_parse_unsupported_extension(self, tmp_path):
        """Test that unsupported file extensions raise error."""
        test_file = tmp_path / "test.txt"
        test_file.write_text("content")
        with pytest.raises(ParsingError, match="Unsupported file extension"):
            TestSpecParser.parse_file(test_file)


class TestToYAML:
    """Tests for YAML serialization."""

    def test_serialize_test_spec(self):
        """Test serializing a TestSpec to YAML."""
        spec = TestSpec(
            name="Test",
            model="gpt-4",
            inputs={"query": "Test query"},
            assertions=[{"must_contain": "result"}],
        )
        yaml_str = TestSpecParser.to_yaml(spec)
        assert "name: Test" in yaml_str
        assert "model: gpt-4" in yaml_str
        assert "query: Test query" in yaml_str

    def test_serialize_excludes_none(self):
        """Test that None values are excluded from YAML."""
        spec = TestSpec(
            name="Test",
            model="gpt-4",
            inputs={"query": "Test"},
            assertions=[{}],
        )
        yaml_str = TestSpecParser.to_yaml(spec)
        assert "description:" not in yaml_str
        assert "provider:" not in yaml_str

    def test_serialize_test_suite(self):
        """Test serializing a TestSuite to YAML."""
        suite = TestSuite(
            name="Suite",
            tests=[
                TestSpec(
                    name="Test 1",
                    model="gpt-4",
                    inputs={"query": "Q1"},
                    assertions=[{}],
                )
            ],
        )
        yaml_str = TestSpecParser.to_yaml(suite)
        assert "name: Suite" in yaml_str
        assert "tests:" in yaml_str


class TestToJSON:
    """Tests for JSON serialization."""

    def test_serialize_test_spec(self):
        """Test serializing a TestSpec to JSON."""
        spec = TestSpec(
            name="Test",
            model="gpt-4",
            inputs={"query": "Test query"},
            assertions=[{"must_contain": "result"}],
        )
        json_str = TestSpecParser.to_json(spec)
        data = json.loads(json_str)
        assert data["name"] == "Test"
        assert data["model"] == "gpt-4"

    def test_serialize_with_indent(self):
        """Test JSON serialization with custom indentation."""
        spec = TestSpec(
            name="Test",
            model="gpt-4",
            inputs={"query": "Test"},
            assertions=[{}],
        )
        json_str = TestSpecParser.to_json(spec, indent=4)
        assert "    " in json_str  # 4-space indent


class TestWriteFile:
    """Tests for file writing."""

    def test_write_yaml_file(self, tmp_path):
        """Test writing a spec to YAML file."""
        spec = TestSpec(
            name="Test",
            model="gpt-4",
            inputs={"query": "Test"},
            assertions=[{}],
        )
        output_file = tmp_path / "output.yaml"
        TestSpecParser.write_file(spec, output_file)

        assert output_file.exists()
        content = output_file.read_text()
        assert "name: Test" in content

    def test_write_json_file(self, tmp_path):
        """Test writing a spec to JSON file."""
        spec = TestSpec(
            name="Test",
            model="gpt-4",
            inputs={"query": "Test"},
            assertions=[{}],
        )
        output_file = tmp_path / "output.json"
        TestSpecParser.write_file(spec, output_file, format="json")

        assert output_file.exists()
        content = json.loads(output_file.read_text())
        assert content["name"] == "Test"

    def test_write_creates_parent_dirs(self, tmp_path):
        """Test that writing creates parent directories."""
        spec = TestSpec(
            name="Test",
            model="gpt-4",
            inputs={"query": "Test"},
            assertions=[{}],
        )
        output_file = tmp_path / "nested" / "dir" / "output.yaml"
        TestSpecParser.write_file(spec, output_file)

        assert output_file.exists()

    def test_write_auto_detects_format(self, tmp_path):
        """Test that format is auto-detected from extension."""
        spec = TestSpec(
            name="Test",
            model="gpt-4",
            inputs={"query": "Test"},
            assertions=[{}],
        )

        # YAML auto-detection
        yaml_file = tmp_path / "test.yaml"
        TestSpecParser.write_file(spec, yaml_file)
        assert "name: Test" in yaml_file.read_text()

        # JSON auto-detection
        json_file = tmp_path / "test.json"
        TestSpecParser.write_file(spec, json_file)
        data = json.loads(json_file.read_text())
        assert data["name"] == "Test"

    def test_write_unsupported_format(self, tmp_path):
        """Test that unsupported format raises error."""
        spec = TestSpec(
            name="Test",
            model="gpt-4",
            inputs={"query": "Test"},
            assertions=[{}],
        )
        with pytest.raises(ParsingError, match="Unsupported format"):
            TestSpecParser.write_file(spec, tmp_path / "test.yaml", format="xml")


class TestRoundTrip:
    """Tests for round-trip conversion (parse → serialize → parse)."""

    def test_yaml_round_trip(self):
        """Test that YAML round-trip preserves data."""
        original_yaml = """
name: "Round Trip Test"
model: "gpt-4"
seed: 42
inputs:
  query: "Test query"
  context:
    key: value
assertions:
  - must_contain: "result"
  - max_latency_ms: 5000
tags:
  - test
        """
        # Parse → Serialize → Parse
        spec1 = TestSpecParser.parse_yaml(original_yaml)
        yaml_str = TestSpecParser.to_yaml(spec1)
        spec2 = TestSpecParser.parse_yaml(yaml_str)

        # Compare
        assert spec1.name == spec2.name
        assert spec1.model == spec2.model
        assert spec1.seed == spec2.seed
        assert spec1.inputs.query == spec2.inputs.query
        assert spec1.inputs.context == spec2.inputs.context
        assert len(spec1.assertions) == len(spec2.assertions)

    def test_json_round_trip(self):
        """Test that JSON round-trip preserves data."""
        spec1 = TestSpec(
            name="Round Trip",
            model="gpt-4",
            seed=123,
            inputs={"query": "Test"},
            assertions=[{"must_contain": "result"}],
            tags=["test"],
        )

        # Serialize → Parse
        json_str = TestSpecParser.to_json(spec1)
        spec2 = TestSpecParser.parse_json(json_str)

        assert spec1.name == spec2.name
        assert spec1.seed == spec2.seed
        assert spec1.inputs.query == spec2.inputs.query

    def test_file_round_trip(self, tmp_path):
        """Test that file write → read round-trip works."""
        spec1 = TestSpec(
            name="File Round Trip",
            model="gpt-4",
            inputs={"query": "Test"},
            assertions=[{"must_contain": "result"}],
        )

        # Write → Read
        test_file = tmp_path / "test.yaml"
        TestSpecParser.write_file(spec1, test_file)
        spec2 = TestSpecParser.parse_file(test_file)

        assert spec1.name == spec2.name
        assert spec1.model == spec2.model


class TestValidateSpec:
    """Tests for spec validation."""

    def test_validate_valid_spec(self):
        """Test validating a valid spec."""
        spec = TestSpec(
            name="Test",
            model="gpt-4",
            inputs={"query": "Test"},
            assertions=[{}],
        )
        assert TestSpecParser.validate_spec(spec) is True

    def test_validate_invalid_spec(self):
        """Test validating an invalid spec raises error."""
        spec = TestSpec(
            name="Test",
            model="gpt-4",
            inputs={"query": "Test"},
            assertions=[{}],
        )
        # Manually break the spec
        spec.name = ""  # Invalid: empty name

        with pytest.raises(ParsingError, match="Validation failed"):
            TestSpecParser.validate_spec(spec)
