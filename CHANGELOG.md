# Changelog

All notable changes to Sentinel will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.22.0] - 2025-11-23

### Added

#### Library Tab & Category System
- **Unified Library Tab**: Combined templates and user tests in a single browsable interface with search and filters
- **12-Category Classification System**: Tests can now be categorized as:
  - Q&A (blue)
  - Code Generation (purple)
  - Browser Agents (green)
  - Multi-turn (orange)
  - LangGraph (cyan)
  - Safety (red)
  - Data Analysis (indigo)
  - Reasoning (pink)
  - Tool Use (yellow)
  - API Testing (teal)
  - UI Testing (lime)
  - Regression (amber)
- **Category Management**: Dropdown selectors in both Test and Library tabs for assigning categories
- **10 New Templates**: Production-ready templates across all categories
  - API Testing Template (REST endpoint testing)
  - Data Analysis Template (data processing tasks)
  - JSON Generation Template (structured output validation)
  - LangGraph Workflow Template (agentic workflows with state)
  - Multi-Agent Template (conversation scenarios)
  - Prompt Injection Test (safety and security testing)
  - Reasoning Template (logic and problem-solving)
  - Regression Template (consistency testing)
  - Tool Use Template (function calling)
  - UI Testing Template (visual and interaction testing)

#### UI Components
- **LibraryCard Component**: Refined card UI distinguishing templates (✨ Sparkles icon) from user tests (👤 User icon)
- **Library Component**: Unified view with:
  - Search functionality
  - Type filters (All / Templates / My Tests)
  - Category filters (all 12 categories)
  - Consistent action toolbar
- **TestTab Component**: Integrated YAML editor with collapsible run section
- **Category Configuration**: Centralized system with labels, colors, and descriptions

#### State Persistence
- **Run Details State**: User preference for expanded/collapsed state saved to localStorage
- **Default Collapsed**: Run Details section starts minimized for cleaner interface
- **Saved Test Info**: Test name and description persisted in Zustand store across tab switches
- **Suite Expansion**: Folder expansion state maintained across all actions and app reloads

### Changed

#### Tab Restructure
- **"YAML" → "Test"**: Now includes integrated run section below YAML editor
- **"Tests" → "Suite"**: Focused on test suite organization (MyTests section removed)
- **"Templates" → "Library"**: Unified view combining templates and user tests
- **Removed "Run" Tab**: Functionality integrated into Test tab as collapsible section

#### UI Improvements
- **LibraryCard Layout**:
  - Icon prefix for title (Sparkles/User)
  - Category pill moved to bottom-right corner
  - Toolbar buttons left-aligned in order: Load (👁), Add to Suite ([+▼]), Rename (✎), Delete (🗑)
- **Execution Panel**: Removed redundant "Test Execution" title and duplicate test info block
- **Test Tab Layout**:
  - YAML editor at top (resizes when run section expands)
  - Collapsible run section at bottom (smooth height transitions)
  - Both sections independently scrollable
  - Custom scrollbar (only visible during scroll)

### Fixed
- Test name and description no longer disappear when switching tabs
- Suite folders maintain expansion state across all actions and app reloads
- YAML tab always displays test info (auto-generated if not saved)
- Run tab shows which test will execute before running

### Backend

#### Database Schema
- Added `category` field to `TestDefinition` model (nullable string, indexed)
- Added `is_template` boolean field to distinguish templates from user tests
- Updated `to_dict()` serialization to include new fields

#### API Endpoints
- Updated `POST /api/tests/create`:
  - Added `category` parameter (optional)
  - Added `is_template` parameter (default: false)
- Updated `PUT /api/tests/{test_id}`:
  - Added `category` parameter (optional)
  - Added `is_template` parameter (optional)
- Updated `TestResponse` model to include `category` and `is_template`
- Added `renameTest()` convenience function to API client
- Updated `updateTest()` to support category changes

#### Repository Methods
- Enhanced `create()` method with `category` and `is_template` parameters
- Enhanced `update()` method with `category` and `is_template` parameters
- Database migration support for new schema fields

