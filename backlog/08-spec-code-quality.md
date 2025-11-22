# Code Quality & Testing Specification

**Status:** Active
**Version:** 1.0
**Last Updated:** 2025-11-22
**Based On:** [Code Metrics Report 2025-11-22](../metrics/report-2025-11-22-110439.md)

## Overview

This specification outlines code quality standards, testing requirements, and technical debt remediation for the Sentinel visual-first agent testing platform. It addresses critical gaps identified in the November 2025 code metrics analysis.

## Current State (Baseline)

### Code Metrics Summary

- **Total Project LOC:** 41,092 lines (project-only, excluding dependencies)
- **Application Code:** 9,167 lines (TypeScript + Python)
- **Frontend:** 5,962 lines TypeScript across 65 files
- **Backend:** 3,205 lines Python across 34 files
- **Documentation:** 19,737 lines (48% of project - excellent)
- **Test Code:** ~2,925 lines total

### Test Coverage Status

| Component | Current | Target | Status | Priority |
|-----------|---------|--------|--------|----------|
| **Frontend** | ~30% | 80% | 🔴 Critical Gap | P0 |
| DSL Generator/Parser | 0% | 100% | 🔴 Critical Gap | P0 |
| Canvas Component | 0% | 80% | 🔴 Critical Gap | P0 |
| Node Components (5 types) | 0% | 80% | 🔴 Critical Gap | P0 |
| Services | Partial | 80% | 🟡 Needs Work | P1 |
| Hooks | Partial | 80% | 🟡 Needs Work | P1 |
| UI Components | 29% (5/17) | 80% | 🟡 Needs Work | P1 |
| **Backend** | ~54% | 80% | 🟡 Needs Work | P1 |
| Providers | Good | 90% | ⚠️ Minor Gap | P2 |
| Validators | Good | 90% | ✅ Adequate | - |
| Storage | Good | 90% | ✅ Adequate | - |
| API Endpoints | Good | 90% | ✅ Adequate | - |
| **E2E Tests** | 0% | Complete workflows | 🔴 Missing | P1 |

### Code Quality Issues

| Issue | Count/Status | Target | Priority |
|-------|--------------|--------|----------|
| TypeScript `any` usage | 17 instances | 0 | 🔴 P0 |
| Python code style (Black) | Not confirmed | 100% compliance | 🟡 P1 |
| Python linting (Ruff) | Not confirmed | 0 errors | 🟡 P1 |
| Python type checking (MyPy) | Not confirmed | Strict mode | 🟡 P1 |
| Cyclomatic complexity | Not measured | < 10 per function | 🟢 P2 |
| Performance benchmarks | Not run | All measured | 🟡 P1 |
| Security audit (pip-audit) | Not run | 0 vulnerabilities | 🟡 P1 |

## P0: Critical Testing Requirements (Immediate Action)

### 1. DSL Generator/Parser Tests (785 LOC - 0% Coverage)

**Impact:** Core feature - bidirectional Visual ↔ YAML conversion must be bulletproof.

**Location:** `frontend/src/lib/dsl/`

**Test File:** `frontend/src/lib/dsl/generator.test.ts` + `parser.test.ts`

**Requirements:**

#### Visual → YAML Generation Tests
```typescript
// Test file: frontend/src/lib/dsl/generator.test.ts

describe('DSL Generator', () => {
  describe('Visual to YAML conversion', () => {
    it('should generate valid YAML from empty canvas')
    it('should generate YAML from single input node')
    it('should generate YAML from single model node')
    it('should generate YAML from input → model chain')
    it('should generate YAML from input → model → assertion chain')
    it('should generate YAML with all 5 node types')
    it('should preserve node properties (labels, configs)')
    it('should preserve edge connections')
    it('should handle disconnected nodes')
    it('should handle complex graphs (multiple paths)')
    it('should escape special characters in YAML')
    it('should handle empty string values')
    it('should handle null/undefined values')
  })

  describe('YAML validation', () => {
    it('should validate generated YAML with js-yaml')
    it('should match Sentinel test spec schema')
    it('should be parseable by backend')
  })

  describe('Edge cases', () => {
    it('should handle 100+ nodes')
    it('should handle circular references (error)')
    it('should handle malformed node data')
    it('should handle missing required fields')
  })
})
```

