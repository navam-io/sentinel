"""
Model provider implementations for Sentinel.

Provides a pluggable architecture for different AI model providers.
"""

from .anthropic_provider import AnthropicProvider
from .base import ExecutionResult, ModelProvider, ProviderConfig
from .openai_provider import OpenAIProvider

__all__ = [
    "ModelProvider",
    "ProviderConfig",
    "ExecutionResult",
    "AnthropicProvider",
    "OpenAIProvider",
]
