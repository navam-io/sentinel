Below is the **complete, Claude-Code-ready “Navam Sentinel Design System.md”** generated *after reading all three uploaded files* (backlog, spec-01, spec-02 → cited).
This is a **single Markdown file**, clean, self-contained, production-ready, and designed for **direct ingestion by Claude Code**.

It includes:

✔ Full design system
✔ Color palettes
✔ Typographic scale
✔ Component library (shadcn/ui compatible)
✔ Layout systems (desktop + self-hosted web)
✔ Iconography system
✔ Motion/interaction
✔ User journeys tied to actual Sentinel features
✔ ICP-aligned mental models
✔ Vibe-coding ready names/structures
✔ Consistent with tech stack (Tauri + SvelteKit + shadcn/ui + TailwindCSS)
✔ Based on feature requirements from **Active Backlog** , **Merged agent-regression + EvalForge spec** , and **model/framework integration spec** .

---

# ✅ **NAVAM SENTINEL — COMPLETE DESIGN SYSTEM (V1)**

### *Optimized for Claude Code & Tauri + SvelteKit + shadcn/ui + Tailwind*

---

# 0. Overview

**Navam Sentinel** is a unified agent regression, evaluation, and safety-capability testing platform targeting frontier labs, neo-labs, agent R&D orgs, and model developers.

This file defines the:

* Brand identity
* UI system
* Layout grids
* Components library
* Iconography tokens
* UX principles
* User journeys
* Component props
* Motion guidelines
* Theme tokens for Tailwind/SvelteKit

Everything is structured to be **machine-generatable** by Claude Code and **human-designed** for clarity.

---

# 1. Brand Identity

## 1.1 Brand Positioning

**“Deterministic Reliability Layer for Agents + Models.”**

For ICPs who require:

* determinism
* reproducibility
* model + agent version comparison
* safety evaluations
* on-prem, local-first workflows

## 1.2 Brand Tone

**Keywords**: precise, secure, deep, analytical, minimal, modern, silent power.

**Aesthetic references**:

* Cursor (precision, dark sci-fi minimal)
* Raycast (clean command palette)
* Vercel (dark professional surfaces)
* Anthropic (research-oriented calm)
* Notion (structured clarity)

---

# 2. Color System (Full Theme Tokens)

### Primary Palette — *Sentinel Signal*

| Token                     | Hex                    | Usage                             |
| ------------------------- | ---------------------- | --------------------------------- |
| `--sentinel-primary`      | **#6EE3F6**            | Accent for active controls, links |
| `--sentinel-primary-dark` | **#3CBACD**            | Hover/pressed states              |
| `--sentinel-primary-glow` | rgba(110,227,246,0.35) | Glows, pulses, hovers             |

### Secondary Palette — *AI Reliability*

| Token                       | Hex         | Usage                     |
| --------------------------- | ----------- | ------------------------- |
| `--sentinel-secondary`      | **#9B8CFF** | Secondary actions, charts |
| `--sentinel-secondary-dark` | **#6C5AE0** | Hover/pressed             |

### Neutral Palette — *Infra-grade Neutrality*

| Token                    | Hex         |
| ------------------------ | ----------- |
| `--sentinel-bg`          | **#0C0F12** |
| `--sentinel-bg-elevated` | **#14181D** |
| `--sentinel-surface`     | **#1C2026** |
| `--sentinel-border`      | **#2C323A** |
| `--sentinel-text`        | **#E2E5E9** |
| `--sentinel-text-dim`    | **#A0A4A9** |

### Semantic Palette (for regression/eval UX)

| Token                | Hex     | Meaning                 |
| -------------------- | ------- | ----------------------- |
| `--sentinel-success` | #4ADE80 | Passed tests            |
| `--sentinel-danger`  | #F87171 | Regression detected     |
| `--sentinel-warning` | #FBBF24 | Performance degradation |
| `--sentinel-info`    | #38BDF8 | Neutral                 |

---

# 3. Typography

### Font Stack

```
Inter, Inter var, SF Pro Display, system-ui, sans-serif
```

Perfect for *agentic developer tools*.

### Scale

| Token       | Size | Usage                  |
| ----------- | ---- | ---------------------- |
| `text-xs`   | 12px | Timestamps, metadata   |
| `text-sm`   | 14px | Secondary UI, labels   |
| `text-base` | 16px | Body                   |
| `text-lg`   | 18px | Section headings       |
| `text-xl`   | 20px | Titles                 |
| `text-2xl`  | 24px | Page headers           |
| `text-3xl`  | 28px | Dashboard hero numbers |
| `text-4xl`  | 36px | Marketing surfaces     |

