"""Tests for test specification parser."""

import json
import tempfile
from pathlib import Path

import pytest
import yaml

from sentinel.core.parser import ParsingError, TestSpecParser
from sentinel.core.schema import TestSpec, TestSuite


class TestParseYAML:
    """Tests for YAML parsing."""

    def test_parse_valid_yaml_test_spec(self) -> None:
        """Test parsing a valid YAML test spec."""
        yaml_content = """
name: "Simple test"
model: "gpt-4"
inputs:
  query: "What is 2+2?"
assertions:
  - must_contain: "4"
  - output_type: "text"
"""
        spec = TestSpecParser.parse_yaml(yaml_content)
        assert isinstance(spec, TestSpec)
        assert spec.name == "Simple test"
        assert spec.model == "gpt-4"
        assert spec.inputs.query == "What is 2+2?"
        assert len(spec.assertions) == 2

    def test_parse_valid_yaml_test_suite(self) -> None:
        """Test parsing a valid YAML test suite."""
        yaml_content = """
name: "Test Suite"
tests:
  - name: "Test 1"
    model: "gpt-4"
    inputs:
      query: "Q1"
    assertions:
      - must_contain: "A1"
  - name: "Test 2"
    model: "claude-3-5-sonnet-20241022"
    inputs:
      query: "Q2"
    assertions:
      - must_contain: "A2"
"""
        suite = TestSpecParser.parse_yaml(yaml_content)
        assert isinstance(suite, TestSuite)
        assert suite.name == "Test Suite"
        assert len(suite.tests) == 2

    def test_parse_yaml_with_tools(self) -> None:
        """Test parsing YAML with tools."""
        yaml_content = """
name: "Agent test"
model: "gpt-4"
tools:
  - browser
  - calculator
inputs:
  query: "Calculate something"
assertions:
  - must_call_tool: "calculator"
"""
        spec = TestSpecParser.parse_yaml(yaml_content)
        assert len(spec.tools) == 2
        assert spec.tools[0].name == "browser"

    def test_parse_yaml_with_model_config(self) -> None:
        """Test parsing YAML with model config."""
        yaml_content = """
name: "Test with config"
model: "gpt-4"
model_config:
  temperature: 0.7
  max_tokens: 500
inputs:
  query: "Test"
assertions:
  - must_contain: "result"
"""
        spec = TestSpecParser.parse_yaml(yaml_content)
        assert spec.model_config_params.temperature == 0.7
        assert spec.model_config_params.max_tokens == 500

    def test_parse_invalid_yaml_syntax(self) -> None:
        """Test parsing invalid YAML syntax."""
        invalid_yaml = """
name: "Test
missing quote
"""
        with pytest.raises(ParsingError, match="Invalid YAML syntax"):
            TestSpecParser.parse_yaml(invalid_yaml)

    def test_parse_yaml_not_dict(self) -> None:
        """Test parsing YAML that's not a dictionary."""
        yaml_content = "- item1\n- item2"
        with pytest.raises(ParsingError, match="must be a dictionary"):
            TestSpecParser.parse_yaml(yaml_content)

    def test_parse_yaml_missing_required_fields(self) -> None:
        """Test parsing YAML with missing required fields."""
        yaml_content = """
name: "Test"
# Missing model and inputs
assertions:
  - must_contain: "result"
"""
        with pytest.raises(ParsingError, match="Validation failed"):
            TestSpecParser.parse_yaml(yaml_content)

    def test_parse_yaml_with_assertion_dict(self) -> None:
        """Test parsing YAML with assertions as dictionaries.

        Note: Assertions are stored as dicts and validated during execution,
        not during parsing. This allows for flexibility and forwards compatibility.
        """
        yaml_content = """
name: "Test"
model: "gpt-4"
inputs:
  query: "Test"
assertions:
  - max_latency_ms: 5000
  - must_contain: "result"
"""
        spec = TestSpecParser.parse_yaml(yaml_content)
        assert len(spec.assertions) == 2
        assert spec.assertions[0]["max_latency_ms"] == 5000
        assert spec.assertions[1]["must_contain"] == "result"


