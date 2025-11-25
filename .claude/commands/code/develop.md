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
11. Clean up backlog/active.md:
    - Add the completed feature to the "Completed Features Summary" table
    - Remove the detailed feature section from active.md (feature details are now in release notes)
    - Update the "Current Status" section with new version and next feature
    - Remove any obsolete "Completed Feature" sections that have release notes
    - Keep active.md focused only on planned/in-progress features

## File Naming Conventions

- Release notes: `releases/release-X.X.X.md` (e.g., `release-0.28.0.md`)
- Hotfix notes: `releases/hotfix-X.X.X-description.md` (e.g., `hotfix-0.12.1-ui-improvements.md`)
- Never use `vX.X.X.md` format - always use `release-X.X.X.md`

## Backlog Cleanup Rules

After creating release notes, the backlog/active.md should be cleaned:
1. **Completed Features Summary table**: Add a row for the new release
2. **Remove detailed completed sections**: Once release notes exist, remove verbose "Completed Feature" sections
3. **Keep it lean**: active.md should only contain project context + completed summary table + planned features
4. **Single source of truth**: Detailed release info lives in `releases/release-X.X.X.md`, not in active.md
