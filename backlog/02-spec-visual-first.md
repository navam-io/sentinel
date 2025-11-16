# Spec 04 - Visual-First Product Pivot

## Executive Summary

**Pivot Direction**: Transform Navam Sentinel from a text-based DSL tool to a **visual-first, drag-and-drop agent testing platform** while maintaining determinism and reproducibility.

**Core Philosophy**: "Point, Click, Test" - Make AI agent testing as intuitive as Postman made API testing, as visual as Langflow made LLM workflows, and as powerful as LangSmith made observability.

**Target**: Expand from hardcore AI engineers to include **product managers, QA engineers, researchers, and non-technical stakeholders** who need to understand and validate AI agent behavior.

---

## Research-Based Design Principles

### Inspiration from Industry Leaders

Based on comprehensive research of 2024-2025 visual tooling:

**From Langflow:**
- Drag-and-drop node-based workflow builder
- Visual component library (prompts, models, tools)
- Real-time execution preview
- Component marketplace

**From n8n:**
- Modular, reusable workflow design
- Visual error handling and debugging
- Version control integration
- Template library

**From Postman:**
- Collections-based organization
- Visual test runner with live results
- Collaborative workspaces
- Environment management UI

**From Playwright Codegen:**
- Record & replay functionality
- Auto-generate tests from user interactions
- Intelligent selector generation
- Visual assertion recording

**From LangSmith:**
- Visual trace inspection
- Real-time monitoring dashboards
- Side-by-side comparison views
- Interactive debugging

**From React Flow/Node-Based UIs:**
- Auto-layout algorithms (ELK)
- Minimap navigation
- Zoom/pan canvas
- Customizable node types

---

## Core Visual Components

### 1. **Visual Test Canvas** (Primary Interface)

#### 1.1 Node-Based Test Builder

**Canvas Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Sentinel Test Builder                              [▶ Run] │
├──────────┬──────────────────────────────────────────────────┤
│ 📦 Nodes │  ┌─────────────────────────────────────────┐    │
│          │  │         Test Canvas (Infinite)           │    │
│ Models   │  │                                          │    │
│ ├─ GPT-4 │  │  ┌─────────┐      ┌──────────┐         │    │
│ ├─Claude │  │  │ Model   │─────▶│ Prompt   │         │    │
│ └─Llama  │  │  │ GPT-4   │      │          │         │    │
│          │  │  └─────────┘      └─────┬────┘         │    │
│ Tools    │  │                         │              │    │
│ ├─Browser│  │                         ▼              │    │
│ ├─Search │  │                  ┌─────────────┐       │    │
│ └─Calculator│  │              │ Assertions  │       │    │
│          │  │                  │  ✓ Contains │       │    │
│ Assertions│  │                 │  ✓ Type:JSON│       │    │
│ ├─Contains│  │                 └─────────────┘       │    │
│ ├─Regex  │  │                                          │    │
│ └─Latency│  │  [Minimap]                              │    │
│          │  └─────────────────────────────────────────┘    │
│ [+ Add]  │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

**Key Features:**
- **Drag-drop from component palette** (left sidebar)
- **Connect nodes** with visual arrows (data flow)
- **Auto-layout** when adding nodes
- **Minimap** for large test flows
- **Live validation** (red borders for invalid configs)
- **Quick actions** (duplicate, delete, disable nodes)

#### 1.2 Node Types

**Input Nodes:**
- 💬 **Prompt Node**: Define user input
- 📧 **Message History Node**: Multi-turn conversations
- 🎯 **Context Node**: Add structured context data
- 🔄 **Variable Node**: Dynamic test data

**Model Nodes:**
- 🤖 **LLM Node**: Select model + configure (temp, tokens, etc.)
- 🔌 **Provider Node**: Choose API provider
- 🌱 **Seed Node**: Set deterministic seed
- ⚙️ **Config Node**: Model parameters (visual sliders/inputs)

**Tool Nodes:**
- 🔧 **Tool Node**: Available tools (browser, calculator, etc.)
- 🔗 **Tool Chain Node**: Multi-tool sequences
- 📊 **Tool Inspector**: See tool call details

**Framework Nodes:**
- 🕸️ **LangGraph Node**: Configure LangGraph agent
- 🎭 **Claude Agent Node**: Claude SDK config
- 🤝 **Multi-Agent Node**: Agent orchestration

