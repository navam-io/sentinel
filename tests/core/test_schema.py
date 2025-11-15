"""Tests for test specification schema models."""

import pytest
from pydantic import ValidationError

from sentinel.core.schema import (
    InputSpec,
    MaxLatencyAssertion,
    ModelConfig,
    MustCallToolAssertion,
    MustContainAssertion,
    MustNotContainAssertion,
    OutputTypeAssertion,
    RegexMatchAssertion,
    TestSpec,
    TestSuite,
    ToolSpec,
)


class TestToolSpec:
    """Tests for ToolSpec model."""

    def test_minimal_tool_spec(self) -> None:
        """Test creating a tool spec with just a name."""
        tool = ToolSpec(name="browser")
        assert tool.name == "browser"
        assert tool.description is None
        assert tool.parameters is None

    def test_full_tool_spec(self) -> None:
        """Test creating a tool spec with all fields."""
        tool = ToolSpec(
            name="web_search",
            description="Search the web",
            parameters={
                "type": "object",
                "properties": {"query": {"type": "string"}},
                "required": ["query"],
            },
        )
        assert tool.name == "web_search"
        assert tool.description == "Search the web"
        assert "query" in tool.parameters["properties"]


class TestAssertions:
    """Tests for assertion models."""

    def test_must_contain_single_string(self) -> None:
        """Test MustContainAssertion with a single string."""
        assertion = MustContainAssertion(must_contain="price")
        assert assertion.must_contain == ["price"]

    def test_must_contain_list(self) -> None:
        """Test MustContainAssertion with a list of strings."""
        assertion = MustContainAssertion(must_contain=["price", "shipping"])
        assert assertion.must_contain == ["price", "shipping"]

    def test_must_call_tool_single(self) -> None:
        """Test MustCallToolAssertion with a single tool."""
        assertion = MustCallToolAssertion(must_call_tool="browser")
        assert assertion.must_call_tool == ["browser"]

    def test_must_call_tool_list(self) -> None:
        """Test MustCallToolAssertion with multiple tools."""
        assertion = MustCallToolAssertion(must_call_tool=["browser", "scraper"])
        assert assertion.must_call_tool == ["browser", "scraper"]

    def test_max_latency_valid(self) -> None:
        """Test MaxLatencyAssertion with valid latency."""
        assertion = MaxLatencyAssertion(max_latency_ms=5000)
        assert assertion.max_latency_ms == 5000

    def test_max_latency_invalid_zero(self) -> None:
        """Test MaxLatencyAssertion rejects zero latency."""
        with pytest.raises(ValidationError):
            MaxLatencyAssertion(max_latency_ms=0)

    def test_max_latency_invalid_negative(self) -> None:
        """Test MaxLatencyAssertion rejects negative latency."""
        with pytest.raises(ValidationError):
            MaxLatencyAssertion(max_latency_ms=-100)

    def test_output_type_valid(self) -> None:
        """Test OutputTypeAssertion with valid types."""
        for output_type in ["json", "text", "markdown", "code", "structured"]:
            assertion = OutputTypeAssertion(output_type=output_type)
            assert assertion.output_type == output_type

    def test_output_type_invalid(self) -> None:
        """Test OutputTypeAssertion rejects invalid types."""
        with pytest.raises(ValidationError):
            OutputTypeAssertion(output_type="invalid_type")

    def test_must_not_contain(self) -> None:
        """Test MustNotContainAssertion."""
        assertion = MustNotContainAssertion(must_not_contain=["error", "fail"])
        assert assertion.must_not_contain == ["error", "fail"]

    def test_regex_match(self) -> None:
        """Test RegexMatchAssertion."""
        assertion = RegexMatchAssertion(regex_match=r"def \w+\(")
        assert assertion.regex_match == r"def \w+\("


