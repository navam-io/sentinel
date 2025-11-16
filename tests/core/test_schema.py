"""
Tests for Pydantic schema models.

These tests ensure that:
1. Schema validation works correctly
2. All field constraints are enforced
3. Model validators function properly
4. Serialization/deserialization works
"""

import pytest
from pydantic import ValidationError

from backend.core.schema import (
    InputSpec,
    Message,
    ModelConfig,
    TestSpec,
    TestSuite,
    ToolSpec,
)


class TestModelConfig:
    """Tests for ModelConfig model."""

    def test_valid_model_config(self):
        """Test creating a valid ModelConfig."""
        config = ModelConfig(
            temperature=0.7, max_tokens=1000, top_p=0.9, top_k=50, stop_sequences=["END"]
        )
        assert config.temperature == 0.7
        assert config.max_tokens == 1000
        assert config.stop_sequences == ["END"]

    def test_temperature_range_validation(self):
        """Test temperature must be between 0 and 2."""
        # Valid range
        ModelConfig(temperature=0.0)
        ModelConfig(temperature=1.0)
        ModelConfig(temperature=2.0)

        # Invalid range
        with pytest.raises(ValidationError):
            ModelConfig(temperature=-0.1)
        with pytest.raises(ValidationError):
            ModelConfig(temperature=2.1)

    def test_top_p_range_validation(self):
        """Test top_p must be between 0 and 1."""
        ModelConfig(top_p=0.0)
        ModelConfig(top_p=0.5)
        ModelConfig(top_p=1.0)

        with pytest.raises(ValidationError):
            ModelConfig(top_p=-0.1)
        with pytest.raises(ValidationError):
            ModelConfig(top_p=1.1)

    def test_positive_integers(self):
        """Test max_tokens and top_k must be positive."""
        ModelConfig(max_tokens=1)
        ModelConfig(top_k=1)

        with pytest.raises(ValidationError):
            ModelConfig(max_tokens=0)
        with pytest.raises(ValidationError):
            ModelConfig(top_k=0)


class TestToolSpec:
    """Tests for ToolSpec model."""

    def test_simple_tool(self):
        """Test creating a simple tool with just a name."""
        tool = ToolSpec(name="browser")
        assert tool.name == "browser"
        assert tool.description is None
        assert tool.parameters is None

    def test_full_tool_spec(self):
        """Test creating a full tool specification."""
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

    def test_name_required(self):
        """Test that tool name is required."""
        with pytest.raises(ValidationError):
            ToolSpec()

    def test_name_min_length(self):
        """Test that tool name cannot be empty."""
        with pytest.raises(ValidationError):
            ToolSpec(name="")


class TestMessage:
    """Tests for Message model."""

    def test_valid_message(self):
        """Test creating valid messages."""
        Message(role="user", content="Hello")
        Message(role="assistant", content="Hi there")
        Message(role="system", content="You are helpful")

    def test_role_must_be_literal(self):
        """Test role must be one of user/assistant/system."""
        with pytest.raises(ValidationError):
            Message(role="invalid", content="Test")

    def test_content_required(self):
        """Test content is required and non-empty."""
        with pytest.raises(ValidationError):
            Message(role="user", content="")


class TestInputSpec:
    """Tests for InputSpec model."""

    def test_simple_query(self):
        """Test input with just a query."""
        inputs = InputSpec(query="What is 2+2?")
        assert inputs.query == "What is 2+2?"

    def test_messages_only(self):
        """Test input with conversation messages."""
        messages = [
            Message(role="user", content="Hello"),
            Message(role="assistant", content="Hi!"),
        ]
        inputs = InputSpec(messages=messages)
        assert len(inputs.messages) == 2

    def test_with_system_prompt(self):
        """Test input with system prompt."""
        inputs = InputSpec(query="Test", system_prompt="You are helpful")
        assert inputs.system_prompt == "You are helpful"

    def test_with_context(self):
        """Test input with context data."""
        inputs = InputSpec(query="Test", context={"user_id": "123", "tier": "premium"})
        assert inputs.context["user_id"] == "123"

    def test_at_least_one_field_required(self):
        """Test that at least one input field must be provided."""
        with pytest.raises(ValidationError, match="At least one input field"):
            InputSpec()

    def test_multiple_fields_allowed(self):
        """Test that multiple input fields can be combined."""
        inputs = InputSpec(
            query="Test",
            system_prompt="Be helpful",
            context={"session": "abc"},
        )
        assert inputs.query == "Test"
        assert inputs.system_prompt == "Be helpful"
        assert inputs.context == {"session": "abc"}


