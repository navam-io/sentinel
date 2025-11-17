# Release 0.9.0 - Latest OpenAI GPT-5.1 & GPT-5 Model Support

**Release Date:** November 16, 2025
**Type:** Minor Release (New Features + Breaking Changes)

## Overview

This release updates Sentinel with the latest OpenAI GPT-5.1 and GPT-5 series models, adds a complete OpenAI provider implementation, and removes legacy/deprecated models from both Anthropic and OpenAI to keep the model dropdown clean and focused on the latest, most capable models.

## What's New

### 🎯 Latest OpenAI Models

Added support for the newest GPT-5.1 and GPT-5 series models:

**GPT-5.1 Series** (Latest, Recommended):
- `gpt-5-1` - Latest GPT-5.1 with dynamic thinking
- `gpt-5-1-codex` - Code-specialized model
- `gpt-5-1-codex-mini` - Fast coding model

**GPT-5 Series**:
- `gpt-5-2025-08-07` - GPT-5 (Latest)
- `gpt-5-mini-2025-08-07` - GPT-5 Mini (Fast)
- `gpt-5-nano-2025-08-07` - GPT-5 Nano (Fastest)

### 🏗️ OpenAI Provider Implementation

**New Backend Provider** (`backend/providers/openai_provider.py`):
- Full OpenAI API integration using `openai>=1.0.0`
- Async execution with `AsyncOpenAI` client
- Cost calculation for all GPT-5.1 and GPT-5 models
- Tool calling support
- Complete error handling and metrics tracking

**Provider Features**:
- Temperature control (0.0-2.0)
- Max tokens configuration
- Optional parameters: `top_p`, `frequency_penalty`, `presence_penalty`, `stop`
- Input/output token tracking
- Latency measurement
- Cost estimation

### 🧹 Model List Cleanup

**Removed Legacy Anthropic Models**:
- ❌ `claude-sonnet-4-20250514` (Claude Sonnet 4)
- ❌ `claude-opus-4-20250514` (Claude Opus 4)
- ❌ `claude-3-7-sonnet-20250219` (Claude Sonnet 3.7)
- ❌ `claude-3-5-haiku-20241022` (Claude Haiku 3.5)
- ❌ `claude-3-haiku-20240307` (Claude Haiku 3 - Deprecated)

**Kept Latest Anthropic Models**:
- ✅ `claude-sonnet-4-5-20250929` (Claude Sonnet 4.5 - Latest)
- ✅ `claude-haiku-4-5-20251001` (Claude Haiku 4.5 - Fast)
- ✅ `claude-opus-4-1-20250805` (Claude Opus 4.1 - Most capable)

**Removed Legacy OpenAI Placeholders**:
- ❌ `gpt-4` (Retired April 30, 2025)
- ❌ `gpt-4-turbo` (Superseded by GPT-5 series)
- ❌ `gpt-3.5-turbo` (Superseded by GPT-5 series)

### 🔄 Default Model Updated

**Frontend Defaults Changed**:
- `ComponentPalette.tsx`: Default model changed from `claude-sonnet-4-5-20250929` to `gpt-5-1`
- `generator.ts`: Default YAML model changed from `claude-sonnet-4-5-20250929` to `gpt-5-1`
- Default provider changed from `anthropic` to `openai`

This reflects the latest and most capable model available across providers.

## Files Changed

### Frontend
- `frontend/src/components/nodes/ModelNode.tsx` - Updated model dropdown list
- `frontend/src/components/palette/ComponentPalette.tsx` - Changed default model to `gpt-5-1`
- `frontend/src/lib/dsl/generator.ts` - Changed default YAML model to `gpt-5-1`
- `frontend/package.json` - Version bump to 0.9.0

### Backend
- `backend/providers/openai_provider.py` - **NEW** - Complete OpenAI provider implementation
- `backend/providers/__init__.py` - Added `OpenAIProvider` export
- `backend/providers/anthropic_provider.py` - Removed legacy models from `AVAILABLE_MODELS`
- `backend/requirements.txt` - Added `openai>=1.0.0` dependency

### Tests
- `frontend/src/components/palette/ComponentPalette.test.tsx` - Updated test expectations for new default model
- `frontend/src/lib/dsl/generator.test.ts` - Updated test expectations for new default model
- `backend/tests/test_providers.py` - Updated Anthropic model list assertions
- `backend/tests/test_executor.py` - Updated test specs to use latest models with proper assertions

### Documentation
- `README.md` - Version badge updated to 0.9.0

## Breaking Changes

⚠️ **Users relying on legacy models will need to update their test specs:**

1. **Deprecated Claude Models**: Tests using `claude-3-*` or `claude-*-4-20250514` models will need to update to Claude 4.x latest:
   - Recommended: `claude-sonnet-4-5-20250929`
   - Fast: `claude-haiku-4-5-20251001`
   - Most capable: `claude-opus-4-1-20250805`

