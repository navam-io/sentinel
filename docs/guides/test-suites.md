# Test Suites Guide

Test suites allow you to organize multiple related tests together with shared configuration and metadata. This guide covers everything you need to know about creating and managing test suites.

## What is a Test Suite?

A **Test Suite** is a collection of test specifications grouped together with:
- **Shared defaults**: Common configuration applied across tests
- **Version tracking**: Track suite evolution over time
- **Metadata**: Description, tags, and organizational information
- **Batch organization**: Run related tests together

## Basic Structure

```yaml
name: "Suite Name"
description: "What this suite tests"
version: "1.0.0"

defaults:
  model: "gpt-4"
  provider: "openai"
  timeout_ms: 5000

tests:
  - name: "Test 1"
    # ... test spec ...

  - name: "Test 2"
    # ... test spec ...
```

## Creating a Test Suite

### Minimal Suite

```yaml
name: "Geography Q&A Suite"

tests:
  - name: "France Capital"
    model: "gpt-4"
    inputs:
      query: "What is the capital of France?"
    assertions:
      - must_contain: "Paris"

  - name: "Japan Capital"
    model: "gpt-4"
    inputs:
      query: "What is the capital of Japan?"
    assertions:
      - must_contain: "Tokyo"
```

### Full-Featured Suite

```yaml
name: "E-commerce Agent Test Suite"
description: |
  Comprehensive tests for e-commerce shopping agent,
  covering product search, comparison, and checkout flows.
version: "2.1.0"

defaults:
  model: "claude-3-5-sonnet-20241022"
  provider: "anthropic"
  timeout_ms: 30000
  tools:
    - browser
    - scraper
    - calculator
  tags:
    - e2e
    - shopping

tests:
  - name: "Product Search - Budget Laptops"
    seed: 100
    inputs:
      query: "Find laptops under $1000"
    assertions:
      - must_contain: "price"
      - must_call_tool: "browser"
      - output_type: "json"

  - name: "Product Comparison"
    seed: 101
    inputs:
      query: "Compare top 2 gaming laptops under $1500"
    assertions:
      - must_contain: "comparison"
      - must_call_tool: ["browser", "calculator"]
      - output_type: "json"

  - name: "Price Tracking"
    seed: 102
    inputs:
      query: "Track price for Dell XPS 15"
    assertions:
      - must_contain: ["Dell", "price"]
      - must_call_tool: "scraper"
      - output_type: "structured"
```

## Suite Fields

### Required Fields

**name** (string, required)
```yaml
name: "My Test Suite"
```

**tests** (array, required, min 1)
```yaml
tests:
  - name: "Test 1"
    # Complete test spec
```

### Optional Fields

**description** (string)
```yaml
description: |
  Detailed description of what this suite tests,
  why it's important, and any special considerations.
```

**version** (string)
```yaml
version: "1.0.0"    # Semantic versioning
version: "2.1.3"
version: "v1"       # Simple version
```

**defaults** (object)
```yaml
defaults:
  model: "gpt-4"
  provider: "openai"
  # Any test spec fields can be defaults
```

**tags** (array)
```yaml
tags:
  - "regression"
  - "critical"
  - "nightly"
```

## Defaults

Defaults are shared configuration values stored with the suite.

**Important:** Currently, defaults are **metadata only** and are NOT automatically applied to tests. Each test must specify all required fields.

```yaml
defaults:
  model: "gpt-4"
  provider: "openai"

tests:
  - name: "Test 1"
    model: "gpt-4"  # Must still specify!
    inputs: {...}
    assertions: [...]
```

### What Can Be a Default?

Any test spec field:

```yaml
defaults:
  # Model configuration
  model: "claude-3-5-sonnet-20241022"
  provider: "anthropic"
  seed: 42

  # Timing
  timeout_ms: 10000

  # Model config
  model_config:
    temperature: 0.7
    max_tokens: 1000

  # Tools
  tools:
    - browser
    - calculator

  # Framework
  framework: "langgraph"

  # Tags
  tags:
    - "regression"
```

### Future: Auto-Applied Defaults

In future versions, defaults may automatically merge with test specs, allowing:

```yaml
defaults:
  model: "gpt-4"

tests:
  - name: "Test 1"
    # model: "gpt-4" auto-applied!
    inputs: {...}
    assertions: [...]
```

## Organizing Tests

### By Feature

```yaml
name: "User Management Suite"

tests:
  - name: "User Registration"
    # ...

  - name: "User Login"
    # ...

  - name: "User Profile Update"
    # ...

  - name: "Password Reset"
    # ...
```

### By Priority

