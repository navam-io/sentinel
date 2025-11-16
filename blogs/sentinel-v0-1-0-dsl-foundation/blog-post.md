# Building the Foundation: Sentinel v0.1.0 - A Type-Safe DSL for AI Agent Testing

**Published**: November 15, 2025
**Author**: Manav Sehgal
**Reading Time**: 8 minutes

---

## TL;DR

Today we're releasing **Sentinel v0.1.0**, the foundational DSL (Domain-Specific Language) for AI agent testing. This release delivers a production-ready, type-safe schema and parser that will power the visual canvas coming in v0.2.0. With 70 tests and 98% coverage, it's the solid foundation for building "Postman for AI Agents."

**Key Highlights**:
- ✅ Complete Pydantic-based DSL schema
- ✅ Round-trip YAML/JSON parsing (zero data loss)
- ✅ 8 assertion types for comprehensive testing
- ✅ 6 production-ready templates
- ✅ 70 tests, 98% coverage
- ✅ Ready for visual UI integration

---

## The Vision: Visual-First Agent Testing

Before diving into what we built, let's talk about *why* we're building Sentinel.

**The Problem**: Testing AI agents today is hard. Really hard. You either:
- Write custom Python scripts for every test (time-consuming, not reusable)
- Use LLM evaluation frameworks that feel like coding homework
- Manually test by running your agent over and over (not scalable)

**Our Vision**: Make AI agent testing as intuitive as Postman made API testing.

Imagine:
- **Drag-and-drop** nodes to build tests (no coding required)
- **Real-time YAML generation** for version control
- **Visual regression comparison** between model versions
- **One-click execution** with live metrics
- **Collaborative workspaces** for team testing

That's where we're headed. But first, we needed a **rock-solid foundation**.

---

## Why Start with a DSL?

You might be wondering: "If you're building a visual-first tool, why start with a text-based DSL?"

Great question. Here's our thinking:

### 1. **Visual ↔ DSL Synchronization Requires Both**

For true round-trip conversion to work, you need:
- A visual canvas that generates YAML
- A parser that converts YAML back to canvas
- Zero data loss in both directions

Building these together ensures they're designed for each other.

### 2. **Git-Friendly Version Control**

Visual tools are amazing for creation, but terrible for version control. By generating clean YAML from the visual canvas:
- Diffs show exactly what changed in your test
- Code reviews are meaningful
- CI/CD pipelines can run tests from YAML files
- Tests live alongside your code

### 3. **Programmatic Access for Power Users**

Not everyone wants to click around. Some users prefer:
```python
from backend.core.schema import TestSpec

spec = TestSpec(
    name="My Test",
    model="claude-3-5-sonnet-20241022",
    inputs={"query": "What is the capital of France?"},
    assertions=[
        {"must_contain": "Paris"},
        {"max_latency_ms": 2000}
    ]
)
```

The DSL makes this possible.

### 4. **Type Safety = Fewer Bugs**

By using Pydantic for schema validation, we catch errors *before* execution:
- Invalid model names
- Malformed assertions
- Missing required fields
- Type mismatches

This saves hours of debugging.

---

## What We Built: Deep Dive

### 1. Pydantic Schema - The Type-Safe Foundation

At the heart of Sentinel is a comprehensive Pydantic schema that defines how tests are structured.

**Core Models**:

```python
class TestSpec(BaseModel):
    """Single test specification"""
    name: str
    description: Optional[str] = None
    model: str
    provider: Optional[str] = None
    seed: Optional[int] = None
    model_config: Optional[ModelConfig] = None
    inputs: InputSpec
    tools: Optional[List[ToolSpec]] = None
    assertions: List[AssertionDict]
    tags: Optional[List[str]] = None
    timeout_ms: Optional[int] = 30000
```

**Why This Matters**:
- **Type safety**: Pydantic validates all fields
- **Serialization**: Automatic YAML/JSON conversion
- **Documentation**: Schema is self-documenting
- **IDE support**: Auto-complete and type hints

### 2. Eight Assertion Types

We support **8 assertion types** covering the most common testing scenarios:

