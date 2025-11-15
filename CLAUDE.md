# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Navam Sentinel** is a unified agent regression and evaluation platform for frontier AI labs, neo-labs, and AI research organizations. It combines agent regression testing with deep evaluation capabilities.

**Core Value Proposition**: "GitHub Actions + Jest + Safety Playground + Benchmark Studio — for AI agents + models"

### Key Capabilities
- Deterministic, repeatable agent testing
- Cross-model/version/tool output comparison
- Automated capability and safety evaluations
- Regression detection (reasoning, tool calls, speed, cost)
- Research-grade dashboards

### Target Users
- Frontier model labs
- Neo-labs (agent-focused research organizations)
- Agent product labs
- Enterprise AI infrastructure teams
- Researchers, model engineers, safety teams, eval teams

## Architecture

### Deployment Models
1. **Primary**: On-prem/private SaaS (self-hosted) for security-sensitive labs
2. **Secondary**: Desktop app (Tauri) for individual researchers

### Tech Stack (Planned)

**Frontend & Desktop**
- Tauri (Rust core + TypeScript UI)
- SvelteKit
- shadcn/ui + TailwindCSS

**Backend (Self-hosted)**
- Python FastAPI for API and pipelines
- Docker/Kubernetes for job orchestration
- Postgres for eval and run artifacts
- Redis for queues
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

## V1 Feature Slices (15 Total)

### P0 - Foundation (Features 1-4)
1. **Test Case Spec DSL**: YAML/JSON schema and parser for deterministic test specs ✅ **COMPLETED (v0.1.0)**
2. **Model Provider Architecture**: Pluggable providers (Anthropic, OpenAI initially)
3. **Run Executor**: Local execution with telemetry collection
4. **Assertion Validation**: Validate outputs against test assertions

### P1 - Core Value (Features 5-8)
5. **Agentic Framework Support**: LangGraph integration for agent testing
6. **Regression Engine**: Compare runs and detect regressions
7. **Basic CLI**: Project initialization and command-line interface
8. **Postgres Storage**: Database backend for scalable storage

### P2 - Extended Value (Features 9-15)
9. **Design System & UI Foundation**: Tailwind theme, icons, core components (see backlog/spec-03.md)
10. **Additional Model Providers**: Bedrock, HuggingFace, Ollama support
11. **Additional Agentic Frameworks**: Claude SDK, OpenAI SDK, Strands support
12. **Eval Set Builder**: Synthetic test generation from seed examples
13. **Safety Scenarios**: Basic safety violation detection
14. **Dashboard**: Web UI for run history and comparisons (uses design system from Feature 9)
15. **CI/CD Integration**: GitHub Actions integration and automation

### Key CLI Commands
```bash
sentinel init                                    # Initialize project
sentinel run path/to/test.yaml --model claude   # Run test
sentinel compare run123 run124                   # Compare runs
sentinel evalset generate scenario.yaml          # Generate eval set
sentinel list                                    # List all runs
sentinel show <run-id>                          # Show run details
```

## Design Principles

### Security & Privacy First
- Air-gapped deployment support
- GPU-side execution
- Logs remain in customer VPC
- Full control over model weights/outputs
- No vendor lock-in

### Deterministic & Reproducible
- Seeded randomization
- Prompt versioning
- Structured output validation
- Repeatable environments

### LLM-Oriented Development
- YAML-based test specs optimized for Claude/AI generation
- Agentic development loops
- Simple, minimal component designs
- Fast iteration workflows

## Project Status

**Current Version**: v0.1.0

**Completed Features**:
- ✅ Feature 1: Test Case Spec DSL (YAML/JSON schema, parser, validation)
  - Pydantic-based schema models
  - Full YAML/JSON parsing and serialization
  - 6 example test specifications
  - 81 tests with 98% coverage
  - Complete documentation (11 docs files)

**Next Feature**: Feature 2 - Model Provider Architecture (Anthropic, OpenAI)

**Active Development**: See `/backlog/active.md` for complete feature backlog and priorities

## Visual-First Pivot (2025 Roadmap)

**Important**: Sentinel is pivoting to a **visual-first, drag-and-drop testing platform** while maintaining YAML/CLI backward compatibility. See `/backlog/spec-04.md` for the complete vision.

**Target Positioning**: "Postman for AI Agents" - making AI testing accessible beyond hardcore engineers

### Visual UI Features (Post-v1.0)

**Phase 1: Foundation (Q1 2025)**
- Node-based test canvas (React Flow/Svelte Flow)
- Visual assertion builder (no YAML needed)
- Provider marketplace (one-click install)
- Template gallery (pre-built tests)
- YAML import/export (backward compatible)

**Phase 2: Intelligence (Q2 2025)**
- Record & replay (auto-generate tests from interactions)
- AI-assisted test generation (natural language → tests)
- Smart suggestions (context-aware recommendations)
- Visual debugging tools (interactive traces)

**Phase 3: Collaboration (Q3 2025)**
- Team workspaces (real-time editing)
- Comments & reviews (approval workflows)
- Role-based permissions
- Activity feeds & notifications

**Phase 4: Scale (Q4 2025)**
- Enterprise features (SSO, audit logs)
- Custom plugins & integrations
- Advanced analytics & reporting
- White-label options

### Design Approach
- **Visual-first**: GUI is primary interface, YAML is advanced mode
- **Backward compatible**: All YAML files remain valid, can be imported/exported
- **Git-friendly**: Visual changes show as YAML diffs in version control
- **Research-inspired**: Based on Langflow, n8n, Postman, Playwright, LangSmith patterns

### Expanded Target Users (Visual Era)
- Product Managers (validate agents without code)
- QA Engineers (visual test creation)
- Research Scientists (AI-assisted eval suites)
- Safety Teams (collaborative testing)
- Non-technical Stakeholders (understand via visual traces)

**When implementing visual features**: Reference `/backlog/spec-04.md` for detailed component designs, user journeys, and UX patterns
