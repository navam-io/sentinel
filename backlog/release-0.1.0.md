# Release 0.1.0 - Test Case Spec DSL

**Release Date**: November 15, 2025
**Type**: Minor Release (Initial Feature)

## Overview

This is the first release of Navam Sentinel, establishing the foundation for deterministic agent testing with a comprehensive test specification DSL.

## Features

### ✅ Test Case Spec DSL (Feature 1)

A complete YAML/JSON schema and parser for defining deterministic, reproducible test cases for agents and LLMs.

**Key Capabilities:**

- **Pydantic-based Schema** (`src/sentinel/core/schema.py`)
  - `TestSpec`: Single test specification with full validation
  - `TestSuite`: Collection of related tests with shared defaults
  - `ToolSpec`: Tool definitions for agentic testing
  - `InputSpec`: Flexible input formats (query, messages, context)
  - `ModelConfig`: Model-specific parameters (temperature, max_tokens, etc.)
  - Comprehensive assertion types:
    - Content assertions (`must_contain`, `must_not_contain`, `regex_match`)
    - Tool call assertions (`must_call_tool`)
    - Format assertions (`output_type`)
    - Performance assertions (`max_latency_ms`)
    - Token count assertions (`min_tokens`, `max_tokens`)

- **Parser & Validator** (`src/sentinel/core/parser.py`)
  - `TestSpecParser`: Main parser class with methods for:
    - YAML parsing (`parse_yaml`)
    - JSON parsing (`parse_json`)
    - File parsing with auto-detection (`parse_file`)
    - Serialization (`to_yaml`, `to_json`)
    - File writing (`write_file`)
    - Validation (`validate_spec`)
  - Clear, actionable error messages with field-level validation details
  - Support for both `.yaml`, `.yml`, and `.json` file formats

- **Example Test Specifications** (`examples/test_specs/`)
  - Browser agent product search (multi-tool usage)
  - Simple Q&A (basic prompting)
  - Code generation (structured output)
  - Multi-turn conversation (message history)
  - LangGraph research agent (framework integration)
  - Test suite (grouped tests with defaults)

## Technical Details

### Architecture

- **Language**: Python 3.10+
- **Dependencies**:
  - `pydantic>=2.0.0`: Schema validation and type safety
  - `pyyaml>=6.0.0`: YAML parsing
  - `pydantic-settings>=2.0.0`: Configuration management

### Testing

- **Test Coverage**: 98% (81 tests, all passing)
- **Test Suites**:
  - Unit tests for schema models (`tests/core/test_schema.py`)
  - Unit tests for parser (`tests/core/test_parser.py`)
  - Integration tests for example specs (`tests/integration/test_example_specs.py`)
- **Test Categories**:
  - Schema validation tests (30 tests)
  - Parser functionality tests (28 tests)
  - Example spec tests (12 tests)
  - Round-trip conversion tests (11 tests)

### API Surface

```python
from sentinel.core.schema import TestSpec, TestSuite
from sentinel.core.parser import TestSpecParser

# Parse from file
spec = TestSpecParser.parse_file("test.yaml")

# Parse from string
spec = TestSpecParser.parse_yaml(yaml_content)

# Create programmatically
spec = TestSpec(
    name="My Test",
    model="gpt-4",
    inputs={"query": "Test query"},
    assertions=[{"must_contain": "result"}]
)

# Serialize
yaml_str = TestSpecParser.to_yaml(spec)
```

## Documentation

- Comprehensive README with:
  - Quick start guide
  - Schema reference
  - API documentation
  - Usage examples
  - Development setup instructions

## Installation

```bash
pip install navam-sentinel
```

## Deliverables (Per Spec)

✅ `src/core/schema.py`: Pydantic models for test spec
✅ `src/core/parser.py`: YAML/JSON parser
✅ `tests/test_parser.py`: Parser unit tests (28 tests)
✅ `tests/test_schema.py`: Schema unit tests (30 tests)
✅ `tests/integration/test_example_specs.py`: Integration tests (12 tests)
✅ `examples/test_specs/`: Example test specifications (6 examples)
✅ `README.md`: Complete documentation

## Success Criteria

✅ Valid test specs parse without errors
✅ Invalid specs produce clear validation errors
✅ All tests pass (81/81 tests passing)
✅ At least 3 example test specs provided (6 provided)
✅ 98% test coverage

## Next Steps

The foundation is now in place for upcoming features:

- **Feature 2 (v0.2.0)**: Model Provider Architecture (Anthropic, OpenAI)
- **Feature 3 (v0.3.0)**: Run Executor (local execution)
- **Feature 4 (v0.4.0)**: Assertion Validation Engine

## Breaking Changes

None (initial release)

## Known Issues

None

## Contributors

- Claude Code (AI Development)
- Navam.io Team

---

**Full Changelog**: https://github.com/navam-io/sentinel/releases/tag/v0.1.0
