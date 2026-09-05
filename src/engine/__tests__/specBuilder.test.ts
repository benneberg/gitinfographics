import { describe, it, expect } from 'vitest';
import { buildRuleSpec } from '../specBuilder';
import { parseMD } from '../parser';
import { GitHubMeta } from '../types';

describe('buildRuleSpec', () => {
  it('builds a complete InfographicSpec from parsed markdown', () => {
    const md = `# AstroCache
Next-generation distributed memory cache.

## Problem
In-memory caches suffer from GC pauses and uncoordinated eviction stampedes under high load.

## Solution
AstroCache uses off-heap ring buffers and proactive coalesced cache fills.

## Features
- **Deterministic Latency**: sub-millisecond p99 guarantees
- **Zero GC Overhead**: 100% off-heap memory management
- **Cluster Gossip**: Raft-free membership consensus

## Tech Stack
Built with Go, gRPC, and Protocol Buffers.
`;
    const doc = parseMD(md);
    const spec = buildRuleSpec(doc);

    expect(spec.title).toBe('AstroCache');
    expect(spec.subtitle).toContain('distributed memory cache');
    expect(spec.sections.some((s) => s.type === 'problem-solution')).toBe(true);
    expect(spec.sections.some((s) => s.type === 'features')).toBe(true);
  });

  it('incorporates live GitHub metadata when supplied', () => {
    const md = `# MinimalRepo
A simple library.
`;
    const doc = parseMD(md);
    const ghMeta: GitHubMeta = {
      owner: 'acme',
      repo: 'minimal-repo',
      description: 'Production distributed library',
      stars: 4820,
      forks: 310,
      openIssues: 12,
      watchers: 85,
      language: 'TypeScript'
    };

    const spec = buildRuleSpec(doc, undefined, ghMeta);
    expect(spec.sections.some((s) => s.type === 'stats')).toBe(true);
    const statsSec = spec.sections.find((s) => s.type === 'stats');
    expect(statsSec).toBeDefined();
    if (statsSec && 'items' in statsSec) {
      expect(statsSec.items.some((i) => i.label === 'Stars')).toBe(true);
    }
  });

  it('tolerates reversed argument order (variants, ghMeta vs ghMeta, variants)', () => {
    const md = `# ArgumentTest\nTesting argument flexibility.`;
    const doc = parseMD(md);
    const ghMeta: GitHubMeta = {
      owner: 'org',
      repo: 'repo',
      description: 'Desc',
      stars: 1200,
      forks: 50,
      openIssues: 2,
      watchers: 30
    };

    // Passed as second argument
    const specA = buildRuleSpec(doc, ghMeta as any);
    // Passed as third argument
    const specB = buildRuleSpec(doc, {}, ghMeta);

    expect(specA.sections.some((s) => s.type === 'stats')).toBe(true);
    expect(specB.sections.some((s) => s.type === 'stats')).toBe(true);
  });

  it('generates graceful fallback content blocks when sections are sparse', () => {
    const md = `# Sparse Tool
A brief tool overview that explains how this utility performs stream manipulation.
`;
    const doc = parseMD(md);
    const spec = buildRuleSpec(doc);
    expect(spec.sections.length).toBeGreaterThanOrEqual(1);
    expect(spec.sections[0].type).toBe('content-block');
  });
});
