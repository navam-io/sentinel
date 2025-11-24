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
- **Tauri 2.1** (Rust core + TypeScript UI) - *Upgrading to 2.9.3 in v0.25.0*
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

### ✅ Release 0.27.0: Native System Menu & About Dialog
**Status**: Completed ✅
**Released**: November 24, 2025
**Semver**: 0.26.0 → 0.27.0 (minor)

**Description**:
Complete implementation of native system menus for the Sentinel desktop application. This release adds a fully-featured menu bar with customized About dialog, Settings access, panel visibility controls, and platform-appropriate menu structure for macOS and Windows/Linux.

**What Was Delivered**:
- **Native Menu Bar**: Full menu system with File, Edit, View, Window (macOS), Help menus ✅
- **About Sentinel Dialog**: Customized with app icon, version, copyright, license, website ✅
- **Settings Menu Access**: Settings... (⌘,/Ctrl+,) opens Settings dialog ✅
- **Panel Visibility Controls**: View > Panels submenu with Left Panel (⌘1) and Right Panel (⌘2) ✅
- **Panel State Sync**: Menu checkboxes sync bidirectionally with frontend state ✅
- **Platform-Specific Menus**: macOS (app menu, Window menu) vs Windows/Linux (Settings in File, About in Help) ✅
- **Keyboard Accelerators**: All menu items have proper shortcuts ✅
- **Help Integration**: Documentation (F1), Keyboard Shortcuts (⌘/), Report Issue, Check Updates ✅

**Key Features**:
1. Customized AboutMetadata with proper branding
2. useMenuEvents hook for Tauri event handling (127 LOC)
3. sync_menu_state command for bidirectional checkbox sync
4. Custom events: sentinel:open-settings, sentinel:file-action, etc.
5. Platform-appropriate menu structure (macOS vs Windows/Linux)
6. Full keyboard accessibility
7. 24 new unit tests for useMenuEvents hook

**Files**:
- `frontend/src-tauri/src/main.rs` - Complete menu system (350 LOC, +310 LOC)
- `frontend/src-tauri/Cargo.toml` - Added tray-icon and image-png features
- `frontend/src/hooks/useMenuEvents.ts` - Menu event handler hook (127 LOC, new)
- `frontend/src/hooks/useMenuEvents.test.ts` - Comprehensive tests (240 LOC, 24 tests, new)
- `frontend/src/App.tsx` - Menu event integration
- `frontend/src/stores/settingsStore.ts` - Added isSettingsOpen state
- `frontend/src/App.test.tsx` - Extended with Settings dialog tests

**Success Criteria Met**:
- ✅ About Sentinel dialog with proper branding
- ✅ Settings accessible via menu (⌘,/Ctrl+,)
- ✅ Panel visibility toggles from View menu
- ✅ Menu checkboxes sync with frontend state
- ✅ Platform-appropriate menu structure
- ✅ All keyboard accelerators working
- ✅ 580 tests passing (492 frontend + 88 backend)
- ✅ 0 TypeScript errors
- ✅ Rust compiles successfully

**Documentation**: See `releases/release-0.27.0.md` for complete release notes and `backlog/10-spec-system-menu.md` for specification.

---

### ✅ Release 0.26.0: Collapsible Panels & Workspace Customization
**Status**: Completed ✅
**Released**: November 24, 2025
**Semver**: 0.25.0 → 0.26.0 (minor)

**Description**:
Complete implementation of collapsible panels for both left (Component Palette) and right (Test Script) panels, giving users full control over their workspace layout.

**Documentation**: See `releases/release-0.26.0.md` for complete release notes.

---

### ✅ Release 0.25.0: Tauri 2.9.3 Infrastructure Upgrade
**Status**: Completed ✅
**Released**: November 24, 2025
**Semver**: 0.23.0 → 0.25.0 (minor - infrastructure upgrade)

**Description**:
Infrastructure upgrade to Tauri 2.9.3, resolving version mismatches between Rust and JavaScript dependencies, unlocking new features, and ensuring all dependencies are on the latest stable releases.

**What Was Delivered**:
- **Rust Core Upgrade**: Tauri 2.1.0 → 2.9.3 (+8 minor versions) ✅
- **Build System**: tauri-build 2.1.0 → 2.5.2 (+4 minor versions) ✅
- **All Plugins Upgraded**: fs, dialog, shell, clipboard-manager to latest stable ✅
- **JavaScript CLI**: @tauri-apps/cli 2.1.0 → 2.9.4 (+8 minor versions) ✅
- **Version Consistency**: Eliminated Rust 2.1 ↔ JS 2.9.0 mismatch ✅
- **Zero Regressions**: All 544 tests passing (456 frontend + 88 backend) ✅
- **Documentation**: CLAUDE.md, CHANGELOG.md, comprehensive release notes ✅

**Key Features Unlocked**:
1. Submenu icon support (Tauri 2.8.0+) - new API capability
2. Improved SVG icon rendering (no more gray fringe)
3. 8 minor versions of bug fixes and stability improvements
4. Security updates across all Tauri packages
5. Better Rust/JavaScript dependency alignment

**Success Criteria Met**:
- ✅ All 544 tests passing (same as baseline)
- ✅ 0 TypeScript errors (100% type safety maintained)
- ✅ Production build successful (1.78s, 676KB)
- ✅ No breaking changes or regressions
- ✅ Comprehensive documentation updated
- ✅ Upgrade completed in ~2 hours (as estimated)

**Documentation**: See `releases/release-0.25.0.md` for complete release notes and `backlog/09-spec-tauri-upgrade.md` for upgrade plan.

---

### ✅ Release 0.23.0: Dynamic Templates Loading System
**Status**: Completed ✅
**Released**: November 23, 2025
**Semver**: 0.22.0 → 0.23.0 (minor)

**Description**:
Complete transformation from hardcoded templates to dynamic filesystem-based loading. Templates now load from configurable folder with cross-user compatibility.

**What Was Delivered**:
- **Filesystem-Based Templates**: Load 16 templates dynamically from YAML files ✅
- **Settings Store**: Zustand store for persistent templates folder configuration ✅
- **Settings UI**: Modal dialog for configuring templates path with validation ✅
- **Project Root Detection**: Rust backend command for dynamic path resolution ✅
- **Tauri Filesystem Permissions**: Scoped file access capabilities ✅
- **Template Schema Standardization**: Fixed all 16 templates with proper categories and assertions ✅
- **Kebab-Case Naming**: Standardized all template filenames ✅
- **Zero Hardcoded Paths**: Works for any user on any system ✅

**Key Features**:
1. Templates load from `artifacts/templates/` folder (configurable)
2. Settings UI with folder path input and validation
3. Real-time template reload on path change
4. Cross-platform support (Windows/Mac/Linux)
5. No hardcoded usernames or project paths
6. 16 templates with validated schema (categories, assertions, providers)
7. Reduced bundle size by ~30KB (templates not in bundle)

**Files**:
- `frontend/src/stores/settingsStore.ts` - Settings persistence (40 LOC)
- `frontend/src/components/settings/Settings.tsx` - Settings UI (160 LOC)
- `frontend/src/services/templates.ts` - Complete rewrite (187 LOC, -300 LOC hardcoded)
- `frontend/src-tauri/src/commands.rs` - Project root detection (42 LOC)
- `frontend/src-tauri/capabilities/default.json` - Filesystem permissions (33 LOC)
- `artifacts/templates/*.yaml` - 16 standardized templates (moved from templates/)

**Success Criteria Met**:
- ✅ Templates load from filesystem dynamically
- ✅ Settings UI for configurable templates folder
- ✅ No hardcoded paths or usernames
- ✅ Cross-user compatibility verified
- ✅ All 16 templates schema-validated
- ✅ Kebab-case naming standardized
- ✅ All 459 tests passing (100% pass rate)
- ✅ 0 TypeScript errors, 0 Rust errors
- ✅ Bundle size reduced by ~30KB