class TestParseJSON:
    """Tests for JSON parsing."""

    def test_parse_valid_json_test_spec(self) -> None:
        """Test parsing a valid JSON test spec."""
        json_content = json.dumps(
            {
                "name": "Simple test",
                "model": "gpt-4",
                "inputs": {"query": "What is 2+2?"},
                "assertions": [
                    {"must_contain": "4"},
                    {"output_type": "text"},
                ],
            }
        )
        spec = TestSpecParser.parse_json(json_content)
        assert isinstance(spec, TestSpec)
        assert spec.name == "Simple test"

    def test_parse_valid_json_test_suite(self) -> None:
        """Test parsing a valid JSON test suite."""
        json_content = json.dumps(
            {
                "name": "Test Suite",
                "tests": [
                    {
                        "name": "Test 1",
                        "model": "gpt-4",
                        "inputs": {"query": "Q1"},
                        "assertions": [{"must_contain": "A1"}],
                    }
                ],
            }
        )
        suite = TestSpecParser.parse_json(json_content)
        assert isinstance(suite, TestSuite)
        assert len(suite.tests) == 1

    def test_parse_invalid_json_syntax(self) -> None:
        """Test parsing invalid JSON syntax."""
        invalid_json = '{"name": "Test", missing closing brace'
        with pytest.raises(ParsingError, match="Invalid JSON syntax"):
            TestSpecParser.parse_json(invalid_json)

    def test_parse_json_not_object(self) -> None:
        """Test parsing JSON that's not an object."""
        json_content = '["item1", "item2"]'
        with pytest.raises(ParsingError, match="must be an object"):
            TestSpecParser.parse_json(json_content)


class TestParseFile:
    """Tests for file parsing."""

    def test_parse_yaml_file(self) -> None:
        """Test parsing a YAML file."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".yaml", delete=False) as f:
            yaml.dump(
                {
                    "name": "File test",
                    "model": "gpt-4",
                    "inputs": {"query": "Test"},
                    "assertions": [{"must_contain": "result"}],
                },
                f,
            )
            temp_path = f.name

        try:
            spec = TestSpecParser.parse_file(temp_path)
            assert isinstance(spec, TestSpec)
            assert spec.name == "File test"
        finally:
            Path(temp_path).unlink()

    def test_parse_yml_file(self) -> None:
        """Test parsing a .yml file."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".yml", delete=False) as f:
            yaml.dump(
                {
                    "name": "YML test",
                    "model": "gpt-4",
                    "inputs": {"query": "Test"},
                    "assertions": [{"must_contain": "result"}],
                },
                f,
            )
            temp_path = f.name

        try:
            spec = TestSpecParser.parse_file(temp_path)
            assert spec.name == "YML test"
        finally:
            Path(temp_path).unlink()

    def test_parse_json_file(self) -> None:
        """Test parsing a JSON file."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
            json.dump(
                {
                    "name": "JSON test",
                    "model": "gpt-4",
                    "inputs": {"query": "Test"},
                    "assertions": [{"must_contain": "result"}],
                },
                f,
            )
            temp_path = f.name

        try:
            spec = TestSpecParser.parse_file(temp_path)
            assert spec.name == "JSON test"
        finally:
            Path(temp_path).unlink()

    def test_parse_file_not_found(self) -> None:
        """Test parsing non-existent file."""
        with pytest.raises(FileNotFoundError):
            TestSpecParser.parse_file("/nonexistent/file.yaml")

    def test_parse_unsupported_format(self) -> None:
        """Test parsing file with unsupported format."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write("some content")
            temp_path = f.name

        try:
            with pytest.raises(ParsingError, match="Unsupported file format"):
                TestSpecParser.parse_file(temp_path)
        finally:
            Path(temp_path).unlink()


class TestSerializationMethods:
    """Tests for serialization methods."""

    def test_to_yaml(self) -> None:
        """Test converting TestSpec to YAML."""
        spec = TestSpec(
            name="Test",
            model="gpt-4",
            inputs={"query": "What is 2+2?"},
            assertions=[{"must_contain": "4"}],
        )
        yaml_str = TestSpecParser.to_yaml(spec)
        assert "name: Test" in yaml_str
        assert "model: gpt-4" in yaml_str
        assert "query: What is 2+2?" in yaml_str

    def test_to_json(self) -> None:
        """Test converting TestSpec to JSON."""
        spec = TestSpec(
            name="Test",
            model="gpt-4",
            inputs={"query": "What is 2+2?"},
            assertions=[{"must_contain": "4"}],
        )
        json_str = TestSpecParser.to_json(spec)
        data = json.loads(json_str)
        assert data["name"] == "Test"
        assert data["model"] == "gpt-4"

    def test_to_json_custom_indent(self) -> None:
        """Test JSON serialization with custom indent."""
        spec = TestSpec(
            name="Test",
            model="gpt-4",
            inputs={"query": "Test"},
            assertions=[{"must_contain": "result"}],
        )
        json_str = TestSpecParser.to_json(spec, indent=4)
        assert "    " in json_str  # Check for 4-space indent

    def test_yaml_excludes_none_values(self) -> None:
        """Test that YAML serialization excludes None values."""
        spec = TestSpec(
            name="Test",
            model="gpt-4",
            inputs={"query": "Test"},
            assertions=[{"must_contain": "result"}],
            # description, provider, seed, etc. are None
        )
        yaml_str = TestSpecParser.to_yaml(spec)
        assert "description:" not in yaml_str
        assert "provider:" not in yaml_str
        assert "seed:" not in yaml_str


