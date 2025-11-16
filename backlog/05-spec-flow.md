# Visual Node Flow Framework Research & Recommendations

**Status**: Decision Updated - React Flow Recommended
**Date**: 2025-11-16 (Updated)
**Context**: Based on comprehensive framework analysis (see 06-spec-framework.md), migrating from Svelte to React for production-ready canvas library.

---

## Executive Summary

After researching popular visual workflow builders (n8n, Langflow, Postman Flows) and conducting comprehensive framework analysis, **React Flow is the clear choice** for Sentinel's visual canvas.

**Previous Recommendation** (Before Framework Analysis):
- ~~SvelteFlow (alpha, with drag-and-drop issues)~~

**Updated Recommendation** (After Framework Analysis):
- **React Flow** - Production-ready, battle-tested, used by Langflow, OneSignal, and thousands of production apps

**Key Decision Drivers**:
1. ✅ **React Flow is production-ready** (v11, 400k+ weekly downloads)
2. ❌ **SvelteFlow is alpha** (v0.1.28, known bugs, "we assume there are many bugs")
3. ✅ **Visual canvas is core feature** - cannot compromise on stability
4. ✅ **Perfect timing** - only 1,215 LOC, 3-5 day migration
5. ✅ **Ecosystem advantage** - 122:1 job ratio, 100+ UI libraries

**See 06-spec-framework.md for comprehensive framework analysis and migration plan.**

---

## Research Findings: Popular Apps

### 1. **n8n** (Workflow Automation)

**Tech Stack**:
- **Frontend**: Vue.js (Vite.js build)
- **Backend**: Node.js
- **Editor**: Custom canvas-based workflow designer
- **Packages**:
  - `packages/frontend/@n8n/design-system` - Storybook design system with Vue components
  - `packages/frontend/editor-ui` - Vue.js frontend

**Architecture**:
- Canvas-based workflow designer with drag-and-drop nodes
- REST API + WebSocket for real-time updates
- Vue's reactive system for state management
- Vue I18n for internationalization

**Lessons**:
- Custom canvas implementation rather than off-the-shelf library
- Strong separation between design system and editor UI
- Real-time collaboration via WebSocket
- Shows custom implementation is possible BUT requires significant time investment

---

### 2. **Langflow** (AI Workflow Builder) ⭐ **Key Reference**

**Tech Stack**:
- **Frontend**: React + TypeScript
- **Editor**: **React Flow** (xyflow/react-flow) ✅
- **Backend**: Python/FastAPI

**Architecture**:
- React Flow provides the node-based visual editor
- Frontend runs on port 3000 (dev)
- Backend API handles workflow execution
- LangChain concepts (LLMs, Prompts, Chains, Memory) as visual blocks

**Lessons** (Critical for Sentinel):
- ✅ **React Flow is battle-tested** in production AI tools
- ✅ **TypeScript for type safety** in complex node graphs
- ✅ **Visual blocks map 1:1 to underlying concepts** (same pattern we need)
- ✅ **Open-source + production-ready** = proven architecture
- ✅ **AI workflow domain** = directly applicable to Sentinel

**Why This Matters**: Langflow is the CLOSEST comparable app to Sentinel. They chose React Flow for production.

---

### 3. **Postman Flows** (API Workflow Builder)

**Tech Stack**:
- **Frontend**: JavaScript/TypeScript web app
- **Editor**: Custom implementation (specific framework not disclosed)
- **Architecture**: Dataflow programming model

**Key Features**:
- Infinite canvas for block-based API workflows
- FQL (Flow Query Language) for data transformation
- TypeScript for programming logic within nodes
- Inspired by "blocks" concept for visual programming

**Lessons**:
- Infinite canvas pattern for large workflows
- Custom domain-specific language (FQL) for power users
- Blocks concept simplifies mental model

---

### 4. **OneSignal** (12 Billion Messages/Day)

**Tech Stack**:
- **Frontend**: React
- **Editor**: **React Flow** ✅
- **Scale**: 12 billion messages daily

