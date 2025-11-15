# Navam Sentinel

**Unified agent regression and evaluation platform for AI labs**

Sentinel combines agent regression testing with deep evaluation capabilities, providing deterministic, repeatable testing for AI agents and models.

## Core Value Proposition

**"GitHub Actions + Jest + Safety Playground + Benchmark Studio — for AI agents + models"**

## Features (v0.1.0)

### ✅ Test Case Spec DSL

Define deterministic, reproducible test cases for agents and LLMs using YAML or JSON.

**Key capabilities:**
- YAML/JSON schema for test specifications
- Pydantic-based validation with clear error messages
- Support for single test specs and test suites
- Comprehensive assertion types
- Model and framework configuration
- Tool specifications for agentic testing

## Installation

```bash
pip install navam-sentinel
```

## Quick Start

### 1. Create a Test Specification

Create a file `my_test.yaml`:

```yaml
name: "Simple Q&A Test"
model: "gpt-4"
provider: "openai"
seed: 42

inputs:
  query: "What is the capital of France?"

assertions:
  - must_contain: "Paris"
  - output_type: "text"
  - max_latency_ms: 2000
```

### 2. Parse and Validate

```python
from sentinel.core.parser import TestSpecParser

# Parse from file
spec = TestSpecParser.parse_file("my_test.yaml")

# Or parse from string
yaml_content = """
name: "My Test"
model: "claude-3-5-sonnet-20241022"
inputs:
  query: "Test query"
assertions:
  - must_contain: "result"
"""
spec = TestSpecParser.parse_yaml(yaml_content)

# Access spec fields
print(f"Test: {spec.name}")
print(f"Model: {spec.model}")
print(f"Query: {spec.inputs.query}")
```

### 3. Programmatic Test Creation

```python
from sentinel.core.schema import TestSpec

spec = TestSpec(
    name="Programmatic Test",
    model="gpt-4",
    provider="openai",
    seed=123,
    inputs={"query": "What is 2+2?"},
    assertions=[
        {"must_contain": "4"},
        {"output_type": "text"},
    ],
    tags=["math", "simple"]
)

# Export to YAML
yaml_str = TestSpecParser.to_yaml(spec)
print(yaml_str)
```

## Test Spec Schema

### Core Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Test case name |
| `model` | string | ✅ | Model identifier (e.g., "gpt-4", "claude-3-5-sonnet-20241022") |
| `inputs` | object | ✅ | Input parameters (query, messages, context, etc.) |
| `assertions` | array | ✅ | Validation rules for outputs |
| `provider` | string | | Model provider (anthropic, openai, bedrock, etc.) |
| `seed` | integer | | Random seed for deterministic execution |
| `model_config` | object | | Model-specific parameters (temperature, max_tokens, etc.) |
| `tools` | array | | Available tools for the agent |
| `framework` | string | | Agentic framework (langgraph, claude_sdk, etc.) |
| `framework_config` | object | | Framework-specific configuration |
| `tags` | array | | Tags for categorization |
| `timeout_ms` | integer | | Maximum execution timeout |

### Input Formats

```yaml
# Simple query
inputs:
  query: "Your question here"

# Multi-turn conversation
inputs:
  messages:
    - role: "user"
      content: "First message"
    - role: "assistant"
      content: "Response"
    - role: "user"
      content: "Follow-up"
  system_prompt: "You are a helpful assistant"

# With context
inputs:
  query: "Your question"
  context:
    user_id: "123"
    session_data: {...}
```

### Assertion Types

```yaml
assertions:
  # Content assertions
  - must_contain: "expected text"
  - must_contain: ["text1", "text2"]  # All must be present
  - must_not_contain: "forbidden text"
  - regex_match: "pattern.*here"

  # Tool call assertions
  - must_call_tool: "browser"
  - must_call_tool: ["browser", "calculator"]

  # Format assertions
  - output_type: "json"  # json, text, markdown, code, structured

  # Performance assertions
  - max_latency_ms: 5000

  # Token count assertions
  - min_tokens: 10
  - max_tokens: 500
```

### Model Configuration

```yaml
model_config:
  temperature: 0.7      # 0.0 - 2.0
  max_tokens: 1000      # Maximum tokens to generate
  top_p: 0.9           # Nucleus sampling
  top_k: 50            # Top-k sampling
  stop_sequences: ["STOP", "END"]
```

### Tools and Frameworks

