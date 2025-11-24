# Reference Documentation - Knowledge Grounding

This directory contains **net new knowledge** extracted from various sources for LLM context grounding. The purpose is to provide information that is:

- **Post-training**: Released or updated after Claude's January 2025 knowledge cutoff
- **Version-specific**: Current APIs, features, and implementation details
- **Change-focused**: What's new, what's changed, breaking changes, migrations
- **Current practices**: Evolved best practices and patterns

**Not included**: Basic concepts, fundamentals, or general information the LLM already knows from pre-training.

## Structure

Content is organized by category in subdirectories:

- `tauri/` - Tauri framework documentation, APIs, guides
- `react/` - React framework, hooks, components documentation
- `typescript/` - TypeScript language, types, configuration
- `mcp/` - Model Context Protocol documentation
- `api-design/` - API design patterns, REST, GraphQL
- `testing/` - Testing frameworks, strategies, best practices
- `architecture/` - Software architecture, design patterns
- `ui-ux/` - UI/UX design, component libraries, accessibility
- `performance/` - Performance optimization, benchmarking
- `security/` - Security best practices, authentication, authorization
- `tools/` - Development tools, CLI utilities, build systems
- `general/` - General programming concepts, tutorials, other topics

## Usage

### Adding New Content

Use the `/research <URL>` slash command to automatically extract net new knowledge:

```bash
/research https://tauri.app/v2/reference/menu/
```

This will:
1. Fetch the URL content
2. **Extract NET NEW knowledge**: Focus on what's new, changed, or version-specific
3. Convert to LLM-optimized markdown with knowledge grounding context
4. Add version metadata and knowledge type
5. Automatically categorize and save to the appropriate subfolder

**Best URLs for Knowledge Grounding:**
- Version-specific docs (e.g., `/v2/`, `/latest/`)
- Release notes and changelogs
- Migration guides and "What's New" pages
- Current API references

**Avoid:**
- Generic tutorials on basics
- General concept explanations

### Manual Addition

If adding content manually:

1. Create a markdown file with frontmatter:
```markdown
---
source: https://example.com/article
fetched: 2025-11-24
category: tauri
version: 2.1
knowledge_type: net_new
---

# Article Title

> **Knowledge Grounding Context**: Brief summary of what net new information this provides

Content here... (Focus on what's NEW or CHANGED)
```

2. Save to: `refer/[category]/[descriptive-filename].md`

## File Format

All files should:
- Be in markdown format (`.md`)
- Include frontmatter with `source`, `fetched`, `category`, `version`, and `knowledge_type`
- Include knowledge grounding context summary at the top
- Use descriptive kebab-case filenames
- **Focus on NET NEW information**: What's new, changed, or version-specific
- Preserve code examples showing NEW patterns (before/after when relevant)
- Use clean, well-structured markdown
- Structure with "What's New", "Breaking Changes", "Migration" sections when applicable

## Best Practices for Knowledge Grounding

- **Focus on deltas**: What's new, changed, or different from what the LLM knows
- **Version awareness**: Always include version context when available
- **Prioritize specifics**: New APIs, breaking changes, migration steps
- **Skip basics**: Don't document what the LLM already knows
- **Before/after examples**: Show what changed with code comparisons
- **Remove navigation, ads, and redundant text**
- **Preserve technical accuracy** of new information
- **Include source URL and version** for reference
- **Update date when content is refreshed**
- **Use clear, descriptive filenames** (include version when relevant: `tauri-v2-menu-api.md`)
- **Organize logically by category**

**Quality Check**: Ask "Does this tell Claude something it doesn't already know from January 2025 training?"

## Gitignore

Consider adding to `.gitignore` if you want to keep research private:

```gitignore
# Keep structure but exclude content
refer/**/*.md
!refer/README.md
```
