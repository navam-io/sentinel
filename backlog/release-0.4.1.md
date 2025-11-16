# Release Notes: v0.4.1 - Bug Fixes & UI Improvements

**Release Date**: November 16, 2025
**Release Type**: Patch (0.4.0 → 0.4.1)
**Status**: Completed ✅

---

## Overview

This patch release fixes two critical issues found in v0.4.0:
1. **System and Tool nodes not updating YAML** (High priority bug)
2. **Emoji icon inconsistency in YAML preview panel** (Medium priority UX issue)

Both issues are now fully resolved with comprehensive tests.

---

## 🐛 Bug Fixes

### Issue #2: System and Tool Nodes Don't Update YAML ✅

**Problem**: When adding System or Tool nodes to the canvas via the Component Palette, the YAML preview panel did not update to reflect these changes.

**Root Cause**: The `handleAddNode` function in `ComponentPalette.tsx` only initialized nodes with `{ label }`, missing all other required fields.

**Fix**:
- Updated `ComponentPalette.tsx` to properly initialize node data for all node types
- System nodes now include: `description`, `timeout_ms`, `framework`
- Tool nodes now include: `toolName`, `toolDescription`, `toolParameters`
- Input nodes now include: `query`, `system_prompt`, `context`
- Model nodes now include: `model`, `provider`, `temperature`, `max_tokens`
- Assertion nodes now include: `assertionType`, `assertionValue`

**Default Values**:
```typescript
// System node defaults
{
  description: 'System configuration',
  timeout_ms: 30000,
  framework: 'langgraph'
}

// Tool node defaults
{
  toolName: 'tool_name',
  toolDescription: '',
  toolParameters: null
}

// Model node defaults
{
  model: 'gpt-4',
  provider: 'openai',
  temperature: 0.7,
  max_tokens: 1000
}

// Input node defaults
{
  query: 'Enter your query here',
  system_prompt: '',
  context: {}
}
```

**Testing**:
- ✅ Added 4 new tests for System and Tool node YAML generation
- ✅ Updated existing tests to expect full data structures
- ✅ All 31 tests passing (was 27 tests)
- ✅ Real-time sync works correctly
- ✅ Round-trip conversion preserves all data

---

### Issue #1: YAML Preview Panel Icon Inconsistency ✅

**Problem**: The YAML preview panel buttons used emoji icons (📥, ✏️, 📋, 💾, ✓, ✕) which were inconsistent with the rest of the application using lucide-react icons.

**Fix**:
Replaced all emoji icons with lucide-react icons for visual consistency:

| Button | Old Icon | New Icon | Lucide Icon |
|--------|----------|----------|-------------|
| Import | 📥 | ↓ | `Upload` |
| Edit | ✏️ | ✎ | `Edit3` |
| Copy | 📋 | ⎘ | `Copy` |
| Save | 💾 | ↓ | `Download` |
| Apply | ✓ | ✓ | `Check` |
| Cancel | ✕ | ✕ | `X` |

**Improvements**:
- ✅ Consistent icon sizing (12px with strokeWidth 2)
- ✅ Proper flexbox layout (`flex items-center gap-1`)
- ✅ Improved accessibility with `aria-label` attributes on all buttons
- ✅ Icons match Component Palette and rest of app
- ✅ All existing functionality preserved

---

## 📝 Technical Details

### Files Modified

```
frontend/src/components/palette/ComponentPalette.tsx
- Added switch statement to initialize node data based on type
- Proper default values for all 5 node types
- ~50 lines added

frontend/src/components/yaml/YamlPreview.tsx
- Replaced emoji icons with lucide-react icons
- Added proper icon imports (Upload, Edit3, Copy, Download, Check, X)
- Added aria-labels for accessibility
- Improved button layout with flexbox

frontend/src/lib/dsl/generator.test.ts
- Added 4 new tests for System and Tool node generation
- Test default values from ComponentPalette
- Test multiple tool nodes
- Test tool nodes with descriptions

frontend/src/components/palette/ComponentPalette.test.tsx
- Updated 3 tests to expect full data structures
- Changed from shallow { label } checks to objectContaining checks
```

