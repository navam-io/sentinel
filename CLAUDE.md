# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Navam Sentinel** is a **visual-first agent testing and evaluation platform** for frontier AI labs, neo-labs, and AI research organizations.

**Core Philosophy**: "Point, Click, Test" - Make AI agent testing as intuitive as Postman made API testing, as visual as Langflow made LLM workflows, and as powerful as LangSmith made observability.

**Target Positioning**: "Postman for AI Agents" with research-grade rigor

### Key Capabilities
- **Visual drag-and-drop test creation** (node-based canvas)
- **Round-trip Visual ↔ DSL synchronization** (zero data loss)
- Deterministic, repeatable agent testing
- Cross-model/version/tool output comparison
- Automated capability and safety evaluations
- Regression detection (reasoning, tool calls, speed, cost)
- Collaborative workspaces and team testing

### Target Users

**Primary (Visual-First Interface)**:
- Product Managers (validate agents without code)
- QA Engineers (visual test creation and debugging)
- Research Scientists (build evals with AI assistance)
- Safety Teams (collaborative safety testing)
- Frontier Model Labs (test model releases)
- Neo-labs (agent-focused research)
- Agent Product Labs (production testing)

**Secondary (Advanced/DSL Mode)**:
- Model Engineers (direct DSL editing, programmatic testing)
- DevOps Engineers (CI/CD integration)
- Enterprise AI Teams (infrastructure testing)

## Architecture

### Deployment Models
1. **Primary**: Desktop app (Tauri) for individual users and small teams
2. **Secondary**: Self-hosted web app for enterprise teams
3. **Future**: Cloud SaaS for easy onboarding

### Tech Stack

**Frontend (Visual UI)**
- **Tauri 2.0**: Rust core + TypeScript UI (desktop app)
- **React 19 + Vite**: Modern web framework with TypeScript
- **React Flow** (@xyflow/react v12.3): Production-ready node-based canvas
- **Zustand**: Lightweight state management
- **shadcn/ui**: Component library with TailwindCSS (original React version)
- **lucide-react**: Icon library
- **Monaco Editor**: Code editing when direct YAML/JSON editing needed
- **Recharts**: Data visualization and charts

**Backend (Execution Engine & API)**
- **Python FastAPI**: REST API for test execution and validation
- **Pydantic**: Schema validation and type safety
- **PostgreSQL**: Test storage and run history (server mode)
- **SQLite**: Local storage (desktop mode)
- **Redis**: Real-time updates and task queues
- **Temporal.io** (optional): Deterministic workflows
- **OpenTelemetry**: Tracing (model → agent → tools)

**Model Integration (Pluggable Architecture)**

Priority order:
1. **Anthropic API** (Claude models) - v0.3.0
2. **OpenAI API** (GPT models) - v0.3.0
3. **Amazon Bedrock API** (multi-model support) - v0.12.0
4. **HuggingFace API** (hosted and endpoints) - v0.12.0
5. **Ollama API** (local models) - v0.12.0