| Assertion | Use Case | Example |
|-----------|----------|---------|
| `must_contain` | Text matching | `{"must_contain": "Paris"}` |
| `must_not_contain` | Negative matching | `{"must_not_contain": "London"}` |
| `regex_match` | Pattern matching | `{"regex_match": "def\\s+\\w+"}` |
| `must_call_tool` | Tool validation | `{"must_call_tool": ["browser"]}` |
| `output_type` | Format validation | `{"output_type": "json"}` |
| `max_latency_ms` | Performance | `{"max_latency_ms": 2000}` |
| `min_tokens` / `max_tokens` | Length validation | `{"min_tokens": 50, "max_tokens": 500}` |

**Real-World Example**:

```yaml
name: "Code Generation Test"
model: "claude-3-5-sonnet-20241022"
inputs:
  query: "Write a Python function to calculate fibonacci numbers"

assertions:
  - must_contain: "def"
  - must_contain: "fibonacci"
  - regex_match: "def\\s+\\w+\\([^)]*\\):"
  - output_type: "code"
  - min_tokens: 20
```

### 3. Round-Trip YAML/JSON Parsing

The parser is the magic that makes Visual ↔ DSL synchronization possible.

**API Design**:

```python
from backend.core.parser import TestSpecParser

# Parse from file
spec = TestSpecParser.parse_file("test.yaml")

# Parse from string
spec = TestSpecParser.parse_yaml(yaml_content)
spec = TestSpecParser.parse_json(json_content)

# Serialize back
yaml_str = TestSpecParser.to_yaml(spec)
json_str = TestSpecParser.to_json(spec)

# Write to file
TestSpecParser.write_file(spec, "output.yaml")
```

**Zero Data Loss Guarantee**:

```python
# Load YAML → Parse → Serialize → Parse → Should be identical
original = TestSpecParser.parse_file("test.yaml")
yaml_str = TestSpecParser.to_yaml(original)
parsed_again = TestSpecParser.parse_yaml(yaml_str)

assert original == parsed_again  # ✅ Always passes
```

This is critical for visual editing. Users can:
1. Import YAML → Visual canvas
2. Edit visually → YAML updates
3. Edit YAML → Canvas updates
4. Export YAML → No data loss

### 4. Six Production-Ready Templates

We included **6 templates** that demonstrate best practices:

**1. Simple Q&A** - Basic factual testing
```yaml
name: "Simple Q&A - Capital Cities"
model: "gpt-4"
inputs:
  query: "What is the capital of France?"
assertions:
  - must_contain: "Paris"
  - output_type: "text"
  - max_latency_ms: 2000
```

**2. Code Generation** - Testing code output
```yaml
name: "Python Function Generation"
model: "claude-3-5-sonnet-20241022"
inputs:
  query: "Write a Python function to calculate fibonacci"
assertions:
  - must_contain: "def"
  - regex_match: "def\\s+\\w+\\([^)]*\\):"
  - output_type: "code"
```

**3. Browser Agent** - Tool-using agents
```yaml
name: "Product Research Agent"
model: "claude-3-5-sonnet-20241022"
tools:
  - browser
  - scraper
  - calculator
inputs:
  query: "Find top 3 laptops under $1000"
assertions:
  - must_call_tool: ["browser"]
  - must_contain: "price"
  - output_type: "json"
```

**4. Multi-Turn Conversation** - Context retention
**5. LangGraph Agent** - Framework integration
**6. Test Suite** - Batch testing

Each template is **fully validated** and ready to use.

---

## The Numbers: Built for Production

We're serious about quality. Here are the stats:

| Metric | Value |
|--------|-------|
| **Tests Written** | 70 |
| **Test Coverage** | 98% |
| **Code Lines (Backend)** | 160 statements |
| **Templates** | 6 production-ready |
| **Documentation** | 5,040 lines |
| **Assertion Types** | 8 |
| **Test Pass Rate** | 100% |

**Test Breakdown**:
- 31 schema validation tests
- 30 parser functionality tests
- 9 template integration tests
- Round-trip conversion tests
- Error handling tests

**Coverage Details**:
- `schema.py`: 99% coverage (67 statements)
- `parser.py`: 98% coverage (92 statements)

---

## Real-World Use Cases

Here's how teams can use Sentinel v0.1.0 *today*:

