# Social Media Summary - Sentinel v0.1.0

## Quick Stats Card

```
🛡️ Sentinel v0.1.0 Released!

📦 What's New:
✓ Type-safe DSL (Pydantic)
✓ YAML/JSON parsing
✓ 8 assertion types
✓ 6 templates
✓ 70 tests, 98% coverage

🎯 Vision: Postman for AI Agents
🚀 Next: Visual canvas (v0.2.0)

⭐ github.com/navam-io/sentinel
```

## Tweet Thread (X/Twitter)

**Tweet 1/6** (Hook)
🛡️ Just shipped Sentinel v0.1.0—the foundation for "Postman for AI Agents"

Built entirely with @AnthropicAI Claude Code using vibe coding.

Here's what we built and what I learned 🧵

**Tweet 2/6** (The Problem)
Testing AI agents today is painful:
• Custom scripts for every test
• Frameworks that feel like homework
• Manual testing that doesn't scale

We're building a visual-first platform to change this.

**Tweet 3/6** (What We Built)
v0.1.0 delivers the foundation:

✅ Type-safe Pydantic schema
✅ Round-trip YAML ↔ JSON
✅ 8 assertion types
✅ 6 production templates
✅ 70 tests, 98% coverage
✅ 5,000+ lines of docs

Production-ready from day 1.

**Tweet 4/6** (Vibe Coding Lessons)
Built 100% with Claude Code. Key learnings:

• Write tests first, let AI implement
• CLAUDE.md = source of truth
• Let AI write docs while coding
• Ship small, iterate fast

TDD + AI = incredible productivity.

**Tweet 5/6** (Real Example)
```yaml
name: "Code Gen Test"
model: "claude-3-5-sonnet-20241022"
inputs:
  query: "Write fibonacci function"
assertions:
  - must_contain: "def"
  - regex_match: "def\\s+\\w+"
  - output_type: "code"
```

Clean, type-safe, git-friendly.

**Tweet 6/6** (CTA)
v0.2.0 brings the visual canvas:
🎨 Drag-and-drop builder
📊 Live execution
🔄 Visual ↔ DSL sync

Try v0.1.0 today:
⭐ github.com/navam-io/sentinel

Read the full story: [blog link]

Building in public! 🚀

## Reddit Post (r/MachineLearning, r/LocalLLaMA)

**Title**: [P] Sentinel v0.1.0: Type-safe DSL for AI agent testing (built with Claude Code)

**Body**:

I just released v0.1.0 of Sentinel—a visual-first agent testing platform for AI labs and teams. Think "Postman for AI Agents."

**What's in v0.1.0:**
- Type-safe Pydantic schema for test specifications
- Round-trip YAML/JSON parsing (zero data loss)
- 8 assertion types (text matching, tool calls, performance, format validation)
- 6 production-ready templates
- 70 tests with 98% coverage
- Complete documentation

**Why it matters:**

Testing AI agents is surprisingly hard. Most teams either write custom scripts for every test case, or manually run their agents over and over. This doesn't scale.

Sentinel aims to make agent testing as intuitive as Postman made API testing—visual drag-and-drop interface backed by a git-friendly YAML DSL.

**Example test spec:**

```yaml
name: "Browser Agent Test"
model: "claude-3-5-sonnet-20241022"
tools: [browser, scraper]
inputs:
  query: "Find top 3 laptops under $1000"
assertions:
  - must_call_tool: ["browser"]
  - output_type: "json"
  - max_latency_ms: 10000
```

**Built with Claude Code:**

This entire project was built using vibe coding with Claude Code. Some key learnings:
- Test-driven development works incredibly well with AI
- Having a CLAUDE.md file as context makes a huge difference
- Letting AI write docs while writing code catches design issues early

**What's next:**

v0.2.0 (Q1 2026) brings the visual canvas:
- Tauri desktop app
- React Flow node-based builder
- Real-time YAML generation
- Drag-and-drop test creation

**Try it:** https://github.com/navam-io/sentinel

**Read the full blog post:** [link]

Would love feedback from the community! What would make this useful for your agent testing workflows?

## HackerNews Post

**Title**: Sentinel – Type-safe DSL for AI agent testing (built with Claude Code)

**URL**: [Link to GitHub repo or blog post]

**Comment to add**:

Author here. Happy to answer questions about the project or about building with Claude Code.

Some technical details that might be interesting:

1. **Round-trip conversion**: The DSL needs to support Visual → YAML → Visual with zero data loss. We achieved this using Pydantic's serialization with careful handling of optional fields.

2. **Vibe coding workflow**: We used TDD—write tests first, then let Claude implement. This caught edge cases early and resulted in 98% coverage naturally.

3. **Why start with DSL**: We're building visual-first, but starting with the DSL ensures the visual canvas generates clean, version-controllable YAML from day 1.

The vision is "Postman for AI Agents"—visual test building backed by git-friendly YAML.

## Dev.to Post Tags

```
#ai #testing #opensource #python #pydantic #agents #llm #claude #buildingpublic
```

## Medium Post Subtitle

"Building a type-safe foundation for visual AI agent testing—70 tests, 98% coverage, built entirely with Claude Code"

## Suggested Images/Graphics

Since there's no UI yet, consider creating:

1. **Architecture diagram** showing: YAML → Parser → Schema → (Future) Visual Canvas
2. **Code example screenshot** of the simple_qa.yaml template
3. **Stats card** with key metrics (70 tests, 98% coverage, 8 assertions)
4. **Roadmap visual** showing v0.1.0 → v0.2.0 → v0.3.0
5. **Logo/banner** with Sentinel branding and tagline

## Distribution Timeline

**Day 1 (Release Day)**:
- [ ] Post on LinkedIn
- [ ] Tweet thread
- [ ] Update GitHub README with blog link
- [ ] Post to r/MachineLearning

**Day 2**:
- [ ] Post to HackerNews
- [ ] Share on Dev.to
- [ ] Post to r/LocalLLaMA
- [ ] Share in AI Discord communities

**Day 3**:
- [ ] Medium post
- [ ] Email to early supporters/waitlist
- [ ] Share in Anthropic/Claude communities

**Week 2**:
- [ ] Respond to comments and feedback
- [ ] Incorporate feedback into roadmap
- [ ] Plan v0.2.0 announcement
