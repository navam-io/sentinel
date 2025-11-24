# Tauri 2.1 → 2.9.3 Upgrade Plan

**Document Version**: 1.0
**Created**: 2025-11-24
**Target Release**: v0.25.0
**Status**: Planning

## Executive Summary

This document outlines the upgrade plan for Tauri from version 2.1.x to 2.9.3 across both Rust and JavaScript dependencies. The upgrade addresses version mismatches, enables new features (submenu icons in 2.8.0+), and ensures all dependencies are on the latest stable releases.

**Risk Level**: LOW (minor version upgrade within Tauri 2.x)

## Current State Analysis

### Current Versions

**Rust Dependencies** (`frontend/src-tauri/Cargo.toml`):
- `tauri`: 2.1 → **Upgrade to 2.9.3**
- `tauri-build`: 2.1 → **Upgrade to 2.5.2**
- `tauri-plugin-fs`: 2.1 → **Upgrade to 2.4.4**
- `tauri-plugin-dialog`: 2.1 → **Upgrade to 2.4.0**
- `tauri-plugin-shell`: 2.1 → **Upgrade to 2.3.3**
- `tauri-plugin-clipboard-manager`: 2.0 → **Upgrade to 2.3.2**

**JavaScript Dependencies** (`frontend/package.json`):
- `@tauri-apps/api`: 2.9.0 ✅ (already latest)
- `@tauri-apps/cli`: 2.1.0 → **Upgrade to 2.9.4**
- `@tauri-apps/plugin-fs`: 2.4.4 ✅ (already latest)
- `@tauri-apps/plugin-clipboard-manager`: 2.3.2 ✅ (already latest)

### Current Tauri Usage Analysis

**Rust Side** (`frontend/src-tauri/src/main.rs`):
- Plugin initialization: `tauri_plugin_fs`, `tauri_plugin_dialog`, `tauri_plugin_shell`, `tauri_plugin_clipboard_manager`
- Custom commands: `greet`, `get_project_root`
- DevTools integration (debug mode)
- Standard builder pattern

**JavaScript/TypeScript Side**:
- File operations: `readDir`, `readTextFile` from `@tauri-apps/plugin-fs`
- Path resolution: `resolveResource` from `@tauri-apps/api/path`
- Core invoke: `invoke` from `@tauri-apps/api/core`
- Clipboard: `writeText` from `@tauri-apps/plugin-clipboard-manager`

**Usage Locations**:
1. `frontend/src/services/templates.ts` - Template loading (fs, path, invoke)
2. `frontend/src/components/yaml/YamlPreview.tsx` - Copy to clipboard

## Upgrade Benefits

### New Features Unlocked

**Tauri 2.8.0+**:
- **Submenu icons support**: New capability to add icons to submenu items
  - Rust: `.submenu_icon(Some(icon))`
  - JavaScript: `icon` parameter in menu config
  - Supports custom images and native platform icons

**Tauri 2.9.x**:
- Icon rendering quality improvements (2.9.4 CLI fix for SVG icons)
- Bug fixes and stability improvements
- Security updates

### Bug Fixes

- **Fixed**: Gray fringe around icons for SVG images (tauri-cli 2.9.4)
- Various stability and performance improvements

### Version Consistency

- Eliminates version mismatch between Rust core (2.1) and JS API (2.9.0)
- Aligns all plugins to latest stable versions
- Ensures plugin-to-core compatibility

## Breaking Changes Assessment

### Between 2.1 and 2.9.3

**Good News**: Tauri follows semantic versioning strictly within 2.x. Minor version upgrades (2.1 → 2.9) should NOT introduce breaking changes.

**Expected Changes**:
- ✅ No API breaking changes expected
- ✅ No plugin interface changes expected
- ✅ Additive features only (submenu icons, bug fixes)
- ⚠️ Security advisories for unmaintained GTK3 bindings (Linux only, informational)

**Risk Factors**:
- **Low**: Current usage is minimal and uses stable APIs
- **Low**: No advanced or experimental features used
- **Low**: All APIs used are core, well-established patterns

## Upgrade Strategy

### Phase 1: Preparation (Pre-Upgrade)

**1. Backup Current State**
```bash
# Create feature branch
git checkout -b upgrade/tauri-2.9.3

# Snapshot current versions
cp frontend/src-tauri/Cargo.toml frontend/src-tauri/Cargo.toml.backup
cp frontend/package.json frontend/package.json.backup
```

**2. Run Baseline Tests**
```bash
# Frontend tests (all should pass: 389 unit + 21 E2E = 410 tests)
cd frontend
npm test                    # Vitest unit tests
npm run test:e2e           # Playwright E2E tests

# Backend tests (should pass: 49 tests)
cd ..
pytest

# Document test results
echo "Baseline: All 459 tests passing" > upgrade-test-results.txt
```

**3. Build Current Version**
```bash
cd frontend
npm run tauri:build        # Verify current version builds successfully
```

