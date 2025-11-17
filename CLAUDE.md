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

### File Structure (Current)

```
sentinel/
├── frontend/                   # React + Vite + Tauri
│   ├── src/
│   │   ├── main.tsx            # React entry point
│   │   ├── App.tsx             # Main app component
│   │   ├── index.css           # Global styles + Sentinel theme
│   │   ├── components/
│   │   │   ├── canvas/         # React Flow canvas components
│   │   │   ├── palette/        # Component palette (drag-drop)
│   │   │   ├── nodes/          # Node type components (React)
│   │   │   ├── yaml/           # YAML preview component
│   │   │   ├── assertions/     # Visual assertion builder (future)
│   │   │   ├── providers/      # Provider marketplace UI (future)
│   │   │   ├── execution/      # Live execution dashboard (future)
│   │   │   ├── comparison/     # Regression comparison views (future)
│   │   │   ├── templates/      # Template gallery (future)
│   │   │   ├── workspace/      # Collaboration UI (future)
│   │   │   └── ui/             # shadcn/ui base components (future)
│   │   ├── lib/
│   │   │   └── dsl/            # DSL generator & importer
│   │   ├── stores/             # Zustand stores (state)
│   │   └── types/              # TypeScript types
│   ├── src-tauri/              # Tauri Rust backend
│   │   ├── src/
│   │   │   └── main.rs         # Tauri app entry
│   │   ├── Cargo.toml
│   │   └── tauri.conf.json
│   ├── index.html              # Vite entry point
│   ├── tailwind.config.js      # Tailwind theme (Sentinel colors)
│   ├── vite.config.ts          # Vite + React configuration
│   ├── tsconfig.json           # TypeScript configuration
│   ├── tsconfig.node.json      # Node environment config
│   ├── src-svelte-backup/      # Archived Svelte implementation
│   └── package.json
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

**Current Version**: 0.3.0 (React Migration Complete)

**Status**: Visual-first React implementation with production-ready canvas

**Latest Milestone**: Feature 1 - Visual Canvas Foundation (v0.3.0) ✅ COMPLETE

**Next Feature**: Feature 2 - DSL Parser & Visual Importer (v0.4.0)

**Architecture**: React 19 + Vite + Tauri + React Flow (production-ready)

### React Migration (November 16, 2025)

Successfully migrated from **Svelte + SvelteFlow** to **React + React Flow** for production stability:

**Why Migrate?**
- SvelteFlow is alpha (v0.1.28) with known drag-and-drop bugs (#4980, #4418)
- React Flow is production-ready (v11+, 400k+ weekly downloads)
- Visual canvas is our CORE feature - cannot compromise on stability
- Better ecosystem: 100+ React UI libraries vs 10-15 for Svelte
- shadcn/ui works with v0.dev for AI-assisted development

**Migration Results**:
- ✅ ~1,500 LOC migrated in 2-3 hours
- ✅ All 5 node types working (Input, Model, Assertion, Tool, System)
- ✅ Drag-and-drop works 100% reliably
- ✅ Real-time YAML generation
- ✅ Bidirectional Visual ↔ DSL sync
- ✅ 0 TypeScript errors, 0 build errors
- ✅ Tauri desktop app running smoothly

See `backlog/06-spec-framework.md` for comprehensive migration analysis.

## Development Commands

### Frontend (React + Vite + Tauri)

```bash
cd frontend

# Install dependencies
npm install

# Development (browser only - Vite dev server)
npm run dev

# Development (Tauri desktop app)
npm run tauri:dev

# Build desktop app
npm run tauri:build

# Type checking
npm run type-check

# Production build (browser)
npm run build
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

- **Frontend components**: Small, focused, reusable React components
- **Backend providers**: Pluggable, consistent interface
- **Type safety**: TypeScript (frontend) + Pydantic (backend)
- **State management**: Zustand for global state, React hooks for local state
- **API design**: RESTful, clear contracts between frontend/backend
- **File organization**: Components by feature, not by type

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
