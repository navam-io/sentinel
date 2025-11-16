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

**Framework Decision** (November 16, 2025):
- **Migrating from Svelte to React** for production-ready canvas library
- See `backlog/06-spec-framework.md` for comprehensive analysis
- See `backlog/05-spec-flow.md` for React Flow implementation guide

**Frontend (Visual UI)**
- Tauri 2.0 (Rust core + TypeScript UI)
- **React 19 + TypeScript + Vite** (replacing SvelteKit 2.0)
- **React Flow** (@xyflow/react) - production-ready node-based canvas (400k+ weekly downloads)
- **shadcn/ui** (original React version with v0 AI support)
- **Zustand** for state management
- **TailwindCSS 4.0** for styling (Sentinel design system)
- **Monaco Editor** (code editing when needed)
- **Recharts** (data visualization)

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

## Completed Features

---

### ✅ Release 0.4.0: DSL Parser & Visual Importer
**Status**: Completed ✅
**Released**: November 16, 2025
**Semver**: 0.3.1 → 0.4.0 (minor)

**Description**:
Complete bidirectional Visual ↔ DSL conversion with file import/export functionality. Users can now import YAML/JSON test specifications, edit them inline, and export with full schema support.

**What Was Delivered**:
- **File Import**: Upload YAML/JSON files with "📥 Import" button ✅
- **Enhanced DSL Generator**: Full TestSpec schema support (15+ fields) ✅
- **Enhanced YAML→Canvas Importer**: Creates all 5 node types with smart layout ✅
- **Bidirectional Sync**: Real-time Visual ↔ DSL conversion with zero data loss ✅
- **Inline YAML Editing**: Enhanced to support full schema ✅
- **Comprehensive Tests**: 15 new tests (27 total, 100% passing) ✅
- **TypeScript Interface**: Complete TestSpec types matching backend schema ✅

**Key Features**:
1. Import YAML/JSON files directly to canvas
2. Export YAML with all schema fields (provider, seed, model_config, tools, etc.)
3. Round-trip conversion preserves all data
4. Smart auto-layout for imported nodes
5. Proper type conversion (string/number/array)
6. Clear error messages for invalid files

**Files**:
- `frontend/src/lib/dsl/generator.ts` - Enhanced generator and importer (340+ LOC)
- `frontend/src/lib/dsl/generator.test.ts` - 15 comprehensive tests
- `frontend/src/components/yaml/YamlPreview.tsx` - Import UI with file upload

**Success Criteria Met**:
- ✅ Can import YAML/JSON files to canvas
- ✅ Imported tests render correctly with smart layout
- ✅ Editing YAML updates canvas in real-time
- ✅ Editing canvas updates YAML in real-time
- ✅ No data loss in round-trip conversion
- ✅ All TestSpec fields supported
- ✅ 27 tests passing (100% pass rate)
- ✅ 0 TypeScript errors
- ✅ Production build successful

**Documentation**: See `backlog/release-0.4.0.md` for complete release notes.

---

### ✅ Release 0.3.1: Simplified Click-to-Add Interface
**Status**: Completed ✅
**Released**: November 16, 2025
**Semver**: 0.3.0 → 0.3.1 (patch)

**Description**: Removed drag-and-drop in favor of simpler click-to-add interaction. Added comprehensive test infrastructure.

**Documentation**: See `backlog/release-0.3.1.md` for complete release notes.

---

### ✅ Release 0.2.0: Visual Canvas Foundation (Svelte) - DEPRECATED
**Status**: Completed but **Migrating to React**
**Released**: November 15, 2025
**Migration Decision**: November 16, 2025
**Semver**: 0.1.0 → 0.2.0 (minor)

