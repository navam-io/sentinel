# Release v0.8.1 - Source Map Fix for Development

**Release Date**: November 16, 2025
**Type**: Patch Release
**Status**: ✅ Complete

---

## Summary

This release fixes a 404 error that appeared in the browser console during development when source maps were not being generated. The fix improves the development experience by enabling source maps for all non-production builds.

**Key Fix**: Source maps are now generated for development builds, eliminating 404 console errors and improving debugging experience.

---

## Bug Fixes

### 🐛 404 Error for loader.js.map in Development

**Issue**: [#9 - 404 Error for loader.js.map in Development](issues.md#issue-9)

**Problem**:
During development, the browser console showed a 404 error:
```
[Error] Failed to load resource: the server responded with a status of 404 () (loader.js.map, line 0)
```

This occurred because Vite was not configured to generate source maps for regular development builds (`npm run dev` or `npm run build`).

**Root Cause**:
In `vite.config.ts`, the source map configuration was:
```typescript
sourcemap: !!process.env.TAURI_DEBUG
```

This meant source maps were only generated when `TAURI_DEBUG` was explicitly set, which is not the case for normal development workflows.

**Solution**:
Updated the configuration to generate source maps for all non-production builds:

```typescript
// Before
sourcemap: !!process.env.TAURI_DEBUG

// After
sourcemap: process.env.NODE_ENV === 'production' ? false : true
```

**Impact**:
- ✅ Source maps generated during development
- ✅ No more 404 errors in browser console
- ✅ Better debugging experience with proper source mapping
- ✅ Production builds still skip source maps (smaller bundle)

---

## Technical Changes

### File Modified

**File**: `frontend/vite.config.ts`

**Change** (Line 39):
```typescript
// Before
build: {
  target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
  minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
  sourcemap: !!process.env.TAURI_DEBUG,  // ❌ Only with TAURI_DEBUG
},

// After
build: {
  target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
  minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
  sourcemap: process.env.NODE_ENV === 'production' ? false : true,  // ✅ All dev builds
},
```

**Impact**: 1 line changed

---

## Behavior Comparison

### Before Fix

| Build Type | Source Maps | Result |
|-----------|-------------|---------|
| `npm run dev` | ❌ Not generated | 404 error in console |
| `npm run build` | ❌ Not generated | 404 error in console |
| `TAURI_DEBUG=true npm run build` | ✅ Generated | No error |
| Production (`NODE_ENV=production`) | ❌ Not generated | No error (expected) |

### After Fix

| Build Type | Source Maps | Result |
|-----------|-------------|---------|
| `npm run dev` | ✅ Generated | ✅ No error, better debugging |
| `npm run build` (dev) | ✅ Generated | ✅ No error, better debugging |
| `TAURI_DEBUG=true npm run build` | ✅ Generated | ✅ No error (as before) |
| Production (`NODE_ENV=production`) | ❌ Not generated | ✅ Smaller bundle |

---

## Testing

### Test Results
- ✅ All 46 tests passing
- ✅ 0 TypeScript errors
- ✅ Development build successful with source maps
- ✅ Production build successful without source maps

### Verification

**Development Build**:
```bash
NODE_ENV=development npm run build
```

**Output**:
```
dist/assets/index-Cn6zzuQW.js   760.22 kB │ gzip: 226.22 kB │ map: 3,129.18 kB
                                                              ^^^^^^^^^^^^^^^^
                                                              Source map generated!
```

**File Created**:
```bash
ls -lh dist/assets/*.map
# -rw-r--r--  1 user  staff   3.0M Nov 16 15:01 dist/assets/index-Cn6zzuQW.js.map
```

---

## Breaking Changes

None. This is a transparent bug fix.

**Backward Compatibility**:
- ✅ All existing workflows unchanged
- ✅ No API changes
- ✅ No schema changes
- ✅ Tests continue to pass

---

## Developer Experience Improvements

### Before
- ❌ 404 errors cluttered console during development
- ❌ Limited debugging capabilities without source maps
- ❌ Had to manually set `TAURI_DEBUG=true` to get source maps
- ❌ Inconsistent development experience

### After
- ✅ Clean console without 404 errors
- ✅ Full source map support for debugging
- ✅ Source maps work out of the box in development
- ✅ Consistent, better development experience

---

## Files Changed

### Modified
- `frontend/vite.config.ts`
  - Updated sourcemap build option
  - Impact: 1 line changed

- `frontend/package.json`
  - Version: 0.8.0 → 0.8.1
  - Impact: 1 line changed

**Total Changes**: 2 lines modified

---

## Migration Guide

No migration needed. This is a transparent bug fix.

**For Developers**:
- Source maps now work automatically in development
- No action required
- Cleaner console output

---

## What Are Source Maps?

**Source maps** are files that map minified/compiled code back to the original source code, making debugging much easier.

**Benefits**:
- See original TypeScript/JSX code in browser DevTools
- Set breakpoints in original source files
- View meaningful stack traces
- Better error messages

**Why Not in Production?**:
- Smaller bundle size (no .map files)
- Faster load times
- Security (don't expose source code)

---

## Success Criteria ✅

All criteria met:

- ✅ 404 errors eliminated from console
- ✅ Source maps generated for development builds
- ✅ Source maps NOT generated for production builds
- ✅ All 46 tests passing
- ✅ 0 TypeScript errors
- ✅ Development build successful
- ✅ Production build successful
- ✅ Source map file verified (3.0MB)

---

## Known Issues

**Remaining Open**:
- [ ] 400 Bad Request on execution (investigating if different from v0.6.1 fix)

See [issues.md](issues.md) for tracking.

---

## Next Release

**Target**: v0.8.2 or v0.9.0
**Focus**: TBD based on remaining open issues
- Investigate remaining 400 Bad Request error
- Potential new features or enhancements

---

## Contributors

- Claude Code (AI Assistant) - Investigation, Fix, Testing, Documentation
- Manav Sehgal (Product Owner) - Issue Reporting, Review

---

**Full Changelog**: v0.8.0...v0.8.1

🎉 **Development experience improved with proper source map support!**
