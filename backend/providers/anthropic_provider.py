"""
Anthropic (Claude) provider implementation.
"""

import time
from typing import Any, Dict, List, Optional
from anthropic import Anthropic, AsyncAnthropic
from .base import ModelProvider, ProviderConfig, ExecutionResult


class AnthropicProvider(ModelProvider):
    """Provider for Anthropic's Claude models."""

    AVAILABLE_MODELS = [
        # Latest (Recommended - Claude 4.x)
        "claude-sonnet-4-5-20250929",      # Claude Sonnet 4.5 (Latest, best balance)
        "claude-haiku-4-5-20251001",       # Claude Haiku 4.5 (Fast, cost-effective)
        "claude-opus-4-1-20250805",        # Claude Opus 4.1 (Most capable)
    ]

    def __init__(self, config: ProviderConfig):
        """Initialize Anthropic provider.

        Args:
            config: Provider configuration with API key
        """
        super().__init__(config)
        self.client = AsyncAnthropic(api_key=config.api_key, timeout=config.timeout)

    @property
    def provider_name(self) -> str:
        """Get provider name."""
        return "anthropic"

    def list_models(self) -> List[str]:
        """List available Claude models.

        Returns:
            List of Claude model identifiers
        """
        return self.AVAILABLE_MODELS

    async def execute(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
        **kwargs,
    ) -> ExecutionResult:
        """Execute a test against a Claude model.

        Args:
            model: Claude model identifier
            messages: List of messages (must have at least one user message)
            temperature: Sampling temperature (0.0-1.0 for Claude)
            max_tokens: Maximum tokens to generate (default 1024)
            tools: Available tools for the model
            **kwargs: Additional parameters (top_p, top_k, stop_sequences, etc.)

        Returns:
            ExecutionResult with response and metrics
        """
        start_time = time.time()

        try:
            # Separate system message from conversation messages
            system_message = None
            conversation_messages = []

            for msg in messages:
                if msg["role"] == "system":
                    system_message = msg["content"]
                else:
                    conversation_messages.append({"role": msg["role"], "content": msg["content"]})

            # Ensure we have at least one user message
            if not conversation_messages or conversation_messages[0]["role"] != "user":
                raise ValueError("Conversation must start with a user message")

            # Build request parameters
            request_params: Dict[str, Any] = {
                "model": model,
                "messages": conversation_messages,
                "max_tokens": max_tokens or 1024,
                "temperature": min(max(temperature, 0.0), 1.0),  # Claude: 0.0-1.0
            }

            # Add system message if present
            if system_message:
                request_params["system"] = system_message

            # Add tools if present
            if tools:
                request_params["tools"] = tools

            # Add optional parameters (only if not None)
            if "top_p" in kwargs and kwargs["top_p"] is not None:
                request_params["top_p"] = kwargs["top_p"]
            if "top_k" in kwargs and kwargs["top_k"] is not None:
                request_params["top_k"] = kwargs["top_k"]
            if "stop_sequences" in kwargs and kwargs["stop_sequences"] is not None:
                request_params["stop_sequences"] = kwargs["stop_sequences"]

            # Call Anthropic API
            response = await self.client.messages.create(**request_params)

            # Calculate latency
            latency_ms = int((time.time() - start_time) * 1000)

            # Extract response text
            output_text = ""
            tool_calls = []

            for content_block in response.content:
                if content_block.type == "text":
                    output_text += content_block.text
                elif content_block.type == "tool_use":
                    tool_calls.append(
                        {
                            "id": content_block.id,
                            "name": content_block.name,
                            "input": content_block.input,
                        }
                    )

            # Calculate cost (approximate pricing)
            cost_usd = self._calculate_cost(
                model, response.usage.input_tokens, response.usage.output_tokens
            )

            return ExecutionResult(
                success=True,
                output=output_text,
                model=model,
                provider=self.provider_name,
                latency_ms=latency_ms,
                tokens_input=response.usage.input_tokens,
                tokens_output=response.usage.output_tokens,
                cost_usd=cost_usd,
                tool_calls=tool_calls,
                raw_response={
                    "id": response.id,
                    "type": response.type,
                    "role": response.role,
                    "stop_reason": response.stop_reason,
                    "content": [
                        {
                            "type": block.type,
                            "text": block.text if block.type == "text" else None,
                        }
                        for block in response.content
                    ],
                },
            )

        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            return ExecutionResult(
                success=False,
                output="",
                model=model,
                provider=self.provider_name,
                latency_ms=latency_ms,
                error=str(e),
            )

    def _calculate_cost(self, model: str, input_tokens: int, output_tokens: int) -> float:
        """Calculate approximate cost in USD.

        Pricing as of November 2025 (subject to change):
        - Claude Sonnet 4.5: $3/MTok input, $15/MTok output
        - Claude Haiku 4.5: $1/MTok input, $5/MTok output
        - Claude Opus 4.1: $15/MTok input, $75/MTok output
        - Claude Sonnet 4: $3/MTok input, $15/MTok output
        - Claude Opus 4: $15/MTok input, $75/MTok output
        - Claude Sonnet 3.7: $3/MTok input, $15/MTok output
        - Claude Haiku 3.5: $0.80/MTok input, $4/MTok output
        - Claude Haiku 3: $0.25/MTok input, $1.25/MTok output (Deprecated)

        Args:
            model: Model identifier
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens

        Returns:
            Cost in USD
        """
        # Pricing per million tokens (input, output)
        pricing = {
            # Latest (Claude 4.x)
            "claude-sonnet-4-5-20250929": (3.0, 15.0),
            "claude-haiku-4-5-20251001": (1.0, 5.0),
            "claude-opus-4-1-20250805": (15.0, 75.0),

            # Legacy (Still Available)
            "claude-sonnet-4-20250514": (3.0, 15.0),
            "claude-opus-4-20250514": (15.0, 75.0),
            "claude-3-7-sonnet-20250219": (3.0, 15.0),
            "claude-3-5-haiku-20241022": (0.80, 4.0),

            # Deprecated
            "claude-3-haiku-20240307": (0.25, 1.25),

            # Legacy models (for backward compatibility)
            "claude-3-5-sonnet-20241022": (3.0, 15.0),
            "claude-3-opus-20240229": (15.0, 75.0),
            "claude-3-sonnet-20240229": (3.0, 15.0),
        }

        input_price, output_price = pricing.get(model, (3.0, 15.0))  # Default to Sonnet pricing

        input_cost = (input_tokens / 1_000_000) * input_price
        output_cost = (output_tokens / 1_000_000) * output_price

        return round(input_cost + output_cost, 6)