#### YAML → Visual Import Tests
```typescript
// Test file: frontend/src/lib/dsl/parser.test.ts

describe('DSL Parser', () => {
  describe('YAML to Visual conversion', () => {
    it('should parse empty YAML to empty canvas')
    it('should parse simple_qa.yaml template')
    it('should parse multi_turn.yaml template')
    it('should parse browser_agent.yaml template')
    it('should parse code_generation.yaml template')
    it('should parse langgraph_agent.yaml template')
    it('should parse test_suite.yaml template')
    it('should create correct node types')
    it('should create correct edges')
    it('should restore node positions')
    it('should restore node properties')
  })

  describe('Error handling', () => {
    it('should handle invalid YAML syntax')
    it('should handle unknown node types')
    it('should handle missing required fields')
    it('should handle malformed edges')
    it('should provide helpful error messages')
  })

  describe('Round-trip fidelity', () => {
    it('should maintain data integrity: Visual → YAML → Visual')
    it('should maintain data integrity: YAML → Visual → YAML')
    it('should preserve all node properties')
    it('should preserve all edge connections')
    it('should preserve node order')
  })
})
```

**Success Criteria:**
- ✅ 100% code coverage of DSL generator/parser
- ✅ Zero data loss in round-trip conversion
- ✅ All 6 built-in templates import successfully
- ✅ Edge cases handled gracefully

**Time Estimate:** 2-3 days

---

### 2. Canvas Component Tests (TestCanvas.tsx - 0% Coverage)

**Impact:** Primary user interface - must be reliable and bug-free.

**Location:** `frontend/src/components/canvas/TestCanvas.tsx`

**Test File:** `frontend/src/components/canvas/TestCanvas.test.tsx`

**Requirements:**

```typescript
describe('TestCanvas', () => {
  describe('Initialization', () => {
    it('should render empty canvas')
    it('should load canvas with existing nodes')
    it('should initialize React Flow')
    it('should set up event handlers')
  })

  describe('Node creation', () => {
    it('should add input node on palette drop')
    it('should add model node on palette drop')
    it('should add assertion node on palette drop')
    it('should add tool node on palette drop')
    it('should add system node on palette drop')
    it('should position new nodes at drop location')
    it('should generate unique node IDs')
  })

  describe('Node manipulation', () => {
    it('should drag nodes to new positions')
    it('should select nodes on click')
    it('should multi-select with Cmd+click')
    it('should delete selected nodes with Delete key')
    it('should duplicate nodes with Cmd+D')
    it('should update node data on edit')
  })

  describe('Edge connections', () => {
    it('should create edge on handle drag')
    it('should validate edge connections (input → model)')
    it('should prevent invalid connections')
    it('should delete edges')
    it('should update edges on node deletion')
  })

  describe('State management', () => {
    it('should sync with Zustand store')
    it('should trigger YAML generation on change')
    it('should handle undo/redo (if implemented)')
    it('should persist canvas state')
  })

  describe('Performance', () => {
    it('should handle 50 nodes without lag')
    it('should handle 100 nodes without lag')
    it('should render at 60fps during drag')
  })

  describe('Keyboard shortcuts', () => {
    it('should delete nodes with Delete/Backspace')
    it('should copy with Cmd+C')
    it('should paste with Cmd+V')
    it('should select all with Cmd+A')
  })
})
```

**Success Criteria:**
- ✅ 80%+ code coverage
- ✅ All drag-and-drop scenarios tested
- ✅ Performance validated with 100+ nodes
- ✅ Keyboard shortcuts working

**Time Estimate:** 3-4 days

---

### 3. Node Component Tests (5 Node Types - 0% Coverage)

**Impact:** Core building blocks - must render correctly and maintain state.

**Locations:**
- `frontend/src/components/nodes/InputNode.tsx`
- `frontend/src/components/nodes/ModelNode.tsx`
- `frontend/src/components/nodes/AssertionNode.tsx`
- `frontend/src/components/nodes/ToolNode.tsx`
- `frontend/src/components/nodes/SystemNode.tsx`

**Test Files:** 5 separate test files (one per node type)

**Requirements (per node type):**

```typescript
// Example: InputNode.test.tsx
describe('InputNode', () => {
  describe('Rendering', () => {
    it('should render with default props')
    it('should render with custom label')
    it('should render input textarea')
    it('should render handles (input/output)')
    it('should apply correct styles')
  })

  describe('User interaction', () => {
    it('should update input value on change')
    it('should trigger onChange callback')
    it('should handle focus/blur events')
    it('should validate input on blur')
  })

  describe('Data management', () => {
    it('should update node data in canvas')
    it('should persist changes')
    it('should handle empty values')
    it('should handle long text (>1000 chars)')
  })

  describe('Edge cases', () => {
    it('should handle special characters')
    it('should handle newlines')
    it('should handle copy/paste')
    it('should handle max length limits')
  })
})
```