```yaml
name: "Critical Path Suite"
version: "1.0.0"

tags: ["critical", "smoke"]

tests:
  - name: "Homepage Load"
    tags: ["p0"]
    # ...

  - name: "User Login"
    tags: ["p0"]
    # ...

  - name: "Checkout Flow"
    tags: ["p1"]
    # ...
```

### By Model Comparison

```yaml
name: "Model Comparison - Q&A"
description: "Compare different models on same questions"

tests:
  - name: "GPT-4 - Geography"
    model: "gpt-4"
    provider: "openai"
    seed: 42
    inputs:
      query: "Capital of France?"
    assertions:
      - must_contain: "Paris"

  - name: "Claude - Geography"
    model: "claude-3-5-sonnet-20241022"
    provider: "anthropic"
    seed: 42
    inputs:
      query: "Capital of France?"
    assertions:
      - must_contain: "Paris"

  - name: "Llama - Geography"
    model: "llama-3-70b"
    provider: "ollama"
    seed: 42
    inputs:
      query: "Capital of France?"
    assertions:
      - must_contain: "Paris"
```

### By Test Type

```yaml
name: "Agent Regression Suite"

tests:
  # Unit tests
  - name: "Tool Call - Single Step"
    tags: ["unit"]
    # ...

  # Integration tests
  - name: "Multi-Tool Workflow"
    tags: ["integration"]
    # ...

  # End-to-end tests
  - name: "Complete User Journey"
    tags: ["e2e"]
    # ...
```

## Versioning Suites

### Semantic Versioning

Use semantic versioning (MAJOR.MINOR.PATCH):

```yaml
version: "1.0.0"  # Initial release
version: "1.1.0"  # Added new tests (minor)
version: "1.1.1"  # Fixed test bugs (patch)
version: "2.0.0"  # Breaking changes (major)
```

**When to increment:**
- **MAJOR**: Breaking changes (removed tests, changed assertions)
- **MINOR**: New tests added, backward compatible
- **PATCH**: Bug fixes, clarifications, no functional change

### Change Log in Description

```yaml
name: "Core Features Suite"
version: "2.1.0"

description: |
  Core feature regression tests.

  ## Changelog

  ### v2.1.0 (2025-11-15)
  - Added: Multi-language support tests
  - Added: Performance regression tests

  ### v2.0.0 (2025-11-01)
  - BREAKING: Removed deprecated API tests
  - Changed: Updated all assertions for new output format

  ### v1.0.0 (2025-10-15)
  - Initial release
```

## Working with Suites

### Parse a Suite

```python
from sentinel.core.parser import TestSpecParser

suite = TestSpecParser.parse_file("my_suite.yaml")

print(f"Suite: {suite.name}")
print(f"Version: {suite.version}")
print(f"Tests: {len(suite.tests)}")

for test in suite.tests:
    print(f"  - {test.name}")
```

### Access Suite Metadata

```python
suite = TestSpecParser.parse_file("suite.yaml")

print(f"Description: {suite.description}")
print(f"Defaults: {suite.defaults}")
print(f"Tags: {suite.tags}")
```

### Iterate Through Tests

```python
suite = TestSpecParser.parse_file("suite.yaml")

for i, test in enumerate(suite.tests, 1):
    print(f"\n{i}. {test.name}")
    print(f"   Model: {test.model}")
    print(f"   Seed: {test.seed}")
    print(f"   Assertions: {len(test.assertions)}")
```

### Filter Tests by Tags

```python
suite = TestSpecParser.parse_file("suite.yaml")

# Find critical tests
critical_tests = [
    test for test in suite.tests
    if test.tags and "critical" in test.tags
]

print(f"Critical tests: {len(critical_tests)}")
```

### Export Suite

```python
from sentinel.core.schema import TestSuite, TestSpec

# Create suite programmatically
suite = TestSuite(
    name="Generated Suite",
    version="1.0.0",
    tests=[
        TestSpec(
            name="Test 1",
            model="gpt-4",
            inputs={"query": "Q1"},
            assertions=[{"must_contain": "A1"}]
        ),
        TestSpec(
            name="Test 2",
            model="gpt-4",
            inputs={"query": "Q2"},
            assertions=[{"must_contain": "A2"}]
        ),
    ]
)

# Export to YAML
yaml_str = TestSpecParser.to_yaml(suite)
print(yaml_str)

# Save to file
TestSpecParser.write_file(suite, "generated_suite.yaml")
```

## Best Practices

### 1. Use Descriptive Names

```yaml
# Good
name: "E-commerce Checkout Flow - Integration Tests"

# Avoid
name: "Tests"
name: "Suite 1"
```

