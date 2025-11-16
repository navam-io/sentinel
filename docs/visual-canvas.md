# Visual Canvas Guide

**Complete guide to using Sentinel's visual-first test builder**

---

## Overview

The Sentinel Visual Canvas is a drag-and-drop interface for building AI agent tests without writing code. It's designed to make agent testing as intuitive as Postman made API testing.

**Key Features:**
- 🎨 Node-based visual workflow builder
- 🔄 Real-time YAML generation
- 📦 Component palette with organized node types
- ⚡ Live preview panel
- 💾 Export to YAML files
- 🎯 Zero code required

---

## Getting Started

### Installation

**Requirements:**
- Node.js 18+ ([Download](https://nodejs.org/))
- Rust and Tauri CLI ([Installation Guide](https://tauri.app/v1/guides/getting-started/prerequisites))

**Quick Install:**

```bash
# Clone repository
git clone https://github.com/navam-io/sentinel.git
cd sentinel/frontend

# Install dependencies
npm install

# Launch desktop app
npm run tauri:dev
```

The Sentinel desktop app will open with the visual canvas.

---

## Interface Overview

The visual canvas has three main sections:

```
┌─────────────────────────────────────────────────────────┐
│  [Sentinel]  Visual Test Builder        [YAML] [Run]    │
├──────────┬────────────────────────────┬─────────────────┤
│          │                            │                 │
│  Comp.   │      Canvas Area           │  YAML Preview   │
│  Palette │  (Drag & Drop Nodes)       │  (Live Update)  │
│          │                            │                 │
│  📦 Input│     ┌──────────┐          │  name: "Test"   │
│  🤖 Model│     │ Input    │──┐       │  model: "gpt-4" │
│  ✓ Assert│     └──────────┘  │       │  inputs:        │
│          │                    ▼       │    query: "..." │
│          │     ┌──────────┐          │  assertions:    │
│          │     │ Model    │          │    - must_...   │
│          │     └──────────┘          │                 │
└──────────┴────────────────────────────┴─────────────────┘
```

### 1. Component Palette (Left)

**Purpose**: Browse and add node types to your test

**Categories:**
- **Inputs**: Prompt and system message nodes
- **Models**: AI model configuration
- **Tools**: Agent tools (future)
- **Assertions**: Test validation rules

**Usage:**
- **Click** to add a node at a random position
- **Drag** onto canvas to place precisely

### 2. Canvas Area (Center)

**Purpose**: Visual workspace for building test flows

**Features:**
- **Infinite canvas** with zoom/pan
- **Node connections** via drag between connection points
- **Minimap** for navigation (bottom-right)
- **Controls** for zoom in/out (bottom-left)

**Controls:**
- **Mouse wheel**: Zoom in/out
- **Click + drag**: Pan canvas
- **Click node**: Select/edit
- **Drag connection point**: Create edge

### 3. YAML Preview (Right)

**Purpose**: See the generated YAML test spec in real-time

**Features:**
- **Live updates** as you modify the canvas
- **Copy button**: Copy YAML to clipboard
- **Download button**: Export as .yaml file
- **Syntax highlighting** for readability

---

## Node Types

### 💬 Input Node

**Purpose**: Define the user's input prompt

**Configuration:**
- **Query**: The prompt text sent to the AI model
- **Placeholder**: "What is the capital of France?"

**Example:**
```
┌─────────────────────────┐
│ 💬 Input                │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ What is the capital │ │
│ │ of France?          │ │
│ └─────────────────────┘ │
│           ○             │  ← Output connection
└─────────────────────────┘
```

**Generated YAML:**
```yaml
inputs:
  query: "What is the capital of France?"
```

---

### 🤖 Model Node

**Purpose**: Configure the AI model to use

**Configuration:**
- **Model**: Select from dropdown (GPT-4, Claude, etc.)
- **Temperature**: Slider (0.0 - 2.0)

**Available Models:**
- `gpt-4`
- `gpt-4-turbo`
- `gpt-3.5-turbo`
- `claude-3-5-sonnet-20241022`
- `claude-3-opus-20240229`
- `claude-3-sonnet-20240229`

**Example:**
```
┌─────────────────────────┐
│      ○                  │  ← Input connection
│ 🤖 Model                │
├─────────────────────────┤
│ Model: [gpt-4       ▼] │
│ Temperature: 0.7        │
│ ├──────────────────┤    │
│           ○             │  ← Output connection
└─────────────────────────┘
```

**Generated YAML:**
```yaml
model: "gpt-4"
inputs:
  temperature: 0.7
```

---

### ✓ Assertion Node

**Purpose**: Define test validation rules

**Configuration:**
- **Type**: Assertion type dropdown
- **Value**: Expected value

**Assertion Types:**
- `must_contain`: Text must be in output
- `must_not_contain`: Text must NOT be in output
- `regex_match`: Output matches regex pattern
- `output_type`: Validate output format (json, text, code, etc.)
- `max_latency_ms`: Maximum response time

**Example:**
```
┌─────────────────────────┐
│      ○                  │  ← Input connection
│ ✓ Assertion             │
├─────────────────────────┤
│ Type: [must_contain ▼] │
│ Value: [Paris        ] │
└─────────────────────────┘
```

**Generated YAML:**
```yaml
assertions:
  - must_contain: "Paris"
```

---

## Building Your First Test (Tutorial)

Let's build a simple geography quiz test step-by-step.

### Step 1: Add an Input Node

1. **Click** "💬 Prompt" in the Component Palette
2. A new Input node appears on the canvas
3. **Click** the textarea inside the node
4. **Type**: "What is the capital of France?"

### Step 2: Add a Model Node

1. **Click** "🤖 Model" in the palette
2. A Model node appears below the Input
3. **Select** "gpt-4" from the dropdown (if not already selected)
4. **Adjust** temperature slider to 0.7

### Step 3: Connect Input to Model

1. **Hover** over the bottom of the Input node
2. You'll see a small circle (○) - that's the connection point
3. **Click and drag** from Input's bottom circle to Model's top circle
4. An animated edge connects them

### Step 4: Add Assertion Nodes

1. **Click** "✓ Assertion" in the palette **three times**
2. Three Assertion nodes appear

**Configure Assertion 1:**
- Type: `must_contain`
- Value: `Paris`

**Configure Assertion 2:**
- Type: `output_type`
- Value: `text`

**Configure Assertion 3:**
- Type: `max_latency_ms`
- Value: `2000`

### Step 5: Connect Model to Assertions

1. **Drag** from Model's bottom circle to Assertion 1's top circle
2. **Drag** from Model's bottom circle to Assertion 2's top circle
3. **Drag** from Model's bottom circle to Assertion 3's top circle

### Step 6: Check YAML Preview

Look at the right panel - you should see:

```yaml
name: "Test from Canvas"
model: "gpt-4"
inputs:
  query: "What is the capital of France?"
  temperature: 0.7
assertions:
  - must_contain: "Paris"
  - output_type: "text"
  - max_latency_ms: 2000
tags:
  - canvas-generated
```

### Step 7: Export Your Test

1. **Click** the "Download" button in the YAML Preview panel
2. Your test is saved as `test-spec.yaml`

**🎉 Congratulations!** You've built your first visual test!

---

## Advanced Features

### Canvas Controls

**Zoom:**
- **Mouse wheel**: Zoom in/out
- **Controls (bottom-left)**: Click + / - buttons
- **Keyboard**: `Cmd/Ctrl + Mouse wheel`

**Pan:**
- **Click and drag** on empty canvas space
- **Space + drag**: Alternative panning method

**Fit View:**
- **Double-click** empty space to fit all nodes in view

**Minimap:**
- **Click area** in minimap to jump to that location
- **Drag viewport rectangle** to pan

### Node Editing

**Edit Node Data:**
1. Click the node to select it
2. Edit fields directly in the node
3. YAML updates automatically

**Move Nodes:**
- **Click and drag** node header to reposition

**Delete Node:**
- Select node
- Press `Delete` or `Backspace` key
- (Or right-click → Delete - coming soon)

### Connection Management

**Create Connection:**
- Drag from source node's output (○) to target node's input (○)

**Delete Connection:**
- Click the edge to select it
- Press `Delete` key
- (Or right-click → Delete - coming soon)

**Animated Edges:**
- All edges are animated by default
- Shows data flow direction

---

## Keyboard Shortcuts

Coming in v0.3.0:

| Shortcut | Action |
|----------|--------|
| `Space + Drag` | Pan canvas |
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + Shift + Z` | Redo |
| `Delete/Backspace` | Delete selected |
| `Cmd/Ctrl + C` | Copy YAML |
| `Cmd/Ctrl + S` | Save to file |
| `Cmd/Ctrl + A` | Select all nodes |

---

## YAML Export

### Copy to Clipboard

1. **Click** "📋 Copy" in YAML Preview
2. YAML is copied to clipboard
3. Paste into your editor

### Download File

1. **Click** "💾 Download" in YAML Preview
2. File downloads as `test-spec.yaml`
3. Save to your project

### Manual Copy

- **Select all** text in YAML Preview
- **Copy** with Cmd/Ctrl + C
- **Paste** wherever needed

---

## Tips & Best Practices

### 🎯 Organize Your Canvas

- **Group related nodes** close together
- **Use vertical flow** (top to bottom) for clarity
- **Align nodes** horizontally for cleaner look
- **Use minimap** for large test suites

### 🔄 Test as You Build

- **Watch YAML preview** while building
- **Validate structure** in real-time
- **Iterate quickly** with visual feedback

### 💡 Start Simple

- **Begin with 3 nodes**: Input → Model → Assertion
- **Add complexity** gradually
- **Test each addition** before moving on

### 📦 Use Multiple Assertions

- **Add several** assertion nodes per test
- **Cover different aspects**: content, format, performance
- **Be specific** with assertion values

### 🎨 Leverage Color Coding

- **Blue border**: Input nodes
- **Purple border**: Model nodes
- **Green border**: Assertion nodes
- **Visual cues** help identify node types quickly

---

## Common Workflows

### Creating a Q&A Test

```
Input (Query)
    ↓
Model (GPT-4)
    ↓
Assertions
  ├─ must_contain: "expected answer"
  ├─ output_type: "text"
  └─ max_latency_ms: 2000
```

### Testing Code Generation

```
Input (Code request)
    ↓
Model (Claude)
    ↓
Assertions
  ├─ must_contain: "def"
  ├─ regex_match: "def\\s+\\w+\\("
  ├─ output_type: "code"
  └─ max_latency_ms: 5000
```

### Multi-Model Comparison (Future)

```
Input (Query)
    ├─ Model (GPT-4)     ─→ Assertions
    ├─ Model (Claude)    ─→ Assertions
    └─ Model (Llama)     ─→ Assertions
```

---

## Troubleshooting

### Canvas Not Loading

**Issue**: Blank canvas or loading spinner

**Solutions:**
- Refresh the app (Cmd/Ctrl + R)
- Check console for errors (Cmd/Ctrl + Shift + I)
- Restart Tauri app

### Nodes Not Connecting

**Issue**: Edges won't create between nodes

**Solutions:**
- Ensure you're dragging from output (○) to input (○)
- Check node compatibility (Input → Model, Model → Assertion)
- Zoom in for better precision

### YAML Not Updating

**Issue**: YAML preview doesn't reflect changes

**Solutions:**
- Click outside the node to confirm edits
- Refresh the app
- Check browser console for errors

### App Performance Issues

**Issue**: Slow with many nodes

**Solutions:**
- Limit to ~50 nodes per canvas
- Use multiple test files for complex suites
- Close YAML preview if not needed

---

## What's Next?

### Coming in v0.3.0 (Q1 2026)

- **YAML Import**: Load existing YAML files onto canvas
- **Monaco Editor**: Edit YAML directly with syntax highlighting
- **Bidirectional Sync**: Changes in YAML reflect on canvas
- **Split View**: Side-by-side canvas and code editor
- **Undo/Redo**: Full history management

### Future Features

- **More Node Types**: Tools, Frameworks, Outputs
- **Auto-Layout**: Automatic node positioning
- **Templates**: Pre-built test patterns
- **Collaboration**: Real-time multi-user editing
- **Test Execution**: Run tests directly from canvas
- **Live Results**: See pass/fail on canvas

---

## Feedback & Support

We'd love to hear from you!

**Found a bug?**
- [Report on GitHub Issues](https://github.com/navam-io/sentinel/issues)

**Have a feature idea?**
- [Start a Discussion](https://github.com/navam-io/sentinel/discussions)

**Need help?**
- Read the [Full Documentation](README.md)
- Check [Examples](examples.md)
- Ask in [Discussions](https://github.com/navam-io/sentinel/discussions)

---

**Built with ❤️ by the Navam Team**

[← Back to Documentation](README.md)
