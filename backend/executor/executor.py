"""
Core test execution engine.
"""

from typing import Dict, Optional
from pydantic import BaseModel
from ..core.schema import TestSpec, InputSpec
from ..providers.base import ModelProvider, ExecutionResult, ProviderConfig
from ..providers.anthropic_provider import AnthropicProvider
from ..providers.openai_provider import OpenAIProvider


class ExecutorConfig(BaseModel):
    """Configuration for the test executor."""

    anthropic_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None


class TestExecutor:
    """Executes tests against model providers."""

    def __init__(self, config: ExecutorConfig):
        """Initialize the executor with provider configurations.

        Args:
            config: Executor configuration with API keys
        """
        self.config = config
        self.providers: Dict[str, ModelProvider] = {}

        # Initialize Anthropic provider if API key is provided
        if config.anthropic_api_key:
            anthropic_config = ProviderConfig(api_key=config.anthropic_api_key)
            self.providers["anthropic"] = AnthropicProvider(anthropic_config)

        # Initialize OpenAI provider if API key is provided
        if config.openai_api_key:
            openai_config = ProviderConfig(api_key=config.openai_api_key)
            self.providers["openai"] = OpenAIProvider(openai_config)

    def _get_provider_for_model(self, model: str) -> Optional[ModelProvider]:
        """Get the appropriate provider for a model.

        Args:
            model: Model identifier

        Returns:
            ModelProvider instance or None if not found
        """
        # Anthropic models
        if model.startswith("claude-"):
            return self.providers.get("anthropic")

        # OpenAI models
        if model.startswith("gpt-"):
            return self.providers.get("openai")

        return None

    def _build_messages_from_input(self, inputs: InputSpec) -> list[Dict[str, str]]:
        """Build messages array from InputSpec.

        Args:
            inputs: Input specification

        Returns:
            List of messages for the provider
        """
        messages = []

        # Add system message if present
        if inputs.system_prompt:
            messages.append({"role": "system", "content": inputs.system_prompt})

        # Add conversation messages if present
        if inputs.messages:
            for msg in inputs.messages:
                messages.append({"role": msg.role, "content": msg.content})
        # Otherwise use simple query
        elif inputs.query:
            messages.append({"role": "user", "content": inputs.query})
        else:
            raise ValueError("Input must have either 'query' or 'messages'")

        return messages

    async def execute(self, test_spec: TestSpec) -> ExecutionResult:
        """Execute a test specification.

        Args:
            test_spec: Test specification to execute

        Returns:
            ExecutionResult with output and metrics

        Raises:
            ValueError: If provider is not configured or model is not supported
        """
        # Get provider for the model
        provider = self._get_provider_for_model(test_spec.model)
        if not provider:
            raise ValueError(
                f"No provider configured for model '{test_spec.model}'. "
                f"Please configure the appropriate API key."
            )

        # Build messages from inputs
        messages = self._build_messages_from_input(test_spec.inputs)

        # Extract model config parameters
        temperature = 0.7  # Default
        max_tokens = None
        top_p = None
        top_k = None
        stop_sequences = None

        if test_spec.model_config_params:
            # Access model_config_params (the actual field name, not the alias)
            model_cfg = test_spec.model_config_params
            temperature = model_cfg.temperature or 0.7
            max_tokens = model_cfg.max_tokens
            top_p = model_cfg.top_p
            top_k = model_cfg.top_k
            stop_sequences = model_cfg.stop_sequences

        # Convert tools to provider format
        tools = None
        if test_spec.tools:
            tools = []
            for tool in test_spec.tools:
                if isinstance(tool, str):
                    # Simple string tool - create basic spec
                    tools.append({"name": tool, "description": f"{tool} tool"})
                else:
                    # Full tool specification
                    tool_dict = {"name": tool.name}
                    if tool.description:
                        tool_dict["description"] = tool.description
                    if tool.parameters:
                        tool_dict["input_schema"] = tool.parameters
                    tools.append(tool_dict)

        # Execute the test
        result = await provider.execute(
            model=test_spec.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            tools=tools,
            top_p=top_p,
            top_k=top_k,
            stop_sequences=stop_sequences,
        )

        return result
