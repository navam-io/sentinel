# Sentinel Documentation

**Version**: 0.2.0
**Last Updated**: November 15, 2025

Welcome to the Sentinel documentation! Sentinel is a visual-first agent testing and evaluation platform for frontier AI labs, neo-labs, and AI research organizations.

## What's New in v0.2.0

This release introduces the **Visual Canvas Foundation** - a complete visual-first interface for building AI agent tests without writing code!

### Key Features

- **🎨 Visual Canvas**: Drag-and-drop node-based test builder
- **🖥️ Desktop App**: Tauri-powered native application
- **🔄 Real-Time YAML**: Live YAML generation as you build
- **📦 Component Palette**: Organized node types (Input, Model, Assertion)
- **💾 Export/Download**: Save tests as YAML files
- **🎯 Zero Code Required**: Build tests visually or with YAML - your choice!

**Plus all v0.1.0 features:**
- YAML/JSON parsing & validation
- Pydantic-based type-safe schema
- 8 assertion types
- 6 example templates
- Python API

## Documentation Structure

### Getting Started
- **[Visual Canvas Guide](visual-canvas.md)** - Complete guide to the visual test builder ⭐ NEW
- **[Getting Started Guide](getting-started.md)** - Installation and first steps
- **[Quick Start](getting-started.md#quick-start)** - Create your first test in 5 minutes

### Reference Documentation
- **[DSL Reference](dsl-reference.md)** - Complete specification of the test DSL
- **[API Reference](api-reference.md)** - Python API documentation
- **[Schema Reference](schema-reference.md)** - Detailed Pydantic model documentation

### Guides & Examples
- **[Examples Guide](examples.md)** - Walkthrough of all example templates
- **[Best Practices](best-practices.md)** - Guidelines for writing effective tests
- **[Migration Guide](migration-guide.md)** - Upgrade guide for future releases

## Quick Links

- [Installation](#installation)
- [Your First Test](#your-first-test)
- [Example Templates](examples.md)
- [DSL Specification](dsl-reference.md)
- [Python API](api-reference.md)

## Installation

### Requirements

- **Python 3.10+**
- **pip** (Python package manager)

### Install from Source

```bash
# Clone the repository
git clone https://github.com/navam-io/sentinel.git
cd sentinel

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt
```

### Verify Installation

```bash
# Run tests to verify installation
pytest tests/ -v

# Should see: 70 passed, 98% coverage
```

## Your First Test

Create a simple Q&A test in 3 steps:

### 1. Create a test file

Create `my_first_test.yaml`:

```yaml
name: "Simple Q&A Test"
model: "gpt-4"
inputs:
  query: "What is the capital of France?"
assertions:
  - must_contain: "Paris"
  - output_type: "text"
```

### 2. Parse and validate

```python
from backend.core.parser import TestSpecParser

# Parse the test file
spec = TestSpecParser.parse_file("my_first_test.yaml")

# Validate it (raises ParsingError if invalid)
TestSpecParser.validate_spec(spec)

print(f"✓ Test '{spec.name}' is valid!")
print(f"  Model: {spec.model}")
print(f"  Query: {spec.inputs.query}")
print(f"  Assertions: {len(spec.assertions)}")
```

### 3. Output

```
✓ Test 'Simple Q&A Test' is valid!
  Model: gpt-4
  Query: What is the capital of France?
  Assertions: 2
```

## What Can You Build?

With the current release, you can:

✅ **Define Test Specifications** in YAML/JSON
✅ **Validate Test Specs** using Pydantic schemas
✅ **Parse YAML/JSON** files and strings
✅ **Serialize to YAML/JSON** for export
✅ **Create Test Suites** with shared configuration
✅ **Build Templates** for reusable test patterns
✅ **Programmatic Access** via Python API

## What's Coming Next?

🔜 **Visual Import & Bidirectional Sync (v0.3.0)**
- YAML → Canvas import
- Monaco editor integration
- Bidirectional sync (Canvas ↔ YAML)
- Split view mode
- Undo/redo support

🔜 **Model Providers & Execution (v0.4.0)**
- Anthropic + OpenAI providers
- Local test execution from canvas
- Live execution dashboard
- Result storage (SQLite/PostgreSQL)
- Metrics collection & visualization

See the [Roadmap](../backlog/active.md) for complete feature list.

## Example Use Cases

### 1. Simple Q&A Testing

Test factual knowledge with text matching:

```yaml
name: "Capital Cities Q&A"
model: "gpt-4"
seed: 123
inputs:
  query: "What is the capital of Japan?"
assertions:
  - must_contain: "Tokyo"
  - output_type: "text"
  - max_latency_ms: 2000
```

### 2. Code Generation

Test code generation with multiple assertions:

```yaml
name: "Python Function Generation"
model: "claude-3-5-sonnet-20241022"
inputs:
  query: "Write a Python function to calculate fibonacci numbers"
assertions:
  - must_contain: "def"
  - must_contain: "fibonacci"
  - regex_match: "def\\s+\\w+\\([^)]*\\):"
  - output_type: "code"
```

### 3. Browser Agent Testing

Test agent tool usage:

```yaml
name: "Product Research Agent"
model: "claude-3-5-sonnet-20241022"
tools:
  - browser
  - scraper
inputs:
  query: "Find top 3 laptops under $1000"
assertions:
  - must_call_tool: ["browser"]
  - must_contain: "price"
  - output_type: "json"
```

### 4. Multi-Turn Conversations

Test context retention:

```yaml
name: "Customer Support Conversation"
model: "gpt-4-turbo"
inputs:
  messages:
    - role: "user"
      content: "I need help with order #12345"
    - role: "assistant"
      content: "Let me look that up for you."
    - role: "user"
      content: "When will it arrive?"
assertions:
  - must_contain: "order"
  - must_contain: "12345"
```

### 5. Test Suites

Organize multiple tests with shared configuration:

```yaml
name: "E-commerce Agent Test Suite"
version: "1.0.0"
defaults:
  model: "claude-3-5-sonnet-20241022"
  provider: "anthropic"
  timeout_ms: 30000

tests:
  - name: "Product search"
    inputs:
      query: "Find laptops under $1000"
    assertions:
      - must_contain: "price"

  - name: "Product comparison"
    inputs:
      query: "Compare top 2 gaming laptops"
    assertions:
      - must_contain: "comparison"
```

## Core Concepts

### Test Specification (TestSpec)

A **TestSpec** defines a single test case with:
- **Model configuration**: Which model to test
- **Inputs**: Query, messages, or context
- **Assertions**: Expected behavior validation
- **Optional settings**: Tools, framework, timeout, etc.

### Test Suite (TestSuite)

A **TestSuite** is a collection of tests with:
- **Shared defaults**: Common configuration for all tests
- **Multiple tests**: Organized test cases
- **Version tracking**: Suite versioning
- **Metadata**: Name, description, tags

### Assertions

Assertions validate test outputs:
- `must_contain` / `must_not_contain` - Text matching
- `regex_match` - Pattern matching
- `must_call_tool` - Tool invocation verification
- `output_type` - Format validation (json, text, markdown, code, structured)
- `max_latency_ms` - Performance thresholds
- `min_tokens` / `max_tokens` - Token count validation

### Model Providers

Supported providers (schema defined, execution in future releases):
- **Anthropic** - Claude models
- **OpenAI** - GPT models
- **Bedrock** - Multi-model support (planned)
- **HuggingFace** - Hosted endpoints (planned)
- **Ollama** - Local models (planned)

### Agentic Frameworks

Supported frameworks (schema defined, execution in future releases):
- **LangGraph** - State-based agents
- **Claude Agent SDK** - Anthropic agents (planned)
- **OpenAI Agents SDK** - OpenAI agents (planned)
- **Strands Agents** - Strands platform (planned)

## API Overview

### Parsing

```python
from backend.core.parser import TestSpecParser

# Parse from file
spec = TestSpecParser.parse_file("test.yaml")

# Parse from string
yaml_str = "name: Test\nmodel: gpt-4\n..."
spec = TestSpecParser.parse_yaml(yaml_str)

# Parse JSON
json_str = '{"name": "Test", "model": "gpt-4", ...}'
spec = TestSpecParser.parse_json(json_str)
```

### Serialization

```python
# Convert to YAML
yaml_str = TestSpecParser.to_yaml(spec)

# Convert to JSON
json_str = TestSpecParser.to_json(spec)

# Write to file
TestSpecParser.write_file(spec, "output.yaml")
```

### Validation

```python
# Validate spec (raises ParsingError if invalid)
TestSpecParser.validate_spec(spec)

# Access validated fields
print(spec.name)        # str
print(spec.model)       # str
print(spec.inputs)      # InputSpec
print(spec.assertions)  # List[Dict[str, Any]]
```

### Creating Specs Programmatically

```python
from backend.core.schema import TestSpec, InputSpec

# Create a test spec
spec = TestSpec(
    name="My Test",
    model="gpt-4",
    inputs=InputSpec(query="What is 2+2?"),
    assertions=[
        {"must_contain": "4"},
        {"output_type": "text"}
    ],
    tags=["math", "simple"],
    seed=42
)

# Export to YAML
yaml_output = TestSpecParser.to_yaml(spec)
print(yaml_output)
```

## Support & Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/navam-io/sentinel/issues)
- **Documentation**: [Full docs](README.md)
- **Examples**: [Template gallery](examples.md)
- **API Reference**: [Python API](api-reference.md)

## License

MIT License - See [LICENSE](../LICENSE) file for details.

## Next Steps

Ready to dive deeper? Check out:

1. **[Getting Started Guide](getting-started.md)** - Detailed installation and setup
2. **[DSL Reference](dsl-reference.md)** - Complete specification
3. **[Examples Guide](examples.md)** - Learn from templates
4. **[Best Practices](best-practices.md)** - Write effective tests
5. **[API Reference](api-reference.md)** - Python API documentation
