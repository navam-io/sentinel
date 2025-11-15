# Schema Reference

Complete reference for all Sentinel test specification schemas.

## TestSpec

The root schema for a single test specification.

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | string | ✅ | - | Test case name |
| `description` | string | | `null` | Detailed description |
| `model` | string | ✅ | - | Model identifier |
| `provider` | string | | `null` | Model provider |
| `seed` | integer | | `null` | Random seed for determinism |
| `model_config` | [ModelConfig](#modelconfig) | | `null` | Model parameters |
| `tools` | array\[[ToolSpec](#toolspec)\] | | `null` | Available tools |
| `framework` | string | | `null` | Agentic framework |
| `framework_config` | object | | `null` | Framework configuration |
| `inputs` | [InputSpec](#inputspec) | ✅ | - | Test inputs |
| `assertions` | array[object] | ✅ | - | Validation assertions (min: 1) |
| `tags` | array[string] | | `null` | Categorization tags |
| `timeout_ms` | integer | | `null` | Execution timeout in ms |

### Validation Rules

- `name`: Must have at least 1 character
- `model`: Must have at least 1 character
- `seed`: Any integer (positive, negative, or zero)
- `timeout_ms`: Must be greater than 0
- `assertions`: Must have at least 1 assertion
- `framework` + no `tools`: Error (frameworks require tools)

### Example

```yaml
name: "Example Test"
description: "Complete test specification example"
model: "claude-3-5-sonnet-20241022"
provider: "anthropic"
seed: 42
timeout_ms: 30000

model_config:
  temperature: 0.7
  max_tokens: 1000

tools:
  - browser
  - calculator

framework: "langgraph"
framework_config:
  max_iterations: 5

inputs:
  query: "Test query"
  context:
    user_id: "123"

assertions:
  - must_contain: "result"
  - output_type: "json"

tags:
  - "regression"
  - "critical"
```

## TestSuite

A collection of test specifications with shared metadata.

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | string | ✅ | - | Suite name |
| `description` | string | | `null` | Suite description |
| `version` | string | | `null` | Suite version |
| `defaults` | object | | `null` | Default values for tests |
| `tests` | array\[[TestSpec](#testspec)\] | ✅ | - | List of tests (min: 1) |
| `tags` | array[string] | | `null` | Suite-level tags |

### Validation Rules

- `name`: Must have at least 1 character
- `tests`: Must have at least 1 test
- Each test in `tests` must be a valid TestSpec

### Example

```yaml
name: "Example Suite"
description: "Suite description"
version: "1.0.0"

defaults:
  model: "gpt-4"
  provider: "openai"

tests:
  - name: "Test 1"
    model: "gpt-4"
    inputs: {query: "Q1"}
    assertions: [{must_contain: "A1"}]

tags: ["regression"]
```

## InputSpec

Input parameters for a test case.

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `query` | string | * | `null` | Primary query/prompt |
| `messages` | array[object] | * | `null` | Conversation history |
| `system_prompt` | string | * | `null` | System instructions |
| `context` | object | * | `null` | Additional context data |

*At least one of these fields must be provided.

### Messages Format

```yaml
messages:
  - role: "user|assistant|system"
    content: "Message text"
```

### Validation Rules

- At least one field (`query`, `messages`, `system_prompt`, or `context`) must be provided
- `messages`: Array of objects with `role` and `content`

### Examples

```yaml
# Simple query
inputs:
  query: "What is 2+2?"

# Multi-turn
inputs:
  messages:
    - role: "user"
      content: "Hello"
    - role: "assistant"
      content: "Hi!"

# With context
inputs:
  query: "User status?"
  context:
    user_id: "123"
    tier: "premium"

# Combined
inputs:
  query: "Help me"
  system_prompt: "You are helpful"
  context: {session: "abc"}
```

## ModelConfig

Model-specific configuration parameters.

### Fields

| Field | Type | Required | Range | Description |
|-------|------|----------|-------|-------------|
| `temperature` | float | | 0.0 - 2.0 | Sampling temperature |
| `max_tokens` | integer | | > 0 | Maximum tokens to generate |
| `top_p` | float | | 0.0 - 1.0 | Nucleus sampling threshold |
| `top_k` | integer | | > 0 | Top-k sampling parameter |
| `stop_sequences` | array[string] | | - | Stop generation sequences |

### Example

```yaml
model_config:
  temperature: 0.7
  max_tokens: 1000
  top_p: 0.9
  top_k: 50
  stop_sequences: ["END", "STOP"]
```

## ToolSpec

Specification for an available tool.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Tool identifier |
| `description` | string | | Human-readable description |
| `parameters` | object | | JSON Schema for parameters |

### Example

```yaml
tools:
  # Simple form
  - browser
  - calculator

  # Full form
  - name: "web_search"
    description: "Search the web"
    parameters:
      type: "object"
      properties:
        query:
          type: "string"
          description: "Search query"
      required: ["query"]
```

## Assertions

Validation rules for test outputs.

### must_contain

**Type:** string | array[string]

**Description:** Output must contain specified text(s).

```yaml
assertions:
  - must_contain: "Paris"
  - must_contain: ["Paris", "France"]
```

### must_not_contain

**Type:** string | array[string]

**Description:** Output must NOT contain specified text(s).

```yaml
assertions:
  - must_not_contain: "error"
  - must_not_contain: ["error", "failed"]
```

### regex_match

**Type:** string

**Description:** Output must match regex pattern.

```yaml
assertions:
  - regex_match: "\\d{4}-\\d{2}-\\d{2}"
```

### must_call_tool

**Type:** string | array[string]

**Description:** Agent must call specified tool(s).

```yaml
assertions:
  - must_call_tool: "browser"
  - must_call_tool: ["browser", "calculator"]
```

### output_type

**Type:** "json" | "text" | "markdown" | "code" | "structured"

**Description:** Expected output format.

```yaml
assertions:
  - output_type: "json"
```

### max_latency_ms

**Type:** integer (> 0)

**Description:** Maximum execution time in milliseconds.

```yaml
assertions:
  - max_latency_ms: 5000
```

### min_tokens

**Type:** integer (> 0)

**Description:** Minimum output length in tokens.

```yaml
assertions:
  - min_tokens: 50
```

### max_tokens

**Type:** integer (> 0)

**Description:** Maximum output length in tokens.

```yaml
assertions:
  - max_tokens: 500
```

## Supported Providers

| Provider | Value | Models |
|----------|-------|--------|
| Anthropic | `"anthropic"` | Claude models |
| OpenAI | `"openai"` | GPT models |
| Bedrock | `"bedrock"` | Multi-model (coming in v0.10.0) |
| HuggingFace | `"huggingface"` | Hosted models (coming in v0.10.0) |
| Ollama | `"ollama"` | Local models (coming in v0.10.0) |

## Supported Frameworks

| Framework | Value | Status |
|-----------|-------|--------|
| LangGraph | `"langgraph"` | Coming in v0.5.0 |
| Claude SDK | `"claude_sdk"` | Coming in v0.11.0 |
| OpenAI SDK | `"openai_sdk"` | Coming in v0.11.0 |
| Strands | `"strands"` | Coming in v0.11.0 |

## JSON Schema

Generate JSON Schema from Python:

```python
from sentinel.core.schema import TestSpec

schema = TestSpec.model_json_schema()
print(schema)
```

## Type Definitions (TypeScript)

```typescript
interface TestSpec {
  name: string;
  description?: string;
  model: string;
  provider?: string;
  seed?: number;
  model_config?: ModelConfig;
  tools?: (string | ToolSpec)[];
  framework?: string;
  framework_config?: Record<string, any>;
  inputs: InputSpec;
  assertions: Assertion[];
  tags?: string[];
  timeout_ms?: number;
}

interface InputSpec {
  query?: string;
  messages?: Array<{role: string; content: string}>;
  system_prompt?: string;
  context?: Record<string, any>;
}

interface ModelConfig {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
  stop_sequences?: string[];
}

interface ToolSpec {
  name: string;
  description?: string;
  parameters?: Record<string, any>;
}

type Assertion =
  | {must_contain: string | string[]}
  | {must_not_contain: string | string[]}
  | {regex_match: string}
  | {must_call_tool: string | string[]}
  | {output_type: "json" | "text" | "markdown" | "code" | "structured"}
  | {max_latency_ms: number}
  | {min_tokens: number}
  | {max_tokens: number};
```

## See Also

- [API Reference](api.md) - Python API
- [Writing Tests Guide](../guides/writing-tests.md) - Usage guide
- [Assertions Guide](../guides/assertions.md) - Assertion details
