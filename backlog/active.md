# Active Backlog - Navam Sentinel (Visual-First)

This file contains the active feature backlog for Sentinel. Features are listed in priority order and will be implemented incrementally.

## Project Context

**Navam Sentinel** is a **visual-first agent testing and evaluation platform** for frontier AI labs, neo-labs, and AI research organizations.

**Core Philosophy**: "Point, Click, Test" - Make AI agent testing as intuitive as Postman made API testing, as visual as Langflow made LLM workflows, and as powerful as LangSmith made observability.

**Target Positioning**: "Postman for AI Agents" with research-grade rigor

### Key Capabilities
- Visual drag-and-drop test creation
- Round-trip Visual ↔ DSL synchronization
- Deterministic, repeatable agent testing
- Cross-model/version/tool output comparison
- Automated capability and safety evaluations
- Regression detection (reasoning, tool calls, speed, cost)
- Collaborative workspaces and team testing

### Target Users

**Primary (Visual-First Era)**:
- **Product Managers**: Validate agent behavior without writing code
- **QA Engineers**: Visual test creation and debugging
- **Research Scientists**: Build evaluation suites with AI assistance
- **Safety Teams**: Test safety scenarios collaboratively
- **Researchers**: Model evaluation and safety research
- **Frontier Model Labs**: Testing model releases and capabilities
- **Neo-labs**: Agent-focused research organizations
- **Agent Product Labs**: Building production agent applications

**Secondary (Advanced Users)**:
- **Model Engineers**: Direct DSL editing and programmatic testing
- **DevOps Engineers**: CI/CD integration and automation
- **Enterprise AI Teams**: Internal AI infrastructure testing

## Architecture

### Deployment Models
1. **Primary**: Desktop app (Tauri) for individual users and small teams
2. **Secondary**: Self-hosted web app for enterprise teams
3. **Future**: Cloud SaaS for easy onboarding

### Tech Stack

**Frontend (Visual UI)**
- Tauri (Rust core + TypeScript UI)
- SvelteKit 2.0
- React Flow (node-based canvas)
- shadcn/ui + TailwindCSS
- Monaco Editor (code editing when needed)
- Recharts (data visualization)

**Backend (API & Execution)**
- Python FastAPI for execution engine and API
- PostgreSQL for test storage and run history
- Redis for real-time updates and queues
- Temporal.io (optional) for deterministic workflows
- OpenTelemetry for tracing (model → agent → tools)

**Model Integration (Pluggable Architecture)**
Priority order:
1. Anthropic API (Claude models)
2. OpenAI API (GPT models)
3. Amazon Bedrock API (multi-model support)
4. HuggingFace API (hosted and endpoints)
5. Ollama API (local models)

**Agentic Framework Support (Pluggable Architecture)**
Priority order:
1. LangGraph
2. Claude Agent SDK
3. OpenAI Agents SDK
4. Strands Agents

## Design References

- **Visual UI Design**: See `backlog/spec-04.md` for complete visual component specifications
- **Design System**: See `backlog/spec-03.md` for Tailwind theme, colors, typography, and component styles
- **Research Inspiration**: Langflow, n8n, Postman, Playwright Codegen, LangSmith

## Feature Slices (Priority Order)

---

### Feature 1: Visual Canvas Foundation ✓ NEXT
**Status**: Not Started
**Priority**: P0 - Foundation
**Semver Impact**: minor (0.1.0)

**Description**:
Build the core visual canvas infrastructure with node-based test building. This is the foundation for all visual features.

**Requirements**:
- **Tauri Desktop App Setup**:
  - Initialize Tauri 2.0 project with SvelteKit frontend
  - Configure app window, menus, and system tray
  - Set up IPC communication between Rust and frontend
  - Configure auto-updates and packaging

- **SvelteKit Frontend Setup**:
  - Initialize SvelteKit 2.0 with TypeScript
  - Configure TailwindCSS with Sentinel design tokens (spec-03.md)
  - Integrate shadcn/ui component library
  - Set up routing and layout structure

- **Node-Based Canvas (React Flow)**:
  - Integrate React Flow for node-based workflow
  - Implement infinite canvas with zoom/pan
  - Create basic node types (input, model, assertion, output)
  - Enable drag-and-drop from component palette
  - Implement node connections (edges)
  - Auto-layout algorithm for new nodes
  - Minimap for navigation

- **Component Palette**:
  - Left sidebar with draggable node types
  - Categories: Inputs, Models, Tools, Assertions, Outputs
  - Search/filter functionality

