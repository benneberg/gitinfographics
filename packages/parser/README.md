# @gitinfographics/parser

> Lightweight, defensive, zero-DOM markdown parser tailored for technical repositories, READMEs, and structured documentation.

Part of the **[GitInfoGraphics](https://github.com/benneberg/gitinfographics)** engine.

## Features

- **Zero-DOM**: Works universally in Node.js, browsers, web workers, CI/CD runners, and edge runtimes.
- **Defensive Parsing**: Safely filters decorative HTML wrappers, caps oversized code blocks, and handles malformed tables.
- **Rich Structure Extraction**: Extracts title, subtitle, badges, images, tables, lists with indentation hierarchy, and code blocks.
- **Smart Truncation**: Intelligently truncates long documentation while prioritizing high-signal sections (problem, solution, features, metrics).

## Installation

```bash
npm install @gitinfographics/parser
# or
pnpm add @gitinfographics/parser
```

## Quick Start

```typescript
import { parseMD, cleanMarkdownText } from '@gitinfographics/parser';

const markdown = `
# AwesomeProject
An ultrafast engine for generating SVG infographics.

[![Build](https://img.shields.io/github/actions/workflow/status/org/repo/ci.yml)](https://github.com)

## Problem
Manual architecture diagrams get outdated in days.

## Solution
Automate repository visual diagrams directly from markdown.
`;

const doc = parseMD(markdown);
console.log(doc.title);    // "AwesomeProject"
console.log(doc.subtitle); // "An ultrafast engine for generating SVG infographics."
console.log(doc.sections); // Array of structured DocSection objects
```

## API Reference

### `parseMD(text: string): ParsedDoc`
Parses raw Markdown string into structured `ParsedDoc` containing sections, badges, images, title, and subtitle.

### `cleanMarkdownText(text: string): string`
Strips markdown links, bold, italics, inline code, and bullet symbols, returning clean plain text.

### `parseTable(rows: string[]): TableData | null`
Parses markdown pipe tables into structured `{ header, rows }`.

### `smartTrunc(text: string, max: number, classifier?): string`
Truncates markdown text to `max` characters while keeping highest-priority semantic sections intact.

## License

MIT © [benneberg](https://github.com/benneberg/gitinfographics)
