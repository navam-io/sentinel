# Issues & Bugs

This file tracks known issues and bugs in Navam Sentinel.

---

## Open Issues

None

---

## Closed Issues

### Issue #1: YAML Preview Panel Icon Inconsistency ✅
**Priority**: Medium
**Type**: UI/UX - Design Consistency
**Reported**: November 16, 2025
**Status**: Closed
**Affects**: v0.4.0
**Fixed In**: v0.4.1
**Closed**: November 16, 2025

**Description**:
The YAML preview panel buttons use emoji icons (📥, ✏️, 📋, 💾, ✓, ✕) which are inconsistent with the rest of the application that uses Heroicons. This creates visual inconsistency and doesn't match the Sentinel design system.

**Current State**:
```tsx
// YamlPreview.tsx - Current implementation
<button>📥 Import</button>
<button>✏️ Edit</button>
<button>📋 Copy</button>
<button>💾 Save</button>
<button>✓ Apply</button>
<button>✕ Cancel</button>
```

**Expected Behavior**:
- Replace emoji icons with Heroicons (lucide-react)
- Match the visual style of other components (Component Palette, Canvas controls)
- Use consistent sizing, spacing, and colors from Sentinel design system
- Maintain same functionality

**Suggested Icons** (lucide-react):
- Import: `ArrowDownTrayIcon` or `DocumentArrowDownIcon`
- Edit: `PencilIcon` or `PencilSquareIcon`
- Copy: `ClipboardDocumentIcon`
- Save: `ArrowDownTrayIcon` or `DocumentArrowDownIcon`
- Apply: `CheckIcon`
- Cancel: `XMarkIcon`

**Design System Reference**:
- See `backlog/spec-03.md` for Sentinel design system
- Use `text-sentinel-primary` for primary actions
- Use `text-sentinel-text-muted` for secondary actions
- Button styling should match Component Palette buttons

**Files to Modify**:
- `frontend/src/components/yaml/YamlPreview.tsx`

**Resolution**:
- ✅ All emoji icons replaced with lucide-react icons (Upload, Edit3, Copy, Download, Check, X)
- ✅ Icon sizing consistent (12px with strokeWidth 2)
- ✅ Button styling matches rest of app (flex items-center gap-1)
- ✅ Hover states work correctly
- ✅ Accessibility improved with aria-labels on all buttons
- ✅ All existing functionality preserved (31/31 tests passing)

---

### Issue #2: System and Tool Nodes Don't Update YAML ✅
**Priority**: High
**Type**: Bug - Functionality
**Reported**: November 16, 2025
**Status**: Closed
**Affects**: v0.4.0
**Fixed In**: v0.4.1
**Closed**: November 16, 2025

**Description**:
When adding System or Tool nodes to the canvas via the Component Palette, the YAML preview panel does not update to reflect these changes. The YAML generator is not extracting data from these node types correctly.

**Steps to Reproduce**:
1. Open Sentinel application
2. Click "System" in Component Palette
3. Observe canvas - System node is added ✓
4. Check YAML preview panel - No system fields appear ✗
5. Click "Tool" in Component Palette
6. Observe canvas - Tool node is added ✓
7. Check YAML preview panel - No tools array appears ✗

**Expected Behavior**:
When a System node is added:
```yaml
description: "System description here"
timeout_ms: 5000
framework: "langgraph"
```

When a Tool node is added:
```yaml
tools:
  - tool_name_here
```

**Current Behavior**:
- System nodes are created on canvas but fields not reflected in YAML
- Tool nodes are created on canvas but not added to tools array in YAML
- Input, Model, and Assertion nodes work correctly ✓

**Root Cause**:
The `generateYAML()` function in `frontend/src/lib/dsl/generator.ts` has logic for System and Tool nodes, but the nodes might not be storing data correctly, or the data extraction logic has issues.

**Investigation Needed**:
1. Check if System/Tool nodes store data correctly in `node.data`
2. Verify `generateYAML()` is reading the correct data fields
3. Check if ComponentPalette is creating nodes with proper initial data
4. Test with sample data to isolate issue

**Files to Investigate**:
- `frontend/src/lib/dsl/generator.ts` - Lines 151-161 (system case), 131-149 (tool case)
- `frontend/src/components/palette/ComponentPalette.tsx` - Node creation logic
- `frontend/src/components/nodes/SystemNode.tsx` - Data storage
- `frontend/src/components/nodes/ToolNode.tsx` - Data storage

**Related Code**:
```typescript
// generator.ts - System node handling (lines 151-161)
case 'system':
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

// generator.ts - Tool node handling (lines 131-149)
case 'tool':
    if (node.data?.toolName) {
        if (!spec.tools) spec.tools = [];
        // ... rest of logic
    }
    break;
```

**Possible Fixes**:
1. **ComponentPalette Fix**: Ensure System/Tool nodes are created with initial data:
   ```typescript
   data: {
       label: 'System',
       description: '',
       timeout_ms: null,
       framework: ''
   }
   ```

2. **Node Component Fix**: Ensure node components update store when user edits fields

3. **Generator Fix**: Add fallback logic or default values

**Testing Requirements**:
- [ ] Add System node to canvas
- [ ] Verify YAML shows `description`, `timeout_ms`, `framework` fields
- [ ] Add Tool node to canvas
- [ ] Verify YAML shows `tools` array with tool name
- [ ] Test round-trip: YAML → Canvas → YAML preserves all data
- [ ] Ensure existing tests still pass
- [ ] Add new test cases for System and Tool node YAML generation

**Root Cause**:
The `handleAddNode` function in `ComponentPalette.tsx` only initialized nodes with `{ label }`, missing all other required fields for System and Tool nodes.

**Resolution**:
- ✅ System nodes update YAML with all fields (description, timeout_ms, framework)
- ✅ Tool nodes update YAML with tools array
- ✅ Real-time sync works (canvas changes → YAML updates)
- ✅ Round-trip conversion works (YAML → Canvas → YAML)
- ✅ All 31 tests passing (was 27, added 4 new tests)
- ✅ New tests added for System and Tool node generation

**Files Modified**:
- `frontend/src/components/palette/ComponentPalette.tsx` - Added proper node data initialization
- `frontend/src/lib/dsl/generator.test.ts` - Added 4 new tests for System/Tool nodes
- `frontend/src/components/palette/ComponentPalette.test.tsx` - Updated tests to expect full data

**Impact**: Issue fully resolved, no known regressions

---

## Issue Template

```markdown
### Issue #N: [Title]
**Priority**: [Low/Medium/High/Critical]
**Type**: [Bug/Feature/Enhancement/UI/UX/Performance/Documentation]
**Reported**: [Date]
**Status**: [Open/In Progress/Closed]
**Affects**: [Version]

**Description**:
[Clear description of the issue]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Expected vs Actual]

**Expected Behavior**:
[What should happen]

**Current Behavior**:
[What actually happens]

**Files to Investigate/Modify**:
- [File paths]

**Acceptance Criteria**:
- [ ] [Criteria 1]
- [ ] [Criteria 2]
```
