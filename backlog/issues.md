# Issues & Bugs

This file tracks known issues and bugs in Navam Sentinel.

---

## Open Issues

None. All known issues have been resolved! 🎉

---

## Closed Issues

### Issue #10: Backend Execution Failures (Multiple Errors) ✅
**Priority**: Critical
**Type**: Bug - Backend Execution
**Reported**: November 16, 2025
**Status**: Closed
**Affects**: v0.8.0, v0.8.1
**Fixed In**: v0.8.2
**Closed**: November 16, 2025

**Description**:
Backend test execution was completely broken with multiple cascading errors preventing any tests from running successfully.

**Errors Encountered**:
1. **Startup Error**: `python: command not found`
2. **500 Error**: `'dict' object has no attribute 'temperature'`
3. **400 Error**: `top_k: Input should be a valid integer` (Anthropic API rejection)

**Root Causes**:

**1. Startup Script Issues** (`backend/start.sh`):
- Used `python` instead of `python3` (not available on macOS by default)
- Didn't activate virtual environment before running server
- Result: Server failed to start or couldn't find dependencies

**2. Model Config Field Access Bug** (`backend/executor/executor.py`):
- Code used `test_spec.model_config.temperature`
- But field is named `model_config_params` with alias `model_config`
- Pydantic didn't properly deserialize the alias
- Result: 500 Internal Server Error with AttributeError

**3. None Parameter Handling** (`backend/providers/anthropic_provider.py`):
- Optional parameters (`top_k`, `top_p`, `stop_sequences`) passed as `None`
- Anthropic API rejects `None` values for integer fields
- Result: 400 Bad Request from Anthropic API

**Impact**:
- ❌ Backend completely non-functional
- ❌ No tests could be executed
- ❌ End-to-end flow broken
- ❌ Development workflow blocked

**Solutions**:

**1. Fixed Startup Script**:
```bash
# Before
python -m backend.main

# After
# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Change to parent directory to run as module
cd ..

# Start the server
python3 -m backend.main
```

**2. Fixed Model Config Access**:
```python
# Before (executor.py line 112)
if test_spec.model_config:
    temperature = test_spec.model_config.temperature or 0.7
    ...

# After
if test_spec.model_config_params:
    # Access model_config_params (the actual field name, not the alias)
    model_cfg = test_spec.model_config_params
    temperature = model_cfg.temperature or 0.7
    ...
```

**3. Fixed Optional Parameter Handling**:
```python
# Before (anthropic_provider.py lines 108-113)
if "top_k" in kwargs:
    request_params["top_k"] = kwargs["top_k"]  # ❌ Passes None

# After
if "top_k" in kwargs and kwargs["top_k"] is not None:
    request_params["top_k"] = kwargs["top_k"]  # ✅ Only non-None values
```

**Files Modified**:
- `backend/start.sh` - Python3 and venv activation (5 lines)
- `backend/executor/executor.py` - Field access fix (8 lines)
- `backend/providers/anthropic_provider.py` - None checks (3 lines)

**Testing**:
- ✅ All 46 frontend tests passing
- ✅ Backend starts successfully
- ✅ End-to-end execution test successful
- ✅ Anthropic API accepts requests
- ✅ Test returns: `{"success": true, "output": "2 + 2 = 4", ...}`

**Verification**:
Successfully executed test via API:
```bash
curl -X POST http://localhost:8000/api/execution/execute \
  -H "Content-Type: application/json" \
  -d '{"test_spec": {...}}'
```

Response:
```json
{
  "result": {
    "success": true,
    "output": "2 + 2 = 4",
    "latency_ms": 4031,
    "tokens_input": 14,
    "tokens_output": 13,
    "cost_usd": 0.000237
  }
}
```

**Impact**: Backend execution fully functional, all tests can now run end-to-end successfully.

---

### Issue #9: 404 Error for loader.js.map in Development ✅
**Priority**: Low
**Type**: Bug - Development Experience
**Reported**: November 16, 2025
**Status**: Closed
**Affects**: v0.8.0
**Fixed In**: v0.8.1
**Closed**: November 16, 2025

**Description**:
During development, the browser console showed a 404 error when trying to load source maps:
```
[Error] Failed to load resource: the server responded with a status of 404 () (loader.js.map, line 0)
```

This error appeared because Vite was not configured to generate source maps for regular development builds.

**Root Cause**:
In `vite.config.ts`, the `sourcemap` build option was set to:
```typescript
sourcemap: !!process.env.TAURI_DEBUG
```

This meant source maps were only generated when the `TAURI_DEBUG` environment variable was set, which is not the case for regular `npm run dev` or `npm run build` commands. As a result, the browser expected source map files but they didn't exist, causing 404 errors.

**Impact**:
- Non-critical: Development functionality was not affected
- Developer experience: Made debugging slightly harder without source maps
- Console noise: 404 errors appeared in browser console during development

**Solution**:
Updated the source map configuration to generate maps for all non-production builds:

```typescript
// Before (line 39)
sourcemap: !!process.env.TAURI_DEBUG

// After (line 39)
sourcemap: process.env.NODE_ENV === 'production' ? false : true
```

