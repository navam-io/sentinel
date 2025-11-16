# Examples Guide

This guide provides detailed walkthroughs of all example templates included with Sentinel.

## Table of Contents

- [Overview](#overview)
- [Example 1: Simple Q&A](#example-1-simple-qa)
- [Example 2: Code Generation](#example-2-code-generation)
- [Example 3: Browser Agent](#example-3-browser-agent)
- [Example 4: Multi-Turn Conversation](#example-4-multi-turn-conversation)
- [Example 5: LangGraph Agent](#example-5-langgraph-agent)
- [Example 6: Test Suite](#example-6-test-suite)
- [Customizing Templates](#customizing-templates)

## Overview

Sentinel includes **6 production-ready templates** demonstrating different testing patterns:

| Template | Use Case | Complexity | Features |
|----------|----------|------------|----------|
| `simple_qa.yaml` | Factual Q&A | Simple | Text matching, output validation |
| `code_generation.yaml` | Code generation | Medium | Regex matching, code validation |
| `browser_agent.yaml` | Tool-using agents | Medium | Tool calls, JSON output |
| `multi_turn.yaml` | Conversations | Medium | Message history, context retention |
| `langgraph_agent.yaml` | Framework agents | Advanced | LangGraph, multiple tools |
| `test_suite.yaml` | Test organization | Advanced | Suite with defaults, multiple tests |

All templates are located in the `templates/` directory.

## Example 1: Simple Q&A

**File**: `templates/simple_qa.yaml`

### Purpose

Test basic factual knowledge with text matching assertions.

### Full Template

```yaml
name: "Simple Q&A - Capital Cities"
description: "Test basic factual knowledge about world capitals"
model: "gpt-4"
provider: "openai"
seed: 123

inputs:
  query: "What is the capital of France?"
  system_prompt: "You are a helpful assistant. Answer questions accurately and concisely."

assertions:
  - must_contain: "Paris"
  - must_not_contain: "London"
  - must_not_contain: "Berlin"
  - output_type: "text"
  - max_latency_ms: 2000
  - max_tokens: 100

timeout_ms: 5000

tags:
  - qa
  - geography
  - factual
```

### Key Features

1. **Simple query-based input** - Direct question format
2. **Text matching** - Uses `must_contain` and `must_not_contain`
3. **Output format validation** - Ensures plain text response
4. **Performance threshold** - 2-second max latency
5. **Reproducible** - Uses seed for deterministic results

### Usage

```python
from backend.core.parser import TestSpecParser

# Load the template
spec = TestSpecParser.parse_file("templates/simple_qa.yaml")

# Inspect it
print(f"Test: {spec.name}")
print(f"Model: {spec.model}")
print(f"Query: {spec.inputs.query}")
print(f"Assertions: {len(spec.assertions)}")  # 6 assertions

# Modify for your use case
spec.inputs.query = "What is the capital of Spain?"
spec.assertions[0]["must_contain"] = "Madrid"

# Save as new test
TestSpecParser.write_file(spec, "my_qa_test.yaml")
```

### When to Use

- Testing factual knowledge
- Simple question-answer scenarios
- Validating specific text appears/doesn't appear in output
- Performance benchmarking with latency thresholds

## Example 2: Code Generation

**File**: `templates/code_generation.yaml`

### Purpose

Test code generation capabilities with pattern matching and output validation.

### Full Template

```yaml
name: "Code Generation - Python Function"
description: "Test ability to generate working Python code for common algorithms"
model: "claude-3-5-sonnet-20241022"
provider: "anthropic"
seed: 456

inputs:
  query: "Write a Python function to calculate the nth Fibonacci number using dynamic programming. Include docstring."
  system_prompt: "You are an expert Python programmer. Write clean, efficient, well-documented code."

assertions:
  - must_contain: "def"
  - must_contain: "fibonacci"
  - must_contain: "dynamic programming"
  - regex_match: "def\\s+\\w+\\([^)]*\\):"
  - regex_match: '""".*"""'
  - output_type: "code"
  - max_latency_ms: 5000

timeout_ms: 10000

tags:
  - code-generation
  - python
  - algorithms
```

### Key Features

1. **Specific requirements** - Requests dynamic programming approach
2. **Regex validation** - Checks for function definition pattern
3. **Docstring check** - Uses regex to verify documentation
4. **Code output type** - Ensures output is formatted as code
5. **Multiple content checks** - Validates key terms are present

### Usage

```python
from backend.core.parser import TestSpecParser

# Load template
spec = TestSpecParser.parse_file("templates/code_generation.yaml")

# Adapt for different language
spec.inputs.query = "Write a JavaScript function to sort an array using quicksort"
spec.inputs.system_prompt = "You are an expert JavaScript programmer."
spec.assertions = [
    {"must_contain": "function"},
    {"must_contain": "quicksort"},
    {"regex_match": "function\\s+\\w+\\([^)]*\\)"},
    {"output_type": "code"}
]

# Save modified template
TestSpecParser.write_file(spec, "js_code_gen.yaml")
```

### When to Use

- Testing code generation for specific languages
- Validating code structure (functions, classes, etc.)
- Checking for documentation (docstrings, comments)
- Algorithm implementation testing

## Example 3: Browser Agent

**File**: `templates/browser_agent.yaml`

### Purpose

Test agent's ability to use tools for web browsing and data extraction.

### Full Template

```yaml
name: "Browser Agent - Product Research"
description: "Test agent's ability to search and extract product information"
model: "claude-3-5-sonnet-20241022"
provider: "anthropic"
seed: 789

tools:
  - browser
  - scraper
  - calculator

inputs:
  query: "Find the top 3 laptops under $1000 with at least 16GB RAM and summarize their key specs in JSON format"
  context:
    budget: 1000
    min_ram: "16GB"
    product_category: "laptops"

assertions:
  - must_call_tool: ["browser"]
  - must_contain: "price"
  - must_contain: "RAM"
  - output_type: "json"
  - max_latency_ms: 30000

timeout_ms: 60000

tags:
  - e2e
  - shopping
  - browser
  - agent
```

### Key Features

1. **Tool usage** - Defines available tools (browser, scraper, calculator)
2. **Tool call validation** - Verifies browser tool was used
3. **Structured context** - Provides parameters as context object
4. **JSON output** - Expects structured data response
5. **Longer timeout** - Allows 60s for complex agent workflow

### Usage

```python
from backend.core.parser import TestSpecParser

# Load template
spec = TestSpecParser.parse_file("templates/browser_agent.yaml")

# Customize for different product search
spec.inputs.query = "Find the best smartphones under $500 with 5G support"
spec.inputs.context = {
    "budget": 500,
    "features": ["5G"],
    "product_category": "smartphones"
}
spec.assertions = [
    {"must_call_tool": ["browser"]},
    {"must_contain": "5G"},
    {"must_contain": "price"},
    {"output_type": "json"}
]

# Save customized test
TestSpecParser.write_file(spec, "smartphone_search.yaml")
```

### When to Use

- Testing agents with tool-calling capabilities
- Validating tool usage patterns
- Complex multi-step workflows
- E-commerce and product research agents

## Example 4: Multi-Turn Conversation

**File**: `templates/multi_turn.yaml`

### Purpose

Test agent's ability to maintain context across multiple conversation turns.

### Full Template

```yaml
name: "Multi-Turn Conversation - Customer Support"
description: "Test agent's ability to handle multi-turn conversations with context retention"
model: "gpt-4-turbo"
provider: "openai"
seed: 456

inputs:
  messages:
    - role: "user"
      content: "I need help with my order #12345"
    - role: "assistant"
      content: "I'd be happy to help with your order. Let me look that up for you."
    - role: "user"
      content: "When will it arrive?"
  system_prompt: "You are a helpful customer support agent."

assertions:
  - must_contain: "order"
  - must_contain: "12345"
  - output_type: "text"
  - max_latency_ms: 2500

tags:
  - multi-turn
  - customer-support
  - conversation
```

### Key Features

1. **Message history** - Uses `messages` array for conversation
2. **Context retention** - Tests if agent remembers order #12345
3. **System prompt** - Sets agent role/personality
4. **Implicit reference** - User says "it" referring to earlier order

### Usage

```python
from backend.core.parser import TestSpecParser
from backend.core.schema import Message

# Load template
spec = TestSpecParser.parse_file("templates/multi_turn.yaml")

# Extend conversation
spec.inputs.messages.append(
    Message(role="assistant", content="Your order will arrive on Friday.")
)
spec.inputs.messages.append(
    Message(role="user", content="Can I change the delivery address?")
)

# Update assertions for new context
spec.assertions.append({"must_contain": "address"})

# Save extended conversation
TestSpecParser.write_file(spec, "extended_conversation.yaml")
```

### When to Use

- Testing conversational agents
- Validating context retention
- Customer support scenarios
- Multi-step problem-solving

## Example 5: LangGraph Agent

**File**: `templates/langgraph_agent.yaml`

### Purpose

Test agents built with the LangGraph framework.

### Full Template

```yaml
name: "LangGraph Research Agent - Tech News"
description: "Test LangGraph-based agent for researching and summarizing recent tech news"
model: "claude-3-5-sonnet-20241022"
provider: "anthropic"
framework: "langgraph"
seed: 789

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

  - name: "scrape_url"
    description: "Scrape content from a URL"
    parameters:
      type: "object"
      properties:
        url:
          type: "string"
          description: "URL to scrape"
      required: ["url"]

framework_config:
  max_iterations: 5
  intermediate_steps: true

inputs:
  query: "Find and summarize the latest 3 AI announcements from major tech companies this week"
  context:
    date_range: "last 7 days"
    companies: ["Google", "OpenAI", "Anthropic", "Microsoft"]

assertions:
  - must_call_tool: "web_search"
  - must_contain: "AI"
  - output_type: "structured"
  - max_latency_ms: 15000

timeout_ms: 30000

tags:
  - langgraph
  - research
  - agent
  - multi-step
```

### Key Features

1. **Framework specification** - Uses `framework: "langgraph"`
2. **Full tool definitions** - Tools with JSON Schema parameters
3. **Framework config** - LangGraph-specific settings
4. **Multi-step workflow** - max_iterations allows agent loops
5. **Structured output** - Expects organized results

### Usage

```python
from backend.core.parser import TestSpecParser

# Load template
spec = TestSpecParser.parse_file("templates/langgraph_agent.yaml")

# Adapt for different research task
spec.inputs.query = "Research the latest developments in quantum computing"
spec.inputs.context = {
    "date_range": "last 30 days",
    "focus_areas": ["quantum algorithms", "quantum hardware", "error correction"]
}
spec.framework_config["max_iterations"] = 10  # Allow more steps

# Save adapted test
TestSpecParser.write_file(spec, "quantum_research.yaml")
```

### When to Use

- Testing LangGraph-based agents
- Multi-step research workflows
- Agents with complex tool interactions
- Framework-specific configurations

## Example 6: Test Suite

**File**: `templates/test_suite.yaml`

### Purpose

Organize multiple related tests with shared configuration.

### Full Template

```yaml
name: "E-commerce Agent Test Suite"
description: "Comprehensive test suite for e-commerce shopping agent capabilities"
version: "1.0.0"

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
  - name: "Product search - Laptops"
    model: "claude-3-5-sonnet-20241022"
    seed: 100
    inputs:
      query: "Find laptops under $1000"
    assertions:
      - must_contain: "price"
      - must_call_tool: "browser"
      - output_type: "json"

  - name: "Product comparison - Gaming laptops"
    model: "claude-3-5-sonnet-20241022"
    seed: 101
    inputs:
      query: "Compare the top 2 gaming laptops under $1500"
    assertions:
      - must_contain: "comparison"
      - must_contain: "gaming"
      - must_call_tool: ["browser", "calculator"]
      - output_type: "json"

  - name: "Price tracking - Specific product"
    model: "claude-3-5-sonnet-20241022"
    seed: 102
    inputs:
      query: "Track price for ASUS ROG Strix G15 laptop"
    assertions:
      - must_contain: "ASUS"
      - must_contain: "price"
      - must_call_tool: "scraper"
      - output_type: "structured"
      - max_latency_ms: 8000
```

### Key Features

1. **Shared defaults** - Common configuration for all tests
2. **Multiple tests** - 3 related test cases
3. **Version tracking** - Suite versioning for changes
4. **Individual seeds** - Each test has unique seed
5. **Consistent structure** - All tests follow same pattern

### Usage

```python
from backend.core.parser import TestSpecParser

# Load suite
suite = TestSpecParser.parse_file("templates/test_suite.yaml")

print(f"Suite: {suite.name}")
print(f"Version: {suite.version}")
print(f"Tests: {len(suite.tests)}")
print(f"Default model: {suite.defaults.model}")

# Iterate through tests
for i, test in enumerate(suite.tests, 1):
    print(f"\nTest {i}: {test.name}")
    print(f"  Seed: {test.seed}")
    print(f"  Assertions: {len(test.assertions)}")

# Add a new test to suite
from backend.core.schema import TestSpec, InputSpec

new_test = TestSpec(
    name="Product reviews analysis",
    model=suite.defaults.model,
    seed=103,
    inputs=InputSpec(query="Analyze reviews for iPhone 15"),
    assertions=[
        {"must_contain": "iPhone 15"},
        {"output_type": "structured"}
    ]
)

suite.tests.append(new_test)

# Save updated suite
TestSpecParser.write_file(suite, "extended_suite.yaml")
```

### When to Use

- Organizing related tests
- Sharing configuration across tests
- Regression test suites
- Systematic agent testing (e.g., all e-commerce features)

## Customizing Templates

### Method 1: Load and Modify in Python

```python
from backend.core.parser import TestSpecParser

# Load template
spec = TestSpecParser.parse_file("templates/simple_qa.yaml")

# Modify fields
spec.name = "Custom Q&A Test"
spec.model = "claude-3-5-sonnet-20241022"
spec.inputs.query = "What is the capital of Spain?"
spec.seed = 999

# Update assertions
spec.assertions = [
    {"must_contain": "Madrid"},
    {"output_type": "text"}
]

# Save customized version
TestSpecParser.write_file(spec, "custom_qa.yaml")
```

### Method 2: Copy and Edit YAML

```bash
# Copy template
cp templates/simple_qa.yaml my_custom_test.yaml

# Edit with your preferred editor
vim my_custom_test.yaml
```

### Method 3: Create from Scratch Using Template as Reference

```python
from backend.core.schema import TestSpec, InputSpec

# Reference the template structure
spec = TestSpec(
    name="My Custom Test",
    model="gpt-4",
    inputs=InputSpec(
        query="Your question here",
        system_prompt="Optional system prompt"
    ),
    assertions=[
        {"must_contain": "expected text"},
        {"output_type": "text"}
    ],
    seed=42,
    tags=["custom", "test"]
)

# Save new test
TestSpecParser.write_file(spec, "my_custom_test.yaml")
```

## Template Combinations

### Combining Multi-Turn + Tools

```yaml
name: "Multi-Turn Shopping Assistant"
model: "claude-3-5-sonnet-20241022"

tools:
  - browser
  - calculator

inputs:
  messages:
    - role: "user"
      content: "I need a laptop for gaming"
    - role: "assistant"
      content: "I can help you find gaming laptops. What's your budget?"
    - role: "user"
      content: "Around $1500"
  system_prompt: "You are a helpful shopping assistant."

assertions:
  - must_call_tool: "browser"
  - must_contain: "1500"
  - must_contain: "gaming"
  - output_type: "json"
```

### Combining Code Generation + Framework

```yaml
name: "LangGraph Code Generation Agent"
model: "claude-3-5-sonnet-20241022"
framework: "langgraph"

tools:
  - name: "code_search"
    description: "Search code repositories"

inputs:
  query: "Generate a REST API endpoint using FastAPI"

assertions:
  - must_contain: "FastAPI"
  - must_contain: "@app"
  - regex_match: "@app\\.(get|post|put|delete)"
  - output_type: "code"
```

## Next Steps

Now that you've explored all the examples:

1. **[Try customizing](getting-started.md#using-example-templates)** a template for your use case
2. **[Read the DSL reference](dsl-reference.md)** to understand all available options
3. **[Check best practices](best-practices.md)** for writing effective tests
4. **[Explore the API](api-reference.md)** for programmatic access

## See Also

- [Getting Started Guide](getting-started.md)
- [DSL Reference](dsl-reference.md)
- [API Reference](api-reference.md)
- [Best Practices](best-practices.md)