- **DSL Generator (Visual → YAML)**:
  - Convert canvas nodes to YAML test spec
  - Real-time YAML preview panel
  - Validation and error highlighting
  - Export to .yaml file

**Deliverables**:
- `src-tauri/`: Rust backend with Tauri configuration
- `frontend/`: SvelteKit application
  - `src/lib/components/canvas/`: Canvas components
  - `src/lib/components/palette/`: Component palette
  - `src/lib/components/nodes/`: Node type components
  - `src/routes/`: Page routes
- `frontend/src/lib/dsl/`: DSL generator utilities
- Desktop app builds (macOS, Windows, Linux)
- Documentation: Visual canvas usage guide

**Success Criteria**:
- Desktop app launches and runs smoothly
- Can drag nodes onto canvas
- Can connect nodes with edges
- Canvas generates valid YAML test spec
- YAML updates in real-time as canvas changes
- Can export YAML to file
- App follows Sentinel design system (colors, typography, spacing)

---

### Feature 2: DSL Parser & Visual Importer
**Status**: Not Started
**Priority**: P0 - Foundation
**Semver Impact**: minor (0.2.0)

**Description**:
Complete the round-trip by implementing DSL → Visual conversion. Parse YAML test specs and render them on the visual canvas.

**Requirements**:
- **YAML/JSON Parser**:
  - Pydantic-based schema validation (Python backend)
  - Support for TestSpec and TestSuite models
  - Comprehensive validation with clear error messages
  - API endpoint for parsing and validation

- **Visual Importer (DSL → Canvas)**:
  - Parse YAML and convert to canvas nodes/edges
  - Position nodes using auto-layout
  - Preserve relationships and configurations
  - Handle import errors gracefully

- **Bidirectional Sync**:
  - Changes in YAML editor update canvas
  - Changes in canvas update YAML
  - Conflict resolution strategy
  - Undo/redo support

- **YAML Editor Integration**:
  - Monaco Editor for direct YAML editing
  - Syntax highlighting and validation
  - Split view: Canvas | YAML
  - Toggle between visual and code modes

**Deliverables**:
- `backend/api/`: FastAPI application with parsing endpoints
- `backend/core/schema.py`: Pydantic models for test specs
- `backend/core/parser.py`: YAML/JSON parser
- `frontend/src/lib/dsl/importer.ts`: DSL → Canvas converter
- `frontend/src/lib/components/editor/`: Monaco editor component
- Tests for parser and importer
- Documentation: DSL specification and round-trip guide

**Success Criteria**:
- Can import YAML files to canvas
- Imported tests render correctly with proper node layout
- Editing YAML updates canvas in real-time
- Editing canvas updates YAML in real-time
- No data loss in round-trip conversion
- All Pydantic validation rules work correctly

---

### Feature 3: Model Provider Architecture & Execution
**Status**: Not Started
**Priority**: P0 - Foundation
**Semver Impact**: minor (0.3.0)

**Description**:
Implement pluggable model provider architecture and local execution engine. Users can run tests from the visual canvas.

**Requirements**:
- **Model Provider Architecture**:
  - Abstract `ModelProvider` base class (Python)
  - Anthropic provider (Messages API, Claude models)
  - OpenAI provider (Chat Completions API, GPT models)
  - Provider registry and discovery
  - Configuration schema for API keys and settings

- **Visual Provider Marketplace**:
  - UI for browsing available providers
  - One-click installation/configuration
  - API key management (secure storage in Tauri)
  - Provider status indicators

- **Run Executor**:
  - Execute tests locally from canvas
  - Real-time execution trace display
  - Capture telemetry (tokens, latency, tool calls, outputs)
  - Store run results in SQLite (local) or Postgres (server)

- **Live Execution Dashboard**:
  - Visual progress indicator on canvas
  - Step-by-step trace tree
  - Live metrics (tokens, latency, cost)
  - Streaming output display

**Deliverables**:
- `backend/providers/`: Model provider implementations
- `backend/executor/`: Execution engine
- `backend/storage/`: SQLite/Postgres storage layer
- `frontend/src/lib/components/providers/`: Provider marketplace UI
- `frontend/src/lib/components/execution/`: Live execution dashboard
- Tests for providers and executor
- Documentation: Provider integration guide

**Success Criteria**:
- Both Anthropic and OpenAI providers work end-to-end
- Can run tests from visual canvas
- Real-time execution progress visible
- All metrics captured correctly
- Results stored in database
- Provider marketplace is intuitive

---

### Feature 4: Assertion Builder & Validation
**Status**: Not Started
**Priority**: P0 - Foundation
**Semver Impact**: minor (0.4.0)

