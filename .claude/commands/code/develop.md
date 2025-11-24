Think harder to complete these tasks:

1. Read backlog/active.md
2. Understand the current state of the project
3. Identify the next feature to implement
4. Develop the feature
5. Create tests for the feature ensuring these are testing feature in production and not faking it
6. Run all tests and fix any regressions
7. Determine semver increment (major, minor, patch) based on feature size
8. Update version numbers in:
   - frontend/package.json
   - frontend/src-tauri/tauri.conf.json
   - backend/main.py
9. Create release notes at `releases/release-X.X.X.md` (following existing naming convention)
10. Update CHANGELOG.md with the new version section
11. Mark the feature complete in backlog/active.md (move from "Not Started" to "Completed ✅" section)

## File Naming Conventions

- Release notes: `releases/release-X.X.X.md` (e.g., `release-0.28.0.md`)
- Hotfix notes: `releases/hotfix-X.X.X-description.md` (e.g., `hotfix-0.12.1-ui-improvements.md`)
- Never use `vX.X.X.md` format - always use `release-X.X.X.md`
