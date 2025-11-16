# Release Notes: v0.2.0 - Visual Canvas Foundation

**Release Date**: November 15, 2025
**Release Type**: Minor (0.1.0 → 0.2.0)
**Status**: Completed ✅

---

## Overview

This release introduces the **Visual Canvas Foundation** - the core visual-first interface for Sentinel. Users can now build AI agent tests through an intuitive drag-and-drop canvas interface, marking a major milestone in making AI agent testing accessible to non-technical users.

**Core Philosophy**: "Point, Click, Test" - Make AI agent testing as intuitive as Postman made API testing.

---

## What's New

### 🎨 Visual Test Canvas (Feature 1)

A complete visual-first interface built with modern web technologies:

#### Desktop Application
- **Tauri 2.0 Desktop App**: Native desktop application for macOS, Windows, and Linux
- **SvelteKit 2.0 Frontend**: Modern, reactive web framework with TypeScript
- **Native Performance**: Fast, lightweight desktop app with system-level integration

#### Node-Based Test Builder
- **@xyflow/svelte Integration**: Professional node-based canvas with infinite zoom/pan
- **Drag-and-Drop Interface**: Intuitive component palette with draggable nodes
- **Real-time YAML Generation**: Live preview of YAML test spec as you build
- **3 Core Node Types**:
  - 💬 **Input Node**: Define user prompts and queries
  - 🤖 **Model Node**: Configure AI models (GPT-4, Claude, etc.) with temperature settings
  - ✓ **Assertion Node**: Create test assertions visually

#### Component Palette
- **Left Sidebar**: Organized component categories (Inputs, Models, Tools, Assertions)
- **One-Click Add**: Click or drag-and-drop to add nodes to canvas
- **Visual Feedback**: Hover states and smooth transitions
- **Categorized Components**: Easy discovery of available node types

#### YAML Preview Panel
- **Right Sidebar**: Live YAML preview with syntax highlighting
- **Real-Time Sync**: Updates automatically as canvas changes
- **Copy to Clipboard**: One-click copy of generated YAML
- **Download YAML**: Export test specs to .yaml files
- **Bidirectional**: Ready for future YAML → Visual import