**Node-Specific Tests:**

**ModelNode.tsx:**
- Model provider selection dropdown
- Model selection (GPT-5.1, Claude 3.5, etc.)
- Temperature slider
- Max tokens input
- Provider-specific configs

**AssertionNode.tsx:**
- Assertion type selector (8 types)
- Assertion config inputs
- Expected value input
- Validation logic

**ToolNode.tsx:**
- Tool name input
- Tool description
- Function schema input (JSON)
- Schema validation

**SystemNode.tsx:**
- System prompt textarea
- Template variables
- Context data input

**Success Criteria:**
- ✅ 80%+ code coverage per node type
- ✅ All user interactions tested
- ✅ Data validation working
- ✅ Edge cases handled

**Time Estimate:** 4-5 days (all 5 nodes)

---

### 4. TypeScript `any` Usage Elimination (17 Instances)

**Impact:** Type safety and maintainability.

**Current:** 17 `any` usages across frontend (2.9 per 1000 lines)

**Target:** 0 instances

**Strategy:**

1. **Audit all `any` usages:**
```bash
cd frontend
grep -rn ": any\|<any>" src/
```

2. **Categorize by type:**
   - Event handlers (React.SyntheticEvent)
   - API responses (define response types)
   - Third-party library types (use @types packages)
   - Generic utilities (use proper generics)

3. **Replace with proper types:**

**Before:**
```typescript
// ❌ BAD
const handleChange = (e: any) => {
  setValue(e.target.value);
};

const fetchData = async (): Promise<any> => {
  const response = await api.get('/tests');
  return response.data;
};
```

**After:**
```typescript
// ✅ GOOD
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

interface TestSpec {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
}

const fetchData = async (): Promise<TestSpec[]> => {
  const response = await api.get<TestSpec[]>('/tests');
  return response.data;
};
```

4. **Enable strict TypeScript checks:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**Success Criteria:**
- ✅ 0 `any` usages in codebase
- ✅ TypeScript strict mode enabled
- ✅ No type errors in `tsc --noEmit`

**Time Estimate:** 1-2 days

---

## P1: High Priority Quality Improvements

### 5. Frontend Test Coverage (30% → 50%+)

**Target:** 50% test coverage by lines (3,000+ test lines from current ~1,800)

**Focus Areas:**

#### Services Tests (801 LOC - Partial Coverage)

**Files to test:**
- `frontend/src/services/api.ts` (~200 lines)
- `frontend/src/services/templates.ts` (~250 lines)
- `frontend/src/services/storage.ts` (~150 lines)
- `frontend/src/services/auth.ts` (~200 lines)

**Example: api.test.ts**
```typescript
describe('API Service', () => {
  describe('executeTest', () => {
    it('should call POST /api/execute')
    it('should handle success response')
    it('should handle error response')
    it('should handle network errors')
    it('should retry on timeout')
  })

  describe('fetchTests', () => {
    it('should call GET /api/tests')
    it('should return test list')
    it('should handle empty results')
    it('should handle pagination')
  })

  // ... similar for all API methods
})
```

#### Hooks Tests (396 LOC - Partial Coverage)

**Files to test:**
- `frontend/src/hooks/useExecution.ts`
- `frontend/src/hooks/useTemplates.ts`
- `frontend/src/hooks/useStorage.ts`
- `frontend/src/hooks/useCanvas.ts`

**Example: useExecution.test.ts**
```typescript
describe('useExecution', () => {
  it('should initialize with idle state')
  it('should execute test spec')
  it('should update state to running')
  it('should update state to success on completion')
  it('should update state to error on failure')
  it('should handle execution results')
  it('should clear execution state')
})
```

#### UI Component Tests (17 components - 5 tested, 12 untested)

**Untested components to add:**
- Button.tsx
- Card.tsx
- Modal.tsx
- Input.tsx
- Label.tsx
- Dropdown.tsx
- Tooltip.tsx
- Badge.tsx
- Spinner.tsx
- Alert.tsx
- Tabs.tsx
- ProviderCard.tsx

**Success Criteria:**
- ✅ 50%+ overall frontend test coverage
- ✅ All services tested
- ✅ All hooks tested
- ✅ 80%+ UI components tested

**Time Estimate:** 1 week