### Version Updates
```
frontend/package.json: 0.4.0 → 0.4.1
frontend/src-tauri/Cargo.toml: 0.4.0 → 0.4.1
```

---

## ✅ Success Criteria

All success criteria met:

### Issue #2 (System/Tool Nodes)
- ✅ System nodes update YAML with all fields (description, timeout_ms, framework)
- ✅ Tool nodes update YAML with tools array
- ✅ Real-time sync works (canvas changes → YAML updates)
- ✅ Round-trip conversion works (YAML → Canvas → YAML)
- ✅ All 31 tests passing (was 27, added 4 new tests)
- ✅ New tests added for System and Tool node generation

### Issue #1 (Icon Consistency)
- ✅ All emoji icons replaced with lucide-react Heroicons
- ✅ Icon sizing consistent (12px with strokeWidth 2)
- ✅ Button styling matches rest of app
- ✅ Hover states work correctly
- ✅ Accessibility improved with aria-labels
- ✅ All existing functionality preserved

---

## 🧪 Testing & Quality

### Test Results
```
✓ 31 total tests passing (100% pass rate)
  ✓ 19 DSL generator tests (15 existing + 4 new)
  ✓ 12 ComponentPalette tests (9 existing + 3 updated)

✓ 0 TypeScript errors
✓ Production build successful
✓ Bundle: 501.54 kB (gzip: 158.36 kB)
```

### Code Quality
- **Type Safety**: Full TypeScript coverage maintained
- **Test Coverage**: Increased from 27 to 31 tests
- **Build**: Clean production build with no warnings (except chunk size advisory)
- **Accessibility**: Improved with proper aria-labels

---

## 🔄 Breaking Changes

**None**. This release is fully backward compatible with v0.4.0.

---

## 📊 Impact

### Issue #2 Impact
- **Severity**: High - Core feature was broken
- **Users Affected**: All users trying to use System or Tool nodes
- **Resolution**: Fully fixed, all node types now work correctly

### Issue #1 Impact
- **Severity**: Medium - Visual inconsistency
- **Users Affected**: All users (UX improvement)
- **Resolution**: Fully fixed, UI now consistent throughout

---

## 🚀 Performance

No performance regressions:
- **Build time**: 1.28s (same as v0.4.0)
- **Bundle size**: 501.54 kB (slight increase of 1.9 KB due to proper node data)
- **Test execution**: 589ms (similar to v0.4.0)

---

## 📚 Migration Guide

### From v0.4.0

**No migration required**. All changes are internal improvements:

1. **System/Tool Nodes**: Now work automatically - just add them to the canvas
2. **Icons**: Visual update only - all functionality remains the same

**What Users Will Notice**:
- System and Tool nodes now appear in YAML preview correctly
- YAML preview buttons now have consistent icons matching the rest of the app
- Slightly improved accessibility with screen reader labels

---

## 🔮 Next Steps

**v0.4.2 and beyond**:
- Continue with Feature 2.5: Monaco YAML Editor Integration
- Potential improvements:
  - Editable node properties in the UI
  - Node validation indicators
  - Improved default values based on user feedback

---

## 📖 Documentation

### Issues Fixed
- See `backlog/issues.md` for complete issue details and resolutions

### Code References
- **ComponentPalette**: `frontend/src/components/palette/ComponentPalette.tsx:47-116`
- **YamlPreview**: `frontend/src/components/yaml/YamlPreview.tsx:119-179`
- **Tests**: `frontend/src/lib/dsl/generator.test.ts:100-236`

---

## 👥 Contributors

- Navam Team
- Claude Code (AI Assistant)

---

**Release Completed**: November 16, 2025
**Semver**: 0.4.0 → 0.4.1 (patch)
**Type**: Bug Fix Release
**Tests**: 31/31 passing (100%)
**Build**: ✅ Success