**Assertion Nodes:**
- ✅ **Content Check**: must_contain, must_not_contain
- 📝 **Regex Match**: Pattern matching
- 🏃 **Performance**: Latency, token limits
- 🎨 **Format**: JSON, text, markdown validation
- 🔧 **Behavior**: Tool call verification

**Output Nodes:**
- 📊 **Results Display**: Show output
- 💾 **Save to Suite**: Add to test collection
- 📤 **Export**: Download as YAML/JSON

#### 1.3 Node Interaction Patterns

**Double-click node** → Opens configuration panel
**Right-click node** → Context menu (duplicate, delete, disable, inspect)
**Drag connection** → Create data flow
**Hover node** → Show quick info tooltip
**Click node** → Select (shows in properties panel)
**Shift+drag** → Multi-select nodes

---

### 2. **Visual Assertion Builder**

Instead of writing YAML, users build assertions visually:

```
┌─────────────────────────────────────────────────────┐
│ Assertion Builder                                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ Assertion 1: Content Check              [×]  │   │
│ │ ┌──────────────────────────────────────────┐│   │
│ │ │ Type: [Must Contain ▼]                  ││   │
│ │ │                                          ││   │
│ │ │ Text: [Paris                         ]  ││   │
│ │ │                                          ││   │
│ │ │ ☑ Case sensitive                        ││   │
│ │ └──────────────────────────────────────────┘│   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ Assertion 2: Format Check               [×]  │   │
│ │ ┌──────────────────────────────────────────┐│   │
│ │ │ Output Type: ○ Text  ● JSON  ○ Code    ││   │
│ │ │                                          ││   │
│ │ │ Validate Schema: ☐ Use JSON Schema     ││   │
│ │ └──────────────────────────────────────────┘│   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ Assertion 3: Performance                [×]  │   │
│ │ ┌──────────────────────────────────────────┐│   │
│ │ │ Max Latency: [━━━━━━━○━━] 3000 ms      ││   │
│ │ │                                          ││   │
│ │ │ Token Range:                            ││   │
│ │ │   Min: [50  ] Max: [500 ]              ││   │
│ │ └──────────────────────────────────────────┘│   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ [+ Add Assertion ▼]          [Preview YAML]         │
└─────────────────────────────────────────────────────┘
```

**Features:**
- **Template-based creation**: Select assertion type from dropdown
- **Visual controls**: Sliders, checkboxes, radio buttons
- **Live preview**: See generated YAML in real-time
- **Validation**: Show errors immediately
- **Reorderable**: Drag to change assertion order
- **Collapsible**: Minimize assertions for overview

---

### 3. **Record & Replay Test Generation**

Inspired by Playwright Codegen - automatically generate tests from user interactions:

```
┌─────────────────────────────────────────────────────┐
│ 🔴 Recording Agent Interaction...            [Stop] │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │  Agent Interaction Preview                   │   │
│ │                                              │   │
│ │  1. User: "Find laptops under $1000"        │   │
│ │     └─ Detected: Prompt input               │   │
│ │                                              │   │
│ │  2. Agent: Called browser.search()          │   │
│ │     └─ Detected: Tool call                  │   │
│ │                                              │   │
│ │  3. Agent: Called calculator.compare()      │   │
│ │     └─ Detected: Tool call                  │   │
│ │                                              │   │
│ │  4. Agent: Returns JSON with products       │   │
│ │     └─ Detected: JSON output                │   │
│ │                                              │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ Generated Test:                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ ✓ Prompt: "Find laptops under $1000"        │   │
│ │ ✓ Assert: Tool "browser" called             │   │
│ │ ✓ Assert: Tool "calculator" called          │   │
│ │ ✓ Assert: Output type is JSON               │   │
│ │ ✓ Assert: Contains "price"                  │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ [Edit Assertions] [Save as Test] [Replay]           │
└─────────────────────────────────────────────────────┘
```

**Workflow:**
1. **Start recording** → Opens agent playground
2. **Interact with agent** → System watches all I/O
3. **Auto-detect patterns** → Generates assertions
4. **Review & edit** → Refine generated test
5. **Save to canvas** → Adds nodes to visual builder

**Smart Detection:**
- Tool calls → Generates `must_call_tool` assertions
- JSON responses → Adds `output_type: json` assertion
- Repeated patterns → Suggests parameterization
- Error responses → Adds negative test cases

---

