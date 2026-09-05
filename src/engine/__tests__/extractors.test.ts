import { describe, it, expect } from 'vitest';
import {
  extractMetrics,
  splitFeat,
  extractTechAdvanced,
  extractMetricsFromBadges,
  trunc
} from '../extractors';
import { ParsedDoc } from '../types';

describe('extractMetrics', () => {
  it('extracts uptime, coverage, and pass rate', () => {
    const text = 'Maintains 99.9% uptime with 94% test coverage and 100% pass rate in CI.';
    const metrics = extractMetrics(text);
    expect(metrics.some((m) => m.label === 'Uptime' && m.value.includes('99.9'))).toBe(true);
    expect(metrics.some((m) => m.label === 'Coverage' && m.value.includes('94'))).toBe(true);
    expect(metrics.some((m) => m.label === 'Accuracy' && m.value.includes('100'))).toBe(true);
  });

  it('extracts large scale numbers with k/M/B suffixes', () => {
    const text = 'Trusted by 50k developers and handling 10M requests daily.';
    const metrics = extractMetrics(text);
    expect(metrics.some((m) => m.value.toLowerCase() === '50k')).toBe(true);
    expect(metrics.some((m) => m.value.toLowerCase() === '10m')).toBe(true);
  });

  it('extracts latency and time targets', () => {
    const text = 'Processes events in 4.2ms with cluster sync in under 2 minutes.';
    const metrics = extractMetrics(text);
    expect(metrics.some((m) => m.label === 'Latency' && m.value === '4.2')).toBe(true);
  });

  it('deduplicates metrics by normalized label', () => {
    const text = '45k users in Europe and 30k users in Asia.';
    const metrics = extractMetrics(text);
    const userMetrics = metrics.filter((m) => m.label.toLowerCase().includes('user'));
    expect(userMetrics.length).toBe(1);
  });
});

describe('splitFeat', () => {
  it('splits bold titles with dashes or colons', () => {
    const res = splitFeat('**Zero Configuration** — Works right out of the box with sensible defaults.');
    expect(res.title).toBe('Zero Configuration');
    expect(res.description).toContain('Works right out of the box');
  });

  it('strips markdown links from title and retains clean description', () => {
    const res = splitFeat('[Core Engine](./core): High performance AST transformer.');
    expect(res.title).toBe('Core Engine');
    expect(res.description).toBe('High performance AST transformer.');
  });

  it('strips task checkboxes and leading emojis', () => {
    const res = splitFeat('- [x] 🚀 **Fast Cold Starts**: boots in under 12ms');
    expect(res.title).toBe('Fast Cold Starts');
    expect(res.description).toContain('boots in under 12ms');
  });
});

describe('extractTechAdvanced', () => {
  it('extracts technologies from keywords, dependencies, and file extensions', () => {
    const doc: ParsedDoc = {
      title: 'Vector Service',
      subtitle: 'Fast vector search',
      sections: [
        {
          level: 2,
          title: 'Architecture',
          content: [],
          lists: [],
          nestedLists: [],
          rawText: 'Core implemented in `search.rs` with `client.ts` React interface.',
          codeBlocks: [
            {
              lang: 'json',
              lines: [
                '{\n  "dependencies": {\n    "express": "^4.18.0",\n    "tailwindcss": "^3.0.0"\n  }\n}'
              ]
            }
          ],
          images: [],
          tables: []
        }
      ],
      badges: [],
      images: []
    };

    const tech = extractTechAdvanced(doc);
    expect(tech).toContain('Rust');
    expect(tech).toContain('TypeScript');
    expect(tech.some((t) => /express/i.test(t))).toBe(true);
  });
});

describe('extractMetricsFromBadges', () => {
  it('mines metrics from shields.io badge alt and urls', () => {
    const badges = [
      { alt: 'Coverage 95%', url: 'https://img.shields.io/badge/coverage-95%25-green' },
      { alt: 'Version 2.0.1', url: 'https://img.shields.io/badge/version-2.0.1-blue' }
    ];
    const metrics = extractMetricsFromBadges(badges);
    expect(metrics.length).toBeGreaterThanOrEqual(1);
    expect(metrics.some((m) => m.label.toLowerCase().includes('coverage'))).toBe(true);
  });
});

describe('trunc', () => {
  it('truncates strings longer than max length with ellipsis', () => {
    expect(trunc('A short text', 20)).toBe('A short text');
    expect(trunc('A very long text that exceeds maximum allowable characters', 15)).toBe(
      'A very long te…'
    );
  });
});