### Use Case 1: Regression Testing

```python
# Test that Claude Sonnet 4.5 maintains code generation quality
spec = TestSpecParser.parse_file("templates/code_generation.yaml")

# Run with Sonnet 4.5
result_4_5 = run_test(spec, model="claude-sonnet-4-5")

# Run with Sonnet 3.5 (baseline)
result_3_5 = run_test(spec, model="claude-3-5-sonnet-20241022")

# Compare results
compare_runs(result_4_5, result_3_5)
```

### Use Case 2: CI/CD Integration

```bash
# .github/workflows/agent-tests.yml
- name: Run agent tests
  run: |
    pytest tests/ --yaml-specs=templates/*.yaml
```

### Use Case 3: Programmatic Test Generation

```python
# Generate 100 Q&A tests from a dataset
for question, expected_answer in dataset:
    spec = TestSpec(
        name=f"QA: {question[:50]}",
        model="gpt-4",
        inputs={"query": question},
        assertions=[
            {"must_contain": expected_answer},
            {"max_latency_ms": 2000}
        ]
    )
    TestSpecParser.write_file(spec, f"tests/qa_{i}.yaml")
```

---

## Behind the Scenes: Building with Claude Code

This project has been an incredible journey in **vibe coding** with Claude Code. Here are some unique learnings:

### 1. **Test-Driven Development with AI**

We used a TDD approach throughout:
1. **Write tests first** - Define what success looks like
2. **Let Claude implement** - Generate implementation
3. **Iterate on failures** - Fix failing tests
4. **Refactor together** - Improve code quality

**Example conversation**:
> Me: "I need round-trip YAML conversion to work perfectly. Write tests first."
> Claude: *Generates 10 round-trip tests covering edge cases*
> Me: "Now implement the parser to make these pass."
> Claude: *Implements parser with proper serialization*
> Result: ✅ All tests pass, 98% coverage

### 2. **Pydantic Wizardry**

Claude Code excels at Pydantic schema design. Here's what impressed me:

**Challenge**: "I need to support both single tests and test suites in one schema."

**Claude's Solution**:
```python
class TestSuite(BaseModel):
    name: str
    defaults: Optional[TestSpec] = None  # Shared config
    tests: List[TestSpec]

    def apply_defaults(self):
        """Merge defaults into each test"""
        # Claude generated smart inheritance logic here
```

The AI understood the use case and designed an elegant solution.

### 3. **Documentation as a First-Class Citizen**

We generated **5,040 lines of documentation** including:
- API reference
- DSL specification
- Best practices guide
- Example walkthroughs
- Migration guide (for future versions)

**Vibe Coding Tip**: Let the AI write docs *while* writing code. It:
- Catches design issues early
- Creates better examples
- Ensures consistency

### 4. **Incremental, Testable Releases**

Instead of building everything at once, we:
1. Started with core schema (tests written first)
2. Added parser functionality (incremental tests)
3. Validated with templates (integration tests)
4. Generated documentation (automated)
5. Released v0.1.0 (production-ready)

Each step was **tested and validated** before moving forward.

### 5. **The Power of Clear Context**

The most important file in this repo is `CLAUDE.md`. It contains:
- Project vision and philosophy
- Architecture decisions
- Design principles
- Development workflow
- Future roadmap

**Before CLAUDE.md**:
> Me: "Add a new assertion type"
> Claude: *Generates code without context*
> Result: Doesn't fit the architecture ❌

**After CLAUDE.md**:
> Me: "Add a new assertion type"
> Claude: *Reads CLAUDE.md, understands architecture*
> Claude: "I'll add it to schema.py, update parser validation, add tests, and update docs"
> Result: Perfect implementation ✅

**Lesson**: Invest time in project context. It pays off 10x.

---

## What's Next: The Visual Canvas (v0.2.0)

Now that the foundation is solid, we're building the **visual canvas** in v0.2.0.

**Coming in Q1 2026**:
- 🎨 **Tauri desktop app** (macOS, Windows, Linux)
- 🖱️ **Node-based canvas** with React Flow
- 🎯 **Drag-and-drop test builder**
- 📝 **Real-time YAML generation**
- 📂 **Import YAML → Visual**
- 🎨 **Sentinel design system** (Signal Blue, AI Purple)