class TestTestSpec:
    """Tests for TestSpec model."""

    def test_minimal_test_spec(self):
        """Test creating a minimal valid test spec."""
        spec = TestSpec(
            name="Test",
            model="gpt-4",
            inputs={"query": "Test query"},
            assertions=[{"must_contain": "result"}],
        )
        assert spec.name == "Test"
        assert spec.model == "gpt-4"
        assert len(spec.assertions) == 1

    def test_complete_test_spec(self):
        """Test creating a complete test spec with all fields."""
        spec = TestSpec(
            name="Complete Test",
            description="A complete test specification",
            model="claude-3-5-sonnet-20241022",
            provider="anthropic",
            seed=42,
            model_config={"temperature": 0.7, "max_tokens": 1000},
            tools=["browser", "calculator"],
            framework="langgraph",
            framework_config={"max_iterations": 5},
            inputs={"query": "Find laptops under $1000"},
            assertions=[
                {"must_call_tool": ["browser"]},
                {"must_contain": "price"},
                {"output_type": "json"},
            ],
            tags=["e2e", "shopping"],
            timeout_ms=30000,
        )
        assert spec.name == "Complete Test"
        assert spec.model == "claude-3-5-sonnet-20241022"
        assert spec.seed == 42
        assert len(spec.tools) == 2
        assert len(spec.assertions) == 3
        assert "e2e" in spec.tags

    def test_required_fields(self):
        """Test that required fields are enforced."""
        # Missing name
        with pytest.raises(ValidationError):
            TestSpec(model="gpt-4", inputs={"query": "Test"}, assertions=[{}])

        # Missing model
        with pytest.raises(ValidationError):
            TestSpec(name="Test", inputs={"query": "Test"}, assertions=[{}])

        # Missing inputs
        with pytest.raises(ValidationError):
            TestSpec(name="Test", model="gpt-4", assertions=[{}])

        # Missing assertions
        with pytest.raises(ValidationError):
            TestSpec(name="Test", model="gpt-4", inputs={"query": "Test"})

    def test_assertions_min_length(self):
        """Test that at least one assertion is required."""
        with pytest.raises(ValidationError):
            TestSpec(
                name="Test",
                model="gpt-4",
                inputs={"query": "Test"},
                assertions=[],  # Empty assertions
            )

    def test_timeout_must_be_positive(self):
        """Test timeout must be greater than 0."""
        TestSpec(
            name="Test",
            model="gpt-4",
            inputs={"query": "Test"},
            assertions=[{}],
            timeout_ms=1000,
        )

        with pytest.raises(ValidationError):
            TestSpec(
                name="Test",
                model="gpt-4",
                inputs={"query": "Test"},
                assertions=[{}],
                timeout_ms=0,
            )

    def test_framework_requires_tools(self):
        """Test that specifying a framework requires tools."""
        # Valid: framework with tools
        TestSpec(
            name="Test",
            model="gpt-4",
            inputs={"query": "Test"},
            assertions=[{}],
            framework="langgraph",
            tools=["browser"],
        )

        # Invalid: framework without tools
        with pytest.raises(ValidationError, match="framework requires tools"):
            TestSpec(
                name="Test",
                model="gpt-4",
                inputs={"query": "Test"},
                assertions=[{}],
                framework="langgraph",
            )

    def test_tools_as_strings(self):
        """Test tools can be specified as simple strings."""
        spec = TestSpec(
            name="Test",
            model="gpt-4",
            inputs={"query": "Test"},
            assertions=[{}],
            tools=["browser", "calculator"],
        )
        assert spec.tools == ["browser", "calculator"]

    def test_tools_as_specs(self):
        """Test tools can be specified as ToolSpec objects."""
        spec = TestSpec(
            name="Test",
            model="gpt-4",
            inputs={"query": "Test"},
            assertions=[{}],
            tools=[
                ToolSpec(name="browser"),
                ToolSpec(name="search", description="Web search"),
            ],
        )
        assert len(spec.tools) == 2
        assert spec.tools[0].name == "browser"

    def test_model_config_alias(self):
        """Test that model_config works as an alias."""
        # Using dict directly (will be parsed as ModelConfig)
        spec = TestSpec(
            name="Test",
            model="gpt-4",
            inputs={"query": "Test"},
            assertions=[{}],
            model_config={"temperature": 0.5},
        )
        assert spec.model_config_params.temperature == 0.5

    def test_serialization_excludes_none(self):
        """Test that None values are excluded from serialization."""
        spec = TestSpec(
            name="Test",
            model="gpt-4",
            inputs={"query": "Test"},
            assertions=[{"must_contain": "result"}],
        )
        data = spec.model_dump(exclude_none=True)
        assert "description" not in data
        assert "provider" not in data
        assert "seed" not in data


class TestTestSuite:
    """Tests for TestSuite model."""

    def test_minimal_suite(self):
        """Test creating a minimal test suite."""
        suite = TestSuite(
            name="My Suite",
            tests=[
                TestSpec(
                    name="Test 1",
                    model="gpt-4",
                    inputs={"query": "Q1"},
                    assertions=[{}],
                )
            ],
        )
        assert suite.name == "My Suite"
        assert len(suite.tests) == 1

    def test_complete_suite(self):
        """Test creating a complete test suite."""
        suite = TestSuite(
            name="Complete Suite",
            description="A complete test suite",
            version="1.0.0",
            defaults={"model": "gpt-4", "provider": "openai"},
            tests=[
                TestSpec(
                    name="Test 1",
                    model="gpt-4",
                    inputs={"query": "Q1"},
                    assertions=[{}],
                ),
                TestSpec(
                    name="Test 2",
                    model="gpt-4",
                    inputs={"query": "Q2"},
                    assertions=[{}],
                ),
            ],
            tags=["regression", "critical"],
        )
        assert suite.version == "1.0.0"
        assert len(suite.tests) == 2
        assert "regression" in suite.tags

    def test_suite_requires_at_least_one_test(self):
        """Test that a suite must have at least one test."""
        with pytest.raises(ValidationError):
            TestSuite(name="Empty Suite", tests=[])

    def test_defaults_are_metadata_only(self):
        """Test that defaults don't automatically apply to tests."""
        # Defaults are just metadata, not automatically applied
        suite = TestSuite(
            name="Suite",
            defaults={"model": "gpt-4"},
            tests=[
                TestSpec(
                    name="Test 1",
                    model="claude-3",  # Different model
                    inputs={"query": "Q1"},
                    assertions=[{}],
                )
            ],
        )
        assert suite.tests[0].model == "claude-3"  # Not "gpt-4"
