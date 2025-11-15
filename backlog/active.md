# Active Backlog - Navam Sentinel V1

This file contains the active feature backlog for Sentinel V1. Features are listed in priority order and will be implemented incrementally by the `/develop` command.

## Project Context

**Navam Sentinel** is a unified agent regression and evaluation platform combining:
- Deterministic agent testing
- Model/version comparison
- Safety and capability evaluations
- Regression detection
- CI/CD integration for AI agents

**Visual-First Pivot**: Sentinel is evolving from a text-based DSL tool to a **visual-first, drag-and-drop testing platform** (see `backlog/spec-04.md`). The features below (v0.1.0 - v1.0) establish the foundation, with visual UI components coming in 2025+.

**Tech Stack**:
- Frontend: Tauri + SvelteKit + shadcn/ui + TailwindCSS
- Backend: Python FastAPI + Postgres + Redis
- Optional: Temporal.io for workflows
- Model Integration: Pluggable architecture supporting Anthropic, OpenAI, Amazon Bedrock, HuggingFace, Ollama
- Agentic Frameworks: Pluggable support for LangGraph, Claude Agent SDK, OpenAI Agents SDK, Strands Agents
- Design System: See `backlog/spec-03.md` for complete design specifications
- Visual UI: See `backlog/spec-04.md` for visual-first pivot specifications

## Feature Slices (Priority Order)

---

### Feature 2: Model Provider Architecture ✓ NEXT
**Status**: Not Started
**Priority**: P0 - Foundation
**Semver Impact**: minor (0.2.0)

**Description**:
Create a pluggable model provider architecture with a standardized interface for integrating different LLM APIs. Start with Anthropic and OpenAI as the initial providers.

**Requirements**:
- Define abstract `ModelProvider` interface/base class with methods:
  - `generate(prompt, config)`: Generate completion
  - `stream(prompt, config)`: Stream completion
  - `count_tokens(text)`: Token counting
  - `get_model_info()`: Model metadata
- Implement provider for **Anthropic API** (Messages API)
  - Support for Claude models (Sonnet, Opus, Haiku)
  - Tool calling support
  - Structured output support
- Implement provider for **OpenAI API** (Chat Completions API)
  - Support for GPT models
  - Tool calling support
  - Structured output support
- Provider discovery/registry system
- Configuration schema for provider credentials and settings
- Unified error handling across providers
- Retry logic and rate limiting
- Token usage tracking

**Deliverables**:
- `src/providers/base.py`: Abstract ModelProvider base class
- `src/providers/anthropic.py`: Anthropic provider implementation
- `src/providers/openai.py`: OpenAI provider implementation
- `src/providers/registry.py`: Provider registry and discovery
- `src/providers/config.py`: Provider configuration models
- `tests/test_providers.py`: Provider tests (with mocked API calls)
- `examples/provider_configs/`: Example configuration files
- Documentation: Provider integration guide

**Success Criteria**:
- Both Anthropic and OpenAI providers work end-to-end
- Providers are easily swappable via configuration
- Consistent behavior across providers
- All tests pass
- Clear documentation for adding new providers

---

### Feature 3: Run Executor (Local)
**Status**: Not Started
**Priority**: P0 - Foundation
**Semver Impact**: minor (0.3.0)

**Description**:
Implement a local execution engine that runs test specs against LLM/agent implementations and collects telemetry. Uses the pluggable model provider architecture.

**Requirements**:
- Execute test specs locally
- Use model provider architecture from Feature 2
- Capture execution metrics:
  - Token usage (input/output)
  - Latency (total, per-step)
  - Tool calls made
  - Success/failure status
  - Complete logs
  - Output content
- Apply seed for deterministic execution
- Store run results in structured format (JSON)
- Basic error handling and timeout support

**Deliverables**:
- `src/executor/local.py`: Local executor implementation
- `src/executor/telemetry.py`: Metrics collection
- `src/executor/storage.py`: Run result storage
- `tests/test_executor.py`: Executor tests (with mocked providers)
- CLI command: `sentinel run <test-spec-path>`