### 4. **Visual Model & Provider Marketplace**

Click-to-install providers and models:

```
┌─────────────────────────────────────────────────────┐
│ 🔌 Provider Marketplace                    [Search] │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Installed (3)          Available (12)     Custom    │
│ ─────────────────────────────────────────────────── │
│                                                      │
│ ┌──────────────────┐  ┌──────────────────┐         │
│ │ 🟢 Anthropic     │  │    Bedrock      │         │
│ │ Claude 3.5       │  │    AWS Multi    │         │
│ │ ✓ Installed      │  │    [Install]    │         │
│ │ [Configure]      │  └──────────────────┘         │
│ └──────────────────┘                                │
│                      ┌──────────────────┐         │
│ ┌──────────────────┐ │   HuggingFace   │         │
│ │ 🟢 OpenAI        │ │   Inference     │         │
│ │ GPT-4, GPT-3.5   │ │   [Install]     │         │
│ │ ✓ Installed      │ └──────────────────┘         │
│ │ [Configure]      │                                │
│ └──────────────────┘ ┌──────────────────┐         │
│                      │    Ollama       │         │
│ ┌──────────────────┐ │    Local Models │         │
│ │ 🟢 LangGraph     │ │    [Install]    │         │
│ │ Framework        │ └──────────────────┘         │
│ │ ✓ Installed      │                                │
│ │ [Configure]      │ [+ Add Custom Provider]        │
│ └──────────────────┘                                │
└─────────────────────────────────────────────────────┘
```

**Features:**
- **One-click installation**: Download and configure providers
- **Configuration wizard**: Step-by-step setup
- **API key management**: Secure credential storage
- **Model discovery**: Browse available models
- **Version management**: Update providers
- **Custom providers**: Add your own APIs

**Provider Configuration Flow:**
```
[Install Anthropic]
    ↓
[Enter API Key]
    ↓
[Test Connection] ✓
    ↓
[Select Models: Claude 3.5, Opus, Haiku]
    ↓
[Configure Defaults: temp=0.7, max_tokens=1000]
    ↓
[Complete] → Provider available in canvas
```

---

### 5. **Visual Test Suite Organizer**

Drag-and-drop test management:

```
┌─────────────────────────────────────────────────────┐
│ 📁 Test Suites                          [+ New Suite]│
├─────────────────────────────────────────────────────┤
│                                                      │
│ 🗂️ E-commerce Suite (12 tests)        [▶ Run All]  │
│ ├─ 📂 Product Search (4)                            │
│ │  ├─ ✅ Search laptops                            │
│ │  ├─ ✅ Search with filters                       │
│ │  ├─ ⚠️  Search edge cases                        │
│ │  └─ ❌ Search error handling                     │
│ ├─ 📂 Cart Operations (3)                           │
│ │  ├─ ✅ Add to cart                               │
│ │  ├─ ✅ Update quantity                           │
│ │  └─ ✅ Remove item                               │
│ └─ 📂 Checkout Flow (5)                             │
│    └─ [Drag tests here]                             │
│                                                      │
│ 🗂️ Safety Tests (8 tests)             [▶ Run All]  │
│ ├─ 🛡️ Jailbreak Resistance (3)                     │
│ ├─ 🔒 PII Protection (3)                            │
│ └─ ⚡ Content Filtering (2)                         │
│                                                      │
│ [+ Create New Folder]    [Import Suite]             │
└─────────────────────────────────────────────────────┘
```

**Drag & Drop Actions:**
- Drag tests between folders
- Reorder tests within suites
- Duplicate tests by option+drag
- Multi-select with shift+click
- Bulk operations (run, delete, export)

**Visual Indicators:**
- ✅ Green = All passed
- ⚠️ Yellow = Some assertions failed
- ❌ Red = Test failed
- ⏸️ Gray = Not run yet
- 🔄 Blue = Currently running

---

### 6. **Live Execution Dashboard**

Real-time test execution with visual feedback:

