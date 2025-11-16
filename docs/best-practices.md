# Best Practices

Guidelines for writing effective AI agent tests with Sentinel.

## Table of Contents

- [General Principles](#general-principles)
- [Test Design](#test-design)
- [Assertions](#assertions)
- [Test Organization](#test-organization)
- [Performance](#performance)
- [Reproducibility](#reproducibility)
- [Documentation](#documentation)
- [Common Pitfalls](#common-pitfalls)

## General Principles

### 1. Keep Tests Focused

Each test should validate one specific behavior or capability.

**Good:**
```yaml
name: "Test JSON output format"
model: "gpt-4"
inputs:
  query: "List 3 programming languages in JSON"
assertions:
  - output_type: "json"
  - regex_match: "\\[.*\\]"
```

**Bad:**
```yaml
name: "Test everything"
model: "gpt-4"
inputs:
  query: "List programming languages, calculate 2+2, and write a poem"
assertions:
  - must_contain: "Python"
  - must_contain: "4"
  - must_contain: "poem"
```

### 2. Make Tests Deterministic

Use seeds for reproducible results.

**Good:**
```yaml
name: "Reproducible Test"
model: "gpt-4"
seed: 42  # Same results every run
inputs:
  query: "Generate a random number"
```

**Bad:**
```yaml
name: "Non-deterministic Test"
model: "gpt-4"
# No seed - results vary every run
inputs:
  query: "Generate a random number"
```

### 3. Use Descriptive Names

Names should clearly describe what is being tested.

**Good:**
```yaml
name: "Code Generation - Python Sorting Function with Docstring"
```

**Bad:**
```yaml
name: "Test 1"
name: "My Test"
name: "Agent Test"
```

### 4. Add Descriptions

Explain the purpose and expected behavior.

**Good:**
```yaml
name: "Multi-turn Context Retention"
description: "Tests agent's ability to maintain context across 3 conversation turns, specifically remembering the order number mentioned in turn 1"
```

**Bad:**
```yaml
name: "Context Test"
# No description
```

## Test Design

### Choose the Right Input Type

#### Use `query` for Simple Interactions

```yaml
inputs:
  query: "What is the capital of France?"
```

**When to use:**
- Single-turn questions
- Direct commands
- Simple prompts

#### Use `messages` for Conversations

```yaml
inputs:
  messages:
    - role: "user"
      content: "I need help with my order"
    - role: "assistant"
      content: "I can help. What's your order number?"
    - role: "user"
      content: "It's #12345"
```

**When to use:**
- Multi-turn conversations
- Testing context retention
- Dialogue systems

#### Use `system_prompt` to Set Behavior

```yaml
inputs:
  query: "Write a function to reverse a string"
  system_prompt: "You are an expert Python programmer. Write clean, efficient, well-documented code following PEP 8."
```

**When to use:**
- Setting agent personality/role
- Providing instructions
- Constraining output format

#### Use `context` for Structured Data

```yaml
inputs:
  query: "Find relevant products"
  context:
    budget: 1000
    category: "laptops"
    min_ram: "16GB"
    preferences: ["gaming", "portable"]
```

**When to use:**
- Structured parameters
- Rich metadata
- Complex constraints

### Design Effective Prompts

#### Be Specific

**Good:**
```yaml
query: "Write a Python function named 'fibonacci' that calculates the nth Fibonacci number using dynamic programming. Include a docstring explaining the algorithm."
```

**Bad:**
```yaml
query: "Write code"
```

#### Provide Context When Needed

**Good:**
```yaml
query: "Summarize the main benefits of the product"
context:
  product_name: "MacBook Pro 16-inch"
  target_audience: "software developers"
  key_features: ["M3 chip", "32GB RAM", "Retina display"]
```

#### Test Edge Cases

```yaml
# Test empty input handling
- name: "Empty Query Handling"
  inputs:
    query: ""
  assertions:
    - must_contain: "question"  # Expects polite prompt

# Test long inputs
- name: "Long Context Handling"
  inputs:
    query: "Summarize this"
    context:
      text: "..." # Very long text (2000+ words)
  assertions:
    - max_tokens: 500  # Should be concise
```

## Assertions

### Use Multiple Assertion Types

Combine different assertion types for robust validation.

**Good:**
```yaml
assertions:
  # Content validation
  - must_contain: "function"
  - must_not_contain: "error"

  # Structure validation
  - regex_match: "def\\s+\\w+\\([^)]*\\):"

  # Format validation
  - output_type: "code"

  # Performance validation
  - max_latency_ms: 3000
```

**Bad:**
```yaml
assertions:
  - must_contain: "something"  # Only one basic check
```

### Be Specific with Text Matching

**Good:**
```yaml
assertions:
  # Check for specific expected answer
  - must_contain: "Paris"

  # Ensure wrong answers aren't present
  - must_not_contain: "London"
  - must_not_contain: "Berlin"
```

**Bad:**
```yaml
assertions:
  # Too vague - many things contain "P"
  - must_contain: "P"
```

### Use Regex for Structure Validation

**Good:**
```yaml
assertions:
  # Validate email format
  - regex_match: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"

  # Validate date format (YYYY-MM-DD)
  - regex_match: "\\d{4}-\\d{2}-\\d{2}"

  # Validate function definition
  - regex_match: "def\\s+\\w+\\([^)]*\\):"
```

### Validate Tool Usage

```yaml
assertions:
  # Agent must use browser tool
  - must_call_tool: "browser"

  # Agent must use multiple tools
  - must_call_tool: ["browser", "calculator"]
```

### Set Reasonable Performance Thresholds

**Good:**
```yaml
assertions:
  # Simple Q&A - should be fast
  - max_latency_ms: 2000

  # Complex agent workflow - allow more time
  - max_latency_ms: 30000
```

**Bad:**
```yaml
assertions:
  # Too strict for complex workflow
  - max_latency_ms: 100

  # Too lenient - defeats purpose of testing
  - max_latency_ms: 300000  # 5 minutes
```

## Test Organization

### Use Test Suites for Related Tests

```yaml
name: "Customer Support Test Suite"
version: "1.0.0"

defaults:
  model: "gpt-4-turbo"
  provider: "openai"
  timeout_ms: 5000
  tags:
    - customer-support

tests:
  - name: "Order Status Inquiry"
    # ...

  - name: "Return Request"
    # ...

  - name: "Product Questions"
    # ...
```

### Group by Feature or Capability

```bash
tests/
├── qa/
│   ├── factual_qa.yaml
│   ├── reasoning_qa.yaml
│   └── math_qa.yaml
├── code_generation/
│   ├── python.yaml
│   ├── javascript.yaml
│   └── rust.yaml
└── agents/
    ├── browser_agent.yaml
    ├── research_agent.yaml
    └── shopping_agent.yaml
```

### Use Consistent Naming Conventions

**Good:**
```
simple_qa.yaml
code_generation_python.yaml
browser_agent_shopping.yaml
multi_turn_customer_support.yaml
```

**Bad:**
```
test1.yaml
MyTest.yaml
AGENT_TEST.yaml
test-file.yaml
```

### Tag Tests Appropriately

```yaml
tags:
  - capability: "code-generation"  # What capability
  - language: "python"              # Specific technology
  - complexity: "medium"            # Difficulty level
  - priority: "p0"                  # Importance
```

## Performance

### Set Appropriate Timeouts

```yaml
# Simple Q&A
timeout_ms: 5000    # 5 seconds

# Code generation
timeout_ms: 10000   # 10 seconds

# Multi-step agent workflow
timeout_ms: 60000   # 60 seconds
```

### Use Token Limits Wisely

**Good:**
```yaml
model_config:
  max_tokens: 500  # Brief summary expected

assertions:
  - max_tokens: 600  # Allow slight overage
  - min_tokens: 100  # But not too brief
```

**Bad:**
```yaml
model_config:
  max_tokens: 10  # Too restrictive

assertions:
  - min_tokens: 5000  # Expects novel-length output
```

### Test Latency Expectations

```yaml
# Interactive use case - needs fast response
assertions:
  - max_latency_ms: 1000

# Batch processing - can be slower
assertions:
  - max_latency_ms: 30000
```

## Reproducibility

### Always Set Seeds

```yaml
seed: 42  # Reproducible results
```

### Version Your Test Suites

```yaml
name: "Agent Test Suite"
version: "1.2.0"  # Semantic versioning
```

### Document Model Versions

```yaml
model: "claude-3-5-sonnet-20241022"  # Specific version
# Not: "claude-3-5-sonnet" (vague)
```

### Pin Temperature for Determinism

```yaml
model_config:
  temperature: 0.0  # Most deterministic
```

**Or:**
```yaml
model_config:
  temperature: 0.7
seed: 42  # Reproducible despite higher temperature
```

## Documentation

### Add Test Descriptions

```yaml
name: "Browser Agent - Product Comparison"
description: |
  Tests the agent's ability to:
  1. Search for products in a category
  2. Compare specifications
  3. Filter by budget constraints
  4. Return structured JSON output

  Expected flow:
  - Use browser tool to search e-commerce sites
  - Use calculator tool to compare prices
  - Return top 3 results in JSON format
```

### Comment Complex Assertions

```yaml
assertions:
  # Verify function definition exists
  - regex_match: "def\\s+\\w+\\([^)]*\\):"

  # Check for docstring (triple quotes)
  - regex_match: '"""[^"]+"""'

  # Ensure PEP 8 compliance - function name is snake_case
  - regex_match: "def\\s+[a-z_][a-z0-9_]*\\("
```

### Include Usage Examples

```yaml
# This test validates code generation for sorting algorithms.
# Usage:
#   python run_test.py tests/code_generation/sorting.yaml
#
# Expected output:
#   - Python function with proper docstring
#   - Time complexity comment
#   - Example usage in docstring
```

## Common Pitfalls

### Pitfall 1: Over-Specific Assertions

**Problem:**
```yaml
assertions:
  # Too specific - will fail on minor wording changes
  - must_contain: "The capital of France is Paris."
```

**Solution:**
```yaml
assertions:
  # More flexible - captures the key fact
  - must_contain: "Paris"
  - must_contain: "capital"
  - must_contain: "France"
```

### Pitfall 2: Flaky Tests

**Problem:**
```yaml
# No seed - different results every run
model: "gpt-4"
inputs:
  query: "Generate a creative story"
assertions:
  - must_contain: "dragon"  # May or may not appear
```

**Solution:**
```yaml
seed: 42  # Reproducible creativity
inputs:
  query: "Generate a fantasy story featuring a dragon"
assertions:
  - must_contain: "dragon"  # Now reliable
```

### Pitfall 3: Testing Too Many Things

**Problem:**
```yaml
name: "Test everything at once"
inputs:
  query: "Answer these 5 questions, write code, and generate an image"
assertions:
  - must_contain: "answer 1"
  - must_contain: "answer 2"
  - must_contain: "def"
  - must_contain: "image"
```

**Solution:**
```yaml
# Split into separate focused tests
- name: "Q&A Test"
  inputs:
    query: "Answer: What is Python?"
  assertions:
    - must_contain: "programming language"

- name: "Code Generation Test"
  inputs:
    query: "Write a function to reverse a string"
  assertions:
    - must_contain: "def"
    - output_type: "code"
```

### Pitfall 4: Ignoring Error Cases

**Problem:**
```yaml
# Only tests happy path
inputs:
  query: "Find products under $1000"
```

**Solution:**
```yaml
# Also test edge cases
tests:
  - name: "Valid budget"
    inputs:
      query: "Find products under $1000"

  - name: "Invalid budget"
    inputs:
      query: "Find products under $-100"
    assertions:
      - must_contain: "invalid"  # Expects error handling

  - name: "Zero budget"
    inputs:
      query: "Find products under $0"
    assertions:
      - must_contain: "no products"
```

### Pitfall 5: Unclear Test Names

**Problem:**
```yaml
name: "Test 1"
name: "Agent test"
name: "My test"
```

**Solution:**
```yaml
name: "Code Generation - Python QuickSort with Type Hints"
name: "Browser Agent - Multi-Product Price Comparison"
name: "Multi-Turn - Customer Support Order Tracking"
```

## Checklist

Use this checklist when creating tests:

- [ ] **Descriptive name** that explains what is being tested
- [ ] **Description** documenting purpose and expected behavior
- [ ] **Focused scope** - tests one capability
- [ ] **Reproducible** - includes seed for determinism
- [ ] **Multiple assertions** - validates different aspects
- [ ] **Appropriate timeout** - realistic for task complexity
- [ ] **Tags** for organization and filtering
- [ ] **Documentation** - comments for complex logic
- [ ] **Edge cases** - handles errors and boundaries
- [ ] **Model version** - specific model identifier

## Examples of Well-Designed Tests

### Example 1: Simple Q&A

```yaml
name: "Factual Q&A - Geography - European Capitals"
description: "Tests basic factual knowledge about European capital cities with validation that incorrect capitals are not mentioned"

model: "gpt-4"
provider: "openai"
seed: 123

inputs:
  query: "What is the capital of France?"
  system_prompt: "Answer factually and concisely."

assertions:
  # Correct answer present
  - must_contain: "Paris"

  # Incorrect answers absent
  - must_not_contain: "London"
  - must_not_contain: "Berlin"

  # Format validation
  - output_type: "text"

  # Performance requirement
  - max_latency_ms: 2000
  - max_tokens: 100

timeout_ms: 5000

tags:
  - qa
  - geography
  - factual
  - quick
```

### Example 2: Code Generation

```yaml
name: "Code Generation - Python - Binary Search with Type Hints"
description: |
  Tests code generation with specific requirements:
  - Algorithm: binary search
  - Language features: type hints (Python 3.10+)
  - Documentation: comprehensive docstring
  - Code quality: PEP 8 compliant

model: "claude-3-5-sonnet-20241022"
provider: "anthropic"
seed: 42

inputs:
  query: "Write a Python function for binary search on a sorted list. Include type hints and a detailed docstring."
  system_prompt: "You are an expert Python programmer. Follow PEP 8 and use modern Python 3.10+ features."

assertions:
  # Function structure
  - must_contain: "def"
  - must_contain: "binary_search"
  - regex_match: "def\\s+binary_search\\([^)]*\\)\\s*->"

  # Type hints
  - must_contain: "List["
  - must_contain: "->"

  # Documentation
  - regex_match: '"""[\\s\\S]+"""'
  - must_contain: "Args:"
  - must_contain: "Returns:"

  # Algorithm
  - must_contain: "mid"
  - must_contain: "left"
  - must_contain: "right"

  # Output format
  - output_type: "code"

  # Performance
  - max_latency_ms: 5000

timeout_ms: 10000

tags:
  - code-generation
  - python
  - algorithms
  - type-hints
```

### Example 3: Multi-Step Agent

```yaml
name: "Shopping Agent - Price Comparison - Gaming Laptops"
description: |
  End-to-end test of shopping agent capabilities:
  1. Search multiple e-commerce sites
  2. Extract product specifications
  3. Compare prices and features
  4. Return structured results

  Validates tool usage, data extraction, and output format.

model: "claude-3-5-sonnet-20241022"
provider: "anthropic"
framework: "langgraph"
seed: 100

tools:
  - browser
  - scraper
  - calculator

framework_config:
  max_iterations: 10
  intermediate_steps: true

inputs:
  query: "Compare the top 3 gaming laptops under $1500, focusing on GPU and RAM specifications"
  context:
    budget: 1500
    category: "gaming laptops"
    key_specs: ["GPU", "RAM", "display"]
    min_results: 3

assertions:
  # Tool usage
  - must_call_tool: ["browser", "scraper"]

  # Content validation
  - must_contain: "GPU"
  - must_contain: "RAM"
  - must_contain: "price"

  # Budget constraint
  - must_not_contain: "$1600"
  - must_not_contain: "$2000"

  # Output format
  - output_type: "json"
  - regex_match: "\\[\\s*\\{[\\s\\S]+\\}\\s*\\]"  # JSON array

  # Performance
  - max_latency_ms: 45000

timeout_ms: 60000

tags:
  - e2e
  - shopping
  - agent
  - multi-step
  - gaming
```

## See Also

- [Getting Started Guide](getting-started.md)
- [DSL Reference](dsl-reference.md)
- [Examples Guide](examples.md)
- [API Reference](api-reference.md)
