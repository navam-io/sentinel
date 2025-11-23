# Sentinel Design System Documentation

## Overview

The Sentinel Design System is a complete visual language and component library built on **Tailwind CSS 4**, **React 19**, and **shadcn/ui**, following the specifications in `backlog/03-spec-design-system.md`.

## Status

**Version**: 1.0 (Released with v0.20.0)
**Completeness**: Feature 5 COMPLETE ✅

- ✅ Tailwind theme configuration
- ✅ Icon system (12 semantic icons)
- ✅ Core UI components (12 components)
- ✅ Motion & interactions
- ✅ Comprehensive test coverage (50 new tests)

## Brand Identity

### Positioning
"Deterministic Reliability Layer for Agents + Models"

### Tone
- **Keywords**: Precise, secure, deep, analytical, minimal, modern, silent power
- **Aesthetic references**: Cursor, Raycast, Vercel, Anthropic, Notion

## Color System

All colors are defined in `tailwind.config.js` and `index.css` as CSS custom properties.

### Primary Palette - Sentinel Signal

| Token | Value | Usage |
|-------|-------|-------|
| `sentinel-primary` | `#6EE3F6` | Accent for active controls, links |
| `sentinel-primary-dark` | `#3CBACD` | Hover/pressed states |
| `sentinel-primary-glow` | `rgba(110,227,246,0.35)` | Glows, pulses, hovers |

### Secondary Palette - AI Reliability

| Token | Value | Usage |
|-------|-------|-------|
| `sentinel-secondary` | `#9B8CFF` | Secondary actions, charts |
| `sentinel-secondary-dark` | `#6C5AE0` | Hover/pressed |

### Neutral Palette - Infra-grade

| Token | Value | Usage |
|-------|-------|-------|
| `sentinel-bg` | `#0C0F12` | Main background |
| `sentinel-bg-elevated` | `#14181D` | Elevated surfaces |
| `sentinel-surface` | `#1C2026` | Cards, panels |
| `sentinel-border` | `#2C323A` | Borders |
| `sentinel-text` | `#E8EAED` | Primary text |
| `sentinel-text-muted` | `#9CA3AF` | Secondary text, labels |

### Semantic Palette

| Token | Value | Meaning |
|-------|-------|---------|
| `sentinel-success` | `#10B981` | Passed tests |
| `sentinel-error` | `#EF4444` | Failed tests, errors |
| `sentinel-warning` | `#F59E0B` | Performance degradation |
| `sentinel-info` | `#3B82F6` | Neutral info |

### Usage in Code

```tsx
// With Tailwind classes
<div className="bg-sentinel-surface border border-sentinel-border text-sentinel-text">
  Content
</div>

// With CSS custom properties
<div style={{ backgroundColor: 'var(--sentinel-primary)' }}>
  Content
</div>
```

## Typography

### Font Stack

- **Sans-serif**: Inter (imported from Google Fonts)
- **Monospace**: JetBrains Mono (code editing)

### Scale

| Class | Size | Usage |
|-------|------|-------|
| `text-xs` | 12px | Timestamps, metadata |
| `text-sm` | 14px | Secondary UI, labels |
| `text-base` | 16px | Body text |
| `text-lg` | 18px | Section headings |
| `text-xl` | 20px | Titles |
| `text-2xl` | 24px | Page headers |
| `text-3xl` | 30px | Dashboard hero numbers |
| `text-4xl` | 36px | Marketing surfaces |

### Weights

- `font-medium` (500): Default
- `font-semibold` (600): Labels
- `font-bold` (700): Hero metrics

## Icon System

All icons are in `frontend/src/components/icons/` as React components.

### Available Icons (12 total)

| Icon | Name | Usage |
|------|------|-------|
| 🛡️📡 | `SentinelShieldSignal` | Logo mark |
| 🎲 | `ModelCube` | LLM models |
| 🔄 | `GraphNodes` | Agent frameworks |
| 🧪 | `TestFlask` | Test specs |
| ⚖️ | `CompareSplit` | Run comparison |
| ⏱️ | `TimelineRun` | Run history |
| 🚨 | `AlertScan` | Safety evaluations |
| ⚡ | `ToolBolt` | Tool calls |
| 📊 | `TokenMeter` | Token usage |
| 📈 | `LatencyCurve` | Latency charts |
| 📝 | `DiffText` | Output diffs |
| 🔗 | `CIPipeline` | CI/CD integration |