**Success Criteria**:
- Can execute test specs using any registered model provider
- Collects all required telemetry
- Stores results in queryable format
- CLI command works end-to-end
- All tests pass

---

### Feature 4: Assertion Validation Engine
**Status**: Not Started
**Priority**: P0 - Foundation
**Semver Impact**: minor (0.4.0)

**Description**:
Implement validation logic to check run outputs against test spec assertions.

**Requirements**:
- Validate `must_contain` assertions (substring matching)
- Validate `must_call_tool` assertions (tool invocation tracking)
- Validate `max_latency_ms` assertions (performance thresholds)
- Validate `output_type` assertions (format validation)
- Generate pass/fail report with detailed failure reasons
- Support extensible assertion types

**Deliverables**:
- `src/validators/assertions.py`: Assertion validation logic
- `src/validators/report.py`: Validation report generation
- `tests/test_validators.py`: Validator tests
- Enhanced CLI output showing assertion results

**Success Criteria**:
- All assertion types validate correctly
- Clear failure messages for debugging
- Reports show which assertions passed/failed
- All tests pass

---

### Feature 5: Agentic Framework Support (LangGraph)
**Status**: Not Started
**Priority**: P1 - Core Value
**Semver Impact**: minor (0.5.0)

**Description**:
Add support for running test specs against agentic frameworks, starting with LangGraph. This enables testing of multi-step agent workflows with tool calls, memory, and state management.

**Requirements**:
- Define abstract `AgenticFramework` interface/base class with methods:
  - `execute(graph_config, inputs)`: Execute agent workflow
  - `get_execution_trace()`: Get step-by-step execution trace
  - `get_tool_calls()`: Extract tool invocations
  - `get_state_history()`: Get state transitions
- Implement **LangGraph** framework adapter:
  - Support for compiled graphs
  - Tool calling integration
  - State persistence tracking
  - Execution tracing
- Extend test spec schema to support:
  - `framework`: Framework identifier (e.g., "langgraph")
  - `graph_config`: Framework-specific configuration
  - `agent_tools`: Tool definitions for the agent
- Integration with model providers (agents use underlying LLMs)
- Framework discovery/registry system similar to model providers

**Deliverables**:
- `src/frameworks/base.py`: Abstract AgenticFramework base class
- `src/frameworks/langgraph.py`: LangGraph adapter implementation
- `src/frameworks/registry.py`: Framework registry
- `src/core/schema.py`: Update test spec schema for frameworks
- `tests/test_frameworks.py`: Framework adapter tests
- `examples/test_specs/agent_specs/`: Example agent test specs
- Documentation: Framework integration guide

**Success Criteria**:
- Can execute LangGraph-based agents from test specs
- Captures agent execution traces and tool calls
- Integrates cleanly with model provider architecture
- Framework is swappable via configuration
- All tests pass
- At least 2 example agent test specs

---

### Feature 6: Regression Engine
**Status**: Not Started
**Priority**: P1 - Core Value
**Semver Impact**: minor (0.6.0)

**Description**:
Compare two test runs and detect regressions across multiple dimensions.

**Requirements**:
- Compare metrics between run A and run B:
  - Accuracy (assertion pass rate)
  - Tool-call success rate
  - Output content deltas (semantic diff)
  - Latency changes
  - Cost changes (token usage)
- Generate regression report with:
  - Regression indicators (emoji + percentage change)
  - Side-by-side comparison
  - Threshold-based alerting
- Support configurable regression thresholds

**Example Output**:
```
🔥 Regression detected in tool-call reliability (-12%)
⚡ Speed improved (+8%)
💰 Cost increased (+5%)
✅ Accuracy maintained (0%)
```

**Deliverables**:
- `src/regression/comparator.py`: Run comparison logic
- `src/regression/diff.py`: Output diffing utilities
- `src/regression/report.py`: Regression report generation
- `tests/test_regression.py`: Regression engine tests
- CLI command: `sentinel compare <run-id-1> <run-id-2>`

