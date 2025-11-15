# Quick Start Guide

Get up and running with Navam Sentinel in under 5 minutes. This tutorial will walk you through creating, parsing, and working with your first test specification.

## Prerequisites

- Sentinel installed ([Installation Guide](installation.md))
- Basic familiarity with YAML or JSON
- Python 3.10+ environment

## Step 1: Create Your First Test Spec

Create a file named `my_first_test.yaml`:

```yaml
name: "My First Agent Test"
description: "Testing a simple Q&A scenario"
model: "gpt-4"
provider: "openai"
seed: 42

inputs:
  query: "What is the capital of France?"

assertions:
  - must_contain: "Paris"
  - output_type: "text"
  - max_latency_ms: 3000
```

### What's Happening Here?

- **name**: A descriptive name for your test
- **model**: The LLM to test (e.g., gpt-4, claude-3-5-sonnet-20241022)
- **provider**: Model provider (openai, anthropic, etc.)
- **seed**: Random seed for reproducible results
- **inputs.query**: The prompt to send to the model
- **assertions**: Rules that the output must satisfy

## Step 2: Parse and Validate

Create a Python script `test_runner.py`:

```python
from sentinel.core.parser import TestSpecParser

# Parse the test spec
spec = TestSpecParser.parse_file("my_first_test.yaml")

# Display test information
print(f"✓ Test loaded: {spec.name}")
print(f"  Model: {spec.model}")
print(f"  Provider: {spec.provider}")
print(f"  Seed: {spec.seed}")
print(f"  Query: {spec.inputs.query}")
print(f"  Assertions: {len(spec.assertions)}")

# Show assertions
for i, assertion in enumerate(spec.assertions, 1):
    print(f"    {i}. {assertion}")
```

Run it:

```bash
python test_runner.py
```

Output:
```
✓ Test loaded: My First Agent Test
  Model: gpt-4
  Provider: openai
  Seed: 42
  Query: What is the capital of France?
  Assertions: 3
    1. {'must_contain': 'Paris'}
    2. {'output_type': 'text'}
    3. {'max_latency_ms': 3000}
```

## Step 3: Create a Test Programmatically

You can also create test specs in Python:

```python
from sentinel.core.schema import TestSpec
from sentinel.core.parser import TestSpecParser

# Create a test spec programmatically
spec = TestSpec(
    name="Programmatic Test",
    description="Created with Python code",
    model="claude-3-5-sonnet-20241022",
    provider="anthropic",
    seed=123,
    inputs={
        "query": "Write a haiku about testing AI",
        "system_prompt": "You are a poetic AI assistant."
    },
    assertions=[
        {"must_contain": "haiku"},
        {"output_type": "text"},
        {"min_tokens": 10},
        {"max_tokens": 100}
    ],
    tags=["poetry", "creative"]
)

# Export to YAML
yaml_content = TestSpecParser.to_yaml(spec)
print(yaml_content)

# Save to file
TestSpecParser.write_file(spec, "haiku_test.yaml")
print("✓ Saved to haiku_test.yaml")
```

## Step 4: Create a Test Suite

Group multiple related tests together:

```yaml
# test_suite.yaml
name: "Q&A Test Suite"
description: "Testing basic factual questions"
version: "1.0.0"

defaults:
  model: "gpt-4"
  provider: "openai"
  timeout_ms: 5000

tests:
  - name: "Geography - France"
    seed: 100
    inputs:
      query: "What is the capital of France?"
    assertions:
      - must_contain: "Paris"

  - name: "Geography - Japan"
    seed: 101
    inputs:
      query: "What is the capital of Japan?"
    assertions:
      - must_contain: "Tokyo"

  - name: "Math - Basic"
    seed: 102
    inputs:
      query: "What is 2 + 2?"
    assertions:
      - must_contain: "4"
```

Parse the suite:

```python
from sentinel.core.parser import TestSpecParser

suite = TestSpecParser.parse_file("test_suite.yaml")

print(f"Suite: {suite.name}")
print(f"Version: {suite.version}")
print(f"Number of tests: {len(suite.tests)}")
print(f"Defaults: {suite.defaults}")

for i, test in enumerate(suite.tests, 1):
    print(f"\n{i}. {test.name}")
    print(f"   Seed: {test.seed}")
    print(f"   Query: {test.inputs.query}")
```

## Step 5: Add Tool Calls

Test an agent with tools:

