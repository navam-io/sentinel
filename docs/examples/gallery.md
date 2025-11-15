# Example Gallery

Browse real-world examples of Sentinel test specifications. All examples are available in the `examples/test_specs/` directory.

## Quick Examples

### Simple Q&A Test

**File:** `examples/test_specs/simple_qa_test.yaml`

Basic factual question answering without tools.

```yaml
name: "Simple Q&A - Capital cities"
description: "Basic factual question answering without tools"
model: "gpt-4"
provider: "openai"
seed: 123

model_config:
  temperature: 0.0
  max_tokens: 100

inputs:
  query: "What is the capital of France?"

assertions:
  - must_contain: "Paris"
  - must_not_contain: "London"
  - output_type: "text"
  - max_latency_ms: 2000
  - min_tokens: 5
  - max_tokens: 50

tags:
  - qa
  - factual
  - simple
```

**Key Features:**
- Deterministic (temperature: 0.0, seed: 123)
- Multiple assertion types
- Performance bounds (latency, tokens)
- Negative assertions (must_not_contain)

---

### Code Generation

**File:** `examples/test_specs/code_generation_test.yaml`

Testing model's ability to generate valid Python code.

```yaml
name: "Code generation - Python function"
description: "Test model's ability to generate valid Python code with specific requirements"
model: "claude-3-5-sonnet-20241022"
provider: "anthropic"
seed: 999

model_config:
  temperature: 0.3
  max_tokens: 500

inputs:
  query: |
    Write a Python function that calculates the factorial of a number
    using recursion. Include docstring and type hints.
  system_prompt: "You are an expert Python developer. Generate clean, well-documented code."

assertions:
  - must_contain: "def factorial"
  - must_contain: "return"
  - must_contain: '"""'
  - regex_match: "def factorial\\(.*\\).*->"
  - output_type: "code"
  - max_latency_ms: 3000

tags:
  - code-generation
  - python
  - algorithms
```

**Key Features:**
- System prompt for role specification
- Regex pattern matching for code structure
- Multi-line query with detailed requirements
- Code output validation

---

### Multi-Turn Conversation

**File:** `examples/test_specs/multi_turn_conversation.yaml`

Testing multi-turn dialogue with context retention.

```yaml
name: "Multi-turn conversation - Customer support"
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

**Key Features:**
- Message history format
- Context retention validation
- Customer support scenario

---

### Browser Agent - Product Search

**File:** `examples/test_specs/browser_agent_product_search.yaml`

Complex agent testing with multiple tools.

```yaml
name: "Browser agent - Amazon product research"
description: "Test agent's ability to research products with price constraints using browser tools"
model: "claude-3-5-sonnet-20241022"
provider: "anthropic"
seed: 42

tools:
  - browser
  - scraper
  - calculator

inputs:
  query: "Find top 3 laptops under $1000 with at least 16GB RAM"

assertions:
  - must_contain: "price"
  - must_contain: "RAM"
  - must_call_tool: "browser"
  - max_latency_ms: 9000
  - output_type: "json"

tags:
  - e2e
  - browser
  - shopping
  - product-research

timeout_ms: 30000
```

**Key Features:**
- Multi-tool specification
- Tool call assertions
- E2E workflow testing
- Structured output validation

---

### LangGraph Research Agent

**File:** `examples/test_specs/langgraph_research_agent.yaml`

Framework integration with detailed tool specifications.

```yaml
name: "LangGraph research agent - Tech news"
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

**Key Features:**
- Framework integration (LangGraph)
- Full tool specifications with parameters
- Framework configuration
- Context data for execution
- Research workflow

---

### Test Suite Example

**File:** `examples/test_specs/test_suite_example.yaml`

Organizing multiple related tests together.

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
      - must_call_tool: "browser"
      - must_call_tool: "calculator"
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

**Key Features:**
- Suite organization
- Shared defaults
- Versioning
- Multiple related tests
- Consistent configuration

## Examples by Category

### By Test Type

**Unit Tests:**
- Simple Q&A Test (single prompt/response)
- Code Generation (focused functionality)

**Integration Tests:**
- Multi-turn Conversation (dialogue flow)
- Browser Agent (multi-tool workflow)

**End-to-End Tests:**
- LangGraph Research Agent (complete workflow)
- Test Suite (full feature coverage)

### By Model Provider

**Anthropic (Claude):**
- Code Generation Test
- Browser Agent Product Search
- LangGraph Research Agent

**OpenAI (GPT):**
- Simple Q&A Test
- Multi-turn Conversation

### By Complexity

**Simple (1-2 tools/features):**
- Simple Q&A Test
- Code Generation

**Moderate (3-5 tools/features):**
- Multi-turn Conversation
- Browser Agent

**Complex (5+ tools/features):**
- LangGraph Research Agent
- Test Suite

### By Use Case

**Question Answering:**
- Simple Q&A Test

**Code Generation:**
- Code Generation Test

**Customer Support:**
- Multi-turn Conversation

**E-commerce:**
- Browser Agent Product Search
- Test Suite

**Research:**
- LangGraph Research Agent

## Running Examples

### Parse an Example

```python
from sentinel.core.parser import TestSpecParser

# Parse single test
spec = TestSpecParser.parse_file("examples/test_specs/simple_qa_test.yaml")
print(f"Test: {spec.name}")
print(f"Model: {spec.model}")

# Parse test suite
suite = TestSpecParser.parse_file("examples/test_specs/test_suite_example.yaml")
print(f"Suite: {suite.name} ({len(suite.tests)} tests)")
```

### Validate All Examples

```python
from pathlib import Path
from sentinel.core.parser import TestSpecParser

examples_dir = Path("examples/test_specs")

for spec_file in examples_dir.glob("*.yaml"):
    try:
        spec = TestSpecParser.parse_file(spec_file)
        print(f"✓ {spec_file.name}")
    except Exception as e:
        print(f"✗ {spec_file.name}: {e}")
```

## Example Templates

### Template: Basic Test

```yaml
name: "Your Test Name"
model: "model-identifier"
provider: "provider-name"
seed: 42

inputs:
  query: "Your prompt here"

assertions:
  - must_contain: "expected output"
  - output_type: "text"

tags:
  - your-category
```

### Template: Agent Test

```yaml
name: "Your Agent Test"
model: "model-identifier"
provider: "provider-name"
seed: 42

tools:
  - tool1
  - tool2

inputs:
  query: "Your task"

assertions:
  - must_call_tool: "tool1"
  - must_contain: "result"
  - output_type: "json"

tags:
  - agent
```

### Template: Test Suite

```yaml
name: "Your Test Suite"
version: "1.0.0"

defaults:
  model: "model-identifier"
  provider: "provider-name"

tests:
  - name: "Test 1"
    model: "model-identifier"
    seed: 100
    inputs: {...}
    assertions: [...]

  - name: "Test 2"
    model: "model-identifier"
    seed: 101
    inputs: {...}
    assertions: [...]
```

## Next Steps

- **[Quick Start Guide](../guides/quickstart.md)** - Create your first test
- **[Writing Tests Guide](../guides/writing-tests.md)** - Detailed guide
- **[Schema Reference](../reference/schema.md)** - Complete schema docs

## Contributing Examples

Have a great example? Consider contributing:

1. Create your test spec
2. Test it thoroughly
3. Add clear documentation
4. Submit a pull request to the repository

See the repository's contributing guide for details.
