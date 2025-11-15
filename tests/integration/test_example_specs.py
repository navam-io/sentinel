"""Integration tests for example test specifications.

These tests verify that all example test specs can be parsed correctly
and are valid according to the schema.
"""

from pathlib import Path

import pytest

from sentinel.core.parser import TestSpecParser
from sentinel.core.schema import TestSpec, TestSuite


# Path to examples directory
EXAMPLES_DIR = Path(__file__).parent.parent.parent / "examples" / "test_specs"


class TestExampleSpecs:
    """Test that all example specs are valid."""

    def test_browser_agent_product_search(self) -> None:
        """Test browser agent product search example."""
        spec_path = EXAMPLES_DIR / "browser_agent_product_search.yaml"
        spec = TestSpecParser.parse_file(spec_path)

        assert isinstance(spec, TestSpec)
        assert spec.name == "Browser agent - Amazon product research"
        assert spec.model == "claude-3-5-sonnet-20241022"
        assert spec.provider == "anthropic"
        assert spec.seed == 42
        assert len(spec.tools) == 3
        assert spec.tools[0].name == "browser"
        assert "Find top 3 laptops" in spec.inputs.query
        assert len(spec.assertions) == 5
        assert len(spec.tags) == 4

    def test_simple_qa_test(self) -> None:
        """Test simple Q&A example."""
        spec_path = EXAMPLES_DIR / "simple_qa_test.yaml"
        spec = TestSpecParser.parse_file(spec_path)

        assert isinstance(spec, TestSpec)
        assert spec.name == "Simple Q&A - Capital cities"
        assert spec.model == "gpt-4"
        assert spec.provider == "openai"
        assert spec.seed == 123
        assert spec.model_config_params.temperature == 0.0
        assert spec.model_config_params.max_tokens == 100
        assert "capital of France" in spec.inputs.query
        assert len(spec.assertions) == 6

    def test_code_generation_test(self) -> None:
        """Test code generation example."""
        spec_path = EXAMPLES_DIR / "code_generation_test.yaml"
        spec = TestSpecParser.parse_file(spec_path)

        assert isinstance(spec, TestSpec)
        assert spec.name == "Code generation - Python function"
        assert spec.seed == 999
        assert spec.model_config_params.temperature == 0.3
        assert spec.inputs.system_prompt is not None
        assert "factorial" in spec.inputs.query.lower()
        assert len(spec.assertions) == 6

    def test_multi_turn_conversation(self) -> None:
        """Test multi-turn conversation example."""
        spec_path = EXAMPLES_DIR / "multi_turn_conversation.yaml"
        spec = TestSpecParser.parse_file(spec_path)

        assert isinstance(spec, TestSpec)
        assert spec.name == "Multi-turn conversation - Customer support"
        assert spec.inputs.messages is not None
        assert len(spec.inputs.messages) == 3
        assert spec.inputs.messages[0]["role"] == "user"
        assert "order" in spec.inputs.messages[0]["content"]
        assert spec.inputs.system_prompt is not None

    def test_langgraph_research_agent(self) -> None:
        """Test LangGraph research agent example."""
        spec_path = EXAMPLES_DIR / "langgraph_research_agent.yaml"
        spec = TestSpecParser.parse_file(spec_path)

        assert isinstance(spec, TestSpec)
        assert spec.name == "LangGraph research agent - Tech news"
        assert spec.framework == "langgraph"
        assert spec.framework_config is not None
        assert spec.framework_config["max_iterations"] == 5
        assert len(spec.tools) == 2
        assert spec.tools[0].name == "web_search"
        assert spec.tools[0].parameters is not None
        assert spec.inputs.context is not None
        assert "companies" in spec.inputs.context

    def test_test_suite_example(self) -> None:
        """Test test suite example."""
        suite_path = EXAMPLES_DIR / "test_suite_example.yaml"
        suite = TestSpecParser.parse_file(suite_path)

        assert isinstance(suite, TestSuite)
        assert suite.name == "E-commerce Agent Test Suite"
        assert suite.version == "1.0.0"
        assert suite.defaults is not None
        assert suite.defaults["model"] == "claude-3-5-sonnet-20241022"
        assert suite.defaults["timeout_ms"] == 30000
        assert len(suite.tests) == 3
        assert suite.tests[0].name == "Product search - Laptops"
        assert suite.tests[1].name == "Product comparison - Gaming laptops"
        assert suite.tests[2].name == "Price tracking - Specific product"


class TestExampleSpecsRoundTrip:
    """Test round-trip conversion for example specs."""

    @pytest.mark.parametrize(
        "filename",
        [
            "browser_agent_product_search.yaml",
            "simple_qa_test.yaml",
            "code_generation_test.yaml",
            "multi_turn_conversation.yaml",
            "langgraph_research_agent.yaml",
            "test_suite_example.yaml",
        ],
    )
    def test_yaml_round_trip(self, filename: str) -> None:
        """Test that example specs can be round-tripped through YAML."""
        spec_path = EXAMPLES_DIR / filename
        original = TestSpecParser.parse_file(spec_path)

        # Convert to YAML and parse again
        yaml_str = TestSpecParser.to_yaml(original)
        reparsed = TestSpecParser.parse_yaml(yaml_str)

        # Compare key fields
        assert reparsed.name == original.name
        if isinstance(original, TestSpec):
            assert reparsed.model == original.model
        else:  # TestSuite
            assert len(reparsed.tests) == len(original.tests)

    @pytest.mark.parametrize(
        "filename",
        [
            "browser_agent_product_search.yaml",
            "simple_qa_test.yaml",
            "code_generation_test.yaml",
            "multi_turn_conversation.yaml",
            "langgraph_research_agent.yaml",
            "test_suite_example.yaml",
        ],
    )
    def test_json_round_trip(self, filename: str) -> None:
        """Test that example specs can be round-tripped through JSON."""
        spec_path = EXAMPLES_DIR / filename
        original = TestSpecParser.parse_file(spec_path)

        # Convert to JSON and parse again
        json_str = TestSpecParser.to_json(original)
        reparsed = TestSpecParser.parse_json(json_str)

        # Compare key fields
        assert reparsed.name == original.name
        if isinstance(original, TestSpec):
            assert reparsed.model == original.model
        else:  # TestSuite
            assert len(reparsed.tests) == len(original.tests)
