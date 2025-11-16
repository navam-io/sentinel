# Migration Guide

Guide for upgrading between Sentinel versions.

## Table of Contents

- [Overview](#overview)
- [Version 0.1.0](#version-010)
- [Future Versions](#future-versions)
- [Migration Best Practices](#migration-best-practices)

## Overview

This guide helps you migrate your tests and code when upgrading Sentinel versions.

### Semantic Versioning

Sentinel follows [Semantic Versioning (semver)](https://semver.org/):

- **Major (X.0.0)**: Breaking changes - may require migration
- **Minor (0.X.0)**: New features - backward compatible
- **Patch (0.0.X)**: Bug fixes - backward compatible

### Checking Your Version

```python
import backend

print(backend.__version__)  # e.g., "0.1.0"
```

Or check the installed version:

```bash
cat backend/__init__.py | grep __version__
```

## Version 0.1.0

**Release Date**: November 15, 2025
**Type**: Initial Release

### What's New

This is the first release of Sentinel, introducing:

- **DSL Schema & Parser**: Pydantic-based test specification schema
- **YAML/JSON Support**: Parse and serialize test specifications
- **8 Assertion Types**: Comprehensive validation capabilities
- **6 Example Templates**: Production-ready test examples
- **Python API**: Programmatic access to parser and schema

### Installation

```bash
# Clone repository
git clone https://github.com/navam-io/sentinel.git
cd sentinel

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt
```

### No Migration Required

This is the initial release - no migration needed.

## Future Versions

### Version 0.2.0 (Planned)

**Expected**: Q1 2026
**Type**: Minor Release - Visual Canvas Foundation

#### Expected Changes

- New Tauri desktop app
- Visual test builder UI
- Node-based canvas
- YAML import/export from UI
- No breaking changes to DSL schema

#### Migration Impact

**DSL Files**: No changes required - all 0.1.0 YAML/JSON files will work in 0.2.0

**Python API**: Backward compatible - all 0.1.0 code will continue to work

#### Recommended Actions

1. **Keep existing tests**: No changes needed
2. **Try visual UI**: Import existing YAML files to visual canvas
3. **Update documentation**: Add visual workflow examples

---

### Version 0.3.0 (Planned)

**Expected**: Q1-Q2 2026
**Type**: Minor Release - Model Provider Architecture

#### Expected Changes

- Anthropic and OpenAI provider implementations
- Test execution engine
- Result storage
- No breaking changes to DSL

#### Migration Impact

**DSL Files**: No changes required

**New Capabilities**:
- Can execute tests (not just parse/validate)
- Store test results
- Compare runs

#### Recommended Actions

1. **Add API keys**: Configure provider API keys
2. **Run existing tests**: Execute tests against real models
3. **Review results**: Analyze test outcomes

---

### Version 1.0.0 (Future)

**Expected**: 2026
**Type**: Major Release - Production Ready

#### Potential Breaking Changes

When we reach 1.0.0, we may introduce breaking changes such as:

- **Schema changes**: New required fields or validation rules
- **API changes**: Modified function signatures
- **Provider changes**: Updated provider interfaces

#### Migration Path

We will provide:
- **Migration scripts**: Automated conversion of old test files
- **Deprecation warnings**: Advance notice before removing features
- **Detailed guide**: Step-by-step migration instructions
- **Compatibility mode**: Temporary support for old formats

---

## Migration Best Practices

### 1. Version Your Tests

Include version information in test suites:

```yaml
name: "My Test Suite"
version: "1.0.0"  # Your suite version
sentinel_version: "0.1.0"  # Sentinel version used

tests:
  # Your tests
```

### 2. Use Git for Test Files

Track test files in version control:

```bash
git init
git add tests/
git commit -m "Initial test suite for Sentinel 0.1.0"
```

### 3. Pin Dependencies

In `requirements.txt`:

```txt
# Pin exact versions for reproducibility
pydantic==2.0.0
pyyaml==6.0.0

# Or use minimum versions
pydantic>=2.0.0,<3.0.0
```

### 4. Test Before Upgrading

```bash
# Before upgrade
pytest tests/ -v --cov=backend

# Save results
pytest tests/ --json-report --json-report-file=pre-upgrade-results.json

# After upgrade, compare
pytest tests/ --json-report --json-report-file=post-upgrade-results.json
```

### 5. Use Feature Flags

Gradually adopt new features:

```yaml
# Old way (0.1.0)
name: "My Test"
model: "gpt-4"
inputs:
  query: "Hello"
assertions:
  - output_type: "text"

# New way (hypothetical 0.3.0)
name: "My Test"
model: "gpt-4"
provider: "openai"  # New field
inputs:
  query: "Hello"
assertions:
  - output_type: "text"
execution:  # New field
  enabled: true
  store_results: true
```

### 6. Keep Old Tests

Maintain tests in separate directories:

```bash
tests/
├── v0.1/  # Tests from 0.1.0
├── v0.2/  # Tests from 0.2.0
└── current/  # Active tests
```

### 7. Document Custom Extensions

If you extend Sentinel:

```python
# custom_validators.py
"""
Custom validators for Sentinel 0.1.0

WARNING: These may need updates when upgrading Sentinel.
Last tested with: Sentinel 0.1.0 (2025-11-15)
"""

from backend.core.schema import TestSpec

def validate_custom_rule(spec: TestSpec) -> bool:
    # Your custom validation
    pass
```

### 8. Subscribe to Release Notifications

Stay informed about updates:

- **GitHub**: Watch the [sentinel repository](https://github.com/navam-io/sentinel)
- **Releases**: Check [Release Notes](../backlog/)
- **Breaking Changes**: Review CHANGELOG.md before upgrading

### 9. Incremental Upgrades

Don't skip versions:

**Good**:
```
0.1.0 → 0.2.0 → 0.3.0 → 1.0.0
```

**Risky**:
```
0.1.0 → 1.0.0  # May miss important migration steps
```

### 10. Backup Before Upgrading

```bash
# Backup test files
tar -czf tests-backup-$(date +%Y%m%d).tar.gz tests/

# Backup virtual environment
cp -r venv venv-backup-0.1.0
```

## Deprecation Policy

### How We Handle Breaking Changes

1. **Announce**: New feature introduced, old feature marked deprecated
2. **Warn**: Deprecation warnings in next minor release
3. **Remove**: Deprecated feature removed in next major release

### Example Timeline

```
0.1.0: Feature X works normally
0.2.0: Feature Y introduced as alternative to X
       Feature X marked deprecated (warning messages)
0.3.0: Feature X still works but shows warnings
       Documentation recommends Feature Y
1.0.0: Feature X removed
       Feature Y is the standard
```

### Deprecation Warnings

```python
import warnings

# When using deprecated feature
warnings.warn(
    "TestSpec.old_field is deprecated and will be removed in 1.0.0. "
    "Use TestSpec.new_field instead.",
    DeprecationWarning,
    stacklevel=2
)
```

## Compatibility Matrix

| Sentinel Version | Python Version | Pydantic Version | YAML Files | JSON Files |
|------------------|----------------|------------------|------------|------------|
| 0.1.0            | 3.10+          | 2.0+             | ✅ Supported | ✅ Supported |
| 0.2.0 (planned)  | 3.10+          | 2.0+             | ✅ Supported | ✅ Supported |
| 0.3.0 (planned)  | 3.10+          | 2.0+             | ✅ Supported | ✅ Supported |
| 1.0.0 (future)   | 3.11+          | 2.5+             | ✅ Supported | ✅ Supported |

## Getting Help with Migration

### Resources

- **Documentation**: [docs/README.md](README.md)
- **Examples**: [docs/examples.md](examples.md)
- **GitHub Issues**: [Report migration problems](https://github.com/navam-io/sentinel/issues)
- **Release Notes**: Check `backlog/release-*.md` for detailed changes

### Migration Checklist

When upgrading:

- [ ] **Read release notes** for the new version
- [ ] **Check breaking changes** in CHANGELOG.md
- [ ] **Backup test files** and environment
- [ ] **Update dependencies** via `pip install -r backend/requirements.txt`
- [ ] **Run existing tests** to verify compatibility
- [ ] **Review deprecation warnings** in test output
- [ ] **Update code** to use new features/APIs
- [ ] **Test thoroughly** before deploying
- [ ] **Update documentation** with new patterns
- [ ] **Commit changes** to version control

## Future-Proofing Your Tests

### Write Portable Tests

```yaml
# Good - uses standard fields
name: "Portable Test"
model: "gpt-4"
inputs:
  query: "Hello"
assertions:
  - output_type: "text"

# Risky - depends on specific behavior
name: "Fragile Test"
model: "gpt-4-0613-snapshot-2023-11-15"  # Very specific version
# May break if model is deprecated
```

### Use Semantic Tags

```yaml
tags:
  - capability:qa
  - priority:p0
  - version:0.1.0
```

### Document Assumptions

```yaml
name: "My Test"
description: |
  This test assumes:
  - Model supports function calling
  - Tools are available: browser, calculator
  - Response time < 5 seconds

  Tested with: Sentinel 0.1.0, GPT-4 (2023-11-15)
```

## Example Migration Scenarios

### Scenario 1: Adding New Field

**0.1.0**:
```yaml
name: "Test"
model: "gpt-4"
inputs:
  query: "Hello"
assertions:
  - output_type: "text"
```

**0.3.0 (hypothetical)** - New optional field:
```yaml
name: "Test"
model: "gpt-4"
provider: "openai"  # NEW: optional field
inputs:
  query: "Hello"
assertions:
  - output_type: "text"
```

**Migration**: No changes required (backward compatible)

---

### Scenario 2: Renaming Field

**0.1.0**:
```yaml
model_config:
  temperature: 0.7
```

**1.0.0 (hypothetical)** - Field renamed:
```yaml
config:  # RENAMED from model_config
  temperature: 0.7
```

**Migration**: Update all occurrences:
```bash
# Automated migration
find tests/ -name "*.yaml" -exec sed -i 's/model_config:/config:/g' {} +
```

---

### Scenario 3: New Required Field

**0.1.0**:
```yaml
name: "Test"
model: "gpt-4"
```

**1.0.0 (hypothetical)** - New required field:
```yaml
name: "Test"
model: "gpt-4"
provider: "openai"  # NOW REQUIRED
```

**Migration**: Add to all tests:
```python
from backend.core.parser import TestSpecParser

# Load old test
spec = TestSpecParser.parse_file("old_test.yaml")

# Add required field
spec.provider = "openai"  # Infer from model name or set manually

# Save updated test
TestSpecParser.write_file(spec, "updated_test.yaml")
```

## Stay Updated

- **GitHub**: Star and watch [sentinel repository](https://github.com/navam-io/sentinel)
- **Releases**: Subscribe to release notifications
- **Changelog**: Review `CHANGELOG.md` before each upgrade

## See Also

- [Getting Started Guide](getting-started.md)
- [DSL Reference](dsl-reference.md)
- [API Reference](api-reference.md)
- [Release Notes](../backlog/release-0.1.0.md)
