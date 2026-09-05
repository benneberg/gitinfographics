import { describe, it, expect } from 'vitest';
import { classifySec } from '../classifier';

describe('classifySec', () => {
  it('correctly classifies problem and challenge sections', () => {
    const sec = {
      title: 'The Challenge & Bottlenecks',
      rawText: 'Legacy message queues suffer from significant latency spikes and thread contention.',
      lists: []
    };
    expect(classifySec(sec)).toBe('problem');
  });

  it('correctly classifies solution sections', () => {
    const sec = {
      title: 'Our Approach & Solution',
      rawText: 'We built a lock-free ring buffer architecture that delivers deterministic latency.',
      lists: []
    };
    expect(classifySec(sec)).toBe('solution');
  });

  it('correctly classifies features based on title and bullet density', () => {
    const sec = {
      title: 'Key Capabilities',
      rawText: '',
      lists: [
        'Zero-copy memory allocations',
        'Built-in WebSocket gateway',
        'Automatic failover clustering'
      ]
    };
    expect(classifySec(sec)).toBe('features');
  });

  it('correctly classifies getting started and installation sections', () => {
    const sec = {
      title: 'Quick Start & Installation',
      rawText: 'Get started in under two minutes:',
      lists: ['npm install my-engine', 'npm test']
    };
    expect(classifySec(sec)).toBe('getting-started');
  });

  it('correctly classifies tech-stack based on dependencies', () => {
    const sec = {
      title: 'Technologies & Built With',
      rawText: 'Built with TypeScript, Rust, and WebAssembly for maximum throughput.',
      lists: []
    };
    expect(classifySec(sec)).toBe('tech-stack');
  });

  it('correctly classifies metrics and benchmarks', () => {
    const sec = {
      title: 'Performance & Benchmarks',
      rawText: 'Delivers 120k requests per second with 2.4ms p99 latency.',
      lists: []
    };
    expect(classifySec(sec)).toBe('metrics');
  });

  it('applies relative line position heuristics (early problem, late license)', () => {
    const earlySec = {
      title: 'Motivation',
      rawText: 'Existing solutions are difficult to configure.',
      lists: [],
      lineIndex: 5,
      totalLinesHint: 100
    };
    expect(classifySec(earlySec)).toBe('problem');

    const lateSec = {
      title: 'License',
      rawText: 'Released under the MIT License.',
      lists: [],
      lineIndex: 95,
      totalLinesHint: 100
    };
    expect(classifySec(lateSec)).toBe('license');
  });
});
