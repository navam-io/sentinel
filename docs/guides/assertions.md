# Assertions Guide

Assertions define the success criteria for your tests. This guide covers all assertion types available in Sentinel and how to use them effectively.

## Overview

An assertion is a rule that the model's output must satisfy for the test to pass. Sentinel supports 8 types of assertions:

| Assertion | Purpose | Example |
|-----------|---------|---------|
| `must_contain` | Output contains text | `must_contain: "Paris"` |
| `must_not_contain` | Output doesn't contain text | `must_not_contain: "error"` |
| `regex_match` | Output matches pattern | `regex_match: "\\d{4}"` |
| `must_call_tool` | Agent called specific tool(s) | `must_call_tool: "browser"` |
| `output_type` | Output format validation | `output_type: "json"` |
| `max_latency_ms` | Maximum execution time | `max_latency_ms: 3000` |
| `min_tokens` | Minimum output length | `min_tokens: 50` |
| `max_tokens` | Maximum output length | `max_tokens: 500` |

## Content Assertions

### `must_contain`

Validates that the output contains specific text.

**Single string:**
```yaml
assertions:
  - must_contain: "Paris"
```

**Multiple strings (all must be present):**
```yaml
assertions:
  - must_contain: ["Paris", "France", "capital"]
```

**Case sensitivity:** Content matching is case-sensitive by default.

```yaml
# These are different
- must_contain: "Paris"   # Matches "Paris"
- must_contain: "paris"   # Matches "paris"
```

**Use cases:**
- Verify key facts are mentioned
- Check that instructions were followed
- Validate required content is present

**Examples:**
```yaml
# Geography test
assertions:
  - must_contain: "Paris"

# Code generation
assertions:
  - must_contain: ["def", "return", "docstring"]

# Safety check
assertions:
  - must_contain: "I cannot help with that"
```

### `must_not_contain`

Validates that the output does NOT contain specific text.

**Single string:**
```yaml
assertions:
  - must_not_contain: "error"
```

**Multiple strings (none should be present):**
```yaml
assertions:
  - must_not_contain: ["error", "failed", "exception"]
```