```yaml
# agent_test.yaml
name: "Web Research Agent"
model: "claude-3-5-sonnet-20241022"
provider: "anthropic"
seed: 42

tools:
  - name: "web_search"
    description: "Search the web for information"
    parameters:
      type: "object"
      properties:
        query:
          type: "string"
          description: "Search query"
      required: ["query"]

  - name: "calculator"
    description: "Perform calculations"

inputs:
  query: "How many days until Christmas from November 15, 2025?"

assertions:
  - must_call_tool: "calculator"
  - must_contain: "days"
  - output_type: "text"
  - max_latency_ms: 5000
```

## Step 6: Work with Different Formats

Sentinel supports YAML and JSON:

### Convert YAML to JSON

```python
from sentinel.core.parser import TestSpecParser

# Load YAML
spec = TestSpecParser.parse_file("my_first_test.yaml")

# Convert to JSON
json_content = TestSpecParser.to_json(spec, indent=2)
print(json_content)

# Save as JSON
TestSpecParser.write_file(spec, "my_first_test.json", format="json")
```

### Parse JSON

```python
import json
from sentinel.core.parser import TestSpecParser

json_content = """
{
  "name": "JSON Test",
  "model": "gpt-4",
  "inputs": {
    "query": "Hello from JSON"
  },
  "assertions": [
    {"must_contain": "hello"}
  ]
}
"""

spec = TestSpecParser.parse_json(json_content)
print(f"Loaded: {spec.name}")
```

## Step 7: Handle Errors

Sentinel provides clear error messages:

```python
from sentinel.core.parser import TestSpecParser, ParsingError

yaml_content = """
name: "Invalid Test"
model: ""  # Empty model - invalid!
inputs:
  query: "Test"
assertions: []  # No assertions - invalid!
"""

try:
    spec = TestSpecParser.parse_yaml(yaml_content)
except ParsingError as e:
    print(f"Validation failed:")
    print(e)
```

Output:
```
Validation failed:
Validation failed for test spec:
  • model: String should have at least 1 character
  • assertions: List should have at least 1 item
```

## Common Patterns

### Pattern 1: Multi-Turn Conversation

```yaml
name: "Customer Support Dialogue"
model: "gpt-4"

inputs:
  messages:
    - role: "user"
      content: "I need help with order #12345"
    - role: "assistant"
      content: "I'd be happy to help. Let me look up your order."
    - role: "user"
      content: "When will it ship?"
  system_prompt: "You are a helpful customer support agent."

assertions:
  - must_contain: "order"
  - must_contain: "12345"
```

### Pattern 2: Code Generation

```yaml
name: "Python Function Generator"
model: "claude-3-5-sonnet-20241022"

model_config:
  temperature: 0.2
  max_tokens: 500

inputs:
  query: "Write a function to check if a number is prime"

assertions:
  - must_contain: "def"
  - must_contain: "return"
  - regex_match: "def \\w+\\("
  - output_type: "code"
```

### Pattern 3: With Context

```yaml
name: "Context-Aware Test"
model: "gpt-4"

inputs:
  query: "What's the user's email?"
  context:
    user_id: "12345"
    user_email: "alice@example.com"
    session_id: "abc123"

assertions:
  - must_contain: "alice@example.com"
```

## Next Steps

Now that you're familiar with the basics:

1. **[Learn Core Concepts](concepts.md)** - Understand test specs in depth
2. **[Writing Test Specs Guide](writing-tests.md)** - Master all test spec features
3. **[Assertions Guide](assertions.md)** - Learn all assertion types
4. **[Browse Examples](../examples/gallery.md)** - See real-world examples

## Quick Reference

### Parse Files
```python
spec = TestSpecParser.parse_file("test.yaml")
spec = TestSpecParser.parse_file("test.json")
```

### Parse Strings
```python
spec = TestSpecParser.parse_yaml(yaml_string)
spec = TestSpecParser.parse_json(json_string)
```

### Create Programmatically
```python
spec = TestSpec(name="Test", model="gpt-4", inputs={...}, assertions=[...])
```

### Convert Formats
```python
yaml_str = TestSpecParser.to_yaml(spec)
json_str = TestSpecParser.to_json(spec)
```

### Save to File
```python
TestSpecParser.write_file(spec, "output.yaml", format="yaml")
TestSpecParser.write_file(spec, "output.json", format="json")
```

## Troubleshooting

**Q: My YAML won't parse**
- Check indentation (use spaces, not tabs)
- Ensure all strings with special characters are quoted
- Validate YAML syntax at [yamllint.com](http://www.yamllint.com/)

**Q: Validation errors are unclear**
- Read the error message carefully - it shows the exact field and issue
- Check the [Schema Reference](../reference/schema.md) for field requirements

**Q: How do I test my spec without running it?**
```python
spec = TestSpecParser.parse_file("test.yaml")
print("✓ Valid!")  # If this runs, your spec is valid
```

Ready to dive deeper? Continue to [Core Concepts](concepts.md).
