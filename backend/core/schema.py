"""
Pydantic models for Sentinel test specifications.

This module defines the schema for YAML/JSON test specifications that can be:
1. Generated from the visual canvas (Visual → DSL)
2. Imported to the visual canvas (DSL → Visual)
3. Edited directly in code mode
4. Version controlled in git
5. Run in CI/CD pipelines
"""

from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator, model_validator

# ============================================================================
# Model Configuration
# ============================================================================


class ModelConfig(BaseModel):
    """Model-specific configuration parameters.

    Example:
        ```yaml
        model_config:
          temperature: 0.7
          max_tokens: 1000
          top_p: 0.9
        ```
    """

    temperature: float | None = Field(
        None, ge=0.0, le=2.0, description="Sampling temperature (0.0-2.0)"
    )
    max_tokens: int | None = Field(None, gt=0, description="Maximum tokens to generate")
    top_p: float | None = Field(None, ge=0.0, le=1.0, description="Nucleus sampling threshold")
    top_k: int | None = Field(None, gt=0, description="Top-k sampling parameter")
    stop_sequences: list[str] | None = Field(None, description="Sequences that stop generation")


# ============================================================================
# Tool Specifications
# ============================================================================


class ToolSpec(BaseModel):
    """Specification for an available tool.

    Can be specified as:
    1. Simple string: "browser"
    2. Full specification with parameters

    Example:
        ```yaml
        tools:
          - browser  # Simple form
          - name: "web_search"  # Full form
            description: "Search the web"
            parameters:
              type: "object"
              properties:
                query:
                  type: "string"
        ```
    """

    name: str = Field(..., min_length=1, description="Tool identifier")
    description: str | None = Field(None, description="Human-readable description")
    parameters: dict[str, Any] | None = Field(None, description="JSON Schema for parameters")


# ============================================================================
# Input Specifications
# ============================================================================


class Message(BaseModel):
    """A single message in a conversation."""

    role: Literal["user", "assistant", "system"] = Field(..., description="Message role")
    content: str = Field(..., min_length=1, description="Message content")


class InputSpec(BaseModel):
    """Input parameters for a test case.

    At least one field must be provided.

    Example:
        ```yaml
        # Simple query
        inputs:
          query: "What is 2+2?"

        # Multi-turn conversation
        inputs:
          messages:
            - role: "user"
              content: "Hello"
            - role: "assistant"
              content: "Hi there!"
          system_prompt: "You are helpful"

        # With context
        inputs:
          query: "User info"
          context:
            user_id: "123"
            tier: "premium"
        ```
    """

    query: str | None = Field(None, description="Primary query/prompt")
    messages: list[Message] | None = Field(None, description="Conversation history")
    system_prompt: str | None = Field(None, description="System instructions")
    context: dict[str, Any] | None = Field(None, description="Additional context data")

    @model_validator(mode="after")
    def check_at_least_one_input(self) -> "InputSpec":
        """Ensure at least one input field is provided."""
        if not any([self.query, self.messages, self.system_prompt, self.context]):
            raise ValueError(
                "At least one input field (query, messages, system_prompt, or context) must be provided"
            )
        return self


# ============================================================================
# Assertion Types
# ============================================================================


# Note: Assertions are stored as dictionaries to allow flexible validation
# Each assertion type is validated at execution time, not parse time
# This allows the DSL to be extensible and forward-compatible


# ============================================================================
# Test Specification
# ============================================================================


class TestSpec(BaseModel):
    """Complete test specification for an agent or LLM test case.

    This is the core model that represents a single test. It can be:
    - Generated from visual canvas nodes
    - Imported from YAML/JSON files
    - Edited in Monaco editor
    - Executed by the test runner

    Example:
        ```yaml
        name: "Product Search Test"
        model: "claude-3-5-sonnet-20241022"
        provider: "anthropic"
        seed: 42

        tools:
          - browser
          - calculator

        inputs:
          query: "Find laptops under $1000"

        assertions:
          - must_call_tool: ["browser"]
          - must_contain: "price"
          - output_type: "json"
          - max_latency_ms: 5000

        tags:
          - e2e
          - shopping
        ```
    """

    # Required fields
    name: str = Field(..., min_length=1, description="Test case name")
    model: str = Field(
        ...,
        min_length=1,
        description="Model identifier (e.g., 'gpt-4', 'claude-3-5-sonnet-20241022')",
    )
    inputs: InputSpec = Field(..., description="Test inputs")
    assertions: list[dict[str, Any]] = Field(..., min_length=1, description="Validation assertions")

    # Optional metadata
    description: str | None = Field(None, description="Detailed test description")
    tags: list[str] | None = Field(None, description="Categorization tags")

    # Model configuration
    provider: str | None = Field(
        None, description="Model provider (anthropic, openai, bedrock, etc.)"
    )
    seed: int | None = Field(None, description="Random seed for deterministic execution")
    model_config_params: ModelConfig | None = Field(
        None, alias="model_config", description="Model parameters"
    )

    # Tools and frameworks
    tools: list[str | ToolSpec] | None = Field(None, description="Available tools")
    framework: str | None = Field(
        None, description="Agentic framework (langgraph, claude_sdk, etc.)"
    )
    framework_config: dict[str, Any] | None = Field(
        None, description="Framework-specific configuration"
    )

    # Execution settings
    timeout_ms: int | None = Field(
        None, gt=0, description="Maximum execution timeout in milliseconds"
    )

    @field_validator("tools")
    @classmethod
    def validate_tools(cls, v: list[str | ToolSpec] | None) -> list[str | ToolSpec] | None:
        """Validate tools field."""
        if v is None:
            return v

        # Convert string tools to ToolSpec objects for consistency
        result = []
        for tool in v:
            if isinstance(tool, str):
                result.append(tool)
            elif isinstance(tool, dict):
                # This handles the case where tools are provided as dicts in YAML
                result.append(ToolSpec(**tool))
            else:
                result.append(tool)
        return result

    @model_validator(mode="after")
    def check_framework_requires_tools(self) -> "TestSpec":
        """Ensure framework specification includes tools."""
        if self.framework and not self.tools:
            raise ValueError("framework requires tools to be specified")
        return self

    model_config = {
        "populate_by_name": True,  # Allow both "model_config" and "model_config_params"
    }


# ============================================================================
# Test Suite
# ============================================================================


class TestSuite(BaseModel):
    """Collection of test specifications with shared metadata.

    Example:
        ```yaml
        name: "E-commerce Test Suite"
        version: "1.0.0"

        defaults:
          model: "claude-3-5-sonnet-20241022"
          provider: "anthropic"
          timeout_ms: 30000

        tests:
          - name: "Product search"
            seed: 100
            inputs:
              query: "Find laptops"
            assertions:
              - must_contain: "price"

          - name: "Product comparison"
            seed: 101
            inputs:
              query: "Compare top 2 laptops"
            assertions:
              - must_contain: "comparison"
        ```
    """

    # Required fields
    name: str = Field(..., min_length=1, description="Suite name")
    tests: list[TestSpec] = Field(..., min_length=1, description="List of test specifications")

    # Optional metadata
    description: str | None = Field(None, description="Suite description")
    version: str | None = Field(None, description="Suite version")
    tags: list[str] | None = Field(None, description="Suite-level tags")

    # Defaults applied to all tests (metadata only, not actually applied by the model)
    defaults: dict[str, Any] | None = Field(None, description="Default values for tests")


# ============================================================================
# Type Aliases
# ============================================================================


TestSpecOrSuite = TestSpec | TestSuite
"""A test specification or test suite."""
