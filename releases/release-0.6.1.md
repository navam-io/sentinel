# Release v0.6.1 - Empty Canvas Execution Fix

**Release Date**: November 16, 2025
**Type**: Patch Release
**Status**: ✅ Complete

---

## Summary

This release fixes a critical bug that prevented test execution from empty canvases or canvases without input nodes. The backend API was returning 400 Bad Request errors due to empty inputs validation, blocking users from testing the execution flow with default values.

**Key Fix**: The YAML generator now always initializes inputs with a default query, satisfying backend validation while remaining easily overridable when custom input nodes are added.

---

## Bug Fixes

### 🐛 Empty Canvas Execution Returns 400 Bad Request

**Issue**: [#6 - Empty Canvas Execution Returns 400 Bad Request](issues.md#issue-6)

**Problem**:
When attempting to execute a test from an empty canvas (or canvas with no input nodes), the backend API returned a 400 Bad Request error with the message:
```
POST /api/execution/execute HTTP/1.1" 400 Bad Request
```

**Root Cause**:
The frontend's `generateYAML()` function initialized the `inputs` object as empty (`inputs: {}`). When this was sent to the backend, Pydantic's `check_at_least_one_input` validator rejected it because none of the required fields (query, messages, system_prompt, context) were present.

**Investigation Process**:
1. Examined `backend/core/schema.py` - found `InputSpec` validator requiring at least one field
2. Traced frontend YAML generation in `generator.ts`
3. Identified empty `inputs: {}` initialization on line 63
4. Confirmed empty inputs would fail backend validation

**Solution**:
Modified `frontend/src/lib/dsl/generator.ts` to initialize inputs with a default query:

```typescript
// Before (line 63)
inputs: {},

// After (line 64)
inputs: {
  query: 'Enter your query here'  // Default query to satisfy backend validation
},
```

**Behavior**:
- ✅ Empty canvas generates YAML with default query
- ✅ Canvas without input nodes generates YAML with default query
- ✅ Custom input nodes override the default query (existing behavior preserved)
- ✅ Backend validation passes for all canvas states
- ✅ User experience improved - can test execution immediately

---

## Testing

### New Tests Added

Added 2 comprehensive tests to `frontend/src/lib/dsl/generator.test.ts`:

1. **Test: Empty canvas generates default query**
   - Verifies empty canvas has `query: Enter your query here`
   - Verifies canvas with only model nodes has default query
   - Validates generated YAML converts to valid TestSpec

2. **Test: Custom input node overrides default**
   - Verifies custom query from input node appears in YAML
   - Verifies default query does NOT appear when custom query exists
   - Ensures backward compatibility with existing behavior

### Test Results

**Frontend Tests**:
- ✅ All 46 tests passing (was 44, added 2 new tests)
- ✅ 0 TypeScript errors
- ✅ Production build successful

**Test Coverage**:
- Empty canvas scenarios ✅
- Canvas with no input nodes ✅
- Canvas with custom input nodes ✅
- Round-trip YAML validation ✅

---

## Files Changed

### Modified
- `frontend/src/lib/dsl/generator.ts`
  - Line 64: Added default query initialization
  - Impact: 1 line changed

- `frontend/src/lib/dsl/generator.test.ts`
  - Line 2: Added `convertYAMLToTestSpec` import
  - Lines 538-573: Added 2 comprehensive validation tests
  - Impact: 38 lines added

- `frontend/package.json`
  - Line 4: Version bumped from 0.6.0 → 0.6.1
  - Impact: 1 line changed

### Documentation
- `backlog/issues.md`
  - Issue #6 moved from Open to Closed section
  - Added comprehensive resolution documentation
  - Impact: Issue resolved and documented

**Total Changes**: ~40 lines of code (1 fix + 38 test lines + 1 version bump)

---

## Breaking Changes

None. This is a backward-compatible bug fix.

---

## Impact

### Before Fix
❌ Empty canvas execution failed with 400 error
❌ Canvas without input nodes failed with 400 error
❌ Users couldn't test execution flow without creating input nodes first
❌ Confusing error message ("Bad Request" with no clear guidance)

### After Fix
✅ Empty canvas execution works with sensible default
✅ Canvas without input nodes works seamlessly
✅ Users can immediately test execution flow
✅ Default query provides clear placeholder text
✅ Custom input nodes work exactly as before

---

## Migration Guide

No migration needed. This is a transparent bug fix.

**For Users**:
- Existing test specs unchanged
- Existing input nodes work identically
- New behavior: Empty canvases now generate valid YAML automatically

**For Developers**:
- No API changes
- No schema changes
- Existing tests continue to pass
- New tests verify the fix

---

## Validation

**Manual Testing**:
1. ✅ Empty canvas → Run Test → Executes successfully
2. ✅ Canvas with model only → Run Test → Executes successfully
3. ✅ Canvas with input node → Run Test → Uses custom query
4. ✅ YAML preview shows default query when no input nodes
5. ✅ YAML preview shows custom query when input nodes present

**Automated Testing**:
1. ✅ All existing tests pass (44 tests)
2. ✅ New validation tests pass (2 tests)
3. ✅ TypeScript compilation successful
4. ✅ Production build successful

---

## Success Criteria ✅

All criteria met:

- ✅ 400 error on empty canvas execution resolved
- ✅ Default query satisfies backend validation
- ✅ Custom input nodes override default query correctly
- ✅ Backward compatibility maintained
- ✅ Comprehensive tests added and passing
- ✅ All 46 tests passing
- ✅ 0 TypeScript errors
- ✅ Production build successful
- ✅ Issue documented and closed

---

## Known Issues

**Remaining Open**:
- [ ] 404 error for loader.js.map (development only, non-blocking)

See [issues.md](issues.md) for tracking.

---

## Next Release

**Target**: v0.7.0
**Focus**: Feature 4 - Assertion Builder & Validation
- Visual assertion builder component
- All 8 assertion types support
- Validation engine implementation
- Visual pass/fail indicators

---

## Contributors

- Claude Code (AI Assistant) - Investigation, Fix, Tests, Documentation
- Manav Sehgal (Product Owner) - Issue Reporting, Review

---

**Full Changelog**: v0.6.0...v0.6.1

🎉 **Empty canvas execution now works seamlessly!**