**Migration Notice**:
This release used **SvelteFlow (alpha)** which has known drag-and-drop issues (#4980, #4418). Based on comprehensive research (see `06-spec-framework.md`), we are migrating to **React + React Flow** for production-ready stability. The Svelte implementation (~1,215 LOC) will be replaced with React in 3-5 days.

**What Was Delivered** (Svelte version - being replaced):
- **Tauri 2.0 Desktop App**: Native app infrastructure with Rust backend ✅ (keeping)
- **SvelteKit 2.0 Frontend**: Modern reactive UI with TypeScript ❌ (migrating to React 19)
- **Node-Based Canvas**: @xyflow/svelte integration ❌ (migrating to React Flow)
- **3 Node Types**: Input, Model, and Assertion nodes ✅ (migrating to React components)
- **Component Palette**: Drag-and-drop sidebar with organized node categories
- **YAML Preview Panel**: Real-time YAML generation with copy/download
- **DSL Generator**: Visual → YAML conversion with full schema support
- **Sentinel Design System**: TailwindCSS 4.0 with custom theme tokens
- **Zero TypeScript Errors**: Full type safety across all components

**Key Files**:
- `frontend/src/routes/+page.svelte` - Main canvas page
- `frontend/src/lib/components/palette/ComponentPalette.svelte` - Node palette
- `frontend/src/lib/components/yaml/YamlPreview.svelte` - YAML preview
- `frontend/src/lib/components/nodes/` - Node type components
- `frontend/src/lib/dsl/generator.ts` - YAML generator
- `frontend/src/lib/stores/canvas.ts` - State management
- `src-tauri/` - Tauri Rust backend

**Success Criteria Met**:
- ✅ Desktop app infrastructure set up (Tauri 2.0)
- ✅ Can drag nodes onto canvas or click to add
- ✅ Can connect nodes with visual edges
- ✅ Canvas generates valid YAML test spec
- ✅ YAML updates in real-time as canvas changes
- ✅ Can export/download YAML files
- ✅ Follows Sentinel design system completely
- ✅ 0 TypeScript errors, 70 backend tests passing (98% coverage)

**Documentation**: See `backlog/release-0.2.0.md` for complete release notes.

---

### ✅ Release 0.1.0: DSL Schema & Parser Foundation
**Status**: Completed
**Released**: November 15, 2025
**Semver**: 0.0.0 → 0.1.0 (minor)

**Description**:
Complete DSL schema and parser implementation as the backend foundation for visual-first development. This provides the infrastructure that the visual UI will use to generate and import YAML test specifications.

**What Was Delivered**:
- **Pydantic-based DSL Schema**: Complete schema for TestSpec, TestSuite, InputSpec, ModelConfig, ToolSpec, Message models
- **YAML/JSON Parser**: Full-featured parser with validation, serialization, file I/O, and round-trip conversion
- **8 Assertion Types**: must_contain, must_not_contain, regex_match, must_call_tool, output_type, max_latency_ms, min_tokens, max_tokens
- **6 Example Templates**: Simple Q&A, code generation, browser agent, multi-turn, LangGraph agent, test suite
- **70 Tests**: Comprehensive test coverage (98%) including schema, parser, and integration tests
- **Release Notes**: Complete documentation in `backlog/release-0.1.0.md`

**Key Files**:
- `backend/core/schema.py` - Pydantic models (67 statements, 99% coverage)
- `backend/core/parser.py` - YAML/JSON parser (92 statements, 98% coverage)
- `tests/core/test_schema.py` - 31 schema tests
- `tests/core/test_parser.py` - 30 parser tests
- `tests/integration/test_templates.py` - 9 template tests
- `templates/*.yaml` - 6 example templates

**Success Criteria Met**:
- ✅ All 70 tests pass (100% pass rate)
- ✅ 98% code coverage achieved
- ✅ Round-trip conversion works (parse → serialize → parse)
- ✅ All templates validate successfully
- ✅ Zero data loss in Visual ↔ DSL conversion
- ✅ Clear error messages for validation failures

**Documentation**: See `backlog/release-0.1.0.md` for complete release notes.

---

## Feature Slices (Priority Order)

---

### Feature 1: Visual Canvas Foundation 🔄 IN PROGRESS (React Migration)
**Status**: Migrating from Svelte to React
**Priority**: P0 - Foundation
**Semver Impact**: minor (0.3.0 - React version)
**Migration Timeline**: 3-5 days (November 16-20, 2025)

**Migration Rationale**:
- **SvelteFlow is alpha** (v0.1.28) with known drag-and-drop bugs (#4980, #4418)
- **React Flow is production-ready** (v11, 400k+ weekly downloads, used by Langflow/OneSignal)
- **Visual canvas is our CORE feature** - cannot compromise on stability
- **Perfect timing** - only ~1,215 LOC, minimal migration cost
- **Ecosystem advantage** - 122:1 job ratio, 100+ UI libraries, v0 AI support

**See**: `backlog/06-spec-framework.md` for comprehensive analysis and migration plan

**Description**:
Build the core visual canvas infrastructure with node-based test building using **React + React Flow**. This is the foundation for all visual features.

**Requirements**:
- **Tauri Desktop App Setup**: ✅ COMPLETE (keeping Tauri 2.0)
  - Initialize Tauri 2.0 project with React frontend
  - Configure app window, menus, and system tray
  - Set up IPC communication between Rust and frontend
  - Configure auto-updates and packaging

- **React Frontend Setup**: 🔄 IN PROGRESS
  - Initialize React 19 + TypeScript + Vite
  - Configure TailwindCSS 4.0 with Sentinel design tokens (spec-03.md)
  - Integrate shadcn/ui component library (original React version)
  - Set up Zustand for state management
  - Set up routing with React Router

- **Node-Based Canvas (React Flow)**: 🔄 IN PROGRESS
  - Integrate **React Flow** (@xyflow/react) for node-based workflow
  - Implement infinite canvas with zoom/pan
  - Create basic node types (input, model, assertion, tool, system)
  - Enable drag-and-drop from component palette (RELIABLE)
  - Implement node connections (edges)
  - Auto-layout algorithm for new nodes
  - Minimap for navigation

- **Component Palette**: 🔄 IN PROGRESS
  - Left sidebar with draggable node types
  - Categories: Inputs, Models, Tools, Assertions, Outputs
  - Click to add OR drag-and-drop to canvas

- **DSL Generator (Visual → YAML)**: 🔄 IN PROGRESS
  - Convert canvas nodes to YAML test spec
  - Real-time YAML preview panel
  - Validation and error highlighting
  - Export to .yaml file

**Deliverables**:
- `src-tauri/`: Rust backend with Tauri configuration ✅ (keeping)
- `src/`: React application (replacing `frontend/`)
  - `components/canvas/`: Canvas components
  - `components/palette/`: Component palette
  - `components/nodes/`: Node type components (React + TypeScript)
  - `components/yaml/`: YAML preview
  - `components/ui/`: shadcn/ui components
  - `stores/canvas.ts`: Zustand state management
  - `App.tsx`: Main application component
- Desktop app builds (macOS, Windows, Linux)
- Documentation: Visual canvas usage guide + migration notes

**Success Criteria**:
- ✅ Desktop app launches and runs smoothly (Tauri working)
- ✅ Can drag nodes onto canvas **100% reliably** (React Flow)
- ✅ Can connect nodes with edges
- ✅ Canvas generates valid YAML test spec
- ✅ YAML updates in real-time as canvas changes
- ✅ Can export YAML to file
- ✅ App follows Sentinel design system (colors, typography, spacing)
- ✅ **No TypeScript errors**
- ✅ **Drag-and-drop works every time** (critical improvement over SvelteFlow)

---

### Feature 2: DSL Parser & Visual Importer ✅ COMPLETE
**Status**: Completed (v0.4.0)
**Priority**: P0 - Foundation
**Semver Impact**: minor (0.4.0)
**Released**: November 16, 2025

**Description**:
Complete the round-trip by implementing DSL → Visual conversion. Parse YAML test specs and render them on the visual canvas.

**Completion Summary**:
All requirements delivered successfully. See `backlog/release-0.4.0.md` for full details.

<details>
<summary><b>View Original Requirements (Completed)</b></summary>

**Requirements**:
- ✅ **YAML/JSON Parser** - Using backend parser.py (from v0.1.0)
- ✅ **Visual Importer (DSL → Canvas)** - Full implementation with all node types
- ✅ **Bidirectional Sync** - Real-time Visual ↔ YAML conversion
- ✅ **File Import** - Upload YAML/JSON files via "Import" button
- ✅ **Inline Editing** - Enhanced textarea with validation
- ✅ **Tests** - 15 comprehensive tests (100% passing)

**Deliverables** (Completed):
- ✅ `frontend/src/lib/dsl/generator.ts` - Enhanced generator and importer
- ✅ `frontend/src/lib/dsl/generator.test.ts` - 15 comprehensive tests
- ✅ `frontend/src/components/yaml/YamlPreview.tsx` - Import UI

**Success Criteria** (All Met):
- ✅ Can import YAML files to canvas
- ✅ Imported tests render correctly with smart layout
- ✅ Editing YAML updates canvas in real-time
- ✅ Editing canvas updates YAML in real-time
- ✅ No data loss in round-trip conversion
- ✅ All TestSpec fields supported

</details>

---

### ✅ Release 0.5.0: Monaco YAML Editor Integration
**Status**: Completed ✅
**Released**: November 16, 2025
**Semver**: 0.4.4 → 0.5.0 (minor)

**Description**:
Professional code editing experience with Monaco Editor replacing the basic textarea. Features include YAML syntax highlighting, line numbers, code folding, and improved editing capabilities.

**What Was Delivered**:
- **Monaco Editor Integration**: Professional code editor with YAML support ✅
- **Enhanced Editing Experience**: Syntax highlighting, line numbers, code folding ✅
- **Read-Only and Edit Modes**: Seamless switching between preview and edit ✅
- **Dark Theme**: Styled to match Sentinel design system ✅
- **Comprehensive Tests**: 10 new tests (44 total, 100% passing) ✅
- **Zero TypeScript Errors**: Full type safety maintained ✅

**Key Features**:
1. Monaco Editor (same as VS Code)
2. YAML syntax highlighting in both preview and edit modes
3. Line numbers and code folding
4. Auto-indentation (2 spaces for YAML)
5. Find/replace functionality (Cmd+F)
6. Multi-cursor editing
7. Professional UX matching industry standards

**Files**:
- `frontend/src/components/yaml/MonacoYamlEditor.tsx` - Monaco wrapper (110 LOC)
- `frontend/src/components/yaml/MonacoYamlEditor.test.tsx` - 10 tests
- `frontend/src/components/yaml/YamlPreview.tsx` - Updated integration

**Success Criteria Met**:
- ✅ Monaco Editor renders correctly in YAML preview panel
- ✅ Syntax highlighting works for YAML
- ✅ Edit mode allows smooth editing experience
- ✅ Read-only preview mode works correctly
- ✅ Apply/Cancel buttons work correctly
- ✅ Theme matches Sentinel design system
- ✅ All 44 tests passing (100% pass rate)
- ✅ 0 TypeScript errors
- ✅ Production build successful

**Documentation**: See `backlog/release-0.5.0.md` for complete release notes.

---

### Feature 2.5 (Original Requirements - Completed Above)

**Original Description**:
Replace the basic textarea YAML editor with Monaco Editor for professional code editing experience with syntax highlighting, autocomplete, and real-time validation.

**Requirements**:
- **Monaco Editor Integration**:
  - Install and configure `@monaco-editor/react` package
  - Replace textarea with Monaco Editor component
  - YAML language support and syntax highlighting
  - Dark theme matching Sentinel design system
  - Proper TypeScript types

- **Enhanced Editing Experience**:
  - Syntax highlighting for YAML
  - Line numbers and code folding
  - Auto-indentation (2 spaces for YAML)
  - Find/replace functionality
  - Keyboard shortcuts (Cmd+S to apply, Cmd+K to cancel)
  - Multi-cursor editing

- **Real-time Validation**:
  - Inline error markers (red squiggly lines)
  - Error messages on hover
  - Validation as you type (debounced)
  - YAML schema validation
  - Clear error indicators in editor gutter

- **Auto-completion**:
  - TestSpec field suggestions
  - Assertion type suggestions
  - Model provider suggestions
  - Tool name suggestions
  - Context-aware completions

- **Editor Configuration**:
  - Read-only mode for preview
  - Editable mode for editing
  - Minimap (optional, can be toggled)
  - Word wrap enabled by default
  - Font: Monaco/Consolas/monospace (0.65rem)

**Deliverables**:
- `src/components/yaml/MonacoYamlEditor.tsx` - Monaco Editor wrapper component
- `src/lib/monaco/yamlSchema.ts` - YAML schema for validation and autocomplete
- `src/lib/monaco/yamlCompletions.ts` - Custom completion provider
- Updated `YamlPreview.tsx` - Use Monaco instead of textarea
- Tests for Monaco integration
- Documentation: Editor usage guide

**Success Criteria**:
- Monaco Editor renders correctly in YAML preview panel
- Syntax highlighting works for YAML
- Real-time validation shows errors inline
- Auto-completion suggests valid fields
- Edit mode allows smooth editing experience
- Apply/Cancel buttons work correctly
- Performance is good (no lag when typing)
- Theme matches Sentinel design system
- All existing tests still pass

---

### Feature 3: Model Provider Architecture & Execution
**Status**: Not Started
**Priority**: P0 - Foundation
**Semver Impact**: minor (0.5.0)

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
- `src/components/providers/`: Provider marketplace UI (React)
- `src/components/execution/`: Live execution dashboard (React)
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
**Semver Impact**: minor (0.6.0)

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
- `src/components/assertions/`: Assertion builder UI (React)
- `backend/validators/`: Assertion validation engine
- `src/components/nodes/AssertionNode.tsx`: Assertion node component (React + TypeScript)
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
**Semver Impact**: minor (0.7.0)

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
- `tailwind.config.js`: Tailwind theme configuration
- `src/components/icons/`: SVG icon components (React)
- `src/components/ui/`: shadcn/ui base components (React)
- `src/components/sentinel/`: Sentinel-specific components (React)
- `src/index.css`: Global styles
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
**Semver Impact**: minor (0.8.0)

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
- `src/components/recorder/`: Recording UI (React)
- `backend/recorder/`: Recording analysis and test generation
- `src/pages/playground/`: Agent playground for recording (React)
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
**Semver Impact**: minor (0.9.0)

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
- `src/components/templates/`: Template gallery UI (React)
- `src/components/suites/`: Test suite organizer (React)
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
**Semver Impact**: minor (0.10.0)

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
- `src/components/comparison/`: Comparison view UI (React)
- `src/pages/compare/`: Comparison page (React)
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
**Semver Impact**: minor (0.11.0)

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
- `src/components/frameworks/`: Framework UI (React)
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
**Semver Impact**: minor (0.12.0)

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
- `src/components/ai/`: AI generator UI (React)
- Documentation: AI-assisted testing guide

**Success Criteria**:
- Generates reasonable tests from descriptions
- Suggestions are helpful and relevant

---

### Feature 11: Collaborative Workspaces
**Status**: Not Started
**Priority**: P2 - Extended Value
**Semver Impact**: minor (0.13.0)

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
- `src/components/workspace/`: Workspace UI (React)
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
**Semver Impact**: minor (0.14.0)

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
**Semver Impact**: minor (0.15.0)

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
**Semver Impact**: minor (0.16.0)

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
- `src/pages/dashboard/`: Dashboard page (React)
- `src/components/charts/`: Chart components (React + Recharts)
- Documentation: Dashboard guide

**Success Criteria**:
- Dashboard provides clear insights
- Charts are interactive and helpful
- Performance is good with large datasets

---

### Feature 15: CI/CD Integration & Export
**Status**: Not Started
**Priority**: P2 - Extended Value
**Semver Impact**: minor (0.17.0)

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

- **Version**: 0.5.0 (Monaco YAML Editor Integration)
- **Latest Release**: Release 0.5.0 - Monaco YAML Editor Integration (November 16, 2025)
- **Completed Features**: Feature 1 (Visual Canvas) + Feature 2 (DSL Parser & Visual Importer) + Feature 2.5 (Monaco YAML Editor)
- **Next Feature**: Feature 3 - Model Provider Architecture & Execution (v0.6.0) ← NEXT
- **Architecture**: Visual-first desktop app (Tauri + React 19 + React Flow) with Python backend
- **Test Status**: 44/44 tests passing (100%)

## Migration Decision (November 16, 2025)

After comprehensive research and analysis, we are **migrating from Svelte to React**:

**Why Migrate**:
- **SvelteFlow is alpha** (v0.1.28) with known drag-and-drop bugs
- **React Flow is production-ready** (v11, 400k+ weekly downloads)
- **Visual canvas is our CORE feature** - cannot compromise on stability
- **Langflow uses React Flow** (closest comparable app)
- **Perfect timing** - only ~1,215 LOC, 3-5 day migration cost

**See Documentation**:
- `backlog/06-spec-framework.md` - Comprehensive framework analysis (50 pages)
- `backlog/05-spec-flow.md` - React Flow implementation guide with code examples

**Migration Plan**:
1. Create React + Vite + Tauri project (Day 1)
2. Migrate components from Svelte to React (Days 2-4)
3. Test and verify drag-and-drop works 100% (Day 5)
4. Archive Svelte code, ship React version as 0.3.0