**Quote from OneSignal Team**:
> "We chose **React Flow** after creating an early proof of concept, finding it superior to building something from scratch."

**Lessons**:
- React Flow proven at MASSIVE scale (12B msgs/day)
- Enterprise teams trust React Flow for production
- Building from scratch not worth the time/risk

---

## Framework Decision Summary

**From 06-spec-framework.md Analysis**:

| Factor | React Flow | SvelteFlow |
|--------|-----------|-----------|
| **Production Ready** | ✅ v11 Stable | ❌ v0.1.28 Alpha |
| **Weekly Downloads** | 400,000+ | ~5,000 |
| **Known Issues** | Very few | #4980, #4418 (drag-drop broken) |
| **Production Examples** | Langflow, OneSignal | None known |
| **Official Status** | "Production-ready" | "Alpha, many bugs expected" |

**Verdict**: React Flow is the ONLY viable choice for a production visual canvas app.

---

## Available Libraries for React

### Option 1: **React Flow** (Recommended) ⭐

**Provider**: xyflow (same team as SvelteFlow)
**License**: MIT
**Version**: 11.x (stable)
**Weekly Downloads**: 400,000+
**Website**: https://reactflow.dev

**Production Status**:
- ✅ **Battle-tested** in thousands of production apps
- ✅ **6 years mature** (released 2019)
- ✅ **Used by**: Langflow, OneSignal, Stripe, AWS, Fortune 500s
- ✅ **Enterprise-grade** stability and performance

**Pros**:
- ✅ Production-ready and stable (v11.x)
- ✅ Excellent TypeScript support
- ✅ Comprehensive documentation and examples
- ✅ Active community (Discord, Stack Overflow)
- ✅ Built-in features: drag, zoom, pan, multi-select, edges, minimap
- ✅ Rich plugin ecosystem (controls, auto-layout, background patterns)
- ✅ Performance optimized for 10,000+ nodes
- ✅ **Drag-and-drop WORKS reliably** (official examples, no known bugs)
- ✅ Accessibility features built-in
- ✅ Server-side rendering support
- ✅ Regular updates and long-term support

**Cons**:
- None significant for our use case

**Drag-and-Drop Pattern** (Official):

```tsx
import { useCallback, useRef } from 'react';
import { ReactFlow, useReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

function Canvas() {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/label');

      if (!type) return;

      // Convert screen coordinates to flow coordinates
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: label || type },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  return (
    <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
      <div onDrop={onDrop} onDragOver={onDragOver} style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}
```

**Component Palette** (Drag Source):

```tsx
function ComponentPalette() {
  const nodeTypes = [
    { type: 'input', label: 'Prompt', icon: MessageSquare },
    { type: 'model', label: 'Model', icon: Cpu },
    { type: 'assertion', label: 'Assertion', icon: CheckCircle2 },
    { type: 'tool', label: 'Tool', icon: Wrench },
    { type: 'system', label: 'System', icon: Settings },
  ];

  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="palette">
      {nodeTypes.map((node) => (
        <button
          key={node.type}
          draggable
          onDragStart={(e) => onDragStart(e, node.type, node.label)}
          className="palette-item"
        >
          <node.icon size={14} />
          <span>{node.label}</span>
        </button>
      ))}
    </div>
  );
}
```

**Custom Node Example**:

```tsx
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Cpu, X } from 'lucide-react';

function ModelNode({ data, id }: NodeProps) {
  const [selectedModel, setSelectedModel] = useState(data.model || 'gpt-4');
  const [temperature, setTemperature] = useState(data.temperature || 0.7);

  const updateNodeData = useCallback((updates: any) => {
    // Update node data in store
  }, [id]);

  const deleteNode = useCallback(() => {
    // Delete node from store
  }, [id]);

  return (
    <div className="sentinel-node model-node">
      <button className="node-delete-btn nodrag nopan" onClick={deleteNode}>
        <X size={10} />
      </button>
      <div className="node-header">
        <Cpu size={18} className="node-icon" />
        <span>Model</span>
      </div>
      <div className="node-body">
        <select
          className="nodrag nopan"
          value={selectedModel}
          onChange={(e) => {
            setSelectedModel(e.target.value);
            updateNodeData({ model: e.target.value });
          }}
        >
          <option>gpt-4</option>
          <option>gpt-4-turbo</option>
          <option>claude-3-5-sonnet-20241022</option>
        </select>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={temperature}
          className="nodrag nopan"
          onChange={(e) => {
            setTemperature(parseFloat(e.target.value));
            updateNodeData({ temperature: parseFloat(e.target.value) });
          }}
        />
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
```