**Success Criteria**:
- Accurately detects improvements and regressions
- Clear, actionable reports
- Configurable thresholds
- All tests pass

---

### Feature 7: Basic CLI + Project Initialization
**Status**: Not Started
**Priority**: P1 - Core Value
**Semver Impact**: minor (0.7.0)

**Description**:
Create comprehensive CLI with project initialization and management commands.

**Requirements**:
- Commands:
  - `sentinel init`: Initialize new project
  - `sentinel run <spec>`: Run test spec
  - `sentinel compare <run1> <run2>`: Compare runs
  - `sentinel list`: List all runs
  - `sentinel show <run-id>`: Show run details
- Project structure creation (config, test specs, results directories)
- Configuration file support (`sentinel.yaml`)
- Pretty terminal output with rich/click

**Deliverables**:
- `src/cli/main.py`: CLI entry point
- `src/cli/commands/`: Individual command implementations
- `src/cli/config.py`: Configuration management
- `tests/test_cli.py`: CLI integration tests
- Documentation: CLI usage guide

**Success Criteria**:
- All CLI commands work end-to-end
- Good UX with helpful error messages
- Project initialization creates proper structure
- All tests pass

---

### Feature 8: Postgres Storage Backend
**Status**: Not Started
**Priority**: P1 - Core Value
**Semver Impact**: minor (0.8.0)

**Description**:
Replace JSON file storage with Postgres database for scalability and querying.

**Requirements**:
- Database schema for:
  - Test specs
  - Runs (executions)
  - Results (outputs, metrics)
  - Comparisons (regression analyses)
- SQLAlchemy ORM models
- Migration support (Alembic)
- Connection pooling
- Query APIs for run history, filtering, aggregation

**Deliverables**:
- `src/db/models.py`: SQLAlchemy models
- `src/db/migrations/`: Alembic migrations
- `src/db/repositories.py`: Data access layer
- `tests/test_db.py`: Database tests (with test fixtures)
- Docker Compose for local Postgres
- Database setup documentation

**Success Criteria**:
- All run data persists to Postgres
- Queries are efficient (proper indexes)
- Migrations run cleanly
- All tests pass

---

### Feature 9: Design System & UI Foundation
**Status**: Not Started
**Priority**: P2 - Extended Value
**Semver Impact**: minor (0.9.0)

**Description**:
Implement the complete Navam Sentinel design system including Tailwind theme, core UI components, iconography, and layout foundations. This provides the visual and interaction foundation for the web dashboard and desktop app.

