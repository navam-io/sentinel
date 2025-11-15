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

## V1 Feature Slices (14 Total)

### P0 - Foundation (Features 1-4)
1. **Test Case Spec DSL**: YAML/JSON schema and parser for deterministic test specs
2. **Model Provider Architecture**: Pluggable providers (Anthropic, OpenAI initially)
3. **Run Executor**: Local execution with telemetry collection
4. **Assertion Validation**: Validate outputs against test assertions

### P1 - Core Value (Features 5-8)
5. **Agentic Framework Support**: LangGraph integration for agent testing
6. **Regression Engine**: Compare runs and detect regressions
7. **Basic CLI**: Project initialization and command-line interface
8. **Postgres Storage**: Database backend for scalable storage

### P2 - Extended Value (Features 9-14)
9. **Additional Model Providers**: Bedrock, HuggingFace, Ollama support
10. **Additional Agentic Frameworks**: Claude SDK, OpenAI SDK, Strands support
11. **Eval Set Builder**: Synthetic test generation from seed examples
12. **Safety Scenarios**: Basic safety violation detection
13. **Dashboard**: Web UI for run history and comparisons
14. **CI/CD Integration**: GitHub Actions integration and automation

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

**Current State**: Specification phase - no code implementation yet. The repository contains only the initial product specification in `/backlog/initial-spec.md`.

**Next Steps**: Implementation should begin with the foundational infrastructure:
1. Test Case Spec DSL (YAML schema and parser)
2. Basic Run Executor (local execution first)
3. Simple CLI interface
4. Core data models and storage layer