```
┌─────────────────────────────────────────────────────┐
│ 🔴 Running: Product Search Test                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Progress: [████████░░░░░░░░] 55% (6/11 steps)      │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ Execution Trace                              │   │
│ │                                              │   │
│ │ 1. ✅ Model initialized (GPT-4)       120ms  │   │
│ │ 2. ✅ Prompt sent                     89ms   │   │
│ │ 3. ✅ Agent planning                  456ms  │   │
│ │ 4. ✅ Tool call: browser.search()     892ms  │   │
│ │ 5. ✅ Tool call: calculator.compare() 234ms  │   │
│ │ 6. 🔄 Generating response...          ---    │   │
│ │ 7. ⏸️ Validate assertions             ---    │   │
│ │ 8. ⏸️ Check output format             ---    │   │
│ │                                              │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ Live Metrics:                                        │
│ ┌─────────────┬─────────────┬─────────────┐       │
│ │ Tokens Used │  Latency    │  Cost       │       │
│ │    1,247    │  1.89s      │  $0.0042    │       │
│ └─────────────┴─────────────┴─────────────┘       │
│                                                      │
│ [Pause] [Stop] [View Logs]                          │
└─────────────────────────────────────────────────────┘
```

**Real-time Features:**
- **Live progress bar**: Visual test progress
- **Step-by-step trace**: See each action as it happens
- **Streaming logs**: Real-time output
- **Performance metrics**: Live token/latency/cost tracking
- **Expandable steps**: Click to see details
- **Pause/resume**: Debugging control

---

### 7. **Visual Comparison View**

Side-by-side comparison with interactive diff:

```
┌─────────────────────────────────────────────────────┐
│ Compare: Run #123 vs Run #124                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ┌───────────────────┬───────────────────┐          │
│ │ Run #123          │ Run #124          │          │
│ │ GPT-4 (v1.0)      │ GPT-4 (v1.1)      │          │
│ ├───────────────────┼───────────────────┤          │
│ │ Latency: 1.89s    │ Latency: 2.14s    │ 📈 +13% │
│ │ Tokens:  1,247    │ Tokens:  1,389    │ 📈 +11% │
│ │ Cost:    $0.0042  │ Cost:    $0.0048  │ 📈 +14% │
│ │ Tools:   2 calls  │ Tools:   2 calls  │ ✓ Same  │
│ │ Pass:    ✅ 4/4   │ Pass:    ⚠️ 3/4   │ 📉 -25% │
│ └───────────────────┴───────────────────┘          │
│                                                      │
│ Output Diff:                                         │
│ ┌──────────────────────────────────────────────┐   │
│ │ {                                            │   │
│ │   "products": [                              │   │
│ │     {                                        │   │
│ │       "name": "Dell XPS 15",                 │   │
│ │-      "price": 999,              ← Removed   │   │
│ │+      "price": "$999.00",        ← Added     │   │
│ │       "specs": { ... }                       │   │
│ │     }                                        │   │
│ │   ]                                          │   │
│ │ }                                            │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ 🔥 Regression Detected:                             │
│    • Format changed (number → string)               │
│    • Assertion "output_type: json" now fails        │
│                                                      │
│ [View Full Trace] [Export Report]                   │
└─────────────────────────────────────────────────────┘
```

**Interactive Features:**
- **Hover differences**: Highlight changed lines
- **Toggle view**: Unified vs split diff
- **Metric sparklines**: Visual trends
- **Regression indicators**: Automatic detection
- **Click to expand**: Detailed trace inspection
- **Export**: PDF/HTML reports

---

### 8. **Template Gallery**

Pre-built test templates for quick start:

```
┌─────────────────────────────────────────────────────┐
│ 📚 Test Template Gallery                   [Search] │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Popular Templates                    My Templates   │
│                                                      │
│ ┌──────────────────┐  ┌──────────────────┐         │
│ │ Simple Q&A       │  │ Code Generation  │         │
│ │ ⭐⭐⭐⭐⭐       │  │ ⭐⭐⭐⭐☆       │         │
│ │ 1,234 uses       │  │ 892 uses         │         │
│ │ [Use Template]   │  │ [Use Template]   │         │
│ └──────────────────┘  └──────────────────┘         │
│                                                      │
│ ┌──────────────────┐  ┌──────────────────┐         │
│ │ Browser Agent    │  │ Multi-turn Chat  │         │
│ │ ⭐⭐⭐⭐☆       │  │ ⭐⭐⭐⭐⭐       │         │
│ │ 756 uses         │  │ 654 uses         │         │
│ │ [Use Template]   │  │ [Use Template]   │         │
│ └──────────────────┘  └──────────────────┘         │
│                                                      │
│ ┌──────────────────┐  ┌──────────────────┐         │
│ │ Safety Testing   │  │ RAG Agent        │         │
│ │ ⭐⭐⭐⭐☆       │  │ ⭐⭐⭐⭐☆       │         │
│ │ 543 uses         │  │ 432 uses         │         │
│ │ [Use Template]   │  │ [Use Template]   │         │
│ └──────────────────┘  └──────────────────┘         │
│                                                      │
│ [+ Upload Template] [Browse Community]               │
└─────────────────────────────────────────────────────┘
```

