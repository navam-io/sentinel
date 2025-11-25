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
- **Tauri 2.9.3** (Rust core + TypeScript UI)
- **React 19 + TypeScript + Vite**
- **React Flow** (@xyflow/react) - production-ready node-based canvas
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

---

## Completed Features Summary

All completed features have detailed release notes in the `releases/` folder.

| Version | Feature | Release Notes |
|---------|---------|---------------|
| 0.33.0 | Record & Replay Test Generation | `releases/release-0.33.0.md` |
| 0.32.0 | File-Based Storage & Run Linkage | `releases/release-0.32.0.md` |
| 0.31.0 | Session Persistence & Auto-Save | `releases/release-0.31.0.md` |
| 0.30.0 | Test Toolbar with Keyboard Shortcuts | `releases/release-0.30.0.md` |
| 0.29.0 | Unified Test Management System (Phase 1) | `releases/release-0.29.0.md` |
| 0.28.0 | Regression Engine & Comparison View | `releases/release-0.28.0.md` |
| 0.27.0 | Native System Menu & About Dialog | `releases/release-0.27.0.md` |
| 0.26.0 | Collapsible Panels & Workspace Customization | `releases/release-0.26.0.md` |
| 0.25.0 | Tauri 2.9.3 Infrastructure Upgrade | `releases/release-0.25.0.md` |
| 0.23.0 | Dynamic Templates Loading System | `releases/release-0.23.0.md` |
| 0.22.0 | Unified Library Tab & Category System | `releases/release-0.22.0.md` |
| 0.21.0 | Template Gallery & Test Suites | `releases/release-0.21.0.md` |
| 0.20.0 | Design System Implementation | `releases/release-0.20.0.md` |
| 0.18.0-0.19.0 | Security Audit & Dependency Updates | `releases/release-0.18.0.md`, `releases/release-0.19.0.md` |
| 0.15.0-0.17.0 | E2E Tests, Performance, Complexity Analysis | `releases/release-0.15.0.md` - `releases/release-0.17.0.md` |
| 0.14.0-0.14.5 | Template Gallery & Code Quality Phase 1-2 | `releases/release-0.14.0.md` - `releases/release-0.14.5.md` |
| 0.12.0-0.12.1 | Assertion Builder & UI Polish | `releases/release-0.12.0.md`, `releases/release-0.12.1.md` |
| 0.11.0 | Frontend API Integration & Test Management | `releases/release-0.11.0.md` |
| 0.10.0 | Data Persistence & Storage Layer | `releases/release-0.10.0.md` |
| 0.5.0 | Monaco YAML Editor Integration | `releases/release-0.5.0.md` |
| 0.4.0 | DSL Parser & Visual Importer | `releases/release-0.4.0.md` |
| 0.3.1 | Simplified Click-to-Add Interface | `releases/release-0.3.1.md` |
| 0.2.0 | Visual Canvas Foundation | `releases/release-0.2.0.md` |
| 0.1.0 | DSL Schema & Parser Foundation | `releases/release-0.1.0.md` |

---

## Planned Features (Priority Order)

### Feature 9: Agentic Framework Support (LangGraph)
**Status**: Not Started
**Priority**: P2 - Extended Value
**Semver Impact**: minor

**Description**:
Support for testing agentic frameworks, starting with LangGraph.

**Requirements**:
- Framework adapter for LangGraph execution
- Visual framework nodes on canvas
- State transition capture and visualization
- Framework registry and plugin architecture

---

### Feature 10: AI-Assisted Test Generation
**Status**: Not Started
**Priority**: P2 - Extended Value
**Semver Impact**: minor

**Description**:
Generate tests from natural language descriptions using AI.

**Requirements**:
- Natural language input: "Test if agent searches products under budget"
- LLM-powered test generation
- Context-aware recommendations and suggestions

---

### Feature 12: Additional Model Providers
**Status**: Not Started
**Priority**: P2 - Extended Value
**Semver Impact**: minor

**Description**:
Expand model provider support to Bedrock, HuggingFace, Ollama.

---

### Feature 13: Safety Scenarios & Eval Set Builder
**Status**: Not Started
**Priority**: P2 - Extended Value
**Semver Impact**: minor

**Description**:
Safety testing and synthetic eval generation.

**Requirements**:
- Safety detectors (jailbreak, PII extraction, insecure tool calls)
- Eval set builder (generate N tests from seed examples)

---

### Feature 14: Dashboard & Analytics
**Status**: Not Started
**Priority**: P2 - Extended Value
**Semver Impact**: minor

**Description**:
Overview dashboard with trends and analytics.

**Requirements**:
- Run history with filtering
- Success rate and latency/cost trends
- Model leaderboard and regression heatmap

---

### Feature 15: CI/CD Integration & Export
**Status**: Not Started
**Priority**: P2 - Extended Value
**Semver Impact**: minor

**Description**:
Run Sentinel tests in CI/CD pipelines.

**Requirements**:
- CLI tool: `sentinel run <test.yaml>`
- GitHub Actions integration
- Export to YAML/JSON/CSV/PDF

---

### Feature 16: Backend Bundling for Desktop App
**Status**: Not Started
**Priority**: P2 - Extended Value (Post-V1)
**Semver Impact**: minor
**Specification**: See `backlog/07-spec-bundle.md` for implementation plan

**Description**:
Bundle the Python FastAPI backend with the Tauri desktop app for one-click launch.

**Goal**: One-click launch, zero configuration, no visible backend server.

**Phases**:
1. Backend executable creation (PyInstaller)
2. Tauri sidecar integration
3. Configuration & setup wizard
4. Build & distribution automation

---

## Notes

- **Visual-first from day 1**: GUI is the primary interface, DSL is the interoperability format
- **Round-trip is critical**: Visual ↔ DSL must be seamless and bidirectional
- **Design system**: Follow `backlog/03-spec-design-system.md` for all UI components
- **Visual patterns**: Reference `backlog/02-spec-visual-first.md` for component designs and user journeys
- **Code quality**: See `backlog/08-spec-code-quality.md` for testing and quality standards
- **Test management**: See `backlog/11-spec-test-management.md` for unified test management system
- **Incremental delivery**: Each feature should be completable and deliverable independently
- **Testing is mandatory**: All features require tests
- **Documentation is required**: Each feature needs user documentation

## Current Status

- **Version**: 0.33.0 (Record & Replay Test Generation)
- **Latest Release**: November 25, 2025
- **Next Feature**: Feature 9 (Agentic Framework Support - LangGraph)
- **Test Status**: 841/841 tests passing (660 frontend + 181 backend)
- **Architecture**: Tauri 2.9.3 + React 19 + React Flow + Python FastAPI + SQLite

See `CHANGELOG.md` for full release history.