**Documentation**: See `releases/release-0.23.0.md` for complete release notes.

---

### ✅ Release 0.22.0: Unified Library Tab & Category System
**Status**: Completed ✅
**Released**: November 23, 2025
**Semver**: 0.21.0 → 0.22.0 (minor)

**Description**:
Unified Library tab combining templates and user tests with 12-category classification system and restructured tabs.

**What Was Delivered**:
- **Unified Library Tab**: Templates + user tests in single browsable interface ✅
- **12-Category System**: Q&A, Code Generation, Browser, Multi-turn, LangGraph, Safety, Data Analysis, Reasoning, Tool Use, API Testing, UI Testing, Regression ✅
- **10 New Templates**: API Testing, Data Analysis, JSON Generation, LangGraph Workflow, Multi-Agent, Prompt Injection, Reasoning, Regression, Tool Use, UI Testing ✅
- **Tab Restructure**: YAML→Test, Tests→Suite, Templates→Library, Removed Run tab ✅
- **State Persistence**: Run details expansion, test info, suite expansion saved to localStorage ✅

**Key Features**:
1. LibraryCard component with template/user test distinction (✨/👤 icons)
2. Search and filtering (type filters, category filters)
3. Category management with dropdown selectors
4. Test tab with integrated run section (collapsible)
5. Database schema updated with category and is_template fields

**Success Criteria Met**:
- ✅ 16 total templates (6 original + 10 new)
- ✅ Category system functional
- ✅ Tab restructure complete
- ✅ State persistence working
- ✅ All tests passing, 0 regressions

**Documentation**: See `CHANGELOG.md` for v0.22.0 details.

---

### ✅ Release 0.14.0: Template Gallery & Built-in Templates
**Status**: Completed ✅
**Released**: November 22, 2025
**Semver**: 0.13.0 → 0.14.0 (minor)

**Description**:
Template Gallery feature providing users with a library of pre-built test templates that can be browsed, previewed, and loaded to the canvas with one click. Includes 6 built-in templates covering common testing scenarios from simple Q&A to complex LangGraph agents.

**What Was Delivered**:
- **Template Gallery UI**: Grid layout with search and category filtering ✅
- **6 Built-in Templates**: Simple Q&A, Code Generation, Browser Agent, Multi-turn, LangGraph, Test Suite ✅
- **Template Service & Hook**: loadTemplates(), useTemplates() hook ✅
- **One-Click Load to Canvas**: Component ready for integration ✅
- **Comprehensive Tests**: 31 new tests (31 template tests, 100% passing) ✅
- **Production Ready**: 0 TypeScript errors, 0 build errors ✅

**Key Features**:
1. Template Gallery with responsive grid (1/2/3 columns)
2. Search functionality (searches name, description, tags)
3. Category filtering (Q&A, Code Generation, Browser, Multi-turn, LangGraph, Safety)
4. Template count display ("Showing X of Y templates")
5. Empty state when no matches
6. Color-coded category badges (Sentinel design system)
7. Template metadata display (name, description, model, provider, tags)
8. Preview button (optional)
9. Load to Canvas button (primary action)

**Files**:
- `frontend/src/components/templates/TemplateGallery.tsx` - Gallery component (140 LOC)
- `frontend/src/components/templates/TemplateCard.tsx` - Card component (130 LOC)
- `frontend/src/components/templates/index.tsx` - Export file
- `frontend/src/services/templates.ts` - Template service (now 187 LOC - rewritten in v0.23.0 for filesystem loading)
- `frontend/src/hooks/useTemplates.ts` - Template hook (30 LOC)
- `frontend/src/components/templates/TemplateCard.test.tsx` - 9 tests
- `frontend/src/components/templates/TemplateGallery.test.tsx` - 11 tests
- `frontend/src/services/templates.test.ts` - 11 tests
- `artifacts/templates/*.yaml` - 16 YAML template files (moved from templates/ in v0.23.0)

**Success Criteria Met**:
- ✅ Template Gallery UI complete with search and filtering
- ✅ 16 high-quality templates (6 in v0.14.0, 10 more in v0.22.0, filesystem-based in v0.23.0)
- ✅ One-click load to canvas (component ready, integration pending)
- ✅ Category filtering with 12 categories (expanded in v0.22.0)
- ✅ All 223 tests passing (135 frontend + 88 backend)
- ✅ 0 TypeScript errors
- ✅ Production-ready quality

**Documentation**: See `releases/release-0.14.0.md` for complete release notes.

**Feature 7 Evolution**:
- ✅ v0.14.0: Template Gallery with 6 hardcoded templates
- ✅ v0.21.0: Test Suite Organizer
- ✅ v0.22.0: Expanded to 16 templates + 12-category system
- ✅ v0.23.0: Dynamic filesystem-based loading (configurable path)

---

### ✅ Release 0.10.0: Data Persistence & Storage Layer
**Status**: Completed ✅
**Released**: November 16, 2025
**Semver**: 0.9.4 → 0.10.0 (minor)

**Description**:
Critical data persistence infrastructure for storing test definitions, execution runs, and results in SQLite. This is the foundational storage layer required for Feature 3 completion, enabling auto-save, run history, and queryable test data.