#### Design System Implementation
- **Sentinel Color Palette**:
  - Primary: Signal Blue (#6EE3F6)
  - Secondary: AI Purple (#9B8CFF)
  - Semantic: Success, Error, Warning, Info colors
  - Dark theme optimized for long sessions
- **TailwindCSS 4.0**: Modern utility-first styling
- **Custom Tailwind Theme**: Pre-configured Sentinel design tokens
- **Typography**: Inter font for UI, JetBrains Mono for code
- **Responsive**: Adapts to different screen sizes

#### DSL Generator (Visual → YAML)
- **Full Schema Support**: Generates valid YAML matching backend schema
- **Smart Detection**: Extracts configuration from node data
- **Clean Output**: Properly formatted, human-readable YAML
- **Zero Data Loss**: Round-trip ready (YAML ↔ Visual)

---

## Technical Details

### Frontend Stack
```
- Tauri 2.0 (Rust backend for desktop app)
- SvelteKit 2.0 (Web framework)
- TypeScript 5.9 (Type safety)
- @xyflow/svelte 1.4 (Canvas engine)
- TailwindCSS 4.0 (Styling)
- Vite 7.1 (Build tool)
```

### New Files & Directories
```
frontend/                          # SvelteKit application
├── src/
│   ├── app.css                   # Global styles with Sentinel theme
│   ├── lib/
│   │   ├── components/
│   │   │   ├── palette/
│   │   │   │   └── ComponentPalette.svelte
│   │   │   ├── yaml/
│   │   │   │   └── YamlPreview.svelte
│   │   │   └── nodes/
│   │   │       ├── InputNode.svelte
│   │   │       ├── ModelNode.svelte
│   │   │       └── AssertionNode.svelte
│   │   ├── stores/
│   │   │   └── canvas.ts          # Svelte stores for state
│   │   └── dsl/
│   │       └── generator.ts        # YAML generator
│   └── routes/
│       ├── +layout.svelte          # Root layout
│       └── +page.svelte            # Main canvas page
├── tailwind.config.js              # Sentinel design tokens
├── package.json                    # Dependencies
└── vite.config.ts

src-tauri/                          # Tauri Rust backend
├── src/
│   ├── main.rs                     # App entry point
│   └── build.rs                    # Build script
├── Cargo.toml                      # Rust dependencies
├── tauri.conf.json                 # App configuration
└── icons/                          # App icons
```

### Key Dependencies Added
```json
{
  "dependencies": {
    "@xyflow/svelte": "^1.4.2",
    "@tauri-apps/api": "^2.9.0",
    "@tauri-apps/plugin-clipboard-manager": "^2.3.2",
    "yaml": "^2.8.1"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.0.0-rc.18",
    "@tailwindcss/postcss": "^4.1.17",
    "tailwindcss": "^4.1.17",
    "@sveltejs/kit": "^2.47.1",
    "svelte": "^5.41.0",
    "vite": "^7.1.10"
  }
}
```

---

## Success Criteria ✅

All success criteria from Feature 1 specification met:

- ✅ Desktop app infrastructure set up (Tauri 2.0)
- ✅ Can drag nodes onto canvas
- ✅ Can connect nodes with edges
- ✅ Canvas generates valid YAML test spec
- ✅ YAML updates in real-time as canvas changes
- ✅ Can export YAML to file
- ✅ App follows Sentinel design system (colors, typography, spacing)
- ✅ TypeScript compilation succeeds with 0 errors
- ✅ All 70 backend tests pass (98% coverage maintained)

---

## Testing & Quality

### Backend Tests
- **70 tests passing** (100% pass rate)
- **98% code coverage** maintained
- **No regressions** introduced

### Frontend Type Safety
- **0 TypeScript errors**
- **4 minor a11y warnings** (form labels - acceptable for v0.2.0)
- **Full type coverage** for Svelte components

---

## Breaking Changes

**None**. This release is fully backward compatible with v0.1.0 backend DSL.

---

## Known Limitations

### Not Yet Implemented (Planned for Future Releases)
- YAML → Visual import (parser exists, UI integration pending)
- Tauri file dialogs for save/load
- Additional node types (Tools, System prompts)
- Canvas auto-layout algorithm
- Undo/redo functionality
- Keyboard shortcuts
- Desktop app packaging/distribution
- Multi-tab support

---

## Migration Guide

### From v0.1.0

**No migration required**. The frontend is a new addition and does not affect existing YAML files or backend functionality.

### New Commands

```bash
# Frontend development
cd frontend
npm run dev               # Start SvelteKit dev server
npm run build             # Build for production
npm run check             # TypeScript type checking

# Tauri desktop app
npm run tauri:dev         # Run desktop app in dev mode
npm run tauri:build       # Build desktop app
```

---

## File Structure Changes

### New Directories
- `frontend/` - Complete SvelteKit application
- `src-tauri/` - Tauri Rust backend
- `src-tauri/icons/` - Desktop app icons

### Updated Files
- `backend/__init__.py` - Version bumped to 0.2.0
- `backlog/active.md` - Feature 1 marked complete

---

## Next Steps (v0.3.0)

**Feature 2: DSL Parser & Visual Importer**
- YAML → Canvas import functionality
- Monaco Editor integration for direct YAML editing
- Bidirectional sync (Canvas ↔ YAML)
- Split view mode

**Feature 3: Model Provider Architecture & Execution**
- Anthropic and OpenAI provider implementations
- Local test execution from canvas
- Live execution dashboard
- Result storage (SQLite/PostgreSQL)

---

## Contributors

- Navam Team
- Claude Code (AI Assistant)

---

## Resources

### Documentation
- [Getting Started](../docs/getting-started.md)
- [DSL Reference](../docs/dsl-reference.md)
- [Design System](spec-03.md)
- [Visual UI Spec](spec-04.md)

### Code
- [Frontend Source](../frontend/src/)
- [Tauri Backend](../src-tauri/)
- [Component Library](../frontend/src/lib/components/)

---

**Release Completed**: November 15, 2025
**Semver**: 0.1.0 → 0.2.0 (minor)
**Type**: Feature Addition (Visual Canvas Foundation)