### Technical Details
- **New Files**: 10 templates + 8 TypeScript components (1,622+ LOC added)
- **Modified Files**: 16 TypeScript files + 8 Python files (231 LOC modified)
- **Type Definitions**: Added `TestCategory` type union and configuration system
- **Code Quality**:
  - 0 TypeScript errors
  - All ESLint checks passing
  - Black, Ruff, MyPy compliance maintained
- **Commit**: d128ed7
- **Components Added**:
  - `Library.tsx` (unified template/test browser)
  - `LibraryCard.tsx` (refined card UI)
  - `TestTab.tsx` (YAML + run integration)
  - `categoryConfig.ts` (category system)
  - Barrel exports for organization

### Migration Notes
- No breaking changes to existing test definitions
- Existing tests will show as "Uncategorized" until category is assigned
- All templates automatically marked with `is_template: true`
- Database will auto-migrate with new columns (nullable/defaulted)

---

## [0.3.1] - 2025-11-16

### Changed
- **UX Improvement**: Simplified interaction model from drag-and-drop to click-to-add
- **Component Palette**: Updated UI text to "Click to add to canvas" for clarity
- **Cursor Styling**: Changed from `cursor-move` to `cursor-pointer` for better UX

### Added
- **Production Testing**: Vitest 4.0 + React Testing Library integration
- **Comprehensive Tests**: 12 frontend tests covering all functionality (100% pass rate)
- **Test Categories**: Drag-drop prevention, click-to-add functionality, UI rendering
- **Smart Positioning**: Auto-increment y-position for newly added nodes to avoid overlap

### Removed
- **Drag-and-Drop**: Removed drag-and-drop functionality from component palette
- **Unused Code**: Cleaned up drag handlers and unused imports

### Fixed
- Removed unused imports (`useRef`, `addNode` in Canvas.tsx)
- Improved code maintainability by removing complex drag-drop logic

### Technical Details
- Updated `ComponentPalette.tsx` to remove drag handlers
- Updated `Canvas.tsx` to remove drop zone handling
- Added test infrastructure with Vitest configuration
- Created `ComponentPalette.test.tsx` with 12 comprehensive tests

**Full Details**: [backlog/release-0.3.1.md](backlog/release-0.3.1.md)

---

## [0.3.0] - 2025-11-16

### Changed
- **Framework Migration**: Migrated from Svelte + SvelteFlow to React 19 + React Flow 12.3
- **Production Stability**: Switched to production-ready React Flow (400k+ weekly downloads)
- **Architecture**: Complete rewrite of frontend in React with TypeScript

### Added
- **React 19**: Modern React with latest features
- **React Flow 12.3**: Production-ready node-based canvas
- **5 Node Types**: Input, Model, Assertion, Tool, System (migrated from Svelte)
- **Visual → YAML Generator**: Real-time YAML generation as you build
- **YAML Preview**: Copy/download functionality for generated YAML
- **Zustand 5.0**: Lightweight state management
- **Type Safety**: 0 TypeScript errors across entire codebase

### Migration Rationale
- SvelteFlow was alpha (v0.1.28) with known drag-and-drop bugs
- React Flow is battle-tested and production-ready
- Better ecosystem support (100+ React libraries vs 10-15 for Svelte)
- shadcn/ui compatibility for future UI development
- v0.dev integration for AI-assisted development

### Technical Details
- Migrated ~1,500 LOC in 2-3 hours
- All functionality preserved and improved
- Drag-and-drop works 100% reliably
- Clean TypeScript compilation
- Production build successful

**Full Details**: [backlog/06-spec-framework.md](backlog/06-spec-framework.md)

---

## [0.2.0] - 2025-11-15

### Added
- **Visual Canvas Foundation**: Complete visual-first interface for building tests
- **Tauri 2.0 Desktop App**: Native desktop application powered by Rust
- **SvelteKit 2.0**: Frontend framework (later migrated to React in v0.3.0)
- **@xyflow/svelte Canvas**: Node-based visual test builder (later migrated to React Flow)
- **Component Palette**: Organized drag-and-drop interface
- **3 Node Types**: Input, Model, Assertion (expanded to 5 in v0.3.0)
- **Visual → YAML Generation**: Real-time YAML generation from canvas
- **YAML Preview Panel**: Live preview with export capabilities
- **Sentinel Design System**: TailwindCSS 4.0-based design system
- **Type Safety**: 0 TypeScript errors, full type coverage

