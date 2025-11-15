# Core Concepts

Understanding the fundamental concepts behind Navam Sentinel will help you create effective, maintainable test suites for your AI agents and models.

## Overview

Sentinel is built around the idea of **deterministic, reproducible testing** for AI systems. Unlike traditional software testing, AI agents are non-deterministic by nature. Sentinel provides tools to make their behavior as predictable as possible through:

- **Seeded randomization** for consistent outputs
- **Declarative test specifications** that define expected behavior
- **Comprehensive assertions** to validate outputs
- **Framework-agnostic architecture** supporting multiple AI platforms

## Test Specifications

A **Test Specification** (TestSpec) is a declarative YAML or JSON document that defines:

1. **What to test**: Model, tools, framework
2. **How to test it**: Inputs, configuration, seed
3. **What success looks like**: Assertions

### Anatomy of a Test Spec

```yaml
# Metadata
name: "Descriptive test name"
description: "What this test validates"
tags: ["category", "priority"]

# Execution configuration
model: "claude-3-5-sonnet-20241022"
provider: "anthropic"
seed: 42
timeout_ms: 30000

# Model parameters
model_config:
  temperature: 0.7
  max_tokens: 1000

# Tools (for agentic testing)
tools:
  - browser
  - calculator

# Framework (optional)
framework: "langgraph"
framework_config:
  max_iterations: 5

# Inputs
inputs:
  query: "Your prompt here"
  system_prompt: "System instructions"
  context:
    key: "value"

# Success criteria
assertions:
  - must_contain: "expected output"
  - must_call_tool: "browser"
  - max_latency_ms: 5000
```

### Key Principles

**1. Declarative over Imperative**
```yaml
# Good: Declare what you expect
assertions:
  - must_contain: "Paris"
  - output_type: "json"

# Not: Imperative code (Sentinel doesn't support this)
# if "Paris" in output and is_json(output): pass
```

**2. Reproducible by Default**
```yaml
# Always use seeds for determinism
seed: 42

# Lock down randomness
model_config:
  temperature: 0.0  # Fully deterministic
```

**3. Test Behavior, Not Implementation**
```yaml
# Good: Test observable behavior
assertions:
  - must_call_tool: "calculator"
  - must_contain: "42"

# Avoid: Testing internal implementation details
```

## Determinism and Seeds

### Why Seeds Matter

AI models use randomness during generation. Without a seed, the same prompt can produce different outputs:

```yaml
# Without seed - non-deterministic
name: "Flaky Test"
model: "gpt-4"
inputs:
  query: "Tell me a joke"
# Output varies each run!
```

```yaml
# With seed - deterministic
name: "Reliable Test"
model: "gpt-4"
seed: 42  # Same output every time
inputs:
  query: "Tell me a joke"
```

### When to Use Seeds

- ✅ **Regression testing**: Detect when model behavior changes
- ✅ **Comparison testing**: Compare models with identical conditions
- ✅ **Debugging**: Reproduce exact outputs for investigation
- ⚠️ **Safety testing**: May want varied outputs to test robustness

### Temperature and Determinism

```yaml
model_config:
  temperature: 0.0    # Most deterministic
  temperature: 0.3    # Slightly random
  temperature: 0.7    # Default, balanced
  temperature: 1.0    # More creative
  temperature: 2.0    # Highly random
```

## Inputs and Context

### Input Types

**1. Simple Query**
```yaml
inputs:
  query: "What is the capital of France?"
```

**2. Multi-Turn Conversation**
```yaml
inputs:
  messages:
    - role: "user"
      content: "Hello"
    - role: "assistant"
      content: "Hi! How can I help?"
    - role: "user"
      content: "Tell me about yourself"
```

**3. With System Prompt**
```yaml
inputs:
  query: "Your question"
  system_prompt: "You are a helpful assistant specialized in..."
```

**4. With Context**
```yaml
inputs:
  query: "What's the user's status?"
  context:
    user_id: "12345"
    subscription: "premium"
    last_login: "2025-11-15"
```

### Context vs System Prompt

| System Prompt | Context |
|--------------|---------|
| Instructions for the model | Data/state for the test |
| "You are a helpful assistant" | `{"user_id": "123"}` |
| Affects model behavior | Provides situational data |
| Part of the conversation | Metadata for execution |

## Assertions

Assertions define **success criteria** for your test. They answer: "How do I know this test passed?"

### Assertion Philosophy

**Be Specific, Not Brittle**
```yaml
# Good: Specific but flexible
assertions:
  - must_contain: "capital"
  - must_contain: "Paris"

# Too brittle: Exact match breaks easily
assertions:
  - must_contain: "The capital of France is Paris."
```

**Test Multiple Dimensions**
```yaml
assertions:
  - must_contain: "answer"      # Content
  - output_type: "text"          # Format
  - max_latency_ms: 3000         # Performance
  - must_call_tool: "calculator" # Behavior
```

### Assertion Categories

**Content Assertions**
- What the output contains or doesn't contain
- Pattern matching with regex

**Behavioral Assertions**
- Which tools were called
- How the agent behaved