Weight: Medium 500 default; Semibold 600 for labels; Bold 700 for hero metrics.

---

# 4. Layout + Grid System

### App Layout

```
┌───────────────────────────────────────────────┐
│ Top Nav (Model Selector, Project Selector)    │
├───────────┬───────────────────────────────────┤
│ Side Nav  │ Main Pane                         │
│           │ - Page Header                     │
│           │ - Content / Tables / Charts       │
│           │ - Inspector Panel (optional)      │
└───────────┴───────────────────────────────────┘
```

### Sidebar Width

* default: **280px**
* collapsed: **80px** icon-only

### Page Layout Types

1. **Dashboard Layout**
2. **Test Spec Builder Layout**
3. **Run Comparison Split View**
4. **Agent Trace Viewer Layout**
5. **Safety Report Layout**

All layouts are component-composable via Svelte slots.

---

# 5. Iconography System

Icons must be:

* line-based
* 2px stroke
* rounded ends
* geometric, minimal
* monochrome by default; tinted with primary color on active

### Core Icons (Semantic Tokens)

| Name                     | Meaning           | Style Notes                            |
| ------------------------ | ----------------- | -------------------------------------- |
| `sentinel-shield-signal` | Logo mark         | Circle + shield + radiating signal arc |
| `model-cube`             | LLM model         | Cube with gradient stroke              |
| `graph-nodes`            | Agent framework   | 3-node LangGraph-like graph            |
| `test-flask`             | Test spec         | Flask with spark                       |
| `compare-split`          | Run comparison    | Side-by-side split                     |
| `timeline-run`           | Run history       | Clock + dot timeline                   |
| `alert-scan`             | Safety evaluator  | Shield + spark                         |
| `tool-bolt`              | Tool call         | Lightning arrow                        |
| `token-meter`            | Token usage       | Meter gauge                            |
| `latency-curve`          | Latency chart     | Curve line                             |
| `diff-text`              | Output diff       | Brackets with +/-                      |
| `ci-pipeline`            | CI/CD integration | Pipeline nodes                         |

All icons export as `.svg` and `.svelte` components.

---

# 6. Components Library (shadcn/ui extensions)

### 6.1 Navigation Components

* `Sidebar`
* `SidebarItem`
* `CommandPalette` (Raycast-like)
* `Topbar`
* `ModelSelector` *(models from spec-02 — Anthropic, OpenAI, Bedrock, HF, Ollama)*
* `FrameworkSelector` *(LangGraph → Claude Agents → OpenAI → Strands)*

### 6.2 Test Spec Authoring

* `YamlEditor` (Monaco)
* `TestSpecCard`
* `AssertionTag`
* `ToolList`
* `SeedSelector`
* `ModelDropdown`

### 6.3 Run Execution Views

* `RunCard`
* `RunStatusPill` (success, regression, fail)
* `TokenUsageBar`
* `LatencyHeatmap`
* `ToolCallList`
* `ExecutionTraceTree`
* `FailureExplainerPanel`

### 6.4 Comparison Components

* `RunComparisonHeader`
* `SideBySideDiff`
* `MetricDeltaCard` (+ / – % regression colors)
* `SemanticDiffViewer`
* `CostComparisonChart`
* `CapabilityShiftRadarChart`

### 6.5 Dashboard Components

* `TrendChart`
* `PieDonut`
* `Sparkline`
* `RegressionSummaryCard`
* `SafetyViolationList`
* `ModelLeaderboard`

### 6.6 Inspectors and Overlays

* `RightPanelInspector`
* `ModalDialog`
* `ToastNotification`
* `ProgressBar`
* `ShimmerLoader`

---

# 7. Motion + Interactions

### Rules

* 120ms–160ms transitions
* Ease-out curves
* No bouncing or poppy animations (frontier-lab aesthetic)
* Hover glow uses `--sentinel-primary-glow`

### Micro-Interactions

* Hover on sidebar icons → faint cyan glow
* Diff elements animate fade in left/right
* Run comparison numbers animate count-up
* Agent trace nodes pulse when active
* Test executions show real-time logs streaming with shimmer

---

# 8. UX Principles (aligned to Sentinel functionality)

1. **Determinism visible**
   Always show seed, model ID, provider, timestamp.

2. **Trace everything**
   Agent runs get drill-down views:

   * LLM calls
   * tool calls
   * planning steps
   * state transitions
     (per backlog spec)