**Key Features**:
- ✅ `nodrag` and `nopan` classes prevent interactive elements from triggering node drag
- ✅ `screenToFlowPosition()` handles coordinate conversion automatically
- ✅ `useReactFlow()` hook provides access to React Flow instance
- ✅ TypeScript types for all components and props
- ✅ Simple, clean API with React patterns

**Assessment**: **Recommended choice** for production-ready visual canvas with reliable drag-and-drop.

---

### Option 2: **Rete.js** with React Plugin (Backup)

**Provider**: Rete.js (Open Source)
**License**: MIT
**Version**: 2.1.1 (plugin), last updated 2 months ago
**Website**: https://retejs.org

**Pros**:
- ✅ TypeScript-first framework
- ✅ Framework-agnostic core (supports React, Vue, Angular, Svelte, Lit)
- ✅ Official React plugin (`rete-react-plugin`)
- ✅ Dataflow + control flow support
- ✅ Rich presets: classic visualization, context menu, minimap, reroute
- ✅ Rete Kit for quick setup
- ✅ Mature ecosystem

**Cons**:
- ❌ More complex architecture than React Flow
- ❌ Steeper learning curve
- ❌ Smaller community compared to React Flow
- ❌ Less production usage than React Flow

**Setup**:
```bash
npm i rete rete-react-plugin
```

**Assessment**: Viable alternative if React Flow somehow doesn't meet our needs (unlikely). More complex API.

---

### Option 3: **jsPlumb Toolkit** (Commercial - Not Recommended)

**Provider**: jsPlumb
**License**: Commercial (paid)
**Version**: 6.80.0+
**Website**: https://jsplumbtoolkit.com

**Pros**:
- ✅ Professional support and documentation
- ✅ React support (official integration)
- ✅ Mature, enterprise-grade
- ✅ Built-in drag-and-drop
- ✅ Flowchart builder demos available

**Cons**:
- ❌ **Commercial license required** (not free/open source)
- ❌ Vendor lock-in
- ❌ Overkill for early-stage project
- ❌ Pricing may be prohibitive

**Assessment**: Not recommended for open-source project due to licensing.

---

### Option 4: **Custom Canvas Implementation** (Not Viable)

**Approach**: Build from scratch like n8n

**Pros**:
- ✅ Full control over behavior
- ✅ Optimized for specific use case
- ✅ No external dependencies

**Cons**:
- ❌ **8-12 weeks of development time**
- ❌ Reinventing the wheel
- ❌ Edge cases and bugs to discover
- ❌ Ongoing maintenance burden
- ❌ Missing features (zoom, minimap, auto-layout, accessibility, touch support, etc.)
- ❌ Not viable for startup timeline

**Assessment**: Not recommended. React Flow is battle-tested and free - use it.

---

## Comparison Matrix