```yaml
# Simple tool names
tools:
  - browser
  - calculator
  - scraper

# Full tool specifications
tools:
  - name: "web_search"
    description: "Search the web"
    parameters:
      type: "object"
      properties:
        query:
          type: "string"
      required: ["query"]

# Agentic framework
framework: "langgraph"
framework_config:
  max_iterations: 5
  intermediate_steps: true
```

### Test Suites

Group multiple tests together with shared configuration:

```yaml
name: "E-commerce Test Suite"
version: "1.0.0"
defaults:
  model: "claude-3-5-sonnet-20241022"
  provider: "anthropic"
  timeout_ms: 30000
  tools:
    - browser
    - calculator

tests:
  - name: "Product search"
    seed: 100
    inputs:
      query: "Find laptops under $1000"
    assertions:
      - must_contain: "price"
      - must_call_tool: "browser"

  - name: "Product comparison"
    seed: 101
    inputs:
      query: "Compare top 2 gaming laptops"
    assertions:
      - must_contain: "comparison"
      - must_call_tool: "calculator"
```

## Examples

See the [`examples/test_specs/`](examples/test_specs/) directory for complete examples:

- **Browser Agent**: Product research with tools
- **Simple Q&A**: Basic factual question answering
- **Code Generation**: Python function generation
- **Multi-turn Conversation**: Customer support dialogue
- **LangGraph Agent**: Research agent with web search
- **Test Suite**: Multiple related tests

## API Reference

### `TestSpecParser`

Main parser class for test specifications.

**Methods:**

- `parse_yaml(content: str) -> TestSpec | TestSuite`
  Parse YAML string into test spec or suite

- `parse_json(content: str) -> TestSpec | TestSuite`
  Parse JSON string into test spec or suite

- `parse_file(file_path: str | Path) -> TestSpec | TestSuite`
  Parse test spec from file (auto-detects format)

- `to_yaml(spec: TestSpec | TestSuite) -> str`
  Convert test spec to YAML string

- `to_json(spec: TestSpec | TestSuite, indent: int = 2) -> str`
  Convert test spec to JSON string

- `write_file(spec: TestSpec | TestSuite, file_path: str | Path, format: str = "yaml")`
  Write test spec to file

- `validate_spec(spec: TestSpec | TestSuite) -> bool`
  Validate an existing test spec

### Error Handling

```python
from sentinel.core.parser import ParsingError

try:
    spec = TestSpecParser.parse_file("test.yaml")
except ParsingError as e:
    print(f"Validation failed: {e}")
    # Access detailed errors
    for error in e.errors:
        print(f"  - {error}")
except FileNotFoundError:
    print("File not found")
```

## Development

### Setup

```bash
# Clone repository
git clone https://github.com/navam-io/sentinel.git
cd sentinel

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install with dev dependencies
pip install -e ".[dev]"
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=sentinel --cov-report=html

# Run specific test file
pytest tests/core/test_parser.py

# Run specific test
pytest tests/core/test_schema.py::TestTestSpec::test_minimal_test_spec
```

### Code Quality

```bash
# Format code
black src/ tests/

# Lint
ruff src/ tests/

# Type checking
mypy src/
```

## Roadmap

See [backlog/active.md](backlog/active.md) for the complete development roadmap.

**Coming in v0.2.0+:**
- Model Provider Architecture (Anthropic, OpenAI)
- Run Executor (local execution)
- Assertion Validation Engine
- Agentic Framework Support (LangGraph)
- Regression Engine
- CLI Interface
- Web Dashboard

## Target Users

- **Frontier Model Labs**: Testing model releases and capabilities
- **Neo-labs**: Agent-focused research organizations
- **Agent Product Labs**: Building production agent applications
- **Enterprise AI Teams**: Internal AI infrastructure testing
- **Researchers**: Model evaluation and safety research

## Design Principles

### Security & Privacy First
- Air-gapped deployment support
- GPU-side execution
- Logs remain in customer VPC
- Full control over model outputs
- No vendor lock-in

### Deterministic & Reproducible
- Seeded randomization
- Prompt versioning
- Structured output validation
- Repeatable environments

### LLM-Oriented Development
- YAML-based specs optimized for AI generation
- Simple, minimal component designs
- Fast iteration workflows

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please see our contributing guidelines (coming soon).

## Support

- Issues: https://github.com/navam-io/sentinel/issues
- Documentation: https://docs.navam.io/sentinel (coming soon)
- Email: hello@navam.io
