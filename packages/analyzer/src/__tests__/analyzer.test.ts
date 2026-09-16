import { describe, it, expect } from 'vitest';
import { parseMD } from '@gitinfographics/parser';
import {
  classifySec,
  extractMetrics,
  splitFeat,
  extractTechAdvanced,
  buildRuleSpec,
  detectSmartLayout
} from '../index';

describe('@gitinfographics/analyzer', () => {
  it('classifies semantic sections with high accuracy', () => {
    expect(classifySec({ title: 'The Problem & Motivation' })).toBe('problem');
    expect(classifySec({ title: 'Our Modern Solution' })).toBe('solution');
    expect(classifySec({ title: 'Key Features & Capabilities' })).toBe('features');
    expect(classifySec({ title: 'Performance Benchmarks & Metrics' })).toBe('metrics');
    expect(classifySec({ title: 'Quick Start & Installation' })).toBe('getting-started');
  });

  it('extracts metrics with units correctly', () => {
    const text = 'Achieved 99.9% uptime with under 15ms latency, 50k+ downloads, and 4x faster throughput.';
    const metrics = extractMetrics(text);
    expect(metrics.length).toBeGreaterThanOrEqual(3);
    const uptime = metrics.find((m) => m.label === 'Uptime');
    expect(uptime?.value).toBe('99.9');
  });

  it('splits features into clean title and description', () => {
    const feat = splitFeat('**Zero-DOM**: Pure vector generation without browser dependencies.');
    expect(feat.title).toBe('Zero-DOM');
    expect(feat.description).toBe('Pure vector generation without browser dependencies.');
  });

  it('extracts technologies from code blocks and keywords', () => {
    const doc = parseMD('# Project\n\nBuilt with TypeScript and React in Vite.');
    const techs = extractTechAdvanced(doc);
    expect(techs).toContain('TypeScript');
    expect(techs).toContain('React');
    expect(techs).toContain('Vite');
  });

  it('builds full rule specification with grounding metrics', () => {
    const md = `
# Apollo
Next-generation build tool.

## Problem
Slow compilation times waste developer hours.

## Solution
Rust-powered incremental caching compiler.

## Features
- Blazing speed: Sub-millisecond rebuilds
- Deterministic output: Guaranteed reproducible builds
- Zero config: Works out of the box
`;
    const doc = parseMD(md);
    const spec = buildRuleSpec(doc);
    expect(spec.title).toBe('Apollo');
    expect(spec.sections.some((s) => s.type === 'problem-solution')).toBe(true);
    expect(spec.sections.some((s) => s.type === 'features')).toBe(true);
    expect(spec.grounding).toBeDefined();
  });
});