**Requirements**:
- Implement Tailwind theme configuration with Sentinel brand colors:
  - Primary palette (Sentinel Signal: #6EE3F6)
  - Secondary palette (AI Reliability: #9B8CFF)
  - Neutral palette (dark theme backgrounds and surfaces)
  - Semantic palette (success, danger, warning, info for test results)
- Configure typography system (Inter font stack, size scale)
- Create icon system (30+ SVG icons as Svelte components):
  - Logo variants (sentinel-shield-signal)
  - Semantic icons (model-cube, graph-nodes, test-flask, compare-split, etc.)
  - Line-based, 2px stroke, minimal geometric style
- Implement core layout components:
  - `Sidebar` (280px default, 80px collapsed)
  - `Topbar`
  - `DashboardLayout`
  - `SplitViewLayout`
- Implement base navigation components:
  - `SidebarItem`
  - `CommandPalette` (Raycast-like)
  - `ModelSelector`
  - `FrameworkSelector`
- Set up shadcn/ui component library integration
- Configure motion/interaction guidelines (120-160ms transitions, ease-out curves)
- Follow UX principles from design system:
  - Determinism visible (always show seed, model ID, timestamp)
  - Minimal cognitive load
  - Research-grade clarity

**Design Reference**: See `backlog/spec-03.md` for complete design system specifications

**Deliverables**:
- `frontend/tailwind.config.js`: Complete Tailwind theme with Sentinel tokens
- `frontend/src/lib/icons/`: SVG icon components (30+ icons)
- `frontend/src/lib/components/ui/`: shadcn/ui base components
- `frontend/src/lib/components/sentinel/`: Sentinel-specific components
  - Layout components (Sidebar, Topbar, etc.)
  - Navigation components (ModelSelector, FrameworkSelector, etc.)
- `frontend/src/lib/layouts/`: Page layout templates
- `frontend/src/app.css`: Global styles and CSS custom properties
- Documentation: Design system usage guide
- Storybook or component preview page (optional but recommended)

**Success Criteria**:
- Tailwind theme correctly applies Sentinel brand colors
- All 30+ icons render correctly as Svelte components
- Core layouts (Sidebar, Topbar, Dashboard) are functional and responsive
- Components follow design system specifications (colors, typography, spacing)
- Motion/interactions match guidelines (hover glows, transitions)
- Visual consistency across all components
- Components are reusable and well-documented

---

### Feature 10: Additional Model Providers (Bedrock, HuggingFace, Ollama)
**Status**: Not Started
**Priority**: P2 - Extended Value
**Semver Impact**: minor (0.10.0)

**Description**:
Expand model provider support to include Amazon Bedrock, HuggingFace, and Ollama APIs, enabling local and cloud model execution.

**Requirements**:
- Implement **Amazon Bedrock** provider:
  - Support for Claude models via Bedrock
  - Support for other Bedrock models (Titan, Llama, etc.)
  - IAM authentication
  - Region configuration
- Implement **HuggingFace** provider:
  - Inference API support
  - Inference Endpoints support
  - Model hub integration
  - Token authentication
- Implement **Ollama** provider:
  - Local model execution
  - Model management integration
  - Streaming support
  - Custom model support
- Extend provider registry to support new providers
- Configuration examples for each provider
- Provider-specific error handling

**Deliverables**:
- `src/providers/bedrock.py`: Amazon Bedrock provider
- `src/providers/huggingface.py`: HuggingFace provider
- `src/providers/ollama.py`: Ollama provider
- `tests/test_additional_providers.py`: Tests for new providers
- `examples/provider_configs/`: Updated config examples
- Documentation: Setup guide for each provider

**Success Criteria**:
- All three providers work end-to-end
- Bedrock supports multiple model families
- HuggingFace supports both hosted and endpoint models
- Ollama supports local model execution
- All tests pass
- Clear setup documentation

---

### Feature 11: Additional Agentic Frameworks (Claude SDK, OpenAI SDK, Strands)
**Status**: Not Started
**Priority**: P2 - Extended Value
**Semver Impact**: minor (0.11.0)

**Description**:
Add support for additional agentic frameworks: Claude Agent SDK, OpenAI Agents SDK, and Strands Agents.

**Requirements**:
- Implement **Claude Agent SDK** adapter:
  - Agent execution integration
  - Tool calling support
  - State management
  - Execution tracing
- Implement **OpenAI Agents SDK** adapter:
  - Agent execution integration
  - Assistant API integration
  - Thread management
  - Tool support
- Implement **Strands Agents** adapter:
  - Framework integration
  - Agent workflow support
  - Tool calling
  - State tracking
- Update framework registry
- Cross-framework consistency
- Framework-specific test specs

**Deliverables**:
- `src/frameworks/claude_sdk.py`: Claude Agent SDK adapter
- `src/frameworks/openai_sdk.py`: OpenAI Agents SDK adapter
- `src/frameworks/strands.py`: Strands Agents adapter
- `tests/test_additional_frameworks.py`: Tests for new frameworks
- `examples/test_specs/agent_specs/`: Framework-specific examples
- Documentation: Framework comparison and setup guides

**Success Criteria**:
- All three framework adapters work correctly
- Consistent interface across all frameworks
- Clear execution tracing for all frameworks
- All tests pass
- Example specs for each framework

---

### Feature 12: Eval Set Builder (Synthetic Generation)
**Status**: Not Started
**Priority**: P2 - Extended Value
**Semver Impact**: minor (0.12.0)

**Description**:
Generate larger evaluation sets from seed examples using LLM-based expansion.

**Requirements**:
- Take 1-5 seed test specs
- Generate N variations using LLM:
  - Parameter fuzzing
  - Scenario variations
  - Edge case generation
  - Balanced sampling
- Maintain determinism (seeded generation)
- Support filtering/curation of generated tests

**Deliverables**:
- `src/evalset/generator.py`: Synthetic test generation
- `src/evalset/strategies.py`: Generation strategies
- `tests/test_evalset.py`: Generator tests
- CLI command: `sentinel evalset generate <seed-spec> --count N`
- Example generation templates

**Success Criteria**:
- Generates diverse, valid test specs
- Seeded generation is reproducible
- Generated tests are semantically meaningful
- All tests pass

---

### Feature 13: Safety Scenarios (Basic)
**Status**: Not Started
**Priority**: P2 - Extended Value
**Semver Impact**: minor (0.13.0)

**Description**:
Implement basic safety violation detection for agent outputs.

**Requirements**:
- Detection for:
  - Insecure tool calls (e.g., executing arbitrary code)
  - PII extraction (basic pattern matching)
  - Jailbreak attempts (prompt injection detection)
  - Goal misalignment indicators
- Configurable safety rules
- Safety violation reporting in run results

**Deliverables**:
- `src/safety/detectors.py`: Safety violation detectors
- `src/safety/rules.py`: Safety rule definitions
- `tests/test_safety.py`: Safety detector tests
- Integration with run executor
- Documentation: Safety scenarios guide

**Success Criteria**:
- Detects common safety violations
- Low false positive rate
- Clear violation descriptions
- All tests pass

---

### Feature 14: Dashboard (Web UI with Design System)
**Status**: Not Started
**Priority**: P2 - Extended Value
**Semver Impact**: minor (0.14.0)
**Dependencies**: Feature 9 (Design System & UI Foundation)

**Description**:
Create comprehensive web dashboard for viewing run history, test results, and comparisons using the Sentinel design system components. Implements the user journeys and page templates defined in spec-03.md.

**Requirements**:
- FastAPI backend endpoints:
  - List runs with filtering and pagination
  - Get run details with execution traces
  - Compare runs with regression detection
  - Get dashboard metrics and trends
- SvelteKit frontend pages using design system components:
  - **Run History Page**: `<RunFilters />`, `<RunTable />`, `<Pagination />`
  - **Run Detail Page**: `<RunCard />`, `<ExecutionTraceTree />`, `<ToolCallList />`, `<OutputViewer />`, `<AssertionResults />`
  - **Comparison Page**: `<RunComparisonHeader />`, `<MetricDeltaGrid />`, `<SideBySideDiff />`, `<LatencyChart />`, `<TokenUsageComparison />`
  - **Dashboard Page**: `<TrendChart />`, `<RegressionSummaryCard />`, `<ModelLeaderboard />`, `<Sparkline />`
- Implement domain-specific components from design system:
  - Run execution components: `RunCard`, `RunStatusPill`, `TokenUsageBar`, `LatencyHeatmap`, `ToolCallList`, `ExecutionTraceTree`, `FailureExplainerPanel`
  - Comparison components: `RunComparisonHeader`, `SideBySideDiff`, `MetricDeltaCard`, `SemanticDiffViewer`, `CostComparisonChart`
  - Dashboard components: `TrendChart`, `PieDonut`, `Sparkline`, `RegressionSummaryCard`, `SafetyViolationList`, `ModelLeaderboard`
- Charts and visualizations using design system colors and styles:
  - Latency trends over time
  - Cost/token usage trends
  - Success rate and regression detection
  - Tool call success rates
- Follow UX principles from spec-03.md:
  - Determinism visible (show seed, model ID, provider, timestamp)
  - Comparison-first design (1-click access to comparisons)
  - Research-grade clarity (simple charts, minimal clutter)
- Implement user journeys from spec-03.md:
  - Journey 3: Viewing a Run
  - Journey 4: Regression Comparison

**Design Reference**: Components and layouts defined in `backlog/spec-03.md` sections 6, 9, and 10

**Deliverables**:
- `src/api/`: FastAPI application with endpoints
- `frontend/src/routes/`: SvelteKit page routes
  - `/runs`: Run history
  - `/runs/[id]`: Run detail
  - `/compare`: Comparison view
  - `/dashboard`: Dashboard overview
- `frontend/src/lib/components/sentinel/`: Dashboard-specific components
  - Run components (RunCard, RunTable, ExecutionTraceTree, etc.)
  - Comparison components (SideBySideDiff, MetricDeltaCard, etc.)
  - Dashboard components (TrendChart, RegressionSummaryCard, etc.)
- `tests/test_api.py`: API endpoint tests
- `frontend/src/lib/components/sentinel/*.test.ts`: Component tests
- Docker Compose configuration with backend + frontend + Postgres
- Dashboard usage documentation

**Success Criteria**:
- All page layouts match design system specifications
- Components use Sentinel design tokens (colors, typography, spacing)
- Can view all runs in browser with filtering and pagination
- Run detail page shows complete execution traces and metrics
- Charts display correctly using design system color palette
- Comparison view clearly highlights regressions using semantic colors
- Motion/interactions follow design guidelines (glows, transitions)
- Responsive design works on desktop and tablet
- All tests pass
- Visual consistency with design system

---

### Feature 15: CI/CD Integration (GitHub Actions)
**Status**: Not Started
**Priority**: P2 - Extended Value
**Semver Impact**: minor (0.15.0)

**Description**:
Enable Sentinel to run in CI/CD pipelines with GitHub Actions integration.

**Requirements**:
- GitHub Action for running Sentinel tests
- PR comment integration (post regression reports)
- Exit codes for CI failures
- Artifact upload (run results)
- Example workflows for common scenarios

**Deliverables**:
- `.github/actions/sentinel/`: Custom GitHub Action
- Example workflow files
- `src/ci/github.py`: GitHub integration utilities
- Documentation: CI/CD integration guide

**Success Criteria**:
- Can run Sentinel in GitHub Actions
- Regression reports appear as PR comments
- CI fails on regressions (configurable)
- Clear documentation for setup

---

## Completed Features

### ✅ Feature 1: Test Case Spec DSL (v0.1.0)
**Completed**: November 15, 2025
**Release Notes**: [backlog/release-0.1.0.md](backlog/release-0.1.0.md)

Complete YAML/JSON schema and parser for defining deterministic, reproducible test cases for agents and LLMs.

**Delivered**:
- Pydantic-based schema with comprehensive validation
- YAML/JSON parser with clear error messages
- 6 example test specifications
- 81 tests with 98% coverage
- Complete README documentation

**Key Components**:
- `src/sentinel/core/schema.py`: TestSpec, TestSuite, assertion models
- `src/sentinel/core/parser.py`: TestSpecParser with serialization
- `examples/test_specs/`: Example specifications
- Comprehensive test suite

---

## Notes

- Each feature should be completable in a single development session
- Tests are mandatory for each feature
- Features are ordered to build incrementally (foundation → core value → extended value)
- **Design system** is defined in `backlog/spec-03.md` and implemented in Feature 9 before dashboard work
- **Model providers** are implemented in priority order: Anthropic (0.2.0) → OpenAI (0.2.0) → Bedrock/HuggingFace/Ollama (0.10.0)
- **Agentic frameworks** are implemented in priority order: LangGraph (0.5.0) → Claude SDK/OpenAI SDK/Strands (0.11.0)
- **UI/Frontend features** depend on Feature 9 (Design System) and use components from spec-03.md
- Semver increments are suggestions; develop command will determine final version based on changes
- Current version: 0.1.0
- Total features: 15 (4 P0 foundation, 4 P1 core value, 7 P2 extended value)
- Completed features: 1
