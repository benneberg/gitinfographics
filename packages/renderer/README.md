# @gitinfographics/renderer

> Zero-DOM Scandinavian minimalist SVG infographic vector rendering engine with dual-viewport reflow.

Part of the **[GitInfoGraphics](https://github.com/benneberg/gitinfographics)** engine.

## Features

- **Zero-DOM Headless Execution**: Emits pure SVG strings without browser dependencies (`document`, `window`, or `<canvas>`). Perfect for CI/CD, Node scripts, Edge functions, and React apps.
- **Dual-Viewport Reflow**: Native desktop (880px) multi-column flow and mobile (400px) stacked flow with recalculating coordinate math.
- **Scandinavian Minimalist Palette**: Clean light and dark themes (Chalk & Charcoal, Nordic Birch, Fjord Slate, Copenhagen Mono, Midnight, Ember, Forest).
- **Built-in WCAG Contrast Auditor**: Verifies AA/AAA contrast ratios for all theme pairings.
- **Integrated Vector Icons & QR Codes**: Deterministic SVG icons and clean vector QR codes without external API calls.
- **Accessible Output**: Generates semantic W3C `role="img"` SVGs with structured `<desc>` text for assistive technologies.

## Installation

```bash
npm install @gitinfographics/renderer @gitinfographics/analyzer @gitinfographics/parser
# or
pnpm add @gitinfographics/renderer @gitinfographics/analyzer @gitinfographics/parser
```

## Quick Start

```typescript
import { parseMD } from '@gitinfographics/parser';
import { buildRuleSpec } from '@gitinfographics/analyzer';
import { renderSVG, getTheme } from '@gitinfographics/renderer';

const doc = parseMD('# Project\nA fast tool.\n\n## Features\n- Fast\n- Reliable');
const spec = buildRuleSpec(doc);

// Render desktop SVG (880px)
const desktopSvg = renderSVG(spec, 'scandi-minimal', { layout: 'desktop' });

// Render mobile SVG (400px reflow)
const mobileSvg = renderSVG(spec, 'scandi-minimal', { layout: 'mobile' });
```

## API Reference

### `renderSVG(spec: InfographicSpec, theme?: ThemeConfig | string, opts?: RenderOptions): string`
Master SVG generator outputting complete SVG markup with custom layout and theme tokens.

### `renderDesktopSVG(spec: InfographicSpec, theme: ThemeConfig, opts?: RenderOptions): string`
Generates desktop layout (880px coordinate system).

### `renderMobileSVG(spec: InfographicSpec, theme: ThemeConfig, opts?: RenderOptions): string`
Generates mobile reflow layout (400px coordinate system).

### `getTheme(name?: string): ThemeConfig`
Retrieves a predefined Scandinavian theme (`scandi-minimal`, `nordic-birch`, `fjord-slate`, `copenhagen-mono`, `midnight`, `ember`, `forest`).

### `auditThemeContrast(theme: ThemeConfig): ThemeContrastAudit`
Audits theme colors against WCAG AA standards.

## License

MIT © [benneberg](https://github.com/benneberg/gitinfographics)
