# Issues & Bugs

This file tracks known issues and bugs in Navam Sentinel.

---

## Open Issues

### Issue #5: YAML Preview Panel Title and Tagline Layout
**Priority**: Low
**Type**: UI/UX - Design Improvement
**Reported**: November 16, 2025
**Status**: Open
**Affects**: v0.4.1

**Description**:
The YAML preview panel header needs better title and tagline layout. The title should be "Test Script" (left-aligned) with the tagline on its own line above the toolbar.

**Current State**:
```tsx
<h2 className="text-sm font-semibold text-sentinel-text">
  {isEditMode ? 'Edit YAML' : 'YAML Preview'}
</h2>
<p className="text-[0.6rem] text-sentinel-text-muted mt-1">
  {isEditMode ? 'Edit and apply to update canvas' : 'Auto-generated from canvas'}
</p>
```

**Expected Behavior**:
- Title: "Test Script" (always, even in edit mode)
- Tagline: Right-aligned on same line as title, or on separate line above toolbar
- No text wrapping
- Consistent with Sentinel design system

**Files to Modify**:
- `frontend/src/components/yaml/YamlPreview.tsx` - Update header layout

**Acceptance Criteria**:
- [ ] Title changed to "Test Script"
- [ ] Tagline layout improved (no wrap)
- [ ] Visual consistency with rest of app
- [ ] Responsive layout (handles small windows)

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

---

### Issue #3: System Node System Prompt Not Mapped to YAML ✅
**Priority**: High
**Type**: Bug - Data Loss
**Reported**: November 16, 2025
**Status**: Closed
**Affects**: v0.4.1
**Fixed In**: v0.4.2
**Closed**: November 16, 2025

**Description**:
The System node allowed users to enter a system prompt in the UI, but this data was not being reflected in the generated YAML. The node stored `systemPrompt` in node.data, but the generator looked for `description`, `timeout_ms`, and `framework` fields instead.

**Root Cause**:
Field name mismatch between SystemNode component and generator logic. SystemNode stored user input as `systemPrompt`, but the generator didn't map it to the YAML `inputs.system_prompt` field.

**Resolution**:
- ✅ Generator now maps `systemPrompt` to `inputs.system_prompt` in YAML
- ✅ ComponentPalette initializes System nodes with `systemPrompt` field
- ✅ YAML → Canvas parser creates System nodes from `inputs.system_prompt`
- ✅ Round-trip conversion preserves system prompt data
- ✅ Backward compatibility maintained for legacy `description`, `timeout_ms`, `framework` fields
- ✅ All 32 tests passing (was 31, added 1 new test for round-trip)
- ✅ 0 TypeScript errors
- ✅ Production build successful

**Files Modified**:
- `frontend/src/lib/dsl/generator.ts` - Added systemPrompt → inputs.system_prompt mapping
- `frontend/src/components/palette/ComponentPalette.tsx` - Added systemPrompt to default data
- `frontend/src/lib/dsl/generator.test.ts` - Added 2 new tests (updated 1, added 1 round-trip test)

**Impact**: Issue fully resolved, system prompts now appear in YAML and persist through round-trip conversion.

---

### Issue #4: Tool Description Not Included in YAML Without Parameters ✅
**Priority**: Medium
**Type**: Test Coverage - Verification
**Reported**: November 16, 2025
**Status**: Closed - Not a Bug
**Affects**: v0.4.1
**Verified In**: v0.4.3
**Closed**: November 16, 2025

**Description**:
Initial concern that tool descriptions might not be included in YAML when parameters are empty/null. Investigation revealed the feature was already working correctly.

**Investigation**:
The generator code already handles tool descriptions correctly:
```typescript
// generator.ts lines 135-148
if (node.data?.toolDescription || node.data?.toolParameters) {
  const toolSpec: ToolSpec = { name: String(node.data.toolName) };
  if (node.data.toolDescription) {
    toolSpec.description = String(node.data.toolDescription);
  }
  if (node.data.toolParameters) {
    toolSpec.parameters = node.data.toolParameters;
  }
  spec.tools.push(toolSpec);
} else {
  spec.tools.push(String(node.data.toolName));
}
```

The OR condition (`||`) ensures that if EITHER description OR parameters exist, a ToolSpec object is created.

**Resolution**:
- ✅ Code review confirmed feature works correctly
- ✅ Added comprehensive test coverage (2 new tests)
- ✅ Test: Tool with description only (no parameters) - creates ToolSpec
- ✅ Test: Tool with name only (empty description, null parameters) - creates string
- ✅ Test: Tool with description AND parameters - creates full ToolSpec (already existed)
- ✅ All 34 tests passing (was 32, added 2 verification tests)
- ✅ 0 TypeScript errors
- ✅ Production build successful

**Files Modified**:
- `frontend/src/lib/dsl/generator.test.ts` - Added 2 comprehensive test cases

**Outcome**: Feature was already implemented correctly. Added test coverage to verify and document expected behavior.

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