**Description**:
Visual assertion builder and validation engine. Users create assertions through forms instead of YAML.

**Requirements**:
- **Visual Assertion Builder**:
  - Form-based assertion creation
  - Support all assertion types:
    - `must_contain`, `must_not_contain` (text matching)
    - `regex_match` (pattern matching)
    - `must_call_tool` (tool invocation)
    - `output_type` (format validation)
    - `max_latency_ms` (performance)
    - `min_tokens`, `max_tokens` (length)
  - Template-based creation (select type → fill form)
  - Live YAML preview
  - Drag to reorder assertions

- **Assertion Validation Engine**:
  - Execute assertions against run outputs
  - Generate pass/fail results with details
  - Failure reason explanations
  - Assertion coverage metrics

- **Assertion Node UI**:
  - Assertion nodes on canvas
  - Visual pass/fail indicators (green/red badges)
  - Click to expand assertion details
  - Inline editing of assertion parameters

**Deliverables**:
- `frontend/src/lib/components/assertions/`: Assertion builder UI
- `backend/validators/`: Assertion validation engine
- `frontend/src/lib/components/nodes/AssertionNode.svelte`: Assertion node component
- Tests for assertion builder and validator
- Documentation: Assertions guide

**Success Criteria**:
- All assertion types can be created visually
- Assertion builder is intuitive and easy to use
- All assertions validate correctly
- Clear pass/fail indicators on canvas and in results
- Assertion validation provides helpful error messages

---

### Feature 5: Design System Implementation
**Status**: Not Started
**Priority**: P1 - Core Value
**Semver Impact**: minor (0.5.0)

**Description**:
Implement the complete Sentinel design system including Tailwind theme, icons, and core UI components (spec-03.md).