### Phase 2: Rust Dependencies Upgrade

**1. Update Cargo.toml**

```toml
# frontend/src-tauri/Cargo.toml

[build-dependencies]
tauri-build = { version = "2.5", features = [] }

[dependencies]
tauri = { version = "2.9", features = ["devtools"] }
tauri-plugin-fs = "2.4"
tauri-plugin-dialog = "2.4"
tauri-plugin-shell = "2.3"
tauri-plugin-clipboard-manager = "2.3"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

**2. Update Cargo.lock**
```bash
cd frontend/src-tauri
cargo update               # Update to latest compatible versions
cargo check                # Verify compilation
```

**3. Verify No Breaking Changes**
```bash
cargo build                # Should build without errors
cargo clippy               # Check for warnings
```

### Phase 3: JavaScript Dependencies Upgrade

**1. Update package.json**

```json
{
  "devDependencies": {
    "@tauri-apps/cli": "^2.9.4"
  }
}
```

**Note**: `@tauri-apps/api` is already on 2.9.0 (latest), no update needed.

**2. Install Updates**
```bash
cd frontend
npm install                # Install updated packages
npm audit                  # Check for vulnerabilities
```

### Phase 4: Testing & Validation

**1. Type Checking**
```bash
cd frontend
npm run type-check         # Must pass with 0 errors
npm run lint               # Must pass
```

**2. Unit Tests**
```bash
npm test                   # All 389 tests must pass
```

**3. E2E Tests**
```bash
npm run test:e2e           # All 21 tests must pass
```

**4. Backend Tests**
```bash
cd ..
pytest                     # All 49 tests must pass
```

**5. Manual Testing Checklist**

Create test plan in `upgrade-test-checklist.md`:

**Desktop App Testing**:
- [ ] App launches successfully (dev mode: `npm run tauri:dev`)
- [ ] DevTools open in debug mode
- [ ] Main window renders correctly
- [ ] No console errors on startup

**Tauri Features Testing**:
- [ ] Template loading works (`services/templates.ts`)
  - [ ] `readDir` lists template files
  - [ ] `readTextFile` reads YAML content
  - [ ] `resolveResource` resolves template paths correctly
  - [ ] `invoke('get_project_root')` returns correct path
- [ ] Clipboard functionality (`YamlPreview.tsx`)
  - [ ] "Copy to Clipboard" button works
  - [ ] `writeText` copies YAML content correctly
- [ ] File system operations
  - [ ] Template import/export works
  - [ ] File dialogs open correctly

**Cross-Platform Testing** (if applicable):
- [ ] macOS: Build and run
- [ ] Windows: Build and run (if available)
- [ ] Linux: Build and run (if available)

**Build Testing**:
```bash
npm run tauri:build        # Production build must succeed
```

- [ ] Production build completes successfully
- [ ] Binary size is reasonable (< 20MB for desktop)
- [ ] Built app launches and runs correctly

### Phase 5: Documentation Update

**1. Update CLAUDE.md**

Update tech stack section with new versions:
```markdown
**Frontend (Visual UI)**
- **Tauri 2.9**: Rust core + TypeScript UI (desktop app) ← UPDATED
```

**2. Update CHANGELOG.md**

Add entry for the upgrade:
```markdown
## [0.25.0] - 2025-11-XX

### Changed
- Upgraded Tauri from 2.1 to 2.9.3 for latest features and bug fixes
- Updated all Tauri plugins to latest stable versions
- Fixed version mismatch between Rust core and JS API

### Added
- Support for submenu icons (Tauri 2.8.0+)
- Improved icon rendering quality (no more gray fringe on SVG icons)
```

**3. Create Release Notes**

Create `releases/v0.25.0.md`:
```markdown
# Release v0.25.0: Tauri 2.9.3 Upgrade

**Release Date**: TBD
**Type**: Infrastructure Upgrade

## Highlights

- Upgraded to Tauri 2.9.3 (from 2.1)
- All Tauri plugins updated to latest stable versions
- New feature: Submenu icon support unlocked
- Improved icon rendering quality

## Technical Details

[Summary of changes...]
```

## Rollback Plan

If upgrade causes issues:

**1. Immediate Rollback**
```bash
# Restore backup files
cp frontend/src-tauri/Cargo.toml.backup frontend/src-tauri/Cargo.toml
cp frontend/package.json.backup frontend/package.json

# Reinstall old versions
cd frontend/src-tauri && cargo update
cd .. && npm install