**Format Assertions**
- Output structure (JSON, text, markdown, etc.)

**Performance Assertions**
- Latency bounds
- Token usage

See [Assertions Guide](assertions.md) for complete details.

## Tools and Agentic Testing

### Tool Specifications

Tools enable agents to interact with the world:

```yaml
# Simple tool names
tools:
  - browser
  - calculator
  - file_system

# Full tool specifications
tools:
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

### Framework Integration

Sentinel supports multiple agentic frameworks:

```yaml
# LangGraph
framework: "langgraph"
framework_config:
  max_iterations: 5
  intermediate_steps: true

# Claude Agent SDK (coming in v0.11.0)
framework: "claude_sdk"

# OpenAI Agents SDK (coming in v0.11.0)
framework: "openai_sdk"
```

### When Frameworks Require Tools

```yaml
# This will error - framework needs tools
framework: "langgraph"
# Missing: tools

# Correct
framework: "langgraph"
tools:
  - browser
  - calculator
```

## Test Suites

Group related tests into suites for organization and shared configuration.

### Suite Structure

```yaml
name: "Suite Name"
version: "1.0.0"
description: "What this suite tests"

# Shared defaults
defaults:
  model: "gpt-4"
  provider: "openai"
  timeout_ms: 5000
  tags: ["regression"]

# Individual tests
tests:
  - name: "Test 1"
    seed: 100
    inputs: {...}
    assertions: [...]

  - name: "Test 2"
    seed: 101
    inputs: {...}
    assertions: [...]
```

### Benefits of Suites

- **DRY**: Define common config once
- **Organization**: Group related tests
- **Versioning**: Track suite evolution
- **Batch execution**: Run multiple tests together (coming in v0.3.0)

### Important: Defaults Are Metadata

```yaml
defaults:
  model: "gpt-4"

tests:
  - name: "Test 1"
    model: "claude-3-5-sonnet-20241022"  # Must specify model
```

Currently, defaults are stored but not auto-applied to tests. This may change in future versions.

## Model Configuration

Fine-tune model behavior with configuration parameters:

```yaml
model_config:
  # Randomness control
  temperature: 0.7      # 0.0 = deterministic, 2.0 = creative
  top_p: 0.9           # Nucleus sampling
  top_k: 50            # Top-k sampling

  # Output control
  max_tokens: 1000     # Maximum response length
  stop_sequences:      # Stop generation at these
    - "END"
    - "STOP"
```

### Parameter Guidelines

| Parameter | Low Value | High Value | Use Case |
|-----------|-----------|------------|----------|
| temperature | 0.0 | 2.0 | 0 for facts, 1+ for creativity |
| top_p | 0.1 | 1.0 | Narrow vs broad vocabulary |
| max_tokens | 100 | 4000+ | Short vs long responses |

## Validation and Errors

Sentinel validates specs at parse time, catching errors early:

```python
from sentinel.core.parser import TestSpecParser, ParsingError

try:
    spec = TestSpecParser.parse_file("test.yaml")
except ParsingError as e:
    print(f"Validation error: {e}")
    # Shows exactly which fields are invalid and why
```

### Common Validation Errors

**Missing Required Fields**
```
Validation failed:
  • model: Field required
  • inputs: Field required
  • assertions: Field required
```

**Invalid Values**
```
Validation failed:
  • model_config -> temperature: Input should be less than or equal to 2.0
  • assertions: List should have at least 1 item
```

**Type Errors**
```
Validation failed:
  • seed: Input should be a valid integer
  • timeout_ms: Input should be greater than 0
```

## Design Philosophy

### Security & Privacy First

- Air-gapped deployment support
- No data leaves your infrastructure
- You control model weights and outputs
- No vendor lock-in

### Determinism & Reproducibility

- Seeded randomization
- Version-locked dependencies
- Immutable test specifications
- Repeatable environments

### LLM-Oriented Design

- YAML syntax optimized for AI generation
- Simple, minimal schema
- Clear validation messages
- Fast iteration cycles

## Next Steps

- **[Writing Test Specs](writing-tests.md)** - Deep dive into creating tests
- **[Assertions Guide](assertions.md)** - Master all assertion types
- **[Test Suites](test-suites.md)** - Organize your tests
- **[Schema Reference](../reference/schema.md)** - Complete field documentation

## Common Questions

**Q: Do I always need a seed?**
A: No, but it's highly recommended for regression testing. Without a seed, outputs may vary between runs.

**Q: Can I test multiple models in one spec?**
A: No, each TestSpec tests one model. Use a TestSuite to test multiple models with the same inputs.

**Q: What's the difference between provider and model?**
A: `model` is the specific model (e.g., "gpt-4"), `provider` is the API (e.g., "openai", "anthropic", "bedrock").

**Q: Can I run tests now?**
A: v0.1.0 supports parsing and validation. Execution comes in v0.3.0 (Run Executor).

**Q: How do I handle secrets (API keys)?**
A: Test specs define *what* to test, not *how* to authenticate. Credentials will be configured separately when the executor is available (v0.3.0).