### Usage

```tsx
import { TestFlask, ModelCube } from '@/components/icons';

<TestFlask className="w-5 h-5 text-sentinel-primary" />
```

## Components Library

All components are in `frontend/src/components/ui/` with comprehensive tests.

### Layout Components

#### Sidebar
Left navigation sidebar with collapsible state.

```tsx
import { Sidebar } from '@/components/ui';

<Sidebar isOpen={true} onToggle={() => {}} />
```

#### Topbar
Top application bar with branding and controls.

```tsx
import { Topbar } from '@/components/ui';

<Topbar title="Sentinel" />
```

#### DashboardLayout
Main layout wrapper with sidebar and content area.

```tsx
import { DashboardLayout } from '@/components/ui';

<DashboardLayout>
  <YourContent />
</DashboardLayout>
```

#### SidebarItem
Individual sidebar navigation item.

```tsx
import { SidebarItem } from '@/components/ui';
import { TestFlask } from '@/components/icons';

<SidebarItem
  label="Tests"
  icon={TestFlask}
  active={true}
  onClick={() => {}}
/>
```

### Navigation & Interaction Components

#### CommandPalette ✨ NEW (v0.20.0)
Raycast-like command palette with search and keyboard navigation.

**Features:**
- Search commands by name, description, or category
- Keyboard navigation (Arrow keys, Enter, Escape)
- Category grouping
- Shortcuts display
- Custom icons

```tsx
import { CommandPalette } from '@/components/ui';
import type { Command } from '@/components/ui';

const commands: Command[] = [
  {
    id: 'create-test',
    label: 'Create New Test',
    description: 'Create a new test spec',
    shortcut: '⌘N',
    icon: <TestFlask />,
    action: () => console.log('Create test'),
    category: 'Tests',
  },
];

<CommandPalette
  commands={commands}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  placeholder="Type a command..."
/>
```

**Keyboard Shortcuts:**
- `⬆️ ⬇️` Navigate
- `↵ Enter` Execute command
- `ESC` Close palette

**Test Coverage:** 23 tests (100% passing)

#### ModelSelector
Dropdown selector for AI models.

```tsx
import { ModelSelector } from '@/components/ui';

<ModelSelector
  selectedModel="claude-3-5-sonnet-20241022"
  onSelect={(model) => {}}
/>
```

#### FrameworkSelector
Dropdown selector for agent frameworks.

```tsx
import { FrameworkSelector } from '@/components/ui';

<FrameworkSelector
  selectedFramework="langgraph"
  onSelect={(framework) => {}}
/>
```

### Card Components

#### RunCard
Display test run information.

```tsx
import { RunCard } from '@/components/ui';

<RunCard
  testName="Simple Q&A Test"
  status="passed"
  model="claude-3-5-sonnet"
  latency={1250}
  timestamp={new Date()}
/>
```

#### MetricCard
Display key metrics with trends.

```tsx
import { MetricCard } from '@/components/ui';

<MetricCard
  label="Latency"
  value="1.2s"
  trend="down"
  trendValue="-15%"
/>
```

#### AssertionCard ✨ NEW (v0.20.0)
Display assertion details with pass/fail status.

**Features:**
- 8 assertion types supported
- Color-coded status (passed, failed, pending)
- Expected vs actual value display
- Formatted values (latency in ms, tokens count)
- Detailed failure messages

```tsx
import { AssertionCard } from '@/components/ui';

<AssertionCard
  type="must_contain"
  status="failed"
  value="expected text"
  actualValue="actual text"
  message="Output did not contain the expected value"
  description="Check if output contains greeting"
/>
```

**Supported Types:**
- `must_contain` - Text matching
- `must_not_contain` - Text exclusion
- `regex_match` - Pattern matching
- `must_call_tool` - Tool invocation
- `output_type` - Format validation
- `max_latency_ms` - Performance check
- `min_tokens` / `max_tokens` - Length validation

**Test Coverage:** 27 tests (100% passing)

### Chart Components

#### TrendChart
Line chart for displaying trends over time.

```tsx
import { TrendChart } from '@/components/ui';

<TrendChart
  data={[
    { date: '2024-01-01', value: 100 },
    { date: '2024-01-02', value: 120 },
  ]}
  title="Token Usage Over Time"
/>
```

#### Sparkline
Compact inline chart for quick trends.

```tsx
import { Sparkline } from '@/components/ui';

<Sparkline
  data={[10, 15, 13, 18, 20, 17]}
  color="sentinel-primary"
/>
```

