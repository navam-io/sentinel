# Release Notes: v0.4.2 - System Prompt Mapping Fix

**Release Date**: November 16, 2025
**Release Type**: Patch (0.4.1 → 0.4.2)
**Status**: Completed ✅

---

## Overview

This patch release fixes a critical data loss bug where System node prompts entered in the UI were not being saved to the generated YAML. The fix ensures complete bidirectional synchronization between the visual canvas and YAML representation.

---

## 🐛 Bug Fix

### Issue #3: System Node System Prompt Not Mapped to YAML ✅

**Problem**: When users added a System node to the canvas and entered a system prompt (e.g., "You are a helpful AI assistant."), this data was not reflected in the YAML preview panel or exported files, resulting in data loss.

**Root Cause**: Field name mismatch between components:
- `SystemNode.tsx` stored user input as `systemPrompt` in node.data
- `generator.ts` looked for `description`, `timeout_ms`, `framework` fields
- No mapping existed from `systemPrompt` → `inputs.system_prompt` in YAML

**Fix**:

1. **Generator Enhancement** (`generator.ts:152-168`)
   ```typescript
   case 'system':
       // Map systemPrompt to inputs.system_prompt
       if (node.data?.systemPrompt) {
           if (!spec.inputs) spec.inputs = {};
           spec.inputs.system_prompt = String(node.data.systemPrompt);
       }
       // Also support legacy fields for backward compatibility
       if (node.data?.description) {
           spec.description = String(node.data.description);
       }
       if (node.data?.timeout_ms) {
           spec.timeout_ms = Number(node.data.timeout_ms);
       }
       if (node.data?.framework) {
           spec.framework = String(node.data.framework);
       }
       break;
   ```

2. **ComponentPalette Initialization** (`ComponentPalette.tsx:74-82`)
   ```typescript
   case 'system':
       nodeData = {
           label,
           systemPrompt: 'You are a helpful AI assistant.',
           timeout_ms: 30000,
           framework: 'langgraph',
           description: 'System configuration' // Legacy field for backward compatibility
       };
       break;
   ```

3. **YAML → Canvas Parser** (`generator.ts:210-225`)
   ```typescript
   // Create system node if we have systemPrompt in inputs OR legacy system fields
   if (spec.inputs?.system_prompt || spec.description || spec.timeout_ms || spec.framework) {
       nodes.push({
           id: 'system-1',
           type: 'system',
           data: {
               label: 'System',
               systemPrompt: spec.inputs?.system_prompt || 'You are a helpful AI assistant.',
               description: spec.description,
               timeout_ms: spec.timeout_ms,
               framework: spec.framework
           },
           position: { x: xPosition, y: yPosition }
       });
       yPosition += spacing;
   }
   ```

**Testing**:
- ✅ Updated 1 existing test to include systemPrompt field
- ✅ Added 1 new round-trip conversion test
- ✅ All 32 tests passing (was 31)
- ✅ Real-time sync works correctly
- ✅ Round-trip conversion preserves all data
- ✅ Backward compatibility maintained

---

## 📝 Technical Details

### Files Modified

```
frontend/src/lib/dsl/generator.ts
- Added systemPrompt → inputs.system_prompt mapping in generateYAML()
- Updated parseYAMLToNodes() to handle inputs.system_prompt
- Backward compatibility for legacy description/timeout_ms/framework fields

frontend/src/components/palette/ComponentPalette.tsx
- Added systemPrompt field to System node initialization
- Default value: "You are a helpful AI assistant."
- Maintains legacy fields for backward compatibility

frontend/src/lib/dsl/generator.test.ts
- Updated test: "should generate YAML with system node (default values)"
- Added test: "should handle system prompt in round-trip conversion"
- Total: 32 tests (was 31)
```

### Version Updates
```
frontend/package.json: 0.4.1 → 0.4.2
frontend/src-tauri/Cargo.toml: 0.4.1 → 0.4.2
```

---

## ✅ Success Criteria

All success criteria met:

### Issue #3 (System Prompt Mapping)
- ✅ System prompt appears in YAML under `inputs.system_prompt`
- ✅ Real-time sync works (canvas changes → YAML updates)
- ✅ Round-trip conversion works (YAML → Canvas → YAML)
- ✅ Backward compatibility maintained (description, timeout_ms, framework)
- ✅ All 32 tests passing (100% pass rate)
- ✅ New tests added for system prompt generation
- ✅ 0 TypeScript errors
- ✅ Production build successful

