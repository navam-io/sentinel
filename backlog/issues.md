# Issues & Bugs

This file tracks known issues and bugs in Navam Sentinel.

---

## Open Issues

[ ] Research the latest model ids for the model providers being used and replace the existing model ids with latest.

[ ] Fix this: [Error] Failed to load resource: the server responded with a status of 404 () (loader.js.map, line 0)

[ ] Fix this: INFO:     127.0.0.1:52679 - "POST /api/execution/execute HTTP/1.1" 400 Bad Request

---

## Closed Issues

### Issue #7: UI Reorganization - Consolidate Run Panel into Test Script Panel ✅
**Priority**: Medium
**Type**: Enhancement - UI/UX Improvement
**Reported**: November 16, 2025
**Status**: Closed
**Affects**: v0.6.1
**Fixed In**: v0.7.0
**Closed**: November 16, 2025

**Description**:
The Run panel was displayed as a separate right-side panel (320px wide), separate from the Test Script panel. This created unnecessary horizontal space usage and separated related functionality (test script editing and execution).

**User Request**:
"Move the Run panel as a section within Test Script panel in its own section below the Monaco Editor"

**Goals**:
1. Consolidate test script and execution into a single cohesive panel
2. Reduce horizontal space usage (from 2 panels to 1)
3. Create better visual hierarchy with script editing above execution
4. Improve vertical space utilization
5. Make the workflow more intuitive (write script → run test → see results)

**Implementation**:
- ✅ Integrated execution functionality directly into YamlPreview component
- ✅ Moved Run button below Monaco Editor
- ✅ Execution results display in collapsible section with max-height scroll
- ✅ Removed separate ExecutionPanel component from App layout
- ✅ All execution features preserved (metrics, output, tool calls, metadata)
- ✅ Maintained all existing functionality and styling

**Technical Changes**:
1. `YamlPreview.tsx`:
   - Added execution imports (Play, CheckCircle2, XCircle, Clock, DollarSign, Zap icons)
   - Added execution state (isExecuting, result, executionError)
   - Added handleRun function for test execution
   - Added Execution Section UI between Monaco Editor and Footer
   - Added max-height scrolling for results (max-h-96)

2. `App.tsx`:
   - Removed ExecutionPanel import
   - Removed ExecutionPanel from layout
   - Reduced from 4 panels to 3 (ComponentPalette, Canvas, YamlPreview)

**User Experience Improvements**:
- ✅ More intuitive workflow: Edit script → Run test → View results (all in one place)
- ✅ Better space utilization: Freed up 320px of horizontal space
- ✅ Cleaner interface: One consolidated panel instead of two
- ✅ Better vertical scrolling: Results scroll independently within fixed height
- ✅ Consistent styling: Execution UI matches Test Script panel design

**Files Modified**:
- `frontend/src/components/yaml/YamlPreview.tsx` - Integrated execution UI (~180 lines added)
- `frontend/src/App.tsx` - Removed ExecutionPanel from layout (2 lines removed)

**Testing**:
- ✅ All 46 existing tests passing
- ✅ 0 TypeScript errors
- ✅ Production build successful
- ✅ No test regressions (ExecutionPanel had no tests)
- ✅ Functionality verified manually

**Impact**: Improved user experience with consolidated, intuitive interface. Users can now edit scripts and run tests from a single panel with better vertical space utilization.

---

### Issue #6: Empty Canvas Execution Returns 400 Bad Request ✅
**Priority**: High
**Type**: Bug - API Validation
**Reported**: November 16, 2025
**Status**: Closed
**Affects**: v0.6.0
**Fixed In**: v0.6.1
**Closed**: November 16, 2025

**Description**:
When attempting to execute a test from an empty canvas (or canvas with no input nodes), the backend API returned a 400 Bad Request error. This prevented users from testing the execution flow with default values.

**Error Message**:
```
POST /api/execution/execute HTTP/1.1" 400 Bad Request
INFO:     127.0.0.1:52046 - "POST /api/execution/execute HTTP/1.1" 400 Bad Request
```

**Root Cause**:
The frontend's `generateYAML()` function initialized the `inputs` object as empty (`inputs: {}`). When this was sent to the backend, Pydantic's `check_at_least_one_input` validator rejected it because none of the required fields (query, messages, system_prompt, context) were present.

**Investigation Steps**:
1. Examined backend/core/schema.py - found `InputSpec` validator requiring at least one field
2. Traced frontend YAML generation in generator.ts
3. Identified empty `inputs: {}` initialization on line 63
4. Confirmed empty inputs would fail backend validation

**Resolution**:
- ✅ Modified generator.ts to initialize inputs with default query
- ✅ Default query: "Enter your query here" satisfies backend validation
- ✅ Custom input nodes override the default (lines 74-76)
- ✅ Added 2 comprehensive tests to verify fix
- ✅ All 46 tests passing
- ✅ 0 TypeScript errors
- ✅ Production build successful

**Files Modified**:
- `frontend/src/lib/dsl/generator.ts` - Added default query initialization (line 64)
- `frontend/src/lib/dsl/generator.test.ts` - Added 2 validation tests + import fix

**New Tests**:
1. Test: Empty canvas generates default query
2. Test: Custom input node overrides default query
3. Test: Generated YAML validates against backend TestSpec schema

**Impact**: Users can now execute tests from any canvas state, including empty canvases. The default query provides a valid starting point while being easily overridable.

---

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

### Issue #5: YAML Preview Panel Title and Tagline Layout ✅
**Priority**: Low
**Type**: UI/UX - Design Improvement
**Reported**: November 16, 2025
**Status**: Closed
**Affects**: v0.4.1
**Fixed In**: v0.4.4
**Closed**: November 16, 2025

**Description**:
The YAML preview panel header needed better title and tagline layout for improved clarity and consistency with the Sentinel design system.

**Changes Made**:

1. **Title Updated**: Changed from dynamic "YAML Preview" / "Edit YAML" to static "Test Script"
2. **Tagline Repositioned**: Moved from below toolbar to same line as title (right-aligned)
3. **No-Wrap Protection**: Added `whitespace-nowrap` to prevent text wrapping
4. **Improved Layout**: Better visual hierarchy with title/tagline on separate row from toolbar

**Before**:
```tsx
<div className="flex items-center justify-between">
  <h2>{isEditMode ? 'Edit YAML' : 'YAML Preview'}</h2>
  <div className="flex gap-2">{/* Buttons */}</div>
</div>
<p>{isEditMode ? 'Edit and apply...' : 'Auto-generated...'}</p>
```

**After**:
```tsx
<div className="flex items-center justify-between mb-2">
  <h2 className="whitespace-nowrap">Test Script</h2>
  <p className="whitespace-nowrap">
    {isEditMode ? 'Edit and apply...' : 'Auto-generated...'}
  </p>
</div>
<div className="flex items-center justify-end">
  <div className="flex gap-2">{/* Buttons */}</div>
</div>
```

**Resolution**:
- ✅ Title changed to "Test Script" (always consistent)
- ✅ Tagline positioned on same line as title (right-aligned)
- ✅ No text wrapping (whitespace-nowrap)
- ✅ Visual consistency with Sentinel design system
- ✅ Responsive layout maintained
- ✅ All 34 tests passing
- ✅ 0 TypeScript errors
- ✅ Production build successful

**Files Modified**:
- `frontend/src/components/yaml/YamlPreview.tsx` - Updated header layout

**Impact**: Improved visual clarity and consistency. Users will see "Test Script" as the panel title regardless of edit mode.

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