# Verify rollback
npm test && npm run test:e2e
```

**2. Git Rollback**
```bash
git checkout main          # Return to main branch
git branch -D upgrade/tauri-2.9.3  # Delete upgrade branch
```

## Risk Mitigation

### Pre-Upgrade Checklist

- [x] Document current versions
- [x] Analyze Tauri usage in codebase
- [x] Review changelog for breaking changes
- [ ] Run full test suite (baseline)
- [ ] Create feature branch
- [ ] Backup configuration files

### Post-Upgrade Checklist

- [ ] All tests passing (459 total)
- [ ] TypeScript type checking passes (0 errors)
- [ ] Manual testing completed
- [ ] Production build succeeds
- [ ] Documentation updated
- [ ] Commit changes with clear message
- [ ] Create release notes

### Monitoring Plan

After upgrade, monitor for:
- [ ] Build time changes (should remain < 2min for dev builds)
- [ ] App startup time (target: < 2s)
- [ ] Memory usage (should be stable)
- [ ] File operations performance (template loading)
- [ ] Clipboard operations reliability

## Timeline Estimate

**Total Time**: 2-3 hours

| Phase | Estimated Time | Responsible |
|-------|---------------|-------------|
| Phase 1: Preparation | 30 min | Developer |
| Phase 2: Rust Upgrade | 20 min | Developer |
| Phase 3: JS Upgrade | 10 min | Developer |
| Phase 4: Testing | 60 min | Developer + QA |
| Phase 5: Documentation | 30 min | Developer |

## Success Criteria

✅ Upgrade is successful when:

1. **All tests pass**: 459 tests (389 unit + 21 E2E + 49 backend)
2. **Type checking passes**: 0 TypeScript errors
3. **Build succeeds**: Production build completes without errors
4. **Manual tests pass**: All checklist items verified
5. **No regressions**: All existing features work as before
6. **New features available**: Submenu icons API accessible
7. **Documentation updated**: CLAUDE.md, CHANGELOG.md, release notes

## References

- [Tauri 2 Releases](https://v2.tauri.app/release/)
- [Tauri GitHub Releases](https://github.com/tauri-apps/tauri/releases)
- [Tauri Migration Guide](https://v2.tauri.app/start/migrate/)
- [Tauri Window Menu Docs](https://v2.tauri.app/learn/window-menu/) - New in 2.8.0
- [Dialog Plugin Docs](https://v2.tauri.app/plugin/dialog/)
- [File System Plugin Docs](https://v2.tauri.app/plugin/file-system/)
- [Shell Plugin Docs](https://v2.tauri.app/plugin/shell/)
- [Clipboard Plugin Docs](https://v2.tauri.app/plugin/clipboard/)

## Appendix A: Version Comparison

| Package | Current | Target | Change |
|---------|---------|--------|--------|
| tauri (Rust) | 2.1.0 | 2.9.3 | +8 minor |
| tauri-build | 2.1.0 | 2.5.2 | +4 minor |
| tauri-plugin-fs | 2.1.0 | 2.4.4 | +3 minor |
| tauri-plugin-dialog | 2.1.0 | 2.4.0 | +3 minor |
| tauri-plugin-shell | 2.1.0 | 2.3.3 | +2 minor |
| tauri-plugin-clipboard-manager | 2.0.0 | 2.3.2 | +3 minor |
| @tauri-apps/api | 2.9.0 | 2.9.0 | No change ✅ |
| @tauri-apps/cli | 2.1.0 | 2.9.4 | +8 minor |

## Appendix B: Test Coverage

**Frontend Tests** (389 unit + 21 E2E = 410):
- Canvas components (Canvas, CanvasControls)
- Node components (InputNode, ModelNode, AssertionNode, ToolNode, SystemNode)
- UI components (shared components)
- Custom hooks (useAutoSave, useTemplates, useExecution)
- Services (API client, storage, templates)
- Store management (Zustand)
- E2E user journeys (Playwright)

**Backend Tests** (49):
- Providers (Anthropic, OpenAI)
- Validators (assertion validation)
- Storage (database operations)
- API (FastAPI endpoints)
- Core (schema and parser)

**Critical Tauri Integration Tests**:
- Template loading via `readDir`, `readTextFile`
- Path resolution via `resolveResource`
- Custom command invocation: `get_project_root`
- Clipboard operations: `writeText`

## Appendix C: Security Considerations

**Known Issues** (Informational):
- Unmaintained GTK3 bindings for Linux (atk, gdk, gdkwayland-sys, gdkx11)
  - **Impact**: Low - Linux UI library dependencies
  - **Mitigation**: Tauri team aware, future migration to GTK4 planned
  - **Action**: Monitor but no immediate action required

**Security Improvements**:
- Updated to latest stable releases with security patches
- npm audit after upgrade to check for vulnerabilities

## Appendix D: Post-Upgrade Opportunities

After successful upgrade, consider:

1. **Menu System Enhancement** (v0.26.0+)
   - Implement application menu with new submenu icon support
   - Add File, Edit, View, Help menus
   - Platform-specific menu handling (macOS menu bar)

2. **Window Management** (Future)
   - Multiple window support
   - Custom title bar
   - Window state persistence

3. **Advanced Features** (Future)
   - System tray integration
   - Global shortcuts
   - Native notifications
   - Deep linking

---

**Document Status**: Ready for Review
**Next Steps**: Execute Phase 1 (Preparation) when approved