**Template Features:**
- **One-click use**: Instantly load template to canvas
- **Customizable**: Edit after loading
- **Community sharing**: Publish your templates
- **Version control**: Track template updates
- **Categories**: Filter by use case
- **Preview**: See before using

---

### 9. **Visual Environment Manager**

Manage test environments visually:

```
┌─────────────────────────────────────────────────────┐
│ 🌍 Environments                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Current: [Production ▼]                             │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ 🟢 Production                                │   │
│ │ ├─ Models                                    │   │
│ │ │  ├─ Primary: GPT-4 (OpenAI)               │   │
│ │ │  └─ Fallback: Claude 3.5 (Anthropic)      │   │
│ │ ├─ API Keys                                  │   │
│ │ │  ├─ OpenAI: ••••••••sk-abc                │   │
│ │ │  └─ Anthropic: ••••••••sk-xyz             │   │
│ │ ├─ Variables                                 │   │
│ │ │  ├─ BASE_URL: https://api.prod.com        │   │
│ │ │  └─ TIMEOUT: 30000                        │   │
│ │ └─ Settings                                  │   │
│ │    ├─ Seed: 42                               │   │
│ │    └─ Retries: 3                             │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ Other Environments:                                  │
│ ○ Staging    ○ Development    ○ Testing             │
│                                                      │
│ [+ New Environment] [Import] [Export]               │
└─────────────────────────────────────────────────────┘
```

**Environment Switching:**
- **Quick switch**: Dropdown to change environment
- **Variable substitution**: Auto-replace in tests
- **Secure secrets**: Encrypted key storage
- **Team sharing**: Share configs (without secrets)
- **Import/export**: Portable configurations

---

### 10. **Collaborative Features**

Team-based testing with visual collaboration:

```
┌─────────────────────────────────────────────────────┐
│ 👥 Team Workspace: AI Safety Team                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Active Now (3):                                      │
│ • 🟢 Alice (editing "jailbreak-test")               │
│ • 🟢 Bob (running "pii-detection-suite")            │
│ • 🟢 Carol (reviewing results)                      │
│                                                      │
│ Recent Activity:                                     │
│ ┌──────────────────────────────────────────────┐   │
│ │ 2m ago - Alice commented on Run #456         │   │
│ │ 5m ago - Bob marked test as "needs review"   │   │
│ │ 12m ago - Carol approved safety suite v2.1   │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ Shared Resources:                                    │
│ • Test Suites (23)                                   │
│ • Templates (12)                                     │
│ • Providers (5)                                      │
│ • Environments (4)                                   │
│                                                      │
│ [Invite Member] [Team Settings] [Permissions]       │
└─────────────────────────────────────────────────────┘
```

**Collaboration Features:**
- **Real-time editing**: See who's working on what
- **Comments**: Discuss tests and results
- **Approvals**: Review workflow for critical tests
- **Permissions**: Role-based access control
- **Activity feed**: Track team changes
- **Notifications**: Stay updated on runs/reviews

---

## Novel Visual Patterns (Research-Inspired)

### 1. **AI-Assisted Test Generation**

Visual prompt → Auto-generate test:

```
┌─────────────────────────────────────────────────────┐
│ ✨ AI Test Generator                                │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Describe what you want to test:                     │
│ ┌──────────────────────────────────────────────┐   │
│ │ Test if the agent can search for products    │   │
│ │ under a budget and return them in JSON       │   │
│ │ format sorted by price                       │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ [Generate Test] ✨                                  │
│                                                      │
│ Generated:                                           │
│ ┌──────────────────────────────────────────────┐   │
│ │ ✅ Nodes created:                            │   │
│ │    • Model: GPT-4                            │   │
│ │    • Prompt: "Find products under $500"      │   │
│ │    • Tools: browser, search                  │   │
│ │    • Assertions:                             │   │
│ │      - Output type: JSON                     │   │
│ │      - Contains: "price", "sorted"           │   │
│ │      - Tool called: "search"                 │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ [Add to Canvas] [Modify] [Regenerate]               │
└─────────────────────────────────────────────────────┘
```

