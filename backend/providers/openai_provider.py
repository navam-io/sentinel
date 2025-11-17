"""
OpenAI provider implementation.
"""

import time
from typing import Any, Dict, List, Optional
from openai import AsyncOpenAI
from .base import ModelProvider, ProviderConfig, ExecutionResult


class OpenAIProvider(ModelProvider):
    """Provider for OpenAI's GPT models."""

    AVAILABLE_MODELS = [
        # OpenAI Frontier Models (Latest, Recommended)
        "gpt-5.1",                         # GPT-5.1 (Best for coding and agentic tasks)
        "gpt-5-pro",                       # GPT-5 Pro (Smarter, more precise responses)
        "gpt-5",                           # GPT-5 (Previous reasoning model)
        "gpt-5-mini",                      # GPT-5 Mini (Faster, cost-efficient)
        "gpt-5-nano",                      # GPT-5 Nano (Fastest, most cost-efficient)

        # OpenAI Non-Reasoning Models
        "gpt-4.1",                         # GPT-4.1 (Smartest non-reasoning model)
        "gpt-4o",                          # GPT-4o (Multimodal)
        "gpt-4o-mini",                     # GPT-4o Mini (Fast, affordable)
    ]

    def __init__(self, config: ProviderConfig):
        """Initialize OpenAI provider.

        Args:
            config: Provider configuration with API key
        """
        super().__init__(config)
        self.client = AsyncOpenAI(api_key=config.api_key, timeout=config.timeout)

    @property
    def provider_name(self) -> str:
        """Get provider name."""
        return "openai"

    def list_models(self) -> List[str]:
        """List available GPT models.

        Returns:
            List of GPT model identifiers
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
        """Execute a test against a GPT model.

        Args:
            model: GPT model identifier
            messages: List of messages (supports system, user, assistant)
            temperature: Sampling temperature (0.0-2.0 for GPT)
            max_tokens: Maximum tokens to generate (default 1024)
            tools: Available tools for the model
            **kwargs: Additional parameters (top_p, frequency_penalty, presence_penalty, etc.)

        Returns:
            ExecutionResult with response and metrics
        """
        start_time = time.time()

        try:
            # Build request parameters
            request_params: Dict[str, Any] = {
                "model": model,
                "messages": messages,
                "temperature": min(max(temperature, 0.0), 2.0),  # GPT: 0.0-2.0
            }

            # Add max_tokens if specified
            if max_tokens:
                request_params["max_tokens"] = max_tokens

            # Add tools if present
            if tools:
                request_params["tools"] = tools

            # Add optional parameters (only if not None)
            if "top_p" in kwargs and kwargs["top_p"] is not None:
                request_params["top_p"] = kwargs["top_p"]
            if "frequency_penalty" in kwargs and kwargs["frequency_penalty"] is not None:
                request_params["frequency_penalty"] = kwargs["frequency_penalty"]
            if "presence_penalty" in kwargs and kwargs["presence_penalty"] is not None:
                request_params["presence_penalty"] = kwargs["presence_penalty"]
            if "stop" in kwargs and kwargs["stop"] is not None:
                request_params["stop"] = kwargs["stop"]

            # Call OpenAI API
            response = await self.client.chat.completions.create(**request_params)

            # Calculate latency
            latency_ms = int((time.time() - start_time) * 1000)

            # Extract response text and tool calls
            message = response.choices[0].message
            output_text = message.content or ""
            tool_calls = []

            if message.tool_calls:
                for tool_call in message.tool_calls:
                    tool_calls.append(
                        {
                            "id": tool_call.id,
                            "name": tool_call.function.name,
                            "arguments": tool_call.function.arguments,
                        }
                    )

            # Calculate cost (approximate pricing)
            cost_usd = self._calculate_cost(
                model, response.usage.prompt_tokens, response.usage.completion_tokens
            )

            return ExecutionResult(
                success=True,
                output=output_text,
                model=model,
                provider=self.provider_name,
                latency_ms=latency_ms,
                tokens_input=response.usage.prompt_tokens,
                tokens_output=response.usage.completion_tokens,
                cost_usd=cost_usd,
                tool_calls=tool_calls,
                raw_response={
                    "id": response.id,
                    "object": response.object,
                    "created": response.created,
                    "finish_reason": response.choices[0].finish_reason,
                    "message": {
                        "role": message.role,
                        "content": message.content,
                    },
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
        - GPT-5.1: $3.00/MTok input, $12/MTok output
        - GPT-5 Pro: $4.00/MTok input, $16/MTok output
        - GPT-5: $2.50/MTok input, $10/MTok output
        - GPT-5 Mini: $0.30/MTok input, $1.20/MTok output
        - GPT-5 Nano: $0.10/MTok input, $0.40/MTok output
        - GPT-4.1: $2.50/MTok input, $10/MTok output
        - GPT-4o: $2.50/MTok input, $10/MTok output
        - GPT-4o Mini: $0.15/MTok input, $0.60/MTok output

        Args:
            model: Model identifier
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens

        Returns:
            Cost in USD
        """
        # Pricing per million tokens (input, output)
        pricing = {
            # OpenAI Frontier Models
            "gpt-5.1": (3.00, 12.0),
            "gpt-5-pro": (4.00, 16.0),
            "gpt-5": (2.50, 10.0),
            "gpt-5-mini": (0.30, 1.20),
            "gpt-5-nano": (0.10, 0.40),

            # OpenAI Non-Reasoning Models
            "gpt-4.1": (2.50, 10.0),
            "gpt-4o": (2.50, 10.0),
            "gpt-4o-mini": (0.15, 0.60),
        }

        input_price, output_price = pricing.get(model, (3.00, 12.0))  # Default to GPT-5.1 pricing

        input_cost = (input_tokens / 1_000_000) * input_price
        output_cost = (output_tokens / 1_000_000) * output_price

        return round(input_cost + output_cost, 6)