### Technical Details
- Tauri 2.0 desktop app infrastructure
- SvelteKit 2.0 + TypeScript
- @xyflow/svelte for canvas (alpha version)
- TailwindCSS 4.0 with custom Sentinel theme
- Component-based architecture

**Full Details**: [backlog/release-0.2.0.md](backlog/release-0.2.0.md)

---

## [0.1.0] - 2025-11-15

### Added
- **DSL Foundation**: Complete YAML/JSON-based test specification language
- **Pydantic Schema**: Type-safe schema for TestSpec, TestSuite, InputSpec
- **YAML/JSON Parser**: Parse and validate test specifications
- **8 Assertion Types**:
  - `must_contain` / `must_not_contain` - Text matching
  - `regex_match` - Pattern matching
  - `must_call_tool` - Tool invocation verification
  - `output_type` - Format validation (json, text, markdown, code, structured)
  - `max_latency_ms` - Performance thresholds
  - `min_tokens` / `max_tokens` - Token count validation
- **6 Example Templates**: Production-ready test templates
  - Simple Q&A
  - Code generation
  - Browser agent
  - Multi-turn conversation
  - LangGraph agent
  - Test suite
- **Python API**: Programmatic access to parser and schema
- **Comprehensive Testing**: 70 tests, 98% coverage
- **Complete Documentation**: 8 comprehensive guides
  - Getting Started
  - DSL Reference
  - API Reference
  - Schema Reference
  - Examples
  - Best Practices
  - Migration Guide
  - Visual Canvas Guide (added in v0.2.0)

### Technical Details
- Pydantic v2 for schema validation
- PyYAML for YAML parsing
- pytest + pytest-cov for testing
- Type-safe validation with clear error messages
- Round-trip conversion (YAML ↔ JSON)

**Full Details**: [backlog/release-0.1.0.md](backlog/release-0.1.0.md)

---

## Version History Summary

| Version | Release Date | Type | Key Features |
|---------|--------------|------|--------------|
| **0.22.0** | 2025-11-23 | Minor | Unified Library + 12-category system + Tab restructure |
| **0.3.1** | 2025-11-16 | Patch | Click-to-add UX + Production tests |
| **0.3.0** | 2025-11-16 | Minor | React migration (Svelte → React) |
| **0.2.0** | 2025-11-15 | Minor | Visual Canvas Foundation (Svelte) |
| **0.1.0** | 2025-11-15 | Minor | DSL Foundation (Python/Pydantic) |

---

## Upcoming Releases

### [0.4.0] - Q1 2026 (Planned)
- YAML → Canvas import (visual importer)
- Monaco editor integration
- Bidirectional sync (Canvas ↔ YAML)
- Split view mode
- Advanced YAML editing with syntax highlighting

### [0.5.0] - Q1-Q2 2026 (Planned)
- Anthropic + OpenAI provider integration
- Local test execution from canvas
- Live execution dashboard
- Result storage (SQLite/PostgreSQL)
- Metrics collection & visualization

### [0.6.0+] - 2026 (Planned)
- Record & replay test generation (v0.6.0)
- Visual assertion builder (v0.7.0)
- Regression detection & comparison (v0.8.0)
- LangGraph framework support (v0.9.0)
- AI-assisted test creation (v0.10.0)
- Collaborative workspaces (v0.11.0)
- Additional model providers: Bedrock, HuggingFace, Ollama (v0.12.0)
- CI/CD integration (v0.15.0)

**Full Roadmap**: [backlog/active.md](backlog/active.md)

---

## Links

- **Documentation**: [docs/README.md](docs/README.md)
- **Release Notes**: [backlog/](backlog/)
- **GitHub Releases**: https://github.com/navam-io/sentinel/releases
- **Issue Tracker**: https://github.com/navam-io/sentinel/issues

---

**Built with ❤️ by the Navam Team**