### 2. **Smart Suggestions**

Context-aware recommendations:

```
┌─────────────────────────────────────────────────────┐
│ 💡 Smart Suggestions                                │
├─────────────────────────────────────────────────────┤
│                                                      │
│ We noticed you're testing a browser agent:          │
│                                                      │
│ • Add "max_latency_ms" assertion?                   │
│   Browser operations can be slow. [Add]             │
│                                                      │
│ • Consider adding error handling?                   │
│   Test what happens if browser fails. [Add]         │
│                                                      │
│ • Missing "must_call_tool: browser" assertion       │
│   This ensures browser is actually used. [Add]      │
│                                                      │
│ [Dismiss All] [Configure Suggestions]               │
└─────────────────────────────────────────────────────┘
```

### 3. **Visual Regression Heatmap**

See regressions across test suite at a glance:

```
┌─────────────────────────────────────────────────────┐
│ 🔥 Regression Heatmap (Last 30 Runs)                │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Test Name          │ ████████████████████████████  │
│────────────────────┼───────────────────────────────│
│ Product Search     │ 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢  │
│ Cart Operations    │ 🟢🟢🟡🟢🟢🟢🟡🟢🟢🟢  │
│ Checkout Flow      │ 🟢🟢🟢🔴🔴🔴🔴🔴🔴🔴  │ ⚠️
│ Safety Tests       │ 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢  │
│ Edge Cases         │ 🟡🟡🟢🟡🟢🟢🟢🟢🟡🟢  │
│────────────────────┴───────────────────────────────│
│ Legend: 🟢 Pass  🟡 Partial  🔴 Fail               │
│                                                      │
│ Click on any cell to see details                    │
└─────────────────────────────────────────────────────┘
```

### 4. **Interactive Tool Call Inspector**

Visual representation of agent's tool usage:

```
┌─────────────────────────────────────────────────────┐
│ 🔧 Tool Call Sequence                               │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Step 1: browser.search("laptops under $1000")       │
│ ┌──────────────────────────────────────────────┐   │
│ │ Input:  query="laptops under $1000"          │   │
│ │ Output: [15 results]                         │   │
│ │ Time:   892ms                                │   │
│ │ Status: ✅ Success                           │   │
│ └──────────────────────────────────────────────┘   │
│         ↓                                            │
│ Step 2: calculator.compare(results)                 │
│ ┌──────────────────────────────────────────────┐   │
│ │ Input:  products=[...]                       │   │
│ │ Output: sorted_by_price=[...]                │   │
│ │ Time:   234ms                                │   │
│ │ Status: ✅ Success                           │   │
│ └──────────────────────────────────────────────┘   │
│         ↓                                            │
│ Step 3: formatter.json(data)                        │
│ ┌──────────────────────────────────────────────┐   │
│ │ Input:  data=[...]                           │   │
│ │ Output: {"products": [...]}                  │   │
│ │ Time:   45ms                                 │   │
│ │ Status: ✅ Success                           │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ [Replay] [Edit & Retry] [Export Sequence]           │
└─────────────────────────────────────────────────────┘
```

### 5. **Visual Prompt Flow**

Show how prompts are constructed visually:

```
┌─────────────────────────────────────────────────────┐
│ 📝 Prompt Flow Visualization                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ┌─────────────┐                                     │
│ │ System      │                                     │
│ │ Prompt      │───┐                                │
│ └─────────────┘   │                                │
│                   ↓                                 │
│ ┌─────────────┐   ┌──────────────────┐            │
│ │ Context     │──▶│ Final Prompt     │───▶ Model  │
│ │ Variables   │   │ (Assembled)      │            │
│ └─────────────┘   └──────────────────┘            │
│                   ↑                                 │
│ ┌─────────────┐   │                                │
│ │ User Input  │───┘                                │
│ └─────────────┘                                     │
│                                                      │
│ Click any box to preview content                    │
└─────────────────────────────────────────────────────┘
```

---

## Implementation Architecture

### Tech Stack Updates

**Frontend (Visual UI):**
- **React Flow / Svelte Flow**: Node-based canvas
- **Monaco Editor**: Code editing when needed
- **Recharts**: Data visualization
- **shadcn/ui**: Component library
- **TailwindCSS**: Styling
- **Framer Motion**: Animations

