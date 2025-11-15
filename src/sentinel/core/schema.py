"""Pydantic models for test specification schema.

This module defines the data models for Sentinel test specifications,
providing validation and type safety for test case definitions.
"""

from typing import Any, Dict, List, Literal, Optional, Union

from pydantic import BaseModel, Field, field_validator, model_validator


class MustContainAssertion(BaseModel):
    """Assertion that output must contain specific strings."""

    must_contain: Union[str, List[str]] = Field(
        ...,
        description="String or list of strings that must appear in the output",
    )

    @field_validator("must_contain")
    @classmethod
    def validate_must_contain(cls, v: Union[str, List[str]]) -> List[str]:
        """Ensure must_contain is always a list."""
        if isinstance(v, str):
            return [v]
        return v


class MustCallToolAssertion(BaseModel):
    """Assertion that specific tools must be called."""

    must_call_tool: Union[str, List[str]] = Field(
        ...,
        description="Tool name or list of tool names that must be called",
    )

    @field_validator("must_call_tool")
    @classmethod
    def validate_must_call_tool(cls, v: Union[str, List[str]]) -> List[str]:
        """Ensure must_call_tool is always a list."""
        if isinstance(v, str):
            return [v]
        return v


class MaxLatencyAssertion(BaseModel):
    """Assertion for maximum allowed latency."""

    max_latency_ms: int = Field(
        ...,
        gt=0,
        description="Maximum allowed latency in milliseconds",
    )


class OutputTypeAssertion(BaseModel):
    """Assertion for expected output format."""

    output_type: Literal["json", "text", "markdown", "code", "structured"] = Field(
        ...,
        description="Expected output format type",
    )


class MustNotContainAssertion(BaseModel):
    """Assertion that output must NOT contain specific strings."""

    must_not_contain: Union[str, List[str]] = Field(
        ...,
        description="String or list of strings that must NOT appear in the output",
    )

    @field_validator("must_not_contain")
    @classmethod
    def validate_must_not_contain(cls, v: Union[str, List[str]]) -> List[str]:
        """Ensure must_not_contain is always a list."""
        if isinstance(v, str):
            return [v]
        return v


class MinTokensAssertion(BaseModel):
    """Assertion for minimum token count in output."""

    min_tokens: int = Field(
        ...,
        gt=0,
        description="Minimum number of tokens in output",
    )


class MaxTokensAssertion(BaseModel):
    """Assertion for maximum token count in output."""

    max_tokens: int = Field(
        ...,
        gt=0,
        description="Maximum number of tokens in output",
    )


class RegexMatchAssertion(BaseModel):
    """Assertion that output must match a regex pattern."""

    regex_match: str = Field(
        ...,
        description="Regular expression pattern that output must match",
    )


# Union type for all assertion types
AssertionSpec = Union[
    MustContainAssertion,
    MustCallToolAssertion,
    MaxLatencyAssertion,
    OutputTypeAssertion,
    MustNotContainAssertion,
    MinTokensAssertion,
    MaxTokensAssertion,
    RegexMatchAssertion,
]


class ToolSpec(BaseModel):
    """Specification for a tool available to the agent."""

    name: str = Field(..., description="Tool name identifier")
    description: Optional[str] = Field(None, description="Human-readable tool description")
    parameters: Optional[Dict[str, Any]] = Field(
        None,
        description="Tool parameter schema (JSON Schema format)",
    )


class InputSpec(BaseModel):
    """Input parameters for the test case."""

    query: Optional[str] = Field(None, description="Primary query or prompt")
    messages: Optional[List[Dict[str, str]]] = Field(
        None,
        description="Conversation history for multi-turn scenarios",
    )
    system_prompt: Optional[str] = Field(None, description="System prompt override")
    context: Optional[Dict[str, Any]] = Field(
        None,
        description="Additional context variables",
    )

    @model_validator(mode="after")
    def validate_input_has_content(self) -> "InputSpec":
        """Ensure at least one input field is provided."""
        if not any([self.query, self.messages, self.system_prompt, self.context]):
            raise ValueError("At least one input field (query, messages, etc.) must be provided")
        return self


class ModelConfig(BaseModel):
    """Model-specific configuration parameters."""

    temperature: Optional[float] = Field(None, ge=0.0, le=2.0, description="Sampling temperature")
    max_tokens: Optional[int] = Field(None, gt=0, description="Maximum tokens to generate")
    top_p: Optional[float] = Field(None, ge=0.0, le=1.0, description="Nucleus sampling threshold")
    top_k: Optional[int] = Field(None, gt=0, description="Top-k sampling parameter")
    stop_sequences: Optional[List[str]] = Field(None, description="Sequences that stop generation")