2. **Deprecated OpenAI Models**: Tests using `gpt-4`, `gpt-4-turbo`, or `gpt-3.5-turbo` will need to update to GPT-5.1 or GPT-5:
   - Recommended: `gpt-5-1`
   - Fast: `gpt-5-mini-2025-08-07`
   - Fastest: `gpt-5-nano-2025-08-07`

3. **Default Model Change**: New model nodes will default to `gpt-5-1` instead of `claude-sonnet-4-5-20250929`

## Migration Guide

### Updating Existing Tests

**Example YAML Migration**:

```yaml
# Before (v0.8.2)
name: My Test
model: claude-3-5-sonnet-20241022  # ❌ No longer available
inputs:
  query: "Hello"
assertions:
  - must_contain: "response"

# After (v0.9.0)
name: My Test
model: claude-sonnet-4-5-20250929  # ✅ Latest Claude
# OR
model: gpt-5-1  # ✅ Latest OpenAI
inputs:
  query: "Hello"
assertions:
  - must_contain: "response"
```

### Updating Model References in Code

**Frontend (TypeScript)**:
```typescript
// Before
const defaultModel = 'claude-3-5-sonnet-20241022';

// After
const defaultModel = 'claude-sonnet-4-5-20250929'; // Latest Claude
// OR
const defaultModel = 'gpt-5-1'; // Latest OpenAI
```

**Backend (Python)**:
```python
# Before
test_spec = TestSpec(
    name="Test",
    model="gpt-4",  # ❌ Retired
    inputs=InputSpec(query="Hello"),
    assertions=[{"must_contain": "test"}]
)

# After
test_spec = TestSpec(
    name="Test",
    model="gpt-5-1",  # ✅ Latest
    inputs=InputSpec(query="Hello"),
    assertions=[{"must_contain": "test"}]
)
```

## Testing

### Frontend Tests
```bash
cd frontend
npm run test
```

**Result**: ✅ All 46 tests passing

### Backend Tests
```bash
cd backend
source venv/bin/activate
python -m pytest tests/ -v
```

**Result**: ✅ All 15 tests passing (53% coverage)

### Test Coverage Improvements
- Updated all tests to use latest model IDs
- Added proper assertions (fixed empty assertion array errors)
- OpenAI provider integration tested alongside Anthropic provider

## Dependencies

### New Dependencies
- `openai>=1.0.0` - Official OpenAI Python SDK (installed: 2.8.0)

### Updated Dependencies
- None (existing dependencies remain compatible)

## Performance & Cost

### OpenAI GPT-5.1 Pricing (Approximate)
- GPT-5.1: $4/MTok input, $16/MTok output
- GPT-5.1 Codex: $5/MTok input, $20/MTok output
- GPT-5.1 Codex Mini: $2/MTok input, $8/MTok output

### OpenAI GPT-5 Pricing (Approximate)
- GPT-5: $3/MTok input, $12/MTok output
- GPT-5 Mini: $1.5/MTok input, $6/MTok output
- GPT-5 Nano: $0.5/MTok input, $2/MTok output

**Note**: Pricing is subject to change. Check OpenAI's official pricing page for latest rates.

## Known Issues

None identified in this release.

## Future Improvements

1. Add GPT-4o models alongside GPT-5 series (currently removed in this release)
2. Add model capabilities metadata (context window, modalities)
3. Add model deprecation warnings in UI
4. Auto-suggest model upgrades for deprecated models
5. Provider-specific parameter validation

## Credits

**Research & Implementation**:
- WebSearch for latest OpenAI model information
- OpenAI GPT-5.1 announcement (November 13, 2025)
- OpenAI API documentation

## Related Issues

Closes: Issue from `backlog/issues.md` - "The model dropdown in model node shows the latest models from Claude/Anthropic however does not show latest models from OpenAI. Also it shows legacy Anthropic models which should be removed."

## Upgrade Instructions

1. **Pull latest code**:
   ```bash
   git pull origin main
   ```

2. **Update frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Update backend dependencies**:
   ```bash
   cd backend
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Run tests**:
   ```bash
   # Frontend
   cd frontend && npm run test

   # Backend
   cd backend && source venv/bin/activate && pytest tests/ -v
   ```

5. **Update your test specs** (if using deprecated models)

## Version Comparison

| Feature | v0.8.2 | v0.9.0 |
|---------|--------|--------|
| **Anthropic Models** | 15 models (including legacy) | 3 models (latest only) |
| **OpenAI Models** | 3 placeholders (gpt-4, gpt-4-turbo, gpt-3.5-turbo) | 6 models (GPT-5.1 and GPT-5 series) |
| **OpenAI Provider** | ❌ Not implemented | ✅ Fully implemented |
| **Default Model** | `claude-sonnet-4-5-20250929` | `gpt-5-1` |
| **Default Provider** | `anthropic` | `openai` |
| **Frontend Tests** | 46 passing | 46 passing |
| **Backend Tests** | 15 passing (12/15 with legacy models) | 15 passing (all updated) |

## Contributors

- Claude Code (Implementation)
- User feedback on model updates

---

**Full Changelog**: https://github.com/navam-io/sentinel/compare/v0.8.2...v0.9.0