**Backend (Same):**
- Python FastAPI
- PostgreSQL
- Redis
- Temporal.io

**New Services:**
- **Template Service**: Manage test templates
- **Collaboration Service**: Real-time updates (WebSocket)
- **AI Service**: Test generation, suggestions
- **Plugin Registry**: Provider marketplace

### Data Model

**Visual Test Spec (Extended):**
```typescript
interface VisualTestSpec {
  // Core (backward compatible)
  name: string;
  model: string;
  assertions: Assertion[];

  // Visual metadata
  canvas: {
    nodes: Node[];           // Visual nodes
    edges: Edge[];           // Connections
    layout: LayoutConfig;    // Auto-layout settings
    viewport: Viewport;      // Zoom/pan state
  };

  // Collaboration
  authors: User[];
  comments: Comment[];
  approvals: Approval[];

  // Templates
  templateId?: string;
  isTemplate: boolean;

  // Environment
  environment: string;

  // Export
  yaml: string;              // Generated YAML
  version: string;           // Spec version
}
```

### Migration Strategy

**Phase 1: Parallel Track (v0.2.0)**
- Keep existing YAML/CLI working
- Add visual UI as alternative
- YAML ↔ Visual converter
- Both approaches co-exist

**Phase 2: Visual-First (v0.3.0)**
- Visual UI is default
- YAML editing advanced mode
- Import/export for version control
- Most users use visual

**Phase 3: Full Platform (v1.0.0)**
- Collaborative features
- Template marketplace
- AI-assisted generation
- Enterprise features

---

## User Journeys (Visual-First)

### Journey 1: New User Creates First Test

1. **Opens Sentinel** → Sees visual canvas
2. **Clicks "Use Template"** → Selects "Simple Q&A"
3. **Template loads** → Pre-configured nodes appear
4. **Edits prompt node** → Types their question
5. **Clicks "Run"** → Sees live execution
6. **Views results** → Visual pass/fail indicators
7. **Saves test** → Names and adds to suite

**Time to first test: <2 minutes** (vs 10+ minutes with YAML)

### Journey 2: Product Manager Validates Agent

1. **Opens workspace** → Sees team's tests
2. **Clicks "Record Test"** → Starts recording mode
3. **Interacts with agent** → System watches
4. **Reviews generated test** → Edits assertions
5. **Runs test** → Sees visual results
6. **Shares with team** → Comments and assigns review
7. **Gets approval** → Test added to CI/CD

**No code written** - fully visual workflow

### Journey 3: Engineer Debugs Regression

1. **Gets alert** → "Checkout Flow failing"
2. **Opens comparison view** → Run #123 vs #124
3. **Sees visual diff** → Output format changed
4. **Clicks tool trace** → Inspects sequence
5. **Finds issue** → Tool returned different format
6. **Updates assertion** → Drag-drop to fix
7. **Re-runs test** → ✅ Passes

**Visual debugging** - no YAML editing needed

### Journey 4: Researcher Builds Eval Suite

1. **Opens AI Generator** → Describes test needs
2. **AI creates 10 tests** → Review and accept
3. **Organizes in suite** → Drag-drop into folders
4. **Configures environment** → Select models/providers
5. **Runs batch** → Sees heatmap results
6. **Exports report** → Shares with stakeholders

**AI-assisted at scale** - rapid eval creation

---

## Competitive Positioning

### vs Langflow
- ✅ **Testing-first** (not just workflow building)
- ✅ **Assertions & validation** (built-in)
- ✅ **Regression detection** (core feature)
- ✅ **Version comparison** (time-travel)

### vs LangSmith
- ✅ **Visual test builder** (not just monitoring)
- ✅ **Drag-drop UX** (easier for non-engineers)
- ✅ **Template marketplace** (faster onboarding)
- ✅ **On-prem first** (security-focused)

### vs Postman
- ✅ **AI agent specific** (not generic API)
- ✅ **LLM-aware** (tokens, latency, semantics)
- ✅ **Framework integration** (LangGraph, etc.)
- ✅ **Safety testing** (built-in)

### vs Playwright
- ✅ **Agent testing** (not browser automation)
- ✅ **LLM outputs** (semantic assertions)
- ✅ **Provider-agnostic** (multi-model)

**Unique Position**: "Postman for AI Agents" with visual-first UX and research-grade rigor.