---

### 6. Backend Code Style Compliance

**Current:** Not confirmed (Black, Ruff, MyPy status unknown)

**Target:** 100% compliance with Python best practices

#### 6.1 Black Formatting

**Install:**
```bash
cd backend
pip install black
```

**Configuration:** `backend/pyproject.toml`
```toml
[tool.black]
line-length = 100
target-version = ['py313']
include = '\.pyi?$'
exclude = '''
/(
    \.git
  | \.venv
  | venv
  | __pycache__
  | \.pytest_cache
)/
'''
```

**Run:**
```bash
# Check formatting
black --check .

# Apply formatting
black .
```

**Success Criteria:**
- ✅ All Python files formatted with Black
- ✅ Line length ≤ 100 characters
- ✅ Consistent style across codebase

#### 6.2 Ruff Linting

**Install:**
```bash
pip install ruff
```

**Configuration:** `backend/pyproject.toml`
```toml
[tool.ruff]
line-length = 100
target-version = "py313"

select = [
  "E",   # pycodestyle errors
  "W",   # pycodestyle warnings
  "F",   # pyflakes
  "I",   # isort
  "N",   # pep8-naming
  "UP",  # pyupgrade
  "B",   # flake8-bugbear
  "C4",  # flake8-comprehensions
  "SIM", # flake8-simplify
]

ignore = [
  "E501",  # line too long (handled by black)
]

[tool.ruff.per-file-ignores]
"__init__.py" = ["F401"]  # Allow unused imports in __init__.py
```

**Run:**
```bash
# Check linting
ruff check .

# Fix auto-fixable issues
ruff check --fix .
```

**Success Criteria:**
- ✅ 0 Ruff errors
- ✅ 0 Ruff warnings (or justified ignores)
- ✅ Import sorting with isort rules

#### 6.3 MyPy Type Checking

**Install:**
```bash
pip install mypy
```

**Configuration:** `backend/pyproject.toml`
```toml
[tool.mypy]
python_version = "3.13"
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_incomplete_defs = true
check_untyped_defs = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_no_return = true
warn_unreachable = true

# Per-module options
[[tool.mypy.overrides]]
module = "tests.*"
disallow_untyped_defs = false
```

**Run:**
```bash
mypy .
```

**Success Criteria:**
- ✅ MyPy strict mode enabled
- ✅ 100% functions have type hints
- ✅ 0 MyPy errors

**Time Estimate:** 2-3 days

---

### 7. Backend Test Coverage (54% → 80%)

**Current:** ~54% (1,125 test lines / 2,080 app lines)

**Target:** 80%+ coverage

**Focus Areas:**

#### 7.1 Anthropic Integration Test

**Missing:** Anthropic provider integration test (only OpenAI tested)

**File:** `backend/tests/test_anthropic_integration.py`

```python
import pytest
from backend.providers.anthropic_provider import AnthropicProvider

class TestAnthropicIntegration:
    def test_execute_simple_prompt(self):
        """Test basic Claude API call"""
        provider = AnthropicProvider(api_key=os.getenv("ANTHROPIC_API_KEY"))
        result = provider.execute({
            "model": "claude-3-5-sonnet-20241022",
            "messages": [{"role": "user", "content": "Say hello"}]
        })
        assert result.success
        assert "hello" in result.output.lower()

    def test_streaming_response(self):
        """Test streaming Claude responses"""
        # ...

    def test_error_handling(self):
        """Test API error handling"""
        # ...

    def test_token_tracking(self):
        """Test token usage tracking"""
        # ...

    def test_rate_limiting(self):
        """Test rate limit handling"""
        # ...
```

#### 7.2 Provider Tests Enhancement

**Add tests for:**
- Provider initialization
- Configuration validation
- Error recovery
- Retry logic
- Token counting
- Cost tracking

#### 7.3 Core/Utils Tests

**Currently:** 962 lines of core/utils code, test coverage unknown

**Add tests for:**
- Schema validation (Pydantic models)
- Configuration loading
- Utility functions
- Helper methods

**Success Criteria:**
- ✅ 80%+ backend test coverage
- ✅ Anthropic integration test passing
- ✅ All critical paths tested

**Time Estimate:** 3-4 days

---

### 8. E2E Tests (Core User Workflows)

**Current:** 0% E2E test coverage

**Target:** All critical user journeys tested

**Tool:** Playwright (for Tauri desktop app testing)

**Setup:**
```bash
cd frontend
npm install -D @playwright/test
npx playwright install
```

