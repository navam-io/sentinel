# API Reference

Python API reference for Navam Sentinel v0.1.0.

## Module: `sentinel.core.schema`

Data models for test specifications.

### Classes

#### TestSpec

Complete test specification model.

```python
from sentinel.core.schema import TestSpec

spec = TestSpec(
    name="My Test",
    model="gpt-4",
    inputs={"query": "Test query"},
    assertions=[{"must_contain": "result"}]
)
```

**Constructor Parameters:**
- `name` (str, required): Test name
- `model` (str, required): Model identifier
- `inputs` (dict, required): Input specification
- `assertions` (list[dict], required): Assertion rules
- `description` (str, optional): Test description
- `provider` (str, optional): Model provider
- `seed` (int, optional): Random seed
- `model_config` (dict, optional): Model configuration
- `tools` (list, optional): Tool specifications
- `framework` (str, optional): Framework identifier
- `framework_config` (dict, optional): Framework config
- `tags` (list[str], optional): Tags
- `timeout_ms` (int, optional): Timeout in milliseconds

**Methods:**

```python
# Export to dictionary
spec_dict = spec.model_dump()

# Export to JSON
spec_json = spec.model_dump_json(indent=2)

# Exclude None values
spec_dict = spec.model_dump(exclude_none=True)
```

#### TestSuite

Collection of test specifications.

```python
from sentinel.core.schema import TestSuite, TestSpec

suite = TestSuite(
    name="My Suite",
    tests=[
        TestSpec(
            name="Test 1",
            model="gpt-4",
            inputs={"query": "Q1"},
            assertions=[{"must_contain": "A1"}]
        )
    ]
)
```

**Constructor Parameters:**
- `name` (str, required): Suite name
- `tests` (list[TestSpec], required): Test specifications
- `description` (str, optional): Suite description
- `version` (str, optional): Suite version
- `defaults` (dict, optional): Default values
- `tags` (list[str], optional): Suite tags

**Methods:**
Same as TestSpec (model_dump, model_dump_json)

#### InputSpec

Input parameters for test cases.

```python
from sentinel.core.schema import InputSpec

# Simple query
inputs = InputSpec(query="What is 2+2?")

# Multi-turn conversation
inputs = InputSpec(
    messages=[
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hi!"}
    ]
)

# With context
inputs = InputSpec(
    query="User info",
    context={"user_id": "123"}
)
```

#### ModelConfig

Model configuration parameters.

```python
from sentinel.core.schema import ModelConfig

config = ModelConfig(
    temperature=0.7,
    max_tokens=1000,
    top_p=0.9
)
```

#### ToolSpec

Tool specification.

```python
from sentinel.core.schema import ToolSpec

tool = ToolSpec(
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

### Assertion Models

All assertion types for type safety:

```python
from sentinel.core.schema import (
    MustContainAssertion,
    MustNotContainAssertion,
    RegexMatchAssertion,
    MustCallToolAssertion,
    OutputTypeAssertion,
    MaxLatencyAssertion,
    MinTokensAssertion,
    MaxTokensAssertion,
)

# Create assertions
assert1 = MustContainAssertion(must_contain="Paris")
assert2 = MaxLatencyAssertion(max_latency_ms=3000)
assert3 = OutputTypeAssertion(output_type="json")
```

## Module: `sentinel.core.parser`

Parsing and validation for test specifications.

### Classes

#### TestSpecParser

Main parser class for YAML/JSON test specifications.

**Class Methods:**

##### parse_yaml()

Parse YAML string into TestSpec or TestSuite.

```python
from sentinel.core.parser import TestSpecParser

yaml_content = """
name: "Test"
model: "gpt-4"
inputs:
  query: "Test query"
assertions:
  - must_contain: "result"
"""

spec = TestSpecParser.parse_yaml(yaml_content)
```

**Parameters:**
- `content` (str): YAML string

**Returns:** TestSpec | TestSuite

**Raises:** ParsingError if invalid

##### parse_json()

Parse JSON string into TestSpec or TestSuite.

```python
import json

json_content = json.dumps({
    "name": "Test",
    "model": "gpt-4",
    "inputs": {"query": "Test"},
    "assertions": [{"must_contain": "result"}]
})

spec = TestSpecParser.parse_json(json_content)
```

**Parameters:**
- `content` (str): JSON string

**Returns:** TestSpec | TestSuite

**Raises:** ParsingError if invalid

##### parse_file()

Parse test specification from file.

```python
# Auto-detects format from extension
spec = TestSpecParser.parse_file("test.yaml")
spec = TestSpecParser.parse_file("test.json")

# Works with Path objects
from pathlib import Path
spec = TestSpecParser.parse_file(Path("tests/my_test.yaml"))
```

**Parameters:**
- `file_path` (str | Path): Path to test spec file

**Returns:** TestSpec | TestSuite

**Raises:**
- `FileNotFoundError`: File doesn't exist
- `ParsingError`: Invalid format or validation failed

**Supported Extensions:**
- `.yaml`, `.yml`: YAML format
- `.json`: JSON format

##### to_yaml()

Convert TestSpec or TestSuite to YAML string.

```python
spec = TestSpec(...)
yaml_str = TestSpecParser.to_yaml(spec)
print(yaml_str)
```

**Parameters:**
- `spec` (TestSpec | TestSuite): Specification to serialize

**Returns:** str (YAML format)

##### to_json()

Convert TestSpec or TestSuite to JSON string.

```python
spec = TestSpec(...)
json_str = TestSpecParser.to_json(spec, indent=2)
print(json_str)
```

**Parameters:**
- `spec` (TestSpec | TestSuite): Specification to serialize
- `indent` (int, optional): JSON indentation (default: 2)

**Returns:** str (JSON format)

##### write_file()

Write TestSpec or TestSuite to file.

```python
spec = TestSpec(...)