**OFFICIAL OpenAI Frontier Models** (Source: https://platform.openai.com/docs/models - November 2025)

**CRITICAL**: These are the ONLY real OpenAI models. DO NOT use GPT-4o, GPT-4-turbo, or any GPT-4 series models as defaults. GPT-5 series are OpenAI's latest Frontier models.

Real OpenAI Frontier Models:
- `gpt-5.1` - GPT-5.1 (Best for coding and agentic tasks with configurable reasoning effort) **[DEFAULT]**
- `gpt-5-pro` - GPT-5 pro (Smarter, more precise responses)
- `gpt-5` - GPT-5 (Previous intelligent reasoning model for coding and agentic tasks)
- `gpt-5-mini` - GPT-5 mini (Faster, cost-efficient version for well-defined tasks)
- `gpt-5-nano` - GPT-5 nano (Fastest, most cost-efficient version)
- `gpt-4.1` - GPT-4.1 (Smartest non-reasoning model)

Pricing (November 2025):
- GPT-5.1: $3.00/MTok input, $12.00/MTok output
- GPT-5 Pro: $4.00/MTok input, $16.00/MTok output
- GPT-5: $2.50/MTok input, $10.00/MTok output
- GPT-5 Mini: $0.30/MTok input, $1.20/MTok output
- GPT-5 Nano: $0.10/MTok input, $0.40/MTok output
- GPT-4.1: $2.50/MTok input, $10.00/MTok output

**Agentic Framework Support (Pluggable Architecture)**

Priority order:
1. **LangGraph** - v0.9.0
2. **Claude Agent SDK** - Future
3. **OpenAI Agents SDK** - Future
4. **Strands Agents** - Future

## Visual-First Architecture

### Core Principle: Round-Trip Synchronization

**Visual → DSL**: Canvas changes generate YAML in real-time
**DSL → Visual**: YAML files import and render as nodes on canvas
**Bidirectional**: Edit in either mode, stay in sync
**Git-Friendly**: Visual changes show as clean YAML diffs

### File Structure (Actual)

```
sentinel/                      # Project root
├── frontend/                  # React + Vite + Tauri desktop app
│   ├── src/
│   │   ├── main.tsx          # React entry point
│   │   ├── App.tsx           # Main app component
│   │   ├── index.css         # Global styles + Sentinel theme
│   │   ├── components/       # React components (57 files, 6,659 LOC)
│   │   │   ├── canvas/       # React Flow canvas (2 files)
│   │   │   ├── palette/      # Component palette (2 files)
│   │   │   ├── nodes/        # Node types (10 components)
│   │   │   ├── execution/    # Execution panel (1 file)
│   │   │   ├── templates/    # Template gallery (5 files)
│   │   │   ├── ui/           # Shared UI components (19 files)
│   │   │   ├── icons/        # Icon components (13 files)
│   │   │   └── yaml/         # YAML editor/preview (3 files)
│   │   ├── hooks/            # Custom React hooks (6 files, 753 LOC)
│   │   ├── services/         # API client, templates, storage (4 files, 738 LOC)
│   │   ├── stores/           # Zustand state management (2 files, 542 LOC)
│   │   ├── lib/dsl/          # DSL generator & parser (2 files, 765 LOC)
│   │   ├── types/            # TypeScript types
│   │   └── test/             # Test setup
│   ├── src-tauri/            # Tauri Rust backend
│   │   ├── src/main.rs       # Tauri desktop app entry
│   │   ├── Cargo.toml
│   │   └── tauri.conf.json
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.ts        # Vite + testing config
│   ├── tailwind.config.js    # Tailwind theme (Sentinel colors)
│   └── tsconfig.json         # TypeScript configuration
│
├── backend/                   # Python FastAPI (sibling to frontend/)
│   ├── api/                  # REST API endpoints (4 files, 208 LOC)
│   ├── core/                 # Pydantic schema & parser
│   ├── providers/            # Model providers (4 files, 297 LOC)
│   │   ├── base.py           # Abstract provider
│   │   ├── anthropic.py      # Anthropic Claude provider
│   │   └── openai.py         # OpenAI GPT provider
│   ├── validators/           # Assertion validation (2 files, 272 LOC)
│   ├── storage/              # SQLite database layer (4 files, 339 LOC)
│   ├── executor/             # Test execution engine
│   ├── tests/                # pytest test suite (7 files, 1,114 LOC)
│   ├── main.py               # FastAPI app entry
│   ├── pyproject.toml        # Python project config + tools (Black, Ruff, MyPy)
│   ├── requirements.txt      # Python dependencies
│   └── start.sh              # Backend startup script
│
├── tests/                    # Root-level backend tests (pytest)
├── backlog/                  # Specs, roadmap, release notes (45 files)
│   ├── active.md             # Feature roadmap
│   ├── 03-spec-design-system.md  # Design system specs
│   ├── 02-spec-visual-first.md   # Visual UI component specs
│   └── release-*.md          # Release notes (v0.1.0 - v0.14.5)
├── templates/                # Built-in YAML test templates
├── docs/                     # User documentation
├── .env.example              # Environment variables template
├── pytest.ini                # Pytest configuration (root level)
├── .gitignore
├── CLAUDE.md                 # This file
├── README.md
└── LICENSE
```

## V1 Feature Slices (15 Total)

See `backlog/active.md` for complete feature specifications.

### P0 - Foundation (Features 1-4)

1. **Visual Canvas Foundation** (v0.3.0) ✅ COMPLETE (React Migration)
   - Tauri + React + Vite setup
   - Node-based canvas (React Flow v12.3)
   - Component palette (drag-drop)
   - Visual → YAML generator
   - YAML preview with edit/copy/download
   - 5 node types: Input, Model, Assertion, Tool, System

2. **DSL Parser & Visual Importer** (v0.4.0) ← NEXT
   - YAML/JSON parser (Pydantic)
   - YAML → Visual importer
   - Bidirectional sync
   - Monaco editor integration

3. **Model Provider Architecture & Execution** (v0.3.0)
   - Anthropic + OpenAI providers
   - Visual provider marketplace
   - Local execution engine
   - Live execution dashboard

4. **Assertion Builder & Validation** (v0.4.0)
   - Visual assertion builder
   - All assertion types (8 total)
   - Validation engine
   - Visual pass/fail indicators

### P1 - Core Value (Features 5-8)

5. **Design System Implementation** (v0.5.0)
   - Tailwind theme (Sentinel colors)
   - Icon system (30+ icons)
   - Core UI components
   - Motion/interactions

6. **Record & Replay Test Generation** (v0.6.0)
   - Recording mode
   - Smart detection (tools, outputs, patterns)
   - Auto-generate tests from interactions

7. **Template Gallery & Test Suites** (v0.7.0)
   - Template gallery (6+ templates)
   - Test suite organizer
   - Drag-drop management

8. **Regression Engine & Comparison View** (v0.8.0)
   - Visual comparison view
   - Regression detection
   - Trend charts

### P2 - Extended Value (Features 9-15)

9. **Agentic Framework Support** (v0.9.0) - LangGraph
10. **AI-Assisted Test Generation** (v0.10.0)
11. **Collaborative Workspaces** (v0.11.0)
12. **Additional Model Providers** (v0.12.0) - Bedrock, HuggingFace, Ollama
13. **Safety Scenarios & Eval Set Builder** (v0.13.0)
14. **Dashboard & Analytics** (v0.14.0)
15. **CI/CD Integration & Export** (v0.15.0)

## Design References

- **Visual UI Design**: `backlog/spec-04.md` - Complete visual component specifications
- **Design System**: `backlog/spec-03.md` - Tailwind theme, colors, typography, components
- **Research Inspiration**: Langflow, n8n, Postman, Playwright Codegen, LangSmith

## Design Principles

### Visual-First, Git-Friendly
- **GUI is primary**: Most users interact through visual canvas
- **DSL is interoperability**: YAML for version control, CI/CD, advanced users
- **Round-trip conversion**: Zero data loss between visual and DSL
- **Git-friendly**: Visual changes show as clean YAML diffs

### Security & Privacy First
- Desktop-first architecture (data stays local)
- Optional self-hosted server for teams
- Air-gapped deployment support
- Full control over model weights/outputs
- No vendor lock-in

### Deterministic & Reproducible
- Seeded randomization for reproducibility
- Prompt versioning and tracking
- Structured output validation
- Repeatable test environments

### Research-Grade Rigor
- Built for frontier AI labs and researchers
- Safety testing and evaluation suites
- Comprehensive metrics and observability
- Regression detection across models/versions

### Accessible to All
- No coding required for basic testing
- Intuitive visual interface (Postman, Langflow inspired)
- Advanced mode for power users (direct DSL editing)
- AI-assisted generation for rapid testing

## Project Status

**Current Version**: 0.17.0 (November 22, 2025)

**Status**: Phase 3 (Task 10) COMPLETE ✅ - Code Complexity Analysis Infrastructure

**Latest Release**: v0.17.0 - Code Complexity Analysis Infrastructure (Phase 3, Task 10 COMPLETE)

**Architecture**:
- Frontend: React 19 + Vite + Tauri 2.0 + React Flow 12.3
- Backend: FastAPI + Pydantic + SQLite
- Testing: 24 frontend test files (389 unit tests), 3 E2E test files (21 E2E tests), 7 backend test files (70 tests)

**Key Metrics (Current)**:
- Frontend: 76 TypeScript files, ~9,700 LOC
- Backend: 18 Python files, ~1,400 LOC
- Components: 57 React components across 8 categories
- Test Coverage: Frontend 50%+, Backend 85%+
- Tests: 459 total (389 frontend unit + 70 backend + 21 E2E), 100% pass rate
- TypeScript Errors: 0
- Code Quality: Black ✅, Ruff ✅, MyPy ✅, ESLint ✅, Playwright ✅

### Recent Milestones

**v0.17.0 - Code Complexity Analysis** (Nov 22, 2025)
- ✅ Python complexity analysis with Radon (avg 3.44, target < 10)
- ✅ 96.4% of functions with A-grade complexity
- ✅ All modules with A/B maintainability grade
- ✅ Comprehensive complexity report created

**v0.16.0 - Performance Benchmarking** (Nov 22, 2025)
- ✅ Canvas rendering: 31,143 ops/sec (519x faster than target)
- ✅ Build time: 1.68s (83% faster than target)
- ✅ Bundle size: 677KB (99% smaller than target)
- ✅ Performance baseline established

**v0.15.0 - E2E Testing Infrastructure** (Nov 22, 2025)
- ✅ Playwright E2E testing infrastructure configured
- ✅ 21 E2E tests across 3 critical user journeys
- ✅ Strategic test IDs added to all components
- ✅ CI/CD ready with headless, UI, and debug modes

**v0.14.5 - Phase 2 Complete** (Nov 22, 2025)
- ✅ 50%+ frontend test coverage achieved
- ✅ 389 passing frontend tests across 24 test files
- ✅ Comprehensive component testing (canvas, nodes, UI, hooks)

**v0.14.4 - Backend Code Style** (Nov 22, 2025)
- ✅ Black formatting compliance (line-length: 100)
- ✅ Ruff linting compliance
- ✅ MyPy type checking compliance

**v0.14.3 - TypeScript Type Safety** (Nov 22, 2025)
- ✅ 0 TypeScript errors achieved
- ✅ Strict type checking enabled
- ✅ Phase 1 complete

**v0.3.0 - React Migration** (Nov 16, 2025)
- ✅ Migrated from Svelte to React 19 for production stability
- ✅ React Flow 12.3 (400k+ weekly downloads, production-ready)
- ✅ All 5 node types working with 100% reliable drag-and-drop
- ✅ Tauri desktop app running smoothly

See `CHANGELOG.md` for full release history and `backlog/active.md` for detailed roadmap.

## Development Commands

### Frontend (React + Vite + Tauri)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Development (browser only - Vite dev server)
npm run dev                    # Runs on http://localhost:1420

# Development (Tauri desktop app - RECOMMENDED)
npm run tauri:dev              # Hot reload enabled

# Build desktop app for production
npm run tauri:build            # Output: src-tauri/target/release/

# Type checking
npm run type-check             # TypeScript validation (0 errors)

# Linting
npm run lint                   # ESLint

# Testing (Unit Tests)
npm test                       # Run all unit tests (Vitest) - 389 tests
npm run test:watch             # Watch mode
npm run test:ui                # Visual test UI

# Testing (E2E Tests)
npm run test:e2e               # Run all E2E tests (headless) - 21 tests
npm run test:e2e:ui            # Interactive UI mode (Playwright UI)
npm run test:e2e:headed        # Headed mode (see browser)
npm run test:e2e:debug         # Debug mode (step through tests)
npm run test:all               # Run all tests (unit + E2E)

# Production build (web)
npm run build                  # Output: dist/
npm run preview                # Preview production build
```

### Backend (Python FastAPI)

**IMPORTANT**: Backend is at project root level, not inside frontend/

```bash
# Navigate to backend directory (from project root)
cd backend

# Create virtual environment (first time only)
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -e ".[dev]"       # Includes dev tools (pytest, black, ruff, mypy)
# OR
pip install -r requirements.txt

# Development server
uvicorn main:app --reload     # Runs on http://localhost:8000
# OR use the startup script
chmod +x start.sh
./start.sh

# Testing (run from project root)
cd ..                         # Go to project root
pytest                        # Run all backend tests
pytest -v                     # Verbose output
pytest --cov                  # With coverage report
pytest backend/tests/test_specific.py  # Run specific test file

# Code Quality Tools
cd backend
black .                       # Format code (line-length: 100)
ruff check .                  # Lint code
ruff check --fix .            # Auto-fix linting issues
mypy .                        # Type checking

# View API documentation
# Start server, then visit:
# http://localhost:8000/docs   # Swagger UI
# http://localhost:8000/redoc  # ReDoc
```

### Full Stack Development

```bash
# Terminal 1: Start backend API
cd backend
source venv/bin/activate
uvicorn main:app --reload

# Terminal 2: Start frontend dev server
cd frontend
npm run tauri:dev

# Run tests (from project root)
pytest                        # Backend tests
cd frontend && npm test       # Frontend tests
```

### Common Development Tasks

```bash
# Run all tests (frontend unit + backend + E2E)
cd frontend && npm run test:all && cd ..
pytest

# Check code quality (all)
cd backend && black . && ruff check . && mypy . && cd ..
cd frontend && npm run lint && npm run type-check

# Clean build artifacts
cd frontend && rm -rf dist build node_modules/.vite
cd backend && rm -rf htmlcov .pytest_cache .mypy_cache __pycache__

# Update dependencies
cd frontend && npm update
cd backend && pip install --upgrade -e ".[dev]"
```

## Testing & Code Quality

### Frontend Testing (Vitest + React Testing Library)

The frontend has **24 test files** with **389 passing tests** (100% pass rate):

```bash
cd frontend

# Run all tests
npm test                      # ✅ 24 test files, 389 tests passing

# Watch mode (auto-rerun on changes)
npm run test:watch

# Visual UI (browser-based test runner)
npm run test:ui

# Test specific file
npm test -- src/components/nodes/InputNode.test.tsx

# Coverage report
npm test -- --coverage
```

**Test Coverage by Module:**
- **Canvas components**: 2 test files (Canvas, CanvasControls)
- **Node components**: 10 test files (InputNode, ModelNode, AssertionNode, ToolNode, SystemNode, etc.)
- **UI components**: Multiple test files covering 19 UI components (TrendChart, etc.)
- **Hooks**: 6 test files (useAutoSave, useTemplates, useExecution, etc.)
- **Services**: 4 test files (API client, storage, templates)
- **Stores**: Tests for Zustand state management

**Test Duration**: ~2-3 seconds for full suite

### Backend Testing (pytest + pytest-cov)

The backend has **7 test files** with **comprehensive coverage** (90%+):

```bash
# IMPORTANT: Run from project root, not backend/
pytest                                    # All tests
pytest -v                                 # Verbose
pytest --cov=backend --cov-report=html    # HTML coverage report
pytest -k "test_parser"                   # Run tests matching pattern
pytest backend/tests/test_providers.py    # Specific file
pytest -x                                 # Stop on first failure
pytest --lf                               # Run last failed tests

# View coverage report
open htmlcov/index.html                   # macOS
xdg-open htmlcov/index.html               # Linux
start htmlcov/index.html                  # Windows
```

**Backend Test Coverage:**
- **Providers**: Anthropic, OpenAI provider tests
- **Validators**: Assertion validation tests
- **Storage**: Database operation tests
- **API**: FastAPI endpoint tests
- **Core**: Schema and parser tests

**Configuration**: Tests configured in `pytest.ini` (root) and `backend/pyproject.toml`

### Code Quality Standards

**TypeScript (Frontend):**
- **Strict mode**: TypeScript strict checks enabled
- **Zero errors**: `npm run type-check` must pass with 0 errors
- **ESLint**: Code linting enforced
- **Component structure**: Functional components with hooks

```bash
cd frontend
npm run type-check            # TypeScript validation
npm run lint                  # ESLint
```

**Python (Backend):**

All tools configured in `backend/pyproject.toml`:

- **Black**: Code formatting (line-length: 100, target: py313)
  ```bash
  cd backend
  black .                     # Format all Python files
  black --check .             # Check without modifying
  ```

- **Ruff**: Fast linting (replaces flake8, isort, pyupgrade)
  ```bash
  cd backend
  ruff check .                # Lint all files
  ruff check --fix .          # Auto-fix issues
  ```

- **MyPy**: Type checking (gradual typing enabled)
  ```bash
  cd backend
  mypy .                      # Type check all files
  ```

**Tool Configuration Highlights:**
- Black: 100 char line length, Python 3.13 target
- Ruff: E, W, F, I, N, UP, B, C4, SIM rules enabled
- MyPy: Strict mode disabled (gradual enablement), warn_return_any enabled
- Pytest: Coverage reporting enabled, HTML reports generated

### Pre-commit Quality Checks

Before committing code, run:

```bash
# Backend (from project root)
cd backend && black . && ruff check --fix . && mypy . && cd .. && pytest

# Frontend
cd frontend && npm run lint && npm run type-check && npm test

# Quick check (all)
cd backend && black . && ruff check . && cd ..
cd frontend && npm run lint && npm test
```

**CI/CD Integration**: All quality checks should pass before merging PRs.

## Key CLI Commands (Future)

```bash
# Desktop app
sentinel                        # Launch GUI

# CLI mode (advanced)
sentinel run path/to/test.yaml  # Run test from YAML
sentinel compare run1 run2      # Compare runs
sentinel export --suite suite1  # Export suite to YAML
sentinel import suite.yaml      # Import YAML suite
```

## Important Notes for Development

### Visual-First Development Workflow

1. **Start with visual components**: Build UI first, then wire to backend
2. **Design system first**: Use spec-03.md for all styling decisions
3. **Round-trip early**: Implement Visual ↔ DSL conversion from Feature 1
4. **Test visually**: Most testing should be done through the GUI
5. **DSL as byproduct**: YAML should be auto-generated from visual canvas

### Code Organization Principles

- **Frontend components**: Small, focused, reusable React components
- **Backend providers**: Pluggable, consistent interface
- **Type safety**: TypeScript (frontend) + Pydantic (backend)
- **State management**: Zustand for global state, React hooks for local state
- **API design**: RESTful, clear contracts between frontend/backend
- **File organization**: Components by feature, not by type

### Testing Strategy

**Current Status** (v0.14.5):
- **Frontend**: 24 test files, 389 passing tests (Vitest + React Testing Library)
  - Component tests for all node types (10 files)
  - UI component tests (19 components)
  - Hook tests (6 custom hooks)
  - Service tests (API, storage, templates)
  - Store tests (Zustand state management)
- **Backend**: 7 test files, 90%+ coverage (pytest + pytest-cov)
  - Unit tests for providers, validators, storage
  - Integration tests (mocked model providers)
  - API endpoint tests
- **Visual testing**: Screenshot comparisons for UI consistency (future)
- **Round-trip testing**: Verify Visual → YAML → Visual produces identical results

**Key Testing Principles**:
- All new features require tests
- Frontend: Component-level testing with React Testing Library
- Backend: Unit + integration tests with mocked external APIs
- 100% test pass rate enforced
- Tests run in CI/CD before merge

### Performance Targets

- **Canvas**: Smooth at 100+ nodes
- **Execution**: Real-time updates with minimal lag
- **Desktop app**: <2s startup time
- **Import/export**: <500ms for typical test specs

## Contributing Guidelines

When implementing features:

1. **Read the specs**: Review spec-03.md and spec-04.md before coding
2. **Visual first**: Build UI components before backend logic
3. **Round-trip early**: Ensure Visual ↔ DSL works from the start
4. **Follow design system**: Use Tailwind theme, Sentinel colors
5. **Write tests**: All features require tests
6. **Document**: User-facing documentation for each feature
7. **Incremental delivery**: Features should be completable independently

## Resources

- **Design System**: `backlog/03-spec-design-system.md`
- **Visual Components**: `backlog/02-spec-visual-first.md`
- **Feature Backlog**: `backlog/active.md`
- **Framework Decision**: `backlog/06-spec-framework.md`
- **React Flow Docs**: https://reactflow.dev/
- **React Docs**: https://react.dev/
- **Vite Docs**: https://vitejs.dev/
- **Tauri Docs**: https://tauri.app/
- **Zustand Docs**: https://zustand-demo.pmnd.rs/
- **shadcn/ui**: https://ui.shadcn.com/

---

**When implementing visual features**: Always reference `backlog/02-spec-visual-first.md` for detailed component designs, user journeys, and UX patterns.

**When styling**: Always use the Sentinel design system from `backlog/03-spec-design-system.md` (colors, typography, spacing, motion).

**When in doubt**: Build visual first, generate DSL second. The GUI is the primary interface.

**React best practices**: Use functional components, hooks, and TypeScript. Prefer Zustand for global state and React hooks for local state.