#### PieDonut
Pie or donut chart for distributions.

```tsx
import { PieDonut } from '@/components/ui';

<PieDonut
  data={[
    { name: 'Passed', value: 85 },
    { name: 'Failed', value: 15 },
  ]}
  type="donut"
/>
```

## Motion & Interactions

### Transition Duration

```css
/* Defined in tailwind.config.js */
duration-120: 120ms
duration-160: 160ms
```

### Easing Curves

- Default: `ease-out`
- No bouncing or poppy animations (frontier-lab aesthetic)

### Hover Effects

```tsx
// Glow effect on hover
<div className="hover:shadow-sentinel-glow transition-shadow duration-160">
  Content
</div>

// Background color change
<button className="bg-sentinel-primary hover:bg-sentinel-primary-dark transition-colors duration-120">
  Click me
</button>
```

### Animations

Defined in `index.css`:
- `animate-pulse-slow` - Slow pulse (3s)
- `animate-fade-in` - Fade in (200ms)

## Utility Classes

### Card Style

```tsx
// Pre-built card class
<div className="sentinel-card">
  Content
</div>

// Equivalent to:
<div className="bg-sentinel-surface border border-sentinel-border rounded-lg p-4 shadow-sentinel">
  Content
</div>
```

### Button Styles

```tsx
// Primary button
<button className="sentinel-button-primary">
  Click me
</button>

// Equivalent to:
<button className="bg-sentinel-primary text-sentinel-bg px-4 py-2 rounded-md font-medium hover:bg-sentinel-primary-dark transition-colors duration-150">
  Click me
</button>
```

## Testing

All components have comprehensive test coverage using Vitest + React Testing Library.

### Test Statistics

- **Total Components**: 12
- **Total Tests**: 439 (all passing ✅)
- **Test Coverage**:
  - CommandPalette: 23 tests
  - AssertionCard: 27 tests
  - Other components: 389 tests

### Running Tests

```bash
# Run all tests
npm test

# Run specific component tests
npm test -- CommandPalette.test.tsx

# Watch mode
npm run test:watch

# UI mode
npm run test:ui
```

## Implementation Status

### ✅ Complete (v0.20.0)

1. **Tailwind Theme**: All colors, typography, spacing configured
2. **Icon System**: 12 semantic icons
3. **Core Components**: 12 production-ready components
4. **Motion & Interactions**: Smooth transitions and hover effects
5. **Testing**: 50 new tests (23 CommandPalette + 27 AssertionCard)
6. **Documentation**: This file + inline JSDoc comments

### Future Enhancements

1. **Additional Icons**: Expand to 30+ icons (current: 12)
2. **Storybook Integration**: Component preview gallery
3. **Dark/Light Mode Toggle**: Currently dark-only
4. **Accessibility Audit**: WCAG AAA compliance verification
5. **Animation Library**: More sophisticated animations

## Best Practices

### When to Use What

- **CommandPalette**: Quick actions, search, power-user features
- **AssertionCard**: Displaying test assertion results
- **RunCard**: Showing test run summaries
- **MetricCard**: Highlighting key metrics with trends
- **TrendChart**: Detailed time-series data
- **Sparkline**: Inline trends in dashboards

### Component Composition

```tsx
// Good: Compose components for complex UIs
<DashboardLayout>
  <Sidebar isOpen={true}>
    <SidebarItem label="Tests" icon={TestFlask} />
  </Sidebar>
  <div className="p-6">
    <MetricCard label="Latency" value="1.2s" />
    <TrendChart data={chartData} />
  </div>
</DashboardLayout>
```

### Naming Conventions

- Component files: PascalCase (e.g., `CommandPalette.tsx`)
- Test files: `[Component].test.tsx`
- Icon files: PascalCase (e.g., `TestFlask.tsx`)
- Utility classes: kebab-case (e.g., `sentinel-card`)

## References

- **Design Spec**: `backlog/03-spec-design-system.md` (complete 508-line specification)
- **Visual Spec**: `backlog/02-spec-visual-first.md`
- **Tailwind Config**: `frontend/tailwind.config.js`
- **Global Styles**: `frontend/src/index.css`
- **Components**: `frontend/src/components/ui/`
- **Icons**: `frontend/src/components/icons/`

---

**Last Updated**: November 22, 2025
**Version**: 1.0
**Status**: Production Ready ✅
