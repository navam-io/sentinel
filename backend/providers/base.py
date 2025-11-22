"""
Base provider interface for all model providers.
"""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any

from pydantic import BaseModel


class ProviderConfig(BaseModel):
    """Configuration for a model provider."""

    api_key: str
    base_url: str | None = None
    timeout: int = 60
    max_retries: int = 3


class ExecutionResult(BaseModel):
    """Result of executing a test against a model."""

    success: bool
    output: str
    model: str
    provider: str
    latency_ms: int
    tokens_input: int | None = None
    tokens_output: int | None = None
    cost_usd: float | None = None
    tool_calls: list[dict[str, Any]] = []
    error: str | None = None
    timestamp: str = datetime.now().isoformat()
    raw_response: dict[str, Any] | None = None


class ModelProvider(ABC):
    """Abstract base class for all model providers."""

    def __init__(self, config: ProviderConfig):
        """Initialize the provider with configuration.

        Args:
            config: Provider configuration including API keys
        """
        self.config = config

    @abstractmethod
    async def execute(
        self,
        model: str,
        messages: list[dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int | None = None,
        tools: list[dict[str, Any]] | None = None,
        **kwargs,
    ) -> ExecutionResult:
        """Execute a test against the model.

        Args:
            model: Model identifier (e.g., "claude-3-5-sonnet-20241022")
            messages: List of messages in the conversation
            temperature: Sampling temperature (0.0-2.0)
            max_tokens: Maximum tokens to generate
            tools: Available tools for the model
            **kwargs: Additional provider-specific parameters

        Returns:
            ExecutionResult with output, metrics, and metadata
        """
        pass

    @abstractmethod
    def list_models(self) -> list[str]:
        """List available models for this provider.

        Returns:
            List of model identifiers
        """
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Get the provider name.

        Returns:
            Provider name (e.g., "anthropic", "openai")
        """
        pass
