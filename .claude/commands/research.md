---
description: Knowledge grounding - Extract net new knowledge from URL for LLM context loading
---

# Research Command: Knowledge Grounding for LLMs

You have been asked to research content from a URL to ground the LLM with **net new knowledge** not present in its pre-trained world knowledge.

**Critical Context**: Claude's knowledge cutoff is January 2025. The purpose of this command is to extract information that is:
- Released or updated after January 2025
- Version-specific implementation details
- Current best practices that have evolved
- New APIs, features, or breaking changes
- What's different from older versions

**De-prioritize**: General concepts, basic explanations, or fundamental information the LLM already knows.

## Instructions

Follow these steps to complete the research task:

### 1. Extract URL from Command
The command will be invoked as `/research <URL>`. Extract the URL from the command arguments.

### 2. Fetch and Parse Content with Knowledge Grounding Focus
Use the WebFetch tool to retrieve the content from the URL with this prompt:

```
Extract NET NEW KNOWLEDGE from this page for LLM context grounding. Focus on information that is:

**PRIORITIZE:**
- Version numbers and release dates (e.g., "New in v2.1", "Released March 2025")
- New APIs, methods, or features introduced recently
- Breaking changes from previous versions
- Current best practices that have evolved
- Migration guides ("What's changed from v1.x to v2.x")
- Deprecation warnings and replacements
- Recent bug fixes or known issues
- Updated configuration or setup steps
- New patterns or recommended approaches

**DE-PRIORITIZE:**
- Basic concepts or fundamentals (the LLM already knows these)
- General explanations of well-established topics
- Historical context or background (unless it explains what changed)

**FORMAT:**
Structure as LLM-optimized markdown:
1. Start with version/date context if available
2. Use "What's New" or "Key Changes" sections
3. Highlight breaking changes prominently
4. Include before/after code examples when showing changes
5. Be comprehensive on specifics, compact on basics
6. Remove navigation, ads, redundant boilerplate

Return clean, well-structured markdown focused on NET NEW information.
```

### 3. Analyze Content and Determine Category
After fetching the content, analyze it to determine the appropriate subfolder. Common categories include:
- `tauri/` - Tauri framework documentation, APIs, guides
- `react/` - React framework, hooks, components documentation
- `typescript/` - TypeScript language, types, configuration
- `api-design/` - API design patterns, REST, GraphQL
- `testing/` - Testing frameworks, strategies, best practices
- `architecture/` - Software architecture, design patterns
- `ui-ux/` - UI/UX design, component libraries, accessibility
- `performance/` - Performance optimization, benchmarking
- `security/` - Security best practices, authentication, authorization
- `tools/` - Development tools, CLI utilities, build systems
- `general/` - General programming concepts, tutorials, other topics

Choose the most appropriate category based on the content. If uncertain, use `general/`.

### 4. Generate Filename
Create a descriptive filename based on the content:
- Use lowercase with hyphens (kebab-case)
- Make it descriptive but concise (max 50 characters)
- Use the page title or main topic as basis
- Add `.md` extension

Example: `tauri-menu-system-guide.md`

### 5. Add Metadata Header
Prepend the following metadata to the content:
```markdown
---
source: [ORIGINAL_URL]
fetched: [CURRENT_DATE in YYYY-MM-DD format]
category: [CATEGORY]
version: [VERSION if available, e.g., "2.1" or "unknown"]
knowledge_type: net_new
---

# [Page Title]

> **Knowledge Grounding Context**: [1-2 sentence summary of what net new information this provides - e.g., "Tauri 2.1 menu API changes from 1.x" or "React 19 new hooks introduced in March 2025"]

[Rest of content...]
```

### 6. Save to Refer Directory
Save the processed markdown to: `refer/[category]/[filename].md`

Create the category subdirectory if it doesn't exist.

### 7. Report Results
After saving, inform the user with:
- ✅ URL fetched successfully
- 📁 Category: [category]
- 🔖 Version: [version if available]
- 💾 Saved to: `refer/[category]/[filename].md`
- 🧠 **Knowledge Grounding Summary**: [2-3 sentences explaining what net new knowledge was extracted - e.g., "Extracted Tauri 2.1 menu API breaking changes from 1.x, including new MenuBuilder pattern and deprecated methods. Focus on migration guide and new examples. Useful for understanding current Tauri menu implementation."]

## Example Usage

```
/research https://tauri.app/v2/reference/menu/
```

This would:
1. Fetch the Tauri 2.x menu documentation
2. Extract **net new knowledge**: New MenuBuilder API in v2.x, breaking changes from v1.x, new patterns
3. Determine category: `tauri`
4. Extract version: `2.0`
5. Save as: `refer/tauri/v2-menu-api.md`
6. Report with knowledge grounding summary explaining what's new

**Good URLs for Knowledge Grounding:**
- Version-specific documentation (e.g., `/v2/`, `/latest/`)
- Release notes and changelogs
- Migration guides
- "What's New" pages
- API reference for current versions
- Recent blog posts about updates

**Avoid:**
- Generic tutorials on basics
- Old documentation (unless comparing to new)
- General concept explanations
- Historical background without changes

## Error Handling

If the fetch fails or content cannot be extracted:
- Report the error clearly
- Suggest checking the URL
- Offer to retry or try an alternative approach

## Important Notes

**Knowledge Grounding Principles:**
- Focus on **what's new, changed, or version-specific**
- Skip information the LLM already knows from training
- Prioritize current practices over deprecated ones
- Highlight breaking changes and migrations prominently
- Include version context whenever possible
- Structure for quick LLM comprehension of deltas

**Technical Guidelines:**
- Always use WebFetch tool (never bash curl/wget)
- Preserve code examples showing NEW patterns
- Include before/after comparisons when showing changes
- Remove boilerplate, ads, navigation
- Keep markdown clean and well-formatted
- Use appropriate heading levels (prefer "What's New", "Breaking Changes", "Migration")
- Maintain code block language tags
- Include source URL, fetch date, and version in metadata

**Quality Check:**
After extraction, ask yourself: "Does this contain information Claude doesn't already know from its January 2025 training cutoff?" If mostly basic concepts, refine the extraction to focus on specifics, versions, and recent changes.