class TestWriteFile:
    """Tests for writing files."""

    def test_write_yaml_file(self) -> None:
        """Test writing TestSpec to YAML file."""
        spec = TestSpec(
            name="Write test",
            model="gpt-4",
            inputs={"query": "Test"},
            assertions=[{"must_contain": "result"}],
        )

        with tempfile.TemporaryDirectory() as tmpdir:
            file_path = Path(tmpdir) / "test.yaml"
            TestSpecParser.write_file(spec, file_path, format="yaml")

            assert file_path.exists()
            # Verify we can parse it back
            parsed = TestSpecParser.parse_file(file_path)
            assert parsed.name == "Write test"

    def test_write_json_file(self) -> None:
        """Test writing TestSpec to JSON file."""
        spec = TestSpec(
            name="Write test",
            model="gpt-4",
            inputs={"query": "Test"},
            assertions=[{"must_contain": "result"}],
        )

        with tempfile.TemporaryDirectory() as tmpdir:
            file_path = Path(tmpdir) / "test.json"
            TestSpecParser.write_file(spec, file_path, format="json")

            assert file_path.exists()
            parsed = TestSpecParser.parse_file(file_path)
            assert parsed.name == "Write test"

    def test_write_creates_directories(self) -> None:
        """Test that write_file creates parent directories."""
        spec = TestSpec(
            name="Test",
            model="gpt-4",
            inputs={"query": "Test"},
            assertions=[{"must_contain": "result"}],
        )

        with tempfile.TemporaryDirectory() as tmpdir:
            file_path = Path(tmpdir) / "subdir1" / "subdir2" / "test.yaml"
            TestSpecParser.write_file(spec, file_path)

            assert file_path.exists()
            assert file_path.parent.exists()

    def test_write_unsupported_format(self) -> None:
        """Test that unsupported format raises error."""
        spec = TestSpec(
            name="Test",
            model="gpt-4",
            inputs={"query": "Test"},
            assertions=[{"must_contain": "result"}],
        )

        with tempfile.TemporaryDirectory() as tmpdir:
            with pytest.raises(ParsingError, match="Unsupported format"):
                TestSpecParser.write_file(spec, Path(tmpdir) / "test.yaml", format="xml")


class TestValidateSpec:
    """Tests for spec validation."""

    def test_validate_valid_spec(self) -> None:
        """Test validating a valid spec."""
        spec = TestSpec(
            name="Test",
            model="gpt-4",
            inputs={"query": "Test"},
            assertions=[{"must_contain": "result"}],
        )
        assert TestSpecParser.validate_spec(spec) is True

    def test_validate_test_suite(self) -> None:
        """Test validating a test suite."""
        suite = TestSuite(
            name="Suite",
            tests=[
                {
                    "name": "Test 1",
                    "model": "gpt-4",
                    "inputs": {"query": "Q1"},
                    "assertions": [{"must_contain": "A1"}],
                }
            ],
        )
        assert TestSpecParser.validate_spec(suite) is True


class TestRoundTripConversion:
    """Tests for round-trip conversion (parse -> serialize -> parse)."""

    def test_yaml_round_trip(self) -> None:
        """Test YAML round-trip conversion."""
        original = TestSpec(
            name="Round trip test",
            model="gpt-4",
            seed=42,
            tools=["browser"],
            inputs={"query": "Test query"},
            assertions=[
                {"must_contain": "result"},
                {"max_latency_ms": 5000},
            ],
            tags=["test"],
        )

        # Convert to YAML and back
        yaml_str = TestSpecParser.to_yaml(original)
        parsed = TestSpecParser.parse_yaml(yaml_str)

        assert parsed.name == original.name
        assert parsed.model == original.model
        assert parsed.seed == original.seed
        assert len(parsed.tools) == len(original.tools)
        assert len(parsed.assertions) == len(original.assertions)

    def test_json_round_trip(self) -> None:
        """Test JSON round-trip conversion."""
        original = TestSpec(
            name="JSON round trip",
            model="claude-3-5-sonnet-20241022",
            provider="anthropic",
            inputs={"query": "Test"},
            assertions=[{"output_type": "json"}],
        )

        json_str = TestSpecParser.to_json(original)
        parsed = TestSpecParser.parse_json(json_str)

        assert parsed.name == original.name
        assert parsed.provider == original.provider
