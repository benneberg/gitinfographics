# GitInfoGraphics

> Deterministic rule-based engine and studio for generating dynamic, Scandinavian minimalist SVG infographics from GitHub repositories and README files.

![CI](https://github.com/benneberg/gitinfographics/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![Vitest](https://img.shields.io/badge/tested_with-Vitest-yellow?logo=vitest)
![Architecture](https://img.shields.io/badge/architecture-Zero--DOM_Engine-green)

---
---

## Overview

**GitInfoGraphics** converts unstructured markdown documentation and GitHub repository metadata into clean, vector-rendered SVG infographics ready to embed directly into repository READMEs.

Unlike AI-based generation tools that suffer from non-deterministic layouts, hallucinated content, or API costs, GitInfoGraphics runs a **100% deterministic, rule-based algorithmic heuristic pipeline**. It parses repository text, extracts quantitative performance metrics and features, assigns semantic section roles, computes exact dynamic bounding boxes, and generates pure vector graphics.

---

## Key Features

- 📐 **Dual-Viewport Layout Engine**:
  - **Desktop (880px)**: Expansive multi-column layouts, horizontal problem-to-solution flow (`→`), and structured feature grids.
  - **Mobile (400px)**: True reflowed single-column layouts, 2×2 metric cards, and vertical problem-to-solution flow (`↓`) optimized for mobile screens.
  - **GitHub `<picture>` Snippet**: Generates media-query enabled markdown that serves desktop or mobile SVG automatically based on viewport width (`min-width: 600px`).
- 🎨 **Scandinavian Minimalist Design**:
  - Warm stone canvas (`#FAFAF9`), architectural cards (`#FFFFFF`), subtle hairline borders (`#E7E5E4`), and deep graphite typography (`#1C1917`).
  - No dated neon radial gradients or heavy drop-shadows; uses clean typographic badges and subtle 1px elevation shadows.
- ⚡ **Zero-DOM Headless Core**:
  - The core engine in `src/engine/` is completely decoupled from the browser and React DOM.
  - Safe for execution in browser SPAs, Node.js scripts, CLI tools, and GitHub Actions.
- 🔍 **5-Stage Heuristic Pipeline**:
  1. **Defensive Markdown Parsing**: Normalizes AST, parses tables, handles code blocks with memory guards, and tracks nested lists.
  2. **Semantic Section Classification**: Classifies headings across 14 categories using pattern scoring, relative position hints, structural density, and exact-title boosting.
  3. **Metric & Tech Extraction**: Mines 14+ quantitative metrics (latencies, speeds, percentages, stars, uptime) and detects libraries from `package.json`, Dockerfiles, and file extensions.
  4. **Dynamic Spec Builder**: Formulates a balanced infographic specification with adaptive thresholds and graceful fallbacks.
  5. **Dynamic Vector Renderer**: Calculates exact mathematical bounding boxes, wraps text lines, and outputs standards-compliant SVG with XML entity escaping.
- 🤖 **Automated GitHub Action Generator**:
  - Exports ready-to-commit `.github/workflows/generate-infographics.yml` to automatically re-render and commit updated SVGs on every push.

---

## Architecture Pipeline

```
Raw README.md + GitHub REST API
              │
              ▼
  ┌─────────────────────────┐
  │      1. parseMD         │ ➔ AST, sections, badges, code blocks, tables
  └─────────────────────────┘
              │
              ▼
  ┌─────────────────────────┐
  │     2. classifySec      │ ➔ 14 semantic categories (features, metrics, PS, tech...)
  └─────────────────────────┘
              │
              ▼
  ┌─────────────────────────┐
  │   3. extractMetrics &   │ ➔ Clean metrics, deduplicated tags, technologies
  │      extractTech        │
  └─────────────────────────┘
              │
              ▼
  ┌─────────────────────────┐
  │    4. buildRuleSpec     │ ➔ InfographicSpec JSON with structural layout
  └─────────────────────────┘
              │
              ▼
  ┌─────────────────────────┐
  │  5. renderSVG / Mobile  │ ➔ Scalable vector SVG with dynamic height calculation
  └─────────────────────────┘
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full algorithmic specifications and design decisions.

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/gitinfographics.git
cd gitinfographics

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts Vite development server at `0.0.0.0:3000` |
| `npm test` | Runs the Vitest automated test suite |
| `npm run lint` | Performs TypeScript type checking (`tsc --noEmit`) |
| `npm run build` | Compiles production assets into `dist/` |
| `npm run preview` | Locally previews production build |

---

## Embedding in READMEs

GitInfoGraphics generates responsive `<picture>` tags that dynamically switch between desktop and mobile graphics:

```html
<picture>
  <source media="(max-width: 600px)" srcset="./docs/infographic-mobile.svg">
  <source media="(min-width: 601px)" srcset="./docs/infographic-desktop.svg">
  <img alt="Project Infographic" src="./docs/infographic-desktop.svg" width="100%">
</picture>
```

---

## Automated CI Workflow

An automated GitHub Action template can be generated directly from the studio UI to update SVGs on repository pushes. See `src/engine/workflowTemplate.ts` for workflow generation logic.

---

## License

MIT License. See [LICENSE](./LICENSE) for details.