class TestInputSpec:
    """Tests for InputSpec model."""

    def test_input_with_query(self) -> None:
        """Test InputSpec with query field."""
        inputs = InputSpec(query="What is the capital of France?")
        assert inputs.query == "What is the capital of France?"

    def test_input_with_messages(self) -> None:
        """Test InputSpec with messages field."""
        inputs = InputSpec(
            messages=[
                {"role": "user", "content": "Hello"},
                {"role": "assistant", "content": "Hi there!"},
            ]
        )
        assert len(inputs.messages) == 2
        assert inputs.messages[0]["role"] == "user"

    def test_input_with_system_prompt(self) -> None:
        """Test InputSpec with system_prompt."""
        inputs = InputSpec(
            query="Test query", system_prompt="You are a helpful assistant."
        )
        assert inputs.system_prompt == "You are a helpful assistant."

    def test_input_with_context(self) -> None:
        """Test InputSpec with context."""
        inputs = InputSpec(query="Test", context={"user_id": "123", "session": "abc"})
        assert inputs.context["user_id"] == "123"

    def test_input_requires_at_least_one_field(self) -> None:
        """Test InputSpec requires at least one input field."""
        with pytest.raises(ValidationError, match="At least one input field"):
            InputSpec()


class TestModelConfig:
    """Tests for ModelConfig model."""

    def test_model_config_all_fields(self) -> None:
        """Test ModelConfig with all parameters."""
        config = ModelConfig(
            temperature=0.7,
            max_tokens=1000,
            top_p=0.9,
            top_k=50,
            stop_sequences=["STOP", "END"],
        )
        assert config.temperature == 0.7
        assert config.max_tokens == 1000
        assert config.top_p == 0.9
        assert config.top_k == 50
        assert config.stop_sequences == ["STOP", "END"]

    def test_model_config_temperature_bounds(self) -> None:
        """Test ModelConfig temperature validation."""
        # Valid temperatures
        ModelConfig(temperature=0.0)
        ModelConfig(temperature=1.0)
        ModelConfig(temperature=2.0)

        # Invalid temperatures
        with pytest.raises(ValidationError):
            ModelConfig(temperature=-0.1)
        with pytest.raises(ValidationError):
            ModelConfig(temperature=2.1)

    def test_model_config_top_p_bounds(self) -> None:
        """Test ModelConfig top_p validation."""
        ModelConfig(top_p=0.0)
        ModelConfig(top_p=1.0)

        with pytest.raises(ValidationError):
            ModelConfig(top_p=-0.1)
        with pytest.raises(ValidationError):
            ModelConfig(top_p=1.1)


class TestTestSpec:
    """Tests for TestSpec model."""

    def test_minimal_test_spec(self) -> None:
        """Test creating a minimal valid test spec."""
        spec = TestSpec(
            name="Simple test",
            model="claude-3-5-sonnet-20241022",
            inputs={"query": "Test query"},
            assertions=[{"must_contain": "result"}],
        )
        assert spec.name == "Simple test"
        assert spec.model == "claude-3-5-sonnet-20241022"
        assert spec.inputs.query == "Test query"
        assert len(spec.assertions) == 1

    def test_test_spec_with_all_fields(self) -> None:
        """Test creating a test spec with all fields."""
        spec = TestSpec(
            name="Comprehensive test",
            description="A test with all fields",
            model="gpt-4",
            provider="openai",
            seed=42,
            model_config={"temperature": 0.5, "max_tokens": 500},
            tools=["browser", "calculator"],
            framework="langgraph",
            framework_config={"max_iterations": 5},
            inputs={"query": "Test query", "context": {"key": "value"}},
            assertions=[
                {"must_contain": "result"},
                {"max_latency_ms": 3000},
            ],
            tags=["test", "example"],
            timeout_ms=10000,
        )
        assert spec.name == "Comprehensive test"
        assert spec.provider == "openai"
        assert spec.seed == 42
        assert spec.framework == "langgraph"
        assert len(spec.tags) == 2
        assert spec.timeout_ms == 10000

    def test_test_spec_empty_name(self) -> None:
        """Test that empty name is rejected."""
        with pytest.raises(ValidationError):
            TestSpec(
                name="",
                model="gpt-4",
                inputs={"query": "Test"},
                assertions=[{"must_contain": "result"}],
            )

    def test_test_spec_empty_model(self) -> None:
        """Test that empty model is rejected."""
        with pytest.raises(ValidationError):
            TestSpec(
                name="Test",
                model="",
                inputs={"query": "Test"},
                assertions=[{"must_contain": "result"}],
            )

    def test_test_spec_no_assertions(self) -> None:
        """Test that at least one assertion is required."""
        with pytest.raises(ValidationError):
            TestSpec(
                name="Test",
                model="gpt-4",
                inputs={"query": "Test"},
                assertions=[],
            )

    def test_test_spec_tools_string_to_toolspec_conversion(self) -> None:
        """Test that string tool names are converted to ToolSpec objects."""
        spec = TestSpec(
            name="Test",
            model="gpt-4",
            tools=["browser", "calculator"],
            inputs={"query": "Test"},
            assertions=[{"must_contain": "result"}],
        )
        assert all(isinstance(tool, ToolSpec) for tool in spec.tools)
        assert spec.tools[0].name == "browser"
        assert spec.tools[1].name == "calculator"

    def test_test_spec_framework_without_tools_error(self) -> None:
        """Test that framework requires tools."""
        with pytest.raises(ValidationError, match="no tools provided"):
            TestSpec(
                name="Test",
                model="gpt-4",
                framework="langgraph",
                inputs={"query": "Test"},
                assertions=[{"must_contain": "result"}],
            )

    def test_test_spec_framework_with_tools(self) -> None:
        """Test that framework works with tools."""
        spec = TestSpec(
            name="Test",
            model="gpt-4",
            framework="langgraph",
            tools=["browser"],
            inputs={"query": "Test"},
            assertions=[{"must_contain": "result"}],
        )
        assert spec.framework == "langgraph"
        assert len(spec.tools) == 1


