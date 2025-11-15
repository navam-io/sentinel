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
- **SvelteKit 2.0**: Modern web framework with TypeScript
- **React Flow**: Node-based canvas for visual workflow building
- **shadcn/ui**: Component library with TailwindCSS
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

### File Structure (Planned)

```
sentinel/
├── frontend/                   # SvelteKit + Tauri
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/
│   │   │   │   ├── canvas/     # React Flow canvas components
│   │   │   │   ├── palette/    # Component palette (drag-drop)
│   │   │   │   ├── nodes/      # Node type components
│   │   │   │   ├── assertions/ # Visual assertion builder
│   │   │   │   ├── providers/  # Provider marketplace UI
│   │   │   │   ├── execution/  # Live execution dashboard
│   │   │   │   ├── comparison/ # Regression comparison views
│   │   │   │   ├── templates/  # Template gallery
│   │   │   │   ├── workspace/  # Collaboration UI
│   │   │   │   └── ui/         # shadcn/ui base components
│   │   │   ├── dsl/            # DSL generator & importer
│   │   │   ├── icons/          # SVG icon components
│   │   │   └── stores/         # Svelte stores (state)
│   │   └── routes/             # SvelteKit pages
│   ├── tailwind.config.js      # Tailwind theme (Sentinel colors)
│   └── package.json
│
├── src-tauri/                  # Tauri Rust backend
│   ├── src/
│   │   ├── main.rs             # Tauri app entry
│   │   ├── commands.rs         # IPC commands
│   │   └── storage.rs          # Local file/DB access
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── backend/                    # Python FastAPI
│   ├── api/                    # REST API endpoints
│   ├── core/
│   │   ├── schema.py           # Pydantic models (TestSpec, etc.)
│   │   └── parser.py           # YAML/JSON parser
│   ├── providers/              # Model provider implementations
│   │   ├── base.py             # Abstract provider
│   │   ├── anthropic.py
│   │   └── openai.py
│   ├── executor/               # Test execution engine
│   ├── validators/             # Assertion validation
│   ├── frameworks/             # Agentic framework adapters
│   ├── regression/             # Regression detection
│   ├── recorder/               # Record & replay
│   ├── ai/                     # AI test generation
│   ├── safety/                 # Safety detectors
│   ├── storage/                # Database layer
│   ├── main.py                 # FastAPI app
│   └── requirements.txt
│
├── backlog/
│   ├── active.md               # Feature roadmap
│   ├── spec-03.md              # Design system specs
│   └── spec-04.md              # Visual UI component specs
│
├── templates/                  # Built-in test templates (YAML)
├── .gitignore
├── CLAUDE.md                   # This file
├── README.md
└── LICENSE
```

## V1 Feature Slices (15 Total)

See `backlog/active.md` for complete feature specifications.

### P0 - Foundation (Features 1-4)

1. **Visual Canvas Foundation** (v0.1.0) ← NEXT
   - Tauri + SvelteKit setup
   - Node-based canvas (React Flow)
   - Component palette (drag-drop)
   - Visual → YAML generator
   - Export to file

2. **DSL Parser & Visual Importer** (v0.2.0)
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

**Current Version**: 0.0.0 (pre-alpha)

**Status**: Fresh visual-first implementation starting from scratch

**Next Feature**: Feature 1 - Visual Canvas Foundation (v0.1.0)

**Architecture Decision**: Complete restart with visual-first approach

This is a **fresh start** with visual-first architecture from day 1. The previous text-based DSL implementation (v0.1.0) has been retired in favor of a GUI-first approach with round-trip DSL generation.

### Why the Restart?

The original approach (text-based DSL first, visual UI later) was inverted. Research showed that:
- 80% of users prefer GUI to code for testing
- Visual-first tools (Postman, Langflow) have 10x better adoption
- Round-trip sync requires visual and DSL to be designed together
- Starting with DSL creates technical debt when adding visual layer

The new approach:
- **Visual UI from day 1** (primary interface)
- **DSL as output format** (for version control, CI/CD)
- **Round-trip from the start** (bidirectional sync)
- **Better UX**: Intuitive, accessible, collaborative

## Development Commands

### Frontend (SvelteKit + Tauri)

```bash
cd frontend

# Install dependencies
npm install

# Development (browser)
npm run dev

# Development (Tauri desktop app)
npm run tauri dev

# Build desktop app
npm run tauri build

# Type checking
npm run check

# Linting
npm run lint

# Format
npm run format
```

### Backend (Python FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Development server
uvicorn main:app --reload

# Run tests
pytest

# Type checking
mypy .

# Linting
ruff check .

# Format
black .
```

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

- **Frontend components**: Small, focused, reusable
- **Backend providers**: Pluggable, consistent interface
- **Type safety**: TypeScript (frontend) + Pydantic (backend)
- **State management**: Svelte stores for UI state
- **API design**: RESTful, clear contracts between frontend/backend

### Testing Strategy

- **Frontend**: Component tests (Vitest), E2E tests (Playwright)
- **Backend**: Unit tests (pytest), integration tests (mocked providers)
- **Visual testing**: Screenshot comparisons for UI consistency
- **Round-trip testing**: Verify Visual → YAML → Visual produces identical results

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

- **Design System**: `backlog/spec-03.md`
- **Visual Components**: `backlog/spec-04.md`
- **Feature Backlog**: `backlog/active.md`
- **React Flow Docs**: https://reactflow.dev/
- **SvelteKit Docs**: https://kit.svelte.dev/
- **Tauri Docs**: https://tauri.app/
- **shadcn/ui**: https://ui.shadcn.com/

---

**When implementing visual features**: Always reference `backlog/spec-04.md` for detailed component designs, user journeys, and UX patterns.

**When styling**: Always use the Sentinel design system from `backlog/spec-03.md` (colors, typography, spacing, motion).

**When in doubt**: Build visual first, generate DSL second. The GUI is the primary interface.