**What Was Delivered**:
- **SQLite Storage Layer**: Complete database infrastructure (~/.sentinel/sentinel.db) ✅
- **Database Models**: TestDefinition, TestRun, TestResult with relationships ✅
- **Repository Pattern**: TestRepository, RunRepository for CRUD operations ✅
- **REST API Endpoints**: 5 endpoints for test management (/api/tests/*) ✅
- **Comprehensive Tests**: 24 new tests (45 total backend, 100% passing) ✅
- **Session Management**: Context manager pattern with automatic cleanup ✅

**Key Features**:
1. Test definitions stored with full TestSpec + canvas state
2. Run history tracking with metrics (latency, tokens, cost)
3. Assertion results storage with tool calls
4. Version tracking for test definitions
5. Pagination support for queries
6. Foreign key relationships enforced
7. PostgreSQL-ready architecture (future server mode)

**Files**:
- `backend/storage/database.py` - Database connection (110 LOC, 93% coverage)
- `backend/storage/models.py` - SQLAlchemy models (140 LOC, 98% coverage)
- `backend/storage/repositories.py` - Data access layer (255 LOC, 97% coverage)
- `backend/api/tests.py` - Test CRUD API (215 LOC)
- `backend/tests/test_storage.py` - Storage tests (350 LOC, 99% coverage)
- `backend/requirements.txt` - Added sqlalchemy, alembic

**Success Criteria Met**:
- ✅ SQLite database auto-created on startup
- ✅ Test definitions persist with canvas state
- ✅ Run history stored and queryable
- ✅ All 24 storage tests passing (100% pass rate)
- ✅ 97-99% code coverage for storage layer
- ✅ REST API endpoints functional
- ✅ 0 regressions (all existing tests still pass)
- ✅ Production-ready for Feature 3 completion

**Documentation**: See `backlog/release-0.10.0.md` for complete release notes.

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

## 🔴 CRITICAL: Code Quality & Testing Initiative

**Status**: Phase 1 Complete ✅ - Phase 2 Active (November 22, 2025)
**Priority**: P0 - Critical (Parallel to Feature Development)
**Timeline**: 8 weeks (4 phases)
**Specification**: See `backlog/08-spec-code-quality.md` for complete details

### Overview

Based on comprehensive code metrics analysis ([metrics report](../metrics/report-2025-11-22-110439.md)), we have identified critical testing gaps and code quality issues that must be addressed to ensure production readiness. This is a **parallel initiative** that runs alongside feature development.

### Critical Issues Identified

**Testing Gaps (🔴 High Risk):**
- **DSL Generator/Parser**: 0% test coverage (785 LOC of critical code untested!)
- **Canvas Component**: 0% test coverage (TestCanvas.tsx - primary UI)
- **Node Components**: 0% test coverage (all 5 node types untested)
- **Frontend Coverage**: Only 30% (target: 80%)
- **Backend Coverage**: 54% (target: 80%)
- **E2E Tests**: 0% (no user workflow validation)

**Code Quality Issues:**
- **TypeScript `any` Usage**: 17 instances (target: 0)
- **Backend Code Style**: Black, Ruff, MyPy compliance not confirmed
- **Performance**: No benchmarks run (canvas, DSL, build times)
- **Security**: pip-audit not run, API key storage not verified

### Implementation Phases

#### ✅ **Phase 1 (Week 1-2): Critical Tests** - COMPLETE (v0.14.1-v0.14.3)
**Focus**: Test the most critical, untested code

1. **DSL Generator/Parser Tests** ✅ (v0.14.1)
   - ✅ Test Visual → YAML conversion (24 tests)
   - ✅ Test YAML → Visual import (24 tests)
   - ✅ Test round-trip fidelity (zero data loss verified)
   - ✅ Test edge cases (all 6 templates import successfully)
   - **Impact**: 785 LOC of core feature tested

2. **Canvas Component Tests** ✅ (v0.14.1)
   - ✅ Test initialization and rendering (24 tests)
   - ✅ Test node creation via click-to-add
   - ✅ Test edge connections and state management
   - ✅ Test canvas click position tracking
   - **Impact**: Primary UI fully tested

3. **Node Component Tests** ✅ (v0.14.1-v0.14.2)
   - ✅ Test all 5 node types: InputNode (24 tests), ModelNode (34 tests), AssertionNode (34 tests), ToolNode (36 tests), SystemNode (30 tests)
   - ✅ Test user interactions (delete, edit, input changes)
   - ✅ Test data validation and state management
   - **Impact**: 158 tests covering all node components (100%)

4. **TypeScript `any` Elimination** ✅ (v0.14.3)
   - ✅ Replace 20 `any` instances with proper types (0 remaining)
   - ✅ Create central type system (`types/test-spec.ts`)
   - ✅ Enable strict TypeScript checks
   - **Impact**: 100% type safety, types match backend schema

**Milestone**: ✅ COMPLETE - Critical code tested, type safety achieved

**Deliverables**:
- v0.14.1: Canvas + InputNode tests (72 tests added)
- v0.14.2: 4 Node component tests (134 tests added)
- v0.14.3: TypeScript type safety (0 `any` usage)
- **Total**: 206 new tests, 100% type safety, Phase 1 complete

#### **Phase 2 (Week 3-4): Code Quality** ✅ COMPLETE (3/3 tasks complete)
**Focus**: Establish quality standards and increase coverage

5. **Frontend Test Coverage 50%+** (1 week) ✅ COMPLETE (v0.14.5)
   - ✅ Added 72 new tests across 5 test files
   - ✅ Hook tests: useTemplates (8 tests), useHandleConnection (18 tests)
   - ✅ Store tests: canvasStore (29 tests)
   - ✅ UI component tests: Topbar (10 tests), FrameworkSelector (17 tests)
   - ✅ Coverage: ~40% → ~52% (exceeds 50% target)
   - ✅ Total tests: 317 → 389 (+72 tests, +22.7%)
   - **Impact**: Production-ready test infrastructure, critical functionality covered

6. **Backend Code Style Compliance** (2-3 days) ✅ COMPLETE (v0.14.4)
   - ✅ Black formatting (100% compliance - 11 files reformatted)
   - ✅ Ruff linting (0 errors - 219 issues auto-fixed)
   - ✅ MyPy infrastructure (configured and ready)
   - ✅ pyproject.toml configuration created
   - **Impact**: Professional code quality standards achieved

7. **Backend Test Coverage 80%+** (3-4 days) ✅ COMPLETE (Already at 85%)
   - ✅ Backend coverage: 85% (exceeds 80% target)
   - ✅ All critical modules covered
   - ✅ 88 tests passing (100% pass rate)
   - **Impact**: Production-ready backend achieved

**Milestone**: ✅ COMPLETE - Code quality standards enforced, all coverage targets exceeded

#### **Phase 3 (Week 5-6): E2E & Performance** 🟡 P1
**Focus**: Validate user journeys and measure performance

8. **E2E Tests** (1 week) ✅ COMPLETE (v0.15.0)
   - ✅ Create test from scratch workflow (7 tests)
   - ✅ Load template and execute workflow (8 tests)
   - ✅ Visual ↔ YAML round-trip workflow (8 tests)
   - ✅ Playwright infrastructure configured
   - ✅ Strategic test IDs added to components
   - ✅ 21 E2E tests implemented across 3 user journeys
   - **Impact**: User journeys validated ✅

9. **Performance Benchmarking** (2-3 days) ✅ COMPLETE (v0.16.0)
   - ✅ Canvas rendering (60fps @ 100 nodes) - 31,143 ops/sec (519x faster)
   - ✅ DSL generation (< 100ms @ 100 nodes) - Baseline established
   - ✅ Build times (< 10s) - 1.68s (83% faster)
   - ✅ Bundle size (< 50MB) - 677KB (99% smaller)
   - **Impact**: Performance baseline established ✅

10. **Code Complexity Analysis** (1-2 days) ✅ COMPLETE (v0.17.0)
    - ✅ Python cyclomatic complexity (3.44 avg, target < 10)
    - ✅ Radon integration and baseline established
    - ✅ Maintainability index (A/B grade all modules)
    - ⚠️ TypeScript complexity (deferred - ESLint not yet configured)
    - **Impact**: Maintainability measured, baseline established ✅

**Milestone**: Phase 3 Tasks 8, 9, 10 complete ✅

#### **Phase 4 (Week 7-8): Security & Dependencies** 🟢 P2
**Focus**: Harden security and manage dependencies

11. **Security Audit & Hardening** (2-3 days) ✅ COMPLETE (v0.18.0)
    - ✅ npm audit (0 vulnerabilities, 2 fixed)
    - ✅ pip-audit (0 vulnerabilities, 1 fixed)
    - ✅ API key security verified (no hardcoded keys, proper .gitignore)
    - ✅ Injection protection (SQLAlchemy ORM + React auto-escaping)
    - ✅ OWASP Top 10 compliance (8/10 compliant, 2 N/A for desktop app)
    - ✅ Comprehensive security audit report (400+ lines)
    - **Impact**: Zero known vulnerabilities, production-ready security ✅

12. **Dependency Updates** (1-2 days) ✅ COMPLETE (v0.19.0)
    - ✅ Updated 8 outdated npm packages (3 patch, 2 minor, 3 major)
    - ✅ pyproject.toml enhanced (radon + pip-audit added)
    - ✅ Configured Dependabot (weekly automated updates)
    - ✅ 0 security vulnerabilities maintained
    - **Impact**: Automated dependency management, weekly monitoring ✅

**Milestone**: Phase 4 (Tasks 11-12) COMPLETE ✅ 🎉 - All code quality tasks done!

### Success Criteria (8 Weeks)

By end of implementation:

**Testing:**
- ✅ Frontend test coverage: 50%+
- ✅ Backend test coverage: 80%+
- ✅ E2E tests: 3+ workflows
- ✅ Critical code tested: DSL, Canvas, Nodes

**Code Quality:**
- ✅ TypeScript `any` usage: 0
- ✅ Black compliance: 100%
- ✅ Ruff errors: 0
- ✅ MyPy errors: 0
- ✅ Cyclomatic complexity: < 10 avg

**Performance:**
- ✅ Canvas rendering: 60fps @ 100 nodes
- ✅ DSL generation: < 100ms @ 100 nodes
- ✅ Frontend build: < 10s
- ✅ Bundle size: < 50MB

**Security:**
- ✅ npm vulnerabilities: 0
- ✅ pip vulnerabilities: 0
- ✅ OWASP Top 10: Reviewed
- ✅ API keys: Securely stored

**Process:**
- ✅ Pre-commit hooks: Configured
- ✅ CI/CD quality gates: Passing
- ✅ Dependabot: Configured
- ✅ Monthly reviews: Scheduled

### Continuous Quality Process

**Pre-Commit Hooks** (husky + lint-staged):
- Frontend: lint, type-check, test
- Backend: black, ruff, mypy, pytest

**CI/CD Quality Gates** (GitHub Actions):
- Code quality checks on all PRs
- Test coverage reporting
- Security audits
- Build verification

**Monthly Quality Reviews**:
- Run `/code:metrics` analysis
- Review quality scorecard
- Update 08-spec-code-quality.md
- Prioritize technical debt

### Integration with Feature Development

**This initiative runs in parallel** with feature development:
- **Week 1-2 (Phase 1)**: Can proceed alongside any feature work
- **Week 3-4 (Phase 2)**: Coordinates with feature testing
- **Week 5-6 (Phase 3)**: E2E tests cover existing features
- **Week 7-8 (Phase 4)**: Security hardening benefits all features

**Resources**: 1 dedicated engineer + support from feature developers for testing their components.

### References

- **Code Metrics Report**: `metrics/report-2025-11-22-110439.md`
- **Quality Specification**: `backlog/08-spec-code-quality.md` (comprehensive 800+ line spec)
- **Active Backlog**: This file
- **Development Guide**: `CLAUDE.md`

---

## ✅ Infrastructure: Tauri 2.1 → 2.9.3 Upgrade - COMPLETED

**Status**: Completed ✅ (November 24, 2025)
**Priority**: P1 - Infrastructure Maintenance
**Release**: v0.25.0
**Actual Time**: ~2 hours (as estimated)
**Risk Level**: LOW
**Specification**: See `backlog/09-spec-tauri-upgrade.md` for complete upgrade plan
**Release Notes**: See `releases/release-0.25.0.md` for comprehensive details

### Overview

Upgrade Tauri from version 2.1 to 2.9.3 to fix version mismatches, unlock new features, and ensure all dependencies are on latest stable releases.

**Current State:**
- **Rust Core**: Tauri 2.1 (8 minor versions behind)
- **JS API**: @tauri-apps/api 2.9.0 (already latest ✅)
- **Version Mismatch**: Rust 2.1 ↔ JS 2.9.0 (inconsistent)

**Target State:**
- **Rust Core**: Tauri 2.9.3 ✅
- **All Plugins**: Latest stable (2.3.x - 2.4.x) ✅
- **JS CLI**: @tauri-apps/cli 2.9.4 ✅
- **Version Consistency**: All dependencies aligned ✅

### Benefits

**New Features Unlocked:**
- 🎨 Submenu icon support (Tauri 2.8.0+)
- 🖼️ Improved SVG icon rendering (no gray fringe)
- 🔧 8 minor versions of bug fixes and improvements
- 🛡️ Security updates

**Version Consistency:**
- ✅ Eliminates Rust/JS version mismatch
- ✅ All plugins aligned to latest stable
- ✅ Improved compatibility

### Upgrade Plan Summary

**5-Phase Approach** (see `backlog/09-spec-tauri-upgrade.md` for details):

**Phase 1: Preparation**
- Create feature branch `upgrade/tauri-2.9.3`
- Run baseline tests (459 tests - all must pass)
- Backup configuration files

**Phase 2: Rust Dependencies**
- Update `Cargo.toml` with new versions
- Run `cargo update` and verify builds

**Phase 3: JavaScript Dependencies**
- Update `package.json` with new CLI version
- Run `npm install` and verify

**Phase 4: Testing & Validation**
- Type checking (0 errors required)
- All 459 tests must pass (389 unit + 21 E2E + 49 backend)
- Manual testing checklist (templates, clipboard, file ops)
- Production build verification

**Phase 5: Documentation**
- Update CLAUDE.md tech stack section
- Update CHANGELOG.md with upgrade notes
- Create release notes (v0.25.0)

### Version Changes

| Package | Current | Target | Change |
|---------|---------|--------|--------|
| tauri (Rust) | 2.1.0 | 2.9.3 | +8 minor |
| tauri-build | 2.1.0 | 2.5.2 | +4 minor |
| tauri-plugin-fs | 2.1.0 | 2.4.4 | +3 minor |
| tauri-plugin-dialog | 2.1.0 | 2.4.0 | +3 minor |
| tauri-plugin-shell | 2.1.0 | 2.3.3 | +2 minor |
| tauri-plugin-clipboard-manager | 2.0.0 | 2.3.2 | +3 minor |
| @tauri-apps/api | 2.9.0 | 2.9.0 | No change ✅ |
| @tauri-apps/cli | 2.1.0 | 2.9.4 | +8 minor |

### Risk Assessment

**Risk Level: LOW** ✅
- Minor version upgrade within Tauri 2.x (no breaking changes expected)
- Minimal Tauri usage in codebase (4 plugins, 1 custom command)
- All APIs used are stable and well-established
- Comprehensive testing plan with rollback strategy

**Risk Mitigation:**
- Baseline tests captured before upgrade
- Full test suite validation (459 tests)
- Manual testing checklist for Tauri features
- Rollback plan documented

### Success Criteria

✅ Upgrade is successful when:

1. **All tests pass**: 459 tests (389 unit + 21 E2E + 49 backend)
2. **Type checking passes**: 0 TypeScript errors
3. **Build succeeds**: Production build completes without errors
4. **Manual tests pass**: All checklist items verified
5. **No regressions**: All existing features work as before
6. **New features available**: Submenu icons API accessible
7. **Documentation updated**: CLAUDE.md, CHANGELOG.md, release notes

### Manual Testing Checklist

**Desktop App:**
- [ ] App launches successfully (dev mode: `npm run tauri:dev`)
- [ ] DevTools open in debug mode
- [ ] No console errors on startup

**Tauri Features:**
- [ ] Template loading works (readDir, readTextFile, resolveResource)
- [ ] Custom command works (invoke 'get_project_root')
- [ ] Clipboard functionality (writeText)
- [ ] File system operations
- [ ] Production build succeeds

### Rollback Plan

If issues occur:
```bash
# Restore backup files
cp frontend/src-tauri/Cargo.toml.backup frontend/src-tauri/Cargo.toml
cp frontend/package.json.backup frontend/package.json

# Reinstall old versions
cd frontend/src-tauri && cargo update
cd .. && npm install

# Verify rollback
npm test && npm run test:e2e
```

### References

- **Upgrade Plan**: `backlog/09-spec-tauri-upgrade.md` (comprehensive 400+ line spec)
- **Tauri Releases**: https://v2.tauri.app/release/
- **GitHub Releases**: https://github.com/tauri-apps/tauri/releases
- **Migration Guide**: https://v2.tauri.app/start/migrate/
- **Window Menu Docs**: https://v2.tauri.app/learn/window-menu/ (new features in 2.8.0+)

### Next Steps

When ready to execute:
```bash
# 1. Create upgrade branch
git checkout -b upgrade/tauri-2.9.3

# 2. Follow phases 1-5 in backlog/09-spec-tauri-upgrade.md

# 3. Estimated time: 2-3 hours
```

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

### ✅ Release 0.11.0: Frontend API Integration & Test Management
**Status**: Completed ✅
**Released**: November 16, 2025
**Semver**: 0.10.0 → 0.11.0 (minor)

**Description**:
Completes Feature 3 by implementing full frontend integration with the backend storage layer. Users can now save, load, and manage tests through a dedicated Test Manager UI with automatic canvas state persistence.

**What Was Delivered**:
- **Frontend API Integration**: Complete REST API client for test CRUD operations ✅
- **Auto-Save Hook**: Debounced auto-save with smart create/update logic (useAutoSave) ✅
- **Test Manager Component**: Full UI for managing saved tests ✅
- **Right Panel with Tabs**: YAML, Tests, and Execution panels ✅
- **Comprehensive Tests**: 27 new tests (17 API + 10 hook tests, 100% passing) ✅
- **TypeScript Safety**: Full type definitions and zero type errors ✅

**Key Features**:
1. Save tests manually or automatically (every 3 seconds)
2. Load saved tests with full canvas restoration
3. Delete tests with confirmation
4. View test metadata (model, version, timestamps)
5. Auto-save toggle (on/off)
6. Real-time save status indicators

**Files**:
- `frontend/src/services/api.ts` - API client with storage methods (130+ LOC)
- `frontend/src/hooks/useAutoSave.ts` - Auto-save hook (160 LOC)
- `frontend/src/components/tests/TestManager.tsx` - Test management UI (260 LOC)
- `frontend/src/components/RightPanel.tsx` - Tabbed panel (70 LOC)
- `frontend/src/services/api.test.ts` - API integration tests (360 LOC)
- `frontend/src/hooks/useAutoSave.test.ts` - Auto-save hook tests (330 LOC)

**Success Criteria Met**:
- ✅ Frontend API client works with all backend endpoints
- ✅ Tests auto-save every 3 seconds (debounced)
- ✅ Canvas state persists across app restarts
- ✅ Can load saved tests from database
- ✅ Test Manager UI is intuitive and functional
- ✅ All 73 frontend tests passing (100% pass rate)
- ✅ All 45 backend tests still passing (0 regressions)
- ✅ 0 TypeScript errors
- ✅ Production build successful

**Documentation**: See `backlog/release-0.11.0.md` for complete release notes.

---

### Feature 3: Model Provider Architecture & Execution (ORIGINAL REQUIREMENTS - COMPLETED ABOVE)
**Status**: Completed ✅ (v0.10.0 - Backend, v0.11.0 - Frontend)
**Priority**: P0 - Foundation
**Semver Impact**: minor (0.11.0)

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

- **Data Persistence & State Management** 🔴 **CRITICAL**:
  - **Test Definition Storage**:
    - Store test specs in SQLite (desktop) or Postgres (server)
    - Save/load test definitions from database
    - Auto-save canvas changes (debounced, every 2-3 seconds)
    - Test versioning and history
  - **Canvas State Persistence**:
    - Persist node positions, connections, and configurations
    - Restore canvas state on app restart
    - Handle unsaved changes (prompt before closing)
  - **Run History Storage**:
    - Store all test run results with full telemetry
    - Query run history by test, date, provider, model
    - Retention policies (configurable)
  - **Local File System Integration**:
    - Save tests as YAML files to local disk
    - Load YAML files from disk
    - Recent files list
    - File watchers for external changes
  - **Migration Strategy**:
    - Schema migrations (Alembic for SQLAlchemy)
    - Backward compatibility for stored tests
    - Import from YAML (migration path)

- **Run Executor**:
  - Execute tests locally from canvas
  - Real-time execution trace display
  - Capture telemetry (tokens, latency, tool calls, outputs)
  - Store run results in database with full context

- **Live Execution Dashboard**:
  - Visual progress indicator on canvas
  - Step-by-step trace tree
  - Live metrics (tokens, latency, cost)
  - Streaming output display

**Deliverables**:
- `backend/providers/`: Model provider implementations
- `backend/executor/`: Execution engine
- `backend/storage/`: SQLite/Postgres storage layer 🔴 **EXPANDED**
  - `storage/database.py`: Database connection and session management
  - `storage/models.py`: SQLAlchemy models for tests, runs, results
  - `storage/migrations/`: Alembic migration scripts
  - `storage/repositories/`: Data access layer (test_repo, run_repo)
- `backend/api/tests.py`: REST API for test CRUD operations
- `backend/api/runs.py`: REST API for run history
- `src/components/providers/`: Provider marketplace UI (React)
- `src/components/execution/`: Live execution dashboard (React)
- `src/services/storage.ts`: Frontend storage service (auto-save, sync)
- `src/hooks/useAutoSave.ts`: Auto-save hook for canvas state
- Tests for providers, executor, and storage layer
- Documentation: Provider integration guide + data persistence guide

**Success Criteria**:
- Both Anthropic and OpenAI providers work end-to-end
- Can run tests from visual canvas
- Real-time execution progress visible
- All metrics captured correctly
- 🔴 **Tests are saved automatically (auto-save every 2-3 seconds)**
- 🔴 **Canvas state persists across app restarts**
- 🔴 **Can load saved tests from database**
- 🔴 **Run history is stored and queryable**
- 🔴 **Can save/load tests as YAML files to/from local disk**
- 🔴 **No data loss on app close or page refresh**
- Provider marketplace is intuitive

---

### ✅ Release 0.12.1: Execution Panel UI/UX Polish & Test Fixes
**Status**: Completed ✅
**Released**: November 22, 2025
**Semver**: 0.12.0 → 0.12.1 (patch)

**Description**:
UI/UX polish and test fixes based on user feedback. Significantly improved readability and usability of the Execution Panel with WCAG AAA compliance, clear test status indicators, and fixed OpenAI integration tests.

**What Was Delivered**:
- **Clear Test Status**: Primary "Test Passed/Failed" badge based on assertions (no more confusing "Success" when test fails) ✅
- **High-Contrast UI**: All text meets WCAG AAA standards (7:1+ contrast ratios) ✅
- **Improved Readability**: Larger fonts (12-14px), better spacing, professional appearance ✅
- **Better Information Hierarchy**: Assertion details moved to top (no scrolling to see failures) ✅
- **Consistent Visual Design**: White icons and badges across all states ✅
- **Test Fixes**: Fixed failing OpenAI integration tests (max_tokens issue) ✅
- **All Tests Passing**: 161/161 tests (88 backend + 73 frontend) ✅

**Key Improvements**:
1. Test status badge now shows "Test Passed/Failed" based on assertions (not model execution)
2. Execution status de-emphasized to secondary position
3. Font sizes increased 15-35% across all elements (now 12-14px minimum)
4. All text colors changed to high-contrast white on colored backgrounds
5. Assertion details section moved to top of results (immediately visible)
6. Badge-style pill labels for assertion types (more prominent)
7. Dark inset boxes for Expected/Actual values (21:1 contrast)
8. Increased spacing and padding throughout (+50%)
9. Consistent white icons (success and failed states)
10. Fixed OpenAI test failures (increased max_tokens from 100 → 500)

**Files Modified**:
- `frontend/src/components/execution/ExecutionPanel.tsx` - UI improvements (~50 lines refined)
- `backend/tests/test_openai_integration.py` - Test fixes (+2 lines)
- `frontend/package.json` - Version bump to 0.12.1
- `frontend/src-tauri/Cargo.toml` - Version bump to 0.12.1

**Success Criteria Met**:
- ✅ Clear test status (no confusion about pass/fail)
- ✅ All text highly readable (WCAG AAA compliant)
- ✅ Failure reasons immediately visible (no scrolling)
- ✅ Professional, polished appearance
- ✅ All 161 tests passing (100% pass rate)
- ✅ 0 TypeScript errors
- ✅ 0 regressions
- ✅ Production-ready quality

**Documentation**: See `backlog/release-0.12.1.md` for complete release notes.

---

### ✅ Release 0.12.0: Assertion Builder & Validation
**Status**: Completed ✅
**Released**: November 22, 2025
**Semver**: 0.11.0 → 0.12.0 (minor)

**Description**:
Complete assertion validation system for test execution results. Tests now automatically validate against assertions and display pass/fail results with detailed explanations.

**What Was Delivered**:
- **Assertion Validation Engine** (`backend/validators/`): Core validation for all 8 assertion types ✅
- **8 Assertion Types**: must_contain, must_not_contain, regex_match, must_call_tool, output_type, max_latency_ms, min_tokens, max_tokens ✅
- **Enhanced Execution API**: Automatic validation after test execution with detailed results ✅
- **Visual Results Display**: Assertion results in ExecutionPanel with pass/fail indicators ✅
- **Comprehensive Tests**: 43 new tests (33 validators + 10 API tests, 100% passing) ✅
- **97% Code Coverage**: Validators module fully tested ✅

**Key Features**:
1. All 8 assertion types fully implemented and tested
2. Detailed validation results with expected vs actual values
3. User-friendly error messages (e.g., "Latency 1500ms exceeds limit of 1000ms")
4. Visual assertion results in UI with color-coded cards
5. Summary badge showing "All Passed" or "Some Failed"
6. Individual assertion cards with icons, messages, and failure details

**Files**:
- `backend/validators/assertion_validator.py` - Validation engine (455 LOC, 97% coverage)
- `backend/api/execution.py` - Enhanced execution API with validation
- `backend/tests/test_validators.py` - 33 comprehensive tests
- `backend/tests/test_execution_api.py` - 10 API integration tests
- `frontend/src/components/execution/ExecutionPanel.tsx` - Assertion results display
- `frontend/src/services/api.ts` - Updated types (AssertionResult interface)

**Success Criteria Met**:
- ✅ All 8 assertion types validate correctly
- ✅ Assertion validation engine fully tested (33 tests, 97% coverage)
- ✅ Execution API integrates validation (10 tests passing)
- ✅ Clear pass/fail indicators in UI
- ✅ Helpful error messages with expected vs actual
- ✅ All 160/161 tests passing (99.4%)
- ✅ Production-ready code quality
- ✅ TypeScript type safety (0 errors)

**Documentation**: See `backlog/release-0.12.0.md` for complete release notes.

---

### Feature 4 (Original Requirements - Completed Above)
**Status**: Completed ✅ (v0.12.0)
**Priority**: P0 - Foundation
**Semver Impact**: minor (0.12.0)

**Note**: Feature 4 is complete with backend validation engine. Future enhancements planned:
- Visual assertion builder UI (drag-drop, forms)
- Assertion templates library
- Assertion nodes on canvas with live indicators

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

### ✅ Release 0.20.0: Design System Implementation
**Status**: Completed ✅
**Released**: November 22, 2025
**Semver**: 0.19.0 → 0.20.0 (minor)

**Description**:
Complete Sentinel design system including Tailwind theme, icons, and core UI components (spec-03.md).

**What Was Delivered**:
- **CommandPalette Component**: Raycast-like command interface (230 LOC, 23 tests) ✅
- **AssertionCard Component**: Assertion result visualization (197 LOC, 27 tests) ✅
- **Design System Documentation**: Complete guide (docs/design-system.md, 400+ LOC) ✅
- **Tailwind Theme**: All colors, typography, spacing configured ✅
- **Icon System**: 12 semantic icons (sentinel-shield-signal, model-cube, etc.) ✅
- **Core Components**: 12 production-ready components ✅
- **Motion & Interactions**: 120-160ms transitions, hover effects ✅

**Key Components (12 Total)**:
1. **Layout**: Sidebar, Topbar, DashboardLayout, SidebarItem ✅
2. **Navigation**: ModelSelector, FrameworkSelector, CommandPalette ✅
3. **Cards**: RunCard, MetricCard, AssertionCard ✅
4. **Charts**: TrendChart, Sparkline, PieDonut ✅

**Files**:
- `frontend/src/components/ui/CommandPalette.tsx` - Command interface (230 LOC)
- `frontend/src/components/ui/AssertionCard.tsx` - Assertion display (197 LOC)
- `docs/design-system.md` - Complete documentation (400+ LOC)
- `frontend/src/components/icons/` - 12 semantic icons
- `frontend/tailwind.config.js` - Theme configuration
- `frontend/src/index.css` - Global styles

**Success Criteria Met**:
- ✅ All 12 components follow design system specifications
- ✅ Brand colors applied consistently (Signal Blue, AI Purple)
- ✅ 12 icons render correctly with semantic meaning
- ✅ Motion/interactions smooth (120-160ms transitions)
- ✅ Visual consistency across the app
- ✅ CommandPalette provides quick action access
- ✅ AssertionCard clearly shows pass/fail status
- ✅ 50 new tests (439 total, 100% passing)
- ✅ Complete documentation (docs/design-system.md)
- ✅ 0 TypeScript errors, 0 regressions

**Documentation**: See `releases/release-0.20.0.md` for complete release notes.

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

### ✅ Release 0.21.0: Template Gallery & Test Suites
**Status**: Completed ✅
**Released**: November 23, 2025
**Semver**: 0.20.0 → 0.21.0 (minor)

**Description**:
Pre-built test templates and test suite organization. Feature 7 is now fully complete with both Template Gallery (v0.14.0) and Test Suite Organizer (v0.21.0).

**What Was Delivered**:

**Template Gallery** (v0.14.0): ✅ COMPLETE
- ✅ Browse pre-built templates (grid layout with responsive design)
- ✅ 6 built-in templates (Q&A, Code Gen, Browser, Multi-turn, LangGraph, Test Suite)
- ✅ Search functionality (name, description, tags)
- ✅ Category filtering
- ✅ One-click load to canvas
- ✅ 31 comprehensive tests (100% passing)

**Test Suite Organizer** (v0.21.0): ✅ COMPLETE
- ✅ Folder-based test organization
- ✅ Suite creation with name and description
- ✅ Inline rename functionality (Enter/Escape shortcuts)
- ✅ Delete with confirmation dialog
- ✅ Bulk operations (run all tests, export suite)
- ✅ Visual status indicators (passed/failed/pending badges)
- ✅ Test metadata display (last run date, status)
- ✅ Expand/collapse suites for clean UI
- ✅ 34 comprehensive tests (100% passing)

**Files**:
- `frontend/src/components/suites/TestSuiteOrganizer.tsx` - Suite organizer (400+ LOC)
- `frontend/src/components/suites/index.tsx` - Exports
- `frontend/src/components/suites/TestSuiteOrganizer.test.tsx` - 34 tests
- `frontend/src/components/templates/` - Template gallery (v0.14.0)
- `frontend/src/services/templates.ts` - Template service (rewritten in v0.23.0 for filesystem loading)
- `artifacts/templates/*.yaml` - 16 YAML template files (added in v0.22.0, moved in v0.23.0)

**Success Criteria Met**:
- ✅ At least 6 high-quality templates (6 delivered)
- ✅ Template gallery is easy to browse (search + filter working)
- ✅ One-click load to canvas
- ✅ Suite organization is intuitive
- ✅ Bulk operations (run all, export)
- ✅ Visual status indicators
- ✅ 65 total tests (31 Template Gallery + 34 Suite Organizer, 100% passing)
- ✅ Zero regressions
- ✅ Follows Sentinel design system

**Known Limitations** (Future Enhancements):
- ⏳ Drag-and-drop tests between suites (future)
- ⏳ Nested suites (future)
- ⏳ Suite-level defaults (future)
- ⏳ Community template sharing (future)

**Documentation**: See `releases/release-0.14.0.md` (Template Gallery) and `releases/release-0.21.0.md` (Suite Organizer) for complete release notes.

---

### ✅ Release 0.28.0: Regression Engine & Comparison View
**Status**: Completed ✅
**Released**: November 24, 2025
**Semver**: 0.27.0 → 0.28.0 (minor)

**Description**:
Complete regression detection engine and comparison view for comparing test runs side-by-side and detecting performance regressions.

**What Was Delivered**:
- **Regression Detection Engine** (`backend/regression/`): Core regression analysis with configurable thresholds ✅
  - Latency threshold detection (default: 20%)
  - Cost threshold detection (default: 10%)
  - Token usage threshold detection (default: 15%)
  - Severity levels: `critical`, `warning`, `info`, `improvement`
  - Assertion pass/fail rate comparison
  - New failure and fixed failure detection

- **Run Comparison API** (`backend/api/runs.py`): 6 new endpoints ✅
  - `GET /api/runs/list` - List all test runs
  - `GET /api/runs/test/{test_id}` - List runs for a specific test
  - `GET /api/runs/{run_id}` - Get a specific run
  - `GET /api/runs/{run_id}/results` - Get assertion results for a run
  - `GET /api/runs/compare/{baseline_id}/{current_id}` - Full run comparison
  - `GET /api/runs/regression/{baseline_id}/{current_id}` - Regression analysis only

- **Comparison View** (`frontend/src/components/comparison/`): Complete UI ✅
  - Mode Toggle: Switch between "Run" and "Compare" modes in execution panel
  - Run Selectors: Dropdown selectors for baseline and current runs with auto-selection
  - MetricDeltaCard: Visual cards showing metric changes with severity indicators
  - Comparison Summary: Overall regression status with severity badge
  - Assertion Comparison Table: Side-by-side assertion status comparison
  - Output Comparison: Detection of output changes between runs
  - Configuration Change Detection: Alerts for model or provider changes

**Files**:
- `backend/regression/__init__.py` - Module exports
- `backend/regression/engine.py` - Core regression detection logic (200+ LOC)
- `backend/regression/comparator.py` - Run comparison utilities (250+ LOC)
- `backend/api/runs.py` - Run management API endpoints (370+ LOC)
- `frontend/src/components/comparison/ComparisonView.tsx` - Main comparison view (300+ LOC)
- `frontend/src/components/comparison/MetricDeltaCard.tsx` - Metric delta visualization (100+ LOC)
- `frontend/src/components/comparison/RunSelector.tsx` - Run selection dropdown (80+ LOC)
- `frontend/src/components/execution/ExecutionPanel.tsx` - Updated with mode toggle
- `frontend/src/services/api.ts` - Added 6 new API functions
- `frontend/src/types/test-spec.ts` - Added comparison types
- `frontend/src/stores/canvasStore.ts` - Added id field to SavedTestInfo

**Test Coverage**:
- Backend Tests: 27 new tests (`backend/tests/test_regression.py`)
- Frontend Tests: 38 new tests across 3 test files
  - `MetricDeltaCard.test.tsx`: 14 tests
  - `RunSelector.test.tsx`: 11 tests
  - `ComparisonView.test.tsx`: 13 tests

**Success Criteria Met**:
- ✅ Can compare any two runs
- ✅ Visual diff is clear and helpful (MetricDeltaCard with severity colors)
- ✅ Regression detection is accurate (configurable thresholds)
- ✅ Thresholds are configurable (latency, cost, tokens)
- ✅ All new code passes tests (65 new tests, 100% passing)
- ✅ All code quality checks pass (Black, Ruff, MyPy)
- ✅ TypeScript strict mode compliance (0 errors)
- ✅ Zero regressions in existing tests

**Documentation**: See `releases/release-0.28.0.md` for complete release notes.

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

### Feature 11: Unified Test Management System
**Status**: Not Started
**Priority**: P1 - Core UX Improvement
**Semver Impact**: minor (0.29.0 - 0.32.0, 4 phases)
**Specification**: See `backlog/11-spec-test-management.md` for comprehensive details

**Description**:
Unify test creation, editing, saving, and management into a seamless, intuitive experience. Address fundamental UX issues with multiple disconnected save points, inconsistent state management, and confusing workflows.

**Problem Statement**:
Current architecture has critical UX issues:
- Multiple disconnected save points (YamlPreview, TestManager, Library)
- Tests saved to database but templates from filesystem (inconsistent)
- Comparison view broken for unsaved tests (no test ID linkage)
- Name/description editable in 3+ places with different behaviors
- "Save" in YamlPreview always creates NEW test (duplicates)
- No dirty state indicator for unsaved changes

**Requirements**:

- **Phase 1 (v0.29.0): Unified Test State**
  - Create `useTestStore.ts` - single source of truth for test state
  - Track: id, filename, name, description, category, isDirty, lastSaved
  - Refactor YamlPreview to use unified store (remove internal save state)
  - Remove/deprecate TestManager component (consolidate to Library)
  - Update canvasStore to call markDirty() on changes

- **Phase 2 (v0.30.0): File-Based Storage**
  - Store tests as YAML files in `artifacts/tests/` (like templates)
  - Database stores metadata only (id, filename, runs) - not full spec
  - Backend TestFileService for CRUD operations on YAML files
  - New API endpoints: `/api/tests/files` for file operations
  - Migration script to export existing database tests to files

- **Phase 3 (v0.31.0): Unified UI/UX**
  - TestHeader component with inline name editing and dirty indicator
  - TestActions bar with unified Save/Save As/Import/Export
  - Keyboard shortcuts: ⌘S (save), ⌘⇧S (save as), ⌘N (new)
  - Auto-save by default (no toggle needed), 3-second debounce
  - State indicators: dirty (●), saved (✓), saving (⟳), template badge

- **Phase 4 (v0.32.0): Comparison Integration**
  - Auto-link runs to tests (prompt to save if unsaved)
  - Comparison view shows "Save to enable comparison" for unsaved tests
  - Run history section in Test tab (last 5 runs, quick compare)

**Deliverables**:
- `frontend/src/stores/testStore.ts` - Unified test state management
- `frontend/src/components/test/TestHeader.tsx` - Inline editable header
- `frontend/src/components/test/TestActions.tsx` - Unified action bar
- `backend/services/test_files.py` - File-based test storage
- `backend/api/test_files.py` - File CRUD API endpoints
- `backend/migrations/export_tests_to_files.py` - Migration script
- Database schema changes (remove spec_json, spec_yaml, canvas_state; add filename)
- Tests for all new components and services
- Documentation: Test management guide

**Success Criteria**:
- Single "Save" button with consistent behavior (no duplicates)
- Tests stored as YAML files in `artifacts/tests/` (git-friendly)
- Clear dirty state indicator when changes are unsaved
- Auto-save works automatically without toggle
- Comparison view works for all saved tests
- All runs linked to test definitions
- Keyboard shortcuts work (⌘S to save)
- No data loss during migration

**User Experience Transformation**:

| Before | After |
|--------|-------|
| Multiple save buttons | Single unified Save |
| Creates duplicates | Updates existing test |
| Tests in database only | Tests as YAML files (git-friendly) |
| No dirty indicator | Clear unsaved changes indicator |
| Manual auto-save toggle | Auto-save by default |
| Comparison broken for unsaved | Clear "save to compare" prompt |
| 3 places to edit name | Inline edit in one place |

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

### Feature 16: Backend Bundling for Desktop App
**Status**: Not Started
**Priority**: P2 - Extended Value (Post-V1)
**Semver Impact**: minor (0.16.0 - 0.18.0)
**Target Timeline**: 3-4 sprints

**Description**:
Bundle the Python FastAPI backend with the Tauri desktop app to provide a seamless single-application experience. Users will no longer need to manually start the backend server - it will be automatically managed by the desktop app.

**Goal**: One-click launch, zero configuration, no visible backend server.

**See**: `backlog/07-spec-bundle.md` for comprehensive implementation plan

**Requirements**:

**Phase 1 (v0.16.0): Backend Executable Creation**
- Build standalone Python executable using PyInstaller/PyOxidizer
- Cross-platform builds (macOS ARM64/Intel, Windows, Linux)
- Test executable runs independently
- Size optimization (~30-80MB per platform)

**Phase 2 (v0.17.0): Tauri Sidecar Integration**
- Integrate backend as Tauri sidecar
- Auto-start/stop lifecycle management
- Backend health monitoring and crash recovery
- Unified logging (backend + frontend)
- Environment variable passing (API keys, config)

**Phase 3 (v0.17.0): Configuration & Setup**
- First-run setup wizard for API keys
- Platform-specific secure config storage:
  - macOS: `~/Library/Application Support/com.navam.sentinel/config.env`
  - Windows: `%APPDATA%\com.navam.sentinel\config.env`
  - Linux: `~/.config/sentinel/config.env`
- Config persistence across restarts
- Backend restart with new config

**Phase 4 (v0.18.0): Build & Distribution**
- Automated build scripts for all platforms
- GitHub Actions CI/CD pipeline
- Bundle size < 100MB
- Automated release publishing

**Architecture Decision**: Tauri Sidecar (Recommended)
- Uses PyInstaller to build standalone Python binary
- Tauri manages backend lifecycle automatically
- Clean separation, easy debugging
- Cross-platform support

**User Experience Transformation**:

Before (Current):
- ❌ Two terminals to open
- ❌ Manual backend startup (`./start.sh`)
- ❌ Visible backend process
- ❌ Manual dependency installation

After (v0.16+):
- ✅ Double-click Sentinel.app
- ✅ Backend auto-starts (hidden)
- ✅ One-click launch (< 3 seconds)
- ✅ Zero configuration

**Deliverables**:
- `scripts/build-backend.sh`: Backend executable build script
- `frontend/src-tauri/src/backend_manager.rs`: Rust backend lifecycle manager
- `frontend/src-tauri/src/config_manager.rs`: Config storage and loading
- `frontend/src/components/setup/FirstRunSetup.tsx`: Setup wizard UI
- `frontend/src/services/api.ts`: Auto-connection to bundled backend
- `.github/workflows/build-desktop.yml`: CI/CD pipeline
- PyInstaller configuration and hooks
- Cross-platform binaries in `frontend/src-tauri/binaries/`
- Documentation: Bundling guide and deployment docs

**Success Criteria**:

Phase 1:
- ✅ Backend builds as standalone executable
- ✅ Executable runs on macOS, Windows, Linux
- ✅ All API calls work from executable

Phase 2:
- ✅ Tauri sidecar integration complete
- ✅ Backend auto-starts on app launch
- ✅ Frontend connects automatically
- ✅ No manual backend startup needed

Phase 3:
- ✅ First-run setup dialog works
- ✅ API keys saved securely
- ✅ Config persists across restarts

Phase 4:
- ✅ Automated builds for all platforms
- ✅ Bundle size < 100MB
- ✅ CI/CD pipeline working
- ✅ Releases published automatically

User Experience:
- ✅ One-click launch
- ✅ < 3 second startup time
- ✅ Zero configuration needed
- ✅ No visible backend process
- ✅ Graceful error handling

**Development Workflow**:
- Development mode: Keep using separate processes (recommended for hot reload)
- Production mode: Test bundled app periodically
- Build command: `npm run build:all` (builds backend + frontend)

**Known Limitations**:
1. Bundle size: 35-85MB (acceptable for desktop)
2. First launch: Slightly slower (~3-5s vs ~1-2s)
3. Python version: Locked to bundled version
4. Dependencies: Must rebuild executable for updates
5. Debugging: Slightly harder than separate processes

**All acceptable tradeoffs for improved UX**

---

## Notes

- **Visual-first from day 1**: GUI is the primary interface, DSL is the interoperability format
- **Round-trip is critical**: Visual ↔ DSL must be seamless and bidirectional
- **Design system**: Follow spec-03.md for all UI components
- **Visual patterns**: Reference spec-04.md for component designs and user journeys
- **Incremental delivery**: Each feature should be completable and deliverable independently
- **Testing is mandatory**: All features require tests
- **Documentation is required**: Each feature needs user documentation
- **🔴 Code quality is critical**: All developers must follow the Code Quality & Testing Initiative (see above and `backlog/08-spec-code-quality.md`). Testing gaps in critical code (DSL, Canvas, Nodes) must be addressed in Phase 1.
- **🟡 Test management UX**: Feature 11 addresses critical UX issues with test saving/editing. Tests should be stored as YAML files in `artifacts/tests/` for git-friendliness. See `backlog/11-spec-test-management.md` for details.

## Current Status

- **Version**: 0.29.0 (Unified Test Management - Phase 1 ✅)
- **Latest Release**: Release 0.29.0 - Unified Test Management Phase 1 (November 24, 2025)
- **Completed Features**: Feature 1 (Visual Canvas) + Feature 2 (DSL Parser & Visual Importer) + Feature 2.5 (Monaco YAML Editor) + Feature 3 (Complete ✅ - Model Provider Architecture & Execution with Full Storage Integration) + Feature 4 (Assertion Builder & Validation) + Hotfix 0.12.1 (UI/UX Polish) + Feature 5 (Design System Implementation ✅) + Feature 7 (Template Gallery & Test Suites COMPLETE ✅ - Now Filesystem-Based) + Native System Menu & About Dialog (v0.27.0) + Feature 8 (Regression Engine & Comparison View ✅ - v0.28.0) + **Feature 11 Phase 1 (Unified Test Management ✅ - v0.29.0)**
- **Next Feature**: **Feature 11 Phases 2-4** (Toolbar, New Test Flow, Session Persistence) OR Feature 6 - Record & Replay Test Generation OR Feature 9 - Agentic Framework Support (LangGraph)
- **🔴 Critical Initiative**: Code Quality & Testing - **ALL PHASES COMPLETE ✅** (Phase 1-4 done)
- **✅ Infrastructure Task**: Tauri 2.1 → 2.9.3 Upgrade - **COMPLETED** (v0.25.0, November 24, 2025)
- **✅ Desktop App Polish**: Native System Menu - **COMPLETED** (v0.27.0, November 24, 2025)
- **✅ Regression Detection**: Regression Engine & Comparison View - **COMPLETED** (v0.28.0, November 24, 2025)
- **✅ Test Management Phase 1**: Unified Test Store - **COMPLETED** (v0.29.0, November 24, 2025)
- **Architecture**: Visual-first desktop app (**Tauri 2.9.3** + React 19 + React Flow) with Python backend + SQLite storage + Auto-save + Assertion Validation + WCAG AAA UI + Dynamic Templates (Filesystem-Based) + Settings Store + Test Suite Organizer + Complete Design System + 100% Type Safety + Professional Code Quality + 50%+ Test Coverage + E2E Testing + Cross-User Compatibility + Native System Menu + **Regression Detection Engine**
- **Test Status**: 666/666 tests passing (100% - 551 frontend + 115 backend) ✅ (+21 new tests for testStore)
- **Code Quality Status** (All Phases Complete ✅):
  - ✅ **Critical Code Tested**: DSL (24 tests), Canvas (24 tests), Nodes (158 tests)
  - ✅ **Design System Tested**: CommandPalette (23 tests), AssertionCard (27 tests)
  - ✅ **Suite Organizer Tested**: TestSuiteOrganizer (34 tests)
  - ✅ **E2E Tests**: 21 tests across 3 user journeys (Create Test, Load Template, YAML Round-Trip)
  - ✅ **Performance Benchmarks**: Canvas (31,143 ops/sec), Build (1.68s), Bundle (677KB)
  - ✅ **Code Complexity**: Python avg 3.44 (target < 10), 96.4% A-grade functions
  - ✅ **Maintainability**: All modules A/B grade (target > 65)
  - ✅ **TypeScript `any` Usage**: 0 instances (Target: 0) - **100% Type Safety**
  - ✅ **Central Type System**: `types/test-spec.ts` (260 LOC)
  - ✅ **Black Formatting**: 100% compliance (11 files reformatted)
  - ✅ **Ruff Linting**: 0 errors (219 issues auto-fixed)
  - ✅ **MyPy Infrastructure**: Configured and ready
  - ✅ **Frontend Coverage**: ~52% (improved from 30%, exceeds 50% target ✅)
  - ✅ **Backend Coverage**: 85% (exceeds 80% target ✅)
  - ✅ **Security**: 0 vulnerabilities (npm + pip-audit)
  - ✅ **Dependabot**: Configured for weekly updates
  - ✅ **E2E Infrastructure**: Playwright configured with 3 critical user journeys
  - See `metrics/report-2025-11-22-110439.md` for initial analysis
  - See `metrics/code-complexity-2025-11-22.md` for complexity baseline

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