class TestSpec(BaseModel):
    """Complete test specification for an agent or LLM test case.

    This is the root model for Sentinel test specifications, defining all
    parameters needed for deterministic, reproducible testing.
    """

    name: str = Field(..., description="Human-readable test case name", min_length=1)
    description: Optional[str] = Field(None, description="Detailed test case description")

    # Model and execution configuration
    model: str = Field(
        ...,
        description="Model identifier (e.g., 'claude-3-5-sonnet-20241022', 'gpt-4')",
        min_length=1,
    )
    provider: Optional[str] = Field(
        None,
        description="Model provider (e.g., 'anthropic', 'openai', 'bedrock')",
    )
    seed: Optional[int] = Field(
        None,
        description="Random seed for deterministic execution",
    )
    model_config_params: Optional[ModelConfig] = Field(
        None,
        alias="model_config",
        description="Model-specific configuration parameters",
    )

    # Tools and frameworks
    tools: Optional[List[Union[str, ToolSpec]]] = Field(
        None,
        description="Available tools (simple names or full specifications)",
    )
    framework: Optional[str] = Field(
        None,
        description="Agentic framework identifier (e.g., 'langgraph', 'claude_sdk')",
    )
    framework_config: Optional[Dict[str, Any]] = Field(
        None,
        description="Framework-specific configuration",
    )

    # Inputs
    inputs: InputSpec = Field(..., description="Input parameters for the test case")

    # Assertions
    assertions: List[Dict[str, Any]] = Field(
        ...,
        min_length=1,
        description="Validation assertions for the test output",
    )

    # Metadata
    tags: Optional[List[str]] = Field(None, description="Tags for categorization and filtering")
    timeout_ms: Optional[int] = Field(
        None,
        gt=0,
        description="Maximum execution timeout in milliseconds",
    )

    class Config:
        """Pydantic model configuration."""

        populate_by_name = True
        json_schema_extra = {
            "example": {
                "name": "Browser agent - Amazon product research",
                "description": "Test agent's ability to research products with price constraints",
                "model": "claude-3-5-sonnet-20241022",
                "provider": "anthropic",
                "seed": 42,
                "tools": ["browser", "scraper", "calculator"],
                "inputs": {"query": "Find top 3 laptops under $1000"},
                "assertions": [
                    {"must_contain": "price"},
                    {"must_call_tool": "browser"},
                    {"max_latency_ms": 9000},
                    {"output_type": "json"},
                ],
                "tags": ["e2e", "browser", "shopping"],
            }
        }

    @field_validator("tools")
    @classmethod
    def validate_tools(cls, v: Optional[List[Union[str, ToolSpec]]]) -> Optional[List[ToolSpec]]:
        """Convert string tool names to ToolSpec objects."""
        if v is None:
            return None

        result = []
        for tool in v:
            if isinstance(tool, str):
                result.append(ToolSpec(name=tool))
            else:
                result.append(tool)
        return result

    @model_validator(mode="after")
    def validate_framework_requirements(self) -> "TestSpec":
        """Validate framework-specific requirements."""
        if self.framework and not self.tools:
            raise ValueError(
                f"Framework '{self.framework}' specified but no tools provided. "
                "Agentic frameworks typically require tools."
            )
        return self


class TestSuite(BaseModel):
    """Collection of related test specifications.

    Test suites allow grouping multiple test specs together with shared
    configuration and metadata.
    """

    name: str = Field(..., description="Test suite name", min_length=1)
    description: Optional[str] = Field(None, description="Test suite description")
    version: Optional[str] = Field(None, description="Suite version")
    defaults: Optional[Dict[str, Any]] = Field(
        None,
        description="Default values applied to all tests in the suite",
    )
    tests: List[TestSpec] = Field(
        ...,
        min_length=1,
        description="List of test specifications",
    )
    tags: Optional[List[str]] = Field(None, description="Suite-level tags")

    class Config:
        """Pydantic model configuration."""

        json_schema_extra = {
            "example": {
                "name": "E-commerce Agent Test Suite",
                "version": "1.0.0",
                "defaults": {
                    "model": "claude-3-5-sonnet-20241022",
                    "provider": "anthropic",
                    "timeout_ms": 30000,
                },
                "tests": [
                    {
                        "name": "Product search test",
                        "inputs": {"query": "Find laptops under $1000"},
                        "assertions": [{"must_contain": "price"}],
                    }
                ],
            }
        }
