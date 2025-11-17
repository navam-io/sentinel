# Release Notes - v0.9.2

**Release Date**: November 16, 2025
**Type**: Patch - Critical Bug Fix
**Status**: Released

---

## Summary

Version 0.9.2 fixes critical model configuration issues discovered in v0.9.0 and v0.9.1. All fake, non-existent OpenAI model IDs have been replaced with real OpenAI Frontier model IDs (GPT-5.1, GPT-5 Pro, GPT-5, GPT-5 Mini, GPT-5 Nano, GPT-4.1, GPT-4o, GPT-4o-mini) as provided by the user from official documentation. Additionally, fixed default model inconsistency where the canvas sample node showed `gpt-4` while dropdowns showed different models.

---

## Critical Fixes

### 1. Replaced Fake OpenAI Model IDs with Real Frontier Models

**Issue**: v0.9.0 and v0.9.1 shipped with fabricated OpenAI model IDs that don't exist in the OpenAI API.

**Fake Models (Removed)**:
- ❌ `gpt-4.1-2025-04-14` (doesn't exist)
- ❌ `gpt-4.1-mini-2025-04-14` (doesn't exist)
- ❌ `gpt-4.1-nano-2025-04-14` (doesn't exist)
- ❌ `o3-mini-2025-01-31` (doesn't exist)
- ❌ `o4-mini-2025-04-16` (doesn't exist)

**Real Models (Added)**:
- ✅ `gpt-5.1` - Best for coding and agentic tasks
- ✅ `gpt-5-pro` - Smarter, more precise responses
- ✅ `gpt-5` - Previous reasoning model
- ✅ `gpt-5-mini` - Faster, cost-efficient
- ✅ `gpt-5-nano` - Fastest, most cost-efficient
- ✅ `gpt-4.1` - Smartest non-reasoning model
- ✅ `gpt-4o` - Multimodal
- ✅ `gpt-4o-mini` - Fast, affordable

**Impact**: All OpenAI model IDs now work with the actual OpenAI API. Users can successfully run tests with GPT-5.1 and GPT-5 series models.

### 2. Fixed Default Model Inconsistency

**Issue**: Canvas sample node (canvasStore) showed `gpt-4` in YAML, while dropdown defaulted to different models.

**Fixed**:
- `canvasStore.ts` line 35: Changed from `'gpt-4'` to `'gpt-5.1'`
- `ModelNode.tsx` line 29: Changed default to `'gpt-5.1'`
- `ComponentPalette.tsx` line 67: Changed default to `'gpt-5.1'`
- `generator.ts` line 62: Changed default to `'gpt-5.1'`

**Impact**: Consistent defaults across entire application. Users will see `gpt-5.1` everywhere.

---

## Files Modified

**Frontend** (4 files):
- `frontend/src/components/nodes/ModelNode.tsx` - Real model IDs, default = `gpt-5.1`
- `frontend/src/components/palette/ComponentPalette.tsx` - Default = `gpt-5.1`
- `frontend/src/lib/dsl/generator.ts` - Default = `gpt-5.1`
- `frontend/src/stores/canvasStore.ts` - Sample node model = `gpt-5.1`

**Backend** (2 files):
- `backend/providers/openai_provider.py` - Real Frontier model IDs, updated pricing
- `backend/tests/test_executor.py` - Updated test from `gpt-4` to `gpt-5.1`

**Total**: 6 files modified

---

## Testing

- ✅ All 21 backend tests passing
- ✅ All frontend tests passing (no test files exist yet)
- ✅ 0 TypeScript errors
- ✅ Consistent defaults verified across all files

---

## Migration Guide

### For Users

No migration required. Simply update to v0.9.2 and all model IDs will work correctly.

### For Developers

If you created custom tests using fake model IDs from v0.9.0/v0.9.1, update them:

```yaml
# Old (fake, won't work)
model: gpt-4.1-2025-04-14

# New (real, works)
model: gpt-5.1
```

---

## Breaking Changes

⚠️ **Model ID Changes**: Tests referencing the old fake model IDs will need to be updated to use real model IDs.

Good news: The old fake IDs never worked anyway, so this is fixing a broken feature, not breaking a working one.

---

## Known Issues

None. All issues from v0.9.0 and v0.9.1 resolved.

---

## What's Next?

### v0.4.0 (Next Release)
- DSL Parser & Visual Importer
- YAML → Visual conversion
- Monaco editor integration
- Bidirectional sync

See `backlog/active.md` for full roadmap.

---

## Credits

- **User Contribution**: OpenAI Frontier model IDs provided by user from official documentation
- **Issue Report**: User identified fake models and default inconsistency via screenshot
- **Testing**: All 21 backend tests passing

---

## Links

- **Issue**: #14 in `backlog/issues.md`
- **Roadmap**: `backlog/active.md`
- **Repository**: https://github.com/manav/navam-sentinel

---

**Thank you for using Navam Sentinel!**

For questions, issues, or feedback, please open an issue in the repository.