class TestTestSuite:
    """Tests for TestSuite model."""

    def test_minimal_test_suite(self) -> None:
        """Test creating a minimal test suite."""
        suite = TestSuite(
            name="My Suite",
            tests=[
                {
                    "name": "Test 1",
                    "model": "gpt-4",
                    "inputs": {"query": "Q1"},
                    "assertions": [{"must_contain": "A1"}],
                }
            ],
        )
        assert suite.name == "My Suite"
        assert len(suite.tests) == 1
        assert suite.tests[0].name == "Test 1"

    def test_test_suite_with_defaults(self) -> None:
        """Test that suite defaults are accessible."""
        suite = TestSuite(
            name="Suite with defaults",
            defaults={
                "model": "claude-3-5-sonnet-20241022",
                "provider": "anthropic",
                "timeout_ms": 5000,
            },
            tests=[
                {
                    "name": "Test 1",
                    "model": "gpt-4",  # Override default
                    "inputs": {"query": "Q1"},
                    "assertions": [{"must_contain": "A1"}],
                }
            ],
        )
        assert suite.defaults["model"] == "claude-3-5-sonnet-20241022"
        # Note: defaults are not automatically applied to tests (that's parser responsibility)
        assert suite.tests[0].model == "gpt-4"

    def test_test_suite_multiple_tests(self) -> None:
        """Test suite with multiple tests."""
        suite = TestSuite(
            name="Multi-test suite",
            tests=[
                {
                    "name": "Test 1",
                    "model": "gpt-4",
                    "inputs": {"query": "Q1"},
                    "assertions": [{"must_contain": "A1"}],
                },
                {
                    "name": "Test 2",
                    "model": "claude-3-5-sonnet-20241022",
                    "inputs": {"query": "Q2"},
                    "assertions": [{"must_contain": "A2"}],
                },
            ],
        )
        assert len(suite.tests) == 2
        assert suite.tests[0].name == "Test 1"
        assert suite.tests[1].name == "Test 2"

    def test_test_suite_requires_tests(self) -> None:
        """Test that test suite requires at least one test."""
        with pytest.raises(ValidationError):
            TestSuite(name="Empty suite", tests=[])

    def test_test_suite_with_version_and_tags(self) -> None:
        """Test suite with version and tags."""
        suite = TestSuite(
            name="Versioned suite",
            version="1.0.0",
            tags=["regression", "critical"],
            tests=[
                {
                    "name": "Test 1",
                    "model": "gpt-4",
                    "inputs": {"query": "Q1"},
                    "assertions": [{"must_contain": "A1"}],
                }
            ],
        )
        assert suite.version == "1.0.0"
        assert "regression" in suite.tags
        assert "critical" in suite.tags