**Configuration:** `frontend/playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Critical User Journeys:**

#### Journey 1: Create Test from Scratch
```typescript
// e2e/create-test.spec.ts
test('should create test from scratch', async ({ page }) => {
  // 1. Open app
  await page.goto('/');

  // 2. Drag Input node to canvas
  await page.dragAndDrop('[data-node-type="input"]', '[data-testid="canvas"]');

  // 3. Drag Model node to canvas
  await page.dragAndDrop('[data-node-type="model"]', '[data-testid="canvas"]');

  // 4. Connect nodes
  await page.click('[data-testid="input-output-handle"]');
  await page.click('[data-testid="model-input-handle"]');

  // 5. Configure nodes
  await page.fill('[data-testid="input-text"]', 'What is 2+2?');
  await page.selectOption('[data-testid="model-select"]', 'gpt-5.1');

  // 6. Execute test
  await page.click('[data-testid="execute-button"]');

  // 7. Verify results
  await expect(page.locator('[data-testid="execution-result"]')).toBeVisible();
  await expect(page.locator('[data-testid="execution-status"]')).toHaveText('Success');
});
```

#### Journey 2: Load Template and Execute
```typescript
// e2e/template-workflow.spec.ts
test('should load template and execute', async ({ page }) => {
  // 1. Open template gallery
  await page.click('[data-testid="templates-button"]');

  // 2. Select simple_qa template
  await page.click('[data-template-id="simple_qa"]');

  // 3. Verify nodes loaded
  await expect(page.locator('[data-node-type="input"]')).toBeVisible();
  await expect(page.locator('[data-node-type="model"]')).toBeVisible();

  // 4. Execute test
  await page.click('[data-testid="execute-button"]');

  // 5. Verify results
  await expect(page.locator('[data-testid="execution-result"]')).toBeVisible();
});
```

#### Journey 3: Visual ↔ YAML Round-Trip
```typescript
// e2e/yaml-roundtrip.spec.ts
test('should maintain fidelity in YAML round-trip', async ({ page }) => {
  // 1. Create test visually
  // ... (create nodes, connect them)

  // 2. Export to YAML
  await page.click('[data-testid="export-yaml"]');
  const yaml = await page.textContent('[data-testid="yaml-output"]');

  // 3. Clear canvas
  await page.click('[data-testid="clear-canvas"]');

  // 4. Import YAML
  await page.fill('[data-testid="yaml-input"]', yaml);
  await page.click('[data-testid="import-yaml"]');

  // 5. Verify same structure
  await expect(page.locator('[data-node-type="input"]')).toBeVisible();
  await expect(page.locator('[data-node-type="model"]')).toBeVisible();

  // 6. Export again and compare
  await page.click('[data-testid="export-yaml"]');
  const yaml2 = await page.textContent('[data-testid="yaml-output"]');
  expect(yaml).toBe(yaml2);
});
```

**Success Criteria:**
- ✅ 3+ critical user journeys tested
- ✅ All E2E tests passing
- ✅ Tests run in CI/CD
- ✅ Screenshot/video on failure

**Time Estimate:** 1 week

---

## P2: Medium Priority Improvements

### 9. Performance Benchmarking

**Tools:**
- Chrome DevTools (Performance profiler)
- Lighthouse (web vitals)
- React DevTools Profiler
- Custom performance marks

**Metrics to Measure:**

#### 9.1 Canvas Performance

```typescript
// Performance test: frontend/src/__tests__/performance/canvas.perf.test.ts

describe('Canvas Performance', () => {
  it('should render 50 nodes at 60fps', async () => {
    const { canvas } = await createCanvasWithNodes(50);
    const fps = await measureFPS(canvas, duration: 5000);
    expect(fps).toBeGreaterThan(55); // 60fps target with 5fps tolerance
  });

  it('should render 100 nodes at 60fps', async () => {
    const { canvas } = await createCanvasWithNodes(100);
    const fps = await measureFPS(canvas, duration: 5000);
    expect(fps).toBeGreaterThan(55);
  });

  it('should drag node smoothly with 100+ nodes', async () => {
    const { canvas } = await createCanvasWithNodes(100);
    const dragLatency = await measureDragLatency(canvas);
    expect(dragLatency).toBeLessThan(16); // < 16ms per frame
  });
});
```

#### 9.2 DSL Generation Performance

```typescript
describe('DSL Generation Performance', () => {
  it('should generate YAML from 10 nodes in < 50ms', async () => {
    const nodes = createTestNodes(10);
    const start = performance.now();
    const yaml = generateYAML(nodes);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(50);
  });

  it('should generate YAML from 100 nodes in < 100ms', async () => {
    const nodes = createTestNodes(100);
    const start = performance.now();
    const yaml = generateYAML(nodes);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });
});
```

#### 9.3 Build Performance

```bash
# Measure build times
time npm run build
time npm run tauri:build

