"""
Integration tests for OpenAI provider.

These tests verify that OpenAI API calls work in production with real API keys.
They are marked as integration tests and can be skipped if OPENAI_API_KEY is not set.
"""

import os
import pytest
from backend.providers.openai_provider import OpenAIProvider
from backend.providers.base import ProviderConfig


# Skip all tests in this module if OPENAI_API_KEY is not set
pytestmark = pytest.mark.skipif(
    not os.getenv("OPENAI_API_KEY"),
    reason="OPENAI_API_KEY environment variable not set. Skipping OpenAI integration tests."
)


class TestOpenAIProviderIntegration:
    """Integration tests for OpenAI provider with real API calls."""

    @pytest.fixture
    def provider(self):
        """Create OpenAI provider with real API key from environment."""
        api_key = os.getenv("OPENAI_API_KEY")
        config = ProviderConfig(api_key=api_key)
        return OpenAIProvider(config)

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_real_api_call_gpt5_nano(self, provider):
        """Test real API call with GPT-5 nano (cheapest Frontier model)."""
        messages = [
            {"role": "user", "content": "What is 2+2? Answer with just the number."}
        ]

        result = await provider.execute(
            model="gpt-5-nano",
            messages=messages,
            # Note: gpt-5-nano doesn't support custom temperature
            max_tokens=500  # Increased from 100 to avoid max_tokens limit errors
        )

        # Verify successful response
        assert result.success is True
        assert result.error is None
        assert result.output is not None
        assert "4" in result.output
        assert result.provider == "openai"
        assert result.model == "gpt-5-nano"
        assert result.latency_ms > 0
        assert result.tokens_input > 0
        assert result.tokens_output > 0
        assert result.cost_usd > 0

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_real_api_call_with_system_message(self, provider):
        """Test API call with system message."""
        messages = [
            {"role": "system", "content": "You are a helpful math tutor."},
            {"role": "user", "content": "What is 5+3? Just the number."}
        ]

        result = await provider.execute(
            model="gpt-5-nano",
            messages=messages,
            # Note: gpt-5-nano doesn't support custom temperature
            max_tokens=500  # Increased from 100 to avoid max_tokens limit errors
        )

        assert result.success is True
        assert "8" in result.output
        assert result.tokens_input > 0

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_invalid_model_returns_error(self, provider):
        """Test that invalid model ID returns error result."""
        messages = [
            {"role": "user", "content": "Hello"}
        ]

        result = await provider.execute(
            model="gpt-fake-model-12345",  # Non-existent model
            messages=messages
        )

        # Should return error result, not raise exception
        assert result.success is False
        assert result.error is not None
        assert "model" in result.error.lower() or "not found" in result.error.lower()

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_model_list_accuracy(self, provider):
        """Verify that listed models are valid (spot check with one model)."""
        models = provider.list_models()

        # Verify we have models
        assert len(models) > 0

        # Spot check: Try to use one of the listed models
        # Use gpt-5-nano as it's cheapest Frontier model
        assert "gpt-5-nano" in models

        messages = [{"role": "user", "content": "Hi"}]
        result = await provider.execute(
            model="gpt-5-nano",
            messages=messages,
            max_tokens=20  # Minimum ~10-15 tokens needed for GPT-5 models
        )

        assert result.success is True

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_cost_calculation_realistic(self, provider):
        """Verify cost calculation produces realistic values."""
        messages = [
            {"role": "user", "content": "Hello"}
        ]

        result = await provider.execute(
            model="gpt-5-nano",
            messages=messages,
            max_tokens=20
        )

        assert result.success is True
        # GPT-5-nano is very cheap, should be fractions of a cent
        assert result.cost_usd < 0.01  # Should be way less than 1 cent
        assert result.cost_usd > 0  # But should be greater than zero

    def test_all_listed_models_have_pricing(self, provider):
        """Verify all listed models have pricing configured."""
        models = provider.list_models()

        for model in models:
            # Calculate cost with dummy tokens
            cost = provider._calculate_cost(model, 1000, 1000)
            # Should return a positive cost
            assert cost > 0, f"Model {model} returned zero cost"