**User Journey Preview**:

1. Open Sentinel desktop app
2. Drag "Model" node onto canvas → Select Claude Sonnet
3. Drag "Prompt" node → Enter your query
4. Drag "Assertion" nodes → Configure via forms
5. Click "Run" → See live execution
6. Export → Get clean YAML for version control

**Visual-First, Git-Friendly**: The canvas generates YAML in real-time. Save to git. Your team can review test changes like code changes.

---

## Try It Today

Want to experiment with the DSL foundation?

**Installation** (5 minutes):

```bash
# Clone repo
git clone https://github.com/navam-io/sentinel.git
cd sentinel

# Setup Python environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Run tests
pytest tests/ -v
# ✓ 70 tests passed in 2.4s
```

**Your First Test**:

```python
from backend.core.parser import TestSpecParser

# Load example template
spec = TestSpecParser.parse_file("templates/simple_qa.yaml")

# Inspect
print(f"Test: {spec.name}")
print(f"Model: {spec.model}")
print(f"Assertions: {len(spec.assertions)}")

# Modify
spec.inputs["query"] = "What is the capital of Japan?"
spec.assertions[0]["must_contain"] = "Tokyo"

# Save
TestSpecParser.write_file(spec, "my_test.yaml")
```

**Explore Templates**:

```bash
ls templates/
# simple_qa.yaml
# code_generation.yaml
# browser_agent.yaml
# multi_turn.yaml
# langgraph_agent.yaml
# test_suite.yaml
```

---

## Our ICP: Who Is Sentinel For?

We're building Sentinel for teams testing AI agents in production:

**Primary Users** (Visual UI in v0.2.0):
- 🎯 **Product Managers** - Validate agent behavior without coding
- 🧪 **QA Engineers** - Visual test creation and debugging
- 🔬 **Research Scientists** - Build evaluation suites with AI assistance
- 🛡️ **Safety Teams** - Test safety scenarios collaboratively
- 🏢 **Frontier Labs** - Test model releases (Anthropic, OpenAI, etc.)
- 🚀 **Neo-labs** - Agent-focused research organizations

**Advanced Users** (DSL available now):
- 💻 **Model Engineers** - Programmatic testing and automation
- ⚙️ **DevOps Engineers** - CI/CD integration
- 🏗️ **Enterprise Teams** - Internal AI infrastructure testing

---

## Building in Public: Join the Journey

We're **building in public** and sharing what we learn along the way.

**Follow along**:
- ⭐ [Star on GitHub](https://github.com/navam-io/sentinel)
- 🐦 [Follow @navam_io](https://twitter.com/navam_io)
- 💬 [Join Discussions](https://github.com/navam-io/sentinel/discussions)
- 📧 Email: hello@navam.io

**Coming blog posts**:
- "Designing a Visual Testing Canvas with React Flow and Svelte"
- "Round-Trip Sync: Making Visual and Code Play Nice"
- "Building a Desktop App with Tauri 2.0"
- "Testing AI Agents: 8 Assertion Patterns That Actually Work"

---

## Acknowledgments

Huge thanks to:
- **Claude (Anthropic)** - My AI pair programmer for this entire project
- **Pydantic team** - For the excellent validation library
- **Langflow, n8n, Postman, Playwright** - Design inspiration
- **The AI agent community** - For feedback and support

---

## Final Thoughts

**v0.1.0** is just the beginning. It's the foundation for something much bigger: a visual-first platform that makes AI agent testing accessible to everyone.

The DSL is production-ready. The vision is clear. The roadmap is ambitious.

**Next stop**: Visual canvas in v0.2.0.

Let's make AI agent testing as intuitive as Postman made API testing.

**Try Sentinel today**: [github.com/navam-io/sentinel](https://github.com/navam-io/sentinel)

---

**Questions? Feedback?** Drop a comment or reach out at hello@navam.io

**Want to contribute?** We're actively seeking contributors. Check out our [Contributing Guide](https://github.com/navam-io/sentinel/blob/main/CONTRIBUTING.md).

---

*Building in public, one feature at a time.*
*- Manav*
