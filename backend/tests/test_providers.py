"""
Tests for model providers.
"""

import pytest
from backend.providers.base import ProviderConfig, ModelProvider
from backend.providers.anthropic_provider import AnthropicProvider


class TestProviderConfig:
    """Test provider configuration."""

    def test_provider_config_creation(self):
        """Test creating a provider config."""
        config = ProviderConfig(api_key="test_key")
        assert config.api_key == "test_key"
        assert config.timeout == 60  # default
        assert config.max_retries == 3  # default

    def test_provider_config_custom_values(self):
        """Test custom configuration values."""
        config = ProviderConfig(
            api_key="test_key", base_url="https://api.example.com", timeout=120, max_retries=5
        )
        assert config.api_key == "test_key"
        assert config.base_url == "https://api.example.com"
        assert config.timeout == 120
        assert config.max_retries == 5


class TestAnthropicProvider:
    """Test Anthropic provider."""

    def test_provider_initialization(self):
        """Test initializing Anthropic provider."""
        config = ProviderConfig(api_key="test_key")
        provider = AnthropicProvider(config)

        assert provider.provider_name == "anthropic"
        assert provider.config.api_key == "test_key"

    def test_list_models(self):
        """Test listing available models."""
        config = ProviderConfig(api_key="test_key")
        provider = AnthropicProvider(config)

        models = provider.list_models()
        assert len(models) > 0
        assert "claude-3-5-sonnet-20241022" in models
        assert "claude-3-opus-20240229" in models

    def test_cost_calculation(self):
        """Test cost calculation for different models."""
        config = ProviderConfig(api_key="test_key")
        provider = AnthropicProvider(config)

        # Test Sonnet pricing
        cost = provider._calculate_cost("claude-3-5-sonnet-20241022", 1000, 500)
        expected_cost = (1000 / 1_000_000) * 3.0 + (500 / 1_000_000) * 15.0
        assert cost == pytest.approx(expected_cost, rel=1e-6)

        # Test Opus pricing
        cost = provider._calculate_cost("claude-3-opus-20240229", 1000, 500)
        expected_cost = (1000 / 1_000_000) * 15.0 + (500 / 1_000_000) * 75.0
        assert cost == pytest.approx(expected_cost, rel=1e-6)

    @pytest.mark.asyncio
    async def test_execute_without_api_key(self):
        """Test execution fails gracefully without valid API key."""
        config = ProviderConfig(api_key="invalid_key")
        provider = AnthropicProvider(config)

        result = await provider.execute(
            model="claude-3-5-sonnet-20241022",
            messages=[{"role": "user", "content": "Hello"}],
        )

        # Should return an error result, not raise exception
        assert result.success is False
        assert result.error is not None