# Write as YAML
TestSpecParser.write_file(spec, "output.yaml", format="yaml")

# Write as JSON
TestSpecParser.write_file(spec, "output.json", format="json")

# Auto-detects from extension
TestSpecParser.write_file(spec, "output.yaml")
```

**Parameters:**
- `spec` (TestSpec | TestSuite): Specification to write
- `file_path` (str | Path): Output file path
- `format` (str, optional): "yaml" or "json" (auto-detects if omitted)

**Side Effects:**
- Creates parent directories if they don't exist
- Overwrites existing file

##### validate_spec()

Validate an already-parsed specification.

```python
spec = TestSpec(...)

try:
    is_valid = TestSpecParser.validate_spec(spec)
    print("✓ Valid!")
except ParsingError as e:
    print(f"Validation failed: {e}")
```

**Parameters:**
- `spec` (TestSpec | TestSuite): Specification to validate

**Returns:** bool (True if valid)

**Raises:** ParsingError if invalid

### Exceptions

#### ParsingError

Raised when parsing or validation fails.

```python
from sentinel.core.parser import ParsingError

try:
    spec = TestSpecParser.parse_file("invalid.yaml")
except ParsingError as e:
    print(f"Error: {e}")
    # Access detailed errors
    for error in e.errors:
        print(f"  - {error}")
```

**Attributes:**
- `message` (str): Human-readable error message
- `errors` (list[dict]): Detailed validation errors

## Usage Examples

### Example 1: Parse and Validate

```python
from sentinel.core.parser import TestSpecParser, ParsingError

try:
    spec = TestSpecParser.parse_file("my_test.yaml")
    print(f"✓ Valid test: {spec.name}")
    print(f"  Model: {spec.model}")
    print(f"  Assertions: {len(spec.assertions)}")
except FileNotFoundError:
    print("✗ File not found")
except ParsingError as e:
    print(f"✗ Validation failed:\n{e}")
```

### Example 2: Create and Export

```python
from sentinel.core.schema import TestSpec
from sentinel.core.parser import TestSpecParser

# Create programmatically
spec = TestSpec(
    name="Generated Test",
    model="gpt-4",
    provider="openai",
    seed=42,
    inputs={"query": "What is 2+2?"},
    assertions=[
        {"must_contain": "4"},
        {"output_type": "text"}
    ],
    tags=["math", "simple"]
)

# Export to YAML
yaml_str = TestSpecParser.to_yaml(spec)
print(yaml_str)

# Save to file
TestSpecParser.write_file(spec, "generated.yaml")
```

### Example 3: Work with Test Suites

```python
from sentinel.core.schema import TestSuite, TestSpec
from sentinel.core.parser import TestSpecParser

# Parse suite
suite = TestSpecParser.parse_file("suite.yaml")

print(f"Suite: {suite.name} v{suite.version}")
print(f"Tests: {len(suite.tests)}")

# Iterate through tests
for i, test in enumerate(suite.tests, 1):
    print(f"{i}. {test.name}")
    print(f"   Model: {test.model}")
    print(f"   Seed: {test.seed}")
```

### Example 4: Error Handling

```python
from sentinel.core.parser import TestSpecParser, ParsingError

yaml_content = """
name: "Invalid Test"
model: ""  # Empty - invalid!
inputs:
  query: "Test"
assertions: []  # Empty - invalid!
"""

try:
    spec = TestSpecParser.parse_yaml(yaml_content)
except ParsingError as e:
    print("Validation errors:")
    for error in e.errors:
        field = " -> ".join(str(x) for x in error["loc"])
        message = error["msg"]
        print(f"  • {field}: {message}")
```

### Example 5: Format Conversion

```python
from sentinel.core.parser import TestSpecParser

# Load YAML
spec = TestSpecParser.parse_file("test.yaml")

# Convert to JSON
json_str = TestSpecParser.to_json(spec)

# Save as JSON
TestSpecParser.write_file(spec, "test.json", format="json")
```

### Example 6: Programmatic Suite Creation

```python
from sentinel.core.schema import TestSuite, TestSpec
from sentinel.core.parser import TestSpecParser

# Create suite programmatically
tests = []
for i in range(1, 6):
    test = TestSpec(
        name=f"Test {i}",
        model="gpt-4",
        seed=100 + i,
        inputs={"query": f"Question {i}"},
        assertions=[{"must_contain": f"answer{i}"}]
    )
    tests.append(test)

suite = TestSuite(
    name="Generated Suite",
    version="1.0.0",
    defaults={"model": "gpt-4", "provider": "openai"},
    tests=tests
)

# Export
TestSpecParser.write_file(suite, "generated_suite.yaml")
```

## Type Hints

All APIs are fully type-hinted:

```python
from typing import Union
from pathlib import Path
from sentinel.core.schema import TestSpec, TestSuite
from sentinel.core.parser import TestSpecParser

# Parsing returns union type
spec: Union[TestSpec, TestSuite] = TestSpecParser.parse_file("test.yaml")

# Check type
if isinstance(spec, TestSpec):
    print(f"Single test: {spec.name}")
elif isinstance(spec, TestSuite):
    print(f"Suite with {len(spec.tests)} tests")
```

## See Also

- [Schema Reference](schema.md) - Complete schema documentation
- [Quick Start Guide](../guides/quickstart.md) - Usage tutorial
- [Examples Gallery](../examples/gallery.md) - Real-world examples