---

## Metrics for Success

### Adoption Metrics
- **Time to first test**: <2 minutes (vs 10+ with YAML)
- **Tests created/week**: 10x increase
- **User segments**: Expand beyond engineers to PM/QA
- **Template usage**: 70% of tests start from templates
- **Collaboration**: 3+ users per workspace

### Quality Metrics
- **Test coverage**: 2x more scenarios covered
- **Regression detection**: 90% caught before production
- **False positives**: <5% of assertions
- **Maintenance**: 50% less time updating tests

### Platform Metrics
- **Provider plugins**: 20+ available
- **Community templates**: 1000+ shared
- **API calls**: 100K+ test runs/day
- **Enterprise adoption**: 50+ labs using

---

## Rollout Plan

### Phase 1: Foundation (Q1 2025)
- ✅ Node-based canvas (React Flow)
- ✅ Visual assertion builder
- ✅ Basic provider marketplace
- ✅ Template gallery (10 templates)
- ✅ YAML import/export

### Phase 2: Intelligence (Q2 2025)
- ✅ Record & replay
- ✅ AI test generation
- ✅ Smart suggestions
- ✅ Auto-layout improvements
- ✅ Visual debugging tools

### Phase 3: Collaboration (Q3 2025)
- ✅ Team workspaces
- ✅ Real-time editing
- ✅ Comments & reviews
- ✅ Approval workflows
- ✅ Role-based permissions

### Phase 4: Scale (Q4 2025)
- ✅ Enterprise features
- ✅ Custom plugins
- ✅ Advanced analytics
- ✅ White-label options
- ✅ Migration tools

---

## Backward Compatibility

**YAML remains first-class citizen:**
- Visual UI generates valid YAML
- YAML files can be imported to visual
- CLI still works with YAML
- Git-friendly: Changes show as YAML diffs
- Power users can edit YAML directly

**Migration path:**
```
v0.1.0 (Current)     v0.2.0 (Hybrid)       v1.0.0 (Visual-first)
     │                     │                        │
     ├─ YAML only         ├─ YAML + Visual         ├─ Visual primary
     └─ CLI               ├─ CLI + GUI             ├─ GUI primary
                          └─ Both co-exist         └─ YAML export/import
```

---

## Key Insights from Research

### What We Learned

1. **From Langflow**: Node-based UIs work great for AI workflows
2. **From n8n**: Visual + code hybrid satisfies all users
3. **From Postman**: Collections & workspaces scale well
4. **From Playwright**: Record/replay accelerates adoption
5. **From LangSmith**: Observability must be visual
6. **From React Flow**: Auto-layout is essential
7. **From AI testing papers**: Visual traces aid debugging

### What Users Want

Based on 2024-2025 trends:
- ✅ **Visual-first**: 80% prefer GUI to code
- ✅ **Quick start**: Templates beat blank canvas
- ✅ **Collaboration**: Teams > individuals
- ✅ **AI assistance**: Generation > manual creation
- ✅ **Version control**: Git integration still critical

---

## Conclusion

**The Pivot**: Transform Sentinel from a text-based DSL tool into a **visual-first, drag-and-drop testing platform** that makes AI agent testing accessible to everyone while maintaining the rigor and reproducibility that makes it valuable.

**The Promise**: Anyone can create, run, and understand AI agent tests without writing YAML or learning complex syntax.

**The Path**: Start with visual canvas, add AI assistance, enable collaboration, build marketplace, scale globally.

**The Goal**: Become the **de facto standard** for AI agent testing - "If you're testing agents, you're using Sentinel."

---

## Next Steps

1. **Build MVP**: Node-based canvas + assertion builder
2. **User testing**: Validate with 10 friendly users
3. **Iterate**: Refine UX based on feedback
4. **Launch v0.2.0**: Hybrid YAML/Visual release
5. **Grow**: Templates, marketplace, collaboration
6. **Scale**: Enterprise features, white-label

**Timeline**: 6 months to visual-first v1.0.0

**Investment**: Visual UI requires significant frontend dev, but research shows 5-10x adoption improvement justifies the effort.

---

*This spec represents a fundamental product pivot based on extensive research into visual workflow tools, testing platforms, and AI agent evaluation systems. The visual-first approach addresses the key barrier to adoption (steep learning curve) while maintaining all the technical rigor and determinism that makes Sentinel valuable for frontier AI labs.*