**Requirements**:
- **Tailwind Theme**:
  - Sentinel brand colors (Signal Blue #6EE3F6, AI Purple #9B8CFF)
  - Semantic colors for test results
  - Typography system (Inter font)
  - Spacing and sizing scales

- **Icon System**:
  - 30+ SVG icons as Svelte components
  - Logo variants (sentinel-shield-signal)
  - Semantic icons (model-cube, graph-nodes, test-flask, etc.)
  - Line-based, 2px stroke, minimal geometric style

- **Core Components**:
  - Layout: `Sidebar`, `Topbar`, `DashboardLayout`
  - Navigation: `SidebarItem`, `CommandPalette`
  - Selectors: `ModelSelector`, `FrameworkSelector`
  - Cards: `RunCard`, `AssertionCard`
  - Charts: `TrendChart`, `Sparkline`

- **Motion & Interactions**:
  - Hover glows and transitions
  - 120-160ms easing curves
  - Focus states and accessibility

**Deliverables**:
- `frontend/tailwind.config.js`: Tailwind theme configuration
- `frontend/src/lib/icons/`: SVG icon components
- `frontend/src/lib/components/ui/`: shadcn/ui base components
- `frontend/src/lib/components/sentinel/`: Sentinel-specific components
- `frontend/src/app.css`: Global styles
- Storybook or component preview page
- Documentation: Design system guide

**Success Criteria**:
- All components follow design system specifications
- Brand colors applied consistently
- Icons render correctly
- Motion/interactions feel smooth and polished
- Visual consistency across the app

---

### Feature 6: Record & Replay Test Generation
**Status**: Not Started
**Priority**: P1 - Core Value
**Semver Impact**: minor (0.6.0)

**Description**:
Auto-generate tests by recording agent interactions (inspired by Playwright Codegen).

**Requirements**:
- **Recording Mode**:
  - Start/stop recording button
  - Watch agent interactions in playground
  - Capture: prompts, tool calls, outputs, timing
  - Real-time interaction preview

- **Smart Detection**:
  - Detect tool calls → generate `must_call_tool` assertions
  - Detect JSON responses → add `output_type: json`
  - Detect patterns → suggest parameterization
  - Detect errors → create negative test cases

- **Test Generation**:
  - Auto-generate canvas nodes from recording
  - Suggested assertions based on behavior
  - Review and edit UI before saving
  - Save to canvas or export to suite

**Deliverables**:
- `frontend/src/lib/components/recorder/`: Recording UI
- `backend/recorder/`: Recording analysis and test generation
- `frontend/src/routes/playground/`: Agent playground for recording
- Documentation: Record & replay guide

**Success Criteria**:
- Can record agent interactions
- Generates reasonable assertions automatically
- Generated tests are valid and runnable
- UI is intuitive for non-technical users

---

### Feature 7: Template Gallery & Test Suites
**Status**: Not Started
**Priority**: P1 - Core Value
**Semver Impact**: minor (0.7.0)

**Description**:
Pre-built test templates and test suite organization.

**Requirements**:
- **Template Gallery**:
  - Browse pre-built templates
  - Categories: Q&A, Code Gen, Browser Agent, Safety, etc.
  - One-click use (load to canvas)
  - Preview before using
  - Community sharing (future)

- **Test Suite Organizer**:
  - Folder-based test organization
  - Drag-and-drop test management
  - Bulk operations (run all, delete, export)
  - Visual indicators (pass/fail status)
  - Suite-level defaults

- **Built-in Templates**:
  - Simple Q&A
  - Code generation
  - Multi-turn conversation
  - Browser agent (product search)
  - Safety testing (jailbreak, PII)
  - RAG agent

**Deliverables**:
- `frontend/src/lib/components/templates/`: Template gallery UI
- `frontend/src/lib/components/suites/`: Test suite organizer
- `templates/`: Built-in template YAML files
- Documentation: Templates and suites guide

**Success Criteria**:
- At least 6 high-quality templates
- Template gallery is easy to browse
- Suite organization is intuitive
- Can drag-and-drop tests between suites

---

### Feature 8: Regression Engine & Comparison View
**Status**: Not Started
**Priority**: P1 - Core Value
**Semver Impact**: minor (0.8.0)

**Description**:
Compare test runs and detect regressions with visual diff viewer.

**Requirements**:
- **Run Comparison**:
  - Compare two runs side-by-side
  - Metrics delta (latency, tokens, cost)
  - Assertion pass rate changes
  - Tool call success rate
  - Output content diff

- **Visual Comparison View**:
  - Split view layout
  - Metric delta cards with percentage changes
  - Semantic diff viewer (highlight changes)
  - Regression indicators (🔥, ⚡, 💰, ✅)
  - Interactive trace comparison

- **Regression Detection**:
  - Configurable thresholds
  - Automatic regression alerts
  - Regression summary cards
  - Historical trend charts

**Deliverables**:
- `backend/regression/`: Regression detection engine
- `frontend/src/lib/components/comparison/`: Comparison view UI
- `frontend/src/routes/compare/`: Comparison page
- Documentation: Regression detection guide

**Success Criteria**:
- Can compare any two runs
- Visual diff is clear and helpful
- Regression detection is accurate
- Thresholds are configurable

---

### Feature 9: Agentic Framework Support (LangGraph)
**Status**: Not Started
**Priority**: P2 - Extended Value
**Semver Impact**: minor (0.9.0)

**Description**:
Support for testing agentic frameworks, starting with LangGraph.

**Requirements**:
- **Framework Adapter (LangGraph)**:
  - Execute LangGraph agents
  - Capture state transitions
  - Track tool calls and execution flow
  - Integration with model providers

- **Visual Framework Nodes**:
  - LangGraph node type on canvas
  - Configure graph structure visually
  - State visualization
  - Multi-step execution trace

- **Framework Registry**:
  - Plugin architecture for frameworks
  - Framework marketplace UI
  - Configuration wizards

**Deliverables**:
- `backend/frameworks/`: Framework adapters
- `frontend/src/lib/components/frameworks/`: Framework UI
- Tests for LangGraph integration
- Documentation: Framework integration guide

**Success Criteria**:
- Can execute LangGraph agents from canvas
- Captures complete execution trace
- Framework is configurable visually

---

### Feature 10: AI-Assisted Test Generation
**Status**: Not Started
**Priority**: P2 - Extended Value
**Semver Impact**: minor (0.10.0)

**Description**:
Generate tests from natural language descriptions using AI.

**Requirements**:
- **AI Generator**:
  - Natural language input: "Test if agent searches products under budget"
  - LLM-powered test generation
  - Generates canvas nodes and assertions
  - Review and edit before adding to canvas

- **Smart Suggestions**:
  - Context-aware recommendations
  - Missing assertion suggestions
  - Performance optimization tips
  - Best practice hints

**Deliverables**:
- `backend/ai/`: AI generation engine
- `frontend/src/lib/components/ai/`: AI generator UI
- Documentation: AI-assisted testing guide

**Success Criteria**:
- Generates reasonable tests from descriptions
- Suggestions are helpful and relevant

---

### Feature 11: Collaborative Workspaces
**Status**: Not Started
**Priority**: P2 - Extended Value
**Semver Impact**: minor (0.11.0)

**Description**:
Team collaboration features for shared testing.

**Requirements**:
- **Team Workspaces**:
  - Shared test suites
  - Real-time collaboration
  - Activity feeds
  - Member management

- **Comments & Reviews**:
  - Comment on tests and runs
  - Approval workflows
  - Discussion threads

- **Permissions**:
  - Role-based access control
  - Team/organization structure

**Deliverables**:
- `backend/collaboration/`: Collaboration services
- `frontend/src/lib/components/workspace/`: Workspace UI
- WebSocket for real-time updates
- Documentation: Collaboration guide

**Success Criteria**:
- Teams can share and collaborate on tests
- Real-time updates work smoothly
- Permissions system is flexible

---

### Feature 12: Additional Model Providers
**Status**: Not Started
**Priority**: P2 - Extended Value
**Semver Impact**: minor (0.12.0)

**Description**:
Expand model provider support to Bedrock, HuggingFace, Ollama.

**Requirements**:
- Amazon Bedrock provider
- HuggingFace provider (Inference API)
- Ollama provider (local models)
- Provider configuration wizards
- Multi-model support in marketplace

**Deliverables**:
- `backend/providers/bedrock.py`
- `backend/providers/huggingface.py`
- `backend/providers/ollama.py`
- Tests and documentation

**Success Criteria**:
- All providers work end-to-end
- Easy to configure and use

---

### Feature 13: Safety Scenarios & Eval Set Builder
**Status**: Not Started
**Priority**: P2 - Extended Value
**Semver Impact**: minor (0.13.0)

**Description**:
Safety testing and synthetic eval generation.

**Requirements**:
- **Safety Detectors**:
  - Jailbreak attempts
  - PII extraction
  - Insecure tool calls
  - Content filtering

- **Eval Set Builder**:
  - Generate N tests from seed examples
  - LLM-based expansion
  - Balanced sampling
  - Curation UI

**Deliverables**:
- `backend/safety/`: Safety detectors
- `backend/evalset/`: Eval generation engine
- UI for safety and eval features
- Documentation

**Success Criteria**:
- Safety detectors work accurately
- Can generate large eval sets from seeds

---

### Feature 14: Dashboard & Analytics
**Status**: Not Started
**Priority**: P2 - Extended Value
**Semver Impact**: minor (0.14.0)

**Description**:
Overview dashboard with trends and analytics.

**Requirements**:
- **Dashboard Views**:
  - Run history with filtering
  - Success rate trends
  - Latency/cost trends over time
  - Model leaderboard
  - Regression heatmap

- **Charts & Visualizations**:
  - Trend charts (Recharts)
  - Sparklines for quick insights
  - Pie/donut charts for distributions
  - Heatmaps for regression tracking

**Deliverables**:
- `frontend/src/routes/dashboard/`: Dashboard page
- `frontend/src/lib/components/charts/`: Chart components
- Documentation: Dashboard guide

**Success Criteria**:
- Dashboard provides clear insights
- Charts are interactive and helpful
- Performance is good with large datasets

---

### Feature 15: CI/CD Integration & Export
**Status**: Not Started
**Priority**: P2 - Extended Value
**Semver Impact**: minor (0.15.0)

**Description**:
Run Sentinel tests in CI/CD pipelines.

**Requirements**:
- **CLI Tool**:
  - `sentinel run <test.yaml>` command
  - Exit codes for CI failures
  - Artifact upload
  - Report generation (HTML, JSON)

- **GitHub Actions**:
  - Pre-built GitHub Action
  - PR comment integration
  - Example workflows

- **Export Capabilities**:
  - Export tests to YAML
  - Export results to JSON/CSV
  - Generate PDF reports

**Deliverables**:
- CLI tool (Node.js or Python)
- GitHub Action configuration
- Export utilities
- Documentation: CI/CD integration guide

**Success Criteria**:
- Can run tests in CI/CD
- Integration is smooth and well-documented

---

## Notes

- **Visual-first from day 1**: GUI is the primary interface, DSL is the interoperability format
- **Round-trip is critical**: Visual ↔ DSL must be seamless and bidirectional
- **Design system**: Follow spec-03.md for all UI components
- **Visual patterns**: Reference spec-04.md for component designs and user journeys
- **Incremental delivery**: Each feature should be completable and deliverable independently
- **Testing is mandatory**: All features require tests
- **Documentation is required**: Each feature needs user documentation

## Current Status

- **Version**: 0.0.0 (pre-alpha, fresh start)
- **Next Feature**: Feature 1 - Visual Canvas Foundation
- **Architecture**: Visual-first desktop app (Tauri + SvelteKit) with Python backend