**Behavior After Fix**:
- ✅ Source maps generated during development (`npm run dev`)
- ✅ Source maps generated for debug builds (`TAURI_DEBUG=true`)
- ✅ Source maps NOT generated for production builds (smaller bundle)
- ✅ No more 404 errors in console
- ✅ Better debugging experience with source maps

**Files Modified**:
- `frontend/vite.config.ts` - Updated sourcemap configuration (1 line)

**Testing**:
- ✅ All 46 tests passing
- ✅ 0 TypeScript errors
- ✅ Build with NODE_ENV=development produces source maps
- ✅ Source map file verified: `dist/assets/index-*.js.map` (3.0MB)
- ✅ No regressions in development or production builds

**Verification**:
Ran `NODE_ENV=development npm run build` and confirmed:
- Source map generated: `index-Cn6zzuQW.js.map` (3.0MB)
- Build output shows: `map: 3,129.18 kB`

**Impact**: Developers now have source maps available for better debugging, and the 404 console errors are eliminated.

---

### Issue #8: Update Model IDs to Latest Claude 4.x Versions ✅
**Priority**: Medium
**Type**: Enhancement - Maintenance
**Reported**: November 16, 2025
**Status**: Closed
**Affects**: v0.7.0
**Fixed In**: v0.8.0
**Closed**: November 16, 2025

**Description**:
The project was using outdated Claude 3.x model IDs as defaults. Anthropic has since released Claude 4.x models (Sonnet 4.5, Haiku 4.5, Opus 4.1) and Claude 3.7 Sonnet, which offer improved performance and capabilities. The model catalog needed to be updated to reflect the latest available models.

**Research Findings**:
- **Latest Models** (as of November 2025):
  - `claude-sonnet-4-5-20250929` - Claude Sonnet 4.5 (Latest, best balance)
  - `claude-haiku-4-5-20251001` - Claude Haiku 4.5 (Fast, cost-effective)
  - `claude-opus-4-1-20250805` - Claude Opus 4.1 (Most capable)
  - `claude-sonnet-4-20250514` - Claude Sonnet 4
  - `claude-opus-4-20250514` - Claude Opus 4
  - `claude-3-7-sonnet-20250219` - Claude Sonnet 3.7

- **Deprecated Models**:
  - Claude 3 Opus (2024-02-29) - Deprecated June 30, 2025
  - Claude 3 Sonnet (2024-02-29) - Retired July 21, 2025

- **Updated Pricing** (November 2025):
  - Sonnet 4.5: $3/MTok input, $15/MTok output
  - Haiku 4.5: $1/MTok input, $5/MTok output
  - Opus 4.1: $15/MTok input, $75/MTok output
  - Haiku 3.5: $0.80/MTok input, $4/MTok output (updated)

**Implementation**:
1. **Backend (`anthropic_provider.py`)**:
   - Updated `AVAILABLE_MODELS` list with Claude 4.x models
   - Reorganized with comments: Latest (Recommended), Legacy, Deprecated
   - Updated `_calculate_cost()` pricing table
   - Added backward compatibility for old model IDs

2. **Frontend (`generator.ts`)**:
   - Changed default model from `gpt-4` to `claude-sonnet-4-5-20250929`
   - New default provides better performance and is actually implemented

3. **Frontend (`ModelNode.tsx`)**:
   - Updated models dropdown with all Claude 4.x models
   - Organized with comments: Latest, Legacy, OpenAI placeholders
   - Changed default model in useState

4. **Frontend (`ComponentPalette.tsx`)**:
   - Updated default model for new Model nodes
   - Changed provider from `openai` to `anthropic`

5. **Tests Updated**:
   - Fixed test expectations to match new default model
   - Updated ComponentPalette test to expect `claude-sonnet-4-5-20250929`
   - Updated generator tests for empty canvas default

**Files Modified**:
- `backend/providers/anthropic_provider.py` - Model catalog and pricing
- `frontend/src/lib/dsl/generator.ts` - Default model
- `frontend/src/components/nodes/ModelNode.tsx` - Model dropdown and default
- `frontend/src/components/palette/ComponentPalette.tsx` - Component defaults
- `frontend/src/lib/dsl/generator.test.ts` - Test expectations
- `frontend/src/components/palette/ComponentPalette.test.tsx` - Test expectations

**User Benefits**:
- ✅ Access to latest, most capable Claude models
- ✅ Better default model (Sonnet 4.5 vs old GPT-4)
- ✅ Improved performance from newer models
- ✅ Up-to-date pricing information
- ✅ Clear organization (Latest, Legacy, Deprecated)
- ✅ Backward compatibility maintained

**Testing**:
- ✅ All 46 tests passing
- ✅ 0 TypeScript errors
- ✅ Production build successful
- ✅ Model dropdown shows all new models
- ✅ Default model correctly set to Claude Sonnet 4.5

**Impact**: Users now have access to the latest Claude 4.x models with improved capabilities and accurate pricing. The default model provides better performance out of the box.

---

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
