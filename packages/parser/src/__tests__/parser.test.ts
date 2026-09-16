import { describe, it, expect } from 'vitest';
import { parseMD, cleanMarkdownText, parseTable, smartTrunc } from '../index';

describe('@gitinfographics/parser', () => {
  it('parses title and subtitle accurately', () => {
    const doc = parseMD('# My Engine\nAn ultrafast zero-dom SVG generation toolkit.\n\n## Features\n- Fast');
    expect(doc.title).toBe('My Engine');
    expect(doc.subtitle).toBe('An ultrafast zero-dom SVG generation toolkit.');
    expect(doc.sections.length).toBe(1);
    expect(doc.sections[0].title).toBe('Features');
  });

  it('cleans markdown tags cleanly', () => {
    expect(cleanMarkdownText('**Bold** and *Italic* and `code` with [link](https://example.com)')).toBe(
      'Bold and Italic and code with link'
    );
  });

  it('parses tables defensively', () => {
    const table = parseTable([
      '| Feature | Support |',
      '| --- | --- |',
      '| Node.js | Yes |',
      '| Browser | Yes |'
    ]);
    expect(table).not.toBeNull();
    expect(table?.header).toEqual(['Feature', 'Support']);
    expect(table?.rows).toHaveLength(2);
  });

  it('handles smart truncation with high-priority retention', () => {
    const md = `# Project\n\n## License\nMIT License details here\n\n## Features\n- Lightning fast\n- Zero-DOM`;
    const truncated = smartTrunc(md, 100);
    expect(truncated).toContain('Features');
  });

  it('extracts badges from markdown headers', () => {
    const md = `# Title\n\n[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com)\n\n## Overview\nText`;
    const doc = parseMD(md);
    expect(doc.badges.length).toBeGreaterThan(0);
    expect(doc.badges[0].url).toContain('shields.io');
  });
});