**Use cases:**
- Safety testing (ensure harmful content is not generated)
- Error detection (output shouldn't have error messages)
- Competitor mentions (don't mention competing products)

**Examples:**
```yaml
# Safety test
assertions:
  - must_not_contain: ["violent", "harmful", "illegal"]

# Brand protection
assertions:
  - must_not_contain: ["Competitor A", "Competitor B"]

# Error detection
assertions:
  - must_not_contain: "Error:"
```

### `regex_match`

Validates that the output matches a regular expression pattern.

**Syntax:**
```yaml
assertions:
  - regex_match: "pattern here"
```

**Important:** Use double backslashes `\\` for escape sequences in YAML.

**Common patterns:**

```yaml
# Date format (YYYY-MM-DD)
- regex_match: "\\d{4}-\\d{2}-\\d{2}"

# Email address
- regex_match: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"

# Python function definition
- regex_match: "def \\w+\\("

# Function with type hints
- regex_match: "def \\w+\\(.*\\) ->.*:"

# JSON object
- regex_match: "\\{.*\\}"

# URL
- regex_match: "https?://[^\\s]+"

# Phone number (US format)
- regex_match: "\\(\\d{3}\\) \\d{3}-\\d{4}"
```

**Use cases:**
- Validate structured output formats
- Check for specific patterns in code
- Verify data follows expected format

**Examples:**
```yaml
# Code generation - check for type hints
assertions:
  - regex_match: "def factorial\\(.*\\) -> int:"

# Date validation
assertions:
  - regex_match: "\\d{4}-\\d{2}-\\d{2}"

# Markdown header
assertions:
  - regex_match: "^#{1,6} .+"
```

**Tips:**
- Test regex patterns at [regex101.com](https://regex101.com/)
- Remember to escape special characters: `\\d`, `\\w`, `\\s`, `\\.`
- Use raw strings in Python: `r"pattern"` to avoid double-escaping

## Behavioral Assertions

### `must_call_tool`

Validates that the agent called specific tool(s).

**Single tool:**
```yaml
assertions:
  - must_call_tool: "browser"
```

**Multiple tools (all must be called):**
```yaml
assertions:
  - must_call_tool: ["browser", "calculator", "scraper"]
```

**Use cases:**
- Verify agent used correct tools
- Ensure multi-step workflows executed properly
- Validate tool orchestration

**Examples:**
```yaml
# Research agent must search
assertions:
  - must_call_tool: "web_search"

# E-commerce agent workflow
assertions:
  - must_call_tool: ["browser", "price_checker", "cart"]

# Calculator usage
assertions:
  - must_call_tool: "calculator"
```

**Note:** This assertion only checks if the tool was called, not:
- How many times it was called
- What arguments were passed
- Whether the call succeeded

(These features may come in future versions)

## Format Assertions

### `output_type`

Validates the format/structure of the output.

**Supported types:**
```yaml
assertions:
  - output_type: "json"        # Valid JSON
  - output_type: "text"        # Plain text
  - output_type: "markdown"    # Markdown format
  - output_type: "code"        # Code block
  - output_type: "structured"  # Structured data (JSON/XML/YAML)
```

**Type descriptions:**

| Type | Validation | Use Case |
|------|------------|----------|
| `json` | Parseable as JSON | API responses, structured data |
| `text` | Plain text | Simple answers, explanations |
| `markdown` | Markdown syntax | Documentation, formatted text |
| `code` | Code block detected | Code generation |
| `structured` | Any structured format | Data extraction |

**Examples:**
```yaml
# API response
assertions:
  - output_type: "json"

# Documentation generation
assertions:
  - output_type: "markdown"

# Code generation
assertions:
  - output_type: "code"
```

**Combining with content checks:**
```yaml
# Ensure JSON AND contains specific keys
assertions:
  - output_type: "json"
  - must_contain: ["name", "age", "email"]
```

## Performance Assertions

### `max_latency_ms`

Sets a maximum allowed latency (execution time) in milliseconds.

**Syntax:**
```yaml
assertions:
  - max_latency_ms: 3000  # 3 seconds
```

**Common values:**
```yaml
- max_latency_ms: 1000    # 1 second (very fast)
- max_latency_ms: 3000    # 3 seconds (fast)
- max_latency_ms: 10000   # 10 seconds (moderate)
- max_latency_ms: 30000   # 30 seconds (slow, complex)
```

**Use cases:**
- Performance regression testing
- SLA validation
- Timeout detection

**Examples:**
```yaml
# Fast Q&A
assertions:
  - max_latency_ms: 2000

# Complex agent workflow
assertions:
  - max_latency_ms: 30000

# Simple completion
assertions:
  - max_latency_ms: 1000
```

**Note:** Currently validation-only. Execution timing comes in v0.3.0 (Run Executor).

### `min_tokens` / `max_tokens`

Validates output length in tokens.

**Syntax:**
```yaml
assertions:
  - min_tokens: 50      # At least 50 tokens
  - max_tokens: 500     # At most 500 tokens
```

**Use cases:**
- Ensure response is substantial enough
- Prevent overly verbose responses
- Validate output length requirements

**Examples:**
```yaml
# Ensure detailed explanation
assertions:
  - min_tokens: 100

# Keep response concise
assertions:
  - max_tokens: 200

# Within specific range
assertions:
  - min_tokens: 50
  - max_tokens: 150
```

**Typical ranges:**

| Use Case | Min Tokens | Max Tokens |
|----------|------------|------------|
| Short answer | 5 | 50 |
| Paragraph | 50 | 200 |
| Detailed explanation | 100 | 500 |
| Article | 300 | 2000 |

## Combining Assertions

Tests typically use multiple assertions to validate different aspects:

### Pattern: Content + Format
```yaml
assertions:
  - must_contain: ["name", "price", "description"]
  - output_type: "json"
```

### Pattern: Content + Performance
```yaml
assertions:
  - must_contain: "Paris"
  - max_latency_ms: 2000
  - max_tokens: 100
```

### Pattern: Behavior + Content
```yaml
assertions:
  - must_call_tool: "browser"
  - must_contain: "product"
  - output_type: "json"
```

### Pattern: Full Validation
```yaml
assertions:
  # Content
  - must_contain: ["price", "shipping"]
  - must_not_contain: "error"

  # Behavior
  - must_call_tool: ["browser", "calculator"]

  # Format
  - output_type: "json"

  # Performance
  - max_latency_ms: 10000
  - max_tokens: 500
```

## Best Practices

### 1. Be Specific but Not Brittle

```yaml
# Good: Specific key points
assertions:
  - must_contain: ["capital", "Paris", "France"]

# Too brittle: Exact match
assertions:
  - must_contain: "The capital of France is Paris."  # Will fail on wording changes
```

### 2. Test Multiple Dimensions

```yaml
# Good: Multiple validation layers
assertions:
  - must_contain: "result"      # Content
  - output_type: "json"          # Format
  - max_latency_ms: 3000         # Performance
  - must_call_tool: "calculator" # Behavior

# Avoid: Single weak assertion
assertions:
  - must_contain: "answer"  # Too vague
```

### 3. Use Regex for Patterns

```yaml
# Good: Validate format
assertions:
  - regex_match: "\\d{4}-\\d{2}-\\d{2}"  # Date format

# Avoid: Multiple exact matches
assertions:
  - must_contain: "2025-11-15"  # Only matches this specific date
```

### 4. Negative Testing

```yaml
# Test both what should and shouldn't be present
assertions:
  - must_contain: "Paris"
  - must_not_contain: ["London", "Berlin", "Rome"]
```

### 5. Safety Assertions

```yaml
# Ensure harmful content is blocked
assertions:
  - must_not_contain: ["violent", "illegal", "harmful"]
  - must_contain: ["cannot", "unable", "not appropriate"]
```

## Common Patterns

### Pattern: JSON API Response
```yaml
assertions:
  - output_type: "json"
  - must_contain: ["status", "data"]
  - must_not_contain: "error"
  - max_latency_ms: 2000
```

### Pattern: Code Generation
```yaml
assertions:
  - regex_match: "def \\w+\\("
  - must_contain: "return"
  - output_type: "code"
  - must_not_contain: "Error"
```

### Pattern: Safety Test
```yaml
assertions:
  - must_not_contain: ["hack", "bypass", "jailbreak"]
  - must_contain: "I cannot"
  - output_type: "text"
```

### Pattern: Agent Workflow
```yaml
assertions:
  - must_call_tool: ["search", "calculator", "formatter"]
  - must_contain: "result"
  - output_type: "structured"
  - max_latency_ms: 15000
```

## Troubleshooting

### Assertion Failed: must_contain

**Problem:** Assertion fails even though content seems present.

**Checks:**
- Case sensitivity: "Paris" ≠ "paris"
- Exact spelling and spacing
- Hidden characters or formatting

**Solution:**
```yaml
# Instead of exact match
- must_contain: "The answer is 42."

# Use keywords
- must_contain: ["answer", "42"]
```

### Assertion Failed: regex_match

**Problem:** Regex doesn't match expected output.

**Debugging:**
1. Test regex at [regex101.com](https://regex101.com/)
2. Check escape sequences: `\\d` not `\d` in YAML
3. Verify output format matches expectation

### Assertion Failed: output_type

**Problem:** Output type validation fails.

**Common causes:**
- Extra text around JSON: "Here's the JSON: {...}"
- Invalid JSON syntax
- Wrong format entirely

**Solution:**
```yaml
# Use system prompt to enforce format
inputs:
  query: "Generate user data"
  system_prompt: "Return ONLY valid JSON, no explanatory text."

assertions:
  - output_type: "json"
```

## Next Steps

- **[Writing Tests Guide](writing-tests.md)** - Complete test writing guide
- **[Test Suites](test-suites.md)** - Organize multiple tests
- **[Examples Gallery](../examples/gallery.md)** - See assertions in action

## Quick Reference

```yaml
# Content
assertions:
  - must_contain: "text"
  - must_contain: ["text1", "text2"]
  - must_not_contain: "text"
  - must_not_contain: ["text1", "text2"]
  - regex_match: "pattern"

# Behavior
  - must_call_tool: "tool"
  - must_call_tool: ["tool1", "tool2"]

# Format
  - output_type: "json|text|markdown|code|structured"

# Performance
  - max_latency_ms: 3000
  - min_tokens: 50
  - max_tokens: 500
```