# Measure bundle size
npm run build
ls -lh dist/assets/*.js
```

**Target Metrics:**

| Metric | Target | Priority |
|--------|--------|----------|
| Canvas rendering (100 nodes) | 60fps | 🟡 Med |
| DSL generation (100 nodes) | < 100ms | 🟡 Med |
| Frontend build time | < 10s | 🟢 Low |
| Tauri build time | < 2min | 🟢 Low |
| Bundle size (compressed) | < 50MB | 🟢 Low |
| Desktop startup time | < 2s | 🟡 Med |
| Memory usage (typical) | < 200MB | 🟢 Low |

**Time Estimate:** 2-3 days

---

### 10. Security Audit & Hardening

#### 10.1 Dependency Security Audit

**Frontend (npm audit):**
```bash
cd frontend
npm audit
npm audit --audit-level=moderate
npm audit fix  # Apply automatic fixes
```

**Backend (pip-audit):**
```bash
cd backend
pip install pip-audit
pip-audit
pip-audit --fix  # If available
```

#### 10.2 API Key Storage Security

**Audit:**
- [ ] Verify API keys not hardcoded in source
- [ ] Check API keys not in git history
- [ ] Verify API keys stored in OS keychain (Tauri)
- [ ] Check .env files in .gitignore

**Implementation (Tauri secure storage):**
```rust
// Use Tauri's secure storage for API keys
use tauri::api::keyring::Keyring;

#[tauri::command]
fn store_api_key(service: String, key: String) -> Result<(), String> {
    let keyring = Keyring::new("sentinel", &service);
    keyring.set_password(&key).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_api_key(service: String) -> Result<String, String> {
    let keyring = Keyring::new("sentinel", &service);
    keyring.get_password().map_err(|e| e.to_string())
}
```

#### 10.3 Input Sanitization

**XSS Prevention:**
```typescript
// Sanitize user input before rendering
import DOMPurify from 'dompurify';

const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'code'],
    ALLOWED_ATTR: []
  });
};
```

**SQL Injection Prevention (Backend):**
```python
# Use SQLAlchemy ORM (parameterized queries)
# NEVER use string concatenation for SQL

# ✅ GOOD
test = db.query(Test).filter(Test.id == test_id).first()

# ❌ BAD
query = f"SELECT * FROM tests WHERE id = {test_id}"
```

#### 10.4 OWASP Top 10 Compliance

**Checklist:**
- [ ] A01:2021 - Broken Access Control
- [ ] A02:2021 - Cryptographic Failures (API keys encrypted)
- [ ] A03:2021 - Injection (SQL, XSS prevention)
- [ ] A04:2021 - Insecure Design
- [ ] A05:2021 - Security Misconfiguration
- [ ] A06:2021 - Vulnerable Components (audit dependencies)
- [ ] A07:2021 - Authentication Failures
- [ ] A08:2021 - Software and Data Integrity
- [ ] A09:2021 - Security Logging Failures
- [ ] A10:2021 - Server-Side Request Forgery

**Time Estimate:** 2-3 days

---

### 11. Code Complexity Analysis

#### 11.1 Python Complexity (Radon)

**Install:**
```bash
pip install radon
```

**Run:**
```bash
# Cyclomatic complexity
radon cc backend/ -a --total-average

# Maintainability index
radon mi backend/ -s

# Raw metrics (LOC, LLOC, etc.)
radon raw backend/ -s
```

**Targets:**
- Cyclomatic Complexity: < 10 per function (A/B grade)
- Maintainability Index: > 65 (A/B grade)
- Functions > 50 lines: Refactor candidates

**Example Report:**
```
backend/providers/openai_provider.py
    F 15:0 OpenAIProvider.execute - B (8)
    F 45:0 OpenAIProvider._handle_error - A (4)
    F 60:0 OpenAIProvider._track_tokens - A (3)
```

#### 11.2 TypeScript Complexity (ESLint)

**Configuration:** `frontend/.eslintrc.js`
```javascript
module.exports = {
  rules: {
    'complexity': ['error', { max: 10 }],
    'max-lines-per-function': ['warn', { max: 50 }],
    'max-depth': ['error', { max: 4 }],
    'max-params': ['error', { max: 4 }],
  }
};
```

**Run:**
```bash
cd frontend
npm run lint
```

**Success Criteria:**
- ✅ All functions complexity < 10
- ✅ All functions < 50 lines (warnings reviewed)
- ✅ Max nesting depth ≤ 4

**Time Estimate:** 1-2 days

---

### 12. Dependency Updates & Management

#### 12.1 Frontend Dependency Updates

**Outdated packages (7 total):**

| Package | Current | Latest | Type | Priority |
|---------|---------|--------|------|----------|
| @types/node | 22.19.1 | 24.10.1 | Major | 🟢 Low |
| @types/react | 19.2.5 | 19.2.6 | Patch | 🟢 Low |
| @vitejs/plugin-react | 4.7.0 | 5.1.1 | Major | 🟡 Med |
| lucide-react | 0.469.0 | 0.554.0 | Minor | 🟢 Low |
| tailwind-merge | 2.6.0 | 3.4.0 | Major | 🟡 Med |
| vite | 7.2.2 | 7.2.4 | Patch | 🟢 Low |
| vitest | 4.0.9 | 4.0.13 | Patch | 🟢 Low |

**Update Strategy:**
1. Patch updates: Safe to apply immediately
2. Minor updates: Review changelog, test
3. Major updates: Careful review, test suite must pass

**Commands:**
```bash
# Update patch versions
npm update

# Update to latest (including major)
npm install @types/react@latest

# Check for updates
npm outdated
```

#### 12.2 Backend Dependency Management

**Migrate to pyproject.toml:**

```toml
# backend/pyproject.toml
[project]
name = "sentinel-backend"
version = "0.14.0"
description = "Sentinel Backend API"
requires-python = ">=3.11,<3.14"
dependencies = [
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.32.0",
    "pydantic>=2.9.0",
    "sqlalchemy>=2.0.0",
    "anthropic>=0.39.0",
    "openai>=1.55.0",
    "httpx>=0.27.0",
    "python-dotenv>=1.0.0",
]

[project.optional-dependencies]
test = [
    "pytest>=8.3.0",
    "pytest-asyncio>=0.24.0",
    "pytest-cov>=6.0.0",
]
dev = [
    "black>=24.10.0",
    "ruff>=0.7.0",
    "mypy>=1.13.0",
    "radon>=6.0.1",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["backend"]
```

**Migrate from requirements.txt:**
```bash
cd backend
pip install hatch
hatch build
pip install -e ".[test,dev]"
```

#### 12.3 Automated Dependency Updates (Dependabot)

**Configuration:** `.github/dependabot.yml`
```yaml
version: 2
updates:
  # Frontend (npm)
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "maintainer-username"

  # Backend (pip)
  - package-ecosystem: "pip"
    directory: "/backend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

**Success Criteria:**
- ✅ All patch updates applied
- ✅ pyproject.toml created
- ✅ Dependabot configured
- ✅ Weekly dependency reviews

**Time Estimate:** 1-2 days

---

## Quality Metrics Dashboard

### Code Quality Scorecard

Track these metrics monthly:

| Metric | Baseline (Nov 2025) | Target | Current | Trend |
|--------|---------------------|--------|---------|-------|
| **Testing** |
| Frontend Test Coverage | 30% | 80% | - | - |
| Backend Test Coverage | 54% | 80% | - | - |
| E2E Test Coverage | 0% | 3+ workflows | - | - |
| Test-to-Code Ratio (Frontend) | 1:3.3 | 1:1 | - | - |
| Test-to-Code Ratio (Backend) | 1:1.85 | 1:1 | - | - |
| **Code Quality** |
| TypeScript `any` Usage | 17 | 0 | - | - |
| Black Compliance | Unknown | 100% | - | - |
| Ruff Errors | Unknown | 0 | - | - |
| MyPy Errors | Unknown | 0 | - | - |
| Cyclomatic Complexity (avg) | Unknown | < 10 | - | - |
| **Performance** |
| Canvas Rendering (100 nodes) | Unknown | 60fps | - | - |
| DSL Generation (100 nodes) | Unknown | < 100ms | - | - |
| Frontend Build Time | Unknown | < 10s | - | - |
| Bundle Size | Unknown | < 50MB | - | - |
| **Security** |
| npm Vulnerabilities | 0 | 0 | ✅ | - |
| pip Vulnerabilities | Unknown | 0 | - | - |
| Outdated Dependencies | 7 (npm) | 0 | - | - |
| **Documentation** |
| Code Comment Density | 4.3% | 5%+ | - | - |
| API Documentation | Partial | Complete | - | - |
| Architecture Diagrams | 0 | 3+ | - | - |

---

## Implementation Roadmap

### Phase 1: Critical Tests (Week 1-2)
- [ ] DSL Generator/Parser Tests (785 LOC) - 2-3 days
- [ ] Canvas Component Tests (TestCanvas.tsx) - 3-4 days
- [ ] Node Component Tests (5 types) - 4-5 days
- [ ] TypeScript `any` Elimination - 1-2 days

**Milestone:** Critical code tested, type safety improved

### Phase 2: Code Quality (Week 3-4)
- [ ] Backend Code Style (Black, Ruff, MyPy) - 2-3 days
- [ ] Frontend Test Coverage 50%+ - 1 week
- [ ] Backend Test Coverage 80%+ - 3-4 days

**Milestone:** Code quality standards enforced, coverage targets hit

### Phase 3: E2E & Performance (Week 5-6)
- [ ] E2E Tests (3 workflows) - 1 week
- [ ] Performance Benchmarking - 2-3 days
- [ ] Code Complexity Analysis - 1-2 days

**Milestone:** User journeys validated, performance measured

### Phase 4: Security & Dependencies (Week 7-8)
- [ ] Security Audit & Hardening - 2-3 days
- [ ] Dependency Updates - 1-2 days
- [ ] Dependabot Setup - 1 day

**Milestone:** Security hardened, dependencies managed

---

## Continuous Quality Process

### Pre-Commit Hooks

**Install husky:**
```bash
cd frontend
npm install -D husky lint-staged
npx husky install
```

**Configuration:** `.husky/pre-commit`
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Frontend
cd frontend
npm run lint
npm run type-check
npm test

# Backend
cd ../backend
black --check .
ruff check .
mypy .
pytest
```

### CI/CD Quality Gates

**GitHub Actions:** `.github/workflows/quality.yml`
```yaml
name: Code Quality

on: [push, pull_request]

jobs:
  frontend-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: cd frontend && npm ci
      - run: cd frontend && npm run lint
      - run: cd frontend && npm run type-check
      - run: cd frontend && npm test -- --coverage
      - run: cd frontend && npm run build

  backend-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.13'
      - run: cd backend && pip install -e ".[test,dev]"
      - run: cd backend && black --check .
      - run: cd backend && ruff check .
      - run: cd backend && mypy .
      - run: cd backend && pytest --cov

  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: cd frontend && npm audit
      - run: cd backend && pip-audit
```

### Monthly Quality Review

**Checklist:**
- [ ] Run metrics analysis (`/code:metrics`)
- [ ] Review quality scorecard
- [ ] Update this spec with new issues
- [ ] Prioritize technical debt
- [ ] Plan remediation for next month

---

## Success Criteria (Overall)

By the end of implementation (8 weeks):

✅ **Testing:**
- Frontend test coverage: 50%+
- Backend test coverage: 80%+
- E2E tests: 3+ workflows
- Critical code tested: DSL, Canvas, Nodes

✅ **Code Quality:**
- TypeScript `any` usage: 0
- Black compliance: 100%
- Ruff errors: 0
- MyPy errors: 0
- Cyclomatic complexity: < 10 avg

✅ **Performance:**
- Canvas rendering: 60fps @ 100 nodes
- DSL generation: < 100ms @ 100 nodes
- Frontend build: < 10s
- Bundle size: < 50MB

✅ **Security:**
- npm vulnerabilities: 0
- pip vulnerabilities: 0
- OWASP Top 10: Reviewed
- API keys: Securely stored

✅ **Process:**
- Pre-commit hooks: Configured
- CI/CD quality gates: Passing
- Dependabot: Configured
- Monthly reviews: Scheduled

---

## References

- [Code Metrics Report Nov 2025](../metrics/report-2025-11-22-110439.md)
- [Active Feature Backlog](./active.md)
- [CLAUDE.md Development Guide](../CLAUDE.md)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Python Testing Best Practices](https://docs.pytest.org/en/stable/goodpractices.html)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Last Updated:** 2025-11-22
**Next Review:** 2025-12-22
**Owner:** Engineering Team
**Status:** Active - Prioritize P0 items immediately
