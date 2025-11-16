# Schema Reference

Detailed reference for Sentinel Pydantic models and validation.

## Table of Contents

- [Overview](#overview)
- [Pydantic Models](#pydantic-models)
- [Field Validation](#field-validation)
- [Custom Validators](#custom-validators)
- [Serialization](#serialization)
- [Type Safety](#type-safety)

## Overview

Sentinel uses [Pydantic v2](https://docs.pydantic.dev/) for schema validation and type safety.

### Benefits

- **Type Safety**: Automatic validation of field types
- **Clear Errors**: Descriptive validation error messages
- **IDE Support**: Autocomplete and type checking
- **Serialization**: Built-in JSON/dict conversion
- **Documentation**: Self-documenting schemas

### Location

All schema models are defined in:
```
backend/core/schema.py
```

## Pydantic Models

### ModelConfig

Model configuration parameters.

```python
class ModelConfig(BaseModel):
    """Model-specific configuration parameters."""

    temperature: Optional[float] = Field(None, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(None, gt=0)
    top_p: Optional[float] = Field(None, ge=0.0, le=1.0)
    top_k: Optional[int] = Field(None, gt=0)
    stop_sequences: Optional[List[str]] = None
```

**Field Constraints:**
- `temperature`: 0.0 ≤ value ≤ 2.0
- `max_tokens`: value > 0
- `top_p`: 0.0 ≤ value ≤ 1.0
- `top_k`: value > 0

**Example Usage:**
```python
from backend.core.schema import ModelConfig

# Valid
config = ModelConfig(temperature=0.7, max_tokens=2000)

# Invalid - will raise ValidationError
config = ModelConfig(temperature=3.0)  # > 2.0
config = ModelConfig(max_tokens=-100)  # < 0
```

---

### ToolSpec

Tool specification for agents.

```python
class ToolSpec(BaseModel):
    """Tool specification for agent capabilities."""

    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
```

**Field Constraints:**
- `name`: Required, minimum 1 character

**Example Usage:**
```python
from backend.core.schema import ToolSpec

# Simple tool
tool1 = ToolSpec(name="browser")

# Full specification
tool2 = ToolSpec(
    name="web_search",
    description="Search the web",
    parameters={
        "type": "object",
        "properties": {
            "query": {"type": "string"}
        },
        "required": ["query"]
    }
)
```

---

### Message

Conversation message.

```python
class Message(BaseModel):
    """A message in a conversation."""

    role: Literal["user", "assistant", "system"]
    content: str = Field(..., min_length=1)
```

**Field Constraints:**
- `role`: Must be exactly "user", "assistant", or "system"
- `content`: Required, minimum 1 character

**Example Usage:**
```python
from backend.core.schema import Message

# Valid messages
msg1 = Message(role="user", content="Hello")
msg2 = Message(role="assistant", content="Hi!")
msg3 = Message(role="system", content="You are helpful")

# Invalid - will raise ValidationError
msg = Message(role="bot", content="Hi")  # Invalid role
msg = Message(role="user", content="")    # Empty content
```

---

### InputSpec

Test input specification.

```python
class InputSpec(BaseModel):
    """Input specification for a test."""

    query: Optional[str] = None
    messages: Optional[List[Message]] = None
    system_prompt: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

    @model_validator(mode="after")
    def check_at_least_one_field(self) -> "InputSpec":
        """Ensure at least one input field is provided."""
        if not any([self.query, self.messages, self.system_prompt, self.context]):
            raise ValueError(
                "At least one of query, messages, system_prompt, or context must be provided"
            )
        return self
```

**Validation Rules:**
1. At least one field must be provided
2. `messages` must be a list of valid `Message` objects

**Example Usage:**
```python
from backend.core.schema import InputSpec, Message

# Valid - single field
input1 = InputSpec(query="Hello")

# Valid - multiple fields
input2 = InputSpec(
    query="Hello",
    system_prompt="Be helpful"
)

# Valid - messages
input3 = InputSpec(
    messages=[
        Message(role="user", content="Hi"),
        Message(role="assistant", content="Hello!")
    ]
)

# Invalid - no fields provided
input4 = InputSpec()  # Raises ValidationError
```

---

### TestSpec

Complete test specification.

```python
class TestSpec(BaseModel):
    """Complete test specification for an agent or LLM test case."""

    # Required fields
    name: str = Field(..., min_length=1)
    model: str = Field(..., min_length=1)
    inputs: InputSpec = Field(...)
    assertions: List[Dict[str, Any]] = Field(..., min_length=1)

    # Optional fields
    description: Optional[str] = None
    provider: Optional[str] = None
    tools: Optional[List[Union[str, ToolSpec]]] = None
    framework: Optional[str] = None
    framework_config: Optional[Dict[str, Any]] = None
    model_config: Optional[ModelConfig] = Field(None, alias="config")
    seed: Optional[int] = None
    timeout_ms: Optional[int] = Field(None, gt=0)
    tags: Optional[List[str]] = None

    @model_validator(mode="after")
    def check_framework_requires_tools(self) -> "TestSpec":
        """Ensure framework specification includes tools."""
        if self.framework and not self.tools:
            raise ValueError("framework requires tools to be specified")
        return self
```

**Field Constraints:**
- `name`: Required, minimum 1 character
- `model`: Required, minimum 1 character
- `inputs`: Required, must be valid InputSpec
- `assertions`: Required, minimum 1 assertion
- `timeout_ms`: Must be > 0 if provided
- `framework`: If provided, `tools` must also be provided

**Example Usage:**
```python
from backend.core.schema import TestSpec, InputSpec

# Minimal test
spec = TestSpec(
    name="My Test",
    model="gpt-4",
    inputs=InputSpec(query="Hello"),
    assertions=[{"output_type": "text"}]
)

# Complete test
spec = TestSpec(
    name="Complete Test",
    description="A comprehensive test",
    model="claude-3-5-sonnet-20241022",
    provider="anthropic",
    inputs=InputSpec(
        query="Research AI",
        system_prompt="Be thorough"
    ),
    assertions=[
        {"must_contain": "AI"},
        {"output_type": "structured"}
    ],
    tools=["web_search"],
    framework="langgraph",
    seed=42,
    timeout_ms=30000,
    tags=["research", "ai"]
)
```

---

### TestSuite

Collection of test specifications.

```python
class TestSuite(BaseModel):
    """A collection of test specifications with shared metadata."""

    name: str = Field(..., min_length=1)
    tests: List[TestSpec] = Field(..., min_length=1)
    description: Optional[str] = None
    version: Optional[str] = None
    defaults: Optional[ModelConfig] = None
    tags: Optional[List[str]] = None
```

**Field Constraints:**
- `name`: Required, minimum 1 character
- `tests`: Required, minimum 1 test

**Example Usage:**
```python
from backend.core.schema import TestSuite, TestSpec, InputSpec

suite = TestSuite(
    name="My Suite",
    version="1.0.0",
    tests=[
        TestSpec(
            name="Test 1",
            model="gpt-4",
            inputs=InputSpec(query="Q1"),
            assertions=[{"output_type": "text"}]
        ),
        TestSpec(
            name="Test 2",
            model="gpt-4",
            inputs=InputSpec(query="Q2"),
            assertions=[{"output_type": "text"}]
        )
    ],
    tags=["suite"]
)
```

## Field Validation

### Built-in Validators

Pydantic provides automatic validation for:

```python
# String length
name: str = Field(..., min_length=1)  # Non-empty string
name: str = Field(..., max_length=100)  # Max 100 chars

# Numeric ranges
temperature: float = Field(..., ge=0.0, le=2.0)  # 0.0 ≤ x ≤ 2.0
max_tokens: int = Field(..., gt=0)  # x > 0
top_p: float = Field(..., ge=0.0, le=1.0)  # 0.0 ≤ x ≤ 1.0

# List length
assertions: List[Dict] = Field(..., min_length=1)  # At least 1
tests: List[TestSpec] = Field(..., min_length=1)  # At least 1
```

### Optional Fields

```python
# All optional fields use Optional[Type]
description: Optional[str] = None
seed: Optional[int] = None
tools: Optional[List[str]] = None
```

### Literal Types

```python
# Restrict to specific values
role: Literal["user", "assistant", "system"]

# Only these exact strings are valid
```

### Union Types

```python
# Accept multiple types
tools: Optional[List[Union[str, ToolSpec]]] = None

# Can be:
# - List of strings: ["browser", "calculator"]
# - List of ToolSpec objects
# - Mixed: ["browser", ToolSpec(name="calc")]
```

## Custom Validators

### Model Validators

#### InputSpec: At Least One Field

```python
@model_validator(mode="after")
def check_at_least_one_field(self) -> "InputSpec":
    """Ensure at least one input field is provided."""
    if not any([self.query, self.messages, self.system_prompt, self.context]):
        raise ValueError(
            "At least one of query, messages, system_prompt, or context must be provided"
        )
    return self
```

**Example:**
```python
# Valid
InputSpec(query="Hello")

# Invalid - raises ValueError
InputSpec()  # No fields provided
```

#### TestSpec: Framework Requires Tools

```python
@model_validator(mode="after")
def check_framework_requires_tools(self) -> "TestSpec":
    """Ensure framework specification includes tools."""
    if self.framework and not self.tools:
        raise ValueError("framework requires tools to be specified")
    return self
```

**Example:**
```python
# Valid
TestSpec(
    name="Test",
    model="gpt-4",
    inputs=InputSpec(query="Hi"),
    assertions=[{"output_type": "text"}],
    framework="langgraph",
    tools=["web_search"]  # Tools provided
)

# Invalid - raises ValueError
TestSpec(
    name="Test",
    model="gpt-4",
    inputs=InputSpec(query="Hi"),
    assertions=[{"output_type": "text"}],
    framework="langgraph"  # Framework without tools
)
```

## Serialization

### model_dump()

Convert model to dictionary.

```python
spec = TestSpec(
    name="Test",
    model="gpt-4",
    inputs=InputSpec(query="Hi"),
    assertions=[{"output_type": "text"}]
)

# Full dump
data = spec.model_dump()
# {'name': 'Test', 'model': 'gpt-4', 'inputs': {...}, 'assertions': [...], ...}

# Exclude None values
data = spec.model_dump(exclude_none=True)
# Only includes fields that are set

# Use field aliases
data = spec.model_dump(by_alias=True)
# Uses 'config' instead of 'model_config'
```

### model_dump_json()

Convert model to JSON string.

```python
json_str = spec.model_dump_json(indent=2)
# Pretty-printed JSON string
```

### Pydantic Serialization Settings

```python
class TestSpec(BaseModel):
    model_config = ConfigDict(
        # Allow field population by alias
        populate_by_name=True,

        # Validate on assignment
        validate_assignment=True,

        # Additional settings...
    )
```

## Type Safety

### Runtime Type Checking

Pydantic validates types at runtime:

```python
# This works
spec = TestSpec(
    name="Test",
    model="gpt-4",
    inputs=InputSpec(query="Hi"),
    assertions=[{"output_type": "text"}]
)

# This raises ValidationError
spec = TestSpec(
    name=123,  # Should be str
    model="gpt-4",
    inputs="invalid",  # Should be InputSpec
    assertions="invalid"  # Should be List[Dict]
)
```

### IDE Autocomplete

With type hints, IDEs provide autocomplete:

```python
from backend.core.schema import TestSpec

spec = TestSpec(...)

# IDE shows available fields and types
spec.name  # str
spec.model  # str
spec.inputs  # InputSpec
spec.assertions  # List[Dict[str, Any]]
spec.seed  # Optional[int]
```

### MyPy Integration

Use mypy for static type checking:

```bash
mypy backend/core/schema.py
# Success: no issues found
```

## Validation Error Messages

Pydantic provides clear error messages:

### Missing Required Field

```python
TestSpec(
    name="Test",
    # Missing: model, inputs, assertions
)

# ValidationError: 3 validation errors for TestSpec
# model
#   Field required [type=missing]
# inputs
#   Field required [type=missing]
# assertions
#   Field required [type=missing]
```

### Type Mismatch

```python
TestSpec(
    name=123,  # Should be str
    model="gpt-4",
    inputs=InputSpec(query="Hi"),
    assertions=[{"output_type": "text"}]
)

# ValidationError: 1 validation error for TestSpec
# name
#   Input should be a valid string [type=string_type, input_value=123]
```

### Value Out of Range

```python
ModelConfig(temperature=3.0)  # Max is 2.0

# ValidationError: 1 validation error for ModelConfig
# temperature
#   Input should be less than or equal to 2.0 [type=less_than_equal, input_value=3.0]
```

### Custom Validation Error

```python
TestSpec(
    name="Test",
    model="gpt-4",
    inputs=InputSpec(query="Hi"),
    assertions=[{"output_type": "text"}],
    framework="langgraph"  # But no tools
)

# ValidationError: 1 validation error for TestSpec
#   Value error, framework requires tools to be specified [type=value_error]
```

## Best Practices

### 1. Use Type Hints

```python
from backend.core.schema import TestSpec

def load_test(path: str) -> TestSpec:
    """Load test with type safety."""
    return TestSpecParser.parse_file(path)

# IDE knows return type is TestSpec
spec = load_test("test.yaml")
spec.name  # Autocomplete works
```

### 2. Catch Validation Errors

```python
from pydantic import ValidationError

try:
    spec = TestSpec(...)
except ValidationError as e:
    print(f"Validation error: {e}")
    # Handle error appropriately
```

### 3. Use model_dump for Serialization

```python
# Good - excludes None values
data = spec.model_dump(exclude_none=True)

# Bad - includes all fields even if None
data = dict(spec)
```

### 4. Validate Early

```python
# Validate as soon as data is loaded
spec = TestSpecParser.parse_file("test.yaml")
# Pydantic validates automatically

# Don't wait until later
# spec.validate()  # Not needed, already validated
```

## See Also

- [Getting Started Guide](getting-started.md)
- [DSL Reference](dsl-reference.md)
- [API Reference](api-reference.md)
- [Pydantic Documentation](https://docs.pydantic.dev/)