| Feature | React Flow | Rete.js | jsPlumb | Custom | SvelteFlow (Old) |
|---------|-----------|---------|---------|--------|------------------|
| **License** | MIT (Free) | MIT (Free) | Commercial | N/A | MIT (Free) |
| **Production Ready** | ✅ Yes | ⚠️ Yes | ✅ Yes | ❌ No | ❌ No (Alpha) |
| **Learning Curve** | Low | Medium | Medium | High | Low |
| **Community** | Massive | Medium | Small | N/A | Growing |
| **Maturity** | 6 years (2019) | Mature | Very Mature | N/A | 1 year (2024) |
| **Weekly Downloads** | 400k+ | ~20k | Unknown | N/A | ~5k |
| **Drag-and-Drop** | ✅ Built-in | ✅ Built-in | ✅ Built-in | ❌ Build it | ⚠️ Broken (#4980, #4418) |
| **TypeScript** | ✅ Excellent | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Good |
| **Minimap** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| **Auto-layout** | ⚠️ Via plugin | ⚠️ Via plugin | ✅ Yes | ❌ No | ❌ No |
| **Accessibility** | ✅ Yes | ⚠️ Partial | ⚠️ Partial | ❌ No | ⚠️ Partial |
| **Cost** | Free | Free | $$$$ | Time (8-12 weeks) | Free |
| **Dev Time** | **3-5 days** | 2-3 weeks | 1-2 weeks | 8-12 weeks | 2-3 days (but buggy) |
| **Production Examples** | Langflow, OneSignal, Stripe | Few | Some | N/A | None known |

**Winner**: **React Flow** (production-ready, massive community, proven at scale)

---

## React Flow Implementation Guide

### Phase 1: Project Setup (Day 1)

**Create React + Vite + Tauri Project**:
```bash
# Use official create-tauri-app
npm create tauri-app@latest

# Select options:
# - Framework: React
# - Language: TypeScript
# - Package manager: npm
```

**Install React Flow**:
```bash
npm install @xyflow/react
```

**Install UI Dependencies**:
```bash
# shadcn/ui (original React version)
npx shadcn-ui@latest init

# Zustand for state management
npm install zustand

# Lucide React icons
npm install lucide-react
```

**Folder Structure**:
```
src/
├── components/
│   ├── nodes/
│   │   ├── InputNode.tsx
│   │   ├── ModelNode.tsx
│   │   ├── AssertionNode.tsx
│   │   ├── ToolNode.tsx
│   │   └── SystemNode.tsx
│   ├── palette/
│   │   └── ComponentPalette.tsx
│   ├── yaml/
│   │   └── YamlPreview.tsx
│   └── ui/
│       └── (shadcn components)
├── stores/
│   └── canvas.ts
├── App.tsx
└── main.tsx
```

---

### Phase 2: Canvas Implementation (Days 2-3)

**State Management (Zustand)**:

```tsx
// stores/canvas.ts
import create from 'zustand';
import { Node, Edge } from '@xyflow/react';

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  addNode: (node: Node) => void;
  updateNode: (id: string, data: any) => void;
  deleteNode: (id: string) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  nodes: [],
  edges: [],
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  updateNode: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    })),
  deleteNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
    })),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
}));
```

**Main Canvas Component**:

```tsx
// App.tsx
import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ComponentPalette } from './components/palette/ComponentPalette';
import { YamlPreview } from './components/yaml/YamlPreview';
import { InputNode } from './components/nodes/InputNode';
import { ModelNode } from './components/nodes/ModelNode';
import { AssertionNode } from './components/nodes/AssertionNode';
import { ToolNode } from './components/nodes/ToolNode';
import { SystemNode } from './components/nodes/SystemNode';
import { useCanvasStore } from './stores/canvas';

const nodeTypes = {
  input: InputNode,
  model: ModelNode,
  assertion: AssertionNode,
  tool: ToolNode,
  system: SystemNode,
};

function CanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const { nodes, edges, addNode, setNodes, setEdges } = useCanvasStore();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/label');

      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: label || type },
      };

      addNode(newNode);
    },
    [screenToFlowPosition, addNode]
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-sentinel-bg">
      {/* Top Bar */}
      <div className="h-12 bg-sentinel-bg-elevated border-b border-sentinel-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-sentinel-primary">Sentinel</h1>
          <span className="text-[0.65rem] text-sentinel-text-muted">Visual Test Builder</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="sentinel-button-primary">Run Test</button>
          <button className="sentinel-button-secondary">Export</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ComponentPalette />

        <div ref={reactFlowWrapper} className="flex-1 relative">
          <div onDrop={onDrop} onDragOver={onDragOver} style={{ width: '100%', height: '100%' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={(changes) => {
                /* handle node changes */
              }}
              onEdgesChange={(changes) => {
                /* handle edge changes */
              }}
              nodeTypes={nodeTypes}
              fitView
            >
              <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
        </div>

        <YamlPreview />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
```

---

### Phase 3: Node Components (Days 3-4)

**Example: Model Node**

```tsx
// components/nodes/ModelNode.tsx
import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Cpu, X } from 'lucide-react';
import { useCanvasStore } from '@/stores/canvas';

export const ModelNode = memo(({ data, id }: NodeProps) => {
  const [selectedModel, setSelectedModel] = useState(data.model || 'gpt-4');
  const [temperature, setTemperature] = useState(data.temperature || 0.7);
  const { updateNode, deleteNode } = useCanvasStore();

  const handleModelChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const model = e.target.value;
      setSelectedModel(model);
      updateNode(id, { model });
    },
    [id, updateNode]
  );

  const handleTemperatureChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const temp = parseFloat(e.target.value);
      setTemperature(temp);
      updateNode(id, { temperature: temp });
    },
    [id, updateNode]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteNode(id);
    },
    [id, deleteNode]
  );

  return (
    <div className="sentinel-node model-node">
      <button className="node-delete-btn nodrag nopan" onClick={handleDelete}>
        <X size={10} />
      </button>
      <div className="node-header">
        <Cpu size={18} className="node-icon" />
        <span>Model</span>
      </div>
      <div className="node-body">
        <div className="space-y-3">
          <div className="nodrag nopan">
            <label className="label">Model</label>
            <select
              value={selectedModel}
              onChange={handleModelChange}
              className="sentinel-input"
            >
              <option value="gpt-4">gpt-4</option>
              <option value="gpt-4-turbo">gpt-4-turbo</option>
              <option value="claude-3-5-sonnet-20241022">claude-3-5-sonnet-20241022</option>
            </select>
          </div>
          <div className="nodrag nopan">
            <label className="label">Temperature: {temperature}</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={handleTemperatureChange}
              className="w-full"
            />
          </div>
        </div>
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

ModelNode.displayName = 'ModelNode';
```

**Key Patterns**:
- ✅ `memo()` for performance optimization
- ✅ `nodrag` and `nopan` classes on interactive elements
- ✅ Zustand store for centralized state
- ✅ TypeScript for type safety
- ✅ Handles for node connections

---

### Phase 4: Component Palette (Day 4)

```tsx
// components/palette/ComponentPalette.tsx
import { MessageSquare, Settings, Cpu, Wrench, CheckCircle2 } from 'lucide-react';

const nodeTypes = [
  {
    category: 'Inputs',
    nodes: [
      { type: 'input', label: 'Prompt', icon: MessageSquare, description: 'User input prompt' },
      { type: 'system', label: 'System', icon: Settings, description: 'System prompt' },
    ],
  },
  {
    category: 'Models',
    nodes: [{ type: 'model', label: 'Model', icon: Cpu, description: 'AI model configuration' }],
  },
  {
    category: 'Tools',
    nodes: [{ type: 'tool', label: 'Tool', icon: Wrench, description: 'Agent tool' }],
  },
  {
    category: 'Assertions',
    nodes: [
      { type: 'assertion', label: 'Assertion', icon: CheckCircle2, description: 'Test assertion' },
    ],
  },
];

export function ComponentPalette() {
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-sentinel-bg-elevated border-r border-sentinel-border flex flex-col">
      <div className="p-4 border-b border-sentinel-border">
        <h2 className="text-sm font-semibold text-sentinel-text">Components</h2>
        <p className="text-xs text-sentinel-text-muted mt-1">Drag & drop to canvas</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {nodeTypes.map((category) => (
          <div key={category.category} className="space-y-2">
            <h3 className="text-xs font-medium text-sentinel-text-muted uppercase tracking-wide px-2">
              {category.category}
            </h3>
            <div className="space-y-1">
              {category.nodes.map((node) => (
                <button
                  key={node.type}
                  draggable
                  onDragStart={(e) => onDragStart(e, node.type, node.label)}
                  className="w-full text-left p-2 bg-sentinel-surface border border-sentinel-border rounded-md hover:bg-sentinel-hover hover:border-sentinel-primary transition-all duration-150 cursor-move"
                >
                  <div className="flex items-center gap-2">
                    <node.icon size={14} className="text-sentinel-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-sentinel-text truncate">
                        {node.label}
                      </div>
                      <div className="text-xs text-sentinel-text-muted truncate">
                        {node.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Phase 5: Testing & Polish (Day 5)

**Success Criteria**:
- ✅ Drag from palette to canvas works 100% of the time
- ✅ Nodes drop at correct mouse position
- ✅ Interactive elements (inputs, selects) don't trigger node drag
- ✅ Node deletion works
- ✅ Edge connections work
- ✅ YAML export works
- ✅ No console errors
- ✅ Tauri build successful

---

## React Flow Advanced Features (Post-Feature 1)

### Auto-Layout with Dagre

```bash
npm install dagre @types/dagre
```

```tsx
import dagre from 'dagre';

function getLayoutedElements(nodes, edges, direction = 'TB') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 250, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: { x: nodeWithPosition.x, y: nodeWithPosition.y },
    };
  });

  return { nodes: layoutedNodes, edges };
}
```

### Keyboard Shortcuts

```tsx
import { useKeyPress } from '@xyflow/react';

