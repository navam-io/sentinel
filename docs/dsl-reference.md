# DSL Reference

Complete specification of the Sentinel Test DSL (Domain Specific Language).

## Table of Contents

- [Overview](#overview)
- [TestSpec](#testspec)
- [TestSuite](#testsuite)
- [InputSpec](#inputspec)
- [ModelConfig](#modelconfig)
- [ToolSpec](#toolspec)
- [Message](#message)
- [Assertions](#assertions)
- [Field Types](#field-types)
- [Validation Rules](#validation-rules)

## Overview

The Sentinel DSL is a YAML/JSON-based specification for defining AI agent tests. It provides:

- **Type safety** via Pydantic validation
- **Human readability** with YAML syntax
- **Machine parsability** with JSON support
- **Round-trip conversion** without data loss

### Format Support

Both formats are fully supported:

```yaml
# YAML (.yaml, .yml)
name: "My Test"
model: "gpt-4"
inputs:
  query: "Test query"
assertions:
  - must_contain: "result"
```

```json
// JSON (.json)
{
  "name": "My Test",
  "model": "gpt-4",
  "inputs": {
    "query": "Test query"
  },
  "assertions": [
    {"must_contain": "result"}
  ]
}
```

## TestSpec

A **TestSpec** defines a single test case.

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Test name (min 1 character) |
| `model` | string | Model identifier (min 1 character) |
| `inputs` | InputSpec | Test inputs |
| `assertions` | List[Dict] | Validation assertions (min 1) |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `description` | string | null | Test description |
| `provider` | string | null | Model provider (anthropic, openai, bedrock, huggingface, ollama) |
| `tools` | List[str \| ToolSpec] | null | Available tools for agent |
| `framework` | string | null | Agentic framework (langgraph, claude-sdk, openai-sdk, strands) |
| `framework_config` | Dict | null | Framework-specific configuration |
| `model_config` | ModelConfig | null | Model parameters (temperature, max_tokens, etc.) |
| `seed` | int | null | Random seed for reproducibility |
| `timeout_ms` | int | null | Test timeout in milliseconds (must be > 0) |
| `tags` | List[str] | null | Test categories/labels |

### Example: Minimal TestSpec

```yaml
name: "Minimal Test"
model: "gpt-4"
inputs:
  query: "Hello world"
assertions:
  - output_type: "text"
```

### Example: Complete TestSpec

```yaml
name: "Complete Agent Test"
description: "Comprehensive test with all options"
model: "claude-3-5-sonnet-20241022"
provider: "anthropic"

inputs:
  query: "Research the latest AI developments"
  system_prompt: "You are a helpful research assistant."
  context:
    date_range: "last 30 days"
    focus_areas: ["LLMs", "agents", "multimodal"]

assertions:
  - must_contain: "AI"
  - must_call_tool: "web_search"
  - output_type: "structured"
  - max_latency_ms: 15000

tools:
  - name: "web_search"
    description: "Search the web"
    parameters:
      type: "object"
      properties:
        query:
          type: "string"

framework: "langgraph"
framework_config:
  max_iterations: 5
  intermediate_steps: true

model_config:
  temperature: 0.7
  max_tokens: 4000
  top_p: 0.9

seed: 42
timeout_ms: 30000
tags:
  - research
  - multi-step
```

### Validation Rules

1. **name** must not be empty
2. **model** must not be empty
3. **assertions** must have at least 1 item
4. **timeout_ms** must be positive if provided
5. **framework** requires **tools** to be specified

## TestSuite

A **TestSuite** is a collection of tests with shared configuration.

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Suite name (min 1 character) |
| `tests` | List[TestSpec] | Test cases (min 1) |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `description` | string | null | Suite description |
| `version` | string | null | Suite version (e.g., "1.0.0") |
| `defaults` | ModelConfig | null | Shared defaults for all tests |
| `tags` | List[str] | null | Suite-level tags |

### Example: Test Suite

```yaml
name: "E-commerce Test Suite"
description: "Comprehensive e-commerce agent tests"
version: "1.0.0"

defaults:
  model: "claude-3-5-sonnet-20241022"
  provider: "anthropic"
  timeout_ms: 30000
  tools:
    - browser
    - calculator
  tags:
    - e2e
    - shopping

tests:
  - name: "Product Search"
    seed: 100
    inputs:
      query: "Find laptops under $1000"
    assertions:
      - must_contain: "price"
      - must_call_tool: "browser"

  - name: "Price Comparison"
    seed: 101
    inputs:
      query: "Compare prices for gaming laptops"
    assertions:
      - must_contain: "comparison"
      - output_type: "json"
```

### How Defaults Work

- Tests inherit default values
- Tests can override any default
- Defaults are for convenience only (not merged with test values)

## InputSpec

The **InputSpec** defines what inputs to send to the model.

### At Least One Required

You must provide at least one of:
- `query` - Simple text query
- `messages` - Conversation messages
- `system_prompt` - System instructions
- `context` - Additional context data

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `query` | string | Simple text query |
| `messages` | List[Message] | Conversation history |
| `system_prompt` | string | System instructions |
| `context` | Dict | Additional context (free-form) |

### Example: Simple Query

```yaml
inputs:
  query: "What is the capital of France?"
```

### Example: With System Prompt

```yaml
inputs:
  query: "Write a function to sort an array"
  system_prompt: "You are an expert programmer. Write clean, efficient code."
```

### Example: Multi-Turn Conversation

```yaml
inputs:
  messages:
    - role: "user"
      content: "I need help with my order"
    - role: "assistant"
      content: "I'd be happy to help. What's your order number?"
    - role: "user"
      content: "It's #12345"
  system_prompt: "You are a helpful customer support agent."
```

### Example: With Context

```yaml
inputs:
  query: "Summarize the latest news"
  context:
    date_range: "last 7 days"
    categories: ["technology", "AI"]
    max_articles: 5
```

### Validation Rules

1. At least one field (`query`, `messages`, `system_prompt`, or `context`) must be provided
2. Multiple fields can be combined
3. `messages` must be a list of valid Message objects

## ModelConfig

Model-specific configuration parameters.

### Fields

| Field | Type | Range | Default | Description |
|-------|------|-------|---------|-------------|
| `temperature` | float | 0.0 - 2.0 | null | Sampling temperature |
| `max_tokens` | int | > 0 | null | Maximum output tokens |
| `top_p` | float | 0.0 - 1.0 | null | Nucleus sampling parameter |
| `top_k` | int | > 0 | null | Top-K sampling parameter |
| `stop_sequences` | List[str] | - | null | Stop generation sequences |

### Example

```yaml
model_config:
  temperature: 0.7
  max_tokens: 2000
  top_p: 0.95
  top_k: 40
  stop_sequences: ["\n\n", "END"]
```

### Validation Rules

1. **temperature**: Must be between 0.0 and 2.0
2. **max_tokens**: Must be positive
3. **top_p**: Must be between 0.0 and 1.0
4. **top_k**: Must be positive

## ToolSpec

Tool definition for agents.

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Tool name (min 1 character) |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Tool description |
| `parameters` | Dict | JSON Schema for parameters |

### Example: Simple Tool

```yaml
tools:
  - browser
  - calculator
```

### Example: Full Tool Specification

```yaml
tools:
  - name: "web_search"
    description: "Search the web for information"
    parameters:
      type: "object"
      properties:
        query:
          type: "string"
          description: "Search query"
        max_results:
          type: "integer"
          description: "Maximum number of results"
          default: 10
      required: ["query"]

  - name: "calculator"
    description: "Perform mathematical calculations"
    parameters:
      type: "object"
      properties:
        expression:
          type: "string"
          description: "Math expression to evaluate"
      required: ["expression"]
```

### Mixed Format

You can mix simple strings and full specifications:

```yaml
tools:
  - browser  # Simple string
  - name: "custom_tool"  # Full specification
    description: "My custom tool"
    parameters:
      type: "object"
```

## Message

Conversation message for multi-turn testing.

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `role` | string | Message role: "user", "assistant", or "system" |
| `content` | string | Message content (min 1 character) |

### Example

```yaml
messages:
  - role: "system"
    content: "You are a helpful assistant."

  - role: "user"
    content: "What is Python?"

  - role: "assistant"
    content: "Python is a high-level programming language."

  - role: "user"
    content: "What are its main uses?"
```

### Validation Rules

1. **role** must be exactly "user", "assistant", or "system"
2. **content** must not be empty

## Assertions

Assertions validate test outputs. Each assertion is a dictionary with one key indicating the assertion type.

### Available Assertion Types

| Type | Value Type | Description |
|------|------------|-------------|
| `must_contain` | string | Output must contain this text |
| `must_not_contain` | string | Output must NOT contain this text |
| `regex_match` | string | Output must match this regex pattern |
| `must_call_tool` | string \| List[str] | Agent must call these tools |
| `output_type` | string | Output format: json, text, markdown, code, structured |
| `max_latency_ms` | int | Maximum response time in milliseconds |
| `min_tokens` | int | Minimum output token count |
| `max_tokens` | int | Maximum output token count |

### Examples

#### Text Matching

```yaml
assertions:
  # Simple text match
  - must_contain: "Paris"

  # Multiple text matches
  - must_contain: "capital"
  - must_contain: "France"

  # Negative match
  - must_not_contain: "London"
```

#### Pattern Matching

```yaml
assertions:
  # Check for function definition
  - regex_match: "def\\s+\\w+\\([^)]*\\):"

  # Check for email format
  - regex_match: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"

  # Check for date format (YYYY-MM-DD)
  - regex_match: "\\d{4}-\\d{2}-\\d{2}"
```

#### Tool Call Validation

```yaml
assertions:
  # Single tool
  - must_call_tool: "browser"

  # Multiple tools
  - must_call_tool: ["browser", "calculator"]

  # Any of these tools
  - must_call_tool: "web_search"
```

#### Output Format Validation

```yaml
assertions:
  # JSON output
  - output_type: "json"

  # Plain text
  - output_type: "text"

  # Markdown
  - output_type: "markdown"

  # Code
  - output_type: "code"

  # Structured data
  - output_type: "structured"
```

#### Performance Thresholds

```yaml
assertions:
  # Maximum latency
  - max_latency_ms: 2000

  # Token count range
  - min_tokens: 50
  - max_tokens: 500
```

#### Combining Assertions

```yaml
assertions:
  # Text content checks
  - must_contain: "result"
  - must_not_contain: "error"

  # Format validation
  - output_type: "json"
  - regex_match: "\\{.*\\}"

  # Performance
  - max_latency_ms: 3000

  # Tool usage
  - must_call_tool: ["browser", "calculator"]
```

## Field Types

### String

Plain text field:

```yaml
name: "My Test"
model: "gpt-4"
description: "A simple test"
```

### Integer

Whole numbers:

```yaml
seed: 42
timeout_ms: 5000
max_tokens: 2000
```

### Float

Decimal numbers:

```yaml
temperature: 0.7
top_p: 0.95
```

### Boolean

True/false values:

```yaml
intermediate_steps: true
enable_caching: false
```

### List

Arrays of values:

```yaml
# List of strings
tags: ["math", "simple", "qa"]

# List of objects
messages:
  - role: "user"
    content: "Hello"
  - role: "assistant"
    content: "Hi there!"
```

### Dictionary/Object

Key-value pairs:

```yaml
# Simple dict
context:
  user_id: "12345"
  session: "abc"

# Nested dict
framework_config:
  max_iterations: 5
  retry_policy:
    max_retries: 3
    backoff: "exponential"
```

## Validation Rules

### Global Rules

1. All YAML/JSON must be valid syntax
2. Top-level must be an object/dict
3. Must have either `tests` array (TestSuite) or `name`/`model`/`inputs`/`assertions` (TestSpec)

### TestSpec Rules

1. **name**: Required, non-empty string
2. **model**: Required, non-empty string
3. **inputs**: Required, must have at least one field
4. **assertions**: Required, must have at least one assertion
5. **timeout_ms**: If provided, must be > 0
6. **framework**: If provided, **tools** must also be provided
7. **seed**: If provided, must be an integer

### TestSuite Rules

1. **name**: Required, non-empty string
2. **tests**: Required, must have at least one test
3. Each test in **tests** must be a valid TestSpec

### InputSpec Rules

1. Must have at least one of: `query`, `messages`, `system_prompt`, or `context`
2. **messages**: If provided, must be a non-empty list
3. Each message must have valid `role` and non-empty `content`

### ModelConfig Rules

1. **temperature**: If provided, must be 0.0 ≤ temp ≤ 2.0
2. **top_p**: If provided, must be 0.0 ≤ top_p ≤ 1.0
3. **max_tokens**: If provided, must be > 0
4. **top_k**: If provided, must be > 0

### ToolSpec Rules

1. **name**: Required, non-empty string
2. **parameters**: If provided, should be valid JSON Schema

### Message Rules

1. **role**: Required, must be "user", "assistant", or "system"
2. **content**: Required, non-empty string

## Error Messages

When validation fails, you'll get clear error messages:

### Example: Missing Required Field

```
ParsingError: 1 validation error for TestSpec
name
  Field required [type=missing, input_value={...}]
```

### Example: Invalid Type

```
ParsingError: 1 validation error for TestSpec
seed
  Input should be a valid integer [type=int_type, input_value='abc']
```

### Example: Value Out of Range

```
ParsingError: 1 validation error for ModelConfig
temperature
  Input should be less than or equal to 2.0 [type=less_than_equal, input_value=3.5]
```

### Example: Custom Validation

```
ParsingError: 1 validation error for TestSpec
framework
  framework requires tools to be specified [type=value_error]
```

## Best Practices

### 1. Use Descriptive Names

```yaml
# Good
name: "Code Generation - Python Fibonacci Function"

# Bad
name: "Test 1"
```

### 2. Add Descriptions

```yaml
name: "Browser Agent Test"
description: "Tests agent's ability to search and extract product information from e-commerce sites"
```

### 3. Use Semantic Tags

```yaml
tags:
  - code-generation
  - python
  - algorithms
  - performance
```

### 4. Set Reproducible Seeds

```yaml
seed: 42  # For deterministic testing
```

### 5. Define Reasonable Timeouts

```yaml
timeout_ms: 30000  # 30 seconds for complex agent tasks
```

### 6. Use Multiple Assertions

```yaml
assertions:
  # Content validation
  - must_contain: "result"
  - must_not_contain: "error"

  # Format validation
  - output_type: "json"

  # Performance validation
  - max_latency_ms: 2000
```

### 7. Organize with Test Suites

```yaml
name: "Agent Test Suite"
defaults:
  model: "claude-3-5-sonnet-20241022"
  timeout_ms: 30000
tests:
  - name: "Test 1"
    # ...
  - name: "Test 2"
    # ...
```

## See Also

- [Getting Started Guide](getting-started.md)
- [Examples Guide](examples.md)
- [API Reference](api-reference.md)
- [Best Practices](best-practices.md)
