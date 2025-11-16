# Getting Started with Sentinel

This guide will help you install Sentinel and create your first agent test in under 10 minutes.

**Version**: 0.3.1 (React + React Flow)
**Last Updated**: November 16, 2025

## Table of Contents

- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Quick Start (Visual Canvas)](#quick-start-visual-canvas)
- [Quick Start (Code-First)](#quick-start-code-first)
- [Using Example Templates](#using-example-templates)
- [Next Steps](#next-steps)

## System Requirements

### For Visual Canvas (Desktop App)

- **Node.js**: 18.0 or higher ([Download](https://nodejs.org/))
- **Rust**: Latest stable ([Install](https://www.rust-lang.org/tools/install))
- **Operating System**: macOS, Linux, or Windows
- **Disk Space**: ~200MB for installation

### For Code-First / DSL Mode

- **Python**: 3.10 or higher
- **pip**: Python package manager (usually included with Python)
- **Operating System**: macOS, Linux, or Windows
- **Disk Space**: ~50MB for installation

### Recommended

- **Python 3.11+** for better performance
- **Node.js 20+** for latest features
- **Virtual environment** for isolated Python dependencies
- **Git** for version control

### Check Your Python Version

```bash
python --version
# or
python3 --version
```

You should see `Python 3.10.x` or higher.

## Installation

### Option 1: Visual Canvas (Desktop App)

**Step 1: Install Prerequisites**

1. Install Node.js 18+ from [nodejs.org](https://nodejs.org/)
2. Install Rust from [rustup.rs](https://rustup.rs/)

**Step 2: Clone the Repository**

```bash
# Clone from GitHub
git clone https://github.com/navam-io/sentinel.git

# Navigate to frontend directory
cd sentinel/frontend
```

**Step 3: Install Dependencies**

```bash
npm install
```

This installs:
- React 19 + Vite
- React Flow 12.3 (canvas)
- Tauri 2.0 (desktop framework)
- Zustand 5.0 (state management)
- TailwindCSS 4.0 (styling)
- Testing libraries (Vitest, React Testing Library)

**Step 4: Launch Desktop App**

```bash
npm run tauri:dev
```

The Sentinel desktop app will open with the visual canvas! 🎉

**Step 5: Verify Installation (Optional)**

```bash
# Run frontend tests
npm run test

# You should see:
# ✓ 12 tests passed
```

### Option 2: Code-First / DSL Mode

**Step 1: Clone the Repository**

```bash
# Clone from GitHub
git clone https://github.com/navam-io/sentinel.git

# Navigate to directory
cd sentinel
```

**Don't have Git?** Download the ZIP file from GitHub and extract it.

**Step 2: Create a Virtual Environment**

A virtual environment keeps Sentinel's dependencies isolated from your system Python.

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**
```cmd
python -m venv venv
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

**Step 3: Install Dependencies**

```bash
pip install -r backend/requirements.txt
```

This installs:
- `pydantic` - Schema validation
- `pyyaml` - YAML parsing
- `pytest` - Testing framework
- Other development tools

**Step 4: Verify Installation**

```bash
# Run the test suite
pytest tests/ -v

# You should see:
# ======================== 70 passed in X.XXs ========================
```

If all tests pass, you're ready to go! 🎉

### Troubleshooting Installation

**Problem: `python` command not found**
- Try `python3` instead of `python`
- Install Python from [python.org](https://python.org)

**Problem: Permission denied**
- Use `pip install --user -r backend/requirements.txt`
- Or run with `sudo` on Linux/macOS (not recommended)

**Problem: Tests fail**
- Ensure you activated the virtual environment
- Check Python version is 3.10+
- Try `pip install --upgrade pip` then reinstall

## Quick Start (Visual Canvas)

Build a test visually in 3 minutes!

### 1. Launch the App

```bash
cd sentinel/frontend
npm run tauri:dev
```

### 2. Build Your Test Visually

1. **Click "Input"** in the left component palette
   - A new Input node appears on the canvas
   - Type your prompt: "What is the capital of France?"

2. **Click "Model"** in the palette
   - A Model node appears on the canvas
   - It's pre-configured with a default model

3. **Click "Assertion"** in the palette
   - An Assertion node appears
   - Configure it: Type "must_contain" and value "Paris"

4. **Connect the nodes**
   - Drag from Input's bottom handle to Model's top handle
   - Drag from Model's bottom handle to Assertion's top handle

5. **See YAML in real-time**
   - Check the right panel - your YAML is generated automatically!

6. **Export your test**
   - Click "Download" or "Copy" in the YAML preview
   - Save as `my-first-test.yaml`

**🎉 Congratulations!** You've built your first visual test!

---

## Quick Start (Code-First)

Create and validate a simple test in 5 minutes.

### 1. Create Your First Test File

Create a file called `my_test.yaml`:

```yaml
name: "My First Agent Test"
model: "gpt-4"
inputs:
  query: "What is the capital of France?"
assertions:
  - must_contain: "Paris"
  - output_type: "text"
  - max_latency_ms: 3000
tags:
  - geography
  - simple
```

### 2. Parse and Validate

Create a Python script `validate_test.py`:

```python
from backend.core.parser import TestSpecParser

# Parse the test file
spec = TestSpecParser.parse_file("my_test.yaml")

# Print test details
print(f"✓ Test loaded: {spec.name}")
print(f"  Model: {spec.model}")
print(f"  Query: {spec.inputs.query}")
print(f"  Assertions: {len(spec.assertions)}")
print(f"  Tags: {', '.join(spec.tags)}")
```

### 3. Run the Script

```bash
python validate_test.py
```

**Output:**
```
✓ Test loaded: My First Agent Test
  Model: gpt-4
  Query: What is the capital of France?
  Assertions: 3
  Tags: geography, simple
```

Congratulations! You've created and validated your first test! 🎉

## Your First Test

Let's dive deeper and create a more comprehensive test.

### Understanding Test Structure

Every test has 3 required fields:

1. **name** - Human-readable test name
2. **model** - Which AI model to test (e.g., "gpt-4", "claude-3-5-sonnet-20241022")
3. **inputs** - What to send to the model
4. **assertions** - How to validate the output

### Creating a Test Step-by-Step

#### Step 1: Define the Test Name and Model

```yaml
name: "Code Generation - Fibonacci Function"
model: "claude-3-5-sonnet-20241022"
```

#### Step 2: Add Inputs

```yaml
inputs:
  query: "Write a Python function to calculate the nth Fibonacci number"
  system_prompt: "You are an expert Python programmer. Write clean, efficient code."
```

#### Step 3: Add Assertions

```yaml
assertions:
  # Check output contains key elements
  - must_contain: "def"
  - must_contain: "fibonacci"

  # Validate it's actually a function definition
  - regex_match: "def\\s+\\w+\\([^)]*\\):"

  # Ensure output format is code
  - output_type: "code"

  # Performance threshold
  - max_latency_ms: 5000
```

#### Step 4: Add Optional Metadata

```yaml
tags:
  - code-generation
  - python
  - fibonacci

seed: 42  # For reproducibility

timeout_ms: 10000  # Overall timeout
```

#### Complete Test

Save as `fibonacci_test.yaml`:

```yaml
name: "Code Generation - Fibonacci Function"
model: "claude-3-5-sonnet-20241022"

inputs:
  query: "Write a Python function to calculate the nth Fibonacci number"
  system_prompt: "You are an expert Python programmer. Write clean, efficient code."

assertions:
  - must_contain: "def"
  - must_contain: "fibonacci"
  - regex_match: "def\\s+\\w+\\([^)]*\\):"
  - output_type: "code"
  - max_latency_ms: 5000

tags:
  - code-generation
  - python
  - fibonacci

seed: 42
timeout_ms: 10000
```

### Validate Your Test

```python
from backend.core.parser import TestSpecParser

# Parse and validate
spec = TestSpecParser.parse_file("fibonacci_test.yaml")

print(f"✓ Test: {spec.name}")
print(f"  Model: {spec.model}")
print(f"  System Prompt: {spec.inputs.system_prompt}")
print(f"  Assertions: {len(spec.assertions)}")
print(f"  Seed: {spec.seed}")
```

## Using Example Templates

Sentinel includes 6 production-ready templates to get you started.

### Available Templates

```bash
ls templates/

# Output:
# simple_qa.yaml           - Basic Q&A test
# code_generation.yaml     - Code generation test
# browser_agent.yaml       - Agent with tools
# multi_turn.yaml          - Conversation test
# langgraph_agent.yaml     - LangGraph framework test
# test_suite.yaml          - Test suite example
```

### Load and Use a Template

```python
from backend.core.parser import TestSpecParser

# Load template
spec = TestSpecParser.parse_file("templates/simple_qa.yaml")

# Inspect it
print(f"Template: {spec.name}")
print(f"Model: {spec.model}")
print(f"Description: {spec.description}")

# Modify it
spec.name = "My Custom Q&A Test"
spec.inputs.query = "What is the capital of Spain?"
spec.assertions[0]["must_contain"] = "Madrid"

# Save as new test
TestSpecParser.write_file(spec, "my_custom_test.yaml")
```

### Template: Simple Q&A

Perfect for testing factual knowledge:

```python
spec = TestSpecParser.parse_file("templates/simple_qa.yaml")

# Outputs:
# Name: Simple Q&A - Capital Cities
# Model: gpt-4
# Query: What is the capital of France?
# Assertions: 6
```

### Template: Code Generation

Test code generation capabilities:

```python
spec = TestSpecParser.parse_file("templates/code_generation.yaml")

# Outputs:
# Name: Code Generation - Python Function
# Model: claude-3-5-sonnet-20241022
# Tags: code-generation, python
```

### Template: Browser Agent

Test agent tool usage:

```python
spec = TestSpecParser.parse_file("templates/browser_agent.yaml")

# Outputs:
# Name: Browser Agent - Product Research
# Tools: ['browser', 'scraper', 'calculator']
# Assertions: must_call_tool, must_contain, output_type
```

### Template: Test Suite

Organize multiple tests:

```python
suite = TestSpecParser.parse_file("templates/test_suite.yaml")

# Outputs:
# Name: E-commerce Agent Test Suite
# Version: 1.0.0
# Tests: 3
# Defaults: model=claude-3-5-sonnet-20241022, timeout=30000
```

## Working with Test Suites

Test suites help you organize related tests with shared configuration.

### Create a Test Suite

```yaml
name: "Customer Support Test Suite"
description: "Tests for customer support agent"
version: "1.0.0"

# Shared defaults for all tests
defaults:
  model: "gpt-4-turbo"
  provider: "openai"
  timeout_ms: 5000
  tags:
    - customer-support

# Individual tests
tests:
  - name: "Order Status Inquiry"
    inputs:
      query: "Where is my order #12345?"
    assertions:
      - must_contain: "order"
      - must_contain: "12345"

  - name: "Return Request"
    inputs:
      query: "I want to return my purchase"
    assertions:
      - must_contain: "return"
      - output_type: "text"

  - name: "Product Question"
    inputs:
      query: "Does this laptop have a backlit keyboard?"
    assertions:
      - must_contain: "keyboard"
      - max_latency_ms: 2000
```

### Load and Iterate Through Suite

```python
from backend.core.parser import TestSpecParser

# Load suite
suite = TestSpecParser.parse_file("customer_support_suite.yaml")

print(f"Suite: {suite.name}")
print(f"Version: {suite.version}")
print(f"Tests: {len(suite.tests)}")
print(f"Default model: {suite.defaults.model}")

# Iterate through tests
for test in suite.tests:
    print(f"\n  Test: {test.name}")
    print(f"    Model: {test.model}")
    print(f"    Assertions: {len(test.assertions)}")
```

## Converting Between YAML and JSON

Sentinel supports both YAML and JSON formats.

### YAML to JSON

```python
from backend.core.parser import TestSpecParser

# Load YAML
spec = TestSpecParser.parse_file("my_test.yaml")

# Convert to JSON
json_str = TestSpecParser.to_json(spec)

# Save as JSON
TestSpecParser.write_file(spec, "my_test.json")
```

### JSON to YAML

```python
# Load JSON
spec = TestSpecParser.parse_file("my_test.json")

# Convert to YAML
yaml_str = TestSpecParser.to_yaml(spec)

# Save as YAML
TestSpecParser.write_file(spec, "my_test.yaml")
```

### Round-Trip Conversion

```python
# Parse → Serialize → Parse (no data loss)
spec1 = TestSpecParser.parse_file("test.yaml")
yaml_str = TestSpecParser.to_yaml(spec1)
spec2 = TestSpecParser.parse_yaml(yaml_str)

# Verify they're identical
assert spec1.name == spec2.name
assert spec1.model == spec2.model
assert spec1.assertions == spec2.assertions
```

## Common Tasks

### Task 1: Create a Test from Scratch

```python
from backend.core.schema import TestSpec, InputSpec

spec = TestSpec(
    name="Math Q&A Test",
    model="gpt-4",
    inputs=InputSpec(query="What is 15 × 24?"),
    assertions=[
        {"must_contain": "360"},
        {"output_type": "text"}
    ],
    seed=123
)

# Save it
TestSpecParser.write_file(spec, "math_test.yaml")
```

### Task 2: Modify an Existing Test

```python
# Load existing test
spec = TestSpecParser.parse_file("existing_test.yaml")

# Modify fields
spec.name = "Updated Test Name"
spec.model = "claude-3-5-sonnet-20241022"
spec.seed = 999

# Add a new assertion
spec.assertions.append({"max_latency_ms": 2000})

# Save changes
TestSpecParser.write_file(spec, "updated_test.yaml")
```

### Task 3: Validate Multiple Tests

```python
import os
from pathlib import Path

test_dir = Path("tests")

for test_file in test_dir.glob("*.yaml"):
    try:
        spec = TestSpecParser.parse_file(test_file)
        print(f"✓ {test_file.name} is valid")
    except Exception as e:
        print(f"✗ {test_file.name} failed: {e}")
```

## Next Steps

Now that you've completed the Getting Started guide, here's what to explore next:

1. **[DSL Reference](dsl-reference.md)** - Complete specification of all fields and types
2. **[Examples Guide](examples.md)** - Detailed walkthrough of all templates
3. **[API Reference](api-reference.md)** - Full Python API documentation
4. **[Best Practices](best-practices.md)** - Learn how to write effective tests

### Ready to Learn More?

- Browse the [example templates](examples.md)
- Read the [DSL specification](dsl-reference.md)
- Check out [best practices](best-practices.md)
- Explore the [Python API](api-reference.md)

## Getting Help

- **Documentation**: [docs/README.md](README.md)
- **Examples**: [docs/examples.md](examples.md)
- **Issues**: [GitHub Issues](https://github.com/navam-io/sentinel/issues)

Happy testing! 🚀
