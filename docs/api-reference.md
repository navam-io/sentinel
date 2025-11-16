# API Reference

Complete Python API documentation for Sentinel DSL parser and schema.

## Table of Contents

- [Overview](#overview)
- [TestSpecParser](#testspecparser)
- [Schema Classes](#schema-classes)
- [Exceptions](#exceptions)
- [Type Hints](#type-hints)
- [Usage Examples](#usage-examples)

## Overview

The Sentinel Python API provides programmatic access to:

- **Parsing**: Load YAML/JSON test specifications
- **Serialization**: Convert specs to YAML/JSON
- **Validation**: Validate test specifications
- **Schema**: Type-safe Pydantic models

### Installation

```python
# Add to your imports
from backend.core.parser import TestSpecParser
from backend.core.schema import (
    TestSpec,
    TestSuite,
    InputSpec,
    ModelConfig,
    ToolSpec,
    Message
)
```

## TestSpecParser

The main API for parsing and serializing test specifications.

### Class: `TestSpecParser`

Static utility class for parsing and serializing test specifications.

#### Methods

##### `parse_yaml(content: str) -> TestSpec | TestSuite`

Parse a YAML string into a TestSpec or TestSuite.

**Parameters:**
- `content` (str): YAML string to parse

**Returns:**
- `TestSpec | TestSuite`: Parsed specification

**Raises:**
- `ParsingError`: If YAML is invalid or validation fails

**Example:**
```python
yaml_str = """
name: "My Test"
model: "gpt-4"
inputs:
  query: "Hello"
assertions:
  - output_type: "text"
"""

spec = TestSpecParser.parse_yaml(yaml_str)
print(spec.name)  # "My Test"
```

---

##### `parse_json(content: str) -> TestSpec | TestSuite`

Parse a JSON string into a TestSpec or TestSuite.

**Parameters:**
- `content` (str): JSON string to parse

**Returns:**
- `TestSpec | TestSuite`: Parsed specification

**Raises:**
- `ParsingError`: If JSON is invalid or validation fails

**Example:**
```python
json_str = '''
{
  "name": "My Test",
  "model": "gpt-4",
  "inputs": {"query": "Hello"},
  "assertions": [{"output_type": "text"}]
}
'''

spec = TestSpecParser.parse_json(json_str)
print(spec.model)  # "gpt-4"
```

---

##### `parse_file(file_path: str | Path) -> TestSpec | TestSuite`

Parse a test specification file (YAML or JSON).

**Parameters:**
- `file_path` (str | Path): Path to YAML (.yaml, .yml) or JSON (.json) file

**Returns:**
- `TestSpec | TestSuite`: Parsed specification

**Raises:**
- `ParsingError`: If file doesn't exist, format unsupported, or validation fails
- `FileNotFoundError`: If file doesn't exist

**Example:**
```python
from pathlib import Path

# Using string path
spec = TestSpecParser.parse_file("tests/my_test.yaml")

# Using Path object
spec = TestSpecParser.parse_file(Path("tests/my_test.yaml"))

print(f"Loaded: {spec.name}")
```

---

##### `to_yaml(spec: TestSpec | TestSuite) -> str`

Convert a TestSpec or TestSuite to YAML string.

**Parameters:**
- `spec` (TestSpec | TestSuite): Specification to serialize

**Returns:**
- `str`: YAML string representation

**Example:**
```python
spec = TestSpec(
    name="Test",
    model="gpt-4",
    inputs=InputSpec(query="Hello"),
    assertions=[{"output_type": "text"}]
)

yaml_str = TestSpecParser.to_yaml(spec)
print(yaml_str)
# Output:
# name: Test
# model: gpt-4
# inputs:
#   query: Hello
# assertions:
#   - output_type: text
```

---

##### `to_json(spec: TestSpec | TestSuite, indent: int = 2) -> str`

Convert a TestSpec or TestSuite to JSON string.

**Parameters:**
- `spec` (TestSpec | TestSuite): Specification to serialize
- `indent` (int, optional): JSON indentation level. Default: 2

**Returns:**
- `str`: JSON string representation

**Example:**
```python
spec = TestSpec(
    name="Test",
    model="gpt-4",
    inputs=InputSpec(query="Hello"),
    assertions=[{"output_type": "text"}]
)

# With indentation (pretty-printed)
json_str = TestSpecParser.to_json(spec, indent=2)

# Compact (no indentation)
json_str = TestSpecParser.to_json(spec, indent=None)
```

---

##### `write_file(spec: TestSpec | TestSuite, file_path: str | Path, format: str = None)`

Write a TestSpec or TestSuite to a file.

**Parameters:**
- `spec` (TestSpec | TestSuite): Specification to write
- `file_path` (str | Path): Output file path
- `format` (str, optional): Force format ("yaml" or "json"). Auto-detects from extension if None

**Returns:**
- None

**Raises:**
- `ParsingError`: If format is unsupported

**Example:**
```python
# Auto-detect format from extension
TestSpecParser.write_file(spec, "output.yaml")  # YAML
TestSpecParser.write_file(spec, "output.json")  # JSON

# Force format
TestSpecParser.write_file(spec, "output.txt", format="yaml")

# Creates parent directories if needed
TestSpecParser.write_file(spec, "tests/subdir/test.yaml")
```

---

##### `validate_spec(spec: TestSpec | TestSuite) -> None`

Validate a test specification.

**Parameters:**
- `spec` (TestSpec | TestSuite): Specification to validate

**Returns:**
- None (raises exception if invalid)

**Raises:**
- `ParsingError`: If validation fails

**Example:**
```python
spec = TestSpecParser.parse_file("test.yaml")

try:
    TestSpecParser.validate_spec(spec)
    print("✓ Spec is valid")
except ParsingError as e:
    print(f"✗ Validation failed: {e}")
```

## Schema Classes

Pydantic models for type-safe test specifications.

### Class: `TestSpec`

A single test specification.

#### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | str | ✓ | - | Test name |
| `description` | str | ✗ | None | Test description |
| `model` | str | ✓ | - | Model identifier |
| `provider` | str | ✗ | None | Provider name |
| `inputs` | InputSpec | ✓ | - | Test inputs |
| `assertions` | List[Dict] | ✓ | - | Validation assertions |
| `tools` | List[str \| ToolSpec] | ✗ | None | Available tools |
| `framework` | str | ✗ | None | Framework name |
| `framework_config` | Dict | ✗ | None | Framework config |
| `model_config` | ModelConfig | ✗ | None | Model parameters |
| `seed` | int | ✗ | None | Random seed |
| `timeout_ms` | int | ✗ | None | Timeout (ms) |
| `tags` | List[str] | ✗ | None | Tags |

#### Example

```python
from backend.core.schema import TestSpec, InputSpec

spec = TestSpec(
    name="My Test",
    description="A simple test",
    model="gpt-4",
    provider="openai",
    inputs=InputSpec(query="What is 2+2?"),
    assertions=[
        {"must_contain": "4"},
        {"output_type": "text"}
    ],
    seed=42,
    tags=["math", "simple"]
)

# Access fields
print(spec.name)          # "My Test"
print(spec.model)         # "gpt-4"
print(spec.inputs.query)  # "What is 2+2?"
print(spec.seed)          # 42
```

---

### Class: `TestSuite`

A collection of test specifications.

#### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | str | ✓ | - | Suite name |
| `description` | str | ✗ | None | Suite description |
| `version` | str | ✗ | None | Suite version |
| `tests` | List[TestSpec] | ✓ | - | Test cases |
| `defaults` | ModelConfig | ✗ | None | Shared defaults |
| `tags` | List[str] | ✗ | None | Suite tags |

#### Example

```python
from backend.core.schema import TestSuite, TestSpec, InputSpec

suite = TestSuite(
    name="Math Tests",
    version="1.0.0",
    tests=[
        TestSpec(
            name="Addition",
            model="gpt-4",
            inputs=InputSpec(query="2+2"),
            assertions=[{"must_contain": "4"}]
        ),
        TestSpec(
            name="Multiplication",
            model="gpt-4",
            inputs=InputSpec(query="3*4"),
            assertions=[{"must_contain": "12"}]
        )
    ],
    tags=["math"]
)

# Access fields
print(suite.name)            # "Math Tests"
print(len(suite.tests))      # 2
print(suite.tests[0].name)   # "Addition"
```

---

### Class: `InputSpec`

Test input specification.

#### Fields

At least one field is required.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | str | ✗ | Simple text query |
| `messages` | List[Message] | ✗ | Conversation messages |
| `system_prompt` | str | ✗ | System instructions |
| `context` | Dict | ✗ | Additional context |

#### Example

```python
from backend.core.schema import InputSpec, Message

# Simple query
inputs1 = InputSpec(query="What is Python?")

# With system prompt
inputs2 = InputSpec(
    query="Write a function",
    system_prompt="You are an expert programmer"
)

# Multi-turn conversation
inputs3 = InputSpec(
    messages=[
        Message(role="user", content="Hi"),
        Message(role="assistant", content="Hello!"),
        Message(role="user", content="How are you?")
    ]
)

# With context
inputs4 = InputSpec(
    query="Summarize news",
    context={"date_range": "last 7 days", "topics": ["AI", "tech"]}
)
```

---

### Class: `ModelConfig`

Model configuration parameters.

#### Fields

All fields are optional.

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `temperature` | float | 0.0 - 2.0 | Sampling temperature |
| `max_tokens` | int | > 0 | Max output tokens |
| `top_p` | float | 0.0 - 1.0 | Nucleus sampling |
| `top_k` | int | > 0 | Top-K sampling |
| `stop_sequences` | List[str] | - | Stop sequences |

#### Example

```python
from backend.core.schema import ModelConfig

config = ModelConfig(
    temperature=0.7,
    max_tokens=2000,
    top_p=0.95,
    top_k=40,
    stop_sequences=["\n\n", "END"]
)

# Use in TestSpec
spec = TestSpec(
    name="Test",
    model="gpt-4",
    inputs=InputSpec(query="Hello"),
    assertions=[{"output_type": "text"}],
    model_config=config
)
```

---

### Class: `ToolSpec`

Tool specification for agents.

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | str | ✓ | Tool name |
| `description` | str | ✗ | Tool description |
| `parameters` | Dict | ✗ | JSON Schema parameters |

#### Example

```python
from backend.core.schema import ToolSpec

# Simple tool
tool1 = ToolSpec(name="browser")

# Full tool spec
tool2 = ToolSpec(
    name="web_search",
    description="Search the web",
    parameters={
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Search query"
            }
        },
        "required": ["query"]
    }
)

# Use in TestSpec
spec = TestSpec(
    name="Agent Test",
    model="claude-3-5-sonnet-20241022",
    inputs=InputSpec(query="Search for Python tutorials"),
    assertions=[{"must_call_tool": "web_search"}],
    tools=[tool1, tool2]
)
```

---

### Class: `Message`

Conversation message.

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `role` | Literal["user", "assistant", "system"] | ✓ | Message role |
| `content` | str | ✓ | Message content |

#### Example

```python
from backend.core.schema import Message

msg1 = Message(role="user", content="Hello")
msg2 = Message(role="assistant", content="Hi there!")
msg3 = Message(role="system", content="You are helpful.")

# Use in InputSpec
inputs = InputSpec(messages=[msg1, msg2, msg3])
```

## Exceptions

### `ParsingError`

Raised when parsing or validation fails.

**Inherits from:** `Exception`

**Attributes:**
- `message` (str): Error description

**Example:**
```python
from backend.core.parser import TestSpecParser, ParsingError

try:
    spec = TestSpecParser.parse_file("invalid.yaml")
except ParsingError as e:
    print(f"Parse error: {e}")
    # Parse error: 1 validation error for TestSpec
    # name
    #   Field required [type=missing]
```

## Type Hints

All API functions and classes use type hints for IDE support.

```python
from typing import Union
from pathlib import Path

# Parser accepts str or Path
file_path: Union[str, Path] = "test.yaml"
spec = TestSpecParser.parse_file(file_path)

# Parser returns TestSpec or TestSuite
result: Union[TestSpec, TestSuite] = TestSpecParser.parse_file(file_path)

# Type checking
if isinstance(result, TestSuite):
    print(f"Suite with {len(result.tests)} tests")
else:
    print(f"Single test: {result.name}")
```

## Usage Examples

### Example 1: Basic Parsing

```python
from backend.core.parser import TestSpecParser

# Parse from file
spec = TestSpecParser.parse_file("test.yaml")

# Access fields
print(f"Name: {spec.name}")
print(f"Model: {spec.model}")
print(f"Query: {spec.inputs.query}")
print(f"Assertions: {len(spec.assertions)}")
```

### Example 2: Create and Save

```python
from backend.core.schema import TestSpec, InputSpec
from backend.core.parser import TestSpecParser

# Create spec
spec = TestSpec(
    name="My Test",
    model="gpt-4",
    inputs=InputSpec(query="What is AI?"),
    assertions=[
        {"must_contain": "artificial intelligence"},
        {"output_type": "text"}
    ],
    seed=42
)

# Save as YAML
TestSpecParser.write_file(spec, "my_test.yaml")

# Save as JSON
TestSpecParser.write_file(spec, "my_test.json")
```

### Example 3: Load, Modify, Save

```python
# Load existing test
spec = TestSpecParser.parse_file("existing_test.yaml")

# Modify fields
spec.name = "Modified Test"
spec.model = "claude-3-5-sonnet-20241022"
spec.seed = 999

# Add assertion
spec.assertions.append({"max_latency_ms": 2000})

# Save changes
TestSpecParser.write_file(spec, "modified_test.yaml")
```

### Example 4: Validate Multiple Files

```python
from pathlib import Path
from backend.core.parser import TestSpecParser, ParsingError

test_dir = Path("tests")
valid_count = 0
error_count = 0

for test_file in test_dir.glob("*.yaml"):
    try:
        spec = TestSpecParser.parse_file(test_file)
        TestSpecParser.validate_spec(spec)
        print(f"✓ {test_file.name}")
        valid_count += 1
    except ParsingError as e:
        print(f"✗ {test_file.name}: {e}")
        error_count += 1

print(f"\n{valid_count} valid, {error_count} errors")
```

### Example 5: Convert YAML to JSON

```python
# Load YAML
spec = TestSpecParser.parse_file("test.yaml")

# Convert to JSON
json_str = TestSpecParser.to_json(spec, indent=2)
print(json_str)

# Or save directly
TestSpecParser.write_file(spec, "test.json")
```

### Example 6: Create Test Suite

```python
from backend.core.schema import TestSuite, TestSpec, InputSpec, ModelConfig

# Create individual tests
test1 = TestSpec(
    name="Test 1",
    model="gpt-4",
    inputs=InputSpec(query="Query 1"),
    assertions=[{"output_type": "text"}]
)

test2 = TestSpec(
    name="Test 2",
    model="gpt-4",
    inputs=InputSpec(query="Query 2"),
    assertions=[{"output_type": "text"}]
)

# Create suite
suite = TestSuite(
    name="My Suite",
    version="1.0.0",
    tests=[test1, test2],
    defaults=ModelConfig(
        model="gpt-4",
        timeout_ms=5000
    ),
    tags=["suite", "tests"]
)

# Save suite
TestSpecParser.write_file(suite, "suite.yaml")
```

### Example 7: Iterate Through Suite Tests

```python
# Load suite
suite = TestSpecParser.parse_file("suite.yaml")

print(f"Suite: {suite.name}")
print(f"Version: {suite.version}")
print(f"Tests: {len(suite.tests)}")

# Process each test
for i, test in enumerate(suite.tests, 1):
    print(f"\n{i}. {test.name}")
    print(f"   Model: {test.model}")
    print(f"   Assertions: {len(test.assertions)}")

    # Run test (hypothetical)
    # result = run_test(test)
```

### Example 8: Round-Trip Conversion

```python
# Original spec
spec1 = TestSpecParser.parse_file("test.yaml")

# Convert to YAML
yaml_str = TestSpecParser.to_yaml(spec1)

# Parse back
spec2 = TestSpecParser.parse_yaml(yaml_str)

# Verify no data loss
assert spec1.name == spec2.name
assert spec1.model == spec2.model
assert spec1.inputs.query == spec2.inputs.query
assert spec1.assertions == spec2.assertions
print("✓ Round-trip successful, no data loss")
```

## See Also

- [Getting Started Guide](getting-started.md)
- [DSL Reference](dsl-reference.md)
- [Examples Guide](examples.md)
- [Best Practices](best-practices.md)
