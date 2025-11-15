# Navam Sentinel

**Visual-first agent testing and evaluation platform for AI labs**

**"Postman for AI Agents"** - Point, click, test. Make AI agent testing as intuitive as Postman made API testing.

![Version](https://img.shields.io/badge/version-0.0.0--alpha-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey)

---

## Core Philosophy

**"Point, Click, Test"** - Visual-first interface with round-trip DSL generation

Sentinel makes AI agent testing accessible to everyone—from product managers to model engineers—through an intuitive visual interface backed by a powerful YAML-based DSL for version control and CI/CD.

## Key Features (Visual-First)

### 🎨 **Visual Drag-and-Drop Test Builder**
- Node-based canvas for creating tests (inspired by Langflow, n8n)
- Drag nodes from palette: Models, Prompts, Tools, Assertions
- Connect nodes to define test flow
- Real-time YAML generation from visual canvas

### 🔄 **Round-Trip Visual ↔ DSL Synchronization**
- **Visual → YAML**: Canvas changes update DSL instantly
- **YAML → Visual**: Import YAML files, render as nodes
- **Bidirectional editing**: Edit in canvas OR code, stay in sync
- **Git-friendly**: Visual changes show as clean YAML diffs

### ⏺️ **Record & Replay Test Generation**
- Record agent interactions like Playwright Codegen
- Auto-generate assertions from behavior
- One-click test creation from recordings
- Smart detection of tool calls, outputs, patterns

### 🎯 **Visual Assertion Builder**
- Form-based assertion creation (no YAML needed)
- All assertion types: content, regex, tools, performance, format
- Live validation and error hints
- Visual pass/fail indicators on canvas

### 🚀 **Live Execution Dashboard**
- Run tests directly from canvas
- Real-time execution trace visualization
- Streaming metrics: tokens, latency, cost
- Interactive tool call inspector

### 📊 **Visual Regression Detection**
- Side-by-side run comparison
- Metric deltas with visual indicators (🔥, ⚡, 💰, ✅)
- Semantic output diff viewer
- Regression heatmaps over time

### 🤖 **AI-Assisted Test Generation**
- Describe tests in natural language
- LLM generates canvas nodes and assertions
- Context-aware suggestions and recommendations
- Template gallery for quick starts

### 👥 **Collaborative Workspaces**
- Team-based testing with shared suites
- Real-time collaboration
- Comments, reviews, approvals
- Activity feeds and notifications

---

## Quick Start (Coming Soon)

Sentinel is currently in **pre-alpha** development. The visual-first desktop app is being built with Tauri + SvelteKit.

### Installation (When Available)

**Desktop App** (macOS, Windows, Linux):
```bash
# Download from releases
# Or install via package managers
brew install navam-sentinel      # macOS
choco install navam-sentinel     # Windows
snap install navam-sentinel      # Linux
```

**From Source** (Developers):
```bash
git clone https://github.com/navam-io/sentinel.git
cd sentinel

# Frontend (SvelteKit)
cd frontend
npm install
npm run dev

# Backend (Python FastAPI)
cd ../backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# Tauri Desktop App
npm run tauri dev
```

---

## Visual Workflow Examples

### Example 1: Create a Test Visually

1. **Open Sentinel** → See blank canvas
2. **Drag "Model" node** → Select GPT-4 or Claude
3. **Drag "Prompt" node** → Enter: "What is the capital of France?"
4. **Drag "Assertion" node** → Add: "Must contain: Paris"
5. **Connect nodes** → Model → Prompt → Assertion
6. **Click "Run"** → See live execution trace
7. **View YAML** → Auto-generated test spec
8. **Export** → Save as `france_qa.yaml` for git

**Time to first test**: <1 minute

### Example 2: Import YAML, Edit Visually

1. **File → Import** → Select `existing_test.yaml`
2. **Canvas renders** → Nodes appear with auto-layout
3. **Click assertion node** → Edit form opens
4. **Change value** → YAML updates in real-time
5. **Add new assertion** → Drag from palette
6. **Export** → Updated YAML with your changes

**Round-trip complete** - no data loss

### Example 3: Record & Replay

1. **Click "Record"** → Agent playground opens
2. **Interact with agent** → "Find laptops under $1000"
3. **Agent uses tools** → browser.search(), calculator.compare()
4. **Stop recording** → Review generated test
5. **Auto-generated assertions**:
   - ✅ Must call tool: "browser"
   - ✅ Must call tool: "calculator"
   - ✅ Output type: JSON
   - ✅ Must contain: "price"
6. **Save to canvas** → Nodes added automatically

**Zero manual assertion writing**

---

## Architecture

### Desktop App (Tauri)
- **Frontend**: SvelteKit 2.0 + TypeScript
- **Canvas**: React Flow (node-based workflow)
- **UI**: shadcn/ui + TailwindCSS
- **Editor**: Monaco (YAML/JSON editing)
- **Charts**: Recharts (analytics)
- **Backend**: Rust (Tauri core) + IPC

### Python Execution Engine
- **API**: FastAPI (test execution, validation)
- **Models**: Pluggable providers (Anthropic, OpenAI, Bedrock, etc.)
- **Frameworks**: LangGraph, Claude SDK, OpenAI Agents, Strands
- **Storage**: SQLite (local) / PostgreSQL (server)
- **Validation**: Pydantic schemas

### Model Provider Support
- ✅ Anthropic (Claude models)
- ✅ OpenAI (GPT models)
- 🚧 Amazon Bedrock (multi-model)
- 🚧 HuggingFace (hosted/endpoints)
- 🚧 Ollama (local models)

### Agentic Framework Support
- 🚧 LangGraph (multi-step agents)
- 🚧 Claude Agent SDK
- 🚧 OpenAI Agents SDK
- 🚧 Strands Agents

---

## Test Spec DSL (YAML)

While the visual UI is primary, all tests are backed by a clean YAML DSL for version control and CI/CD.

### Example Test Spec

```yaml
name: "Product Search Agent Test"
model: "claude-3-5-sonnet-20241022"
provider: "anthropic"
seed: 42

tools:
  - browser
  - calculator

inputs:
  query: "Find top 3 laptops under $1000 with 16GB RAM"

assertions:
  - must_call_tool: ["browser", "calculator"]
  - must_contain: "price"
  - must_contain: "RAM"
  - output_type: "json"
  - max_latency_ms: 9000

tags:
  - e2e
  - shopping
```

**This YAML can be**:
- Generated from visual canvas
- Imported to visual canvas
- Edited directly (syncs to canvas)
- Version controlled in git
- Run in CI/CD pipelines

---

## Roadmap

See [backlog/active.md](backlog/active.md) for the complete feature backlog.

### v0.1.0 - Visual Canvas Foundation (Q1 2025)
- ✓ Tauri desktop app setup
- ✓ Node-based canvas (React Flow)
- ✓ Component palette (drag-and-drop)
- ✓ Visual → YAML generator
- ✓ Export to file

### v0.2.0 - Round-Trip Sync (Q1 2025)
- ✓ YAML/JSON parser (Pydantic)
- ✓ YAML → Visual importer
- ✓ Bidirectional sync
- ✓ Monaco editor integration

### v0.3.0 - Model Providers & Execution (Q1 2025)
- ✓ Anthropic + OpenAI providers
- ✓ Visual provider marketplace
- ✓ Local execution engine
- ✓ Live execution dashboard

### v0.4.0 - Assertion Builder & Validation (Q2 2025)
- ✓ Visual assertion builder
- ✓ All assertion types
- ✓ Validation engine
- ✓ Visual pass/fail indicators

### v0.5.0 - Design System (Q2 2025)
- ✓ Tailwind theme (Sentinel colors)
- ✓ Icon system (30+ icons)
- ✓ Core UI components
- ✓ Motion/interactions

### v0.6.0 - Record & Replay (Q2 2025)
- ✓ Recording mode
- ✓ Smart detection
- ✓ Auto-generate tests

### v0.7.0 - Templates & Suites (Q2 2025)
- ✓ Template gallery
- ✓ Test suite organizer
- ✓ 6+ built-in templates

### v0.8.0 - Regression Engine (Q3 2025)
- ✓ Visual comparison view
- ✓ Regression detection
- ✓ Trend charts

### v0.9.0+ - Extended Features
- LangGraph framework support
- AI-assisted test generation
- Collaborative workspaces
- Additional model providers
- Safety scenarios
- CI/CD integration

---

## Target Users

### Primary (Visual-First Interface)
- **Product Managers**: Validate agents without coding
- **QA Engineers**: Visual test creation and debugging
- **Research Scientists**: Build evals with AI assistance
- **Safety Teams**: Collaborative safety testing
- **Frontier Model Labs**: Test model releases
- **Neo-labs**: Agent-focused research
- **Agent Product Companies**: Production testing

### Secondary (DSL/Advanced Mode)
- **Model Engineers**: Programmatic testing, DSL editing
- **DevOps Engineers**: CI/CD integration
- **Enterprise AI Teams**: Infrastructure testing

---

## Design Principles

### Visual-First, Git-Friendly
- GUI is the primary interface for most users
- DSL is the interoperability and version control format
- Round-trip conversion with zero data loss
- Visual changes show as clean YAML diffs in git

### Security & Privacy First
- Desktop-first architecture (data stays local)
- Optional self-hosted server for teams
- Air-gapped deployment support
- Full control over model outputs
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
- Intuitive visual interface inspired by Postman, Langflow
- Advanced mode for power users (direct DSL editing)
- AI-assisted generation for rapid testing

---

## Inspiration & Research

Sentinel's visual-first approach is inspired by industry-leading tools:

- **Langflow**: Node-based LLM workflow builder
- **n8n**: Visual workflow automation with best practices
- **Postman**: Collections, runner, and collaborative testing UX
- **Playwright Codegen**: Record/replay test generation
- **LangSmith**: Visual observability and trace inspection

See [backlog/spec-04.md](backlog/spec-04.md) for complete research and design rationale.

---

## Contributing

Contributions are welcome! Sentinel is in early development.

### Development Setup

```bash
# Clone repo
git clone https://github.com/navam-io/sentinel.git
cd sentinel

# Frontend (SvelteKit + Tauri)
cd frontend
npm install
npm run dev

# Backend (Python)
cd ../backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

# Run Tauri desktop app
npm run tauri dev
```

### Tech Stack
- Frontend: SvelteKit 2.0, TypeScript, TailwindCSS, React Flow, Monaco
- Desktop: Tauri 2.0 (Rust)
- Backend: Python, FastAPI, Pydantic
- Database: SQLite (local) / PostgreSQL (server)
- Providers: Anthropic, OpenAI, Bedrock, HuggingFace, Ollama

---

## Documentation

- **[Active Backlog](backlog/active.md)** - Feature roadmap and priorities
- **[Visual UI Spec](backlog/spec-04.md)** - Complete visual component specifications
- **[Design System](backlog/spec-03.md)** - Tailwind theme, colors, typography, components

Documentation site coming soon.

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Support

- **Issues**: https://github.com/navam-io/sentinel/issues
- **Discussions**: https://github.com/navam-io/sentinel/discussions
- **Email**: hello@navam.io
- **Twitter**: [@navam_io](https://twitter.com/navam_io)

---

## Project Status

**Current Version**: 0.0.0 (pre-alpha)

**Status**: Fresh visual-first implementation in progress

**Next Milestone**: v0.1.0 - Visual Canvas Foundation

This is a complete restart of Sentinel with visual-first architecture from day 1. The previous text-based DSL implementation (v0.1.0) has been retired in favor of a GUI-first approach with round-trip DSL generation.

---

**Built with ❤️ for frontier AI labs, researchers, and agent builders**
