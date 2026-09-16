# @gitinfographics/analyzer

> Deterministic heuristic classifier, metric miner, and visual infographic layout specification builder.

Part of the **[GitInfoGraphics](https://github.com/benneberg/gitinfographics)** engine.

## Features

- **Semantic Section Classification**: Categorizes document sections into 14 semantic domains (`problem`, `solution`, `features`, `tech-stack`, `metrics`, `architecture`, `api`, `usage`, `roadmap`, etc.).
- **Quantitative Telemetry Mining**: 14 regex pattern extractors parsing percentages, latencies, scale counts, multipliers, and badge metrics.
- **Ecosystem Profiling**: Detects package dependencies (`package.json`), Python requirements, Dockerfiles, and code extensions.
- **Smart Layout Detection**: Determines layout strategies (`feature-grid`, `timeline`, `stats-metric`, `compact-cli`, `balanced-studio`) with confidence scores.
- **Grounding & Traceability**: Provides section sources, line indices, and confidence metrics for complete auditability.

## Installation

```bash
npm install @gitinfographics/analyzer @gitinfographics/parser
# or
pnpm add @gitinfographics/analyzer @gitinfographics/parser
```

## Quick Start

```typescript
import { parseMD } from '@gitinfographics/parser';
import { buildRuleSpec, detectSmartLayout } from '@gitinfographics/analyzer';

const markdown = `
# TurboRender
High-performance rendering engine.

## Benchmarks
- 99.9% uptime
- 10x faster execution
- 15ms median latency
- 50k downloads

## Features
- **Zero-DOM Execution**: Pure string-based vector generation.
- **Dual-Viewport**: Responsive desktop and mobile coordinate reflow.
`;

const doc = parseMD(markdown);
const spec = buildRuleSpec(doc);
const layoutRec = detectSmartLayout(doc);

console.log(layoutRec.layoutType); // "stats-metric"
console.log(spec.sections);       // Coordinated SpecSection array ready for renderer
```

## License

MIT © [benneberg](https://github.com/benneberg/gitinfographics)
