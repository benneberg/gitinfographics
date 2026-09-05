import { describe, it, expect } from 'vitest';
import { parseMD, parseTable } from '../parser';
import { cleanMarkdownText } from '../extractors';

describe('parseMD', () => {
  it('extracts repository title and subtitle from markdown', () => {
    const md = `# HyperFlow Engine
A fast, lightweight stream processing engine built for real-time telemetry.

## Features
- Ultra-low latency
- Zero external dependencies
`;
    const doc = parseMD(md);
    expect(doc.title).toBe('HyperFlow Engine');
    expect(doc.subtitle).toContain('stream processing engine');
    expect(doc.sections.length).toBe(1);
    expect(doc.sections[0].title).toBe('Features');
  });

  it('safely skips block-level HTML tags without losing subsequent content', () => {
    const md = `# SafeProject

<div align="center">
  <p>Centered logo banner</p>
</div>

## Installation
Run npm install
`;
    const doc = parseMD(md);
    expect(doc.title).toBe('SafeProject');
    expect(doc.sections.length).toBe(1);
    expect(doc.sections[0].title).toBe('Installation');
  });

  it('harvests badges in the first lines and parses badge metrics', () => {
    const md = `# Badged Project
![CI](https://github.com/owner/repo/workflows/CI/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-98%25-brightgreen)
![Version](https://img.shields.io/badge/version-1.4.0-blue)

A modern tool for developers.
`;
    const doc = parseMD(md);
    expect(doc.badges.length).toBeGreaterThanOrEqual(2);
    expect(doc.badges.some((b) => b.url.includes('coverage'))).toBe(true);
  });

  it('caps long code fences at 40 lines to protect memory', () => {
    const codeLines = Array.from({ length: 80 }, (_, i) => `console.log(${i});`).join('\n');
    const md = `# LongCode
## Example
\`\`\`typescript
${codeLines}
\`\`\`
`;
    const doc = parseMD(md);
    expect(doc.sections[0].codeBlocks).toBeDefined();
    expect(doc.sections[0].codeBlocks![0].lines.length).toBeLessThanOrEqual(40);
  });

  it('parses markdown tables defensively and removes separator lines', () => {
    const tableRows = [
      '| Feature | Status | Performance |',
      '| :--- | :---: | ---: |',
      '| Parser | Stable | 0.4ms |',
      '| Renderer | Active | 1.2ms |'
    ];
    const tbl = parseTable(tableRows);
    expect(tbl).not.toBeNull();
    expect(tbl!.header).toEqual(['Feature', 'Status', 'Performance']);
    expect(tbl!.rows.length).toBe(2);
    expect(tbl!.rows[0]).toEqual(['Parser', 'Stable', '0.4ms']);
  });

  it('sanitizes markdown symbols using cleanMarkdownText', () => {
    const raw = 'Check **Bold**, *Italic*, `code`, and [Docs](https://example.com)';
    const clean = cleanMarkdownText(raw);
    expect(clean).toBe('Check Bold, Italic, code, and Docs');
  });
});
