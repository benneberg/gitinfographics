# GitInfoGraphics Architecture

This document describes the architectural principles, component layers, and mathematical layout models governing the GitInfoGraphics engine.

---

## Design Principles

1. **Zero-DOM Headless Decoupling**:
   All core pipeline modules in `src/engine/` operate purely on strings, arrays, and plain JavaScript objects. They have no dependency on `window`, `document`, DOM nodes, or browser canvas APIs. This allows identical execution inside:
   - Client-side React SPAs
   - Headless Node.js automation scripts
   - GitHub Actions CI workers
   - Standalone CLI utilities

2. **Deterministic Heuristics Over LLM Non-Determinism**:
   Infographics must update predictably. If a developer edits a single sentence in their README, only the corresponding card should change. GitInfoGraphics uses exact pattern recognition and scoring algorithms rather than generative models for layout and extraction.

3. **Viewport-Aware Reflow, Not Viewport Scaling**:
   Rather than applying CSS `transform: scale()` to shrink desktop graphics into illegibility on mobile screens, GitInfoGraphics generates two independent SVG coordinate systems:
   - **Desktop Layout (`880px`)**: Multi-column grids (up to 4 cols), horizontal Problem-to-Solution flow (`→`), and expansive margins.
   - **Mobile Layout (`400px`)**: Reflowed single-column sections, stacked 2×2 metric blocks, and vertical Problem-to-Solution flow (`↓`).

4. **Scandinavian Minimalist Visual Identity**:
   - Palette: `#FAFAF9` canvas, `#FFFFFF` cards, `#E7E5E4` borders, `#1C1917` graphite typography, `#78716C` muted subtitles.
   - Typography: Proportional hierarchy with clean tracking and contrast (Space Grotesk headers, Plus Jakarta Sans body, Fira Code monospace).
   - Shadows: Subtle 1px vertical elevation (`rgba(0, 0, 0, 0.04)`), replacing heavy colored drop-shadows.

---

## Pipeline Specification

```
Raw Markdown ──► [Stage 1: Parser]
                     │
                     ▼
                 ParsedDoc (Sections, Badges, Tables, Code Blocks)
                     │
                     ▼
                 [Stage 2: Classifier]
                     │
                     ▼
                 Classified Sections (14 Categories)
                     │
                     ▼
                 [Stage 3: Extractors]
                     │
                     ▼
                 Extracted Metrics & Technologies
                     │
                     ▼
                 [Stage 4: Spec Builder]
                     │
                     ▼
                 InfographicSpec (Structured Layout JSON)
                     │
                     ▼
                 [Stage 5: SVG Renderer]
                     │
                     ├──► Desktop SVG (880px viewBox)
                     └──► Mobile SVG (400px viewBox)
```

### Stage 1: Defensive Parser (`src/engine/parser.ts`)
- **Block-Level HTML Stripping**: Safely filters decorative wrapping tags (`<div>`, `<section>`) while preserving inner markdown text.
- **Memory Protection**: Caps code blocks at 40 lines to guard against pathological repository READMEs.
- **Table Parsing**: Transforms markdown pipe tables (`| col1 | col2 |`) into structured header and row arrays, capped at 12 rows.
- **Indentation Tracking**: Preserves list hierarchies and depth for bullet nesting.

### Stage 2: Section Classifier (`src/engine/classifier.ts`)
Classifies sections into one of 14 semantic types:
`problem`, `solution`, `features`, `tech-stack`, `getting-started`, `architecture`, `api`, `usage`, `contributing`, `roadmap`, `metrics`, `security`, `testing`, `license`.

Scoring heuristic:
```
Score(section, type) =
    (PatternMatches(text) * 2)
  + (TitleMatch(title) * 4)
  + RelativePositionBoost(relPosition, type)
  + StructuralDensityBoost(listRatio, codeBlocks, tables)
  + ExactTitleBoost(title)
  - GenericTitleDampener(title)
```

### Stage 3: Feature & Metric Extractors (`src/engine/extractors.ts`)
- **Metrics**: 14 regex extractors mining percentages (uptime, coverage), scale metrics (k/M/B counts for users, stars, downloads), latencies (ms, minutes), multipliers (faster, speedup), and version numbers.
- **Badge Mining**: Extracts shields.io badges from `doc.badges` to infer metrics even when absent from body text.
- **Tech Stack Extraction**: Scans `package.json` dependency declarations, `requirements.txt`/`Pipfile` lines, Dockerfile `FROM` instructions, and backticked code extensions (`.ts`, `.rs`, `.py`, `.go`).

### Stage 4: Spec Builder (`src/engine/specBuilder.ts`)
Transforms parsed data into a structured `InfographicSpec` schema:
- Pairs Problem and Solution sections into a coordinated dual card.
- Sets feature columns dynamically based on item counts.
- Integrates live GitHub metadata (stars, forks, open issues, language, topics) when connected.
- Provides fallback cards for sparse documents to ensure a balanced graphic.

### Stage 5: Dynamic Vector Renderer (`src/engine/renderer.ts`)
- **Dynamic Box Sizing**: Computes SVG container heights on-the-fly based on text wrapping lines:
  ```
  CardHeight = BasePadding + (WrappedLines * LineHeight)
  ```
- **Coordinate Math**: Calculates running Y-offsets with adaptive inter-section gaps (24px to 32px) depending on section density.
- **XML Entity Sanitization**: Escapes all user strings through `esc()` to prevent XML/SVG injection.

---

## Directory Structure

```
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated CI (lint, test, build)
├── public/                      # Static assets & web font links
├── src/
│   ├── components/              # UI layer (React 19 + Tailwind CSS)
│   │   ├── InfographicCanvas.tsx # Dual-viewport interactive renderer & exporter
│   │   ├── MarkdownEditor.tsx   # Markdown input with live debouncing
│   │   ├── SectionControls.tsx  # Interactive variant & toggle controls
│   │   ├── ArchitectureModal.tsx# Visual pipeline documentation modal
│   │   ├── WorkflowModal.tsx    # GitHub Actions workflow generator
│   │   └── Header.tsx           # GitHub repo import & actions
│   ├── engine/                  # Headless, zero-DOM core engine
│   │   ├── __tests__/           # Vitest unit test suite
│   │   │   ├── parser.test.ts
│   │   │   ├── classifier.test.ts
│   │   │   ├── extractors.test.ts
│   │   │   ├── specBuilder.test.ts
│   │   │   └── renderer.test.ts
│   │   ├── parser.ts            # Markdown tokenizer & table/code parsers
│   │   ├── classifier.ts        # 14-category heuristic classifier
│   │   ├── extractors.ts        # Metric, feature, tech, and badge miners
│   │   ├── specBuilder.ts       # Layout specification builder
│   │   ├── renderer.ts          # Desktop (880px) & Mobile (400px) SVG renderers
│   │   ├── github.ts            # GitHub REST API client & rate-limit handler
│   │   ├── themes.ts            # Scandinavian & classic color tokens
│   │   ├── types.ts             # TypeScript domain interfaces
│   │   └── workflowTemplate.ts  # GitHub Actions YAML builder
│   ├── App.tsx                  # Studio coordinator
│   └── main.tsx                 # React entry point
├── package.json                 # Project dependencies & test scripts
├── REPOSITORY_STATUS.md         # Repository audit report
└── README.md                    # Project overview & quickstart
```