### 2. Version Your Suites

```yaml
name: "Critical Path Suite"
version: "2.1.0"  # Always include version
```

### 3. Document with Description

```yaml
description: |
  ## Purpose
  Tests critical user paths for the shopping experience.

  ## Coverage
  - Product search
  - Add to cart
  - Checkout flow
  - Order confirmation

  ## Notes
  - Runs on every deploy
  - Must pass before release
```

### 4. Tag Consistently

```yaml
# Suite-level tags (apply to all tests conceptually)
tags: ["regression", "e2e"]

# Test-level tags (specific to that test)
tests:
  - name: "Critical Flow"
    tags: ["critical", "p0"]
```

### 5. Group Related Tests

```yaml
# Good: Cohesive suite
name: "Authentication Suite"
tests:
  - name: "Login"
  - name: "Logout"
  - name: "Password Reset"
  - name: "2FA"

# Avoid: Unrelated tests
name: "Mixed Suite"
tests:
  - name: "Login"
  - name: "Image Processing"  # Unrelated!
  - name: "Database Backup"    # Unrelated!
```

### 6. Use Seeds for Determinism

```yaml
tests:
  - name: "Test 1"
    seed: 100  # Unique seed per test

  - name: "Test 2"
    seed: 101  # Sequential for easy tracking

  - name: "Test 3"
    seed: 102
```

## Common Patterns

### Pattern: Regression Suite

```yaml
name: "Nightly Regression Suite"
version: "3.2.0"
description: "Comprehensive regression tests run nightly"

defaults:
  model: "claude-3-5-sonnet-20241022"
  provider: "anthropic"
  timeout_ms: 30000

tags:
  - "regression"
  - "nightly"

tests:
  # ... dozens of tests ...
```

### Pattern: Feature Suite

```yaml
name: "Code Generation Feature Suite"
version: "1.5.0"
description: "Tests for code generation capabilities"

defaults:
  model: "claude-3-5-sonnet-20241022"
  model_config:
    temperature: 0.2

tags:
  - "code-gen"
  - "feature"

tests:
  - name: "Python Function"
    # ...

  - name: "JavaScript Module"
    # ...

  - name: "SQL Query"
    # ...
```

### Pattern: Safety Suite

```yaml
name: "Safety & Compliance Suite"
version: "2.0.0"
description: "Safety, security, and compliance tests"

tags:
  - "safety"
  - "critical"
  - "compliance"

tests:
  - name: "Jailbreak Resistance"
    tags: ["safety"]
    # ...

  - name: "PII Protection"
    tags: ["privacy"]
    # ...

  - name: "Content Filtering"
    tags: ["safety"]
    # ...
```

### Pattern: Performance Suite

```yaml
name: "Performance Benchmarks"
version: "1.0.0"
description: "Latency and throughput benchmarks"

defaults:
  model: "gpt-4-turbo"

tags:
  - "performance"
  - "benchmarks"

tests:
  - name: "Simple Query Latency"
    assertions:
      - max_latency_ms: 1000

  - name: "Complex Query Latency"
    assertions:
      - max_latency_ms: 5000

  - name: "Long Response Generation"
    assertions:
      - max_latency_ms: 10000
```

## Next Steps

- **[Writing Tests Guide](writing-tests.md)** - Create individual test specs
- **[Examples Gallery](../examples/gallery.md)** - See complete examples
- **[Schema Reference](../reference/schema.md)** - Full TestSuite schema

## Quick Reference

```yaml
# Minimal suite
name: "Suite Name"
tests:
  - name: "Test 1"
    model: "model"
    inputs: {...}
    assertions: [...]

# Full suite
name: "Suite Name"
description: "What it tests"
version: "1.0.0"
tags: ["tag1", "tag2"]

defaults:
  model: "model"
  provider: "provider"
  # ... any test spec fields ...

tests:
  - name: "Test 1"
    # Complete test spec
```

## Troubleshooting

**Q: Why aren't defaults being applied to my tests?**
A: Currently, defaults are metadata only. You must specify all required fields in each test. Auto-application may come in future versions.

**Q: How many tests should be in a suite?**
A: No hard limit, but guidelines:
- Small: 3-10 tests (feature suites)
- Medium: 10-50 tests (regression suites)
- Large: 50+ tests (comprehensive suites)

**Q: Can I nest suites?**
A: Not currently. Each suite is a flat list of tests.

**Q: How do I run a specific test from a suite?**
A: Test execution comes in v0.3.0 (Run Executor), which will support filtering by test name, tags, etc.