---

## 🧪 Testing & Quality

### Test Results
```
✓ 32 total tests passing (100% pass rate)
  ✓ 20 DSL generator tests (19 existing + 1 new)
  ✓ 12 ComponentPalette tests (12 existing)

✓ 0 TypeScript errors
✓ Production build successful
✓ Bundle: 501.77 kB (gzip: 158.42 kB)
```

### Code Quality
- **Type Safety**: Full TypeScript coverage maintained
- **Test Coverage**: Increased from 31 to 32 tests
- **Build**: Clean production build with no warnings (except chunk size advisory)
- **Backward Compatibility**: Legacy fields still supported

---

## 🔄 Breaking Changes

**None**. This release is fully backward compatible with v0.4.1.

### Backward Compatibility
- Old YAML files with `description`, `timeout_ms`, `framework` at root level: ✅ Still work
- New YAML files with `inputs.system_prompt`: ✅ Work correctly
- Round-trip conversion: ✅ Preserves all fields

---

## 📊 Impact

### Issue #3 Impact
- **Severity**: High - Data loss bug affecting System nodes
- **Users Affected**: All users creating System nodes
- **Resolution**: Fully fixed, system prompts now persist correctly

### Example YAML Output

**Before v0.4.2** (System prompt was lost):
```yaml
name: Test from Canvas
model: gpt-4
inputs:
  query: What is the capital of France?
assertions:
  - must_contain: Paris
tags:
  - canvas-generated
description: System configuration
timeout_ms: 30000
framework: langgraph
```

**After v0.4.2** (System prompt preserved):
```yaml
name: Test from Canvas
model: gpt-4
inputs:
  query: What is the capital of France?
  system_prompt: You are a helpful AI assistant.
assertions:
  - must_contain: Paris
tags:
  - canvas-generated
description: System configuration
timeout_ms: 30000
framework: langgraph
```

---

## 🚀 Performance

No performance regressions:
- **Build time**: 1.40s (similar to v0.4.1)
- **Bundle size**: 501.77 kB (increase of 0.23 KB - negligible)
- **Test execution**: 800ms (similar to v0.4.1)

---

## 📚 Migration Guide

### From v0.4.1

**No migration required**. All changes are internal improvements:

1. **System Nodes**: System prompts now automatically save to YAML
2. **Import**: YAML files with `inputs.system_prompt` now create System nodes correctly
3. **Export**: System nodes now export `system_prompt` in the `inputs` section

**What Users Will Notice**:
- System prompts now appear in YAML preview panel
- System prompts persist when saving/loading test specs
- Round-trip import/export preserves all System node data

**No Breaking Changes**:
- Existing YAML files with legacy fields (`description`, `timeout_ms`, `framework`) continue to work
- Visual canvas behaves identically
- All existing functionality preserved

---

## 🔮 Next Steps

**v0.4.3 and beyond**:
- Issue #4: Tool Description Not Included in YAML Without Parameters (Medium priority)
- Issue #5: YAML Preview Panel Title and Tagline Layout (Low priority)
- Feature 2.5: Monaco YAML Editor Integration

**Remaining P0 Features**:
- Feature 2.5: Monaco YAML Editor Integration (v0.5.0)
- Feature 3: Model Provider Architecture & Execution (in progress)
- Feature 4: Assertion Builder & Validation (v0.6.0)

---

## 📖 Documentation

### Issues Fixed
- See `backlog/issues.md` for complete issue details and resolutions

### Code References
- **Generator**: `frontend/src/lib/dsl/generator.ts:152-168` (Canvas → YAML)
- **Generator**: `frontend/src/lib/dsl/generator.ts:210-225` (YAML → Canvas)
- **ComponentPalette**: `frontend/src/components/palette/ComponentPalette.tsx:74-82`
- **Tests**: `frontend/src/lib/dsl/generator.test.ts:195-217, 453-482`

---

## 👥 Contributors

- Navam Team
- Claude Code (AI Assistant)

---

**Release Completed**: November 16, 2025
**Semver**: 0.4.1 → 0.4.2 (patch)
**Type**: Bug Fix Release
**Tests**: 32/32 passing (100%)
**Build**: ✅ Success