3. **Comparison-first design**
   Comparison views should be reachable within **1 click** from any run.

4. **Minimal cognitive load**
   No clutter, no heavy gradients, no marketing surfaces in app.

5. **Research-grade clarity**
   Charts are simple, monochrome + accents.

6. **Local-first feel**
   Even in SaaS mode, UI feels *desktop-y*.

---

# 9. User Journeys (Mapped to Backlog Features)

### Journey 1: Creating a Test Spec (Feature 1)

1. User opens sidebar → **Test Specs**
2. Clicks **Create Spec**
3. Uses **YAML Editor** with validated templates
4. Auto-complete for:

   * models (Anthropic, OpenAI, Bedrock, HF, Ollama)
   * agent frameworks (LangGraph → Claude → OpenAI → Strands)
5. Click **Run Test**

### Journey 2: Executing a Test (Feature 2)

1. Runs appear in **Run Queue**
2. Real-time logs + metrics
3. Test status updates (latency, tool calls)

### Journey 3: Viewing a Run (Feature 3)

1. Click a run → open **Run Detail**
2. User views:

   * execution trace
   * output
   * token usage
   * failures

### Journey 4: Regression Comparison (Feature 6)

1. Select two runs → **Compare**
2. See:

   * side-by-side outputs
   * metric deltas
   * regression summaries

### Journey 5: Eval Set Expansion (Feature 11)

1. Select a seed spec
2. Click **Generate Eval Set**
3. Generated tests preview + filters
4. Save as eval pack

---

# 10. Page Templates (Claude-ready)

### 10.1 Run History Page

```
<RunFilters />
<RunTable />
<Pagination />
```

### 10.2 Run Detail Page

```
<RunCard />
<ExecutionTraceTree />
<ToolCallList />
<OutputViewer />
<AssertionResults />
```

### 10.3 Comparison Page

```
<RunComparisonHeader />
<MetricDeltaGrid />
<SideBySideDiff />
<LatencyChart />
<TokenUsageComparison />
```

### 10.4 Test Spec Builder

```
<YamlEditor />
<ValidationMessages />
<ToolList />
<ModelSelector />
<RunButton />
```

---

# 11. Tailwind Theme Tokens

```
theme: {
  extend: {
    colors: {
      sentinel: {
        primary: '#6EE3F6',
        primaryDark: '#3CBACD',
        primaryGlow: 'rgba(110,227,246,0.35)',
        secondary: '#9B8CFF',
        secondaryDark: '#6C5AE0',
        bg: '#0C0F12',
        bgElevated: '#14181D',
        surface: '#1C2026',
        border: '#2C323A',
        text: '#E2E5E9',
        textDim: '#A0A4A9',
        success: '#4ADE80',
        danger: '#F87171',
        warning: '#FBBF24',
        info: '#38BDF8',
      }
    }
  }
}
```

---

# 12. File + Folder Structure (Tauri + SvelteKit)

```
/src
  /lib
    /components
      /ui (shadcn components)
      /sentinel
        RunCard.svelte
        RunComparison.svelte
        DiffViewer.svelte
        ModelSelector.svelte
        FrameworkSelector.svelte
        ExecutionTraceTree.svelte
        SafetyViolationList.svelte
    /icons
        sentinel-shield-signal.svelte
        tool-bolt.svelte
        diff-text.svelte
        timeline-run.svelte
    /layouts
        DashboardLayout.svelte
        SplitViewLayout.svelte
  /routes
    /runs
    /compare
    /specs
    /dashboard
```

---

# 13. Logo System

**Navam Sentinel Logo – SIGNAL SHIELD**

Constructed from:

* circular backdrop
* shield silhouette
* three outward radiating arcs (“signal”)
* consistent 2px stroke
* monochrome or cyan-accent

Variants:

* Square (app icons)
* Round (avatar)
* Monochrome white
* Cyan-accent
* Dark on light / Light on dark

---

# 14. Ready-to-Generate Assets

Claude Code can generate the following immediately:

* SVG icons (30+)
* Full component boilerplate
* SvelteKit pages/templates
* Tauri wrapper with menu + tray + updater
* The entire Tailwind theme file
* Example test spec YAML files
* Example run comparison data

---

# 15. Final Deliverable Notes

This full design system is now ready to be used by:

### **✔ Claude Code**

to generate UI components, layout scaffolds, Svelte pages, icon sets, Tailwind configuration, and Tauri bindings.

### **✔ Navam Sentinel V1**

across desktop (Tauri), self-hosted web (SvelteKit), and CLI-assisted workflows.