function Canvas() {
  useKeyPress(['Delete', 'Backspace'], () => {
    // Delete selected nodes
    const selectedNodeIds = nodes.filter((n) => n.selected).map((n) => n.id);
    selectedNodeIds.forEach(deleteNode);
  });

  useKeyPress('ctrl+c', () => {
    // Copy selected nodes
  });

  useKeyPress('ctrl+v', () => {
    // Paste nodes
  });
}
```

### Connection Validation

```tsx
<ReactFlow
  nodes={nodes}
  edges={edges}
  isValidConnection={(connection) => {
    // Prevent self-connections
    if (connection.source === connection.target) return false;

    // Custom validation logic
    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);

    // Only allow Model → Assertion connections, for example
    if (sourceNode?.type === 'model' && targetNode?.type === 'assertion') {
      return true;
    }

    return false;
  }}
/>
```

---

## Migration from Svelte to React

**Current Codebase**: ~1,215 LOC (9 Svelte components)

**Migration Effort**: 3-5 days (see 06-spec-framework.md for detailed plan)

**Key Changes**:
- Svelte `$state` → React `useState`
- Svelte stores → Zustand
- Svelte `onclick` → React `onClick`
- Svelte `class` → React `className`
- SvelteFlow → React Flow

**Benefit**: Production-ready canvas, stable drag-and-drop, massive ecosystem

---

## Recommendations

### **Primary Recommendation: React Flow**

**Rationale**:
1. ✅ **Production-ready** (v11, 400k+ downloads/week)
2. ✅ **Battle-tested** (Langflow, OneSignal, Stripe, AWS)
3. ✅ **Reliable drag-and-drop** (no known bugs)
4. ✅ **Massive ecosystem** (122:1 job ratio, 100+ UI libraries)
5. ✅ **Excellent documentation** and examples
6. ✅ **TypeScript-first** with comprehensive type definitions
7. ✅ **Long-term support** (6 years mature, active development)

**Action Plan**:
1. Create React + Vite + Tauri project (Day 1)
2. Migrate components from Svelte to React (Days 2-4)
3. Test drag-and-drop and all features (Day 5)
4. Ship Feature 1 with production-ready canvas

**Timeline**: 3-5 days (with AI assistance: 2-3 days)

**See 06-spec-framework.md for complete migration plan and framework analysis.**

---

### **Secondary Recommendation: Rete.js (Backup)**

**Rationale**:
1. ✅ Framework-agnostic (React, Vue, Svelte, Angular)
2. ✅ TypeScript-first architecture
3. ✅ More features than React Flow (dataflow + control flow)
4. ⚠️ Higher complexity, steeper learning curve

**When to Use**: Only if React Flow somehow doesn't meet our needs (very unlikely)

**Migration Effort**: 1-2 weeks

---

### **Not Recommended**

- ❌ **SvelteFlow**: Alpha stage with known bugs (#4980, #4418), not production-ready
- ❌ **jsPlumb Toolkit**: Commercial license conflicts with open-source goals
- ❌ **Custom Canvas**: 8-12 weeks of development time, not viable

---

## Testing Strategy

### Unit Tests (Vitest)
- ✅ Drag data serialization/deserialization
- ✅ Coordinate conversion (screen → flow)
- ✅ Node creation with correct position
- ✅ `nodrag` class behavior
- ✅ State management (Zustand store)

### Integration Tests (React Testing Library)
- ✅ Drag from palette → drop on canvas
- ✅ Interactive elements don't trigger node drag
- ✅ Multi-node selection works
- ✅ Keyboard shortcuts (Delete, Ctrl+C, Ctrl+V)
- ✅ Edge connections

### E2E Tests (Playwright)
- ✅ Full user workflow: drag 5 nodes, connect them, export YAML
- ✅ Cross-browser testing (Chrome, Firefox, Safari)
- ✅ Tauri desktop app testing

---

## Future Considerations

### Collaboration Features (Year 2+)
- Real-time cursor positions (like Figma)
- Collaborative editing (Yjs, Automerge)
- Conflict resolution for concurrent edits

### Performance Optimization (Year 2+)
- Virtual rendering for 1000+ nodes
- Canvas culling (only render visible nodes)
- WebWorker for heavy computations

### Accessibility (Year 1)
- Keyboard-only navigation
- Screen reader support
- High contrast mode

---

## References

### Official Documentation
- **React Flow**: https://reactflow.dev
- **React Flow Examples**: https://reactflow.dev/examples
- **Rete.js**: https://retejs.org
- **jsPlumb**: https://jsplumbtoolkit.com
- **React 19**: https://react.dev
- **Zustand**: https://github.com/pmndrs/zustand

### Production Examples
- **Langflow GitHub**: https://github.com/langflow-ai/langflow
- **React Flow Showcase**: https://reactflow.dev/showcase
- **n8n GitHub**: https://github.com/n8n-io/n8n

### Tutorials
- React Flow Drag and Drop: https://reactflow.dev/examples/interaction/drag-and-drop
- React Flow Custom Nodes: https://reactflow.dev/learn/customization/custom-nodes
- React Flow TypeScript: https://reactflow.dev/learn/advanced-use/typescript

### Community
- React Flow Discord: https://discord.gg/xyflow
- React Discord: https://react.dev/community

---

## Conclusion

**Verdict**: **Migrate to React Flow immediately** (this week)

**Confidence**: Very High (90%)

**Why React Flow Wins**:
1. ✅ **Visual canvas is our CORE feature** - we need production-grade reliability
2. ✅ **React Flow is battle-tested** (6 years, 400k+ downloads/week, used by Langflow/OneSignal)
3. ✅ **SvelteFlow is alpha** with known drag-and-drop bugs - unacceptable for core feature
4. ✅ **Perfect timing** - only 1,215 LOC, migration cost is LOW
5. ✅ **Ecosystem advantage** - 122:1 job ratio, 100+ UI libraries, v0 AI support
6. ✅ **Long-term flexibility** - easier contributions, faster feature development

**Next Steps**:
1. Review 06-spec-framework.md for comprehensive framework analysis
2. Create React + Vite + Tauri project (Day 1)
3. Migrate components to React with React Flow (Days 2-4)
4. Test and ship Feature 1 with production-ready canvas (Day 5)

**The cost of NOT migrating**: Unstable alpha library blocks Feature 1, limited ecosystem slows Features 5-15, hard to find contributors (900 Svelte jobs vs 110k React jobs globally)

**The cost of migrating**: 3-5 days

**The benefit**: Production-ready visual canvas, reliable drag-and-drop, massive ecosystem, long-term viability

---

**Last Updated**: 2025-11-16 (Updated based on 06-spec-framework.md)
**Reviewed By**: Claude Code
**Status**: Updated - React Flow Recommended
**Next Action**: Execute migration plan from 06-spec-framework.md
