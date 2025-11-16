"""
Tests for test executor.
"""

import pytest
from backend.executor import TestExecutor, ExecutorConfig
from backend.core.schema import TestSpec, InputSpec


class TestExecutorConfig:
    """Test executor configuration."""

    def test_executor_config_creation(self):
        """Test creating executor config."""
        config = ExecutorConfig(anthropic_api_key="test_key")
        assert config.anthropic_api_key == "test_key"
        assert config.openai_api_key is None

    def test_executor_config_multiple_keys(self):
        """Test config with multiple API keys."""
        config = ExecutorConfig(anthropic_api_key="anthropic_key", openai_api_key="openai_key")
        assert config.anthropic_api_key == "anthropic_key"
        assert config.openai_api_key == "openai_key"


class TestTestExecutor:
    """Test the test executor."""

    def test_executor_initialization(self):
        """Test initializing executor."""
        config = ExecutorConfig(anthropic_api_key="test_key")
        executor = TestExecutor(config)

        assert "anthropic" in executor.providers
        assert "openai" not in executor.providers  # Not configured

    def test_get_provider_for_model_claude(self):
        """Test getting provider for Claude models."""
        config = ExecutorConfig(anthropic_api_key="test_key")
        executor = TestExecutor(config)

        provider = executor._get_provider_for_model("claude-3-5-sonnet-20241022")
        assert provider is not None
        assert provider.provider_name == "anthropic"

    def test_get_provider_for_model_gpt(self):
        """Test getting provider for GPT models (not configured)."""
        config = ExecutorConfig(anthropic_api_key="test_key")
        executor = TestExecutor(config)

        provider = executor._get_provider_for_model("gpt-4")
        assert provider is None  # OpenAI not configured

    def test_build_messages_from_simple_query(self):
        """Test building messages from simple query input."""
        config = ExecutorConfig(anthropic_api_key="test_key")
        executor = TestExecutor(config)

        inputs = InputSpec(query="What is 2+2?")
        messages = executor._build_messages_from_input(inputs)

        assert len(messages) == 1
        assert messages[0]["role"] == "user"
        assert messages[0]["content"] == "What is 2+2?"

    def test_build_messages_with_system_prompt(self):
        """Test building messages with system prompt."""
        config = ExecutorConfig(anthropic_api_key="test_key")
        executor = TestExecutor(config)

        inputs = InputSpec(query="Hello", system_prompt="You are a helpful assistant")
        messages = executor._build_messages_from_input(inputs)

        assert len(messages) == 2
        assert messages[0]["role"] == "system"
        assert messages[0]["content"] == "You are a helpful assistant"
        assert messages[1]["role"] == "user"
        assert messages[1]["content"] == "Hello"

    @pytest.mark.asyncio
    async def test_execute_without_provider(self):
        """Test execution fails when provider not configured."""
        config = ExecutorConfig()  # No API keys
        executor = TestExecutor(config)

        test_spec = TestSpec(
            name="Test",
            model="claude-3-5-sonnet-20241022",
            inputs=InputSpec(query="Hello"),
            assertions=[],
        )

        with pytest.raises(ValueError, match="No provider configured"):
            await executor.execute(test_spec)

    @pytest.mark.asyncio
    async def test_execute_invalid_api_key(self):
        """Test execution with invalid API key."""
        config = ExecutorConfig(anthropic_api_key="invalid_key")
        executor = TestExecutor(config)

        test_spec = TestSpec(
            name="Test",
            model="claude-3-5-sonnet-20241022",
            inputs=InputSpec(query="Hello"),
            assertions=[],
        )

        result = await executor.execute(test_spec)

        # Should return error result, not raise exception
        assert result.success is False
        assert result.error is not None
